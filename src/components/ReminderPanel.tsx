import React, { useEffect, useState } from "react";
import { request } from "../api-client";

interface Job {
  id: string;
  appointment_id: string;
  channel: "email" | "sms";
  due_at: string;
  status: "pending" | "sending" | "sent" | "unknown" | "cancelled";
  sent_at: string | null;
  error_code: string | null;
}
export function ReminderPanel() {
  const [rows, setRows] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function refresh() {
    try {
      const data = await request<{ reminders: Job[] }>("/api/reminders");
      setRows(data.reminders);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load reminders.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);
  return <section className="space-y-4">
    <h2 className="text-2xl font-bold">Appointment reminders</h2>
    <p className="text-sm text-slate-300">Opt-in reminders are queued for 24 hours before appointments, or immediately for short-notice bookings. Actual delivery requires a verified email sender or SMS provider and an enabled Railway worker. No message is represented as sent unless the provider accepted it.</p>
    <button className="px-4 py-2 rounded-lg bg-teal-700" onClick={() => void refresh()}>Refresh reminders</button>
    {loading && <p>Loading reminders…</p>}
    {error && <p role="alert" className="text-rose-300">{error}</p>}
    <div className="grid gap-3">
      {rows.map(job => <article key={job.id} className="border border-slate-700 p-4 rounded-xl bg-slate-900 space-y-1">
        <p className="font-semibold">{job.channel === "sms" ? "SMS" : "Email"} · {job.status}</p>
        <p className="text-sm text-slate-300">Appointment: {job.appointment_id.slice(0, 8)} · Due: {new Date(job.due_at).toLocaleString("en-US", { timeZone: "America/Puerto_Rico" })} AST</p>
        {job.sent_at && <p className="text-teal-300 text-sm">Provider accepted: {new Date(job.sent_at).toLocaleString("en-US", { timeZone: "America/Puerto_Rico" })} AST</p>}
        {job.error_code && <p className="text-amber-300 text-sm">Needs review: {job.error_code}</p>}
      </article>)}
      {!loading && rows.length === 0 && <p>No queued reminders. Add an owner with explicit consent and book a future appointment to generate one.</p>}
    </div>
  </section>;
}
