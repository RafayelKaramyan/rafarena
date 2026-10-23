import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function open(page: Page) {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'The game.A different perspective.',
  );
}
async function saveView(page: Page, title: string) {
  await page.getByRole('button', { name: 'Save view', exact: true }).click();
  await page.getByLabel('Name your view', { exact: true }).fill(title);
  await page
    .getByLabel('Your observation optional', { exact: true })
    .fill('Watch number 10 find the pocket.');
  await page.getByRole('button', { name: 'Save perspective', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
test('navigates the three pages and keeps the canonical home working after reload', async ({
  page,
}) => {
  await open(page);
  await page.getByRole('link', { name: 'The moments', exact: true }).click();
  await expect(page.locator('.library-card')).toHaveCount(6);
  await page.getByRole('link', { name: /^Saved views/ }).click();
  await expect(page.getByRole('heading', { name: 'See something worth saving?' })).toBeVisible();
  await page.getByRole('link', { name: 'Match explorer', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('region', { name: 'Interactive match pitch' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});
test('plays, pauses, seeks, changes speed and stops at the end without looping', async ({
  page,
}) => {
  await open(page);
  const slider = page.getByRole('slider', { name: 'Replay position' });
  await page.getByRole('button', { name: 'Play replay', exact: true }).click();
  await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(3700);
  await page.getByRole('button', { name: 'Pause replay', exact: true }).click();
  const paused = await slider.inputValue();
  await page.getByRole('button', { name: '2×', exact: true }).click();
  expect(await slider.inputValue()).toBe(paused);
  await slider.fill('9950');
  await page.getByRole('button', { name: 'Loop sequence', exact: true }).click();
  await page.getByRole('button', { name: 'Play replay', exact: true }).click();
  await expect(slider).toHaveValue('10000');
  await expect(page.getByRole('button', { name: 'Play replay', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restart sequence', exact: true }).click();
  await expect(slider).toHaveValue('0');
});
test('selects a player and preserves independent overlay and camera choices', async ({ page }) => {
  await open(page);
  await page.getByLabel('PLAYER FOCUS', { exact: true }).selectOption('h10');
  await expect(page.locator('.player-focus-bar')).toContainText('L. Moreau');
  await page.getByRole('button', { name: 'Player runs', exact: true }).click();
  await page.getByRole('button', { name: 'Pitch thirds', exact: true }).click();
  await page.getByRole('button', { name: '02 Top-down', exact: true }).click();
  await expect(page.getByRole('button', { name: '02 Top-down', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Player runs', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Clear player focus', exact: true }).click();
  await expect(page.getByLabel('PLAYER FOCUS', { exact: true })).toHaveValue('');
});
test('filters the moment library and opens the selected replay', async ({ page }) => {
  await open(page);
  await page.getByRole('link', { name: 'The moments', exact: true }).click();
  await page.getByRole('button', { name: 'Set piece', exact: true }).click();
  await expect(page.locator('.library-card')).toHaveCount(1);
  await page.getByLabel('Search moments', { exact: true }).fill('nothing matches');
  await expect(page.getByRole('heading', { name: 'A little too much space.' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all six moments', exact: true }).click();
  await expect(page.locator('.library-card')).toHaveCount(6);
  await page.locator('.library-card').filter({ hasText: 'The blind side.' }).click();
  await expect(page.getByRole('complementary', { name: 'Moment analysis' })).toContainText(
    'The blind side.',
  );
  await expect(page).toHaveURL(/moment=blind-side/);
});
test('saves, reloads, edits and removes a perspective without changing its time', async ({
  page,
}) => {
  await open(page);
  await page.getByRole('slider', { name: 'Replay position' }).fill('4750');
  await page.getByRole('button', { name: '02 Top-down', exact: true }).click();
  await saveView(page, 'The pocket before the pass');
  await page.getByRole('link', { name: /^Saved views/ }).click();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'The pocket before the pass', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.saved-body')).toContainText('4.8S INTO THE SEQUENCE');
  await page.getByRole('button', { name: 'Edit The pocket before the pass', exact: true }).click();
  await page.getByLabel('Name your view', { exact: true }).fill('A better perspective');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('.saved-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Open perspective', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Replay position' })).toHaveValue('4750');
  await expect(page.getByRole('button', { name: '02 Top-down', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('link', { name: /^Saved views/ }).click();
  await page.getByRole('button', { name: 'Remove A better perspective', exact: true }).click();
  await page.getByRole('button', { name: 'Keep perspective', exact: true }).click();
  await expect(page.locator('.saved-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Remove A better perspective', exact: true }).click();
  await page.getByRole('button', { name: 'Remove perspective', exact: true }).click();
  await expect(page.locator('.saved-card')).toHaveCount(0);
});
test('shares exact time, focus and overlays without including private observations', async ({
  page,
  context,
}) => {
  await open(page);
  await page.getByRole('slider', { name: 'Replay position' }).fill('4780');
  await page.getByRole('button', { name: '03 Touchline', exact: true }).click();
  await page.getByRole('button', { name: 'Player runs', exact: true }).click();
  await page.getByLabel('PLAYER FOCUS', { exact: true }).selectOption('h9');
  await page.getByRole('button', { name: 'Share perspective', exact: true }).click();
  const url = await page.getByLabel('Perspective link', { exact: true }).inputValue();
  const other = await context.newPage();
  await other.goto(url);
  await expect(other.getByRole('slider', { name: 'Replay position' })).toHaveValue('4780');
  await expect(other.getByLabel('PLAYER FOCUS', { exact: true })).toHaveValue('h9');
  await expect(other.getByRole('button', { name: '03 Touchline', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(other.getByRole('button', { name: 'Player runs', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await other.close();
});
test('exports an actual tactical PNG with the expected dimensions', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: '2D', exact: true }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download pitch image', exact: true }).click();
  const download = await pending,
    path = await download.path();
  expect(path).toBeTruthy();
  const data = await readFile(path!);
  expect(data.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(data.readUInt32BE(16)).toBe(1920);
  expect(data.readUInt32BE(20)).toBe(1200);
});
test('keeps a useful replay when WebGL initialization is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes('webgl')) return null;
      return Reflect.apply(native, this, [type, ...args]);
    } as typeof native;
  });
  await open(page);
  await expect(
    page.getByText('3D is unavailable in this browser.', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Follow #10 L. Moreau', exact: true }).click();
  await expect(page.locator('.player-focus-bar')).toContainText('L. Moreau');
  await page.getByRole('button', { name: 'Next moment', exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Moment analysis' })).toContainText(
    'The far side.',
  );
});
test('reports rejected writes and keeps the unsaved form available to retry', async ({ page }) => {
  await page.addInitScript(() => {
    const native = IDBObjectStore.prototype.put;
    let fail = true;
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      if (fail && this.name === 'views') {
        fail = false;
        throw new DOMException('Storage quota reached', 'QuotaExceededError');
      }
      return Reflect.apply(native, this, args);
    };
  });
  await open(page);
  await page.getByRole('button', { name: 'Save view', exact: true }).click();
  await page.getByLabel('Name your view', { exact: true }).fill('Keep this observation');
  await page.getByRole('button', { name: 'Save perspective', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('Name your view', { exact: true })).toHaveValue(
    'Keep this observation',
  );
  await page.getByRole('button', { name: 'Save perspective', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('contains modal focus and returns to the opening control on Escape', async ({ page }) => {
  await open(page);
  const button = page.getByRole('button', { name: 'Save view', exact: true });
  await button.click();
  await expect(page.getByLabel('Name your view', { exact: true })).toBeFocused();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(button).toBeFocused();
});
test('honors reduced motion, starts paused and supports deliberate playback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await expect(page.getByRole('button', { name: 'Play replay', exact: true })).toBeVisible();
  await expect(page.locator('.explorer-heading')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Play replay', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause replay', exact: true })).toBeVisible();
});
test('keeps every page within 320px and 768px layouts', async ({ page }, info) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 1000 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.getByRole('button', { name: 'Save view', exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath(`explorer-${width}.png`), fullPage: true });
    await page.getByRole('link', { name: 'The moments', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.getByRole('link', { name: /^Saved views/ }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});
test('passes representative accessibility scans in explorer, library, saved views and a dialog', async ({
  page,
}) => {
  await open(page);
  await page.getByRole('button', { name: '2D', exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Save view', exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'The moments', exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('link', { name: /^Saved views/ }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
