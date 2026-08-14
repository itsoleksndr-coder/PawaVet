import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { Prescription, Vitals } from "../../types";
import {
  X,
  FileText,
  Stethoscope,
  Plus,
  Trash2,
  ShieldCheck,
  Lock,
  Pill,
} from "lucide-react";

interface CreateMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateMedicalRecordModal: React.FC<CreateMedicalRecordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, canSignPrescriptions } = useAuth();
  const { pets, addMedicalRecord } = useData();

  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || "");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [history, setHistory] = useState("");
  const [physicalExam, setPhysicalExam] = useState("BAR (Bright, Alert, Responsive). Heart/lungs auscult normal.");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [clientInstructions, setClientInstructions] = useState("");

  // Vitals
  const [tempC, setTempC] = useState(38.5);
  const [heartRate, setHeartRate] = useState(90);
  const [respRate, setRespRate] = useState(24);
  const [weightKg, setWeightKg] = useState(15.0);
  const [bcs, setBcs] = useState(5);

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<Array<Omit<Prescription, "id">>>([]);
  const [rxName, setRxName] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxFreq, setRxFreq] = useState("Every 12 hours with food");
  const [rxDuration, setRxDuration] = useState(10);
  const [rxInstructions, setRxInstructions] = useState("Give with small meal.");

  if (!isOpen) return null;

  const handleAddRx = () => {
    if (!rxName) return;
    setPrescriptions((prev) => [
      ...prev,
      {
        name: rxName,
        dosage: rxDosage || "Standard dose",
        frequency: rxFreq,
        durationDays: rxDuration,
        refillsRemaining: 0,
        instructions: rxInstructions,
        signedByDvm: canSignPrescriptions ? `${currentUser?.name} (DVM-OR-${Math.floor(10000 + Math.random() * 90000)})` : undefined,
        signedAt: canSignPrescriptions ? new Date().toISOString() : undefined,
      },
    ]);
    setRxName("");
    setRxDosage("");
  };

  const handleRemoveRx = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0];
    if (!selectedPet) return;

    const formattedVitals: Vitals = {
      temperatureC: Number(tempC),
      heartRateBpm: Number(heartRate),
      respiratoryRateBpm: Number(respRate),
      weightKg: Number(weightKg),
      bodyConditionScore: Number(bcs),
    };

    addMedicalRecord({
      petId: selectedPet.id,
      petName: selectedPet.name,
      ownerId: selectedPet.ownerId,
      ownerName: selectedPet.ownerName,
      veterinarianId: currentUser?.id || "user-vet-emily",
      veterinarianName: currentUser?.name || "Dr. Emily Vance, DVM",
      date: new Date().toISOString().split("T")[0],
      chiefComplaint,
      history,
      physicalExamNotes: physicalExam,
      vitals: formattedVitals,
      diagnosis,
      treatment,
      clientInstructions,
      prescriptions: prescriptions.map((p, idx) => ({ ...p, id: `rx-${Date.now()}-${idx}` })),
      vaccines: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">New SOAP Medical Charting</h3>
              <p className="text-xs text-slate-400">Standardized Subjective, Objective, Assessment, Plan documentation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Patient Selector */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Select Patient *</label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500 font-semibold"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species.toUpperCase()} - {p.breed}) • Parent: {p.ownerName}
                </option>
              ))}
            </select>
          </div>

          {/* S: SUBJECTIVE */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-teal-400 text-xs tracking-wider flex items-center space-x-1.5 uppercase font-mono">
              <span>S — Subjective (History & Presentation)</span>
            </h4>

            <div>
              <label className="block text-slate-400 mb-1">Chief Complaint *</label>
              <input
                type="text"
                required
                placeholder="e.g. Acute left forelimb lameness after park run"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">History & Clinical Progression</label>
              <textarea
                rows={2}
                placeholder="Owner notes, onset timing, prior therapies..."
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* O: OBJECTIVE & VITALS */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-blue-400 text-xs tracking-wider flex items-center space-x-1.5 uppercase font-mono">
              <span>O — Objective (Vitals & Physical Exam)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tempC}
                  onChange={(e) => setTempC(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Heart Rate</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Resp Rate</label>
                <input
                  type="number"
                  value={respRate}
                  onChange={(e) => setRespRate(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">BCS (1-9)</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={bcs}
                  onChange={(e) => setBcs(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Physical Examination Findings</label>
              <textarea
                rows={2}
                value={physicalExam}
                onChange={(e) => setPhysicalExam(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* A: ASSESSMENT */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-purple-400 text-xs tracking-wider flex items-center space-x-1.5 uppercase font-mono">
              <span>A — Assessment (Diagnosis & Differentials)</span>
            </h4>

            <div>
              <label className="block text-slate-400 mb-1">Clinical Diagnosis *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grade II Cruciate Ligament Sprain (Left Stifle)"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* P: PLAN & PRESCRIPTIONS */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-emerald-400 text-xs tracking-wider flex items-center space-x-1.5 uppercase font-mono">
              <span>P — Plan (Treatment & Prescriptions)</span>
            </h4>

            <div>
              <label className="block text-slate-400 mb-1">In-Clinic Treatment & Diagnostic Plan</label>
              <textarea
                rows={2}
                placeholder="e.g. Digital radiography performed, cold laser therapy applied..."
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Client Home Care Instructions</label>
              <textarea
                rows={2}
                placeholder="e.g. Strict leash walks for 14 days. Apply ice pack 2x daily..."
                value={clientInstructions}
                onChange={(e) => setClientInstructions(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Prescriptions Sub-section */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-300 flex items-center space-x-1">
                  <Pill className="w-3.5 h-3.5 text-purple-400" />
                  <span>Authorized Prescriptions (Rx)</span>
                </span>
                {!canSignPrescriptions && (
                  <span className="text-[10px] text-amber-400 font-mono flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>DVM Signature Required</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Medication Name (e.g. Carprofen)"
                  value={rxName}
                  onChange={(e) => setRxName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 75mg Chewable)"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
                <button
                  type="button"
                  onClick={handleAddRx}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prescription</span>
                </button>
              </div>

              {prescriptions.map((rx, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{rx.name}</span> • {rx.dosage} ({rx.frequency})
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRx(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/30 flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Finalize & Cryptographically Seal SOAP Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
