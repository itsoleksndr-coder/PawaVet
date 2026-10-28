import React, { useState } from "react";
import { request } from "../api-client";
const categories = [
  { key: "appointments", name: "Citas y recordatorios" },
  { key: "onboarding", name: "Cuentas y acceso" },
  { key: "billing", name: "Facturación" },
  { key: "technical", name: "Soporte técnico" },
] as const;
type Category = typeof categories[number]["key"];
type Message = { role: "user" | "assistant"; content: string };
export function SupportPanel() {
  const [agent, setAgent] = useState<Category>("appointments");
  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await request<{ answer: string; agent: Category }>("/api/support/chat", "POST", {
        agent, message, history: history.slice(-8),
      }, 30_000);
      setHistory([...history, { role: "user", content: message }, { role: "assistant", content: result.answer }]);
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Soporte no disponible.");
    } finally { setBusy(false); }
  };
  return <section className="space-y-4 max-w-3xl">
    <h2 className="text-2xl font-bold">Soporte PawaVet</h2>
    <p className="text-sm text-slate-300">Elige una de las cuatro áreas de soporte. Responden cuando el proveedor de IA está configurado y disponible; no sustituyen al veterinario ni modifican citas. No incluyas información médica identificable, contraseñas ni códigos.</p>
    <label className="block text-sm">Especialista
      <select aria-label="Support agent" className="w-full mt-2 p-3 rounded-xl bg-slate-900 border border-slate-700" value={agent} onChange={(e) => { setAgent(e.target.value as Category); setHistory([]); setError(""); }}>
        {categories.map(option => <option key={option.key} value={option.key}>{option.name}</option>)}
      </select>
    </label>
    <div aria-live="polite" className="min-h-40 max-h-96 overflow-y-auto p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-3">
      {history.length ? history.map((m, index) => <p key={index} className={m.role === "assistant" ? "text-teal-200" : "text-slate-100"}><strong>{m.role === "assistant" ? "PawaVet: " : "Tú: "}</strong>{m.content}</p>) : <p className="text-slate-400">Haz una pregunta para comenzar.</p>}
    </div>
    <form onSubmit={(e) => void send(e)} className="space-y-3">
      <label className="block text-sm">Tu pregunta
        <textarea aria-label="Support question" maxLength={1800} required value={draft} onChange={(e) => setDraft(e.target.value)} className="block w-full mt-2 p-3 rounded-xl bg-slate-900 border border-slate-700" rows={3} />
      </label>
      {error && <p role="alert" className="text-rose-300">{error}</p>}
      <button disabled={busy || draft.trim().length < 2} className="px-4 py-2 rounded-lg bg-teal-700 disabled:opacity-50">{busy ? "Enviando..." : "Enviar al agente"}</button>
    </form>
  </section>;
}
