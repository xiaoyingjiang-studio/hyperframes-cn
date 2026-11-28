import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { file, json, save } from './lib/io.mjs';
import { failedTask } from './lib/knowledge.mjs';
import { Budget, collectStudio, configured, draftStudio, regionalTopic, studioDigest, studioSlug } from './lib/studio-content.mjs';

const mode = process.env.STUDIO_MODE || 'collect';
const preferred = process.env.STUDIO_PREFERENCE || '市场';
const target = process.env.STUDIO_TOPIC || '';
if (!['collect', 'preview', 'publish'].includes(mode) || !['市场', '案例'].includes(preferred) || target && !studioSlug.test(target)) throw new Error('无效的手册任务参数');
const registry = await json('content/studio-sources.json');
if (target && !registry.topics.some(topic => topic.slug === target) && !regionalTopic(target)) throw new Error('手册主题未登记');
const now = new Date();
const guides = await json('content/creator-guides.json');
const discovery = await json('content/discovery.json');
const previous = await json('artifacts/studio-state.json', {});
await mkdir(file('artifacts'), { recursive: true });
const batch = await collectStudio(registry, previous, { now, published: guides });
const { topics, state } = batch;
const budget = new Budget();
const report = { mode, preferred, target, observedAt: now.toISOString(), sources: batch.report, signals: batch.signals, articles: [], calls: 0 };
const topicsByPriority = [...topics].sort((a, b) => Number(b.section === preferred) - Number(a.section === preferred));
if (mode !== 'collect' && !configured()) report.ai = '缺少 AI 配置，材料已采集';
if (mode !== 'collect' && configured()) {
  for (const topic of topicsByPriority) {
    if (target && topic.slug !== target) continue;
    const guide = guides.find(row => row.slug === topic.slug);
    const previousTask = state.tasks[topic.slug];
    if (guide?.validation?.revision === topic.revision || guide && state.processed[topic.slug] === topic.revision) {
      delete state.tasks[topic.slug];
      report.articles.push({ slug: topic.slug, status: 'unchanged' });
      continue;
    }
    if (guide?.sources.some(source => !topic.evidence.some(entry => entry.url === source.url))) {
      report.articles.push({ slug: topic.slug, status: 'waiting-for-sources' });
      continue;
    }
    if (previousTask?.revision === topic.revision && previousTask.nextAttemptAt > now.toISOString() && mode === 'publish') {
      report.articles.push({ slug: topic.slug, status: 'waiting', retryAt: previousTask.nextAttemptAt });
      continue;
    }
    const path = `src/content/creators/${topic.slug}.md`;
    const existing = guide ? await readFile(file(path), 'utf8') : '';
    try {
      const draft = await draftStudio(topic, {
        existing,
        questions: discovery.pages.filter(row => row.id !== `creator-${topic.slug}`).map(row => row.question),
        budget,
      });
      const id = `creator-${topic.slug}`;
      const intent = {
        id, title: draft.title, question: topic.question, answer: draft.answer,
        terms: [topic.question, topic.section === '市场' ? '海外创作者市场' : '海外创作者案例'],
      };
      const next = topic.next.filter(slug => guides.some(row => row.slug === slug));
      const updated = { slug: topic.slug, section: topic.section, next, sources: draft.sources, validation: { mode: 'independent-model-and-evidence', checkedAt: now.toISOString(), revision: topic.revision } };
      if (guide?.reviewedAt) updated.reviewedAt = guide.reviewedAt;
      updated.validation.digest = studioDigest(updated, draft.body, intent);
      delete state.tasks[topic.slug];
      if (guide?.validation?.digest === updated.validation.digest) {
        state.processed[topic.slug] = topic.revision;
        report.articles.push({ slug: topic.slug, status: 'unchanged' });
        continue;
      }
      delete state.processed[topic.slug];
      report.articles.push({ slug: topic.slug, status: mode === 'publish' ? 'ready-to-publish' : 'previewed', revision: topic.revision, digest: updated.validation.digest });
      if (mode === 'preview') {
        await writeFile(file(`artifacts/studio-${topic.slug}.md`), draft.body);
        await save(`artifacts/studio-${topic.slug}.json`, { guide: updated, intent });
      } else {
        const replace = (items, key, value) => {
          const index = items.findIndex(item => item[key] === value[key]);
          if (index < 0) items.push(value);
          else items[index] = value;
        };
        replace(guides, 'slug', updated);
        replace(discovery.pages, 'id', intent);
        await writeFile(file(path), draft.body);
        await save('content/creator-guides.json', guides);
        await save('content/discovery.json', discovery);
      }
      break;
    } catch (error) {
      const reason = error instanceof SyntaxError ? '模型 JSON 响应不合格' : error.message;
      const failure = failedTask({ slug: topic.slug, revision: topic.revision, attempts: previousTask?.revision === topic.revision ? previousTask.attempts : 0 }, reason, now);
      state.tasks[topic.slug] = failure;
      report.articles.push({ slug: topic.slug, status: 'deferred', reason, retryAt: failure.nextAttemptAt });
      if (error.fatal) break;
    }
  }
}
report.calls = budget.calls;
await save('artifacts/studio-state.json', state);
await save('artifacts/studio-content-report.json', report);
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `## 小影匠内容采集 · ${mode}\n\n- 模型请求：${report.calls}\n- 可用来源：${batch.report.filter(row => ['observed', 'unchanged'].includes(row.status)).length} / ${batch.report.length}\n- 文章结果：${report.articles.map(row => row.slug + ' ' + row.status).join('，') || '本轮无新稿'}\n\n`);
}
console.log(JSON.stringify({ mode, calls: report.calls, sources: report.sources, articles: report.articles }));
if (mode === 'preview' && !report.articles.some(row => ['previewed', 'unchanged'].includes(row.status))) process.exitCode = 1;
if (mode === 'collect' && batch.report.every(row => !['observed', 'unchanged'].includes(row.status))) process.exitCode = 1;
