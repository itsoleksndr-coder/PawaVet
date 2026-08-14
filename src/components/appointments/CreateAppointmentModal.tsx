import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { Appointment } from "../../types";
import { X, Calendar, Clock, PawPrint, Stethoscope } from "lucide-react";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isPetOwner, currentUser } = useAuth();
  const { pets, staffMembers, addAppointment } = useData();

  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || "");
  const [date, setDate] = useState("2026-08-14");
  const [time, setTime] = useState("11:30 AM");
  const [type, setType] = useState<Appointment["type"]>("Wellness Exam");
  const [reason, setReason] = useState("");
  const [veterinarianId, setVeterinarianId] = useState(
    staffMembers.find((s) => s.role === "VETERINARIAN")?.id || "user-vet-emily"
  );
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0];
    if (!selectedPet) return;

    const selectedVet = staffMembers.find((s) => s.id === veterinarianId);

    addAppointment({
      petId: selectedPet.id,
      petName: selectedPet.name,
      species: selectedPet.species,
      ownerId: selectedPet.ownerId,
      ownerName: selectedPet.ownerName,
      ownerPhone: "(503) 555-0144",
      veterinarianId: selectedVet?.id || "user-vet-emily",
      veterinarianName: selectedVet?.name || "Dr. Emily Vance, DVM",
      date,
      time,
      durationMinutes: 30,
      type,
      reason: reason || type,
      status: "Scheduled",
      notes,
    });

    onClose();
  };

  const vets = staffMembers.filter((s) => s.role === "VETERINARIAN" || s.role === "CLINIC_ADMIN");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isPetOwner ? "Request Appointment" : "Schedule Patient Visit"}
              </h3>
              <p className="text-xs text-slate-400">Veterinary consultation & exam booking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Select Patient *</label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-semibold"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species} - {p.breed}) • Parent: {p.ownerName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Preferred Time *</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="01:30 PM">01:30 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Appointment Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Appointment["type"])}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="Wellness Exam">Comprehensive Wellness Exam</option>
              <option value="Vaccination">Vaccination / Booster Series</option>
              <option value="Follow-up">Post-op / Clinical Follow-up</option>
              <option value="Surgery">Surgical Procedure / Dental</option>
              <option value="Urgent Care">Urgent Care / Acute Sickness</option>
              <option value="Telehealth">Telehealth Video Consult</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Attending Veterinarian</label>
            <select
              value={veterinarianId}
              onChange={(e) => setVeterinarianId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.title || "DVM"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Reason for Visit *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual vaccination checkup and nail trim"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Clinical / Reception Notes</label>
            <textarea
              rows={2}
              placeholder="Special handling instructions, anxious pet, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
