import { test, expect } from '@playwright/test';

test('每个栏目都有总览、学习顺序和可继续阅读的链接', async ({ page, request }) => {
  const manifest = await (await request.get('/content-manifest.json')).json();
  for (const section of manifest.knowledge.sections) {
    const overview = manifest.pages.find((p: { id: string }) => p.id === `learn-${section.id}`);
    expect(overview).toBeDefined();
    await page.goto(overview.route);
    await expect(page.locator('h1')).toContainText('总览');
    await expect(page.locator(`.sidebar-pane a[href="${overview.route}"]`)).toHaveCount(1);
    expect(await page.locator('.sl-markdown-content table a').count()).toBeGreaterThanOrEqual(3);
    const markdown = await (await request.get(overview.markdown || `/content/learn-${section.id}.md`)).text();
    expect(markdown).toContain('总览');
    expect(markdown).toContain('验证边界：');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
});

test('文档的标题与目录遵循阅读字号，来源可展开且链接栏目总览', async ({ page }, info) => {
  await page.goto('/skills/figma/');
  const sizes = await page.evaluate(() => {
    const size = (selector: string) => parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize);
    return { h1: size('h1'), h2: size('.sl-markdown-content h2'), body: size('.sl-markdown-content'), toc: size('#starlight__on-this-page') };
  });
  expect(sizes.body).toBeGreaterThanOrEqual(16);
  expect(sizes.h1).toBeGreaterThan(sizes.h2);
  expect(sizes.h2).toBeLessThanOrEqual(26);
  expect(sizes.toc).toBeLessThanOrEqual(16);
  await expect(page.getByRole('navigation', { name: '面包屑' }).getByRole('link', { name: 'Skills 与创作工具' })).toHaveAttribute('href', '/learn/skills/');
  const schema = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
  const breadcrumbs = schema['@graph'].find((item: { '@type': string }) => item['@type'] === 'BreadcrumbList').itemListElement;
  const visibleTrail = await page.locator('.reading-breadcrumb a, .reading-breadcrumb [aria-current="page"]').allTextContents();
  expect(breadcrumbs.map((part: { name: string }) => part.name)).toEqual(visibleTrail);
  await expect(page.locator('.sl-markdown-content')).toContainText('三张分镜不等于三页幻灯片');
  const details = page.locator('.article-evidence');
  await expect(details).not.toHaveAttribute('open');
  await details.locator('summary').click();
  await expect(page.locator('.source-meta a').first()).toBeVisible();
  await expect(page.locator('.verification-note')).toContainText('未在本轮');
  await details.locator('summary').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: `artifacts/qa/docs-figma-${info.project.name}.png`, fullPage: true });
  await page.goto('/learn/skills/');
  await page.screenshot({ path: `artifacts/qa/docs-overview-${info.project.name}.png`, fullPage: true });
});

test('宽屏正文靠近导航且保持适宜行宽', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', '宽屏布局仅在桌面项目检查');
  for (const width of [1280, 1920, 2560]) {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto('/skills/figma/');
    const bounds = await page.evaluate(() => {
      const body = document.querySelector('.sl-markdown-content')!.getBoundingClientRect();
      const side = document.querySelector('.sidebar-pane')!.getBoundingClientRect();
      const toc = document.querySelector('starlight-toc')!.getBoundingClientRect();
      return { width: body.width, gap: body.left - side.right, tocRight: toc.right };
    });
    expect(bounds.width).toBeGreaterThan(550);
    expect(bounds.width).toBeLessThanOrEqual(800);
    expect(bounds.gap).toBeGreaterThanOrEqual(20);
    expect(bounds.gap).toBeLessThanOrEqual(80);
    expect(bounds.tocRight).toBeLessThanOrEqual(width);
    if(width === 1920) await page.screenshot({ path: 'artifacts/qa/docs-wide-desktop.png', fullPage: true });
  }
});
