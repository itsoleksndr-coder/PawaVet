import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { MedicalRecord } from "../../types";
import {
  FileText,
  Search,
  Plus,
  ShieldCheck,
  Stethoscope,
  Clock,
  ChevronRight,
  Pill,
  Lock,
} from "lucide-react";

interface MedicalRecordsListProps {
  onSelectRecord: (record: MedicalRecord) => void;
  onOpenCreate: () => void;
}

export const MedicalRecordsList: React.FC<MedicalRecordsListProps> = ({
  onSelectRecord,
  onOpenCreate,
}) => {
  const { isPetOwner, canCreateSoapRecord, activeClinic } = useAuth();
  const { medicalRecords } = useData();

  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    return medicalRecords.filter((rec) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          rec.petName.toLowerCase().includes(q) ||
          rec.veterinarianName.toLowerCase().includes(q) ||
          rec.diagnosis.toLowerCase().includes(q) ||
          rec.chiefComplaint.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [medicalRecords, search]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/60 font-mono uppercase">
              Clinical Records & SOAP
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredRecords.length} {filteredRecords.length === 1 ? "Record" : "Records"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">SOAP Medical Charts & Prescriptions</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isPetOwner
              ? "Official veterinarian examination notes, diagnoses, and authorized prescriptions for your pets."
              : `Cryptographically sealed medical consultations isolated to ${activeClinic?.name}.`}
          </p>
        </div>

        {canCreateSoapRecord && (
          <button
            onClick={onOpenCreate}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Clinical SOAP Note</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, veterinarian, diagnosis, or clinical notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.map((rec) => (
          <div
            key={rec.id}
            onClick={() => onSelectRecord(rec)}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-sm"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800 text-teal-400 mt-0.5">
                <Stethoscope className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-base text-white group-hover:text-teal-300 transition-colors">
                    {rec.petName}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">•</span>
                  <span className="text-xs font-mono text-slate-300 font-semibold">{rec.date}</span>
                  <span className="text-xs text-slate-500 font-mono">•</span>
                  <span className="text-xs text-teal-400 font-medium">{rec.veterinarianName}</span>
                </div>

                <div className="text-xs text-slate-300">
                  <strong className="text-slate-400 font-semibold">Diagnosis: </strong>
                  <span>{rec.diagnosis}</span>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1">
                  <strong className="text-slate-500 font-semibold">Chief Complaint: </strong>
                  <span>{rec.chiefComplaint}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {rec.signedHash && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/80 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>SHA-256 Verified</span>
                    </span>
                  )}
                  {rec.prescriptions.length > 0 && (
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800/80 flex items-center space-x-1">
                      <Pill className="w-3 h-3" />
                      <span>{rec.prescriptions.length} Rx Prescriptions</span>
                    </span>
                  )}
                  {rec.vitals && (
                    <span className="text-[10px] font-mono text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800/80">
                      T: {rec.vitals.temperatureC}°C • HR: {rec.vitals.heartRateBpm} bpm
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:self-center">
              <span className="text-xs font-bold text-teal-400 group-hover:underline">
                View Full Chart
              </span>
              <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
            <FileText className="w-12 h-12 mx-auto text-slate-700 mb-2" />
            <p className="text-sm font-semibold">No medical records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
