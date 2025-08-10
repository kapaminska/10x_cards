import { type Page, type Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password_raw: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password_raw);
    await this.loginButton.click();
    await expect(this.page.locator('[data-testid="source-text-input"]')).toBeVisible({ timeout: 30000 });
  }
}
