# PawaVet

## Current implemented scope

- Password-verified clinic sign-in; HttpOnly sessions with expiry, revocation and server-side screen lock.
- PostgreSQL clinics, users, memberships, owners and patients. Patient creation and updates wait for a committed write. Clinic and owner access is enforced by the API, including direct requests.
- Clinic staff roles and suspensions use the same membership authority as sign-in. Authoritative audit events commit with each patient mutation.
- Persistent urgent-care intake from staff and linked owner accounts. Staff alone accept/decline requests and assign priorities. Concurrent updates use a version check; duplicate active requests are rejected.
- Strict TypeScript checking and production build are required in CI.

This branch is **not a complete clinic launch**. Appointments, SOAP charting, prescription signatures, invoices/payments, reminder delivery, AI, telehealth, self-signup, staff invitations, email password recovery and 2FA remain unavailable in the operational UI. Existing demonstration components remain in Git history/source for subsequent migration; they are not evidence of operating services. Nothing marks a reminder sent, a bill paid or clinical findings generated without an implemented service.

## Local setup

Use Node 22+ and npm (the sole maintained lockfile is `package-lock.json`).

1. `npm ci`
2. Set server-only `DATABASE_URL` and `APP_ORIGIN` using `.env.example` as a guide. Use a provider-verified TLS connection in production. No database or default administrator is created automatically.
3. `npm run db:migrate`
4. Run `npm run clinic:create` and provide one JSON object through stdin with `clinicName`, `name`, `email` and a unique `password` of 12–256 characters. Keep this input outside git, shell history and logs. This is an operator provisioning command, not a public registration endpoint. One clinic membership per account is the current UI scope.
5. `npm run dev`

Owner account access requires an operator-created `PET_OWNER` membership and an explicit `owners.user_id` link. Matching a name or email alone never grants access. Staff invitations and owner account provisioning UI are subsequent work.

## Deployment

- Standalone Node: `npm run build`, then `NODE_ENV=production npm start`. Serve behind HTTPS with the exact public `APP_ORIGIN` and a durable PostgreSQL database. The frontend is in `dist`; the server output is separate in `server-dist`.
- Vercel: `api/index.ts` and `vercel.json` route `/api/*` to Express while serving the Vite frontend. Set `DATABASE_URL` and `APP_ORIGIN` in the intended Vercel environment, run migrations against that database, and provision the initial clinic securely. Vercel routing and production environment activation have **not** been verified in this workspace.
- `/api/health` reports 503 when database setup is missing or unavailable; it does not claim readiness from a successful frontend build.
- Sessions use secure cookies in production. A changed/suspended membership takes effect on the next API request; the browser refreshes identity periodically and clears clinic screens on unauthorized responses.

No production credentials, real records, billing provider or messaging provider were provisioned by this change. Do not merge/deploy an unconfigured branch over a relied-on frontend: the new sign-in correctly requires a configured backend and clinic account.

## Verification

- `npm run typecheck` checks **all** TypeScript files in strict mode.
- `npm test` exercises Express routes with PGlite's PostgreSQL engine, synthetic users and a persistent test database. Covers wrong credentials, CSRF, clinic/owner isolation, invalid input, locked/revoked/expired sessions, membership changes, transactional failure rollback, urgent queue authority/conflicts, process/database restart, backup restoration and password changes.
- `npm run build` includes typecheck and bundles the Node server.

PGlite tests exercise PostgreSQL semantics but are not a substitute for a live managed PostgreSQL/TLS/deployment test. Before real records, configure and test encrypted backups and restore with the selected provider, verify login/patient updates in two browsers and confirm cross-clinic denial on the actual host.

## Audit follow-through

The old unmounted `mockData`, `ClinicDashboard`, `StaffAndAuditView`, `RemindersEngine`, `CreateReminderModal`, `NotificationDrawer`, `LeadDemoModal` and `ClinicOnboardingWizard` were removed after checking imports. They used incompatible older context contracts. Current requirements were not changed to satisfy those obsolete modules; urgent intake was implemented explicitly with staff-controlled acceptance/priority.

Security implementation references: [Node crypto](https://nodejs.org/api/crypto.html), [node-postgres transactions](https://node-postgres.com/features/transactions).
