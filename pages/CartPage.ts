import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page object for the shopping cart (/cart). */
export class CartPage extends BasePage {
  readonly rows: Locator;
  readonly emptyMessage: Locator;
  readonly quantityInputs: Locator;
  readonly couponInput: Locator;
  readonly couponButton: Locator;
  readonly couponMessage: Locator;
  readonly termsCheckbox: Locator;
  readonly checkoutButton: Locator;
  readonly checkoutAsGuestButton: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('table.cart tbody tr');
    this.emptyMessage = page.locator('.order-summary-content .no-data, .no-data');
    this.quantityInputs = page.locator('.qty-input');
    this.couponInput = page.locator('#discountcouponcode');
    this.couponButton = page.locator('#applydiscountcouponcode');
    // The page has an empty placeholder .message-failure plus the real one;
    // filter to the message that actually has text.
    this.couponMessage = page
      .locator('.message-failure, .message-success')
      .filter({ hasText: /\S/ });
    this.termsCheckbox = page.locator('#termsofservice');
    this.checkoutButton = page.locator('#checkout');
    this.checkoutAsGuestButton = page.locator('.checkout-as-guest-button');
  }

  /** Accept Terms of Service and proceed to checkout (guest path). */
  async proceedToCheckout(): Promise<void> {
    await this.termsCheckbox.check();
    await this.checkoutButton.click();
  }

  async checkoutAsGuest(): Promise<void> {
    await this.checkoutAsGuestButton.click();
  }

  async open(): Promise<void> {
    await this.goto('/cart');
  }

  async itemCount(): Promise<number> {
    return this.rows.count();
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyMessage.isVisible();
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    // Applying a coupon triggers a full page reload.
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      this.couponButton.click(),
    ]);
  }

  async couponMessageText(): Promise<string> {
    const msg = this.couponMessage.first();
    await expect(msg).toBeVisible({ timeout: 15_000 });
    return (await msg.innerText()).trim();
  }

  async updateQuantity(index: number, qty: number): Promise<void> {
    const input = this.quantityInputs.nth(index);
    await input.fill(String(qty));
    // nopCommerce auto-updates the cart on quantity change via AJAX.
    await input.blur();
    await this.page.waitForLoadState('networkidle');
  }
}
