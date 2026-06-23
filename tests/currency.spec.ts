import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

/**
 * Feature: Currency Change (header currency selector)
 * Scenarios:
 *   Pass  - switching to Euro renders prices with the EUR symbol
 *   Fail  - the selector only exposes supported currencies (no arbitrary value)
 *   Edge  - the chosen currency persists across navigation
 */
const PRICE = '.actual-price, .prices';

test.describe('Currency Change', () => {
  // ----- PASS: switch to Euro -----
  test('PASS: switching to Euro shows euro prices', async ({ page }) => {
    const home = new BasePage(page);
    await home.goto('/');

    await home.selectCurrency('Euro');

    await expect(page.locator(PRICE).first()).toContainText('€');
  });

  // ----- FAIL/negative: unsupported currencies are not selectable -----
  test('FAIL: only supported currencies are offered', async ({ page }) => {
    const home = new BasePage(page);
    await home.goto('/');

    const options = await home.currencySelect.locator('option').allInnerTexts();
    expect(options.map((o) => o.trim())).toEqual(['US Dollar', 'Euro']);

    // Attempting to select a currency that doesn't exist must throw.
    await expect(home.currencySelect.selectOption({ label: 'Bitcoin' })).rejects.toThrow();
  });

  // ----- EDGE: selection persists across navigation -----
  test('EDGE: selected currency persists after navigating', async ({ page }) => {
    const home = new BasePage(page);
    await home.goto('/');

    await home.selectCurrency('Euro');

    // Navigate elsewhere and confirm Euro is still selected & prices are in EUR.
    // (The option *value* is a per-page URL, so we assert the selected label.)
    await home.searchFor('phone');
    await expect(home.currencySelect.locator('option:checked')).toHaveText('Euro');
    await expect(page.locator(PRICE).first()).toContainText('€');
  });
});
