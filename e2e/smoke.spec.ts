import { test, expect } from '@playwright/test';

test('desktop boots, opens a window, and closes it', async ({ page }) => {
  await page.goto('/?noboot=1&nowelcome=1');
  await expect(page.getByText('About Me')).toBeVisible();
  await page.getByText('About Me').dblclick();
  const dialog = page.getByRole('dialog', { name: 'About Me' });
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/Jo Gurvantamir/)).toBeVisible();
  await dialog.getByLabel('Close').click();
  await expect(dialog).toHaveCount(0);
});

test('mobile viewport opens windows maximized', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/?noboot=1&nowelcome=1');
  await page.getByText('My Projects').dblclick();
  const dialog = page.getByRole('dialog', { name: 'My Projects' });
  const box = await dialog.boundingBox();
  expect(box!.width).toBeGreaterThan(340); // fills the narrow viewport
});
