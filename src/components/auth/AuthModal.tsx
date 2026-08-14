import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserRole, ROLE_CONFIGS } from "../../types";
import {
  X,
  Lock,
  Mail,
  Key,
  Shield,
  ShieldCheck,
  Building2,
  Stethoscope,
  UserCheck,
  HeartHandshake,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import { INITIAL_USERS } from "../../data/initialData";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "demo" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "demo",
}) => {
  const { login, switchDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "demo" | "register" | "forgot">(defaultTab);
  const [email, setEmail] = useState("admin@oakwoodvet.com");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<"input" | "sent">("input");

  // Registration state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("PET_OWNER");
  const [regPassword, setRegPassword] = useState("");

  if (!isOpen) return null;

  const handleDemoSelect = (role: UserRole) => {
    switchDemoRole(role);
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await login(email, password, requires2FA ? totpCode : undefined);
      if (res.success) {
        setSuccessMessage("Authentication successful! Welcome back.");
        setTimeout(() => {
          onClose();
        }, 600);
      } else if (res.requires2FA) {
        setRequires2FA(true);
        setErrorMessage(res.message || "Please enter your 2-Factor Authentication code.");
      } else {
        setErrorMessage(res.message || "Authentication failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate new user registration with strong password check
    if (regPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters with numbers and letters.");
      setIsLoading(false);
      return;
    }

    setSuccessMessage(`Account created successfully for ${regName}! Signing in...`);
    setTimeout(() => {
      switchDemoRole(regRole);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStep("sent");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">PawFect Authentication & RBAC Gate</h3>
              <p className="text-xs text-slate-400">Multi-tenant role-based access control with secure credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3 space-x-2">
          <button
            onClick={() => {
              setActiveTab("demo");
              setErrorMessage("");
              setRequires2FA(false);
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "demo"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Role Switcher (Demo)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMessage("");
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "login"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Standard Login</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMessage("");
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "register"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* TAB 1: 1-CLICK DEMO ROLES */}
          {activeTab === "demo" && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Instantly simulate and inspect the app from the perspective of each specific RBAC role and its isolated data boundary:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {/* 1. Super Admin */}
                <button
                  onClick={() => handleDemoSelect("SUPER_ADMIN")}
                  className="text-left p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-500/80 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                        SUPER_ADMIN
                      </span>
                      <Shield className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-white text-xs">Marcus Vance</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      Global multi-tenant control plane, cross-clinic switcher, and security audit center.
                    </div>
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-mono mt-2 flex items-center space-x-1">
                    <span>superadmin@pawfect.io</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                {/* 2. Clinic Admin */}
                <button
                  onClick={() => handleDemoSelect("CLINIC_ADMIN")}
                  className="text-left p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 hover:border-purple-500/80 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                        CLINIC_ADMIN
                      </span>
                      <Building2 className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-white text-xs">Dr. Helena Cross</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      Oakwood Practice Owner. Full clinic staff management, billing, and clinic audit logs.
                    </div>
                  </div>
                  <div className="text-[10px] text-purple-400/90 font-mono mt-2 flex items-center space-x-1">
                    <span>admin@oakwoodvet.com</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                {/* 3. Veterinarian */}
                <button
                  onClick={() => handleDemoSelect("VETERINARIAN")}
                  className="text-left p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/30 hover:border-teal-500/80 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                        VETERINARIAN
                      </span>
                      <Stethoscope className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-white text-xs">Dr. Emily Vance, DVM</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      Senior Surgeon. Authorized to chart SOAP notes, sign prescriptions, and view full patient files.
                    </div>
                  </div>
                  <div className="text-[10px] text-teal-400/90 font-mono mt-2 flex items-center space-x-1">
                    <span>emily.vance@oakwoodvet.com</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                {/* 4. Technician */}
                <button
                  onClick={() => handleDemoSelect("TECHNICIAN")}
                  className="text-left p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/30 hover:border-blue-500/80 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                        TECHNICIAN
                      </span>
                      <UserCheck className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-white text-xs">Alex Rivera, RVT</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      Veterinary Tech. Can log patient vitals, manage inpatient queue, and record treatments.
                    </div>
                  </div>
                  <div className="text-[10px] text-blue-400/90 font-mono mt-2 flex items-center space-x-1">
                    <span>alex.rivera@oakwoodvet.com</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                {/* 5. Receptionist */}
                <button
                  onClick={() => handleDemoSelect("RECEPTIONIST")}
                  className="text-left p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-500/80 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        RECEPTIONIST
                      </span>
                      <HeartHandshake className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-white text-xs">Sarah Jenkins</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      Front Desk Lead. Manages client check-ins, appointment calendar, invoices, and reminders.
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-400/90 font-mono mt-2 flex items-center space-x-1">
                    <span>sarah.jenkins@oakwoodvet.com</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                {/* 6. Pet Owner */}
                <button
                  onClick={() => handleDemoSelect("PET_OWNER")}
                  className="text-left p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 hover:border-rose-500/80 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                        PET_OWNER
                      </span>
                      <User className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-white text-xs">David Chen</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      Pet Parent. Isolated exclusively to Barnaby & Luna, their vaccine records, and invoices.
                    </div>
                  </div>
                  <div className="text-[10px] text-rose-400/90 font-mono mt-2 flex items-center space-x-1">
                    <span>david.chen@gmail.com</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STANDARD LOGIN */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {!requires2FA ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@oakwoodvet.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("forgot")}
                        className="text-[11px] text-teal-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-teal-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-md shadow-teal-600/30 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>{isLoading ? "Authenticating..." : "Sign In to Clinic Portal"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* 2FA Verification Form */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-950/50 border border-teal-800/80 text-center">
                    <Smartphone className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-white">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Enter the 6-digit verification code from your authenticator app (e.g. Google Authenticator / Authy).
                    </p>
                    <span className="text-[11px] text-teal-400 font-mono inline-block mt-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      Demo Tip: enter <strong>123456</strong> or any 6 digits
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5 text-center">6-Digit TOTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="000000"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-950 border border-teal-500 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setRequires2FA(false)}
                      className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || totpCode.length < 6}
                      className="w-2/3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold transition-all shadow-md"
                    >
                      Verify & Access Session
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* TAB 3: REGISTER NEW ACCOUNT */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jordan Reed or Jessica Davis"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Desired Role / Account Type *</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="PET_OWNER">Pet Parent / Client (Isolated to my pets)</option>
                  <option value="VETERINARIAN">Doctor of Veterinary Medicine (DVM)</option>
                  <option value="TECHNICIAN">Veterinary Technician / Nurse</option>
                  <option value="RECEPTIONIST">Front Desk Receptionist</option>
                  <option value="CLINIC_ADMIN">Clinic Owner / Practice Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Secure Password (min 8 chars) *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-md shadow-teal-600/30 flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? "Creating Account..." : "Create Account & Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD SUB-FLOW */}
          {activeTab === "forgot" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-1">Reset Password</h4>
                <p className="text-slate-400">
                  Enter your registered work or client email address to receive a cryptographically signed password reset link and verification token.
                </p>
              </div>

              {forgotStep === "input" ? (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Account Email</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. emily.vance@oakwoodvet.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-slate-400 hover:text-white font-semibold"
                    >
                      Back to login
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md"
                    >
                      Send Reset Instructions
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="font-bold text-white text-sm">Reset Link Dispatched</p>
                  <p className="text-slate-400 text-xs">
                    We sent password reset token instructions to <strong className="text-white">{forgotEmail || "your email"}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setForgotStep("input");
                      setActiveTab("login");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold"
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
