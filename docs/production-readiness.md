# Production readiness — 2026-09-21

Status: NO-GO for real clinic records or paid subscriptions.

This change repairs the build and creates a clearly identified preview. It does not implement a production authentication or database service. Do not interpret a successful build or `/api/health` response as launch approval. `/api/ready` returns 503 until the missing services are implemented and verified.

## Changes

- TypeScript is now a required build step. Removed eight unreferenced legacy components/data modules that used a superseded context/schema; their source remains in Git history. No active route imported them.
- Production server is compiled as ESM and starts with `NODE_ENV=production`. Serverless API routing is declared for Vercel, but has not been deployed or verified there.
- New visitors explicitly choose a sample clinic rather than automatically becoming a clinic administrator. This is demo navigation, not authentication. The dashboard carries a persistent preview notice.
- Removed public access to sample lead contacts, volatile lead capture, and fabricated AI clinical responses. Unimplemented services return explicit errors.
- AI view now makes an actual API request and displays failure; it does not generate canned clinical findings. Reminder dispatch is disabled instead of reporting an unsent message as delivered.
- API tests, Playwright preview checks and a GitHub Actions build/startup gate are included.

## Remaining release requirements

1. Real server-verified accounts, secure sessions, logout/revocation, recovery and role permissions. Existing role switching, 2FA, password and lock-screen logic remains a simulation inside the preview.
2. Persistent database with clinic isolation enforced on the server, migrations and backups. Prove that records survive reload/restart and that a second clinic cannot read or change them.
3. Urgent-care intake from owners and staff, with staff controlling acceptance and priority. Verify this separately from the existing appointment queue UI.
4. Real reminder provider and scheduled dispatch, consent handling, retries, and verified provider delivery status. No message should be marked sent based on a UI click.
5. Clinic subscription checkout at the agreed $250/month, verified payment webhooks, and subscription entitlements. Current invoice payment actions are simulations.
6. Authenticated, rate-limited AI provider integration with explicit failure handling and clinician review of generated content. Live telemedicine is also unimplemented.
7. End-to-end tests with dedicated nonproduction clinic accounts covering sign-in, create/edit/reload records, cross-clinic denial, urgent care, reminder delivery and test-mode subscription payment.

## Access blocker

The GitHub connection has repository access. Vercel lists no accessible teams. A request for the known project scope `itsoleksndr-3199s-projects` returns 403 and explicitly requires reauthentication to that scope (team `team_O6SxNXp6TY9LbuxszHJLG0uD`). The owner must reconnect Vercel with access to this team before deployment settings, environment variables, runtime logs or a production deployment can be verified.

## Reproduce

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm start
```

API tests validate denial/error behavior and readiness. Browser tests exercise the preview; they are deliberately not proof of real account authentication or persistence.

## Validation in this workspace

- `npm test`: 5 tests passed.
- `npm run lint` and `npm run build`: passed.
- Compiled server startup: passed; `/api/health` returned 200 JSON, `/api/ready` returned 503, and `/appointments` served the SPA.
- Browser execution is blocked: Chromium is absent and its download timed out. Playwright tests are written but have not passed here. CI installs Chromium and runs them; inspect its result before merging.
- Vercel routing and live production remain unverified because of the team access denial.
