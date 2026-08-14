import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { Reminder, ReminderStatus } from "../../types";
import {
  BellRing,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mail,
  Phone,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Smartphone,
} from "lucide-react";

interface RemindersEngineProps {
  onOpenNewReminderModal: () => void;
  onSelectPet: (petId: string) => void;
}

export const RemindersEngine: React.FC<RemindersEngineProps> = ({
  onOpenNewReminderModal,
  onSelectPet,
}) => {
  const { reminders, triggerManualReminder, updateReminderStatus } = useData();
  const [filter, setFilter] = useState<string>("all");

  const filteredReminders = reminders.filter((r) => {
    if (filter === "all") return true;
    if (filter === "Scheduled") return r.status === "Scheduled";
    if (filter === "Delivered") return r.status === "Delivered" || r.status === "Opened";
    if (filter === "Booked") return r.status === "Appointment requested";
    return true;
  });

  const totalDelivered = reminders.filter((r) => r.status === "Delivered" || r.status === "Opened" || r.status === "Appointment requested").length;
  const bookedCount = reminders.filter((r) => r.status === "Appointment requested").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/60 uppercase">
              Automated Reminders Engine
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Multi-Channel Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Automated Patient Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Boost patient compliance by 42% via automated SMS, WhatsApp, and Email triggers with 1-tap booking links.
          </p>
        </div>

        <button
          onClick={onOpenNewReminderModal}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-700/30 flex items-center space-x-1.5 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Reminder Rule</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total in Pipeline</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{reminders.length}</div>
          <p className="text-[11px] text-teal-400 mt-1">Vaccines, Wellness, Refills</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Rate</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">99.4%</div>
          <p className="text-[11px] text-slate-400 mt-1">SMS & WhatsApp Gateway</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Conversion</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 mt-2">42%</div>
          <p className="text-[11px] text-slate-400 mt-1">Booked from reminder link</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Staff Time Saved</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-2">14.5 hrs</div>
          <p className="text-[11px] text-slate-400 mt-1">Replaces manual phone tag</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1.5 w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === "all" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          All Reminders ({reminders.length})
        </button>
        <button
          onClick={() => setFilter("Scheduled")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === "Scheduled" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Scheduled Queue
        </button>
        <button
          onClick={() => setFilter("Delivered")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === "Delivered" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Delivered & Opened
        </button>
        <button
          onClick={() => setFilter("Booked")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === "Booked" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Appointments Booked
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.map((rem) => (
          <div
            key={rem.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-teal-400 flex-shrink-0">
                {rem.deliveryMethod === "SMS" && <Smartphone className="w-5 h-5" />}
                {rem.deliveryMethod === "WhatsApp" && <Phone className="w-5 h-5 text-emerald-400" />}
                {rem.deliveryMethod === "Email" && <Mail className="w-5 h-5 text-blue-400" />}
                {rem.deliveryMethod === "Push" && <BellRing className="w-5 h-5 text-purple-400" />}
              </div>

              <div>
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => onSelectPet(rem.petId)}
                    className="font-bold text-base text-white hover:text-teal-300 text-left"
                  >
                    {rem.petName}
                  </button>
                  <span className="text-xs text-slate-400">• {rem.ownerName} ({rem.ownerPhone})</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-semibold">
                    {rem.deliveryMethod}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      rem.status === "Delivered" || rem.status === "Opened"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : rem.status === "Appointment requested"
                        ? "bg-purple-950 text-purple-300 border-purple-800"
                        : "bg-blue-950 text-blue-300 border-blue-800"
                    }`}
                  >
                    {rem.status}
                  </span>
                </div>

                <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
                  "{rem.messageContent}"
                </div>

                <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-1.5">
                  <span>Type: <strong className="text-slate-300">{rem.type}</strong></span>
                  <span>•</span>
                  <span>Due Target: <strong className="text-slate-300">{rem.dueDate}</strong></span>
                  {rem.sentAt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400">Dispatched: {rem.sentAt.split("T")[0]}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 self-end md:self-center">
              {rem.status === "Scheduled" && (
                <button
                  onClick={() => triggerManualReminder(rem.id)}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Now</span>
                </button>
              )}

              {rem.status === "Delivered" && (
                <button
                  onClick={() => updateReminderStatus(rem.id, "Appointment requested")}
                  className="px-3 py-1.5 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 text-xs font-semibold"
                >
                  Simulate Client Booking
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
