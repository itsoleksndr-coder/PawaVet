import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { RoleBadge } from "../common/RoleBadge";
import {
  PawPrint,
  FileText,
  Calendar,
  CreditCard,
  Users,
  ShieldCheck,
  Stethoscope,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  AlertTriangle,
  Building2,
  Lock,
  Heart,
  ChevronRight,
} from "lucide-react";

interface RoleAdaptiveDashboardProps {
  onNavigate: (section: any) => void;
  onOpenCreateRecord?: () => void;
  onOpenCreateApt?: () => void;
  onOpenAddPet?: () => void;
}

export const RoleAdaptiveDashboard: React.FC<RoleAdaptiveDashboardProps> = ({
  onNavigate,
  onOpenCreateRecord,
  onOpenCreateApt,
  onOpenAddPet,
}) => {
  const {
    currentUser,
    activeRole,
    activeClinic,
    clinics,
    isSuperAdmin,
    isClinicAdmin,
    isVeterinarian,
    isTechnician,
    isReceptionist,
    isPetOwner,
    canSignPrescriptions,
    canCreateSoapRecord,
  } = useAuth();

  const {
    pets,
    medicalRecords,
    appointments,
    invoices,
    reminders,
    staffMembers,
    allPetsCount,
    updateAppointmentStatus,
  } = useData();

  // Metrics
  const todayApts = appointments.filter(
    (a) => a.date === "2026-08-14" && a.status !== "Cancelled"
  );
  const checkedInCount = appointments.filter((a) => a.status === "Checked-in" || a.status === "In progress").length;
  const pendingInvoices = invoices.filter((i) => i.status === "Pending");
  const totalRevenue = invoices.filter((i) => i.status === "Paid").reduce((acc, curr) => acc + curr.amountPaid, 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Role Context Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-teal-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role={activeRole} size="md" />
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs text-teal-400 font-mono flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{activeClinic?.name || "Global Tenant Control"}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser?.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {isSuperAdmin &&
                "Global Super Admin view. Monitoring cross-clinic operations, tenant security postures, and cryptographic audit logs."}
              {isClinicAdmin &&
                `Practice Owner view for ${activeClinic?.name}. Overseeing clinical staffing, revenue performance, and security compliance.`}
              {isVeterinarian &&
                "Clinical Doctor dashboard. Ready for patient exams, SOAP diagnostic charting, and prescription authorizations."}
              {isTechnician &&
                "Veterinary Technician workspace. Managing inpatient vitals intake, diagnostic prep, and vaccine administration."}
              {isReceptionist &&
                "Client Care & Front Desk console. Handling lobby arrivals, schedule dispatch, and checkout invoices."}
              {isPetOwner &&
                "Dedicated Pet Parent Portal. Access your pets' medical passports, vaccine history, and clinic appointments."}
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            {canCreateSoapRecord && (
              <button
                onClick={onOpenCreateRecord}
                className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New SOAP Record</span>
              </button>
            )}

            {!isPetOwner ? (
              <button
                onClick={onOpenCreateApt}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Book Visit</span>
              </button>
            ) : (
              <button
                onClick={onOpenCreateApt}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Appointment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">
              {isPetOwner ? "Registered Pets" : isSuperAdmin ? "Total Platform Patients" : "Clinic Patients"}
            </span>
            <div className="p-2 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-800/60">
              <PawPrint className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {pets.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {isPetOwner ? "Isolated to your account" : "Active clinical charts"}
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">
              {isPetOwner ? "My Visits" : "Today's Schedule"}
            </span>
            <div className="p-2 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800/60">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {todayApts.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {checkedInCount} currently checked-in
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">
              {isPetOwner ? "Medical Records" : "SOAP Records"}
            </span>
            <div className="p-2 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/60">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {medicalRecords.length}
          </div>
          <p className="text-[11px] text-slate-400">
            Cryptographically sealed
          </p>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">
              {isPetOwner ? "Pending Balance" : isSuperAdmin ? "Total Practices" : "Invoiced Volume"}
            </span>
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/60">
              {isSuperAdmin ? <Building2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {isSuperAdmin ? clinics.length : isPetOwner ? `$0.00` : `$${totalRevenue.toFixed(0)}`}
          </div>
          <p className="text-[11px] text-slate-400">
            {isSuperAdmin ? "Active clinic tenants" : `${pendingInvoices.length} pending collections`}
          </p>
        </div>
      </div>

      {/* Main Split Section: Role-Specific Action Queue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Clinical & Lobby Queue */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {isPetOwner ? "My Pets & Preventative Care" : "Live Patient Queue & Appointments"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isPetOwner
                    ? "Up-to-date health status and vaccine passports"
                    : `Active lobby visits for ${activeClinic?.name}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate(isPetOwner ? "pets" : "appointments")}
              className="text-xs text-teal-400 hover:underline font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* If Pet Owner, show pet cards */}
          {isPetOwner ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => onNavigate("pets")}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={pet.photoUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=80"}
                      alt={pet.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{pet.name}</h4>
                      <p className="text-xs text-slate-400">{pet.breed} • {pet.age}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Vaccine Passport:</span>
                    <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60 text-[10px]">
                      {pet.vaccinationStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* For Clinic Staff: Show appointment queue */
            <div className="space-y-3">
              {appointments.slice(0, 4).map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-teal-400 font-mono text-xs font-bold text-center min-w-[64px]">
                      <div>{apt.time.split(" ")[0]}</div>
                      <div className="text-[10px] text-slate-500">{apt.time.split(" ")[1]}</div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">{apt.petName}</span>
                        <span className="text-xs text-slate-400 font-mono">({apt.species})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            apt.status === "In progress"
                              ? "bg-amber-950 text-amber-300 border-amber-800 animate-pulse"
                              : apt.status === "Checked-in"
                              ? "bg-teal-950 text-teal-300 border-teal-800"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 mt-0.5">{apt.reason}</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Parent: <span className="text-slate-400">{apt.ownerName}</span> • Attending:{" "}
                        <span className="text-slate-400">{apt.veterinarianName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fast Status Change for Staff */}
                  <div className="flex items-center space-x-1.5 sm:self-center">
                    {apt.status === "Scheduled" && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, "Checked-in")}
                        className="px-3 py-1.5 rounded-xl bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Check In
                      </button>
                    )}
                    {apt.status === "Checked-in" && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, "In progress")}
                        className="px-3 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Call to Exam
                      </button>
                    )}
                    {apt.status === "In progress" && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, "Completed")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Complete Visit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Security & Compliance Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Security & Tenant Health</h3>
                <p className="text-xs text-slate-400">Zero-trust access policy</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Clinic Tenant Isolation</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enforced</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Two-Factor Authentication</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentUser?.isTwoFactorEnabled ? "Active (TOTP)" : "Optional"}</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Session Inactivity Lock</span>
                <span className="font-mono text-slate-300">
                  {activeClinic?.autoLockTimeoutMinutes || 15} mins
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">SOAP Cryptographic Seal</span>
                <span className="font-mono font-bold text-teal-400">SHA-256</span>
              </div>
            </div>
          </div>

          {(isSuperAdmin || isClinicAdmin) && (
            <button
              onClick={() => onNavigate("audit")}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-4"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Inspect Audit Trail</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
