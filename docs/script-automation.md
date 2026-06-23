---
pageClass: page-wide
aside: false
---

# Step 3: Script Automation

The assignment asks for at least 24 scripts (8 features × 3 scenarios), a clean
structure, data-driven testing, and tests that each run on their own, give a
clear result, and leave evidence behind when they fail. Here's how the suite
lines up against each of those, with the actual code doing the work.

## At least 24 scripts: there are 34

Eight features times three scenarios is the 24-script floor. The suite clears it
because the ninth feature (checkout) adds five more, and three scenarios are
data-driven, so they run more than once.

| Spec file | Tests | Notes |
|-----------|------:|-------|
| `registration.spec.ts` | 4 | valid sign-up runs twice (male + female profile) |
| `login.spec.ts` | 5 | the invalid case runs three times (data-driven) |
| `search.spec.ts` | 5 | the keyword case runs three times (data-driven) |
| `addToCart.spec.ts` | 3 | add, invalid coupon, quantity change |
| `wishlist.spec.ts` | 3 | add, empty state, move to cart |
| `currency.spec.ts` | 3 | switch, constrained options, persistence |
| `newsletter.spec.ts` | 3 | valid, malformed, empty |
| `contactUs.spec.ts` | 3 | valid, invalid email, long body |
| `e2e-checkout.spec.ts` | 5 | guest, logged-in, register-then-buy, empty cart, ToS gate |
| **Total** | **34** | |

## Clean structure: Page Object Model

Selectors and actions live in `pages/`; the specs only describe intent. A spec
never contains a CSS selector. When the demo store changes a button, one page
object gets edited, not nine test files.

```
nopCom_Automation/
├── pages/                       # Page Object Model: selectors + actions
│   ├── BasePage.ts              #   shared header/footer + Cloudflare-ready nav
│   ├── RegisterPage.ts
│   ├── LoginPage.ts
│   ├── SearchPage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   ├── WishlistPage.ts
│   ├── ContactPage.ts
│   └── CheckoutPage.ts          #   one-page checkout wizard
├── tests/                       # the suite: what to check, never how to find it
│   ├── data/
│   │   ├── users.json           #   data-driven: logins + registration profiles
│   │   └── search.json          #   data-driven: search keywords
│   ├── registration.spec.ts
│   ├── login.spec.ts
│   ├── search.spec.ts
│   ├── addToCart.spec.ts
│   ├── wishlist.spec.ts
│   ├── currency.spec.ts
│   ├── newsletter.spec.ts
│   ├── contactUs.spec.ts
│   └── e2e-checkout.spec.ts     #   3 journeys + negative/edge
├── utils/
│   ├── fixtures.ts              #   worker-scoped account fixture
│   ├── api.ts                   #   account creation via form POST
│   └── helpers.ts               #   unique data generators
├── docs/                        # this VitePress documentation site
├── playwright.config.ts         # headed/Cloudflare config, reporters, retries
├── tsconfig.json
└── package.json
```

`pages/`, `utils/`, and the config are the framework, and there's not a single
test in them. You could add a hundred specs without touching that layer.

## Data-driven testing

Three things are driven from JSON in `tests/data/`, so adding a case means
editing data, not writing a new test.

- **Login negatives**: three credential sets (unknown email, empty email,
  malformed email), each with the error message it should produce.
- **Registration**: a male and a female profile.
- **Search**: three keywords, each with the term it expects back in the results.

The login spec loops over its data and generates one independent test per row:

```ts
for (const cred of users.invalidLogins) {
  test(`FAIL: login rejected - ${cred.case}`, async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(cred.email, cred.password);
    await expect(login.logoutLink).toBeHidden();                 // didn't get in
    await expect(page.locator('body')).toContainText(cred.expectedError, { ignoreCase: true });
  });
}
```

`tests/data/users.json` (trimmed):

```json
{
  "invalidLogins": [
    { "case": "unknown email",   "email": "no.such.user.qa@example.com", "password": "Whatever123", "expectedError": "no customer account found" },
    { "case": "empty email",     "email": "",                            "password": "Whatever123", "expectedError": "Please enter your email" },
    { "case": "malformed email", "email": "not-an-email",                "password": "Whatever123", "expectedError": "valid email" }
  ]
}
```

## Each test runs independently

`fullyParallel: true`, and every test gets its own browser context with fresh
cookies and storage, so order never matters and nothing leaks between tests.

The tricky case is the login and checkout tests, which need a real account.
Rather than have one test register and the next one log in (which would couple
them), a **worker-scoped fixture** in `utils/fixtures.ts` creates one account per
worker and hands it to whoever asks. It builds the account by posting the
registration form directly (`utils/api.ts`), so setup is fast and doesn't depend
on any data another test left lying around.

```ts
export const test = base.extend<{}, { account: Account }>({
  account: [async ({ browser }, use) => {
    const context = await browser.newContext();
    const account = { firstName: 'Auto', lastName: 'Tester',
                      email: uniqueEmail('login.fixture'), password: strongPassword() };
    await registerViaApi(await context.newPage(), account);   // set up over the wire
    await context.close();
    await use(account);
  }, { scope: 'worker' }],
});
```

Emails are generated unique per run (`uniqueEmail`), so re-running the suite never
collides with accounts from a previous run.

## Pass/fail from a real assertion

Every test ends on a concrete check, not "did it throw." Three kinds show up:

- **Exact output**: the success or error message the app should show.
- **State change**: the cart count went up by one, the logout link appeared, the
  selected currency stuck.
- **Negative**: the bad thing did *not* happen (still logged out, no checkout
  button on an empty cart).

A green test that never actually checked anything is worse than a red one, so
none of them lean on the absence of an exception.

## Screenshot and log on failure

Configured once, applies to every test:

```ts
// playwright.config.ts
use: {
  screenshot: 'only-on-failure',   // PNG of the moment it broke
  trace: 'retain-on-failure',      // full timeline, open with `npx playwright show-trace`
  video: 'retain-on-failure',      // recording of the run
}
```

When a test fails, its folder under `test-results/` holds the screenshot, the
trace, and the video, and the failure shows up in both the Playwright HTML report
and the Pulse dashboard. The `--list` reporter and `npm run report` cover the log
side.

## Running them

```bash
npm test                                   # all 34
npx playwright test login.spec.ts          # one feature
npx playwright test -g "GUEST can search"  # one scenario by title
npm run test:retry-failed                  # just what failed last time
```

Full command list is on the [How to Run](/guide/running) page.
