import { test, expect } from '@playwright/test';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import search from './data/search.json';

/**
 * Feature: Add to Cart (/cart)
 * Scenarios:
 *   Pass  - add a product to the cart
 *   Fail  - applying an invalid discount coupon is rejected
 *   Edge  - updating the line quantity recalculates the cart
 */
test.describe('Add to Cart', () => {
  // ----- PASS: a simple product is added to the cart -----
  test('PASS: add a product to the shopping cart', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open(search.products.simple);

    const beforeQty = await product.cartQuantity();
    await product.addToCart();

    expect(await product.barNotificationText()).toContain(
      'The product has been added to your shopping cart',
    );
    await expect(product.cartQtyBadge).toContainText(`(${beforeQty + 1})`);

    const cart = new CartPage(page);
    await cart.open();
    expect(await cart.itemCount()).toBeGreaterThan(0);
  });

  // ----- FAIL: invalid coupon code is rejected -----
  test('FAIL: applying an invalid coupon code shows an error', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open(search.products.simple);
    await product.addToCart();
    await product.barNotificationText(); // wait for the add to settle

    const cart = new CartPage(page);
    await cart.open();
    await cart.applyCoupon('INVALID-COUPON-XYZ');

    expect(await cart.couponMessageText()).toContain('The coupon code cannot be found');
  });

  // ----- EDGE: changing the quantity updates the cart -----
  test('EDGE: updating the line quantity recalculates the cart', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open(search.products.simple);
    await product.addToCart();
    await product.barNotificationText();

    const cart = new CartPage(page);
    await cart.open();
    await cart.updateQuantity(0, 3);

    await expect(cart.quantityInputs.first()).toHaveValue('3');
    await expect(product.cartQtyBadge).toContainText('(3)');
  });
});
