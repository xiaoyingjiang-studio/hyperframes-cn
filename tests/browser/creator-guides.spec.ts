import { expect, test } from '@playwright/test';

const routes = [
  '/creators/readiness/',
  '/creators/mandarin-video-localization/',
  '/creators/subtitles-or-dubbing/',
];

test('出海手册可从导航进入，三篇文章可读并回到合作入口', async ({ page }, info) => {
  await page.goto('/');
  if (info.project.name === 'mobile') {
    await page.locator('.creator-menu summary').click();
    await page.getByRole('navigation', { name: '移动主导航' }).getByRole('link', { name: '出海手册' }).click();
  } else {
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '出海手册' }).click();
  }
  await expect(page).toHaveURL(/\/creators\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('创作者出海手册');
  await expect(page.locator('.guide-hub-image figcaption')).toHaveCount(0);
  for (const route of routes) await expect(page.locator(`.guide-entry a[href="${route}"]`)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `artifacts/qa/creator-guides-${info.project.name}.png`, fullPage: true, animations: 'disabled' });

  await page.getByRole('link', { name: '先做出海自查' }).click();
  await expect(page).toHaveURL(/\/creators\/readiness\/$/);
  await expect(page.getByRole('table')).toContainText('持续供稿');
  if (info.project.name === 'desktop') {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: 'artifacts/qa/creator-readiness-desktop.png', fullPage: true, animations: 'disabled' });
  }
  if (info.project.name === 'mobile') await page.locator('.guide-mobile-contents summary').click();
  const toc = info.project.name === 'mobile' ? '.guide-mobile-contents' : '.guide-desktop-contents';
  const heading = page.locator(toc).getByRole('link', { name: '看看两种作品会得到什么结论' });
  const hash = await heading.getAttribute('href');
  await heading.click();
  expect(decodeURIComponent(new URL(page.url()).hash)).toBe(hash);
  await expect(page.getByText('可以先做一版的例子。')).toBeVisible();
  await page.getByRole('link', { name: '带一条作品聊出海' }).click();
  await expect(page).toHaveURL(/\/#contact$/);
});

test('文章表格、来源和可引用正文在手机无 JavaScript 时可用', async ({ browser, request, baseURL }, info) => {
  test.skip(info.project.name !== 'mobile', '按窄屏无 JavaScript 路径验收');
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 320, height: 720 } });
  try {
    const page = await context.newPage();
    const manifest = await (await request.get('/content-manifest.json')).json();
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const index = await (await request.get('/llms.txt')).text();
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole('table').first()).toBeVisible();
      await expect(page.locator('.guide-cell-label').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
      const entry = manifest.pages.find((item: { route: string }) => item.route === route);
      const url = manifest.site + route;
      await expect(page.locator('.answer-summary')).toHaveText(entry.description);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', url);
      const schema = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
      expect(schema['@graph'].some((node: { '@type': string }) => node['@type'] === 'Article')).toBeTruthy();
      expect(sitemap).toContain(`<loc>${url}</loc>`);
      expect(index).toContain(entry.markdown);
      const text = await (await request.get(entry.markdown)).text();
      expect(text).toContain(entry.description);
      expect(text).toContain('| --- |');
      expect(text).not.toContain('guide-cell-label');
      for (const source of entry.sources) {
        expect(text).toContain(source.url);
        await expect(page.locator('.guide-sources').getByRole('link', { name: source.label })).toHaveAttribute('href', source.url);
      }
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `artifacts/qa/creator-${entry.id.slice(8)}-320.png`, fullPage: true, animations: 'disabled' });
    }
  } finally {
    await context.close();
  }
});
