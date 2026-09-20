# PawaVet

Clinic pilot workspace for staff sign-in, owners/patients, appointments, linked clinical records and staff-reviewed urgent intake. React/Vite frontend, Express API and PostgreSQL storage. This branch replaces the previous browser-only demo identity and data path.

## Start locally

1. Use Node 22 or newer; `npm ci`.
2. Copy `.env.example` to `.env`. Use a local database path for development or set `DATABASE_URL` to an existing Postgres database. Do not commit credentials.
3. Set `ADMIN_EMAIL`, a unique `ADMIN_PASSWORD` of at least 12 characters, `ADMIN_NAME`, and `CLINIC_NAME`. Run `npm run db:provision` once. It creates an empty clinic and its administrator in one transaction; an existing email produces a conflict, never an overwrite. Remove the provisioning password afterward.
4. Run `npm run dev`, or `npm run build` and `NODE_ENV=production npm start`.
5. Sign in with the provisioned account. Register an owner and patient, book an appointment, save a linked clinical record, and submit/review urgent intake. Create staff/owner accounts through Staff. Owner accounts must be linked to a registered owner. No invitation email is sent.

`npm run db:migrate` creates the initial tables without seeded accounts or patients. Local PGlite uses Postgres SQL and persists to disk; it is for one-process development/testing, not Vercel production. On Vercel, missing `DATABASE_URL` fails with 503. There is no fixture fallback or default administrator password.

## Verification bot

Run `npx playwright install --with-deps chromium` once, then `npm run verify`.

The bot builds the complete project, provisions two isolated synthetic clinics in a new temporary local database, starts the packaged production server, and checks:

- Health/database readiness, anonymous rejection, wrong-password rejection, real browser sign-in, session reload and logout revocation.
- Owner/patient creation, appointment status transitions, linked clinical record saving, reload and visibility from a separate session.
- Invalid relationships/date input, cross-clinic access denial, owner role restrictions, CSRF header requirement, overlap rejection and failed-save UI.
- Owner and staff urgent intake, staff-only acceptance/priority, and owner visibility of review results.
- Concurrent bookings and persistence across actual server restart.
- Password rotation/session revocation and mobile navigation/layout.

Reports are in `playwright-report/` and `test-results/`. The bot returns a nonzero exit code if a test fails. GitHub Actions runs it on pull requests and main/fix branch pushes. Credentials are generated per run, kept out of version control, and never printed. Traces are disabled to avoid retaining login bodies.

For an existing deployment, set `E2E_BASE_URL`, `E2E_EMAIL`, and `E2E_PASSWORD` for a dedicated synthetic clinic administrator, then `npm run test:e2e`. Default remote mode runs authentication and mobile smoke checks only; it does not modify records or rotate passwords. Set `E2E_ALLOW_WRITES=1` only for an isolated disposable clinic to run the patient/visit/record workflow remotely. Repeated remote writes require a clean synthetic clinic to avoid appointment conflicts. Local-only tests are explicitly skipped remotely, so a smoke pass is not equivalent to a full local test pass. Server restart/tenant tests cannot be inferred from a remote smoke pass.

A scheduled GitHub workflow can be added after production access and a dedicated synthetic account are configured. This change adds on-demand and per-change verification; it does not claim continuous production monitoring.

## Deploy to the existing Vercel project

The configuration builds Vite assets and routes `/api/*` to the exported Express function in `api/index.ts`. `build/server.js` is the standalone Node entrypoint; Vercel does not need to run `npm start`.

1. Configure a durable Postgres `DATABASE_URL` and the deployment's canonical `APP_URL` in the correct Vercel project/environment. Preview and production must not share clinical test data.
2. Run `npm run db:migrate` against that database, then provision the first clinic with `npm run db:provision` from a trusted terminal. Never expose provisioning as a public route.
3. Deploy the reviewed commit to preview. Verify `/api/health` returns JSON with `database: connected`, and unauthenticated `/api/clinic` returns 401 JSON, not SPA HTML.
4. Run the remote bot against a dedicated synthetic account. Validate provider-backed persistence and database restore before accepting real records.
5. Confirm Web Analytics/Speed Insights are enabled and receiving data. Components are enabled on Vercel builds, but installation is not evidence of telemetry delivery.
6. Promote only after the actual deployment checks pass.

As of September 20, 2026, the connected Vercel account returned 403 for the existing project's team. No production credentials/database configuration have been verified and no live deployment is asserted by this README.

## Boundaries

This is a clinic pilot implementation, not a complete paid SaaS. Email/SMS reminders, payment collection, telemedicine, AI generation, 2FA, self-service recovery, staff suspension/role editing, record amendments and automated backups are not available through this workspace. Unsupported operations do not report fake delivery/payment/AI success. The AI endpoint returns an explicit unavailable error. Owner views do not expose internal clinical records; a reviewed owner-facing summary/export remains future work. Urgent intake tracks review and priority but does not automatically create an encounter. Register a patient before intake.

Storage uses one transactional JSONB document per clinic for the pilot data, with SQL row locking for atomic updates/conflict checks. Users and hashed sessions have separate tables. This preserves isolation and avoids lost updates at pilot scale; normalized tables/pagination will be needed before larger datasets. Session cookies are HttpOnly, SameSite Strict, Secure on HTTPS/Vercel, expire in eight hours, and are backed by revocable server tokens. Passwords use salted scrypt. API authorization is server-enforced from session membership, never client-provided clinic/role IDs.

The unused legacy marketing/onboarding/dashboard/reminder/mock-data graph was removed because it referenced incompatible context contracts and caused the old 94 diagnostics. Its source remains in git history. Other legacy screen components remain unmounted for reference; the current workspace does not present their simulated services as live. npm is the canonical package manager; the stale bun lockfile was removed.
