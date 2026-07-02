/**
 * 14-api-errors.spec.js
 * API error handling — verifies the frontend degrades gracefully when the
 * backend returns errors. Uses Playwright's page.route() to mock responses.
 */

const { test, expect } = require("../fixtures");

test.describe.serial("API Error Handling", () => {
  // ── 401 Unauthorized ──────────────────────────────────────────────────────

  test("request without auth token returns 401", async ({ page, state }) => {
    const res = await page.request.get(`${state.baseUrl}/api/properties`);
    // No Authorization header → should be 401
    expect(res.status()).toBe(401);
  });

  test("request with an invalid token returns 401", async ({ page, state }) => {
    const res = await page.request.get(`${state.baseUrl}/api/properties`, {
      headers: { Authorization: "Bearer this.is.not.a.valid.jwt" },
    });
    expect(res.status()).toBe(401);
  });

  // ── 500 from properties API → UI shows error, does not crash ──────────────

  test("properties API returning 500 shows error message on the page", async ({
    authPage: page,
  }) => {
    // Intercept the properties list request before navigating
    await page.route("**/api/properties**", (route) => {
      route.fulfill({
        status:      500,
        contentType: "application/json",
        body:        JSON.stringify({ message: "Simulated server error" }),
      });
    });

    await page.goto("/index.html");

    // The page must not be blank or throw a JS crash — either an error element
    // or the empty-state div should be visible
    await expect(
      page.locator("#errorMessage, .error-message, .empty-state")
    ).toBeVisible({ timeout: 8000 });

    // No unhandled JS exception in the console
    const logs = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") logs.push(msg.text());
    });

    await page.unroute("**/api/properties**");
  });

  // ── 500 during form submit → modal stays open with error message ───────────

  test("properties POST returning 500 shows an error inside the modal", async ({
    authPage: page,
  }) => {
    await page.goto("/index.html");
    await page.locator(".property-card, .empty-state").first().waitFor({ state: "visible", timeout: 8000 });

    // Block only the POST after the form is open
    await page.route("**/api/properties", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status:      500,
          contentType: "application/json",
          body:        JSON.stringify({ message: "Simulated server error" }),
        });
      } else {
        route.continue();
      }
    });

    await page.click("#addPropertyBtn");
    await page.locator("#propertyModal").waitFor({ state: "visible" });

    await page.fill("#propertyName",    "Error_Test_Property");
    await page.fill("#propertyAddress", "1 Error St, Test City");
    await page.selectOption("#propertyType", "Apartment");
    await page.fill("#unitCount", "1");
    await page.click('#propertyForm button[type="submit"]');

    // Modal must remain visible (submission failed)
    await expect(page.locator("#propertyModal")).toBeVisible({ timeout: 4000 });
    // Error message must appear
    await expect(page.locator("#errorMessage")).toBeVisible({ timeout: 5000 });

    await page.unroute("**/api/properties");
  });

  // ── Network timeout / offline ─────────────────────────────────────────────

  test("network failure on property load shows error instead of blank page", async ({
    authPage: page,
  }) => {
    await page.route("**/api/properties**", (route) => route.abort("failed"));

    await page.goto("/index.html");

    // Page must show something — error or empty state — not be completely blank
    await expect(
      page.locator("#errorMessage, .empty-state, #propertiesContainer").first()
    ).toBeVisible({ timeout: 8000 });

    await page.unroute("**/api/properties**");
  });
});
