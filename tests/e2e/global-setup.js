/**
 * global-setup.js — runs once before the entire test suite.
 *
 * Fully idempotent: if a previous run crashed before teardown, the existing
 * E2E_Property / E2E-101 unit are reused instead of recreated.
 *
 * Order:
 * 1. Register the E2E manager account (ignores 400 if already exists).
 * 2. Login and capture JWT.
 * 3. Get-or-create test Property.
 * 4. Get-or-create test Unit inside that property.
 * 5. Write .test-state.json for fixtures to consume.
 */

const fs   = require("fs");
const path = require("path");

const BASE_URL   = process.env.TEST_BASE_URL || "http://localhost:3000";
const STATE_FILE = path.join(__dirname, ".test-state.json");

const TEST_USER = {
  name:     "E2E Test Manager",
  username: "e2e_test_mgr",
  email:    "e2e_test_mgr@propertysync.dev",
  phone:    "9999999999",
  password: "E2eTest@Secure1",
  role:     "manager",
};

const PROP_NAME    = "E2E_Property";
const UNIT_NUMBER  = "E2E-101";

async function get(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

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

  // 3 — Get-or-create test Property
  let propertyId, propertyName;
  {
    const createData = await post(
      `${BASE_URL}/api/properties`,
      { name: PROP_NAME, address: "1 Test Lane, Test City", locality: "Test Locality", type: "Apartment", unitCount: 5 },
      token
    );

    if (createData._id) {
      // Created fresh
      propertyId   = createData._id;
      propertyName = createData.name;
      console.log(`[global-setup] Created property ${propertyId}`);
    } else {
      // Already exists — find it in the list
      const all = await get(`${BASE_URL}/api/properties`, token);
      const list = Array.isArray(all) ? all : (all.data || []);
      const existing = list.find((p) => p.name === PROP_NAME);
      if (!existing) {
        throw new Error(`[global-setup] Property creation failed and not found: ${JSON.stringify(createData)}`);
      }
      propertyId   = existing._id;
      propertyName = existing.name;
      console.log(`[global-setup] Reusing existing property ${propertyId}`);
    }
  }

  // 4 — Get-or-create test Unit
  let unitId;
  {
    const createData = await post(
      `${BASE_URL}/api/units`,
      { unit_number: UNIT_NUMBER, property: propertyId, type: "1BHK", floor: 1, area: 500, rent: 10000, security_deposit: 20000, status: "available" },
      token
    );

    if (createData._id) {
      unitId = createData._id;
      console.log(`[global-setup] Created unit ${unitId}`);
    } else {
      // Already exists — look it up by property
      const propUnits = await get(`${BASE_URL}/api/units/property/${propertyId}`, token);
      const list = Array.isArray(propUnits) ? propUnits : (propUnits.units || []);
      const existing = list.find((u) => u.unit_number === UNIT_NUMBER);
      if (!existing) {
        throw new Error(`[global-setup] Unit creation failed and not found: ${JSON.stringify(createData)}`);
      }
      unitId = existing._id;
      console.log(`[global-setup] Reusing existing unit ${unitId}`);
    }
  }

  // 5 — Get-or-create tenant user for RBAC tests
  const TENANT_USER = {
    name:     "E2E Tenant User",
    username: "e2e_test_tnt",
    email:    "e2e_tnt@propertysync.dev",
    phone:    "9111111111",
    password: "E2eTest@Secure1",
    role:     "tenant",
  };

  await fetch(`${BASE_URL}/api/auth/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(TENANT_USER),
  });

  const tenantLogin = await post(`${BASE_URL}/api/auth/login`, {
    username: TENANT_USER.username,
    password: TENANT_USER.password,
  });
  if (!tenantLogin.token) {
    throw new Error(`[global-setup] Tenant login failed: ${JSON.stringify(tenantLogin)}`);
  }
  const tenantToken = tenantLogin.token;
  const tenantUser  = tenantLogin.user;
  console.log("[global-setup] Tenant user ready");

  // 6 — Persist state
  const state = { token, user, tenantToken, tenantUser, baseUrl: BASE_URL, propertyId, propertyName, unitId };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`[global-setup] State written → propertyId=${propertyId}  unitId=${unitId}`);
}

module.exports = globalSetup;
