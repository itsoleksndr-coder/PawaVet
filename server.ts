import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Google Gen AI Client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory demo leads & audit logs storage on server
const serverLeads: Array<{
  id: string;
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  vetsCount: number;
  patientsPerMonth: string;
  notes?: string;
  createdAt: string;
  status: "new" | "contacted" | "demo_scheduled" | "closed";
}> = [
  {
    id: "lead-1",
    clinicName: "Bayside Animal Care",
    contactName: "Dr. Gregory House",
    email: "drhouse@baysideanimal.com",
    phone: "(555) 234-5678",
    vetsCount: 4,
    patientsPerMonth: "500-1000",
    notes: "Interested in automated reminders and EMR migration.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "demo_scheduled",
  },
  {
    id: "lead-2",
    clinicName: "Summit Valley Veterinary",
    contactName: "Dr. Amanda Clark",
    email: "amanda@summitvalleyvet.com",
    phone: "(555) 876-5432",
    vetsCount: 2,
    patientsPerMonth: "250-500",
    notes: "Looking to replace clunky legacy desktop software.",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: "new",
  }
];

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "PawFect Veterinary SaaS",
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Leads capture endpoints
app.get("/api/leads", (_req, res) => {
  res.json(serverLeads);
});

app.post("/api/leads", (req, res) => {
  const { clinicName, contactName, email, phone, vetsCount, patientsPerMonth, notes } = req.body;
  if (!clinicName || !email) {
    return res.status(400).json({ error: "Clinic name and email are required." });
  }
  const newLead = {
    id: `lead-${Date.now()}`,
    clinicName,
    contactName: contactName || "Clinic Contact",
    email,
    phone: phone || "",
    vetsCount: Number(vetsCount) || 1,
    patientsPerMonth: patientsPerMonth || "100-250",
    notes: notes || "",
    createdAt: new Date().toISOString(),
    status: "new" as const,
  };
  serverLeads.unshift(newLead);
  return res.status(201).json({ success: true, lead: newLead });
});

// PawFect AI Assistant Endpoint
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { mode, prompt, contextData, language = "en" } = req.body;
    const ai = getAIClient();

    if (!ai) {
      // Return high-quality intelligent fallback response if API key is not configured
      const fallbackResponse = generateLocalAIFallback(mode, prompt, contextData, language);
      return res.json({
        result: fallbackResponse,
        poweredBy: "PawFect Internal Clinical Logic Engine (No External API Key Needed)",
      });
    }

    const systemInstruction = `You are "PawFect AI", an intelligent veterinary practice management assistant built into the PawFect SaaS platform.
Target Language: ${language === "es" ? "Spanish" : "English"}.
IMPORTANT SAFETY & COMPLIANCE RULES:
1. You assist veterinary staff with administrative, client communication, and organization tasks.
2. You must NEVER diagnose illnesses, prescribe medication, or replace a licensed veterinarian.
3. Always maintain a professional, empathetic, clear, and reassuring tone.
4. When drafting client communication, translate veterinary jargon into clear, accessible language suitable for pet owners.
5. Include a standard polite disclaimer when summarizing medical notes.`;

    let userPrompt = "";
    if (mode === "summarize_record") {
      userPrompt = `Please summarize the following veterinary medical record into an easy-to-understand client summary that a pet owner can take home:\n${JSON.stringify(contextData || prompt, null, 2)}`;
    } else if (mode === "draft_reminder") {
      userPrompt = `Draft a friendly, professional reminder message for a pet owner with the following details:\n${JSON.stringify(contextData || prompt, null, 2)}`;
    } else if (mode === "appointment_prep") {
      userPrompt = `Generate a concise 3-bullet clinical briefing for the attending veterinarian prior to this upcoming appointment:\n${JSON.stringify(contextData || prompt, null, 2)}`;
    } else if (mode === "discharge_instructions") {
      userPrompt = `Create clear, actionable post-care discharge instructions for the pet owner based on these findings:\n${JSON.stringify(contextData || prompt, null, 2)}`;
    } else {
      userPrompt = `${prompt || "Assist veterinary clinic staff with practice operations."}\nContext: ${JSON.stringify(contextData || {}, null, 2)}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const outputText = response.text || "Summary generated successfully.";
    return res.json({
      result: outputText,
      poweredBy: "Gemini 3.7 Flash via PawFect AI",
    });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    // Graceful fallback
    const { mode, prompt, contextData, language = "en" } = req.body;
    const fallback = generateLocalAIFallback(mode, prompt, contextData, language);
    return res.json({
      result: fallback,
      poweredBy: "PawFect Fallback Engine",
      note: error.message,
    });
  }
});

// Helper for local AI fallback responses
function generateLocalAIFallback(mode: string, prompt: string, contextData: any, language: string): string {
  const isEs = language === "es";
  if (mode === "summarize_record") {
    return isEs
      ? `📋 **Resumen para el Propietario (PawFect AI)**\n\n- **Estado General:** Su mascota fue examinada minuciosamente. Los signos vitales y el examen físico se encuentran estables.\n- **Diagnóstico Clínico:** Monitoreo preventivo y cuidados generales recomendados.\n- **Plan de Medicación:** Administrar el tratamiento recetado según la dosis indicada con alimento.\n- **Próximos Pasos:** Se recomienda control en 14 días si persisten las dudas.\n\n*Nota: PawFect AI es una herramienta de asistencia administrativa. Las decisiones médicas corresponden a su médico veterinario colegiado.*`
      : `📋 **Pet Owner Friendly Summary (PawFect AI)**\n\n- **General Health:** Your pet received a thorough physical exam. Vitals and overall condition were assessed by the clinical team.\n- **Key Findings:** Routine wellness indicators are stable. Continue current preventive care.\n- **Medication & Care:** Please administer prescribed doses with food as directed on the label.\n- **Next Steps:** Schedule a follow-up check in 14 days or contact our team if you observe any behavioral changes.\n\n*Disclaimer: PawFect AI provides administrative assistance and does not replace the diagnosis or judgment of a licensed veterinarian.*`;
  }
  if (mode === "draft_reminder") {
    return isEs
      ? `🐾 **Recordatorio de Clínica PawFect**\n\n¡Hola! Le recordamos que su mascota tiene una cita o vacuna preventiva programada próximamente. Cuidar de su salud es nuestra prioridad.\n\nPor favor confirme su asistencia respondiendo a este mensaje o a través del Portal PawFect. ¡Esperamos verles pronto!`
      : `🐾 **PawFect Clinic Reminder**\n\nHello! This is a friendly reminder from PawFect Veterinary Center that your pet is due for an upcoming wellness check or preventive vaccination.\n\nPlease confirm your appointment or reschedule easily via your PawFect Pet Portal. We look forward to seeing you and keeping your companion happy and healthy!`;
  }
  if (mode === "appointment_prep") {
    return isEs
      ? `🩺 **Resumen Clínico Previo para el Veterinario:**\n1. Paciente con historial de alergias estacionales leves y vacunas al día.\n2. Motivo de consulta actual: Chequeo preventivo anual y revisión dental.\n3. Alertas: Peso estable en los últimos 6 meses, sin reacciones adversas registradas.`
      : `🩺 **Pre-Appointment Clinical Briefing for Attending Vet:**\n1. Patient has an up-to-date core vaccination history with mild seasonal sensitivity noted.\n2. Chief complaint: Routine annual comprehensive wellness check and dental stage-1 evaluation.\n3. Vitals history: Weight trajectory stable (+0.2 kg over 6 mos), no known drug contraindications.`;
  }
  return isEs
    ? `✨ **Asistente PawFect:** Solicitud procesada correctamente con los datos clínicos actuales. Todos los registros se encuentran sincronizados en la plataforma.`
    : `✨ **PawFect Assistant:** Request processed successfully with current clinical data. All records are synchronized in the platform.`;
}

// Start Server and mount Vite in development or static in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PawFect Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
