import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import { app } from "../api/app";
let server: Server;
let base: string;
before(async () => {
  await new Promise<void>((resolve) => { server = app.listen(0, "127.0.0.1", resolve); });
  const address = server.address();
  assert(address && typeof address !== "string");
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
test("liveness cannot be mistaken for production readiness", async () => {
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).productionReady, false);
  const ready = await fetch(`${base}/api/ready`);
  assert.equal(ready.status, 503);
  assert((await ready.json()).blockers.includes("server_authentication"));
});
test("anonymous requests cannot retrieve lead contact information", async () => {
  const response = await fetch(`${base}/api/leads`);
  assert.equal(response.status, 401);
  assert.deepEqual(Object.keys(await response.json()), ["error"]);
});
test("unavailable integrations never return fabricated success", async () => {
  for (const route of ["leads", "ai/assistant"]) {
    const response = await fetch(`${base}/api/${route}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: "test" }),
    });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).result, undefined);
  }
});
test("unknown API routes return JSON rather than the SPA", async () => {
  const response = await fetch(`${base}/api/unknown`);
  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type") || "", /json/);
});
test("malformed and oversized bodies fail without leaking error internals", async () => {
  for (const [body, status] of [["{", 400], [JSON.stringify({ text: "x".repeat(34000) }), 413]] as const) {
    const response = await fetch(`${base}/api/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    assert.equal(response.status, status);
    assert.deepEqual(Object.keys(await response.json()), ["error"]);
  }
});
