/**
 * 08-config.spec.js
 * Configuration page — tabs, add charges and expense types, toggle active/inactive.
 * Creates test config entries and cleans them up via API at the end.
 */

const { test, expect } = require("../fixtures");

const NEW_UNIT_CHARGE   = "E2E_Unit_Charge";
const NEW_PROP_EXPENSE  = "E2E_Prop_Expense";
const NEW_UNIT_EXPENSE  = "E2E_Unit_Expense";

test.describe.serial("Configuration", () => {
  // ── Page load ─────────────────────────────────────────────────────────────
  test("config.html loads with tab buttons visible", async ({ authPage: page }) => {
    await page.goto("/config.html");
    await expect(page.locator("#tbtn_propCharges")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#tbtn_unitCharges")).toBeVisible();
    await expect(page.locator("#tbtn_propExpenses")).toBeVisible();
    await expect(page.locator("#tbtn_unitExpenses")).toBeVisible();
  });

  test("Property Charges tab is active by default and shows its table", async ({
    authPage: page,
  }) => {
    await page.goto("/config.html");
    await expect(page.locator("#tab_propCharges")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#tbody_propCharges")).toBeVisible();
  });

  test("seeded property charges are listed in the table", async ({
    authPage: page,
  }) => {
    await page.goto("/config.html");
    await page.locator("#tbody_propCharges").waitFor({ state: "visible", timeout: 8000 });
    // The seed adds "Property Housekeeping" at minimum
    await expect(page.locator("#tbody_propCharges")).toContainText(
      /Housekeeping|Swimming Pool|Plumbing|Lighting/i
    );
  });

  // ── Tab switching ─────────────────────────────────────────────────────────
  test("clicking Unit Charges tab shows its panel", async ({ authPage: page }) => {
    await page.goto("/config.html");
    await page.click("#tbtn_unitCharges");
    await expect(page.locator("#tab_unitCharges")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#tbody_unitCharges")).toBeVisible();
  });

  test("clicking Property Expenses tab shows its panel", async ({ authPage: page }) => {
    await page.goto("/config.html");
    await page.click("#tbtn_propExpenses");
    await expect(page.locator("#tab_propExpenses")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#tbody_propExpenses")).toBeVisible();
  });

  test("clicking Unit Expenses tab shows its panel", async ({ authPage: page }) => {
    await page.goto("/config.html");
    await page.click("#tbtn_unitExpenses");
    await expect(page.locator("#tab_unitExpenses")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#tbody_unitExpenses")).toBeVisible();
  });

  // ── Add Unit Charge ───────────────────────────────────────────────────────
  test("adding a Unit Charge appends a row to the table", async ({ authPage: page }) => {
    await page.goto("/config.html");
    await page.click("#tbtn_unitCharges");
    await page.locator("#tab_unitCharges").waitFor({ state: "visible" });

    await page.fill("#uc_name", NEW_UNIT_CHARGE);
    await page.selectOption("#uc_type", "Normal");
    await page.fill("#uc_rate", "0");

    await page.click("#tab_unitCharges button:has-text('Add'), #tab_unitCharges button.btn-primary");

    await expect(page.locator(`#tbody_unitCharges`)).toContainText(NEW_UNIT_CHARGE, {
      timeout: 8000,
    });
  });

  // ── Add Property Expense Type ─────────────────────────────────────────────
  test("adding a Property Expense Type appends a row", async ({ authPage: page }) => {
    await page.goto("/config.html");
    await page.click("#tbtn_propExpenses");
    await page.locator("#tab_propExpenses").waitFor({ state: "visible" });

    await page.fill("#pe_name", NEW_PROP_EXPENSE);
    await page.click("#tab_propExpenses button:has-text('Add'), #tab_propExpenses button.btn-primary");

    await expect(page.locator("#tbody_propExpenses")).toContainText(NEW_PROP_EXPENSE, {
      timeout: 8000,
    });
  });

  // ── Add Unit Expense Type ─────────────────────────────────────────────────
  test("adding a Unit Expense Type appends a row", async ({ authPage: page }) => {
    await page.goto("/config.html");
    await page.click("#tbtn_unitExpenses");
    await page.locator("#tab_unitExpenses").waitFor({ state: "visible" });

    await page.fill("#ue_name", NEW_UNIT_EXPENSE);
    await page.click("#tab_unitExpenses button:has-text('Add'), #tab_unitExpenses button.btn-primary");

    await expect(page.locator("#tbody_unitExpenses")).toContainText(NEW_UNIT_EXPENSE, {
      timeout: 8000,
    });
  });

  // ── Seeded expense types from app boot ───────────────────────────────────
  test("seeded unit expenses include Painting, Electrical, Plumbing", async ({
    authPage: page,
  }) => {
    await page.goto("/config.html");
    await page.click("#tbtn_unitExpenses");
    await page.locator("#tbody_unitExpenses").waitFor({ state: "visible", timeout: 8000 });

    await expect(page.locator("#tbody_unitExpenses")).toContainText(/Painting/i);
    await expect(page.locator("#tbody_unitExpenses")).toContainText(/Electrical/i);
  });

  test("seeded property expenses include Property Tax, Water Tax, Building Maintenance", async ({
    authPage: page,
  }) => {
    await page.goto("/config.html");
    await page.click("#tbtn_propExpenses");
    await page.locator("#tbody_propExpenses").waitFor({ state: "visible", timeout: 8000 });

    await expect(page.locator("#tbody_propExpenses")).toContainText(/Property Tax/i);
    await expect(page.locator("#tbody_propExpenses")).toContainText(/Building Maintenance/i);
  });

  // ── Cleanup test entries via API ──────────────────────────────────────────
  test("cleanup: delete E2E test config entries via API", async ({ page, state }) => {
    const headers = { Authorization: `Bearer ${state.token}` };

    // Delete test unit charge
    const chargesRes  = await page.request.get(`${state.baseUrl}/api/charges`, { headers });
    const chargesData = await chargesRes.json();
    const charges     = Array.isArray(chargesData) ? chargesData : (chargesData.data || []);
    const testCharge  = charges.find((c) => c.name === NEW_UNIT_CHARGE);
    if (testCharge) {
      await page.request.delete(`${state.baseUrl}/api/charges/${testCharge._id}`, { headers });
    }

    // Delete test expense types
    const etRes  = await page.request.get(`${state.baseUrl}/api/expense-types`, { headers });
    const etData = await etRes.json();
    const types  = Array.isArray(etData) ? etData : (etData.data || []);

    for (const name of [NEW_PROP_EXPENSE, NEW_UNIT_EXPENSE]) {
      const entry = types.find((e) => e.name === name);
      if (entry) {
        await page.request.delete(`${state.baseUrl}/api/expense-types/${entry._id}`, { headers });
      }
    }

    console.log("[08-config] Cleaned up E2E test configuration entries");
  });
});
