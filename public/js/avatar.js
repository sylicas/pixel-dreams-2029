// Pixel character renderer. Every character is drawn into a 40×44 grid of
// colours, then given a dark outline, chunky-chibi style (big head, dot eyes,
// flat shading). Options live at the top; each part is a small draw function.

export const W = 40;
export const H = 44;
const OL = '#231a33';

export const SKIN = ['#ffe6d5', '#ffd5b8', '#f3c19c', '#e0a77a', '#c99063', '#a8714a', '#86553a', '#5e3a24', '#432817'];
export const HAIR_C = ['#2b2233', '#4a3226', '#7a4b2a', '#e2b84f', '#c8602a', '#8b2f2f',
  '#b7b4c0', '#f4f1ea', '#f27db3', '#9b6be0', '#4c7bd9', '#4fbf8b',
  '#f0d9a0', '#2f3f7a', '#d96aa0', '#7fd6d0'];
export const CLOTH = ['#e84d5b', '#f08a3c', '#f5c844', '#4fbf8b', '#3cc0c0', '#4a7be0',
  '#8a5cd6', '#f27db3', '#f4f1ea', '#3a3550', '#6b4a33', '#7d8597', '#2f6b4a', '#8b2f2f', '#9fd3ff', '#ffd6e5',
  '#c8a2f0', '#a8d86a', '#e8c8a0', '#1f1a2e'];
export const SHOES = ['#3a2b2b', '#f4f1ea', '#7a4b2a', '#e84d5b', '#4a7be0', '#f27db3', '#f5c844', '#4fbf8b', '#7d8597', '#9b6be0'];

export const OPTIONS = {
  g: [['m', 'Male'], ['f', 'Female']],
  hair: [['short', 'Short'], ['spiky', 'Spiky'], ['side', 'Side part'], ['curly', 'Curly'],
    ['buzz', 'Buzz'], ['mohawk', 'Mohawk'], ['afro', 'Afro'], ['bald', 'Bald'],
    ['long', 'Long'], ['wavy', 'Wavy'], ['bob', 'Bob'], ['pony', 'Ponytail'], ['braid', 'Braid'],
    ['bun', 'Bun'], ['twinbuns', 'Twin buns'], ['pigtails', 'Pigtails'], ['curlylong', 'Curly long'],
    ['quiff', 'Quiff'], ['undercut', 'Undercut'], ['bangs', 'Fringe'], ['halfup', 'Half up'], ['locs', 'Locs']],
  eyeS: [['dot', 'Dots'], ['big', 'Sparkly'], ['happy', 'Happy'], ['wink', 'Wink'], ['sleepy', 'Sleepy'],
    ['hearts', 'Heart eyes'], ['starry', 'Starry'], ['brows', 'Determined']],
  mouth: [['smile', 'Smile'], ['grin', 'Grin'], ['open', 'Excited'], ['tongue', 'Cheeky'],
    ['smirk', 'Smirk'], ['cat', 'Cat smile'], ['teeth', 'Toothy']],
  cheeks: [['blush', 'Blush'], ['rosy', 'Rosy'], ['freckles', 'Freckles'], ['sparkle', 'Sparkle'], ['bandaid', 'Plaster'], ['none', 'None']],
  face: [['none', 'None'], ['stubble', 'Stubble'], ['tache', 'Moustache'], ['beard', 'Beard'], ['goatee', 'Goatee'], ['sideburns', 'Sideburns']],
  eyes: [['none', 'None'], ['glasses', 'Glasses'], ['round', 'Round glasses'], ['shades', 'Shades'], ['stars', 'Star shades'],
    ['heartshades', 'Heart shades'], ['visor', 'Visor'], ['monocle', 'Monocle']],
  top: [['tee', 'T-shirt'], ['stripe', 'Striped tee'], ['hoodie', 'Hoodie'], ['sweater', 'Sweater'],
    ['jacket', 'Jacket'], ['pjs', 'Pyjamas'], ['overalls', 'Overalls'], ['suit', 'Suit'],
    ['labcoat', 'Lab coat'], ['gown', 'Grad gown'], ['dress', 'Dress'],
    ['polo', 'Polo'], ['jersey', 'Jersey'], ['cardigan', 'Cardigan'], ['singlet', 'Singlet'], ['apron', 'Apron'], ['raincoat', 'Raincoat']],
  bottom: [['pants', 'Trousers'], ['shorts', 'Shorts'], ['skirt', 'Skirt'], ['longskirt', 'Long skirt'],
    ['jeans', 'Ripped jeans'], ['joggers', 'Joggers'], ['culottes', 'Wide pants']],
  hat: [['none', 'None'], ['nightcap', 'Nightcap'], ['cap', 'Cap'], ['beanie', 'Beanie'], ['bucket', 'Bucket hat'],
    ['beret', 'Beret'], ['headband', 'Headband'], ['hijab', 'Hijab'], ['headphones', 'Headphones'],
    ['grad', 'Grad cap'], ['chef', 'Chef hat'], ['crown', 'Crown'], ['bow', 'Bow'], ['flowers', 'Flower crown'],
    ['party', 'Party hat'], ['halo', 'Halo'], ['catears', 'Cat ears'], ['cowboy', 'Cowboy hat'], ['wizard', 'Wizard hat']],
  hold: [['none', 'Nothing'], ['balloon', 'Balloon'], ['wand', 'Star wand'], ['lantern', 'Lantern'],
    ['plane', 'Paper plane'], ['book', 'Book'], ['flowers', 'Flowers'], ['umbrella', 'Umbrella'],
    ['guitar', 'Guitar'], ['mic', 'Microphone'], ['camera', 'Camera'], ['coffee', 'Coffee'],
    ['laptop', 'Laptop'], ['ball', 'Basketball'], ['brush', 'Paintbrush'], ['trophy', 'Trophy'],
    ['bible', 'Bible'], ['bubbletea', 'Bubble tea'], ['phone', 'Phone'], ['sparkler', 'Sparkler'],
    ['heart', 'Heart'], ['plant', 'Plant'], ['football', 'Football'], ['kite', 'Kite']],
  pet: [['none', 'None'], ['cat', 'Cat'], ['dog', 'Dog'], ['bunny', 'Bunny'], ['chick', 'Chick'],
    ['hamster', 'Hamster'], ['frog', 'Frog'], ['bird', 'Bird'], ['fish', 'Goldfish']],
  acc: [['none', 'None'], ['scarf', 'Scarf'], ['necklace', 'Necklace'], ['bowtie', 'Bow tie'], ['tie', 'Tie'],
    ['lanyard', 'Lanyard'], ['medal', 'Medal'], ['backpack', 'Backpack'], ['cape', 'Cape'], ['wings', 'Wings']],
};

// Options whose colour comes from the hat colour swatches.
export const COLOUR_HATS = ['nightcap', 'cap', 'beanie', 'bucket', 'beret', 'headband', 'hijab', 'headphones', 'bow', 'party', 'catears', 'cowboy', 'wizard'];
// Extras whose colour comes from the extras colour swatches.
export const COLOUR_ACC = ['scarf', 'bowtie', 'tie', 'lanyard', 'medal', 'backpack', 'cape'];

export const DEFAULT_LOOK = {
  g: 'm', skin: 2, hair: 'short', hairC: 2, eyeS: 'dot', mouth: 'smile', cheeks: 'blush',
  top: 'tee', topC: 5, bottom: 'pants', botC: 9, shoeC: 0,
  hat: 'none', hatC: 5, eyes: 'none', face: 'none', hold: 'none', pet: 'none', acc: 'none', accC: 0,
};

const has = (key, v) => OPTIONS[key].some(([id]) => id === v);

// Fill in anything missing or unknown, so old or hand-edited looks still draw.
export function normalizeLook(look) {
  const l = { ...DEFAULT_LOOK, ...(look || {}) };
  for (const k of Object.keys(OPTIONS)) if (!has(k, l[k])) l[k] = DEFAULT_LOOK[k];
  const idx = (v, arr, d) => (Number.isInteger(v) && v >= 0 && v < arr.length ? v : d);
  l.skin = idx(l.skin, SKIN, 2);
  l.hairC = idx(l.hairC, HAIR_C, 2);
  l.topC = idx(l.topC, CLOTH, 5);
  l.botC = idx(l.botC, CLOTH, 9);
  l.hatC = idx(l.hatC, CLOTH, 5);
  l.shoeC = idx(l.shoeC, SHOES, 0);
  l.accC = idx(l.accC, CLOTH, 0);
  return l;
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const ids = (key) => OPTIONS[key].map(([id]) => id);
const chance = (p) => Math.random() < p;

export function randomLook(base = {}) {
  const g = base.g || pick(['m', 'f']);
  const hair = g === 'm'
    ? pick(['short', 'spiky', 'side', 'curly', 'buzz', 'mohawk', 'afro', 'bald', 'short', 'side', 'quiff', 'undercut', 'locs'])
    : pick(['long', 'wavy', 'bob', 'pony', 'braid', 'bun', 'twinbuns', 'pigtails', 'curlylong', 'afro', 'long', 'bangs', 'halfup', 'locs']);
  const common = ['tee', 'stripe', 'hoodie', 'sweater', 'jacket', 'pjs', 'overalls', 'labcoat', 'gown', 'polo', 'jersey', 'cardigan', 'apron', 'raincoat'];
  const top = pick(g === 'm' ? [...common, 'suit', 'singlet'] : [...common, 'dress', 'dress']);
  return normalizeLook({
    g, skin: base.skin ?? Math.floor(Math.random() * SKIN.length),
    hair, hairC: base.hairC ?? Math.floor(Math.random() * 7),
    eyeS: chance(0.5) ? 'dot' : pick(ids('eyeS')), mouth: chance(0.5) ? 'smile' : pick(ids('mouth')),
    cheeks: chance(0.6) ? 'blush' : pick(ids('cheeks')),
    top, topC: top === 'gown' ? 9 : Math.floor(Math.random() * CLOTH.length),
    bottom: g === 'f' && chance(0.4) ? pick(['skirt', 'longskirt', 'culottes']) : pick(['pants', 'pants', 'shorts', 'jeans', 'joggers']),
    botC: pick([9, 5, 10, 11, 8, 6, 12]), shoeC: pick([0, 0, 1, 2, 3, 4, 5]),
    hat: top === 'gown' ? 'grad' : chance(0.45) ? pick(ids('hat').slice(1)) : 'none',
    hatC: Math.floor(Math.random() * CLOTH.length),
    eyes: chance(0.25) ? pick(ids('eyes').slice(1)) : 'none',
    face: g === 'm' && chance(0.3) ? pick(['stubble', 'tache', 'beard', 'goatee', 'sideburns']) : 'none',
    hold: pick(ids('hold').slice(1)),
    pet: chance(0.3) ? pick(ids('pet').slice(1)) : 'none',
    acc: chance(0.35) ? pick(ids('acc').slice(1)) : 'none', accC: Math.floor(Math.random() * CLOTH.length),
  });
}

// ---- colour helpers -------------------------------------------------------
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

// ---- grid ------------------------------------------------------------------
function makeGrid() {
  const cells = Array.from({ length: H }, () => Array(W).fill(null));
  const loose = new Map(); // pixels drawn after the outline (thin strings, sparkles)
  const g = {
    set(x, y, c) { if (x >= 0 && y >= 0 && x < W && y < H) cells[y][x] = c; },
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) g.set(x + i, y + j, c); },
    clear(x, y) { if (x >= 0 && y >= 0 && x < W && y < H) cells[y][x] = null; },
    get(x, y) { return cells[y]?.[x] ?? null; },
    loose(x, y, c) { loose.set(`${x},${y}`, [x, y, c]); },
    rows(x, y, rows, map) { // draw from a little ASCII pattern
      rows.forEach((row, j) => [...row].forEach((ch, i) => { if (map[ch]) g.set(x + i, y + j, map[ch]); }));
    },
    cells, looseList: loose,
  };
  return g;
}

function outline(g) {
  const add = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g.cells[y][x]) continue;
    if (g.get(x - 1, y) || g.get(x + 1, y) || g.get(x, y - 1) || g.get(x, y + 1)) add.push([x, y]);
  }
  for (const [x, y] of add) g.cells[y][x] = OL;
}

// ---- body parts ------------------------------------------------------------
// Head x12–27 y12–25 · torso x14–25 y26–33 · arms x12–13 / x26–27 · legs y34–39 · shoes y40–41

function head(g, skin, l) {
  g.rect(12, 12, 16, 14, skin);
  g.clear(12, 12); g.clear(27, 12); g.clear(12, 25); g.clear(27, 25);
  g.rect(11, 19, 1, 2, skin); g.rect(28, 19, 1, 2, skin); // ears
  g.rect(13, 25, 14, 1, shade(skin, -0.12)); // jaw shadow
  if (l.cheeks === 'blush') { g.set(14, 22, shade('#f28c9a', 0.15)); g.set(25, 22, shade('#f28c9a', 0.15)); }
  if (l.cheeks === 'rosy') { const r = shade('#f28c9a', 0.05); g.rect(14, 22, 2, 1, r); g.rect(24, 22, 2, 1, r); }
  if (l.cheeks === 'sparkle') { g.set(14, 22, '#f5c844'); g.set(25, 22, '#f5c844'); g.set(26, 17, '#fff3a8'); }
  if (l.cheeks === 'bandaid') { g.rect(23, 22, 3, 1, '#f0c896'); g.set(24, 22, '#e0a77a'); g.set(14, 22, shade('#f28c9a', 0.15)); }
  if (l.cheeks === 'freckles') { const f = shade(skin, -0.28); g.set(14, 21, f); g.set(15, 22, f); g.set(13, 22, f); g.set(25, 21, f); g.set(24, 22, f); g.set(26, 22, f); }
  mouth(g, l, skin);
}

function mouth(g, l, skin) {
  const dark = shade(skin, -0.45);
  switch (l.mouth) {
    case 'grin': g.rect(18, 23, 4, 1, dark); g.rect(19, 23, 2, 1, '#ffffff'); g.rect(19, 24, 2, 1, dark); break;
    case 'open': g.rect(19, 23, 2, 2, '#7a2f3a'); g.set(19, 24, '#e86a7a'); break;
    case 'tongue': g.rect(18, 23, 4, 1, dark); g.rect(20, 24, 2, 1, '#f27d8a'); break;
    case 'smirk': g.rect(19, 23, 2, 1, dark); g.set(21, 22, dark); break;
    case 'cat': g.set(18, 23, dark); g.set(19, 24, dark); g.set(20, 23, dark); g.set(21, 24, dark); g.set(22, 23, dark); break;
    case 'teeth': g.rect(18, 23, 4, 1, dark); g.rect(19, 24, 2, 1, '#ffffff'); break;
    default: g.rect(19, 23, 2, 1, shade(skin, -0.3));
  }
}

// Eyes. Inside glasses they shrink to a single dot so the lens reads clearly.
function eyesDraw(g, l, inGlasses) {
  const style = l.eyeS;
  for (const [cx, side] of [[16, -1], [23, 1]]) {
    if (inGlasses && !['happy', 'wink', 'sleepy'].includes(style)) { g.set(cx, 20, OL); continue; }
    switch (style) {
      case 'big': g.rect(cx - (side < 0 ? 1 : 0), 19, 2, 2, OL); g.set(cx - (side < 0 ? 1 : 0), 19, '#ffffff'); break;
      case 'happy': g.set(cx - 1, 20, OL); g.set(cx, 19, OL); g.set(cx + 1, 20, OL); break;
      case 'wink':
        if (side > 0) { g.rect(cx - 1, 20, 3, 1, OL); } else { g.rect(cx, 19, 1, 2, OL); }
        break;
      case 'sleepy': g.rect(cx - 1, 20, 3, 1, OL); g.set(cx + side, 21, OL); break;
      case 'hearts': g.rows(cx - 1, 19, ['#.#', '###', '.#.'], { '#': '#e84d5b' }); break;
      case 'starry': g.rows(cx - 1, 19, ['.#.', '#o#', '.#.'], { '#': '#f5c844', o: OL }); break;
      case 'brows': g.rect(cx, 19, 1, 2, OL); g.rect(cx - 1 + (side > 0 ? 1 : 0), 17, 2, 1, OL); g.set(side < 0 ? cx + 1 : cx - 1, 18, OL); break;
      default: g.rect(cx, 19, 1, 2, OL);
    }
    if (l.g === 'f' && !inGlasses && (style === 'dot' || style === 'big')) g.set(cx - 1 + (side > 0 ? 2 : 0) - (side < 0 ? 0 : 0) + (side < 0 ? 0 : -0), 18, OL);
  }
}

function hairBack(g, l, c, d) {
  switch (l.hair) {
    case 'long': g.rect(10, 14, 4, 17, c); g.rect(26, 14, 4, 17, c); g.rect(10, 30, 4, 1, d); g.rect(26, 30, 4, 1, d); break;
    case 'wavy':
      for (let y = 14; y < 32; y++) { const o = Math.floor(y / 3) % 2; g.rect(9 + o, y, 4, 1, c); g.rect(27 - o, y, 4, 1, c); }
      for (let y = 16; y < 32; y += 3) { g.set(11, y, d); g.set(28, y, d); }
      break;
    case 'curlylong':
      g.rect(9, 13, 5, 17, c); g.rect(26, 13, 5, 17, c);
      for (let y = 13; y < 30; y++) for (let x of [9, 10, 11, 12, 13, 26, 27, 28, 29, 30]) if ((x + y) % 3 === 0) g.set(x, y, d);
      break;
    case 'halfup': g.rect(10, 14, 4, 12, c); g.rect(26, 14, 4, 12, c); g.rect(17, 7, 6, 4, c); g.set(19, 8, shade(c, 0.25)); break;
    case 'bangs': g.rect(10, 14, 4, 15, c); g.rect(26, 14, 4, 15, c); g.rect(10, 28, 4, 1, d); g.rect(26, 28, 4, 1, d); break;
    case 'locs':
      for (const x of [9, 11, 27, 29]) for (let y = 13; y < 31; y++) g.set(x, y, (y + x) % 3 ? c : d);
      for (const x of [10, 28]) for (let y = 13; y < 29; y++) g.set(x, y, (y + x) % 3 ? c : d);
      break;
    case 'pony': g.rect(28, 14, 3, 11, c); g.rect(29, 25, 2, 2, c); g.set(28, 15, '#f27db3'); g.set(29, 15, '#f27db3'); break;
    case 'pigtails':
      g.rect(7, 16, 4, 9, c); g.rect(29, 16, 4, 9, c); g.rect(8, 25, 2, 1, c); g.rect(30, 25, 2, 1, c);
      g.rect(9, 15, 2, 2, '#f27db3'); g.rect(29, 15, 2, 2, '#f27db3');
      break;
    case 'bun': g.rect(17, 6, 6, 5, c); g.clear(17, 6); g.clear(22, 6); g.rect(18, 10, 4, 1, '#f27db3'); g.set(19, 7, shade(c, 0.25)); break;
    case 'twinbuns':
      for (const x of [10, 25]) { g.rect(x, 7, 5, 5, c); g.clear(x, 7); g.clear(x + 4, 7); g.set(x + 1, 8, shade(c, 0.25)); }
      break;
    case 'afro': {
      for (let y = 3; y < 24; y++) for (let x = 8; x < 32; x++) {
        const dx = (x - 19.5) / 12, dy = (y - 13) / 10;
        if (dx * dx + dy * dy <= 1) g.set(x, y, (x * 3 + y * 2) % 5 === 0 ? d : c);
      }
      break;
    }
  }
}

function hairFront(g, l, c, d, hl) {
  const top = () => {
    g.rect(13, 10, 14, 1, c); g.rect(12, 11, 16, 4, c);
    g.rect(12, 15, 2, 3, c); g.rect(26, 15, 2, 3, c);
    g.set(15, 15, c); g.set(20, 15, c); g.set(21, 15, c); g.set(24, 15, c);
    g.rect(16, 11, 4, 1, hl);
  };
  const curls = (bottom) => {
    g.rect(12, 9, 16, 1, c); g.rect(11, 10, 18, 5, c); g.rect(11, 15, 3, bottom - 15, c); g.rect(26, 15, 3, bottom - 15, c);
    g.clear(11, 10); g.clear(28, 10);
    for (let y = 9; y < bottom; y++) for (let x = 11; x < 29; x++) if (g.get(x, y) === c && (x * 2 + y) % 4 === 0) g.set(x, y, hl);
    for (let x = 12; x < 28; x += 2) g.set(x, 8, c);
  };
  switch (l.hair) {
    case 'short': top(); break;
    case 'spiky':
      top(); for (let x = 13; x <= 25; x += 3) { g.rect(x, 8, 2, 2, c); g.set(x, 8, hl); }
      g.set(17, 15, c); g.set(23, 15, c);
      break;
    case 'side': top(); g.rect(12, 15, 8, 1, c); g.rect(12, 16, 5, 1, c); g.rect(22, 11, 1, 2, d); break;
    case 'curly': curls(18); break;
    case 'buzz': g.rect(13, 11, 14, 1, d); g.rect(12, 12, 16, 2, d); g.rect(12, 14, 1, 2, d); g.rect(27, 14, 1, 2, d);
      for (let x = 13; x < 27; x += 2) g.set(x, 12, c);
      break;
    case 'mohawk':
      g.rect(12, 12, 16, 2, d); for (let x = 12; x < 28; x += 2) g.set(x, 13, shade(d, 0.15));
      g.rect(18, 5, 4, 8, c); g.rect(19, 4, 2, 1, c); g.rect(19, 5, 1, 7, hl);
      for (let y = 6; y < 12; y += 2) { g.set(17, y, c); g.set(22, y + 1, c); }
      break;
    case 'afro':
      for (let x = 13; x < 27; x++) g.set(x, 13, (x % 3) ? c : d);
      g.rect(12, 14, 2, 4, c); g.rect(26, 14, 2, 4, c);
      break;
    case 'bald': break;
    case 'long': case 'wavy': case 'pony': case 'bun': case 'twinbuns': case 'pigtails':
      top(); g.rect(12, 15, 1, 5, c); g.rect(27, 15, 1, 5, c); break;
    case 'braid':
      top(); g.rect(12, 15, 1, 4, c);
      for (let y = 16; y < 31; y += 2) { g.rect(26, y, 3, 2, c); g.set(27, y + 1, d); }
      g.rect(26, 30, 3, 1, '#f27db3'); g.rect(27, 31, 1, 2, c);
      break;
    case 'bob':
      top(); g.rect(11, 13, 3, 10, c); g.rect(26, 13, 3, 10, c); g.rect(11, 22, 3, 1, d); g.rect(26, 22, 3, 1, d);
      g.rect(14, 15, 12, 1, c); g.clear(17, 15); g.clear(22, 15);
      break;
    case 'curlylong': curls(20); break;
    case 'quiff':
      top(); g.rect(14, 8, 10, 2, c); g.rect(13, 9, 3, 2, c); g.rect(22, 7, 3, 2, c); g.rect(15, 8, 5, 1, hl); g.set(23, 7, hl);
      break;
    case 'undercut':
      g.rect(13, 8, 14, 4, c); g.rect(12, 11, 16, 2, c); g.rect(12, 13, 1, 3, d); g.rect(27, 13, 1, 3, d);
      g.rect(13, 13, 9, 1, c); g.rect(13, 14, 5, 1, c); g.rect(16, 9, 7, 1, hl);
      break;
    case 'bangs': top(); g.rect(12, 15, 16, 2, c); g.rect(12, 17, 1, 5, c); g.rect(27, 17, 1, 5, c); g.set(16, 16, d); g.set(23, 16, d); break;
    case 'halfup': top(); g.rect(12, 15, 1, 5, c); g.rect(27, 15, 1, 5, c); break;
    case 'locs':
      top(); g.rect(12, 15, 1, 6, c); g.rect(27, 15, 1, 6, c);
      for (let x = 13; x < 27; x += 3) { g.set(x, 15, c); g.set(x, 16, d); }
      break;
  }
}

function faceHair(g, l, c, skin) {
  if (l.face === 'stubble') { const s = shade(skin, -0.22); for (let y = 22; y < 26; y++) for (let x = 14; x < 26; x++) if ((x + y) % 2 === 0 && !(y === 23 && (x === 19 || x === 20))) g.set(x, y, s); }
  if (l.face === 'tache') { g.rect(17, 22, 6, 1, c); g.set(16, 23, c); g.set(23, 23, c); }
  if (l.face === 'goatee') { g.rect(19, 24, 2, 2, c); g.rect(18, 25, 4, 1, c); g.rect(18, 22, 4, 1, c); }
  if (l.face === 'sideburns') { g.rect(12, 16, 2, 7, c); g.rect(26, 16, 2, 7, c); }
  if (l.face === 'beard') { g.rect(12, 21, 16, 4, c); g.rect(14, 25, 12, 1, c); g.rect(17, 26, 6, 1, c); g.rect(18, 23, 4, 1, shade(skin, -0.3)); g.rect(18, 22, 4, 1, skin); }
}

// Glasses: a 5×5 frame with a 3×3 tinted lens and a glint; the eye becomes a dot inside.
function eyewear(g, l) {
  if (l.eyes === 'glasses' || l.eyes === 'round') {
    const frame = l.eyes === 'round' ? '#b5822a' : OL;
    for (const x0 of [14, 21]) {
      g.rect(x0, 18, 5, 5, frame); g.rect(x0 + 1, 19, 3, 3, '#d7ecf7'); g.set(x0 + 1, 19, '#ffffff');
      if (l.eyes === 'round') { g.clear(x0, 18); g.clear(x0 + 4, 18); g.clear(x0, 22); g.clear(x0 + 4, 22); }
    }
    g.rect(19, 19, 2, 1, frame);
    eyesDraw(g, l, true);
    return;
  }
  eyesDraw(g, l, false);
  if (l.eyes === 'shades') {
    g.rect(14, 18, 5, 3, '#1b1428'); g.rect(21, 18, 5, 3, '#1b1428'); g.rect(19, 18, 2, 1, '#1b1428');
    g.set(15, 18, '#7a6fa0'); g.set(22, 18, '#7a6fa0');
  }
  if (l.eyes === 'heartshades') {
    for (const x0 of [14, 21]) g.rows(x0, 17, ['##.##', '#####', '.###.', '..#..'], { '#': '#e84d5b' });
    g.rect(19, 18, 2, 1, '#e84d5b'); g.set(15, 17, '#ffb0b5'); g.set(22, 17, '#ffb0b5');
  }
  if (l.eyes === 'visor') { g.rect(12, 18, 16, 3, '#3cc0c0'); g.rect(13, 18, 14, 1, '#9ff0e8'); g.rect(12, 20, 16, 1, '#2a9a9a'); }
  if (l.eyes === 'monocle') {
    g.rows(21, 18, ['.###.', '#...#', '#...#', '#...#', '.###.'], { '#': '#d19a22' });
    g.rect(22, 19, 3, 3, '#d7ecf7'); g.set(22, 19, '#ffffff'); g.set(23, 20, OL);
    for (const [x, y] of [[25, 23], [26, 24], [26, 25], [27, 26]]) g.loose(x, y, '#d19a22');
  }
  if (l.eyes === 'stars') {
    for (const x0 of [14, 21]) g.rows(x0, 17, ['..#..', '#####', '.###.', '##.##'], { '#': '#f27db3' });
    g.rect(19, 19, 2, 1, '#f27db3'); g.set(16, 18, '#ffd6e5'); g.set(23, 18, '#ffd6e5');
  }
}

function hat(g, l) {
  const c = CLOTH[l.hatC], d = shade(c, -0.22), lt = shade(c, 0.3);
  switch (l.hat) {
    case 'nightcap':
      g.rect(12, 6, 16, 5, c); g.rect(15, 4, 12, 2, c); g.rect(22, 3, 7, 1, c); g.rect(28, 4, 2, 3, c);
      g.rect(12, 9, 16, 1, d); g.set(17, 7, '#f5c844'); g.set(23, 5, '#f5c844'); g.set(14, 6, '#f5c844');
      g.rect(11, 10, 18, 2, '#f4f1ea'); g.rect(29, 6, 3, 3, '#f4f1ea');
      break;
    case 'cap': g.rect(13, 8, 14, 4, c); g.rect(12, 10, 16, 2, c); g.rect(8, 11, 9, 2, d); g.rect(19, 7, 2, 1, d); g.rect(15, 9, 3, 1, lt); break;
    case 'beanie':
      g.rect(13, 7, 14, 4, c); g.rect(12, 9, 16, 2, c); g.rect(11, 11, 18, 2, d);
      for (let x = 12; x < 29; x += 2) g.set(x, 12, lt);
      g.rect(19, 5, 2, 2, '#f4f1ea');
      break;
    case 'bucket': g.rect(14, 6, 12, 5, c); g.rect(10, 11, 20, 2, d); g.rect(14, 9, 12, 1, lt); break;
    case 'beret': g.rect(12, 8, 15, 2, c); g.rect(11, 10, 18, 2, c); g.rect(12, 11, 16, 1, d); g.set(20, 7, d); g.rect(14, 9, 4, 1, lt); break;
    case 'headband': g.rect(12, 13, 16, 2, c); g.rect(12, 14, 16, 1, d); g.rect(26, 11, 3, 3, c); g.set(27, 12, lt); break;
    case 'hijab':
      for (let y = 8; y < 29; y++) for (let x = 9; x < 31; x++) {
        const face = x >= 14 && x <= 25 && y >= 15 && y <= 24 && !((x === 14 || x === 25) && (y === 15 || y === 24));
        const oval = ((x - 19.5) / 10.5) ** 2 + ((y - 16.5) / 8.5) ** 2 <= 1;
        const drape = (y >= 22 && y <= 27 && x >= 11 && x <= 28) || (y === 28 && x >= 14 && x <= 25);
        if ((oval || drape) && !face) g.set(x, y, x <= 11 || x >= 28 || y >= 27 ? d : c);
      }
      g.rect(14, 14, 12, 1, d); g.rect(13, 10, 4, 1, lt);
      break;
    case 'headphones':
      g.rect(12, 9, 16, 2, '#3a3550'); g.rect(11, 11, 2, 4, '#3a3550'); g.rect(27, 11, 2, 4, '#3a3550');
      g.rect(9, 15, 4, 6, c); g.rect(27, 15, 4, 6, c); g.rect(10, 16, 1, 4, lt); g.rect(29, 16, 1, 4, lt);
      break;
    case 'grad':
      g.rect(13, 9, 14, 3, '#2b2440'); g.rect(9, 7, 22, 2, '#3a3550'); g.rect(11, 6, 18, 1, '#3a3550'); g.set(20, 6, '#f5c844');
      for (let y = 7; y < 15; y++) g.loose(29, y, '#f5c844');
      g.rect(28, 14, 3, 2, '#f5c844');
      break;
    case 'chef':
      g.rect(13, 5, 14, 7, '#ffffff'); g.rect(12, 4, 5, 3, '#ffffff'); g.rect(18, 3, 5, 3, '#ffffff'); g.rect(23, 4, 5, 3, '#ffffff');
      g.rect(13, 10, 14, 2, '#e6e0ef'); g.set(16, 6, '#e6e0ef'); g.set(22, 6, '#e6e0ef');
      break;
    case 'crown':
      g.rect(13, 8, 14, 3, '#f5c844'); g.rect(13, 6, 2, 2, '#f5c844'); g.rect(19, 5, 2, 3, '#f5c844'); g.rect(25, 6, 2, 2, '#f5c844');
      g.rect(13, 10, 14, 1, '#d19a22'); g.set(16, 9, '#e84d5b'); g.set(20, 9, '#4a7be0'); g.set(24, 9, '#4fbf8b');
      break;
    case 'bow': g.rect(22, 8, 3, 4, c); g.rect(27, 8, 3, 4, c); g.rect(25, 9, 2, 2, d); g.set(23, 9, lt); break;
    case 'party':
      g.rows(16, 2, ['...#...', '..#o#..', '..###..', '.##o##.', '.#####.', '##o###o', '#######', '##o##o#'], { '#': c, o: '#f5c844' });
      g.rect(19, 0, 1, 2, '#f4f1ea'); g.rect(18, 1, 3, 1, '#f4f1ea');
      break;
    case 'halo':
      for (let x = 16; x < 24; x++) { g.loose(x, 4, '#ffe58a'); g.loose(x, 7, '#ffe58a'); }
      for (const x of [15, 24]) { g.loose(x, 5, '#ffe58a'); g.loose(x, 6, '#ffe58a'); }
      g.loose(17, 5, '#fff6c8'); g.loose(18, 5, '#fff6c8');
      break;
    case 'catears':
      g.rows(12, 6, ['#...', '##..', '#p#.', '#pp#'], { '#': c, p: '#f8b8cc' });
      g.rows(24, 6, ['...#', '..##', '.#p#', '#pp#'], { '#': c, p: '#f8b8cc' });
      break;
    case 'cowboy':
      g.rect(13, 5, 14, 5, c); g.clear(18, 5); g.clear(19, 5); g.clear(20, 5); g.clear(21, 5); g.rect(19, 6, 2, 1, d);
      g.rect(13, 9, 14, 1, '#3a2b2b'); g.rect(8, 10, 24, 2, d); g.set(7, 9, d); g.set(32, 9, d); g.rect(15, 6, 2, 2, lt);
      break;
    case 'wizard':
      g.rows(14, 1, ['.......##...', '......###...', '......####..', '.....####...', '.....#####..', '....######..', '....#######.', '...########.', '.##########.', '############'], { '#': c });
      g.rect(9, 11, 22, 2, d); g.set(19, 6, '#f5c844'); g.set(22, 9, '#f5c844'); g.set(17, 9, '#fff3a8'); g.rect(14, 10, 12, 1, '#f5c844');
      break;
    case 'flowers': {
      const cols = ['#f27db3', '#f5c844', '#f4f1ea', '#e84d5b'];
      for (let i = 0, x = 12; x < 28; x += 3, i++) { g.rect(x, 10, 2, 2, cols[i % 4]); g.set(x + 2, 11, '#4fbf8b'); }
      break;
    }
  }
}

function body(g, l, skin) {
  const tc = CLOTH[l.topC], td = shade(tc, -0.2), bc = CLOTH[l.botC], bd = shade(bc, -0.2);
  const sc = SHOES[l.shoeC];
  const dress = l.top === 'dress';
  const legsBare = dress || ['skirt', 'shorts', 'longskirt'].includes(l.bottom);

  // legs + shoes
  const legC = legsBare ? skin : bc;
  g.rect(15, 34, 4, 6, legC); g.rect(21, 34, 4, 6, legC);
  g.rect(15, 34, 10, 2, legC);
  g.rect(14, 40, 5, 2, sc); g.rect(21, 40, 5, 2, sc);
  g.rect(14, 41, 5, 1, shade(sc, -0.3)); g.rect(21, 41, 5, 1, shade(sc, -0.3));
  if (!legsBare) { g.rect(19, 35, 2, 1, bd); g.rect(18, 34, 1, 6, bd); g.rect(24, 34, 1, 6, bd); }
  if (l.bottom === 'shorts' && !dress) { g.rect(15, 34, 10, 3, bc); g.rect(18, 34, 1, 3, bd); g.rect(19, 36, 2, 1, null); }
  if (l.bottom === 'skirt' && !dress) { g.rect(14, 33, 12, 3, bc); g.rect(13, 35, 14, 1, bc); g.rect(13, 36, 14, 1, bd); }
  if (l.bottom === 'jeans' && !dress) { const r = shade(bc, 0.45); g.rect(16, 37, 2, 1, r); g.rect(22, 36, 2, 1, r); g.set(16, 38, skin); }
  if (l.bottom === 'joggers' && !dress) { g.rect(15, 39, 4, 1, bd); g.rect(21, 39, 4, 1, bd); g.rect(15, 34, 1, 5, '#f4f1ea'); g.rect(24, 34, 1, 5, '#f4f1ea'); }
  if (l.bottom === 'culottes' && !dress) { g.rect(14, 34, 5, 6, bc); g.rect(21, 34, 5, 6, bc); g.rect(15, 34, 10, 2, bc); g.rect(14, 39, 5, 1, bd); g.rect(21, 39, 5, 1, bd); g.clear(19, 37); g.clear(20, 37); g.clear(19, 38); g.clear(20, 38); g.clear(19, 39); g.clear(20, 39); }
  if (l.bottom === 'longskirt' && !dress) {
    for (let y = 33; y < 40; y++) { const w = 12 + Math.floor((y - 33) / 2) * 2; g.rect(20 - w / 2, y, w, 1, bc); }
    for (let y = 35; y < 40; y += 2) g.set(17, y, bd); g.rect(14, 39, 12, 1, bd);
  }

  // torso
  g.rect(14, 26, 12, 8, tc);
  g.rect(25, 27, 1, 7, td);
  g.rect(17, 26, 6, 1, td); // neck shadow
  const longSleeve = ['hoodie', 'sweater', 'pjs', 'suit', 'jacket', 'labcoat', 'gown', 'cardigan', 'raincoat'].includes(l.top);
  const sleeveC = l.top === 'labcoat' ? '#f4f1ea' : tc;
  for (const x of [12, 26]) {
    g.rect(x, 26, 2, longSleeve ? 5 : 2, x === 26 ? shade(sleeveC, -0.12) : sleeveC);
    g.rect(x, longSleeve ? 31 : 28, 2, longSleeve ? 2 : 5, skin);
  }
  g.rect(12, 32, 2, 1, shade(skin, -0.12)); g.rect(26, 32, 2, 1, shade(skin, -0.12));

  switch (l.top) {
    case 'stripe': { const s = l.topC === 8 ? '#4a7be0' : '#f4f1ea'; for (let y = 27; y < 34; y += 2) g.rect(14, y, 12, 1, s); for (const x of [12, 13, 26, 27]) g.set(x, 27, s); break; }
    case 'hoodie': g.rect(15, 26, 10, 1, td); g.rect(17, 30, 6, 2, td); g.set(18, 27, '#f4f1ea'); g.set(21, 27, '#f4f1ea'); break;
    case 'sweater': { const s = l.topC === 8 ? '#e84d5b' : '#f4f1ea'; for (let x = 14; x < 26; x++) if (x % 2 === 0) g.set(x, 29, s); g.rect(14, 33, 12, 1, td); break; }
    case 'jacket': g.rect(18, 26, 4, 8, '#f4f1ea'); g.rect(17, 26, 1, 8, td); g.rect(22, 26, 1, 8, td); g.rect(16, 26, 1, 2, td); g.rect(23, 26, 1, 2, td); g.set(15, 30, td); break;
    case 'pjs': {
      for (let y = 27; y < 34; y += 2) g.rect(14, y, 12, 1, shade(tc, 0.35));
      g.rect(19, 27, 1, 6, td); g.set(20, 28, '#f4f1ea'); g.set(20, 31, '#f4f1ea');
      if (!legsBare) { g.rect(15, 34, 4, 6, tc); g.rect(21, 34, 4, 6, tc); g.rect(15, 34, 10, 2, tc); for (let y = 35; y < 40; y += 2) { g.rect(15, y, 4, 1, shade(tc, 0.35)); g.rect(21, y, 4, 1, shade(tc, 0.35)); } }
      break;
    }
    case 'overalls': g.rect(16, 29, 8, 5, bc); g.rect(16, 26, 1, 3, bc); g.rect(23, 26, 1, 3, bc); g.set(16, 28, '#f5c844'); g.set(23, 28, '#f5c844'); g.rect(18, 31, 4, 1, bd);
      if (legsBare && l.bottom !== 'skirt' && l.bottom !== 'longskirt') { g.rect(15, 34, 10, 2, bc); }
      break;
    case 'suit': g.rect(18, 26, 4, 4, '#f4f1ea'); g.rect(19, 27, 2, 4, '#e84d5b'); g.rect(17, 27, 1, 4, td); g.rect(22, 27, 1, 4, td); g.set(16, 31, '#d8d3e4'); break;
    case 'labcoat':
      g.rect(14, 26, 12, 8, '#f4f1ea'); g.rect(18, 26, 4, 5, tc); g.rect(25, 27, 1, 7, '#d8d3e4');
      g.rect(14, 34, 4, 3, '#f4f1ea'); g.rect(22, 34, 4, 3, '#f4f1ea'); g.rect(17, 26, 1, 10, '#d8d3e4'); g.rect(22, 26, 1, 10, '#d8d3e4');
      g.rect(15, 30, 2, 2, '#d8d3e4'); g.set(23, 29, '#4a7be0');
      break;
    case 'gown':
      g.rect(14, 26, 12, 8, tc); g.rect(13, 34, 14, 4, tc); g.rect(13, 37, 14, 1, td);
      g.rect(18, 26, 4, 2, '#f4f1ea'); g.set(19, 28, '#f4f1ea'); g.set(20, 28, '#f4f1ea');
      g.rect(11, 28, 3, 4, tc); g.rect(26, 28, 3, 4, shade(tc, -0.12)); g.rect(17, 29, 1, 8, td); g.rect(22, 29, 1, 8, td);
      break;
    case 'dress':
      g.rect(14, 33, 12, 1, tc); g.rect(13, 34, 14, 2, tc); g.rect(12, 36, 16, 1, tc); g.rect(12, 36, 16, 1, td);
      g.rect(14, 30, 12, 1, td); for (let x = 14; x < 27; x += 3) g.set(x, 35, shade(tc, 0.3));
      break;
    case 'polo': g.rect(16, 26, 3, 1, '#f4f1ea'); g.rect(21, 26, 3, 1, '#f4f1ea'); g.rect(19, 26, 2, 3, td); g.set(19, 27, '#f4f1ea'); break;
    case 'jersey':
      g.rows(18, 28, ['####', '...#', '..#.', '.#..'], { '#': '#f4f1ea' });
      g.rect(12, 27, 2, 1, '#f4f1ea'); g.rect(26, 27, 2, 1, '#f4f1ea'); g.rect(17, 26, 6, 1, '#f4f1ea');
      break;
    case 'cardigan':
      g.rect(18, 26, 4, 8, '#f4f1ea'); g.rect(17, 26, 1, 8, td); g.rect(22, 26, 1, 8, td);
      for (const y of [28, 30, 32]) g.set(16, y, '#f5c844');
      break;
    case 'singlet':
      g.rect(12, 26, 2, 2, skin); g.rect(26, 26, 2, 2, skin); g.set(14, 26, skin); g.set(25, 26, skin); g.rect(17, 26, 6, 1, skin); g.rect(18, 27, 4, 1, skin);
      break;
    case 'apron':
      g.rect(17, 26, 6, 3, '#f4f1ea'); g.rect(16, 29, 8, 6, '#f4f1ea'); g.rect(14, 29, 2, 1, '#d8d3e4'); g.rect(24, 29, 2, 1, '#d8d3e4');
      g.rect(18, 31, 4, 2, '#d8d3e4'); g.set(19, 27, '#e84d5b'); g.set(20, 27, '#e84d5b');
      break;
    case 'raincoat':
      g.rect(14, 33, 12, 3, tc); g.rect(25, 33, 1, 3, td); g.rect(14, 35, 12, 1, td);
      for (const y of [28, 30, 32]) g.set(20, y, '#f5c844');
      g.rect(15, 26, 3, 1, td); g.rect(22, 26, 3, 1, td); g.rect(19, 26, 1, 10, td);
      break;
    default: break; // tee
  }
  if (!['dress', 'labcoat', 'gown', 'raincoat', 'apron'].includes(l.top) && !['skirt', 'longskirt'].includes(l.bottom)) {
    g.rect(14, 33, 12, 1, l.top === 'pjs' ? td : shade(bc, -0.35));
  }
}

// Props are held in the right hand (x26–27, y31–32). Thin details go in `loose`
// so they stay 1px wide instead of getting outlined.
function prop(g, l, skin) {
  const handAgain = () => { g.rect(26, 31, 2, 2, skin); };
  switch (l.hold) {
    case 'balloon': {
      const c = '#e84d5b';
      for (let i = 0; i <= 20; i++) { const y = 31 - i, x = 27 + Math.round((i / 20) * 6 + Math.sin(i / 3)); g.loose(x, y, '#f4f1ea'); }
      g.rows(29, 1, ['..####..', '.######.', '########', '########', '########', '########', '.######.', '..####..', '...##...'], { '#': c });
      g.set(31, 2, '#ffb0b5'); g.set(30, 3, '#ffb0b5'); g.set(30, 4, '#ffb0b5');
      break;
    }
    case 'wand':
      g.rect(28, 21, 1, 11, '#8a5a3b');
      g.rows(25, 14, ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.'], { '#': '#f5c844' });
      g.set(28, 16, '#fff3a8');
      g.loose(23, 13, '#fff3a8'); g.loose(33, 15, '#fff3a8'); g.loose(32, 11, '#ffffff'); g.loose(24, 19, '#ffffff');
      handAgain();
      break;
    case 'lantern':
      g.rect(28, 31, 4, 1, '#3a2b2b'); g.rect(27, 32, 6, 1, '#5a4636');
      g.rect(27, 33, 6, 5, '#ffd760'); g.rect(29, 34, 2, 3, '#fff6c8'); g.rect(27, 38, 6, 1, '#5a4636');
      g.loose(34, 34, '#fff3a8'); g.loose(25, 36, '#fff3a8'); g.loose(35, 31, '#fff6c8');
      handAgain();
      break;
    case 'plane':
      g.rows(27, 25, ['.###.......', '.######....', '.#########.', '..#####....', '...###.....'], { '#': '#f4f1ea' });
      g.rect(29, 28, 5, 1, '#c9cfe3'); g.rect(30, 29, 3, 1, '#c9cfe3');
      handAgain();
      break;
    case 'book':
      g.rect(26, 27, 8, 8, '#8a5cd6'); g.rect(27, 28, 6, 6, '#a47ce6'); g.rect(26, 27, 1, 8, '#5d3aa3');
      g.rows(28, 29, ['.#.', '###', '.#.'], { '#': '#f5c844' });
      g.rect(34, 28, 1, 6, '#f4f1ea');
      handAgain();
      break;
    case 'flowers':
      g.rect(27, 24, 1, 8, '#3b9a5c'); g.rect(29, 22, 1, 10, '#3b9a5c'); g.rect(31, 25, 1, 6, '#3b9a5c');
      g.rows(25, 21, ['.#.', '#o#', '.#.'], { '#': '#f27db3', o: '#f5c844' });
      g.rows(28, 19, ['.#.', '#o#', '.#.'], { '#': '#f5c844', o: '#e84d5b' });
      g.rows(30, 22, ['.#.', '#o#', '.#.'], { '#': '#e84d5b', o: '#f5c844' });
      handAgain();
      break;
    case 'umbrella': {
      g.rect(29, 6, 1, 26, '#5a4a6a');
      g.rect(28, 32, 1, 1, '#5a4a6a');
      const rows = ['......#####......', '...###########...', '.###############.', '#################', '#..#..#..#..#..##'];
      rows.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === '#') g.set(21 + i, 1 + j, Math.floor(i / 3) % 2 ? '#f4f1ea' : '#8a5cd6');
      }));
      g.set(29, 0, '#5a4a6a');
      handAgain();
      break;
    }
    case 'guitar':
      for (let i = 0; i < 9; i++) g.set(31 + Math.floor(i * 0.7), 29 - i, '#6b4a33');
      g.rect(36, 19, 2, 2, '#3a2b2b');
      g.rows(25, 29, ['.####.', '######', '.####.', '######', '######', '.####.'], { '#': '#d8873f' });
      g.rect(27, 31, 2, 2, '#3a2b2b'); g.rect(26, 34, 4, 1, '#b5682a');
      break;
    case 'mic':
      g.rect(28, 27, 1, 5, '#3a3550');
      g.rows(27, 23, ['.##.', '####', '####', '.##.'], { '#': '#c9c6d6' });
      g.set(28, 24, '#8f8aa3'); g.set(29, 25, '#8f8aa3'); g.rect(27, 27, 3, 1, '#5a4a6a');
      g.loose(32, 22, '#f5c844'); g.loose(33, 25, '#f5c844');
      handAgain();
      break;
    case 'camera':
      g.rect(25, 28, 10, 6, '#3a3550'); g.rect(26, 27, 3, 1, '#3a3550');
      g.rows(28, 29, ['.###.', '##o##', '.###.'], { '#': '#7d8597', o: '#1b1428' });
      g.set(33, 29, '#ffffff'); g.rect(25, 30, 10, 1, '#5a4a6a');
      break;
    case 'coffee':
      g.rect(26, 28, 5, 6, '#f4f1ea'); g.rect(26, 30, 5, 2, '#c8783a'); g.rect(25, 27, 7, 1, '#6b4a33');
      g.loose(28, 24, '#d8d3e4'); g.loose(29, 25, '#d8d3e4'); g.loose(28, 26, '#d8d3e4');
      handAgain();
      break;
    case 'laptop':
      g.rect(25, 23, 12, 8, '#3a3550'); g.rect(26, 24, 10, 6, '#7fb3ff'); g.rect(27, 25, 4, 1, '#d7ecf7'); g.rect(27, 27, 6, 1, '#d7ecf7');
      g.rect(24, 31, 14, 2, '#b7b4c0'); g.set(30, 32, '#8f8aa3');
      break;
    case 'ball':
      g.rows(26, 26, ['.#####.', '#######', '#######', '#######', '#######', '#######', '.#####.'], { '#': '#f08a3c' });
      g.rect(26, 29, 7, 1, '#9a4a1f'); g.rect(29, 26, 1, 7, '#9a4a1f');
      break;
    case 'brush':
      for (let i = 0; i < 8; i++) g.set(27 + i, 31 - i, '#c8783a');
      g.set(35, 23, '#b7b4c0'); g.set(36, 22, '#b7b4c0'); g.rect(36, 20, 2, 2, '#e84d5b'); g.set(38, 19, '#e84d5b');
      g.loose(33, 18, '#f5c844'); g.loose(37, 25, '#4a7be0');
      handAgain();
      break;
    case 'bible':
      g.rect(26, 27, 8, 8, '#3a2b2b'); g.rect(27, 28, 6, 6, '#5a3a2a'); g.rect(34, 28, 1, 6, '#f4f1ea');
      g.rows(29, 28, ['.#.', '###', '.#.', '.#.'], { '#': '#f5c844' }); g.rect(32, 34, 1, 2, '#e84d5b');
      handAgain();
      break;
    case 'bubbletea':
      g.rect(27, 25, 6, 8, '#f3e2c4'); g.rect(26, 24, 8, 1, '#f4f1ea'); g.rect(31, 19, 1, 5, '#f27db3');
      for (const [x, y] of [[28, 31], [30, 31], [32, 31], [29, 30], [31, 30]]) g.set(x, y, '#3a2b2b');
      g.rect(27, 26, 6, 1, '#e3c79a');
      handAgain();
      break;
    case 'phone':
      g.rect(27, 24, 5, 8, '#3a3550'); g.rect(28, 25, 3, 5, '#7fb3ff'); g.set(28, 25, '#d7ecf7'); g.set(29, 31, '#8f8aa3');
      handAgain();
      break;
    case 'sparkler':
      for (let i = 0; i < 9; i++) g.loose(28 + Math.floor(i / 2), 31 - i, '#9a96a8');
      for (const [x, y, c] of [[32, 21, '#ffffff'], [31, 20, '#fff3a8'], [33, 20, '#f5c844'], [34, 22, '#fff3a8'], [30, 22, '#f5c844'], [32, 19, '#f5c844'], [35, 19, '#fff3a8'], [29, 19, '#ffffff'], [34, 24, '#f08a3c']]) g.loose(x, y, c);
      handAgain();
      break;
    case 'heart':
      g.rows(26, 24, ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'], { '#': '#e84d5b' });
      g.set(27, 25, '#ffb0b5'); g.set(28, 25, '#ffb0b5');
      handAgain();
      break;
    case 'plant':
      g.rows(26, 20, ['..#..#.', '.##.##.', '###.###', '.#####.', '...#...', '...#...'], { '#': '#3b9a5c' });
      g.set(27, 22, '#6fd08a'); g.set(31, 21, '#6fd08a');
      g.rect(25, 26, 9, 1, '#a35f2c'); g.rect(26, 27, 7, 6, '#c8783a'); g.rect(27, 28, 2, 1, '#e09a5a');
      break;
    case 'football':
      g.rows(26, 26, ['.#####.', '###o###', '#o###o#', '#######', '##o#o##', '#######', '.#####.'], { '#': '#f4f1ea', o: '#3a3550' });
      break;
    case 'kite':
      for (let i = 0; i < 20; i++) g.loose(28 + Math.round(i * 0.25), 31 - i, '#f4f1ea');
      g.rows(30, 1, ['...#...', '..#o#..', '.##o##.', '###o###', '.##o##.', '..#o#..', '...#...'], { '#': '#f27db3', o: '#f5c844' });
      for (const [x, y, c] of [[33, 8, '#4a7be0'], [34, 9, '#4a7be0'], [35, 10, '#4fbf8b'], [36, 11, '#4fbf8b']]) g.loose(x, y, c);
      handAgain();
      break;
    case 'trophy':
      g.rows(25, 22, ['#########', '#.#####.#', '#.#####.#', '..#####..', '...###...', '....#....', '...###...', '..#####..'], { '#': '#f5c844' });
      g.rect(27, 23, 1, 3, '#fff3a8'); g.rect(27, 29, 5, 1, '#d19a22');
      break;
  }
}

// Extras drawn behind the body (capes, wings, backpacks).
function accBack(g, l) {
  const c = CLOTH[l.accC], d = shade(c, -0.25);
  switch (l.acc) {
    case 'cape': g.rect(11, 26, 18, 14, c); g.rect(11, 26, 1, 14, d); g.rect(28, 26, 1, 14, d); g.rect(11, 39, 18, 1, d); break;
    case 'wings': {
      const rows = ['......###', '....#####', '..#######', '.########', '#########', '.########', '..#######', '...######', '.....####'];
      g.rows(2, 19, rows, { '#': '#f4f1ea' });
      g.rows(29, 19, rows.map((r) => [...r].reverse().join('')), { '#': '#f4f1ea' });
      for (const y of [22, 24, 26]) { g.rect(4, y, 5, 1, '#d8d3e4'); g.rect(31, y, 5, 1, '#d8d3e4'); }
      break;
    }
    case 'backpack': g.rect(10, 27, 3, 8, c); g.rect(27, 27, 3, 8, c); g.rect(10, 31, 3, 1, d); g.rect(27, 31, 3, 1, d); break;
  }
}

// Extras worn on the front.
function accFront(g, l) {
  const c = CLOTH[l.accC], d = shade(c, -0.25), lt = shade(c, 0.3);
  switch (l.acc) {
    case 'scarf': g.rect(14, 25, 12, 2, c); g.rect(14, 25, 12, 1, lt); g.rect(22, 27, 3, 4, c); g.rect(22, 30, 3, 1, d); g.set(23, 28, lt); break;
    case 'necklace':
      for (const [x, y] of [[16, 26], [17, 27], [18, 28], [21, 28], [22, 27], [23, 26]]) g.set(x, y, '#f5c844');
      g.rect(19, 28, 2, 2, '#f27db3'); g.set(19, 28, '#ffd6e5');
      break;
    case 'bowtie': g.rows(17, 26, ['##..##', '######', '##..##'], { '#': c }); g.rect(19, 27, 2, 1, d); break;
    case 'tie': g.rect(19, 26, 2, 1, d); g.rect(19, 27, 2, 5, c); g.set(19, 32, c); g.set(20, 28, lt); break;
    case 'lanyard':
      for (const [x, y] of [[16, 26], [17, 27], [18, 28], [18, 29], [23, 26], [22, 27], [21, 28], [21, 29]]) g.set(x, y, c);
      g.rect(18, 30, 4, 3, '#f4f1ea'); g.set(19, 31, c); g.rect(20, 31, 1, 1, '#9fd3ff');
      break;
    case 'medal':
      for (const [x, y] of [[17, 26], [17, 27], [18, 28], [22, 26], [22, 27], [21, 28]]) g.set(x, y, c);
      g.rect(19, 29, 2, 2, '#f5c844'); g.set(19, 29, '#fff3a8');
      break;
    case 'backpack': g.rect(15, 26, 1, 7, d); g.rect(24, 26, 1, 7, d); break;
    case 'cape': g.rect(14, 26, 1, 2, d); g.rect(25, 26, 1, 2, d); g.set(20, 26, '#f5c844'); break;
  }
}

// A little friend sitting by the left foot.
function pet(g, l) {
  const P = {
    cat: { x: 1, y: 34, rows: ['#.....#', '##...##', '#######', '#e###e#', '###n###', '.#####.', '##w#w##'], m: { '#': '#f0a050', e: OL, n: '#f27db3', w: '#ffe0b8' } },
    dog: { x: 1, y: 34, rows: ['dd###dd', 'd#####d', 'd#e#e#d', '.##n##.', '..###..', '.#####.', '##w#w##'], m: { '#': '#c8935f', d: '#7a4b2a', e: OL, n: OL, w: '#f4e4cc' } },
    bunny: { x: 1, y: 31, rows: ['.#...#.', '.#...#.', '.#...#.', '#######', '#e###e#', '###n###', '.#####.', '##w#w##'], m: { '#': '#f4f1ea', e: OL, n: '#f27db3', w: '#e6def5' } },
    chick: { x: 3, y: 36, rows: ['.###.', '#e#e#', '##o##', '#####', '.###.', '.o.o.'], m: { '#': '#ffd84a', e: OL, o: '#f08a3c' } },
    hamster: { x: 1, y: 35, rows: ['.#...#.', '#######', '#e###e#', '#wwnww#', '#wwwww#', '.#####.'], m: { '#': '#e8b070', e: OL, n: '#f27db3', w: '#fff1d8' } },
    frog: { x: 1, y: 35, rows: ['.##.##.', '#e#.#e#', '#######', '##rrr##', '#######', '#.#.#.#'], m: { '#': '#5fbf5a', e: OL, r: '#2f6b4a' } },
    bird: { x: 2, y: 34, rows: ['..##..', '.##e#o', '.#####', '####..', '.###..', '..o.o.'], m: { '#': '#4a7be0', e: OL, o: '#f5c844' } },
    fish: { x: 0, y: 33, rows: ['.######.', '#wwwwww#', '#wwfffw#', '#wfffew#', '#wwfffw#', '#wwwwww#', '.######.'], m: { '#': '#d7ecf7', w: '#9fd3ff', f: '#f08a3c', e: OL } },
  }[l.pet];
  if (!P) return;
  g.rows(P.x, P.y, P.rows, P.m);
  if (l.pet === 'cat') { g.set(8, 38, '#f0a050'); g.set(9, 37, '#f0a050'); g.set(9, 36, '#f0a050'); }
}

export function renderGrid(lookIn) {
  const l = normalizeLook(lookIn);
  const g = makeGrid();
  const skin = SKIN[l.skin];
  const hc = HAIR_C[l.hairC], hd = shade(hc, -0.25), hl = shade(hc, 0.22);
  accBack(g, l);
  hairBack(g, l, hc, hd);
  body(g, l, skin);
  head(g, skin, l);
  faceHair(g, l, hc, skin);
  if (l.hat !== 'hijab') hairFront(g, l, hc, hd, hl);
  if (l.hair === 'bald' && l.hat !== 'hijab') { g.set(16, 13, shade(skin, 0.35)); g.set(17, 13, shade(skin, 0.35)); }
  accFront(g, l);
  hat(g, l);
  eyewear(g, l);
  prop(g, l, skin);
  pet(g, l);
  outline(g);
  for (const [x, y, c] of g.looseList.values()) if (!g.get(x, y)) g.set(x, y, c);
  return g.cells;
}

// Draw onto a canvas at an integer scale. `crop` = [x, y, w, h] in grid pixels.
export function drawLook(canvas, look, scale = 4, crop = [0, 0, W, H]) {
  const [cx, cy, cw, ch] = crop;
  canvas.width = cw * scale; canvas.height = ch * scale;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cells = renderGrid(look);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const c = cells[cy + y]?.[cx + x];
    if (c) { ctx.fillStyle = c; ctx.fillRect(x * scale, y * scale, scale, scale); }
  }
  return canvas;
}

const urlCache = new Map();
export function lookToDataURL(look, scale = 2) {
  const key = JSON.stringify(normalizeLook(look)) + scale;
  if (!urlCache.has(key)) urlCache.set(key, drawLook(document.createElement('canvas'), look, scale).toDataURL());
  return urlCache.get(key);
}

// ---- dream symbols (9×9) shown in each character's thought bubble ------------
export const ICONS = {
  faith: { label: 'Faith', c: '#8a5cd6', p: ['...###...', '...###...', '#########', '#########', '...###...', '...###...', '...###...', '...###...'] },
  hope: { label: 'Hope', c: '#f5c844', p: ['....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.'] },
  love: { label: 'Love', c: '#e84d5b', p: ['.##...##.', '####.####', '#########', '#########', '.#######.', '..#####..', '...###...', '....#....'] },
  others: { label: 'Others', c: '#e84d5b', p: ['.##.##...', '#######..', '#######..', '.#####...', '..###...o', 'o..#...oo', 'oo....ooo', 'ooooooooo', '.ooooooo.'].map((r) => r.padEnd(9, '.')), m: { o: '#e0a77a' } },
  lead: { label: 'Leadership', c: '#6b4a33', p: ['.#fff....', '.#ffffff.', '.#fffff..', '.#fff....', '.#.......', '.#.......', '.#.......', '###......'], m: { f: '#e84d5b' } },
  learn: { label: 'Learning', c: '#4a7be0', p: ['.##...##.', '#ww#.#ww#', '#www#www#', '#www#www#', '#www#www#', '####.####'], m: { w: '#f4f1ea' } },
  growth: { label: 'Growth', c: '#4fbf8b', p: ['.##...##.', '####.####', '.##.#.##.', '....#....', '....#....', '..bbbbb..', '...bbb...'], m: { b: '#c8783a' } },
  happy: { label: 'Happiness', c: '#f5c844', p: ['..#####..', '.#######.', '##e###e##', '#########', '#m#####m#', '##mmmmm##', '.#######.', '..#####..'], m: { e: OL, m: OL } },
  career: { label: 'Career', c: '#6b4a33', p: ['...###...', '...#.#...', '#########', '####y####', '#########', '#########'], m: { y: '#f5c844' } },
  home: { label: 'Home', c: '#f08a3c', p: ['....#....', '...###...', '..#####..', '.#######.', '..wwwww..', '..ww.ww..', '..ww.ww..'], m: { w: '#f4f1ea' } },
  relation: { label: 'Relationships', c: '#3cc0c0', p: ['.hh...hh.', '.hh...hh.', '.........', '.##...##.', '#########', '.##...##.', '.##...##.', '.#.#.#.#.'], m: { h: '#e0a77a' } },
  music: { label: 'Music', c: '#8a5cd6', p: ['....####.', '....#..#.', '....#..#.', '....#..#.', '..###.##.', '.####.##.', '..##.....'] },
};

export function drawIcon(canvas, id, scale = 3) {
  const ic = ICONS[id] || ICONS.hope;
  canvas.width = 9 * scale; canvas.height = 9 * scale;
  const ctx = canvas.getContext('2d');
  const yo = Math.floor((9 - ic.p.length) / 2);
  ic.p.forEach((row, j) => [...row].forEach((ch, i) => {
    const c = ch === '#' ? ic.c : ic.m?.[ch];
    if (c) { ctx.fillStyle = c; ctx.fillRect(i * scale, (j + yo) * scale, scale, scale); }
  }));
  return canvas;
}

const iconCache = new Map();
export function iconDataURL(id, scale = 3) {
  const k = id + scale;
  if (!iconCache.has(k)) iconCache.set(k, drawIcon(document.createElement('canvas'), id, scale).toDataURL());
  return iconCache.get(k);
}
