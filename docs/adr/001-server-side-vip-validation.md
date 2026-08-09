# ADR 001: Server-Side VIP Code Validation Architecture

* **Status:** Accepted
* **Date:** 2026-08-08
* **Authors:** AI Engineering Team

---

## 1. Context & Problem Statement

In earlier versions of **Ultradian Pulse**, VIP passcode verification was evaluated purely client-side within JavaScript utility modules (`src/utils/vipAccess.ts`). This pattern caused critical security concerns:
1. The plaintext passcode (`akamsirji1234`) was embedded directly in compiled browser bundles.
2. Any user could inspect browser sources or network payloads to extract full VIP access without authorization.
3. Client-side attempt tracking in `localStorage` could be bypassed by clearing browser cache or manipulating state.

---

## 2. Decision Drivers

* **Security First:** Never expose passcodes or master keys in client-side code bundles.
* **Rate Limiting & Anti-Brute-Force:** Enforce strict velocity checks on verification attempts.
* **Backward Compatibility:** Preserve existing localStorage fallback state without breaking current VIP users.
* **Zero Infrastructure Overhead:** Stay within Cloud Run / Firebase free tier constraints.

---

## 3. Considered Options

1. **Option A (Current):** Client-side validation using obfuscated code strings. (Rejected due to vulnerability to basic reverse-engineering)
2. **Option B (Server-Side Endpoint):** Shift passcode check to Express backend server route (`/api/vip/validate`) backed by `process.env.VIP_CODE` and in-memory rate limiting. (Selected)
3. **Option C (Firebase Cloud Functions + Firestore Secret Manager):** Fully serverless architecture. (Deferred to future scale; Express API fits current architecture)

---

## 4. Decision Outcome

We selected **Option B**. The validation flow now operates as follows:

```
[Client UI] ──(POST /api/vip/validate { code })──► [Express Backend]
                                                         │
                                               [1. Check Rate Limit (5/hr)]
                                                         │
                                               [2. Compare vs process.env.VIP_CODE]
                                                         │
[Client UI] ◄──(JSON { success, token })─────────────────┘
```

### Key Components

1. **Server Route (`server.ts`):**
   * Endpoint: `POST /api/vip/validate`
   * Environment Variable: `VIP_CODE` (stored in `.env` / environment runtime)
   * Rate Limiting: IP-keyed bucket restricting users to **5 validation attempts per hour**.

2. **Client Utility (`src/utils/vipAccess.ts`):**
   * Asynchronous `validateVipCode(code: string)` calling `/api/vip/validate`.
   * Enforces 2 max failed attempts before locking out input client-side.
   * Stores a temporary verification token upon server approval.

3. **Firestore Security Rules (`firestore.rules`):**
   * Protected rules for `vip_users`, `vip_sessions`, and `rate_limits` collections checking `request.auth.token.vip_status == true`.

---

## 5. Consequences

### Positive
* **High Security:** No secrets stored in frontend bundles.
* **Brute-Force Protection:** Rate limiting mitigates automated attacks.
* **Improved Analytics:** Server logs attempt velocity and lockout events.

### Negative / Trade-offs
* Requires active network connection to validate VIP passcodes.
* In-memory rate limiting resets on Cloud Run container cold starts (mitigated by Firestore backup logging).
