import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { Pet, MedicalRecord } from "../../types";
import {
  PawPrint,
  Heart,
  Calendar,
  ShieldCheck,
  CreditCard,
  Phone,
  FileText,
  Clock,
  Download,
  Plus,
  ChevronRight,
  Pill,
  Sparkles,
} from "lucide-react";

interface PetOwnerPortalProps {
  onOpenCreateApt: () => void;
  onOpenAddPet: () => void;
  onSelectPet: (pet: Pet) => void;
}

export const PetOwnerPortal: React.FC<PetOwnerPortalProps> = ({
  onOpenCreateApt,
  onOpenAddPet,
  onSelectPet,
}) => {
  const { currentUser, activeClinic } = useAuth();
  const { pets, medicalRecords, appointments, invoices, reminders, payInvoice } = useData();

  const [payingInvId, setPayingInvId] = useState<string | null>(null);

  const pendingInvoices = invoices.filter((i) => i.status === "Pending");
  const upcomingApts = appointments.filter((a) => a.status === "Scheduled" || a.status === "Checked-in");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold font-mono uppercase bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800/60 w-fit mb-2">
              <Heart className="w-3.5 h-3.5" />
              <span>Pet Parent Health Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Hello, {currentUser?.name || "Pet Parent"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Welcome to your dedicated pet care portal for{" "}
              <strong className="text-slate-200">{activeClinic?.name || "Oakwood Veterinary Center"}</strong>.
              All data is strictly private and isolated to your household.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onOpenCreateApt}
              className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Appointment</span>
            </button>
            <button
              onClick={onOpenAddPet}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Add Pet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pet Profiles Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PawPrint className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm text-white">My Registered Pets ({pets.length})</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pets.map((pet) => {
            const petRecs = medicalRecords.filter((r) => r.petId === pet.id);
            return (
              <div
                key={pet.id}
                onClick={() => onSelectPet(pet)}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/60 hover:bg-slate-900/90 transition-all cursor-pointer space-y-4 group shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={pet.photoUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=80"}
                    alt={pet.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 group-hover:scale-105 transition-transform"
                  />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-lg text-white group-hover:text-teal-300 transition-colors">
                        {pet.name}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {pet.vaccinationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {pet.breed} • {pet.age} ({pet.sex})
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Microchip #{pet.microchipNumber} • {pet.weightKg} kg
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">Vaccine Passport Ready</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-400 group-hover:underline">
                    View Chart →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Upcoming Visits & Invoices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-sm text-white">Upcoming Visits</h3>
            </div>
            <button
              onClick={onOpenCreateApt}
              className="text-xs text-teal-400 hover:underline font-semibold"
            >
              Book New
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingApts.map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>{apt.petName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-teal-400 font-mono">{apt.time}</span>
                  </div>
                  <div className="text-slate-400">{apt.reason}</div>
                  <div className="text-[11px] text-slate-500">
                    Date: {apt.date} • DVM: {apt.veterinarianName}
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {apt.status}
                </span>
              </div>
            ))}

            {upcomingApts.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">No upcoming visits scheduled.</p>
            )}
          </div>
        </div>

        {/* Pending Statements & Invoices */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Invoices & Statements</h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white font-mono flex items-center space-x-2">
                    <span>{inv.id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{inv.petName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Issued: {inv.date}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="font-bold text-white font-mono">${inv.total.toFixed(2)}</span>
                    <span
                      className={`text-[9px] block font-bold px-1.5 py-0.2 rounded ${
                        inv.status === "Paid" ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  {inv.status === "Pending" && (
                    <button
                      onClick={() => payInvoice(inv.id, "Credit Card")}
                      className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      Pay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Contact Clinic Footer */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-rose-950 text-rose-400 border border-rose-800">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white">Emergency 24/7 Clinic Direct Line</h4>
            <p className="text-slate-400">Need urgent advice? Oakwood triage nurse is on standby.</p>
          </div>
        </div>

        <a
          href="tel:+15035550199"
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center"
        >
          Call (503) 555-0199
        </a>
      </div>
    </div>
  );
};
