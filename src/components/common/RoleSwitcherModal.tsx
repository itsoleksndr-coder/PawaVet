import React from "react";
import { useAuth } from "../../context/AuthContext";
import { UserRole, ROLE_CONFIGS } from "../../types";
import { RoleBadge } from "./RoleBadge";
import {
  X,
  Sparkles,
  Shield,
  Building2,
  Stethoscope,
  UserCheck,
  HeartHandshake,
  User,
  Check,
  ArrowRight,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeRole, switchDemoRole, activeClinic } = useAuth();

  if (!isOpen) return null;

  const roles: UserRole[] = [
    "SUPER_ADMIN",
    "CLINIC_ADMIN",
    "VETERINARIAN",
    "TECHNICIAN",
    "RECEPTIONIST",
    "PET_OWNER",
  ];

  const handleSelectRole = (role: UserRole) => {
    switchDemoRole(role);
    onClose();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Shield className="w-5 h-5 text-amber-400" />;
      case "CLINIC_ADMIN":
        return <Building2 className="w-5 h-5 text-purple-400" />;
      case "VETERINARIAN":
        return <Stethoscope className="w-5 h-5 text-teal-400" />;
      case "TECHNICIAN":
        return <UserCheck className="w-5 h-5 text-blue-400" />;
      case "RECEPTIONIST":
        return <HeartHandshake className="w-5 h-5 text-emerald-400" />;
      case "PET_OWNER":
        return <User className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-teal-950 text-teal-400 border border-teal-800">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">PawFect Multi-Role Simulator</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch instantly between any of the 6 specialized veterinary roles to test RBAC rules & data isolation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const config = ROLE_CONFIGS[role];
            const isCurrent = activeRole === role;

            return (
              <div
                key={role}
                onClick={() => handleSelectRole(role)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isCurrent
                    ? "bg-slate-950 border-teal-500/80 ring-2 ring-teal-500/20 shadow-lg"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800">
                      {getRoleIcon(role)}
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Active Role</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-mono flex items-center space-x-1">
                        <span>Switch</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <RoleBadge role={role} size="md" />

                  <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                    {config.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">
                    {config.permissions.length} Permissions
                  </span>
                  <span className="font-bold text-teal-400 group-hover:underline">
                    {isCurrent ? "Currently viewing" : "Simulate Role →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Data Isolation Notice */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-200">Data Isolation Guarantee</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Veterinary practice data (patients, prescriptions, medical records, invoices) is strictly partitioned per clinic tenant. Pet Owners are isolated exclusively to their own registered pets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
