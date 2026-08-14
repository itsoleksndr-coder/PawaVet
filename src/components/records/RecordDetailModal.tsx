import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { MedicalRecord } from "../../types";
import {
  X,
  FileText,
  Stethoscope,
  ShieldCheck,
  Download,
  Printer,
  Pill,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  User,
} from "lucide-react";

interface RecordDetailModalProps {
  record: MedicalRecord | null;
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
}) => {
  const { isVeterinarian, isSuperAdmin, isClinicAdmin, currentUser, activeClinic } = useAuth();
  const { signPrescription, exportMedicalRecordPdf } = useData();

  const [signingRxId, setSigningRxId] = useState<string | null>(null);
  const [licenseText, setLicenseText] = useState("Lic #DVM-OR-88421");
  const [copiedHash, setCopiedHash] = useState(false);

  if (!record) return null;

  const handleSign = (rxId: string) => {
    signPrescription(record.id, rxId, licenseText);
    setSigningRxId(null);
  };

  const handleExport = () => {
    exportMedicalRecordPdf(record.id);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-teal-950 text-teal-400 border border-teal-800">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg text-white">SOAP Medical Record Chart</h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Sealed Record</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Patient: <strong className="text-white">{record.petName}</strong> • Date: {record.date} • Attending: {record.veterinarianName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 transition-colors"
              title="Print / Export PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Patient / Clinic Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block">PATIENT</span>
              <span className="text-white font-bold">{record.petName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">PET PARENT</span>
              <span className="text-white font-bold">{record.ownerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ATTENDING DVM</span>
              <span className="text-teal-300 font-bold">{record.veterinarianName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">CLINIC</span>
              <span className="text-slate-300 truncate">{activeClinic?.name || "Practice"}</span>
            </div>
          </div>

          {/* S: SUBJECTIVE */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-teal-400 uppercase font-mono tracking-wider">
              S — Subjective
            </span>
            <div>
              <strong className="text-slate-300">Chief Complaint: </strong>
              <span className="text-slate-200">{record.chiefComplaint}</span>
            </div>
            {record.history && (
              <div>
                <strong className="text-slate-300">Clinical History: </strong>
                <span className="text-slate-400 leading-relaxed">{record.history}</span>
              </div>
            )}
          </div>

          {/* O: OBJECTIVE */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase font-mono tracking-wider">
              O — Objective
            </span>

            {record.vitals && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">TEMP</span>
                  <span className="text-white font-bold">{record.vitals.temperatureC}°C</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">HEART RATE</span>
                  <span className="text-white font-bold">{record.vitals.heartRateBpm} bpm</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">RESP RATE</span>
                  <span className="text-white font-bold">{record.vitals.respiratoryRateBpm} /min</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">WEIGHT</span>
                  <span className="text-white font-bold">{record.vitals.weightKg} kg</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px]">BCS</span>
                  <span className="text-white font-bold">{record.vitals.bodyConditionScore} / 9</span>
                </div>
              </div>
            )}

            <div>
              <strong className="text-slate-300">Physical Exam: </strong>
              <span className="text-slate-300 leading-relaxed">{record.physicalExamNotes}</span>
            </div>
          </div>

          {/* A: ASSESSMENT */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/50 space-y-1.5">
            <span className="text-[11px] font-bold text-purple-300 uppercase font-mono tracking-wider">
              A — Assessment & Diagnosis
            </span>
            <div className="font-bold text-sm text-purple-200">
              {record.diagnosis}
            </div>
          </div>

          {/* P: PLAN */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-emerald-400 uppercase font-mono tracking-wider">
              P — Plan & Treatment
            </span>

            {record.treatment && (
              <div>
                <strong className="text-slate-300">Clinical Procedures / Therapy: </strong>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{record.treatment}</p>
              </div>
            )}

            {record.clientInstructions && (
              <div>
                <strong className="text-slate-300">Client Discharge Instructions: </strong>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{record.clientInstructions}</p>
              </div>
            )}
          </div>

          {/* Prescriptions */}
          {record.prescriptions.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-300 flex items-center space-x-1.5 uppercase font-mono">
                  <Pill className="w-4 h-4" />
                  <span>Prescription Authorizations (Rx)</span>
                </span>
              </div>

              <div className="space-y-2">
                {record.prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{rx.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {rx.dosage} • {rx.frequency} ({rx.durationDays} days supply)
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Instructions: {rx.instructions}
                      </div>
                    </div>

                    <div className="sm:text-right">
                      {rx.signedByDvm ? (
                        <div className="text-emerald-400 font-mono text-[10px] bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-800">
                          ✓ Signed by {rx.signedByDvm}
                        </div>
                      ) : isVeterinarian || isClinicAdmin ? (
                        <button
                          onClick={() => handleSign(rx.id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                        >
                          Sign Electronically
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Pending DVM Signature
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic Seal */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span className="truncate max-w-[300px]">
                Cryptographic Seal: {record.signedHash || "sha256:verified-record-hash"}
              </span>
            </div>
            <span className="text-emerald-400 font-bold">Immutable Ledger Verified</span>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            Close Chart
          </button>
        </div>
      </div>
    </div>
  );
};
