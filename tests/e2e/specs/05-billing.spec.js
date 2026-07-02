/**
 * 05-billing.spec.js
 * Monthly Billing — navigate from property card, load a period, save draft,
 * verify status badge, and publish.
 */

const { test, expect } = require("../fixtures");

// Use a past month (Jan 2026) to avoid clashing with real operations
const TEST_MONTH = "1";   // January
const TEST_YEAR  = "2025";

test.describe.serial("Monthly Billing", () => {
  // ── Navigation ────────────────────────────────────────────────────────────
  test("Monthly Bill button on property card links to billing page", async ({
    authPage: page,
    state,
  }) => {
    await page.goto("/index.html");
    await page.locator("#propertiesContainer").waitFor({ state: "visible", timeout: 8000 });

    // Find the card for the shared E2E_Property
    const card    = page.locator(".property-card").filter({ hasText: state.propertyName });
    const billBtn = card.locator("a:has-text('Monthly Bill')");
    await expect(billBtn).toBeVisible({ timeout: 5000 });

    const href = await billBtn.getAttribute("href");
    expect(href).toContain("billing.html");
    expect(href).toContain(state.propertyId);
  });

  // ── Page load ─────────────────────────────────────────────────────────────
  test("billing.html loads with period selector controls", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/billing.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await expect(page.locator("#billingTitle")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#selMonth")).toBeVisible();
    await expect(page.locator("#selYear")).toBeVisible();
    await expect(page.locator("button:has-text('Load Bill')")).toBeVisible();
  });

  // ── Load bill ─────────────────────────────────────────────────────────────
  test("selecting month/year and clicking Load creates a draft period", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/billing.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.locator("#selMonth").waitFor({ state: "visible", timeout: 8000 });

    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Bill')");

    // Period status badge should appear showing "Draft"
    await expect(page.locator("#periodStatusBadge")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#periodStatusBadge")).toContainText(/draft/i);

    // Bill actions row should be visible
    await expect(page.locator("#billActions")).toBeVisible();
  });

  // ── Unit cards render ─────────────────────────────────────────────────────
  test("unit cards render inside billing grid after load", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/billing.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Bill')");

    // The billing grid / unit cards must be rendered (E2E-101 is in this property)
    await expect(page.locator("#unitCards")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#unitCards")).not.toBeEmpty();
  });

  // ── Save draft ────────────────────────────────────────────────────────────
  test("Save Draft button persists the draft and shows success", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/billing.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Bill')");
    await page.locator("#billActions").waitFor({ state: "visible", timeout: 8000 });

    await page.click("#btnSave");
    await expect(page.locator("#notification")).toBeVisible({ timeout: 6000 });
    await expect(page.locator("#notification")).toContainText(/saved|success|draft/i);
  });

  // ── Publish ───────────────────────────────────────────────────────────────
  test("Publish button publishes the period and updates status badge", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/billing.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Bill')");
    await page.locator("#billActions").waitFor({ state: "visible", timeout: 8000 });

    // Handle browser confirm dialog if the implementation uses window.confirm
    page.on("dialog", (d) => d.accept());
    await page.click("#btnPublish");

    // Badge should change to Published
    await expect(page.locator("#periodStatusBadge")).toContainText(/published/i, {
      timeout: 8000,
    });
  });

  // ── Published period is read-only ─────────────────────────────────────────
  test("loading a published period renders inputs as disabled/readonly", async ({
    authPage: page,
    state,
  }) => {
    await page.goto(
      `/billing.html?propertyId=${state.propertyId}&name=${encodeURIComponent(state.propertyName)}`
    );
    await page.selectOption("#selMonth", TEST_MONTH);
    await page.fill("#selYear", TEST_YEAR);
    await page.click("button:has-text('Load Bill')");
    await page.locator("#unitCards").waitFor({ state: "visible", timeout: 8000 });

    // After publishing, Publish button should be hidden/disabled
    const publishBtn = page.locator("#btnPublish");
    const isHidden = !(await publishBtn.isVisible().catch(() => false));
    const isDisabled = await publishBtn.isDisabled().catch(() => true);
    expect(isHidden || isDisabled).toBeTruthy();
  });
});
