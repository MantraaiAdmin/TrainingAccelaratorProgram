import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@constel.ai';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Demo@123';

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Welcome Back')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForURL('**/login**', { timeout: 15000 });
  expect(page.url()).toContain('/login');
});

test('admin login reaches admin dashboard', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/login');
  await page.locator('#login-email').fill(ADMIN_EMAIL);
  await page.locator('#login-password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL('**/admin**', { timeout: 45000 });
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({
    timeout: 15000,
  });

  await page.reload();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({
    timeout: 15000,
  });
});

test('student login reaches student dashboard', async ({ page }) => {
  test.setTimeout(60000);

  const loginResponse = await page.request.post('http://localhost:4000/api/v1/auth/login', {
    data: { email: 'student@demo.com', password: ADMIN_PASSWORD },
  });
  test.skip(!loginResponse.ok(), 'student@demo.com not seeded in local database');

  await page.goto('/login');
  await page.locator('#login-email').fill('student@demo.com');
  await page.locator('#login-password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL('**/dashboard**', { timeout: 45000 });
  expect(page.url()).not.toContain('/login');
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({
    timeout: 15000,
  });
});
