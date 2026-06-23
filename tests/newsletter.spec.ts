import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { uniqueEmail } from '../utils/helpers';

/**
 * Feature: Newsletter Subscription (footer)
 * Scenarios:
 *   Pass  - a valid email subscribes successfully
 *   Fail  - a malformed email is rejected
 *   Edge  - an empty email is rejected
 */
test.describe('Newsletter Subscription', () => {
  // ----- PASS: valid email subscribes -----
  test('PASS: subscribing with a valid email succeeds', async ({ page }) => {
    const home = new BasePage(page);
    await home.goto('/');

    await home.subscribeNewsletter(uniqueEmail('newsletter'));
    expect(await home.newsletterMessage()).toContain('Thank you for signing up');
  });

  // ----- FAIL: malformed email is rejected -----
  test('FAIL: subscribing with a malformed email is rejected', async ({ page }) => {
    const home = new BasePage(page);
    await home.goto('/');

    await home.subscribeNewsletter('plainaddress');
    expect(await home.newsletterMessage()).toContain('Enter valid email');
  });

  // ----- EDGE: empty email is rejected -----
  test('EDGE: subscribing with an empty email is rejected', async ({ page }) => {
    const home = new BasePage(page);
    await home.goto('/');

    await home.subscribeNewsletter('');
    expect(await home.newsletterMessage()).toContain('Enter valid email');
  });
});
