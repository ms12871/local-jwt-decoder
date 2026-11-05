import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('serves the application script without inline script tags', async ({ page }) => {
  expect(await page.locator('script:not([src])').count()).toBe(0);
  await expect(page.locator('script[src="app.js"]')).toHaveCount(1);
});

test('renders hostile claims as text', async ({ page }) => {
  const token = await page.evaluate(() => {
    const encode = value => btoa(unescape(encodeURIComponent(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${encode('{"alg":"none","typ":"JWT"}')}.${encode('{"sub":"<img src=x onerror=alert(1)>"}')}.`;
  });
  await page.locator('#token-input').fill(token);
  await page.getByRole('button', { name: 'Decode token' }).click();
  await expect(page.locator('#claims-content img')).toHaveCount(0);
  await expect(page.locator('#claims-content')).toContainText('<img src=x onerror=alert(1)>');
});

test('encodes and decodes an unsigned token', async ({ page }) => {
  await page.getByRole('tab', { name: 'Encoder' }).click();
  await page.getByRole('button', { name: 'Encode token' }).click();
  const token = await page.locator('#encoded-output').textContent();
  expect(token.split('.')).toHaveLength(3);
  expect(token.endsWith('.')).toBeTruthy();
  await page.getByRole('tab', { name: 'Decoder' }).click();
  await page.locator('#token-input').fill(token);
  await page.getByRole('button', { name: 'Decode token' }).click();
  await expect(page.locator('#decode-status')).toContainText('warning');
  await expect(page.locator('#header-output')).toContainText('"alg": "none"');
});

test('signs and verifies HS256 locally', async ({ page }) => {
  await page.getByRole('tab', { name: 'Encoder' }).click();
  await page.locator('#encode-algorithm').selectOption('HS256');
  await page.locator('#encode-key').fill('test-secret');
  await page.getByRole('button', { name: 'Encode token' }).click();
  const token = await page.locator('#encoded-output').textContent();
  await page.getByRole('tab', { name: 'Verify signature' }).click();
  await page.locator('#verify-token').fill(token);
  await page.locator('#verify-key').fill('test-secret');
  await page.getByRole('button', { name: 'Verify signature' }).click();
  await expect(page.locator('#verify-result')).toHaveText('Signature valid');
});

test('reports invalid JSON and nbf warnings', async ({ page }) => {
  await page.getByRole('tab', { name: 'Encoder' }).click();
  await page.locator('#encode-header').fill('{invalid');
  await page.getByRole('button', { name: 'Encode token' }).click();
  await expect(page.locator('#encode-message')).toContainText('JSON');
  await page.getByRole('tab', { name: 'Decoder' }).click();
  await page.getByRole('button', { name: 'Load example' }).click();
  await expect(page.locator('#decode-warnings')).toContainText('no expiration');
});
