import { appendFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { file, json } from './lib/io.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', windowsHide: true });
const base = git('rev-parse', 'HEAD').trim();
const guides = await json('content/creator-guides.json');
const blocked = new Set(git('ls-remote', '--tags', 'origin', 'knowledge-failure-*').trim().split('\n').map(line => line.split('knowledge-failure-')[1]).filter(Boolean));
const failed = guides.filter(guide => blocked.has(guide.validation?.digest));
const response = await fetch(new URL('/content-manifest.json', process.env.SITE_URL), { signal: AbortSignal.timeout(15000), cache: 'no-store' });
if (!response.ok) throw new Error('无法核对生产内容清单');
const live = await response.json();
if (live.publisher !== '小影匠工作室' || !/^[a-f0-9]{40}$/.test(live.buildSha)) throw new Error('新版官网尚未完成生产发布');
if (failed.length > 1) throw new Error('发现多个发布失败的文章，需恢复准确旧版');
const output = async (name, value) => appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
if (failed.length) {
  const slug = failed[0].slug;
  const id = `creator-${slug}`;
  const readAt = path => JSON.parse(git('show', `${live.buildSha}:${path}`));
  const guidesPath = 'content/creator-guides.json';
  const intentsPath = 'content/discovery.json';
  const article = `src/content/creators/${slug}.md`;
  const oldGuide = readAt(guidesPath).find(guide => guide.slug === slug);
  const oldIntent = readAt(intentsPath).pages.find(intent => intent.id === id);
  const discovery = await json(intentsPath);
  const restoredGuides = guides.flatMap(guide => guide.slug === slug ? oldGuide ? [oldGuide] : [] : [guide]);
  const restoredIntents = discovery.pages.flatMap(intent => intent.id === id ? oldIntent ? [oldIntent] : [] : [intent]);
  await writeFile(file(guidesPath), JSON.stringify(restoredGuides, null, 2) + '\n');
  await writeFile(file(intentsPath), JSON.stringify({ ...discovery, pages: restoredIntents }, null, 2) + '\n');
  if (oldGuide) await writeFile(file(article), git('show', `${live.buildSha}:${article}`));
  else await rm(file(article));
  await output('recovery_sha', live.buildSha);
  await output('failed_digest', failed[0].validation.digest);
} else if (guides.some(guide => guide.validation && !live.pages.some(page => page.id === `creator-${guide.slug}` && page.validation?.digest === guide.validation.digest))) {
  await output('pending_sha', base);
}
