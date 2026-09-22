import type {
  Appointment,
  AuditLogEntry,
  Clinic,
  Invoice,
  MedicalRecord,
  Pet,
  PetOwner,
  Reminder,
  User,
} from "./types";
export interface UrgentIntake {
  id: string;
  clinicId: string;
  petId: string;
  petName: string;
  ownerId: string;
  concern: string;
  source: "owner" | "staff";
  receivedAt: string;
  status: "Pending review" | "Accepted" | "In care" | "Completed" | "Declined";
  priority: number | null;
  decisionNote: string;
  reviewedBy?: string;
}
export interface ClinicData {
  pets: Pet[];
  petOwners: PetOwner[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  urgentIntakes: UrgentIntake[];
  reminders: Reminder[];
  invoices: Invoice[];
  auditLogs: AuditLogEntry[];
}
export interface ClinicSnapshot extends ClinicData {
  staffMembers: User[];
}
export interface AuthSession {
  user: User;
  clinic: Clinic;
}
export const emptyData = (): ClinicData => ({
  pets: [],
  petOwners: [],
  appointments: [],
  medicalRecords: [],
  urgentIntakes: [],
  reminders: [],
  invoices: [],
  auditLogs: [],
});
