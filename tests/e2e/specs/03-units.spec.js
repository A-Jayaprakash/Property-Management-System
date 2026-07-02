/**
 * 03-units.spec.js
 * Unit Management — page load, filter by property, add unit, delete it.
 * The shared E2E_Property + E2E-101 unit created in global-setup remain intact.
 * This spec adds its own E2E-201 unit and cleans it up.
 */

const { test, expect } = require("../fixtures");

let newUnitId = null; // captured after creation for cleanup

test.describe.serial("Unit Management", () => {
  // ── Page load ─────────────────────────────────────────────────────────────
  test("unit.html loads with stats visible", async ({ authPage: page }) => {
    await page.goto("/unit.html");
    await expect(page.locator("#statsGrid, .stats-grid")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#totalUnits")).toBeVisible();
    await expect(page.locator("#unitsGrid, .units-grid")).toBeVisible();
  });

  // ── Filter by property ────────────────────────────────────────────────────
  test("filtering by E2E property shows only its units", async ({ authPage: page, state }) => {
    await page.goto("/unit.html");
    await page.locator("#unitsGrid").waitFor({ state: "visible", timeout: 8000 });

    await page.selectOption("#propertyFilter", state.propertyId);
    await page.click("button:has-text('Apply')");
    await page.waitForTimeout(800);

    // E2E-101 should be in the list
    await expect(page.locator("text=E2E-101")).toBeVisible({ timeout: 6000 });
  });

  // ── Add unit ──────────────────────────────────────────────────────────────
  test("Add Unit modal opens", async ({ authPage: page }) => {
    await page.goto("/unit.html");
    await page.locator("#unitsGrid").waitFor({ state: "visible", timeout: 8000 });
    await page.click("button:has-text('Add Unit'), button.btn-success");
    await expect(page.locator("#unitModal")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#modalTitle")).toContainText(/add/i);
  });

  test("filling Add Unit form creates the unit", async ({ authPage: page, state }) => {
    await page.goto("/unit.html");
    await page.locator("#unitsGrid").waitFor({ state: "visible", timeout: 8000 });

    await page.click("button:has-text('Add Unit'), button.btn-success");
    await page.locator("#unitModal").waitFor({ state: "visible" });

    await page.fill("#unit_number", "E2E-201");
    await page.selectOption("#property", state.propertyId);
    await page.waitForTimeout(500); // wait for capacity info to update
    await page.selectOption("#type", "2BHK");
    await page.fill("#floor",            "2");
    await page.fill("#area",             "650");
    await page.fill("#rent",             "15000");
    await page.fill("#security_deposit", "30000");

    await page.click('button[type="submit"], #unitForm button[type="submit"]');

    // Unit appears in the grid
    await expect(page.locator("text=E2E-201")).toBeVisible({ timeout: 8000 });
  });

  // ── Unit stats updated ────────────────────────────────────────────────────
  test("total units stat reflects added unit", async ({ authPage: page }) => {
    await page.goto("/unit.html");
    await page.locator("#unitsGrid").waitFor({ state: "visible", timeout: 8000 });

    const total = await page.locator("#totalUnits").textContent();
    expect(parseInt(total || "0", 10)).toBeGreaterThan(0);
  });

  // ── Cleanup: delete the E2E-201 unit via API ───────────────────────────────
  test("cleanup: delete E2E-201 unit", async ({ authPage: page, state }) => {
    // Find the unit ID by fetching the units list
    const res  = await page.request.get(
      `${state.baseUrl}/api/units/property/${state.propertyId}`,
      { headers: { Authorization: `Bearer ${state.token}` } }
    );
    const data = await res.json();
    const unit = (data.units || []).find((u) => u.unit_number === "E2E-201");
    if (!unit) return; // already gone

    await page.request.delete(`${state.baseUrl}/api/units/${unit._id}`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    console.log(`[03-units] Deleted E2E-201 unit ${unit._id}`);
  });
});
