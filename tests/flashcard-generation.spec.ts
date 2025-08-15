import { test, expect, type Page } from "@playwright/test";
import { GenerationPage } from "./pom/GenerationPage";

async function ensureUserExists(page: Page, email: string, password: string) {
  const response = await page.request.post("/api/auth/register", {
    data: { email, password, confirmPassword: password },
  });
  // 200 OK or 409 Conflict (already exists) are both acceptable
  if (![200, 409].includes(response.status())) {
    throw new Error(`Failed to ensure user exists. Status: ${response.status()} Body: ${await response.text()}`);
  }
}

test.describe("Flashcard Generation from text", () => {
  let generationPage: GenerationPage;

  test.beforeEach(async ({ page }) => {
    generationPage = new GenerationPage(page);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test");
    }

    await ensureUserExists(page, username, password);

    const loginResponse = await page.request.post("/api/auth/login", {
      data: { email: username, password },
    });
    if (loginResponse.status() !== 200) {
      throw new Error(`Login failed. Status: ${loginResponse.status()} Body: ${await loginResponse.text()}`);
    }

    await generationPage.goto();
  });

  test("should allow user to generate flashcards and accept top 3 suggestions", async ({ page }) => {
    // Use deterministic safe length within validation bounds (>=1000 && <=10000)
    const longText = "x".repeat(1500);
    // l
    await generationPage.generateFlashcards(longText);

    await generationPage.suggestionsList.waitFor({ state: "visible" });

    const suggestionCards = await generationPage.getSuggestionCards();
    expect(suggestionCards.length).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < 3; i++) {
      await suggestionCards[i].accept();
    }

    await generationPage.saveAcceptedFlashcards();

    // After saving, the list becomes empty and a confirmation text is shown by SuggestionsList
    await expect(page.getByText("Fiszki zapisane!", { exact: false })).toBeVisible();
  });
});
