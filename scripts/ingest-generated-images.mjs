#!/usr/bin/env node
// Takes images exported from Higgsfield (or any generator / photo shoot) out of the
// inbox folder, crops them to each slot's exact size and writes web-ready JPGs.
//
//   node scripts/ingest-generated-images.mjs            # process every slot that has a file in the inbox
//   node scripts/ingest-generated-images.mjs --status   # show which slots are done / waiting
//   node scripts/ingest-generated-images.mjs content-sweats menu-latest   # only these slots
//
// Inbox file name = slot id (any of .png .jpg .jpeg .webp), e.g. temp/higgsfield/content-sweats.png
// Slots, sizes and crop gravity live in docs/image-pipeline/shot-list.json. Requires ffmpeg.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(ROOT, "docs/image-pipeline/shot-list.json"), "utf8"));
const EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const GRAVITY = { left: [0, 0.5], right: [1, 0.5], top: [0.5, 0], bottom: [0.5, 1], center: [0.5, 0.5] };

const args = process.argv.slice(2);
const statusOnly = args.includes("--status");
const only = args.filter((arg) => !arg.startsWith("--"));

function findInput(id) {
  for (const ext of EXTENSIONS) {
    const file = join(ROOT, manifest.inbox, id + ext);
    if (existsSync(file)) return file;
  }
  return null;
}

function probe(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]);
  const [width, height] = out.toString().trim().split(",").map(Number);
  return { width, height };
}

function ingest(slot, input) {
  const output = join(ROOT, manifest.outputRoot, slot.output);
  const { width: w, height: h } = slot;
  const [gx, gy] = GRAVITY[slot.gravity] ?? GRAVITY.center;
  const source = probe(input);
  const scale = Math.max(w / source.width, h / source.height);
  if (scale > 1) {
    console.warn(`  ! ${slot.id}: source ${source.width}x${source.height} is smaller than ${w}x${h}; upscale in Higgsfield first`);
  }
  mkdirSync(dirname(output), { recursive: true });
  const filter = `scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${w}:${h}:(iw-${w})*${gx}:(ih-${h})*${gy}`;
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", input, "-vf", filter, "-q:v", "3", "-frames:v", "1", output]);
  console.log(`  ✓ ${slot.id} → ${join(manifest.outputRoot, slot.output)} (${w}x${h})`);
}

let done = 0;
let pending = 0;
for (const slot of manifest.slots) {
  if (only.length && !only.includes(slot.id)) continue;
  const input = findInput(slot.id);
  const published = existsSync(join(ROOT, manifest.outputRoot, slot.output));
  if (statusOnly) {
    const state = published ? "done   " : input ? "inbox  " : "waiting";
    console.log(`${state}  ${slot.tool.padEnd(10)}  ${slot.id}`);
    published ? done++ : pending++;
    continue;
  }
  if (!input) {
    pending++;
    continue;
  }
  ingest(slot, input);
  done++;
}
console.log(`\n${done} ${statusOnly ? "done" : "processed"}, ${pending} waiting (inbox: ${manifest.inbox}/)`);
