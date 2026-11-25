import { readFile, stat } from 'node:fs/promises';
import matter from 'gray-matter';
import { json, file } from './lib/io.mjs';
const pages = await json('content/pages.json'); const registry = await json('content/sources.json');
const sources = new Map(registry.sources.map(s => [s.id, s]));
const errors = []; const ids = new Set(); const routes = new Set();
if (pages.length !== 31) errors.push(`首版要求 31 篇内容 + 首页，当前 ${pages.length}`);
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
