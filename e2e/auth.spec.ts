import { test, expect, type Page } from '@playwright/test';

async function clearAuth(page: Page) {
    await page.evaluate(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('zama_auth');
            localStorage.removeItem('zama_user');
        }
    });
}

async function setupAuthState(page: Page) {
    await page.evaluate(() => {
        const mockToken = {
            accessToken: 'mock_access_test',
            refreshToken: 'mock_refresh_test',
            expiresIn: 3600,
            createdAt: Date.now(),
        };
        const mockUser = {
            id: '1',
            email: 'user@example.com',
            name: 'Demo User',
            role: 'user',
        };
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('zama_auth', JSON.stringify(mockToken));
            localStorage.setItem('zama_user', JSON.stringify(mockUser));
        }
    });
}

test.describe('Sign-In Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate first, then clear auth
        await page.goto('/sign-in');
        await clearAuth(page);
        // Wait for page to fully load after clearing auth
        await page.waitForLoadState('networkidle');
    });

    test('should navigate to dashboard after clicking "Continue as Guest"', async ({
        page,
    }) => {
        // Already on sign-in page from beforeEach
        // Verify we're on the sign-in page
        await expect(page).toHaveURL(/\/sign-in/);

        // Click "Continue as Guest" button
        const guestButton = page.getByRole('button', {
            name: /continue as guest/i,
        });
        await expect(guestButton).toBeVisible();
        await guestButton.click();

        // Should navigate to dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Verify dashboard content is loaded
        await expect(
            page.getByRole('heading', { name: 'Sandbox Console' })
        ).toBeVisible();
    });

    test('should redirect authenticated user from /sign-in to /dashboard', async ({
        page,
    }) => {
        // Set up authenticated state (page is already on /sign-in from beforeEach)
        await setupAuthState(page);

        // Reload the sign-in page while authenticated
        await page.reload();

        // Should automatically redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Verify we're on the dashboard
        await expect(
            page.getByRole('heading', { name: 'Sandbox Console' })
        ).toBeVisible();
    });

    test('should successfully sign in with valid credentials', async ({
        page,
    }) => {
        // Already on sign-in page from beforeEach
        // Fill in the login form with valid credentials
        const emailInput = page.getByLabel(/email/i);
        const passwordInput = page.getByLabel(/password/i);

        await emailInput.fill('user@example.com');
        await passwordInput.fill('password123');

        // Submit the form
        const signInButton = page.getByRole('button', { name: /sign in/i });
        await signInButton.click();

        // Should navigate to dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Verify user info in sidebar
        await expect(page.getByText('Demo User')).toBeVisible();
        await expect(page.getByText('user@example.com')).toBeVisible();
    });

    test('should show error message with invalid credentials', async ({
        page,
    }) => {
        // Already on sign-in page from beforeEach
        // Fill in the login form with invalid credentials
        const emailInput = page.getByLabel(/email/i);
        const passwordInput = page.getByLabel(/password/i);

        await emailInput.fill('invalid@example.com');
        await passwordInput.fill('wrongpassword');

        // Submit the form
        const signInButton = page.getByRole('button', { name: /sign in/i });
        await signInButton.click();

        // Should show error message
        await expect(page.getByText(/invalid credentials/i)).toBeVisible();

        // Should still be on sign-in page
        await expect(page).toHaveURL(/\/sign-in/);
    });
});

test.describe('Auth & Protected Routes Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate first, then clear auth
        await page.goto('/sign-in');
        await clearAuth(page);
        // Wait for page to fully load after clearing auth
        await page.waitForLoadState('networkidle');
    });

    test('should navigate to /sign-in after sign out', async ({ page }) => {
        // Set up authenticated state
        await setupAuthState(page);
        await page.goto('/dashboard');

        // Wait for dashboard to load
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(
            page.getByRole('heading', { name: 'Sandbox Console' })
        ).toBeVisible();

        // Find and click the logout button in the sidebar
        const logoutButton = page.getByRole('button', { name: /logout/i });
        await expect(logoutButton).toBeVisible();
        await logoutButton.click();

        // Should navigate to sign-in page
        await page.waitForURL(/\/sign-in/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/sign-in/);
    });

    test('should redirect unauthenticated users from /dashboard to /sign-in', async ({
        page,
    }) => {
        // Try to access dashboard without authentication
        await page.goto('/dashboard');

        // Should redirect to sign-in page
        await page.waitForURL(/\/sign-in/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/sign-in/);
    });

    test('should redirect unauthenticated users from /api-keys to /sign-in', async ({
        page,
    }) => {
        // Try to access api-keys page without authentication
        await page.goto('/api-keys');

        // Should redirect to sign-in page
        await page.waitForURL(/\/sign-in/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/sign-in/);
    });

    test('should redirect unauthenticated users from /usage to /sign-in', async ({
        page,
    }) => {
        // Try to access usage page without authentication
        await page.goto('/usage');

        // Should redirect to sign-in page
        await page.waitForURL(/\/sign-in/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/sign-in/);
    });

    test('should redirect unauthenticated users from /docs to /sign-in', async ({
        page,
    }) => {
        // Try to access docs page without authentication
        await page.goto('/docs');

        // Should redirect to sign-in page
        await page.waitForURL(/\/sign-in/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/sign-in/);
    });

    test('should allow authenticated users to access protected routes', async ({
        page,
    }) => {
        // Set up authenticated state (already on /sign-in from beforeEach)
        await setupAuthState(page);

        // Navigate to dashboard
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(
            page.getByRole('heading', { name: 'Sandbox Console' })
        ).toBeVisible();

        // Navigate to api-keys
        await page.goto('/api-keys');
        await expect(page).toHaveURL(/\/api-keys/);

        // Navigate to usage
        await page.goto('/usage');
        await expect(page).toHaveURL(/\/usage/);

        // Navigate to docs
        await page.goto('/docs');
        await expect(page).toHaveURL(/\/docs/);
    });

    test('should maintain authentication state across page reloads', async ({
        page,
    }) => {
        // Set up authenticated state (already on /sign-in from beforeEach)
        await setupAuthState(page);
        await page.goto('/dashboard');

        // Should still be authenticated after reload
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(
            page.getByRole('heading', { name: 'Sandbox Console' })
        ).toBeVisible();
        await expect(page.getByText('Demo User')).toBeVisible();

        // Reload again
        await page.reload();

        // Should still be authenticated
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(
            page.getByRole('heading', { name: 'Sandbox Console' })
        ).toBeVisible();
    });

    test('should clear authentication state after logout', async ({ page }) => {
        // Set up authenticated state (already on /sign-in from beforeEach)
        await setupAuthState(page);
        await page.goto('/dashboard');

        // Wait for dashboard to load
        await expect(page).toHaveURL(/\/dashboard/);

        // Logout
        const logoutButton = page.getByRole('button', { name: /logout/i });
        await logoutButton.click();

        // Verify localStorage is cleared
        const hasAuth = await page.evaluate(() => {
            return (
                localStorage.getItem('zama_auth') !== null ||
                localStorage.getItem('zama_user') !== null
            );
        });
        expect(hasAuth).toBe(false);

        // Try to access protected route
        await page.goto('/dashboard');

        // Should redirect to sign-in
        await expect(page).toHaveURL(/\/sign-in/, { timeout: 10000 });
    });
});

test.describe('Navigation Tests', () => {
    test('authenticated user can navigate between protected pages using sidebar', async ({
        page,
    }) => {
        // Set up authenticated state
        await page.goto('/sign-in');
        await setupAuthState(page);
        await page.goto('/dashboard');

        // Wait for dashboard to load
        await expect(page).toHaveURL(/\/dashboard/);

        // Click on API Keys link in sidebar
        await page.getByRole('button', { name: /api keys/i }).click();
        await expect(page).toHaveURL(/\/api-keys/);

        // Click on Usage link in sidebar
        await page.getByRole('button', { name: /^usage$/i }).click();
        await expect(page).toHaveURL(/\/usage/);

        // Click on Docs link in sidebar
        await page.getByRole('button', { name: /^docs$/i }).click();
        await expect(page).toHaveURL(/\/docs/);

        // Click on Dashboard link in sidebar
        await page.getByRole('button', { name: /dashboard/i }).click();
        await expect(page).toHaveURL(/\/dashboard/);
    });
});
