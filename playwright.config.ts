import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:4317",
    headless: true,
    launchOptions: process.env.BROWSER_EXECUTABLE_PATH
      ? {
          executablePath: process.env.BROWSER_EXECUTABLE_PATH,
          args: [
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--no-zygote",
            "--disable-gpu",
          ],
        }
      : undefined,
    trace: "off",
    screenshot: "only-on-failure",
  },
  outputDir: "test-results",
});
