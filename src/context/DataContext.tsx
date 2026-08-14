import React, { createContext, useContext, useState, useMemo } from "react";
import {
  Pet,
  PetOwner,
  MedicalRecord,
  Appointment,
  Reminder,
  Invoice,
  User,
  UserRole,
  Species,
  AppointmentStatus,
} from "../types";
import {
  INITIAL_PETS,
  INITIAL_PET_OWNERS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_APPOINTMENTS,
  INITIAL_REMINDERS,
  INITIAL_INVOICES,
  INITIAL_USERS,
} from "../data/initialData";
import { useAuth } from "./AuthContext";

interface DataContextType {
  // Filtered & Isolated Data Lists (Respecting Active Role & Tenant Isolation)
  pets: Pet[];
  petOwners: PetOwner[];
  medicalRecords: MedicalRecord[];
  appointments: Appointment[];
  reminders: Reminder[];
  invoices: Invoice[];
  staffMembers: User[];

  // Global / Unfiltered counts for Super Admin metrics
  allPetsCount: number;
  allClinicsCount: number;

  // Pet CRUD
  addPet: (petData: Omit<Pet, "id" | "clinicId">) => Pet;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  deletePet: (petId: string) => void;

  // Medical Records (SOAP) CRUD
  addMedicalRecord: (recordData: Omit<MedicalRecord, "id" | "clinicId">) => MedicalRecord;
  signPrescription: (recordId: string, prescriptionId: string, dvmLicenseText: string) => void;
  exportMedicalRecordPdf: (recordId: string) => void;

  // Appointments CRUD & Queue
  addAppointment: (aptData: Omit<Appointment, "id" | "clinicId">) => Appointment;
  updateAppointmentStatus: (aptId: string, newStatus: AppointmentStatus) => void;
  cancelAppointment: (aptId: string, reason?: string) => void;

  // Reminders
  addReminder: (remData: Omit<Reminder, "id" | "clinicId">) => Reminder;
  sendReminderNow: (remId: string) => void;
  dismissReminder: (remId: string) => void;

  // Billing & Invoices
  addInvoice: (invData: Omit<Invoice, "id" | "clinicId">) => Invoice;
  payInvoice: (invId: string, paymentMethod: Invoice["paymentMethod"]) => void;

  // Staff Management
  inviteStaffMember: (staffData: { name: string; email: string; role: UserRole; title: string }) => void;
  updateStaffRole: (staffId: string, newRole: UserRole) => void;
  toggleStaffStatus: (staffId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    activeRole,
    activeClinic,
    clinics,
    isSuperAdmin,
    isPetOwner,
    hasPermission,
    recordAuditLog,
  } = useAuth();

  // Raw State Stores
  const [allPets, setAllPets] = useState<Pet[]>(INITIAL_PETS);
  const [allPetOwners, setAllPetOwners] = useState<PetOwner[]>(INITIAL_PET_OWNERS);
  const [allRecords, setAllRecords] = useState<MedicalRecord[]>(INITIAL_MEDICAL_RECORDS);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [allReminders, setAllReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [allStaff, setAllStaff] = useState<User[]>(INITIAL_USERS);

  // Active Clinic Tenant ID
  const currentClinicId = activeClinic?.id || "clinic-1";

  // Data Isolation: Pets
  const pets = useMemo(() => {
    if (!currentUser) return [];
    if (isPetOwner) {
      // Pet owners only see their own pets
      return allPets.filter(
        (p) => p.ownerId === currentUser.id || p.ownerName.toLowerCase() === currentUser.name.toLowerCase()
      );
    }
    if (isSuperAdmin) {
      // Super admin views active clinic or all
      return allPets.filter((p) => p.clinicId === currentClinicId);
    }
    // Clinic staff only sees pets belonging to their clinic tenant
    return allPets.filter((p) => p.clinicId === currentClinicId);
  }, [allPets, currentUser, isPetOwner, isSuperAdmin, currentClinicId]);

  // Data Isolation: Pet Owners
  const petOwners = useMemo(() => {
    if (!currentUser) return [];
    if (isPetOwner) {
      return allPetOwners.filter((o) => o.id === currentUser.id || o.email === currentUser.email);
    }
    return allPetOwners.filter((o) => o.clinicId === currentClinicId);
  }, [allPetOwners, currentUser, isPetOwner, currentClinicId]);

  // Data Isolation: Medical Records
  const medicalRecords = useMemo(() => {
    if (!currentUser) return [];
    if (isPetOwner) {
      const myPetIds = pets.map((p) => p.id);
      return allRecords.filter((r) => myPetIds.includes(r.petId) || r.ownerId === currentUser.id);
    }
    return allRecords.filter((r) => r.clinicId === currentClinicId);
  }, [allRecords, currentUser, isPetOwner, currentClinicId, pets]);

  // Data Isolation: Appointments
  const appointments = useMemo(() => {
    if (!currentUser) return [];
    if (isPetOwner) {
      const myPetIds = pets.map((p) => p.id);
      return allAppointments.filter((a) => myPetIds.includes(a.petId) || a.ownerId === currentUser.id);
    }
    return allAppointments.filter((a) => a.clinicId === currentClinicId);
  }, [allAppointments, currentUser, isPetOwner, currentClinicId, pets]);

  // Data Isolation: Reminders
  const reminders = useMemo(() => {
    if (!currentUser) return [];
    if (isPetOwner) {
      const myPetIds = pets.map((p) => p.id);
      return allReminders.filter((rem) => myPetIds.includes(rem.petId) || rem.ownerId === currentUser.id);
    }
    return allReminders.filter((rem) => rem.clinicId === currentClinicId);
  }, [allReminders, currentUser, isPetOwner, currentClinicId, pets]);

  // Data Isolation: Invoices
  const invoices = useMemo(() => {
    if (!currentUser) return [];
    if (isPetOwner) {
      return allInvoices.filter((inv) => inv.ownerId === currentUser.id || inv.ownerEmail === currentUser.email);
    }
    return allInvoices.filter((inv) => inv.clinicId === currentClinicId);
  }, [allInvoices, currentUser, isPetOwner, currentClinicId]);

  // Data Isolation: Staff Members
  const staffMembers = useMemo(() => {
    if (!currentUser) return [];
    if (isPetOwner) return [];
    if (isSuperAdmin) {
      return allStaff.filter((u) => u.role !== "PET_OWNER");
    }
    return allStaff.filter((u) => u.clinicId === currentClinicId && u.role !== "PET_OWNER");
  }, [allStaff, currentUser, isPetOwner, isSuperAdmin, currentClinicId]);

  // PET OPERATIONS
  const addPet = (petData: Omit<Pet, "id" | "clinicId">): Pet => {
    const newPet: Pet = {
      ...petData,
      id: `pet-${Date.now()}`,
      clinicId: currentClinicId,
    };

    setAllPets((prev) => [newPet, ...prev]);

    recordAuditLog({
      action: "PATIENT_CREATED",
      severity: "info",
      targetResource: `Patient: ${newPet.name} (${newPet.species})`,
      resourceId: newPet.id,
      details: `New patient record registered by ${currentUser?.name} under clinic '${activeClinic?.name}'.`,
      metadata: { ownerName: newPet.ownerName, microchip: newPet.microchipNumber },
    });

    return newPet;
  };

  const updatePet = (petId: string, updates: Partial<Pet>) => {
    setAllPets((prev) => prev.map((p) => (p.id === petId ? { ...p, ...updates } : p)));

    recordAuditLog({
      action: "PATIENT_UPDATED",
      severity: "info",
      targetResource: `Patient ID: ${petId}`,
      resourceId: petId,
      details: `Patient record updated by ${currentUser?.name}.`,
    });
  };

  const deletePet = (petId: string) => {
    const target = allPets.find((p) => p.id === petId);
    setAllPets((prev) => prev.filter((p) => p.id !== petId));

    recordAuditLog({
      action: "PATIENT_ARCHIVED",
      severity: "warning",
      targetResource: `Patient: ${target?.name || petId}`,
      resourceId: petId,
      details: `Patient record archived/deleted by ${currentUser?.name}.`,
    });
  };

  // MEDICAL RECORD OPERATIONS
  const addMedicalRecord = (recordData: Omit<MedicalRecord, "id" | "clinicId">): MedicalRecord => {
    const newRec: MedicalRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
      clinicId: currentClinicId,
      isLocked: true,
      signedHash: `sha256:${Math.random().toString(36).substring(2)}${Date.now()}`,
    };

    setAllRecords((prev) => [newRec, ...prev]);

    recordAuditLog({
      action: "RECORD_SOAP_CREATED",
      severity: "info",
      targetResource: `SOAP Chart: ${newRec.petName}`,
      resourceId: newRec.id,
      details: `Clinical examination charted by ${currentUser?.name}. Diagnosis: '${newRec.diagnosis}'.`,
      metadata: { veterinarian: newRec.veterinarianName, diagnosis: newRec.diagnosis },
    });

    return newRec;
  };

  const signPrescription = (recordId: string, prescriptionId: string, dvmLicenseText: string) => {
    setAllRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;
        const updatedPrescriptions = rec.prescriptions.map((rx) =>
          rx.id === prescriptionId
            ? {
                ...rx,
                signedByDvm: `${currentUser?.name} (${dvmLicenseText})`,
                signedAt: new Date().toISOString(),
              }
            : rx
        );
        return { ...rec, prescriptions: updatedPrescriptions };
      })
    );

    recordAuditLog({
      action: "RECORD_PRESCRIPTION_SIGNED",
      severity: "info",
      targetResource: `Prescription #${prescriptionId}`,
      resourceId: recordId,
      details: `Prescription electronically authorized & signed with license credentials by ${currentUser?.name}.`,
    });
  };

  const exportMedicalRecordPdf = (recordId: string) => {
    const rec = allRecords.find((r) => r.id === recordId);
    recordAuditLog({
      action: "RECORD_EXPORTED",
      severity: "info",
      targetResource: `Medical Record Export (${rec?.petName || recordId})`,
      resourceId: recordId,
      details: `Medical record exported / printed for legal medical transfer by ${currentUser?.name}.`,
    });
  };

  // APPOINTMENT OPERATIONS
  const addAppointment = (aptData: Omit<Appointment, "id" | "clinicId">): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      clinicId: currentClinicId,
    };

    setAllAppointments((prev) => [newApt, ...prev]);

    recordAuditLog({
      action: "APPOINTMENT_SCHEDULED",
      severity: "info",
      targetResource: `Appointment: ${newApt.petName} (${newApt.date} at ${newApt.time})`,
      resourceId: newApt.id,
      details: `Appointment booked for ${newApt.reason} with ${newApt.veterinarianName}.`,
    });

    return newApt;
  };

  const updateAppointmentStatus = (aptId: string, newStatus: AppointmentStatus) => {
    setAllAppointments((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status: newStatus } : apt))
    );

    const target = allAppointments.find((a) => a.id === aptId);
    recordAuditLog({
      action: "APPOINTMENT_STATUS_CHANGED",
      severity: "info",
      targetResource: `Appointment #${aptId} (${target?.petName})`,
      resourceId: aptId,
      details: `Appointment status updated to '${newStatus}' by ${currentUser?.name}.`,
    });
  };

  const cancelAppointment = (aptId: string, reason?: string) => {
    setAllAppointments((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status: "Cancelled", notes: reason || apt.notes } : apt))
    );

    const target = allAppointments.find((a) => a.id === aptId);
    recordAuditLog({
      action: "APPOINTMENT_CANCELLED",
      severity: "warning",
      targetResource: `Appointment #${aptId} (${target?.petName})`,
      resourceId: aptId,
      details: `Appointment cancelled by ${currentUser?.name}. Reason: ${reason || "Client request"}.`,
    });
  };

  // REMINDER OPERATIONS
  const addReminder = (remData: Omit<Reminder, "id" | "clinicId">): Reminder => {
    const newRem: Reminder = {
      ...remData,
      id: `rem-${Date.now()}`,
      clinicId: currentClinicId,
    };

    setAllReminders((prev) => [newRem, ...prev]);
    return newRem;
  };

  const sendReminderNow = (remId: string) => {
    setAllReminders((prev) =>
      prev.map((r) =>
        r.id === remId ? { ...r, status: "Sent", lastSentDate: new Date().toISOString().split("T")[0] } : r
      )
    );

    const target = allReminders.find((r) => r.id === remId);
    recordAuditLog({
      action: "REMINDER_DISPATCHED",
      severity: "info",
      targetResource: `Reminder: ${target?.title} (${target?.petName})`,
      resourceId: remId,
      details: `Preventative care reminder dispatched via ${target?.channel} to ${target?.ownerEmail}.`,
    });
  };

  const dismissReminder = (remId: string) => {
    setAllReminders((prev) =>
      prev.map((r) => (r.id === remId ? { ...r, status: "Dismissed" } : r))
    );
  };

  // INVOICE & BILLING OPERATIONS
  const addInvoice = (invData: Omit<Invoice, "id" | "clinicId">): Invoice => {
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      clinicId: currentClinicId,
    };

    setAllInvoices((prev) => [newInv, ...prev]);

    recordAuditLog({
      action: "INVOICE_GENERATED",
      severity: "info",
      targetResource: `Invoice #${newInv.id} ($${newInv.total.toFixed(2)})`,
      resourceId: newInv.id,
      details: `Generated invoice for ${newInv.ownerName} (${newInv.petName}) totaling $${newInv.total.toFixed(2)}.`,
    });

    return newInv;
  };

  const payInvoice = (invId: string, paymentMethod: Invoice["paymentMethod"]) => {
    const now = new Date().toISOString();
    setAllInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invId) return inv;
        return {
          ...inv,
          status: "Paid",
          amountPaid: inv.total,
          paymentMethod: paymentMethod || "Credit Card",
          paidAt: now,
        };
      })
    );

    const target = allInvoices.find((i) => i.id === invId);
    recordAuditLog({
      action: "INVOICE_PAID",
      severity: "info",
      targetResource: `Invoice #${invId}`,
      resourceId: invId,
      details: `Payment of $${target?.total.toFixed(2)} received via ${paymentMethod || "Credit Card"} for patient ${target?.petName}.`,
    });
  };

  // STAFF MANAGEMENT OPERATIONS
  const inviteStaffMember = (staffData: { name: string; email: string; role: UserRole; title: string }) => {
    const newStaff: User = {
      id: `user-${Date.now()}`,
      name: staffData.name,
      email: staffData.email,
      role: staffData.role,
      clinicId: currentClinicId,
      title: staffData.title,
      isTwoFactorEnabled: false,
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    setAllStaff((prev) => [...prev, newStaff]);

    recordAuditLog({
      action: "STAFF_INVITED",
      severity: "info",
      targetResource: `Staff Member: ${newStaff.name} (${newStaff.role})`,
      resourceId: newStaff.id,
      details: `Invited new team member ${newStaff.name} with role '${newStaff.role}' by ${currentUser?.name}.`,
    });
  };

  const updateStaffRole = (staffId: string, newRole: UserRole) => {
    setAllStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, role: newRole } : s))
    );

    const target = allStaff.find((s) => s.id === staffId);
    recordAuditLog({
      action: "RBAC_ROLE_MODIFIED",
      severity: "warning",
      targetResource: `Staff Member: ${target?.name}`,
      resourceId: staffId,
      details: `Role updated from '${target?.role}' to '${newRole}' by ${currentUser?.name}. Security permissions modified.`,
    });
  };

  const toggleStaffStatus = (staffId: string) => {
    setAllStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        const newStatus = s.status === "Active" ? "Suspended" : "Active";
        return { ...s, status: newStatus };
      })
    );

    const target = allStaff.find((s) => s.id === staffId);
    recordAuditLog({
      action: "STAFF_DEACTIVATED",
      severity: "critical",
      targetResource: `Staff Member: ${target?.name}`,
      resourceId: staffId,
      details: `Staff member account ${target?.status === "Active" ? "suspended" : "reactivated"} by ${currentUser?.name}.`,
    });
  };

  return (
    <DataContext.Provider
      value={{
        pets,
        petOwners,
        medicalRecords,
        appointments,
        reminders,
        invoices,
        staffMembers,
        allPetsCount: allPets.length,
        allClinicsCount: clinics.length,
        addPet,
        updatePet,
        deletePet,
        addMedicalRecord,
        signPrescription,
        exportMedicalRecordPdf,
        addAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        addReminder,
        sendReminderNow,
        dismissReminder,
        addInvoice,
        payInvoice,
        inviteStaffMember,
        updateStaffRole,
        toggleStaffStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
