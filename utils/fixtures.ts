import { test as base, expect } from '@playwright/test';
import { uniqueEmail, strongPassword } from './helpers';
import { registerViaApi } from './api';

export interface Account {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Custom test fixture providing a freshly registered `account`.
 *
 * It is WORKER-SCOPED: one real account is created per worker (in its own
 * isolated context) and reused by every test in that worker. This keeps the
 * login / duplicate-registration tests independent of any pre-existing data on
 * the shared demo store, while avoiding a setup round-trip per test.
 *
 * Account creation uses the HYBRID API helper (registerViaApi) — form POST
 * instead of UI clicks — so setup is faster and more robust than driving the
 * registration form. The registration *feature* is still tested via the UI in
 * registration.spec.ts.
 */
export const test = base.extend<{}, { account: Account }>({
  account: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const account: Account = {
        firstName: 'Auto',
        lastName: 'Tester',
        email: uniqueEmail('login.fixture'),
        password: strongPassword(),
      };

      await registerViaApi(page, account);
      await context.close();

      await use(account);
    },
    { scope: 'worker' },
  ],
});

export { expect };
