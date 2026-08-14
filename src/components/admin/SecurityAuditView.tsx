import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuditLogEntry, AuditSeverity, AuditActionType } from "../../types";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Key,
  FileText,
  AlertTriangle,
  Info,
  Clock,
  ChevronDown,
  Building2,
  Lock,
  Code,
} from "lucide-react";

export const SecurityAuditView: React.FC = () => {
  const { auditLogs, isSuperAdmin, activeClinic, recordAuditLog } = useAuth();

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionCategory, setActionCategory] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Filtered audit logs respecting multi-tenant boundaries (Super Admin sees all or clinic; Clinic Admin sees clinic logs)
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Clinic isolation check
      if (!isSuperAdmin && activeClinic && log.clinicId && log.clinicId !== activeClinic.id) {
        return false;
      }

      // Severity filter
      if (severityFilter !== "all" && log.severity !== severityFilter) {
        return false;
      }

      // Action category filter
      if (actionCategory !== "all") {
        if (actionCategory === "auth" && !log.action.startsWith("AUTH_")) return false;
        if (actionCategory === "rbac" && !log.action.startsWith("RBAC_") && !log.action.startsWith("STAFF_")) return false;
        if (actionCategory === "records" && !log.action.startsWith("RECORD_")) return false;
        if (actionCategory === "appointments" && !log.action.startsWith("APPOINTMENT_")) return false;
        if (actionCategory === "billing" && !log.action.startsWith("INVOICE_")) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          log.actorName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.targetResource.toLowerCase().includes(q) ||
          log.ipAddress.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [auditLogs, isSuperAdmin, activeClinic, severityFilter, actionCategory, search]);

  const handleExport = (format: "json" | "csv") => {
    let content = "";
    let mimeType = "text/plain";
    let fileName = `pawfect-audit-logs-${Date.now()}`;

    if (format === "json") {
      content = JSON.stringify(filteredLogs, null, 2);
      mimeType = "application/json";
      fileName += ".json";
    } else {
      const headers = "ID,Timestamp,Severity,Action,Actor,Role,Clinic,Resource,IP,Details\n";
      const rows = filteredLogs
        .map(
          (l) =>
            `"${l.id}","${l.timestamp}","${l.severity}","${l.action}","${l.actorName}","${l.actorRole}","${l.clinicName || ""}","${l.targetResource}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
        )
        .join("\n");
      content = headers + rows;
      mimeType = "text/csv";
      fileName += ".csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    recordAuditLog({
      action: "RECORD_EXPORTED",
      severity: "warning",
      targetResource: "Audit Trail Database",
      details: `Security audit logs exported in ${format.toUpperCase()} format (${filteredLogs.length} entries).`,
    });
  };

  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case "critical":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
            <AlertTriangle className="w-3 h-3" />
            <span>CRITICAL</span>
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            <span>WARNING</span>
          </span>
        );
      case "info":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
            <Info className="w-3 h-3" />
            <span>INFO</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/60 uppercase font-mono">
              Immutable Ledger
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredLogs.length} Logged {filteredLogs.length === 1 ? "Event" : "Events"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Security & Access Audit Trail</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Cryptographically sealed audit records for authentication, prescription signing, RBAC role mutations, and data access.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport("csv")}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport("json")}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/30 flex items-center space-x-1.5 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor name, event action, IP address, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 flex-1 md:flex-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">Info Logs Only</option>
          </select>

          <select
            value={actionCategory}
            onChange={(e) => setActionCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 flex-1 md:flex-none"
          >
            <option value="all">All Action Types</option>
            <option value="auth">Authentication & 2FA</option>
            <option value="rbac">RBAC & Staff Changes</option>
            <option value="records">Clinical & Prescriptions</option>
            <option value="appointments">Appointments</option>
            <option value="billing">Invoices & Payments</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-4">Timestamp & Severity</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Actor & Role</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">IP & Clinic</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  <td className="p-4 whitespace-nowrap">
                    <div className="font-mono text-slate-200 font-bold">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toISOString().split("T")[0]}
                    </div>
                    <div className="mt-1">{getSeverityBadge(log.severity)}</div>
                  </td>

                  <td className="p-4">
                    <span className="font-mono font-bold text-xs text-teal-300 bg-teal-950/80 px-2 py-1 rounded border border-teal-800/60">
                      {log.action}
                    </span>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <div className="font-bold text-white group-hover:text-teal-300">
                      {log.actorName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Role: <strong className="text-slate-300">{log.actorRole}</strong>
                    </div>
                  </td>

                  <td className="p-4 max-w-xs">
                    <div className="font-medium text-slate-200 truncate">{log.targetResource}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{log.details}</div>
                  </td>

                  <td className="p-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    <div>{log.ipAddress}</div>
                    <div className="text-slate-500 text-[10px] truncate max-w-[140px]">
                      {log.clinicName || "Global"}
                    </div>
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold text-[11px]"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <ShieldCheck className="w-12 h-12 mx-auto text-slate-700 mb-2" />
            <p className="text-sm font-semibold">No audit logs found matching your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                {getSeverityBadge(selectedLog.severity)}
                <h3 className="font-bold text-sm text-white font-mono">{selectedLog.action}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">TIMESTAMP</span>
                  <span className="text-slate-200">{new Date(selectedLog.timestamp).toUTCString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ACTOR</span>
                  <span className="text-slate-200">{selectedLog.actorName} ({selectedLog.actorRole})</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">IP ADDRESS</span>
                  <span className="text-slate-200">{selectedLog.ipAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">CLINIC TENANT</span>
                  <span className="text-slate-200">{selectedLog.clinicName || "System Global"}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Target Resource</label>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  {selectedLog.targetResource}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Event Payload & Details</label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>

              {selectedLog.metadata && (
                <div>
                  <label className="block text-slate-400 font-bold mb-1 font-mono">Structured Metadata</label>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs"
              >
                Close Audit Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
