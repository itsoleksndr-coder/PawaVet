import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { request } from "../../api-client";

type View = "login" | "request" | "reset";
export function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}) {
  const { login } = useAuth();
  const [resetToken] = useState(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get("reset") || new URLSearchParams(window.location.search).get("reset") || "";
    if (value) window.history.replaceState({}, "", window.location.pathname);
    return value;
  });
  const [view, setView] = useState<View>(resetToken ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState<"password" | "verify">("password");
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [recovery, setRecovery] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  if (!isOpen) return null;
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <form
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-8 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setMessage("");
          try {
            if (view === "request") {
              await request("/api/auth/recovery/request", "POST", { email });
              setMessage("If the account exists, a reset link will arrive by email.");
              return;
            }
            if (view === "reset") {
              await request("/api/auth/recovery/confirm", "POST", { token: resetToken, newPassword });
              window.history.replaceState({}, "", window.location.pathname);
              setNewPassword("");
              setView("login");
              setMessage("Password reset. Sign in with your new password.");
              return;
            }
            const result = await login(email, password, step === "verify" ? code : undefined, rememberMe);
            if (result.success) {
              setPassword("");
              setCode("");
              onClose();
            } else if (result.requires2FA) {
              setSecret(result.enrollmentSecret || "");
              setRecovery(result.recoveryCodes || []);
              setStep("verify");
            } else setError(result.message || "Sign-in failed.");
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Request failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="text-teal-400 font-bold">PawaVet · Puerto Rico</p>
        <h1 className="text-2xl font-bold">{view === "login" ? "Sign in to your clinic" : view === "request" ? "Reset your password" : "Choose a new password"}</h1>
        <p className="text-sm text-slate-400">
          {view === "login" ? (step === "password" ? "Use the account provisioned by your clinic administrator." : "Every account needs an authenticator code.") : view === "request" ? "Enter your account email to request a one-time link valid for 30 minutes." : "This link can be used only once and expires after 30 minutes."}
        </p>
        {view !== "reset" && step === "password" && <label className="block">
          Email
          <input
            aria-label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full mt-2 p-3 rounded-xl bg-slate-950 border border-slate-700"
          />
        </label>}
        {view === "login" && step === "password" && <label className="block">
          Password
          <input
            aria-label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full mt-2 p-3 rounded-xl bg-slate-950 border border-slate-700"
          />
        </label>}
        {view === "reset" && <label className="block">
          New password
          <input aria-label="New password" type="password" autoComplete="new-password" minLength={12} maxLength={256} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full mt-2 p-3 rounded-xl bg-slate-950 border border-slate-700" />
        </label>}
        {step === "verify" && (
          <div className="space-y-3">
            {secret && (
              <div className="text-sm space-y-2">
                <p>First sign-in: enter this setup key into Google Authenticator, Microsoft Authenticator or a compatible authenticator app:</p>
                <code data-testid="mfa-secret" className="block break-all p-3 bg-slate-950 rounded-xl select-all">{secret}</code>
                <p className="text-amber-200">Save your recovery codes privately before continuing. Each code works once and these are not shown again after setup.</p>
                <code data-testid="mfa-recovery" className="block whitespace-pre-wrap break-words p-3 bg-slate-950 rounded-xl select-all">{recovery.join("\n")}</code>
              </div>
            )}
            <label className="block">
              Verification code
              <input aria-label="Verification code" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} maxLength={40} className="block w-full mt-2 p-3 rounded-xl bg-slate-950 border border-slate-700" placeholder="6-digit app code or recovery code" />
            </label>
            <button type="button" className="text-sm text-teal-300 underline" onClick={() => { setStep("password"); setCode(""); setSecret(""); setRecovery([]); setError(""); }}>Use a different account</button>
          </div>
        )}
        {step === "password" && (
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input aria-label="Remember me for 30 days" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Recuérdame en este dispositivo durante 30 días
          </label>
        )}
        {error && (
          <p role="alert" className="text-rose-300">
            {error}
          </p>
        )}
        {message && <p role="status" className="text-teal-300">{message}</p>}
        <button
          disabled={busy}
          className="w-full p-3 rounded-xl bg-teal-600 font-bold disabled:opacity-50"
        >
          {busy ? "Working…" : view === "login" ? (step === "verify" ? "Verify and sign in" : "Sign in") : view === "request" ? "Email reset link" : "Update password"}
        </button>
        {view !== "reset" && step === "password" && <button type="button" className="block text-sm underline text-teal-300" onClick={() => { setError(""); setMessage(""); setView(view === "login" ? "request" : "login"); }}>{view === "login" ? "Forgot password?" : "Back to sign in"}</button>}
      </form>
    </main>
  );
}
