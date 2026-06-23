import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page object for /contactus. */
export class ContactPage extends BasePage {
  readonly fullName: Locator;
  readonly email: Locator;
  readonly enquiry: Locator;
  readonly sendButton: Locator;
  readonly result: Locator;

  constructor(page: Page) {
    super(page);
    this.fullName = page.locator('#FullName');
    this.email = page.locator('#Email');
    this.enquiry = page.locator('#Enquiry');
    this.sendButton = page.locator('button[name="send-email"]');
    this.result = page.locator('.result');
  }

  async open(): Promise<void> {
    await this.goto('/contactus');
  }

  async send(fullName: string, email: string, enquiry: string): Promise<void> {
    await this.fullName.fill(fullName);
    await this.email.fill(email);
    await this.enquiry.fill(enquiry);
    await this.sendButton.click();
  }

  async resultText(): Promise<string> {
    return (await this.result.innerText()).trim();
  }

  fieldError(field: 'FullName' | 'Email' | 'Enquiry'): Locator {
    return this.page.locator(`span[data-valmsg-for="${field}"], #${field}-error`).first();
  }
}
