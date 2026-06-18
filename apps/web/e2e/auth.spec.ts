import { test, expect } from '@playwright/test';

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Welcome Back')).toBeVisible();
  await expect(page.getByText('Demo Credentials')).toBeVisible();
});

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForURL('**/login');
  expect(page.url()).toContain('/login');
});
