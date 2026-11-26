import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import matter from 'gray-matter';
import { inventory } from './knowledge-inventory.mjs';
import { json, save, file, hash, request as httpRequest } from './lib/io.mjs';
import { Budget } from './lib/ai.mjs';
import { eligibleQueue, failedTask, createVerifiedArticle, contentDigest, splitDocument, assertDocumentFresh } from './lib/knowledge.mjs';
import { validateObservations, prioritize } from './lib/optimization.mjs';

export async function syncKnowledge({ fetcher, request, loadInventory = inventory } = {}) {
  const apply = process.argv.includes('--apply');
  const target = process.env.KNOWLEDGE_TARGET || '';
  if (target && process.env.GITHUB_EVENT_NAME && process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch') throw new Error('定向知识验收只能手动触发，定时任务保持默认排序');
  if (target && !/^[a-z0-9-]+$/.test(target)) throw new Error('定向验收需要登记的知识实体 ID');
  const { pages, knowledge, observed } = await loadInventory({ fetcher });
  if (target && !knowledge.entities.some(e => e.id === target && e.automation !== false)) throw new Error('定向验收实体未登记或禁止自动更新');
  const discovery = await json('content/discovery.json');
  const state = await json('content/knowledge-queue.json', { tasks: [] });
  if (process.env.GITHUB_REPOSITORY && process.env.GITHUB_TOKEN) {
    const response = await httpRequest(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/git/matching-refs/tags/knowledge-failure-`, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });
    const blocked = new Set((await response.json()).map(tag => tag.ref.split('knowledge-failure-')[1]));
    for (const entity of knowledge.entities) {
      const page = pages.find(p => p.id === entity.articleId);
      if (blocked.has(page?.validation?.digest) && !state.tasks.some(t => t.id === entity.id)) state.tasks.push({ id: entity.id, articleId: entity.articleId, reason: 'release-failed', revision: page.validation.digest, firstSeen: new Date().toISOString(), attempts: 0 });
    }
  }
  let tasks = eligibleQueue(knowledge.entities.filter(e => e.available !== false || pages.some(p => p.id === e.articleId)), pages, observed, state.tasks);
  const optimize = process.argv.includes('--optimize');
  if (optimize) {
    const observations = await json(process.env.OPTIMIZATION_OBSERVATIONS || 'content/optimization/observations.json', { schemaVersion: 1, observations: [] });
    const signals = prioritize(pages, validateObservations(observations, new Set(pages.map(p => p.id).concat('home'))).observations, tasks.map(t => t.articleId));
    tasks = signals.filter(signal => !pages.find(p => p.id === signal.pageId)?.optimization || pages.find(p => p.id === signal.pageId).optimization !== hash(JSON.stringify(signal.reasons))).map(signal => ({ id: knowledge.entities.find(e => e.articleId === signal.pageId)?.id, articleId: signal.pageId, reason: 'optimization', signals: signal.reasons, revision: hash(JSON.stringify(signal.reasons)), firstSeen: new Date().toISOString(), attempts: 0 })).filter(t => t.id && knowledge.entities.find(e => e.id === t.id).automation !== false);
  }
  const budget = new Budget();
  const limit = optimize ? Math.min(3, Math.max(0, Number(process.env.OPTIMIZE_MAX_PAGES || 3))) : Math.min(5, Math.max(0, Number(process.env.AI_MAX_BATCH_PAGES || 5)));
  const report = { generated: [], skipped: [], calls: 0, release: knowledge.release, pending: tasks.length };
  const pending = [...state.tasks.filter(t => !tasks.some(x => x.id === t.id))];
  let processed = 0;
  for (const task of tasks) {
    if ((target && task.id !== target) || processed >= limit || process.argv.includes('--report-only')) { pending.push(task); continue; }
    processed++;
    const entity = knowledge.entities.find(e => e.id === task.id);
    const existing = pages.find(p => p.id === entity.articleId);
    const snapshots = (entity.sources || existing.sources).map(id => observed.sources[id]);
    let raw = existing ? await readFile(file(existing.proseFile || existing.file), 'utf8') : '';
    const beforeHash = hash(raw);
    const intent = discovery.pages.find(p => p.id === entity.articleId);
    console.log(`处理知识任务：${entity.articleId}（${task.reason}）。`);
    try {
      if (snapshots.some(s => !s || s.deleted || s.error)) throw new Error('来源缺失或已移动修改，无法据此判断功能取消；自动延期');
      const parsed = existing ? existing.proseFile ? { content: raw } : splitDocument(raw) : { content: '' };
      const previousSnapshots = existing ? await Promise.all(existing.sources.map(id => json(`.upstream/snapshots/${id}/${existing.reviewedSources[id]?.hash}.json`, null))) : [];
      const related = [...new Set([`learn-${entity.section}`, ...entity.related])].flatMap(id => {
        const page = pages.find(p => p.id === id);
        return page ? [{ id, route: page.route, question: discovery.pages.find(p => p.id === id)?.question }] : [];
      });
      const draft = await createVerifiedArticle({ entity, current: parsed.content, currentAnswer: intent?.answer || '', snapshots, previousSnapshots, purpose: optimize ? '仅优化表达，不改变产品事实、历史核对日期和来源版本；观测只用于编辑优先级，不证明因果。' : '依据正式来源补齐或更新创作知识', signals: task.signals, version: { cli: knowledge.release.tag, desktop: '桌面应用版本需官方另行确认，不沿用 CLI 版本' }, related, glossary: await readFile(file('content/glossary.md'), 'utf8') }, { budget, onVerdict: verdict => console.log(`独立核验 ${entity.articleId}：${verdict.supported === true ? '支持' : '需修订'}；${JSON.stringify(verdict.issues || []).slice(0, 1500)}`), ...(request ? { request } : {}) });
      if (draft.body.trim().length < 300) throw new Error('正文没有达到完整说明长度');
      if (!existing && [ ['title', 4, 60], ['question', 8, 120] ].some(([key, min, max]) => typeof draft[key] !== 'string' || draft[key].length < min || draft[key].length > max || /[<>\n\r]/.test(draft[key]) || !/\p{Script=Han}/u.test(draft[key]))) throw new Error('新增页面缺少面向创作者的中文标题或主问题');
      for (const match of draft.body.matchAll(/\]\((\/[^)\s#]+)(?:#[^)]*)?\)/g)) {
        if (match[1] !== '/' && !pages.some(p => p.route === match[1]) && match[1] !== entity.route && !parsed.content.includes(match[0])) throw new Error('候选包含尚不存在的站内路径：' + match[1]);
      }
      if (/!\[/.test(draft.body) && !parsed.content.includes(draft.body.match(/!\[[^\n]+/)?.[0] || '')) throw new Error('新增图片需要受控素材模板，本项隔离');
      const baseline = optimize ? existing.reviewedSources : Object.fromEntries(snapshots.map(s => [s.id, { hash: s.hash, commit: s.commit, path: s.path, version: knowledge.release.tag }]));
      const page = existing || { id: entity.articleId, route: entity.route, file: entity.file, sources: entity.sources, reviewedSources: {} };
      // Changes become one coherent article+answer+evidence unit only after independent verification.
      const candidate = { ...draft, pageId: page.id, rawBeforeHash: beforeHash, intentBeforeHash: hash(JSON.stringify(intent || null)), baseline, sourceRevision: observed.commit };
      await save(`.upstream/candidates/${page.id}.json`, candidate);
      if (apply) {
        if (existing) assertDocumentFresh(await readFile(file(existing.proseFile || existing.file), 'utf8'), beforeHash);
        if (hash(JSON.stringify(discovery.pages.find(p => p.id === page.id) || null)) !== candidate.intentBeforeHash) throw new Error('摘要发生修改，拒绝覆盖');
        const validation = { mode: draft.mode, checkedAt: draft.checkedAt, digest: contentDigest(draft.body, draft.answer, baseline), evidence: draft.evidence, teaching: draft.teaching };
        if (existing?.proseFile) await writeFile(file(page.proseFile), draft.body + '\n');
        else if (existing) {
          const front = splitDocument(raw).frontmatter.replace(/^status: .+$/m, 'status: "auto-checked"');
          await writeFile(file(page.file), front + '\n\n' + draft.body + '\n');
        } else {
          entity.title = draft.title; entity.question = draft.question;
          const data = { title: draft.title, description: draft.answer, contentId: page.id, kind: entity.type, sources: page.sources, appliesTo: entity.entries.join(' / ') + '；框架资料 ' + knowledge.release.tag + '；桌面版本另行确认', status: 'auto-checked', verification: '依据固定官方来源与独立模型核验；未执行登录、付费服务或桌面操作。' };
          await mkdir(dirname(file(page.file)), { recursive: true });
          await writeFile(file(page.file), matter.stringify(draft.body, data));
          pages.push(page);
        }
        page.reviewedSources = optimize ? page.reviewedSources : baseline;
        page.validation = validation;
        if (!optimize) { page.sourceVerifiedAt = draft.checkedAt; page.sourceVersion = knowledge.release.tag; }
        else page.optimization = task.revision;
        if (intent) intent.answer = draft.answer;
        else discovery.pages.push({ id: page.id, question: entity.question, answer: draft.answer, terms: [entity.title, entity.type] });
      } else pending.push(task);
      report.generated.push({ id: page.id, applied: apply });
      console.log(`知识单元通过：${page.id}。`);
    } catch (error) {
      pending.push(failedTask(task, error.message));
      report.skipped.push({ id: entity.articleId, reason: error.message });
      console.log(`知识任务延期：${entity.articleId}；${error.message}`);
      if (error.fatal) { pending.push(...tasks.slice(tasks.indexOf(task) + 1)); break; }
    }
  }
  await save('content/pages.json', pages);
  await save('content/knowledge.json', knowledge);
  await save('content/discovery.json', discovery);
  const remaining = pending.filter(task => {
    const page = pages.find(p => p.id === task.articleId);
    return !page || ['optimization', 'release-failed'].includes(task.reason) || page.sources.some(id => page.reviewedSources[id]?.hash !== observed.sources[id]?.hash);
  });
  await save('content/knowledge-queue.json', { schemaVersion: 1, tasks: remaining });
  const health = await json('content/sync-status.json');
  await save('content/sync-status.json', { ...health, lastAttempt: new Date().toISOString(), lastSuccess: new Date().toISOString(), result: 'success', upstreamCommit: observed.commit, pendingPageIds: remaining.map(t => t.articleId) });
  report.calls = budget.calls;
  await save('artifacts/knowledge-report.json', report);
  console.log(`知识更新：${report.generated.length} 篇合格，${report.skipped.length} 篇延期，${budget.calls} 次请求。`);
  return report;
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/knowledge-sync.mjs')) await syncKnowledge();
