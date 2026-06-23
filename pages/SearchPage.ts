import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page object for the search results page (/search). */
export class SearchPage extends BasePage {
  readonly advancedSearchInput: Locator;
  readonly advancedSearchButton: Locator;
  readonly productItems: Locator;
  readonly productTitles: Locator;
  readonly warning: Locator;
  readonly noResult: Locator;

  constructor(page: Page) {
    super(page);
    this.advancedSearchInput = page.locator('#q');
    this.advancedSearchButton = page.locator('.search-input button.button-1, button.search-button');
    this.productItems = page.locator('.product-item');
    this.productTitles = page.locator('.product-item .product-title a');
    this.warning = page.locator('.search-results .warning, .warning');
    this.noResult = page.locator('.no-result');
  }

  async open(): Promise<void> {
    await this.goto('/search');
  }

  async resultCount(): Promise<number> {
    return this.productItems.count();
  }

  async titles(): Promise<string[]> {
    return this.productTitles.allInnerTexts();
  }

  async warningText(): Promise<string> {
    return (await this.warning.first().innerText()).trim();
  }
}
