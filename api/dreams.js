// GET  /api/dreams                 → { dreams, config }
// POST /api/dreams {name, cg, dream, icon, look, token}            → add a dream
// POST /api/dreams {action:'edit', id, token, cg, dream, icon, look} → edit your own
// POST /api/dreams {action:'cheer', id}                         → "me too" +1
import { config, send, readBody, store, storeProblem, cleanLook, cleanText, hashToken, ICON_IDS, isUuid } from './_lib.js';

export default async function handler(req, res) {
  const problem = storeProblem();
  if (problem) return send(res, 503, { error: problem });
  const cfg = config();
  try {
    if (req.method === 'GET') {
      const dreams = await store.list();
      return send(res, 200, { dreams, config: { title: cfg.title, tagline: cfg.tagline, cgs: cfg.cgs, aiSelfie: !!process.env.ANTHROPIC_API_KEY } });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

    const b = readBody(req);
    const icon = ICON_IDS.includes(b.icon) ? b.icon : 'hope';
    const cg = cfg.cgs.includes(b.cg) ? b.cg : null;
    const dream = cleanText(b.dream, 600);
    const look = cleanLook(b.look);

    if (b.action === 'cheer') {
      if (!isUuid(b.id)) return send(res, 400, { error: 'Bad id' });
      const cheers = await store.cheer(b.id);
      if (cheers == null) return send(res, 404, { error: 'That dream is gone' });
      return send(res, 200, { cheers });
    }

    if (typeof b.token !== 'string' || b.token.length < 16 || b.token.length > 100) {
      return send(res, 400, { error: 'Missing token' });
    }

    if (b.action === 'edit') {
      if (!isUuid(b.id)) return send(res, 400, { error: 'Bad id' });
      if (!dream) return send(res, 400, { error: 'Your dream is empty' });
      const fields = { dream, icon };
      if (look) fields.look = look;
      if (cg) fields.cg = cg;
      const row = await store.update(b.id, hashToken(b.token), fields);
      if (!row) return send(res, 403, { error: 'You can only edit your own dream, from the phone you wrote it on.' });
      return send(res, 200, { dream: row });
    }

    const name = cleanText(b.name, 24);
    if (!name) return send(res, 400, { error: 'Please add your name' });
    if (!cg) return send(res, 400, { error: 'Please pick your CG' });
    if (!dream) return send(res, 400, { error: 'Your dream is empty' });
    if (!look) return send(res, 400, { error: 'Missing character' });
    if ((await store.count()) >= cfg.maxDreamers) {
      return send(res, 403, { error: 'The dream space is full right now. Ask the host to raise the limit.' });
    }
    const row = await store.insert({ name, cg, dream, icon, look, edit_hash: hashToken(b.token) });
    return send(res, 201, { dream: row });
  } catch (err) {
    console.error(err);
    return send(res, 500, { error: 'Something went wrong saving to the database. Try again in a moment.' });
  }
}
