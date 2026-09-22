import Stripe from "stripe";
import { randomUUID, createHash } from "node:crypto";
import { db, type Sql } from "./db";
import type { User } from "../src/types";

export interface BillingRow extends Record<string, unknown> {
  clinic_id: string;
  customer_id: string | null;
  subscription_id: string | null;
  status: string;
  paid_until: string | null;
  cancel_at_period_end: boolean;
  checkout_id: string | null;
  checkout_url: string | null;
  checkout_expires: number | null;
  attempt: string;
}
export class BillingError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  const mode = process.env.STRIPE_BILLING_MODE;
  if (
    !key ||
    !["test", "live"].includes(mode || "") ||
    !new RegExp(`^[sr]k_${mode}_`).test(key)
  )
    throw new BillingError(503, "Subscription billing is not configured.");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
}
function safeWebUrl(value: string | undefined) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
export function billingConfigured() {
  const mode = process.env.STRIPE_BILLING_MODE;
  const base = !!(
    process.env.STRIPE_SECRET_KEY &&
    new RegExp(`^[sr]k_${mode}_`).test(process.env.STRIPE_SECRET_KEY) &&
    process.env.STRIPE_PRICE_ID &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.APP_URL &&
    ["test", "live"].includes(mode || "")
  );
  if (!base) return false;
  try {
    if (!["https:", "http:"].includes(new URL(process.env.APP_URL!).protocol))
      return false;
  } catch {
    return false;
  }
  return (
    mode !== "live" ||
    !!(
      safeWebUrl(process.env.APP_URL) &&
      process.env.BILLING_LAUNCH_APPROVED === "true" &&
      process.env.BILLING_TAX_REVIEWED === "true" &&
      process.env.BILLING_ENFORCED === "true" &&
      safeWebUrl(process.env.TERMS_URL) &&
      safeWebUrl(process.env.PRIVACY_URL) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.SUPPORT_EMAIL || "")
    )
  );
}
export function entitled(
  row: Pick<BillingRow, "status" | "paid_until"> | undefined,
  now = Date.now(),
) {
  return (
    !!row &&
    row.status === "active" &&
    !!row.paid_until &&
    Date.parse(row.paid_until) > now
  );
}
export async function billingRow(tx: Sql, clinicId: string) {
  await tx.query(
    "INSERT INTO clinic_billing(clinic_id,attempt) VALUES($1,$2) ON CONFLICT(clinic_id) DO NOTHING",
    [clinicId, randomUUID()],
  );
  return (
    await tx.query<BillingRow>(
      "SELECT * FROM clinic_billing WHERE clinic_id=$1 FOR UPDATE",
      [clinicId],
    )
  ).rows[0];
}
export async function billingStatus(user: User) {
  const row = (
    await (
      await db()
    ).query<BillingRow>("SELECT * FROM clinic_billing WHERE clinic_id=$1", [
      user.clinicId,
    ])
  ).rows[0];
  return {
    configured: billingConfigured(),
    termsUrl: safeWebUrl(process.env.TERMS_URL),
    privacyUrl: safeWebUrl(process.env.PRIVACY_URL),
    supportEmail: process.env.SUPPORT_EMAIL || null,
    mode: process.env.STRIPE_BILLING_MODE || "unconfigured",
    price: 250,
    currency: "USD",
    interval: "month",
    status: row?.status || "not_subscribed",
    active: entitled(row),
    paidUntil: row?.paid_until || null,
    cancelAtPeriodEnd: row?.cancel_at_period_end || false,
    hasCustomer: !!row?.customer_id,
    enforced: process.env.BILLING_ENFORCED === "true",
  };
}
export async function requireSubscription(clinicId: string, tx: Sql) {
  if (process.env.BILLING_ENFORCED !== "true") return;
  const row = (
    await tx.query<BillingRow>(
      "SELECT * FROM clinic_billing WHERE clinic_id=$1",
      [clinicId],
    )
  ).rows[0];
  if (!entitled(row))
    throw new BillingError(
      402,
      "An active clinic subscription is required for new changes. Existing records remain readable.",
    );
}
function configuration() {
  if (!billingConfigured())
    throw new BillingError(503, "Subscription billing is not configured.");
  const origin = new URL(process.env.APP_URL!).origin;
  if (process.env.STRIPE_BILLING_MODE === "live") {
    if (
      !origin.startsWith("https:") ||
      process.env.BILLING_LAUNCH_APPROVED !== "true" ||
      process.env.BILLING_TAX_REVIEWED !== "true" ||
      !process.env.TERMS_URL ||
      !process.env.PRIVACY_URL ||
      !process.env.SUPPORT_EMAIL
    )
      throw new BillingError(
        503,
        "Live billing setup and launch review are incomplete.",
      );
  }
  return { origin, priceId: process.env.STRIPE_PRICE_ID! };
}
export async function checkout(user: User, client = stripeClient()) {
  const { origin, priceId } = configuration();
  const price = await client.prices.retrieve(priceId);
  if (
    !price.active ||
    price.currency !== "usd" ||
    price.unit_amount !== 25000 ||
    price.recurring?.interval !== "month" ||
    price.recurring.interval_count !== 1 ||
    price.livemode !== (process.env.STRIPE_BILLING_MODE === "live")
  )
    throw new BillingError(
      503,
      "The configured price must be an active $250 USD monthly price in the correct Stripe mode.",
    );
  // Persist the attempt before any Stripe side effect; a lost response reuses the same key.
  await (
    await db()
  ).query(
    "INSERT INTO clinic_billing(clinic_id,attempt) VALUES($1,$2) ON CONFLICT(clinic_id) DO NOTHING",
    [user.clinicId, randomUUID()],
  );
  return (await db()).transaction(async (tx) => {
    const row = await billingRow(tx, user.clinicId!);
    if (row.subscription_id) {
      const existing = await client.subscriptions.retrieve(row.subscription_id);
      if (!["canceled", "incomplete_expired"].includes(existing.status))
        throw new BillingError(
          409,
          "This clinic already has a subscription. Use Manage subscription.",
        );
    }
    if (row.checkout_id) {
      const previous = await client.checkout.sessions.retrieve(row.checkout_id);
      if (previous.status === "open" && previous.url)
        return { url: previous.url };
      if (previous.status === "complete")
        throw new BillingError(
          409,
          "Checkout is complete. Wait for payment confirmation and refresh subscription status.",
        );
      row.attempt = `renew-${row.checkout_id}`;
      await tx.query(
        "UPDATE clinic_billing SET attempt=$1 WHERE clinic_id=$2",
        [row.attempt, user.clinicId],
      );
    }
    if (!row.customer_id) {
      const customer = await client.customers.create(
        {
          email: user.email,
          name: user.name,
          metadata: { clinicId: user.clinicId! },
        },
        { idempotencyKey: `pawavet-customer-${user.clinicId}` },
      );
      row.customer_id = customer.id;
      await tx.query(
        "UPDATE clinic_billing SET customer_id=$1 WHERE clinic_id=$2",
        [customer.id, user.clinicId],
      );
    }
    const session = await client.checkout.sessions.create(
      {
        mode: "subscription",
        customer: row.customer_id,
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: user.clinicId,
        metadata: { clinicId: user.clinicId! },
        subscription_data: { metadata: { clinicId: user.clinicId! } },
        integration_identifier:
          "pawavet_clinic_billing_" +
          Array.from(
            createHash("sha256").update(row.attempt).digest().subarray(0, 8),
            (byte) => String.fromCharCode(97 + (byte % 26)),
          ).join(""),
        success_url: `${origin}/?billing=success`,
        cancel_url: `${origin}/?billing=cancelled`,
      },
      { idempotencyKey: `pawavet-checkout-${row.attempt}` },
    );
    if (!session.url)
      throw new BillingError(502, "Checkout did not return a payment page.");
    await tx.query(
      "UPDATE clinic_billing SET checkout_id=$1,checkout_url=$2,checkout_expires=$3 WHERE clinic_id=$4",
      [session.id, session.url, session.expires_at, user.clinicId],
    );
    return { url: session.url };
  });
}
export async function portal(user: User, client = stripeClient()) {
  const { origin } = configuration();
  const row = (
    await (
      await db()
    ).query<BillingRow>("SELECT * FROM clinic_billing WHERE clinic_id=$1", [
      user.clinicId,
    ])
  ).rows[0];
  if (!row?.customer_id)
    throw new BillingError(
      409,
      "No billing account exists for this clinic yet.",
    );
  const session = await client.billingPortal.sessions.create({
    customer: row.customer_id,
    return_url: `${origin}/?billing=manage`,
  });
  return { url: session.url };
}
function subscriptionId(event: Stripe.Event) {
  const object = event.data.object;
  if (event.type.startsWith("customer.subscription."))
    return (object as Stripe.Subscription).id;
  if (event.type.startsWith("checkout.session.")) {
    const s = (object as Stripe.Checkout.Session).subscription;
    return typeof s === "string" ? s : s?.id;
  }
  if (event.type.startsWith("invoice.")) {
    const s = (object as Stripe.Invoice).parent?.subscription_details
      ?.subscription;
    return typeof s === "string" ? s : s?.id;
  }
}
export async function reconcileEvent(
  event: Stripe.Event,
  client = stripeClient(),
) {
  if (event.livemode !== (process.env.STRIPE_BILLING_MODE === "live"))
    throw new BillingError(400, "Webhook mode mismatch.");
  const id = subscriptionId(event);
  if (
    !id ||
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.paid",
      "invoice.payment_failed",
    ].includes(event.type)
  )
    return;
  await (
    await db()
  ).transaction(async (tx) => {
    // A retry either commits both the current state and event ID, or neither.
    const inserted = await tx.query<{ id: string }>(
      "INSERT INTO stripe_events(id) VALUES($1) ON CONFLICT(id) DO NOTHING RETURNING id",
      [event.id],
    );
    if (!inserted.rows.length) return;
    const sub = await client.subscriptions.retrieve(id);
    const customer =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const row = (
      await tx.query<BillingRow>(
        "SELECT * FROM clinic_billing WHERE customer_id=$1 FOR UPDATE",
        [customer],
      )
    ).rows[0];
    if (!row) return; // Not a subscription created for a PawaVet clinic.
    // Read latest after acquiring the clinic lock: old/reordered events cannot restore stale access.
    const current = await client.subscriptions.retrieve(id);
    if (current.metadata.clinicId !== row.clinic_id)
      throw new BillingError(400, "Subscription clinic mismatch.");
    if (row.subscription_id && row.subscription_id !== current.id) {
      const old = await client.subscriptions.retrieve(row.subscription_id);
      if (!["canceled", "incomplete_expired"].includes(old.status))
        throw new BillingError(
          409,
          "A different subscription is already linked to this clinic.",
        );
      if (["canceled", "incomplete_expired"].includes(current.status)) return;
    }
    const item = current.items.data[0];
    const valid =
      current.items.data.length === 1 &&
      item?.price.id === process.env.STRIPE_PRICE_ID &&
      item.quantity === 1;
    const period = valid ? item.current_period_end : 0;
    await tx.query(
      "UPDATE clinic_billing SET subscription_id=$1,status=$2,paid_until=$3,cancel_at_period_end=$4,checkout_id=NULL,checkout_url=NULL,checkout_expires=NULL WHERE clinic_id=$5",
      [
        current.id,
        valid ? current.status : "invalid_plan",
        period ? new Date(period * 1000).toISOString() : null,
        current.cancel_at_period_end,
        row.clinic_id,
      ],
    );
  });
}
