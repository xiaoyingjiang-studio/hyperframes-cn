import { readFile, stat, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { json, file } from './lib/io.mjs';
import { contentDigest, validateEvidence } from './lib/knowledge.mjs';
import { validateDraft } from './lib/ai.mjs';
import { landingPages } from './lib/landing-pages.mjs';
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
const pageIds = new Set([...landingPages, ...pages].map(page => page.id));
for (const id of pageIds) if (!intents.has(id)) errors.push(`缺少页面问题与摘要：${id}`);
for (const id of intents.keys()) if (!pageIds.has(id)) errors.push(`意图对应页面不存在：${id}`);
for (const page of pages) {
  if (ids.has(page.id) || routes.has(page.route)) errors.push(`重复 ID 或路由：${page.id}`);
  ids.add(page.id); routes.add(page.route);
  const raw = await readFile(file(page.file), 'utf8'); const parsed = matter(raw); const data = parsed.data;
  const content = page.proseFile ? await readFile(file(page.proseFile), 'utf8') : parsed.content;
  if (data.contentId !== page.id || JSON.stringify(data.sources) !== JSON.stringify(page.sources)) errors.push(`来源映射不匹配：${page.id}`);
  if (content.trim().length < 300 || /TODO|待补充|Lorem ipsum|这里填写/.test(content)) errors.push(`内容不完整：${page.id}`);
  if (data.reviewedAt && !/^\d{4}-\d{2}-\d{2}$/.test(data.reviewedAt)) errors.push(`历史核对日期无效：${page.id}`);
  if (process.argv.includes('--production') && data.status === 'needs-review') errors.push(`候选没有通过自动核验：${page.id}`);
  if (page.proseFile) { try { validateDraft(content); } catch (e) { errors.push(`${page.id}: ${e.message}`); } }
  if (page.validation) {
    const intent = intents.get(page.id);
    if (page.validation.digest !== contentDigest(content, intent.answer, page.reviewedSources)) errors.push(`正文、摘要或来源变化后校验记录失效：${page.id}`);
    if (page.validation.mode === 'independent-model-and-evidence') {
      try { const snapshots = await Promise.all(page.sources.map(id => json(`.upstream/snapshots/${id}/${page.reviewedSources[id].hash}.json`))); validateEvidence(page.validation.evidence, snapshots, content, intent.answer); } catch (e) { errors.push(`${page.id}: ${e.message}`); }
    }
  } else if (data.status === 'auto-checked' || data.status === 'source-based') errors.push(`缺少内容校验记录：${page.id}`);
  for (const id of page.sources) {
    if (!sources.has(id) || !page.reviewedSources[id]) errors.push(`来源缺失或没有审核基线：${page.id}/${id}`);
    else { const snapshot = await json(`.upstream/snapshots/${id}/${page.reviewedSources[id].hash}.json`, null); if (!snapshot) errors.push(`来源快照缺失：${page.id}/${id}`); }
  }
  for (const match of content.matchAll(/\]\((\/[^)\s#]+)(?:#[^)]*)?\)/g)) {
    const target = match[1];
    if (target.includes('.')) { try { await stat(file(`public${target}`)); } catch { if (!['/rss.xml'].includes(target)) errors.push(`静态文件缺失：${page.id} -> ${target}`); } }
    else if (!routes.has(target) && !pages.some(p => p.route === target) && !landingPages.some(p => p.route === target)) errors.push(`内部链接失效：${page.id} -> ${target}`);
  }
}
const knowledge = await json('content/knowledge.json');
const entityIds = new Set();
for (const entity of knowledge.entities) {
  if (entityIds.has(entity.id)) errors.push(`重复知识实体：${entity.id}`);
  entityIds.add(entity.id);
  if (!knowledge.sections.some(section => section.id === entity.section)) errors.push(`栏目不存在：${entity.id}`);
  const page = pages.find(page => page.id === entity.articleId);
  if (page && (page.route !== entity.route || page.file !== entity.file)) errors.push(`知识实体与页面不一致：${entity.id}`);
  if ((entity.related || []).some(id => !pages.some(page => page.id === id))) errors.push(`关联页面不存在：${entity.id}`);
}
for (const name of knowledge.publishedSkills) if (!knowledge.entities.some(entity => entity.id === `skill-${name}`)) errors.push(`正式 skill 没有建设任务：${name}`);
for (const entity of knowledge.entities) for (const relation of entity.relations || []) if (!entityIds.has(relation.target)) errors.push(`知识关联不存在：${entity.id} -> ${relation.target}`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log(`内容校验通过：${pageIds.size} 页面，${sources.size} 个官方来源，${entityIds.size} 个知识主题。`);
