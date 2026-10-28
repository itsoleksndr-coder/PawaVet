# PawaVet

Clinic pilot workspace for staff sign-in, owners/patients, appointments, linked clinical records and staff-reviewed urgent intake. React/Vite frontend, Express API and PostgreSQL storage. This branch replaces the previous browser-only demo identity and data path.

## Start locally

1. Use Node 22 or newer; `npm ci`.
2. Copy `.env.example` to `.env`. Use a local database path for development or set `DATABASE_URL` to an existing Postgres database. Do not commit credentials.
3. Set `ADMIN_EMAIL`, a unique `ADMIN_PASSWORD` of at least 12 characters, `ADMIN_NAME`, and `CLINIC_NAME`. Run `npm run db:provision` once. It creates an empty clinic and its administrator in one transaction; an existing email produces a conflict, never an overwrite. Remove the provisioning password afterward.
4. Run `npm run dev`, or `npm run build` and `NODE_ENV=production npm start`.
5. Sign in with the provisioned account. Register an owner and patient, book an appointment, save a linked clinical record, and submit/review urgent intake. Create staff/owner accounts through Staff. Owner accounts must be linked to a registered owner. No invitation email is sent.

`npm run db:migrate` creates the initial tables without seeded accounts or patients. Local PGlite uses Postgres SQL and persists to disk; it is for one-process development/testing, not Railway production. In Railway, missing `DATABASE_URL` fails with 503. There is no fixture fallback or default administrator password.

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

## Deploy to Railway

`railway.json` builds the Vite assets, runs the idempotent migration as a Railway pre-deploy command, starts the standalone Express server and checks `/api/health`. Railway must provide a durable PostgreSQL service and inject its `DATABASE_URL`.

1. Create separate Railway environments for staging and production. Configure a durable PostgreSQL `DATABASE_URL` and the deployment's canonical HTTPS `APP_URL`; never share clinical test data.
2. Run `npm run db:migrate` against that database, then provision the first clinic with `npm run db:provision` from a trusted terminal. Never expose provisioning as a public route.
3. Deploy the reviewed commit to preview. Verify `/api/health` returns JSON with `database: connected`, and unauthenticated `/api/clinic` returns 401 JSON, not SPA HTML.
4. Run the remote bot against a dedicated synthetic account. Validate provider-backed persistence and database restore before accepting real records.
5. Set Railway healthcheck path to `/api/health`, confirm the service listens on Railway's injected `PORT`, and review deployment logs for migration success.
6. Promote only after hosted checks pass and launch approval is recorded.

## Boundaries

This is an assisted-onboarding clinic pilot with subscription integration awaiting hosted verification. Patient payment collection, telemedicine, clinical AI generation, self-service password recovery, staff suspension/role editing, record amendments and automated backups are not available through this workspace. Unsupported operations do not report fake delivery/payment/AI success. The AI endpoint returns an explicit unavailable error. Owner views do not expose internal clinical records; a reviewed owner-facing summary/export remains future work. Urgent intake tracks review and priority but does not automatically create an encounter. Register a patient before intake.

Storage uses one transactional JSONB document per clinic for the pilot data, with SQL row locking for atomic updates/conflict checks. Users and hashed sessions have separate tables. This preserves isolation and avoids lost updates at pilot scale; normalized tables/pagination will be needed before larger datasets. Session cookies are HttpOnly, SameSite Strict, Secure on HTTPS, expire in eight hours, and are backed by revocable server tokens. Passwords use salted scrypt. API authorization is server-enforced from session membership, never client-provided clinic/role IDs.

The unused legacy marketing/onboarding/dashboard/reminder/mock-data graph was removed because it referenced incompatible context contracts and caused the old 94 diagnostics. Its source remains in git history. Other legacy screen components remain unmounted for reference; the current workspace does not present their simulated services as live. npm is the canonical package manager; the stale bun lockfile was removed.

## Clinic subscriptions — $250 USD per month

The clinic administrator can open hosted Stripe Checkout and the billing portal from Subscription. The server validates the configured monthly price and clinic membership; callers cannot supply a price, customer or clinic identifier. Signed webhooks retrieve the latest subscription state and update durable billing records. Duplicate checkout attempts reuse a session, and duplicate/stale events cannot restore canceled access. Only an active, unexpired subscription permits clinical changes when `BILLING_ENFORCED=true`; existing records remain readable. A checkout return URL never activates access.

Setup is assisted, not public self-service signup. Provision the clinic administrator first. In an isolated test environment:

1. Create a Stripe product and recurring **25000 USD cents / month** price; configure its ID, a matching test secret key, `STRIPE_BILLING_MODE=test`, and canonical `APP_URL`. Keep keys server-only.
2. Configure the Stripe customer portal to support payment-method updates, invoices and cancellation. Do not offer unsupported plan switches.
3. Register `/api/billing/webhook` with API version `2026-08-26.dahlia` (the installed SDK default), subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`. Set that endpoint's signing secret.
4. Run migrations, set `BILLING_ENFORCED=true`, and verify hosted test checkout, webhook receipt, activation after reload, duplicate clicks, portal cancellation, failed payment and readable records after expiry. Local automated tests use an injected synthetic Stripe gateway; they do **not** prove real Stripe checkout or event delivery.
5. Before live use, connect the correct live Stripe account, publish actual terms/privacy and billing support, and review tax obligations/registrations and price tax treatment. This implementation does not enable Stripe Tax automatically. Set `TERMS_URL`, `PRIVACY_URL`, `SUPPORT_EMAIL`, HTTPS `APP_URL`, and the live price/key/webhook secret. Set `BILLING_TAX_REVIEWED=true` and `BILLING_LAUNCH_APPROVED=true` only after completing those reviews and hosted verification. Both flags and enforcement are required for live checkout.

`npm run test:billing` covers server price validation, concurrent checkout attempts, signature tampering, entitlement enforcement, portal customer isolation and stale/duplicate webhook handling against an isolated local SQL database. `npm run verify` includes it plus the browser bot. The connected Stripe account was test-only at verification time; no live product, charge or subscription has been created by this work.


## Required two-factor authentication (pending staging verification)

All staff, administrators and pet-owner accounts must enter a password AND an authenticator app code for every login. The first password check starts required TOTP setup, provides an authenticator key for manual entry and ten one-time recovery codes. No session is issued until an app code verifies the account. Existing sessions are invalidated by the `mfa_verified` session column, which defaults to false. Subsequent logins accept a six-digit app code or one saved recovery code. Recovery codes are stored as hashes and consumed atomically.

Before activating this change in Railway:
1. Generate a secure random 32-byte key and configure its base64 encoding as `MFA_ENCRYPTION_KEY` in the production service secret variables. Preserve the key outside the service securely: losing/rotating it without a migration will lock out accounts with enrolled MFA.
2. Run the database migration and verify account enrollment, logout, clinic isolation and owner access in a staging database. Existing sessions will be rejected after this deployment.
3. Establish a manual identity-verified procedure for users who lose both an authenticator and recovery codes. This change deliberately provides no email or administrator bypass.
4. Clear dependency security issues and run the browser/API verification suite. Neither deployment nor hosted verification is asserted by this branch.

The UI supports manual authenticator key entry; a QR code is not yet implemented. Self-service password recovery and outbound SMS/email are separate future functions.


## Remember me (30 days)
The sign-in screen offers a **Recuérdame** checkbox. Only after successful password and mandatory authenticator validation does it create a durable 30-day HttpOnly/SameSite/HTTPS-only cookie and a matching revocable server session; unchecked sign-in uses a browser session cookie with an 8-hour server limit. Logout and password changes revoke the server session. Closing a browser does not force another sign-in if the 30-day option was selected, the cookie was retained, and the session has not been revoked. After the web app's idle-lock triggers, unlocking requires the second factor again and preserves the remember-me selection.

## Appointment reminders (code complete, provider activation outstanding)
The app persists opt-in notification jobs in PostgreSQL on future appointment creation. New owner registration and owner preference forms have explicit, separate email/SMS consent flags; both default to off. Sending is intended 24h before the appointment in `America/Puerto_Rico` (UTC-4 year-round), or on the next worker run for a short-notice booking. Cancellation or consent withdrawal cancels pending jobs. A staff-only Reminders view displays statuses. The worker checks the latest appointment and consent before attempting delivery.

For **email** (Resend), configure `RESEND_API_KEY` and a verified `REMINDER_FROM_EMAIL`. For **SMS** (Twilio), configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_FROM_NUMBER` with Puerto Rico-capable messaging permissions. Validate sender/domain compliance and recipients' consent. SMS destinations must be valid PR/+1 numbers. **Only after completing provider tests**, set `REMINDERS_WORKER_ENABLED=true` in Railway and keep a continuously running worker. This pilot runs the worker once a minute in the application process, with database row locking for concurrent replicas. On an ambiguous provider outcome, the job is marked `unknown` for review, not silently retried, to reduce duplicate messages. The worker must not be represented as sending notifications until the actual providers are configured and live tests succeed. The application only reports that a message was accepted by the provider, not delivered to an inbox or handset.

## Four AI support specialists (code complete, provider activation outstanding)
The Support tab exposes Citas/recordatorios, Cuentas/acceso, Facturación and Soporte técnico, each with distinct model instructions. They use the OpenAI Responses API through the backend, never an invented canned answer. Configure `OPENAI_API_KEY` on Railway and optionally `OPENAI_MODEL` (default `gpt-4.1-mini`), then verify actual API replies with a synthetic account. Until configured, the endpoint explicitly returns 503 without pretending that assistance was generated. Authenticated sessions and per-account throttling protect the endpoint. Requests use `store=false`; no patient records or database tables are passed automatically to the provider. The support specialists are available on-demand while the web service and third-party provider are operating. They are not independent background agents, cannot modify appointments, and make no uptime guarantee.

## Deployment checklist for the above features
1. Keep this feature branch as a draft PR until all tests pass and a staging environment has exercised the workflows.
2. Configure and securely back up `MFA_ENCRYPTION_KEY`, verified notification provider credentials, and the AI provider API key directly in Railway's protected variables. Never paste secrets into code, chat, tickets or PRs.
3. Verify sender/phone ownership, opt-in records, recovery operations, missing-provider responses and provider acceptance on synthetic test recipients.
4. Re-run `npm run verify`, check an independent dependency vulnerability audit, then test on a staged instance. A successful build alone is not proof of end-to-end message delivery.
5. Merge and deploy only after the production authentication/key migration and rollback plan have been reviewed.
