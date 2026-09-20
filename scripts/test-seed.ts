import { randomBytes, randomUUID } from "node:crypto";
import { writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { db, migrate } from "../server/db";
import { hashPassword } from "../server/security";
import { emptyData } from "../src/clinic-model";
const dir = await mkdtemp(path.join(tmpdir(), "pawavet-e2e-"));
process.env.LOCAL_DATABASE_PATH = path.join(dir, "database");
delete process.env.DATABASE_URL;
await migrate();
const accounts = [];
for (const name of ["Clinic A", "Clinic B"]) {
  const clinicId = randomUUID();
  const password = randomBytes(24).toString("base64url");
  const id = randomUUID();
  const email = `${name.endsWith("A") ? "admin-a" : "admin-b"}@example.test`;
  const user = {
    id,
    email,
    name: "Test " + name,
    role: "CLINIC_ADMIN",
    clinicId,
    status: "Active",
    isTwoFactorEnabled: false,
    createdAt: new Date().toISOString(),
  };
  const clinic = {
    id: clinicId,
    name: "Synthetic " + name,
    code: clinicId.slice(0, 8),
    address: "",
    city: "San Juan",
    state: "PR",
    phone: "",
    email,
    licenseNumber: "",
    subscriptionPlan: "Starter",
    autoLockTimeoutMinutes: 15,
    twoFactorRequired: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  const hash = await hashPassword(password);
  await (
    await db()
  ).transaction(async (tx) => {
    await tx.query("INSERT INTO clinics(id,profile,data) VALUES($1,$2,$3)", [
      clinicId,
      JSON.stringify(clinic),
      JSON.stringify(emptyData()),
    ]);
    await tx.query(
      "INSERT INTO users(id,email,password_hash,clinic_id,profile) VALUES($1,$2,$3,$4,$5)",
      [id, email, hash, clinicId, JSON.stringify(user)],
    );
  });
  accounts.push({ email, password, id, clinicId });
}
await (await db()).close();
await writeFile(
  ".test-state.json",
  JSON.stringify({ database: process.env.LOCAL_DATABASE_PATH, accounts }),
  { mode: 0o600 },
);
console.log("Isolated synthetic test clinics provisioned.");
