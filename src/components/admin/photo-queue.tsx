"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { defaultCrop, drawCrop, loadImage, lowResolution, rotatedSize, type Crop } from "./image-tools";

export type QueuedPhoto = {
  id: string;
  name: string;
  image: HTMLImageElement;
  crop: Crop;
  lowRes: boolean;
  /** Bulk mode: product handle, "" = unassigned, NEW = create a draft product from this photo. */
  target: string;
};

export const NEW_PRODUCT = "__new__";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

/** Turns dropped/selected files into queue entries (decoding happens here so errors show per file). */
export async function filesToQueue(files: File[], pickTarget: (fileName: string) => string) {
  const queued: QueuedPhoto[] = [];
  const failed: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) continue;
    try {
      const image = await loadImage(file);
      queued.push({
        id: `${file.name}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        image,
        crop: defaultCrop,
        lowRes: lowResolution(image),
        target: pickTarget(file.name),
      });
    } catch {
      failed.push(file.name);
    }
  }
  return { queued, failed };
}

/** Drop zone + file picker (also opens the camera on phones). */
export function DropZone({ onFiles, compact = false }: { onFiles: (files: File[]) => void; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        onFiles([...event.dataTransfer.files]);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 border border-dashed text-center transition-colors",
        compact ? "px-4 py-5" : "px-6 py-12",
        over ? "border-ink bg-stone" : "border-ash bg-white",
      )}
    >
      <p className="font-medium">Fotoğrafları buraya sürükleyin</p>
      <p className="text-graphite">veya</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="st-label cursor-pointer bg-ink px-4 py-2.5 text-bone hover:bg-smoke"
      >
        Fotoğraf seç / çek
      </button>
      <p className="text-[11px] text-graphite">JPEG, PNG veya WebP · otomatik 4:5 kırpılır ve 1200×1500 boyutuna küçültülür</p>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(event) => {
          onFiles([...(event.target.files ?? [])]);
          event.target.value = "";
        }}
      />
    </div>
  );
}

/** Small live 4:5 preview of a crop. */
export function CropThumb({ photo, width = 96, className }: { photo: Pick<QueuedPhoto, "image" | "crop">; width?: number; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ratio = window.devicePixelRatio || 1;
    el.width = width * ratio;
    el.height = width * 1.25 * ratio;
    drawCrop(el.getContext("2d")!, photo.image, photo.crop, el.width, el.height);
  }, [photo.image, photo.crop, width]);
  return <canvas ref={canvas} style={{ width, height: width * 1.25 }} className={cn("block bg-stone", className)} />;
}

/** Full crop editor: drag to pan, slider/wheel to zoom, rotate in 90° steps. */
export function CropDialog({
  photo,
  onDone,
  onCancel,
}: {
  photo: QueuedPhoto;
  onDone: (crop: Crop) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<Crop>(photo.crop);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; crop: Crop } | null>(null);
  const SIZE = { w: 320, h: 400 };

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ratio = window.devicePixelRatio || 1;
    el.width = SIZE.w * ratio;
    el.height = SIZE.h * ratio;
    drawCrop(el.getContext("2d")!, photo.image, crop, el.width, el.height);
  }, [photo.image, crop, SIZE.w, SIZE.h]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  /** Free space (display px) the image can move in each axis at the current zoom. */
  const free = (c: Crop) => {
    const { w, h } = rotatedSize(photo.image, c.rotate);
    const scale = Math.max(SIZE.w / w, SIZE.h / h) * c.zoom;
    return { x: w * scale - SIZE.w, y: h * scale - SIZE.h };
  };
  const clamp = (n: number) => Math.max(-1, Math.min(1, n));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-3" role="dialog" aria-modal="true" aria-label="Fotoğrafı kırp">
      <div className="w-full max-w-[380px] bg-bone p-4">
        <div className="flex items-center justify-between">
          <h2 className="st-label">Kırp ve hizala</h2>
          <button type="button" onClick={onCancel} className="cursor-pointer text-graphite hover:text-ink">
            Kapat
          </button>
        </div>
        <canvas
          ref={canvas}
          style={{ width: SIZE.w, height: SIZE.h, touchAction: "none" }}
          className="mx-auto mt-3 block cursor-grab bg-stone active:cursor-grabbing"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY, crop };
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start) return;
            const space = free(start.crop);
            setCrop({
              ...start.crop,
              x: space.x > 0 ? clamp(start.crop.x - (2 * (event.clientX - start.x)) / space.x) : 0,
              y: space.y > 0 ? clamp(start.crop.y - (2 * (event.clientY - start.y)) / space.y) : 0,
            });
          }}
          onPointerUp={() => (drag.current = null)}
          onWheel={(event) => setCrop((c) => ({ ...c, zoom: Math.max(1, Math.min(3, c.zoom - event.deltaY / 500)) }))}
        />
        <p className="mt-2 text-center text-[11px] text-graphite">Sürükleyerek kaydırın · ürün çerçevenin ortasında ve boşluklu dursun</p>
        <label className="mt-3 flex items-center gap-3">
          <span className="w-20 text-graphite">Yakınlaştır</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={crop.zoom}
            onChange={(event) => setCrop((c) => ({ ...c, zoom: Number(event.target.value) }))}
            className="flex-1 accent-ink"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCrop((c) => ({ ...c, rotate: ((c.rotate + 90) % 360) as Crop["rotate"], x: 0, y: 0 }))}
            className="st-label cursor-pointer border border-sand px-3 py-2 hover:border-ink"
          >
            Döndür ↻
          </button>
          <button
            type="button"
            onClick={() => setCrop(defaultCrop)}
            className="st-label cursor-pointer border border-sand px-3 py-2 hover:border-ink"
          >
            Sıfırla
          </button>
          <button
            type="button"
            onClick={() => onDone(crop)}
            className="st-label ml-auto cursor-pointer bg-ink px-4 py-2 text-bone hover:bg-smoke"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}

/** Queue grid: thumbnails with crop / remove and an optional per-photo product picker. */
export function PhotoQueueGrid({
  photos,
  onChange,
  targets,
}: {
  photos: QueuedPhoto[];
  onChange: (photos: QueuedPhoto[]) => void;
  /** Bulk mode: options for the product picker. */
  targets?: { value: string; label: string }[];
}) {
  const [cropping, setCropping] = useState<QueuedPhoto | null>(null);
  const update = (id: string, patch: Partial<QueuedPhoto>) =>
    onChange(photos.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 tab:grid-cols-4 desk:grid-cols-6">
        {photos.map((photo) => (
          <li key={photo.id} className="flex flex-col gap-1.5 bg-white p-2">
            <button type="button" onClick={() => setCropping(photo)} className="cursor-pointer" title="Kırp">
              <CropThumb photo={photo} width={150} className="h-auto w-full" />
            </button>
            <p className="truncate text-[11px] text-graphite" title={photo.name}>
              {photo.name}
            </p>
            {photo.lowRes ? <p className="text-[11px] text-rust">Düşük çözünürlük — bulanık görünebilir</p> : null}
            {targets ? (
              <select
                value={photo.target}
                onChange={(event) => update(photo.id, { target: event.target.value })}
                className={cn("h-9 w-full border bg-white px-1.5 text-[12px]", photo.target ? "border-sand" : "border-rust")}
              >
                <option value="">Ürün seçin…</option>
                <option value={NEW_PRODUCT}>+ Yeni taslak ürün</option>
                {targets.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            ) : null}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setCropping(photo)}
                className="flex-1 cursor-pointer border border-sand py-1.5 text-[12px] hover:border-ink"
              >
                Kırp
              </button>
              <button
                type="button"
                onClick={() => onChange(photos.filter((p) => p.id !== photo.id))}
                className="flex-1 cursor-pointer border border-sand py-1.5 text-[12px] hover:border-rust hover:text-rust"
              >
                Çıkar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {cropping ? (
        <CropDialog
          photo={cropping}
          onCancel={() => setCropping(null)}
          onDone={(crop) => {
            update(cropping.id, { crop });
            setCropping(null);
          }}
        />
      ) : null}
    </>
  );
}
