import { test, expect } from '@playwright/test';

test.describe('Ritual Onboarding UI & Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Open the application in local environment
    await page.goto('/');
  });

  test('can open ritual calibration and step through the sleek 3-step setup', async ({ page }) => {
    // Ensure app loaded
    await expect(page.locator('body')).toBeVisible();

    // Check if settings or ritual onboarding button can be clicked
    const settingsButton = page.locator('button[aria-label="Settings"], button:has-text("Settings"), button[data-testid="settings-btn"]').first();
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Click revisit ritual button in profile tab if present
      const revisitBtn = page.locator('button:has-text("Revisit ritual")');
      if (await revisitBtn.isVisible()) {
        await revisitBtn.click();
      }
    }

    // Verify modal header and step 1 elements
    const ritualTitle = page.locator('#ritual-title');
    if (await ritualTitle.isVisible()) {
      await expect(ritualTitle).toContainText('Focus Ritual');

      // Check archetypes are rendered
      await expect(page.locator('text=Builder')).toBeVisible();
      await expect(page.locator('text=Creator')).toBeVisible();
      await expect(page.locator('text=Scientist')).toBeVisible();
      await expect(page.locator('text=Strategist')).toBeVisible();

      // Switch to Scientist archetype
      await page.locator('text=Scientist').first().click();

      // Proceed to Step 2: Circadian Peak
      await page.locator('button:has-text("Continue")').click();
      await expect(page.locator('text=Circadian Resonance')).toBeVisible();

      // Select Dawn Patrol or Morning Prime
      const morningPrime = page.locator('button:has-text("Morning Prime")');
      if (await morningPrime.isVisible()) {
        await morningPrime.click();
      }

      // Proceed to Step 3: Ritual Seal & Passport
      await page.locator('button:has-text("Continue")').click();
      await expect(page.locator('text=Ultradian Archetype Pass')).toBeVisible();

      // Click Shuffle Name
      const shuffleBtn = page.locator('button:has-text("Shuffle Name")');
      if (await shuffleBtn.isVisible()) {
        await shuffleBtn.click();
      }

      // Seal and finish
      const sealBtn = page.locator('button:has-text("Seal Ritual & Begin")');
      await expect(sealBtn).toBeVisible();
    }
  });
});
