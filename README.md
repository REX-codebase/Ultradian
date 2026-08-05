# Ultradian Pulse

**Basic Rest-Activity Cycle (BRAC) Companion**

> Your brain runs on ~90-minute ultradian waves. Most productivity apps ignore this. Ultradian Pulse doesn’t.

Live: **[ultradian.ai.studio](https://ultradian.ai.studio)**

---

## What is this?

Ultradian Pulse is a focus timer built around real human ultradian rhythms (Basic Rest-Activity Cycles) instead of arbitrary 25-minute Pomodoros.

Work in deep 75–90 minute monotasking waves → take real recovery → repeat. Track everything. Compete on a leaderboard. Reflect after every session. Stay in flow longer.

This is not another timer with a fancy ring. It’s a full system for high-performance deep work that respects how your prefrontal cortex actually operates.

---

## Features

### Core Timer
- Customizable Ultradian presets (work / short break / long break)
- Precise timer that doesn’t drift when the tab is backgrounded
- Beautiful animated Timer Ring
- Fullscreen Zen Mode (distraction-free)
- Desktop notifications + dynamic tab title

### Ambient Sound Engine
Procedural Web Audio ambient generator:
- Alpha binaural beats
- Brown noise
- Rain / waves
- White noise
- Adjustable volume, zero external audio files

### Session Reflection & Analytics
After every work block you log:
- Focus rating (1–5)
- Energy before/after
- Distraction count
- Category (Coding, Writing, Design, Research, Strategy, Study…)
- Free-form notes

Then you get:
- Weekly insights dashboard (Recharts)
- Completed cycles tracking
- Focus score calculation
- Category breakdowns

### Social / Competitive Layer
- Real-time leaderboard (Firebase)
- Weekly hours + cycles + focus score comparison
- Social share badge
- Local “friends” for private competition

### Auth & Sync
- Firebase Auth (Email/Password, Google, Anonymous/Guest)
- Cloud session history + leaderboard sync
- Local-first with seamless cloud merge

### Polish
- Smooth dark/light mode with origin-based transition spectacle
- Motion animations
- Confetti on completions
- Fully responsive

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS 4 |
| Animation | Motion |
| Charts | Recharts |
| Auth + DB | Firebase (Auth + Firestore) |
| Audio | Web Audio API (procedural) |
| AI | Google GenAI (Gemini) ready |
| Runtime | Bun |

---

## Local Development

```bash
# Clone
git clone https://github.com/REX-codebase/Ultradian.git
cd Ultradian

# Install (Bun recommended)
bun install

# Environment
cp .env.example .env
# Fill in your Firebase + any Gemini keys

# Run
bun run dev
```

App runs on `http://localhost:3000`

---

## Project Structure

```
src/
├── components/
│   ├── TimerRing.tsx
│   ├── ZenMode.tsx
│   ├── AmbientPlayer.tsx
│   ├── AnalyticsDashboard.tsx
│   ├── LoginScreen.tsx
│   ├── Navbar.tsx
│   ├── PostSessionModal.tsx
│   ├── SocialShareModal.tsx
│   ├── SettingsModal.tsx
│   └── ThemeTransitionSpectacle.tsx
├── utils/
│   ├── audio.ts          # Procedural ambient engine
│   ├── firebase.ts       # Auth + Firestore
│   ├── notifications.ts
│   └── storage.ts        # Local persistence
├── types.ts
└── App.tsx
```

---

## Philosophy

Most tools optimize for *feeling productive*.  
Ultradian Pulse optimizes for **actual sustained high-quality output** aligned with biology.

75–90 minutes of extreme monotasking → 15 minutes of genuine recovery → repeat.  
Protect the first two cycles of the day like your life depends on it.  
Track what actually worked.  
Compete if it helps. Ignore the rest.

---

Built by [REX](https://github.com/REX-codebase)  
Ship real tools. Respect the biology.

---

**Live demo → [ultradian.ai.studio](https://ultradian.ai.studio)**
