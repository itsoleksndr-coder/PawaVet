import React, { useState, useId } from "react";
import { SubscriptionPanel } from "./SubscriptionPanel";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
const field =
  "block w-full mt-1 p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white";
const button =
  "px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold disabled:opacity-50";
const panel = "p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4";
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="text-sm text-slate-300">
      <label htmlFor={id}>{label}</label>
      {React.cloneElement(children as React.ReactElement<{ id?: string }>, {
        id,
      })}
    </div>
  );
}

function text(form: HTMLFormElement, key: string) {
  return String(new FormData(form).get(key) || "");
}
export function ClinicWorkspace() {
  const {
    currentUser,
    activeClinic,
    isPetOwner,
    hasPermission,
    logout,
    lockSession,
    updatePassword,
  } = useAuth();
  const {
    snapshot,
    pets,
    petOwners,
    appointments,
    medicalRecords,
    staffMembers,
    loading,
    error,
    refresh,
    mutate,
  } = useData();
  const [tab, setTab] = useState(() =>
    new URLSearchParams(window.location.search).has("billing") &&
    hasPermission("staff:invite")
      ? "Subscription"
      : "Today",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [recordPet, setRecordPet] = useState("");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Puerto_Rico",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  async function act(
    fn: () => Promise<unknown>,
    success = "Saved to clinic database.",
  ) {
    setBusy(true);
    setMessage("");
    setFailure("");
    try {
      await fn();
      setMessage(success);
      return true;
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Request failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function submit(
    e: React.FormEvent<HTMLFormElement>,
    path: string,
    body: (f: HTMLFormElement) => unknown,
  ) {
    e.preventDefault();
    const form = e.currentTarget;
    if (await act(() => mutate(path, "POST", body(form)))) form.reset();
  }
  const petSelect = (name = "petId") => (
    <select aria-label="Patient" name={name} required className={field}>
      <option value="">Choose patient</option>
      {pets.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} — {p.ownerName}
        </option>
      ))}
    </select>
  );
  const tabs = isPetOwner
    ? ["Today", "Patients", "Appointments", "Urgent care", "Account"]
    : [
        "Today",
        "Patients",
        "Appointments",
        "Records",
        "Urgent care",
        ...(hasPermission("staff:invite") ? ["Staff", "Subscription"] : []),
        "Account",
      ];
  if (loading) return <p className="p-8 text-white">Loading clinic records…</p>;
  const pending = snapshot.urgentIntakes.filter(
    (u) => !["Completed", "Declined"].includes(u.status),
  );
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold text-teal-400">PawaVet</p>
          <h1 className="text-xl font-bold">{activeClinic?.name}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span>
            {currentUser?.name} · {currentUser?.role.replaceAll("_", " ")}
          </span>
          <button onClick={lockSession}>Lock</button>
          <button onClick={() => void logout()} className={button}>
            Sign out
          </button>
        </div>
      </header>
      <nav
        aria-label="Clinic navigation"
        className="flex flex-wrap gap-2 p-4 border-b border-slate-800"
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setMessage("");
              setFailure("");
            }}
            aria-current={tab === t ? "page" : undefined}
            className={`px-4 py-2 rounded-lg ${tab === t ? "bg-teal-700" : "bg-slate-900"}`}
          >
            {t}
          </button>
        ))}
        <button
          className="px-3 text-slate-400"
          onClick={() => void act(refresh, "Clinic data refreshed.")}
        >
          Refresh data
        </button>
      </nav>
      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        <p className="text-sm text-slate-400">
          Clinic time: Puerto Rico (AST) · {today}
        </p>
        {(failure || error) && (
          <p
            role="alert"
            className="p-4 bg-rose-950 border border-rose-700 rounded-xl"
          >
            {failure || error}
          </p>
        )}
        {message && (
          <p role="status" className="p-3 rounded-xl bg-teal-950">
            {message}
          </p>
        )}
        {tab === "Subscription" && <SubscriptionPanel />}
        {tab === "Today" && (
          <>
            <h2 className="text-2xl font-bold">Clinic overview</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                ["Patients", pets.length],
                [
                  "Appointments today",
                  appointments.filter((a) => a.date === today).length,
                ],
                ["Open urgent requests", pending.length],
              ].map(([label, count]) => (
                <div key={label} className={panel}>
                  <p>{label}</p>
                  <p className="text-4xl font-bold">{count}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-300">
              Start with Patients to register an owner and pet, then schedule a
              visit and save its clinical record. Urgent requests require clinic
              review.
            </p>
            <p className="text-sm text-amber-300">
              Email reminders, payment collection, telemedicine and AI
              assistance are not available in this release.
            </p>
          </>
        )}
        {tab === "Patients" && (
          <>
            <h2 className="text-2xl font-bold">Patients and owners</h2>
            {hasPermission("pets:create") && (
              <div className="grid md:grid-cols-2 gap-5">
                <form
                  aria-label="Register owner"
                  className={panel}
                  onSubmit={(e) =>
                    void submit(e, "/api/owners", (f) => ({
                      name: text(f, "name"),
                      email: text(f, "email"),
                      phone: text(f, "phone"),
                    }))
                  }
                >
                  <h3 className="font-bold">Register owner</h3>
                  <Field label="Owner name">
                    <input name="name" required className={field} />
                  </Field>
                  <Field label="Owner email">
                    <input
                      name="email"
                      type="email"
                      required
                      className={field}
                    />
                  </Field>
                  <Field label="Phone">
                    <input name="phone" type="tel" required className={field} />
                  </Field>
                  <button disabled={busy} className={button}>
                    Save owner
                  </button>
                </form>
                <form
                  aria-label="Register patient"
                  className={panel}
                  onSubmit={(e) =>
                    void submit(e, "/api/pets", (f) => ({
                      name: text(f, "name"),
                      species: text(f, "species"),
                      ownerId: text(f, "ownerId"),
                      breed: text(f, "breed"),
                    }))
                  }
                >
                  <h3 className="font-bold">Register patient</h3>
                  <Field label="Pet name">
                    <input name="name" required className={field} />
                  </Field>
                  <Field label="Species">
                    <select name="species" className={field}>
                      {["dog", "cat", "bird", "rabbit", "reptile", "other"].map(
                        (s) => (
                          <option key={s}>{s}</option>
                        ),
                      )}
                    </select>
                  </Field>
                  <Field label="Breed (if known)">
                    <input name="breed" className={field} />
                  </Field>
                  <Field label="Owner">
                    <select name="ownerId" required className={field}>
                      <option value="">Choose owner</option>
                      {petOwners.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <button
                    disabled={busy || !petOwners.length}
                    className={button}
                  >
                    Save patient
                  </button>
                  <p className="text-xs text-slate-400">
                    Unentered measurements, vaccination status and identifiers
                    remain unknown.
                  </p>
                </form>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              {pets.map((p) => (
                <article key={p.id} className={panel}>
                  <h3 className="font-bold">{p.name}</h3>
                  <p>
                    {p.species} · {p.breed || "Breed unknown"}
                  </p>
                  <p>Owner: {p.ownerName}</p>
                  <p>Vaccination status: {p.vaccinationStatus}</p>
                </article>
              ))}
            </div>
            {!pets.length && <p>No patients yet.</p>}
          </>
        )}
        {tab === "Appointments" && (
          <>
            <h2 className="text-2xl font-bold">Appointments</h2>
            {!isPetOwner && hasPermission("appointments:create") && (
              <form
                aria-label="Schedule appointment"
                className={panel}
                onSubmit={(e) =>
                  void submit(e, "/api/appointments", (f) => ({
                    petId: text(f, "petId"),
                    veterinarianId: text(f, "veterinarianId"),
                    date: text(f, "date"),
                    time: text(f, "time"),
                    reason: text(f, "reason"),
                    type: "Wellness Exam",
                    durationMinutes: 30,
                  }))
                }
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Patient">{petSelect()}</Field>
                  <Field label="Clinician">
                    <select name="veterinarianId" required className={field}>
                      <option value="">Choose clinician</option>
                      {staffMembers
                        .filter((s) =>
                          ["VETERINARIAN", "CLINIC_ADMIN"].includes(s.role),
                        )
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <Field label="Date">
                    <input
                      name="date"
                      type="date"
                      required
                      defaultValue={today}
                      className={field}
                    />
                  </Field>
                  <Field label="Time (Puerto Rico)">
                    <select name="time" className={field}>
                      {[
                        "09:00 AM",
                        "09:30 AM",
                        "10:00 AM",
                        "10:30 AM",
                        "11:00 AM",
                        "11:30 AM",
                        "01:00 PM",
                        "01:30 PM",
                        "02:00 PM",
                        "02:30 PM",
                        "03:00 PM",
                        "03:30 PM",
                        "04:00 PM",
                      ].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Reason for visit">
                    <input name="reason" required className={field} />
                  </Field>
                </div>
                <button disabled={busy} className={button}>
                  Book appointment
                </button>
              </form>
            )}
            {appointments.map((a) => (
              <article key={a.id} className={panel}>
                <h3 className="font-bold">
                  {a.petName} — {a.reason}
                </h3>
                <p>
                  {a.date} · {a.time} AST · {a.veterinarianName}
                </p>
                <p>Status: {a.status}</p>
                {!isPetOwner && (
                  <div className="flex gap-3">
                    {(a.status === "Scheduled" || a.status === "Confirmed") && (
                      <button
                        disabled={busy}
                        className={button}
                        onClick={() =>
                          void act(() =>
                            mutate("/api/appointments/" + a.id, "PATCH", {
                              status: "Checked-in",
                            }),
                          )
                        }
                      >
                        Check in
                      </button>
                    )}
                    {a.status === "Checked-in" && (
                      <button
                        disabled={busy}
                        className={button}
                        onClick={() =>
                          void act(() =>
                            mutate("/api/appointments/" + a.id, "PATCH", {
                              status: "In progress",
                            }),
                          )
                        }
                      >
                        Start visit
                      </button>
                    )}
                    {a.status === "In progress" && (
                      <button
                        disabled={busy}
                        className={button}
                        onClick={() =>
                          void act(() =>
                            mutate("/api/appointments/" + a.id, "PATCH", {
                              status: "Completed",
                            }),
                          )
                        }
                      >
                        Complete visit
                      </button>
                    )}
                    {["Scheduled", "Confirmed", "Checked-in"].includes(
                      a.status,
                    ) && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          void act(() =>
                            mutate("/api/appointments/" + a.id, "PATCH", {
                              status: "Cancelled",
                            }),
                          )
                        }
                      >
                        Cancel visit
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
            {!appointments.length && <p>No appointments yet.</p>}
          </>
        )}
        {tab === "Records" && (
          <>
            <h2 className="text-2xl font-bold">Medical records</h2>
            {hasPermission("records:create_soap") && (
              <form
                aria-label="Create medical record"
                className={panel}
                onSubmit={(e) =>
                  void submit(e, "/api/records", (f) => ({
                    petId: text(f, "petId"),
                    appointmentId: text(f, "appointmentId"),
                    chiefComplaint: text(f, "chiefComplaint"),
                    diagnosis: text(f, "diagnosis"),
                    physicalExamNotes: text(f, "physicalExamNotes"),
                    treatment: text(f, "treatment"),
                    clientInstructions: text(f, "clientInstructions"),
                  }))
                }
              >
                <Field label="Patient">
                  <select
                    name="petId"
                    required
                    value={recordPet}
                    onChange={(e) => setRecordPet(e.target.value)}
                    className={field}
                  >
                    <option value="">Choose patient</option>
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Linked appointment">
                  <select
                    key={recordPet}
                    name="appointmentId"
                    required
                    className={field}
                  >
                    <option value="">Choose this patient’s visit</option>
                    {appointments
                      .filter(
                        (a) =>
                          a.petId === recordPet &&
                          !["Cancelled", "No-show"].includes(a.status),
                      )
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.date} {a.time} — {a.reason}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Chief complaint">
                  <input name="chiefComplaint" required className={field} />
                </Field>
                <Field label="Physical examination findings">
                  <textarea name="physicalExamNotes" className={field} />
                </Field>
                <Field label="Diagnosis">
                  <input name="diagnosis" required className={field} />
                </Field>
                <Field label="Treatment plan">
                  <textarea name="treatment" className={field} />
                </Field>
                <Field label="Client instructions">
                  <textarea name="clientInstructions" className={field} />
                </Field>
                <button disabled={busy} className={button}>
                  Save clinical record
                </button>
                <p className="text-xs text-slate-400">
                  Records retain the author and server time. Saved entries are
                  read-only.
                </p>
              </form>
            )}
            {medicalRecords.map((r) => (
              <article key={r.id} className={panel}>
                <h3 className="font-bold">
                  {r.petName} — {r.chiefComplaint}
                </h3>
                <p>{r.diagnosis}</p>
                <p>{r.physicalExamNotes}</p>
                <p>{r.treatment}</p>
                <p>{r.clientInstructions}</p>
                <p className="text-sm text-slate-400">
                  Recorded by {r.veterinarianName} ·{" "}
                  {new Date(r.date).toLocaleString("en-US", {
                    timeZone: "America/Puerto_Rico",
                  })}{" "}
                  AST
                </p>
              </article>
            ))}
            {!medicalRecords.length && <p>No medical records yet.</p>}
          </>
        )}
        {tab === "Urgent care" && (
          <>
            <h2 className="text-2xl font-bold">Urgent-care intake</h2>
            <p>
              Submitting a request does not confirm acceptance. Clinic staff
              review requests and assign priority. Contact your clinic directly
              if immediate care is needed.
            </p>
            <form
              aria-label="Urgent request"
              className={panel}
              onSubmit={(e) =>
                void submit(e, "/api/urgent-intakes", (f) => ({
                  petId: text(f, "petId"),
                  concern: text(f, "concern"),
                }))
              }
            >
              <Field label="Patient">{petSelect()}</Field>
              <Field label="Presenting concern">
                <textarea name="concern" required className={field} />
              </Field>
              <button disabled={busy} className={button}>
                Submit urgent request
              </button>
            </form>
            {[...snapshot.urgentIntakes]
              .sort(
                (a, b) =>
                  (a.priority ?? 99) - (b.priority ?? 99) ||
                  a.receivedAt.localeCompare(b.receivedAt),
              )
              .map((u) => (
                <article key={u.id} className={panel}>
                  <h3 className="font-bold">
                    {u.petName} — {u.concern}
                  </h3>
                  <p>
                    {u.status} · Priority: {u.priority ?? "Awaiting review"} ·
                    Submitted by {u.source}
                  </p>
                  {u.decisionNote && <p>{u.decisionNote}</p>}
                  {!isPetOwner &&
                    !["Completed", "Declined"].includes(u.status) && (
                      <form
                        aria-label={"Review " + u.petName}
                        className="flex flex-wrap gap-3 items-end"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          void act(() =>
                            mutate("/api/urgent-intakes/" + u.id, "PATCH", {
                              status: text(form, "status"),
                              priority: Number(text(form, "priority")),
                              decisionNote: text(form, "decisionNote"),
                            }),
                          );
                        }}
                      >
                        <Field label="Priority (1 first)">
                          <select
                            name="priority"
                            defaultValue={u.priority || 3}
                            className={field}
                          >
                            {[1, 2, 3, 4, 5].map((p) => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Decision">
                          <select name="status" className={field}>
                            {(u.status === "Pending review"
                              ? ["Accepted", "Declined"]
                              : u.status === "Accepted"
                                ? ["Accepted", "In care", "Declined"]
                                : ["Completed"]
                            ).map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Decision note">
                          <input name="decisionNote" className={field} />
                        </Field>
                        <button disabled={busy} className={button}>
                          Save review
                        </button>
                      </form>
                    )}
                </article>
              ))}
          </>
        )}
        {tab === "Staff" && (
          <>
            <h2 className="text-2xl font-bold">Clinic accounts</h2>
            <form
              aria-label="Provision account"
              className={panel}
              onSubmit={(e) =>
                void submit(e, "/api/staff", (f) => ({
                  name: text(f, "name"),
                  email: text(f, "email"),
                  password: text(f, "password"),
                  role: text(f, "role"),
                  ownerId: text(f, "ownerId") || undefined,
                }))
              }
            >
              <Field label="Account name">
                <input name="name" required className={field} />
              </Field>
              <Field label="Account email">
                <input name="email" type="email" required className={field} />
              </Field>
              <Field label="Initial password (12+ characters)">
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  required
                  className={field}
                />
              </Field>
              <Field label="Role">
                <select name="role" className={field}>
                  {[
                    "VETERINARIAN",
                    "RECEPTIONIST",
                    "TECHNICIAN",
                    "PET_OWNER",
                  ].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Owner link (required for owner accounts)">
                <select name="ownerId" className={field}>
                  <option value="">Staff account</option>
                  {petOwners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </Field>
              <button disabled={busy} className={button}>
                Create account
              </button>
              <p className="text-xs text-slate-400">
                No invitation email is sent. Share credentials securely and ask
                the user to change their password.
              </p>
            </form>
            {staffMembers.map((s) => (
              <p key={s.id}>
                {s.name} · {s.email} · {s.role}
              </p>
            ))}
          </>
        )}
        {tab === "Account" && (
          <form
            className={panel}
            aria-label="Change password"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = e.currentTarget;
              void act(async () => {
                const r = await updatePassword(text(f, "old"), text(f, "new"));
                if (!r.success) throw new Error(r.message);
              }, "Password changed. Sign in again.");
            }}
          >
            <h2 className="text-xl font-bold">Change password</h2>
            <Field label="Current password">
              <input
                name="old"
                type="password"
                autoComplete="current-password"
                required
                className={field}
              />
            </Field>
            <Field label="New password">
              <input
                name="new"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                className={field}
              />
            </Field>
            <button disabled={busy} className={button}>
              Change password
            </button>
            <p className="text-sm text-slate-400">
              Changing your password signs out all sessions. Two-factor
              authentication and self-service password recovery are not
              available in this release.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
