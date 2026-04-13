import { test, expect } from '@playwright/test';

test('capture console errors', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER EXCEPTION:', error.message));

  console.log('Navigating to http://localhost:8080...');
  try {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(3000); // Give it time to crash
  } catch (e) {
    console.log('Navigation failed:', e);
  }
});
