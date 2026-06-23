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
export default defineConfig({
  testDir: './tests',

  // Each test gets a fresh, independent browser context.
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally left in the source.
  forbidOnly: !!process.env.CI,

  // The site is a shared live demo; one retry absorbs transient network/Cloudflare flakiness.
  retries: process.env.CI ? 2 : 1,

  // Tests run HEADED (Cloudflare blocks headless on this site), so each worker
  // opens a visible Chrome window. Default to 2 to balance speed vs. number of
  // windows; use `--workers=1` for a single window, or `--workers=4` for speed.
  workers: process.env.CI ? 2 : 2,

  // Generous per-test timeout: a slow Cloudflare "security verification"
  // challenge can take a while to clear before the test even begins.
  timeout: 120_000,
  expect: { timeout: 10_000 },

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
    video: process.env.VIDEO === 'on' ? 'on' : 'retain-on-failure',

    actionTimeout: 15_000,
    navigationTimeout: 40_000,

    viewport: { width: 1366, height: 900 },
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
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
    },
  ],
});
