import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page object for the wishlist (/wishlist). */
export class WishlistPage extends BasePage {
  readonly rows: Locator;
  readonly emptyMessage: Locator;
  readonly addToCartCheckboxes: Locator;
  readonly addSelectedToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('.wishlist-content table.cart tbody tr');
    this.emptyMessage = page.locator('.wishlist-content .no-data, .no-data');
    this.addToCartCheckboxes = page.locator('input[name="addtocart"]');
    this.addSelectedToCartButton = page.locator('button[name="addtocartbutton"], .wishlist-add-to-cart-button');
  }

  async open(): Promise<void> {
    await this.goto('/wishlist');
  }

  async itemCount(): Promise<number> {
    return this.rows.count();
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyMessage.isVisible();
  }

  async moveAllToCart(): Promise<void> {
    const count = await this.addToCartCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await this.addToCartCheckboxes.nth(i).check();
    }
    await this.addSelectedToCartButton.click();
  }
}
