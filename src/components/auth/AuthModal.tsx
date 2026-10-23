import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
export function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState<"password" | "verify">("password");
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [recovery, setRecovery] = useState<string[]>([]);
  if (!isOpen) return null;
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <form
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-8 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
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
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="text-teal-400 font-bold">PawaVet · Puerto Rico</p>
        <h1 className="text-2xl font-bold">Sign in to your clinic</h1>
        <p className="text-sm text-slate-400">
          {step === "password" ? "Use the account provisioned by your clinic administrator." : "Every account needs an authenticator code."}
        </p>
        {step === "password" && <label className="block">
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
        {step === "password" && <label className="block">
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
        <button
          disabled={busy}
          className="w-full p-3 rounded-xl bg-teal-600 font-bold disabled:opacity-50"
        >
          {busy ? "Checking…" : step === "verify" ? "Verify and sign in" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
