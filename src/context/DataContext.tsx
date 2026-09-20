import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  Pet,
  PetOwner,
  MedicalRecord,
  Appointment,
  Reminder,
  Invoice,
  User,
  UserRole,
  AppointmentStatus,
} from "../types";
import { type ClinicSnapshot, emptyData } from "../clinic-model";
import { request } from "../api-client";
import { useAuth } from "./AuthContext";
interface DataContextType {
  snapshot: ClinicSnapshot;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  mutate: <T>(path: string, method: string, body?: unknown) => Promise<T>;
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
  addPet: (petData: Omit<Pet, "id" | "clinicId">) => Promise<Pet>;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  deletePet: (petId: string) => void;

  // Medical Records (SOAP) CRUD
  addMedicalRecord: (
    recordData: Omit<MedicalRecord, "id" | "clinicId">,
  ) => Promise<MedicalRecord>;
  signPrescription: (
    recordId: string,
    prescriptionId: string,
    dvmLicenseText: string,
  ) => void;
  exportMedicalRecordPdf: (recordId: string) => void;

  // Appointments CRUD & Queue
  addAppointment: (
    aptData: Omit<Appointment, "id" | "clinicId">,
  ) => Promise<Appointment>;
  updateAppointmentStatus: (
    aptId: string,
    newStatus: AppointmentStatus,
  ) => void;
  cancelAppointment: (aptId: string, reason?: string) => void;

  // Reminders
  addReminder: (
    remData: Omit<Reminder, "id" | "clinicId">,
  ) => Promise<Reminder>;
  sendReminderNow: (remId: string) => void;
  dismissReminder: (remId: string) => void;

  // Billing & Invoices
  addInvoice: (invData: Omit<Invoice, "id" | "clinicId">) => Promise<Invoice>;
  payInvoice: (invId: string, paymentMethod: Invoice["paymentMethod"]) => void;

  // Staff Management
  inviteStaffMember: (staffData: {
    name: string;
    email: string;
    role: UserRole;
    title: string;
  }) => void;
  updateStaffRole: (staffId: string, newRole: UserRole) => void;
  toggleStaffStatus: (staffId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [snapshot, setSnapshot] = useState<ClinicSnapshot>({
    ...emptyData(),
    staffMembers: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!currentUser) return;
    const next = await request<ClinicSnapshot>("/api/clinic");
    setSnapshot(next);
    setError("");
  }, [currentUser?.id]);
  useEffect(() => {
    let active = true;
    setSnapshot({ ...emptyData(), staffMembers: [] });
    if (!currentUser) return;
    setLoading(true);
    request<ClinicSnapshot>("/api/clinic")
      .then((data) => {
        if (active) {
          setSnapshot(data);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentUser?.id]);
  const mutate = async <T,>(
    path: string,
    method: string,
    body?: unknown,
  ): Promise<T> => {
    try {
      const value = await request<T>(path, method, body);
      await refresh();
      return value;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      throw e;
    }
  };
  const background = (task: Promise<unknown>) => {
    void task.catch(() => {});
  };
  const unavailable = () =>
    setError(
      "This service is not configured. No transaction or message delivery was performed.",
    );
  return (
    <DataContext.Provider
      value={{
        ...snapshot,
        snapshot,
        pets: snapshot.pets.filter((p) => !p.isArchived),
        loading,
        error,
        refresh,
        mutate,
        allPetsCount: snapshot.pets.length,
        allClinicsCount: currentUser ? 1 : 0,
        addPet: (data) => mutate<Pet>("/api/pets", "POST", data),
        updatePet: (id, data) =>
          background(mutate("/api/pets/" + id, "PATCH", data)),
        deletePet: (id) => background(mutate("/api/pets/" + id, "DELETE", {})),
        addMedicalRecord: (data) =>
          mutate<MedicalRecord>("/api/records", "POST", data),
        signPrescription: unavailable,
        exportMedicalRecordPdf: () => window.print(),
        addAppointment: (data) =>
          mutate<Appointment>("/api/appointments", "POST", data),
        updateAppointmentStatus: (id, status) =>
          background(mutate("/api/appointments/" + id, "PATCH", { status })),
        cancelAppointment: (id) =>
          background(
            mutate("/api/appointments/" + id, "PATCH", { status: "Cancelled" }),
          ),
        addReminder: async () => {
          throw new Error("Reminder delivery is not configured.");
        },
        sendReminderNow: unavailable,
        dismissReminder: unavailable,
        addInvoice: async () => {
          throw new Error("Billing is not configured.");
        },
        payInvoice: unavailable,
        inviteStaffMember: unavailable,
        updateStaffRole: unavailable,
        toggleStaffStatus: unavailable,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("DataProvider missing");
  return context;
};
