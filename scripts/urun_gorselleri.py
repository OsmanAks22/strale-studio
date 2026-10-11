#!/usr/bin/env python3
"""Product photos → site images, through the Higgsfield API (Marketing Studio Image).

Called by `npm run import-products -- <csv> --gorsel`, which writes the job list; can also be run
directly on that list. Each job is one product row from the stock spreadsheet:

    orijinal  your photo, cropped to 4:5 (no AI, free)            → <handle>.jpg
    urun      AI studio packshot on the site's light grey backdrop → <handle>.jpg
    manken    your photo cropped (gallery) + AI on-model photo     → <handle>.jpg, <handle>-manken.jpg

    python3 scripts/urun_gorselleri.py temp/urun-gorselleri/jobs.json --dry-run   # plan + cost, no API call
    python3 scripts/urun_gorselleri.py temp/urun-gorselleri/jobs.json --budget 2

Needs HF_KEY or HF_CREDENTIALS (KEY_ID:KEY_SECRET) as an environment secret, `pip install higgsfield-client`
and ffmpeg. Existing outputs are skipped (use --force). Every paid call is appended to temp/urun-gorselleri/log.jsonl.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

if not os.environ.get("HF_KEY") and os.environ.get("HF_CREDENTIALS"):
    os.environ["HF_KEY"] = os.environ["HF_CREDENTIALS"]

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public/sites/strale/products"
WORK = ROOT / "temp/urun-gorselleri"
APPLICATION = "marketing-studio/image"
WIDTH, HEIGHT = 1200, 1500  # 4:5, the card and product-page ratio
# Published rate is for low quality only; high quality is unpublished, so the estimate is conservative.
PRICE = {"low": 0.0189, "medium": 0.05, "high": 0.05}

KEEP_GARMENT = (
    "Keep the garment exactly as in the reference image: same colour, fabric texture, cut, stitching, buttons, "
    "zips, pockets and proportions. Do not add logos, text, labels, prints or accessories."
)
PROMPTS = {
    "urun": (
        "Professional e-commerce packshot of the garment from the reference image, shown alone on an invisible "
        "ghost mannequin, front view, centred with generous margin, on a seamless warm light grey studio background "
        "(#E8E3DA), soft even studio light, subtle natural shadow. No person. " + KEEP_GARMENT
    ),
    "manken": (
        "Fashion e-commerce photo: dress the person from the last reference image in the garment from the first "
        "reference image, worn naturally with neutral basics. Keep the person's face, body, skin and hair unchanged. "
        "Three-quarter to full-length, relaxed natural pose, seamless warm light grey studio background (#E8E3DA), "
        "soft daylight. Photorealistic, natural skin and fabric texture. " + KEEP_GARMENT
    ),
}


def crop(src: Path, dest: Path, gravity_y: float = 0.5) -> None:
    """Scale to cover 1200×1500 and crop; gravity_y 0 = keep the top, 0.5 = centre."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    vf = (
        f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=increase:flags=lanczos,"
        f"crop={WIDTH}:{HEIGHT}:(iw-{WIDTH})/2:(ih-{HEIGHT})*{gravity_y}"
    )
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vf", vf, "-q:v", "3", "-frames:v", "1", str(dest)], check=True)


def upload(client, path: Path, cache: dict) -> str:
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest not in cache:
        cache[digest] = client.upload_file(str(path))
    return cache[digest]


def plan(jobs: list[dict], force: bool) -> list[dict]:
    """Expand jobs into concrete steps, skipping outputs that already exist."""
    steps = []
    for job in jobs:
        photo = Path(job["photo"])
        main = OUT_DIR / f"{job['handle']}.jpg"
        if job["look"] in ("orijinal", "manken") and (force or not main.exists()):
            steps.append({"kind": "crop", "handle": job["handle"], "src": photo, "dest": main})
        if job["look"] == "urun" and (force or not main.exists()):
            steps.append({"kind": "ai", "mode": "urun", "handle": job["handle"], "images": [photo], "dest": main})
        on_model = OUT_DIR / f"{job['handle']}-manken.jpg"
        if job["look"] == "manken" and (force or not on_model.exists()):
            steps.append({"kind": "ai", "mode": "manken", "handle": job["handle"], "images": [photo, Path(job["model"])], "dest": on_model})
    return steps


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("jobs", help="job list written by import-products --gorsel")
    parser.add_argument("--quality", choices=["low", "medium", "high"], default="high")
    parser.add_argument("--budget", type=float, default=2.0, help="stop before the estimated spend passes this (USD)")
    parser.add_argument("--dry-run", action="store_true", help="print the plan and cost estimate, call nothing")
    parser.add_argument("--force", action="store_true", help="regenerate images that already exist")
    args = parser.parse_args()

    steps = plan(json.loads(Path(args.jobs).read_text()), args.force)
    ai_steps = [s for s in steps if s["kind"] == "ai"]
    price = PRICE[args.quality]
    print(f"{len(steps) - len(ai_steps)} kırpma (ücretsiz) + {len(ai_steps)} AI görsel ≈ ${len(ai_steps) * price:.2f} "
          f"(tahmini ${price}/görsel, bütçe ${args.budget:.2f})")
    for step in steps:
        inputs = ", ".join(p.name for p in step.get("images", [step.get("src")]))
        print(f"  {step['kind'] if step['kind'] == 'crop' else step['mode']:8} {step['dest'].name:48} ← {inputs}")
    if args.dry_run or not steps:
        return 0

    for step in steps:
        if step["kind"] == "crop":
            crop(step["src"], step["dest"])
    if not ai_steps:
        return 0
    if not os.environ.get("HF_KEY"):
        print("HF_KEY / HF_CREDENTIALS tanımlı değil; AI görselleri atlandı.", file=sys.stderr)
        return 1

    import higgsfield_client  # late import so --dry-run and crop-only runs work without the SDK

    WORK.mkdir(parents=True, exist_ok=True)
    cache_file = WORK / "uploads.json"
    cache = json.loads(cache_file.read_text()) if cache_file.exists() else {}
    spent, failed = 0.0, 0
    for step in ai_steps:
        if spent + price > args.budget:
            print(f"Bütçe doldu (tahmini ${spent:.2f}); kalan görseller atlandı.")
            break
        urls = [upload(higgsfield_client, path, cache) for path in step["images"]]
        cache_file.write_text(json.dumps(cache, indent=2))
        arguments = {
            "prompt": PROMPTS[step["mode"]],
            "image_urls": urls,
            "quality": args.quality,
            "resolution": "2k",
            "aspect_ratio": "3:4",
            "enhance_prompt": False,
        }
        started = time.time()
        entry = {"handle": step["handle"], "mode": step["mode"], "arguments": arguments}
        try:
            result = higgsfield_client.subscribe(APPLICATION, arguments=arguments)
            spent += price
            image_url = ((result or {}).get("images") or [{}])[0].get("url")
            if not image_url:
                raise RuntimeError(f"görsel dönmedi: {result}")
            raw = WORK / f"{step['dest'].stem}.raw"
            with urllib.request.urlopen(image_url, timeout=120) as response:
                raw.write_bytes(response.read())
            crop(raw, step["dest"], gravity_y=0.3 if step["mode"] == "manken" else 0.5)
            entry["url"] = image_url
            print(f"  ✓ {step['dest'].name} ({time.time() - started:.0f} sn)")
        except Exception as error:  # one bad product must not stop the batch
            failed += 1
            entry["error"] = str(error)
            print(f"  ✗ {step['dest'].name}: {error}")
        entry["seconds"] = round(time.time() - started, 1)
        with (WORK / "log.jsonl").open("a") as log:
            log.write(json.dumps(entry) + "\n")

    print(f"Tahmini harcama ${spent:.2f}. Gerçek bakiye: https://console.higgsfield.ai/dashboard")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
