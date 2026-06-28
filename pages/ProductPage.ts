import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for a product detail page (e.g. /htc-smartphone).
 * Uses role/text based locators because product ids vary per product.
 */
export class ProductPage extends BasePage {
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly addToWishlistButton: Locator;
  readonly productName: Locator;
  readonly price: Locator;

  constructor(page: Page) {
    super(page);
    this.quantityInput = page.locator('.add-to-cart .qty-input, input.qty-input');
    this.addToCartButton = page.locator('.add-to-cart-button, button.add-to-cart-button');
    this.addToWishlistButton = page.locator('.add-to-wishlist-button, button.add-to-wishlist-button');
    this.productName = page.locator('.product-name h1');
    this.price = page.locator('.product-price span, .product-price');
  }

  async open(slug: string): Promise<void> {
    await this.goto(`/${slug.replace(/^\//, '')}`);
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
  }

  async getQuantity(): Promise<number> {
    return Number((await this.quantityInput.inputValue()) || 0);
  }

  async addToCart(): Promise<void> {
    const btn = this.addToCartButton.first();
    await btn.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' })).catch(() => {});
    await this.page.waitForTimeout(500); // let the scroll finish
    await btn.click();
    await this.pause();
  }

  async addToWishlist(): Promise<void> {
    const btn = this.addToWishlistButton.first();
    await btn.evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' })).catch(() => {});
    await this.page.waitForTimeout(500); // let the scroll finish
    await btn.click();
    await this.pause();
  }

  async priceText(): Promise<string> {
    return (await this.price.first().innerText()).trim();
  }
}
