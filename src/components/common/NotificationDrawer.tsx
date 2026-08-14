import React from "react";
import { useData } from "../../context/DataContext";
import { X, CheckCheck, Bell, AlertTriangle, Calendar, CreditCard, MessageSquare, ExternalLink } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();

  if (!isOpen) return null;

  const getIcon = (type: string, urgency: string) => {
    if (urgency === "critical" || type === "emergency_request") {
      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
    if (type === "new_appointment") {
      return <Calendar className="w-5 h-5 text-emerald-400" />;
    }
    if (type === "payment") {
      return <CreditCard className="w-5 h-5 text-indigo-400" />;
    }
    if (type === "new_message") {
      return <MessageSquare className="w-5 h-5 text-blue-400" />;
    }
    return <Bell className="w-5 h-5 text-teal-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">Notifications & Alerts</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-750"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Bell className="w-10 h-10 mx-auto text-slate-700 mb-2" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-slate-600 mt-1">No new clinical notifications.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.linkTab) {
                    onNavigateTab(notif.linkTab);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !notif.read
                    ? "bg-slate-800/90 border-emerald-500/40 shadow-sm"
                    : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 mt-0.5">
                    {getIcon(notif.type, notif.urgency)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold truncate ${
                          notif.urgency === "critical"
                            ? "text-rose-300"
                            : notif.read
                            ? "text-slate-300"
                            : "text-white"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono ml-2 flex-shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>
                    {notif.linkTab && (
                      <div className="mt-2 flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold hover:underline">
                        <span>View {notif.linkTab}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
          PawFect Practice Notification Gateway
        </div>
      </div>
    </div>
  );
};
