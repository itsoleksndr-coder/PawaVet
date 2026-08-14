import React from "react";
import { LayoutDashboard, Dog, FileText, Calendar, BellRing, User, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface MobileNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, setCurrentTab, onOpenAI }) => {
  const { isPetOwner } = useAuth();

  if (isPetOwner) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2 flex items-center justify-around text-slate-400">
        <button
          onClick={() => setCurrentTab("owner_portal")}
          className={`flex flex-col items-center space-y-1 ${
            currentTab === "owner_portal" ? "text-emerald-400 font-bold" : "hover:text-slate-200"
          }`}
        >
          <Dog className="w-5 h-5" />
          <span className="text-[10px]">My Pets</span>
        </button>
        <button
          onClick={() => setCurrentTab("appointments")}
          className={`flex flex-col items-center space-y-1 ${
            currentTab === "appointments" ? "text-emerald-400 font-bold" : "hover:text-slate-200"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Visits</span>
        </button>
        <button
          onClick={() => setCurrentTab("communication")}
          className={`flex flex-col items-center space-y-1 ${
            currentTab === "communication" ? "text-emerald-400 font-bold" : "hover:text-slate-200"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">Chat</span>
        </button>
      </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around text-slate-400">
      <button
        onClick={() => setCurrentTab("dashboard")}
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
          currentTab === "dashboard" ? "text-emerald-400 font-bold" : "hover:text-slate-200"
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Overview</span>
      </button>

      <button
        onClick={() => setCurrentTab("pets")}
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
          currentTab === "pets" ? "text-emerald-400 font-bold" : "hover:text-slate-200"
        }`}
      >
        <Dog className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Patients</span>
      </button>

      <button
        onClick={() => setCurrentTab("appointments")}
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
          currentTab === "appointments" ? "text-emerald-400 font-bold" : "hover:text-slate-200"
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Calendar</span>
      </button>

      <button
        onClick={() => setCurrentTab("reminders")}
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
          currentTab === "reminders" ? "text-emerald-400 font-bold" : "hover:text-slate-200"
        }`}
      >
        <BellRing className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Reminders</span>
      </button>

      <button
        onClick={onOpenAI}
        className="flex flex-col items-center py-1 px-2 rounded-lg text-emerald-400 font-semibold"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-[10px] mt-0.5">AI</span>
      </button>
    </nav>
  );
};
