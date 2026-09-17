import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { login, authError } = useAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await login(email, password);
      if (result.success) onClose();
      else setError(result.message || "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-slate-900 p-8 rounded-3xl space-y-5 border border-slate-700"
      >
        <p className="text-teal-400 font-bold">PawaVet</p>
        <h1 className="text-2xl font-bold">Sign in to your clinic</h1>
        <p className="text-slate-400 text-sm">
          Use the account provided by your clinic administrator.
        </p>
        <label className="block">
          Email
          <input
            autoComplete="username"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full bg-slate-950 rounded-lg p-3 mt-2"
          />
        </label>
        <label className="block">
          Password
          <input
            autoComplete="current-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full bg-slate-950 rounded-lg p-3 mt-2"
          />
        </label>
        {(error || authError) && (
          <p role="alert" className="text-rose-300">
            {error || authError}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full bg-teal-600 p-3 rounded-lg disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-slate-400">
          Need access or password recovery? Contact your clinic administrator.
          Self-registration and email password recovery are not yet available.
        </p>
      </form>
    </div>
  );
};
