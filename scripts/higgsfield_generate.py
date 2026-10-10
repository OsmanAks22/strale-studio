#!/usr/bin/env python3
"""Generates shot-list images through the Higgsfield API (Marketing Studio Image).

Each slot in docs/image-pipeline/shot-list.json is sent with its real inputs:
product photos (docs/image-pipeline/inputs/products/) first, then the model
photo (docs/image-pipeline/inputs/models/), plus a prompt built from the slot
brief. Results land in temp/higgsfield/<slot-id>.png, where
scripts/ingest-generated-images.mjs picks them up.

    pip install higgsfield-client
    export HF_KEY="KEY_ID:KEY_SECRET"      # environment secret, never commit it

    python3 scripts/higgsfield_generate.py --dry-run content-sweats   # plan + cost estimate, no API call
    python3 scripts/higgsfield_generate.py content-sweats             # one slot
    python3 scripts/higgsfield_generate.py --tool ai-stylist --variants 2 --budget 2
    python3 scripts/higgsfield_generate.py --presets                  # list Marketing Studio presets

Every paid call is appended to temp/higgsfield/log.jsonl. --budget stops the run
before the estimated spend would pass the cap (default $1).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "docs/image-pipeline/shot-list.json"
INPUTS = ROOT / "docs/image-pipeline/inputs"
OUTBOX = ROOT / "temp/higgsfield"
APPLICATION = "marketing-studio/image"
EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")
RATIOS = {"1:1": 1, "3:2": 3 / 2, "2:3": 2 / 3, "4:3": 4 / 3, "3:4": 3 / 4, "16:9": 16 / 9, "9:16": 9 / 16, "21:9": 21 / 9}
# Published per-image rates (low quality, Oct 2026). Higher quality costs more and
# is not published, so the estimate for it is deliberately conservative.
PRICE_LOW = {"1k": 0.0138, "2k": 0.0189, "4k": 0.6136}
PRICE_FALLBACK = {"1k": 0.03, "2k": 0.05, "4k": 0.75}

STYLE = (
    "Photorealistic fashion e-commerce photography, natural skin texture, true-to-life fabric texture and colour, "
    "garments exactly as in the reference images, no added logos, text or labels, no extra accessories."
)


def find_input(folder: str, name: str) -> Path:
    for ext in EXTENSIONS:
        path = INPUTS / folder / f"{name}{ext}"
        if path.exists():
            return path
    raise FileNotFoundError(f"missing {INPUTS.relative_to(ROOT)}/{folder}/{name}.(jpg|png|webp)")


def closest_ratio(width: int, height: int) -> str:
    target = width / height
    return min(RATIOS, key=lambda key: abs(RATIOS[key] - target))


def build_prompt(slot: dict, has_products: bool, has_model: bool) -> str:
    gen = slot.get("generate", {})
    if gen.get("prompt"):
        return f"{gen['prompt']} {STYLE}"
    parts = [slot["brief"]]
    stylist = slot.get("stylist") or {}
    if not has_products and stylist.get("outfit"):
        parts.append(f"Outfit: {stylist['outfit']}.")
    if stylist.get("pose"):
        parts.append(f"Pose: {stylist['pose']}.")
    if stylist.get("background"):
        parts.append(f"Background: {stylist['background']}.")
    if has_model and has_products:
        parts.append("Dress the person from the last reference image in the garments from the other reference images; keep their face, body and hair unchanged.")
    elif has_model:
        parts.append("Use the person from the reference image; keep their face, body and hair unchanged.")
    return " ".join(parts + [STYLE])


def plan(slot: dict, default_model: str | None) -> dict:
    gen = slot.get("generate") or {}
    products = [find_input("products", name) for name in gen.get("products", [])]
    model_name = gen.get("model", default_model if slot["tool"] == "ai-stylist" else None)
    model = find_input("models", model_name) if model_name else None
    if not products and not model:
        raise ValueError("no inputs: add generate.products and/or generate.model in shot-list.json")
    return {
        "slot": slot["id"],
        "images": products + ([model] if model else []),
        "prompt": build_prompt(slot, bool(products), bool(model)),
        "aspect_ratio": gen.get("aspect_ratio") or closest_ratio(slot["width"], slot["height"]),
    }


def upload(client, path: Path, cache: dict) -> str:
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest not in cache:
        cache[digest] = client.upload_file(str(path))
    return cache[digest]


def download(url: str, dest: Path) -> None:
    with urllib.request.urlopen(url, timeout=120) as response:
        dest.write_bytes(response.read())


def list_presets() -> None:
    key = os.environ["HF_KEY"]
    request = urllib.request.Request(
        f"https://api.higgsfield.ai/{APPLICATION}/presets?size=50", headers={"Authorization": f"Key {key}"}
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        for item in json.load(response).get("items", []):
            print(f"{item['id']}  {item.get('type', ''):6}  {item.get('name', '')}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slots", nargs="*", help="slot ids (default: every slot with inputs)")
    parser.add_argument("--tool", choices=["ai-stylist", "packshot"], help="only slots of this tool")
    parser.add_argument("--variants", type=int, default=1, help="images per slot (extra ones saved as <id>-v2.png …)")
    parser.add_argument("--resolution", choices=["1k", "2k", "4k"], default="2k")
    parser.add_argument("--quality", choices=["low", "medium", "high"], default="high")
    parser.add_argument("--budget", type=float, default=1.0, help="stop before estimated spend passes this (USD)")
    parser.add_argument("--dry-run", action="store_true", help="print the plan and cost estimate, call nothing")
    parser.add_argument("--force", action="store_true", help="regenerate slots that already have an image")
    parser.add_argument("--presets", action="store_true", help="list Marketing Studio presets and exit")
    args = parser.parse_args()

    if not args.dry_run and not os.environ.get("HF_KEY"):
        print("HF_KEY is not set (format KEY_ID:KEY_SECRET). Add it as an environment secret.", file=sys.stderr)
        return 1
    if args.presets:
        list_presets()
        return 0

    manifest = json.loads(MANIFEST.read_text())
    slots = [s for s in manifest["slots"] if (not args.slots or s["id"] in args.slots) and (not args.tool or s["tool"] == args.tool)]
    price_table = PRICE_LOW if args.quality == "low" else PRICE_FALLBACK
    price = price_table[args.resolution]

    jobs = []
    for slot in slots:
        if not args.force and not args.dry_run and (OUTBOX / f"{slot['id']}.png").exists():
            print(f"skip {slot['id']}: already generated (use --force)")
            continue
        try:
            jobs.append(plan(slot, manifest.get("defaultModel")))
        except (FileNotFoundError, ValueError) as error:
            if args.slots:
                print(f"skip {slot['id']}: {error}")

    total = len(jobs) * args.variants * price
    print(f"{len(jobs)} slot(s) × {args.variants} variant(s) at {args.resolution}/{args.quality} ≈ ${total:.2f} (est. ${price}/image, budget ${args.budget:.2f})\n")
    if args.dry_run:
        for job in jobs:
            print(f"■ {job['slot']}  [{job['aspect_ratio']}]")
            for image in job["images"]:
                print(f"    input: {image.relative_to(ROOT)}")
            print(f"    prompt: {job['prompt']}\n")
        return 0

    import higgsfield_client  # imported late so --dry-run works without the SDK

    OUTBOX.mkdir(parents=True, exist_ok=True)
    cache_file = OUTBOX / "uploads.json"
    cache = json.loads(cache_file.read_text()) if cache_file.exists() else {}
    spent = 0.0
    for job in jobs:
        urls = [upload(higgsfield_client, image, cache) for image in job["images"]]
        cache_file.write_text(json.dumps(cache, indent=2))
        for variant in range(1, args.variants + 1):
            if spent + price > args.budget:
                print(f"budget reached (${spent:.2f} estimated); stopping")
                return 0
            arguments = {
                "prompt": job["prompt"],
                "image_urls": urls,
                "quality": args.quality,
                "resolution": args.resolution,
                "aspect_ratio": job["aspect_ratio"],
                "enhance_prompt": False,
            }
            started = time.time()
            result = higgsfield_client.subscribe(APPLICATION, arguments=arguments)
            spent += price
            images = (result or {}).get("images") or []
            name = job["slot"] if variant == 1 else f"{job['slot']}-v{variant}"
            entry = {"slot": job["slot"], "variant": variant, "arguments": arguments, "seconds": round(time.time() - started, 1)}
            if images:
                download(images[0]["url"], OUTBOX / f"{name}.png")
                entry["url"] = images[0]["url"]
                print(f"✓ {name}.png  ({entry['seconds']}s)")
            else:
                entry["result"] = result
                print(f"✗ {name}: {result}")
            with (OUTBOX / "log.jsonl").open("a") as log:
                log.write(json.dumps(entry) + "\n")
    print(f"\nestimated spend ${spent:.2f}; check the real balance at https://console.higgsfield.ai/dashboard")
    return 0


if __name__ == "__main__":
    sys.exit(main())
