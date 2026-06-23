import { test, expect } from '@playwright/test';
import { ProductPage } from '../pages/ProductPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CartPage } from '../pages/CartPage';
import search from './data/search.json';

/**
 * Feature: Wishlist (/wishlist)
 * Scenarios:
 *   Pass  - add a product to the wishlist
 *   Fail  - an empty wishlist shows the empty-state message
 *   Edge  - move a wishlist item into the cart
 */
test.describe('Wishlist', () => {
  // ----- FAIL/empty-state: wishlist is empty for a fresh session -----
  test('FAIL: a fresh wishlist is empty', async ({ page }) => {
    const wishlist = new WishlistPage(page);
    await wishlist.open();

    await expect(wishlist.emptyMessage).toBeVisible();
    await expect(wishlist.emptyMessage).toContainText('The wishlist is empty');
  });

  // ----- PASS: add a product to the wishlist -----
  test('PASS: add a product to the wishlist', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open(search.products.simple);
    await product.addToWishlist();

    expect(await product.barNotificationText()).toContain(
      'The product has been added to your wishlist',
    );
    await expect(product.wishlistQtyBadge).toContainText('(1)');

    const wishlist = new WishlistPage(page);
    await wishlist.open();
    expect(await wishlist.itemCount()).toBeGreaterThan(0);
    await expect(wishlist.rows.first()).toContainText(search.products.simpleName);
  });

  // ----- EDGE: move the wishlist item into the cart -----
  test('EDGE: move a wishlist item into the cart', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open(search.products.simple);
    await product.addToWishlist();
    await product.barNotificationText();

    const wishlist = new WishlistPage(page);
    await wishlist.open();
    await wishlist.moveAllToCart();

    const cart = new CartPage(page);
    await expect(page).toHaveURL(/\/cart/);
    expect(await cart.itemCount()).toBeGreaterThan(0);
  });
});
