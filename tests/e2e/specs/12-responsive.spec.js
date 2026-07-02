/**
 * 12-responsive.spec.js
 * Responsive / mobile layout — verifies all key pages are usable at a 375 × 812
 * mobile viewport (iPhone SE size).
 */

const { test, expect } = require("../fixtures");

const MOBILE = { width: 375, height: 812 };

test.describe.serial("Responsive / Mobile Layout", () => {
  // ── Property list ─────────────────────────────────────────────────────────

  test("property list renders at 375 px and cards are visible", async ({ authPage: page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/index.html");

    await expect(page.locator("#propertiesContainer, .properties-container")).toBeVisible({ timeout: 8000 });
    // At least one property card must be reachable in the viewport
    await page.locator(".property-card").first().waitFor({ state: "visible", timeout: 8000 });
  });

  test("Add Property button is visible and modal opens on mobile", async ({ authPage: page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/index.html");
    await page.locator(".property-card").first().waitFor({ state: "visible", timeout: 8000 });

    await page.click("#addPropertyBtn");
    await expect(page.locator("#propertyModal")).toBeVisible({ timeout: 4000 });

    // Modal title must be readable (not overflowing / hidden)
    await expect(page.locator("#modalTitle")).toBeVisible();
  });

  // ── Tenants page ──────────────────────────────────────────────────────────

  test("tenants page loads and grid is visible on mobile", async ({ authPage: page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/tenants.html");

    await expect(page.locator("#tenantGrid")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#activeTenants")).toBeVisible();
  });

  // ── Reports page ──────────────────────────────────────────────────────────

  test("reports page loads with all tab buttons visible on mobile", async ({ authPage: page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/reports.html");

    // Controls should be visible (may require scroll — Playwright checks in DOM, not viewport)
    await expect(page.locator("#tabOverall, button:has-text('Overall')")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#generateBtn, button:has-text('Generate')")).toBeVisible({ timeout: 5000 });
  });

  // ── Units page ────────────────────────────────────────────────────────────

  test("units page loads and stats are visible on mobile", async ({ authPage: page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/unit.html");

    await expect(page.locator("#totalUnits")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#unitsGrid, .units-grid")).toBeVisible({ timeout: 8000 });
  });

  // ── Config page ───────────────────────────────────────────────────────────

  test("config page tab buttons are visible on mobile", async ({ authPage: page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/config.html");

    await expect(page.locator("#tbtn_propCharges")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#tbtn_unitCharges")).toBeVisible();
  });
});
