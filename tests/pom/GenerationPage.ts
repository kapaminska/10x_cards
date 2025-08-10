import { type Page, type Locator, expect } from "@playwright/test";
import { SuggestionCardComponent } from "./SuggestionCard.pom";

export class GenerationPage {
  readonly page: Page;
  readonly sourceTextInput: Locator;
  readonly generateFlashcardsButton: Locator;
  readonly suggestionsList: Locator;
  readonly saveAcceptedFlashcardsButton: Locator;
  readonly hydrationMarker: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sourceTextInput = page.locator('[data-testid="source-text-input"]');
    this.generateFlashcardsButton = page.locator('[data-testid="generate-flashcards-button"]');
    this.suggestionsList = page.locator('[data-testid="suggestions-list"]');
    this.saveAcceptedFlashcardsButton = page.locator('[data-testid="save-accepted-flashcards-button"]');
    this.hydrationMarker = page.locator('[data-testid="generation-hydrated"]');
  }

  async goto() {
    await this.page.goto("/generate");
    await expect(this.hydrationMarker).toBeVisible({ timeout: 30000 });
  }

  async generateFlashcards(text: string) {
    // Ensure hydration before interacting
    await expect(this.hydrationMarker).toBeVisible({ timeout: 30000 });

    await this.sourceTextInput.fill(text);
    await expect(this.sourceTextInput).toHaveValue(text, { timeout: 30000 });

    await this.sourceTextInput.focus();

    try {
      await expect(this.generateFlashcardsButton).toBeEnabled({ timeout: 30000 });
    } catch {
      // Fallback: trigger an input event directly on the textarea to nudge state updates after hydration
      for (let i = 0; i < 3; i++) {
        await this.sourceTextInput.evaluate((el: HTMLTextAreaElement) => {
          el.value = `${el.value}a`;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        });
        try {
          await expect(this.generateFlashcardsButton).toBeEnabled({ timeout: 3000 });
          break;
        } catch {
          // try again
        }
      }
      await expect(this.generateFlashcardsButton).toBeEnabled({ timeout: 3000 });
    }

    await this.generateFlashcardsButton.click();
  }

  async saveAcceptedFlashcards() {
    await this.saveAcceptedFlashcardsButton.click();
  }

  getSuggestionCard(id: string) {
    return new SuggestionCardComponent(this.page, id);
  }

  async getSuggestionCards() {
    await this.suggestionsList.waitFor();
    const suggestions = await this.suggestionsList.locator("> div").all();
    return Promise.all(
      suggestions.map(async (suggestion) => {
        const testId = await suggestion.getAttribute("data-testid");
        const id = testId ? testId.replace("suggestion-card-", "") : "";
        return new SuggestionCardComponent(this.page, id);
      })
    );
  }
}
