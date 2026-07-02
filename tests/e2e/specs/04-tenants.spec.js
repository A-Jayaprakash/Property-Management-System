/**
 * 04-tenants.spec.js
 * Tenant Management — page load, add tenant, search, delete.
 * Creates an E2E tenant assigned to the shared test unit and removes it at the end.
 */

const { test, expect } = require("../fixtures");

const TENANT = {
  fullName:  "E2E Test Tenant",
  email:     "e2e_tenant@propertysync.dev",
  phone:     "9888888888",
  rent:      "10000",
  start:     "2026-01-01",
  end:       "2026-12-31",
  deposit:   "20000",
};

let tenantId = null;

test.describe.serial("Tenant Management", () => {
  // ── Page load ─────────────────────────────────────────────────────────────
  test("tenants.html loads with stats and grid", async ({ authPage: page }) => {
    await page.goto("/tenants.html");
    await expect(page.locator("#tenantGrid")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#activeTenants")).toBeVisible();
    await expect(page.locator("#totalTenants")).toBeVisible();
    await expect(page.locator("#searchInput")).toBeVisible();
  });

  // ── Add Tenant ────────────────────────────────────────────────────────────
  test("Add Tenant modal opens", async ({ authPage: page }) => {
    await page.goto("/tenants.html");
    await page.locator("#tenantGrid").waitFor({ state: "visible", timeout: 8000 });

    await page.click("button:has-text('Add Tenant')");
    await expect(page.locator("#tenantModal")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#modalTitle")).toContainText(/add/i);
  });

  test("filling Add Tenant form creates tenant and shows in grid", async ({ authPage: page, state }) => {
    await page.goto("/tenants.html");
    await page.locator("#tenantGrid").waitFor({ state: "visible", timeout: 8000 });

    await page.click("button:has-text('Add Tenant')");
    await page.locator("#tenantModal").waitFor({ state: "visible" });

    await page.fill("#fullName",       TENANT.fullName);
    await page.fill("#email",          TENANT.email);
    await page.fill("#phoneNumber",    TENANT.phone);

    // Select property → wait for unit dropdown to populate
    await page.selectOption("#propertySelect", state.propertyId);
    await page.waitForTimeout(800); // units load asynchronously

    // Option value is unit_number string, not the MongoDB _id
    await page.selectOption("#assignedUnit", "E2E-101");

    await page.selectOption("#status", "Active");
    await page.fill("#monthlyRent",     TENANT.rent);
    await page.fill("#leaseStartDate",  TENANT.start);
    await page.fill("#leaseEndDate",    TENANT.end);
    await page.fill("#securityDeposit", TENANT.deposit);

    await page.click('button[type="submit"], #tenantForm button[type="submit"]');

    // Tenant card appears in grid
    await expect(page.locator(`text="${TENANT.fullName}"`)).toBeVisible({ timeout: 8000 });
  });

  // ── Search ────────────────────────────────────────────────────────────────
  test("search finds the newly created tenant", async ({ authPage: page }) => {
    await page.goto("/tenants.html");
    await page.locator("#tenantGrid").waitFor({ state: "visible", timeout: 8000 });

    await page.fill("#searchInput", "E2E Test Tenant");
    await page.waitForTimeout(600);

    await expect(page.locator(`text="E2E Test Tenant"`)).toBeVisible({ timeout: 6000 });
  });

  test("search with non-existent name returns empty grid", async ({ authPage: page }) => {
    await page.goto("/tenants.html");
    await page.locator("#tenantGrid").waitFor({ state: "visible", timeout: 8000 });

    await page.fill("#searchInput", "xyz_ghost_tenant_abc");
    await page.waitForTimeout(600);

    const cards = page.locator(".tenant-card, .tenant-item");
    await expect(cards).toHaveCount(0, { timeout: 5000 });
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  test("active tenants stat is at least 1", async ({ authPage: page }) => {
    await page.goto("/tenants.html");
    await page.locator("#tenantGrid").waitFor({ state: "visible", timeout: 8000 });
    const active = await page.locator("#activeTenants").textContent();
    expect(parseInt(active || "0", 10)).toBeGreaterThanOrEqual(1);
  });

  // ── Cleanup: delete E2E tenant via API ────────────────────────────────────
  test("cleanup: delete E2E tenant via API", async ({ page, state }) => {
    const res  = await page.request.get(`${state.baseUrl}/api/tenants`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.tenants || data.data || []);
    const t    = list.find((x) => x.email === TENANT.email);
    if (!t) return;

    await page.request.delete(`${state.baseUrl}/api/tenants/${t._id}`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    console.log(`[04-tenants] Deleted E2E tenant ${t._id}`);
  });
});
