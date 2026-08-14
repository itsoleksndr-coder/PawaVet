import React, { useState, useMemo, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { Search, X, Dog, User, Calendar, FileText, ArrowRight, Sparkles } from "lucide-react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPet: (petId: string) => void;
  onSelectRecord: (recordId: string) => void;
  onSelectAppointment: (appointmentId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPet,
  onSelectRecord,
  onSelectAppointment,
}) => {
  const [query, setQuery] = useState("");
  const { pets, petOwners, medicalRecords, appointments } = useData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return { pets: pets.slice(0, 3), records: medicalRecords.slice(0, 2), appointments: appointments.slice(0, 2) };
    }
    const q = query.toLowerCase().trim();

    const matchedPets = pets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        (p.microchipNumber && p.microchipNumber.includes(q))
    );

    const matchedRecords = medicalRecords.filter(
      (r) =>
        r.petName.toLowerCase().includes(q) ||
        r.diagnosis.toLowerCase().includes(q) ||
        r.chiefComplaint.toLowerCase().includes(q) ||
        r.veterinarianName.toLowerCase().includes(q)
    );

    const matchedAppointments = appointments.filter(
      (a) =>
        a.petName.toLowerCase().includes(q) ||
        a.ownerName.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
    );

    return { pets: matchedPets, records: matchedRecords, appointments: matchedAppointments };
  }, [query, pets, medicalRecords, appointments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient name, owner, microchip #, diagnosis, or reason..."
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-0"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-200 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Pets Section */}
          {results.pets.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <span>Patients & Pets ({results.pets.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => {
                      onSelectPet(pet.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/90 border border-transparent hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {pet.photoUrl ? (
                        <img
                          src={pet.photoUrl}
                          alt={pet.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-emerald-300 flex-shrink-0">
                          <Dog className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 truncate">
                            {pet.name}
                          </span>
                          <span className="text-xs text-slate-400 truncate">
                            ({pet.breed} • {pet.age})
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span>Owner: {pet.ownerName}</span>
                          {pet.microchipNumber && (
                            <span className="text-slate-500 font-mono text-[11px]">
                              Chip: #{pet.microchipNumber.slice(-6)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Medical Records Section */}
          {results.records.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <span>Medical Records ({results.records.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.records.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => {
                      onSelectRecord(rec.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/90 border border-transparent hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-teal-900/50 border border-teal-700/50 flex items-center justify-center text-teal-300 flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-slate-100 group-hover:text-teal-300 truncate">
                            {rec.petName}: {rec.diagnosis}
                          </span>
                          <span className="text-xs text-slate-400">{rec.date}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          Complaint: {rec.chiefComplaint}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-all flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Section */}
          {results.appointments.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <span>Appointments ({results.appointments.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.appointments.map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => {
                      onSelectAppointment(apt.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/90 border border-transparent hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-900/50 border border-blue-700/50 flex items-center justify-center text-blue-300 flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-slate-100 group-hover:text-blue-300 truncate">
                            {apt.petName} ({apt.type})
                          </span>
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                            {apt.date} at {apt.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          Owner: {apt.ownerName} • Status: {apt.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-all flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.pets.length === 0 && results.records.length === 0 && results.appointments.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">No matching records found for "{query}".</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for pet names like Max, Luna, Bella, or Rocky.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Tip: Press ESC to close</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PawFect Fast Search Index</span>
          </span>
        </div>
      </div>
    </div>
  );
};
