import { randomUUID } from "node:crypto";
import { db, type Sql } from "./db";
import type { Appointment, PetOwner, Clinic } from "../src/types";
import type { ClinicData } from "../src/clinic-model";

type Channel = "email" | "sms";
export interface ReminderJob extends Record<string, unknown> {
  id: string;
  clinic_id: string;
  appointment_id: string;
  channel: Channel;
  recipient: string;
  status: string;
  due_at: string;
  sent_at: string | null;
  error_code: string | null;
}
function appointmentTime(appointment: Appointment): number {
  const match = /^(\d{2}):(\d{2}) (AM|PM)$/.exec(appointment.time);
  if (!match) throw new Error("Invalid appointment time.");
  const hours = Number(match[1]) % 12 + (match[3] === "PM" ? 12 : 0);
  // Puerto Rico always observes AST UTC-4, without daylight saving time.
  return Date.parse(`${appointment.date}T${String(hours).padStart(2, "0")}:${match[2]}:00-04:00`);
}
function smsRecipient(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return null;
}
export async function queueAppointmentReminders(
  tx: Sql, appointment: Appointment, owner: PetOwner,
): Promise<void> {
  if (["Cancelled", "No-show", "Completed"].includes(appointment.status)) return;
  const at = appointmentTime(appointment);
  if (!Number.isFinite(at) || at <= Date.now()) return;
  // Scheduling within 24h sends on the next worker run instead of missing the reminder.
  const due = new Date(Math.max(Date.now(), at - 24 * 60 * 60 * 1000)).toISOString();
  const channels: Array<{ channel: Channel; recipient: string }> = [];
  if (owner.emailReminderConsent) channels.push({ channel: "email", recipient: owner.email });
  const normalized = smsRecipient(owner.phone);
  if (owner.smsReminderConsent && normalized) channels.push({ channel: "sms", recipient: normalized });
  for (const { channel, recipient } of channels) {
    await tx.query(
      `INSERT INTO reminder_jobs(id,clinic_id,appointment_id,channel,recipient,due_at,status)
       VALUES($1,$2,$3,$4,$5,$6,'pending')
       ON CONFLICT(appointment_id,channel) DO UPDATE
       SET recipient=EXCLUDED.recipient, due_at=EXCLUDED.due_at, status='pending',
           claimed_at=NULL, error_code=NULL
       WHERE reminder_jobs.status='cancelled'`,
      [randomUUID(), appointment.clinicId, appointment.id, channel, recipient, due],
    );
  }
}
export async function cancelAppointmentReminders(tx: Sql, appointmentId: string) {
  await tx.query(
    "UPDATE reminder_jobs SET status='cancelled' WHERE appointment_id=$1 AND status='pending'",
    [appointmentId],
  );
}
export async function updateOwnerReminders(tx: Sql, data: ClinicData, owner: PetOwner) {
  // Changes to consent must take effect on all unsent messages.
  const appointments = data.appointments.filter(a => a.ownerId === owner.id);
  for (const appointment of appointments) {
    if (!owner.emailReminderConsent) {
      await tx.query(
        "UPDATE reminder_jobs SET status='cancelled' WHERE appointment_id=$1 AND channel='email' AND status='pending'",
        [appointment.id],
      );
    }
    if (!owner.smsReminderConsent) {
      await tx.query(
        "UPDATE reminder_jobs SET status='cancelled' WHERE appointment_id=$1 AND channel='sms' AND status='pending'",
        [appointment.id],
      );
    }
    await queueAppointmentReminders(tx, appointment, owner);
  }
}
function configured(channel: Channel): boolean {
  return channel === "email"
    ? !!(process.env.RESEND_API_KEY && process.env.REMINDER_FROM_EMAIL)
    : !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}
async function deliver(job: ReminderJob, clinic: Clinic, appointment: Appointment): Promise<void> {
  const body = `Recordatorio de cita: ${clinic.name}, ${appointment.date} a las ${appointment.time} (hora de Puerto Rico). Si necesita cambios, comuníquese con la clínica. Mensaje automático; no responda aquí.`;
  if (job.channel === "email") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": job.id,
      },
      body: JSON.stringify({
        from: process.env.REMINDER_FROM_EMAIL,
        to: [job.recipient],
        subject: `Recordatorio de cita · ${clinic.name}`,
        text: body,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`email_provider_http_${response.status}`);
  } else {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: job.recipient,
          From: process.env.TWILIO_FROM_NUMBER!,
          Body: body,
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok) throw new Error(`sms_provider_http_${response.status}`);
  }
}
let running = false;
export async function dispatchDueReminders(): Promise<number> {
  if (running) return 0;
  running = true;
  try {
    const database = await db();
    // A worker killed mid-request leaves "unknown", never silently retries an
    // ambiguous provider response and risks double-notifying patients.
    await database.query(
      "UPDATE reminder_jobs SET status='unknown', error_code='delivery_outcome_unknown' WHERE status='sending' AND claimed_at < now() - interval '15 minutes'",
    );
    const jobs = await database.transaction(async tx => {
      const result = await tx.query<ReminderJob>(
        `SELECT * FROM reminder_jobs WHERE status='pending' AND due_at <= now()
        ORDER BY due_at ASC LIMIT 10 FOR UPDATE SKIP LOCKED`,
      );
      const selected = result.rows.filter(job => configured(job.channel));
      for (const job of selected) {
        await tx.query("UPDATE reminder_jobs SET status='sending', claimed_at=now() WHERE id=$1", [job.id]);
      }
      return selected;
    });
    for (const job of jobs) {
      try {
        // Recheck latest data before contacting provider; never send cancelled,
        // rescheduled, or opted-out appointment notifications.
        const records = await database.query<{ profile: Clinic; data: ClinicData }>(
          "SELECT profile,data FROM clinics WHERE id=$1", [job.clinic_id],
        );
        const clinic = records.rows[0];
        const appointment = clinic?.data.appointments.find(a => a.id === job.appointment_id);
        const owner = appointment && clinic.data.petOwners.find(o => o.id === appointment.ownerId);
        const consent = job.channel === "email" ? owner?.emailReminderConsent : owner?.smsReminderConsent;
        if (!appointment || !owner || !consent || ["Cancelled","No-show","Completed"].includes(appointment.status) || appointmentTime(appointment) <= Date.now()) {
          await database.query("UPDATE reminder_jobs SET status='cancelled' WHERE id=$1", [job.id]);
          continue;
        }
        await deliver(job, clinic.profile, appointment);
        await database.query(
          "UPDATE reminder_jobs SET status='sent', sent_at=now(), error_code=NULL WHERE id=$1", [job.id],
        );
      } catch (error) {
        // Error codes contain no recipient/clinical data. Unknown delivery
        // outcomes require staff review rather than automatic unsafe retries.
        const code = error instanceof Error ? error.message.slice(0, 80) : "delivery_failure";
        await database.query(
          "UPDATE reminder_jobs SET status='unknown', error_code=$2 WHERE id=$1",
          [job.id, code],
        );
      }
    }
    return jobs.length;
  } finally {
    running = false;
  }
}
