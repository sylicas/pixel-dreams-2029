// Shared server helpers. Files starting with "_" are not deployed as endpoints.
import crypto from 'node:crypto';

export const config = () => ({
  title: (process.env.SPACE_TITLE || 'Dreams for GenerationS').slice(0, 40),
  tagline: (process.env.SPACE_TAGLINE || "BF2026 ✦ Our privilege to give ✦ Let's rise up!").slice(0, 120),
  cgs: (process.env.CG_OPTIONS || 'LE1,LE3,LE5,LE7').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 30),
  maxDreamers: Number(process.env.MAX_DREAMERS) || 100,
  maxSelfieReads: Number(process.env.MAX_SELFIE_READS) || 150,
});

export const ICON_IDS = ['faith', 'hope', 'love', 'others', 'lead', 'learn', 'growth', 'happy', 'career', 'home', 'relation', 'music'];

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function readBody(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') { try { return JSON.parse(b); } catch { return {}; } }
  return b;
}

export const hashToken = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');

// Only short ids and small integers are kept, so a look can't carry anything else.
export function cleanLook(look) {
  if (!look || typeof look !== 'object' || Array.isArray(look)) return null;
  const out = {};
  for (const [k, v] of Object.entries(look).slice(0, 30)) {
    if (!/^[a-zA-Z]{1,10}$/.test(k)) continue;
    if (typeof v === 'string' && /^[a-z]{1,12}$/.test(v)) out[k] = v;
    else if (Number.isInteger(v) && v >= 0 && v < 30) out[k] = v;
  }
  return out;
}

export function cleanText(v, max) {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
}

// ---- storage -----------------------------------------------------------------
// Supabase (PostgREST) when configured; otherwise an in-memory store for local dev.
const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function storeProblem() {
  if (SB_URL && SB_KEY) return null;
  if (process.env.VERCEL) return 'The database is not set up yet: add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, then redeploy.';
  return null; // local dev: memory store
}

async function sb(path, { method = 'GET', body, prefer } = {}) {
  const headers = { apikey: SB_KEY, 'Content-Type': 'application/json' };
  // Legacy service_role keys are JWTs and also go in Authorization;
  // new sb_secret_ keys must only be sent as apikey.
  if (SB_KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${SB_KEY}`;
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(`Supabase ${method} ${path.split('?')[0]} failed: ${r.status} ${await r.text()}`);
  const text = await r.text();
  return { data: text ? JSON.parse(text) : null, headers: r.headers };
}

const total = (headers) => Number((headers.get('content-range') || '').split('/')[1]) || 0;
const PUBLIC_COLS = 'id,name,cg,dream,icon,look,cheers,created_at';
const strip = ({ edit_hash, ...row }) => row;

const mem = (globalThis.__pixelDreams ||= { dreams: [], selfieReads: 0 });

export const store = {
  async list() {
    if (!SB_URL) return mem.dreams.map(strip).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const { data } = await sb(`dreams?select=${PUBLIC_COLS}&order=created_at.desc&limit=1000`);
    return data;
  },
  async count() {
    if (!SB_URL) return mem.dreams.length;
    return total((await sb('dreams?select=id&limit=1', { prefer: 'count=exact' })).headers);
  },
  async insert(row) {
    if (!SB_URL) {
      const full = { id: crypto.randomUUID(), cheers: 0, created_at: new Date().toISOString(), ...row };
      mem.dreams.push(full);
      return strip(full);
    }
    const { data } = await sb('dreams', { method: 'POST', body: row, prefer: 'return=representation' });
    return strip(data[0]);
  },
  async update(id, editHash, fields) {
    if (!SB_URL) {
      const d = mem.dreams.find((x) => x.id === id && x.edit_hash === editHash);
      if (!d) return null;
      Object.assign(d, fields);
      return strip(d);
    }
    const q = `dreams?id=eq.${encodeURIComponent(id)}&edit_hash=eq.${editHash}`;
    const { data } = await sb(q, { method: 'PATCH', body: fields, prefer: 'return=representation' });
    return data?.[0] ? strip(data[0]) : null;
  },
  async cheer(id) {
    if (!SB_URL) {
      const d = mem.dreams.find((x) => x.id === id);
      if (!d) return null;
      return ++d.cheers;
    }
    const { data } = await sb('rpc/cheer_dream', { method: 'POST', body: { dream_id: id } });
    return data;
  },
  async selfieReads() {
    if (!SB_URL) return mem.selfieReads;
    return total((await sb('selfie_log?select=id&limit=1', { prefer: 'count=exact' })).headers);
  },
  async logSelfieRead() {
    if (!SB_URL) { mem.selfieReads++; return; }
    await sb('selfie_log', { method: 'POST', body: {}, prefer: 'return=minimal' });
  },
};

export const isUuid = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);
