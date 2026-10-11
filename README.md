# ✦ Dreams for GenerationS

*BF2026 ✦ Our privilege to give ✦ Let's rise up!.*

A mobile-first web app where people make a pixel character (optionally starting from a
selfie), pick their CG, write down a dream, and float into a shared pixel night sky under
the GENERATIONS building. Everyone stands on their own little cloud with a thought bubble
showing their dream's symbol. Tap anyone to read their dream, filter by CG, swipe through
them, and tap **✦ Me too** on the ones you share.

There's one link for everyone: `https://YOUR-APP.vercel.app/`

No framework and no build step. Fonts are self-hosted. The only package is the Anthropic
SDK, used for the optional selfie reading.

```
public/
  index.html, style.css
  fonts/         Pixelify Sans, Press Start 2P, Silkscreen (SIL Open Font License)
  js/main.js     screens, builder UI, dream space, dream card
  js/avatar.js   the pixel character renderer, plus the dream symbols
  js/space.js    the night sky: stars, moon, clouds, sleeping town, where people stand
  js/building.js the pixel GENERATIONS building (12 floors, top 4 lit up)
  js/photo.js    selfie cropping, colour sampling, the pixelate animation
api/             Vercel serverless functions
  dreams.js      list / add / edit dreams, "me too"
  analyze.js     optional: reads a selfie once and pre-picks character options
  _lib.js        shared helpers + database access (not an endpoint)
schema.sql       database tables (paste into Supabase)
dev.mjs          local test server (`npm run dev`)
```

## How it works

1. **Open the link.** "Share a dream" or "Look around".
2. **Name, CG and selfie.** CG is a dropdown (LE1, LE3, LE5, LE7). The selfie is optional and never stored.
3. **Make your character.** The selfie pre-fills the colours, then they customise. Each menu stays inside the
   screen and has its own chunky scrollbar (drag it, tap the track, or swipe the menu):
   - **Body:** male/female, 9 skin tones, cheeks (blush, rosy, freckles, sparkle, plaster), 6 facial hair options
   - **Face:** 8 eye styles (incl. heart eyes, starry), 7 mouths, glasses, round glasses, shades, star shades, heart shades, visor, monocle
   - **Hair:** 22 styles (incl. quiff, undercut, fringe, half up, locs), 16 colours
   - **Outfit:** 17 tops (incl. polo, jersey, cardigan, apron, raincoat, lab coat, grad gown), 7 bottoms, 20 colours, 10 shoe colours
   - **Hats:** 18 options (incl. party hat, halo, cat ears, cowboy hat, wizard hat, hijab), with a hat colour
   - **Hold:** 23 props (incl. Bible, bubble tea, sparkler, kite, guitar, camera, trophy…)
   - **Pet:** cat, dog, bunny, chick, hamster, frog, bird or goldfish
   - **Extras:** scarf, necklace, bow tie, tie, lanyard, medal, backpack, cape or wings, with a colour
   - **Shuffle** for a random look
4. **Write your dream** (up to 600 characters) and pick a symbol for the thought bubble:
   Faith, Hope, Love, Others, Leadership, Learning, Growth, Happiness, Career, Home, Relationships, Music.
5. **Into the sky.** Their character pops in with a "YOU" marker. Newest dreams are at the top.
6. **Read and share.** Filter the sky by CG (or **Everyone**). Tap anyone to open their dream card; swipe or
   use ◀ ▶ to read on, or use **Read all** / **Random**. **✦ Me too** adds one to a dream's count (once per phone).
   **Find me** scrolls to your own character.
7. **Edit.** From the same phone, "Edit my dream" changes the character, CG, symbol or text.

Built for about 50 people: the sky grows taller as people join and scrolls down. It checks
for new dreams every 15 seconds.

---

## Deploy (about 15 minutes)

### 1. Database: Supabase (free)
1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query**, paste `schema.sql`, click **Run**.
3. Copy two values:
   - **Project URL** (`https://abcdefgh.supabase.co`): click **Connect** at the top of the dashboard, or **Project Settings → Data API**.
   - **Secret key:** **Project Settings → API Keys → Secret keys** (starts with `sb_secret_...`).
     The legacy `service_role` key (starts with `eyJ...`) also works. Don't use the publishable/anon key.

The secret key stays on the server in Vercel; it is never sent to browsers.

### 2. Selfie reading (optional)
Without a key, the app samples skin, hair and shirt colours from the selfie in the
browser. With a key, Claude looks at the selfie once and also picks hairstyle, top,
glasses, facial hair and body type. The selfie is never stored.

1. Sign in at [platform.claude.com](https://platform.claude.com) and add a little credit
   (a Claude.ai subscription doesn't include API use).
2. **Settings → API keys → Create key**. Copy it straight away (starts with `sk-ant-...`).

It uses Claude Haiku 4.5 by default. Each read is one small request. `MAX_SELFIE_READS`
(default 150) caps the total, and failed or capped reads quietly fall back to colour sampling.
To use a different model, set `ANTHROPIC_MODEL` (for example `claude-haiku-5-5`, which is newer and cheaper).

### 3. Hosting: Vercel (free Hobby plan)
1. Push this folder to a **private** GitHub repo, then in [Vercel](https://vercel.com)
   **Add New → Project** and import it. Framework preset: **Other**. Leave build settings empty.
   (Or run `npx vercel` from this folder.)
2. **Settings → Environment Variables**:

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | From step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | The secret key from step 1 |
| `ANTHROPIC_API_KEY` | Optional, from step 2 |
| `SPACE_TITLE` | Optional, default `Dreams for GenerationS` |
| `SPACE_TAGLINE` | Optional, default `BF2026 ✦ Our privilege to give ✦ Let's rise up!` |
| `CG_OPTIONS` | Optional, default `LE1,LE3,LE5,LE7` |
| `MAX_DREAMERS` | Optional, default `100` |
| `MAX_SELFIE_READS` | Optional, default `150` |
| `ANTHROPIC_MODEL` | Optional, default `claude-haiku-4-5` |

3. **Redeploy** so the variables take effect, test on your phone, then share the link.

### Before sharing
- Delete your test dreams in Supabase: **Table Editor → dreams** → select rows → delete.
- Anyone with the link can read every dream, so share it with the people you mean to.
- To take a dream down later, delete its row the same way.

---

## Run locally

```bash
npm install
cp .env.example .env     # everything is optional locally
npm run dev              # http://localhost:3000
```

Without Supabase settings, local data lives in memory and is lost on restart. On Vercel
the app refuses to run without a database, so nothing is silently lost. The "Take selfie"
camera button needs HTTPS on most phones, so it works once deployed; "Choose photo" works locally.

## Customising
- Characters and dream symbols: `public/js/avatar.js` (palettes and options at the top; each part is a small drawing function).
- The sky: `public/js/space.js` (`SKY` colours, `drawMoon`, `drawHills`, `drawCloud`).
- The building: `public/js/building.js`.
- Colours and fonts: variables at the top of `public/style.css`.
- Wording: `public/index.html`.
