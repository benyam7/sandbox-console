import { test, expect, type Page } from '@playwright/test';

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
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
        };
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('zama_auth', JSON.stringify(mockToken));
            localStorage.setItem('zama_user', JSON.stringify(mockUser));
        }
    });
}

async function clearLocalStorage(page: Page) {
    await page.evaluate(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.clear();
        }
    });
}

test.describe('Usage Page - Time Range Filter', () => {
    test.beforeEach(async ({ page }) => {
        // Clear storage and set up auth
        await page.goto('/usage');
        await clearLocalStorage(page);
        await setupAuthState(page);
        await page.goto('/usage');
        await page.waitForLoadState('networkidle');
    });

    test('Should render empty state when no API keys exist', async ({
        page,
    }) => {
        // Check for empty state text (appears in both chart and table)
        await expect(
            page.getByRole('heading', { name: 'No API Keys Yet' }).first()
        ).toBeVisible({ timeout: 5000 });
        await expect(
            page
                .getByText('Create your first API key to start tracking usage')
                .first()
        ).toBeVisible();
    });

    test('Should not display time range selector when no API keys exist', async ({
        page,
    }) => {
        // Time range selector should NOT exist in empty state
        const selectorCount = await page
            .locator('[aria-label="Select a time range"]')
            .count();
        expect(selectorCount).toBe(0);
    });
});
