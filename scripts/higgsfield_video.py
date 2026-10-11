#!/usr/bin/env python3
"""Generates a site video from a spec in docs/video-pipeline/ through the Higgsfield API.

The spec holds the shared style line, the API arguments and up to six shots; each
shot prompt is sent as one entry of Kling's multi_prompt, so the whole montage
comes back as a single clip. Takes land in temp/higgsfield/video/<name>-<n>.mp4.

    pip install higgsfield-client
    export HF_KEY="KEY_ID:KEY_SECRET"      # environment secret, never commit it

    python3 scripts/higgsfield_video.py docs/video-pipeline/hero-kapadokya.json --dry-run
    python3 scripts/higgsfield_video.py docs/video-pipeline/hero-kapadokya.json            # one take
    python3 scripts/higgsfield_video.py docs/video-pipeline/hero-kapadokya.json --takes 2 --budget 1.5
    python3 scripts/higgsfield_video.py docs/video-pipeline/hero-kapadokya.json --finalize temp/higgsfield/video/hero-kapadokya-1.mp4

--finalize turns the chosen take into the web file (H.264, no audio, faststart)
and its poster frame at the paths in the spec's "output". Requires ffmpeg.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTBOX = ROOT / "temp/higgsfield/video"
MAX_SHOT_PROMPT = 512


def build_arguments(spec: dict) -> dict:
    shots = []
    for index, shot in enumerate(spec["shots"], 1):
        prompt = f"{shot['prompt']} {spec['style']}"
        if len(prompt) > MAX_SHOT_PROMPT:
            # Kling caps each shot prompt; keep the shot itself and trim the shared style.
            prompt = prompt[:MAX_SHOT_PROMPT].rsplit(" ", 1)[0]
            print(f"  note: shot {index} prompt trimmed to {MAX_SHOT_PROMPT} chars")
        shots.append({"prompt": prompt, "duration": shot["duration"]})
    total = sum(shot["duration"] for shot in shots)
    if total != spec["arguments"]["duration"]:
        raise ValueError(f"shot durations add up to {total}s but arguments.duration is {spec['arguments']['duration']}s")
    return {**spec["arguments"], "prompt": spec["style"], "multi_prompt": shots}


def video_url(result: dict) -> str | None:
    video = (result or {}).get("video")
    if isinstance(video, dict):
        return video.get("url")
    if isinstance(video, str):
        return video
    videos = (result or {}).get("videos") or []
    return videos[0].get("url") if videos else None


def finalize(spec: dict, take: Path) -> None:
    video = ROOT / spec["output"]["video"]
    poster = ROOT / spec["output"]["poster"]
    video.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(take), "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "23",
         "-pix_fmt", "yuv420p", "-vf", "scale=1920:-2", "-movflags", "+faststart", str(video)],
        check=True,
    )
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-ss", str(spec["output"].get("posterAt", 0)), "-i", str(video),
         "-frames:v", "1", "-q:v", "3", str(poster)],
        check=True,
    )
    size = video.stat().st_size / 1_000_000
    print(f"✓ {video.relative_to(ROOT)} ({size:.1f} MB)\n✓ {poster.relative_to(ROOT)}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("spec", type=Path)
    parser.add_argument("--takes", type=int, default=1, help="how many versions to generate")
    parser.add_argument("--budget", type=float, default=1.0, help="stop before estimated spend passes this (USD)")
    parser.add_argument("--dry-run", action="store_true", help="print the request and cost estimate, call nothing")
    parser.add_argument("--finalize", type=Path, metavar="TAKE", help="convert a chosen take into the site video + poster")
    args = parser.parse_args()

    spec = json.loads(args.spec.read_text())
    if args.finalize:
        finalize(spec, args.finalize)
        return 0

    arguments = build_arguments(spec)
    cost = spec["pricePerSecond"] * arguments["duration"]
    print(f"{spec['application']}: {args.takes} take(s) × {arguments['duration']}s ≈ ${cost * args.takes:.2f} "
          f"(est. ${cost:.2f}/take, budget ${args.budget:.2f})\n")
    if args.dry_run:
        print(json.dumps(arguments, indent=2, ensure_ascii=False))
        return 0
    if not os.environ.get("HF_KEY"):
        print("HF_KEY is not set (format KEY_ID:KEY_SECRET). Add it as an environment secret.", file=sys.stderr)
        return 1

    import higgsfield_client  # imported late so --dry-run works without the SDK

    OUTBOX.mkdir(parents=True, exist_ok=True)
    existing = len(list(OUTBOX.glob(f"{spec['name']}-*.mp4")))
    spent = 0.0
    for take in range(existing + 1, existing + args.takes + 1):
        if spent + cost > args.budget:
            print(f"budget reached (${spent:.2f} estimated); stopping")
            break
        started = time.time()
        result = higgsfield_client.subscribe(spec["application"], arguments=arguments)
        spent += cost
        url = video_url(result)
        entry = {"spec": spec["name"], "take": take, "arguments": arguments, "seconds": round(time.time() - started, 1)}
        if url:
            dest = OUTBOX / f"{spec['name']}-{take}.mp4"
            with urllib.request.urlopen(url, timeout=300) as response:
                dest.write_bytes(response.read())
            entry["url"] = url
            print(f"✓ {dest.relative_to(ROOT)}  ({entry['seconds']}s)")
        else:
            entry["result"] = result
            print(f"✗ take {take}: {result}")
        with (OUTBOX / "log.jsonl").open("a") as log:
            log.write(json.dumps(entry) + "\n")
    print(f"\nestimated spend ${spent:.2f}; check the real balance at https://console.higgsfield.ai/dashboard")
    return 0


if __name__ == "__main__":
    sys.exit(main())
