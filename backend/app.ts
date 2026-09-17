import { urgentRoutes } from "./urgent";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { type Database, type Sql } from "./db";
import { hashPassword, verifyPassword, tokenHash } from "./password";
import {
  ROLE_PERMISSIONS,
  type User,
  type Clinic,
  type Pet,
  type PetOwner,
  type Permission,
  type AuditActionType,
} from "../src/types";

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const text = z.string().trim().max(2000);
const name = z.string().trim().min(1).max(160);
const email = z.string().trim().toLowerCase().email().max(254);
const ownerSchema = z
  .object({ name, email, phone: text, address: text, emergencyContact: text })
  .strict();
const petSchema = z
  .object({
    name,
    species: z.enum(["dog", "cat", "bird", "rabbit", "reptile", "other"]),
    breed: text,
    age: text,
    dateOfBirth: z
      .string()
      .refine(
        (v) =>
          v === "" ||
          (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))),
        "Invalid birth date",
      ),
    sex: z.enum([
      "Male (Intact)",
      "Male (Neutered)",
      "Female (Intact)",
      "Female (Spayed)",
    ]),
    weightKg: z.number().finite().min(0).max(1500),
    color: text,
    microchipNumber: text,
    ownerId: name,
    ownerName: text.optional(),
    vaccinationStatus: z.enum(["Up to date", "Due soon", "Overdue", "Unknown"]),
    allergies: z.array(text).max(100),
    currentMedications: z.array(text).max(100),
    notes: text.optional(),
    photoUrl: z
      .string()
      .url()
      .max(2000)
      .refine((v) => v.startsWith("https://"))
      .optional(),
    lastVisit: text.optional(),
  })
  .strict();
type Actor = { user: User; clinic: Clinic; sessionId: string; locked: boolean };
interface AuthRequest extends Request {
  actor?: Actor;
}
const actor = (req: Request) => {
  const a = (req as AuthRequest).actor;
  if (!a) throw new HttpError(401, "Sign in to continue.");
  return a;
};
const allow = (req: Request, permission: Permission) => {
  if (!ROLE_PERMISSIONS[actor(req).user.role].includes(permission))
    throw new HttpError(403, "Your role cannot perform this action.");
};
const route =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
const cookieName =
  process.env.NODE_ENV === "production" ? "__Host-pawavet" : "pawavet";
function sessionToken(req: Request) {
  return (
    (req.headers.cookie || "")
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1) || ""
  );
}
function cookie(res: Response, value: string, maxAge = 8 * 60 * 60 * 1000) {
  res.cookie(cookieName, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}
async function audit(
  sql: Sql,
  a: Actor,
  action: AuditActionType,
  resourceId: string,
  details: string,
) {
  const id = randomUUID();
  await sql.query(
    "INSERT INTO audit_events(id, clinic_id, data) VALUES($1,$2,$3)",
    [
      id,
      a.clinic.id,
      JSON.stringify({
        id,
        timestamp: new Date().toISOString(),
        action,
        severity: "info",
        actorId: a.user.id,
        actorName: a.user.name,
        actorRole: a.user.role,
        clinicId: a.clinic.id,
        clinicName: a.clinic.name,
        targetResource: resourceId,
        resourceId,
        ipAddress: "",
        details,
      }),
    ],
  );
}
async function throttle(db: Sql, key: string, max: number) {
  const { rows } = await db.query<{ count: number }>(
    `INSERT INTO login_attempts(key,count,reset_at) VALUES($1,1,now()+interval '15 minutes')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN login_attempts.reset_at < now() THEN 1 ELSE login_attempts.count+1 END,
    reset_at=CASE WHEN login_attempts.reset_at < now() THEN now()+interval '15 minutes' ELSE login_attempts.reset_at END RETURNING count`,
    [key],
  );
  if (rows[0].count > max)
    throw new HttpError(429, "Too many attempts. Try again in 15 minutes.");
}
export function createApp(db: Database, origin = process.env.APP_ORIGIN) {
  const app = express();
  app.disable("x-powered-by");
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    // Custom header prevents form CSRF; no cross-origin CORS permission is granted.
    if (
      req.get("X-PawaVet-Request") !== "1" ||
      (req.get("Origin") && req.get("Origin") !== origin)
    )
      return res.status(403).json({ error: "Request origin rejected." });
    if (process.env.NODE_ENV === "production" && !origin)
      return res
        .status(503)
        .json({ error: "Application origin is not configured." });
    next();
  });
  app.get(
    "/api/health",
    route(async (_req, res) => {
      try {
        const migration = await db.query(
          "SELECT version FROM schema_migrations WHERE version=2",
        );
        if (!migration.rows.length)
          throw new Error("Required migrations are missing");
        res.json({ status: "ok" });
      } catch {
        res.status(503).json({
          status: "unavailable",
          error: "Database setup is incomplete or unavailable.",
        });
      }
    }),
  );
  app.post(
    "/api/auth/login",
    route(async (req, res) => {
      const input = z
        .object({ email, password: z.string().min(1).max(256) })
        .strict()
        .parse(req.body);
      await throttle(db, `login:${tokenHash(input.email)}`, 10);
      await throttle(db, `network:${tokenHash(req.ip || "unknown")}`, 100);
      const { rows } = await db.query<{
        id: string;
        password_hash: string;
        data: User;
        clinic_id: string;
        role: User["role"];
        status: User["status"];
        clinic: Clinic;
      }>(
        `SELECT u.*,m.clinic_id,m.role,m.status,c.data AS clinic FROM users u JOIN memberships m ON m.user_id=u.id JOIN clinics c ON c.id=m.clinic_id WHERE u.email=$1`,
        [input.email],
      );
      const row = rows[0];
      // Equal-cost verification for unknown accounts.
      const dummy = "00000000000000000000000000000000:" + "00".repeat(64);
      const valid = await verifyPassword(
        input.password,
        row?.password_hash || dummy,
      );
      if (!row || !valid || row.status !== "Active" || !row.clinic.isActive)
        throw new HttpError(
          401,
          "Email or password is incorrect, or access is inactive.",
        );
      if (row.data.isTwoFactorEnabled || row.clinic.twoFactorRequired)
        throw new HttpError(
          503,
          "Two-factor sign-in is not configured. Contact your administrator.",
        );
      const token = randomBytes(32).toString("hex");
      const sessionId = randomUUID();
      const a: Actor = {
        user: {
          ...row.data,
          id: row.id,
          email: input.email,
          role: row.role,
          status: row.status,
          clinicId: row.clinic_id,
        },
        clinic: row.clinic,
        sessionId,
        locked: false,
      };
      await db.transaction(async (sql) => {
        await sql.query("DELETE FROM sessions WHERE expires_at < now()");
        await sql.query(
          `INSERT INTO sessions(id,token_hash,user_id,clinic_id,expires_at) VALUES($1,$2,$3,$4,now()+interval '8 hours')`,
          [sessionId, tokenHash(token), row.id, row.clinic_id],
        );
        await audit(
          sql,
          a,
          "AUTH_LOGIN_SUCCESS",
          sessionId,
          "Password verified; session created.",
        );
      });
      cookie(res, token);
      res.json({ user: a.user, clinic: a.clinic, locked: false });
    }),
  );
  app.use(
    "/api",
    route(async (req, _res, next) => {
      const { rows } = await db.query<{
        session_id: string;
        locked: boolean;
        data: User;
        role: User["role"];
        status: User["status"];
        clinic: Clinic;
        clinic_id: string;
      }>(
        `SELECT s.id AS session_id,s.locked,u.data,m.role,m.status,c.data AS clinic,s.clinic_id FROM sessions s JOIN users u ON u.id=s.user_id JOIN memberships m ON m.user_id=s.user_id AND m.clinic_id=s.clinic_id JOIN clinics c ON c.id=s.clinic_id WHERE s.token_hash=$1 AND s.expires_at>now()`,
        [tokenHash(sessionToken(req))],
      );
      const row = rows[0];
      if (!row || row.status !== "Active" || !row.clinic.isActive)
        throw new HttpError(
          401,
          "Session expired or access revoked. Sign in again.",
        );
      (req as AuthRequest).actor = {
        user: {
          ...row.data,
          role: row.role,
          status: row.status,
          clinicId: row.clinic_id,
        },
        clinic: row.clinic,
        sessionId: row.session_id,
        locked: row.locked,
      };
      next(); // Continue only after current membership has been verified.
    }),
  );
  app.get(
    "/api/auth/me",
    route(async (req, res) => {
      const a = actor(req);
      res.json({ user: a.user, clinic: a.clinic, locked: a.locked });
    }),
  );
  app.post(
    "/api/auth/logout",
    route(async (req, res) => {
      const a = actor(req);
      await db.transaction(async (sql) => {
        await sql.query("DELETE FROM sessions WHERE id=$1", [a.sessionId]);
        await audit(sql, a, "AUTH_LOGOUT", a.sessionId, "Session revoked.");
      });
      cookie(res, "", 0);
      res.json({ success: true });
    }),
  );
  app.post(
    "/api/auth/unlock",
    route(async (req, res) => {
      const a = actor(req);
      const { password } = z
        .object({ password: z.string().min(1).max(256) })
        .strict()
        .parse(req.body);
      await throttle(db, `unlock:${a.user.id}`, 10);
      const { rows } = await db.query<{ password_hash: string }>(
        "SELECT password_hash FROM users WHERE id=$1",
        [a.user.id],
      );
      if (!(await verifyPassword(password, rows[0].password_hash)))
        throw new HttpError(401, "Incorrect password.");
      await db.query("UPDATE sessions SET locked=false WHERE id=$1", [
        a.sessionId,
      ]);
      res.json({ success: true });
    }),
  );
  app.use("/api", (req, res, next) => {
    if (actor(req).locked)
      return res.status(423).json({ error: "Session is locked." });
    next();
  });
  app.post(
    "/api/auth/lock",
    route(async (req, res) => {
      await db.query("UPDATE sessions SET locked=true WHERE id=$1", [
        actor(req).sessionId,
      ]);
      res.json({ success: true });
    }),
  );
  app.post(
    "/api/auth/password",
    route(async (req, res) => {
      const a = actor(req);
      const input = z
        .object({
          oldPassword: z.string().max(256),
          newPassword: z.string().min(12).max(256),
        })
        .strict()
        .parse(req.body);
      await throttle(db, `password:${a.user.id}`, 10);
      const { rows } = await db.query<{ password_hash: string }>(
        "SELECT password_hash FROM users WHERE id=$1",
        [a.user.id],
      );
      if (!(await verifyPassword(input.oldPassword, rows[0].password_hash)))
        throw new HttpError(400, "Current password is incorrect.");
      const hash = await hashPassword(input.newPassword);
      await db.transaction(async (sql) => {
        await sql.query("UPDATE users SET password_hash=$1 WHERE id=$2", [
          hash,
          a.user.id,
        ]);
        await sql.query("DELETE FROM sessions WHERE user_id=$1", [a.user.id]);
        await audit(
          sql,
          a,
          "AUTH_PASSWORD_CHANGED",
          a.user.id,
          "Password changed; all sessions revoked.",
        );
      });
      cookie(res, "", 0);
      res.json({ success: true });
    }),
  );
  app.get(
    "/api/auth/sessions",
    route(async (req, res) => {
      const a = actor(req);
      const { rows } = await db.query<{
        id: string;
        created_at: Date;
        expires_at: Date;
      }>(
        "SELECT id,created_at,expires_at FROM sessions WHERE user_id=$1 AND expires_at>now()",
        [a.user.id],
      );
      res.json(
        rows.map((s) => ({
          id: s.id,
          userId: a.user.id,
          userEmail: a.user.email,
          userName: a.user.name,
          role: a.user.role,
          clinicId: a.clinic.id,
          createdAt: s.created_at,
          expiresAt: s.expires_at,
          lastActiveAt: s.created_at,
          isCurrent: s.id === a.sessionId,
          device: "Browser",
          browser: "",
          ipAddress: "",
          location: "",
        })),
      );
    }),
  );
  app.delete(
    "/api/auth/sessions/:id",
    route(async (req, res) => {
      const a = actor(req);
      await db.transaction(async (sql) => {
        await sql.query("DELETE FROM sessions WHERE user_id=$1 AND id=$2", [
          a.user.id,
          req.params.id,
        ]);
        await audit(
          sql,
          a,
          "AUTH_SESSION_REVOKED",
          String(req.params.id),
          "Session revoked.",
        );
      });
      res.json({ success: true });
    }),
  );
  app.post(
    "/api/auth/revoke-others",
    route(async (req, res) => {
      const a = actor(req);
      await db.transaction(async (sql) => {
        await sql.query("DELETE FROM sessions WHERE user_id=$1 AND id<>$2", [
          a.user.id,
          a.sessionId,
        ]);
        await audit(
          sql,
          a,
          "AUTH_SESSION_REVOKED",
          a.user.id,
          "Other sessions revoked.",
        );
      });
      res.json({ success: true });
    }),
  );
  app.get(
    "/api/owners",
    route(async (req, res) => {
      const a = actor(req);
      const { rows } = await db.query<{ data: PetOwner }>(
        `SELECT data FROM owners WHERE clinic_id=$1${a.user.role === "PET_OWNER" ? " AND user_id=$2" : ""}`,
        a.user.role === "PET_OWNER" ? [a.clinic.id, a.user.id] : [a.clinic.id],
      );
      res.json(rows.map((r) => r.data));
    }),
  );
  app.post(
    "/api/owners",
    route(async (req, res) => {
      allow(req, "pets:create");
      const a = actor(req);
      const input = ownerSchema.parse(req.body);
      const id = randomUUID();
      const owner = {
        ...input,
        id,
        clinicId: a.clinic.id,
        totalPets: 0,
        balanceDue: 0,
        registeredAt: new Date().toISOString(),
      };
      await db.transaction(async (sql) => {
        await sql.query(
          "INSERT INTO owners(id,clinic_id,data) VALUES($1,$2,$3)",
          [id, a.clinic.id, JSON.stringify(owner)],
        );
        await audit(sql, a, "PATIENT_CREATED", id, "Owner contact created.");
      });
      res.status(201).json(owner);
    }),
  );
  async function getPets(req: Request, id?: string) {
    const a = actor(req);
    const params: unknown[] = [a.clinic.id];
    let where = "p.clinic_id=$1";
    if (a.user.role === "PET_OWNER") {
      params.push(a.user.id);
      where += ` AND o.user_id=$${params.length}`;
    } else allow(req, "pets:read_all_clinic");
    if (id) {
      params.push(id);
      where += ` AND p.id=$${params.length}`;
    }
    const { rows } = await db.query<{ data: Pet }>(
      `SELECT p.data FROM pets p JOIN owners o ON o.id=p.owner_id AND o.clinic_id=p.clinic_id WHERE ${where} ORDER BY p.id`,
      params,
    );
    return rows.map((r) => r.data);
  }
  app.get(
    "/api/pets",
    route(async (req, res) => res.json(await getPets(req))),
  );
  app.get(
    "/api/pets/:id",
    route(async (req, res) => {
      const pet = (await getPets(req, String(req.params.id)))[0];
      if (!pet) throw new HttpError(404, "Patient not found.");
      res.json(pet);
    }),
  );
  app.post(
    "/api/pets",
    route(async (req, res) => {
      allow(req, "pets:create");
      const a = actor(req);
      const input = petSchema.parse(req.body);
      const id = randomUUID();
      const pet = await db.transaction(async (sql) => {
        const { rows } = await sql.query<{ data: PetOwner }>(
          "SELECT data FROM owners WHERE id=$1 AND clinic_id=$2",
          [input.ownerId, a.clinic.id],
        );
        if (!rows[0])
          throw new HttpError(
            400,
            "Select an owner registered with this clinic.",
          );
        const data = {
          ...input,
          id,
          clinicId: a.clinic.id,
          ownerName: rows[0].data.name,
        };
        await sql.query(
          "INSERT INTO pets(id,clinic_id,owner_id,data) VALUES($1,$2,$3,$4)",
          [id, a.clinic.id, input.ownerId, JSON.stringify(data)],
        );
        await audit(sql, a, "PATIENT_CREATED", id, "Patient saved.");
        return data;
      });
      res.status(201).json(pet);
    }),
  );
  app.patch(
    "/api/pets/:id",
    route(async (req, res) => {
      allow(req, "pets:update");
      const a = actor(req);
      const input = petSchema
        .omit({ ownerId: true, ownerName: true })
        .partial()
        .strict()
        .parse(req.body);
      const pet = await db.transaction(async (sql) => {
        const { rows } = await sql.query<{ data: Pet }>(
          "SELECT data FROM pets WHERE id=$1 AND clinic_id=$2 FOR UPDATE",
          [req.params.id, a.clinic.id],
        );
        if (!rows[0]) throw new HttpError(404, "Patient not found.");
        const data = { ...rows[0].data, ...input };
        await sql.query(
          "UPDATE pets SET data=$1 WHERE id=$2 AND clinic_id=$3",
          [JSON.stringify(data), req.params.id, a.clinic.id],
        );
        await audit(
          sql,
          a,
          "PATIENT_UPDATED",
          String(req.params.id),
          "Patient updated.",
        );
        return data;
      });
      res.json(pet);
    }),
  );
  app.get(
    "/api/staff",
    route(async (req, res) => {
      allow(req, "staff:read");
      const a = actor(req);
      const { rows } = await db.query<{
        data: User;
        role: User["role"];
        status: User["status"];
      }>(
        `SELECT u.data,m.role,m.status FROM users u JOIN memberships m ON m.user_id=u.id WHERE m.clinic_id=$1 AND m.role<>'PET_OWNER'`,
        [a.clinic.id],
      );
      res.json(
        rows.map((r) => ({
          ...r.data,
          role: r.role,
          status: r.status,
          clinicId: a.clinic.id,
        })),
      );
    }),
  );
  app.patch(
    "/api/staff/:id",
    route(async (req, res) => {
      const a = actor(req);
      const input = z
        .object({
          role: z
            .enum([
              "CLINIC_ADMIN",
              "VETERINARIAN",
              "TECHNICIAN",
              "RECEPTIONIST",
            ])
            .optional(),
          status: z.enum(["Active", "Suspended"]).optional(),
        })
        .strict()
        .parse(req.body);
      if (input.role) allow(req, "staff:modify_role");
      if (input.status) allow(req, "staff:deactivate");
      if (req.params.id === a.user.id)
        throw new HttpError(
          400,
          "Another administrator must change your own access.",
        );
      await db.transaction(async (sql) => {
        const { rows } = await sql.query<{ role: string; status: string }>(
          `SELECT role,status FROM memberships WHERE user_id=$1 AND clinic_id=$2 AND role<>'PET_OWNER' FOR UPDATE`,
          [req.params.id, a.clinic.id],
        );
        if (!rows[0]) throw new HttpError(404, "Staff member not found.");
        await sql.query(
          "UPDATE memberships SET role=$1,status=$2 WHERE user_id=$3 AND clinic_id=$4",
          [
            input.role || rows[0].role,
            input.status || rows[0].status,
            req.params.id,
            a.clinic.id,
          ],
        );
        if (input.status === "Suspended")
          await sql.query(
            "DELETE FROM sessions WHERE user_id=$1 AND clinic_id=$2",
            [req.params.id, a.clinic.id],
          );
        await audit(
          sql,
          a,
          input.role ? "RBAC_ROLE_MODIFIED" : "STAFF_DEACTIVATED",
          String(req.params.id),
          "Staff access updated.",
        );
      });
      res.json({ success: true });
    }),
  );
  app.get(
    "/api/audit",
    route(async (req, res) => {
      allow(req, "clinic:audit_logs_read");
      const { rows } = await db.query<{ data: unknown }>(
        "SELECT data FROM audit_events WHERE clinic_id=$1 ORDER BY created_at DESC LIMIT 200",
        [actor(req).clinic.id],
      );
      res.json(rows.map((r) => r.data));
    }),
  );
  urgentRoutes(app, db, actor, allow, audit);
  app.all("/api/leads", (_req, res) =>
    res.status(503).json({ error: "Lead capture is not activated." }),
  );
  app.post(
    "/api/ai/assistant",
    route(async (req, res) => {
      if (actor(req).user.role === "PET_OWNER")
        throw new HttpError(403, "Clinic staff access required.");
      await throttle(db, `ai:${actor(req).user.id}`, 30);
      res.status(503).json({
        error: "AI is not activated. No clinical summary was generated.",
      });
    }),
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "This workflow is not available." }),
  );
  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (error instanceof z.ZodError)
        return res.status(400).json({
          error: "Invalid input.",
          issues: error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        });
      if (error instanceof HttpError)
        return res.status(error.status).json({ error: error.message });
      if (error instanceof SyntaxError)
        return res.status(400).json({ error: "Invalid JSON." });
      console.error(
        "API operation failed",
        error instanceof Error ? error.name : "UnknownError",
      );
      res.status(503).json({
        error:
          "Unable to complete the request. Nothing has been confirmed saved; retry after checking your connection.",
      });
    },
  );
  return app;
}
