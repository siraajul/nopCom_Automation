import { defineConfig } from '@playwright/test';
import * as path from 'path';

// Output directory for the Playwright Pulse report (JSON + attachments).
const PULSE_REPORT_DIR = path.resolve(__dirname, 'pulse-report');

/**
 * Playwright configuration for the nopCommerce demo-store automation suite.
 * Target application under test: https://demo.nopcommerce.com/
 *
 * Notes
 * - The demo store sits behind a Cloudflare "Just a moment..." interstitial that
 *   auto-resolves within a few seconds. We use generous navigation timeouts and
 *   the BasePage waits for real page content before interacting.
 * - Reporting: the built-in HTML report (./playwright-report) PLUS the
 *   Playwright Pulse report (./pulse-report). After a run, build the Pulse HTML
 *   with `npm run report:pulse` (self-contained) or `npm run report:pulse:light`.
 * - Evidence on failure: screenshot + trace + video are retained for every
 *   failed test. Set VIDEO=on to record a video of EVERY test (bonus task).
 */
// SLOW / DEMO MODE for screen recording (0 = off, normal speed).
//   STEP_DELAY=<ms>  -> pause this long AFTER each logical step (preferred:
//                       even, predictable pacing — e.g. STEP_DELAY=10000 ≈ 10s
//                       per visible step). Implemented in the page objects.
//   SLOWMO=<ms>      -> Playwright slowMo: pause before EVERY micro-action
//                       (kept as an option, but coarser/longer than STEP_DELAY).
// In demo mode we force ONE window and disable the per-test timeout so the long
// pauses don't trip it.
const SLOW_MO = Number(process.env.SLOWMO) || 0;
const STEP_DELAY = Number(process.env.STEP_DELAY) || 0;
const DEMO = SLOW_MO > 0 || STEP_DELAY > 0;

export default defineConfig({
  testDir: './tests',

  // Each test gets a fresh, independent browser context.
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally left in the source.
  forbidOnly: !!process.env.CI,

  // The site is a shared live demo; one retry absorbs transient network/Cloudflare
  // flakiness. No retries in demo mode (a clean single take for recording).
  retries: DEMO ? 0 : process.env.CI ? 2 : 1,

  // Tests run HEADED (Cloudflare blocks headless on this site), so each worker
  // opens a visible Chrome window. Default to 2 to balance speed vs. number of
  // windows; demo mode forces 1 window for a clean recording.
  workers: DEMO ? 1 : process.env.CI ? 2 : 2,

  // Generous per-test timeout; disabled in demo mode so slow steps don't time out.
  timeout: DEMO ? 0 : 120_000,
  expect: { timeout: DEMO ? 0 : 10_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['@arghajit/playwright-pulse-report', { outputDir: PULSE_REPORT_DIR }],
  ],

  use: {
    baseURL: 'https://demo.nopcommerce.com',

    // Evidence captured on failure for debugging.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // In demo mode record at full viewport size (otherwise Playwright downscales
    // video to ~800px); normal runs use the lightweight default.
    video: DEMO
      ? { mode: process.env.VIDEO === 'on' ? 'on' : 'retain-on-failure', size: { width: 1680, height: 1000 } }
      : process.env.VIDEO === 'on'
        ? 'on'
        : 'retain-on-failure',

    actionTimeout: 15_000,
    navigationTimeout: 40_000,

    // In demo/recording mode use a large viewport so the window fills the screen
    // and the recorded video is high-resolution; otherwise a stable normal size.
    // (On macOS, a fixed large viewport is more reliable than --start-maximized.)
    viewport: DEMO ? { width: 1680, height: 1000 } : { width: 1366, height: 900 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        // The demo store is protected by Cloudflare's "Just a moment..." bot
        // challenge. It only clears when the browser looks like a real desktop
        // browser: (1) headed, (2) without the automation flag, and (3) using
        // the native user agent (a mismatched UA keeps the challenge looping).
        // NOTE: we deliberately do NOT spread devices['Desktop Chrome'] because
        // it forces a Windows UA that Cloudflare rejects on this machine.
        headless: false,
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            // Place the window at the top-left so the large viewport fills the screen.
            ...(DEMO ? ['--window-position=0,0'] : []),
          ],
          // Pause before each action in demo mode so the run is recordable.
          slowMo: SLOW_MO,
        },
      },
    },
  ],
});
