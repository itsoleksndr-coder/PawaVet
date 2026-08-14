import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { Pet, MedicalRecord } from "../../types";
import {
  X,
  PawPrint,
  FileText,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  Heart,
  Plus,
  ChevronRight,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface PetDetailModalProps {
  pet: Pet | null;
  onClose: () => void;
  onOpenCreateRecord?: () => void;
  onSelectRecord?: (record: MedicalRecord) => void;
}

export const PetDetailModal: React.FC<PetDetailModalProps> = ({
  pet,
  onClose,
  onOpenCreateRecord,
  onSelectRecord,
}) => {
  const { isPetOwner, canCreateSoapRecord, currentUser } = useAuth();
  const { medicalRecords, appointments, reminders } = useData();

  const [activeTab, setActiveTab] = useState<"records" | "vitals" | "vaccines" | "reminders">("records");

  if (!pet) return null;

  const petRecords = medicalRecords.filter((r) => r.petId === pet.id);
  const petApts = appointments.filter((a) => a.petId === pet.id);
  const petReminders = reminders.filter((rem) => rem.petId === pet.id);

  // Extract all vaccines administered across medical records
  const allVaccines = petRecords.flatMap((r) => r.vaccines || []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Banner */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <img
              src={pet.photoUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80"}
              alt={pet.name}
              className="w-20 h-20 rounded-3xl object-cover border-2 border-teal-500/50 shadow-xl"
            />

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white">{pet.name}</h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  {pet.species.toUpperCase()}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    pet.vaccinationStatus === "Up to date"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                      : "bg-amber-950 text-amber-300 border-amber-800"
                  }`}
                >
                  {pet.vaccinationStatus}
                </span>
              </div>

              <div className="text-xs text-slate-400">
                {pet.breed} • {pet.age} ({pet.sex}) • Weight: <strong className="text-slate-200">{pet.weightKg} kg</strong>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Microchip: {pet.microchipNumber} • Parent: <span className="text-slate-300">{pet.ownerName}</span>
              </div>
            </div>
          </div>

          {pet.allergies.length > 0 && (
            <div className="mt-4 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Medical Alert: Patient is allergic to {pet.allergies.join(", ")}.</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 space-x-2">
          <button
            onClick={() => setActiveTab("records")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "records"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>SOAP Charts ({petRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("vaccines")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "vaccines"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vaccine Passport ({allVaccines.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reminders")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "reminders"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Preventative Reminders ({petReminders.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: SOAP Medical Records */}
          {activeTab === "records" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Electronic Veterinary Health Record (EVHR)
                </span>
                {canCreateSoapRecord && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateRecord?.();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Chart New SOAP</span>
                  </button>
                )}
              </div>

              {petRecords.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecord?.(rec)}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-teal-400">{rec.date}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs font-bold text-white">{rec.veterinarianName}</span>
                    </div>
                    {rec.signedHash && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Signed & Sealed</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs">
                    <span className="text-slate-400 font-semibold">Chief Complaint: </span>
                    <span className="text-slate-200">{rec.chiefComplaint}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="text-teal-400 font-bold mb-0.5">Assessment / Diagnosis:</div>
                    <div className="text-slate-300">{rec.diagnosis}</div>
                  </div>

                  {rec.prescriptions.length > 0 && (
                    <div className="flex items-center space-x-2 text-[11px] text-purple-300">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{rec.prescriptions.length} Prescriptions Authorized (Rx)</span>
                    </div>
                  )}
                </div>
              ))}

              {petRecords.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-8">
                  No SOAP consultation records on file yet for this patient.
                </p>
              )}
            </div>
          )}

          {/* TAB 2: Vaccine Passport */}
          {activeTab === "vaccines" && (
            <div className="space-y-3">
              {allVaccines.map((vac) => (
                <div
                  key={vac.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">{vac.name}</h4>
                    <p className="text-xs text-slate-400">
                      Administered on <strong className="text-slate-200">{vac.administeredDate}</strong> by {vac.administeredBy}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Batch #{vac.batchNumber} • Valid until: <span className="text-teal-400">{vac.expirationDate}</span>
                    </p>
                  </div>
                  <span className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                    Official Stamp
                  </span>
                </div>
              ))}

              {allVaccines.length === 0 && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500 py-8">
                  No vaccination administrations recorded in this patient's current chart.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Reminders */}
          {activeTab === "reminders" && (
            <div className="space-y-3">
              {petReminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white">{rem.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Due Date: <strong className="text-amber-400">{rem.dueDate}</strong> ({rem.type})
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Channel: {rem.channel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
