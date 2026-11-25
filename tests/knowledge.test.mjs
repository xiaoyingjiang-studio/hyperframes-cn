import test from 'node:test';
import assert from 'node:assert/strict';
import { eligibleQueue, failedTask, createVerifiedArticle, validateEvidence, classifySource, contentDigest, requestKnowledge } from '../scripts/lib/knowledge.mjs';
import { assertContentPath, assertStableRoutes, assertHead, deployWithRecovery, assertPublishedUnit } from '../scripts/lib/publishing.mjs';
import { Budget } from '../scripts/lib/ai.mjs';
import { publishedRelease, extractDependencies, collect } from '../scripts/lib/upstream.mjs';
const quote = 'The preview and export use the same project and assets.';
const snapshots = [{ id: 'source', files: [{ path: 'docs/test.md', text: quote }] }];
const draft = { body: '依据项目与素材检查画面和导出。'.repeat(15) + '\n\n## 检查结果\n\n逐项比较实际文件。', answer: '依据同一份项目与素材比较预览和导出，检查内容、时序与声音。这里只说明检查方法，不能把未执行的导出写成已经验证成功。', summary: '说明创作检查方法' };
const evidence = [{ sourceId: 'source', path: 'docs/test.md', quote, sections: ['answer', '检查结果'] }];
const input = { current: '旧稿', currentAnswer: '旧摘要', snapshots };

test('来源证据必须真实存在且覆盖摘要与每个章节', () => {
  assert.doesNotThrow(() => validateEvidence(evidence, snapshots, draft.body, draft.answer));
  for (const records of [[], [{ ...evidence[0], quote: '模型编造的英文引用并不在任何实际的来源文件中' }], [{ ...evidence[0], sections: ['answer'] }]]) assert.throws(() => validateEvidence(records, snapshots, draft.body, draft.answer));
});
test('写作和核验是独立请求，拒绝只凭生成者自评发布', async () => {
  const roles = [];
  const result = await createVerifiedArticle(input, { request: async (_, { role }) => { roles.push(role); return role === 'write' ? draft : { supported: true, issues: [], evidence }; } });
  assert.deepEqual(roles, ['write', 'verify']); assert.equal(result.mode, 'independent-model-and-evidence');
  await assert.rejects(createVerifiedArticle(input, { request: async (_, { role }) => role === 'write' ? draft : { supported: true, issues: [], evidence: [] } }), /证据/);
});
test('核验失败最多修订一次，第二次失败自动隔离', async () => {
  let writes = 0, verifies = 0;
  await assert.rejects(createVerifiedArticle(input, { request: async (_, { role }) => { if (role === 'write') { writes++; return draft; } verifies++; return { supported: false, issues: ['账号条件没有来源'] }; } }), /独立核验未通过/);
  assert.equal(writes, 2); assert.equal(verifies, 2);
});
test('同一批中失败文章不阻止另一篇通过核验', async () => {
  const accepted = [], pending = [];
  for (const id of ['failed', 'good']) {
    try { await createVerifiedArticle(input, { request: async (_, { role }) => role === 'write' ? draft : { supported: id === 'good', issues: id === 'good' ? [] : ['证据冲突'], evidence } }); accepted.push(id); }
    catch { pending.push(id); }
  }
  assert.deepEqual(accepted, ['good']); assert.deepEqual(pending, ['failed']);
});
test('新页、来源失效优先，失败退避到期后可重试，修复后不重复生成', () => {
  const entities = [{ id: 'old', articleId: 'old', sources: ['a'] }, { id: 'new', articleId: 'new', sources: ['a'] }];
  const observed = { sources: { a: { hash: 'fresh' } } };
  const pages = [{ id: 'old', reviewedSources: { a: { hash: 'previous' } } }];
  const now = new Date('2026-11-25T00:00:00Z');
  const tasks = eligibleQueue(entities, pages, observed, [], now);
  assert.deepEqual(tasks.map(t => t.reason), ['source-changed', 'missing']);
  const failed = failedTask(tasks[0], '无模型', now);
  assert.equal(eligibleQueue([entities[0]], pages, observed, [failed], now).length, 0);
  assert.equal(eligibleQueue([entities[0]], pages, observed, [failed], new Date('2026-11-27')).length, 1);
  pages[0].reviewedSources.a.hash = 'fresh';
  assert.equal(eligibleQueue([entities[0]], pages, observed, [], now).length, 0);
});
test('缺少模型不发请求，写作与核验共享调用和Token上限', async () => {
  let calls = 0; const fetcher = async () => { calls++; return { ok: true, json: async () => ({ choices: [{ message: { content: '{}' } }] }) }; };
  await assert.rejects(requestKnowledge({}, { env: {}, fetcher }), /未配置/); assert.equal(calls, 0);
  const env = { AI_ENDPOINT: 'https://test.example/api', AI_MODEL: 'fixture', AI_API_KEY: 'fixture', AI_MAX_CALLS: '1' };
  const budget = new Budget(env);
  await requestKnowledge({}, { env, budget, fetcher });
  await assert.rejects(requestKnowledge({}, { env, budget, fetcher, role: 'verify' }), /预算/); assert.equal(calls, 1);
});
test('正式版不能接受草稿或预发布，skills 分类不混入仓库内部文件', async () => {
  await assert.rejects(publishedRelease('fixture/repo', { fetcher: async () => ({ json: async () => ({ tag_name: 'v1.0.0', prerelease: true }) }) }), /正式发布/);
  assert.equal(classifySource('skills/media-use/SKILL.md', ['media-use']), 'published-skill');
  assert.equal(classifySource('.agents/skills/private/SKILL.md', ['media-use']), 'repository-internal');
  assert.equal(classifySource('registry/blocks/item/SKILL.md'), 'resource-instructions');
});
test('skill 引用材料变化进入依赖，不越出官方文件树', () => {
  assert.deepEqual(extractDependencies('[规则](references/rules.md) [逃逸](../../outside.md)', 'skills/a/SKILL.md', new Set(['skills/a/references/rules.md', 'outside.md'])), ['skills/a/references/rules.md']);
});
test('只改 skill 的参考文件也会改变来源指纹', async () => {
  let reference = '原有参考内容'; const sha = 'a'.repeat(40);
  const contents = () => ({ 'skills/a/SKILL.md': '公开技能定义，没有 Markdown 链接。', 'skills/a/references/rules.md': reference });
  const fetcher = async url => ({ json: async () => url.includes('/commits/') ? { sha } : { tree: Object.keys(contents()).map(path => ({ path, type: 'blob', sha: path })) }, text: async () => contents()[url.split(sha + '/')[1]] });
  const registry = { repository: 'fixture/repo', sources: [{ id: 'skill-a', path: 'skills/a/SKILL.md' }] };
  const first = await collect(registry, { fetcher }); reference = '已变化的参考内容';
  const second = await collect(registry, { fetcher });
  assert.notEqual(first.sources['skill-a'].hash, second.sources['skill-a'].hash);
  assert.equal(second.sources['skill-a'].files.length, 2);
});
test('正文、摘要或来源改变均使旧校验失效', () => {
  const sources = { source: { hash: 'a', commit: 'b' } };
  const page = { id: 'test', reviewedSources: sources, validation: { mode: 'independent-model-and-evidence', digest: contentDigest(draft.body, draft.answer, sources) } };
  const raw = '---\nstatus: auto-checked\n---\n\n' + draft.body;
  assert.doesNotThrow(() => assertPublishedUnit(page, raw, draft.answer));
  assert.throws(() => assertPublishedUnit(page, raw + '变化', draft.answer));
  assert.throws(() => assertPublishedUnit(page, raw, draft.answer + '变化'));
});
test('内容流水线拒绝代码、工作流、预算、许可及任意新地址', () => {
  const pages = [{ id: 'a', file: 'src/content/docs/a.md', route: '/a/' }];
  assert.doesNotThrow(() => assertContentPath(pages[0].file, pages));
  for (const path of ['.github/workflows/deploy.yml', 'site.config.json', 'content/discovery-policy.json', 'LICENSE', 'scripts/x.mjs']) assert.throws(() => assertContentPath(path, pages));
  assert.throws(() => assertStableRoutes(pages, [{ ...pages[0], route: '/changed/' }], []));
  assert.throws(() => assertStableRoutes([], [{ id: 'evil', file: 'src/pages/x.astro', route: '/x/' }], [{ id: 'evil', articleId: 'evil', file: 'src/pages/x.astro', route: '/x/' }]));
});
test('准确提交校验拒绝过期测试结果', () => {
  assert.doesNotThrow(() => assertHead('a'.repeat(40), 'a'.repeat(40)));
  assert.throws(() => assertHead('a'.repeat(40), 'b'.repeat(40)));
});
test('线上失败自动回滚并再次检查，故障记录失败也不能阻止恢复', async () => {
  const actions = []; let checks = 0;
  await assert.rejects(deployWithRecovery({ deploy: async () => actions.push('deploy'), smoke: async () => { actions.push('smoke'); if (++checks === 1) throw Error('broken'); }, rollback: async () => actions.push('rollback'), recordFailure: async () => { actions.push('record'); throw Error('record unavailable'); } }));
  assert.deepEqual(actions, ['deploy', 'smoke', 'record', 'rollback', 'smoke']);
});
