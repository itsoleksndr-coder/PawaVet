import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
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
import { useAuth } from "./AuthContext";
import { api } from "../lib/api";
interface DataContextType {
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addOwner: (
    input: Pick<
      PetOwner,
      "name" | "email" | "phone" | "address" | "emergencyContact"
    >,
  ) => Promise<PetOwner>;
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
  updatePet: (petId: string, updates: Partial<Pet>) => Promise<Pet>;
  deletePet: (petId: string) => void;

  // Medical Records (SOAP) CRUD
  addMedicalRecord: (
    recordData: Omit<MedicalRecord, "id" | "clinicId">,
  ) => MedicalRecord;
  signPrescription: (
    recordId: string,
    prescriptionId: string,
    dvmLicenseText: string,
  ) => void;
  exportMedicalRecordPdf: (recordId: string) => void;

  // Appointments CRUD & Queue
  addAppointment: (
    aptData: Omit<Appointment, "id" | "clinicId">,
  ) => Appointment;
  updateAppointmentStatus: (
    aptId: string,
    newStatus: AppointmentStatus,
  ) => void;
  cancelAppointment: (aptId: string, reason?: string) => void;

  // Reminders
  addReminder: (remData: Omit<Reminder, "id" | "clinicId">) => Reminder;
  sendReminderNow: (remId: string) => void;
  dismissReminder: (remId: string) => void;

  // Billing & Invoices
  addInvoice: (invData: Omit<Invoice, "id" | "clinicId">) => Invoice;
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
  const { currentUser, isLocked, hasPermission, refreshAuth } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]),
    [petOwners, setOwners] = useState<PetOwner[]>([]),
    [staffMembers, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!currentUser || isLocked) {
      setPets([]);
      setOwners([]);
      setStaff([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [p, o, s] = await Promise.all([
        api<Pet[]>("/pets"),
        api<PetOwner[]>("/owners"),
        hasPermission("staff:read")
          ? api<User[]>("/staff")
          : Promise.resolve([]),
      ]);
      setPets(p);
      setOwners(o);
      setStaff(s);
    } catch (e) {
      setPets([]);
      setOwners([]);
      setStaff([]);
      setError(
        e instanceof Error ? e.message : "Unable to load clinic records.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.clinicId, isLocked]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const addPet = async (data: Omit<Pet, "id" | "clinicId">) => {
    const pet = await api<Pet>("/pets", "POST", data);
    setPets((prev) => [...prev, pet]);
    void refreshAuth();
    return pet;
  };
  const updatePet = async (id: string, updates: Partial<Pet>) => {
    const pet = await api<Pet>(
      `/pets/${encodeURIComponent(id)}`,
      "PATCH",
      updates,
    );
    setPets((prev) => prev.map((p) => (p.id === id ? pet : p)));
    void refreshAuth();
    return pet;
  };
  const addOwner = async (
    data: Pick<
      PetOwner,
      "name" | "email" | "phone" | "address" | "emergencyContact"
    >,
  ) => {
    const owner = await api<PetOwner>("/owners", "POST", data);
    setOwners((prev) => [...prev, owner]);
    return owner;
  };
  const unavailable = (): never => {
    throw new Error("This workflow is not activated. No changes were saved.");
  };
  const updateStaffRole = async (id: string, role: UserRole) => {
    try {
      await api(`/staff/${encodeURIComponent(id)}`, "PATCH", { role });
      await refresh();
      void refreshAuth();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update role.");
    }
  };
  const toggleStaffStatus = async (id: string) => {
    const user = staffMembers.find((s) => s.id === id);
    if (!user) return;
    try {
      await api(`/staff/${encodeURIComponent(id)}`, "PATCH", {
        status: user.status === "Active" ? "Suspended" : "Active",
      });
      await refresh();
      void refreshAuth();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update access.");
    }
  };
  return (
    <DataContext.Provider
      value={{
        loading,
        error,
        refresh,
        addOwner,
        pets,
        petOwners,
        staffMembers,
        medicalRecords: [],
        appointments: [],
        reminders: [],
        invoices: [],
        allPetsCount: pets.length,
        allClinicsCount: currentUser ? 1 : 0,
        addPet,
        updatePet,
        deletePet: unavailable,
        addMedicalRecord: unavailable,
        signPrescription: unavailable,
        exportMedicalRecordPdf: unavailable,
        addAppointment: unavailable,
        updateAppointmentStatus: unavailable,
        cancelAppointment: unavailable,
        addReminder: unavailable,
        sendReminderNow: unavailable,
        dismissReminder: unavailable,
        addInvoice: unavailable,
        payInvoice: unavailable,
        inviteStaffMember: unavailable,
        updateStaffRole,
        toggleStaffStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
export const useData = () => {
  const c = useContext(DataContext);
  if (!c) throw new Error("DataProvider required");
  return c;
};
