import { test, expect } from '@playwright/test';

test('marketing renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SpinVisa/);
});
