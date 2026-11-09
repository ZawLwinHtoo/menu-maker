const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

test('extracts a palette and exports the selected format without runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#paletteGrid > *')).toHaveCount(6);
  await page.locator('#imageFileInput').setInputFiles(path.resolve(__dirname, '../assets/sample-forest.jpg'));
  await expect(page.locator('#uploadFileNameLabel')).toHaveText('sample-forest.jpg');
  await expect(page.locator('#toastContainer')).toContainText('Palette extracted');
  await page.locator('#btnGoToResult').click();
  await page.locator('#view2ExportBtn').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('[data-export="json"]').click();
  const tokens = JSON.parse(await page.locator('#exportCodeBlock').textContent());
  expect(tokens.tokens.primary.hex).toMatch(/^#[0-9a-f]{6}$/i);
  const downloaded = page.waitForEvent('download');
  await page.locator('#downloadTokensBtn').click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('tokens.json');
  expect(JSON.parse(await fs.readFile(await download.path(), 'utf8'))).toEqual(tokens);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#view2ExportBtn')).toBeFocused();
  expect(errors).toEqual([]);
});

test('all four previews are selectable and light mode recalculates the palette', async ({ page }) => {
  await page.goto('/#result');
  for (const component of ['analytics', 'media', 'menu', 'controls']) {
    await page.locator(`.switcher-tab-pill[data-tab="${component}"]`).click();
    await expect(page.locator('.full-app-template.active-template')).toHaveAttribute('data-component', component);
  }
  await page.locator('#view2ThemeToggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#paletteGrid > *')).toHaveCount(6);
});

test('a damaged upload keeps the last valid theme', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#paletteGrid > *')).toHaveCount(6);
  const before = await page.locator('#paletteGrid').textContent();
  await page.locator('#imageFileInput').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.locator('#toastContainer')).toContainText('damaged or unsupported');
  expect(await page.locator('#paletteGrid').textContent()).toBe(before);
});
