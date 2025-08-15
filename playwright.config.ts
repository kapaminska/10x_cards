import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Only load .env.test when not in a CI environment.
// In CI, we rely on the secrets passed via the workflow.
if (!process.env.CI) {
  dotenv.config({ path: ".env.test" });
}

// https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: process.env.CI
      ? `SUPABASE_URL=${process.env.SUPABASE_URL} SUPABASE_KEY=${process.env.SUPABASE_KEY} npm run dev:e2e`
      : "npm run dev:e2e",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 240 * 1000,
    env: {
      ...process.env,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
    },
  },
  globalTeardown: "./tests/global-teardown.ts",
});
