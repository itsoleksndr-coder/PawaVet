import { strict as assert } from "node:assert";
import { test } from "node:test";
import { agentIds, supportAnswer, supportRequest, supportRoles } from "../server/support";

test("registers all four support agents with distinct instructions", () => {
  assert.deepEqual(agentIds, ["appointments", "onboarding", "billing", "technical"]);
  assert.equal(Object.keys(supportRoles).length, 4);
  for (const id of agentIds) {
    assert.ok(supportRoles[id].title.length > 0);
    assert.ok(supportRoles[id].instructions.length > 0);
  }
});

test("validates the support request agent and message", () => {
  const parsed = supportRequest.parse({ agent: "billing", message: "¿Cómo funciona la suscripción?" });
  assert.equal(parsed.agent, "billing");
  assert.deepEqual(parsed.history, []);
  assert.throws(() => supportRequest.parse({ agent: "medical", message: "hola" }));
});

test("does not pretend to answer when the AI provider is not configured", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    await assert.rejects(
      supportAnswer({ agent: "technical", message: "No puedo iniciar sesión", history: [] }),
      /SUPPORT_PROVIDER_NOT_CONFIGURED/,
    );
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});
