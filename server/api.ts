import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { db, type Sql } from "./db";
import { digest, hashPassword, verifyPassword } from "./security";
import { newTotpSecret, encryptTotp, decryptTotp, verifyTotp, recoveryCodes } from "./mfa";
import { queueAppointmentReminders, cancelAppointmentReminders, updateOwnerReminders } from "./reminders";
import { supportRequest, supportAnswer } from "./support";
import * as input from "./validation";
import {
  ROLE_PERMISSIONS,
  type User,
  type Clinic,
  type Permission,
  type AppointmentStatus,
} from "../src/types";
import { type ClinicData } from "../src/clinic-model";

import {
  BillingError,
  billingStatus,
  checkout,
  portal,
  stripeClient,
  reconcileEvent,
  requireSubscription,
} from "./billing";

export const api = express();
api.disable("x-powered-by");
if (process.env.VERCEL) api.set("trust proxy", 1);
api.post(
  "/api/billing/webhook",
  express.raw({ type: "application/json", limit: "128kb" }),
  async (req, res) => {
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET)
        return res.status(503).json({ error: "Webhook is not configured." });
      const client = stripeClient();
      let event;
      try {
        event = client.webhooks.constructEvent(
          req.body,
          req.get("stripe-signature") || "",
          process.env.STRIPE_WEBHOOK_SECRET,
        );
      } catch {
        return res.status(400).json({ error: "Invalid webhook signature." });
      }
      await reconcileEvent(event, client);
      return res.json({ received: true });
    } catch (error) {
      return res
        .status(error instanceof BillingError ? error.status : 503)
        .json({ error: "Webhook could not be processed. Retry required." });
    }
  },
);
api.use(express.json({ limit: "128kb" }));
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const route =
  (
    fn: (req: Request, res: Response) => Promise<unknown>,
  ): express.RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
const cookieName =
  process.env.VERCEL || process.env.APP_URL?.startsWith("https:")
    ? "__Host-pawavet_session"
    : "pawavet_session";
const cookieOptions = {
  httpOnly: true,
  secure: cookieName.startsWith("__Host-"),
  sameSite: "strict" as const,
  path: "/",
};
function token(req: Request) {
  return (
    (req.headers.cookie || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(cookieName + "="))
      ?.slice(cookieName.length + 1) || ""
  );
}
function safeUser(user: User): User {
  const { passwordHash: _hash, twoFactorSecret: _secret, ...safe } = user;
  return safe;
}
api.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    // Require JSON and an application header for CSRF protection; no cross-origin CORS allowed.
    if (!req.is("application/json") || req.get("X-PawaVet-Request") !== "1")
      return res
        .status(403)
        .json({ error: "Invalid request origin or content type." });
    const expected = process.env.APP_URL;
    if (
      expected &&
      req.get("origin") &&
      req.get("origin") !== new URL(expected).origin
    )
      return res.status(403).json({ error: "Cross-origin request rejected." });
    if (req.get("sec-fetch-site") === "cross-site")
      return res.status(403).json({ error: "Cross-origin request rejected." });
  }
  next();
});
api.get(
  "/api/health",
  route(async (_req, res) => {
    const database = await db();
    await database.query("SELECT id FROM clinics LIMIT 1");
    return res.json({
      status: "ok",
      database: "connected",
      storage: process.env.DATABASE_URL ? "postgres" : "local-test",
      commit:
        process.env.VERCEL_GIT_COMMIT_SHA || process.env.APP_COMMIT || "local",
    });
  }),
);
async function actor(req: Request, sql?: Sql) {
  const database = sql || (await db());
  const result = await database.query<{
    profile: User;
    clinic_id: string;
    token_hash: string;
    remembered: boolean;
  }>(
    `SELECT u.profile, u.clinic_id, s.token_hash, s.remembered FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at > now() AND s.mfa_verified=true`,
    [digest(token(req))],
  );
  const row = result.rows[0];
  if (!row || row.profile.status !== "Active")
    throw new HttpError(401, "Please sign in again.");
  return { ...row, profile: { ...safeUser(row.profile), isTwoFactorEnabled: true } };
}
function permit(user: User, permission: Permission) {
  if (!ROLE_PERMISSIONS[user.role].includes(permission))
    throw new HttpError(403, "Your role cannot perform this action.");
}
function staffOnly(user: User) {
  if (user.role === "PET_OWNER")
    throw new HttpError(403, "Clinic staff access required.");
}
async function sessionView(user: User, rememberMe = false) {
  const result = await (
    await db()
  ).query<{ profile: Clinic }>("SELECT profile FROM clinics WHERE id=$1", [
    user.clinicId,
  ]);
  return { user: { ...safeUser(user), isTwoFactorEnabled: true }, clinic: result.rows[0].profile, rememberMe };
}
api.post(
  "/api/auth/login",
  route(async (req, res) => {
    const values = input.loginInput.parse(req.body);
    const database = await db();
    // Shared, persistent counters also apply across serverless instances. Rate limit account and peer.
    for (const key of [
      `email:${values.email}`,
      `ip:${req.ip || req.socket.remoteAddress}`,
    ]) {
      const result = await database.query<{ attempts: number }>(
        `INSERT INTO login_limits(key,attempts,reset_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN login_limits.reset_at<now() THEN 1 ELSE login_limits.attempts+1 END, reset_at=CASE WHEN login_limits.reset_at<now() THEN now()+interval '15 minutes' ELSE login_limits.reset_at END RETURNING attempts`,
        [digest(key)],
      );
      if (result.rows[0].attempts > (key.startsWith("email:") ? 20 : 100))
        throw new HttpError(
          429,
          "Too many sign-in attempts. Try again in 15 minutes.",
        );
    }
    const result = await database.query<{
      profile: User;
      password_hash: string;
    }>("SELECT profile,password_hash FROM users WHERE email=$1", [
      values.email,
    ]);
    const row = result.rows[0];
    const valid = await verifyPassword(
      values.password,
      row?.password_hash || `${"0".repeat(32)}:${"0".repeat(128)}`,
    );
    if (!row || !valid || row.profile.status !== "Active")
      throw new HttpError(401, "Invalid email or password.");
    // A password alone never grants an authenticated session.
    if (!values.totpCode) {
      const setup = await database.transaction(async (tx) => {
        const existing = await tx.query<{ secret_cipher: string; confirmed: boolean }>(
          "SELECT secret_cipher, confirmed FROM user_mfa WHERE user_id=$1 FOR UPDATE",
          [row.profile.id],
        );
        if (existing.rows[0]?.confirmed) return null;
        let secret: string;
        if (existing.rows[0]) {
          secret = decryptTotp(existing.rows[0].secret_cipher, row.profile.id);
        } else {
          const newSecret = newTotpSecret();
          await tx.query(
            "INSERT INTO user_mfa(user_id,secret_cipher) VALUES($1,$2) ON CONFLICT (user_id) DO NOTHING",
            [row.profile.id, encryptTotp(newSecret, row.profile.id)],
          );
          const stored = await tx.query<{ secret_cipher: string }>(
            "SELECT secret_cipher FROM user_mfa WHERE user_id=$1 FOR UPDATE",
            [row.profile.id],
          );
          secret = decryptTotp(stored.rows[0].secret_cipher, row.profile.id);
        }
        const codes = recoveryCodes();
        await tx.query(
          "UPDATE user_mfa SET recovery_hashes=$2 WHERE user_id=$1 AND confirmed=false",
          [row.profile.id, JSON.stringify(codes.map(digest))],
        );
        return { secret, recoveryCodes: codes };
      });
      return res.json({
        requires2FA: true,
        enrollmentRequired: Boolean(setup),
        ...(setup ? {
          enrollmentSecret: setup.secret,
          recoveryCodes: setup.recoveryCodes,
          otpauthUrl: `otpauth://totp/${encodeURIComponent("PawaVet:" + values.email)}?secret=${setup.secret}&issuer=PawaVet&algorithm=SHA1&digits=6&period=30`,
        } : {}),
      });
    }
    const raw = randomBytes(32).toString("hex");
    const sessionHours = values.rememberMe ? 24 * 30 : 8;
    await database.transaction(async (tx) => {
      const found = await tx.query<{ secret_cipher: string; confirmed: boolean; recovery_hashes: string[] }>(
        "SELECT secret_cipher, confirmed, recovery_hashes FROM user_mfa WHERE user_id=$1 FOR UPDATE",
        [row.profile.id],
      );
      if (!found.rows[0]) throw new HttpError(401, "Set up an authenticator app first.");
      const config = found.rows[0];
      const code = values.totpCode!.trim().toUpperCase();
      const validTotp = verifyTotp(decryptTotp(config.secret_cipher, row.profile.id), code);
      const recoveryHash = digest(code);
      const isRecovery = config.confirmed && config.recovery_hashes.includes(recoveryHash);
      if (!validTotp && !isRecovery) throw new HttpError(401, "Invalid verification code.");
      await tx.query(
        "UPDATE user_mfa SET confirmed=true, recovery_hashes=$2 WHERE user_id=$1",
        [row.profile.id, JSON.stringify(isRecovery
          ? config.recovery_hashes.filter((hash) => hash !== recoveryHash)
          : config.recovery_hashes)],
      );
      await tx.query(
        "DELETE FROM sessions WHERE token_hash=$1 OR expires_at <= now()",
        [digest(token(req))],
      );
      await tx.query(
        `INSERT INTO sessions(token_hash,user_id,expires_at,mfa_verified,remembered) VALUES($1,$2,now()+($3::int * interval '1 hour'),true,$4)`,
        [digest(raw), row.profile.id, sessionHours, values.rememberMe],
      );
      await tx.query("DELETE FROM login_limits WHERE key=$1", [digest(`email:${values.email}`)]);
    });
    res.cookie(cookieName, raw, {
      ...cookieOptions,
      ...(values.rememberMe ? { maxAge: sessionHours * 60 * 60 * 1000 } : {}),
    });
    return res.json(await sessionView({ ...row.profile, isTwoFactorEnabled: true }, values.rememberMe));
  }),
);
api.get(
  "/api/auth/session",
  route(async (req, res) => {
    const active = await actor(req);
    return res.json(await sessionView(active.profile, active.remembered));
  }),
);
api.post(
  "/api/auth/logout",
  route(async (req, res) => {
    await (
      await db()
    ).query("DELETE FROM sessions WHERE token_hash=$1", [digest(token(req))]);
    res.clearCookie(cookieName, cookieOptions);
    return res.json({ ok: true });
  }),
);
api.post(
  "/api/auth/password",
  route(async (req, res) => {
    const user = (await actor(req)).profile;
    const values = input.passwordInput.parse(req.body);
    const database = await db();
    const hash = await hashPassword(values.newPassword);
    await database.transaction(async (tx) => {
      const result = await tx.query<{ password_hash: string }>(
        "SELECT password_hash FROM users WHERE id=$1 FOR UPDATE",
        [user.id],
      );
      if (
        !(await verifyPassword(
          values.oldPassword,
          result.rows[0].password_hash,
        ))
      )
        throw new HttpError(400, "Current password is incorrect.");
      await tx.query("UPDATE users SET password_hash=$1 WHERE id=$2", [
        hash,
        user.id,
      ]);
      await tx.query("DELETE FROM sessions WHERE user_id=$1", [user.id]);
    });
    res.clearCookie(cookieName, cookieOptions);
    return res.json({ ok: true });
  }),
);
api.get(
  "/api/clinic",
  route(async (req, res) => {
    const user = (await actor(req)).profile;
    const database = await db();
    const result = await database.query<{ data: ClinicData }>(
      "SELECT data FROM clinics WHERE id=$1",
      [user.clinicId],
    );
    const data = result.rows[0].data;
    const staff = await database.query<{ profile: User }>(
      `SELECT profile FROM users WHERE clinic_id=$1 AND profile->>'status'='Active'`,
      [user.clinicId],
    );
    if (user.role === "PET_OWNER") {
      const ownerId = user.ownerId;
      return res.json({
        ...data,
        pets: data.pets.filter((p) => p.ownerId === ownerId),
        petOwners: data.petOwners.filter((o) => o.id === ownerId),
        appointments: data.appointments.filter((a) => a.ownerId === ownerId),
        medicalRecords: [],
        urgentIntakes: data.urgentIntakes.filter((u) => u.ownerId === ownerId),
        reminders: [],
        invoices: [],
        auditLogs: [],
        staffMembers: [],
      });
    }
    return res.json({
      ...data,
      auditLogs: ROLE_PERMISSIONS[user.role].includes("clinic:audit_logs_read")
        ? data.auditLogs
        : [],
      staffMembers: staff.rows.map((r) => safeUser(r.profile)),
    });
  }),
);
async function mutate(
  req: Request,
  action: string,
  fn: (data: ClinicData, user: User, tx: Sql) => Promise<unknown> | unknown,
) {
  return (await db()).transaction(async (tx) => {
    const user = (await actor(req, tx)).profile;
    const result = await tx.query<{ data: ClinicData }>(
      "SELECT data FROM clinics WHERE id=$1 FOR UPDATE",
      [user.clinicId],
    );
    const data = result.rows[0].data;
    await requireSubscription(user.clinicId!, tx);
    const value = await fn(data, user, tx);
    data.auditLogs.unshift({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      action: action as ClinicData["auditLogs"][number]["action"],
      severity: "info",
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      clinicId: user.clinicId,
      ipAddress: req.ip || "",
      targetResource: action,
      details: action,
    });
    await tx.query("UPDATE clinics SET data=$1 WHERE id=$2", [
      JSON.stringify(data),
      user.clinicId,
    ]);
    return value;
  });
}
function findPet(data: ClinicData, id: string, user: User) {
  const pet = data.pets.find(
    (p) =>
      p.id === id &&
      !p.isArchived &&
      (user.role !== "PET_OWNER" || p.ownerId === user.ownerId),
  );
  if (!pet) throw new HttpError(404, "Patient not found.");
  return pet;
}
api.post(
  "/api/owners",
  route(async (req, res) =>
    res.status(201).json(
      await mutate(req, "PATIENT_CREATED", (data, user) => {
        permit(user, "pets:create");
        const values = input.ownerInput.parse(req.body);
        const owner = {
          ...values,
          id: randomUUID(),
          clinicId: user.clinicId!,
          totalPets: 0,
          registeredAt: new Date().toISOString(),
          balanceDue: 0,
        };
        data.petOwners.push(owner);
        return owner;
      }),
    ),
  ),
);
api.patch(
  "/api/owners/:id/reminder-preferences",
  route(async (req, res) =>
    res.json(
      await mutate(req, "REMINDER_CONSENT_UPDATED", async (data, user, tx) => {
        const owner = data.petOwners.find(o => o.id === req.params.id);
        if (!owner) throw new HttpError(404, "Owner not found.");
        if (user.role === "PET_OWNER" && user.ownerId !== owner.id)
          throw new HttpError(403, "Not your reminder preferences.");
        const consent = input.reminderConsentInput.parse(req.body);
        owner.emailReminderConsent = consent.emailReminderConsent;
        owner.smsReminderConsent = consent.smsReminderConsent;
        await updateOwnerReminders(tx, data, owner);
        return { ownerId: owner.id, ...consent };
      }),
    ),
  ),
);
api.get(
  "/api/reminders",
  route(async (req, res) => {
    staffOnly((await actor(req)).profile);
    const user = (await actor(req)).profile;
    const records = await (await db()).query(
      "SELECT id,appointment_id,channel,due_at,status,sent_at,error_code FROM reminder_jobs WHERE clinic_id=$1 ORDER BY due_at DESC LIMIT 100",
      [user.clinicId],
    );
    return res.json({ reminders: records.rows });
  }),
);
api.post(
  "/api/pets",
  route(async (req, res) =>
    res.status(201).json(
      await mutate(req, "PATIENT_CREATED", (data, user) => {
        permit(user, "pets:create");
        const values = input.petInput.parse(req.body);
        const owner = data.petOwners.find((o) => o.id === values.ownerId);
        if (!owner) throw new HttpError(404, "Owner not found.");
        const pet = {
          ...values,
          id: randomUUID(),
          clinicId: user.clinicId!,
          ownerName: owner.name,
        };
        data.pets.push(pet);
        owner.totalPets++;
        return pet;
      }),
    ),
  ),
);
api.patch(
  "/api/pets/:id",
  route(async (req, res) =>
    res.json(
      await mutate(req, "PATIENT_UPDATED", (data, user) => {
        permit(user, "pets:update");
        const pet = findPet(data, String(req.params.id), user);
        const updates = input.petInput
          .partial()
          .omit({ ownerId: true })
          .parse(req.body);
        Object.assign(pet, updates);
        return pet;
      }),
    ),
  ),
);
api.delete(
  "/api/pets/:id",
  route(async (req, res) =>
    res.json(
      await mutate(req, "PATIENT_ARCHIVED", (data, user) => {
        permit(user, "pets:delete");
        findPet(data, String(req.params.id), user).isArchived = true;
        return { ok: true };
      }),
    ),
  ),
);
const minutes = (time: string) => {
  const [, h, m, period] = time.match(/^(\d+):(\d+) (AM|PM)$/)!;
  return (Number(h) % 12) * 60 + Number(m) + (period === "PM" ? 720 : 0);
};
api.post(
  "/api/appointments",
  route(async (req, res) =>
    res.status(201).json(
      await mutate(req, "APPOINTMENT_SCHEDULED", async (data, user, tx) => {
        staffOnly(user);
        permit(user, "appointments:create");
        const values = input.appointmentInput.parse(req.body);
        const pet = findPet(data, values.petId, user);
        const result = await tx.query<{ profile: User }>(
          "SELECT profile FROM users WHERE id=$1 AND clinic_id=$2",
          [values.veterinarianId, user.clinicId],
        );
        const vet = result.rows[0]?.profile;
        if (
          !vet ||
          vet.status !== "Active" ||
          !["VETERINARIAN", "CLINIC_ADMIN"].includes(vet.role)
        )
          throw new HttpError(
            400,
            "Select an active clinician in your clinic.",
          );
        const start = minutes(values.time);
        if (
          data.appointments.some(
            (a) =>
              a.date === values.date &&
              (a.veterinarianId === vet.id || a.petId === pet.id) &&
              !["Cancelled", "No-show"].includes(a.status) &&
              minutes(a.time) < start + values.durationMinutes &&
              minutes(a.time) + a.durationMinutes > start,
          )
        )
          throw new HttpError(
            409,
            "This patient or clinician already has an overlapping appointment.",
          );
        const owner = data.petOwners.find((o) => o.id === pet.ownerId)!;
        const apt = {
          ...values,
          id: randomUUID(),
          clinicId: user.clinicId!,
          petName: pet.name,
          species: pet.species,
          ownerId: owner.id,
          ownerName: owner.name,
          ownerPhone: owner.phone,
          veterinarianName: vet.name,
          status: "Scheduled" as const,
        };
        data.appointments.push(apt);
        await queueAppointmentReminders(tx, apt, owner);
        return apt;
      }),
    ),
  ),
);
const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  Scheduled: ["Confirmed", "Checked-in", "Cancelled", "No-show"],
  Confirmed: ["Checked-in", "Cancelled", "No-show"],
  "Checked-in": ["In progress", "Cancelled"],
  "In progress": ["Completed"],
  Completed: [],
  Cancelled: [],
  "No-show": [],
};
api.patch(
  "/api/appointments/:id",
  route(async (req, res) =>
    res.json(
      await mutate(req, "APPOINTMENT_STATUS_CHANGED", async (data, user, tx) => {
        const { status } = input.statusInput.parse(req.body);
        permit(
          user,
          status === "Cancelled"
            ? "appointments:cancel"
            : "appointments:update_status",
        );
        const apt = data.appointments.find(
          (a) =>
            a.id === req.params.id &&
            (user.role !== "PET_OWNER" || a.ownerId === user.ownerId),
        );
        if (!apt) throw new HttpError(404, "Appointment not found.");
        if (status !== apt.status && !transitions[apt.status].includes(status))
          throw new HttpError(409, "Invalid appointment status transition.");
        apt.status = status;
        if (status === "Cancelled" || status === "No-show")
          await cancelAppointmentReminders(tx, apt.id);
        return apt;
      }),
    ),
  ),
);
api.post(
  "/api/records",
  route(async (req, res) =>
    res.status(201).json(
      await mutate(req, "RECORD_SOAP_CREATED", (data, user) => {
        permit(user, "records:create_soap");
        const values = input.recordInput.parse(req.body);
        const pet = findPet(data, values.petId, user);
        if (
          !data.appointments.some(
            (a) =>
              a.id === values.appointmentId &&
              a.petId === pet.id &&
              !["Cancelled", "No-show"].includes(a.status),
          )
        )
          throw new HttpError(400, "Select this patient’s appointment.");
        const record = {
          ...values,
          id: randomUUID(),
          clinicId: user.clinicId!,
          petName: pet.name,
          ownerId: pet.ownerId,
          ownerName: pet.ownerName,
          veterinarianId: user.id,
          veterinarianName: user.name,
          date: new Date().toISOString(),
          prescriptions: [],
          vaccines: [],
          isLocked: true,
        };
        data.medicalRecords.push(record);
        return record;
      }),
    ),
  ),
);
api.post(
  "/api/urgent-intakes",
  route(async (req, res) =>
    res.status(201).json(
      await mutate(req, "URGENT_INTAKE_CREATED", (data, user) => {
        const values = input.urgentInput.parse(req.body);
        const pet = findPet(data, values.petId, user);
        const intake = {
          ...values,
          id: randomUUID(),
          clinicId: user.clinicId!,
          petName: pet.name,
          ownerId: pet.ownerId,
          source:
            user.role === "PET_OWNER" ? ("owner" as const) : ("staff" as const),
          receivedAt: new Date().toISOString(),
          status: "Pending review" as const,
          priority: null,
          decisionNote: "",
        };
        data.urgentIntakes.push(intake);
        return intake;
      }),
    ),
  ),
);
api.patch(
  "/api/urgent-intakes/:id",
  route(async (req, res) =>
    res.json(
      await mutate(req, "URGENT_INTAKE_REVIEWED", (data, user) => {
        staffOnly(user);
        permit(user, "appointments:update_status");
        const values = input.urgentDecision.parse(req.body);
        const item = data.urgentIntakes.find((u) => u.id === req.params.id);
        if (!item) throw new HttpError(404, "Request not found.");
        const allowed: Record<string, string[]> = {
          "Pending review": ["Accepted", "Declined"],
          Accepted: ["Accepted", "In care", "Declined"],
          "In care": ["Completed"],
          Completed: [],
          Declined: [],
        };
        if (!allowed[item.status].includes(values.status))
          throw new HttpError(409, "Invalid intake transition.");
        if (values.status !== "Declined" && values.priority === null)
          throw new HttpError(400, "Staff must assign priority.");
        Object.assign(item, values, { reviewedBy: user.id });
        return item;
      }),
    ),
  ),
);
api.post(
  "/api/staff",
  route(async (req, res) => {
    const admin = (await actor(req)).profile;
    permit(admin, "staff:invite");
    const values = input.staffInput.parse(req.body);
    const passwordHash = await hashPassword(values.password);
    const result = await mutate(
      req,
      "STAFF_INVITED",
      async (data, user, tx) => {
        permit(user, "staff:invite");
        if (
          values.role === "PET_OWNER" &&
          !data.petOwners.some((o) => o.id === values.ownerId)
        )
          throw new HttpError(400, "Select an existing owner.");
        const account: User = {
          id: randomUUID(),
          clinicId: user.clinicId,
          name: values.name,
          email: values.email,
          role: values.role,
          ownerId: values.role === "PET_OWNER" ? values.ownerId : undefined,
          isTwoFactorEnabled: false,
          status: "Active",
          createdAt: new Date().toISOString(),
        };
        await tx.query(
          "INSERT INTO users(id,email,password_hash,clinic_id,profile) VALUES($1,$2,$3,$4,$5)",
          [
            account.id,
            account.email,
            passwordHash,
            user.clinicId,
            JSON.stringify(account),
          ],
        );
        return account;
      },
    );
    return res.status(201).json(result);
  }),
);
api.post(
  "/api/support/chat",
  route(async (req, res) => {
    // All four support specialties use real model responses, not mock content.
    const user = (await actor(req)).profile;
    const message = supportRequest.parse(req.body);
    if (!process.env.OPENAI_API_KEY)
      return res.status(503).json({ error: "Soporte de IA pendiente de configuración del proveedor." });
    const database = await db();
    const counter = await database.query<{ attempts: number }>(
      `INSERT INTO login_limits(key,attempts,reset_at)
      VALUES($1,1,now()+interval '15 minutes')
      ON CONFLICT(key) DO UPDATE SET
      attempts=CASE WHEN login_limits.reset_at < now() THEN 1 ELSE login_limits.attempts+1 END,
      reset_at=CASE WHEN login_limits.reset_at < now() THEN now()+interval '15 minutes' ELSE login_limits.reset_at END
      RETURNING attempts`,
      [digest("support:" + user.id)],
    );
    if (counter.rows[0].attempts > 30)
      return res.status(429).json({ error: "Límite de soporte alcanzado. Inténtalo después." });
    try {
      const answer = await supportAnswer(message);
      return res.json({ agent: message.agent, answer });
    } catch {
      return res.status(503).json({ error: "El proveedor de soporte de IA no está disponible ahora." });
    }
  }),
);
api.post(
  "/api/ai/assistant",
  route(async (req, res) => {
    staffOnly((await actor(req)).profile);
    return res.status(503).json({
      error:
        "AI service is not configured for this release. No clinical text was generated.",
    });
  }),
);

api.get(
  "/api/billing/status",
  route(async (req, res) =>
    res.json(await billingStatus((await actor(req)).profile)),
  ),
);
api.post(
  "/api/billing/checkout",
  route(async (req, res) => {
    const user = (await actor(req)).profile;
    permit(user, "clinic:settings_write");
    return res.json(await checkout(user));
  }),
);
api.post(
  "/api/billing/portal",
  route(async (req, res) => {
    const user = (await actor(req)).profile;
    permit(user, "clinic:settings_write");
    return res.json(await portal(user));
  }),
);
api.use("/api", (_req, res) =>
  res.status(404).json({ error: "API endpoint not found." }),
);
api.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof BillingError)
    return res.status(error.status).json({ error: error.message });
  if (error instanceof z.ZodError)
    return res.status(400).json({
      error: error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    });
  if (error instanceof HttpError)
    return res.status(error.status).json({ error: error.message });
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    error.code === "23505"
  )
    return res
      .status(409)
      .json({ error: "An account with this email already exists." });
  console.error(
    "API request failed",
    error instanceof Error ? error.message : "Unknown failure",
  );
  return res.status(503).json({
    error:
      "Service unavailable. Check database configuration and migrations. Your changes were not confirmed.",
  });
});
