import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { Appointment, AppointmentStatus } from "../../types";
import {
  Calendar,
  Clock,
  Plus,
  User,
  PawPrint,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  ChevronRight,
  Filter,
} from "lucide-react";

interface AppointmentCalendarProps {
  onOpenCreate: () => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onOpenCreate,
}) => {
  const { isPetOwner, activeClinic, hasPermission } = useAuth();
  const { appointments, updateAppointmentStatus } = useData();

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (statusFilter !== "all" && apt.status !== statusFilter) return false;
      return true;
    });
  }, [appointments, statusFilter]);

  const canCreate = hasPermission("appointments:create");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/60 font-mono uppercase">
              {isPetOwner ? "My Bookings" : "Lobby & Schedule"}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? "Visit" : "Visits"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            {isPetOwner ? "My Scheduled Veterinary Visits" : "Lobby Arrivals & Exam Room Queue"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isPetOwner
              ? "View your upcoming clinic consultations and track check-in status in real time."
              : `Real-time patient flow and exam room scheduling for ${activeClinic?.name}.`}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onOpenCreate}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isPetOwner ? "Book Visit" : "Schedule Patient"}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", "Scheduled", "Checked-in", "In progress", "Completed"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === st
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {st === "all" ? "All Visits" : st}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.map((apt) => (
          <div
            key={apt.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-start space-x-4">
              {/* Time Badge */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-teal-400 font-mono text-center min-w-[80px]">
                <div className="text-xs font-extrabold">{apt.time.split(" ")[0]}</div>
                <div className="text-[10px] text-slate-500">{apt.time.split(" ")[1]}</div>
                <div className="text-[9px] text-slate-400 mt-1 font-semibold">{apt.date}</div>
              </div>

              {/* Patient and Visit Details */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-base text-white">{apt.petName}</span>
                  <span className="text-xs text-slate-500 font-mono">({apt.species})</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      apt.status === "In progress"
                        ? "bg-amber-950 text-amber-300 border-amber-800 animate-pulse"
                        : apt.status === "Checked-in"
                        ? "bg-teal-950 text-teal-300 border-teal-800"
                        : apt.status === "Completed"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {apt.status}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                    {apt.type}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200">{apt.reason}</div>

                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                  <span>Parent: <strong className="text-slate-300">{apt.ownerName}</strong></span>
                  <span>•</span>
                  <span>Attending DVM: <strong className="text-teal-400">{apt.veterinarianName}</strong></span>
                </div>

                {apt.notes && (
                  <p className="text-[11px] text-slate-400 italic">Notes: {apt.notes}</p>
                )}
              </div>
            </div>

            {/* Status Change Buttons for Clinic Staff */}
            {!isPetOwner && (
              <div className="flex items-center space-x-2 self-end md:self-center">
                {apt.status === "Scheduled" && (
                  <button
                    onClick={() => updateAppointmentStatus(apt.id, "Checked-in")}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    Check In Patient
                  </button>
                )}

                {apt.status === "Checked-in" && (
                  <button
                    onClick={() => updateAppointmentStatus(apt.id, "In progress")}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    Move to Exam Room
                  </button>
                )}

                {apt.status === "In progress" && (
                  <button
                    onClick={() => updateAppointmentStatus(apt.id, "Completed")}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    Mark Complete
                  </button>
                )}

                {apt.status !== "Cancelled" && apt.status !== "Completed" && (
                  <button
                    onClick={() => updateAppointmentStatus(apt.id, "Cancelled")}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
            <Calendar className="w-12 h-12 mx-auto text-slate-700 mb-2" />
            <p className="text-sm font-semibold">No appointments scheduled matching this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
