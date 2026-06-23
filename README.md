<div align="center">

# nopCommerce Playwright Automation

UI automation for [demo.nopcommerce.com](https://demo.nopcommerce.com/), written in Playwright + TypeScript.

![Tests](https://img.shields.io/badge/tests-34%20passed-brightgreen)
![Playwright](https://img.shields.io/badge/Playwright-1.61-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Pattern](https://img.shields.io/badge/pattern-Page%20Object%20Model-1f6feb)
![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)
![Retries](https://img.shields.io/badge/proof-34%2F34%20at%20--retries%3D0-success)

<br>

<img src="docs/assets/pulse-dashboard.png" alt="Playwright Pulse dashboard, 34 passed" width="850">

<sub><i>The Pulse dashboard after a clean run: 34 passing, nothing failed, nothing flaky.</i></sub>

</div>

---

## What this is

Nine features, 34 tests, Page Object Model. It drives a real Chrome through the
nopCommerce demo store, registering, logging in, searching, adding to cart, and
buying things, then checks that the right stuff happens and that bad input gets
turned away.

The thing I did not expect going in: the demo store sits behind Cloudflare, and
Cloudflare really does not want a script clicking around in there. A good chunk
of the work below is about getting an ordinary browser past that gate without
doing anything shady. That story is in [The hard parts](#the-hard-parts), and
it's the part actually worth reading.

## At a glance

| | |
|---|---|
| App under test | https://demo.nopcommerce.com/ |
| Stack | Playwright, TypeScript, Page Object Model |
| Features automated | 9 (8 core + an end-to-end checkout) |
| Executed tests | 34 (Pass / Fail / Edge, several data-driven) |
| Page objects | 9 (`BasePage` + 8 feature pages) |
| Reporting | Playwright HTML + Playwright Pulse (with trends) |
| On failure | screenshot, trace, and video are kept |
| Last run | 34 passed, and still 34/34 with `--retries=0` |

## Quick start

```bash
# 1. Install
npm install
npx playwright install chromium      # first time only

# 2. Run everything
npm test

# 3. Open the report
npm run report
```

One heads-up before you hit run: Chrome windows are going to pop open and you'll
watch them click around. That's on purpose. Cloudflare blocks headless browsers
on this site, so the tests run headed; two workers means two windows. If that
drives you up the wall, add `--workers=1`.

## What's automated

| # | Feature | Spec | Pass / Fail / Edge |
|---|---------|------|--------------------|
| 1 | User Registration | `registration.spec.ts` | valid sign-up *(data-driven ×2)* · duplicate email · invalid fields |
| 2 | Login | `login.spec.ts` | valid login · invalid sets *(data-driven ×3)* · wrong password |
| 3 | Product Search | `search.spec.ts` | keywords *(data-driven ×3)* · no results · below min length |
| 4 | Add to Cart | `addToCart.spec.ts` | add product · invalid coupon · quantity update |
| 5 | Wishlist | `wishlist.spec.ts` | add to wishlist · empty state · move to cart |
| 6 | Currency Change | `currency.spec.ts` | switch to Euro · constrained options · persists on nav |
| 7 | Newsletter | `newsletter.spec.ts` | valid email · malformed email · empty email |
| 8 | Contact Us | `contactUs.spec.ts` | valid enquiry · invalid email · long body |
| 9 | E2E Checkout | `e2e-checkout.spec.ts` | guest · logged-in user · register→buy · empty-cart blocked · ToS gate |

Full scenario tables (precondition, steps, expected result) live in
[`docs/test-scenarios.md`](docs/test-scenarios.md). The feature
picks and why they're worth automating are in
[`docs/feature-selection.md`](docs/feature-selection.md).

## How it's organized

```
nopCom_Automation/
├── pages/                       # Page Object Model: selectors + actions
│   ├── BasePage.ts              #   shared header/footer + Cloudflare-ready navigation
│   ├── RegisterPage.ts  LoginPage.ts  SearchPage.ts  ProductPage.ts
│   ├── CartPage.ts  WishlistPage.ts  ContactPage.ts
│   └── CheckoutPage.ts          #   one-page checkout wizard (resilient stepper)
├── tests/                       # the suite: intent only, no raw selectors
│   ├── data/                    #   data-driven inputs (users.json, search.json)
│   ├── *.spec.ts                #   8 feature specs
│   └── e2e-checkout.spec.ts     #   3 end-to-end journeys + negative/edge
├── utils/                       # the plumbing
│   ├── fixtures.ts              #   worker-scoped `account` fixture
│   ├── api.ts                   #   account creation via form POST
│   └── helpers.ts               #   unique data generators
├── docs/                        # Step 1 & Step 2 write-ups (+ VitePress site)
├── playwright.config.ts         # headed/Cloudflare config, reporters, retries
└── tsconfig.json
```

The split I care about: `pages/`, `utils/`, and the config are the framework, and
there isn't a single test in them. You could add a hundred specs without opening
that layer. The `tests/` files only say *what* to check. They never learn how to
find a button.

## The hard parts

This is the section I'd actually read. "Automate a demo store" sounds like a
warm-up. It was not.

### Cloudflare blocks headless, end of story

Run Playwright headless against this site and you sit on "Just a moment…" until
the timeout kills you. I probed it across launch configs instead of guessing, and
the pattern was blunt: headless never gets through, headed does. The fix is three
things, and all three matter. Run headed. Drop the automation flag
(`--disable-blink-features=AutomationControlled`) so `navigator.webdriver` stops
shouting "I'm a robot." And do **not** override the user agent. The one that
burned me was a Playwright device descriptor quietly sending a *Windows* UA from a
Mac. Cloudflare noticed the mismatch and kept looping the challenge. Native UA,
problem gone.

To be clear about what this is: not an exploit, not a CAPTCHA solver. It's making
a real browser look like the real browser it is so the non-interactive challenge
clears on its own. The long version, with the probe results, is in
[`docs/Cloudflare-Bypass.md`](docs/Cloudflare-Bypass.md).

### Clicks that quietly do nothing

This one cost me an hour of "the click worked, the page shrugged." Cloudflare
Rocket Loader wraps every inline `onclick` in a guard
(`if (!window.__cfRLUnblockHandlers) return false`). Click an Add-to-cart button
before that flag flips and the handler bails. Playwright reports a successful
click; the cart stays empty; no error, no trace. `BasePage.waitForStoreReady()`
now waits for the flag before anyone touches the page, so the click lands on a
live handler.

### Checkout keeps moving the goalposts

The one-page checkout is an AJAX wizard, and the steps aren't even the same every
time. A logged-in user with no saved address gets an extra shipping step that a
guest never sees. Hardcoding the sequence broke constantly, so
`CheckoutPage.completeOrder()` just clicks whichever step button is currently
live and loops until the order confirms. It also waits out a state-dropdown that
reloads its options over AJAX and silently throws away your selection if you're
half a second early.

### Creating accounts without clicking through signup

The login and checkout tests need a real account, and registering through the UI
every run is slow and one more thing to flake. So `utils/api.ts` posts the
registration form directly (reusing the browser's Cloudflare and anti-forgery
cookies), and the UI handles the actual feature under test. Set up over the wire,
assert through the screen. The account fixture is worker-scoped, created once per
worker, so no test leans on data another test left behind.

### Tests that check something real

Every test asserts a concrete result: an exact message, a state change (cart
count went up by one, the logout link appeared), or proof the bad thing didn't
happen. Nothing passes just because no exception got thrown. A green test that
never actually checked anything is worse than a red one.

## Reporting

There are two reports, because they're good at different things.

**Playwright HTML** lands in `playwright-report/` after every run:

```bash
npm run report          # opens the last HTML report
```

**Playwright Pulse** is the dashboard in the screenshot up top, and it tracks
trends across runs:

```bash
npm test                # writes pulse-report/playwright-pulse-report.json
npm run report:pulse    # builds the self-contained playwright-pulse-static-report.html
```

One gotcha worth remembering: Pulse only shows the *last* run. Run a subset, get a
report of that subset. Run the full suite first if you want the full picture.

When a test fails it leaves behind a screenshot, a trace you can open with
`npx playwright show-trace`, and a video.

## How to run the framework

Node 18+. One-time setup is `npm install && npx playwright install chromium`.

**Run everything**
```bash
npm test
```
All 34 tests, headed, two workers. Drops the HTML report in `playwright-report/`
and the Pulse JSON in `pulse-report/`.

**Run a subset**
```bash
npx playwright test login.spec.ts                 # one feature file
npx playwright test login currency search         # several features
npx playwright test -g "GUEST can search"         # one scenario by title
npx playwright test e2e-checkout.spec.ts          # all checkout journeys
```
Target by title (`-g`) rather than a line number. Line numbers move the moment
you edit a file; titles don't.

**Windows and speed**
```bash
npx playwright test --workers=1     # one window, easiest to watch
npx playwright test --workers=4     # faster, four windows
npm run test:ui                     # UI mode, pick and inspect tests
npm run test:headed                 # explicitly headed
```

**Re-run only the failures**
```bash
npm run test:retry-failed           # = playwright test --last-failed
```

**Slow it down for a screen recording**
```bash
npm run test:slow                                            # 10s per step, full-screen, video on
STEP_DELAY=10000 npx playwright test -g "GUEST can search"   # record one journey
STEP_DELAY=5000  npx playwright test -g "REGISTER then"      # 5s per step
```
`STEP_DELAY` pauses after each logical step so the run is easy to follow, opens a
1680×1000 window so it fills the screen, and records full-resolution video. Normal
runs ignore it.

**Record video of every test**
```bash
npm run test:video      # VIDEO=on, saves test-results/**/video.webm
```

## About reliability (the honest bit)

It's stable. It is not magic, and I'm not going to tell you a public demo behind
Cloudflare passes 100% of the time forever, because that would be a lie.

Here's what I can actually show you. It passes 34/34 with retries turned off, so
nothing is hiding behind a lucky second attempt. Earlier, one no-retry run *did*
fail, a single test stuck on Cloudflare's slower "security verification" screen
that didn't clear in time. I traced it (environmental, not the test), gave the
wait more patience and a 120s budget, and it's been 34/34 since.

`retries: 1` stays in the config as a seatbelt for a shared public site, and when
a retry rescues a test, Playwright flags it as `flaky` in the report. Nothing gets
swept under the rug. That's the honest posture for live-site testing: solid test
logic, a visible safety net, and flakes you can see rather than ones you can't.

## Tech stack

Playwright Test, TypeScript, Page Object Model, data-driven JSON, worker-scoped
fixtures, and `@arghajit/playwright-pulse-report` for the dashboard.

## Deliverables

- [`docs/feature-selection.md`](docs/feature-selection.md): the 8 features and why each is worth automating
- [`docs/test-scenarios.md`](docs/test-scenarios.md): the Pass/Fail/Edge scenario tables
