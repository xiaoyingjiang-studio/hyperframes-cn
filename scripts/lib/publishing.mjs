import { validateDraft } from './ai.mjs';
import { mechanisms, studioTopics, skillEntity, sectionOverview } from './knowledge-policy.mjs';
import { contentDigest } from './knowledge.mjs';
import matter from 'gray-matter';

const allowed = new Set(['content/pages.json', 'content/sources.json', 'content/discovery.json', 'content/knowledge.json', 'content/knowledge-queue.json', 'content/sync-status.json', '.upstream/observed.json', '.upstream/stable-index.json', '.upstream/main-index.json']);
export function assertContentPath(path, pages) {
  if (allowed.has(path)) return;
  if (/^\.upstream\/snapshots\/[a-z0-9-]+\/(?:[a-f0-9]{64}|deleted)\.json$/.test(path)) return;
  if (/^\.upstream\/candidates\/[a-z0-9-]+\.json$/.test(path)) return;
  if (pages.some(page => path === (page.proseFile || page.file) && path.endsWith('.md'))) return;
  throw new Error('内容流水线禁止修改：' + path);
}
export function assertStableRoutes(before, after, entities) {
  for (const old of before) {
    const current = after.find(page => page.id === old.id);
    if (!current || ['route', 'file', 'proseFile'].some(key => current[key] !== old[key])) throw new Error('禁止删除或更改既有页面地址：' + old.id);
  }
  for (const page of after.filter(page => !before.some(old => old.id === page.id))) {
    const entity = entities.find(entity => entity.articleId === page.id);
    if (!entity || entity.route !== page.route || entity.file !== page.file) throw new Error('新增页面没有知识实体');
    const fixed = [...mechanisms, ...studioTopics].find(e => e.id === entity.id) || (entity.id.startsWith('learn-') && entity.type === 'directory' ? sectionOverview(entity.section) : null);
    const expected = fixed || (entity.id.startsWith('skill-') ? skillEntity(entity.id.slice(6)) : entity.id.startsWith('capability-') ? { articleId: `capabilities-${entity.id.slice(11)}`, route: `/capabilities/${entity.id.slice(11)}/`, file: `src/content/docs/capabilities/${entity.id.slice(11)}.md` } : null);
    if (!expected || !/^[a-z0-9-]+$/.test(entity.id) || ['articleId', 'route', 'file'].some(key => expected[key] !== entity[key])) throw new Error('新增地址不符合固定规则');
  }
}
export function assertPublishedUnit(page, raw, answer) {
  const body = page.proseFile ? raw : matter(raw).content;
  validateDraft(body);
  if (page.validation?.mode !== 'independent-model-and-evidence' || page.validation.digest !== contentDigest(body, answer, page.reviewedSources)) throw new Error('改动正文缺少有效的独立核验记录：' + page.id);
}
export function assertHead(expected, actual) {
  if (!/^[a-f0-9]{40}$/.test(expected) || expected !== actual) throw new Error('提交已变化，旧检查结果失效');
}
export async function deployWithRecovery({ deploy, smoke, rollback, recordFailure }) {
  let deployed = false;
  try { deployed = true; const version = await deploy(); await smoke(); return version; }
  catch (error) {
    // Recording failures must never prevent recovery of production.
    let recordingError;
    try { await recordFailure(error); } catch (failure) { recordingError = failure; }
    if (deployed) { await rollback(); await smoke(); }
    if (recordingError) throw new AggregateError([error, recordingError], '发布失败且故障记录失败，生产恢复已尝试');
    throw error;
  }
}
