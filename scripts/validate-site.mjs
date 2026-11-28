import { readdir, readFile, stat } from 'node:fs/promises';
import { creatorGuidePages, landingPages } from './lib/landing-pages.mjs';
import { file, json } from './lib/io.mjs';
import { assertStudioGuide, studioSections } from './lib/studio-content.mjs';

const { pages: intents } = await json('content/discovery.json');
const ids = new Set();
const routes = new Set();
for (const page of landingPages) {
  if (ids.has(page.id) || routes.has(page.route)) throw new Error(`公开页面 ID 或地址重复：${page.id}`);
  ids.add(page.id);
  routes.add(page.route);
  const matches = intents.filter(({ id }) => id === page.id);
  const [intent] = matches;
  if (matches.length !== 1 || !intent.title || !intent.question || typeof intent.answer !== 'string' || intent.answer.length < 45 || intent.answer.length > 180 || !Array.isArray(intent.terms) || intent.terms.length < 2) {
    throw new Error(`公开页面的主问题、标题或摘要不完整：${page.id}`);
  }
  for (const path of [page.file, 'public-studio' + page.image]) {
    if (!(await stat(file(path))).isFile()) throw new Error(`公开页面来源或分享图不是文件：${path}`);
  }
}
const editorialFiles = await readdir(file('src/content/creators'));
const declaredSlugs = new Set(creatorGuidePages.map(({ slug }) => slug));
for (const guide of creatorGuidePages) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug) || !['准备', '改编', '复盘', ...studioSections].includes(guide.section)) throw new Error(`文章地址或栏目无效：${guide.id}`);
  if (new Set(guide.next).size !== guide.next.length || guide.next.length > 2 || guide.next.some(slug => slug === guide.slug || !declaredSlugs.has(slug))) throw new Error(`延伸阅读无效：${guide.id}`);
  if (guide.sources.length && !/^\d{4}-\d{2}-\d{2}$/.test(guide.reviewedAt ?? '') && !/^\d{4}-\d{2}-\d{2}T/.test(guide.validation?.checkedAt ?? '')) throw new Error(`来源缺少核对日期：${guide.id}`);
  if (guide.sources.some(source => !source.label || !source.url.startsWith('https://'))) throw new Error(`来源链接无效：${guide.id}`);
  const body = await readFile(file(guide.file), 'utf8');
  if (body.trim().length < 350 || /^#\s+/m.test(body)) throw new Error(`文章缺少可用正文或重复主标题：${guide.id}`);
  if (guide.validation) assertStudioGuide(guide, body, intents.find(intent => intent.id === guide.id));
}
for (const entry of editorialFiles) {
  if (entry.endsWith('.md') && !declaredSlugs.has(entry.slice(0, -3))) throw new Error(`文章未登记：${entry}`);
}
console.log(`工作室官网公开页面登记通过：${ids.size} 页。`);
