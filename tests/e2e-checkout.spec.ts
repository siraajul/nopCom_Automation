import { test, expect, Account } from '../utils/fixtures';
import { Page } from '@playwright/test';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage, BillingDetails } from '../pages/CheckoutPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SearchPage } from '../pages/SearchPage';
import { uniqueEmail, strongPassword } from '../utils/helpers';
import search from './data/search.json';

/**
 * Feature: End-to-end Checkout — the real shopper journeys.
 *
 * Three complete purchase journeys (the highest-value flows on the store):
 *   1. PASS — as a GUEST              (visit → search → scroll → cart → guest checkout → order)
 *   2. PASS — as a LOGGED-IN USER     (login → add to cart → checkout → order)
 *   3. PASS — REGISTER then CHECKOUT  (register → add to cart → checkout → order)
 * Plus negative/edge coverage of the checkout gate:
 *   FAIL — empty cart cannot check out
 *   EDGE — checkout requires accepting the Terms of Service
 */

const BILLING: Omit<BillingDetails, 'firstName' | 'lastName' | 'email'> = {
  country: 'United States',
  state: 'New York',
  city: 'New York',
  address1: '123 Main Street',
  zip: '10001',
  phone: '5551234567',
};

/** Shared tail of every journey: add a product, go through checkout, place the order. */
async function addToCartAndPlaceOrder(
  page: Page,
  who: { firstName: string; lastName: string; email: string },
): Promise<string> {
  const product = new ProductPage(page);
  await product.open(search.products.simple);
  await product.addToCart();
  // Stable confirmation (toast auto-fades and is racy under slow-mo).
  await expect(product.cartQtyBadge).toContainText('(1)');

  const cart = new CartPage(page);
  await cart.open();
  expect(await cart.itemCount()).toBeGreaterThan(0);

  await cart.proceedToCheckout();
  await page.waitForURL(/checkoutasguest|onepagecheckout/, { timeout: 30_000 });

  // Guests get an interstitial; logged-in users go straight to checkout.
  if (page.url().includes('checkoutasguest')) {
    await cart.checkoutAsGuest();
    await page.waitForURL(/onepagecheckout/, { timeout: 30_000 });
  }

  const checkout = new CheckoutPage(page);
  await checkout.fillBilling({ ...BILLING, ...who });
  await checkout.completeOrder();
  return checkout.successText();
}

test.describe('E2E Checkout', () => {
  // ===== 1. PASS — Guest checkout (full visit→search→scroll→cart→checkout) =====
  test('PASS: GUEST can search, add to cart and place an order', async ({ page }) => {
    const sp = new SearchPage(page);
    await sp.goto('/');

    // Search for the product and scroll to it like a real shopper.
    await sp.searchFor(search.products.simpleName);
    await expect(sp.productItems.first()).toBeVisible();
    const productLink = sp.productTitles.filter({ hasText: search.products.simpleName }).first();
    await productLink.scrollIntoViewIfNeeded();
    await productLink.click();

    const product = new ProductPage(page);
    await product.waitForStoreReady(); // navigated via click → wait for handlers
    await product.addToCart();
    // Confirm via the persistent cart badge (the toast auto-fades, which is racy
    // under slow-mo / recording); the badge is a stable oracle.
    await expect(product.cartQtyBadge).toContainText('(1)');

    const cart = new CartPage(page);
    await cart.open();
    expect(await cart.itemCount()).toBeGreaterThan(0);

    await cart.proceedToCheckout();
    await page.waitForURL(/checkoutasguest|onepagecheckout/, { timeout: 30_000 });
    await cart.checkoutAsGuest();
    await page.waitForURL(/onepagecheckout/, { timeout: 30_000 });

    const checkout = new CheckoutPage(page);
    await checkout.fillBilling({
      ...BILLING,
      firstName: 'Guest',
      lastName: 'Shopper',
      email: uniqueEmail('guest.checkout'),
    });
    await checkout.completeOrder();

    expect(await checkout.successText()).toContain('Your order has been successfully processed');
  });

  // ===== 2. PASS — Registered user logs in, then checks out =====
  test('PASS: LOGGED-IN USER can log in and place an order', async ({ page, account }: { page: Page; account: Account }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(account.email, account.password);
    await expect(login.logoutLink).toBeVisible();

    const success = await addToCartAndPlaceOrder(page, {
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    });
    expect(success).toContain('Your order has been successfully processed');
  });

  // ===== 3. PASS — Register a new account, then checkout in the same session =====
  test('PASS: REGISTER then place an order', async ({ page }) => {
    const email = uniqueEmail('register.checkout');
    const register = new RegisterPage(page);
    await register.open();
    await register.register({
      gender: 'male',
      firstName: 'New',
      lastName: 'Buyer',
      email,
      password: strongPassword(),
    });
    await expect(register.successResult).toContainText('Your registration completed');

    // Registration auto-authenticates the customer; reuse their email at billing.
    const success = await addToCartAndPlaceOrder(page, {
      firstName: 'New',
      lastName: 'Buyer',
      email,
    });
    expect(success).toContain('Your order has been successfully processed');
  });

  // ===== FAIL — empty cart cannot check out =====
  test('FAIL: checkout is blocked when the cart is empty', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.open();

    await expect(cart.emptyMessage).toBeVisible();
    await expect(cart.emptyMessage).toContainText('Your Shopping Cart is empty!');
    await expect(cart.checkoutButton).toHaveCount(0);
  });

  // ===== EDGE — checkout requires accepting Terms of Service =====
  test('EDGE: checkout requires accepting the Terms of Service', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open(search.products.simple);
    await product.addToCart();
    // Confirm via the persistent cart badge (the toast auto-fades, which is racy
    // under slow-mo / recording); the badge is a stable oracle.
    await expect(product.cartQtyBadge).toContainText('(1)');

    const cart = new CartPage(page);
    await cart.open();

    // Click checkout WITHOUT ticking terms → a validation popup, stays on cart.
    page.once('dialog', (d) => d.accept());
    await cart.checkoutButton.click();
    await expect(page).toHaveURL(/\/cart/);
  });
});
