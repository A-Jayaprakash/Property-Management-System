/**
 * global-setup.js — runs once before the entire test suite.
 *
 * 1. Registers the E2E test manager account (idempotent — ignores 400 if it exists).
 * 2. Logs in and captures the JWT.
 * 3. Creates a shared test Property and Unit via the API.
 * 4. Writes everything to .test-state.json for fixtures to consume.
 */

const fs   = require("fs");
const path = require("path");

const BASE_URL  = process.env.TEST_BASE_URL || "http://localhost:3000";
const STATE_FILE = path.join(__dirname, ".test-state.json");

const TEST_USER = {
  name:     "E2E Test Manager",
  username: "e2e_test_mgr",
  email:    "e2e_test_mgr@propertysync.dev",
  phone:    "9999999999",
  password: "E2eTest@Secure1",
  role:     "manager",
};

async function post(url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  return res.json();
}

async function globalSetup() {
  // 1 — Register (ignore 400 "already exists")
  await fetch(`${BASE_URL}/api/auth/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(TEST_USER),
  });

  // 2 — Login
  const loginData = await post(`${BASE_URL}/api/auth/login`, {
    username: TEST_USER.username,
    password: TEST_USER.password,
  });
  if (!loginData.token) {
    throw new Error(`[global-setup] Login failed: ${JSON.stringify(loginData)}`);
  }
  const { token, user } = loginData;

  // 3 — Create test Property
  const propData = await post(
    `${BASE_URL}/api/properties`,
    { name: "E2E_Property", address: "1 Test Lane, Test City", locality: "Test Locality", type: "Apartment" },
    token
  );
  const propertyId   = propData._id;
  const propertyName = propData.name;
  if (!propertyId) throw new Error(`[global-setup] Property creation failed: ${JSON.stringify(propData)}`);

  // 4 — Create test Unit inside that property
  const unitData = await post(
    `${BASE_URL}/api/units`,
    { unit_number: "E2E-101", property: propertyId, type: "1BHK", floor: 1, rent: 10000, status: "available" },
    token
  );
  const unitId = unitData._id;
  if (!unitId) throw new Error(`[global-setup] Unit creation failed: ${JSON.stringify(unitData)}`);

  // 5 — Persist state
  const state = { token, user, baseUrl: BASE_URL, propertyId, propertyName, unitId };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`[global-setup] State written → propertyId=${propertyId}  unitId=${unitId}`);
}

module.exports = globalSetup;
