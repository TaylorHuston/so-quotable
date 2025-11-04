import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for So Quotable E2E tests
 *
 * MVP Configuration:
 * - Single browser: Chromium only
 * - Local development server testing
 * - Auto-start Next.js dev server before tests
 *
 * Post-MVP Enhancements:
 * - Add Firefox and WebKit browsers for cross-browser testing
 * - Test against Vercel preview deployments using environment variables
 *   Example: baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
 * - Integrate with CI/CD for automated testing on pull requests
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /**
   * Directory containing E2E test files
   */
  testDir: './tests/e2e',

  /**
   * Run tests in files in parallel
   */
  fullyParallel: true,

  /**
   * Fail the build on CI if you accidentally left test.only in the source code
   */
  forbidOnly: !!process.env.CI,

  /**
   * Retry on CI only (helps with flaky tests in CI environments)
   */
  retries: process.env.CI ? 2 : 0,

  /**
   * Opt out of parallel tests on CI (use workers=1 for sequential execution)
   * This is configured via the test:e2e:ci script
   */
  workers: process.env.CI ? 1 : undefined,

  /**
   * Reporter to use
   * - CI: GitHub Actions reporter for annotations
   * - Local: HTML reporter for detailed results
   */
  reporter: process.env.CI ? 'github' : 'html',

  /**
   * Shared settings for all projects
   */
  use: {
    /**
     * Base URL to use in actions like `await page.goto('/')`
     */
    baseURL: 'http://localhost:3000',

    /**
     * Collect trace only when retrying the failed test
     * This helps debug test failures without slowing down successful runs
     */
    trace: 'on-first-retry',

    /**
     * Capture screenshot only on test failure
     * Helps diagnose issues without cluttering test artifacts
     */
    screenshot: 'only-on-failure',

    /**
     * Maximum time each action (e.g., click, fill) can take
     */
    actionTimeout: 30000,
  },

  /**
   * Configure projects for major browsers
   * MVP: Chromium only (desktop)
   * Post-MVP: Add firefox, webkit, mobile viewports
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Post-MVP: Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Post-MVP: Uncomment for mobile testing
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /**
   * Auto-start Next.js dev server before running tests
   *
   * - command: npm script to start the dev server
   * - url: health check URL to wait for before running tests
   * - reuseExistingServer: reuse server in local dev, start fresh in CI
   * - timeout: max time to wait for server to start (120s for Next.js build)
   *
   * Note: This automatically starts/stops the dev server, no manual setup needed
   */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for Next.js to compile
  },

  /**
   * Global timeout for each test (30 seconds)
   * Prevents tests from hanging indefinitely
   */
  timeout: 30000,
});
