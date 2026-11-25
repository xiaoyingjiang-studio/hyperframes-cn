import {
  readdir,
  readFile,
  writeFile,
  stat,
  mkdir,
  rm,
} from "node:fs/promises";
import { join, sep } from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { file, json, save, hash } from "./lib/io.mjs";
import {
  resolveSite,
  xml,
  gitDate,
  intentDate,
  sourceLinks,
  renderHead,
  toMarkdown,
} from "./lib/discovery.mjs";

const site = resolveSite(await json("site.config.json"));
const pages = await json("content/pages.json");
const registry = await json("content/sources.json");
const discovery = await json("content/discovery.json");
const records = [
  {
    id: "home",
    route: "/",
    file: "src/pages/index.astro",
    sources: [],
    kind: "home",
  },
  ...pages,
];
const entries = [];
await mkdir(file("dist/content"), { recursive: true });
for (const page of records) {
  const raw = await readFile(file(page.file), "utf8");
  const { data } = matter(raw);
  const intent = discovery.pages.find((p) => p.id === page.id);
  if (!intent) throw new Error(`缺少阅读意图：${page.id}`);
  const dates = [gitDate(page.file), intentDate(page.id)]
    .filter(Boolean)
    .sort();
  const entry = {
    id: page.id,
    route: page.route,
    title: page.id === "home" ? site.name : data.title,
    description: intent.answer,
    question: intent.question,
    terms: intent.terms,
    kind: page.kind || data.kind,
    modified: dates.at(-1),
    reviewedAt: data.reviewedAt,
    appliesTo: data.appliesTo,
    verification: data.verification,
    status: data.status,
    sources: sourceLinks(page, registry),
    markdown: `/content/${page.id}.md`,
    image: page.id.startsWith("showcase-")
      ? `/media/${page.id.slice(9)}.jpg`
      : "/media/product-intro.jpg",
  };
  const path = file(`dist${page.route}index.html`);
  let html = await readFile(path, "utf8");
  html = renderHead(html, entry, site);
  await writeFile(path, html);
  const body = toMarkdown(html, site.url + page.route);
  const header = `# ${entry.title}\n\n规范地址：${site.url}${entry.route}\n\n维护者：${discovery.publisher}（独立社区项目）\n${entry.modified ? `\n正文修订：${entry.modified}（Git 记录）\n` : ""}${entry.reviewedAt ? `\n官方资料核对：${entry.reviewedAt}\n\n适用条件：${entry.appliesTo}\n\n验证边界：${entry.verification || "按所列来源整理；不代表所有入口均已实测。"}\n` : ""}\n许可：原创文字 CC BY 4.0；派生内容与素材分别保留原许可，详见 ${site.url}/community/licenses/\n\n## 官方来源\n\n${entry.sources.map((s) => `- [${s.label}](${s.url})`).join("\n") || "本站原创说明；产品事实见站内关联指南与官方来源。"}\n\n---\n\n`;
  const markdown = header + body.replace(/^# [^\n]+\n*/, "") + "\n";
  await writeFile(file("dist" + entry.markdown), markdown);
  const document = load(html);
  const sections = document("h2[id],h3[id]")
    .map((_, el) => ({
      title: document(el).text().trim(),
      id: document(el).attr("id"),
      url:
        site.url +
        entry.route +
        "#" +
        encodeURIComponent(document(el).attr("id")),
    }))
    .get();
  entries.push({ ...entry, sections, contentHash: hash(markdown) });
}
await save("dist/content-manifest.json", {
  schemaVersion: 1,
  site: site.url,
  indexable: site.indexable,
  publisher: discovery.publisher,
  pages: entries,
});
await writeFile(
  file("dist/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((p) => `<url><loc>${xml(site.url + p.route)}</loc>${p.modified ? `<lastmod>${p.modified}</lastmod>` : ""}</url>`).join("")}</urlset>`,
);
for (const name of await readdir(file("dist")))
  if (/^sitemap-(?:index|\d+)\.xml$/.test(name)) await rm(file("dist/" + name));
await writeFile(
  file("dist/robots.txt"),
  `User-agent: *\n${site.indexable ? "Allow: /" : "Disallow: /"}\nSitemap: ${site.url}/sitemap.xml\n`,
);
await writeFile(
  file("dist/llms.txt"),
  `# ${site.name}\n\n> 独立维护的中文开源指南，不代表 HeyGen 官方。事实以各页固定提交的来源、适用条件与验证边界为准。\n\n- 网站：${site.url}\n- 仓库：${site.repository}\n- 完整正文：${site.url}/llms-full.txt\n- 内容与来源清单：${site.url}/content-manifest.json\n\n## 中文指南\n\n${entries.map((p) => `- [${p.title}](${site.url}${p.markdown}): ${p.question}（网页：${site.url}${p.route}）`).join("\n")}\n`,
);
await writeFile(
  file("dist/llms-full.txt"),
  (
    await Promise.all(
      entries.map((p) => readFile(file("dist" + p.markdown), "utf8")),
    )
  ).join("\n\n---\n\n"),
);
const updates = entries.filter(
  (p) => p.route.startsWith("/updates/") && p.route !== "/updates/",
);
await writeFile(
  file("dist/rss.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(site.name)}更新</title><link>${xml(site.url)}</link><description>已审核发布的中文指南与实践更新</description><language>zh-CN</language>${updates.map((p) => `<item><title>${xml(p.title)}</title><link>${xml(site.url + p.route)}</link><description>${xml(p.description)}</description><guid isPermaLink="true">${xml(site.url + p.route)}</guid></item>`).join("")}</channel></rss>`,
);
const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'\n  Cache-Control: public, max-age=0, must-revalidate\n${!site.indexable ? "  X-Robots-Tag: noindex, nofollow\n" : ""}\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/pagefind/*\n  Cache-Control: public, max-age=0, must-revalidate\n\n/content/*\n  X-Robots-Tag: noindex\n\n/examples/*\n  X-Robots-Tag: noindex\n\n/404.html\n  X-Robots-Tag: noindex\n\n/llms-full.txt\n  X-Robots-Tag: noindex\n`;
const verification = [
  ["GOOGLE_SITE_VERIFICATION", "google-site-verification"],
  ["BING_SITE_VERIFICATION", "msvalidate.01"],
  ["BAIDU_SITE_VERIFICATION", "baidu-site-verification"],
].filter(([name]) => process.env[name]);
if (process.env.INDEXNOW_KEY) {
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(process.env.INDEXNOW_KEY))
    throw new Error("INDEXNOW_KEY 格式无效");
  await writeFile(
    file(`dist/${process.env.INDEXNOW_KEY}.txt`),
    process.env.INDEXNOW_KEY,
  );
}
await writeFile(file("dist/_headers"), headers);
if (process.env.OLD_DEFAULT_HOST && site.indexable) {
  const host = process.env.OLD_DEFAULT_HOST;
  if (!/^[a-z0-9.-]+\.workers\.dev$/.test(host))
    throw new Error("旧默认地址无效");
  await writeFile(
    file("dist/_redirects"),
    `https://${host}/* ${site.url}/:splat 301\n`,
  );
}
async function walk(path) {
  const out = [];
  for (const item of await readdir(path, { withFileTypes: true })) {
    const p = join(path, item.name);
    out.push(...(item.isDirectory() ? await walk(p) : [p]));
  }
  return out;
}
const knownHTML = new Set(
  entries.map((page) => file(`dist${page.route}index.html`)),
);
for (const path of await walk(file("dist"))) {
  if ((await stat(path)).size > 24 * 1024 * 1024)
    throw new Error(`静态资源超过 24MiB：${path}`);
  if (!path.endsWith(".html")) continue;
  const isExample = path.startsWith(file("dist/examples") + sep);
  if (!knownHTML.has(path) && path !== file("dist/404.html") && !isExample)
    throw new Error(`发现未登记的公开页面：${path}`);
  let html = await readFile(path, "utf8");
  if (
    !site.indexable ||
    path.endsWith("404.html") ||
    path.includes(join("dist", "examples"))
  ) {
    html = html.replace(/<meta\s+name="robots"[^>]*>/g, "");
    html = html.replace(
      "</head>",
      '<meta name="robots" content="noindex,nofollow"></head>',
    );
  }
  if (path === file("dist/index.html"))
    for (const [name, key] of verification)
      html = html.replace(
        "</head>",
        `<meta name="${key}" content="${xml(process.env[name])}"></head>`,
      );
  await writeFile(path, html);
}
console.log(
  `发现基础已生成：${entries.length} 页面，规范地址/结构化数据/Markdown/来源清单；收录${site.indexable ? "开启" : "关闭"}。`,
);
