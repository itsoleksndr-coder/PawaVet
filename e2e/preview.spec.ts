import { test, expect } from "@playwright/test";

test("preview entry, clinic navigation, unavailable integrations and refresh", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Explore your clinic workflow" })).toBeVisible();
  await page.getByRole("button", { name: "Explore sample clinic" }).click();
  await expect(page.getByRole("status")).toContainText("No real authentication");
  for (const name of ["Patients & Records", "SOAP Charts & Rx", "Appointments & Queue", "Billing & Payments", "Staff & RBAC Roles", "Security & Audit Logs"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator("main")).not.toBeEmpty();
  }
  await page.getByRole("button", { name: "Vaccine Reminders", exact: true }).click();
  const delivery = page.getByRole("button", { name: "Delivery not connected" });
  expect(await delivery.count()).toBeGreaterThan(0);
  for (const button of await delivery.all()) await expect(button).toBeDisabled();
  await page.getByRole("button", { name: "Telehealth & Scribe", exact: true }).click();
  await page.getByLabel("Test request — fictional information only").fill("Draft a fictional appointment reminder.");
  await page.getByRole("button", { name: "Check AI service" }).click();
  await expect(page.getByRole("alert")).toContainText("AI assistance is unavailable");
  await expect(page.getByRole("button", { name: "Check AI service" })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Explore your clinic workflow" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile entry and clinic layout fit viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Explore sample clinic" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
