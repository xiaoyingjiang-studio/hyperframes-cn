import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectStudio, draftStudio, studioDigest, assertStudioGuide } from '../scripts/lib/studio-content.mjs';

const reportUrl = 'https://blog.youtube/news-and-events/example/';
const quote = 'Creators uploading Multi-language Audio tracks saw over 25% of watch time come from views in the non-primary language.';
const registry = {
  sources: [
    { id: 'audio', kind: 'html', url: reportUrl, label: 'YouTube' },
    { id: 'blocked-channel', kind: 'atom', channel: 'UCsXVk37bltHxD1rDPwtNM8Q', label: '频道' },
  ],
  topics: [{ slug: 'audio', section: '市场', question: '多语言音轨有怎样的观看空间？', required: ['audio'], keywords: ['audio'], evidenceTerms: ['watch time'] }],
};
const now = new Date('2026-11-28T00:00:00Z');
const fetcher = async url => url === reportUrl
  ? new Response(`<main><p>${quote}</p><p>These observations describe only the subset who uploaded audio during the recorded period.</p></main>`)
  : new Response('', { status: 503 });

test('source failure leaves independent topic available and repeat evidence keeps identical revision', async () => {
  const first = await collectStudio(registry, {}, { fetcher, now });
  assert.equal(first.topics.length, 1);
  assert.equal(first.report.find(row => row.id === 'blocked-channel').status, 'unavailable');
  const second = await collectStudio(registry, first.state, { fetcher, now });
  assert.equal(second.report.find(row => row.id === 'blocked-channel').status, 'waiting');
  assert.equal(second.topics[0].revision, first.topics[0].revision);
});

const answer = '平台披露的数字描述上传多语言音轨者的观看组成，可以用来理解跨语种观众的观看机会，具体到自己的作品仍需小范围验证。';
const body = '## 数据范围\n\n' + answer.repeat(4) + '\n\n## 如何先试\n\n' + answer.repeat(4);

test('independent rejection blocks fabricated gains and digest binds article, summary, and sources', async () => {
  const [topic] = (await collectStudio(registry, {}, { fetcher, now })).topics;
  const create = { title: '多语言音轨与海外观看机会', answer, body };
  let called = 0;
  await assert.rejects(draftStudio(topic, {
    call: async () => ++called % 2 ? { ...create, answer: answer + '所有频道流量增长四倍。' } : { supported: false, issues: ['观看占比不能写成流量增长'] },
  }), /独立核验未通过/);
  assert.equal(called, 4);
  called = 0;
  const draft = await draftStudio(topic, {
    call: async () => ++called % 2 ? create : { supported: true, issues: [], evidence: [{ sourceId: 'audio', paragraph: 0, sections: ['answer', '数据范围', '如何先试'] }] },
  });
  const guide = { slug: topic.slug, section: topic.section, sources: draft.sources, validation: { mode: 'independent-model-and-evidence', revision: topic.revision } };
  const intent = { title: draft.title, question: topic.question, answer };
  guide.validation.digest = studioDigest(guide, draft.body, intent);
  assert.doesNotThrow(() => assertStudioGuide(guide, draft.body, intent));
  assert.throws(() => assertStudioGuide(guide, draft.body, { ...intent, answer: answer + '保证增长。' }), /独立|有效核验/);
});
