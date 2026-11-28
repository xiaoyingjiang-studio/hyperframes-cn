import { readFile, stat } from "node:fs/promises";
import { load } from "cheerio";
import { gzipSync } from "node:zlib";
import { file, json, save, hash } from "./lib/io.mjs";
import { markdownText } from './lib/markdown-text.mjs';
const manifest = await json("dist/content-manifest.json");
const findings = [];
const documents = new Map();
const incoming = new Map();
const titles = new Set();
const descriptions = new Set();
const policy = await json("content/discovery-policy.json");
const transferEstimates = [];
const add = (severity, id, code, message) =>
  findings.push({ severity, pageId: id, code, message });
for (const page of manifest.pages) {
  const html = await readFile(file(`dist${page.route}index.html`), "utf8");
  const $ = load(html);
  documents.set(page.route, $);
  const fail = (code, message) => add("error", page.id, code, message);
  const url = manifest.site + page.route;
  const sizes = {
    pageId: page.id,
    htmlGzip: gzipSync(html).length,
    initialJsGzip: 0,
    initialCssGzip: 0,
  };
  for (const [selector, attribute, key] of [
    ["script[src]", "src", "initialJsGzip"],
    ['link[rel="stylesheet"]', "href", "initialCssGzip"],
  ]) {
    for (const el of $(selector).toArray()) {
      const asset = new URL($(el).attr(attribute), url);
      if (asset.origin !== manifest.site) {
        fail("external-runtime", "核心脚本或样式依赖外部即时请求");
        continue;
      }
      sizes[key] += gzipSync(
        await readFile(file("dist" + decodeURIComponent(asset.pathname))),
      ).length;
    }
  }
  if (
    sizes.htmlGzip > policy.maxHtmlGzipBytes ||
    sizes.initialJsGzip > policy.maxInitialJsGzipBytes ||
    sizes.initialCssGzip > policy.maxInitialCssGzipBytes
  )
    fail("transfer-budget", "页面或首批脚本样式超出构建预算");
  for (const el of $('img[fetchpriority="high"]').toArray())
    if (
      (await stat(file("dist" + $(el).attr("src")))).size >
      policy.maxHeroImageBytes
    )
      fail("hero-budget", "首屏主图超出体积预算");
  transferEstimates.push(sizes);
  if ($("title").length !== 1 || titles.has($("title").text()))
    fail("title", "标题缺失、重复或多于一个");
  titles.add($("title").text());
  const description = $('meta[name="description"]');
  if (
    description.length !== 1 ||
    description.attr("content") !== page.description ||
    descriptions.has(page.description)
  )
    fail("description", "描述不唯一或与可见摘要不一致");
  descriptions.add(page.description);
  if (
    $('link[rel="canonical"]').length !== 1 ||
    $('link[rel="canonical"]').attr("href") !== url
  )
    fail("canonical", "规范地址不匹配");
  if ($("h1").length !== 1) fail("heading", "页面必须有一个主标题");
  if (!$("[data-pagefind-body]").text().includes(page.description))
    fail("answer", "摘要未出现在静态正文中");
  const robots = $('meta[name="robots"]').attr("content") || "";
  if (
    manifest.indexable
      ? robots.includes("noindex")
      : !robots.includes("noindex")
  )
    fail("indexing", "收录模式错误");
  if ($("html").attr("lang") !== "zh-CN") fail("language", "中文语言标记缺失");
  if (
    $('meta[property="og:url"]').attr("content") !== url ||
    !$('meta[name="twitter:card"]').length
  )
    fail("social", "分享信息缺失");
  try {
    const scripts = $('script[type="application/ld+json"]');
    if (scripts.length !== 1) throw new Error("需要唯一结构化数据图");
    const graph = JSON.parse(scripts.text())["@graph"];
    const node = graph.find((n) => n["@id"] === url + "#webpage");
    if (
      node?.description !== page.description ||
      node.url !== url ||
      node.dateModified !== page.modified
    )
      throw new Error("结构化数据与页面不一致");
    if (
      graph.some((n) =>
        ["FAQPage", "HowTo", "Review", "AggregateRating"].includes(n["@type"]),
      )
    )
      throw new Error("未审核的增强展示类型");
    if (
      page.route !== "/" &&
      !graph.some((n) => n["@type"] === "BreadcrumbList")
    )
      throw new Error("缺少面包屑");
  } catch (error) {
    fail("schema", error.message);
  }
  for (const source of page.sources)
    if (
      !$(".source-meta a")
        .toArray()
        .some((el) => $(el).attr("href") === source.url)
    )
      fail("citation", "来源没有在可见页面中呈现");
  for (const image of $("img").toArray())
    if (
      $(image).attr("alt") === undefined ||
      !$(image).attr("width") ||
      !$(image).attr("height")
    )
      fail("image", "图片缺少说明或固定尺寸");
  if ($('video[autoplay],video:not([preload="none"])').length)
    fail("media", "案例视频必须按需加载");
  const markdown = await readFile(file("dist" + page.markdown), "utf8");
  for (const el of $(".expressive-code pre code").toArray()) {
    const lines = $(el).find(".ec-line .code");
    const code = lines.length
      ? lines
          .map((_, line) => $(line).text())
          .get()
          .join("\n")
      : $(el).text();
    if (code.trim() && !markdown.includes(code.trim()))
      fail("code-parity", "Markdown 丢失代码内容或换行");
  }
  if (
    hash(markdown) !== page.contentHash ||
    !(await markdownText(markdown)).includes(page.description.replace(/\s+/g, ' ').trim()) ||
    !markdown.includes(url) ||
    page.sources.some((s) => !markdown.includes(s.url))
  )
    fail("export", "正文、来源或内容哈希导出不完整");
  if (/<script|^import .+ from /m.test(markdown))
    fail("export-code", "导出中包含可执行组件");
  incoming.set(page.route, new Set());
}
for (const page of manifest.pages) {
  const $ = documents.get(page.route);
  for (const el of $("a[href]").toArray()) {
    const href = $(el).attr("href");
    if (!href || /^(?:mailto:|tel:)/.test(href)) continue;
    let url;
    try {
      url = new URL(href, manifest.site + page.route);
    } catch {
      add("error", page.id, "link", "链接格式无效");
      continue;
    }
    if (url.origin !== manifest.site) continue;
    const target = documents.get(url.pathname);
    if (target) {
      if (url.pathname !== page.route)
        incoming.get(url.pathname).add(page.route);
      if (url.hash) {
        let id;
        try {
          id = decodeURIComponent(url.hash.slice(1));
        } catch {
          id = url.hash.slice(1);
        }
        if (
          !target("[id]")
            .toArray()
            .some((el) => target(el).attr("id") === id)
        )
          add(
            "error",
            page.id,
            "anchor",
            `锚点不存在：${url.pathname}${url.hash}`,
          );
      }
    } else {
      try {
        await stat(file("dist" + decodeURIComponent(url.pathname)));
      } catch {
        add("error", page.id, "link", `内部目标不存在：${url.pathname}`);
      }
    }
  }
}
for (const page of manifest.pages)
  if (page.route !== "/" && !incoming.get(page.route).size)
    add("error", page.id, "orphan", "没有任何内部入口");
const sitemap = load(await readFile(file("dist/sitemap.xml"), "utf8"), {
  xmlMode: true,
});
const locations = sitemap("loc")
  .map((_, el) => sitemap(el).text())
  .get();
if (
  locations.length !== manifest.pages.length ||
  manifest.pages.some((p) => !locations.includes(manifest.site + p.route))
)
  add("error", "site", "sitemap", "站点地图覆盖不一致");
const robots = await readFile(file("dist/robots.txt"), "utf8");
if (
  manifest.indexable
    ? !robots.includes("Allow: /")
    : !robots.includes("Disallow: /")
)
  add("error", "site", "robots", "抓取规则与收录模式不一致");
const notFound = load(await readFile(file("dist/404.html"), "utf8"));
if (!notFound('meta[name="robots"]').attr("content")?.includes("noindex"))
  add("error", "site", "404", "404 不得收录");
const report = {
  schemaVersion: 1,
  indexable: manifest.indexable,
  pageCount: manifest.pages.length,
  checks: [
    "canonical",
    "unique-metadata",
    "visible-answer",
    "static-body",
    "structured-data",
    "source-citations",
    "markdown-parity",
    "internal-links-and-anchors",
    "incoming-links",
    "image-dimensions",
    "lazy-video",
    "sitemap",
    "robots",
    "404",
  ],
  errors: findings.filter((f) => f.severity === "error").length,
  findings,
  notice: manifest.indexable
    ? "基础审计通过不代表已被收录或获得 AI 引用。"
    : "测试站禁止收录；正式域名启用前不进行搜索提交。",
};
report.transferEstimates = transferEstimates;
report.checks.push("compressed-transfer-budgets");
await save("artifacts/discovery-audit.json", report);
console.log(
  `SEO/GEO 基础审计：${report.pageCount} 页面，${report.errors} 错误。${report.notice}`,
);
if (report.errors) {
  console.error(
    findings.map((f) => `${f.pageId} [${f.code}] ${f.message}`).join("\n"),
  );
  process.exitCode = 1;
}
