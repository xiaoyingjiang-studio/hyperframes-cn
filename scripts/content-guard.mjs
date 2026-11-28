import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { json, file } from './lib/io.mjs';
import { assertContentPath, assertStableRoutes, assertPublishedUnit } from './lib/publishing.mjs';
import { landingPages } from './lib/landing-pages.mjs';
import matter from 'gray-matter';
const base = process.env.CONTENT_BASE_SHA;
if (!/^[a-f0-9]{40}$/.test(base || '')) throw new Error('需要固定基线 CONTENT_BASE_SHA');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', windowsHide: true });
const before = JSON.parse(git('show', `${base}:content/pages.json`));
const pages = await json('content/pages.json');
const knowledge = await json('content/knowledge.json');
const discovery = await json('content/discovery.json');
const oldDiscovery = JSON.parse(git('show', `${base}:content/discovery.json`));
const paths = git('diff', '--name-only', '-z', base, 'HEAD').split('\0').filter(Boolean);
for (const path of paths) assertContentPath(path, pages);
assertStableRoutes(before, pages, knowledge.entities);
for (const { id } of landingPages) {
  if (JSON.stringify(discovery.pages.find(p => p.id === id)) !== JSON.stringify(oldDiscovery.pages.find(p => p.id === id))) throw new Error(`知识流水线不能改变独立入口摘要：${id}`);
}
for (const page of pages) {
  const old = before.find(p => p.id === page.id);
  const oldIntent = oldDiscovery.pages.find(p => p.id === page.id);
  const intent = discovery.pages.find(p => p.id === page.id);
  const changed = !old || paths.includes(page.proseFile || page.file) || oldIntent?.answer !== intent.answer || JSON.stringify(old.reviewedSources) !== JSON.stringify(page.reviewedSources);
  if (!changed) continue;
  assertPublishedUnit(page, await readFile(file(page.proseFile || page.file), 'utf8'), intent.answer);
  if (old) {
    const previous = matter(git('show', `${base}:${page.file}`)).data;
    const current = matter(await readFile(file(page.file), 'utf8')).data;
    delete previous.status; delete current.status;
    if (JSON.stringify(previous) !== JSON.stringify(current)) throw new Error('禁止修改既有验证边界或历史日期：' + page.id);
  }
}
console.log(`内容边界检查通过：${paths.length} 个文件。`);
