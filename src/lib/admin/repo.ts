import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Product } from "@/components/sites/strale/catalog";
import type { StoreSettings } from "@/components/sites/strale/site-config";

/**
 * Repo-backed content (products.json, store-settings.json, photos) — used only when no database is connected
 * (with Supabase, see catalog-store.ts).
 * - github: files live in the GitHub repo; each save is one commit, which makes Vercel rebuild the site.
 *   Needs GITHUB_TOKEN (fine-grained: Contents read/write, Commit statuses read).
 * - local: no token outside production → writes straight to this checkout (npm run dev on your computer).
 */

export const PRODUCTS_PATH = "src/components/sites/strale/products.json";
export const SETTINGS_PATH = "src/components/sites/strale/store-settings.json";
const WRITABLE = new Set([PRODUCTS_PATH, SETTINGS_PATH]);
const UPLOAD_PATH = /^(public\/sites\/strale\/products|docs\/products\/fotograflar)\/[a-z0-9][a-z0-9-]*\.jpg$/;
const DELETABLE_PATH = /^public\/sites\/strale\/products\/[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp)$/;

export type Upload = { path: string; ref: string };
/** A content file to write; `baseVersion` (from read) guards against overwriting someone else's save. */
export type FileWrite = { path: string; content: string; baseVersion?: string };
export type CommitInput = {
  files: FileWrite[];
  force?: boolean;
  uploads?: Upload[];
  deletes?: string[];
  message: string;
};
export type CommitResult = { versions: Record<string, string>; commit?: string; url?: string };
export type HistoryEntry = { sha: string; message: string; date: string; url?: string };
export type DeployStatus = { state: "pending" | "success" | "failure" | "unknown"; url?: string };

export class ConflictError extends Error {}
export class ConfigError extends Error {}

export interface ContentRepo {
  mode: "github" | "local";
  label: string;
  /** Base URL for files saved but not deployed yet (null when the site serves them directly). */
  rawBase: string | null;
  readFile(path: string): Promise<{ content: string; version: string }>;
  stageFile(base64: string): Promise<string>;
  commit(input: CommitInput): Promise<CommitResult>;
  history(): Promise<HistoryEntry[]>;
  status(commit: string): Promise<DeployStatus>;
}

export const serializeJson = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

export async function readProducts(repo: ContentRepo) {
  const { content, version } = await repo.readFile(PRODUCTS_PATH);
  return { products: JSON.parse(content) as Product[], version };
}

export async function readSettings(repo: ContentRepo) {
  const { content, version } = await repo.readFile(SETTINGS_PATH);
  return { settings: JSON.parse(content) as StoreSettings, version };
}

function assertPaths({ files, uploads = [], deletes = [] }: CommitInput) {
  for (const file of files) if (!WRITABLE.has(file.path)) throw new Error(`Yazılamaz dosya: ${file.path}`);
  for (const upload of uploads) if (!UPLOAD_PATH.test(upload.path)) throw new Error(`Geçersiz dosya yolu: ${upload.path}`);
  for (const path of deletes) if (!DELETABLE_PATH.test(path)) throw new Error(`Silinemez dosya: ${path}`);
}

/* ------------------------------------------------------------------ GitHub */

/** Branch names like "claude/x" keep their slashes in API paths (GitHub rejects an encoded %2F there). */
const branchPath = (branch: string) => branch.split("/").map(encodeURIComponent).join("/");

class GitHubRepo implements ContentRepo {
  mode = "github" as const;
  label: string;
  rawBase: string;

  constructor(
    private token: string,
    private repo: string,
    private branch: string,
  ) {
    this.label = `${repo} · ${branch}`;
    this.rawBase = `https://raw.githubusercontent.com/${repo}/${branchPath(branch)}/public`;
  }

  private async api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${process.env.GITHUB_API_URL || "https://api.github.com"}/repos/${this.repo}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!response.ok) {
      const body = await response.text();
      const error = new Error(`GitHub ${response.status}: ${body.slice(0, 300)}`) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return (await response.json()) as T;
  }

  async readFile(path: string, ref = this.branch) {
    const file = await this.api<{ content: string; sha: string }>(`/contents/${path}?ref=${encodeURIComponent(ref)}`);
    return { content: Buffer.from(file.content, "base64").toString("utf8"), version: file.sha };
  }

  async stageFile(base64: string) {
    const blob = await this.api<{ sha: string }>("/git/blobs", {
      method: "POST",
      body: JSON.stringify({ content: base64, encoding: "base64" }),
    });
    return blob.sha;
  }

  async commit(input: CommitInput, attempt = 0): Promise<CommitResult> {
    assertPaths(input);
    const { uploads = [], deletes = [] } = input;
    const ref = await this.api<{ object: { sha: string } }>(`/git/ref/heads/${branchPath(this.branch)}`);
    const head = ref.object.sha;
    if (!input.force) {
      for (const file of input.files) {
        if (file.baseVersion === undefined) continue;
        const current = await this.api<{ sha: string }>(`/contents/${file.path}?ref=${head}`);
        if (current.sha !== file.baseVersion) throw new ConflictError("Siz düzenlerken başka bir yerden değiştirilmiş.");
      }
    }
    const headCommit = await this.api<{ tree: { sha: string } }>(`/git/commits/${head}`);
    const versions: Record<string, string> = {};
    for (const file of input.files) {
      versions[file.path] = await this.stageFile(Buffer.from(file.content).toString("base64"));
    }

    const tree = [
      ...input.files.map((f) => ({ path: f.path, mode: "100644", type: "blob", sha: versions[f.path] })),
      ...uploads.map((u) => ({ path: u.path, mode: "100644", type: "blob", sha: u.ref })),
      ...deletes.map((path) => ({ path, mode: "100644", type: "blob", sha: null })),
    ];
    let newTree: { sha: string };
    try {
      newTree = await this.api<{ sha: string }>("/git/trees", {
        method: "POST",
        body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
      });
    } catch (error) {
      // Deleting a path that is already gone fails the whole tree; retry without deletes.
      if (deletes.length && (error as { status?: number }).status === 422) {
        return this.commit({ ...input, deletes: [] }, attempt);
      }
      throw error;
    }
    const commit = await this.api<{ sha: string; html_url: string }>("/git/commits", {
      method: "POST",
      body: JSON.stringify({ message: input.message, tree: newTree.sha, parents: [head] }),
    });
    try {
      await this.api(`/git/refs/heads/${branchPath(this.branch)}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
    } catch (error) {
      // Someone pushed between our read and write: rebuild on the new head (the version check runs again).
      if (attempt < 2 && (error as { status?: number }).status === 422) return this.commit(input, attempt + 1);
      throw error;
    }
    return { versions, commit: commit.sha, url: commit.html_url };
  }

  async history() {
    const commits = await this.api<{ sha: string; html_url: string; commit: { message: string; author: { date: string } } }[]>(
      `/commits?sha=${encodeURIComponent(this.branch)}&path=src/components/sites/strale&per_page=20`,
    );
    return commits.map((c) => ({
      sha: c.sha,
      message: c.commit.message.split("\n")[0],
      date: c.commit.author.date,
      url: c.html_url,
    }));
  }

  async status(commit: string): Promise<DeployStatus> {
    const combined = await this.api<{ statuses: { context: string; state: string; target_url: string }[] }>(
      `/commits/${commit}/status`,
    );
    const vercel = combined.statuses.find((s) => /vercel/i.test(s.context)) ?? combined.statuses[0];
    if (!vercel) return { state: "pending" };
    const state = vercel.state === "success" ? "success" : vercel.state === "pending" ? "pending" : "failure";
    return { state, url: vercel.target_url };
  }
}

/* ------------------------------------------------------------------- local */

class LocalRepo implements ContentRepo {
  mode = "local" as const;
  label = "Yerel dosyalar (bu bilgisayar)";
  rawBase = null;
  private root = process.cwd();
  private staging = resolve(this.root, "temp/admin-uploads");

  private hash(text: string) {
    return createHash("sha1").update(text).digest("hex");
  }

  async readFile(path: string) {
    const content = await readFile(resolve(this.root, path), "utf8");
    return { content, version: this.hash(content) };
  }

  async stageFile(base64: string) {
    await mkdir(this.staging, { recursive: true });
    const ref = randomBytes(12).toString("hex");
    await writeFile(resolve(this.staging, `${ref}.bin`), Buffer.from(base64, "base64"));
    return ref;
  }

  async commit(input: CommitInput) {
    assertPaths(input);
    if (!input.force) {
      for (const file of input.files) {
        if (file.baseVersion !== undefined && (await this.readFile(file.path)).version !== file.baseVersion) {
          throw new ConflictError("Siz düzenlerken başka bir yerden değiştirilmiş.");
        }
      }
    }
    for (const upload of input.uploads ?? []) {
      if (!/^[a-f0-9]{24}$/.test(upload.ref)) throw new Error("Geçersiz yükleme");
      const target = resolve(this.root, upload.path);
      await mkdir(dirname(target), { recursive: true });
      await copyFile(resolve(this.staging, `${upload.ref}.bin`), target);
    }
    for (const path of input.deletes ?? []) await rm(resolve(this.root, path), { force: true });
    const versions: Record<string, string> = {};
    for (const file of input.files) {
      await writeFile(resolve(this.root, file.path), file.content);
      versions[file.path] = this.hash(file.content);
    }
    return { versions };
  }

  async history() {
    return [];
  }

  async status(): Promise<DeployStatus> {
    return { state: "success" };
  }
}

export function getRepo(): ContentRepo {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    const repo =
      process.env.GITHUB_REPO ||
      (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
        ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
        : "OsmanAks22/strale-studio");
    const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";
    return new GitHubRepo(token, repo, branch);
  }
  if (process.env.NODE_ENV !== "production" || process.env.ADMIN_LOCAL_MODE === "1") return new LocalRepo();
  throw new ConfigError(
    "Veritabanı bağlı değil. Vercel → Storage → Supabase ekleyin (bkz. docs/KURULUM.md); ya da GITHUB_TOKEN tanımlayın.",
  );
}

/** Repo when configured, else null (customer-facing code degrades instead of failing). */
export function tryGetRepo() {
  try {
    return getRepo();
  } catch {
    return null;
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ConflictError) return Response.json({ error: error.message, conflict: true }, { status: 409 });
  const message = error instanceof Error ? error.message : String(error);
  console.error(error);
  return Response.json({ error: message }, { status: error instanceof ConfigError ? 503 : 500 });
}
