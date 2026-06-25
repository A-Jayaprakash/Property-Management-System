/**
 * 06-expenses.spec.js
 * Expense Tracker — load expense period, enter amounts, save draft, finalize.
 */

const { test, expect } = require("../fixtures");

const TEST_MONTH = "2";    // February
const TEST_YEAR  = "2025"; // avoid current-month conflicts

test.describe.serial("Expense Tracking", () => {
  // ── Navigation ────────────────────────────────────────────────────────────
  test("Expenses button on property card links to expenses page", async ({
    authPage: page,
    state,
  }) => {
    await page.goto("/index.html");
    await page.locator("#propertiesContainer").waitFor({ state: "visible", timeout: 8000 });

    const card    = page.locator(".property-card").filter({ hasText: state.propertyName });
    const expBtn  = card.locator("a:has-text('Expenses')");
    await expect(expBtn).toBeVisible({ timeout: 5000 });

    const href = await expBtn.getAttribute("href");
    expect(href).toContain("expenses.html");
    expect(href).toContain(state.propertyId);
  });

  // ── Page load ─────────────────────────────────────────────────────────────
  test("expenses.html loads with period selector controls", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/expenses.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await expect(page.locator("#expenseTitle")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#selMonth")).toBeVisible();
    await expect(page.locator("#selYear")).toBeVisible();
    await expect(page.locator("button:has-text('Load Expenses')")).toBeVisible();
  });

  // ── Load expense period ───────────────────────────────────────────────────
  test("Load Expenses creates a draft period with property expense table", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/expenses.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.locator("#selMonth").waitFor({ state: "visible", timeout: 8000 });

    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Expenses')");

    await expect(page.locator("#periodStatusBadge")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#periodStatusBadge")).toContainText(/draft/i);
    await expect(page.locator("#expenseActions")).toBeVisible();
  });

  // ── Expense grid renders ──────────────────────────────────────────────────
  test("expense content grid is visible after loading", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/expenses.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Expenses')");

    await expect(page.locator("#expenseContent")).toBeVisible({ timeout: 8000 });
    // Property expense total field should exist
    await expect(page.locator("#propExpTotal")).toBeVisible();
  });

  // ── Enter expense amount ──────────────────────────────────────────────────
  test("entering a property expense amount updates the total", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/expenses.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Expenses')");
    await page.locator("#expenseContent").waitFor({ state: "visible", timeout: 8000 });

    // Enter into the misc property expense field
    await page.fill("#pmisc_amt", "5000");
    await page.locator("#pmisc_amt").dispatchEvent("input");

    // Property total should now be > 0
    const total = await page.locator("#propExpTotal").inputValue();
    expect(parseFloat(total || "0")).toBeGreaterThan(0);
  });

  // ── Save Draft ────────────────────────────────────────────────────────────
  test("Save Draft persists expenses and shows success notification", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/expenses.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Expenses')");
    await page.locator("#expenseActions").waitFor({ state: "visible", timeout: 8000 });

    await page.click("#btnSave");
    await expect(page.locator("#notification")).toBeVisible({ timeout: 6000 });
    await expect(page.locator("#notification")).toContainText(/saved|success|draft/i);
  });

  // ── Finalize ──────────────────────────────────────────────────────────────
  test("Finalize updates status badge to Finalized", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/expenses.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Expenses')");
    await page.locator("#expenseActions").waitFor({ state: "visible", timeout: 8000 });

    page.on("dialog", (d) => d.accept());
    await page.click("#btnFinalize");

    await expect(page.locator("#periodStatusBadge")).toContainText(/finaliz/i, {
      timeout: 8000,
    });
  });

  // ── Finalized period is read-only ─────────────────────────────────────────
  test("finalized period hides or disables the Finalize button", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/expenses.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Expenses')");
    await page.locator("#expenseContent").waitFor({ state: "visible", timeout: 8000 });

    const finalBtn  = page.locator("#btnFinalize");
    const isHidden   = !(await finalBtn.isVisible().catch(() => false));
    const isDisabled = await finalBtn.isDisabled().catch(() => true);
    expect(isHidden || isDisabled).toBeTruthy();
  });
});
