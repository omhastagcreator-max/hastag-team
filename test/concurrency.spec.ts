import { test, expect } from '@playwright/test';

// Configuration for users mapped to the mock accounts initialized in seed.js
const users = [
  { email: 'admin@hastag.com', role: 'admin', expectedUrl: '/admin/dashboard' },
  { email: 'sakshi@hastag.com', role: 'employee', expectedUrl: '/employee/dashboard' },
  { email: 'om@hastag.com', role: 'employee', expectedUrl: '/employee/dashboard' },
  { email: 'sales@hastag.com', role: 'sales', expectedUrl: '/sales/dashboard' },
  { email: 'vellor@hastag.com', role: 'client', expectedUrl: '/client/dashboard' },
  { email: 'oudfy@hastag.com', role: 'client', expectedUrl: '/client/dashboard' },
  { email: 'pamya@hastag.com', role: 'client', expectedUrl: '/client/dashboard' }
];

test.describe('Heavy Concurrent User Load Testing', () => {
  test('Simultaneously login and browse basic features for all roles', async ({ browser }) => {
    // High timeout for complex concurrent browser spins up
    test.setTimeout(120000);

    // 1. Create a segregated browser context and page for each user concurrently
    const userSessions = await Promise.all(
      users.map(async (user) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        return { user, context, page };
      })
    );

    // 2. Login synchronously or parallel
    await Promise.all(
      userSessions.map(async ({ user, page }) => {
        await page.goto('http://localhost:8080/login');
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Verify successful redirection
        await page.waitForURL(`**${user.expectedUrl}**`, { timeout: 30000 });
        const bodyContent = await page.locator('body').textContent();
        expect(bodyContent).toBeTruthy();
      })
    );

    // 3. Perform intensive feature testing depending on the role simultaneously
    await Promise.all(
      userSessions.map(async ({ user, page }) => {
        if (user.role === 'employee') {
          // Employee interaction path
          await page.goto('http://localhost:8080/tasks');
          await page.waitForTimeout(2000);
          
          await page.goto('http://localhost:8080/workroom');
          await page.waitForSelector('text=Work Room', { timeout: 15000 });
        } else if (user.role === 'admin') {
          // Admin interaction path iterating multiple views aggressively
          await page.goto('http://localhost:8080/admin/employees');
          await page.waitForTimeout(1000);
          
          await page.goto('http://localhost:8080/admin/projects');
          await page.waitForTimeout(1000);
          
          await page.goto('http://localhost:8080/admin/reports');
          await page.waitForTimeout(1000);
        } else if (user.role === 'sales') {
          await page.goto('http://localhost:8080/sales/dashboard');
          await page.waitForTimeout(5000);
        } else if (user.role === 'client') {
          await page.waitForTimeout(5000);
        }
      })
    );

    // 4. Cleanup
    await Promise.all(
      userSessions.map(async ({ context }) => {
        await context.close();
      })
    );
  });
});
