import "dotenv/config";
import path from "node:path";
import express from "express";
import { api } from "./server/api";
import { dispatchDueReminders } from "./server/reminders";
const app = express();
app.use(api);
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve("dist")));
    app.get("*", (_req, res) => res.sendFile(path.resolve("dist/index.html")));
  }
  app.listen(Number(process.env.PORT) || 3000, "0.0.0.0", () =>
    console.log("PawaVet server ready"),
  );
  if (process.env.REMINDERS_WORKER_ENABLED === "true") {
    // One Railway web replica can process a small pilot queue.
    // Row locks prevent two replicas from claiming the same pending job.
    const run = () => void dispatchDueReminders().catch((error) =>
      console.error("Reminder dispatch failed", error instanceof Error ? error.message : "unknown"));
    const timer = setInterval(run, 60_000);
    timer.unref();
    run();
  }
}
start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
