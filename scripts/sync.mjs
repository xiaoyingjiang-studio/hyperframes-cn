import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { json, save, file, hash } from './lib/io.mjs';
import { collect, diffIndex, affectedPages } from './lib/upstream.mjs';
import { generateDraft, configured, Budget, checkCommands } from './lib/ai.mjs';
import { applyCandidate } from './lib/candidate.mjs';
import { buildSourceContext } from './lib/source-context.mjs';
import { archiveSnapshot } from './lib/snapshots.mjs';

const bootstrap = process.argv.includes('--bootstrap');
const apply = process.argv.includes('--apply');
const reportOnly = process.argv.includes('--report-only');
const now = new Date().toISOString();
const registry = await json('content/sources.json');
const pages = await json('content/pages.json');
const status = await json('content/sync-status.json');
const discovery = await json('content/discovery.json');
try {
  const observed = await collect(registry);
  const previous = await json('.upstream/index.json', { entries: [] });
  const changes = diffIndex(previous.entries, observed.index);
  const affected = bootstrap ? [] : affectedPages(pages, observed);
  const report = { checkedAt: now, commit: observed.commit, changes, affected: affected.map(x => x.id), generated: [], skipped: [], queue: [] };
  for (const snapshot of Object.values(observed.sources)) await archiveSnapshot(snapshot);
  if (bootstrap) {
    for (const source of registry.sources) { if (observed.sources[source.id].deleted) throw new Error(`来源不存在：${source.path}`); source.blobSha = observed.sources[source.id].blobSha; }
    for (const page of pages) page.reviewedSources = Object.fromEntries(page.sources.map(id => [id, { hash: observed.sources[id].hash, commit: observed.commit, path: observed.sources[id].path }]));
    await save('content/pages.json', pages);
    await save('content/sources.json', registry);
  }
  const limit = Math.min(5, Math.max(0, Number(process.env.AI_MAX_BATCH_PAGES || 5)));
  const batch = reportOnly ? [] : affected.slice(0, limit);
  const budget = new Budget();
  const glossary = await readFile(file('content/glossary.md'), 'utf8');
  for (const page of batch) {
    const snapshots = page.sources.map(id => observed.sources[id]);
    if (snapshots.some(x => x.deleted)) { report.skipped.push({ id: page.id, reason: '官方来源已删除，需人工判断' }); continue; }
    const raw = await readFile(file(page.file), 'utf8'); const parsed = matter(raw);
    if (page.file.endsWith('.mdx')) { report.skipped.push({ id: page.id, reason: '含受控组件的 MDX 页面由维护者修订，避免候选稿丢失播放器' }); continue; }
    const oldSources = await Promise.all(page.sources.map(id => json(`.upstream/snapshots/${id}/${page.reviewedSources[id]?.hash}.json`, null)));
    try {
      const intent = discovery.pages.find(p => p.id === page.id);
      const sourceContext = buildSourceContext(oldSources, snapshots);
      const draft = await generateDraft({ pageType: parsed.data.kind, current: parsed.content, currentAnswer: intent.answer, additionalOutput: '除 body、summary、checks 以外，必须输出 answer：依据新来源核对过的页面简明回答，45–180 个字符的单行纯文本，与完整正文一致。sourceContext.changes 包含完整变更差异，references 是参考材料；partial 表示节选，不得从缺失上下文推断新事实。', sourceContext, glossary }, { budget });
      if (draft.skipped) { report.skipped.push({ id: page.id, reason: draft.reason }); continue; }
      const unknown = checkCommands(draft.body, parsed.content, snapshots.flatMap(s => s.files.map(f => f.text)).join('\n'));
      if (unknown.length) { report.skipped.push({ id: page.id, reason: '生成稿含无法从新来源或原稿确认的命令', commands: unknown }); continue; }
      const candidate = { pageId: page.id, beforeHash: hash(raw), commit: observed.commit, body: draft.body, answer: draft.answer, summary: draft.summary, checks: ['同时核对正文与 content/discovery.json 摘要、价格、账号、系统要求及命令；来源 main 不等同稳定发布承诺', ...draft.checks], usage: draft.usage };
      await save(`.upstream/candidates/${page.id}.json`, candidate);
      report.generated.push({ id: page.id, summary: draft.summary, checks: candidate.checks });
      if (apply) {
        // This only runs on a new automation branch; main changes only after human merge.
        await applyCandidate(file(page.file), candidate.beforeHash, draft.body);
        intent.answer = draft.answer;
        await save('content/discovery.json', discovery);
      }
    } catch (error) { report.skipped.push({ id: page.id, reason: error.message }); if (error.fatal) break; }
  }
  report.queue = affected.filter(p => !report.generated.some(g => g.id === p.id)).map(p => p.id);
  report.calls = budget.calls; report.reservedTokens = budget.tokens; report.aiConfigured = configured();
  await save('.upstream/index.json', { commit: observed.commit, collectedAt: now, entries: observed.index });
  await save('.upstream/observed.json', { commit: observed.commit, sources: Object.fromEntries(Object.entries(observed.sources).map(([id, s]) => [id, { hash: s.hash, commit: s.commit, path: s.path, ...(s.blobSha ? { blobSha: s.blobSha } : {}) }])) });
  await save('.upstream/report.json', report);
  if (apply) await save('content/pages.json', pages);
  await save('content/sync-status.json', { lastAttempt: now, lastSuccess: now, result: 'success', upstreamCommit: observed.commit, pendingPageIds: affected.map(x => x.id) });
  console.log(`来源检查完成：${observed.index.length} 个索引项，${affected.length} 篇受影响，${report.generated.length} 篇候选。`);
} catch (error) {
  await save('content/sync-status.json', { ...status, lastAttempt: now, result: 'failed' });
  console.error(`来源检查失败：${error.message}`); process.exitCode = 1;
}
