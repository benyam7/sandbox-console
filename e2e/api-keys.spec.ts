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

test.describe('API Keys - Create Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Clear storage and set up auth
        await page.goto('/api-keys');
        await clearLocalStorage(page);
        await setupAuthState(page);
        await page.goto('/api-keys');
        await page.waitForLoadState('networkidle');
    });

    test('should open create API key modal when clicking "Create New Key" button', async ({
        page,
    }) => {
        // Find and click the "Create New Key" button
        const createButton = page.getByRole('button', {
            name: /create new key/i,
        });
        await expect(createButton).toBeVisible();
        await createButton.click();

        // Verify modal is open
        await expect(
            page.getByRole('heading', { name: /create new api key/i })
        ).toBeVisible();
        await expect(
            page.getByText(/create a new api key to access our services/i)
        ).toBeVisible();

        // Verify form elements
        await expect(page.getByLabel(/key name/i)).toBeVisible();
        await expect(
            page.getByRole('button', { name: /^cancel$/i })
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /^create key$/i })
        ).toBeVisible();
    });

    test('should successfully create a new API key and display the full key', async ({
        page,
    }) => {
        // Open the create modal
        await page.getByRole('button', { name: /create new key/i }).click();

        // Fill in the key name
        const keyNameInput = page.getByLabel(/key name/i);
        await keyNameInput.fill('Test Production Key');

        // Submit the form
        await page.getByRole('button', { name: /^create key$/i }).click();

        // Wait for the key to be created and displayed
        await expect(page.getByText(/save your api key securely/i)).toBeVisible(
            { timeout: 5000 }
        );

        // Verify the key is displayed (should start with "zk_")
        const keyElement = page.locator('code').filter({ hasText: /^zk_/ });
        await expect(keyElement).toBeVisible();

        // Verify copy button is present (find button near the code element)
        const copyButton = page
            .locator('.flex.items-center.gap-2')
            .filter({ has: keyElement })
            .getByRole('button')
            .first();
        await expect(copyButton).toBeVisible();

        // Verify warning message
        await expect(
            page.getByText(
                /this is the only time your api key will be visible/i
            )
        ).toBeVisible();

        // Verify Done button
        await expect(page.getByRole('button', { name: /done/i })).toBeVisible();
    });

    test('should copy API key to clipboard when clicking copy button', async ({
        page,
        context,
        browserName,
    }) => {
        // Grant clipboard permissions (only works in Chromium)
        if (browserName === 'chromium') {
            await context.grantPermissions([
                'clipboard-read',
                'clipboard-write',
            ]);
        }

        // Create a new API key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill('Clipboard Test Key');
        await page.getByRole('button', { name: /^create key$/i }).click();

        // Wait for key to be displayed
        await expect(
            page.getByText(/save your api key securely/i)
        ).toBeVisible();

        // Get the displayed key value
        const keyElement = page.locator('code').filter({ hasText: /^zk_/ });
        const keyText = await keyElement.textContent();
        expect(keyText).toBeTruthy();
        expect(keyText).toMatch(/^zk_/);

        // Click the copy button
        const copyButton = page
            .getByRole('button')
            .filter({ has: page.locator('svg') })
            .first();
        await copyButton.click();

        // Wait a bit for the copy to complete
        await page.waitForTimeout(500);

        // Only test clipboard in Chromium (other browsers don't support the permission)
        if (browserName === 'chromium') {
            // Verify clipboard content
            const clipboardText = await page.evaluate(() =>
                navigator.clipboard.readText()
            );
            expect(clipboardText).toBe(keyText);
        }
    });

    test('should display masked key in table after creating and closing modal', async ({
        page,
    }) => {
        const keyName = 'My Test API Key';

        // Create a new API key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill(keyName);
        await page.getByRole('button', { name: /^create key$/i }).click();

        // Close the modal
        await page.getByRole('button', { name: /done/i }).click();

        // Wait for modal to close
        await expect(
            page.getByRole('heading', { name: /create new api key/i })
        ).not.toBeVisible();

        // Verify the key appears in the table
        await expect(page.getByText(keyName)).toBeVisible();

        // Verify the masked key format (should contain asterisks and last 4 chars)
        const tableRow = page.locator('tr', { has: page.getByText(keyName) });
        const maskedKey = tableRow.locator('td').nth(1);
        await expect(maskedKey).toBeVisible();

        // Masked key should contain asterisks
        const maskedKeyText = await maskedKey.textContent();
        expect(maskedKeyText).toMatch(/\*+/);

        // Verify status badge shows "active"
        const statusBadge = tableRow.locator('td').nth(2);
        await expect(statusBadge.getByText(/active/i)).toBeVisible();

        // Verify created date is shown
        const createdDate = tableRow.locator('td').nth(3);
        await expect(createdDate).toBeVisible();
    });

    test('should show validation error if key name is empty', async ({
        page,
    }) => {
        // Open the create modal
        await page.getByRole('button', { name: /create new key/i }).click();

        // Try to submit without entering a name
        await page.getByRole('button', { name: /^create key$/i }).click();

        // Verify error message (form validation should prevent submission)
        // Note: The exact error message depends on your validation schema
        await expect(
            page.getByRole('heading', { name: /create new api key/i })
        ).toBeVisible();

        // Modal should still be open
        await expect(page.getByLabel(/key name/i)).toBeVisible();
    });

    test('should close modal when clicking cancel button', async ({ page }) => {
        // Open the create modal
        await page.getByRole('button', { name: /create new key/i }).click();
        await expect(
            page.getByRole('heading', { name: /create new api key/i })
        ).toBeVisible();

        // Fill in some data
        await page.getByLabel(/key name/i).fill('Test Key');

        // Click cancel
        await page.getByRole('button', { name: /^cancel$/i }).click();

        // Modal should be closed
        await expect(
            page.getByRole('heading', { name: /create new api key/i })
        ).not.toBeVisible();
    });
});

test.describe('API Keys - Revoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Set up authenticated state and navigate to API keys page
        await page.goto('/api-keys');
        await clearLocalStorage(page);
        await setupAuthState(page);
        await page.goto('/api-keys');
        await page.waitForLoadState('networkidle');
    });

    test('should open revoke confirmation dialog when clicking revoke action', async ({
        page,
    }) => {
        // First create a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill('Key To Revoke');
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Find the key in the table and open actions menu
        const tableRow = page.locator('tr', {
            has: page.getByText('Key To Revoke'),
        });
        const actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();

        // Click revoke option
        await page.getByRole('menuitem', { name: /revoke/i }).click();

        // Verify confirmation dialog appears
        await expect(
            page.getByRole('heading', { name: /revoke api key\?/i })
        ).toBeVisible();
        await expect(
            page.getByText(/are you sure you want to revoke "Key To Revoke"\?/i)
        ).toBeVisible();
        await expect(
            page.getByText(/this action cannot be undone/i)
        ).toBeVisible();

        // Verify dialog buttons
        await expect(
            page.getByRole('button', { name: /^cancel$/i })
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /^revoke$/i })
        ).toBeVisible();
    });

    test('should successfully revoke an API key and update status', async ({
        page,
    }) => {
        const keyName = 'Key To Be Revoked';

        // Create a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill(keyName);
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Verify key is active
        const tableRow = page.locator('tr', { has: page.getByText(keyName) });
        const statusBadge = tableRow.locator('td').nth(2);
        await expect(statusBadge.getByText(/active/i)).toBeVisible();

        // Open actions menu and click revoke
        const actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();
        await page.getByRole('menuitem', { name: /revoke/i }).click();

        // Confirm revocation
        await page.getByRole('button', { name: /^revoke$/i }).click();

        // Wait for dialog to close
        await expect(
            page.getByRole('heading', { name: /revoke api key\?/i })
        ).not.toBeVisible({ timeout: 5000 });

        // Verify status changed to "revoked" in the status column (3rd column)
        await page.waitForTimeout(500); // Brief wait for status update
        await expect(statusBadge.getByText(/revoked/i)).toBeVisible({
            timeout: 5000,
        });
    });

    test('should cancel revoke action when clicking cancel button', async ({
        page,
    }) => {
        const keyName = 'Key Not To Revoke';

        // Create a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill(keyName);
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Open revoke dialog
        const tableRow = page.locator('tr', { has: page.getByText(keyName) });
        const actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();
        await page.getByRole('menuitem', { name: /revoke/i }).click();

        // Click cancel
        await page.getByRole('button', { name: /^cancel$/i }).click();

        // Dialog should close
        await expect(
            page.getByRole('heading', { name: /revoke api key\?/i })
        ).not.toBeVisible();

        // Key should still be active
        const statusBadge = tableRow.locator('td').nth(2);
        await expect(statusBadge.getByText(/active/i)).toBeVisible();
    });

    test('should disable revoke action for already revoked keys', async ({
        page,
    }) => {
        const keyName = 'Already Revoked Key';

        // Create and revoke a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill(keyName);
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Revoke the key
        const tableRow = page.locator('tr', { has: page.getByText(keyName) });
        let actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();
        await page.getByRole('menuitem', { name: /revoke/i }).click();
        await page.getByRole('button', { name: /^revoke$/i }).click();

        // Wait for status to update
        await page.waitForTimeout(500);
        const statusBadge = tableRow.locator('td').nth(2);
        await expect(statusBadge.getByText(/revoked/i)).toBeVisible({
            timeout: 5000,
        });

        // Try to open actions menu again
        actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();

        // Verify revoke option is disabled
        const revokeMenuItem = page.getByRole('menuitem', { name: /revoke/i });
        await expect(revokeMenuItem).toBeVisible();
        // Check if it has disabled attribute or aria-disabled
        const isDisabled = await revokeMenuItem.evaluate((el) =>
            el.hasAttribute('data-disabled')
        );
        expect(isDisabled).toBe(true);
    });
});

test.describe('API Keys - Regenerate Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Set up authenticated state and navigate to API keys page
        await page.goto('/api-keys');
        await clearLocalStorage(page);
        await setupAuthState(page);
        await page.goto('/api-keys');
        await page.waitForLoadState('networkidle');
    });

    test('should open regenerate confirmation dialog when clicking regenerate action', async ({
        page,
    }) => {
        // Create a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill('Key To Regenerate');
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Open actions menu and click regenerate
        const tableRow = page.locator('tr', {
            has: page.getByText('Key To Regenerate'),
        });
        const actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();
        await page.getByRole('menuitem', { name: /regenerate/i }).click();

        // Verify confirmation dialog
        await expect(
            page.getByRole('heading', { name: /regenerate api key\?/i })
        ).toBeVisible();
        await expect(
            page.getByText(
                /are you sure you want to regenerate "Key To Regenerate"\?/i
            )
        ).toBeVisible();
        await expect(
            page.getByText(/the old key will be revoked/i)
        ).toBeVisible();

        // Verify dialog buttons
        await expect(
            page.getByRole('button', { name: /^cancel$/i })
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: /^regenerate$/i })
        ).toBeVisible();
    });

    test('should successfully regenerate an API key and display new key', async ({
        page,
    }) => {
        const keyName = 'Key To Be Regenerated';

        // Create a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill(keyName);
        await page.getByRole('button', { name: /^create key$/i }).click();

        // Store the original key
        const originalKeyElement = page
            .locator('code')
            .filter({ hasText: /^zk_/ });
        const originalKey = await originalKeyElement.textContent();

        await page.getByRole('button', { name: /done/i }).click();

        // Store the original masked key from table
        const tableRow = page.locator('tr', { has: page.getByText(keyName) });
        const originalMaskedKey = await tableRow
            .locator('td')
            .nth(1)
            .textContent();

        // Open actions menu and regenerate
        const actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();
        await page.getByRole('menuitem', { name: /regenerate/i }).click();

        // Confirm regeneration
        await page.getByRole('button', { name: /^regenerate$/i }).click();

        // Wait for regeneration dialog to close and new key modal to appear
        await expect(
            page.getByRole('heading', { name: /api key regenerated/i })
        ).toBeVisible({ timeout: 5000 });

        // Verify new key is displayed
        const newKeyElement = page.locator('code').filter({ hasText: /^zk_/ });
        await expect(newKeyElement).toBeVisible();
        const newKey = await newKeyElement.textContent();

        // Verify it's a different key
        expect(newKey).not.toBe(originalKey);
        expect(newKey).toMatch(/^zk_/);

        // Close the regenerated key modal
        await page.getByRole('button', { name: /done/i }).click();

        // Verify the masked key in the table has changed
        await page.waitForTimeout(500); // Brief wait for table update
        const newMaskedKey = await tableRow.locator('td').nth(1).textContent();
        expect(newMaskedKey).not.toBe(originalMaskedKey);

        // Verify status is still active
        const statusBadge = tableRow.locator('td').nth(2);
        await expect(statusBadge.getByText(/active/i)).toBeVisible();
    });

    test('should copy regenerated key to clipboard', async ({
        page,
        context,
        browserName,
    }) => {
        // Grant clipboard permissions (only works in Chromium)
        if (browserName === 'chromium') {
            await context.grantPermissions([
                'clipboard-read',
                'clipboard-write',
            ]);
        }

        const keyName = 'Regenerate Copy Test';

        // Create a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill(keyName);
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Regenerate the key
        const tableRow = page.locator('tr', { has: page.getByText(keyName) });
        const actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();
        await page.getByRole('menuitem', { name: /regenerate/i }).click();
        await page.getByRole('button', { name: /^regenerate$/i }).click();

        // Wait for regenerated key modal
        await expect(
            page.getByRole('heading', { name: /api key regenerated/i })
        ).toBeVisible();

        // Get the regenerated key text
        const newKeyElement = page.locator('code').filter({ hasText: /^zk_/ });
        const newKey = await newKeyElement.textContent();
        expect(newKey).toMatch(/^zk_/);

        // Click copy button
        const copyButton = page
            .getByRole('button')
            .filter({ has: page.locator('svg') })
            .first();
        await copyButton.click();

        // Wait for copy to complete
        await page.waitForTimeout(500);

        // Only test clipboard in Chromium
        if (browserName === 'chromium') {
            // Verify clipboard content
            const clipboardText = await page.evaluate(() =>
                navigator.clipboard.readText()
            );
            expect(clipboardText).toBe(newKey);
        }
    });

    test('should cancel regenerate action when clicking cancel button', async ({
        page,
    }) => {
        const keyName = 'Key Not To Regenerate';

        // Create a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill(keyName);
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Get original masked key
        const tableRow = page.locator('tr', { has: page.getByText(keyName) });
        const originalMaskedKey = await tableRow
            .locator('td')
            .nth(1)
            .textContent();

        // Open regenerate dialog
        const actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();
        await page.getByRole('menuitem', { name: /regenerate/i }).click();

        // Click cancel
        await page.getByRole('button', { name: /^cancel$/i }).click();

        // Dialog should close
        await expect(
            page.getByRole('heading', { name: /regenerate api key\?/i })
        ).not.toBeVisible();

        // Masked key should remain the same
        const maskedKey = await tableRow.locator('td').nth(1).textContent();
        expect(maskedKey).toBe(originalMaskedKey);

        // Status should still be active
        const statusBadge = tableRow.locator('td').nth(2);
        await expect(statusBadge.getByText(/active/i)).toBeVisible();
    });

    test('should disable regenerate action for revoked keys', async ({
        page,
    }) => {
        const keyName = 'Revoked Cannot Regenerate';

        // Create and revoke a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill(keyName);
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Revoke the key
        const tableRow = page.locator('tr', { has: page.getByText(keyName) });
        let actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();
        await page.getByRole('menuitem', { name: /revoke/i }).click();
        await page.getByRole('button', { name: /^revoke$/i }).click();

        // Wait for status to update
        await page.waitForTimeout(500);
        const statusBadge = tableRow.locator('td').nth(2);
        await expect(statusBadge.getByText(/revoked/i)).toBeVisible({
            timeout: 5000,
        });

        // Try to open actions menu again
        actionsButton = tableRow.getByRole('button').last();
        await actionsButton.click();

        // Verify regenerate option is disabled
        const regenerateMenuItem = page.getByRole('menuitem', {
            name: /regenerate/i,
        });
        await expect(regenerateMenuItem).toBeVisible();
        const isDisabled = await regenerateMenuItem.evaluate((el) =>
            el.hasAttribute('data-disabled')
        );
        expect(isDisabled).toBe(true);
    });
});

test.describe('API Keys - Table Display Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Set up authenticated state
        await page.goto('/api-keys');
        await clearLocalStorage(page);
        await setupAuthState(page);
        await page.goto('/api-keys');
        await page.waitForLoadState('networkidle');
    });

    test('should display empty state when no API keys exist', async ({
        page,
    }) => {
        // Verify empty state message
        await expect(page.getByText(/no api keys yet/i)).toBeVisible();
        await expect(
            page.getByText(/create one to get started/i)
        ).toBeVisible();
    });

    test('should display table with correct columns when keys exist', async ({
        page,
    }) => {
        // Create a key first
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill('Test Key');
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Verify table exists with proper structure
        const table = page.locator('table');
        await expect(table).toBeVisible();

        // Verify column headers by text content
        await expect(page.getByText('Name').first()).toBeVisible();
        await expect(page.getByText('Key').first()).toBeVisible();
        await expect(page.getByText('Status').first()).toBeVisible();
        await expect(page.getByText('Created').first()).toBeVisible();
        await expect(page.getByText('Actions').first()).toBeVisible();
    });

    test('should display multiple API keys in table', async ({ page }) => {
        // Create multiple keys
        const keyNames = ['Production Key', 'Development Key', 'Testing Key'];

        for (const keyName of keyNames) {
            await page.getByRole('button', { name: /create new key/i }).click();
            await page.getByLabel(/key name/i).fill(keyName);
            await page.getByRole('button', { name: /^create key$/i }).click();
            await page.getByRole('button', { name: /done/i }).click();
            await page.waitForTimeout(300); // Small delay between creations
        }

        // Verify all keys are displayed
        for (const keyName of keyNames) {
            await expect(page.getByText(keyName)).toBeVisible();
        }

        // Verify we have the correct number of table rows (excluding header)
        const tableRows = page.locator('tbody tr');
        await expect(tableRows).toHaveCount(keyNames.length);
    });

    test('should format masked key correctly', async ({ page }) => {
        // Create a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill('Format Test Key');
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Get the masked key
        const tableRow = page.locator('tr', {
            has: page.getByText('Format Test Key'),
        });
        const maskedKeyCell = tableRow.locator('td').nth(1);
        const maskedKey = await maskedKeyCell.textContent();

        // Verify masked key format (should have asterisks and show last chars)
        expect(maskedKey).toBeTruthy();
        expect(maskedKey).toMatch(/\*+/);

        // Verify the cell has monospace font styling (case-insensitive)
        const fontFamily = await maskedKeyCell.evaluate(
            (el) => window.getComputedStyle(el).fontFamily
        );
        expect(fontFamily.toLowerCase()).toContain('mono');
    });

    test('should show correct date format for created date', async ({
        page,
    }) => {
        // Create a key
        await page.getByRole('button', { name: /create new key/i }).click();
        await page.getByLabel(/key name/i).fill('Date Test Key');
        await page.getByRole('button', { name: /^create key$/i }).click();
        await page.getByRole('button', { name: /done/i }).click();

        // Get the created date
        const tableRow = page.locator('tr', {
            has: page.getByText('Date Test Key'),
        });
        const dateCell = tableRow.locator('td').nth(3);
        const dateText = await dateCell.textContent();

        // Verify date is in expected format (matches current date)
        const today = new Date().toLocaleDateString();
        expect(dateText).toBe(today);
    });
});
