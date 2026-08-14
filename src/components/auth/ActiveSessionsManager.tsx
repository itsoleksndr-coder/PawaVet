import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export const ActiveSessionsManager: React.FC = () => {
  const {
    sessions,
    revokeSession,
    revokeAllOtherSessions,
    currentUser,
  } = useAuth();

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes("iphone") || d.includes("mobile") || d.includes("android")) {
      return <Smartphone className="w-5 h-5 text-teal-400" />;
    }
    if (d.includes("ipad") || d.includes("tablet")) {
      return <Tablet className="w-5 h-5 text-blue-400" />;
    }
    return <Laptop className="w-5 h-5 text-amber-400" />;
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950 px-2.5 py-0.5 rounded-full border border-teal-800">
              Active Security Sessions
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {sessions.length} Active {sessions.length === 1 ? "Session" : "Sessions"}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Logged-in Devices & Access Tokens</h3>
          <p className="text-xs text-slate-400">
            Real-time multi-device authentication ledger. Revoke unrecognized connections immediately.
          </p>
        </div>

        {otherSessionsCount > 0 && (
          <button
            onClick={revokeAllOtherSessions}
            className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs font-bold transition-all flex items-center space-x-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Revoke {otherSessionsCount} Other {otherSessionsCount === 1 ? "Session" : "Sessions"}</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              sess.isCurrent
                ? "bg-slate-950/80 border-teal-500/40 shadow-sm"
                : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 mt-0.5">
                {getDeviceIcon(sess.device)}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-white">{sess.device}</h4>
                  {sess.isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Current Device</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span>{sess.browser}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-300">IP: {sess.ipAddress}</span>
                  <span>•</span>
                  <span>{sess.location}</span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-1 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Last active: {new Date(sess.lastActiveAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:self-center">
              {!sess.isCurrent ? (
                <button
                  onClick={() => revokeSession(sess.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke Access</span>
                </button>
              ) : (
                <span className="text-xs font-medium text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-900/50">
                  Protected Session
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
