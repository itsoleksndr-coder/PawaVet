import {
  test,
  expect,
  request as requests,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { totpCode } from "../server/mfa";
import type { ClinicSnapshot } from "../src/clinic-model";
let service: ChildProcess;
let database = "";
let accounts: Array<{
  email: string;
  password: string;
  id: string;
  clinicId: string;
}>;
let savedPet = "";
let savedAppointment = "";
let ownerId = "";
let ownerEmail = "";
let ownerPassword = "";
const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:4317";
const remote = !!process.env.E2E_BASE_URL;
const headers = {
  "X-PawaVet-Request": "1",
  "Content-Type": "application/json",
};
let serverOutput = "";
const secrets = new Map<string, string>();
let savedRecoveryCode = "";
const mfaKey = Buffer.alloc(32, 7).toString("base64");
async function apiLogin(api: APIRequestContext, email: string, password: string) {
  const first = await api.post("/api/auth/login", { data: { email, password } });
  expect(first.status()).toBe(200);
  const challenge = await first.json();
  expect(challenge.requires2FA).toBe(true);
  if (challenge.enrollmentSecret) secrets.set(email, challenge.enrollmentSecret);
  const secret = secrets.get(email) || process.env.E2E_TOTP_SECRET;
  if (!secret) throw new Error("Set E2E_TOTP_SECRET for an enrolled remote account.");
  const confirmed = await api.post("/api/auth/login", {
    data: { email, password, totpCode: totpCode(secret) },
  });
  expect(confirmed.status()).toBe(200);
  return confirmed;
}
async function start() {
  service = spawn(process.execPath, ["build/server.js"], {
    env: {
      ...process.env,
      DATABASE_URL: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_BILLING_MODE: "test",
      RESEND_API_KEY: "",
      PASSWORD_RESET_FROM: "",
      BILLING_ENFORCED: "false",
      NODE_ENV: "production",
      PORT: "4317",
      APP_URL: baseURL,
      LOCAL_DATABASE_PATH: database,
      MFA_ENCRYPTION_KEY: mfaKey,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  service.stdout?.on("data", (v) => {
    serverOutput += v.toString();
  });
  service.stderr?.on("data", (v) => {
    serverOutput += v.toString();
  });
  await expect
    .poll(
      async () => {
        try {
          return (await fetch(baseURL + "/api/health")).status;
        } catch {
          return 0;
        }
      },
      {
        timeout: 30000,
        message:
          "Server must connect to the initialized database: " + serverOutput,
      },
    )
    .toBe(200);
}
async function stop() {
  if (service && !service.killed) {
    service.kill("SIGTERM");
    await new Promise<void>((resolve) => service.once("exit", () => resolve()));
  }
}
async function login(
  page: Page,
  email = accounts[0].email,
  password = accounts[0].password,
) {
  await page.goto("/");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByLabel("Verification code")).toBeVisible();
  const setup = page.getByTestId("mfa-secret");
  if (await setup.count()) secrets.set(email, (await setup.textContent())!.trim());
  const secret = secrets.get(email) || process.env.E2E_TOTP_SECRET;
  if (!secret) throw new Error("Missing authenticator secret for synthetic account.");
  await page.getByLabel("Verification code").fill(totpCode(secret));
  await page.getByRole("button", { name: "Verify and sign in" }).click();
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible();
}
async function client(index = 0) {
  const api = await requests.newContext({ baseURL, extraHTTPHeaders: headers });
  await apiLogin(api, accounts[index].email, accounts[index].password);
  return api;
}
async function state(api: APIRequestContext): Promise<ClinicSnapshot> {
  const r = await api.get("/api/clinic");
  expect(r.status()).toBe(200);
  return r.json();
}
test.describe.configure({ mode: "serial" });
test.beforeAll(async () => {
  if (remote) {
    if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD)
      throw new Error(
        "Set E2E_EMAIL and E2E_PASSWORD for a provisioned synthetic account.",
      );
    accounts = [
      {
        email: process.env.E2E_EMAIL,
        password: process.env.E2E_PASSWORD,
        id: "",
        clinicId: "",
      },
    ];
  } else {
    execFileSync(
      process.execPath,
      ["--import", "tsx", "scripts/test-seed.ts"],
      { stdio: "pipe" },
    );
    const seed = JSON.parse(readFileSync(".test-state.json", "utf8"));
    database = seed.database;
    accounts = seed.accounts;
    await start();
  }
});
test.afterAll(async () => {
  if (!remote) await stop();
});

test("health, protected API, wrong password, real sign-in, reload, logout revocation", async ({
  page,
}) => {
  const api = await requests.newContext({ baseURL, extraHTTPHeaders: headers });
  const health = await api.get("/api/health");
  expect(health.status()).toBe(200);
  expect((await health.json()).database).toBe("connected");
  expect((await api.get("/api/clinic")).status()).toBe(401);
  await page.goto("/");
  await page.getByLabel("Email", { exact: true }).fill(accounts[0].email);
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Invalid email or password",
  );
  await page.getByLabel("Password", { exact: true }).fill(accounts[0].password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByLabel("Verification code")).toBeVisible();
  // Password-only auth must not create a clinic session.
  expect((await api.get("/api/clinic")).status()).toBe(401);
  const setupSecret = remote ? process.env.E2E_TOTP_SECRET! : (await page.getByTestId("mfa-secret").textContent())!.trim();
  if (!remote) savedRecoveryCode = (await page.getByTestId("mfa-recovery").textContent())!.trim().split(/\s+/)[0];
  secrets.set(accounts[0].email, setupSecret);
  await page.getByLabel("Verification code").fill("00000x");
  await page.getByRole("button", { name: "Verify and sign in" }).click();
  await expect(page.getByRole("alert")).toContainText("Invalid verification code");
  await page.getByLabel("Verification code").fill(totpCode(setupSecret));
  await page.getByRole("button", { name: "Verify and sign in" }).click();
  await expect(
    page.getByRole("heading", { name: "Clinic overview" }),
  ).toBeVisible();
  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name.endsWith("pawavet_session"));
  expect(session?.httpOnly).toBeTruthy();
  expect(session?.sameSite).toBe("Strict");
  if (baseURL.startsWith("https:")) expect(session?.secure).toBeTruthy();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Clinic overview" }),
  ).toBeVisible();
  const oldCookies = await page.context().storageState();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sign in to your clinic" }),
  ).toBeVisible();
  const revoked = await requests.newContext({
    baseURL,
    storageState: oldCookies,
    extraHTTPHeaders: headers,
  });
  expect((await revoked.get("/api/clinic")).status()).toBe(401);
  await revoked.dispose();
  await api.dispose();
});

test("MFA recovery codes are single use; password alone never opens a session", async () => {
  test.skip(remote, "Recovery tests use local disposable accounts only.");
  const first = await requests.newContext({ baseURL, extraHTTPHeaders: headers });
  const challenge = await first.post("/api/auth/login", {
    data: { email: accounts[0].email, password: accounts[0].password },
  });
  expect(challenge.status()).toBe(200);
  expect((await challenge.json()).requires2FA).toBe(true);
  expect((await first.get("/api/clinic")).status()).toBe(401);
  const redeemed = await first.post("/api/auth/login", {
    data: { email: accounts[0].email, password: accounts[0].password, totpCode: savedRecoveryCode },
  });
  expect(redeemed.status()).toBe(200);
  expect((await first.get("/api/clinic")).status()).toBe(200);
  await first.dispose();
  const second = await requests.newContext({ baseURL, extraHTTPHeaders: headers });
  const rejected = await second.post("/api/auth/login", {
    data: { email: accounts[0].email, password: accounts[0].password, totpCode: savedRecoveryCode },
  });
  expect(rejected.status()).toBe(401);
  expect((await second.get("/api/clinic")).status()).toBe(401);
  await second.dispose();
});

test("patient → visit → clinical record persists across reload and a second session", async ({
  page,
  browser,
}) => {
  test.skip(
    remote && process.env.E2E_ALLOW_WRITES !== "1",
    "Remote writes require a dedicated synthetic clinic and E2E_ALLOW_WRITES=1.",
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);
  await page.getByRole("button", { name: "Patients", exact: true }).click();
  const owner = page.getByRole("form", { name: "Register owner" });
  await owner.getByLabel("Owner name").fill("Synthetic Owner " + Date.now());
  await owner.getByLabel("Owner email").fill("owner@example.test");
  await owner.getByLabel("Phone").fill("787-555-0100");
  await owner.getByLabel("Owner consented to email reminders").check();
  await owner.getByLabel("Owner consented to SMS reminders").check();
  await owner.getByRole("button", { name: "Save owner" }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  const pet = page.getByRole("form", { name: "Register patient" });
  await pet.getByLabel("Pet name").fill("Luna E2E");
  await pet.getByLabel("Owner", { exact: true }).selectOption({ index: 1 });
  await pet.getByRole("button", { name: "Save patient" }).click();
  await expect(
    page.getByRole("heading", { name: "Luna E2E", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Appointments", exact: true }).click();
  const apt = page.getByRole("form", { name: "Schedule appointment" });
  await apt.getByLabel("Patient", { exact: true }).selectOption({ index: 1 });
  await apt.getByLabel("Clinician").selectOption({ index: 1 });
  await apt.getByLabel("Date", { exact: true }).fill("2030-01-15");
  await apt.getByLabel("Reason for visit").fill("Synthetic wellness visit");
  await apt.getByRole("button", { name: "Book appointment" }).click();
  await expect(
    page.getByText("Status: Scheduled", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Check in", exact: true }).click();
  await expect(
    page.getByText("Status: Checked-in", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start visit", exact: true }).click();
  await expect(
    page.getByText("Status: In progress", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Records", exact: true }).click();
  const record = page.getByRole("form", { name: "Create medical record" });
  await record
    .getByLabel("Patient", { exact: true })
    .selectOption({ index: 1 });
  await record.getByLabel("Linked appointment").selectOption({ index: 1 });
  await record
    .getByLabel("Chief complaint")
    .fill("Synthetic verification only");
  await record
    .getByLabel("Diagnosis", { exact: true })
    .fill("Test entry — no clinical assessment");
  await record.getByRole("button", { name: "Save clinical record" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Luna E2E — Synthetic verification only",
    }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Records", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Luna E2E — Synthetic verification only",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Appointments", exact: true }).click();
  await page
    .getByRole("button", { name: "Complete visit", exact: true })
    .click();
  await expect(
    page.getByText("Status: Completed", { exact: true }),
  ).toBeVisible();
  const context = await browser.newContext();
  const second = await context.newPage();
  await login(second);
  await second.getByRole("button", { name: "Records", exact: true }).click();
  await expect(
    second.getByRole("heading", {
      name: "Luna E2E — Synthetic verification only",
    }),
  ).toBeVisible();
  await context.close();
  const api = await client();
  const data = await state(api);
  savedPet = data.pets.find((p) => p.name === "Luna E2E")!.id;
  ownerId = data.pets.find((p) => p.id === savedPet)!.ownerId;
  savedAppointment = data.appointments.find((a) => a.petId === savedPet)!.id;
  expect(
    data.medicalRecords.some((r) => r.appointmentId === savedAppointment),
  ).toBeTruthy();
  expect(data.pets.find((p) => p.id === savedPet)?.vaccinationStatus).toBe(
    "Unknown",
  );
  await api.dispose();
  expect(errors).toEqual([]);
});

test("consented reminders queue exactly once and cancellation/opt-out stops unsent messages", async () => {
  test.skip(remote, "Local isolated queue verification.");
  const api = await client();
  const future = {
    petId: savedPet,
    veterinarianId: accounts[0].id,
    date: "2030-07-12",
    time: "09:00 AM",
    durationMinutes: 30,
    reason: "Reminder test",
    type: "Wellness Exam",
  };
  const booked = await api.post("/api/appointments", { data: future });
  expect(booked.status()).toBe(201);
  const appointment = await booked.json();
  const jobs = await api.get("/api/reminders");
  expect(jobs.status()).toBe(200);
  const myJobs = (await jobs.json()).reminders.filter((j: { appointment_id: string }) => j.appointment_id === appointment.id);
  expect(myJobs.map((j: { channel: string }) => j.channel).sort()).toEqual(["email", "sms"]);
  expect(myJobs.every((j: { status: string }) => j.status === "pending")).toBe(true);
  expect(new Date(myJobs[0].due_at).toISOString()).toBe("2030-07-11T13:00:00.000Z");
  const cancelled = await api.patch("/api/appointments/" + appointment.id, { data: { status: "Cancelled" } });
  expect(cancelled.status()).toBe(200);
  const gone = (await (await api.get("/api/reminders")).json()).reminders
    .filter((j: { appointment_id: string }) => j.appointment_id === appointment.id);
  expect(gone.every((j: { status: string }) => j.status === "cancelled")).toBe(true);
  const optOut = await api.patch("/api/owners/" + ownerId + "/reminder-preferences", {
    data: { emailReminderConsent: false, smsReminderConsent: false },
  });
  expect(optOut.status()).toBe(200);
  const without = await api.post("/api/appointments", {
    data: { ...future, date: "2030-07-13" },
  });
  expect(without.status()).toBe(201);
  const newId = (await without.json()).id;
  expect((await (await api.get("/api/reminders")).json()).reminders
    .filter((j: { appointment_id: string }) => j.appointment_id === newId)).toHaveLength(0);
  const reConsent = await api.patch("/api/owners/" + ownerId + "/reminder-preferences", {
    data: { emailReminderConsent: true, smsReminderConsent: true },
  });
  expect(reConsent.status()).toBe(200);
  const requeued = (await (await api.get("/api/reminders")).json()).reminders
    .filter((j: { appointment_id: string }) => j.appointment_id === newId);
  expect(requeued.map((j: { channel: string }) => j.channel).sort()).toEqual(["email", "sms"]);
  expect(requeued.every((j: { status: string }) => j.status === "pending")).toBe(true);
  await api.dispose();
});

test("remember me creates a revocable 30-day cookie only after MFA; AI requires provider", async () => {
  test.skip(remote, "Local server with known synthetic configuration only.");
  const api = await requests.newContext({ baseURL, extraHTTPHeaders: headers });
  const challenge = await api.post("/api/auth/login", {
    data: { email: accounts[0].email, password: accounts[0].password, rememberMe: true },
  });
  expect(challenge.status()).toBe(200);
  expect((await challenge.json()).requires2FA).toBe(true);
  expect((await api.get("/api/clinic")).status()).toBe(401);
  const verified = await api.post("/api/auth/login", {
    data: { email: accounts[0].email, password: accounts[0].password, rememberMe: true, totpCode: totpCode(secrets.get(accounts[0].email)!) },
  });
  expect(verified.status()).toBe(200);
  expect(verified.headers()["set-cookie"]).toContain("Max-Age=2592000");
  const unavailable = await api.post("/api/support/chat", {
    data: { agent: "appointments", message: "Can I change an appointment?", history: [] },
  });
  expect(unavailable.status()).toBe(503);
  expect((await unavailable.json()).error).toContain("IA");
  const unauth = await requests.newContext({ baseURL, extraHTTPHeaders: headers });
  expect((await unauth.post("/api/support/chat", {
    data: { agent: "billing", message: "Need help" },
  })).status()).toBe(401);
  await unauth.dispose();
  expect((await api.post("/api/auth/logout", { data: {} })).status()).toBe(200);
  expect((await api.get("/api/clinic")).status()).toBe(401);
  await api.dispose();
});

test("invalid input, overlap, cross-clinic access, role restrictions and failed-save UI", async ({
  page,
}) => {
  test.skip(remote, "Local isolated negative/security tests.");
  const a = await client();
  const b = await client(1);
  const before = await state(a);
  expect(
    (
      await b.patch("/api/pets/" + savedPet, { data: { name: "Unauthorized" } })
    ).status(),
  ).toBe(404);
  expect(
    (
      await b.post("/api/records", {
        data: {
          petId: savedPet,
          appointmentId: savedAppointment,
          chiefComplaint: "bad",
          diagnosis: "bad",
        },
      })
    ).status(),
  ).toBe(404);
  expect((await state(b)).pets).toHaveLength(0);
  expect(
    (
      await a.post("/api/pets", {
        data: { name: "bad", species: "dog", ownerId: "wrong-owner" },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await a.post("/api/appointments", {
        data: {
          petId: savedPet,
          veterinarianId: accounts[0].id,
          date: "2030-01-15",
          time: "09:00 AM",
          reason: "overlap",
          type: "Wellness Exam",
        },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await a.post("/api/appointments", {
        data: {
          petId: savedPet,
          veterinarianId: accounts[0].id,
          date: "2030-02-31",
          time: "09:00 AM",
          reason: "invalid date",
          type: "Wellness Exam",
        },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await a.patch("/api/appointments/" + savedAppointment, {
        data: { status: "Scheduled" },
      })
    ).status(),
  ).toBe(409);
  const noHeader = await requests.newContext({
    baseURL,
    storageState: await a.storageState(),
  });
  expect(
    (
      await noHeader.post("/api/owners", {
        data: { name: "CSRF", email: "a@b.test", phone: "x" },
      })
    ).status(),
  ).toBe(403);
  await noHeader.dispose();
  ownerEmail = "owner-login@example.test";
  ownerPassword = randomBytes(24).toString("base64url");
  expect(
    (
      await a.post("/api/staff", {
        data: {
          name: "Synthetic Owner",
          email: ownerEmail,
          password: ownerPassword,
          role: "PET_OWNER",
          ownerId,
        },
      })
    ).status(),
  ).toBe(201);
  const owner = await requests.newContext({
    baseURL,
    extraHTTPHeaders: headers,
  });
  await apiLogin(owner, ownerEmail, ownerPassword);
  expect(
    (
      await owner.post("/api/records", {
        data: {
          petId: savedPet,
          appointmentId: savedAppointment,
          chiefComplaint: "no",
          diagnosis: "no",
        },
      })
    ).status(),
  ).toBe(403);
  expect((await state(owner)).medicalRecords).toHaveLength(0);
  await login(page);
  await page.getByRole("button", { name: "Patients", exact: true }).click();
  await page.route("**/api/pets", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Synthetic database outage" }),
    }),
  );
  const form = page.getByRole("form", { name: "Register patient" });
  await form.getByLabel("Pet name").fill("Must not save");
  await form.getByLabel("Owner", { exact: true }).selectOption({ index: 1 });
  await form.getByRole("button", { name: "Save patient" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Synthetic database outage",
  );
  await expect(form.getByLabel("Pet name")).toHaveValue("Must not save");
  await expect(page.getByRole("status")).toHaveCount(0);
  expect((await state(a)).pets).toHaveLength(before.pets.length);
  await Promise.all([a.dispose(), b.dispose(), owner.dispose()]);
});

test("owner and staff urgent intake with staff-only acceptance and priority", async ({
  page,
  browser,
}) => {
  test.skip(remote, "Local isolated owner/staff workflow.");
  await login(page);
  await page.getByRole("button", { name: "Urgent care", exact: true }).click();
  const form = page.getByRole("form", { name: "Urgent request" });
  await form.getByLabel("Patient", { exact: true }).selectOption({ index: 1 });
  await form.getByLabel("Presenting concern").fill("Synthetic staff intake");
  await form.getByRole("button", { name: "Submit urgent request" }).click();
  await expect(
    page.getByText(
      "Pending review · Priority: Awaiting review · Submitted by staff",
    ),
  ).toBeVisible();
  const context = await browser.newContext();
  const owner = await context.newPage();
  await login(owner, ownerEmail, ownerPassword);
  await owner.getByRole("button", { name: "Urgent care", exact: true }).click();
  const ownForm = owner.getByRole("form", { name: "Urgent request" });
  await ownForm
    .getByLabel("Patient", { exact: true })
    .selectOption({ index: 1 });
  await ownForm.getByLabel("Presenting concern").fill("Synthetic owner intake");
  await ownForm.getByRole("button", { name: "Submit urgent request" }).click();
  await expect(
    owner.getByText(
      "Pending review · Priority: Awaiting review · Submitted by owner",
    ),
  ).toBeVisible();
  const ownerApi = owner.request;
  const data = (await (
    await ownerApi.get("/api/clinic")
  ).json()) as ClinicSnapshot;
  const intake = data.urgentIntakes.find(
    (u) => u.concern === "Synthetic owner intake",
  )!;
  expect(
    (
      await ownerApi.patch("/api/urgent-intakes/" + intake.id, {
        headers,
        data: { status: "Accepted", priority: 1 },
      })
    ).status(),
  ).toBe(403);
  await page.getByRole("button", { name: "Refresh data" }).click();
  const card = page
    .locator("article")
    .filter({ hasText: "Synthetic owner intake" });
  await card.getByLabel("Priority (1 first)").selectOption("2");
  await card.getByRole("button", { name: "Save review" }).click();
  await expect(
    card.getByText("Accepted · Priority: 2 · Submitted by owner"),
  ).toBeVisible();
  await owner.reload();
  await owner.getByRole("button", { name: "Urgent care", exact: true }).click();
  await expect(
    owner.getByText("Accepted · Priority: 2 · Submitted by owner"),
  ).toBeVisible();
  await context.close();
});

test("concurrent bookings cannot both claim the same clinician time", async () => {
  test.skip(remote, "Local isolated concurrency test.");
  const a = await client();
  const b = await client();
  const data = {
    petId: savedPet,
    veterinarianId: accounts[0].id,
    date: "2030-01-16",
    time: "09:00 AM",
    reason: "Race test",
    type: "Wellness Exam",
  };
  const results = await Promise.all([
    a.post("/api/appointments", { data }),
    b.post("/api/appointments", { data }),
  ]);
  expect(results.map((r) => r.status()).sort()).toEqual([201, 409]);
  await a.dispose();
  await b.dispose();
});

test("records and sessions survive server restart; password change revokes all sessions", async ({
  page,
}) => {
  test.skip(remote, "Local process restart and password rotation only.");
  const api = await client();
  const before = await state(api);
  await stop();
  await start();
  const after = await state(api);
  expect(after.pets).toEqual(before.pets);
  expect(after.medicalRecords).toEqual(before.medicalRecords);
  expect(after.urgentIntakes).toEqual(before.urgentIntakes);
  const old = accounts[0].password;
  const next = randomBytes(24).toString("base64url");
  expect(
    (
      await api.post("/api/auth/password", {
        data: { oldPassword: old, newPassword: next },
      })
    ).status(),
  ).toBe(200);
  expect((await api.get("/api/clinic")).status()).toBe(401);
  expect(
    (
      await api.post("/api/auth/login", {
        data: { email: accounts[0].email, password: old },
      })
    ).status(),
  ).toBe(401);
  accounts[0].password = next;
  await login(page);
  await api.dispose();
});

test("mobile layout and navigation have no page errors or horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  for (const section of [
    "Patients",
    "Appointments",
    "Records",
    "Urgent care",
    "Staff",
    "Account",
  ]) {
    await page.getByRole("button", { name: section, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  expect(errors).toEqual([]);
  await page.screenshot({
    path: "test-results/mobile-clinic.png",
    fullPage: true,
  });
});

test("subscription return cannot grant access and missing provider disables checkout", async ({
  page,
}) => {
  test.skip(remote, "Isolated local billing configuration only");
  const api = await client();
  await page.context().addCookies((await api.storageState()).cookies);
  await page.goto("/?billing=success");
  await expect(
    page.getByRole("heading", { name: "Clinic subscription" }),
  ).toBeVisible();
  await expect(page.getByText("Status: not subscribed")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open test checkout" }),
  ).toBeDisabled();
  expect((await api.post("/api/billing/checkout", { data: {} })).status()).toBe(
    503,
  );
  expect((await api.post("/api/billing/webhook", { data: {} })).status()).toBe(
    503,
  );
  const anonymous = await requests.newContext({
    baseURL,
    extraHTTPHeaders: headers,
  });
  expect((await anonymous.get("/api/billing/status")).status()).toBe(401);
  await anonymous.dispose();
  await api.dispose();
});

test("password recovery refuses missing email configuration and malformed reset links", async () => {
  test.skip(remote, "Local configuration and negative-case check.");
  const client = await requests.newContext({ baseURL, extraHTTPHeaders: headers });
  const requestReset = await client.post("/api/auth/recovery/request", {
    data: { email: accounts[0].email },
  });
  expect(requestReset.status()).toBe(503);
  expect((await requestReset.json()).error).toContain("not configured");
  const badToken = await client.post("/api/auth/recovery/confirm", {
    data: { token: "not-a-token", newPassword: "a-very-long-new-password" },
  });
  expect(badToken.status()).toBe(400);
  await client.dispose();
});
