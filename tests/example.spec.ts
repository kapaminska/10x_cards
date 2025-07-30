import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/10x Astro Starter/);
});

test("get started link", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Zaloguj" }).click();

  await expect(page.getByRole("heading", { name: "Zaloguj się" })).toBeVisible();
});
