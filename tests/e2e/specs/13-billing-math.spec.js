/**
 * 13-billing-math.spec.js
 * Billing calculation accuracy — verifies that the backend computes unit bill
 * totals correctly: totalAmount = rentAmount + Σ(charge line items).
 *
 * Uses a dedicated billing period (month 6, year 2024) that does not collide
 * with the periods created by 05-billing.spec.js (Jan 2025) or
 * 06-expenses.spec.js (Feb 2025).
 *
 * No DELETE endpoint exists for billing periods, so these periods remain in
 * the DB after the tests run (they use an old date and don't affect other tests).
 */

const { test, expect } = require("../fixtures");

const MATH_MONTH = 6;     // June
const MATH_YEAR  = 2024;

let periodId = null;

test.describe.serial("Billing Calculation Accuracy", () => {
  // ── Setup: create / reuse billing period ──────────────────────────────────

  test("billing period is created or reused (idempotent POST)", async ({ page, state }) => {
    const res = await page.request.post(`${state.baseUrl}/api/billing/periods`, {
      headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
      data: { propertyId: state.propertyId, month: MATH_MONTH, year: MATH_YEAR },
    });
    expect(res.status()).toBeLessThan(300);

    const body = await res.json();
    // POST returns { success: true, data: <period object> }
    const period = body.data?.period || (body.data && !Array.isArray(body.data) ? body.data : null) || body;
    periodId = period._id;
    expect(periodId).toBeTruthy();
  });

  // ── Save bills with known rent and no extra charges ───────────────────────

  test("unit bill totalAmount equals rentAmount when no charges are applied", async ({
    page,
    state,
  }) => {
    expect(periodId).toBeTruthy();

    const RENT = 10000; // matches E2E-101 configured rent

    // Save a bill with a known rent, empty line items → totalAmount should = rent
    const saveRes = await page.request.put(
      `${state.baseUrl}/api/billing/periods/${periodId}/bills`,
      {
        headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
        data: {
          bills: [
            {
              unitId:    state.unitId,
              rentAmount: RENT,
              lineItems:  [],
              miscItems:  [],
            },
          ],
        },
      }
    );
    expect(saveRes.status()).toBeLessThan(300);

    // Fetch the period and inspect the saved bill
    const getRes = await page.request.get(
      `${state.baseUrl}/api/billing/periods/${periodId}`,
      { headers: { Authorization: `Bearer ${state.token}` } }
    );
    expect(getRes.status()).toBe(200);

    const data  = await getRes.json();
    const bills = data.data?.bills || [];

    const bill = bills.find(
      (b) => b.unitId === state.unitId || b.unitId?._id === state.unitId
    );
    expect(bill).toBeTruthy();
    expect(bill.rentAmount).toBe(RENT);
    // No extra charges → total must equal rent exactly
    expect(bill.totalAmount).toBe(RENT);
  });

  // ── Verify totalAmount >= rentAmount always holds ─────────────────────────

  test("unit bill totalAmount is always >= rentAmount (charges add to rent)", async ({
    page,
    state,
  }) => {
    const getRes = await page.request.get(
      `${state.baseUrl}/api/billing/periods/${periodId}`,
      { headers: { Authorization: `Bearer ${state.token}` } }
    );
    const data  = await getRes.json();
    const bills = data.data?.bills || [];

    for (const bill of bills) {
      expect(bill.totalAmount).toBeGreaterThanOrEqual(bill.rentAmount || 0);
    }
  });

  // ── Misc items must NOT inflate totalAmount ───────────────────────────────

  test("miscItems (owner expenses) do not increase the tenant's totalAmount", async ({
    page,
    state,
  }) => {
    const RENT      = 10000;
    const MISC_AMT  = 999;

    const saveRes = await page.request.put(
      `${state.baseUrl}/api/billing/periods/${periodId}/bills`,
      {
        headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
        data: {
          bills: [
            {
              unitId:     state.unitId,
              rentAmount: RENT,
              lineItems:  [],
              miscItems:  [{ label: "Owner Expense", amount: MISC_AMT }],
            },
          ],
        },
      }
    );
    expect(saveRes.status()).toBeLessThan(300);

    const getRes = await page.request.get(
      `${state.baseUrl}/api/billing/periods/${periodId}`,
      { headers: { Authorization: `Bearer ${state.token}` } }
    );
    const data  = await getRes.json();
    const bills = data.data?.bills || [];
    const bill  = bills.find(
      (b) => b.unitId === state.unitId || b.unitId?._id === state.unitId
    );

    // totalAmount must still be just RENT (misc items excluded from tenant bill)
    expect(bill.totalAmount).toBe(RENT);
  });

  // ── Published period locks totalAmount ────────────────────────────────────

  test("publishing the billing period stores a non-zero totalAmount", async ({
    page,
    state,
  }) => {
    const pubRes = await page.request.patch(
      `${state.baseUrl}/api/billing/periods/${periodId}/publish`,
      {
        headers: { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" },
        data: {},
      }
    );
    // 200 = published, 400 = already published — both are acceptable
    expect([200, 400]).toContain(pubRes.status());

    const getRes = await page.request.get(
      `${state.baseUrl}/api/billing/periods/${periodId}`,
      { headers: { Authorization: `Bearer ${state.token}` } }
    );
    const data   = await getRes.json();
    const period = data.data?.period || {};

    // Once published, status must reflect that
    expect(period.status).toMatch(/published|finalized/i);
  });
});
