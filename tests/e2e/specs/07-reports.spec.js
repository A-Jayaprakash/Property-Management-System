/**
 * 07-reports.spec.js
 * Financial Reports — navigate from home, generate all three report types,
 * switch time ranges, verify KPIs and chart canvases render.
 */

const { test, expect } = require("../fixtures");

test.describe.serial("Financial Reports", () => {
  // ── Navigation from home ──────────────────────────────────────────────────
  test("Financial Reports nav card is visible on home dashboard", async ({
    authPage: page,
  }) => {
    await page.goto("/home.html");
    // The card is shown via JS after auth
    await expect(page.locator("#reportsCard")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#reportsCard")).toContainText(/Financial Reports/i);
  });

  test("clicking Reports nav card navigates to reports.html", async ({
    authPage: page,
  }) => {
    await page.goto("/home.html");
    await page.locator("#reportsCard").waitFor({ state: "visible", timeout: 8000 });
    await page.click("#reportsCard");
    await page.waitForURL("**/reports.html", { timeout: 6000 });
    await expect(page).toHaveURL(/reports\.html/);
  });

  // ── Page load ─────────────────────────────────────────────────────────────
  test("reports.html loads with tabs, range buttons, and dropdowns", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    await expect(page.locator(".report-controls")).toBeVisible({ timeout: 8000 });
    await expect(page.locator(".report-type-tabs")).toBeVisible();
    await expect(page.locator(".range-group")).toBeVisible();
  });

  test("property dropdown is populated on page load", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    // Wait for properties to load (init async fetch)
    await page.waitForTimeout(2000);
    const options = await page.locator("#selProperty option").count();
    expect(options).toBeGreaterThan(1); // >1 because first is placeholder
  });

  // ── Overall Portfolio report ──────────────────────────────────────────────
  test("Overall report: Generate shows hero bar and KPI cards", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500); // properties load

    // Overall tab is active by default
    await page.click("button.range-btn:has-text('6M'), .range-btn:has-text('6M')");
    await page.click("button:has-text('Generate Report')");

    await expect(page.locator("#heroBar")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#kpiGrid")).toBeVisible({ timeout: 8000 });
  });

  test("Overall report: KPI values are rendered (not blank)", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click("button:has-text('Generate Report')");
    await page.locator("#kpiGrid").waitFor({ state: "visible", timeout: 10000 });

    const rev = await page.locator("#kpiRev").textContent();
    expect(rev).toBeTruthy();
    expect(rev).toMatch(/₹/);
  });

  test("Overall report: trend chart canvas is present", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click("button:has-text('Generate Report')");
    await page.locator("#chartsRow").waitFor({ state: "visible", timeout: 10000 });

    await expect(page.locator("#trendChart")).toBeVisible();
  });

  test("Overall report: property breakdown table renders", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click("button:has-text('Generate Report')");
    await page.locator("#breakdownCard").waitFor({ state: "visible", timeout: 10000 });

    await expect(page.locator("#breakdownTable")).not.toBeEmpty();
  });

  // ── By Property report ────────────────────────────────────────────────────
  test("By Property tab shows property selector", async ({ authPage: page }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click("[data-type='property']");
    await expect(page.locator("#propSel")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#unitSel")).not.toBeVisible();
  });

  test("By Property report generates for E2E property", async ({
    authPage: page,
    state,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click("[data-type='property']");
    await page.locator("#propSel").waitFor({ state: "visible" });

    await page.selectOption("#selProperty", state.propertyId);
    await page.click("button:has-text('Generate Report')");

    await expect(page.locator("#heroBar")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#heroBar")).toContainText(state.propertyName);
  });

  // ── By Unit report ────────────────────────────────────────────────────────
  test("By Unit tab shows both property and unit selectors", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click("[data-type='unit']");
    await expect(page.locator("#propSel")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#unitSel")).toBeVisible({ timeout: 4000 });
  });

  test("By Unit report generates after selecting property then unit", async ({
    authPage: page,
    state,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click("[data-type='unit']");
    await page.selectOption("#selProperty", state.propertyId);
    await page.waitForTimeout(1000); // units load

    await page.selectOption("#selUnit", state.unitId);
    await page.click("button:has-text('Generate Report')");

    await expect(page.locator("#heroBar")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#kpiGrid")).toBeVisible();
  });

  // ── Time range switching ──────────────────────────────────────────────────
  test("switching time range to 1M and regenerating updates hero label", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click("button:has-text('Generate Report')");
    await page.locator("#heroBar").waitFor({ state: "visible", timeout: 10000 });

    // Switch to 1M
    await page.click(".range-btn:has-text('1M')");
    await page.click("button:has-text('Generate Report')");

    await expect(page.locator("#heroRange")).toContainText(/1 month/i, { timeout: 8000 });
  });

  test("switching to 1Y range updates hero label to 12 Months", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click(".range-btn:has-text('1Y')");
    await page.click("button:has-text('Generate Report')");

    await expect(page.locator("#heroRange")).toContainText(/12 months/i, { timeout: 8000 });
  });

  // ── Validation guards ─────────────────────────────────────────────────────
  test("By Property without selecting a property shows warning", async ({
    authPage: page,
  }) => {
    await page.goto("/reports.html");
    await page.waitForTimeout(1500);

    await page.click("[data-type='property']");
    await page.click("button:has-text('Generate Report')");

    await expect(page.locator("#notification")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#notification")).toContainText(/select.*property/i);
  });
});
