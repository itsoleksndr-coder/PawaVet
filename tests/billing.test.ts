import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import Stripe from "stripe";
import { db, migrate } from "../server/db";
import {
  checkout,
  portal,
  reconcileEvent,
  entitled,
  requireSubscription,
  billingRow,
  BillingError,
} from "../server/billing";
import { emptyData } from "../src/clinic-model";
import type { User } from "../src/types";
const directory = await mkdtemp(path.join(tmpdir(), "pawavet-billing-"));
process.env.LOCAL_DATABASE_PATH = path.join(directory, "db");
delete process.env.DATABASE_URL;
process.env.STRIPE_SECRET_KEY = "sk_test_" + randomBytes(24).toString("hex");
process.env.STRIPE_WEBHOOK_SECRET = "whsec_" + randomBytes(24).toString("hex");
process.env.STRIPE_BILLING_MODE = "test";
process.env.STRIPE_PRICE_ID = "price_synthetic";
process.env.APP_URL = "http://localhost:4317";
await migrate();
const clinicId: string = randomUUID();
await (
  await db()
).query("INSERT INTO clinics(id,profile,data) VALUES($1,$2,$3)", [
  clinicId,
  JSON.stringify({ id: clinicId }),
  JSON.stringify(emptyData()),
]);
const admin: User = {
  id: randomUUID(),
  clinicId,
  email: "synthetic@example.test",
  name: "Synthetic admin",
  role: "CLINIC_ADMIN",
  status: "Active",
  isTwoFactorEnabled: false,
  createdAt: new Date().toISOString(),
};
let checkoutCreates = 0;
let customerCreates = 0;
let priceAmount = 25000;
let current = {
  id: "sub_synthetic",
  customer: "cus_synthetic",
  status: "active",
  metadata: { clinicId },
  cancel_at_period_end: false,
  items: {
    data: [
      {
        price: { id: "price_synthetic" },
        quantity: 1,
        current_period_end: Math.floor(Date.now() / 1000) + 3600,
      },
    ],
  },
};
const gateway = {
  prices: {
    retrieve: async () => ({
      active: true,
      currency: "usd",
      unit_amount: priceAmount,
      recurring: { interval: "month", interval_count: 1 },
      livemode: false,
    }),
  },
  customers: {
    create: async () => {
      customerCreates++;
      return { id: "cus_synthetic" };
    },
  },
  checkout: {
    sessions: {
      create: async (params: Stripe.Checkout.SessionCreateParams) => {
        checkoutCreates++;
        assert.equal(params.line_items?.[0].price, "price_synthetic");
        assert.equal(params.customer, "cus_synthetic");
        assert.equal(params.mode, "subscription");
        assert.ok(!("payment_method_types" in params));
        return {
          id: "cs_synthetic",
          url: "https://checkout.stripe.com/synthetic",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        };
      },
      retrieve: async () => ({
        status: "open",
        url: "https://checkout.stripe.com/synthetic",
      }),
    },
  },
  subscriptions: { retrieve: async () => current },
  billingPortal: {
    sessions: {
      create: async (params: Stripe.BillingPortal.SessionCreateParams) => {
        assert.equal(params.customer, "cus_synthetic");
        return { url: "https://billing.stripe.com/synthetic" };
      },
    },
  },
} as unknown as Stripe;
function event(
  id: string,
  type = "customer.subscription.updated",
): Stripe.Event {
  return {
    id,
    object: "event",
    type,
    livemode: false,
    data: { object: { ...current, status: "active" } },
    created: 1,
  } as unknown as Stripe.Event;
}
after(async () => {
  await (await db()).close();
  await rm(directory, { recursive: true, force: true });
});

test("entitlements require active status and an unexpired paid period", () => {
  assert.equal(entitled(undefined), false);
  assert.equal(
    entitled({
      status: "active",
      paid_until: new Date(Date.now() + 60000).toISOString(),
    }),
    true,
  );
  for (const status of [
    "past_due",
    "unpaid",
    "canceled",
    "trialing",
    "incomplete",
    "invalid_plan",
  ])
    assert.equal(
      entitled({
        status,
        paid_until: new Date(Date.now() + 60000).toISOString(),
      }),
      false,
    );
  assert.equal(
    entitled({ status: "active", paid_until: new Date(0).toISOString() }),
    false,
  );
});
test("checkout validates server price and serializes duplicate attempts", async () => {
  priceAmount = 1;
  await assert.rejects(() => checkout(admin, gateway), BillingError);
  priceAmount = 25000;
  const results = await Promise.all([
    checkout(admin, gateway),
    checkout(admin, gateway),
  ]);
  assert.equal(results[0].url, results[1].url);
  assert.equal(checkoutCreates, 1);
  assert.equal(customerCreates, 1);
});
test("signed webhook verification rejects tampering", () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = JSON.stringify(event("evt_signature"));
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  assert.equal(
    stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    ).id,
    "evt_signature",
  );
  assert.throws(() =>
    stripe.webhooks.constructEvent(
      body + " ",
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    ),
  );
});
test("confirmed subscription enables writes, duplicate event is idempotent, portal uses stored customer", async () => {
  await reconcileEvent(event("evt_paid"), gateway);
  await reconcileEvent(event("evt_paid"), gateway);
  assert.equal(
    (
      await (
        await db()
      ).query("SELECT id FROM stripe_events WHERE id=$1", ["evt_paid"])
    ).rows.length,
    1,
  );
  process.env.BILLING_ENFORCED = "true";
  await requireSubscription(clinicId, await db());
  await assert.rejects(
    () => checkout(admin, gateway),
    /already has a subscription/,
  );
  assert.equal(
    (await portal(admin, gateway)).url,
    "https://billing.stripe.com/synthetic",
  );
});
test("stale active event cannot restore canceled access; invalid plan and cross-mode webhook fail closed", async () => {
  current = { ...current, status: "canceled" };
  await reconcileEvent(event("evt_old_active"), gateway);
  await assert.rejects(
    () => requireSubscription(clinicId, awaitable()),
    BillingError,
  );
  function awaitable() {
    return {
      query: async <T extends Record<string, unknown>>(
        sql: string,
        params?: unknown[],
      ) => (await db()).query<T>(sql, params),
    };
  }
  const bad = event("evt_wrong_mode");
  bad.livemode = true;
  await assert.rejects(() => reconcileEvent(bad, gateway), /mode mismatch/);
  current = {
    ...current,
    status: "active",
    items: {
      data: [
        {
          price: { id: "price_wrong" },
          quantity: 1,
          current_period_end: Math.floor(Date.now() / 1000) + 3600,
        },
      ],
    },
  };
  await reconcileEvent(event("evt_wrong_price"), gateway);
  const row = (
    await (
      await db()
    ).query<{ status: string }>(
      "SELECT status FROM clinic_billing WHERE clinic_id=$1",
      [clinicId],
    )
  ).rows[0];
  assert.equal(row.status, "invalid_plan");
});
test("unknown clinic and unsigned customer metadata cannot grant access", async () => {
  current = {
    ...current,
    customer: "cus_foreign",
    metadata: { clinicId: "foreign" },
    status: "active",
  };
  await reconcileEvent(event("evt_foreign"), gateway);
  assert.equal(
    (
      await (
        await db()
      ).query("SELECT * FROM clinic_billing WHERE clinic_id=$1", ["foreign"])
    ).rows.length,
    0,
  );
});
