import "dotenv/config";
import { randomUUID } from "node:crypto";
import { database } from "../backend/db";
import { hashPassword } from "../backend/password";
// Credentials are read from stdin, never command-line arguments or committed files.
let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const input = JSON.parse(raw) as {
  clinicName: string;
  name: string;
  email: string;
  password: string;
};
if (
  !input.clinicName?.trim() ||
  !input.name?.trim() ||
  !/^\S+@\S+\.\S+$/.test(input.email)
)
  throw new Error("Clinic name, administrator name and valid email required.");
const clinicId = randomUUID(),
  userId = randomUUID(),
  createdAt = new Date().toISOString();
const clinic = {
  id: clinicId,
  name: input.clinicName,
  code: clinicId.slice(0, 8),
  address: "",
  city: "",
  state: "PR",
  zip: "",
  phone: "",
  email: input.email,
  licenseNumber: "",
  subscriptionPlan: "Starter",
  autoLockTimeoutMinutes: 15,
  twoFactorRequired: false,
  isActive: true,
  createdAt,
};
const user = {
  id: userId,
  name: input.name,
  email: input.email.trim().toLowerCase(),
  role: "CLINIC_ADMIN",
  clinicId,
  isTwoFactorEnabled: false,
  status: "Active",
  createdAt,
};
const hash = await hashPassword(input.password);
await database().transaction(async (sql) => {
  await sql.query("INSERT INTO clinics(id,data) VALUES($1,$2)", [
    clinicId,
    JSON.stringify(clinic),
  ]);
  await sql.query(
    "INSERT INTO users(id,email,password_hash,data) VALUES($1,$2,$3,$4)",
    [userId, user.email, hash, JSON.stringify(user)],
  );
  await sql.query(
    "INSERT INTO memberships(user_id,clinic_id,role,status) VALUES($1,$2,'CLINIC_ADMIN','Active')",
    [userId, clinicId],
  );
});
console.log("Clinic and administrator created.");
process.exit(0);
