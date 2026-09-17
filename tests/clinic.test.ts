import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import type { Server } from "node:http";
import { createApp } from "../backend/app";
import type { Database } from "../backend/db";
import { hashPassword } from "../backend/password";

const origin = "http://localhost:9876";
test("clinic authentication, authorization, persistence and recovery", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "pawavet-test-"));
  let pg = new PGlite(join(dir, "db"));
  let server: Server;
  function db(): Database {
    return {
      query: (sql, params) => pg.query(sql, params),
      transaction: (fn) => pg.transaction((tx) => fn(tx)),
    };
  }
  async function start() {
    server = createApp(db(), origin).listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const addr = server.address();
    assert(addr && typeof addr !== "string");
    return `http://127.0.0.1:${addr.port}`;
  }
  async function stop() {
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
  }
  let base = "";
  async function call(
    path: string,
    method = "GET",
    body?: unknown,
    cookie = "",
  ) {
    const r = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-PawaVet-Request": "1",
        Origin: origin,
        Cookie: cookie,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: r.status,
      data: await r.json(),
      cookie: r.headers.get("set-cookie")?.split(";")[0] || "",
    };
  }
  const password = "Synthetic testing password 2026!";
  let a = "",
    b = "",
    staff = "",
    owner = "",
    petId = "",
    ownerId = "";
  try {
    await pg.exec(await readFile("migrations/001_clinic.sql", "utf8"));
    await pg.exec(await readFile("migrations/002_urgent_queue.sql", "utf8"));
    const hash = await hashPassword(password);
    for (const id of ["a", "b"])
      await pg.query("INSERT INTO clinics(id,data) VALUES($1,$2)", [
        id,
        JSON.stringify({
          id,
          name: "Synthetic clinic " + id,
          isActive: true,
          autoLockTimeoutMinutes: 15,
        }),
      ]);
    for (const [id, clinic, role] of [
      ["a", "a", "CLINIC_ADMIN"],
      ["b", "b", "CLINIC_ADMIN"],
      ["staff", "a", "TECHNICIAN"],
      ["owner", "a", "PET_OWNER"],
    ]) {
      const user = {
        id,
        email: id + "@example.test",
        name: id,
        role,
        clinicId: clinic,
        isTwoFactorEnabled: false,
        status: "Active",
        createdAt: new Date().toISOString(),
      };
      await pg.query(
        "INSERT INTO users(id,email,password_hash,data) VALUES($1,$2,$3,$4)",
        [id, user.email, hash, JSON.stringify(user)],
      );
      await pg.query(
        "INSERT INTO memberships(user_id,clinic_id,role,status) VALUES($1,$2,$3,'Active')",
        [id, clinic, role],
      );
    }
    base = await start();
    await t.test("health, anonymous API and CSRF boundaries", async () => {
      assert.equal((await call("/api/health")).status, 200);
      await pg.query("DELETE FROM schema_migrations WHERE version=2");
      assert.equal((await call("/api/health")).status, 503);
      await pg.query("INSERT INTO schema_migrations(version) VALUES(2)");
      for (const p of [
        "/api/pets",
        "/api/owners",
        "/api/staff",
        "/api/leads",
        "/api/audit",
      ])
        assert.equal((await call(p)).status, 401, p);
      assert.equal(
        (
          await fetch(base + "/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "a@example.test", password }),
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await fetch(base + "/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-PawaVet-Request": "1",
              Origin: "https://attacker.test",
            },
            body: JSON.stringify({ email: "a@example.test", password }),
          })
        ).status,
        403,
      );
    });
    await t.test(
      "wrong passwords, unknown users and role injection fail",
      async () => {
        assert.equal(
          (
            await call("/api/auth/login", "POST", {
              email: "a@example.test",
              password: "wrong",
            })
          ).status,
          401,
        );
        assert.equal(
          (
            await call("/api/auth/login", "POST", {
              email: "nobody@example.test",
              password,
            })
          ).status,
          401,
        );
        assert.equal(
          (
            await call("/api/auth/login", "POST", {
              email: "a@example.test",
              password,
              role: "SUPER_ADMIN",
            })
          ).status,
          400,
        );
        for (const id of ["a", "b", "staff", "owner"]) {
          const r = await call("/api/auth/login", "POST", {
            email: id + "@example.test",
            password,
          });
          assert.equal(r.status, 200);
          assert(!("passwordHash" in r.data.user));
          if (id === "a") a = r.cookie;
          else if (id === "b") b = r.cookie;
          else if (id === "staff") staff = r.cookie;
          else owner = r.cookie;
        }
      },
    );
    await t.test(
      "patient saved with server clinic and owner relationship",
      async () => {
        const r = await call(
          "/api/owners",
          "POST",
          {
            name: "Synthetic Owner",
            email: "synthetic@example.test",
            phone: "",
            address: "",
            emergencyContact: "",
          },
          a,
        );
        assert.equal(r.status, 201);
        ownerId = r.data.id;
        const pet = {
          name: "Synthetic Luna",
          species: "cat",
          breed: "",
          age: "",
          dateOfBirth: "",
          sex: "Female (Spayed)",
          weightKg: 4,
          color: "",
          microchipNumber: "",
          ownerId,
          ownerName: "Forged name",
          vaccinationStatus: "Unknown",
          allergies: [],
          currentMedications: [],
        };
        const made = await call("/api/pets", "POST", pet, a);
        assert.equal(made.status, 201);
        petId = made.data.id;
        assert.equal(made.data.clinicId, "a");
        assert.equal(made.data.ownerName, "Synthetic Owner");
        assert.equal(
          (await call("/api/pets", "POST", { ...pet, clinicId: "b" }, a))
            .status,
          400,
        );
        assert.equal((await call("/api/pets", "POST", pet, b)).status, 400);
        assert.equal(
          (await call("/api/pets", "POST", { ...pet, weightKg: -1 }, a)).status,
          400,
        );
        assert.equal((await call("/api/pets", "POST", pet, staff)).status, 403);
      },
    );
    await t.test(
      "cross-clinic and owner-only reads/writes enforce server authority",
      async () => {
        assert.deepEqual(
          (await call("/api/pets", "GET", undefined, b)).data,
          [],
        );
        assert.equal(
          (await call("/api/pets/" + petId, "GET", undefined, b)).status,
          404,
        );
        assert.equal(
          (await call("/api/pets/" + petId, "PATCH", { name: "hacked" }, b))
            .status,
          404,
        );
        assert.equal(
          (await call("/api/pets/" + petId, "PATCH", { clinicId: "b" }, a))
            .status,
          400,
        );
        assert.equal(
          (await call("/api/pets/" + petId, "PATCH", { ownerId: "forged" }, a))
            .status,
          400,
        );
        assert.deepEqual(
          (await call("/api/pets", "GET", undefined, owner)).data,
          [],
        );
        // Explicit database link, never name/email matching.
        await pg.query(
          "UPDATE owners SET user_id=$1 WHERE id=$2 AND clinic_id=$3",
          ["owner", ownerId, "a"],
        );
        assert.equal(
          (await call("/api/pets", "GET", undefined, owner)).data.length,
          1,
        );
        assert.equal(
          (
            await call(
              "/api/pets/" + petId,
              "PATCH",
              { name: "owner edit" },
              owner,
            )
          ).status,
          403,
        );
        const updated = await call(
          "/api/pets/" + petId,
          "PATCH",
          { name: "Saved Luna", notes: "Synthetic update" },
          a,
        );
        assert.equal(updated.status, 200);
        assert.equal(updated.data.name, "Saved Luna");
      },
    );
    await t.test(
      "urgent intake supports owners and staff with staff-only acceptance/priority",
      async () => {
        const r = await call(
          "/api/urgent",
          "POST",
          { petId, reason: "Synthetic urgent intake" },
          owner,
        );
        assert.equal(r.status, 201);
        const id = r.data.id;
        assert.equal(
          (await call("/api/urgent", "POST", { petId, reason: "duplicate" }, a))
            .status,
          409,
        );
        assert.equal(
          (
            await call(
              "/api/urgent",
              "POST",
              { petId, reason: "cross clinic" },
              b,
            )
          ).status,
          404,
        );
        assert.equal(
          (
            await call(
              "/api/urgent/" + id,
              "PATCH",
              { status: "Accepted", priority: 1, version: 1 },
              owner,
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await call(
              "/api/urgent/" + id,
              "PATCH",
              { status: "Accepted", priority: 1, version: 1 },
              b,
            )
          ).status,
          404,
        );
        assert.equal(
          (
            await call(
              "/api/urgent/" + id,
              "PATCH",
              { status: "Accepted", priority: null, version: 1 },
              a,
            )
          ).status,
          400,
        );
        assert.equal(
          (
            await call(
              "/api/urgent/" + id,
              "PATCH",
              { status: "Accepted", priority: 2, version: 1 },
              staff,
            )
          ).status,
          200,
        );
        assert.equal(
          (
            await call(
              "/api/urgent/" + id,
              "PATCH",
              { status: "Accepted", priority: 1, version: 1 },
              a,
            )
          ).status,
          409,
        );
        assert.equal(
          (await call("/api/urgent", "GET", undefined, owner)).data[0].priority,
          2,
        );
        assert.deepEqual(
          (await call("/api/urgent", "GET", undefined, b)).data,
          [],
        );
        assert.equal(
          (
            await call(
              "/api/urgent/" + id,
              "PATCH",
              { status: "Completed", priority: null, version: 2 },
              a,
            )
          ).status,
          200,
        );
        assert.equal(
          (
            await call(
              "/api/urgent",
              "POST",
              { petId, reason: "Staff-created request" },
              a,
            )
          ).status,
          201,
        );
      },
    );
    await t.test(
      "screen lock requires the real password and blocks data APIs",
      async () => {
        assert.equal((await call("/api/auth/lock", "POST", {}, a)).status, 200);
        assert.equal(
          (await call("/api/pets", "GET", undefined, a)).status,
          423,
        );
        assert.equal(
          (await call("/api/auth/unlock", "POST", { password: "1234" }, a))
            .status,
          401,
        );
        assert.equal(
          (await call("/api/auth/unlock", "POST", { password }, a)).status,
          200,
        );
        assert.equal(
          (await call("/api/pets", "GET", undefined, a)).status,
          200,
        );
      },
    );
    await t.test(
      "membership changes take effect on existing sessions",
      async () => {
        assert.equal(
          (await call("/api/staff/staff", "PATCH", { role: "RECEPTIONIST" }, a))
            .status,
          200,
        );
        assert.equal(
          (await call("/api/auth/me", "GET", undefined, staff)).data.user.role,
          "RECEPTIONIST",
        );
        assert.equal(
          (await call("/api/staff/staff", "PATCH", { status: "Suspended" }, a))
            .status,
          200,
        );
        assert.equal(
          (await call("/api/pets", "GET", undefined, staff)).status,
          401,
        );
        assert.equal(
          (
            await call("/api/auth/login", "POST", {
              email: "staff@example.test",
              password,
            })
          ).status,
          401,
        );
        assert.equal(
          (await call("/api/staff/b", "PATCH", { status: "Suspended" }, a))
            .status,
          404,
        );
        assert.equal(
          (await call("/api/staff/a", "PATCH", { status: "Suspended" }, a))
            .status,
          400,
        );
      },
    );
    await t.test(
      "revoked/expired sessions and logout are enforced",
      async () => {
        const second = await call("/api/auth/login", "POST", {
          email: "a@example.test",
          password,
        });
        assert.equal(
          (await call("/api/auth/revoke-others", "POST", {}, a)).status,
          200,
        );
        assert.equal(
          (await call("/api/pets", "GET", undefined, second.cookie)).status,
          401,
        );
        const third = await call("/api/auth/login", "POST", {
          email: "a@example.test",
          password,
        });
        assert.equal(
          (await call("/api/auth/logout", "POST", {}, third.cookie)).status,
          200,
        );
        assert.equal(
          (await call("/api/pets", "GET", undefined, third.cookie)).status,
          401,
        );
        await pg.query(
          "UPDATE sessions SET expires_at=now()-interval '1 minute' WHERE user_id='b'",
        );
        assert.equal(
          (await call("/api/pets", "GET", undefined, b)).status,
          401,
        );
      },
    );
    await t.test(
      "failed storage writes roll back patient and audit together",
      async () => {
        await pg.exec(
          `CREATE FUNCTION reject_audit() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'Synthetic storage failure'; END; $$ LANGUAGE plpgsql; CREATE TRIGGER fail_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION reject_audit();`,
        );
        assert.equal(
          (
            await call(
              "/api/pets/" + petId,
              "PATCH",
              { name: "Must roll back" },
              a,
            )
          ).status,
          503,
        );
        await pg.exec(
          "DROP TRIGGER fail_audit ON audit_events; DROP FUNCTION reject_audit();",
        );
        assert.equal(
          (await call("/api/pets/" + petId, "GET", undefined, a)).data.name,
          "Saved Luna",
        );
      },
    );
    await t.test(
      "unsupported integrations never fabricate success",
      async () => {
        assert.equal(
          (await call("/api/ai/assistant", "POST", { prompt: "summarize" }, a))
            .status,
          503,
        );
        assert.equal(
          (await call("/api/leads", "GET", undefined, a)).status,
          503,
        );
        assert.equal(
          (await call("/api/reminders/send", "POST", {}, a)).status,
          404,
        );
        assert.equal(
          (await call("/api/invoices/pay", "POST", {}, a)).status,
          404,
        );
      },
    );
    await t.test(
      "records survive server and database restart and backup restoration",
      async () => {
        await stop();
        await pg.close();
        pg = new PGlite(join(dir, "db"));
        base = await start();
        assert.equal(
          (await call("/api/pets/" + petId, "GET", undefined, a)).data.name,
          "Saved Luna",
        );
        const other = await call("/api/auth/login", "POST", {
          email: "a@example.test",
          password,
        });
        assert.equal(
          (await call("/api/pets/" + petId, "GET", undefined, other.cookie))
            .data.notes,
          "Synthetic update",
        );
        await stop();
        const dump = await pg.dumpDataDir();
        await pg.close();
        pg = new PGlite({ loadDataDir: dump });
        base = await start();
        assert.equal(
          (await call("/api/pets/" + petId, "GET", undefined, a)).data.name,
          "Saved Luna",
        );
      },
    );
    await t.test(
      "password change validates old password and revokes all sessions",
      async () => {
        assert.equal(
          (
            await call(
              "/api/auth/password",
              "POST",
              {
                oldPassword: "wrong",
                newPassword: "A new synthetic password!",
              },
              a,
            )
          ).status,
          400,
        );
        assert.equal(
          (
            await call(
              "/api/auth/password",
              "POST",
              {
                oldPassword: password,
                newPassword: "A new synthetic password!",
              },
              a,
            )
          ).status,
          200,
        );
        assert.equal(
          (await call("/api/pets", "GET", undefined, a)).status,
          401,
        );
        assert.equal(
          (
            await call("/api/auth/login", "POST", {
              email: "a@example.test",
              password,
            })
          ).status,
          401,
        );
        assert.equal(
          (
            await call("/api/auth/login", "POST", {
              email: "a@example.test",
              password: "A new synthetic password!",
            })
          ).status,
          200,
        );
      },
    );
  } finally {
    if (server!) await stop();
    await pg.close();
    await rm(dir, { recursive: true, force: true });
  }
});
