/**
 * 09-rbac.spec.js
 * Role-Based Access Control — verifies the tenant role is blocked from all
 * property and unit write operations, both at the API and UI level.
 *
 * Tenant token is provisioned by global-setup and stored in .test-state.json.
 */

const { test, expect } = require("../fixtures");

test.describe.serial("Role-Based Access Control", () => {
  // ── Property read (allowed for all roles) ─────────────────────────────────

  test("tenant can read the properties list (GET → 200)", async ({ page, state }) => {
    const res = await page.request.get(`${state.baseUrl}/api/properties`, {
      headers: { Authorization: `Bearer ${state.tenantToken}` },
    });
    expect(res.status()).toBe(200);
  });

  // ── Property write (blocked for tenant → 403) ─────────────────────────────

  test("tenant cannot create a property (POST → 403)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/properties`, {
      headers: {
        Authorization:  `Bearer ${state.tenantToken}`,
        "Content-Type": "application/json",
      },
      data: {
        name:      "Tenant_Hijack_Prop",
        address:   "1 Hijack St, Bad City",
        type:      "Apartment",
        unitCount: 1,
      },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.message || JSON.stringify(body)).toMatch(/denied|forbidden|admin|manager/i);
  });

  test("tenant cannot update a property (PUT → 403)", async ({ page, state }) => {
    const res = await page.request.put(
      `${state.baseUrl}/api/properties/${state.propertyId}`,
      {
        headers: {
          Authorization:  `Bearer ${state.tenantToken}`,
          "Content-Type": "application/json",
        },
        data: {
          name:      "Hijacked Name",
          address:   "1 Test Lane, Test City",
          type:      "Apartment",
          unitCount: 5,
        },
      }
    );
    expect(res.status()).toBe(403);
  });

  test("tenant cannot delete a property (DELETE → 403)", async ({ page, state }) => {
    const res = await page.request.delete(
      `${state.baseUrl}/api/properties/${state.propertyId}`,
      { headers: { Authorization: `Bearer ${state.tenantToken}` } }
    );
    expect(res.status()).toBe(403);
  });

  // ── Unit read (allowed for all roles) ─────────────────────────────────────

  test("tenant can read units for a property (GET → 200)", async ({ page, state }) => {
    const res = await page.request.get(
      `${state.baseUrl}/api/units/property/${state.propertyId}`,
      { headers: { Authorization: `Bearer ${state.tenantToken}` } }
    );
    expect(res.status()).toBe(200);
  });

  // ── Unit write (blocked for tenant → 403) ─────────────────────────────────

  test("tenant cannot create a unit (POST → 403)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/units`, {
      headers: {
        Authorization:  `Bearer ${state.tenantToken}`,
        "Content-Type": "application/json",
      },
      data: {
        unit_number:      "TNT-001",
        property:         state.propertyId,
        type:             "1BHK",
        floor:            1,
        area:             400,
        rent:             8000,
        security_deposit: 16000,
      },
    });
    expect(res.status()).toBe(403);
  });

  test("tenant cannot update a unit (PUT → 403)", async ({ page, state }) => {
    const res = await page.request.put(
      `${state.baseUrl}/api/units/${state.unitId}`,
      {
        headers: {
          Authorization:  `Bearer ${state.tenantToken}`,
          "Content-Type": "application/json",
        },
        data: { rent: 1 },
      }
    );
    expect(res.status()).toBe(403);
  });

  test("tenant cannot delete a unit (DELETE → 403)", async ({ page, state }) => {
    const res = await page.request.delete(
      `${state.baseUrl}/api/units/${state.unitId}`,
      { headers: { Authorization: `Bearer ${state.tenantToken}` } }
    );
    expect(res.status()).toBe(403);
  });

  // ── UI: tenant role triggers "Access Denied" when clicking Add Property ────

  test("UI: clicking Add Property as tenant shows Access Denied error", async ({ page, state }) => {
    // Inject tenant credentials into sessionStorage before page load
    await page.addInitScript(({ token, user }) => {
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("userData", JSON.stringify({ user }));
    }, { token: state.tenantToken, user: state.tenantUser });

    await page.goto("/index.html");
    await page.locator(".property-card, .empty-state").first().waitFor({ state: "visible", timeout: 8000 });

    await page.click("#addPropertyBtn");

    // Modal must stay hidden; error message must appear
    await expect(page.locator("#errorMessage")).toBeVisible({ timeout: 4000 });
    await expect(page.locator("#errorMessage")).toContainText(/access denied/i);
    await expect(page.locator("#propertyModal")).not.toBeVisible();
  });
});
