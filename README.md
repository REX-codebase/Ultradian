<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/banner-dark.svg">
    <img src="assets/readme/banner-light.svg" alt="Ultradian — a focus engine for biological time" width="100%">
  </picture>
</p>

<p align="center">
  <img src="assets/readme/chips.svg" alt="Focus, Rhythm, League" />
</p>

<p align="center">
  <img src="assets/readme/marks.svg" alt="90-minute BRAC, four archetypes, 120 professions, SQI, verified hours" />
</p>

<p align="center">
  <img src="assets/readme/badges.svg" alt="React 19, TypeScript, Tailwind 4, Vite 6, Firebase, Vitest, PWA, Express, MIT" />
</p>

<p align="center">
  <video src="assets/readme/ultradian.mp4" width="100%" autoplay loop muted playsinline poster="assets/readme/ultradian-poster.png">
    <a href="assets/readme/ultradian.mp4">
      <img src="assets/readme/ultradian.webp" alt="A 10-second view of Ultradian Focus: name the work, choose Coding, begin a 90-minute wave." width="100%">
    </a>
  </video>
</p>

<p align="center"><em>A view of Focus.</em></p>

<br />

**Ultradian** is a focus engine for people who work in waves.

Attention is not a straight line. It rises and falls in roughly ninety-minute cycles — Kleitman's Basic Rest-Activity Cycle. Ultradian treats that cycle as the unit of work: a named task, a timed wave, an honest rest, and a record of how the session actually felt.

No kitchen-timer chrome. Paper, ink, and a clock large enough to think beside.

<p align="center">
  <a href="#the-cycle">The cycle</a> ·
  <a href="#three-rooms">Three rooms</a> ·
  <a href="#archetypes">Archetypes</a> ·
  <a href="#start">Start</a> ·
  <a href="#stack">Stack</a>
</p>

---

## The cycle

Kleitman described a Basic Rest-Activity Cycle of about 90 minutes. Ultradian builds the day from that length, then lets you grow into it.

| Preset | Focus | Rest | Recovery |
| --- | ---: | ---: | ---: |
| Level 1 · Apprentice | 45 | 10 | 20 |
| Level 2 · Adept | 60 | 15 | 25 |
| Level 3 · Ultradian Master | 90 | 20 | 30 |
| Flow State Peak | 110 | 25 | 35 |

Stamina unlocks in order. You do not start at ninety minutes because a setting exists. You earn the longer wave.

A session is more than a countdown. You name the work, tag it (`Coding`, `Writing`, `Design`, `Research`, `Strategy`, `Study`, `General`), and after the wave you can rate focus, energy before and after, and interruptions. That record is the ledger Rhythm reads.

---

## Three rooms

The product is three surfaces. One pulse.

### Focus — the clock

The home view is a command center, not a dashboard. The task sits in Instrument Serif. Categories are stone pills. The phase is a whisper of tracked caps — `FOCUS · LIVE` — above a clock face large enough to fill the room. Progress is a two-pixel line.

Around it:

- Soft transitions between work and rest, so the phase change is felt, not alarming
- Zen mode that puts the clock alone on paper
- Desktop notifications, tab-title countdown, and phase tones (Tibetan bowl, chime, marimba, synth rise, bell)
- Procedural soundscapes through the Web Audio API — nothing streamed, nothing licensed: Quiet, Alpha, Theta, Brown, Rain, Pink, White, Space
- A compact timer bar when you leave the room but keep the wave

### Rhythm — the ledger

Rhythm is where sessions become a week you can read.

- **Session Quality Index (SQI)** — 0–100 from four self-reported parts: focus (40), completion (25), interruption shield (20), energy retention (15)
- Tiers: *Deep Synchrony*, *Solid Build*, *Restorative Flow*, *Fragmented Focus*
- Weekly narrative of when the work actually landed
- Recovery prompts when the ledger says you skipped rest
- Progressive-overload banners as stamina levels open

SQI is not a biometric. It is derived from the ratings and timestamps you give. No heart rate, no webcam, no implied physiology.

### League — the tribe

Competitive standings exist, but only on verified work.

- Tiers: Wood → Bronze → Silver → Gold → Platinum → Diamond → Ultradian Master
- Ghost rivals calculated from people actually in the week
- Sample and demo sessions are filtered out of public rank
- Cloud sync for signed-in profiles; local ledger if you stay private

---

## Archetypes

Onboarding asks who you are at work. The answer sets default wave length, rest, category, and soundscape — and can name a ritual from your peak hour.

| | Builder | Creator | Scientist | Strategist |
| --- | --- | --- | --- | --- |
| People | Engineers, makers, craftsmen | Writers, designers, artists | Researchers, analysts, scholars | Founders, operators, leads |
| Default wave | 60 / 15 | 45 / 10 | 90 / 20 | 50 / 10 |
| Soundscape | Brown | Rain | Alpha | Space |
| Motto | Build with precision. | Shape the raw idea. | Question the assumption. | Chart the horizon. |

A hundred and twenty professions sit under those four. The ritual name is yours. The clock does not care what you call it.

---

## Start

Node 22+ and npm. The dev server is Express wrapping Vite, on port **3000**.

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Role |
| --- | --- |
| `GEMINI_API_KEY` | Optional. Unlocks post-session reflection and weekly narrative. Without it, those views fall back to rule-based copy. |
| `VIP_CODE` | Server secret for creator unlock. Never shipped in the client bundle. |
| `APP_URL` | Public origin for callbacks and self-links. |

Firebase client config lives in `firebase-applet-config.json` and can be overridden with `VITE_FIREBASE_*` variables. Auth supports email, Google, and an anonymous path. A VIP code, validated on the server, unlocks the full surface without an account.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Express + Vite on port 3000 |
| `npm run build` | Vite client build and bundled server |
| `npm start` | Run the production server |
| `npm run lint` | Typecheck (`tsc --noEmit`) |
| `npm test` | Vitest, once |
| `npm run test:watch` | Vitest, watch |
| `npm run test:coverage` | Coverage report |
| `npm run analyze` | Bundle composition |
| `npm run analyze:treemap` | Treemap of the bundle |

---

## Architecture

```
browser                    express :3000                 firebase
────────                   ──────────────                ────────
Focus / Rhythm / League    Vite middleware (dev)         Auth
Zen, soundscapes, PWA      POST /api/vip/validate        Firestore (named db)
local ledger               POST /api/gemini/*            Functions
                           rule-based fallbacks          App Check
```

Heavy rooms (`AnalyticsDashboard`, settings, post-session, VIP gate, share, onboarding) load through `React.lazy` and `Suspense`, behind an `ErrorBoundary`. The profession catalog is split from the module that consumes it so the first paint does not evaluate a hundred records it does not need.

Cloud Functions handle session writes, weekly league matchmaking, VIP claims, and optional insight generation. Insights never block the session: if the model is dark, the ledger still stands.

The VIP decision is documented in [docs/adr/001-server-side-vip-validation.md](docs/adr/001-server-side-vip-validation.md).

- Rate limit: 5 attempts / hour / IP on the server
- Client lockout sits in front of that, not instead of it
- Success can set a Firebase custom claim `{ vip: true }`
- The plaintext code is an environment secret, not a string in `src/`

---

## Test the parts that can lie

```bash
npm test
```

The suite is pointed at the places where a pretty UI can hide a wrong answer:

- `src/utils/__tests__/vipAccess.test.ts` — token parsing, server verification, lockout
- `src/utils/__tests__/sampleRhythm.test.ts` — sample-session detection so leagues stay clean
- `src/utils/__tests__/sessionAnalytics.test.ts` — the numbers Rhythm reports
- `src/components/__tests__/VipCodeGate.test.tsx` — unlock paths and lockout UI
- `functions/src/__tests__/ai.test.ts` — insight path with and without a key

---

## Stack

React 19 · TypeScript · Tailwind CSS 4 · Vite 6 · Motion · Lucide · Recharts

Express · dotenv · `@google/genai` (optional)

Firebase Auth, Firestore, Functions, App Check

Vitest · React Testing Library · vite-plugin-pwa

The surface is paper `#f7f4ef` and ink `#1c1917` in light, `#141210` and `#f5f2ec` in dark. Headings are Instrument Serif. The body is Inter. The clock is tabular, serif, and large.

---

## License

MIT.

Insights and scores come from the ratings and timestamps you enter. Ultradian does not measure a body and does not claim to.
