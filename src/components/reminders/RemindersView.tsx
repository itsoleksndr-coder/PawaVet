import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import {
  Bell,
  Calendar,
  Mail,
  Smartphone,
  CheckCircle2,
  Send,
  Plus,
  PawPrint,
  Clock,
} from "lucide-react";

export const RemindersView: React.FC = () => {
  const { isPetOwner, activeClinic } = useAuth();
  const { reminders } = useData();

  const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({});

  const handleSendReminder = (id: string) => {
    setSentReminders((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/60 font-mono uppercase">
              Preventative Care & Recalls
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">{reminders.length} Active Recalls</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Vaccine & Health Reminder Engine</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Automated multi-channel notifications for core vaccinations, parasitic control, and annual exams.
          </p>
        </div>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.map((rem) => {
          const isSent = sentReminders[rem.id];
          return (
            <div
              key={rem.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-sm">{rem.petName}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                    {rem.type}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-200">{rem.title}</h4>

                <div className="text-xs text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Due Date:</span>
                    <span className="font-mono text-amber-400 font-bold">{rem.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Channel:</span>
                    <span className="text-slate-300 font-medium">{rem.channel}</span>
                  </div>
                </div>
              </div>

              {!isPetOwner ? (
                <button
                  onClick={() => handleSendReminder(rem.id)}
                  disabled={isSent}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    isSent
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-teal-600 hover:bg-teal-500 text-white shadow-sm cursor-pointer"
                  }`}
                >
                  {isSent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sent to Pet Parent</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Recall Alert</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-[11px] text-teal-400 font-semibold text-center bg-teal-950/40 p-2 rounded-xl border border-teal-800/40">
                  Reminder active on your calendar
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
