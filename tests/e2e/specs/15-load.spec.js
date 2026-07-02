/**
 * 15-load.spec.js
 * Concurrency and load — verifies that the backend handles rapid parallel
 * requests without crashing (no 5xx) and that sequential creation of unique
 * resources succeeds reliably.
 *
 * Note: the app-level uniqueness check (findOne → create) is not atomic.
 * Under truly concurrent load ALL requests may succeed before any can see the
 * others, so the test verifies only that no server errors occur, not that
 * exactly one request succeeds.
 */

const { test, expect } = require("../fixtures");

const CONCURRENT_PROP = "E2E_Concurrent_Test";

test.describe.serial("Concurrency & Load", () => {
  // ── Pre-cleanup ───────────────────────────────────────────────────────────

  test.beforeAll(async () => {
    const fs   = require("fs");
    const path = require("path");
    const { token, baseUrl } = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../.test-state.json"), "utf8")
    );
    const headers = { Authorization: `Bearer ${token}` };
    const res  = await fetch(`${baseUrl}/api/properties`, { headers });
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.properties || data.data || []);
    const existing = list.filter((p) => p.name === CONCURRENT_PROP);
    for (const p of existing) {
      await fetch(`${baseUrl}/api/properties/${p._id}`, { method: "DELETE", headers });
      console.log("[15-load] Pre-cleanup: removed leftover concurrent test property");
    }
  });

  // ── Concurrent requests: no 5xx under parallel load ──────────────────────

  test("5 simultaneous POST requests return no server errors (2xx or 4xx only)", async ({
    page,
    state,
  }) => {
    const payload = {
      name:      CONCURRENT_PROP,
      address:   "5 Concurrent Blvd, Test City",
      type:      "Apartment",
      unitCount: 2,
    };
    const headers = {
      Authorization:  `Bearer ${state.token}`,
      "Content-Type": "application/json",
    };

    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        page.request.post(`${state.baseUrl}/api/properties`, { headers, data: payload })
      )
    );

    const statuses = await Promise.all(responses.map((r) => r.status()));

    // No server error (5xx) is acceptable under concurrent load
    const serverErrors = statuses.filter((s) => s >= 500);
    expect(serverErrors.length).toBe(0);

    // At least 1 must have succeeded
    const successes = statuses.filter((s) => s < 300);
    expect(successes.length).toBeGreaterThanOrEqual(1);

    // Cleanup: delete all properties that were created
    for (const r of responses) {
      try {
        const body = await r.json();
        if (body._id) {
          await page.request.delete(`${state.baseUrl}/api/properties/${body._id}`, {
            headers: { Authorization: `Bearer ${state.token}` },
          });
        }
      } catch (_) { /* error responses have no _id */ }
    }
  });

  // ── Rapid read requests: all succeed ─────────────────────────────────────

  test("20 simultaneous GET /api/properties requests all return 200", async ({
    page,
    state,
  }) => {
    const headers = { Authorization: `Bearer ${state.token}` };
    const responses = await Promise.all(
      Array.from({ length: 20 }, () =>
        page.request.get(`${state.baseUrl}/api/properties`, { headers })
      )
    );

    const statuses = await Promise.all(responses.map((r) => r.status()));
    const failures  = statuses.filter((s) => s !== 200);
    expect(failures.length).toBe(0);
  });

  // ── Sequential unique writes: all succeed ────────────────────────────────

  test("5 sequential property creations with unique names all succeed", async ({
    page,
    state,
  }) => {
    const headers = { Authorization: `Bearer ${state.token}`, "Content-Type": "application/json" };
    const created = [];

    for (let i = 0; i < 5; i++) {
      const res = await page.request.post(`${state.baseUrl}/api/properties`, {
        headers,
        data: {
          name:      `E2E_Seq_Load_${i}_${Date.now()}`,
          address:   `${i} Sequential Ave, Load City`,
          type:      "Apartment",
          unitCount: 1,
        },
      });
      expect(res.status()).toBeLessThan(300);
      const body = await res.json();
      if (body._id) created.push(body._id);
    }

    // Cleanup
    for (const id of created) {
      await page.request.delete(`${state.baseUrl}/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
    }
  });
});
