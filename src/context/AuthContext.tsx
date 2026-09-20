import React, { createContext, useContext, useState, useEffect } from "react";
import {
  type User,
  type Clinic,
  type UserRole,
  type Permission,
  type UserSession,
  type AuditLogEntry,
  ROLE_PERMISSIONS,
} from "../types";
import type { AuthSession } from "../clinic-model";
import { request } from "../api-client";
interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  message?: string;
  user?: User;
}

interface AuthContextType {
  loading: boolean;
  error: string;
  currentUser: User | null;
  activeRole: UserRole;
  activeClinic: Clinic | null;
  clinics: Clinic[];
  isLoggedIn: boolean;
  isLocked: boolean;
  sessions: UserSession[];
  auditLogs: AuditLogEntry[];

  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  canAccessClinic: (clinicId: string) => boolean;

  // Role helpers
  isSuperAdmin: boolean;
  isClinicAdmin: boolean;
  isVeterinarian: boolean;
  isTechnician: boolean;
  isReceptionist: boolean;
  isPetOwner: boolean;

  // Specific action authorizations
  canSignPrescriptions: boolean;
  canCreateSoapRecord: boolean;
  canManageStaff: boolean;
  canManageBilling: boolean;
  canExportRecords: boolean;

  // Actions
  login: (
    email: string,
    password?: string,
    totpCode?: string,
  ) => Promise<LoginResult>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole, targetClinicId?: string) => void;
  switchClinicTenant: (clinicId: string) => void;
  lockSession: () => void;
  unlockSession: (pinOrPassword: string) => Promise<boolean>;
  toggle2FA: (enable: boolean, secret?: string) => Promise<boolean>;
  revokeSession: (sessionId: string) => void;
  revokeAllOtherSessions: () => void;
  updatePassword: (
    oldPass: string,
    newPass: string,
  ) => Promise<{ success: boolean; message: string }>;
  recordAuditLog: (entry: {
    action: AuditLogEntry["action"];
    severity: AuditLogEntry["severity"];
    targetResource: string;
    resourceId?: string;
    details: string;
    metadata?: Record<string, any>;
    customClinicId?: string;
  }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLocked, setLocked] = useState(false);
  useEffect(() => {
    const expire = () => setSession(null);
    window.addEventListener("pawavet-session-expired", expire);
    request<AuthSession>("/api/auth/session")
      .then(setSession)
      .catch((e) => {
        if (e.message !== "Please sign in again.") setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => window.removeEventListener("pawavet-session-expired", expire);
  }, []);
  const login = async (email: string, password = ""): Promise<LoginResult> => {
    try {
      const next = await request<AuthSession>("/api/auth/login", "POST", {
        email,
        password,
      });
      setSession(next);
      setLocked(false);
      setError("");
      return { success: true, user: next.user };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : "Sign-in failed.",
      };
    }
  };
  const logout = async () => {
    try {
      await request("/api/auth/logout", "POST", {});
      setSession(null);
      setLocked(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-out failed.");
    }
  };
  const currentUser = session?.user || null;
  const activeRole = currentUser?.role || "PET_OWNER";
  const hasPermission = (permission: Permission) =>
    !!currentUser && ROLE_PERMISSIONS[activeRole].includes(permission);
  const unavailable = () => {
    setError("This action is not available in this release.");
  };
  useEffect(() => {
    if (!currentUser) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setLocked(true), 15 * 60 * 1000);
    };
    window.addEventListener("pointerdown", reset);
    window.addEventListener("keydown", reset);
    reset();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [currentUser?.id]);
  return (
    <AuthContext.Provider
      value={{
        loading,
        error,
        currentUser,
        activeRole,
        activeClinic: session?.clinic || null,
        clinics: session ? [session.clinic] : [],
        isLoggedIn: !!currentUser,
        isLocked,
        sessions: [],
        auditLogs: [],
        hasPermission,
        canAccessClinic: (id) => currentUser?.clinicId === id,
        isSuperAdmin: activeRole === "SUPER_ADMIN",
        isClinicAdmin: activeRole === "CLINIC_ADMIN",
        isVeterinarian: activeRole === "VETERINARIAN",
        isTechnician: activeRole === "TECHNICIAN",
        isReceptionist: activeRole === "RECEPTIONIST",
        isPetOwner: activeRole === "PET_OWNER",
        canSignPrescriptions: false,
        canCreateSoapRecord: hasPermission("records:create_soap"),
        canManageStaff: hasPermission("staff:invite"),
        canManageBilling: false,
        canExportRecords: hasPermission("clinic:export_data"),
        login,
        logout,
        switchDemoRole: unavailable,
        switchClinicTenant: unavailable,
        lockSession: () => setLocked(true),
        unlockSession: async (password) => {
          const result = await login(currentUser?.email || "", password);
          return result.success;
        },
        toggle2FA: async () => {
          unavailable();
          return false;
        },
        revokeSession: unavailable,
        revokeAllOtherSessions: unavailable,
        updatePassword: async (oldPassword, newPassword) => {
          try {
            await request("/api/auth/password", "POST", {
              oldPassword,
              newPassword,
            });
            setSession(null);
            return {
              success: true,
              message: "Password changed. Please sign in again.",
            };
          } catch (e) {
            return {
              success: false,
              message:
                e instanceof Error ? e.message : "Password change failed.",
            };
          }
        },
        recordAuditLog: () => {
          /* Authoritative audit entries are created by the server transaction. */
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider missing");
  return context;
};
