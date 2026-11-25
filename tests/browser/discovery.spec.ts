import { test, expect } from "@playwright/test";
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
  await expect(
    page.getByRole("link", { name: "阅读 Markdown" }),
  ).toHaveAttribute("href", "/content/start-cli.md");
});
