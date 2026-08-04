# Ultradian Focus Pulse

> A rhythm-aware focus companion for planning deep-work waves, taking intentional recovery breaks, and reviewing the focus patterns you build over time.

**[Open the live app →](https://ultradian-focus-pulse-agrim.ai.studio/)**

Ultradian Focus Pulse is a browser-based timer inspired by Basic Rest–Activity Cycle (BRAC) work/rest rhythms. It pairs a precise, background-resilient timer with configurable cycles, ambient soundscapes, post-session reflections, analytics, and optional Firebase-backed accounts and leaderboard sync.

## Highlights

- **Focused work and recovery timer** — start, pause, reset, skip, and switch between work, short-break, and long-break phases. The timer uses a target timestamp rather than decrementing alone, so it corrects for inactive/background tabs.
- **Ready-made rhythm presets** — choose Classic Ultradian (90/20), High Intensity Flow (60/15), Flow State Peak (110/25), or Sprint Burst (50/10); cycle lengths and long-break cadence are also configurable.
- **Intentional session capture** — label a task and category, record distractions, then reflect on focus quality, energy, and notes after a completed work wave.
- **Insights dashboard** — inspect weekly focus volume, category distribution, productivity by hour, completed waves, focus ratings, and an efficiency score.
- **Focus environment controls** — select generated ambient audio (alpha binaural, brown noise, rain/waves, or white noise), volume, completion sounds, desktop notifications, and an immersive Zen mode.
- **Personalized experience** — dark/light theme, daily cycle goal, auto-start behavior, custom username, and a live countdown in the browser tab.
- **Optional cloud features** — email/password, Google, and anonymous Firebase authentication; session synchronization; and a real-time public weekly leaderboard / shareable performance summary.
- **Guest-friendly** — visitors can enter a local sandbox without creating an account.

## Built with

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vite.dev/) + [Tailwind CSS 4](https://tailwindcss.com/)
- [Firebase Authentication](https://firebase.google.com/docs/auth) and [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Recharts](https://recharts.org/) for analytics
- Web Audio API, Notifications API, and `canvas-confetti`
- Lucide icons and Motion animations

## Quick start

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm (included with Node), or Bun if you prefer it
- A Firebase project only if you want to test authentication, sync, or the live leaderboard locally

### Install and run

```bash
git clone <your-fork-or-repository-url>
cd Ultradian
npm install
npm run dev
```

Open the address printed by Vite (normally [http://localhost:3000](http://localhost:3000)). The development server is configured to listen on `0.0.0.0`, which also makes it convenient for containerized previews.

You can use Bun instead:

```bash
bun install
bun run dev
```

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000. |
| `npm run build` | Type-check through Vite's build pipeline and create a production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally after building. |
| `npm run lint` | Run TypeScript validation with `tsc --noEmit`. |
| `npm run clean` | Remove generated build output. |

Before submitting a change, run:

```bash
npm run lint
npm run build
```

## Firebase setup (optional for local development)

The timer, settings, local session history, and guest sandbox work without a Firebase account. Cloud sign-in, session synchronization, and leaderboard updates require Firebase.

1. Create a Firebase project and register a **Web** app.
2. Enable the sign-in methods you plan to use in **Authentication → Sign-in method**:
   - Email/Password
   - Google
   - Anonymous (used by guest/sandbox flows when available)
3. Add your local host and deployed host under **Authentication → Settings → Authorized domains**. Google popup sign-in will fail if the host is not authorized.
4. Create a Cloud Firestore database and deploy the repository's `firestore.rules` with the Firebase CLI:

   ```bash
   firebase deploy --only firestore:rules
   ```

5. Replace the values in `firebase-applet-config.json` with the web-app configuration from your Firebase project. This client configuration is intentionally consumed by `src/utils/firebase.ts`; it is not a server secret.

The supplied rules allow each authenticated user to access only their own `users/{uid}` document and session subcollection, while the leaderboard is publicly readable. Review and tighten the rules to fit your own production privacy and moderation requirements before deployment.

> **Note:** `.env.example` documents `GEMINI_API_KEY` and `APP_URL` conventions used by the AI Studio environment. The current client application does not make Gemini API calls, so neither variable is needed to run the app locally. Never commit a real `.env` file.

## Data and privacy

- **Local-first:** settings, completed-session records, and local comparison data are stored in the browser's `localStorage` under `ultradian_focus_*` keys.
- **Cloud sync:** when a Firebase user is signed in, work-session records are merged with and written to that user's Firestore session collection. A derived aggregate is written to the leaderboard for comparison features.
- **Guest mode:** entering the sandbox avoids requiring a profile. Depending on whether Firebase Anonymous Authentication is enabled, it may use an anonymous Firebase account or remain local-only.
- **Browser permissions:** desktop alerts require notification permission. Ambient audio begins only after an interaction, in line with browser autoplay policies.

## Project structure

```text
.
├── src/
│   ├── components/          # Timer, controls, modals, analytics, and auth UI
│   ├── utils/
│   │   ├── audio.ts         # Web Audio sound effects and ambient generators
│   │   ├── firebase.ts      # Auth, Firestore session sync, leaderboard helpers
│   │   ├── notifications.ts # Desktop alerts and document-title countdown
│   │   └── storage.ts       # Local settings, presets, and session persistence
│   ├── App.tsx              # Application state and timer orchestration
│   ├── types.ts             # Shared domain types
│   └── index.css            # Global styles
├── firebase-applet-config.json
├── firestore.rules
├── vite.config.ts
└── .env.example
```

## How a focus wave works

1. Choose a preset (or adjust the rhythm in **Settings**) and add a task/category.
2. Start a work wave; optionally enable ambient sound or Zen mode.
3. Use the distraction control to track interruptions as they occur.
4. When the wave ends, complete the short reflection to save focus rating, energy, and notes.
5. Take the scheduled recovery break. After the configured number of work waves, the app switches to a long break.
6. Visit **Analytics** to review trends, or open the share panel to compare weekly stats.

## Deployment

Create a static production build with:

```bash
npm run build
```

Deploy the generated `dist/` directory to any static host that supports a single-page application. Configure an SPA fallback so client-side routes continue to resolve to `index.html` if you add routing in the future. For Firebase-backed deployments, authorize the final domain in Firebase Authentication and deploy reviewed Firestore rules.

## Contributing

1. Create a focused branch.
2. Make the smallest useful change and keep UI behavior accessible on small screens.
3. Run `npm run lint` and `npm run build`.
4. Open a pull request describing the user-facing change and any Firebase/rules implications.

## License

No license file is currently included in this repository. All rights are reserved unless a license is added by the project owner.
