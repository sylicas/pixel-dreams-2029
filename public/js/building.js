// The GENERATIONS building in pixels: 12 floors of copper fins and warm light
// strips, a dark side tower, and the vertical GENERATIONS sign on the corner.
// The top 4 floors are fully lit so they stand out against the night sky.

export const BW = 88;   // front face + sign + side face
export const BH = 96;   // roof to pavement

const FLOORS = 12, FH = 7, ROOF = 4;
const C = {
  glass: '#1b1826', glassHi: '#2a2638', slab: '#3b2219',
  fin: '#6b3b2a', finHi: '#8a5038', finLo: '#4a2a1d',
  strip: '#ffe9b8', warm: '#f4c77a', warmHi: '#ffe2a6',
  side: '#211e2a', sideLine: '#2d2a39', sign: '#14111b', letter: '#f6f2ff',
  lobby: '#ffd890', ground: '#2b2440',
};

const FONT = {
  G: ['.###', '#...', '#.##', '#..#', '.###'],
  E: ['####', '#...', '###.', '#...', '####'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  R: ['###.', '#..#', '###.', '#.#.', '#..#'],
  A: ['.##.', '#..#', '####', '#..#', '#..#'],
  T: ['###.', '.#..', '.#..', '.#..', '.#..'],
  I: ['###.', '.#..', '.#..', '.#..', '###.'],
  O: ['.##.', '#..#', '#..#', '#..#', '.##.'],
  S: ['.###', '#...', '.##.', '...#', '###.'],
};

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function drawBuilding(ctx, ox, oy) {
  const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, 1, 1); };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, w, h); };
  const r = rng(2029);
  const FRONT = 64, SIGN_X = 64, SIDE_X = 70, SIDE_W = 16;
  const top = ROOF, bottom = ROOF + FLOORS * FH;

  // roof screen: thin fins above the top floor
  for (let x = 0; x < FRONT; x += 3) rect(x, 0, 1, ROOF, C.finLo);
  rect(0, ROOF - 1, FRONT, 1, C.slab);

  for (let f = FLOORS; f >= 1; f--) {
    const y = top + (FLOORS - f) * FH;
    const important = f >= 9;
    rect(0, y, FRONT, FH, C.glass);
    if (important && (f === 10 || f === 11)) {
      // the long glass band on the upper floors, lit from inside
      rect(0, y + 1, 46, FH - 2, C.warm);
      for (let x = 0; x < 46; x += 6) rect(x, y + 1, 1, FH - 2, C.finLo);
      rect(1, y + 1, 44, 1, C.warmHi);
      for (let x = 46; x < FRONT; x += 2) rect(x, y, 1, FH, x % 4 ? C.fin : C.finHi);
    } else {
      // windows behind the fins
      for (let x = 1; x < FRONT - 1; x += 4) {
        const lit = important || r() < 0.35;
        rect(x, y + 1, 3, FH - 2, lit ? (important ? C.warm : '#7d5b3e') : C.glassHi);
      }
      // copper fins, grouped like the facade panels
      for (let x = 0; x < FRONT; x++) {
        const group = Math.floor((x + f * 3) / 8) % 3;
        if ((group === 0 && x % 2 === 0) || (group !== 0 && x % 3 === 0)) rect(x, y, 1, FH, x % 5 === 0 ? C.finHi : C.fin);
      }
    }
    // vertical light strips
    const n = important ? 6 : 3;
    for (let i = 0; i < n; i++) rect(Math.floor(r() * FRONT), y + 1, 1, FH - 2, C.strip);
    rect(0, y + FH - 1, FRONT, 1, C.slab);
  }

  // a soft glow line around the important top floors
  const imp = top, impH = 4 * FH;
  for (let y = imp; y < imp + impH; y++) { px(-1, y, '#5a3d2e'); }
  rect(0, imp - 1, FRONT, 1, '#c98a5a');

  // lobby: entrance glow and planters
  rect(0, bottom, FRONT + SIDE_W + 6, 6, '#16131f');
  for (let x = 6; x < 40; x += 5) rect(x, bottom + 1, 3, 4, C.lobby);
  rect(18, bottom + 1, 8, 5, '#fff3cf');

  // corner sign with GENERATIONS
  rect(SIGN_X, 0, 6, bottom + 6, C.sign);
  [...'GENERATIONS'].forEach((ch, i) => {
    FONT[ch].forEach((row, j) => [...row].forEach((c, k) => { if (c === '#') px(SIGN_X + 1 + k, 3 + i * 7 + j, C.letter); }));
  });

  // dark side tower with a few light seams
  rect(SIDE_X, 2, SIDE_W, bottom + 4, C.side);
  for (let x = SIDE_X + 2; x < SIDE_X + SIDE_W; x += 3) rect(x, 2, 1, bottom + 4, C.sideLine);
  for (let f = 0; f < FLOORS; f++) rect(SIDE_X, top + f * FH + FH - 1, SIDE_W, 1, '#1a1822');
  rect(SIDE_X + 4, top + 2, 1, FH * 4, '#5e5469');
  rect(SIDE_X + 10, top + 30, 1, FH * 5, '#4a4256');

  // ground with trees
  rect(-14, bottom + 6, BW + 28, 4, C.ground);
  const tree = (x, s) => {
    const cols = ['#2f6b4a', '#3b8159', '#255640'];
    for (let j = -s; j <= s; j++) for (let i = -s; i <= s; i++) if (i * i + j * j <= s * s + 1) px(x + i, bottom + 2 - s + j, cols[(i + j + 9) % 3]);
    rect(x, bottom + 3, 1, 4, '#3a2b2b');
  };
  tree(-8, 4); tree(-2, 3); tree(4, 3); tree(46, 3); tree(56, 2); tree(BW + 2, 4); tree(BW + 8, 3);
}
