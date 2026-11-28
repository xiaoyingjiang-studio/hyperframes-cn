import { test, expect } from '@playwright/test';

test('小影匠首页在手机和桌面讲清合作分工，主图保留替代文字', async ({ page }, info) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('你专心创作，我们负责海外运营。');
  await expect(page.locator('.answer-summary')).toContainText('哪个海外方向值得继续');
  expect(await page.locator('main > section[id]').evaluateAll(sections => sections.map(section => section.id)))
    .toEqual(['adaptation', 'cooperate', 'readiness', 'contact']);
  const image = page.locator('.creator-viewfinder img');
  await expect(image).toHaveAttribute('alt', /绘制解说分镜/);
  await expect(page.locator('.creator-hero-art figcaption')).toHaveCount(0);
  await expect.poll(() => image.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: `artifacts/qa/xiaoyingjiang-${info.project.name}.png`, animations: 'disabled' });
  await page.screenshot({ path: `artifacts/qa/xiaoyingjiang-full-${info.project.name}.png`, fullPage: true, animations: 'disabled' });

  const primaryAction = page.getByRole('link', { name: '带一条作品聊出海' });
  await page.keyboard.press('Tab');
  await primaryAction.focus();
  await expect(primaryAction).toHaveCSS('outline-color', 'rgb(24, 24, 24)');

  if (info.project.name === 'mobile') {
    expect(await image.evaluate(img => (img as HTMLImageElement).currentSrc)).toMatch(/xiaoyingjiang-creator-mobile\.webp$/);
    const menu = page.locator('.creator-menu');
    await menu.locator('summary').click();
    await menu.getByRole('link', { name: '改编前后' }).click();
    await expect(menu).not.toHaveAttribute('open');
  } else {
    await page.getByRole('link', { name: '看内容怎么改编' }).click();
  }
  await expect(page).toHaveURL(/#adaptation$/);
  await expect(page.getByText('英语版开场')).toBeVisible();
  await expect(page.getByText('试完能看到什么？')).toBeVisible();
  await expect(page.getByText('下一条怎么做', { exact: true })).toBeVisible();
  await page.getByText('可以保留原来的创作方式吗？').click();
  await expect(page.getByText('可以从已有的旁白、图解、动画或录屏开始。', { exact: false })).toBeVisible();
  await primaryAction.click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact')).toContainText('一条可访问的代表作链接');
  const copy = page.getByRole('button', { name: '复制合作模板' });
  if (await copy.isVisible()) {
    await copy.click();
    await expect(page.locator('[data-copy-status]')).toHaveText(/已复制合作模板|可以手动复制/);
  }
});

test('小影匠首页不依赖 JavaScript 展示正文、导航和合作边界', async ({ browser }, info) => {
  test.skip(info.project.name !== 'mobile', '验证手机端无 JavaScript 路径');
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 640 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.getByText('菜单', { exact: true }).click();
  await expect(page.getByRole('navigation', { name: '移动主导航' }).getByRole('link', { name: '合作流程' })).toBeVisible();
  await page.getByText('菜单', { exact: true }).click();
  await page.getByText('账号、素材和收益怎么约定？').click();
  await expect(page.getByText('开始前一起写清账号持有与管理权限', { exact: false })).toBeVisible();
  if (await page.getByText('联系方式稍后更新。', { exact: false }).isVisible()) {
    await expect(page.getByRole('textbox', { name: '合作模板' })).toHaveValue(/代表作链接/);
  }
  await context.close();
});

test('官网与发现接口只发布工作室内容，旧指南请求返回真实 404', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('小影匠工作室｜原创内容出海与海外运营');
  await expect(page.locator('footer')).not.toContainText('HyperFrames');
  const manifest = await (await request.get('/content-manifest.json')).json();
  expect(manifest.publisher).toBe('小影匠工作室');
  expect(manifest.pages.map((entry: { route: string }) => entry.route)).toEqual(expect.arrayContaining(['/', '/creators/']));
  for (const route of ['/hyperframes/', '/start/cli/', '/knowledge/', '/community/licenses/', '/content/home.md', '/content/start-cli.md', '/pagefind/pagefind.js', '/media/studio-first-video.mp4', '/examples/product-intro/index.html']) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status(), route).toBe(404);
    expect(response.headers()['location']).toBeUndefined();
  }
  for (const route of ['/sitemap.xml', '/llms.txt', '/llms-full.txt', '/content/studio-home.md']) {
    const response = await request.get(route);
    expect(response.ok(), route).toBeTruthy();
    expect(await response.text(), route).not.toMatch(/HyperFrames|\/start\/cli|\/community\/licenses/);
  }
  const removed = await page.goto('/hyperframes/');
  expect(removed?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.getByRole('link', { name: '回到首页' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('你专心创作');
});
