/**
 * global-teardown.js — runs once after the entire suite.
 * Deletes the Property + Unit created in global-setup (tenant is deleted in its own spec).
 */

const fs   = require("fs");
const path = require("path");

const STATE_FILE = path.join(__dirname, ".test-state.json");

async function del(url, token) {
  return fetch(url, {
    method:  "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function globalTeardown() {
  if (!fs.existsSync(STATE_FILE)) return;

  const { token, baseUrl, propertyId, unitId } = JSON.parse(
    fs.readFileSync(STATE_FILE, "utf8")
  );

  if (unitId) {
    await del(`${baseUrl}/api/units/${unitId}`, token).catch(() => {});
    console.log(`[global-teardown] Deleted unit ${unitId}`);
  }

  if (propertyId) {
    await del(`${baseUrl}/api/properties/${propertyId}`, token).catch(() => {});
    console.log(`[global-teardown] Deleted property ${propertyId}`);
  }

  fs.unlinkSync(STATE_FILE);
}

module.exports = globalTeardown;
