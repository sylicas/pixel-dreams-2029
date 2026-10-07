// The dream space: a tall pixel night sky (192 px wide, scaled up to fit the
// phone) with dreamers standing on little clouds. The sky is a canvas; the
// dreamers are buttons laid over it so they're easy to tap.
import { lookToDataURL, iconDataURL } from './avatar.js';
import { drawBuilding, BW } from './building.js';

export const SW = 192;
const TOP = 100;      // room for the title
const ROW_H = 92;
const LH = 124;       // the backdrop canvas: moon, GENERATIONS building, hills
const BX = Math.floor((SW - BW) / 2), BY = 8; // where the building stands on it
const COLS = 3;
const BOTTOM = 112;   // so the last row clears the building at the very end

const SKY = ['#110d2b', '#171135', '#1d1541', '#24194c', '#2c1d57', '#352261', '#40276b', '#4c2c73', '#5a3179', '#6a377e'];
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function layout(n) {
  const rows = Math.max(2, Math.ceil(n / COLS));
  const height = TOP + rows * ROW_H + BOTTOM;
  const r = rng(7);
  const slots = [];
  for (let i = 0; i < rows * COLS; i++) {
    const row = Math.floor(i / COLS), col = i % COLS;
    const jx = Math.round((r() - 0.5) * 8), jy = Math.round((r() - 0.5) * 10);
    slots.push({ cx: 32 + col * 64 + jx, y: TOP + row * ROW_H + (col === 1 ? 18 : 0) + jy });
  }
  return { height, slots };
}

function px(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }

function drawSky(ctx, h) {
  const img = ctx.createImageData(SW, h);
  const rgb = SKY.map((hx) => [1, 3, 5].map((i) => parseInt(hx.slice(i, i + 2), 16)));
  for (let y = 0; y < h; y++) {
    const t = (y / h) * (SKY.length - 1), i = Math.floor(t), f = t - i;
    for (let x = 0; x < SW; x++) {
      const c = rgb[Math.min(SKY.length - 1, f * 16 > BAYER[y % 4][x % 4] ? i + 1 : i)];
      const o = (y * SW + x) * 4;
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function disc(ctx, cx, cy, r, c) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) px(ctx, cx + x, cy + y, c);
}

function drawMoon(ctx) {
  const cx = 22, cy = 24;
  for (let y = -17; y <= 17; y++) for (let x = -17; x <= 17; x++) {
    const d = x * x + y * y;
    if (d > 10 * 10 && d <= 13 * 13 && (x + y) % 2 === 0) px(ctx, cx + x, cy + y, d < 11.5 * 11.5 ? '#5b4489' : '#3d2c6e');
  }
  disc(ctx, cx, cy, 9, '#fff1c1');
  disc(ctx, cx + 3, cy - 2, 2, '#f2dc98'); disc(ctx, cx - 4, cy + 3, 1, '#f2dc98'); disc(ctx, cx + 2, cy + 5, 1, '#f2dc98');
  for (let i = -6; i <= 2; i++) px(ctx, cx - 7 + Math.round(Math.abs(i) * 0.15), cy + i, '#fffbe6');
}

export function drawCloud(ctx, cx, y, w, light = '#f6f1ff', mid = '#ddd2f7', dark = '#b6a6e6', line = '#7a68b8') {
  const half = Math.floor(w / 2);
  const top = (x) => y + 4 - Math.round(3 * Math.abs(Math.sin((x + half) / 6))) - (Math.abs(x) < half / 2 ? 1 : 0);
  for (let x = -half; x <= half; x++) {
    const edge = Math.abs(x) > half - 3;
    const t = top(x) + (edge ? 2 : 0), b = y + 9 - (edge ? 1 : 0);
    for (let yy = t; yy <= b; yy++) px(ctx, cx + x, yy, yy > b - 2 ? dark : yy > b - 4 ? mid : light);
    px(ctx, cx + x, t - 1, line); px(ctx, cx + x, b + 1, line);
  }
  for (const s of [-1, 1]) for (let yy = top(s * half) + 1; yy <= y + 8; yy++) px(ctx, cx + s * (half + 1), yy, line);
}

// The backdrop that stays at the bottom of the screen: the moon, the
// GENERATIONS building with a soft glow around its top four floors, and a
// sleeping town on the hills around it.
function drawBackdrop(ctx) {
  const gx = BX + BW / 2, gy = BY + 18, rx = BW / 2 + 16, ry = 34;
  for (let y = gy - ry; y < gy + ry; y++) for (let x = gx - rx; x < gx + rx; x++) {
    const d = ((x - gx) / rx) ** 2 + ((y - gy) / ry) ** 2;
    if (d < 0.55 ? (x + y) % 2 === 0 : d < 1 && x % 2 === 0 && y % 2 === 0) px(ctx, Math.round(x), Math.round(y), d < 0.55 ? '#4d3a7e' : '#3f2f6c');
  }
  drawMoon(ctx);
  const base = BY + 96 - 10;
  for (let x = 0; x < SW; x++) {
    const far = base - 4 + Math.round(5 * Math.sin(x / 19) + 3 * Math.sin(x / 7));
    for (let y = far; y < LH; y++) px(ctx, x, y, '#211944');
  }
  // a tiny sleeping town either side
  const r = rng(3);
  for (let i = 0; i < 9; i++) {
    const x = 4 + i * 21 + Math.round(r() * 6), w = 8 + Math.round(r() * 4), hh = 8 + Math.round(r() * 10);
    if (x + w > BX - 2 && x < BX + BW + 2) continue;
    const yb = base + 12;
    ctx.fillStyle = '#0d0a20'; ctx.fillRect(x, yb - hh, w, LH - yb + hh);
    for (let j = 0; j < w / 2; j++) px(ctx, x + j, yb - hh - j, '#0d0a20');
    for (let j = 0; j < w / 2; j++) px(ctx, x + w - 1 - j, yb - hh - j, '#0d0a20');
    ctx.fillRect(x + 1, yb - hh - Math.floor(w / 2) + 1, w - 2, Math.floor(w / 2));
    if (r() < 0.75) { ctx.fillStyle = r() < 0.5 ? '#ffd760' : '#ffb347'; ctx.fillRect(x + 2, yb - hh + 3, 2, 2); }
    if (r() < 0.4) { ctx.fillStyle = '#ffd760'; ctx.fillRect(x + w - 4, yb - hh + 7, 2, 2); }
  }
  drawBuilding(ctx, BX, BY);
  for (let x = 0; x < SW; x++) {
    const near = base + 14 + Math.round(3 * Math.sin(x / 27 + 2));
    for (let y = near; y < LH; y++) px(ctx, x, y, '#140f2c');
  }
}

export function createSpace(root, { onTap }) {
  root.classList.add('space');
  root.innerHTML = '';
  const sky = document.createElement('canvas');
  sky.className = 'space-sky';
  const layer = document.createElement('div');
  layer.className = 'space-layer';
  // The building is a backdrop that stays at the bottom of the screen while
  // the dreamers (and their clouds) scroll past in front of it.
  const landWrap = document.createElement('div');
  landWrap.className = 'space-landmark';
  const land = document.createElement('canvas');
  land.width = SW; land.height = LH;
  drawBackdrop(land.getContext('2d'));
  landWrap.append(land);
  const fgEl = document.createElement('canvas');
  fgEl.className = 'space-sky';
  root.append(sky, landWrap, fgEl, layer);

  let height = 0, stars = [], driftClouds = [], skyBase, timer, shooting = null, t = 0;
  const els = new Map();

  function setScale() {
    const s = root.clientWidth / SW;
    root.style.setProperty('--s', `${s}px`);
    root.style.height = `${height * s}px`;
  }

  function build(n) {
    const L = layout(n);
    if (L.height === height) return L;
    height = L.height;
    sky.width = SW; sky.height = height;
    skyBase = document.createElement('canvas'); skyBase.width = SW; skyBase.height = height;
    drawSky(skyBase.getContext('2d'), height);
    fgEl.width = SW; fgEl.height = height;
    const f = fgEl.getContext('2d');
    L.slots.forEach((s) => drawCloud(f, s.cx, s.y + 41, 46));
    const r = rng(11);
    stars = Array.from({ length: Math.round((SW * height) / 150) }, () => ({
      x: Math.floor(r() * SW), y: Math.floor(r() * height), p: r() * 6.28, sp: 0.5 + r() * 1.5, big: r() < 0.08,
    }));
    driftClouds = Array.from({ length: Math.max(3, Math.round(height / 160)) }, (_, i) => ({
      x: r() * SW, y: TOP + r() * (height - TOP - 100), w: 18 + Math.round(r() * 16), v: 0.04 + r() * 0.06, i,
    }));
    setScale();
    return L;
  }

  function frame() {
    t += 0.1;
    const ctx = sky.getContext('2d');
    ctx.drawImage(skyBase, 0, 0);
    for (const s of stars) {
      const b = Math.sin(t * s.sp + s.p);
      const c = b > 0.55 ? '#ffffff' : b > -0.3 ? '#bdb5f2' : '#5f5498';
      px(ctx, s.x, s.y, c);
      if (s.big && b > 0.2) { px(ctx, s.x - 1, s.y, '#8f84d0'); px(ctx, s.x + 1, s.y, '#8f84d0'); px(ctx, s.x, s.y - 1, '#8f84d0'); px(ctx, s.x, s.y + 1, '#8f84d0'); }
    }
    for (const c of driftClouds) {
      c.x += c.v; if (c.x > SW + c.w) c.x = -c.w;
      ctx.fillStyle = '#3a2b6b';
      ctx.fillRect(Math.round(c.x), Math.round(c.y), c.w, 3);
      ctx.fillRect(Math.round(c.x) + 4, Math.round(c.y) - 2, c.w - 10, 2);
      ctx.fillRect(Math.round(c.x) + 8, Math.round(c.y) - 3, 6, 1);
    }
    if (!shooting && Math.random() < 0.006) {
      shooting = { x: 20 + Math.random() * 120, y: 10 + Math.random() * Math.min(300, height / 2), life: 0 };
    }
    if (shooting) {
      const s = shooting;
      for (let i = 0; i < 8; i++) px(ctx, Math.round(s.x + s.life * 3 - i), Math.round(s.y + s.life * 1.5 - i * 0.5), i < 2 ? '#ffffff' : i < 5 ? '#cfc7ff' : '#7d70c0');
      if (++s.life > 22) shooting = null;
    }
  }

  function update(dreams, myId) {
    const L = build(dreams.length);
    const seen = new Set();
    dreams.forEach((d, i) => {
      seen.add(d.id);
      let el = els.get(d.id);
      if (!el) {
        el = document.createElement('button');
        el.type = 'button';
        el.className = 'dreamer';
        el.style.setProperty('--delay', `${-(i * 0.37) % 2.4}s`);
        el.innerHTML = '<span class="bubble"><img alt=""></span><img class="sprite" alt=""><span class="tag"><span class="nm"></span><span class="ch"></span></span><span class="you">YOU</span>';
        el.addEventListener('click', () => onTap(el.dataset.id));
        layer.append(el);
        els.set(d.id, el);
      }
      const key = JSON.stringify([d.look, d.icon, d.name, d.cheers]);
      if (el.dataset.key !== key) {
        el.dataset.key = key;
        el.querySelector('.sprite').src = lookToDataURL(d.look, 2);
        el.querySelector('.bubble img').src = iconDataURL(d.icon, 2);
        el.querySelector('.nm').textContent = d.name;
        el.querySelector('.ch').textContent = d.cheers ? `✦${d.cheers}` : '';
      }
      el.dataset.id = d.id;
      el.classList.toggle('mine', d.id === myId);
      el.setAttribute('aria-label', `${d.name}'s dream`);
      const s = L.slots[i];
      el.style.setProperty('--x', s.cx - 20);
      el.style.setProperty('--y', s.y);
    });
    for (const [id, el] of els) if (!seen.has(id)) { el.remove(); els.delete(id); }
    frame();
  }

  const onResize = () => setScale();
  window.addEventListener('resize', onResize);
  timer = setInterval(frame, 100);

  return {
    update,
    element: (id) => els.get(id),
    destroy() { clearInterval(timer); window.removeEventListener('resize', onResize); },
  };
}
