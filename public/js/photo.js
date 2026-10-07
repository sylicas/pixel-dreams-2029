// Selfie helpers: crop to a square, sample colours, and the pixelate animation.
// The photo never leaves the phone except for the optional one-off AI read.
import { SKIN, HAIR_C, CLOTH } from './avatar.js';

export function loadSquare(file, size = 256) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      const c = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that photo')); };
    img.src = url;
  });
}

export const toBase64Jpeg = (canvas) => canvas.toDataURL('image/jpeg', 0.82).split(',')[1];

function avg(ctx, x, y, w, h) {
  const d = ctx.getImageData(x, y, w, h).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  return [r / n, g / n, b / n];
}
const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
function nearest(rgb, palette) {
  let best = 0, bd = Infinity;
  palette.forEach((h, i) => {
    const [r, g, b] = hexRgb(h);
    const d = (r - rgb[0]) ** 2 * 0.3 + (g - rgb[1]) ** 2 * 0.59 + (b - rgb[2]) ** 2 * 0.11;
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

// Rough guesses from where things usually are in a selfie: face centre, hair on
// top, clothes at the bottom. Guests can change everything afterwards.
export function sampleColours(canvas) {
  const s = canvas.width, ctx = canvas.getContext('2d', { willReadFrequently: true });
  const f = (v) => Math.round(v * s);
  return {
    skin: nearest(avg(ctx, f(0.42), f(0.45), f(0.16), f(0.14)), SKIN),
    hairC: nearest(avg(ctx, f(0.4), f(0.06), f(0.2), f(0.1)), HAIR_C.slice(0, 6)),
    topC: nearest(avg(ctx, f(0.35), f(0.9), f(0.3), f(0.08)), CLOTH),
  };
}

// Draw the selfie at decreasing resolution: 64 → 32 → 16 → 8 blocks.
export async function pixelate(target, photo, onStep) {
  const ctx = target.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const tmp = document.createElement('canvas');
  for (const n of [128, 64, 32, 24, 16, 12, 8]) {
    tmp.width = tmp.height = n;
    tmp.getContext('2d').drawImage(photo, 0, 0, n, n);
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(tmp, 0, 0, target.width, target.height);
    onStep?.(n);
    await new Promise((r) => setTimeout(r, 260));
  }
}
