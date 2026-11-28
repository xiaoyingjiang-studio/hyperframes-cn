import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { file, json } from './lib/io.mjs';
import { assertStudioGuide, regionalTopic, studioSlug } from './lib/studio-content.mjs';

const base = process.env.CONTENT_BASE_SHA;
if (!/^[a-f0-9]{40}$/.test(base || '')) throw new Error('需要固定基线 CONTENT_BASE_SHA');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', windowsHide: true });
const guidesPath = 'content/creator-guides.json';
const intentsPath = 'content/discovery.json';
const readAt = (sha, path) => JSON.parse(git('show', `${sha}:${path}`));
const guides = await json(guidesPath);
const discovery = await json(intentsPath);
const beforeGuides = readAt(base, guidesPath);
const beforeDiscovery = readAt(base, intentsPath);
const changed = git('diff', '--name-only', '-z', base, 'HEAD').split('\0').filter(Boolean);
const updates = changed.filter(path => /^src\/content\/creators\/[a-z0-9-]+\.md$/.test(path));
const slugs = new Set([...beforeGuides, ...guides].map(row => row.slug));
const updatedSlugs = [...slugs].filter(slug => !isDeepStrictEqual(beforeGuides.find(row => row.slug === slug), guides.find(row => row.slug === slug)));
if (updatedSlugs.length !== 1 || changed.some(path => ![guidesPath, intentsPath, ...updates].includes(path))) throw new Error('内容批次只能修改一篇手册正文及其登记');
const [slug] = updatedSlugs;
const path = `src/content/creators/${slug}.md`;
if (updates.some(update => update !== path)) throw new Error('正文与登记的问题不是同一篇文章');
if (!studioSlug.test(slug)) throw new Error('手册地址无效');
const id = `creator-${slug}`;
const guide = guides.find(row => row.slug === slug);
const oldGuide = beforeGuides.find(row => row.slug === slug);
const intent = discovery.pages.find(row => row.id === id);
const exclude = (items, key, value) => items.filter(item => item[key] !== value);
if (!isDeepStrictEqual(exclude(guides, 'slug', slug), exclude(beforeGuides, 'slug', slug)) ||
    !isDeepStrictEqual({ ...discovery, pages: exclude(discovery.pages, 'id', id) }, { ...beforeDiscovery, pages: exclude(beforeDiscovery.pages, 'id', id) })) throw new Error('手册任务修改了其他已有文章或入口');
const recoverySha = process.env.STUDIO_RECOVERY_SHA || '';
if (recoverySha) {
  if (!/^[a-f0-9]{40}$/.test(recoverySha) || !oldGuide?.validation?.digest) throw new Error('无效的手册恢复基线');
  const oldPublished = readAt(recoverySha, guidesPath).find(row => row.slug === slug);
  const oldIntent = readAt(recoverySha, intentsPath).pages.find(row => row.id === id);
  if (!isDeepStrictEqual(guide, oldPublished) || !isDeepStrictEqual(intent, oldIntent)) throw new Error('恢复内容与线上基线不一致');
  if (guide && (await readFile(file(path), 'utf8')).trim() !== git('show', `${recoverySha}:${path}`).trim()) throw new Error('恢复正文与线上基线不一致');
} else {
  const policy = await json('content/studio-sources.json');
  const expected = policy.topics.find(row => row.slug === slug) || regionalTopic(slug);
  if (!guide || !intent || !expected || expected.section !== guide.section || expected.question !== intent.question ||
      guide.validation?.mode !== 'independent-model-and-evidence' ||
      (oldGuide && !oldGuide.validation) || oldGuide?.reviewedAt !== guide.reviewedAt) throw new Error('自动任务不能修改人工文章、实核日期或已登记问题');
  assertStudioGuide(guide, await readFile(file(path), 'utf8'), intent);
}
console.log(`工作室内容边界检查通过：${slug}`);
