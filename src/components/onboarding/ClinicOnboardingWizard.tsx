import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n/I18nContext";
import {
  X,
  Check,
  Building2,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  Palette,
  Clock,
  BellRing,
  CreditCard,
  Rocket,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ClinicOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ClinicOnboardingWizard: React.FC<ClinicOnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { registerClinic } = useAuth();
  const { t } = useI18n();

  const [step, setStep] = useState(1);
  const totalSteps = 10;

  // Form State
  const [clinicName, setClinicName] = useState("Golden Gate Veterinary Hospital");
  const [tagline, setTagline] = useState("Compassionate Clinical Excellence");
  const [address, setAddress] = useState("450 Sutter St, Suite 800");
  const [city, setCity] = useState("San Francisco");
  const [stateCode, setStateCode] = useState("CA");
  const [zipCode, setZipCode] = useState("94108");
  const [phone, setPhone] = useState("(415) 555-8920");
  const [emergencyPhone, setEmergencyPhone] = useState("(415) 555-8929");
  const [email, setEmail] = useState("contact@goldengatevet.com");
  const [adminName, setAdminName] = useState("Dr. Jordan Sterling, DVM");
  const [adminEmail, setAdminEmail] = useState("dr.sterling@goldengatevet.com");
  const [licenseNumber, setLicenseNumber] = useState("CA-VET-98421");
  const [brandColor, setBrandColor] = useState("#059669");
  const [hoursOpen, setHoursOpen] = useState("08:00");
  const [hoursClose, setHoursClose] = useState("18:00");
  const [enableEmergencySlots, setEnableEmergencySlots] = useState(true);
  const [channelSMS, setChannelSMS] = useState(true);
  const [channelWhatsApp, setChannelWhatsApp] = useState(true);
  const [channelEmail, setChannelEmail] = useState(true);
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("982");
  const [billingPlan, setBillingPlan] = useState("pawfect_core_250");

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete and launch
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.5 },
      });

      registerClinic(
        {
          name: clinicName,
          address: `${address}, ${city}, ${stateCode} ${zipCode}`,
          phone,
          emergencyPhone,
          email,
          brandColor,
          businessHours: {
            monday: `${hoursOpen} - ${hoursClose}`,
            tuesday: `${hoursOpen} - ${hoursClose}`,
            wednesday: `${hoursOpen} - ${hoursClose}`,
            thursday: `${hoursOpen} - ${hoursClose}`,
            friday: `${hoursOpen} - ${hoursClose}`,
            saturday: "09:00 - 14:00",
            sunday: "Emergency on call",
          },
          subscription: {
            plan: "Pro Practice",
            status: "active",
            monthlyPrice: 250,
            currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
            paymentMethod: "Visa ending in 4242",
          },
        },
        {
          name: adminName,
          email: adminEmail,
          licenseNumber,
          phone,
          title: "Medical Director & Practice Owner",
        }
      );

      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepTitles = [
    "Clinic Identity",
    "Physical Location",
    "Contact & Hotlines",
    "Clinic Email",
    "Veterinarian in Charge",
    "Brand & Theme",
    "Operating Hours",
    "Reminders Channels",
    "Subscription Setup ($250/mo)",
    "Review & Launch",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Step {step} of {totalSteps}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-medium">{stepTitles[step - 1]}</span>
              </div>
              <h3 className="font-extrabold text-base text-white">Clinic Onboarding Wizard</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">
                Welcome! Let's set up your clinic's public practice profile:
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Clinic Name *</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Oakridge Animal Hospital"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Practice Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Caring for your pets like family"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Address */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">Where is your clinic located?</div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Street Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">State *</label>
                  <input
                    type="text"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">ZIP Code *</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Phone & Emergency */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">Telephone & Emergency Hotlines</div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Primary Reception Phone *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">After-Hours / Emergency Hotline</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">This will be highlighted in the Pet Owner Portal for urgent situations.</p>
              </div>
            </div>
          )}

          {/* STEP 4: Email & Domain */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">Practice Contact Email</div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">General Clinic Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Veterinarian in charge */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">Chief Medical Officer / Lead DVM</div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Lead Veterinarian Full Name *</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">DVM Email Login *</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Veterinary License Number *</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Brand & Theme */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">Clinic Branding & Accent Colors</div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Primary Clinic Accent Color</label>
                <div className="flex items-center space-x-3">
                  {[
                    { color: "#059669", name: "Emerald Clinical" },
                    { color: "#0d9488", name: "Teal Modern" },
                    { color: "#2563eb", name: "Royal Blue" },
                    { color: "#7c3aed", name: "Violet Tech" },
                    { color: "#e11d48", name: "Rose Care" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setBrandColor(c.color)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        brandColor === c.color ? "ring-4 ring-white/50 scale-110 shadow-lg" : "opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c.color }}
                    >
                      {brandColor === c.color && <Check className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Operating Hours */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">Practice Schedule & Emergency Slots</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Opens At</label>
                  <input
                    type="time"
                    value={hoursOpen}
                    onChange={(e) => setHoursOpen(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Closes At</label>
                  <input
                    type="time"
                    value={hoursClose}
                    onChange={(e) => setHoursClose(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Auto-reserve Emergency Same-Day Slots</div>
                  <div className="text-[11px] text-slate-400">Keep 2 slots reserved for urgent trauma/triage</div>
                </div>
                <input
                  type="checkbox"
                  checked={enableEmergencySlots}
                  onChange={(e) => setEnableEmergencySlots(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </div>
            </div>
          )}

          {/* STEP 8: Reminder Channels */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">Automated Reminder Dispatch Channels</div>
              <p className="text-xs text-slate-400">Choose which channels PawFect uses to automatically contact pet owners:</p>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <BellRing className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">SMS Text Messages</div>
                      <div className="text-[11px] text-slate-400">98% open rate within 5 minutes</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={channelSMS}
                    onChange={(e) => setChannelSMS(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-teal-400" />
                    <div>
                      <div className="text-xs font-bold text-white">WhatsApp Business Alerts</div>
                      <div className="text-[11px] text-slate-400">Instant rich confirmation cards</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={channelWhatsApp}
                    onChange={(e) => setChannelWhatsApp(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Detailed Email Bulletins</div>
                      <div className="text-[11px] text-slate-400">Includes PDF vaccination certificates</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={channelEmail}
                    onChange={(e) => setChannelEmail(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 9: Subscription */}
          {step === 9 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase">Flat Commercial Plan</div>
                  <div className="text-lg font-extrabold text-white">PawFect Practice OS</div>
                  <div className="text-xs text-slate-400">Includes all modules & unlimited staff accounts</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white">$250</div>
                  <div className="text-[10px] text-slate-400">per month / clinic</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Payment Details (Stripe Protected)</span>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Review & Launch */}
          {step === 10 && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Rocket className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">Ready to Launch {clinicName}!</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your practice database, automated reminder queue, and staff logins are configured.
              </p>

              <div className="p-4 rounded-2xl bg-slate-800 text-left text-xs space-y-2 max-w-md mx-auto border border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Practice:</span>
                  <span className="font-bold text-white">{clinicName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chief DVM:</span>
                  <span className="font-bold text-white">{adminName} ({licenseNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subscription:</span>
                  <span className="font-bold text-emerald-400">$250 / month (Active)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Channels:</span>
                  <span className="text-white">SMS, WhatsApp, Email Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 ${
              step === 1
                ? "opacity-30 cursor-not-allowed text-slate-500"
                : "text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Step {step} of 10</span>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-700/30 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>{step === 10 ? "Launch Clinic OS" : "Continue"}</span>
              {step === 10 ? <Sparkles className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
