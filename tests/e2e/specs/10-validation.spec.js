/**
 * 10-validation.spec.js
 * Input validation — Joi schema checks on the backend and HTML5 / frontend
 * guards on the UI. All API calls use the manager token.
 */

const { test, expect } = require("../fixtures");

test.describe.serial("Input Validation", () => {
  // ── Property — backend Joi validation ─────────────────────────────────────

  test("property name shorter than 3 chars is rejected (→ 400)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/properties`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: { name: "AB", address: "Valid Address Street", type: "Apartment", unitCount: 1 },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message || JSON.stringify(body)).toMatch(/name|3|short|length/i);
  });

  test("property name longer than 100 chars is rejected (→ 400)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/properties`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: { name: "A".repeat(101), address: "Valid Address Street", type: "Apartment", unitCount: 1 },
    });
    expect(res.status()).toBe(400);
  });

  test("invalid property type (not in enum) is rejected (→ 400)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/properties`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: { name: "Valid Name Prop", address: "Valid Address Street", type: "Shed", unitCount: 1 },
    });
    expect(res.status()).toBe(400);
  });

  test("property unitCount of 0 is rejected (→ 400)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/properties`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: { name: "Valid Name Prop", address: "Valid Address Street", type: "Apartment", unitCount: 0 },
    });
    expect(res.status()).toBe(400);
  });

  test("duplicate property name + address combination is rejected (→ 400)", async ({ page, state }) => {
    // E2E_Property at "1 Test Lane, Test City" already exists in global-setup
    const res = await page.request.post(`${state.baseUrl}/api/properties`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: { name: state.propertyName, address: "1 Test Lane, Test City", type: "Apartment", unitCount: 2 },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message || JSON.stringify(body)).toMatch(/exist|duplicate/i);
  });

  // ── Tenant — backend Joi validation ───────────────────────────────────────

  test("tenant with invalid email format is rejected (→ 400)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/tenants`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: {
        fullName:        "Test Person",
        email:           "not-an-email",
        phoneNumber:     "9888888888",
        propertyId:      state.propertyId,
        assignedUnit:    "E2E-101",
        unitId:          state.unitId,
        status:          "Active",
        monthlyRent:     10000,
        leaseStartDate:  "2026-01-01",
        leaseEndDate:    "2026-12-31",
        securityDeposit: 20000,
      },
    });
    expect(res.status()).toBe(400);
  });

  test("tenant phone number not exactly 10 digits is rejected (→ 400)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/tenants`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: {
        fullName:        "Test Person",
        email:           "valid@email.com",
        phoneNumber:     "123",          // too short
        propertyId:      state.propertyId,
        assignedUnit:    "E2E-101",
        unitId:          state.unitId,
        status:          "Active",
        monthlyRent:     10000,
        leaseStartDate:  "2026-01-01",
        leaseEndDate:    "2026-12-31",
        securityDeposit: 20000,
      },
    });
    expect(res.status()).toBe(400);
  });

  test("tenant lease end date before start date is rejected (→ 400)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/tenants`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: {
        fullName:        "Test Person",
        email:           "valid3@email.com",
        phoneNumber:     "9888888888",
        propertyId:      state.propertyId,
        assignedUnit:    "E2E-101",
        unitId:          state.unitId,
        status:          "Active",
        monthlyRent:     10000,
        leaseStartDate:  "2026-12-31",   // start AFTER end
        leaseEndDate:    "2026-01-01",
        securityDeposit: 20000,
      },
    });
    expect(res.status()).toBe(400);
  });

  // ── UI — HTML5 required-field validation ──────────────────────────────────

  test("submitting empty Add Property form leaves modal open (required fields block submit)", async ({
    authPage: page,
  }) => {
    await page.goto("/index.html");
    await page.click("#addPropertyBtn");
    await page.locator("#propertyModal").waitFor({ state: "visible" });

    // Submit without filling anything — HTML5 `required` should prevent it
    await page.click('#propertyForm button[type="submit"]');

    // Modal must still be visible because the browser blocked the submit
    await expect(page.locator("#propertyModal")).toBeVisible({ timeout: 2000 });
  });

  // ── Security — XSS output encoding ───────────────────────────────────────

  test("XSS payload in property name is stored as text and never executed", async ({
    authPage: page,
    state,
  }) => {
    const XSS_NAME = `XSS<script>window.__xss_probe=1</script>Prop_${Date.now()}`;

    // Create via API (bypasses UI sanitization — tests backend/output encoding)
    const createRes = await page.request.post(`${state.baseUrl}/api/properties`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: { name: XSS_NAME, address: "99 XSS Lane, Test City", type: "Apartment", unitCount: 1 },
    });

    // Backend may sanitize the name or accept it as-is; both are tested below
    const xssPropId =
      createRes.status() === 201 || createRes.status() === 200
        ? (await createRes.json())._id
        : null;

    try {
      // Navigate to property list — if XSS executed, window.__xss_probe would be set
      await page.goto("/index.html");
      await page.locator(".property-card, .empty-state").first().waitFor({ state: "visible", timeout: 8000 });

      const xssRan = await page.evaluate(() => window.__xss_probe);
      expect(xssRan).toBeFalsy();
    } finally {
      if (xssPropId) {
        await page.request.delete(`${state.baseUrl}/api/properties/${xssPropId}`, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
      }
    }
  });
});
