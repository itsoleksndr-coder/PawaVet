import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { RoleBadge } from "../common/RoleBadge";
import { Lock, Unlock, ShieldAlert, KeyRound, Building2 } from "lucide-react";

export const LockScreenModal: React.FC = () => {
  const { isLocked, currentUser, activeClinic, unlockSession, logout } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!isLocked || !currentUser) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = unlockSession(pin);
    if (!success) {
      setError("Please enter at least 4 characters or your PIN to unlock.");
    } else {
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
        {/* Lock Icon and Clinic */}
        <div className="relative inline-block">
          <img
            src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
            alt={currentUser.name}
            className="w-24 h-24 rounded-full mx-auto border-4 border-slate-800 object-cover shadow-xl"
          />
          <div className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-slate-950 font-bold border-2 border-slate-900 shadow-lg">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <RoleBadge role={currentUser.role} size="sm" />
          </div>
          <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentUser.title || currentUser.email}</p>
          
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-teal-400 font-mono mt-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>{activeClinic?.name || "PawFect Practice"}</span>
          </div>
        </div>

        {/* Lock message */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Terminal Locked for Veterinary Compliance</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Patient health data and DEA controlled prescription charting are protected. Enter your password or PIN to resume.
          </p>
        </div>

        {/* Password / PIN input */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              autoFocus
              required
              placeholder="Enter PIN or Password (e.g. 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-center text-sm font-mono text-white focus:outline-none focus:border-teal-500 shadow-inner"
            />
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-all shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Session</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-semibold"
          >
            Switch User / Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
