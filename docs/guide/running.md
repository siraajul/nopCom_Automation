# How to Run

> **Prerequisite:** Node.js **18+**.

## Install (one-time)

```bash
npm install
npx playwright install chromium
```

## 1 · Run everything

```bash
npm test
```

Runs all **34 tests** headed (2 workers → 2 Chrome windows). Produces the HTML
report in `playwright-report/` and the Pulse JSON in `pulse-report/`.

::: warning Why headed?
The demo store is behind **Cloudflare**, which blocks headless browsers. The
suite runs headed so the managed challenge clears. Each parallel worker opens one
Chrome window.
:::

## 2 · Run a subset

```bash
npx playwright test login.spec.ts            # one feature file
npx playwright test login currency search    # several features
npx playwright test -g "GUEST can search"    # one scenario by title
npx playwright test e2e-checkout.spec.ts     # all checkout journeys
```

> Prefer `-g "<title>"` over a line number — titles don't shift when files change.

## 3 · Control windows & speed

```bash
npx playwright test --workers=1     # a single Chrome window (cleanest)
npx playwright test --workers=4     # faster, 4 windows
npm run test:ui                     # Playwright UI mode — pick & inspect tests
npm run test:headed                 # explicitly headed
```

## 4 · Re-run only what failed

```bash
npm run test:retry-failed           # = playwright test --last-failed
```

## 5 · Slow / demo mode (screen recording)

```bash
npm run test:slow                                            # 10s/step, full-screen, video on
STEP_DELAY=10000 npx playwright test -g "GUEST can search"   # record one journey
STEP_DELAY=5000  npx playwright test -g "REGISTER then"      # 5s/step (faster)
```

`STEP_DELAY=<ms>` pauses after each logical step (even pacing), opens a large
**1680×1000** window so it fills the screen, records full-resolution video, and
uses a single window. Normal runs are unaffected.

## 6 · Reports

```bash
npm run report          # open the Playwright HTML report
npm run report:pulse    # build the Pulse dashboard (pulse-report/*.html)
```

On **failure**, each test attaches a **screenshot**, a **trace**
(`npx playwright show-trace <trace.zip>`) and a **video**.

## 7 · Record video of every test (bonus)

```bash
npm run test:video      # VIDEO=on — saves test-results/**/video.webm for all tests
```

## Command reference

| Command | What it does |
|---------|--------------|
| `npm test` | Run the whole suite (headed, 2 workers) |
| `npm run test:headed` | Same, explicitly headed |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:retry-failed` | Re-run only previously failed tests |
| `npm run test:slow` | Slow/demo mode for recording (10s/step) |
| `npm run test:video` | Record video of every test |
| `npm run report` | Open the Playwright HTML report |
| `npm run report:pulse` | Build the Pulse dashboard |
