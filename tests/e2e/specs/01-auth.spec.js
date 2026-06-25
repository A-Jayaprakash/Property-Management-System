/**
 * 01-auth.spec.js
 * Authentication flows — login, logout, guard redirects.
 * These tests deliberately do NOT use the authPage fixture so the real
 * login form is exercised end-to-end.
 */

const { test, expect } = require("../fixtures");

const CREDS = { username: "e2e_test_mgr", password: "E2eTest@Secure1" };

test.describe.serial("Authentication", () => {
  // ── Login: success path ───────────────────────────────────────────────────
  test("valid credentials → redirects to home dashboard", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill("#username", CREDS.username);
    await page.fill("#password", CREDS.password);
    await page.click("#loginBtn");

    // Login posts, shows success message, then redirects after 1.5 s
    await expect(page.locator("#message")).toContainText(/success/i, { timeout: 5000 });
    await page.waitForURL("**/home.html", { timeout: 8000 });
    await expect(page).toHaveURL(/home\.html/);
  });

  // ── Login: wrong password ─────────────────────────────────────────────────
  test("wrong password → shows error, stays on login page", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill("#username", CREDS.username);
    await page.fill("#password", "WrongPassword999!");
    await page.click("#loginBtn");

    await expect(page.locator("#message")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#message")).toContainText(
      /invalid|incorrect|credentials/i
    );
    await expect(page).toHaveURL(/login\.html/);
  });

  // ── Login: unknown user ───────────────────────────────────────────────────
  test("unknown username → shows not found error", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill("#username", "ghost_user_xyz");
    await page.fill("#password", "SomePassword@123");
    await page.click("#loginBtn");

    await expect(page.locator("#message")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#message")).toContainText(/not found|invalid|user/i);
  });

  // ── Protected route guard ─────────────────────────────────────────────────
  test("accessing home.html without auth → redirected to login", async ({ page }) => {
    // Clear storage — no auth cookies/session
    await page.goto("/login.html");
    await page.evaluate(() => sessionStorage.clear());

    await page.goto("/home.html");
    await page.waitForURL("**/login.html", { timeout: 6000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test("accessing index.html without auth → redirected to login", async ({ page }) => {
    await page.goto("/login.html");
    await page.evaluate(() => sessionStorage.clear());

    await page.goto("/index.html");
    await page.waitForURL("**/login.html", { timeout: 6000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  test("logout clears session and redirects to login", async ({ authPage: page }) => {
    await page.goto("/home.html");
    await expect(page).toHaveURL(/home\.html/);

    // Click the logout button
    await page.click("button.btn-danger");
    await page.waitForURL("**/login.html", { timeout: 6000 });
    await expect(page).toHaveURL(/login\.html/);

    // sessionStorage should now be empty
    const token = await page.evaluate(() => sessionStorage.getItem("authToken"));
    expect(token).toBeNull();
  });
});
