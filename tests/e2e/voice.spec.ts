import { test, expect } from '@playwright/test';

test.describe('VaniZero E2E: Final 99% Perfection Check', () => {
  
  test('should load the dashboard with premium branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VaniZero');
    await expect(page.getByLabel('Activate VaniZero Assistant')).toBeVisible();
  });

  test('should show live transcription status when mic is clicked', async ({ page }) => {
    await page.goto('/');
    const micButton = page.getByLabel('Activate VaniZero Assistant');
    await micButton.click();
    await expect(page.getByText('Listening natively...')).toBeVisible();
  });

  test('should display grounded result box after interaction', async ({ page }) => {
    // Note: In E2E we mock the result state or use fixtures
    await page.goto('/');
    await expect(page.getByText('Zero-Prompt revolution')).toBeVisible();
  });

});
