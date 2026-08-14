// PawFect Types & RBAC Definitions

export type UserRole =
  | "SUPER_ADMIN"
  | "CLINIC_ADMIN"
  | "VETERINARIAN"
  | "TECHNICIAN"
  | "RECEPTIONIST"
  | "PET_OWNER";

export type Permission =
  // Tenant & Clinic
  | "tenant:all_clinics_read"
  | "tenant:all_clinics_manage"
  | "clinic:settings_read"
  | "clinic:settings_write"
  | "clinic:audit_logs_read"
  | "clinic:export_data"
  // Staff & User Management
  | "staff:read"
  | "staff:invite"
  | "staff:modify_role"
  | "staff:deactivate"
  // Patients / Pets
  | "pets:read_all_clinic"
  | "pets:read_own_only"
  | "pets:create"
  | "pets:update"
  | "pets:delete"
  // Medical Records & SOAP
  | "records:read_all_clinic"
  | "records:read_own_only"
  | "records:create_soap"
  | "records:edit_soap"
  | "records:sign_prescription"
  | "records:delete"
  // Appointments & Queue
  | "appointments:read_all_clinic"
  | "appointments:read_own_only"
  | "appointments:create"
  | "appointments:update_status"
  | "appointments:cancel"
  // Billing & Invoices
  | "billing:read_clinic_financials"
  | "billing:read_own_invoices"
  | "billing:create_invoice"
  | "billing:process_payment"
  | "billing:refund"
  // Reminders & Communication
  | "reminders:manage"
  | "reminders:read_own"
  // Security & Sessions
  | "security:manage_2fa"
  | "security:revoke_sessions";

export interface RoleConfig {
  role: UserRole;
  title: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
  permissions: Permission[];
}

export interface Clinic {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  licenseNumber: string;
  subscriptionPlan: "Enterprise" | "Pro Practice" | "Starter";
  autoLockTimeoutMinutes: number;
  twoFactorRequired: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId?: string; // empty for SUPER_ADMIN or PET_OWNER with multi-clinic relations
  associatedClinicIds?: string[]; // for pet owners or multi-clinic staff
  avatarUrl?: string;
  title?: string;
  phone?: string;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  status: "Active" | "Suspended" | "Pending_Invite";
  lastLoginAt?: string;
  lastLoginIp?: string;
  passwordHash?: string; // Simulated SHA-256 hash
  createdAt: string;
  licenseNumber?: string; // For DVMs / Techs
}

export interface UserSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  clinicId?: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditActionType =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "AUTH_PASSWORD_CHANGED"
  | "AUTH_2FA_ENABLED"
  | "AUTH_2FA_DISABLED"
  | "AUTH_SESSION_REVOKED"
  | "AUTH_SESSION_LOCKED"
  | "AUTH_SESSION_UNLOCKED"
  | "RBAC_ROLE_MODIFIED"
  | "STAFF_INVITED"
  | "STAFF_DEACTIVATED"
  | "CLINIC_TENANT_SWITCHED"
  | "PATIENT_CREATED"
  | "PATIENT_UPDATED"
  | "PATIENT_ARCHIVED"
  | "RECORD_SOAP_CREATED"
  | "RECORD_PRESCRIPTION_SIGNED"
  | "RECORD_EXPORTED"
  | "APPOINTMENT_SCHEDULED"
  | "APPOINTMENT_STATUS_CHANGED"
  | "APPOINTMENT_CANCELLED"
  | "INVOICE_GENERATED"
  | "INVOICE_PAID"
  | "REMINDER_DISPATCHED";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditActionType;
  severity: AuditSeverity;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  clinicId?: string;
  clinicName?: string;
  targetResource: string;
  resourceId?: string;
  ipAddress: string;
  details: string;
  metadata?: Record<string, any>;
}

export type Species = "dog" | "cat" | "bird" | "rabbit" | "reptile" | "other";

export interface Pet {
  id: string;
  clinicId: string; // Tenant isolation key
  name: string;
  species: Species;
  breed: string;
  age: string;
  dateOfBirth: string;
  sex: "Male (Intact)" | "Male (Neutered)" | "Female (Intact)" | "Female (Spayed)";
  weightKg: number;
  color: string;
  microchipNumber: string;
  ownerId: string; // Pet owner isolation key
  ownerName: string;
  photoUrl?: string;
  vaccinationStatus: "Up to date" | "Due soon" | "Overdue";
  allergies: string[];
  currentMedications: string[];
  notes?: string;
  lastVisit?: string;
  isArchived?: boolean;
}

export interface PetOwner {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  totalPets: number;
  registeredAt: string;
  balanceDue: number;
}

export interface Prescription {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  refillsRemaining: number;
  instructions: string;
  signedByDvm?: string;
  signedAt?: string;
}

export interface VaccineRecord {
  id: string;
  name: string;
  administeredDate: string;
  expirationDate: string;
  batchNumber: string;
  administeredBy: string;
}

export interface Vitals {
  temperatureC: number;
  heartRateBpm: number;
  respiratoryRateBpm: number;
  weightKg: number;
  bodyConditionScore: number; // 1-9
  mucousMembraneColor?: string;
  capillaryRefillTimeSec?: number;
}

export interface MedicalRecord {
  id: string;
  clinicId: string; // Tenant isolation key
  petId: string;
  petName: string;
  ownerId: string; // Owner isolation key
  ownerName: string;
  veterinarianId: string;
  veterinarianName: string;
  date: string;
  chiefComplaint: string;
  history: string;
  physicalExamNotes: string;
  vitals?: Vitals;
  diagnosis: string;
  treatment: string;
  clientInstructions: string;
  prescriptions: Prescription[];
  vaccines: VaccineRecord[];
  isLocked?: boolean;
  signedHash?: string;
}

export type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Checked-in"
  | "In progress"
  | "Completed"
  | "Cancelled"
  | "No-show";

export interface Appointment {
  id: string;
  clinicId: string; // Tenant isolation key
  petId: string;
  petName: string;
  species: Species;
  ownerId: string; // Owner isolation key
  ownerName: string;
  ownerPhone: string;
  veterinarianId: string;
  veterinarianName: string;
  date: string;
  time: string;
  durationMinutes: number;
  reason: string;
  type: "Wellness Exam" | "Vaccination" | "Surgery" | "Emergency" | "Dental" | "Telehealth" | "Follow-up";
  status: AppointmentStatus;
  room?: string;
  notes?: string;
}

export interface Reminder {
  id: string;
  clinicId: string; // Tenant isolation key
  petId: string;
  petName: string;
  ownerId: string; // Owner isolation key
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  type: "Vaccine" | "Annual Wellness" | "Dental Check" | "Medication Refill" | "Follow-up Call";
  title: string;
  dueDate: string;
  status: "Pending" | "Sent" | "Completed" | "Dismissed";
  channel: "SMS" | "Email" | "App Push" | "All Channels";
  lastSentDate?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: "Consultation" | "Medication" | "Vaccine" | "Surgery" | "Diagnostic" | "Supplies";
}

export interface Invoice {
  id: string;
  clinicId: string; // Tenant isolation key
  ownerId: string; // Owner isolation key
  ownerName: string;
  ownerEmail: string;
  petId: string;
  petName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  status: "Paid" | "Pending" | "Overdue" | "Draft" | "Refunded";
  paymentMethod?: "Credit Card" | "Debit Card" | "Apple Pay" | "Cash" | "CareCredit";
  paidAt?: string;
}

// Role Permission Map definition
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "tenant:all_clinics_read",
    "tenant:all_clinics_manage",
    "clinic:settings_read",
    "clinic:settings_write",
    "clinic:audit_logs_read",
    "clinic:export_data",
    "staff:read",
    "staff:invite",
    "staff:modify_role",
    "staff:deactivate",
    "pets:read_all_clinic",
    "pets:create",
    "pets:update",
    "pets:delete",
    "records:read_all_clinic",
    "records:create_soap",
    "records:edit_soap",
    "records:sign_prescription",
    "records:delete",
    "appointments:read_all_clinic",
    "appointments:create",
    "appointments:update_status",
    "appointments:cancel",
    "billing:read_clinic_financials",
    "billing:create_invoice",
    "billing:process_payment",
    "billing:refund",
    "reminders:manage",
    "security:manage_2fa",
    "security:revoke_sessions",
  ],
  CLINIC_ADMIN: [
    "clinic:settings_read",
    "clinic:settings_write",
    "clinic:audit_logs_read",
    "clinic:export_data",
    "staff:read",
    "staff:invite",
    "staff:modify_role",
    "staff:deactivate",
    "pets:read_all_clinic",
    "pets:create",
    "pets:update",
    "pets:delete",
    "records:read_all_clinic",
    "records:create_soap",
    "records:edit_soap",
    "records:sign_prescription",
    "appointments:read_all_clinic",
    "appointments:create",
    "appointments:update_status",
    "appointments:cancel",
    "billing:read_clinic_financials",
    "billing:create_invoice",
    "billing:process_payment",
    "billing:refund",
    "reminders:manage",
    "security:manage_2fa",
    "security:revoke_sessions",
  ],
  VETERINARIAN: [
    "clinic:settings_read",
    "pets:read_all_clinic",
    "pets:create",
    "pets:update",
    "records:read_all_clinic",
    "records:create_soap",
    "records:edit_soap",
    "records:sign_prescription",
    "appointments:read_all_clinic",
    "appointments:create",
    "appointments:update_status",
    "appointments:cancel",
    "billing:create_invoice",
    "reminders:manage",
    "security:manage_2fa",
  ],
  TECHNICIAN: [
    "clinic:settings_read",
    "pets:read_all_clinic",
    "pets:update",
    "records:read_all_clinic",
    "records:create_soap", // Can log vitals/notes, but NOT sign Rx
    "appointments:read_all_clinic",
    "appointments:update_status",
    "reminders:manage",
    "security:manage_2fa",
  ],
  RECEPTIONIST: [
    "clinic:settings_read",
    "pets:read_all_clinic",
    "pets:create",
    "pets:update",
    "records:read_all_clinic",
    "appointments:read_all_clinic",
    "appointments:create",
    "appointments:update_status",
    "appointments:cancel",
    "billing:read_clinic_financials",
    "billing:create_invoice",
    "billing:process_payment",
    "reminders:manage",
    "security:manage_2fa",
  ],
  PET_OWNER: [
    "pets:read_own_only",
    "records:read_own_only",
    "appointments:read_own_only",
    "appointments:create",
    "appointments:cancel",
    "billing:read_own_invoices",
    "billing:process_payment",
    "reminders:read_own",
    "security:manage_2fa",
  ],
};

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  SUPER_ADMIN: {
    role: "SUPER_ADMIN",
    title: "Super Administrator",
    badgeColor: "text-amber-300",
    badgeBg: "bg-amber-950/80",
    badgeBorder: "border-amber-700/60",
    description: "Full global multi-tenant access across all clinics, security audit control, and system configuration.",
    permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
  },
  CLINIC_ADMIN: {
    role: "CLINIC_ADMIN",
    title: "Clinic Administrator",
    badgeColor: "text-purple-300",
    badgeBg: "bg-purple-950/80",
    badgeBorder: "border-purple-700/60",
    description: "Practice manager with full administrative privileges over clinic staff, settings, audit logs, and finances.",
    permissions: ROLE_PERMISSIONS.CLINIC_ADMIN,
  },
  VETERINARIAN: {
    role: "VETERINARIAN",
    title: "Veterinarian (DVM)",
    badgeColor: "text-teal-300",
    badgeBg: "bg-teal-950/80",
    badgeBorder: "border-teal-700/60",
    description: "Doctor of Veterinary Medicine. Authorized to chart SOAP records, prescribe medications, and lead clinical consultations.",
    permissions: ROLE_PERMISSIONS.VETERINARIAN,
  },
  TECHNICIAN: {
    role: "TECHNICIAN",
    title: "Veterinary Technician",
    badgeColor: "text-blue-300",
    badgeBg: "bg-blue-950/80",
    badgeBorder: "border-blue-700/60",
    description: "Clinical nurse/technician. Can record patient vitals, manage inpatient queue, and administer treatments.",
    permissions: ROLE_PERMISSIONS.TECHNICIAN,
  },
  RECEPTIONIST: {
    role: "RECEPTIONIST",
    title: "Front Desk Receptionist",
    badgeColor: "text-emerald-300",
    badgeBg: "bg-emerald-950/80",
    badgeBorder: "border-emerald-700/60",
    description: "Client service coordinator. Manages patient check-ins, appointment bookings, invoices, and reminders.",
    permissions: ROLE_PERMISSIONS.RECEPTIONIST,
  },
  PET_OWNER: {
    role: "PET_OWNER",
    title: "Pet Parent / Owner",
    badgeColor: "text-rose-300",
    badgeBg: "bg-rose-950/80",
    badgeBorder: "border-rose-700/60",
    description: "Client portal access strictly isolated to their own pets, medical summaries, vaccine passports, and invoices.",
    permissions: ROLE_PERMISSIONS.PET_OWNER,
  },
};
