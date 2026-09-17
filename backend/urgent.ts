import type { Express, Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Database, Sql } from "./db";
import type { User, Clinic, Permission, AuditActionType } from "../src/types";
interface Actor {
  user: User;
  clinic: Clinic;
  sessionId: string;
  locked: boolean;
}
export function urgentRoutes(
  app: Express,
  db: Database,
  actor: (req: Request) => Actor,
  allow: (req: Request, permission: Permission) => void,
  audit: (
    sql: Sql,
    a: Actor,
    action: AuditActionType,
    id: string,
    details: string,
  ) => Promise<void>,
) {
  const route =
    (fn: (req: Request, res: Response) => Promise<unknown>) =>
    (req: Request, res: Response, next: NextFunction) => {
      fn(req, res).catch(next);
    };
  app.get(
    "/api/urgent",
    route(async (req, res) => {
      const a = actor(req);
      if (a.user.role !== "PET_OWNER")
        allow(req, "appointments:read_all_clinic");
      const { rows } = await db.query(
        `SELECT q.id,q.pet_id AS "petId",p.data->>'name' AS "petName",q.reason,q.status,q.priority,q.version,q.created_at AS "createdAt" FROM urgent_requests q JOIN pets p ON p.id=q.pet_id AND p.clinic_id=q.clinic_id JOIN owners o ON o.id=p.owner_id AND o.clinic_id=p.clinic_id WHERE q.clinic_id=$1 ${a.user.role === "PET_OWNER" ? "AND o.user_id=$2" : ""} ORDER BY q.priority ASC NULLS LAST,q.created_at ASC`,
        a.user.role === "PET_OWNER" ? [a.clinic.id, a.user.id] : [a.clinic.id],
      );
      res.json(rows);
    }),
  );
  app.post(
    "/api/urgent",
    route(async (req, res) => {
      const a = actor(req);
      if (a.user.role !== "PET_OWNER") allow(req, "appointments:update_status");
      const input = z
        .object({
          petId: z.string().min(1).max(100),
          reason: z.string().trim().min(1).max(2000),
        })
        .strict()
        .parse(req.body);
      const result = await db.transaction(async (sql) => {
        const { rows } = await sql.query(
          `SELECT p.id FROM pets p JOIN owners o ON o.id=p.owner_id AND o.clinic_id=p.clinic_id WHERE p.id=$1 AND p.clinic_id=$2 ${a.user.role === "PET_OWNER" ? "AND o.user_id=$3" : ""} FOR UPDATE OF p`,
          a.user.role === "PET_OWNER"
            ? [input.petId, a.clinic.id, a.user.id]
            : [input.petId, a.clinic.id],
        );
        if (!rows[0]) return { status: 404, error: "Patient not found." };
        const active = await sql.query(
          "SELECT id FROM urgent_requests WHERE pet_id=$1 AND clinic_id=$2 AND status IN ('Requested','Accepted')",
          [input.petId, a.clinic.id],
        );
        if (active.rows.length)
          return {
            status: 409,
            error: "This patient already has an active urgent-care request.",
          };
        const id = randomUUID();
        await sql.query(
          "INSERT INTO urgent_requests(id,clinic_id,pet_id,submitted_by,reason) VALUES($1,$2,$3,$4,$5)",
          [id, a.clinic.id, input.petId, a.user.id, input.reason],
        );
        await audit(
          sql,
          a,
          "APPOINTMENT_SCHEDULED",
          id,
          "Urgent-care intake requested; staff acceptance pending.",
        );
        return { status: 201, id };
      });
      res.status(result.status).json(result);
    }),
  );
  app.patch(
    "/api/urgent/:id",
    route(async (req, res) => {
      allow(req, "appointments:update_status");
      const a = actor(req);
      const input = z
        .object({
          status: z.enum(["Accepted", "Declined", "Completed"]),
          priority: z.number().int().min(1).max(3).nullable(),
          version: z.number().int().positive(),
        })
        .strict()
        .parse(req.body);
      const result = await db.transaction(async (sql) => {
        const { rows } = await sql.query<{ status: string; version: number }>(
          "SELECT status,version FROM urgent_requests WHERE id=$1 AND clinic_id=$2 FOR UPDATE",
          [req.params.id, a.clinic.id],
        );
        const row = rows[0];
        if (!row) return { status: 404, error: "Request not found." };
        if (row.version !== input.version)
          return {
            status: 409,
            error:
              "Another staff member updated this request. Refresh and try again.",
          };
        const valid =
          (row.status === "Requested" &&
            ["Accepted", "Declined"].includes(input.status)) ||
          (row.status === "Accepted" &&
            ["Accepted", "Completed"].includes(input.status));
        if (!valid || (input.status === "Accepted" && input.priority === null))
          return {
            status: 400,
            error:
              "Choose a valid transition and a staff-assigned priority for accepted requests.",
          };
        await sql.query(
          "UPDATE urgent_requests SET status=$1,priority=$2,version=version+1,updated_at=now() WHERE id=$3 AND clinic_id=$4",
          [
            input.status,
            input.status === "Accepted" ? input.priority : null,
            req.params.id,
            a.clinic.id,
          ],
        );
        await audit(
          sql,
          a,
          "APPOINTMENT_STATUS_CHANGED",
          String(req.params.id),
          `Urgent request ${input.status}; staff priority ${input.priority ?? "none"}.`,
        );
        return { status: 200, success: true };
      });
      res.status(result.status).json(result);
    }),
  );
}
