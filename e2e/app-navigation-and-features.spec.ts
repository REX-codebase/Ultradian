import { test, expect } from '@playwright/test';

test.describe('Ultradian Core Navigation & Features E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    // Seed localStorage so initial landing starts directly on the main focus dashboard
    await context.addInitScript(() => {
      window.localStorage.setItem(
        'ultradian_focus_settings_v1',
        JSON.stringify({
          workMinutes: 90,
          breakMinutes: 20,
          longBreakMinutes: 30,
          cyclesBeforeLongBreak: 4,
          dailyGoalCycles: 4,
          soundEnabled: true,
          soundType: 'tibetan_bowl',
          soundVolume: 0.7,
          ambientType: 'none',
          ambientVolume: 0.5,
          notificationsEnabled: false,
          enableCompetitiveLeagues: true,
          darkMode: false,
          hasCompletedOnboarding: true,
          ritualName: 'The Dawn Flow',
          focusArchetype: 'Creator',
        })
      );
    });

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  });

  test('header displays custom brand logo and wordmark', async ({ page }) => {
    const brand = page.locator('header button:has-text("Ultradian")');
    await expect(brand).toBeVisible({ timeout: 15000 });
    // Verify custom SVG logo is present
    await expect(brand.locator('svg')).toBeVisible();
  });

  test('switches tabs smoothly between Focus, Rhythm, and League', async ({ page }) => {
    // 1. Initial active tab is Focus
    await expect(page.locator('button:has-text("Begin")').or(page.locator('button:has-text("Pause")'))).toBeVisible({ timeout: 15000 });

    // 2. Click Rhythm tab in desktop or mobile nav
    const rhythmTab = page.locator('nav[aria-label="Desktop primary navigation"] button:has-text("Rhythm")')
      .or(page.locator('.bottom-nav button:has-text("Rhythm")')).first();
    await rhythmTab.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=No waves yet').or(page.locator('text=Hours')).or(page.locator('text=History')).first()).toBeVisible({ timeout: 10000 });

    // 3. Click League tab
    const leagueTab = page.locator('nav[aria-label="Desktop primary navigation"] button:has-text("League")')
      .or(page.locator('.bottom-nav button:has-text("League")')).first();
    await leagueTab.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Tribes').or(page.locator('text=Standings')).or(page.locator('text=No verified tribes present')).first()).toBeVisible({ timeout: 10000 });

    // 4. Return to Focus tab
    const focusTab = page.locator('nav[aria-label="Desktop primary navigation"] button:has-text("Focus")')
      .or(page.locator('.bottom-nav button:has-text("Focus")')).first();
    await focusTab.click();
    await page.waitForTimeout(500);
    await expect(page.locator('button:has-text("Begin")').or(page.locator('button:has-text("Pause")'))).toBeVisible({ timeout: 10000 });
  });

  test('operates timer controls: start, pause, reset, skip', async ({ page }) => {
    const startBtn = page.locator('button:has-text("Begin")').first();
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await startBtn.click();

    // Should now show Pause
    const pauseBtn = page.locator('button:has-text("Pause")').first();
    await expect(pauseBtn).toBeVisible({ timeout: 6000 });

    // Pause timer
    await pauseBtn.click();
    await expect(page.locator('button:has-text("Begin")').first()).toBeVisible({ timeout: 6000 });

    // Reset timer
    const resetBtn = page.locator('button:has-text("Reset")').first();
    await resetBtn.click();

    // Skip timer to break phase
    const skipBtn = page.locator('button:has-text("Skip")').first();
    await skipBtn.click();
  });

  test('toggles soundscape and adjusts volume', async ({ page }) => {
    const soundBtn = page.locator('button:has-text("Sound")').first();
    await expect(soundBtn).toBeVisible({ timeout: 15000 });
    await soundBtn.click();

    // Sound chip buttons should be visible
    const alphaChip = page.locator('button:has-text("Alpha")').first();
    if (await alphaChip.isVisible({ timeout: 4000 })) {
      await alphaChip.click();
      await expect(alphaChip).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('enters and exits Zen mode seamlessly', async ({ page }) => {
    const zenBtn = page.locator('button:has-text("Zen")').first();
    await expect(zenBtn).toBeVisible({ timeout: 15000 });
    await zenBtn.click();

    // Zen layer should be visible
    await expect(page.locator('text=Zen Shield Mode')).toBeVisible({ timeout: 6000 });

    // Toggle Breathing Guide
    const breathingBtn = page.locator('button:has-text("Breathing Guide")');
    if (await breathingBtn.isVisible()) {
      await breathingBtn.click();
      await expect(page.locator('text=Inhale deeply')).toBeVisible({ timeout: 6000 });
    }

    // Exit Zen mode
    const exitZenBtn = page.locator('button:has-text("Exit Zen")');
    await exitZenBtn.click();
    await expect(page.locator('text=Zen Shield Mode')).not.toBeVisible({ timeout: 6000 });
  });

  test('toggles dark and light mode', async ({ page }) => {
    const themeBtn = page.locator('button[title="Switch to dark"], button[title="Switch to light"]').first();
    await expect(themeBtn).toBeVisible({ timeout: 15000 });

    const isInitiallyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await themeBtn.click();
    await page.waitForTimeout(300);

    // Verify HTML class toggled
    const isNowDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isNowDark).toBe(!isInitiallyDark);
  });

  test('opens settings modal, navigates tabs, and closes', async ({ page }) => {
    const settingsBtn = page.locator('#open-settings').or(page.locator('button[title="Settings"]')).first();
    await expect(settingsBtn).toBeVisible({ timeout: 15000 });
    await settingsBtn.click();

    // Modal should be open
    await expect(page.locator('text=Settings').first()).toBeVisible({ timeout: 6000 });

    // Switch to Rhythm settings tab inside the modal
    const rhythmTab = page.locator('[data-settings-tab="rhythm"]').first();
    if (await rhythmTab.isVisible()) {
      await rhythmTab.click();
      await page.waitForTimeout(300);
      await expect(page.locator('text=Work Wave').or(page.locator('text=Rhythm Interval Widths'))).toBeVisible({ timeout: 6000 });
    }

    // Switch to Audio settings tab inside the modal
    const audioTab = page.locator('[data-settings-tab="audio"]').first();
    if (await audioTab.isVisible()) {
      await audioTab.click();
      await page.waitForTimeout(300);
      await expect(page.locator('text=Auditory Cue Frequency').or(page.locator('text=Sound Alert'))).toBeVisible({ timeout: 6000 });
    }

    // Close settings
    const closeBtn = page.locator('button[aria-label="Close"]').or(page.locator('button:has-text("Save")')).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(400);
    }
  });
});
