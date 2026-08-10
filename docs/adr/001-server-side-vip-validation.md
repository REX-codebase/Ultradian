# ADR 001: Server-Side VIP Code Validation & Custom Claims Architecture

* **Status:** Accepted (Updated August 2026)
* **Date:** 2026-08-08
* **Authors:** AI Engineering Team

---

## 1. Context & Problem Statement

In earlier versions of **Ultradian Pulse**, VIP passcode verification was evaluated client-side within JavaScript utility modules (`src/utils/vipAccess.ts`). This pattern caused critical security concerns:
1. The plaintext passcode was embedded directly in compiled browser bundles.
2. Any user could inspect browser sources or network payloads to extract VIP access without authorization.
3. Client-side attempt tracking in `localStorage` could be bypassed by clearing browser cache.

---

## 2. Decision Drivers

* **Zero Client Secrets:** Never expose passcodes or master keys in client-side code bundles.
* **Custom Auth Claims & Cloud Functions:** Set custom claim `{ vip: true }` on Firebase Auth tokens upon server verification.
* **Rate Limiting & Anti-Brute-Force:** Enforce strict velocity checks on verification attempts per IP/user.
* **Seamless Local Fallback:** Support Express endpoint `/api/vip/validate` proxy for local dev environments.

---

## 3. Decision Outcome

We unified VIP validation into a secure, server-side protocol:

```
[Client UI] ──(validateVipCode({ code }))──► [Cloud Function / Express Server]
                                                    │
                                          [1. Rate Limit Check]
                                                    │
                                          [2. Match vs process.env.VIP_CODE]
                                                    │
                                          [3. Set Firebase Custom Claim { vip: true }]
                                                    │
[Client UI] ◄──(JSON { success, token })────────────┘
```

### Key Components

1. **Cloud Function / Server Endpoint (`functions/src/vip.ts` & `server.ts`):**
   * Callable Cloud Function `validateVipCode({ code })` and Express route `POST /api/vip/validate`.
   * Environment Variable: `VIP_CODE` (stored in runtime secrets).
   * Rate Limiting: Keyed bucket restricting callers to 5 attempts per window.
   * Admin Auth Claim: Sets `customUserClaims = { vip: true }` on authenticated user token upon success.

2. **Client Services (`src/services/vipService.ts` & `src/utils/vipAccess.ts`):**
   * Asynchronous `validateVipCode(code: string)` delegating 100% to server verification.
   * Zero hardcoded secret strings in client bundle.

3. **Firestore Security Rules (`firestore.rules`):**
   * Leaderboard and league collections are restricted to server writes (`allow write: if false;`).

---

## 4. Consequences

### Positive
* **Zero Client Secret Exposure:** frontend bundles contain no passcodes or secret fallbacks.
* **Cryptographic Authorization:** Custom Auth Claims enforce server-backed authorization.
* **Brute-Force Protection:** Velocity controls mitigate brute-force attempts.
