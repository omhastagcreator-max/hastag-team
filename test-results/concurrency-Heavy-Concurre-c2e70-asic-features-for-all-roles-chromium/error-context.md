# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: concurrency.spec.ts >> Heavy Concurrent User Load Testing >> Simultaneously login and browse basic features for all roles
- Location: test/concurrency.spec.ts:15:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/employee/dashboard**" until "load"
  navigated to "http://localhost:8080/dashboard"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e4]:
    - generic [ref=e8]:
      - generic [ref=e10]:
        - generic [ref=e11]:
          - img "Hastag Team Logo" [ref=e12]
          - generic [ref=e13]: Hastag-Team
        - list [ref=e15]:
          - listitem [ref=e16]:
            - link "Overview" [ref=e17] [cursor=pointer]:
              - /url: /admin
              - img [ref=e18]
              - generic [ref=e23]: Overview
          - listitem [ref=e24]:
            - link "Projects" [ref=e25] [cursor=pointer]:
              - /url: /admin/projects
              - img [ref=e26]
              - generic [ref=e29]: Projects
          - listitem [ref=e30]:
            - link "Clients" [ref=e31] [cursor=pointer]:
              - /url: /admin/clients
              - img [ref=e32]
              - generic [ref=e36]: Clients
          - listitem [ref=e37]:
            - link "Employees" [ref=e38] [cursor=pointer]:
              - /url: /admin/employees
              - img [ref=e39]
              - generic [ref=e44]: Employees
          - listitem [ref=e45]:
            - link "Reports" [ref=e46] [cursor=pointer]:
              - /url: /admin/reports
              - img [ref=e47]
              - generic [ref=e49]: Reports
          - listitem [ref=e50]:
            - link "Work Room" [ref=e51] [cursor=pointer]:
              - /url: /workroom
              - img [ref=e52]
              - generic [ref=e55]: Work Room
      - generic [ref=e56]:
        - generic [ref=e57]: System Admin
        - button "Sign Out" [ref=e58] [cursor=pointer]:
          - img
          - text: Sign Out
    - generic [ref=e59]:
      - banner [ref=e60]:
        - button "Toggle Sidebar" [ref=e61] [cursor=pointer]:
          - img
          - generic [ref=e62]: Toggle Sidebar
      - main [ref=e63]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - heading "Admin Overview" [level=1] [ref=e67]
            - paragraph [ref=e68]: Spot what's wrong, fast.
          - generic [ref=e69]:
            - generic [ref=e72]:
              - img [ref=e73]
              - paragraph [ref=e76]: "5"
              - paragraph [ref=e77]: Total Tasks
            - generic [ref=e80]:
              - img [ref=e81]
              - paragraph [ref=e84]: "0"
              - paragraph [ref=e85]: Completed
            - generic [ref=e88]:
              - img [ref=e89]
              - paragraph [ref=e96]: "5"
              - paragraph [ref=e97]: Pending
            - generic [ref=e100]:
              - img [ref=e101]
              - paragraph [ref=e103]: "0"
              - paragraph [ref=e104]: Overdue
            - generic [ref=e107]:
              - img [ref=e108]
              - paragraph [ref=e110]: "3"
              - paragraph [ref=e111]: Active Sessions
          - generic [ref=e112]:
            - generic [ref=e114]:
              - heading "Overdue Tasks (Global) 0" [level=3] [ref=e116]:
                - img [ref=e117]
                - text: Overdue Tasks (Global)
                - generic [ref=e119]: "0"
              - paragraph [ref=e121]: No overdue tasks. Nice.
            - generic [ref=e123]:
              - heading "At-Risk Projects 0" [level=3] [ref=e125]:
                - img [ref=e126]
                - text: At-Risk Projects
                - generic [ref=e133]: "0"
              - paragraph [ref=e135]: All projects are healthy.
          - generic [ref=e137]:
            - heading "Employee Performance Today" [level=3] [ref=e139]:
              - img [ref=e140]
              - text: Employee Performance Today
            - generic [ref=e146]:
              - button "Om omu7034@gmail.com 0.0h 0 tasks" [ref=e147] [cursor=pointer]:
                - generic [ref=e148]:
                  - paragraph [ref=e149]: Om
                  - paragraph [ref=e150]: omu7034@gmail.com
                - generic [ref=e151]:
                  - generic [ref=e152]: 0.0h
                  - generic [ref=e153]: 0 tasks
              - button "Om2 imdone824@gmail.com 0.0h 0 tasks" [ref=e154] [cursor=pointer]:
                - generic [ref=e155]:
                  - paragraph [ref=e156]: Om2
                  - paragraph [ref=e157]: imdone824@gmail.com
                - generic [ref=e158]:
                  - generic [ref=e159]: 0.0h
                  - generic [ref=e160]: 0 tasks
              - button "Sakshi sakshi@team.com 0.0h 0 tasks" [ref=e161] [cursor=pointer]:
                - generic [ref=e162]:
                  - paragraph [ref=e163]: Sakshi
                  - paragraph [ref=e164]: sakshi@team.com
                - generic [ref=e165]:
                  - generic [ref=e166]: 0.0h
                  - generic [ref=e167]: 0 tasks
              - button "Om om@team.com 0.0h 0 tasks" [ref=e168] [cursor=pointer]:
                - generic [ref=e169]:
                  - paragraph [ref=e170]: Om
                  - paragraph [ref=e171]: om@team.com
                - generic [ref=e172]:
                  - generic [ref=e173]: 0.0h
                  - generic [ref=e174]: 0 tasks
              - button "Sakshi sakshi@hastag.com 0.0h 0 tasks" [ref=e175] [cursor=pointer]:
                - generic [ref=e176]:
                  - paragraph [ref=e177]: Sakshi
                  - paragraph [ref=e178]: sakshi@hastag.com
                - generic [ref=e179]:
                  - generic [ref=e180]: 0.0h
                  - generic [ref=e181]: 0 tasks
              - button "Om om@hastag.com 0.0h 0 tasks" [ref=e182] [cursor=pointer]:
                - generic [ref=e183]:
                  - paragraph [ref=e184]: Om
                  - paragraph [ref=e185]: om@hastag.com
                - generic [ref=e186]:
                  - generic [ref=e187]: 0.0h
                  - generic [ref=e188]: 0 tasks
          - generic [ref=e190]:
            - heading "Client Overview" [level=3] [ref=e192]:
              - img [ref=e193]
              - text: Client Overview
            - generic [ref=e198]:
              - generic [ref=e199]:
                - generic [ref=e200]:
                  - generic [ref=e201]:
                    - paragraph [ref=e202]: Clietn1
                    - paragraph [ref=e203]: me.om.upadhyay@gmail.com
                  - generic [ref=e204]:
                    - paragraph [ref=e205]: $0
                    - paragraph [ref=e206]: LTV
                - generic [ref=e207]:
                  - generic [ref=e208]:
                    - generic [ref=e209]: 0 active projects
                    - generic [ref=e210]: 0%
                  - progressbar [ref=e211]
              - generic [ref=e213]:
                - generic [ref=e214]:
                  - generic [ref=e215]:
                    - paragraph [ref=e216]: Vellor Living
                    - paragraph [ref=e217]: client@vellorliving.com
                  - generic [ref=e218]:
                    - paragraph [ref=e219]: $5,000
                    - paragraph [ref=e220]: LTV
                - generic [ref=e221]:
                  - generic [ref=e222]:
                    - generic [ref=e223]: 1 active project
                    - generic [ref=e224]: 0%
                  - progressbar [ref=e225]
              - generic [ref=e227]:
                - generic [ref=e228]:
                  - generic [ref=e229]:
                    - paragraph [ref=e230]: Oudfy Perfumes
                    - paragraph [ref=e231]: oudfy@hastag.com
                  - generic [ref=e232]:
                    - paragraph [ref=e233]: $3,500
                    - paragraph [ref=e234]: LTV
                - generic [ref=e235]:
                  - generic [ref=e236]:
                    - generic [ref=e237]: 1 active project
                    - generic [ref=e238]: 0%
                  - progressbar [ref=e239]
              - generic [ref=e241]:
                - generic [ref=e242]:
                  - generic [ref=e243]:
                    - paragraph [ref=e244]: Pamya Jewels
                    - paragraph [ref=e245]: client@pamyajewels.com
                  - generic [ref=e246]:
                    - paragraph [ref=e247]: $8,000
                    - paragraph [ref=e248]: LTV
                - generic [ref=e249]:
                  - generic [ref=e250]:
                    - generic [ref=e251]: 1 active project
                    - generic [ref=e252]: 0%
                  - progressbar [ref=e253]
              - generic [ref=e255]:
                - generic [ref=e256]:
                  - generic [ref=e257]:
                    - paragraph [ref=e258]: Oudfy Perfumes
                    - paragraph [ref=e259]: client@oudfyperfumes.com
                  - generic [ref=e260]:
                    - paragraph [ref=e261]: $3,500
                    - paragraph [ref=e262]: LTV
                - generic [ref=e263]:
                  - generic [ref=e264]:
                    - generic [ref=e265]: 1 active project
                    - generic [ref=e266]: 0%
                  - progressbar [ref=e267]
              - generic [ref=e269]:
                - generic [ref=e270]:
                  - generic [ref=e271]:
                    - paragraph [ref=e272]: Pamya Jewels
                    - paragraph [ref=e273]: pamya@hastag.com
                  - generic [ref=e274]:
                    - paragraph [ref=e275]: $8,000
                    - paragraph [ref=e276]: LTV
                - generic [ref=e277]:
                  - generic [ref=e278]:
                    - generic [ref=e279]: 1 active project
                    - generic [ref=e280]: 0%
                  - progressbar [ref=e281]
              - generic [ref=e283]:
                - generic [ref=e284]:
                  - generic [ref=e285]:
                    - paragraph [ref=e286]: Vellor Living
                    - paragraph [ref=e287]: vellor@hastag.com
                  - generic [ref=e288]:
                    - paragraph [ref=e289]: $5,000
                    - paragraph [ref=e290]: LTV
                - generic [ref=e291]:
                  - generic [ref=e292]:
                    - generic [ref=e293]: 1 active project
                    - generic [ref=e294]: 0%
                  - progressbar [ref=e295]
          - generic [ref=e299]:
            - heading "Team Screen Status" [level=3] [ref=e301]:
              - img [ref=e302]
              - text: Team Screen Status
            - generic [ref=e306]:
              - generic [ref=e307]:
                - generic [ref=e308]:
                  - heading "Om2" [level=4] [ref=e309]
                  - generic [ref=e312]: Not Sharing
                - button "View Mode" [disabled]
              - generic [ref=e313]:
                - generic [ref=e314]:
                  - heading "Om" [level=4] [ref=e315]
                  - generic [ref=e318]: Sharing
                - button "View Mode" [ref=e319] [cursor=pointer]
              - generic [ref=e320]:
                - generic [ref=e321]:
                  - heading "Sakshi" [level=4] [ref=e322]
                  - generic [ref=e325]: Sharing
                - button "View Mode" [ref=e326] [cursor=pointer]
              - generic [ref=e327]:
                - generic [ref=e328]:
                  - heading "Om" [level=4] [ref=e329]
                  - generic [ref=e332]: Not Sharing
                - button "View Mode" [disabled]
              - generic [ref=e333]:
                - generic [ref=e334]:
                  - heading "Om" [level=4] [ref=e335]
                  - generic [ref=e338]: Not Sharing
                - button "View Mode" [disabled]
              - generic [ref=e339]:
                - generic [ref=e340]:
                  - heading "Sakshi" [level=4] [ref=e341]
                  - generic [ref=e344]: Not Sharing
                - button "View Mode" [disabled]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Configuration for users mapped to the mock accounts initialized in seed.js
  4  | const users = [
  5  |   { email: 'admin@hastag.com', role: 'admin', expectedUrl: '/admin/dashboard' },
  6  |   { email: 'sakshi@hastag.com', role: 'employee', expectedUrl: '/employee/dashboard' },
  7  |   { email: 'om@hastag.com', role: 'employee', expectedUrl: '/employee/dashboard' },
  8  |   { email: 'sales@hastag.com', role: 'sales', expectedUrl: '/sales/dashboard' },
  9  |   { email: 'vellor@hastag.com', role: 'client', expectedUrl: '/client/dashboard' },
  10 |   { email: 'oudfy@hastag.com', role: 'client', expectedUrl: '/client/dashboard' },
  11 |   { email: 'pamya@hastag.com', role: 'client', expectedUrl: '/client/dashboard' }
  12 | ];
  13 | 
  14 | test.describe('Heavy Concurrent User Load Testing', () => {
  15 |   test('Simultaneously login and browse basic features for all roles', async ({ browser }) => {
  16 |     // High timeout for complex concurrent browser spins up
  17 |     test.setTimeout(120000);
  18 | 
  19 |     // 1. Create a segregated browser context and page for each user concurrently
  20 |     const userSessions = await Promise.all(
  21 |       users.map(async (user) => {
  22 |         const context = await browser.newContext();
  23 |         const page = await context.newPage();
  24 |         return { user, context, page };
  25 |       })
  26 |     );
  27 | 
  28 |     // 2. Login synchronously or parallel
  29 |     await Promise.all(
  30 |       userSessions.map(async ({ user, page }) => {
  31 |         await page.goto('http://localhost:8080/login');
  32 |         await page.fill('input[type="email"]', user.email);
  33 |         await page.fill('input[type="password"]', 'password123');
  34 |         await page.click('button[type="submit"]');
  35 | 
  36 |         // Verify successful redirection
> 37 |         await page.waitForURL(`**${user.expectedUrl}**`, { timeout: 30000 });
     |                    ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  38 |         const bodyContent = await page.locator('body').textContent();
  39 |         expect(bodyContent).toBeTruthy();
  40 |       })
  41 |     );
  42 | 
  43 |     // 3. Perform intensive feature testing depending on the role simultaneously
  44 |     await Promise.all(
  45 |       userSessions.map(async ({ user, page }) => {
  46 |         if (user.role === 'employee') {
  47 |           // Employee interaction path
  48 |           await page.goto('http://localhost:8080/tasks');
  49 |           await page.waitForTimeout(2000);
  50 |           
  51 |           await page.goto('http://localhost:8080/workroom');
  52 |           await page.waitForSelector('text=Work Room', { timeout: 15000 });
  53 |         } else if (user.role === 'admin') {
  54 |           // Admin interaction path iterating multiple views aggressively
  55 |           await page.goto('http://localhost:8080/admin/employees');
  56 |           await page.waitForTimeout(1000);
  57 |           
  58 |           await page.goto('http://localhost:8080/admin/projects');
  59 |           await page.waitForTimeout(1000);
  60 |           
  61 |           await page.goto('http://localhost:8080/admin/reports');
  62 |           await page.waitForTimeout(1000);
  63 |         } else if (user.role === 'sales') {
  64 |           await page.goto('http://localhost:8080/sales/dashboard');
  65 |           await page.waitForTimeout(5000);
  66 |         } else if (user.role === 'client') {
  67 |           await page.waitForTimeout(5000);
  68 |         }
  69 |       })
  70 |     );
  71 | 
  72 |     // 4. Cleanup
  73 |     await Promise.all(
  74 |       userSessions.map(async ({ context }) => {
  75 |         await context.close();
  76 |       })
  77 |     );
  78 |   });
  79 | });
  80 | 
```