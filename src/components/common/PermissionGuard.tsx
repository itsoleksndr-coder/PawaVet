import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Permission, UserRole } from "../../types";
import { Lock, ShieldAlert } from "lucide-react";

interface PermissionGuardProps {
  permission?: Permission;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hideIfUnauthorized?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  allowedRoles,
  children,
  fallback,
  hideIfUnauthorized = false,
}) => {
  const { hasPermission, activeRole } = useAuth();

  let isAuthorized = true;

  if (permission && !hasPermission(permission)) {
    isAuthorized = false;
  }

  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    isAuthorized = false;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (hideIfUnauthorized) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
      <Lock className="w-5 h-5 mx-auto text-amber-500/80 mb-2" />
      <p className="font-semibold text-slate-300">Action Restricted</p>
      <p className="text-[11px] text-slate-500 mt-0.5">
        Your current role ({activeRole}) does not have permission for this clinical or administrative action.
      </p>
    </div>
  );
};
