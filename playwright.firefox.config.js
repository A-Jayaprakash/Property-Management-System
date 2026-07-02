// @ts-check
/**
 * playwright.firefox.config.js
 * Cross-browser run in Firefox only.
 * Install Firefox first: npx playwright install firefox
 * Then run:            npm run test:firefox
 */
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e/specs",
  globalSetup:    "./tests/e2e/global-setup.js",
  globalTeardown: "./tests/e2e/global-teardown.js",

  timeout: 40_000,          // Firefox can be slower
  expect: { timeout: 10_000 },
  retries: 0,
  workers: 1,

  reporter: [
    ["html", { outputFolder: "playwright-report-firefox", open: "never" }],
    ["list"],
  ],

  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    video:      "retain-on-failure",
    trace:      "retain-on-failure",
  },

  projects: [
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],

  webServer: {
    command:             "node tests/start-server.js",
    url:                 "http://localhost:3000/api/auth/test",
    reuseExistingServer: true,
    timeout:             60_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
