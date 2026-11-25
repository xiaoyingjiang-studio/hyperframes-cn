import { test, expect } from '@playwright/test';
test('知识入口连接目标、问题与机制，正式 skills 目录完整', async ({ page, request }, info) => {
  await page.goto('/knowledge/');
  await expect(page.locator('h1')).toHaveText('HyperFrames 创作者知识库');
  await expect(page.locator('.sl-markdown-content')).toContainText('想做什么');
  await expect(page.locator('.sl-markdown-content')).toContainText('遇到什么问题');
  await expect(page.locator('.sl-markdown-content')).toContainText('想理解什么机制');
  const manifest = await (await request.get('/content-manifest.json')).json();
  expect(manifest.schemaVersion).toBe(2);
  expect(manifest.knowledge.publishedSkills.length).toBeGreaterThan(0);
  for (const name of manifest.knowledge.publishedSkills) expect(manifest.pages.some((p: { id: string }) => p.id === `skills-${name}`)).toBeTruthy();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: `artifacts/qa/knowledge-${info.project.name}.png`, fullPage: true });
});
test('机制与技能分别标注入口、来源与实测边界', async ({ page }, info) => {
  await page.goto('/mechanisms/targeted-edits/');
  await expect(page.locator('.knowledge-context')).toContainText('创作机制');
  await expect(page.locator('.source-meta')).toContainText('固定来源整理');
  await expect(page.locator('.verification-note')).toContainText('未在本轮');
  await page.screenshot({ path: `artifacts/qa/mechanism-${info.project.name}.png`, fullPage: true });
  await page.goto('/skills/slideshow/');
  await expect(page.locator('.sl-markdown-content')).toContainText('不是 MP4');
  await expect(page.locator('.source-meta a').first()).toHaveAttribute('href', /\/blob\/[a-f0-9]{40}\//);
});
test('受控案例的 Markdown 正文与播放器同时可用', async ({ page, request }) => {
  await page.goto('/showcase/product-intro/');
  await expect(page.locator('video')).toHaveAttribute('preload', 'none');
  await expect(page.getByRole('heading', { name: '验证与边界' })).toBeVisible();
  const text = await (await request.get('/content/showcase-product-intro.md')).text();
  expect(text).toContain('npx hyperframes render');
  expect(text).not.toContain('import CaseProse');
});
