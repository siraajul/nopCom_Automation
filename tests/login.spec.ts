import { test, expect, Account } from '../utils/fixtures';
import { LoginPage } from '../pages/LoginPage';
import users from './data/users.json';

/**
 * Feature: Login (/login)
 * Scenarios: Pass (valid credentials) | Fail (data-driven invalid credential sets) | Edge (valid email, wrong password)
 *
 * The valid account comes from the worker-scoped `account` fixture so the test
 * does not depend on any pre-seeded data in the shared demo store.
 */
test.describe('Login', () => {
  // ----- PASS: a registered customer can log in -----
  test('PASS: registered customer logs in successfully', async ({ page, account }: { page: any; account: Account }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(account.email, account.password);

    await expect(login.logoutLink).toBeVisible();
    // Confirm it is THIS customer who is logged in: the account info page
    // pre-fills the registered email.
    await page.goto('/customer/info');
    await expect(page.locator('#Email')).toHaveValue(account.email);
  });

  // ----- FAIL: data-driven negative credential sets -----
  for (const cred of users.invalidLogins) {
    test(`FAIL: login rejected - ${cred.case}`, async ({ page }) => {
      const login = new LoginPage(page);
      await login.open();
      await login.login(cred.email, cred.password);

      // Still on the login page, not authenticated.
      await expect(login.logoutLink).toBeHidden();
      await expect(page.locator('body')).toContainText(cred.expectedError, { ignoreCase: true });
    });
  }

  // ----- EDGE: correct email but wrong password -----
  test('EDGE: correct email with wrong password is rejected', async ({ page, account }: { page: any; account: Account }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(account.email, 'definitely-the-wrong-password');

    await expect(login.summaryError).toBeVisible();
    await expect(login.logoutLink).toBeHidden();
  });
});
