import express from "express";

export const app = express();
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
app.use(express.json({ limit: "32kb" }));

// Liveness is deliberately separate from readiness for real clinic use.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "PawaVet", mode: "preview", productionReady: false });
});
app.get("/api/ready", (_req, res) => {
  res.status(503).json({
    status: "not_ready",
    productionReady: false,
    blockers: ["server_authentication", "persistent_clinic_data", "verified_reminder_delivery", "subscription_billing", "authenticated_ai"],
  });
});

// Do not collect leads in volatile process memory, expose contacts publicly,
// or invent successful AI output while these services are not implemented.
app.get("/api/leads", (_req, res) => {
  res.status(401).json({ error: "Authentication required." });
});
app.post("/api/leads", (_req, res) => {
  res.status(503).json({ error: "Lead registration is not available yet. No information was saved." });
});
app.post("/api/ai/assistant", (_req, res) => {
  res.status(503).json({ error: "AI assistance is unavailable until authenticated access and a provider are configured." });
});
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API route not found." });
});
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = error.type === "entity.too.large" ? 413 : error instanceof SyntaxError ? 400 : 500;
  res.status(status).json({ error: status === 413 ? "Request too large." : status === 400 ? "Invalid JSON." : "Internal server error." });
});
export default app;
