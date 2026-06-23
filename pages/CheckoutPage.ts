import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  country: string; // visible option text, e.g. "United States"
  state?: string; // required for US; visible option text, e.g. "New York"
  city: string;
  address1: string;
  zip: string;
  phone: string;
}

/**
 * Page object for the nopCommerce One-Page Checkout (/onepagecheckout).
 *
 * The checkout is an AJAX wizard: Billing -> (Shipping address) -> Shipping
 * method -> Payment method -> Payment info -> Confirm. With "Ship to same
 * address" (default on), the separate shipping-address step is skipped.
 * Each "next" button reveals the following step in place.
 */
export class CheckoutPage extends BasePage {
  // Billing
  readonly billingFirstName: Locator;
  readonly billingLastName: Locator;
  readonly billingEmail: Locator;
  readonly billingCountry: Locator;
  readonly billingState: Locator;
  readonly billingCity: Locator;
  readonly billingAddress1: Locator;
  readonly billingZip: Locator;
  readonly billingPhone: Locator;
  readonly billingNext: Locator;

  // Subsequent step "next" buttons
  readonly shippingAddressNext: Locator;
  readonly shippingMethodNext: Locator;
  readonly paymentMethodNext: Locator;
  readonly paymentInfoNext: Locator;
  readonly confirmButton: Locator;

  readonly orderCompletedTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.billingFirstName = page.locator('#BillingNewAddress_FirstName');
    this.billingLastName = page.locator('#BillingNewAddress_LastName');
    this.billingEmail = page.locator('#BillingNewAddress_Email');
    this.billingCountry = page.locator('#BillingNewAddress_CountryId');
    this.billingState = page.locator('#BillingNewAddress_StateProvinceId');
    this.billingCity = page.locator('#BillingNewAddress_City');
    this.billingAddress1 = page.locator('#BillingNewAddress_Address1');
    this.billingZip = page.locator('#BillingNewAddress_ZipPostalCode');
    this.billingPhone = page.locator('#BillingNewAddress_PhoneNumber');
    this.billingNext = page.locator('#billing-buttons-container .new-address-next-step-button');

    this.shippingAddressNext = page.locator('#shipping-buttons-container .new-address-next-step-button');
    this.shippingMethodNext = page.locator('#shipping-method-buttons-container .shipping-method-next-step-button');
    this.paymentMethodNext = page.locator('#payment-method-buttons-container .payment-method-next-step-button');
    this.paymentInfoNext = page.locator('#payment-info-buttons-container .payment-info-next-step-button');
    this.confirmButton = page.locator('#confirm-order-buttons-container .confirm-order-next-step-button');

    this.orderCompletedTitle = page.locator('.order-completed .title, .section.order-completed');
  }

  async fillBilling(d: BillingDetails): Promise<void> {
    // The billing form only renders these fields for a brand-new address.
    await expect(this.billingFirstName).toBeVisible();
    await this.billingFirstName.fill(d.firstName);
    await this.billingLastName.fill(d.lastName);
    // Logged-in customers don't get an email field (it comes from the account).
    if (await this.billingEmail.isVisible().catch(() => false)) {
      await this.billingEmail.fill(d.email);
    }

    // Select by the option's value (matched on substring text) — more robust
    // than an exact label, since country/state texts can vary slightly.
    await this.selectByText(this.billingCountry, d.country);

    if (d.state) {
      // The state list is (re)populated via AJAX after the country changes.
      // Wait until the options actually contain the target state BEFORE
      // selecting — otherwise a late AJAX response can reset the dropdown and
      // the "State is required" validation blocks the billing step.
      await this.page
        .locator('#states-loading-progress')
        .waitFor({ state: 'hidden', timeout: 10_000 })
        .catch(() => {});
      await expect
        .poll(async () => (await this.billingState.locator('option').allInnerTexts()).join('|'), {
          timeout: 10_000,
        })
        .toContain(d.state);
      await this.selectByText(this.billingState, d.state);
      await expect(this.billingState.locator('option:checked')).toContainText(d.state);
    }

    await this.billingCity.fill(d.city);
    await this.billingAddress1.fill(d.address1);
    await this.billingZip.fill(d.zip);
    await this.billingPhone.fill(d.phone);
    await this.pause(); // let the filled billing form be visible while recording
  }

  /** Select an <option> in a <select> by a (case-insensitive) substring of its text. */
  private async selectByText(select: Locator, text: string): Promise<void> {
    const value = await select
      .locator('option', { hasText: new RegExp(text, 'i') })
      .first()
      .getAttribute('value');
    if (!value) throw new Error(`No <option> matching "${text}"`);
    await select.selectOption(value);
  }

  private async waitForLoading(): Promise<void> {
    await this.page
      .locator('.ajax-loading-block-window, #states-loading-progress')
      .first()
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => {});
  }

  /**
   * Advance through the remaining AJAX steps and place the order.
   *
   * The exact sequence of steps varies (e.g. a logged-in customer with no saved
   * address gets an extra shipping-address step, a guest may not). Rather than
   * hardcode the order, we loop: at each turn we click whichever step's "next"
   * button is currently visible, until the order-confirmation page appears.
   */
  async completeOrder(): Promise<void> {
    const steps = [
      this.billingNext,
      this.shippingAddressNext,
      this.shippingMethodNext,
      this.paymentMethodNext,
      this.paymentInfoNext,
      this.confirmButton,
    ];

    for (let i = 0; i < 10; i++) {
      await this.waitForLoading();
      if (await this.orderCompletedTitle.first().isVisible().catch(() => false)) return;

      let clicked = false;
      for (const btn of steps) {
        const ready =
          (await btn.isVisible().catch(() => false)) &&
          (await btn.isEnabled().catch(() => false));
        if (ready) {
          await btn.scrollIntoViewIfNeeded();
          await btn.click();
          await this.waitForLoading();
          await this.pause(); // pace each checkout step for recording
          clicked = true;
          break;
        }
      }
      if (!clicked) await this.page.waitForTimeout(1500);
    }
  }

  async successText(): Promise<string> {
    await expect(this.orderCompletedTitle.first()).toBeVisible({ timeout: 20_000 });
    return (await this.orderCompletedTitle.first().innerText()).trim();
  }
}
