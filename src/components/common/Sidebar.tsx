import React from "react";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import {
  LayoutDashboard,
  PawPrint,
  FileText,
  Calendar,
  Bell,
  CreditCard,
  Users,
  ShieldCheck,
  Stethoscope,
  Heart,
  Video,
  Settings,
  Building2,
  Lock,
} from "lucide-react";

export type NavSection =
  | "dashboard"
  | "pets"
  | "records"
  | "appointments"
  | "reminders"
  | "billing"
  | "staff"
  | "audit"
  | "owner_portal"
  | "telemed";

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
}) => {
  const { activeRole, isPetOwner, isSuperAdmin, isClinicAdmin, isVeterinarian, isTechnician, isReceptionist } = useAuth();

  interface NavItem {
    id: NavSection;
    label: string;
    icon: React.ReactNode;
    allowedRoles: UserRole[];
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: isPetOwner ? "My Pet Dashboard" : "Practice Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ["SUPER_ADMIN", "CLINIC_ADMIN", "VETERINARIAN", "TECHNICIAN", "RECEPTIONIST", "PET_OWNER"],
    },
    {
      id: "owner_portal",
      label: "Pet Parent Portal",
      icon: <Heart className="w-4 h-4" />,
      allowedRoles: ["PET_OWNER"],
    },
    {
      id: "pets",
      label: isPetOwner ? "My Pets & Passports" : "Patients & Records",
      icon: <PawPrint className="w-4 h-4" />,
      allowedRoles: ["SUPER_ADMIN", "CLINIC_ADMIN", "VETERINARIAN", "TECHNICIAN", "RECEPTIONIST", "PET_OWNER"],
    },
    {
      id: "records",
      label: "SOAP Charts & Rx",
      icon: <FileText className="w-4 h-4" />,
      allowedRoles: ["SUPER_ADMIN", "CLINIC_ADMIN", "VETERINARIAN", "TECHNICIAN", "PET_OWNER"],
    },
    {
      id: "appointments",
      label: "Appointments & Queue",
      icon: <Calendar className="w-4 h-4" />,
      allowedRoles: ["SUPER_ADMIN", "CLINIC_ADMIN", "VETERINARIAN", "TECHNICIAN", "RECEPTIONIST", "PET_OWNER"],
    },
    {
      id: "reminders",
      label: "Vaccine Reminders",
      icon: <Bell className="w-4 h-4" />,
      allowedRoles: ["SUPER_ADMIN", "CLINIC_ADMIN", "VETERINARIAN", "TECHNICIAN", "RECEPTIONIST", "PET_OWNER"],
    },
    {
      id: "billing",
      label: isPetOwner ? "Invoices & Receipts" : "Billing & Payments",
      icon: <CreditCard className="w-4 h-4" />,
      allowedRoles: ["SUPER_ADMIN", "CLINIC_ADMIN", "RECEPTIONIST", "PET_OWNER"],
    },
    {
      id: "telemed",
      label: "Telehealth & Scribe",
      icon: <Video className="w-4 h-4" />,
      allowedRoles: ["SUPER_ADMIN", "CLINIC_ADMIN", "VETERINARIAN", "TECHNICIAN", "PET_OWNER"],
    },
    {
      id: "staff",
      label: "Staff & RBAC Roles",
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ["SUPER_ADMIN", "CLINIC_ADMIN"],
    },
    {
      id: "audit",
      label: "Security & Audit Logs",
      icon: <ShieldCheck className="w-4 h-4" />,
      allowedRoles: ["SUPER_ADMIN", "CLINIC_ADMIN"],
      badge: "HIPAA",
    },
  ];

  const visibleItems = navItems.filter((item) => item.allowedRoles.includes(activeRole));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-3 mb-2 font-mono">
            Navigation Module
          </div>

          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-teal-600/15 text-teal-400 border border-teal-500/30 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? "text-teal-400" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/80 px-1.5 py-0.2 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role Security Status Banner at bottom */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] space-y-1.5">
        <div className="flex items-center space-x-1.5 text-teal-400 font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>RBAC Enforcement Active</span>
        </div>
        <p className="text-slate-400 text-[10px] leading-relaxed">
          Access is strictly scoped to your authorized role and clinic tenant boundary.
        </p>
      </div>
    </aside>
  );
};
