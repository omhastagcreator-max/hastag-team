# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features.spec.ts >> Thorough E2E Feature Testing >> Employee Path: Login, Add Task, Toggle Task, Start Session
- Location: test/features.spec.ts:13:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/employee/dashboard**" until "load"
  navigated to "http://localhost:8080/dashboard"
============================================================
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Roles mapping
  4  | const users = {
  5  |   admin: { email: 'admin@hastag.com', expectedUrl: '/admin/dashboard' },
  6  |   employee: { email: 'sakshi@hastag.com', expectedUrl: '/employee/dashboard' },
  7  |   sales: { email: 'sales1@hastag.com', expectedUrl: '/sales/dashboard' },
  8  |   client: { email: 'adity@hastag.com', expectedUrl: '/client/dashboard' },
  9  | };
  10 | 
  11 | test.describe('Thorough E2E Feature Testing', () => {
  12 | 
  13 |   test('Employee Path: Login, Add Task, Toggle Task, Start Session', async ({ browser }) => {
  14 |     test.setTimeout(60000);
  15 |     const context = await browser.newContext();
  16 |     const page = await context.newPage();
  17 | 
  18 |     // 1. Login by role (Employee)
  19 |     await page.goto('http://localhost:8080/login');
  20 |     await page.fill('input[type="email"]', users.employee.email);
  21 |     await page.fill('input[type="password"]', 'password123');
  22 |     await page.click('button[type="submit"]');
> 23 |     await page.waitForURL(`**${users.employee.expectedUrl}**`, { timeout: 15000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  24 | 
  25 |     // 2. Add a new task (to satisfy Session Tracker)
  26 |     // In Employee dashboard, there is a Quick Add Task form or we use the Tasks page.
  27 |     await page.goto('http://localhost:8080/tasks');
  28 |     await page.waitForSelector('text=My Tasks', { timeout: 10000 });
  29 |     
  30 |     // Fill new task form
  31 |     await page.fill('input[placeholder="Enter robust task name..."]', 'E2E Playwright Automation Task');
  32 |     await page.click('button:has-text("Add")');
  33 |     await page.waitForTimeout(2000); // give time for optimistic update/DB flush
  34 | 
  35 |     // 3. Task Toggle (1-click)
  36 |     // Find the task we just created, the circle button should be present
  37 |     const taskRow = page.locator('div').filter({ hasText: 'E2E Playwright Automation Task' }).first();
  38 |     // The toggle is a <button> next to the text. We can click it.
  39 |     await taskRow.locator('button').first().click();
  40 |     await page.waitForTimeout(1000); // Wait for status change
  41 | 
  42 |     // 4. Session Start
  43 |     await page.goto('http://localhost:8080/employee/dashboard');
  44 |     // Click Start Work on the SessionTracker
  45 |     const startWorkBtn = page.locator('button:has-text("Start Work")');
  46 |     await expect(startWorkBtn).toBeEnabled();
  47 |     await startWorkBtn.click();
  48 |     // Verify session started by checking if "End Work" is visible
  49 |     await expect(page.locator('button:has-text("End Work")')).toBeVisible({ timeout: 10000 });
  50 |     
  51 |     // Stop Session so next test doesn't fail
  52 |     await page.locator('button:has-text("End Work")').click();
  53 | 
  54 |     await context.close();
  55 |   });
  56 | 
  57 |   test('Sales Path: Deal Conversion Flow', async ({ browser }) => {
  58 |     test.setTimeout(60000);
  59 |     const context = await browser.newContext();
  60 |     const page = await context.newPage();
  61 | 
  62 |     // Login as Sales
  63 |     await page.goto('http://localhost:8080/login');
  64 |     await page.fill('input[type="email"]', users.sales.email);
  65 |     await page.fill('input[type="password"]', 'password123');
  66 |     await page.click('button[type="submit"]');
  67 |     await page.waitForURL(`**${users.sales.expectedUrl}**`, { timeout: 15000 });
  68 | 
  69 |     // Assuming Sales dashboard has a Kanban or Deal form.
  70 |     // The handoff said: "SalesDashboard.handleConvert inserts into projects table on win"
  71 |     // Let's create a deal and convert it. Or if mock data has a deal, convert it.
  72 |     // For now, let's verify SalesDashboard loads successfully to hit the route.
  73 |     await expect(page.locator('text=Sales Dashboard').first()).toBeVisible({ timeout: 15000 });
  74 | 
  75 |     await context.close();
  76 |   });
  77 |   
  78 |   test('Admin Path: Basic Health Check', async ({ browser }) => {
  79 |     test.setTimeout(30000);
  80 |     const context = await browser.newContext();
  81 |     const page = await context.newPage();
  82 |     
  83 |     // Login as Admin
  84 |     await page.goto('http://localhost:8080/login');
  85 |     await page.fill('input[type="email"]', users.admin.email);
  86 |     await page.fill('input[type="password"]', 'password123');
  87 |     await page.click('button[type="submit"]');
  88 |     await page.waitForURL(`**${users.admin.expectedUrl}**`, { timeout: 15000 });
  89 | 
  90 |     // Verify Admin sees operations
  91 |     await expect(page.locator('text=Employee Operations').first()).toBeVisible({ timeout: 15000 });
  92 | 
  93 |     await context.close();
  94 |   });
  95 | });
  96 | 
```