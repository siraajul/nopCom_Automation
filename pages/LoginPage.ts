import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page object for /login. */
export class LoginPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly rememberMe: Locator;
  readonly loginButton: Locator;
  readonly summaryError: Locator;
  readonly emailFieldError: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.locator('#Email');
    this.password = page.locator('#Password');
    this.rememberMe = page.locator('#RememberMe');
    this.loginButton = page.locator('button.login-button');
    this.summaryError = page.locator('.message-error.validation-summary-errors, .validation-summary-errors');
    this.emailFieldError = page.locator('span[data-valmsg-for="Email"], #Email-error');
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(email: string, password: string, remember = false): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    if (remember) await this.rememberMe.check();
    await this.loginButton.click();
  }

  async summaryErrorText(): Promise<string> {
    return (await this.summaryError.innerText()).trim();
  }
}
