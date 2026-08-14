import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useI18n } from "../../i18n/I18nContext";
import { X, CheckCircle, Sparkles, Building, Mail, Phone, Users, Stethoscope } from "lucide-react";
import confetti from "canvas-confetti";

interface LeadDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDemoModal: React.FC<LeadDemoModalProps> = ({ isOpen, onClose }) => {
  const { addLead } = useData();
  const { t } = useI18n();

  const [clinicName, setClinicName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vetsCount, setVetsCount] = useState("2");
  const [patientsPerMonth, setPatientsPerMonth] = useState("250-500");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addLead({
        clinicName,
        contactName,
        email,
        phone,
        vetsCount: Number(vetsCount) || 1,
        patientsPerMonth,
        notes,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setClinicName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white font-sans">{t.demoModalTitle}</h3>
              <p className="text-xs text-slate-400">{t.demoModalSubtitle}</p>
            </div>
          </div>
          <button onClick={handleResetAndClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">Demo Scheduled Successfully!</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {t.demoSuccessMsg} We have reserved priority onboarding and sent a calendar invite to{" "}
                <span className="text-emerald-400 font-semibold">{email}</span>.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-700/30 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.fieldClinicName} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin Pet Health Center"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.fieldContactName} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jordan Reed"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.fieldEmail} *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. j.reed@austinpethealth.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.fieldPhone}</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.fieldVetsCount}
                  </label>
                  <select
                    value={vetsCount}
                    onChange={(e) => setVetsCount(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1">1 Veterinarian (Solo Practice)</option>
                    <option value="2">2 - 3 Veterinarians</option>
                    <option value="4">4 - 6 Veterinarians</option>
                    <option value="8">7+ Veterinarians / Hospital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.fieldPatientsPerMonth}
                  </label>
                  <select
                    value={patientsPerMonth}
                    onChange={(e) => setPatientsPerMonth(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="50-200">50 - 200 Patients</option>
                    <option value="200-500">200 - 500 Patients</option>
                    <option value="500-1000">500 - 1,000 Patients</option>
                    <option value="1000+">1,000+ Patients</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t.fieldNotes}
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your current software (Cornerstone, eVetPractice, Avimark...) or questions"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>Includes free patient data migration & 30-day risk-free trial.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-700/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <span>Scheduling...</span>
                ) : (
                  <>
                    <span>{t.demoSubmitBtn}</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
