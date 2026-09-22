import React, { useEffect, useState } from "react";
import { request } from "../api-client";
interface Status {
  configured: boolean;
  termsUrl: string | null;
  privacyUrl: string | null;
  supportEmail: string | null;
  mode: string;
  price: number;
  status: string;
  active: boolean;
  paidUntil: string | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
  enforced: boolean;
}
export function SubscriptionPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    try {
      setStatus(await request<Status>("/api/billing/status"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load billing.");
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function open(path: string) {
    setBusy(true);
    setError("");
    try {
      const { url } = await request<{ url: string }>(path, "POST", {});
      const target = new URL(url);
      if (
        target.protocol !== "https:" ||
        !["checkout.stripe.com", "billing.stripe.com"].includes(target.hostname)
      )
        throw new Error("Invalid billing destination.");
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Billing request failed.");
      setBusy(false);
    }
  }
  return (
    <section className="p-6 bg-slate-900 border border-slate-700 rounded-2xl space-y-4">
      <h2 className="text-2xl font-bold">Clinic subscription</h2>
      <p className="text-3xl font-bold">
        $250 <span className="text-base font-normal">USD / clinic / month</span>
      </p>
      <p>
        Staff access, patient records, appointments and staff-reviewed urgent
        intake. Renews monthly until cancelled through Manage subscription.
      </p>
      <p className="text-sm text-slate-400">
        Email delivery, AI assistance, telemedicine and collection of patient
        payments are not included in this release.
      </p>
      {error && (
        <p role="alert" className="text-rose-300">
          {error}
        </p>
      )}
      {status && (
        <>
          <p className="flex gap-4 flex-wrap">
            {status.termsUrl && (
              <a href={status.termsUrl} className="underline">
                Terms
              </a>
            )}
            {status.privacyUrl && (
              <a href={status.privacyUrl} className="underline">
                Privacy
              </a>
            )}
            {status.supportEmail && (
              <a href={`mailto:${status.supportEmail}`} className="underline">
                Billing support
              </a>
            )}
          </p>
          <p>
            Status: <strong>{status.status.replaceAll("_", " ")}</strong>
          </p>
          {status.mode !== "live" && (
            <p className="text-amber-300">
              Test setup — no real subscription payments are collected.
            </p>
          )}
          {!status.configured && (
            <p>
              Billing is not yet available. Contact your clinic administrator.
            </p>
          )}
          {status.paidUntil && (
            <p>
              {status.cancelAtPeriodEnd
                ? "Cancellation scheduled; access ends"
                : "Current access through"}{" "}
              {new Date(status.paidUntil).toLocaleDateString()}
            </p>
          )}
          <div className="flex gap-3 flex-wrap">
            {!status.active && (
              <button
                disabled={busy || !status.configured}
                onClick={() => void open("/api/billing/checkout")}
                className="bg-teal-600 rounded-lg px-4 py-2 disabled:opacity-50"
              >
                {status.mode === "live"
                  ? "Subscribe for $250/month"
                  : "Open test checkout"}
              </button>
            )}
            {status.hasCustomer && (
              <button
                disabled={busy || !status.configured}
                onClick={() => void open("/api/billing/portal")}
                className="bg-slate-700 rounded-lg px-4 py-2"
              >
                Manage subscription
              </button>
            )}
            <button onClick={() => void refresh()} className="px-3 py-2">
              Refresh subscription status
            </button>
          </div>
          <p className="text-sm text-slate-400">
            Returning from checkout does not activate access by itself. Payment
            confirmation must reach the server.
          </p>
        </>
      )}
    </section>
  );
}
