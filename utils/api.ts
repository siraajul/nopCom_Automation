import { Page, expect } from '@playwright/test';
import type { Account } from './fixtures';

/**
 * Hybrid (API-assisted) setup helper.
 *
 * Creates a customer account by POSTing the nopCommerce registration form
 * directly, instead of typing into the UI field-by-field. This is the
 * "set up via API, assert via UI" pattern: it makes account creation for the
 * login tests faster and less flaky, while the registration *feature* itself
 * is still covered by real UI tests in registration.spec.ts.
 *
 * Why it still needs a browser page:
 * The demo store is fronted by Cloudflare. A raw (non-browser) request context
 * has no Cloudflare clearance and gets blocked. So we:
 *   1. open /register in the real (headed) browser, which clears Cloudflare,
 *   2. read the anti-forgery (__RequestVerificationToken) value from the form,
 *   3. submit via page.request.post(), which reuses the browser's cookies
 *      (Cloudflare clearance + anti-forgery), so the POST is accepted.
 */
export async function registerViaApi(page: Page, account: Account): Promise<Account> {
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  // Wait for the store chrome so Cloudflare's interstitial has cleared.
  await expect(page.locator('#customerCurrency')).toBeVisible({ timeout: 40_000 });

  const token = await page
    .locator('input[name="__RequestVerificationToken"]')
    .first()
    .inputValue();

  const response = await page.request.post('/register', {
    form: {
      Gender: 'M',
      FirstName: account.firstName,
      LastName: account.lastName,
      Email: account.email,
      Company: '',
      Newsletter: 'true',
      Password: account.password,
      ConfirmPassword: account.password,
      __RequestVerificationToken: token,
      'register-button': '',
    },
  });

  const body = await response.text();
  const succeeded =
    response.url().includes('registerresult') ||
    body.includes('Your registration completed');

  if (!succeeded) {
    throw new Error(
      `API registration failed (status ${response.status()}, url ${response.url()})`,
    );
  }

  return account;
}
