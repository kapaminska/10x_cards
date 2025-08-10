import { type Locator, type Page } from "@playwright/test";

export class SuggestionCardComponent {
  private readonly locator: Locator;
  readonly acceptButton: Locator;
  readonly editButton: Locator;
  readonly rejectButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly frontTextarea: Locator;
  readonly backTextarea: Locator;

  constructor(page: Page, id: string) {
    this.locator = page.locator(`[data-testid="suggestion-card-${id}"]`);
    this.acceptButton = this.locator.locator(`[data-testid="accept-button-${id}"]`);
    this.editButton = this.locator.locator(`[data-testid="edit-button-${id}"]`);
    this.rejectButton = this.locator.locator(`[data-testid="reject-button-${id}"]`);
    this.saveButton = this.locator.locator(`[data-testid="save-button-${id}"]`);
    this.cancelButton = this.locator.locator(`[data-testid="cancel-button-${id}"]`);
    this.frontTextarea = this.locator.locator(`[data-testid="front-textarea-${id}"]`);
    this.backTextarea = this.locator.locator(`[data-testid="back-textarea-${id}"]`);
  }

  async accept() {
    await this.acceptButton.click();
  }

  async reject() {
    await this.rejectButton.click();
  }

  async startEditing() {
    await this.editButton.click();
  }

  async saveChanges(front: string, back: string) {
    await this.frontTextarea.fill(front);
    await this.backTextarea.fill(back);
    await this.saveButton.click();
  }

  async cancelEditing() {
    await this.cancelButton.click();
  }
}
