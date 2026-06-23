import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface RegistrationData {
  gender?: 'male' | 'female';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string; // defaults to password when omitted
}

/** Page object for /register. */
export class RegisterPage extends BasePage {
  readonly genderMale: Locator;
  readonly genderFemale: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly registerButton: Locator;
  readonly successResult: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.genderMale = page.locator('#gender-male');
    this.genderFemale = page.locator('#gender-female');
    this.firstName = page.locator('#FirstName');
    this.lastName = page.locator('#LastName');
    this.email = page.locator('#Email');
    this.password = page.locator('#Password');
    this.confirmPassword = page.locator('#ConfirmPassword');
    this.registerButton = page.locator('#register-button');
    this.successResult = page.locator('.result');
    this.errorSummary = page.locator('.message-error');
  }

  async open(): Promise<void> {
    await this.goto('/register');
  }

  async fillForm(data: RegistrationData): Promise<void> {
    if (data.gender === 'female') await this.genderFemale.check();
    else if (data.gender === 'male') await this.genderMale.check();

    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.email.fill(data.email);
    await this.password.fill(data.password);
    await this.confirmPassword.fill(data.confirmPassword ?? data.password);
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }

  async register(data: RegistrationData): Promise<void> {
    await this.fillForm(data);
    await this.submit();
  }

  /** Validation error text shown beneath a specific field, e.g. 'Email'. */
  fieldError(field: 'FirstName' | 'LastName' | 'Email' | 'Password' | 'ConfirmPassword'): Locator {
    return this.page.locator(`span[data-valmsg-for="${field}"], #${field}-error`).first();
  }
}
