/** Browser-side photo prep: everything is resized here so uploads stay small and the site gets 4:5 JPEGs. */

export const OUTPUT = { width: 1200, height: 1500 };
const ORIGINAL_MAX = 2000;

export type Crop = { zoom: number; x: number; y: number; rotate: 0 | 90 | 180 | 270 };
export const defaultCrop: Crop = { zoom: 1, x: 0, y: 0, rotate: 0 };

export async function loadImage(file: Blob) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } catch {
    throw new Error("Fotoğraf açılamadı. iPhone HEIC ise “En Uyumlu” biçimde (JPEG) gönderin.");
  } finally {
    // Decoded pixels stay available after revoking.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/** Source size after rotation. */
export function rotatedSize(image: HTMLImageElement, rotate: Crop["rotate"]) {
  const swap = rotate === 90 || rotate === 270;
  return { w: swap ? image.naturalHeight : image.naturalWidth, h: swap ? image.naturalWidth : image.naturalHeight };
}

/**
 * Draws `image` into a 4:5 frame of `width`×`height`: cover-fit × zoom, panned by x/y
 * (fractions of the free space, -1…1), rotated in 90° steps.
 */
export function drawCrop(ctx: CanvasRenderingContext2D, image: HTMLImageElement, crop: Crop, width: number, height: number) {
  const { w, h } = rotatedSize(image, crop.rotate);
  const scale = Math.max(width / w, height / h) * crop.zoom;
  const drawW = w * scale;
  const drawH = h * scale;
  const freeX = drawW - width;
  const freeY = drawH - height;
  const left = -freeX / 2 + (crop.x * freeX) / 2;
  const top = -freeY / 2 + (crop.y * freeY) / 2;
  ctx.fillStyle = "#e8e3da";
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.translate(left + drawW / 2, top + drawH / 2);
  ctx.rotate((crop.rotate * Math.PI) / 180);
  const sw = crop.rotate % 180 === 0 ? drawW : drawH;
  const sh = crop.rotate % 180 === 0 ? drawH : drawW;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, -sw / 2, -sh / 2, sw, sh);
  ctx.restore();
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality = 0.86) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Görsel oluşturulamadı"))), "image/jpeg", quality),
  );
}

export async function renderCrop(image: HTMLImageElement, crop: Crop) {
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT.width;
  canvas.height = OUTPUT.height;
  drawCrop(canvas.getContext("2d")!, image, crop, OUTPUT.width, OUTPUT.height);
  return canvasToJpeg(canvas);
}

/** Uncropped copy (long side ≤ 2000 px) kept for the AI image pipeline. */
export async function renderOriginal(image: HTMLImageElement, rotate: Crop["rotate"]) {
  const { w, h } = rotatedSize(image, rotate);
  const scale = Math.min(1, ORIGINAL_MAX / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  const sw = rotate % 180 === 0 ? canvas.width : canvas.height;
  const sh = rotate % 180 === 0 ? canvas.height : canvas.width;
  ctx.drawImage(image, -sw / 2, -sh / 2, sw, sh);
  return canvasToJpeg(canvas, 0.9);
}

export function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Warn when the photo is too small to look sharp at 1200×1500. */
export function lowResolution(image: HTMLImageElement) {
  return Math.min(image.naturalWidth, image.naturalHeight) < 900;
}
