import React from "react";
import { UserRole, ROLE_CONFIGS } from "../../types";
import { Shield, Stethoscope, UserCheck, HeartHandshake, Building2, User } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = "md",
  showDescription = false,
}) => {
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.PET_OWNER;

  const getIcon = () => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Shield className="w-3.5 h-3.5" />;
      case "CLINIC_ADMIN":
        return <Building2 className="w-3.5 h-3.5" />;
      case "VETERINARIAN":
        return <Stethoscope className="w-3.5 h-3.5" />;
      case "TECHNICIAN":
        return <UserCheck className="w-3.5 h-3.5" />;
      case "RECEPTIONIST":
        return <HeartHandshake className="w-3.5 h-3.5" />;
      case "PET_OWNER":
        return <User className="w-3.5 h-3.5" />;
    }
  };

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 space-x-1",
    md: "text-xs px-2.5 py-1 space-x-1.5",
    lg: "text-sm px-3 py-1.5 space-x-2 font-bold",
  }[size];

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center rounded-full font-semibold border ${config.badgeBg} ${config.badgeColor} ${config.badgeBorder} ${sizeClasses}`}
      >
        {getIcon()}
        <span>{config.title}</span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-400 mt-1 max-w-xs">{config.description}</span>
      )}
    </div>
  );
};
