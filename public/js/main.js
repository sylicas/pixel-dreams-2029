// Screens, the character builder, the dream space and the dream reader.
import {
  OPTIONS, SKIN, HAIR_C, CLOTH, SHOES, COLOUR_HATS, COLOUR_ACC, ICONS, W, H,
  normalizeLook, randomLook, drawLook, lookToDataURL, iconDataURL,
} from './avatar.js';
import { loadSquare, toBase64Jpeg, sampleColours, pixelate } from './photo.js';
import { createSpace } from './space.js';
import { drawBuilding, BW, BH } from './building.js';

const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

let config = { title: 'Dreams for GenerationS', tagline: "BF2026 ✦ Our privilege to give ✦ Let's rise up!", cgs: ['LE1', 'LE3', 'LE5', 'LE7'], aiSelfie: false };
let dreams = [];
let me = store.get('pd-me', null);            // { id, token } once you've shared a dream
const cheered = new Set(store.get('pd-cheered', []));
let draft = { name: '', cg: '', look: randomLook(), icon: 'hope', dream: '' };
let filterCg = 'all';
const visible = () => (filterCg === 'all' ? dreams : dreams.filter((d) => d.cg === filterCg));
let editing = false;
let space = null;
let poll = null;

// ---- helpers ------------------------------------------------------------------
function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
  if (id === 'space-view') startPolling(); else stopPolling();
}

let toastTimer;
function toast(msg, ms = 3200) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}

function sparkle(n = 70) {
  const box = $('#sparkles');
  const cols = ['#f5c844', '#fff1c1', '#b9a8ff', '#f27db3', '#3cc0c0', '#ffffff'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.style.left = `${Math.random() * 100}vw`;
    p.style.background = cols[i % cols.length];
    p.style.animationDuration = `${1.6 + Math.random() * 1.8}s`;
    p.style.animationDelay = `${Math.random() * 0.8}s`;
    if (Math.random() < 0.3) { p.style.width = p.style.height = '4px'; }
    box.append(p);
    setTimeout(() => p.remove(), 4000);
  }
}

const newToken = () => {
  const a = new Uint8Array(18); crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
};

async function api(path, body) {
  const r = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  let data = {};
  try { data = await r.json(); } catch {}
  if (!r.ok) throw new Error(data.error || `Request failed (${r.status})`);
  return data;
}

async function loadDreams() {
  const data = await api('/api/dreams');
  dreams = data.dreams || [];
  config = data.config || config;
  if (me && !dreams.some((d) => d.id === me.id)) { me = null; store.set('pd-me', null); }
  return dreams;
}

// ---- welcome --------------------------------------------------------------------
function renderWelcome() {
  document.title = config.title;
  $('#title').textContent = config.title;
  $('#tagline').textContent = config.tagline;
  fillCgSelect($('#in-cg'), 'Pick your CG');
  const crowd = $('#welcome-crowd');
  crowd.innerHTML = '';
  const picks = dreams.length >= 3 ? [...dreams].sort(() => Math.random() - 0.5).slice(0, 3).map((d) => d.look)
    : [randomLook({ g: 'f' }), randomLook({ g: 'm' }), randomLook()];
  for (const look of picks) { const img = new Image(); img.src = lookToDataURL(look, 3); crowd.append(img); }
  $('#welcome-count').textContent = dreams.length
    ? `${dreams.length} ${dreams.length === 1 ? 'dream' : 'dreams'} shared so far`
    : 'Be the first to share a dream';
  $('#btn-start').textContent = me ? 'Edit my dream' : 'Share a dream';
  $('#btn-look').textContent = me ? 'Enter the dream space' : 'Look around';
}

function drawWelcomeBuilding() {
  const c = $('#welcome-building');
  c.width = BW + 40; c.height = BH + 12;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  drawBuilding(ctx, 20, 2);
}

function fillCgSelect(sel, placeholder) {
  const current = sel.value;
  sel.innerHTML = '';
  if (placeholder) sel.append(new Option(placeholder, ''));
  for (const cg of config.cgs || []) sel.append(new Option(cg, cg));
  sel.value = current;
}

// ---- step 1: name + selfie --------------------------------------------------------
async function handlePhoto(file) {
  if (!file) return;
  if (!saveName()) return;
  show('step-pixel');
  const bar = $('#pixel-bar'), msg = $('#pixel-msg');
  bar.style.width = '5%'; msg.textContent = 'Reading your colours';
  let photo;
  try { photo = await loadSquare(file); } catch { toast('Could not open that photo. Try another one, or skip it.'); show('step-name'); return; }

  const colours = sampleColours(photo);
  const aiCall = config.aiSelfie
    ? api('/api/analyze', { image: toBase64Jpeg(photo) }).catch(() => ({ look: null }))
    : Promise.resolve({ look: null });
  let step = 0;
  await pixelate($('#pixel-canvas'), photo, () => { step++; bar.style.width = `${10 + step * 11}%`; if (step === 3) msg.textContent = config.aiSelfie ? 'Looking at your style' : 'Placing pixels'; });
  msg.textContent = 'Almost there';
  const ai = await aiCall;
  bar.style.width = '100%';

  const base = ai.look || {};
  const g = base.g || draft.look.g;
  draft.look = normalizeLook({ ...randomLook({ g }), hold: draft.look.hold, ...colours, ...base, g });
  if (!ai.look) draft.look.hair = draft.look.g === 'f' ? 'long' : 'short';
  draft.look.hat = 'none';
  if (!ai.look) { draft.look.eyes = 'none'; draft.look.face = 'none'; }
  $('#build-note').textContent = ai.look
    ? 'We matched your look from your selfie. Tweak anything you like!'
    : 'We matched your colours from your selfie. Pick a style and tweak anything!';
  $('#build-note').hidden = false;
  openBuilder();
}

function saveName() {
  const name = $('#in-name').value.trim();
  if (!name) { toast('Add your name first'); $('#in-name').focus(); return false; }
  const cg = $('#in-cg').value;
  if (!cg) { toast('Pick your CG first'); $('#in-cg').focus(); return false; }
  draft.name = name;
  draft.cg = cg;
  return true;
}

// ---- step 2: builder ---------------------------------------------------------------
const TABS = [
  ['body', 'Body'], ['face', 'Face'], ['hair', 'Hair'], ['outfit', 'Outfit'],
  ['hats', 'Hats'], ['hold', 'Hold'], ['pet', 'Pet'], ['extras', 'Extras'],
];
let tab = 'body', shownTab = null;

function thumb(look, crop, scale = 2) {
  return drawLook(document.createElement('canvas'), look, scale, crop);
}
const HEAD = [6, 0, 28, 28];
const BODY = [8, 22, 24, 22];

function optGrid(key, { crop, text = false, labelMap, base = {} } = {}) {
  const wrap = document.createElement('div');
  wrap.className = text ? 'opts text' : 'opts';
  for (const [id, label] of OPTIONS[key]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt' + (draft.look[key] === id ? ' on' : '');
    if (!text) b.append(thumb({ ...draft.look, ...(key === 'hold' ? {} : { hold: 'none' }), ...(key === 'pet' ? {} : { pet: 'none' }), ...base, [key]: id }, crop));
    b.append(Object.assign(document.createElement('span'), { textContent: labelMap?.[id] || label }));
    b.addEventListener('click', () => { draft.look[key] = id; refreshBuilder(); });
    wrap.append(b);
  }
  return wrap;
}

function swatches(key, palette) {
  const wrap = document.createElement('div');
  wrap.className = 'swatches';
  palette.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (draft.look[key] === i ? ' on' : '');
    b.style.background = c;
    b.setAttribute('aria-label', `Colour ${i + 1}`);
    b.addEventListener('click', () => { draft.look[key] = i; refreshBuilder(); });
    wrap.append(b);
  });
  return wrap;
}

const label = (t) => Object.assign(document.createElement('p'), { className: 'label', textContent: t });

function renderTab() {
  const body = $('#tab-body');
  const scrollY = window.scrollY;
  // keep the menu's scroll position when picking an option; start at the top on a new tab
  const keep = shownTab === tab ? body.scrollTop : 0;
  shownTab = tab;
  body.innerHTML = '';
  const l = draft.look;
  const FACE = [8, 10, 24, 18];
  if (tab === 'body') {
    body.append(label('Skin'), swatches('skin', SKIN), label('Cheeks'), optGrid('cheeks', { crop: FACE }),
      label('Facial hair'), optGrid('face', { crop: FACE }));
  } else if (tab === 'face') {
    body.append(label('Eyes'), optGrid('eyeS', { crop: FACE }), label('Mouth'), optGrid('mouth', { crop: FACE }),
      label('Glasses'), optGrid('eyes', { crop: FACE }));
  } else if (tab === 'hair') {
    body.append(label('Style'), optGrid('hair', { crop: HEAD, base: { hat: 'none' } }), label('Colour'), swatches('hairC', HAIR_C));
  } else if (tab === 'outfit') {
    const long = ['dress', 'gown'].includes(l.top);
    body.append(label('Top'), optGrid('top', { crop: BODY }));
    if (!long) body.append(label('Bottom'), optGrid('bottom', { crop: BODY }));
    body.append(label(l.top === 'dress' ? 'Dress colour' : l.top === 'gown' ? 'Gown colour' : l.top === 'labcoat' ? 'Shirt colour' : 'Top colour'), swatches('topC', CLOTH));
    if (!long) body.append(label(l.top === 'overalls' ? 'Overalls colour' : 'Bottom colour'), swatches('botC', CLOTH));
    body.append(label('Shoes'), swatches('shoeC', SHOES));
  } else if (tab === 'hats') {
    body.append(label('Hat'), optGrid('hat', { crop: [4, 0, 32, 32] }));
    if (COLOUR_HATS.includes(l.hat)) body.append(label('Hat colour'), swatches('hatC', CLOTH));
  } else if (tab === 'hold') {
    body.append(label('Something to hold'), optGrid('hold', { crop: [4, 0, 36, 44] }));
  } else if (tab === 'pet') {
    body.append(label('A little friend'), optGrid('pet', { crop: [0, 22, 30, 22] }));
  } else if (tab === 'extras') {
    body.append(label('Extras'), optGrid('acc', { crop: [0, 14, 40, 30] }));
    if (COLOUR_ACC.includes(l.acc)) body.append(label('Extras colour'), swatches('accC', CLOTH));
  }
  body.scrollTop = keep;
  updateMore();
  window.scrollTo(0, scrollY);
}

// Shows a "more below" cue while the menu has more options further down.
// Also moves the pixel scrollbar beside it.
function updateMore() {
  const body = $('#tab-body'), rail = $('#tab-rail'), thumb = $('#tab-thumb');
  const room = body.scrollHeight - body.clientHeight;
  $('#tab-more').hidden = room - body.scrollTop < 8;
  rail.hidden = room < 2;
  if (room < 2) return;
  const h = Math.max(30, (rail.clientHeight * body.clientHeight) / body.scrollHeight);
  thumb.style.height = `${h}px`;
  thumb.style.transform = `translateY(${(body.scrollTop / room) * (rail.clientHeight - h)}px)`;
}

function initRail() {
  const body = $('#tab-body'), rail = $('#tab-rail'), thumb = $('#tab-thumb');
  let grab = null;
  const scrollTo = (clientY) => {
    const r = rail.getBoundingClientRect(), h = thumb.offsetHeight;
    const t = Math.min(1, Math.max(0, (clientY - r.top - grab) / (r.height - h)));
    body.scrollTop = t * (body.scrollHeight - body.clientHeight);
  };
  rail.addEventListener('pointerdown', (e) => {
    const tr = thumb.getBoundingClientRect();
    grab = e.target === thumb ? e.clientY - tr.top : thumb.offsetHeight / 2;
    rail.setPointerCapture(e.pointerId);
    scrollTo(e.clientY);
    e.preventDefault();
  });
  rail.addEventListener('pointermove', (e) => { if (grab !== null) scrollTo(e.clientY); });
  const end = () => { grab = null; };
  rail.addEventListener('pointerup', end);
  rail.addEventListener('pointercancel', end);
}

function refreshBuilder() {
  draft.look = normalizeLook(draft.look);
  drawLook($('#preview'), draft.look, 6);
  document.querySelectorAll('#seg-g button').forEach((b) => b.classList.toggle('on', b.dataset.g === draft.look.g));
  document.querySelectorAll('#tabs .tab').forEach((b) => {
    b.classList.toggle('on', b.dataset.tab === tab);
    b.setAttribute('aria-selected', b.dataset.tab === tab);
  });
  renderTab();
}

function openBuilder() {
  $('#build-step').textContent = editing ? 'Edit · 1 of 2' : 'Step 2 of 3';
  $('#btn-build-back').textContent = editing ? 'Cancel' : 'Back';
  show('step-build');
  refreshBuilder();
}

function initBuilder() {
  const seg = $('#seg-g');
  for (const [g, name] of OPTIONS.g) {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.g = g; b.textContent = name;
    b.addEventListener('click', () => {
      if (draft.look.g === g) return;
      const swap = { m: { long: 'short', wavy: 'side', bob: 'side', pony: 'short', braid: 'short', bun: 'short', twinbuns: 'spiky', pigtails: 'spiky', curlylong: 'curly', bangs: 'quiff', halfup: 'undercut' }, f: { short: 'long', spiky: 'pony', side: 'bob', buzz: 'bun', mohawk: 'twinbuns', bald: 'long', curly: 'curlylong', quiff: 'bangs', undercut: 'halfup' } };
      draft.look.hair = swap[g][draft.look.hair] || draft.look.hair;
      if (g === 'm' && draft.look.top === 'dress') draft.look.top = 'tee';
      if (g === 'm' && ['skirt', 'longskirt', 'culottes'].includes(draft.look.bottom)) draft.look.bottom = 'pants';
      if (g === 'f') draft.look.face = 'none';
      draft.look.g = g;
      refreshBuilder();
    });
    seg.append(b);
  }
  const tabs = $('#tabs');
  for (const [id, name] of TABS) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tab'; b.dataset.tab = id; b.textContent = name; b.setAttribute('role', 'tab');
    b.addEventListener('click', () => { tab = id; refreshBuilder(); });
    tabs.append(b);
  }
  $('#tab-body').addEventListener('scroll', updateMore, { passive: true });
  initRail();
  window.addEventListener('resize', () => { if ($('#step-build').classList.contains('active')) updateMore(); });
  $('#btn-shuffle').addEventListener('click', () => {
    const keep = { skin: draft.look.skin, hairC: draft.look.hairC };
    draft.look = randomLook({ g: draft.look.g, ...keep });
    refreshBuilder();
  });
  $('#btn-build-back').addEventListener('click', () => (editing ? (editing = false, enterSpace()) : show('step-name')));
  $('#btn-build-next').addEventListener('click', openDream);
}

// ---- step 3: dream ---------------------------------------------------------------
function renderIcons() {
  const grid = $('#icon-grid');
  grid.innerHTML = '';
  for (const [id, ic] of Object.entries(ICONS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt' + (draft.icon === id ? ' on' : '');
    const img = new Image(); img.src = iconDataURL(id, 4); img.alt = '';
    b.append(img, Object.assign(document.createElement('span'), { textContent: ic.label }));
    b.addEventListener('click', () => { draft.icon = id; renderIcons(); });
    grid.append(b);
  }
}

function openDream() {
  $('#dream-step').textContent = editing ? 'Edit · 2 of 2' : 'Step 3 of 3';
  $('#btn-send').textContent = editing ? 'Save my dream ✦' : 'Release my dream ✦';
  $('#edit-cg-row').hidden = !editing;
  if (editing) { fillCgSelect($('#in-cg-edit')); $('#in-cg-edit').value = draft.cg || ''; }
  $('#in-dream').value = draft.dream;
  $('#dream-count').textContent = draft.dream.length;
  renderIcons();
  show('step-dream');
}

async function sendDream() {
  draft.dream = $('#in-dream').value.trim();
  if (!draft.dream) { toast('Write your dream first'); $('#in-dream').focus(); return; }
  const btn = $('#btn-send');
  btn.disabled = true;
  try {
    let row;
    if (editing && me) {
      draft.cg = $('#in-cg-edit').value || draft.cg;
      ({ dream: row } = await api('/api/dreams', { action: 'edit', id: me.id, token: me.token, cg: draft.cg, dream: draft.dream, icon: draft.icon, look: draft.look }));
      dreams = dreams.map((d) => (d.id === row.id ? row : d));
      toast('Dream updated ✦');
    } else {
      const token = newToken();
      ({ dream: row } = await api('/api/dreams', { name: draft.name, cg: draft.cg, dream: draft.dream, icon: draft.icon, look: draft.look, token }));
      me = { id: row.id, token };
      store.set('pd-me', me);
      dreams = [row, ...dreams.filter((d) => d.id !== row.id)];
      sparkle();
      toast('Your dream has been shared ✦', 4000);
    }
    editing = false;
    enterSpace(row.id);
  } catch (e) {
    toast(e.message, 5000);
  } finally {
    btn.disabled = false;
  }
}

// ---- dream space ------------------------------------------------------------------
function renderFilters() {
  const box = $('#filters');
  const opts = [['all', 'Everyone'], ...(config.cgs || []).map((c) => [c, c])];
  box.innerHTML = '';
  for (const [id, name] of opts) {
    const n = id === 'all' ? dreams.length : dreams.filter((d) => d.cg === id).length;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (filterCg === id ? ' on' : '');
    b.innerHTML = `<span></span><small>${n}</small>`;
    b.firstChild.textContent = name;
    b.setAttribute('aria-pressed', filterCg === id);
    b.addEventListener('click', () => { filterCg = id; renderSpace(); });
    box.append(b);
  }
}

function renderSpace() {
  $('#space-title').textContent = config.title;
  $('#space-tagline').textContent = config.tagline;
  const list = visible();
  const n = list.length;
  $('#space-count').textContent = filterCg === 'all'
    ? (n ? `${n} ${n === 1 ? 'dream' : 'dreams'} shared` : 'No dreams yet')
    : `${n} ${n === 1 ? 'dream' : 'dreams'} from ${filterCg}`;
  $('#space-empty').textContent = filterCg === 'all' ? 'No dreams yet. Be the first!' : `No dreams from ${filterCg} yet`;
  $('#space-empty').hidden = n > 0;
  $('#btn-readall').disabled = $('#btn-random').disabled = n === 0;
  $('#btn-join').textContent = me ? 'Edit my dream' : '+ Share your dream';
  $('#btn-findme').hidden = !me;
  renderFilters();
  space.update(list, me?.id);
}

function findMe() {
  if (!me) return;
  const mine = dreams.find((d) => d.id === me.id);
  if (mine && filterCg !== 'all' && mine.cg !== filterCg) { filterCg = 'all'; renderSpace(); }
  const el = space.element(me.id);
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  el.classList.add('pop');
  setTimeout(() => el.classList.remove('pop'), 1200);
}

function enterSpace(focusId) {
  show('space-view');
  if (!space) space = createSpace($('#space'), { onTap: (id) => openCard(visible().findIndex((d) => d.id === id)) });
  renderSpace();
  if (focusId) {
    const mine = dreams.find((d) => d.id === focusId);
    if (mine && filterCg !== 'all' && mine.cg !== filterCg) { filterCg = 'all'; renderSpace(); }
    const el = space.element(focusId);
    if (el) {
      el.classList.add('pop');
      setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60);
      setTimeout(() => el.classList.remove('pop'), 1200);
    }
  }
  if (!store.get('pd-tip', false) && dreams.length) {
    $('#tip').hidden = false;
    setTimeout(() => { $('#tip').hidden = true; }, 4500);
    store.set('pd-tip', true);
  }
}

function startPolling() {
  stopPolling();
  poll = setInterval(async () => {
    if (document.hidden || $('#card').open) return;
    try { await loadDreams(); renderSpace(); } catch {}
  }, 5000);
}
function stopPolling() { clearInterval(poll); poll = null; }

// ---- dream card -------------------------------------------------------------------
let cardIndex = 0;
function openCard(i) {
  const list = visible();
  if (i < 0 || !list.length) return;
  cardIndex = (i + list.length) % list.length;
  const d = list[cardIndex];
  drawLook($('#card-sprite'), d.look, 4, [0, 0, W, H]);
  $('#card-icon').src = iconDataURL(d.icon, 4);
  $('#card-icon').alt = ICONS[d.icon]?.label || '';
  $('#card-name').textContent = d.name;
  $('#card-cg').textContent = d.cg || '';
  $('#card-cg').hidden = !d.cg;
  $('#card-topic').textContent = ICONS[d.icon]?.label || '';
  $('#card-text').textContent = d.dream;
  const mine = me?.id === d.id;
  const done = cheered.has(d.id);
  const cheer = $('#card-cheer');
  cheer.hidden = mine;
  cheer.classList.toggle('done', done);
  cheer.disabled = done;
  cheer.textContent = done ? '✦ You too!' : '✦ Me too';
  $('#card-cheers').textContent = d.cheers ? `${d.cheers} ${d.cheers === 1 ? 'person shares' : 'people share'} this dream` : (mine ? 'No “me too” yet' : 'Share this dream?');
  $('#card-edit').hidden = !mine;
  $('#card-pos').textContent = `${cardIndex + 1} / ${list.length}`;
  const nav = list.length > 1;
  $('#card-prev').style.visibility = $('#card-next').style.visibility = nav ? 'visible' : 'hidden';
  if (!$('#card').open) $('#card').showModal();
}

async function cheerCurrent() {
  const d = visible()[cardIndex];
  if (!d || cheered.has(d.id)) return;
  cheered.add(d.id);
  store.set('pd-cheered', [...cheered]);
  d.cheers = (d.cheers || 0) + 1;
  openCard(cardIndex);
  try {
    const { cheers } = await api('/api/dreams', { action: 'cheer', id: d.id });
    d.cheers = cheers;
    if (visible()[cardIndex]?.id === d.id && $('#card').open) openCard(cardIndex);
    renderSpace();
  } catch (e) { toast(e.message); }
}

function initCard() {
  const card = $('#card');
  $('#card-close').addEventListener('click', () => card.close());
  card.addEventListener('click', (e) => { if (e.target === card) card.close(); });
  $('#card-prev').addEventListener('click', () => openCard(cardIndex - 1));
  $('#card-next').addEventListener('click', () => openCard(cardIndex + 1));
  $('#card-cheer').addEventListener('click', cheerCurrent);
  $('#card-edit').addEventListener('click', () => { card.close(); startEdit(); });
  let x0 = null;
  card.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  card.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60 && visible().length > 1) openCard(cardIndex + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  document.addEventListener('keydown', (e) => {
    if (!card.open) return;
    if (e.key === 'ArrowRight') openCard(cardIndex + 1);
    if (e.key === 'ArrowLeft') openCard(cardIndex - 1);
  });
}

function startEdit() {
  const mine = dreams.find((d) => d.id === me?.id);
  if (!mine) { toast('We could not find your dream on this phone'); return; }
  editing = true;
  draft = { name: mine.name, cg: mine.cg, look: normalizeLook(mine.look), icon: mine.icon, dream: mine.dream };
  $('#build-note').hidden = true;
  openBuilder();
}

function startNew() {
  editing = false;
  if (draft.name) $('#in-name').value = draft.name;
  $('#build-note').hidden = true;
  show('step-name');
}

// ---- wiring -------------------------------------------------------------------------
async function init() {
  initBuilder();
  initCard();
  document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => show(b.dataset.go)));
  $('#btn-start').addEventListener('click', () => (me ? startEdit() : startNew()));
  $('#btn-look').addEventListener('click', () => enterSpace());
  $('#in-camera').addEventListener('change', (e) => handlePhoto(e.target.files[0]).finally(() => { e.target.value = ''; }));
  $('#in-photo').addEventListener('change', (e) => handlePhoto(e.target.files[0]).finally(() => { e.target.value = ''; }));
  $('#btn-skip-selfie').addEventListener('click', () => { if (saveName()) openBuilder(); });
  $('#in-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btn-skip-selfie').click(); });
  $('#btn-dream-back').addEventListener('click', () => { draft.dream = $('#in-dream').value; openBuilder(); });
  $('#in-dream').addEventListener('input', (e) => { $('#dream-count').textContent = e.target.value.length; });
  $('#btn-send').addEventListener('click', sendDream);
  $('#btn-join').addEventListener('click', () => (me ? startEdit() : startNew()));
  $('#btn-home').addEventListener('click', () => { renderWelcome(); show('welcome'); });
  $('#btn-readall').addEventListener('click', () => openCard(0));
  $('#btn-random').addEventListener('click', () => openCard(Math.floor(Math.random() * visible().length)));
  $('#btn-findme').addEventListener('click', findMe);
  $('#btn-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => { $('#btn-top').hidden = !$('#space-view').classList.contains('active') || window.scrollY < 900; }, { passive: true });
  drawWelcomeBuilding();
  fillCgSelect($('#in-cg'), 'Pick your CG');

  try {
    await loadDreams();
  } catch (e) {
    toast(e.message, 8000);
  }
  renderWelcome();
  if (location.hash === '#space') enterSpace();
}

init();
