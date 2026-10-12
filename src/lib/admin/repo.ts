import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Product } from "@/components/sites/strale/catalog";

/**
 * Where the admin panel reads and saves the catalogue.
 * - github: products.json and photos live in the GitHub repo; each save is one commit, which makes Vercel
 *   rebuild the site. Needs GITHUB_TOKEN (fine-grained: Contents read/write, Commit statuses read).
 * - local: no token outside production → writes straight to this checkout (npm run dev on your computer).
 */

export const PRODUCTS_PATH = "src/components/sites/strale/products.json";
const UPLOAD_PATH = /^(public\/sites\/strale\/products|docs\/products\/fotograflar)\/[a-z0-9][a-z0-9-]*\.jpg$/;
const DELETABLE_PATH = /^public\/sites\/strale\/products\/[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp)$/;

export type Upload = { path: string; ref: string };
export type CommitInput = {
  products: Product[];
  baseVersion: string;
  force?: boolean;
  uploads: Upload[];
  deletes: string[];
  message: string;
};
export type HistoryEntry = { sha: string; message: string; date: string; url?: string };
export type DeployStatus = { state: "pending" | "success" | "failure" | "unknown"; url?: string };

export class ConflictError extends Error {}
export class ConfigError extends Error {}

export interface CatalogRepo {
  mode: "github" | "local";
  label: string;
  /** Base URL for files saved but not deployed yet (null when the site serves them directly). */
  rawBase: string | null;
  read(): Promise<{ products: Product[]; version: string }>;
  stageFile(base64: string): Promise<string>;
  commit(input: CommitInput): Promise<{ version: string; commit?: string; url?: string }>;
  history(): Promise<HistoryEntry[]>;
  status(commit: string): Promise<DeployStatus>;
}

export const serializeProducts = (products: Product[]) => `${JSON.stringify(products, null, 2)}\n`;

export function assertPaths({ uploads, deletes }: Pick<CommitInput, "uploads" | "deletes">) {
  for (const upload of uploads) if (!UPLOAD_PATH.test(upload.path)) throw new Error(`Geçersiz dosya yolu: ${upload.path}`);
  for (const path of deletes) if (!DELETABLE_PATH.test(path)) throw new Error(`Silinemez dosya: ${path}`);
}

/* ------------------------------------------------------------------ GitHub */

/** Branch names like "claude/x" keep their slashes in API paths (GitHub rejects an encoded %2F there). */
const branchPath = (branch: string) => branch.split("/").map(encodeURIComponent).join("/");

class GitHubRepo implements CatalogRepo {
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

  async read() {
    const file = await this.api<{ content: string; sha: string }>(
      `/contents/${PRODUCTS_PATH}?ref=${encodeURIComponent(this.branch)}`,
    );
    const products = JSON.parse(Buffer.from(file.content, "base64").toString("utf8")) as Product[];
    return { products, version: file.sha };
  }

  async stageFile(base64: string) {
    const blob = await this.api<{ sha: string }>("/git/blobs", {
      method: "POST",
      body: JSON.stringify({ content: base64, encoding: "base64" }),
    });
    return blob.sha;
  }

  async commit(input: CommitInput, attempt = 0): Promise<{ version: string; commit: string; url: string }> {
    assertPaths(input);
    const ref = await this.api<{ object: { sha: string } }>(`/git/ref/heads/${branchPath(this.branch)}`);
    const head = ref.object.sha;
    const current = await this.api<{ sha: string }>(`/contents/${PRODUCTS_PATH}?ref=${head}`);
    if (!input.force && current.sha !== input.baseVersion) {
      throw new ConflictError("Ürünler siz düzenlerken başka bir yerden değiştirilmiş.");
    }
    const headCommit = await this.api<{ tree: { sha: string } }>(`/git/commits/${head}`);
    const json = await this.stageFile(Buffer.from(serializeProducts(input.products)).toString("base64"));

    const tree = [
      { path: PRODUCTS_PATH, mode: "100644", type: "blob", sha: json },
      ...input.uploads.map((u) => ({ path: u.path, mode: "100644", type: "blob", sha: u.ref })),
      ...input.deletes.map((path) => ({ path, mode: "100644", type: "blob", sha: null })),
    ];
    let newTree: { sha: string };
    try {
      newTree = await this.api<{ sha: string }>("/git/trees", {
        method: "POST",
        body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
      });
    } catch (error) {
      // Deleting a path that is already gone fails the whole tree; retry without deletes.
      if (input.deletes.length && (error as { status?: number }).status === 422) {
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
      // Someone pushed between our read and write: rebuild on the new head once.
      if (attempt === 0 && (error as { status?: number }).status === 422) return this.commit(input, 1);
      throw error;
    }
    return { version: json, commit: commit.sha, url: commit.html_url };
  }

  async history() {
    const commits = await this.api<{ sha: string; html_url: string; commit: { message: string; author: { date: string } } }[]>(
      `/commits?sha=${encodeURIComponent(this.branch)}&path=${PRODUCTS_PATH}&per_page=20`,
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

class LocalRepo implements CatalogRepo {
  mode = "local" as const;
  label = "Yerel dosyalar (bu bilgisayar)";
  rawBase = null;
  private root = process.cwd();
  private staging = resolve(this.root, "temp/admin-uploads");

  private hash(text: string) {
    return createHash("sha1").update(text).digest("hex");
  }

  async read() {
    const text = await readFile(resolve(this.root, PRODUCTS_PATH), "utf8");
    return { products: JSON.parse(text) as Product[], version: this.hash(text) };
  }

  async stageFile(base64: string) {
    await mkdir(this.staging, { recursive: true });
    const ref = randomBytes(12).toString("hex");
    await writeFile(resolve(this.staging, `${ref}.bin`), Buffer.from(base64, "base64"));
    return ref;
  }

  async commit(input: CommitInput) {
    assertPaths(input);
    const { version } = await this.read();
    if (!input.force && version !== input.baseVersion) {
      throw new ConflictError("Ürünler siz düzenlerken başka bir yerden değiştirilmiş.");
    }
    for (const upload of input.uploads) {
      if (!/^[a-f0-9]{24}$/.test(upload.ref)) throw new Error("Geçersiz yükleme");
      const target = resolve(this.root, upload.path);
      await mkdir(dirname(target), { recursive: true });
      await copyFile(resolve(this.staging, `${upload.ref}.bin`), target);
    }
    for (const path of input.deletes) await rm(resolve(this.root, path), { force: true });
    const text = serializeProducts(input.products);
    await writeFile(resolve(this.root, PRODUCTS_PATH), text);
    return { version: this.hash(text) };
  }

  async history() {
    return [];
  }

  async status(): Promise<DeployStatus> {
    return { state: "success" };
  }
}

export function getRepo(): CatalogRepo {
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
    "GITHUB_TOKEN tanımlı değil. Vercel → Project → Settings → Environment Variables'a ekleyin (bkz. docs/yonetim-paneli.md).",
  );
}

export function errorResponse(error: unknown) {
  if (error instanceof ConflictError) return Response.json({ error: error.message, conflict: true }, { status: 409 });
  const message = error instanceof Error ? error.message : String(error);
  return Response.json({ error: message }, { status: error instanceof ConfigError ? 503 : 500 });
}
