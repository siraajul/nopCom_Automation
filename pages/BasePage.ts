import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage holds behaviour shared by every page object:
 *  - resilient navigation that survives the Cloudflare "Just a moment..." gate
 *  - the global header/footer controls (search, currency, newsletter, links)
 *
 * Every concrete page object extends this class so feature pages can reuse the
 * header search box, currency dropdown, cart/wishlist links, etc.
 */
export class BasePage {
  readonly page: Page;

  // ---- Header ----
  readonly currencySelect: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly registerLink: Locator;
  readonly loginLink: Locator;
  readonly logoutLink: Locator;
  readonly accountLink: Locator;
  readonly wishlistLink: Locator;
  readonly cartLink: Locator;
  readonly cartQtyBadge: Locator;
  readonly wishlistQtyBadge: Locator;

  // ---- Footer newsletter ----
  readonly newsletterEmail: Locator;
  readonly newsletterButton: Locator;
  readonly newsletterResult: Locator;

  constructor(page: Page) {
    this.page = page;

    this.currencySelect = page.locator('#customerCurrency');
    this.searchInput = page.locator('#small-searchterms');
    this.searchButton = page.locator('button.search-box-button');
    this.registerLink = page.locator('a.ico-register');
    this.loginLink = page.locator('a.ico-login');
    this.logoutLink = page.locator('a.ico-logout');
    this.accountLink = page.locator('.header-links a.account');
    this.wishlistLink = page.locator('#topcartlink ~ li a.ico-wishlist, a.ico-wishlist');
    this.cartLink = page.locator('a.ico-cart');
    this.cartQtyBadge = page.locator('.cart-qty');
    this.wishlistQtyBadge = page.locator('.wishlist-qty');

    this.newsletterEmail = page.locator('#newsletter-email');
    this.newsletterButton = page.locator('#newsletter-subscribe-button');
    this.newsletterResult = page.locator('#newsletter-result-block');
  }

  /**
   * Navigate to a relative path and wait until the real store chrome is rendered.
   * The wait on the currency selector lets the Cloudflare interstitial clear
   * before the test starts interacting with the page.
   */
  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.waitForStoreReady();
  }

  /**
   * Wait for the page to be ready for interaction:
   *  1. past Cloudflare's "Just a moment..." interstitial (header visible), and
   *  2. past Cloudflare Rocket Loader, which gates EVERY inline event handler on
   *     the site behind `window.__cfRLUnblockHandlers`. Until that flag is true,
   *     clicks on Add-to-cart / Add-to-wishlist / Login / currency / newsletter
   *     silently no-op. Waiting for it makes all those interactions reliable.
   *
   * Cloudflare sometimes shows a slower "Performing security verification"
   * managed challenge. It auto-refreshes itself and clears on its own, so we
   * WAIT patiently first (reloading mid-challenge can reset it) and only reload
   * as a last resort.
   */
  async waitForStoreReady(): Promise<void> {
    // First, give the challenge ample time to auto-clear without interfering.
    try {
      await this.currencySelect.waitFor({ state: 'visible', timeout: 45_000 });
    } catch {
      // Still blocked — nudge it with reloads as a fallback.
      for (let attempt = 0; attempt < 2; attempt++) {
        await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
        try {
          await this.currencySelect.waitFor({ state: 'visible', timeout: 25_000 });
          break;
        } catch {
          /* try again */
        }
      }
    }
    await expect(this.currencySelect).toBeVisible({ timeout: 20_000 });

    // Wait for Rocket Loader to unblock inline handlers (best-effort).
    await this.page
      .waitForFunction(() => (window as any).__cfRLUnblockHandlers === true, null, {
        timeout: 15_000,
      })
      .catch(() => {});
  }

  // ---- Shared header actions ----

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /**
   * Switch the store currency. The native <select> onchange is gated by
   * Cloudflare Rocket Loader (`__cfRLUnblockHandlers`) and does not reliably
   * navigate under automation, so we read the option's `changecurrency` URL
   * (the option value) and navigate to it directly — the same effect the UI has.
   */
  async selectCurrency(label: 'US Dollar' | 'Euro'): Promise<void> {
    const url = await this.currencySelect
      .locator('option', { hasText: label })
      .getAttribute('value');
    if (!url) throw new Error(`Currency option not found: ${label}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.waitForStoreReady();
  }

  /** The option <value> (changecurrency URL) for a currency label. */
  async currencyOptionValue(label: 'US Dollar' | 'Euro'): Promise<string> {
    return (
      (await this.currencySelect.locator('option', { hasText: label }).getAttribute('value')) ?? ''
    );
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async openWishlist(): Promise<void> {
    await this.wishlistLink.click();
  }

  async cartQuantity(): Promise<number> {
    const text = (await this.page.locator('.cart-qty').first().innerText()).replace(/[()]/g, '');
    return Number(text.trim() || 0);
  }

  async wishlistQuantity(): Promise<number> {
    const text = (await this.page.locator('.wishlist-qty').first().innerText()).replace(/[()]/g, '');
    return Number(text.trim() || 0);
  }

  async isLoggedIn(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }

  async logout(): Promise<void> {
    if (await this.isLoggedIn()) {
      await this.logoutLink.click();
      await this.waitForStoreReady();
    }
  }

  // ---- Newsletter (footer) ----

  async subscribeNewsletter(email: string): Promise<void> {
    await this.newsletterEmail.scrollIntoViewIfNeeded();
    await this.newsletterEmail.fill(email);
    await this.newsletterButton.click();
    // The subscribe handler is bound by a deferred (Rocket Loader) script, so a
    // very fast click can no-op. Retry once if the result block hasn't shown.
    try {
      await expect(this.newsletterResult).toBeVisible({ timeout: 8_000 });
    } catch {
      await this.newsletterButton.click();
      await expect(this.newsletterResult).toBeVisible({ timeout: 8_000 });
    }
  }

  async newsletterMessage(): Promise<string> {
    await expect(this.newsletterResult).toBeVisible();
    return (await this.newsletterResult.innerText()).trim();
  }

  /** Text of the top-of-page bar notification (add-to-cart / wishlist toasts). */
  async barNotificationText(): Promise<string> {
    const bar = this.page.locator('#bar-notification .content').first();
    await expect(bar).toBeVisible({ timeout: 15_000 });
    return (await bar.innerText()).trim();
  }
}
