import React, { useState } from "react";
import { Video, ExternalLink } from "lucide-react";
import { useData } from "../context/DataContext";
import type { TelehealthSession } from "../types";

export function TelehealthPanel() {
  const { appointments, snapshot, mutate } = useData();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const telehealth = appointments.filter((a) => a.type === "Telehealth" && !["Cancelled", "No-show"].includes(a.status));
  async function create(appointmentId: string) {
    setBusy(appointmentId); setError("");
    try { const session = await mutate<TelehealthSession>("/api/telehealth/sessions", "POST", { appointmentId }); window.open(session.joinUrl, "_blank", "noopener,noreferrer"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Telemedicine provider is unavailable."); }
    finally { setBusy(""); }
  }
  async function update(id: string, status: "started" | "ended") {
    setBusy(id); setError("");
    try { await mutate(`/api/telehealth/sessions/${id}`, "PATCH", { status }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update the session."); }
    finally { setBusy(""); }
  }
  return <section className="space-y-5">
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl"><div className="flex items-center gap-3"><Video className="text-teal-400" /><div><h2 className="text-2xl font-bold">Telemedicine for pets</h2><p className="text-sm text-slate-400">Appointment-scoped video rooms; clinical decisions remain with the veterinarian.</p></div></div>{error && <p role="alert" className="mt-4 text-rose-300">{error}</p>}</div>
    {!telehealth.length && <p className="text-slate-400">No telehealth appointments are scheduled for this clinic.</p>}
    <div className="grid gap-3">{telehealth.map((appointment) => { const session = snapshot.telehealthSessions.find((s) => s.appointmentId === appointment.id && s.status !== "cancelled"); return <article key={appointment.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-bold">{appointment.petName}</h3><p className="text-sm text-slate-400">{appointment.date} · {appointment.time} · {appointment.veterinarianName}</p><p className="text-xs text-slate-500">{session ? `Room ${session.status}` : "Room not created"}</p></div><div className="flex gap-2">{session ? <><button className="px-3 py-2 rounded-lg bg-teal-600" disabled={busy === session.id} onClick={() => { void update(session.id, "started"); window.open(session.joinUrl, "_blank", "noopener,noreferrer"); }}>Join room <ExternalLink className="inline w-3 h-3" /></button>{session.status === "started" && <button className="px-3 py-2 rounded-lg bg-slate-700" disabled={busy === session.id} onClick={() => void update(session.id, "ended")}>End</button>}</> : <button className="px-3 py-2 rounded-lg bg-teal-600" disabled={busy === appointment.id} onClick={() => void create(appointment.id)}>{busy === appointment.id ? "Creating…" : "Create room"}</button>}</div></article>; })}</div>
    <p className="text-xs text-amber-300">Configure <code>TELEMED_ROOM_BASE_URL</code> only after approving the provider, consent wording and retention policy.</p>
  </section>;
}
