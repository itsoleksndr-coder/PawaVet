import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  X,
  Smartphone,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, toggle2FA } = useAuth();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const demoSecret = "JBSWY3DPEHPK3PXP";

  const handleCopy = () => {
    navigator.clipboard.writeText(demoSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.trim().length !== 6) {
      setError("Please enter a valid 6-digit code from your authenticator app.");
      return;
    }

    await toggle2FA(true, demoSecret);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleDisable = async () => {
    await toggle2FA(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Two-Factor Authentication (2FA)</h3>
              <p className="text-[11px] text-slate-400">TOTP Authenticator Protection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser.isTwoFactorEnabled ? (
          /* Already enabled - option to disable or re-key */
          <div className="space-y-4 text-xs text-center py-2">
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-sm">2FA is Currently Active</p>
              <p className="text-xs text-slate-300 mt-1">
                Your account is protected by hardware/software Time-based One-Time Passwords (TOTP).
              </p>
            </div>

            <button
              onClick={handleDisable}
              className="w-full py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold transition-all"
            >
              Disable Two-Factor Authentication
            </button>
          </div>
        ) : (
          /* Setup Flow */
          <div className="space-y-4 text-xs">
            {success ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-center text-emerald-200">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-sm">2FA Enabled Successfully!</p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Your session security has been upgraded to two-factor verification.
                </p>
              </div>
            ) : (
              <>
                <p className="text-slate-300">
                  Scan this QR code with Google Authenticator, Authy, or 1Password to bind your account:
                </p>

                {/* Mock QR Canvas */}
                <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center max-w-[200px] mx-auto shadow-lg">
                  {/* Visual SVG QR representation */}
                  <div className="grid grid-cols-6 gap-1 p-2 bg-black rounded-lg">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-xs ${
                          (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                            ? "bg-white"
                            : "bg-black"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-900 font-mono font-bold mt-2">
                    PawFect ({currentUser.email})
                  </span>
                </div>

                {/* Secret key fallback */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Manual Setup Key</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={demoSecret}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-center select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400"
                      title="Copy Key"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Verification test code */}
                <form onSubmit={handleEnable} className="space-y-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Verify with 6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-base tracking-widest font-mono text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={code.length < 6}
                      className="w-2/3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold transition-all shadow-md"
                    >
                      Verify & Activate 2FA
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
