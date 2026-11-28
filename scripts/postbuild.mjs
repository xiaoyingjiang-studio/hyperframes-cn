import { readdir, readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';
import { file, json, save, hash } from './lib/io.mjs';
import { landingPages } from './lib/landing-pages.mjs';
import { resolveSite, xml, gitDate, intentDate, renderHead, toMarkdown } from './lib/discovery.mjs';

const site = resolveSite(await json('site.config.json'));
const discovery = await json('content/discovery.json');
const entries = [];
await mkdir(file('dist/content'), { recursive: true });

for (const page of landingPages) {
  const intent = discovery.pages.find(({ id }) => id === page.id);
  if (!intent) throw new Error(`缺少阅读意图：${page.id}`);
  const date = [gitDate(page.file), intentDate(page.id)].filter(Boolean).sort().at(-1);
  const breadcrumbs = page.kind === 'article'
    ? [{ name: '首页', route: '/' }, { name: '出海手册', route: '/creators/' }, { name: intent.title, route: page.route }]
    : undefined;
  const entry = {
    id: page.id,
    route: page.route,
    kind: page.kind,
    image: page.image,
    imageWidth: page.imageWidth,
    imageHeight: page.imageHeight,
    title: intent.title,
    description: intent.answer,
    question: intent.question,
    terms: intent.terms,
    modified: date,
    reviewedAt: page.reviewedAt,
    validation: page.validation,
    sources: page.sources ?? [],
    breadcrumbs,
    markdown: `/content/${page.id}.md`,
  };
  const path = file(`dist${page.route}index.html`);
  const html = renderHead(await readFile(path, 'utf8'), entry, site);
  await writeFile(path, html);
  const url = site.url + page.route;
  const body = toMarkdown(html, url).replace(/^# [^\n]+\n*/, '');
  const header = `# ${entry.title}\n\n规范地址：${url}\n\n维护者：${site.name}\n${date ? `\n正文修订：${date}（Git 记录）\n` : ''}\n许可：原创文字 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)\n\n---\n\n`;
  const markdown = header + body + '\n';
  await writeFile(file('dist' + entry.markdown), markdown);
  const document = load(html);
  const sections = document('h2[id],h3[id]').map((_, element) => {
    const id = document(element).attr('id');
    return { title: document(element).text().trim(), id, url: url + '#' + encodeURIComponent(id) };
  }).get();
  entries.push({ ...entry, sections, contentHash: hash(markdown) });
}

await save('dist/content-manifest.json', {
  schemaVersion: 2,
  buildSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  site: site.url,
  indexable: site.indexable,
  publisher: site.name,
  pages: entries,
});
await writeFile(file('dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(page => `<url><loc>${xml(site.url + page.route)}</loc>${page.modified ? `<lastmod>${page.modified}</lastmod>` : ''}</url>`).join('')}</urlset>`);
await writeFile(file('dist/robots.txt'), `User-agent: *\n${site.indexable ? 'Allow: /' : 'Disallow: /'}\nSitemap: ${site.url}/sitemap.xml\n`);
await writeFile(file('dist/llms.txt'), `# ${site.name}\n\n> ${site.description}\n\n- 网站：${site.url}\n- 完整正文：${site.url}/llms-full.txt\n- 内容清单：${site.url}/content-manifest.json\n\n## 公开内容\n\n${entries.map(page => `- [${page.title}](${site.url}${page.markdown}): ${page.question}（网页：${site.url}${page.route}）`).join('\n')}\n`);
const exportedContent = await Promise.all(entries.map(page => readFile(file('dist' + page.markdown), 'utf8')));
await writeFile(file('dist/llms-full.txt'), exportedContent.join('\n\n---\n\n'));

const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'\n  Cache-Control: public, max-age=0, must-revalidate\n${!site.indexable ? '  X-Robots-Tag: noindex, nofollow\n' : ''}\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/content/*\n  X-Robots-Tag: noindex\n\n/404.html\n  X-Robots-Tag: noindex\n\n/llms-full.txt\n  X-Robots-Tag: noindex\n`;
await writeFile(file('dist/_headers'), headers);
if (process.env.INDEXNOW_KEY) {
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(process.env.INDEXNOW_KEY)) throw new Error('INDEXNOW_KEY 格式无效');
  await writeFile(file(`dist/${process.env.INDEXNOW_KEY}.txt`), process.env.INDEXNOW_KEY);
}
const oldHost = process.env.OLD_DEFAULT_HOST || '';
if (oldHost && !/^[a-z0-9.-]+\.workers\.dev$/.test(oldHost)) throw new Error('旧默认地址无效');
await save('.cache/edge-site.json', { site: site.url, indexable: site.indexable, oldHost });

const rootPage = file('dist/index.html');
let rootHtml = await readFile(rootPage, 'utf8');
for (const [name, key] of [['GOOGLE_SITE_VERIFICATION', 'google-site-verification'], ['BING_SITE_VERIFICATION', 'msvalidate.01'], ['BAIDU_SITE_VERIFICATION', 'baidu-site-verification']]) {
  rootHtml = rootHtml.replace(new RegExp(`<meta name="${key}"[^>]*>`, 'g'), '');
  if (process.env[name]) rootHtml = rootHtml.replace('</head>', `<meta name="${key}" content="${xml(process.env[name])}"></head>`);
}
await writeFile(rootPage, rootHtml);

const knownHTML = new Set(entries.map(page => file(`dist${page.route}index.html`)).concat(file('dist/404.html')));
for (const item of await readdir(file('dist'), { recursive: true, withFileTypes: true })) {
  if (!item.isFile()) continue;
  const path = join(item.parentPath, item.name);
  if ((await stat(path)).size > 24 * 1024 * 1024) throw new Error(`静态资源超过 24MiB：${path}`);
  if (path.endsWith('.html') && !knownHTML.has(path)) throw new Error(`发现未登记的公开页面：${path}`);
}
console.log(`发现基础已生成：${entries.length} 个页面，收录${site.indexable ? '开启' : '关闭'}。`);
