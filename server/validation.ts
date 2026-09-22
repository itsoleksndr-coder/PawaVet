import { z } from "zod";
const text = z.string().trim().max(4000);
const required = text.min(1);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) =>
      !Number.isNaN(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s,
    "Invalid calendar date",
  );
export const ownerInput = z.object({
  name: required,
  email: z.email(),
  phone: required,
  address: text.default(""),
  emergencyContact: text.default(""),
});
export const petInput = z.object({
  name: required,
  species: z.enum(["dog", "cat", "bird", "rabbit", "reptile", "other"]),
  ownerId: required,
  breed: text.default(""),
  age: text.default(""),
  dateOfBirth: z.union([date, z.literal("")]).default(""),
  sex: z
    .enum([
      "Unknown",
      "Male (Intact)",
      "Male (Neutered)",
      "Female (Intact)",
      "Female (Spayed)",
    ])
    .default("Unknown"),
  weightKg: z.number().positive().max(2000).nullable().default(null),
  color: text.default(""),
  microchipNumber: text.default(""),
  vaccinationStatus: z
    .enum(["Unknown", "Up to date", "Due soon", "Overdue"])
    .default("Unknown"),
  allergies: z.array(text).max(50).default([]),
  currentMedications: z.array(text).max(50).default([]),
  notes: text.default(""),
});
export const appointmentInput = z.object({
  petId: required,
  veterinarianId: required,
  date,
  time: z.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/),
  durationMinutes: z.number().int().min(5).max(480).default(30),
  reason: required,
  type: z.enum([
    "Wellness Exam",
    "Vaccination",
    "Surgery",
    "Emergency",
    "Dental",
    "Telehealth",
    "Follow-up",
  ]),
  notes: text.default(""),
});
export const statusInput = z.object({
  status: z.enum([
    "Scheduled",
    "Confirmed",
    "Checked-in",
    "In progress",
    "Completed",
    "Cancelled",
    "No-show",
  ]),
});
export const recordInput = z.object({
  petId: required,
  appointmentId: required,
  chiefComplaint: required,
  history: text.default(""),
  physicalExamNotes: text.default(""),
  diagnosis: required,
  treatment: text.default(""),
  clientInstructions: text.default(""),
  vitals: z
    .object({
      temperatureC: z.number().min(0).max(60),
      heartRateBpm: z.number().positive().max(1000),
      respiratoryRateBpm: z.number().positive().max(1000),
      weightKg: z.number().positive().max(2000),
      bodyConditionScore: z.number().int().min(1).max(9),
    })
    .optional(),
});
export const urgentInput = z.object({ petId: required, concern: required });
export const urgentDecision = z.object({
  status: z.enum(["Accepted", "In care", "Completed", "Declined"]),
  priority: z.number().int().min(1).max(5).nullable(),
  decisionNote: text.default(""),
});
export const loginInput = z.object({
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(1).max(256),
});
export const staffInput = z.object({
  name: required,
  email: z.email().transform((s) => s.toLowerCase()),
  password: z.string().min(12).max(256),
  role: z.enum(["VETERINARIAN", "RECEPTIONIST", "TECHNICIAN", "PET_OWNER"]),
  ownerId: text.optional(),
});
export const passwordInput = z.object({
  oldPassword: z.string().min(1).max(256),
  newPassword: z.string().min(12).max(256),
});
