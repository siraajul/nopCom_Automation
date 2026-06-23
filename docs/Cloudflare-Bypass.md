# Getting Past Cloudflare

`demo.nopcommerce.com` sits behind a Cloudflare managed challenge. Point a default
Playwright run at it and you never even reach the store, you just sit on the
"Just a moment…" screen until the timeout gives up. This page is the story of how
the framework gets a real browser through, and the evidence behind each call I
made.

First, so nobody gets the wrong idea: this is not an exploit and it does not solve
a CAPTCHA. The demo store is meant to be used by browsers. The problem is that an
automated browser, out of the box, doesn't look like one, and Cloudflare can tell.
Everything here is about making Playwright present itself as the ordinary desktop
browser it actually is, so the non-interactive challenge clears on its own. No
solver services, no token farming, no spoofed headers.

## What you see when it's blocking you

Two screens show up:

| Page title | What it is |
|------------|------------|
| `Just a moment...` | Cloudflare's standard JS challenge, usually clears in a few seconds |
| `Performing security verification` | The slower managed challenge, can take 10s or more |

Until one of them clears, the real store never renders, so every test dies on the
very first navigation.

## What actually clears it

I didn't want to guess at this, so I probed the launch configs directly against
the live site. Each one loaded the home page and checked whether the header
(`#customerCurrency`) ever showed up:

| # | Launch config | Result |
|---|---------------|--------|
| A | bundled Chromium, headless | ❌ stuck on `Just a moment...` |
| B | real Chrome channel, headless, stealth arg | ❌ stuck |
| C | real Chrome, headed, stealth arg | ✅ gets through |
| D | bundled Chromium, headless, stealth arg | ❌ stuck |
| E | bundled Chromium, headed, stealth arg | ✅ **gets through** |

The verdict was blunt. Headless never makes it, no matter what you bolt on. Headed
does. And the bundled Chromium works, so there's no dependency on a
system-installed Chrome.

### The user-agent that cost me an afternoon

Here's the one that wasn't obvious. Playwright's `devices['Desktop Chrome']`
descriptor kept the challenge looping even with everything else right:

```
DIAG { wd:false, title:"Just a moment...",
       ua:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) ... Chrome/149 ..." }
```

`navigator.webdriver` was already `false`, which is what I wanted, but look at the
user agent: it claims **Windows**. On a **Mac**. That mismatch is exactly the kind
of thing Cloudflare flags. The moment I dropped the descriptor and let the browser
send its own native UA, it cleared:

```
ua:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ... Chrome/149 ..."  → clears
```

## The three things that do the job

```ts
// playwright.config.ts
use: {
  headless: false,                                            // (1) headed
  launchOptions: {
    args: ['--disable-blink-features=AutomationControlled'],  // (2) drop the automation flag
  },
  // (3) no devices['Desktop Chrome'] spread, so the native UA stays put
},
```

1. Headed. This is the big one. Headless is always blocked here.
2. `--disable-blink-features=AutomationControlled`, which clears `navigator.webdriver`, the loudest automation tell there is.
3. The native user agent. Never hand it a UA whose platform doesn't match the machine.

## The second wall: Rocket Loader

Getting through the challenge isn't the end of it. The store runs Cloudflare
Rocket Loader, which defers and rewrites inline scripts, and it wraps every inline
handler like this:

```html
<button id="add-to-cart-button-18"
  onclick="if (!window.__cfRLUnblockHandlers) return false;
           return AjaxCart.addproducttocart_details('/addproducttocart/details/18/1', ...)">
  Add to cart
</button>
```

Until `window.__cfRLUnblockHandlers` is `true`, that handler returns early and
does nothing. From Playwright's side the click looks fine. The product just never
lands in the cart, no toast, no error, no trace. This was the source of my most
baffling early failures: clicks that left no fingerprint at all.

The fix is to wait for the flag before touching anything:

```ts
// BasePage.waitForStoreReady()
await this.page.waitForFunction(
  () => (window as any).__cfRLUnblockHandlers === true,
  null, { timeout: 15_000 },
).catch(() => {});
```

Every page object calls `waitForStoreReady()` after it navigates, so Add-to-cart,
Login, currency, newsletter, and checkout clicks always land on a live handler.

## The slow challenge: wait, don't reload

The harder `Performing security verification` screen refreshes itself and clears
on its own. My instinct was to reload and nudge it along, which turns out to be
exactly wrong: reloading mid-challenge restarts it. So the rule is patience first,
reload only as a last resort:

```ts
// BasePage.waitForStoreReady() (simplified)
try {
  await this.currencySelect.waitFor({ state: 'visible', timeout: 45_000 }); // wait it out
} catch {
  for (let i = 0; i < 2; i++) {                       // only now, nudge with a reload
    await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
    try { await this.currencySelect.waitFor({ state: 'visible', timeout: 25_000 }); break; }
    catch { /* try again */ }
  }
}
```

The per-test timeout is 120s so a genuinely slow challenge has room to clear
before the test even starts.

## Where this falls short

I'd rather be straight about the limits than oversell it.

It's stable, not guaranteed. A run with retries off once failed on a slow
`Performing security verification` that didn't clear in time. That's the network
being the network, not a bug in the test, and it's why the patient wait and the
`retries: 1` seatbelt both exist (and why a retry-rescued test shows up as
`flaky`, never hidden).

It only runs headed. Since headless is blocked, this suite won't run on a plain
headless CI box without a virtual display, and CI egress IPs tend to get
challenged harder anyway. That's why it runs locally.

And none of this would survive Cloudflare switching to an *interactive*
challenge, the click-to-verify kind. That's a line this project deliberately
doesn't try to cross.

## Where it lives in the code

| Concern | File |
|---------|------|
| Headed + automation flag + native UA | [`playwright.config.ts`](https://github.com/siraajul/nopCom_Automation/blob/main/playwright.config.ts) |
| Interstitial wait, Rocket Loader flag, patient reload | `pages/BasePage.ts` → `waitForStoreReady()` |
| Per-test timeout budget | `playwright.config.ts` → `timeout: 120_000` |
