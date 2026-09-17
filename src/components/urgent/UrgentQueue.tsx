import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { api } from "../../lib/api";
interface Entry {
  id: string;
  petId: string;
  petName: string;
  reason: string;
  status: "Requested" | "Accepted" | "Declined" | "Completed";
  priority: number | null;
  version: number;
  createdAt: string;
}
export function UrgentQueue() {
  const { isPetOwner, hasPermission } = useAuth();
  const { pets } = useData();
  const [entries, setEntries] = useState<Entry[]>([]),
    [petId, setPet] = useState(""),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      setEntries(await api<Entry[]>("/urgent"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load queue.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    return () => clearInterval(timer);
  }, [refresh]);
  async function update(
    row: Entry,
    status: Entry["status"],
    priority: number | null,
  ) {
    setBusy(true);
    try {
      await api("/urgent/" + row.id, "PATCH", {
        status,
        priority,
        version: row.version,
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update request.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Urgent-care queue</h1>
      <p className="bg-amber-950 text-amber-100 p-4 rounded-xl">
        Submitting a request does not confirm care. Clinic staff must accept it
        and assign priority. For an emergency, contact a veterinary clinic
        directly.
      </p>
      {(isPetOwner || hasPermission("appointments:update_status")) && (
        <form
          className="bg-slate-900 p-5 rounded-xl space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await api("/urgent", "POST", { petId, reason });
              setReason("");
              await refresh();
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Unable to submit request.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="font-bold">Request urgent care</h2>
          <label className="block">
            Patient
            <select
              required
              value={petId}
              onChange={(e) => setPet(e.target.value)}
              className="block bg-slate-950 w-full p-3 rounded-lg"
            >
              <option value="">Select a saved patient</option>
              {pets.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Reason
            <textarea
              required
              maxLength={2000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="block bg-slate-950 w-full p-3 rounded-lg"
            />
          </label>
          <button
            disabled={busy || !pets.length}
            className="bg-teal-600 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {busy ? "Saving…" : "Submit request"}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-rose-300">
          {error}
        </p>
      )}
      <button onClick={() => void refresh()} className="underline">
        Refresh queue
      </button>
      {loading ? (
        <p role="status">Loading queue…</p>
      ) : entries.length === 0 ? (
        <p>No urgent-care requests.</p>
      ) : (
        entries.map((row) => (
          <article
            key={row.id}
            className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-3"
          >
            <div className="flex justify-between">
              <h2 className="font-bold">{row.petName}</h2>
              <span>
                {row.status}
                {row.priority ? ` · Priority ${row.priority}` : ""}
              </span>
            </div>
            <p>{row.reason}</p>
            <p className="text-xs text-slate-400">
              Submitted{" "}
              {new Date(row.createdAt).toLocaleString("en-US", {
                timeZone: "America/Puerto_Rico",
              })}{" "}
              · Puerto Rico time
            </p>
            {hasPermission("appointments:update_status") &&
              ["Requested", "Accepted"].includes(row.status) && (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((priority) => (
                    <button
                      disabled={busy}
                      key={priority}
                      onClick={() => void update(row, "Accepted", priority)}
                      className="border border-teal-600 px-3 py-2 rounded"
                    >
                      {row.status === "Requested" ? "Accept · " : ""}Priority{" "}
                      {priority}
                    </button>
                  ))}
                  <button
                    disabled={busy}
                    onClick={() =>
                      void update(
                        row,
                        row.status === "Requested" ? "Declined" : "Completed",
                        null,
                      )
                    }
                    className="px-3 py-2 bg-slate-700 rounded"
                  >
                    {row.status === "Requested" ? "Decline" : "Complete"}
                  </button>
                </div>
              )}
          </article>
        ))
      )}
    </section>
  );
}
