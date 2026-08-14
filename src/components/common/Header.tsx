import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { TenantBadge } from "./TenantBadge";
import { RoleBadge } from "./RoleBadge";
import {
  PawPrint,
  Lock,
  Shield,
  ShieldCheck,
  Smartphone,
  LogOut,
  ChevronDown,
  User,
  Key,
  Laptop,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  onOpenRoleSwitcher: () => void;
  onOpen2FASetup: () => void;
  onOpenSessions: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRoleSwitcher,
  onOpen2FASetup,
  onOpenSessions,
  onOpenAuthModal,
}) => {
  const { currentUser, activeRole, lockSession, logout, isSuperAdmin, activeClinic } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Clinic Tenant */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 p-0.5 shadow-md shadow-teal-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="font-black text-sm tracking-tight text-white flex items-center space-x-1.5">
              <span>PawFect</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800">
                v2.5
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Veterinary Practice Suite</div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* Tenant Isolation Badge */}
        <TenantBadge />
      </div>

      {/* Right Controls: Role Badge, Fast Switcher, Lock, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Fast 1-Click Role Switcher Pill */}
        <button
          onClick={onOpenRoleSwitcher}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-xs text-slate-200 transition-all cursor-pointer shadow-sm group"
          title="Switch Active RBAC Role"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden md:inline font-medium">Role:</span>
          <RoleBadge role={activeRole} size="sm" />
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Inactivity Screen Lock Button */}
        {currentUser && (
          <button
            onClick={lockSession}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 text-slate-300 hover:text-amber-400 transition-all cursor-pointer"
            title="Lock screen for clinical privacy"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        {/* Profile / Account Dropdown */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 p-1 pl-2 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="text-right hidden xl:block">
                <div className="text-xs font-bold text-slate-200 truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {currentUser.title || currentUser.role}
                </div>
              </div>
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover border border-slate-700"
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-xs animate-in fade-in zoom-in-95">
                  <div className="p-3 border-b border-slate-800 bg-slate-950/60 rounded-xl mb-1">
                    <div className="font-bold text-white text-xs">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
                    <div className="mt-2">
                      <RoleBadge role={currentUser.role} size="sm" />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpen2FASetup();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                        <span>Two-Factor Auth</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {currentUser.isTwoFactorEnabled ? "Active" : "Off"}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenSessions();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 flex items-center space-x-2 transition-colors"
                    >
                      <Laptop className="w-3.5 h-3.5 text-blue-400" />
                      <span>Active Sessions</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        lockSession();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 flex items-center space-x-2 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lock Screen Now</span>
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-950 text-rose-300 flex items-center space-x-2 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
