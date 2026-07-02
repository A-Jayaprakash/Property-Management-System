/**
 * fixtures.js — extends Playwright's test with two helpers:
 *
 *  authPage   — a Page that already has authToken + userData injected
 *               into sessionStorage before any navigation (avoids full
 *               login round-trip for every test).
 *
 *  state      — the parsed .test-state.json (token, propertyId, unitId …).
 */

const { test: base, expect } = require("@playwright/test");
const fs   = require("fs");
const path = require("path");

const STATE_FILE = path.join(__dirname, ".test-state.json");

function loadState() {
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
}

const test = base.extend({
  // Injects auth into sessionStorage via addInitScript so every page.goto()
  // finds valid credentials without going through the login form.
  authPage: async ({ page }, use) => {
    const { token, user } = loadState();
    await page.addInitScript(
      ({ token, user }) => {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("userData", JSON.stringify({ user }));
      },
      { token, user }
    );
    await use(page);
  },

  // Raw state object (IDs, credentials) for API-level helpers in tests.
  state: async ({}, use) => {
    await use(loadState());
  },
});

module.exports = { test, expect };
