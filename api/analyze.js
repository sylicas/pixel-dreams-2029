// Optional: reads a selfie once and suggests character options.
// POST /api/analyze { image: <base64 JPEG, no data: prefix> } → { look } or { look: null }
// The photo is only sent to Claude for this one request; it is never stored.
import { config, send, readBody, store, storeProblem } from './_lib.js';

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['gender', 'skin', 'hair', 'hairColour', 'top', 'headwear', 'glasses', 'facialHair'],
  properties: {
    gender: { type: 'string', enum: ['male', 'female'] },
    skin: { type: 'string', enum: ['very fair', 'fair', 'light', 'medium light', 'medium', 'medium dark', 'dark', 'very dark'] },
    hair: { type: 'string', enum: ['short', 'spiky', 'side part', 'curly', 'buzz', 'mohawk', 'afro', 'bald', 'long', 'wavy', 'bob', 'ponytail', 'braid', 'bun', 'twin buns', 'pigtails', 'curly long'] },
    hairColour: { type: 'string', enum: ['black', 'dark brown', 'brown', 'blonde', 'ginger', 'auburn', 'grey', 'white', 'pink', 'purple', 'blue', 'green'] },
    top: { type: 'string', enum: ['t-shirt', 'striped t-shirt', 'hoodie', 'sweater', 'jacket', 'suit', 'dress', 'overalls'] },
    headwear: { type: 'string', enum: ['none', 'cap', 'beanie', 'bucket hat', 'beret', 'headband', 'hijab', 'headphones'] },
    glasses: { type: 'string', enum: ['none', 'glasses', 'sunglasses'] },
    facialHair: { type: 'string', enum: ['none', 'stubble', 'moustache', 'beard'] },
  },
};

const MAP = {
  skin: ['very fair', 'fair', 'light', 'medium light', 'medium', 'medium dark', 'dark', 'very dark'],
  hair: { short: 'short', spiky: 'spiky', 'side part': 'side', curly: 'curly', buzz: 'buzz', mohawk: 'mohawk', afro: 'afro', bald: 'bald', long: 'long', wavy: 'wavy', bob: 'bob', ponytail: 'pony', braid: 'braid', bun: 'bun', 'twin buns': 'twinbuns', pigtails: 'pigtails', 'curly long': 'curlylong' },
  hairC: ['black', 'dark brown', 'brown', 'blonde', 'ginger', 'auburn', 'grey', 'white', 'pink', 'purple', 'blue', 'green'],
  top: { 't-shirt': 'tee', 'striped t-shirt': 'stripe', hoodie: 'hoodie', sweater: 'sweater', jacket: 'jacket', suit: 'suit', dress: 'dress', overalls: 'overalls' },
  hat: { none: 'none', cap: 'cap', beanie: 'beanie', 'bucket hat': 'bucket', beret: 'beret', headband: 'headband', hijab: 'hijab', headphones: 'headphones' },
  eyes: { none: 'none', glasses: 'glasses', sunglasses: 'shades' },
  face: { none: 'none', stubble: 'stubble', moustache: 'tache', beard: 'beard' },
};

const PROMPT = `This selfie will become a cute pixel-art character. Describe the person's visible look by picking the closest option for each field. If something isn't visible, pick the most neutral option. Only describe appearance.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!process.env.ANTHROPIC_API_KEY || storeProblem()) return send(res, 200, { look: null });

  const { image } = readBody(req);
  if (typeof image !== 'string' || image.length < 100 || image.length > 400_000 || !/^[A-Za-z0-9+/=]+$/.test(image)) {
    return send(res, 400, { error: 'Bad image' });
  }
  try {
    if ((await store.selfieReads()) >= config().maxSelfieReads) return send(res, 200, { look: null, reason: 'limit' });
    await store.logSelfieRead();

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ timeout: 30_000, maxRetries: 1 });
    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
          { type: 'text', text: PROMPT },
        ],
      }],
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    });
    if (msg.stop_reason === 'refusal') return send(res, 200, { look: null });
    const text = msg.content.find((c) => c.type === 'text')?.text;
    const a = JSON.parse(text);
    const look = {
      g: a.gender === 'female' ? 'f' : 'm',
      skin: Math.max(0, MAP.skin.indexOf(a.skin)),
      hair: MAP.hair[a.hair] || 'short',
      hairC: Math.max(0, MAP.hairC.indexOf(a.hairColour)),
      top: MAP.top[a.top] || 'tee',
      hat: MAP.hat[a.headwear] || 'none',
      eyes: MAP.eyes[a.glasses] || 'none',
      face: MAP.face[a.facialHair] || 'none',
    };
    return send(res, 200, { look });
  } catch (err) {
    console.error('Selfie read failed:', err?.status || '', err?.message || err);
    return send(res, 200, { look: null });
  }
}
