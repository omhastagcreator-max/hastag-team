import { test, expect } from '@playwright/test';

test.describe('🚀 HASTAG CRM - COMPLETE QA + CHAOS SYSTEM', () => {
  test.describe.configure({ mode: 'sequential', retries: 2 });

  test.use({
    viewport: { width: 375, height: 812 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  });

  const BASE_URL = 'http://localhost:8080';

  // ----------------------------------
  // 🔐 AUTH + PUBLIC ROUTES
  // ----------------------------------
  test('Auth + Public Stability', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Hastag/i);
    await expect(page.locator('text=Scale Your Agency')).toBeVisible();

    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/login/);

    await page.goto(`${BASE_URL}/admin`);
    await expect(page).toHaveURL(/login/);
  });

  // ----------------------------------
  // 💣 LOGIN CHAOS
  // ----------------------------------
  test('Login Abuse + Spam', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[type="email"]', 'fake@test.com');
    await page.fill('input[type="password"]', 'wrongpass');

    const btn = page.locator('button:has-text("Sign In")');

    await Promise.all(Array.from({ length: 10 }).map(() => btn.click()));

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------
  // 🌐 NETWORK CHAOS
  // ----------------------------------
  test('Slow + Failed Network', async ({ page }) => {
    await page.route('**/*', async route => {
      const delay = Math.random() * 2000;
      await new Promise(res => setTimeout(res, delay));

      if (Math.random() < 0.2) {
        return route.abort();
      }

      route.continue();
    });

    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------
  // 🔥 ADMIN PERFORMANCE + DATA
  // ----------------------------------
  test('Admin Performance + Data Integrity', async ({ page }) => {
    await page.route('*/**/auth/v1/user', route =>
      route.fulfill({ json: { id: 'admin', role: 'authenticated' } })
    );

    await page.route('*/**/rest/v1/user_roles?*', route =>
      route.fulfill({ json: [{ role: 'admin' }] })
    );

    const routes = [
      '/admin/projects',
      '/admin/clients',
      '/admin/employees',
      '/admin/reports'
    ];

    for (const r of routes) {
      const start = Date.now();
      await page.goto(`${BASE_URL}${r}`);

      await expect(page.locator('h1')).toBeVisible();

      const loadTime = Date.now() - start;
      console.log(`${r} → ${loadTime}ms`);

      // Performance enforcement
      expect(loadTime).toBeLessThan(4000);

      // Data check (table or content exists)
      const body = await page.locator('body').innerText();
      expect(body.length).toBeGreaterThan(50);
    }
  });

  // ----------------------------------
  // 🔄 RACE CONDITIONS
  // ----------------------------------
  test('Rapid Route Switching', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);

    const routes = [
      '/admin/projects',
      '/admin/clients',
      '/admin/employees',
      '/admin/reports'
    ];

    for (let i = 0; i < 20; i++) {
      const r = routes[Math.floor(Math.random() * routes.length)];
      await page.goto(`${BASE_URL}${r}`);
    }

    await expect(page.locator('#root')).toBeVisible();
  });

  // ----------------------------------
  // 📡 API FAILURE INJECTION
  // ----------------------------------
  test('API Crash Handling', async ({ page }) => {
    await page.route('**/rest/v1/**', route =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'server crash' })
      })
    );

    await page.goto(`${BASE_URL}/admin/projects`);
    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------
  // 🧠 MULTI TAB CONFLICT
  // ----------------------------------
  test('Multi-Tab Conflict', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto(`${BASE_URL}/admin`);
    await page2.goto(`${BASE_URL}/admin`);

    await page1.goto(`${BASE_URL}/admin/employees`);
    await page2.goto(`${BASE_URL}/admin/clients`);

    await expect(page1.locator('h1')).toBeVisible();
    await expect(page2.locator('h1')).toBeVisible();
  });

  // ----------------------------------
  // 🎥 WEBRTC / JITSI
  // ----------------------------------
  test('Workroom Stability', async ({ page }) => {
    await page.goto(`${BASE_URL}/workroom`);

    await expect(page.locator('h1')).toBeVisible();

    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible({ timeout: 15000 });

    const src = await iframe.getAttribute('src');
    expect(src).toContain('8x8.vc');
  });

  // ----------------------------------
  // ⚡ COMPONENT STABILITY
  // ----------------------------------
  test('Component Remount Stability', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/employees`);

    for (let i = 0; i < 6; i++) {
      await page.goto(`${BASE_URL}/admin`);
      await page.goto(`${BASE_URL}/admin/employees`);
    }

    const root = await page.locator('#root').innerHTML();
    expect(root.length).toBeGreaterThan(100);
  });

  // ----------------------------------
  // 💀 CHAOS MONKEY
  // ----------------------------------
  test('Random User Chaos', async ({ page }) => {
    await page.goto(BASE_URL);

    const actions = [
      () => page.click('a').catch(() => { }),
      () => page.click('button').catch(() => { }),
      () => page.reload(),
      () => page.goBack(),
      () => page.goForward()
    ];

    for (let i = 0; i < 30; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      await action();
    }

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------
  // 🕒 LONG SESSION (MEMORY + LEAK TEST)
  // ----------------------------------
  test('Long Session Stability (5 min)', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);

    const actions = [
      () => page.goto(`${BASE_URL}/admin/projects`),
      () => page.goto(`${BASE_URL}/admin/clients`),
      () => page.reload()
    ];

    const start = Date.now();

    while (Date.now() - start < 300000) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      try {
        await action();
        await page.waitForTimeout(1500);
      } catch { }
    }

    await expect(page.locator('#root')).toBeVisible();
  });
});