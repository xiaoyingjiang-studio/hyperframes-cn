import { readFile, stat, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { json, file } from './lib/io.mjs';
const pages = await json('content/pages.json'); const registry = await json('content/sources.json');
const sources = new Map(registry.sources.map(s => [s.id, s]));
const errors = []; const ids = new Set(); const routes = new Set();
const registeredFiles = new Set(pages.map(p => p.file));
for (const item of await readdir(file('src/content/docs'), { recursive: true, withFileTypes: true })) {
  if (!item.isFile() || !/\.mdx?$/.test(item.name)) continue;
  const path = relative(file(''), join(item.parentPath, item.name)).replaceAll('\\', '/');
  if (!registeredFiles.has(path)) errors.push(`正文未登记稳定 ID、路由与来源：${path}`);
}
if (pages.length < 31) errors.push(`已发布内容不能无迁移说明减少：当前 ${pages.length}`);
const discovery = await json('content/discovery.json');
const intents = new Map();
for (const intent of discovery.pages) {
  if (intents.has(intent.id)) errors.push(`重复阅读意图：${intent.id}`);
  intents.set(intent.id, intent);
  if (intent.answer?.length < 45 || intent.answer?.length > 180 || !intent.question || !Array.isArray(intent.terms) || intent.terms.length < 2) errors.push(`阅读意图不完整：${intent.id}`);
}
for (const id of ['home', ...pages.map(p => p.id)]) if (!intents.has(id)) errors.push(`缺少页面问题与摘要：${id}`);
for (const id of intents.keys()) if (id !== 'home' && !pages.some(p => p.id === id)) errors.push(`意图对应页面不存在：${id}`);
for (const page of pages) {
  if (ids.has(page.id) || routes.has(page.route)) errors.push(`重复 ID 或路由：${page.id}`);
  ids.add(page.id); routes.add(page.route);
  const raw = await readFile(file(page.file), 'utf8'); const { data, content } = matter(raw);
  if (data.contentId !== page.id || JSON.stringify(data.sources) !== JSON.stringify(page.sources)) errors.push(`来源映射不匹配：${page.id}`);
  if (content.trim().length < 300 || /TODO|待补充|Lorem ipsum|这里填写/.test(content)) errors.push(`内容不完整：${page.id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.reviewedAt)) errors.push(`核对日期无效：${page.id}`);
  if (process.argv.includes('--production') && data.status === 'needs-review') errors.push(`未完成人工复核：${page.id}`);
  for (const id of page.sources) {
    if (!sources.has(id) || !page.reviewedSources[id]) errors.push(`来源缺失或没有审核基线：${page.id}/${id}`);
    else { const snapshot = await json(`.upstream/snapshots/${id}/${page.reviewedSources[id].hash}.json`, null); if (!snapshot) errors.push(`来源快照缺失：${page.id}/${id}`); }
  }
  for (const match of content.matchAll(/\]\((\/[^)\s#]+)(?:#[^)]*)?\)/g)) {
    const target = match[1];
    if (target.includes('.')) { try { await stat(file(`public${target}`)); } catch { if (!['/rss.xml'].includes(target)) errors.push(`静态文件缺失：${page.id} -> ${target}`); } }
    else if (!routes.has(target) && !pages.some(p => p.route === target) && target !== '/') errors.push(`内部链接失效：${page.id} -> ${target}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log(`内容校验通过：${pages.length + 1} 页面，${sources.size} 个官方来源。`);
