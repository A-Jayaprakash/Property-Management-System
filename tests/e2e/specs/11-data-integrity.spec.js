/**
 * 11-data-integrity.spec.js
 * Data integrity — verifies constraint enforcement and documents known
 * behaviours (e.g. property deletion does NOT cascade to units).
 */

const { test, expect } = require("../fixtures");
const fs   = require("fs");
const path = require("path");

// Names used by tests in this file — pre-cleaned in beforeAll
const DI_CASCADE_PROP = "E2E_Cascade_Test_Prop";
const DI_CAP_PROP     = "E2E_Cap_Test_Prop";

function loadState() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../.test-state.json"), "utf8"));
}

test.describe.serial("Data Integrity", () => {
  // ── Pre-cleanup: remove leftovers from previous crashed runs ──────────────
  test.beforeAll(async () => {
    const { token, baseUrl } = loadState();
    const headers = { Authorization: `Bearer ${token}` };

    const res  = await fetch(`${baseUrl}/api/properties`, { headers });
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.properties || data.data || []);

    for (const name of [DI_CASCADE_PROP, DI_CAP_PROP]) {
      const p = list.find((x) => x.name === name);
      if (p) {
        // Delete all units under the property first (avoid FK issues)
        const uRes  = await fetch(`${baseUrl}/api/units/property/${p._id}`, { headers });
        const uData = await uRes.json();
        const units = Array.isArray(uData) ? uData : (uData.units || []);
        for (const u of units) {
          await fetch(`${baseUrl}/api/units/${u._id}`, { method: "DELETE", headers });
        }
        await fetch(`${baseUrl}/api/properties/${p._id}`, { method: "DELETE", headers });
        console.log(`[11-data-integrity] Pre-cleanup: removed "${name}"`);
      }
    }
  });

  // ── Cascade behaviour: deleting a property does NOT delete its units ──────

  test("deleting a property leaves its units orphaned (no cascade delete)", async ({
    page,
    state,
  }) => {
    const h = { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" };

    // Create a temporary property
    const propRes = await page.request.post(`${state.baseUrl}/api/properties`, {
      headers: h,
      data: { name: DI_CASCADE_PROP, address: "77 Cascade Rd", type: "House", unitCount: 2 },
    });
    expect(propRes.status()).toBeLessThan(300);
    const prop   = await propRes.json();
    const propId = prop._id;
    expect(propId).toBeTruthy();

    // Add a unit to it
    const unitRes = await page.request.post(`${state.baseUrl}/api/units`, {
      headers: h,
      data: {
        unit_number:      "CASCADE-01",
        property:         propId,
        type:             "1BHK",
        floor:            1,
        area:             400,
        rent:             5000,
        security_deposit: 10000,
      },
    });
    expect(unitRes.status()).toBeLessThan(300);
    const unitBody = await unitRes.json();
    // createUnit returns { message, unit: { _id, ... } }
    const unitId   = unitBody.unit?._id || unitBody._id;
    expect(unitId).toBeTruthy();

    // Delete the property
    const delRes = await page.request.delete(`${state.baseUrl}/api/properties/${propId}`, { headers: h });
    expect(delRes.status()).toBeLessThan(300);

    // Unit still exists in DB (no cascade)
    const getUnit = await page.request.get(`${state.baseUrl}/api/units/${unitId}`, { headers: h });
    expect(getUnit.status()).toBe(200);

    // Cleanup: delete the orphaned unit
    await page.request.delete(`${state.baseUrl}/api/units/${unitId}`, { headers: h });
    console.log("[11-data-integrity] Orphaned unit confirmed and cleaned up");
  });

  // ── Unit count cap ────────────────────────────────────────────────────────

  test("cannot add a unit beyond the property's configured unitCount", async ({
    page,
    state,
  }) => {
    const h = { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" };

    // Create a property that holds exactly 1 unit
    const propRes = await page.request.post(`${state.baseUrl}/api/properties`, {
      headers: h,
      data: { name: DI_CAP_PROP, address: "88 Cap Street", type: "Condo", unitCount: 1 },
    });
    expect(propRes.status()).toBeLessThan(300);
    const prop   = await propRes.json();
    const propId = prop._id;
    expect(propId).toBeTruthy();

    // First unit succeeds
    const u1Res  = await page.request.post(`${state.baseUrl}/api/units`, {
      headers: h,
      data: { unit_number: "CAP-01", property: propId, type: "1BHK", floor: 1, area: 400, rent: 5000, security_deposit: 10000 },
    });
    expect(u1Res.status()).toBeLessThan(300);
    const u1Body  = await u1Res.json();
    const unit1Id = u1Body.unit?._id || u1Body._id;

    // Second unit exceeds the cap → 400
    const u2Res = await page.request.post(`${state.baseUrl}/api/units`, {
      headers: h,
      data: { unit_number: "CAP-02", property: propId, type: "1BHK", floor: 1, area: 400, rent: 5000, security_deposit: 10000 },
    });
    expect(u2Res.status()).toBe(400);
    const body = await u2Res.json();
    expect(body.message || JSON.stringify(body)).toMatch(/capacity|unitCount|maximum|exceed|limit/i);

    // Cleanup
    await page.request.delete(`${state.baseUrl}/api/units/${unit1Id}`, { headers: h });
    await page.request.delete(`${state.baseUrl}/api/properties/${propId}`, { headers: h });
  });

  // ── Duplicate unit_number within same property ─────────────────────────────

  test("duplicate unit_number in the same property is rejected (→ 400)", async ({
    page,
    state,
  }) => {
    const h = { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" };

    const u1Res  = await page.request.post(`${state.baseUrl}/api/units`, {
      headers: h,
      data: { unit_number: "E2E-DUPE", property: state.propertyId, type: "2BHK", floor: 2, area: 600, rent: 12000, security_deposit: 24000 },
    });
    expect(u1Res.status()).toBeLessThan(300);
    const u1DupeBody = await u1Res.json();
    const unitId     = u1DupeBody.unit?._id || u1DupeBody._id;

    // Duplicate in the same property must fail
    const u2Res = await page.request.post(`${state.baseUrl}/api/units`, {
      headers: h,
      data: { unit_number: "E2E-DUPE", property: state.propertyId, type: "2BHK", floor: 2, area: 600, rent: 12000, security_deposit: 24000 },
    });
    expect(u2Res.status()).toBe(400);

    // Cleanup
    await page.request.delete(`${state.baseUrl}/api/units/${unitId}`, { headers: h });
  });

  // ── Double-booking: two active tenants on the same unit ───────────────────

  test("assigning a second active tenant to an occupied unit is rejected (→ 400)", async ({
    page,
    state,
  }) => {
    const h = { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" };
    // Use a timestamp in the email to avoid unique-email conflicts across runs
    const ts = Date.now();

    const baseTenant = {
      propertyId:      state.propertyId,
      assignedUnit:    "E2E-101",
      unitId:          state.unitId,
      status:          "Active",
      monthlyRent:     10000,
      leaseStartDate:  "2026-01-01",
      leaseEndDate:    "2026-12-31",
      securityDeposit: 20000,
    };

    // Create first tenant
    const t1Res  = await page.request.post(`${state.baseUrl}/api/tenants`, {
      headers: h,
      data: { ...baseTenant, fullName: "DI Tenant One", email: `di_one_${ts}@propertysync.dev`, phoneNumber: "9700000001" },
    });
    expect(t1Res.status()).toBeLessThan(300);
    const t1Body   = await t1Res.json();
    const tenant1Id = t1Body._id || t1Body.tenant?._id;

    try {
      // Second tenant on the SAME unit must be rejected
      const t2Res = await page.request.post(`${state.baseUrl}/api/tenants`, {
        headers: h,
        data: { ...baseTenant, fullName: "DI Tenant Two", email: `di_two_${ts}@propertysync.dev`, phoneNumber: "9700000002" },
      });
      expect(t2Res.status()).toBe(400);
      const errBody = await t2Res.json();
      expect(errBody.message || JSON.stringify(errBody)).toMatch(/occupied|active tenant|already/i);
    } finally {
      if (tenant1Id) {
        await page.request.delete(`${state.baseUrl}/api/tenants/${tenant1Id}`, { headers: h });
      }
    }
  });

  // ── 404 on non-existent resource ─────────────────────────────────────────

  test("GET non-existent property by ID returns 404", async ({ page, state }) => {
    const fakeId = "000000000000000000000001";
    const res = await page.request.get(`${state.baseUrl}/api/properties/${fakeId}`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    expect(res.status()).toBe(404);
  });
});
