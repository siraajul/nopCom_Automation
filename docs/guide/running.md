# How to Run

You'll need Node 18 or newer.

## Install (do this once)

```bash
npm install
npx playwright install chromium
```

## Run the whole thing

```bash
npm test
```

That's all 34 tests, headed, on two workers, so expect two Chrome windows. It
writes the HTML report to `playwright-report/` and the Pulse JSON to
`pulse-report/`.

::: warning Why are there windows popping up?
The demo store is behind Cloudflare, and Cloudflare blocks headless browsers, so
the tests have to run headed for the challenge to clear. One window per worker.
There's no way around the visible windows on this particular site.
:::

## Run just part of it

```bash
npx playwright test login.spec.ts            # one feature file
npx playwright test login currency search    # a few features
npx playwright test -g "GUEST can search"    # one scenario, matched by title
npx playwright test e2e-checkout.spec.ts     # all the checkout journeys
```

Match by title with `-g` rather than a line number. Line numbers shift the second
you edit the file; the title stays put.

## Fewer windows, or more speed

```bash
npx playwright test --workers=1     # one window, easiest to watch
npx playwright test --workers=4     # faster, four windows
npm run test:ui                     # UI mode, click into individual tests
npm run test:headed                 # explicitly headed
```

## Re-run what failed

```bash
npm run test:retry-failed           # = playwright test --last-failed
```

## Slow it down to record it

```bash
npm run test:slow                                            # 10s per step, full-screen, video on
STEP_DELAY=10000 npx playwright test -g "GUEST can search"   # record one journey
STEP_DELAY=5000  npx playwright test -g "REGISTER then"      # 5s per step if 10 feels glacial
```

`STEP_DELAY` pauses after each real step so the run is easy to follow on screen,
opens a 1680×1000 window so it fills the frame, and records full-resolution video.
Leave it unset and normal runs don't change at all.

## The reports

```bash
npm run report          # open the Playwright HTML report
npm run report:pulse    # build the Pulse dashboard (pulse-report/*.html)
```

Every failure drops a screenshot, a trace (`npx playwright show-trace <trace.zip>`),
and a video next to the test.

## Record every test

```bash
npm run test:video      # VIDEO=on, saves test-results/**/video.webm for all of them
```

## Command cheat sheet

| Command | What it does |
|---------|--------------|
| `npm test` | The whole suite, headed, two workers |
| `npm run test:headed` | Same, explicitly headed |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:retry-failed` | Just the tests that failed last time |
| `npm run test:slow` | Slow mode for recording, 10s per step |
| `npm run test:video` | Video for every test |
| `npm run report` | Open the Playwright HTML report |
| `npm run report:pulse` | Build the Pulse dashboard |
