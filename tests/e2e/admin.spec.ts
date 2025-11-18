import { test, expect } from '@playwright/test';

test.describe('Admin users page', () => {
  test('redirects to signin when unauthenticated', async ({ page }) => {
    await page.goto('/admin/users');
    // Server may either redirect to signin or render an Unauthorized/Forbidden message.
    const url = page.url();
    const body = (await page.locator('body').innerText()).toLowerCase();
    if (!/signin|login|auth/.test(url)) {
      expect(body).toMatch(/unauthorized|forbidden/);
    }
  });

  test('admin can see users and promote', async ({ page, request }) => {
    // Ensure there is another user to promote
    await request.post('/api/test/login', {
      data: { email: 'target-playwright@example.com', name: 'Target User', role: 'USER' },
    });

    // Create a test admin session via the test-only endpoint
    const resp = await request.post('/api/test/login', {
      data: { email: 'admin-playwright@example.com', name: 'Playwright Admin', role: 'ADMIN' },
    });
    expect(resp.ok()).toBeTruthy();
    const { sessionToken } = await resp.json();

    // Set the NextAuth session cookie used by the Prisma adapter (dev non-https default)
    await page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: sessionToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // Visit admin page authenticated as admin
    await page.goto('/admin/users');
    await expect(page.locator('text=Admin: Manage Users')).toBeVisible();

    // Promote/demote button exists and triggers modal
    const button = page.locator('button:has-text("Promote")').first();
    await expect(button).toBeVisible();
    await button.click();
    await expect(page.locator('text=Confirm')).toBeVisible();
    await page.locator('text=Confirm').click();

    // After action, expect table to refresh (shows users count)
    await expect(page.locator('h2:has-text("Users")').first()).toBeVisible();
  });
});
