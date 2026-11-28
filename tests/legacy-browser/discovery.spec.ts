import { test, expect } from "@playwright/test";
test("Studio 首页的标题、可见摘要与来源完整导出", async ({ page, request }) => {
  await page.goto('/hyperframes/');
  await expect(page).toHaveTitle('HyperFrames Studio：AI 视频创作与中文上手指南');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content',/\/media\/studio-first-video.jpg$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content','1280');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content','800');
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  await expect(page.locator('.answer-summary')).toContainText(description!);
  const manifest = await (await request.get('/content-manifest.json')).json();
  const home = manifest.pages.find((entry: { id: string }) => entry.id === 'home');
  expect(home.title).toBe(await page.title());expect(home.sources).toHaveLength(3);
  expect(home.route).toBe('/hyperframes/');
  expect(home.reviewedAt).toBeUndefined();
  const markdown = await (await request.get('/content/home.md')).text();
  expect(markdown).toContain(description!);
  for (const source of home.sources) {
    expect(await page.locator('.source-meta a').evaluateAll(links=>links.map(link=>(link as HTMLAnchorElement).href))).toContain(source.url);
    expect(markdown).toContain(source.url);
  }
});
test("无 JavaScript 的首页仍有下载、作品和原生导航", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();await page.goto('http://127.0.0.1:4321/hyperframes/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await expect(page.locator('.studio-hero .button.primary')).toHaveAttribute('href','https://hyperframes.studio/studio/download');
  await expect(page.locator('.studio-work')).toHaveCount(4);
  await expect(page.locator('#studio-preview')).toBeVisible();
  await expect(page.locator('[data-studio-play]')).toBeHidden();
  await expect(page.locator('.studio-step-tabs')).toBeHidden();
  for (const panel of await page.locator('.studio-step-panel').all()) await expect(panel).toBeVisible();
  for (const work of await page.locator('.studio-work').all()) await expect(work).toHaveAttribute('href',/^https:\/\/static\.heygen\.ai\/hyperframes-oss\/homepage\/showcase\/hq\/.*\.mp4$/);
  await page.locator('.mobile-navigation summary').click();
  await expect(page.getByRole('navigation',{name:'移动主导航'}).getByRole('link',{name:'中文指南'})).toBeVisible();
  await context.close();
});
test('工作室首页与 HyperFrames 保持各自的规范地址和机器可读正文', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('小影匠工作室｜不露脸创作者的海外内容运营');
  const manifest = await (await request.get('/content-manifest.json')).json();
  const home = manifest.pages.find((entry: { id: string }) => entry.id === 'studio-home');
  expect(home.route).toBe('/');
  expect(home.sources).toEqual([]);
  await expect(page.locator('.answer-summary')).toHaveText(home.description);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/media\/xiaoyingjiang-creator\.webp$/);
  const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)["@graph"];
  expect(graph.find((entry: { '@type': string }) => entry['@type'] === 'Organization').name).toBe('小影匠工作室');
  expect(await (await request.get(home.markdown)).text()).toContain(home.description);
  await page.getByRole('link', { name: 'HyperFrames 中文指南', exact: true }).click();
  await expect(page).toHaveURL(/\/hyperframes\/$/);
});
test("禁用 JavaScript 仍能阅读正文、摘要与固定来源", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/start/cli/");
  await expect(page.locator("h1")).toContainText("CLI");
  await expect(page.locator(".answer-summary")).toContainText("Node.js");
  await expect(page.locator(".source-meta a").first()).toHaveAttribute(
    "href",
    /\/blob\/[a-f0-9]{40}\//,
  );
  await page.locator('.article-evidence summary').click();
  await expect(page.locator('.source-meta a').first()).toBeVisible();
  await context.close();
});
test("机器阅读入口返回对应正文、条件和来源", async ({ request }) => {
  const response = await request.get("/content/start-cli.md");
  expect(response.ok()).toBeTruthy();
  const text = await response.text();
  expect(text).toContain("npx hyperframes render");
  expect(text).toContain("官方资料核对");
  expect(text).toMatch(
    /github.com\/heygen-com\/hyperframes\/blob\/[a-f0-9]{40}\//,
  );
  const manifest = await (await request.get("/content-manifest.json")).json();
  expect(manifest.pages.length).toBeGreaterThanOrEqual(32);
  expect(new Set(manifest.pages.map((p: { id: string }) => p.id)).size).toBe(
    manifest.pages.length,
  );
});
test("正文与结构化数据、摘要及规范地址一致", async ({ page }) => {
  await page.goto("/start/cli/");
  const description = await page
    .locator('meta[name="description"]')
    .getAttribute("content");
  await expect(page.locator(".answer-summary")).toContainText(description!);
  const graph = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent())!,
  )["@graph"];
  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  expect(
    graph.find((n: Record<string, string>) => n["@type"] === "WebPage").url,
  ).toBe(canonical);
  await expect(page.getByRole("navigation", { name: "面包屑" })).toBeVisible();
  await page.locator('.article-evidence summary').click();
  await expect(
    page.getByRole("link", { name: "阅读 Markdown" }),
  ).toHaveAttribute("href", "/content/start-cli.md");
});
