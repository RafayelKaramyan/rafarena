import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function navigate(page: Page, name: string) {
  if (!(await page.getByRole('link', { name, exact: true }).isVisible())) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  }
  await page.getByRole('link', { name, exact: true }).click();
}

test('opens the editorial home with real campaign imagery and usable destinations', async ({
  page,
}, info) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('GAME ON.EYES OPEN.');
  await expect(page.locator('.campaign-photo')).toBeVisible();
  expect(
    await page
      .locator('.campaign-photo')
      .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth >= 1200),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath('homepage-desktop.png'), animations: 'disabled' });
  await page.getByRole('link', { name: 'Discover the story', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The game between the moments.');
  await expect(page.locator('.article-body')).toContainText('Give one player your attention.');
  await page.getByRole('link', { name: 'Explore this moment', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Interactive match pitch' })).toBeVisible();
  await expect(page).toHaveURL(/explorer\?moment=between-the-lines/);
});

test('filters the journal, clears an empty search and reads a complete article', async ({
  page,
}) => {
  await page.goto('./');
  await navigate(page, 'Stories');
  await expect(page.locator('.story-card')).toHaveCount(4);
  await page.getByRole('button', { name: 'Culture 01', exact: true }).click();
  await expect(page.locator('.story-card')).toHaveCount(1);
  await page.getByRole('textbox', { name: 'Search journal' }).fill('no matching story');
  await expect(page.getByRole('heading', { name: 'Keep looking.' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all stories', exact: true }).click();
  await expect(page.locator('.story-card')).toHaveCount(4);
  await page.locator('.story-card').filter({ hasText: 'Space has a far side.' }).click();
  await expect(page.locator('.article-body>section')).toHaveCount(4);
  await expect(page.locator('.article-body')).toContainText('Save the comparison.');
  await page.getByRole('link', { name: 'Use the thirds as a reference.', exact: true }).click();
  await expect(page.locator('#section-2')).toBeFocused();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Space has a far side.');
});

test('searches across stories and guides and opens a result with modal keyboard support', async ({
  page,
}) => {
  await page.goto('./');
  const opener = page.getByRole('button', { name: 'Search Rafarena', exact: true });
  await opener.click();
  const input = page.getByRole('textbox', {
    name: 'Search stories, playbooks and replays',
    exact: true,
  });
  await expect(input).toBeFocused();
  await input.fill('qwerty-not-a-story');
  await expect(page.getByRole('heading', { name: 'No perspective found. Yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await input.fill('Find the pocket');
  await page.getByRole('link', { name: 'Playbook Find the pocket.', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find the pocket.');
  await opener.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('moves between guide checkpoints and carries the exact scene into the replay room', async ({
  page,
}) => {
  await page.goto('./#/playbook/find-the-pocket');
  await page.getByRole('button', { name: '02 Find the pocket 3.6S', exact: true }).click();
  await expect(
    page.getByRole('img', {
      name: 'Tactical view: Between the lines. at 3.6 seconds',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('.study-observation')).toContainText(
    'Follow number 10 before following the ball.',
  );
  await page.getByRole('link', { name: 'Open this frame in 3D', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Replay position' })).toHaveValue('3600');
  await expect(page.getByLabel('PLAYER FOCUS', { exact: true })).toHaveValue('h10');
  await expect(page.getByRole('button', { name: 'Pitch thirds', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: '02 Top-down', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('keeps old shared perspective URLs working alongside the new homepage', async ({ page }) => {
  await page.goto(
    './#/?moment=the-far-side&t=4400&camera=tactical&layers=passing%2Ctrails&player=h7',
  );
  await expect(page.getByRole('slider', { name: 'Replay position' })).toHaveValue('4400');
  await expect(page.getByRole('complementary', { name: 'Moment analysis' })).toContainText(
    'The far side.',
  );
  await page.getByRole('button', { name: 'Share perspective', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Perspective link', exact: true })).toHaveValue(
    /#\/explorer\?moment=the-far-side/,
  );
});

test('keeps editorial pages within 320px and 768px and exposes an accessible mobile menu', async ({
  page,
}, info) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('./');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.screenshot({
      path: info.outputPath(`homepage-${width}.png`),
      animations: 'disabled',
    });
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Explore Rafarena', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Stories', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.goto('./#/playbook/find-the-pocket');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.screenshot({ path: info.outputPath(`playbook-${width}.png`), fullPage: true });
    await page.goto('./#/journal/the-pitch-is-a-meeting-place');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.goto('./#/about');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test('passes representative editorial accessibility scans and honors reduced motion', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('.campaign-copy h1>span').first()).toHaveCSS('animation-name', 'none');
  await page.locator('.discover-section').scrollIntoViewIfNeeded();
  await page.locator('.home-lab').scrollIntoViewIfNeeded();
  await page.locator('.journal-section').scrollIntoViewIfNeeded();
  await page.locator('.belief-section').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: info.outputPath('homepage-full.png'), fullPage: true });
  expect.soft((await new AxeBuilder({ page }).analyze()).violations, 'Homepage').toEqual([]);
  await page.goto('./#/journal');
  expect.soft((await new AxeBuilder({ page }).analyze()).violations, 'Journal').toEqual([]);
  await page.goto('./#/playbook/find-the-pocket');
  expect.soft((await new AxeBuilder({ page }).analyze()).violations, 'Guided study').toEqual([]);
  await page.goto('./#/journal/space-has-a-far-side');
  expect.soft((await new AxeBuilder({ page }).analyze()).violations, 'Full article').toEqual([]);
  await page.goto('./#/about');
  expect.soft((await new AxeBuilder({ page }).analyze()).violations, 'About').toEqual([]);
  await page.getByRole('button', { name: 'Search Rafarena', exact: true }).click();
  expect.soft((await new AxeBuilder({ page }).analyze()).violations, 'Search dialog').toEqual([]);
});
