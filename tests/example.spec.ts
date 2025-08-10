import { test, expect } from "@playwright/test";

test("redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Zaloguj się" })).toBeVisible();
});

test("get started link", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Zaloguj" }).click();

  await expect(page.getByRole("heading", { name: "Zaloguj się" })).toBeVisible();
});
