/**
 * 02-properties.spec.js
 * Property Management page — list, add, search, edit, delete.
 * Creates its own CRUD property ("E2E_CRUD_Property") and tears it down within
 * the spec so the shared E2E_Property from global-setup is not touched.
 */

const { test, expect } = require("../fixtures");
const fs   = require("fs");
const path = require("path");

const PROP_NAME    = "E2E_CRUD_Property";
const PROP_UPDATED = "E2E_CRUD_Property_Edited";

function loadState() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../.test-state.json"), "utf8"));
}

test.describe.serial("Property Management", () => {
  // ── Pre-cleanup: remove CRUD leftovers from any previous crashed run ──────
  test.beforeAll(async () => {
    const { token, baseUrl } = loadState();
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const res  = await fetch(`${baseUrl}/api/properties`, { headers });
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.properties || data.data || []);

    for (const name of [PROP_NAME, PROP_UPDATED]) {
      const prop = list.find((x) => x.name === name);
      if (prop) {
        await fetch(`${baseUrl}/api/properties/${prop._id}`, { method: "DELETE", headers });
        console.log(`[02-properties] Pre-cleanup: deleted leftover "${name}"`);
      }
    }
  });

  // ── Page load ─────────────────────────────────────────────────────────────
  test("index.html loads property list and header", async ({ authPage: page }) => {
    await page.goto("/index.html");
    await expect(page.locator("#propertiesContainer, .properties-container")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#addPropertyBtn")).toBeVisible();
    await expect(page.locator("#searchInput")).toBeVisible();
  });

  // ── Add property ──────────────────────────────────────────────────────────
  test("Add Property modal opens on button click", async ({ authPage: page }) => {
    await page.goto("/index.html");
    await page.click("#addPropertyBtn");
    await expect(page.locator("#propertyModal")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#modalTitle")).toContainText(/add/i);
  });

  test("filling and submitting Add Property form creates the property", async ({ authPage: page }) => {
    await page.goto("/index.html");
    await page.click("#addPropertyBtn");
    await page.locator("#propertyModal").waitFor({ state: "visible" });

    await page.fill("#propertyName",     PROP_NAME);
    await page.fill("#propertyAddress",  "42 E2E Street, Test City");
    await page.fill("#propertyLocality", "E2E Locality");
    await page.selectOption("#propertyType", "Apartment");
    await page.fill("#unitCount", "3");

    await page.click('button[type="submit"], #propertyForm button[type="submit"]');

    // Wait for modal to close (success) OR success message to appear
    await Promise.race([
      page.locator("#propertyModal").waitFor({ state: "hidden",  timeout: 8000 }),
      page.locator("#successMessage").waitFor({ state: "visible", timeout: 8000 }),
    ]);

    // The new property card should appear
    await expect(page.locator(`text="${PROP_NAME}"`)).toBeVisible({ timeout: 8000 });
  });

  // ── Search ────────────────────────────────────────────────────────────────
  test("search box filters properties by name", async ({ authPage: page }) => {
    await page.goto("/index.html");
    await page.locator("#propertiesContainer").waitFor({ state: "visible", timeout: 8000 });

    await page.fill("#searchInput", PROP_NAME);
    await page.waitForTimeout(600); // debounce

    await expect(page.locator(`text="${PROP_NAME}"`)).toBeVisible({ timeout: 6000 });
  });

  test("search with non-existent name shows empty state or no matching card", async ({ authPage: page }) => {
    await page.goto("/index.html");
    // Wait for at least one property card — proves loadProperties() finished.
    // Searching before this causes a race: search fires on properties=[], then
    // loadProperties() re-renders all cards after the search clears them.
    await page.locator(".property-card").first().waitFor({ state: "visible", timeout: 8000 });

    await page.fill("#searchInput", "zzz_no_such_property_xyz");

    // renderProperties([]) replaces innerHTML entirely, so .property-card count → 0.
    await page.waitForFunction(
      () => document.querySelectorAll(".property-card").length === 0,
      { timeout: 5000 }
    );
  });

  // ── Edit property ─────────────────────────────────────────────────────────
  test("Edit button opens modal pre-filled with property data", async ({ authPage: page }) => {
    await page.goto("/index.html");
    await page.locator("#propertiesContainer").waitFor({ state: "visible", timeout: 8000 });

    // Find the card for PROP_NAME and click its Edit button
    const card    = page.locator(".property-card").filter({ hasText: PROP_NAME });
    const editBtn = card.locator("button.btn-warning, button:has-text('Edit')").first();
    await editBtn.click();

    await expect(page.locator("#propertyModal")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#propertyName")).toHaveValue(PROP_NAME);
  });

  test("editing and saving a property updates the card title", async ({ authPage: page }) => {
    await page.goto("/index.html");
    await page.locator("#propertiesContainer").waitFor({ state: "visible", timeout: 8000 });

    const card    = page.locator(".property-card").filter({ hasText: PROP_NAME });
    const editBtn = card.locator("button.btn-warning, button:has-text('Edit')").first();
    await editBtn.click();

    await page.locator("#propertyModal").waitFor({ state: "visible" });
    await page.fill("#propertyName", PROP_UPDATED);
    await page.click('button[type="submit"], #propertyForm button[type="submit"]');

    await expect(page.locator(`text="${PROP_UPDATED}"`)).toBeVisible({ timeout: 8000 });
  });

  // ── Delete property ───────────────────────────────────────────────────────
  test("Delete button removes the property from the list", async ({ authPage: page }) => {
    await page.goto("/index.html");
    await page.locator("#propertiesContainer").waitFor({ state: "visible", timeout: 8000 });

    const card   = page.locator(".property-card").filter({ hasText: PROP_UPDATED });
    const delBtn = card.locator("button.btn-danger, button:has-text('Delete')").first();

    // Accept confirmation dialog
    page.on("dialog", (d) => d.accept());
    await delBtn.click();

    await expect(page.locator(`text="${PROP_UPDATED}"`)).toHaveCount(0, { timeout: 8000 });
  });
});
