import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';
import search from './data/search.json';

/**
 * Feature: Product Search (header search box)
 * Scenarios: Pass (data-driven keywords return results) | Fail (gibberish -> no results) | Edge (term below min length)
 */
test.describe('Product Search', () => {
  // ----- PASS: data-driven over several keywords -----
  for (const item of search.valid) {
    test(`PASS: searching "${item.term}" returns matching products`, async ({ page }) => {
      const sp = new SearchPage(page);
      await sp.goto('/');
      await sp.searchFor(item.term);

      await expect(sp.productItems.first()).toBeVisible();
      expect(await sp.resultCount()).toBeGreaterThan(0);

      const titles = (await sp.titles()).join(' | ').toLowerCase();
      expect(titles).toContain(item.expectContains);
    });
  }

  // ----- FAIL: a nonsense term returns the "no products" message -----
  test('FAIL: gibberish search returns no products', async ({ page }) => {
    const sp = new SearchPage(page);
    await sp.goto('/');
    await sp.searchFor(search.noResults);

    await expect(sp.noResult).toBeVisible();
    await expect(sp.noResult).toContainText('No products were found');
    expect(await sp.resultCount()).toBe(0);
  });

  // ----- EDGE: a term shorter than the minimum length is rejected -----
  test('EDGE: search term below minimum length shows a warning', async ({ page }) => {
    const sp = new SearchPage(page);
    await sp.goto('/');
    await sp.searchFor(search.tooShort);

    await expect(sp.warning.first()).toContainText('Search term minimum length is 3 characters');
  });
});
