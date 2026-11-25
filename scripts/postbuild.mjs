import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { file, json } from './lib/io.mjs';
const config = await json('site.config.json');
const site = (process.env.SITE_URL || config.url).replace(/\/$/, '');
if (!/^https?:\/\//.test(site)) throw new Error('SITE_URL 必须是绝对 HTTP(S) 地址');
const indexable = process.env.SITE_INDEXABLE ? process.env.SITE_INDEXABLE === 'true' : config.indexable;
const repository = process.env.PUBLIC_REPOSITORY || config.repository;
const pages = await json('content/pages.json');
const escape = s => s.replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' }[c]));
const entries = [{ route: '/', title: 'HyperFrames 中文指南' }];
for (const p of pages) { const source = await readFile(file(p.file),'utf8'); entries.push({ route:p.route, title:JSON.parse(source.match(/^title: (.+)$/m)[1]) }); }
await writeFile(file('dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(p=>`<url><loc>${escape(site+p.route)}</loc></url>`).join('')}</urlset>`);
await writeFile(file('dist/robots.txt'), `User-agent: *\n${indexable ? 'Allow: /' : 'Disallow: /'}\nSitemap: ${site}/sitemap.xml\n`);
await writeFile(file('dist/llms.txt'), `# HyperFrames 中文指南\n\n独立维护的中文学习项目。源码：${repository}\n\n${entries.map(p=>`- [${p.title}](${site}${p.route})`).join('\n')}\n`);
const updates = entries.filter(p=>p.route.startsWith('/updates/')&&p.route!=='/updates/');
await writeFile(file('dist/rss.xml'), `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>HyperFrames 中文指南更新</title><link>${escape(site)}</link><description>已审核发布的中文指南与实践更新</description><language>zh-CN</language>${updates.map(p=>`<item><title>${escape(p.title)}</title><link>${escape(site+p.route)}</link><guid isPermaLink="true">${escape(site+p.route)}</guid></item>`).join('')}</channel></rss>`);
const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'\n  Cache-Control: public, max-age=0, must-revalidate\n${!indexable ? '  X-Robots-Tag: noindex, nofollow\n' : ''}\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/pagefind/*\n  Cache-Control: public, max-age=0, must-revalidate\n`;
await writeFile(file('dist/_headers'), headers);
if (process.env.OLD_DEFAULT_HOST && indexable) { const host = process.env.OLD_DEFAULT_HOST; if (!/^[a-z0-9.-]+\.workers\.dev$/.test(host)) throw new Error('旧默认地址格式无效'); await writeFile(file('dist/_redirects'), `https://${host}/* ${site}/:splat 301\n`); }
async function walk(path) { const out=[]; for(const item of await readdir(path,{withFileTypes:true})) { const p=join(path,item.name); out.push(...(item.isDirectory()?await walk(p):[p])); } return out; }
for (const p of await walk(file('dist'))) {
  if ((await stat(p)).size > 24 * 1024 * 1024) throw new Error(`静态资源超过项目 24MiB 上限：${p}`);
  if (!p.endsWith('.html')) continue;
  let html = await readFile(p, 'utf8');
  if (!indexable) { html = html.replace(/<meta\s+name="robots"[^>]*>/g,''); html=html.replace('</head>','<meta name="robots" content="noindex,nofollow"></head>'); }
  await writeFile(p, html);
}
console.log(`静态发布文件已生成，${entries.length} 页面；收录：${indexable ? '开启' : '关闭'}。`);
