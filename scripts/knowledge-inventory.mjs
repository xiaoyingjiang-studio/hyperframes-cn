import { collect, publishedRelease, diffIndex, preserveIndexBaseline } from './lib/upstream.mjs';
import { json, save, request, hash } from './lib/io.mjs';
import { sections, mechanisms, studioTopics, skillEntity, sourceId, legacySection, connectKnowledge, capabilityTopics } from './lib/knowledge-policy.mjs';
import { archiveSnapshot } from './lib/snapshots.mjs';
import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { file } from './lib/io.mjs';

export async function inventory({ fetcher = request } = {}) {
  const registry = await json('content/sources.json');
  const pages = await json('content/pages.json');
  const previous = await json('content/knowledge.json', { entities: [] });
  const release = await publishedRelease(registry.repository, { fetcher });
  const manifestSource = { id: 'official-skills-manifest', path: 'skills-manifest.json', label: '正式 skills 发布清单' };
  if (!registry.sources.some(source => source.id === manifestSource.id)) registry.sources.push(manifestSource);
  const releaseRegistry = { ...registry, sources: [manifestSource] };
  const seed = await collect(releaseRegistry, { ref: release.tag, fetcher });
  const manifest = JSON.parse(seed.sources[manifestSource.id].files.find(f => f.path === manifestSource.path).text);
  const names = Object.keys(manifest.skills).sort();
  const entities = [...mechanisms, ...studioTopics, ...names.map(skillEntity)];
  // Discover official task guides and capabilities, instead of waiting for a hand-maintained mapping.
  entities.push(...capabilityTopics(seed.index, pages, previous.entities, registry, entities));
  const treePaths = new Set(seed.index.map(x => x.path));
  for (const entity of entities) {
    entity.sources = entity.paths.map(path => {
      const id = sourceId(path, registry);
      if (!registry.sources.some(s => s.id === id)) registry.sources.push({ id, path, label: path, url: `https://github.com/${registry.repository}/blob/${seed.commit}/${path}` });
      return id;
    });
    entity.available = entity.paths.every(path => treePaths.has(path));
    const old = previous.entities.find(e => e.id === entity.id);
    entity.related = old?.related || entity.related;
    entity.title = old?.title || entity.title;
    entity.question = old?.question || entity.question;
    if (old?.automation !== undefined) entity.automation = old.automation;
  }
  for (const page of pages) if (!entities.some(e => e.articleId === page.id)) {
    const old = previous.entities.find(e => e.articleId === page.id);
    entities.push({ ...old, id: old?.id || page.id, articleId: page.id, file: page.file, route: page.route, title: old?.title || page.id, type: old?.type || 'tutorial', section: old?.section || legacySection(page), sources: page.sources, entries: old?.entries || ['cli-agent'], related: old?.related || [], automation: !page.id.startsWith('community-') && !page.id.startsWith('updates-') && page.id !== 'knowledge' });
  }
  const observed = await collect(registry, { ref: release.tag, fetcher });
  for (const source of registry.sources) {
    const fresh = observed.sources[source.id];
    if (fresh && !fresh.deleted) { source.blobSha = fresh.blobSha; source.path = fresh.path; }
  }
  for (const entity of entities) {
    const page = pages.find(p => p.id === entity.articleId);
    if (page) entity.title = matter(await readFile(file(page.file), 'utf8')).data.title;
  }
  for (const snapshot of Object.values(observed.sources)) if (!snapshot.error) await archiveSnapshot({ ...snapshot, version: release.tag, channel: 'stable', collectedAt: observed.collectedAt });
  const main = await collect({ ...registry, sources: [] }, { fetcher });
  const previousMain = await json('.upstream/main-index.json', { entries: [] });
  const mainIndex = preserveIndexBaseline(previousMain, { commit: main.commit, entries: main.index });
  const ahead = diffIndex(observed.index, mainIndex.entries);
  connectKnowledge(entities);
  const knowledge = { schemaVersion: 1, release, sourceCommit: observed.commit, sections, publishedSkills: names, entities, preview: { commit: mainIndex.commit, changes: ahead, note: '公开主分支差异，不代表已正式发布或桌面应用已提供。' } };
  // Only material changes are committed by the publishing workflow; reports may carry timestamps.
  await save('content/knowledge.json', knowledge);
  await save('content/sources.json', registry);
  await save('.upstream/stable-index.json', { commit: observed.commit, entries: observed.index });
  await save('.upstream/main-index.json', mainIndex);
  await save('.upstream/observed.json', { commit: observed.commit, sources: Object.fromEntries(Object.entries(observed.sources).map(([id, s]) => [id, { hash: s.hash, commit: s.commit, path: s.path, blobSha: s.blobSha, version: release.tag }])) });
  await save('artifacts/inventory-report.json', { release, commit: observed.commit, observedMainCommit: main.commit, skills: names, sources: registry.sources.length, changes: diffIndex(previousMain.entries, main.index).length, fingerprint: hash(JSON.stringify(knowledge)) });
  return { registry, pages, knowledge, observed };
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/knowledge-inventory.mjs')) {
  const result = await inventory(); console.log(`知识盘点：${result.knowledge.release.tag}，${result.knowledge.publishedSkills.length} 项正式 skills，${result.knowledge.entities.length} 个知识主题。`);
}
