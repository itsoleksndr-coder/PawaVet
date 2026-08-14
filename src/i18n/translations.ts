export type Language = "en" | "es";

export const translations = {
  en: {
    // Brand & Header
    brandName: "PawFect",
    brandTagline: "Better Care. Happier Pets.",
    operatingSystemSubtitle: "The operating system for modern veterinary practices.",
    startClinicCTA: "Start Your Clinic",
    bookDemoCTA: "Book a Demo",
    loginCTA: "Sign In",
    logoutCTA: "Sign Out",
    quickDemoSwitch: "Switch Demo Profile",
    currentRole: "Current Role",
    portalClinic: "Clinic Workspace",
    portalOwner: "Pet Owner Portal",
    portalSuperAdmin: "PawFect HQ Admin",

    // Navigation Items
    navDashboard: "Dashboard",
    navPatients: "Patients & Pets",
    navRecords: "Medical Records",
    navAppointments: "Appointments",
    navReminders: "Automated Reminders",
    navCommunication: "Messages & Chat",
    navTelemedicine: "Telemedicine",
    navEmergency: "Emergency Triage",
    navDocuments: "Documents",
    navBilling: "Subscription & Billing",
    navAIAssistant: "PawFect AI",
    navSuperAdmin: "SaaS Admin",
    navMyPets: "My Pets",
    navMyRecords: "Health Records",
    navMyInvoices: "Invoices & Payments",
    navRequestAppointment: "Book Appointment",

    // Hero Section
    heroTitle: "Everything your clinic needs to thrive.",
    heroSubtitle:
      "Manage patients, electronic medical records, calendar appointments, intelligent automated reminders, and client communications — all in one unified, modern cloud platform.",
    heroPriceBadge: "$250 / month per clinic",
    heroNoContracts: "No complicated contracts",
    heroEasyOnboarding: "5-minute onboarding",
    heroModernTech: "Built for modern veterinary practices",
    heroLiveDemoBtn: "Launch Interactive Demo",

    // Landing Sections
    problemTitle: "Veterinary practices are drowning in admin chaos.",
    problemDesc:
      "Outdated legacy software slows your staff down, leaves appointments unconfirmed, and causes patients to miss life-saving vaccinations.",
    solutionTitle: "One intelligent operating system for your entire clinic.",
    solutionDesc:
      "PawFect streamlines clinical workflows from check-in to discharge, automating patient reminders and empowering veterinarians to focus on patient health.",

    featuresTitle: "Engineered for Clinical Excellence & Patient Joy",
    featuresSubtitle: "Everything is interconnected seamlessly without disjointed plugins.",

    featureRemindersTitle: "Intelligent Automated Reminders",
    featureRemindersDesc:
      "Multi-channel automated alerts (SMS, WhatsApp, Email) for vaccines, medication refills, and appointments that boost client compliance by 42%.",

    featureRecordsTitle: "Electronic Veterinary Records (EMR)",
    featureRecordsDesc:
      "Fast, structured clinical charting with vitals, SOAP notes, prescriptions, batch-tracked vaccines, radiology imaging, and one-click PDF export.",

    featureAppointmentsTitle: "Smart Scheduling Calendar",
    featureAppointmentsDesc:
      "Visual day/week/month calendar with color-coded appointment types, real-time check-in status, and instant client confirmations.",

    featurePortalTitle: "Delightful Pet Owner Portal",
    featurePortalDesc:
      "Give pet parents 24/7 access to vaccine certificates, medical histories, invoices, and direct secure messaging with your team.",

    featureAITitle: "PawFect AI Practice Assistant",
    featureAIDesc:
      "Empowers staff with instant client-friendly discharge summaries, pre-appointment history briefing, and reminder drafting — without medical diagnosis risks.",

    featureTelemedTitle: "Integrated Telemedicine",
    featureTelemedDesc:
      "Conduct virtual triage and follow-up video consults with secure photo sharing, chat, and automated post-consultation documentation.",

    featureAnalyticsTitle: "Real-Time Practice Analytics",
    featureAnalyticsDesc:
      "Actionable insights on patient retention, reminder engagement, appointment volume, and monthly recurring clinic revenue.",

    featureSecurityTitle: "Bank-Grade Security & Role Permissions",
    featureSecurityDesc:
      "Strict data isolation between clinics, role-based access control (Admin, Vet, Tech, Receptionist, Owner), and comprehensive audit trails.",

    pricingTitle: "Simple, Transparent, Predictable Pricing",
    pricingSubtitle: "One flat subscription covers your entire clinic with no hidden per-seat traps.",
    pricingAmount: "$250",
    pricingPerMonth: "/ month per clinic",
    pricingIncludesTitle: "Everything included in your clinic subscription:",
    pricingItem1: "Unlimited patient records & pet profiles",
    pricingItem2: "Complete Electronic Medical Records (EMR) & SOAP notes",
    pricingItem3: "Smart calendar scheduling with real-time check-in",
    pricingItem4: "Automated multi-channel reminders (Email, SMS, WhatsApp)",
    pricingItem5: "Dedicated Pet Owner Portal & 24/7 client access",
    pricingItem6: "Two-way secure messaging & client communication",
    pricingItem7: "PawFect AI administrative & summarization assistant",
    pricingItem8: "Document storage, lab report & imaging viewer",
    pricingItem9: "Practice revenue & client retention analytics",
    pricingItem10: "Unlimited staff accounts (Vets, Techs, Receptionists)",

    faqTitle: "Frequently Asked Questions",
    ctaBannerTitle: "Ready to transform your veterinary practice?",
    ctaBannerSubtitle: "Join modern veterinary clinics delivering better care with happier pets.",

    // Dashboard Metrics & Cards
    metricTodayAppointments: "Today's Appointments",
    metricTotalPatients: "Total Patients",
    metricActiveClients: "Active Pet Owners",
    metricUpcomingVaccinations: "Upcoming Vaccinations",
    metricPendingReminders: "Pending Reminders",
    metricOutstandingInvoices: "Outstanding Invoices",
    metricMonthlyRevenue: "Monthly Revenue",
    metricNewPatients: "New Patients This Month",

    cardTodayAppointments: "Today's Clinical Schedule",
    cardUpcomingVaccinations: "Vaccination Alerts",
    cardMedicationReminders: "Medication Refills Due",
    cardRecentPatients: "Recent Patients",
    cardPendingActions: "Triage & Pending Actions",
    cardRevenueOverview: "Revenue & Billing Pulse",

    // Common Actions
    actionCreatePet: "Register New Pet",
    actionNewRecord: "New Medical Record",
    actionNewAppointment: "Schedule Appointment",
    actionNewReminder: "Create Reminder",
    actionNewInvoice: "Create Invoice",
    actionSearch: "Search pets, owners, microchips...",
    actionSave: "Save Changes",
    actionCancel: "Cancel",
    actionConfirm: "Confirm",
    actionClose: "Close",
    actionEdit: "Edit",
    actionDelete: "Delete",
    actionExportPDF: "Export PDF",
    actionSend: "Send Message",
    actionCheckIn: "Check In Patient",
    actionStartExam: "Start Examination",
    actionComplete: "Mark Completed",

    // Lead Capture Modal
    demoModalTitle: "Schedule a Live Personalized Demo",
    demoModalSubtitle: "See how PawFect can modernize your practice operations.",
    fieldClinicName: "Clinic Name",
    fieldContactName: "Your Full Name",
    fieldEmail: "Business Email",
    fieldPhone: "Phone Number",
    fieldVetsCount: "Number of Veterinarians",
    fieldPatientsPerMonth: "Estimated Monthly Patients",
    fieldNotes: "Special Requirements or Current Software",
    demoSubmitBtn: "Request Personalized Demo",
    demoSuccessMsg: "Thank you! Our veterinary solutions team will reach out within 2 hours.",

    // AI Assistant
    aiModalTitle: "PawFect AI Practice Assistant",
    aiSafetyNotice:
      "PawFect AI is an administrative and communication tool. It does NOT diagnose illnesses, prescribe treatments, or substitute for the clinical judgment of a licensed veterinarian.",
    aiTabSummarize: "Summarize for Client",
    aiTabDraftReminder: "Draft Reminder",
    aiTabVetBrief: "Pre-Visit Vet Briefing",
    aiTabDischarge: "Discharge Instructions",
    aiGenerateBtn: "Generate with PawFect AI",
    aiPoweredBy: "AI Engine",

    // Safety & Emergency
    emergencyBannerNotice:
      "Emergency situations require immediate professional veterinary attention.",
    emergencyTriageTitle: "Emergency Clinical Triage",
    emergencyIntakeBtn: "Emergency Patient Intake",

    // Language Toggle
    languageLabel: "Language",
  },
  es: {
    // Brand & Header
    brandName: "PawFect",
    brandTagline: "Mejor Atención. Mascotas Más Felices.",
    operatingSystemSubtitle: "El sistema operativo para clínicas veterinarias modernas.",
    startClinicCTA: "Iniciar Mi Clínica",
    bookDemoCTA: "Agendar Demo",
    loginCTA: "Iniciar Sesión",
    logoutCTA: "Cerrar Sesión",
    quickDemoSwitch: "Cambiar Perfil de Prueba",
    currentRole: "Rol Actual",
    portalClinic: "Espacio de la Clínica",
    portalOwner: "Portal de Propietarios",
    portalSuperAdmin: "Administración PawFect",

    // Navigation Items
    navDashboard: "Panel Principal",
    navPatients: "Pacientes y Mascotas",
    navRecords: "Historias Clínicas",
    navAppointments: "Citas y Agenda",
    navReminders: "Recordatorios Automáticos",
    navCommunication: "Mensajes y Chat",
    navTelemedicine: "Telemedicina",
    navEmergency: "Triaje de Emergencia",
    navDocuments: "Documentos",
    navBilling: "Suscripción y Facturación",
    navAIAssistant: "PawFect AI",
    navSuperAdmin: "Admin SaaS",
    navMyPets: "Mis Mascotas",
    navMyRecords: "Historial Médico",
    navMyInvoices: "Facturas y Pagos",
    navRequestAppointment: "Solicitar Cita",

    // Hero Section
    heroTitle: "Todo lo que su clínica necesita para triunfar.",
    heroSubtitle:
      "Gestione pacientes, historias clínicas electrónicas, agenda de citas, recordatorios inteligentes automatizados y comunicación con clientes — todo en una sola plataforma moderna en la nube.",
    heroPriceBadge: "$250 / mes por clínica",
    heroNoContracts: "Sin contratos forzosos",
    heroEasyOnboarding: "Configuración en 5 minutos",
    heroModernTech: "Diseñado para veterinarias modernas",
    heroLiveDemoBtn: "Ver Demo Interactivo",

    // Landing Sections
    problemTitle: "Las clínicas veterinarias pierden tiempo en caos administrativo.",
    problemDesc:
      "El software anticuado ralentiza a su equipo, deja citas sin confirmar y ocasiona que los pacientes pierdan vacunas esenciales.",
    solutionTitle: "Un sistema operativo inteligente para toda su clínica.",
    solutionDesc:
      "PawFect optimiza el flujo de trabajo desde la recepción hasta el alta, automatizando avisos a tutores y permitiendo a los veterinarios enfocarse en la salud animal.",

    featuresTitle: "Diseñado para la Excelencia Clínica y el Bienestar Animal",
    featuresSubtitle: "Todo está interconectado a la perfección sin plugins complejos.",

    featureRemindersTitle: "Recordatorios Inteligentes Automatizados",
    featureRemindersDesc:
      "Avisos multicanal (SMS, WhatsApp, Correo) para vacunas, desparasitaciones y citas que aumentan la asistencia de clientes en un 42%.",

    featureRecordsTitle: "Historia Clínica Veterinaria Electrónica",
    featureRecordsDesc:
      "Registro clínico ágil con constantes vitales, notas SOAP, recetas, control de lotes de vacunas, radiografías y exportación en PDF en un clic.",

    featureAppointmentsTitle: "Agenda y Calendario Inteligente",
    featureAppointmentsDesc:
      "Calendario visual por día/semana/mes con tipos de cita por colores, estado de check-in en tiempo real y confirmaciones automáticas.",

    featurePortalTitle: "Portal Amigable para Propietarios de Mascotas",
    featurePortalDesc:
      "Acceso 24/7 para los tutores a certificados de vacunación, historial clínico, facturas y mensajería directa con el equipo veterinario.",

    featureAITitle: "Asistente Clínico PawFect AI",
    featureAIDesc:
      "Genera resúmenes claros para clientes, instrucciones de alta y preparación de consultas previas sin riesgo de diagnósticos médicos.",

    featureTelemedTitle: "Telemedicina Integrada",
    featureTelemedDesc:
      "Realice consultas virtuales de triaje y seguimiento con video, fotos compartidas, chat y notas clínicas automáticas.",

    featureAnalyticsTitle: "Métricas y Analíticas en Tiempo Real",
    featureAnalyticsDesc:
      "Indicadores clave sobre retención de pacientes, tasa de respuesta a recordatorios, volumen de citas e ingresos mensuales.",

    featureSecurityTitle: "Seguridad de Grado Bancario y Permisos por Rol",
    featureSecurityDesc:
      "Aislamiento estricto de datos por clínica, control de acceso por roles (Admin, Vet, Auxiliar, Recepción, Tutor) y registro de auditoría.",

    pricingTitle: "Precios Claros, Transparentes y Predecibles",
    pricingSubtitle: "Una tarifa fija cubre a toda su clínica sin cobros ocultos por usuario.",
    pricingAmount: "$250",
    pricingPerMonth: "/ mes por clínica",
    pricingIncludesTitle: "Todo incluido en la suscripción de su clínica:",
    pricingItem1: "Pacientes y perfiles de mascotas ilimitados",
    pricingItem2: "Historias clínicas electrónicas completas y notas SOAP",
    pricingItem3: "Agenda inteligente con check-in en tiempo real",
    pricingItem4: "Recordatorios multicanal automáticos (Correo, SMS, WhatsApp)",
    pricingItem5: "Portal dedicado para propietarios de mascotas 24/7",
    pricingItem6: "Mensajería bidireccional segura con tutores",
    pricingItem7: "Asistente administrativo PawFect AI",
    pricingItem8: "Almacenamiento de documentos, análisis e imágenes",
    pricingItem9: "Analíticas de ingresos y retención de pacientes",
    pricingItem10: "Cuentas ilimitadas para el personal de la clínica",

    faqTitle: "Preguntas Frecuentes",
    ctaBannerTitle: "¿Listo para transformar su clínica veterinaria?",
    ctaBannerSubtitle: "Únase a las clínicas que ofrecen mejor atención y mascotas más felices.",

    // Dashboard Metrics & Cards
    metricTodayAppointments: "Citas de Hoy",
    metricTotalPatients: "Total de Pacientes",
    metricActiveClients: "Tutores Activos",
    metricUpcomingVaccinations: "Vacunas Próximas",
    metricPendingReminders: "Recordatorios Pendientes",
    metricOutstandingInvoices: "Facturas por Cobrar",
    metricMonthlyRevenue: "Ingresos del Mes",
    metricNewPatients: "Nuevos Pacientes Este Mes",

    cardTodayAppointments: "Agenda del Día",
    cardUpcomingVaccinations: "Alertas de Vacunación",
    cardMedicationReminders: "Tratamientos por Renovar",
    cardRecentPatients: "Pacientes Recientes",
    cardPendingActions: "Triaje y Acciones Pendientes",
    cardRevenueOverview: "Resumen de Facturación",

    // Common Actions
    actionCreatePet: "Registrar Nueva Mascota",
    actionNewRecord: "Nueva Historia Clínica",
    actionNewAppointment: "Agendar Cita",
    actionNewReminder: "Crear Recordatorio",
    actionNewInvoice: "Crear Factura",
    actionSearch: "Buscar mascotas, tutores, microchip...",
    actionSave: "Guardar Cambios",
    actionCancel: "Cancelar",
    actionConfirm: "Confirmar",
    actionClose: "Cerrar",
    actionEdit: "Editar",
    actionDelete: "Eliminar",
    actionExportPDF: "Exportar PDF",
    actionSend: "Enviar Mensaje",
    actionCheckIn: "Registrar Llegada (Check-In)",
    actionStartExam: "Iniciar Consulta",
    actionComplete: "Marcar Completado",

    // Lead Capture Modal
    demoModalTitle: "Agende una Demostración Personalizada",
    demoModalSubtitle: "Descubra cómo PawFect moderniza la gestión de su clínica.",
    fieldClinicName: "Nombre de la Clínica",
    fieldContactName: "Nombre y Apellidos",
    fieldEmail: "Correo Electrónico",
    fieldPhone: "Teléfono de Contacto",
    fieldVetsCount: "Número de Veterinarios",
    fieldPatientsPerMonth: "Pacientes Estimados al Mes",
    fieldNotes: "Requisitos Especiales o Software Actual",
    demoSubmitBtn: "Solicitar Demostración",
    demoSuccessMsg: "¡Gracias! Nuestro equipo de soluciones veterinarias le contactará en menos de 2 horas.",

    // AI Assistant
    aiModalTitle: "Asistente Clínico PawFect AI",
    aiSafetyNotice:
      "PawFect AI es una herramienta de asistencia administrativa. NO diagnostica enfermedades, NO prescribe tratamientos ni reemplaza el criterio de un médico veterinario colegiado.",
    aiTabSummarize: "Resumen para Tutor",
    aiTabDraftReminder: "Redactar Recordatorio",
    aiTabVetBrief: "Resumen Pre-Consulta",
    aiTabDischarge: "Pautas de Alta",
    aiGenerateBtn: "Generar con PawFect AI",
    aiPoweredBy: "Motor de Inteligencia Artificial",

    // Safety & Emergency
    emergencyBannerNotice:
      "Las emergencias requieren atención veterinaria profesional presencial inmediata.",
    emergencyTriageTitle: "Triaje Clínico de Emergencias",
    emergencyIntakeBtn: "Recepción de Emergencia",

    // Language Toggle
    languageLabel: "Idioma",
  },
};
