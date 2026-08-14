import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useI18n } from "../../i18n/I18nContext";
import {
  Calendar,
  Dog,
  FileText,
  BellRing,
  AlertTriangle,
  CreditCard,
  Plus,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Phone,
  Video,
  ChevronRight,
  TrendingUp,
  Activity,
  Send,
} from "lucide-react";

interface ClinicDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewAppointment: () => void;
  onOpenNewPet: () => void;
  onOpenNewRecord: () => void;
  onOpenAI: () => void;
  onSelectPet: (petId: string) => void;
}

export const ClinicDashboard: React.FC<ClinicDashboardProps> = ({
  onNavigateTab,
  onOpenNewAppointment,
  onOpenNewPet,
  onOpenNewRecord,
  onOpenAI,
  onSelectPet,
}) => {
  const { currentClinic, currentUser, activeRole } = useAuth();
  const {
    pets,
    appointments,
    reminders,
    medicalRecords,
    emergencyCases,
    invoices,
    updateAppointmentStatus,
    triggerManualReminder,
  } = useData();
  const { t } = useI18n();

  const todayApts = appointments.filter((a) => a.date === "2026-08-14" || a.status === "Checked-in" || a.status === "In Exam");
  const pendingReminders = reminders.filter((r) => r.status === "Scheduled" || r.status === "Appointment requested");
  const overdueVaccines = pets.filter((p) => p.vaccinationStatus === "Overdue" || p.vaccinationStatus === "Due Soon");
  const activeEmergencies = emergencyCases.filter((e) => e.status === "Triage" || e.status === "In Examination");

  const totalRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60 uppercase tracking-wider">
                Practice Live Feed
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome back, {currentUser?.name || "Dr. Vance"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {currentClinic.name} • {currentClinic.activeVetsCount} Active Vets on Duty
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dash-quick-new-apt"
              onClick={onOpenNewAppointment}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/30 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>

            <button
              id="dash-quick-new-pet"
              onClick={onOpenNewPet}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Dog className="w-3.5 h-3.5 text-emerald-400" />
              <span>Register Patient</span>
            </button>

            <button
              id="dash-quick-new-record"
              onClick={onOpenNewRecord}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>New SOAP Chart</span>
            </button>

            <button
              id="dash-quick-ai-btn"
              onClick={onOpenAI}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Active Banner if present */}
      {activeEmergencies.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border-2 border-rose-500/50 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                  Active Emergency Triage Queue ({activeEmergencies.length})
                </span>
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">
                {activeEmergencies[0].petName} ({activeEmergencies[0].species}) — {activeEmergencies[0].symptoms}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("emergency")}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            Open Triage Room →
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Appointments */}
        <div
          onClick={() => onNavigateTab("appointments")}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Visits</span>
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{todayApts.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">Scheduled</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {todayApts.filter((a) => a.status === "Checked-in").length} patients checked in lobby
          </p>
        </div>

        {/* Total Patients */}
        <div
          onClick={() => onNavigateTab("pets")}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Patients</span>
            <div className="p-2 rounded-xl bg-teal-950 text-teal-400 group-hover:scale-110 transition-transform">
              <Dog className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{pets.length}</span>
            <span className="text-xs text-teal-400 font-semibold">+4 this week</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {overdueVaccines.length} due for care renewal
          </p>
        </div>

        {/* Automated Reminders */}
        <div
          onClick={() => onNavigateTab("reminders")}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminders Dispatch</span>
            <div className="p-2 rounded-xl bg-blue-950 text-blue-400 group-hover:scale-110 transition-transform">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{pendingReminders.length}</span>
            <span className="text-xs text-blue-400 font-semibold">In Queue</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            42% auto-booking compliance
          </p>
        </div>

        {/* Practice Revenue */}
        <div
          onClick={() => onNavigateTab("billing")}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected Revenue</span>
            <div className="p-2 rounded-xl bg-purple-950 text-purple-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">${totalRevenue}</span>
            <span className="text-xs text-emerald-400 font-semibold">USD</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Subscription active: $250/mo
          </p>
        </div>
      </div>

      {/* Main Split: Today's Queue + Vaccine & Care Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Appointment Flow */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-base text-white">Today's Appointment Queue</h3>
                <p className="text-xs text-slate-400">Live lobby check-in & exam tracker</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("appointments")}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
            >
              <span>Full Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {todayApts.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No appointments remaining for today.
              </div>
            ) : (
              todayApts.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400 block">{apt.time}</span>
                      <span className="text-[10px] text-slate-400 block">{apt.durationMinutes}m</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectPet(apt.petId)}
                          className="font-bold text-sm text-white hover:text-emerald-400 text-left"
                        >
                          {apt.petName}
                        </button>
                        <span className="text-xs text-slate-400">({apt.species})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {apt.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Owner: {apt.ownerName} • Reason: <span className="text-slate-300">{apt.reason}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">Vet: {apt.veterinarianName}</p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {apt.status === "Scheduled" && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, "Checked-in")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs font-semibold"
                      >
                        Check-in Client
                      </button>
                    )}

                    {apt.status === "Confirmed" && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, "Checked-in")}
                        className="px-3 py-1.5 rounded-xl bg-teal-950 text-teal-300 border border-teal-800 hover:bg-teal-900 text-xs font-semibold"
                      >
                        Check-in Client
                      </button>
                    )}

                    {apt.status === "Checked-in" && (
                      <button
                        onClick={() => {
                          updateAppointmentStatus(apt.id, "In Exam");
                          onOpenNewRecord();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                      >
                        Start Exam (SOAP)
                      </button>
                    )}

                    {apt.status === "In Exam" && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, "Completed")}
                        className="px-3 py-1.5 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 text-xs font-semibold"
                      >
                        Complete Visit
                      </button>
                    )}

                    {apt.status === "Completed" && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Vaccination & Care Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BellRing className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base text-white">Vaccine & Care Alerts</h3>
              </div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-800">
                {overdueVaccines.length} Alerts
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {overdueVaccines.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onSelectPet(p.id)}
                      className="font-bold text-slate-100 hover:text-emerald-400"
                    >
                      {p.name} ({p.breed})
                    </button>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        p.vaccinationStatus === "Overdue"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {p.vaccinationStatus}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Owner: {p.ownerName} • Phone: {p.ownerPhone}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Rabies / Bordetella</span>
                    <button
                      onClick={() => {
                        const targetRem = reminders.find((r) => r.petId === p.id);
                        if (targetRem) {
                          triggerManualReminder(targetRem.id);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-800 text-teal-300 text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send 1-Tap SMS</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => onNavigateTab("reminders")}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Open Reminders Engine →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Medical Records & Practice Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Medical Charts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Recent Clinical Records</h3>
            </div>
            <button
              onClick={() => onNavigateTab("records")}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              View All Charts →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {medicalRecords.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    {rec.petName} ({rec.species})
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{rec.date}</span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-emerald-400">Dx:</strong> {rec.diagnosis}
                </p>
                <p className="text-slate-400 text-[11px] truncate">
                  Treatment: {rec.treatmentPlan}
                </p>
                <div className="text-[10px] text-slate-400 font-medium">
                  Attending DVM: {rec.veterinarianName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Performance & Compliance Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-base text-white">Practice Performance & Insights</h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              +18% Patient Retention
            </span>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Vaccination Compliance Rate</span>
                <span className="font-bold text-emerald-400">86% (Target: 80%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "86%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Reminder to Booking Conversion</span>
                <span className="font-bold text-teal-400">42% (Industry Avg: 19%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: "42%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Average Consultation Time</span>
                <span className="font-bold text-purple-400">22 mins</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "70%" }} />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center space-x-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>
                PawFect automated reminders saved your practice an estimated <strong>14.2 receptionist hours</strong> this month.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
