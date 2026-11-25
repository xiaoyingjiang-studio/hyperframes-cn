import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveSite,
  structuredData,
  renderHead,
  toMarkdown,
  jsonLd,
} from "../scripts/lib/discovery.mjs";
import {
  validateObservations,
  prioritize,
} from "../scripts/lib/optimization.mjs";
const site = {
  name: "中文指南",
  url: "https://guide.example.com",
  repository: "https://github.com/example/guide",
  indexable: true,
};
const page = {
  id: "cli",
  route: "/start/cli/",
  title: "CLI 入门",
  kind: "tutorial",
  description: "按版本检查并渲染。",
  modified: "2026-11-25T02:00:00Z",
  sources: [
    {
      url:
        "https://github.com/heygen-com/hyperframes/blob/" +
        "a".repeat(40) +
        "/docs/quickstart.mdx",
    },
  ],
  markdown: "/content/cli.md",
  image: "/media/product-intro.jpg",
};
test("收录必须显式启用，拒绝测试域名和带路径的 canonical", () => {
  assert.equal(resolveSite({ ...site, indexable: false }, {}).indexable, false);
  assert.throws(() =>
    resolveSite(site, { SITE_URL: "https://test.workers.dev" }),
  );
  assert.throws(() =>
    resolveSite(site, { SITE_URL: "https://example.com/sub/" }),
  );
  assert.throws(() => resolveSite(site, { SITE_INDEXABLE: "yes" }));
  assert.equal(resolveSite(site, {}).indexable, true);
});
test("结构化数据说明独立身份并引用固定来源，不编造评分或发布日期", () => {
  const graph = structuredData(page, site)["@graph"];
  assert.equal(
    graph.find((n) => n["@type"] === "TechArticle").citation[0],
    page.sources[0].url,
  );
  assert.equal(
    graph.find((n) => n["@type"] === "TechArticle").datePublished,
    undefined,
  );
  assert.match(
    graph.find((n) => n["@type"] === "Organization").description,
    /不代表/,
  );
  assert.equal(graph.filter((n) => n["@type"] === "BreadcrumbList").length, 1);
  assert.ok(!jsonLd({ x: "</script><script>" }).includes("</script>"));
});
test("重复生成不会累加 canonical、摘要和 JSON-LD", () => {
  const first = renderHead(
    '<html><head><title>old</title></head><body><div class="source-meta"></div></body></html>',
    page,
    site,
  );
  const second = renderHead(first, page, site);
  assert.equal(second, first);
});
test("机器正文保留代码、表格与绝对引用，不泄漏按钮和组件", () => {
  const result = toMarkdown(
    '<main data-pagefind-body><h1>标题</h1><p>中文正文<a href="/start/cli/#render">CLI</a></p><div class="expressive-code"><pre><code>npx hyperframes render\n--output a.mp4</code></pre><button>Copy</button></div><table><tr><th>入口</th><th>条件</th></tr><tr><td>CLI</td><td>Node</td></tr></table><script>bad()</script></main>',
    site.url + "/",
  );
  assert.match(result, /npx hyperframes render\n--output a.mp4/);
  assert.match(result, /\| CLI \| Node \|/);
  assert.match(result, /https:\/\/guide.example.com\/start\/cli\/#render/);
  assert.doesNotMatch(result, /Copy|bad\(\)/);
});
const search = {
  kind: "search",
  engine: "google",
  pageId: "cli",
  query: "render 命令",
  period: { start: "2026-11-01", end: "2026-11-20" },
  impressions: 200,
  clicks: 1,
  evidence: "Search Console export 2026-11-21",
};
test("真实观测校验拒绝虚假数字和缺失出处，不用零数据创造优化任务", () => {
  const ids = new Set(["cli"]);
  assert.doesNotThrow(() =>
    validateObservations({ schemaVersion: 1, observations: [search] }, ids),
  );
  assert.throws(() =>
    validateObservations(
      { schemaVersion: 1, observations: [{ ...search, clicks: 201 }] },
      ids,
    ),
  );
  assert.throws(() =>
    validateObservations(
      { schemaVersion: 1, observations: [{ ...search, evidence: "" }] },
      ids,
    ),
  );
  assert.throws(() =>
    validateObservations(
      {
        schemaVersion: 1,
        observations: [
          { ...search, period: { start: "2026-02-30", end: "2026-03-01" } },
        ],
      },
      ids,
    ),
  );
  assert.deepEqual(prioritize([{ id: "cli" }], []), []);
  assert.equal(
    prioritize([{ id: "cli" }], [search])[0].reasons[0].type,
    "low-ctr",
  );
  assert.deepEqual(prioritize([{ id: "cli" }], [search], ["cli"]), []);
});
test("语法高亮的逐行 div 导出时不能把多条命令拼成一条", () => {
  const result = toMarkdown(
    '<main data-pagefind-body><div class="expressive-code"><pre data-language="bash"><code><div class="ec-line"><div class="code">npx hyperframes init test</div></div><div class="ec-line"><div class="code">cd test</div></div></code></pre></div><h2>步骤<a href="#步骤"><svg></svg></a></h2></main>',
    site.url + "/",
  );
  assert.match(result, /```bash\nnpx hyperframes init test\ncd test\n```/);
  assert.doesNotMatch(result, /\[\]\(/);
});
test("AI 引用必须记录实际 URL 与核对状态；错误引用也需要排查", () => {
  const citation = {
    kind: "citation",
    engine: "example-tool",
    model: "recorded-model",
    pageId: "cli",
    query: "如何渲染",
    observedAt: "2026-11-25T03:00:00Z",
    cited: true,
    siteCitations: ["https://guide.example.com/start/cli/"],
    accuracy: "unsupported",
    evidence: "回答截图与逐项核对记录 #example",
  };
  assert.doesNotThrow(() =>
    validateObservations(
      { schemaVersion: 1, observations: [citation] },
      new Set(["cli"]),
    ),
  );
  assert.throws(() =>
    validateObservations(
      { schemaVersion: 1, observations: [{ ...citation, siteCitations: [] }] },
      new Set(["cli"]),
    ),
  );
  assert.equal(
    prioritize([{ id: "cli" }], [citation])[0].reasons[0].type,
    "citation-mismatch",
  );
});
