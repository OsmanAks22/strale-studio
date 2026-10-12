#!/usr/bin/env python3
"""Generates a site video from a spec in docs/video-pipeline/ through the Higgsfield API.

The spec holds the shared style line, the API arguments and up to six shots; each
shot prompt is sent as one entry of Kling's multi_prompt, so the whole montage
comes back as a single clip. Takes land in temp/higgsfield/video/<name>-<n>.mp4.

    pip install higgsfield-client
    export HF_KEY="KEY_ID:KEY_SECRET"      # or HF_CREDENTIALS; environment secret, never commit it

    python3 scripts/higgsfield_video.py docs/video-pipeline/hero-kapadokya.json --dry-run
    python3 scripts/higgsfield_video.py docs/video-pipeline/hero-kapadokya.json            # one take
    python3 scripts/higgsfield_video.py docs/video-pipeline/hero-kapadokya.json --takes 2 --budget 1.5
    python3 scripts/higgsfield_video.py docs/video-pipeline/hero-kapadokya.json --finalize temp/higgsfield/video/hero-kapadokya-1.mp4

--finalize turns the chosen take into the web file (H.264, no audio, faststart; optional
`output.width` and centre `output.crop` such as "4:5" for portrait cards)
and its poster frame at the paths in the spec's "output". Requires ffmpeg.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

# The Python SDK reads HF_KEY; accept the TypeScript SDK's HF_CREDENTIALS too.
if not os.environ.get("HF_KEY") and os.environ.get("HF_CREDENTIALS"):
    os.environ["HF_KEY"] = os.environ["HF_CREDENTIALS"]

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


def detect_cuts(take: Path, threshold: float = 8.0) -> list[float]:
    """Shot boundaries in the take, found with ffmpeg's scene-change detector."""
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(take), "-vf", f"scdet=threshold={threshold}", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    ).stderr
    return [float(match) for match in re.findall(r"lavfi\.scd\.time: ([0-9.]+)", log)]


def probe_duration(take: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(take)],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(out)


def frame_filter(output: dict) -> str:
    """Scale (and optionally centre-crop to `output.crop`, e.g. "4:5") to `output.width` pixels wide."""
    width = output.get("width", 1920)
    if "crop" in output:
        w, h = (int(n) for n in output["crop"].split(":"))
        height = round(width * h / w / 2) * 2
        return (f"scale={width}:{height}:force_original_aspect_ratio=increase:flags=lanczos,"
                f"crop={width}:{height},format=yuv420p")
    return f"scale={width}:-2,format=yuv420p"


def transition_filter(take: Path, fade: float, loop: bool, frame: str) -> tuple[str, float]:
    """Builds a filtergraph that dissolves across every shot cut and, for loop, blends the
    last `fade` seconds into the opening so the clip repeats without a visible jump.
    Each dissolve overlaps two shots, so the result is shorter than the take."""
    duration = probe_duration(take)
    cuts = [cut for cut in detect_cuts(take) if fade < cut < duration - fade]
    bounds = [0.0, *cuts, duration]
    segments = [(start, end) for start, end in zip(bounds, bounds[1:]) if end - start > fade * 2]
    print(f"  {len(segments) - 1} cut(s) at {', '.join(f'{cut:.2f}s' for cut in cuts) or '-'}; {fade}s dissolves")

    parts = [
        f"[0:v]trim={start}:{end},setpts=PTS-STARTPTS,fps=24,settb=AVTB[s{index}]"
        for index, (start, end) in enumerate(segments)
    ]
    label, length = "s0", segments[0][1] - segments[0][0]
    for index, (start, end) in enumerate(segments[1:], 1):
        parts.append(f"[{label}][s{index}]xfade=transition=fade:duration={fade}:offset={length - fade:.3f}[x{index}]")
        label, length = f"x{index}", length + (end - start) - fade
    if loop:
        parts.append(f"[{label}]split=3[a][b][c]")
        parts.append(f"[a]trim=0:{fade},setpts=PTS-STARTPTS[head]")
        parts.append(f"[b]trim={fade}:{length - fade:.3f},setpts=PTS-STARTPTS[body]")
        parts.append(f"[c]trim={length - fade:.3f},setpts=PTS-STARTPTS[tail]")
        parts.append(f"[tail][head]xfade=transition=fade:duration={fade}:offset=0[seam]")
        parts.append("[seam][body]concat=n=2:v=1[joined]")
        label, length = "joined", length - fade
    parts.append(f"[{label}]{frame}[out]")
    return ";".join(parts), length


def finalize(spec: dict, take: Path) -> None:
    video = ROOT / spec["output"]["video"]
    poster = ROOT / spec["output"]["poster"]
    video.parent.mkdir(parents=True, exist_ok=True)
    fade = spec["output"].get("crossfade", 0)
    frame = frame_filter(spec["output"])
    if fade:
        graph, length = transition_filter(take, fade, spec["output"].get("loop", False), frame)
        filters = ["-filter_complex", graph, "-map", "[out]"]
        print(f"  final length {length:.2f}s")
    else:
        filters = ["-vf", frame]
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(take), "-an", *filters, "-c:v", "libx264", "-preset", "slow",
         "-crf", "23", "-movflags", "+faststart", str(video)],
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
        print("HF_KEY / HF_CREDENTIALS is not set (format KEY_ID:KEY_SECRET). Add it as an environment secret.", file=sys.stderr)
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
