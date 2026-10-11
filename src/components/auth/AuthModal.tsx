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
    const token =
      new URLSearchParams(window.location.hash.slice(1)).get("reset") ||
      new URLSearchParams(window.location.search).get("reset") ||
      "";
    // Erase sensitive tokens from browser history as soon as the page starts.
    if (token) window.history.replaceState({}, "", window.location.pathname);
    return token;
  });
  const [view, setView] = useState<View>(resetToken ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const switchView = (next: View) => {
    setError("");
    setMessage("");
    setView(next);
  };
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
            if (view === "login") {
              const result = await login(email, password);
              if (result.success) onClose();
              else setError(result.message || "Sign-in failed.");
            } else if (view === "request") {
              await request("/api/auth/recovery/request", "POST", { email });
              setMessage("If the account exists, a reset link will arrive by email.");
            } else {
              await request("/api/auth/recovery/confirm", "POST", {
                token: resetToken,
                newPassword,
              });
              window.history.replaceState({}, "", window.location.pathname);
              setPassword("");
              setNewPassword("");
              setView("login");
              setMessage("Password reset. Sign in with your new password.");
            }
          } catch (e) {
            setError(e instanceof Error ? e.message : "Request failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="text-teal-400 font-bold">PawaVet · Puerto Rico</p>
        <h1 className="text-2xl font-bold">
          {view === "login"
            ? "Sign in to your clinic"
            : view === "request"
              ? "Reset your password"
              : "Choose a new password"}
        </h1>
        <p className="text-sm text-slate-400">
          {view === "login"
            ? "Use the account provisioned by your clinic administrator."
            : view === "request"
              ? "Enter your account email to request a one-time link valid for 30 minutes."
              : "This link can be used only once and expires after 30 minutes."}
        </p>
        {view !== "reset" && (
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
        )}
        {view === "login" && (
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
        )}
        {view === "reset" && (
          <label className="block">
            New password
            <input
              aria-label="New password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={256}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full mt-2 p-3 rounded-xl bg-slate-950 border border-slate-700"
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-rose-300">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-teal-300">
            {message}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full p-3 rounded-xl bg-teal-600 font-bold disabled:opacity-50"
        >
          {busy
            ? "Working…"
            : view === "login"
              ? "Sign in"
              : view === "request"
                ? "Email reset link"
                : "Update password"}
        </button>
        {view !== "reset" && (
          <button
            type="button"
            className="block text-sm underline text-teal-300"
            onClick={() => switchView(view === "login" ? "request" : "login")}
          >
            {view === "login" ? "Forgot password?" : "Back to sign in"}
          </button>
        )}
      </form>
    </main>
  );
}
