import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('renders the actual Three.js stadium and all four camera presets', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#/explorer');
  await expect(page.getByText('Three.js / 3D replay', { exact: false })).toBeVisible();
  const canvas = page.locator('.webgl-host canvas');
  await expect(canvas).toBeVisible();
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.width)).toBeGreaterThan(600);
  await page.getByLabel('PLAYER FOCUS', { exact: true }).selectOption('h10');
  await page.getByRole('button', { name: 'Player runs', exact: true }).click();
  await page.screenshot({ path: info.outputPath('stadium-broadcast.png'), fullPage: true });
  for (const name of ['02 Top-down', '03 Touchline', '04 Free orbit', '01 Broadcast']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(canvas).toBeVisible();
    await page.screenshot({
      path: info.outputPath(`camera-${name.slice(0, 2)}.png`),
      fullPage: true,
    });
  }
  await page.getByRole('button', { name: 'Play replay', exact: true }).click();
  await expect
    .poll(async () =>
      Number(await page.getByRole('slider', { name: 'Replay position' }).inputValue()),
    )
    .toBeGreaterThan(3800);
  await page.getByRole('button', { name: 'Pause replay', exact: true }).click();
  await page.getByRole('button', { name: '02 Top-down', exact: true }).click();
  await page.screenshot({ path: info.outputPath('stadium-tactical.png'), fullPage: true });
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download pitch image', exact: true }).click();
  const download = await pending;
  const image = await readFile((await download.path())!);
  expect(image.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(image.readUInt32BE(16)).toBeGreaterThan(600);
  expect(image.byteLength).toBeGreaterThan(10000);
});
test('retains an editable view after a lost WebGL context', async ({ page }) => {
  await page.goto('./#/explorer');
  await expect(page.getByText('Three.js / 3D replay', { exact: false })).toBeVisible();
  await page.locator('.webgl-host canvas').evaluate((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  });
  await expect(
    page.getByText('3D is unavailable in this browser.', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Next moment', exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Moment analysis' })).toContainText(
    'The far side.',
  );
});
