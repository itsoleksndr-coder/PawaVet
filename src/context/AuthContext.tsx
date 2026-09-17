import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  User,
  UserRole,
  Clinic,
  Permission,
  UserSession,
  AuditLogEntry,
  ROLE_PERMISSIONS,
} from "../types";
import { api, ApiError } from "../lib/api";
interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  message?: string;
  user?: User;
}

interface AuthContextType {
  loading: boolean;
  authError: string;
  refreshAuth: () => Promise<void>;
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
  logout: () => void;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeClinic, setClinic] = useState<Clinic | null>(null);
  const [isLocked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setError] = useState("");
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [auditLogs, setAudit] = useState<AuditLogEntry[]>([]);
  const clear = useCallback(() => {
    setCurrentUser(null);
    setClinic(null);
    setSessions([]);
    setAudit([]);
    setLocked(false);
  }, []);
  const refreshAuth = useCallback(async () => {
    try {
      const r = await api<{ user: User; clinic: Clinic; locked: boolean }>(
        "/auth/me",
      );
      setCurrentUser(r.user);
      setClinic(r.clinic);
      setLocked(r.locked);
      setError("");
      if (!r.locked) {
        setSessions(await api<UserSession[]>("/auth/sessions"));
        if (ROLE_PERMISSIONS[r.user.role].includes("clinic:audit_logs_read"))
          setAudit(await api<AuditLogEntry[]>("/audit"));
        else setAudit([]);
      }
    } catch (e) {
      clear();
      if (!(e instanceof ApiError && e.status === 401))
        setError(
          e instanceof Error ? e.message : "Sign-in service unavailable.",
        );
    } finally {
      setLoading(false);
    }
  }, [clear]);
  useEffect(() => {
    void refreshAuth();
    const lock = () => setLocked(true);
    window.addEventListener("pawavet:session-expired", clear);
    window.addEventListener("pawavet:session-locked", lock);
    return () => {
      window.removeEventListener("pawavet:session-expired", clear);
      window.removeEventListener("pawavet:session-locked", lock);
    };
  }, [refreshAuth, clear]);
  useEffect(() => {
    if (!currentUser) return;
    const timer = setInterval(() => void refreshAuth(), 60000);
    return () => clearInterval(timer);
  }, [!!currentUser, refreshAuth]);
  const login = async (email: string, password = ""): Promise<LoginResult> => {
    try {
      await api("/auth/login", "POST", { email, password });
      await refreshAuth();
      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : "Unable to sign in.",
      };
    }
  };
  const logout = async () => {
    try {
      await api("/auth/logout", "POST", {});
      clear();
    } catch (e) {
      setLocked(true);
      setError(e instanceof Error ? e.message : "Could not revoke session.");
    }
  };
  const lockSession = async () => {
    setLocked(true);
    try {
      await api("/auth/lock", "POST", {});
    } catch {
      setError(
        "Unable to lock the server session. Please sign out when connected.",
      );
    }
  };
  const unlockSession = async (password: string) => {
    try {
      await api("/auth/unlock", "POST", { password });
      setLocked(false);
      return true;
    } catch {
      return false;
    }
  };
  useEffect(() => {
    if (!currentUser || isLocked) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () => void lockSession(),
        (activeClinic?.autoLockTimeoutMinutes || 15) * 60000,
      );
    };
    reset();
    window.addEventListener("pointerdown", reset);
    window.addEventListener("keydown", reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [currentUser?.id, isLocked, activeClinic?.autoLockTimeoutMinutes]);
  const revokeSession = async (id: string) => {
    try {
      await api(`/auth/sessions/${encodeURIComponent(id)}`, "DELETE");
      await refreshAuth();
    } catch (e) {
      setError(String(e));
    }
  };
  const revokeAllOtherSessions = async () => {
    try {
      await api("/auth/revoke-others", "POST", {});
      await refreshAuth();
    } catch (e) {
      setError(String(e));
    }
  };
  const activeRole = currentUser?.role || "PET_OWNER";
  const hasPermission = (p: Permission) =>
    !!currentUser && ROLE_PERMISSIONS[activeRole].includes(p);
  const updatePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await api("/auth/password", "POST", { oldPassword, newPassword });
      clear();
      return { success: true, message: "Password changed. Sign in again." };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : "Unable to change password.",
      };
    }
  };
  return (
    <AuthContext.Provider
      value={{
        loading,
        authError,
        refreshAuth,
        currentUser,
        activeRole,
        activeClinic,
        clinics: activeClinic ? [activeClinic] : [],
        isLoggedIn: !!currentUser,
        isLocked,
        sessions,
        auditLogs,
        hasPermission,
        canAccessClinic: (id) => !!activeClinic && activeClinic.id === id,
        isSuperAdmin: activeRole === "SUPER_ADMIN",
        isClinicAdmin: activeRole === "CLINIC_ADMIN",
        isVeterinarian: activeRole === "VETERINARIAN",
        isTechnician: activeRole === "TECHNICIAN",
        isReceptionist: activeRole === "RECEPTIONIST",
        isPetOwner: activeRole === "PET_OWNER",
        canSignPrescriptions: false,
        canCreateSoapRecord: false,
        canManageStaff: hasPermission("staff:modify_role"),
        canManageBilling: false,
        canExportRecords: false,
        login,
        logout,
        lockSession,
        unlockSession,
        revokeSession,
        revokeAllOtherSessions,
        updatePassword,
        switchDemoRole: () => {
          throw new Error("Demo role switching is disabled.");
        },
        switchClinicTenant: () => {
          throw new Error("Use an authorized clinic membership.");
        },
        toggle2FA: async () => false,
        recordAuditLog: () => {
          /* Only server operations can write authoritative audit events. */
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider required");
  return context;
};
