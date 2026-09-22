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
            const result = await login(email, password);
            if (result.success) onClose();
            else setError(result.message || "Sign-in failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="text-teal-400 font-bold">PawaVet · Puerto Rico</p>
        <h1 className="text-2xl font-bold">Sign in to your clinic</h1>
        <p className="text-sm text-slate-400">
          Use the account provisioned by your clinic administrator.
        </p>
        <label className="block">
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
        </label>
        <label className="block">
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
        </label>
        {error && (
          <p role="alert" className="text-rose-300">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full p-3 rounded-xl bg-teal-600 font-bold disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
