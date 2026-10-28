import test from "node:test";
import assert from "node:assert/strict";
import { evaluateSecuritySignals, getSecuritySnapshot } from "../server/cyber-agent";
import type { Sql } from "../server/db";

const secure = {
  production: true,
  httpsOrigin: true,
  databaseConfigured: true,
  mfaKeyConfigured: true,
  aiConfigured: true,
};
const quiet = { keysAtOrAbove20: 0, keysAtOrAbove100: 0, activeUsersWithoutConfirmedMfa: 0 };

test("no findings when deployment controls and monitored signals are normal", () => {
  assert.deepEqual(evaluateSecuritySignals(quiet, secure), []);
});

test("unsafe production configuration is called out as critical", () => {
  const findings = evaluateSecuritySignals(quiet, {
    ...secure, httpsOrigin: false, databaseConfigured: false, mfaKeyConfigured: false,
  });
  assert.deepEqual(findings.filter(f => f.severity === "critical").map(f => f.code), [
    "INSECURE_ORIGIN", "NO_DURABLE_DATABASE", "MFA_KEY_MISSING",
  ]);
});

test("aggregated authentication request pressure is not called a verified attack", () => {
  const findings = evaluateSecuritySignals({ ...quiet, keysAtOrAbove20: 3 }, secure);
  assert.equal(findings[0].code, "AUTH_HIGH_PRESSURE");
  assert.match(findings[0].recommendation, /not confirmed failures/);
  const extreme = evaluateSecuritySignals({ ...quiet, keysAtOrAbove20: 3, keysAtOrAbove100: 1 }, secure);
  assert.equal(extreme[0].code, "AUTH_EXTREME_PRESSURE");
  assert.equal(extreme.some(f => f.code === "AUTH_HIGH_PRESSURE"), false);
});

test("unconfirmed MFA and absent AI provider are reported without treating AI as a safety guarantee", () => {
  const findings = evaluateSecuritySignals({ ...quiet, activeUsersWithoutConfirmedMfa: 2 }, { ...secure, aiConfigured: false });
  assert.deepEqual(findings.map(f => f.code), ["MFA_ENROLLMENT_INCOMPLETE", "AI_TRIAGE_UNAVAILABLE"]);
});

test("snapshot aggregates are read-only and do not expose identities", async () => {
  const statements: string[] = [];
  const sql: Sql = { async query(query: string) {
    statements.push(query);
    if (query.includes("login_limits")) return { rows: [{ elevated: "2", extreme: "0" }] };
    return { rows: [{ unenrolled: "1" }] };
  }};
  const snapshot = await getSecuritySnapshot(sql, {
    NODE_ENV: "production", APP_URL: "https://staging.example.test",
    DATABASE_URL: "redacted", MFA_ENCRYPTION_KEY: "redacted",
  } as NodeJS.ProcessEnv);
  assert.equal(snapshot.operation, "read-only");
  assert.equal(snapshot.continuousMonitoring, false);
  assert.equal(snapshot.counts.warning, 2);
  assert.equal(snapshot.aiTriage, "not_configured");
  assert.equal(JSON.stringify(snapshot).includes("redacted"), false);
  assert.equal(statements.length, 2);
  assert.ok(statements.every(q => q.trim().startsWith("SELECT")));
});
