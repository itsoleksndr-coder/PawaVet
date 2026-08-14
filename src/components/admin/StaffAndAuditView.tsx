import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import {
  ShieldAlert,
  Users,
  Lock,
  UserCheck,
  CheckCircle,
  Plus,
  KeyRound,
  FileCheck,
} from "lucide-react";

export const StaffAndAuditView: React.FC = () => {
  const { currentClinic, mockUsers } = useAuth();
  const { auditLogs } = useData();

  const [activeSubTab, setActiveSubTab] = useState<"staff" | "audit">("staff");

  const clinicStaff = mockUsers.filter((u) => u.role !== "PET_OWNER");

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/60 uppercase">
              Clinic Administration & Compliance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Staff Roster & Immutable Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Role-Based Access Control (RBAC) permissions, staff licensing credentials, and medical compliance audit trails.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1.5 w-fit">
        <button
          onClick={() => setActiveSubTab("staff")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
            activeSubTab === "staff" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory ({clinicStaff.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
            activeSubTab === "audit" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* STAFF DIRECTORY */}
      {activeSubTab === "staff" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Authorized Medical & Administrative Team</h3>
              <p className="text-xs text-slate-400">Strictly enforced role permissions per user</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinicStaff.map((staff) => (
              <div
                key={staff.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={staff.avatarUrl}
                    alt={staff.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-purple-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">{staff.name}</h4>
                    <p className="text-xs text-slate-400">{staff.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                        {staff.role}
                      </span>
                      {staff.licenseNumber && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          License: {staff.licenseNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                  <UserCheck className="w-4 h-4" />
                  <span>Active</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT TRAIL LOGS */}
      {activeSubTab === "audit" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Immutable Healthcare Audit Trail</h3>
              <p className="text-xs text-slate-400">
                Tamper-evident logs of all patient chart edits, prescription dispensing, and staff activity
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-800">
              Audit Encryption: Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / Staff</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity Affected</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">{log.timestamp.replace("T", " ").slice(0, 19)}</td>
                    <td className="p-3 font-bold text-white">{log.actorName}</td>
                    <td className="p-3 text-purple-400 font-semibold">{log.action}</td>
                    <td className="p-3 text-slate-300">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="p-3 text-slate-400">{JSON.stringify(log.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
