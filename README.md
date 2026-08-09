# 🧠 Ultradian Pulse - Precision Focus Engine & Rhythm Tracker

**Ultradian Pulse** is a high-performance productivity application designed around biological ultradian rhythms (90-minute Basic Rest-Activity Cycles). Built with React 19, TypeScript, Tailwind CSS 4, Google Gemini AI, and Firebase.

---

## 🚀 Key Features

* **Biological Ultradian Engine:** Built-in 90-minute work and recovery cycle presets customized across 4 archetypes (Builder, Creator, Scientist, Strategist) and 110+ professions.
* **Secure Server-Validated VIP Access:** Server-side passcode verification (`/api/vip/validate`) with rate limiting and brute-force protection.
* **AI Rhythm Insights & Journal:** Powered by Gemini 3.6 Flash for qualitative post-session reflections and weekly narrative reports.
* **Interactive Soundscape Generator:** Procedural Web Audio binaural beats (Alpha 40Hz / Theta 6Hz), brown noise, rain waves, and deep space acoustics.
* **Tribal Leaderboards & Competitive Leagues:** Community rank tracking with sample session filtering.
* **Adaptive Code Splitting & Performance:** Lazy-loaded views and modals with `Suspense` and `ErrorBoundary` protections.

---

## 🛡️ Security Architecture

### Server-Side VIP Code Validation
* **API Route:** `POST /api/vip/validate`
* **Environment Variable:** `VIP_CODE` (configured via `.env`)
* **Rate Limiting:** IP-based tracking enforcing a maximum of 5 attempts per hour.
* **Client Lockout:** Dual-layer lockout (2 max failed attempts client-side, 5/hr server-side).
* **ADR Documentation:** See [docs/adr/001-server-side-vip-validation.md](docs/adr/001-server-side-vip-validation.md) for full architectural design.

---

## 🧪 Testing Infrastructure

The project uses **Vitest** and **React Testing Library** for fast, reliable unit and component testing.

### Running Tests

```bash
# Run unit & component tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage Focus Areas
* `src/utils/__tests__/vipAccess.test.ts`: VIP server verification, token parsing, and rate-limit handling.
* `src/utils/__tests__/sampleRhythm.test.ts`: Sample session detection and 14-day data generator logic.
* `src/components/__tests__/VipCodeGate.test.tsx`: Dual unlock options and lockout UI rendering.

---

## ⚡ Performance & Bundle Analysis

* **Code Splitting:** Major modals and dashboard sections (`AnalyticsDashboard`, `SettingsModal`, `PostSessionModal`, `VipCodeGate`, etc.) are lazy-loaded via React `lazy` and `Suspense`.
* **Data File Splitting:** Extracted 110+ profession database records from `professions.ts` into `professions-data.ts` to reduce initial bundle evaluation overhead.
* **Bundle Analysis:**

```bash
# Analyze bundle composition
npm run analyze

# Treemap visualization
npm run analyze:treemap
```

---

## 🛠️ Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server (Port 3000)
npm run dev
```

---

## 📜 License

MIT License - Created for AI Studio.
