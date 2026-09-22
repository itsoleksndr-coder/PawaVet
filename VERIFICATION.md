# Verification result — September 20, 2026

**Local clinic workflow: PASS. Existing public deployment: NO-GO pending deployment/configuration.**

The original default branch was `e07967914d4e4a4792bd2b7a48a1f09bec5c868f`.

| Boundary | Result | Evidence |
| --- | --- | --- |
| Full TypeScript check | Pass | `npm run lint` exits 0; previously 94 diagnostics. No blanket source exclusion or diagnostic suppression added. |
| Frontend + packaged backend build | Pass | `npm run build` exits 0, with typecheck included. ESM server output replaces the broken CommonJS/import.meta combination. |
| Browser/API/database workflow | Pass | All eight Playwright tests passed in the latest `npm run verify` run (10.4 seconds for browser tests), plus six isolated billing tests. |
| Authentication | Pass locally | Wrong password rejected, HttpOnly/SameSite cookie checked, valid sign-in survives reload, logout invalidates copied session, password change revokes sessions. |
| Persistence | Pass locally | Patient, appointment, linked record and urgent intake stored in explicit local Postgres/PGlite database; values survive actual server termination/restart and are visible in another authorized browser. |
| Authorization and write failures | Pass locally | Anonymous/other-clinic/owner-restricted requests denied; invalid date/relationship rejected; failed-save input retained without success message. |
| Booking concurrency | Pass locally | Two simultaneous conflicting bookings return one 201 and one 409. |
| Urgent intake | Pass locally | Both submission routes work; owner cannot accept/prioritize; staff review is visible to owner after reload. |
| Mobile | Pass locally | 390×844 viewport, core navigation, no page errors or horizontal overflow. Screenshot inspected. |
| Existing public URL | Not ready | GET `https://pawa-vet.vercel.app/` returned 200 HTML. `/api/health` and `/api/auth/session` returned 404. |
| Production control-plane access | Blocked | Existing Vercel project/team request returned 403 requiring authentication to `itsoleksndr-3199s-projects`. |
| Production database/telemetry | Not verified | No production DATABASE_URL, schema, account provisioning, hosted persistence or telemetry receipt inspected. |

Tests used Node 24.19.0 and Chromium in this workspace. The normal Playwright browser download timed out, so a packaged Chromium binary was used through `BROWSER_EXECUTABLE_PATH`; all UI interactions were real browser actions against the packaged Node server. An additional agent-browser daemon could not start in this environment; Playwright supplied the browser verification and screenshots. The CI workflow uses Playwright's standard Chromium installation on Node 22.

No real patient data, external emails or payment transactions were used. The earlier clinic-workflow commit passed GitHub Actions (run 35490613965). Its Vercel preview reported a successful build but redirected browser access to Vercel login; this is not proof of a functioning hosted app. The subscription update requires its own CI result. No main-branch merge or production promotion is part of this verification result.

## Remaining launch requirements

- Restore access to the existing Vercel team/project and configure its durable Postgres database and canonical APP_URL.
- Apply schema and provision a dedicated clinic account; deploy the reviewed branch to preview and run the remote bot.
- Verify real Postgres/provider connectivity, migration/backup/restore, Vercel API routing, and production telemetry receipt. Local PGlite proof does not substitute for these hosted checks.
- Review the narrowed pilot UI and documented unavailable services in README. Paid launch requires real Stripe test-mode checkout/webhook/portal verification, live account setup, business terms/support/tax review, and the hosted clinic checks. Reminders and AI remain excluded from this release; they are not sold as implemented features.

## Subscription update

Six billing tests pass using a synthetic Stripe gateway and an isolated SQL database. They verify fixed price validation, duplicate checkout serialization, real SDK webhook signature verification, event deduplication, latest-state reconciliation, paid-period access checks and customer isolation. An eighth browser test proves that `?billing=success` grants no entitlement and missing Stripe configuration disables checkout. These are code-level proofs; no real Stripe hosted checkout, renewal, payment failure, portal cancellation or webhook delivery has been exercised.

## Concise launch brief

**GO:** local demonstration of the verified clinic workflow using synthetic data. Subscription UI may be demonstrated as an unconfigured/test integration.

**NO-GO:** paid production launch today. Existing production API routing is not verified fixed; access to its Vercel team is blocked, hosted Postgres/persistence/restore and telemetry delivery remain unverified, and only a Stripe test account is connected.

**Offer prepared:** $250 USD per clinic per month for staff access, patient records, appointments and staff-reviewed urgent intake, with assisted account provisioning. No email delivery, AI, telemedicine or patient payment processing is included.

**Release gate:** restore project access; configure isolated hosted database and credentials; deploy this branch; run the remote bot and provider persistence/restore checks; verify real Stripe test checkout/webhook/portal; complete live billing and business setup; promote only after those checks pass. No main merge or paid launch is claimed.
