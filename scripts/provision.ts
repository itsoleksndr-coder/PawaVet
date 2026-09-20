import "dotenv/config";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db, migrate } from "../server/db";
import { hashPassword } from "../server/security";
import { emptyData } from "../src/clinic-model";
import type { Clinic, User } from "../src/types";
const env = z
  .object({
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(12).max(256),
    ADMIN_NAME: z.string().min(1),
    CLINIC_NAME: z.string().min(1),
  })
  .parse(process.env);
await migrate();
const id = randomUUID();
const clinic: Clinic = {
  id,
  name: env.CLINIC_NAME,
  code: id.slice(0, 8),
  address: "",
  city: "",
  state: "Puerto Rico",
  zip: "",
  phone: "",
  email: env.ADMIN_EMAIL,
  licenseNumber: "",
  subscriptionPlan: "Starter",
  autoLockTimeoutMinutes: 15,
  twoFactorRequired: false,
  isActive: true,
  createdAt: new Date().toISOString(),
};
const user: User = {
  id: randomUUID(),
  email: env.ADMIN_EMAIL.toLowerCase(),
  name: env.ADMIN_NAME,
  role: "CLINIC_ADMIN",
  clinicId: id,
  status: "Active",
  isTwoFactorEnabled: false,
  createdAt: new Date().toISOString(),
};
const hash = await hashPassword(env.ADMIN_PASSWORD);
await (
  await db()
).transaction(async (tx) => {
  await tx.query("INSERT INTO clinics(id,profile,data) VALUES($1,$2,$3)", [
    id,
    JSON.stringify(clinic),
    JSON.stringify(emptyData()),
  ]);
  await tx.query(
    "INSERT INTO users(id,email,password_hash,clinic_id,profile) VALUES($1,$2,$3,$4,$5)",
    [user.id, user.email, hash, id, JSON.stringify(user)],
  );
});
console.log(
  "Clinic and administrator provisioned. No credentials were printed.",
);
await (await db()).close();
