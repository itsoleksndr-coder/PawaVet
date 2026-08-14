import React, { useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import {
  Sparkles,
  CheckCircle,
  Calendar,
  BellRing,
  FileText,
  Shield,
  Video,
  BarChart3,
  Heart,
  ArrowRight,
  ChevronDown,
  Building2,
  Clock,
  MessageSquare,
  Lock,
  Stethoscope,
  Dog,
  Check,
  Zap,
  Users,
  AlertTriangle,
} from "lucide-react";

interface LandingPageProps {
  onStartClinic: () => void;
  onBookDemo: () => void;
  onLaunchLiveDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartClinic,
  onBookDemo,
  onLaunchLiveDemo,
}) => {
  const { t, language } = useI18n();
  const [activePreviewTab, setActivePreviewTab] = useState<"records" | "appointments" | "reminders" | "portal">("records");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: language === "es" ? "¿Cuánto cuesta la suscripción de PawFect?" : "How much does PawFect cost for a clinic?",
      a: language === "es"
        ? "PawFect cuesta $250 / mes por clínica con una tarifa plana predecible. Incluye pacientes ilimitados, todas las funciones de historias clínicas, agenda, recordatorios automáticos y cuentas para todo su personal sin costos ocultos por usuario."
        : "PawFect is $250 / month per clinic on a flat, transparent subscription. It includes unlimited patient profiles, full electronic medical records (EMR), smart calendar scheduling, automated multi-channel reminders, and unlimited staff accounts (vets, technicians, receptionists).",
    },
    {
      q: language === "es" ? "¿Cómo funcionan los recordatorios automáticos?" : "How do the automated reminders work?",
      a: language === "es"
        ? "El motor inteligente de PawFect detecta automáticamente vacunas por vencer, tratamientos pendientes o citas programadas, y despacha notificaciones personalizadas por SMS, WhatsApp o Correo electrónico con enlaces directos para que los tutores confirmen o soliciten cita."
        : "PawFect's intelligent engine tracks due dates for vaccinations, medication refills, and appointments. It automatically delivers customized messages via SMS, WhatsApp, and Email with 1-tap booking links, lifting clinic appointment compliance by 42%.",
    },
    {
      q: language === "es" ? "¿Qué tan seguro es el acceso y aislamiento de datos?" : "How secure is patient data and clinic isolation?",
      a: language === "es"
        ? "Cada clínica cuenta con un identificador único y aislamiento estricto de base de datos. Los permisos basados en roles (Admin, Veterinario, Auxiliar, Recepción, Tutor) garantizan que las notas clínicas internas nunca sean visibles para los tutores y que cada usuario acceda solo a lo que le corresponde."
        : "Every clinic has isolated tenant boundaries and strict role-based access control (Admin, Vet, Tech, Receptionist, Pet Owner). Private clinical staff notes are mathematically shielded from pet parents, and comprehensive audit logs track all record access.",
    },
    {
      q: language === "es" ? "¿Ofrecen migración de datos desde nuestro software anterior?" : "Can we migrate data from our existing veterinary software?",
      a: language === "es"
        ? "Sí. Nuestro equipo de soporte realiza la importación asistida de pacientes, historiales y tutores desde sistemas como Cornerstone, AVImark, eVetPractice o archivos CSV/Excel sin costo adicional."
        : "Yes. Our veterinary solutions team assists with seamless data migration from legacy platforms (Cornerstone, AVImark, eVetPractice, IDEXX, or CSV exports) during your onboarding process.",
    },
    {
      q: language === "es" ? "¿PawFect AI reemplaza las decisiones médicas veterinarias?" : "Does PawFect AI make medical diagnoses?",
      a: language === "es"
        ? "No. PawFect AI es estrictamente un asistente administrativo y de comunicación. Ayuda al equipo a redactar resúmenes claros para los clientes, preparar fichas previas de consulta y generar instrucciones de alta, manteniendo siempre al médico veterinario colegiado como único responsable clínico."
        : "No. PawFect AI is strictly an administrative and communication assistant. It synthesizes client-friendly discharge summaries, briefs veterinarians on patient history, and drafts reminders, while never making clinical diagnoses or substituting for licensed veterinary judgment.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-600/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-teal-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top SaaS Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-6 shadow-sm shadow-emerald-950">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.heroPriceBadge}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{t.heroNoContracts}</span>
            </div>

            {/* Main Brand & Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-sans">
              PAW<span className="text-emerald-400">FECT</span>
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-200 mt-3">
                {t.brandTagline}
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                id="hero-start-clinic-btn"
                onClick={onStartClinic}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-700/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                <span>{t.startClinicCTA}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                id="hero-book-demo-btn"
                onClick={onBookDemo}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 font-bold text-base transition-all hover:border-slate-600 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{t.bookDemoCTA}</span>
              </button>

              <button
                id="hero-live-demo-btn"
                onClick={onLaunchLiveDemo}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-base transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{t.heroLiveDemoBtn}</span>
              </button>
            </div>

            {/* Trust highlights */}
            <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{t.heroEasyOnboarding}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{t.heroModernTech}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>HIPAA & Veterinary RBAC Isolation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 & 3. PROBLEM & SOLUTION SECTION */}
      <section className="py-16 sm:py-24 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* The Problem */}
            <div className="p-8 rounded-3xl bg-slate-950/80 border border-rose-900/30 relative">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-rose-950/80 text-rose-300 text-xs font-bold mb-4 border border-rose-800/40">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>The Legacy Software Challenge</span>
              </div>
              <h3 className="text-2xl font-bold text-white leading-snug">
                {t.problemTitle}
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                {t.problemDesc}
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-start space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>Manual phone calls waste 3.5 hours of receptionist time daily.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>Over 35% of critical pet vaccinations fall overdue unnoticed.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>Disjointed billing and paper records cause delayed patient discharges.</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-3xl bg-slate-950/80 border border-emerald-800/40 relative">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 text-xs font-bold mb-4 border border-emerald-800/40">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>The PawFect Advantage</span>
              </div>
              <h3 className="text-2xl font-bold text-white leading-snug">
                {t.solutionTitle}
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                {t.solutionDesc}
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Automated multi-channel reminders (SMS, WhatsApp, Email) boost compliance by 42%.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Fast SOAP charting, vitals recording, and instant prescription generation.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Dedicated Pet Owner Portal with 24/7 access to vaccine passports and invoices.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE PRODUCT PREVIEWS SHOWCASE */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed for veterinary teams who love simplicity.
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Click through our core modules below to preview how PawFect elevates everyday clinic workflows.
          </p>

          {/* Tab Selector */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActivePreviewTab("records")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === "records"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Electronic Medical Records
            </button>
            <button
              onClick={() => setActivePreviewTab("appointments")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === "appointments"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Calendar & Schedule
            </button>
            <button
              onClick={() => setActivePreviewTab("reminders")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === "reminders"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Automated Reminders
            </button>
            <button
              onClick={() => setActivePreviewTab("portal")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === "portal"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pet Owner Portal
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Preview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
          {activePreviewTab === "records" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">Patient Record: Max (Golden Retriever, 4.5 yrs)</h4>
                    <p className="text-xs text-slate-400">Chief Complaint: Right Ear Otitis Recheck • Attending: Dr. Emily Vance, DVM</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
                  SOAP Chart Complete
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Temperature</span>
                  <div className="text-xl font-bold text-white mt-1">38.6 °C</div>
                  <span className="text-[10px] text-emerald-400 font-medium">Normal Range (38.1-39.2)</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Heart Rate</span>
                  <div className="text-xl font-bold text-white mt-1">88 BPM</div>
                  <span className="text-[10px] text-emerald-400 font-medium">Strong, regular pulse</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Weight</span>
                  <div className="text-xl font-bold text-white mt-1">31.5 kg</div>
                  <span className="text-[10px] text-slate-400 font-medium">+0.2 kg since last visit</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Body Condition (BCS)</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">5 / 9</div>
                  <span className="text-[10px] text-emerald-400 font-medium">Ideal anatomical score</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p>
                  <strong className="text-white">Diagnosis:</strong> Unilateral right Otitis Externa (Malassezia yeast confirmed on in-house cytology).
                </p>
                <p>
                  <strong className="text-white">Prescribed Treatment:</strong> Claro Otic single-dose suspension administered in-clinic. Oral Bordetella booster given.
                </p>
              </div>
            </div>
          )}

          {activePreviewTab === "appointments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h4 className="font-bold text-lg text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <span>Today's Clinical Appointment Schedule (Friday)</span>
                </h4>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                  5 Patients Scheduled
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
                    <span>09:30 AM</span>
                    <span className="font-bold uppercase text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded">Checked-in</span>
                  </div>
                  <div className="font-bold text-white text-sm mt-1">Max (Golden Retriever)</div>
                  <div className="text-xs text-slate-400">Follow-up: Right Ear Otitis</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>11:00 AM</span>
                    <span className="text-[10px] text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">Confirmed</span>
                  </div>
                  <div className="font-bold text-white text-sm mt-1">Luna (Domestic Cat)</div>
                  <div className="text-xs text-slate-400">Vaccine: FVRCP Booster</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>02:00 PM</span>
                    <span className="text-[10px] text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">Scheduled</span>
                  </div>
                  <div className="font-bold text-white text-sm mt-1">Bella (French Bulldog)</div>
                  <div className="text-xs text-slate-400">Annual Wellness Exam</div>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === "reminders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h4 className="font-bold text-lg text-white flex items-center space-x-2">
                  <BellRing className="w-5 h-5 text-teal-400" />
                  <span>Automated Multi-Channel Dispatch Engine</span>
                </h4>
                <span className="text-xs text-teal-400 bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-800">
                  42% Compliance Lift
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>Live SMS Simulation to David Chen (Bella's Owner):</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono">
                  "Hi David! Bella is due for her annual Rabies and Bordetella booster. Please tap here to schedule her visit at PawFect: https://pawfect.app/book?pet=bella"
                </div>
                <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                  <span>✓ Sent at 09:00</span>
                  <span>✓ Delivered at 09:00:15</span>
                  <span className="text-emerald-400 font-semibold">✓ Appointment requested at 09:12:00</span>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === "portal" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h4 className="font-bold text-lg text-white flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <span>Pet Parent View: Maria Rodriguez (Max & Luna)</span>
                </h4>
                <span className="text-xs text-slate-400">24/7 Mobile Accessible</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Vaccination Passport</span>
                    <span className="text-xs text-emerald-400 font-semibold">Up to date</span>
                  </div>
                  <p className="text-xs text-slate-400">Bordetella valid until Aug 2027 • Rabies valid until 2028</p>
                  <button className="text-xs text-emerald-400 hover:underline font-semibold">Download Certificate PDF →</button>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Direct Clinic Chat</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <p className="text-xs text-slate-400">Dr. Vance responded: "Ear looks great, continue keeping dry..."</p>
                  <button className="text-xs text-teal-400 hover:underline font-semibold">Open Conversation →</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5 - 13. CORE FEATURES BENTO GRID */}
      <section className="py-16 sm:py-24 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {t.featuresTitle}
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Reminders */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.featureRemindersTitle}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.featureRemindersDesc}</p>
            </div>

            {/* Feature 2: Records */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-950 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.featureRecordsTitle}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.featureRecordsDesc}</p>
            </div>

            {/* Feature 3: Appointments */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.featureAppointmentsTitle}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.featureAppointmentsDesc}</p>
            </div>

            {/* Feature 4: Pet Owner Portal */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-950 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.featurePortalTitle}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.featurePortalDesc}</p>
            </div>

            {/* Feature 5: AI Assistant */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-950 to-teal-950 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.featureAITitle}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.featureAIDesc}</p>
            </div>

            {/* Feature 6: Telemedicine */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.featureTelemedTitle}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.featureTelemedDesc}</p>
            </div>

            {/* Feature 7: Analytics */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.featureAnalyticsTitle}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.featureAnalyticsDesc}</p>
            </div>

            {/* Feature 8: Security & Roles */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.featureSecurityTitle}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.featureSecurityDesc}</p>
            </div>

            {/* Feature 9: Fast Cloud */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Cloud Sync & Backups</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Real-time multi-device synchronization so receptionists, vet technicians, and doctors never step on each other's notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 14. PRICING SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Commercial SaaS Subscription</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            {t.pricingTitle}
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            {t.pricingSubtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
            Most Popular
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-8 border-b border-slate-800">
            <div>
              <h3 className="text-2xl font-extrabold text-white">PawFect Clinic Operating System</h3>
              <p className="text-xs text-slate-400 mt-1">Everything your practice needs to operate without friction.</p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <span className="text-5xl font-extrabold text-white font-sans">{t.pricingAmount}</span>
              <span className="text-slate-400 text-sm font-medium">{t.pricingPerMonth}</span>
            </div>
          </div>

          <div className="py-8">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              {t.pricingIncludesTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-200">
              {[
                t.pricingItem1,
                t.pricingItem2,
                t.pricingItem3,
                t.pricingItem4,
                t.pricingItem5,
                t.pricingItem6,
                t.pricingItem7,
                t.pricingItem8,
                t.pricingItem9,
                t.pricingItem10,
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onStartClinic}
              className="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-700/40 transition-all hover:scale-[1.01] text-center cursor-pointer"
            >
              {t.startClinicCTA} ($250/mo)
            </button>
            <button
              onClick={onBookDemo}
              className="py-4 px-6 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-2xl font-bold text-sm text-center transition-all cursor-pointer"
            >
              {t.bookDemoCTA}
            </button>
          </div>
        </div>
      </section>

      {/* 15. FAQ ACCORDION */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white">{t.faqTitle}</h2>
          <p className="text-xs text-slate-400 mt-2">Clear answers to common questions about clinic migration and compliance.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-slate-100 hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 16. CALL TO ACTION BANNER */}
      <section className="py-16 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t.ctaBannerTitle}
          </h2>
          <p className="text-slate-300 text-sm mt-3 max-w-xl mx-auto">
            {t.ctaBannerSubtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartClinic}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-700/40 transition-all cursor-pointer"
            >
              {t.startClinicCTA}
            </button>
            <button
              onClick={onLaunchLiveDemo}
              className="w-full sm:w-auto px-7 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-2xl font-bold text-sm cursor-pointer"
            >
              Explore Live Demo Clinic
            </button>
          </div>
        </div>
      </section>

      {/* 17. FOOTER */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-base">PAWFECT</span>
            <span className="text-slate-400">•</span>
            <span>Better Care. Happier Pets.</span>
          </div>
          <div className="text-center sm:text-right space-y-1">
            <p>© {new Date().getFullYear()} PawFect Inc. All rights reserved.</p>
            <p className="text-slate-400 text-[11px]">
              Commercial SaaS for Veterinary Practices • $250 / mo flat
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
