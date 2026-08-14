import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Building2, ChevronDown, Check, ShieldCheck, Globe } from "lucide-react";

export const TenantBadge: React.FC = () => {
  const { activeClinic, clinics, isSuperAdmin, switchClinicTenant, isPetOwner } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeClinic && !isSuperAdmin) return null;

  return (
    <div className="relative">
      <button
        onClick={() => isSuperAdmin && setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
          isSuperAdmin
            ? "bg-slate-900/90 border-amber-500/30 text-amber-200 hover:border-amber-500/60 cursor-pointer"
            : "bg-slate-900/80 border-slate-800 text-slate-300 cursor-default"
        }`}
        title={
          isSuperAdmin
            ? "Super Admin: Click to switch clinic data tenant"
            : `Data isolated strictly to ${activeClinic?.name}`
        }
      >
        <div className="p-1 rounded-lg bg-teal-950/80 text-teal-400 border border-teal-800/60">
          <Building2 className="w-3.5 h-3.5" />
        </div>

        <div className="text-left hidden sm:block">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
            <span>Clinic Tenant</span>
            <span className="text-teal-400 font-bold">[{activeClinic?.code || "GLOBAL"}]</span>
          </div>
          <div className="font-bold text-slate-200 text-xs truncate max-w-[160px]">
            {activeClinic?.name || "Global Control Plane"}
          </div>
        </div>

        {isSuperAdmin && (
          <ChevronDown className="w-3.5 h-3.5 text-amber-400 ml-1" />
        )}
      </button>

      {/* Super Admin Tenant Dropdown Switcher */}
      {isSuperAdmin && isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 sm:left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-xs animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-300">Switch Practice Tenant</span>
              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded font-mono">
                Super Admin
              </span>
            </div>

            <div className="py-1 space-y-1">
              {clinics.map((clinic) => {
                const isSelected = activeClinic?.id === clinic.id;
                return (
                  <button
                    key={clinic.id}
                    onClick={() => {
                      switchClinicTenant(clinic.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-teal-950/80 border border-teal-700/60 text-teal-200 font-semibold"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span>{clinic.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {clinic.city}, {clinic.state} • Code: {clinic.code}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-400" />}
                  </button>
                );
              })}
            </div>

            <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-1.5 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <span>
                Switching tenants isolates all patient data, medical charts, appointments, and audit logs immediately.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
