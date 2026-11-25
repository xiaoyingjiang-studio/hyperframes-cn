import { posix } from 'node:path';
import { hash, request } from './io.mjs';

export function extractDependencies(text, path, treePaths) {
  const refs = [...text.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g)].map(m => m[1]);
  for (const match of text.matchAll(/\]\(([^\s)#]+)(?:#[^)]*)?\)/g)) {
    if (!/^(?:https?:|\/\/)/.test(match[1])) refs.push(match[1]);
  }
  return [...new Set(refs.map(ref => ref.startsWith('/') ? `docs${ref}` : posix.normalize(posix.join(posix.dirname(path), ref))).filter(p => /^(?:docs|skills)\//.test(p) && treePaths.has(p) && /\.(?:mdx?|jsx?|tsx?|json|txt)$/.test(p)))].sort();
}
export async function publishedRelease(repository, { fetcher = request, token = process.env.GITHUB_TOKEN } = {}) {
  const headers = { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const release = await (await fetcher(`https://api.github.com/repos/${repository}/releases/latest`, { headers })).json();
  if (release.draft || release.prerelease || !/^v?\d+\.\d+\.\d+$/.test(release.tag_name)) throw new Error('正式发布版本无效，保留旧站');
  return { tag: release.tag_name, publishedAt: release.published_at, url: release.html_url };
}
export async function collect(registry, { token = process.env.GITHUB_TOKEN, ref = 'main', fetcher = request } = {}) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'hyperframes-cn-content-sync', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const commit = await (await fetcher(`https://api.github.com/repos/${registry.repository}/commits/${encodeURIComponent(ref)}`, { headers })).json();
  if (!/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error('上游提交格式无效');
  const tree = await (await fetcher(`https://api.github.com/repos/${registry.repository}/git/trees/${commit.sha}?recursive=1`, { headers })).json();
  if (tree.truncated || !Array.isArray(tree.tree)) throw new Error('上游文件树不完整，停止同步');
  const blobs = tree.tree.filter(x => x.type === 'blob');
  const treePaths = new Set(blobs.map(x => x.path));
  const cache = new Map();
  async function raw(path) {
    if (!cache.has(path)) cache.set(path, fetcher(`https://raw.githubusercontent.com/${registry.repository}/${commit.sha}/${path}`).then(r => r.text()));
    return cache.get(path);
  }
  const sources = {};
  for (const source of registry.sources) {
    let path = source.path;
    if (!treePaths.has(path)) {
      const moved = source.blobSha && blobs.find(b => b.sha === source.blobSha);
      if (!moved) { sources[source.id] = { id: source.id, commit: commit.sha, path, deleted: true, hash: 'deleted', files: [] }; continue; }
      path = moved.path;
    }
    const files = [];
    const visited = new Set();
    async function visit(p) {
      if (visited.has(p)) return;
      if (visited.size >= 60) throw new Error('共享片段依赖过多，本项隔离并等待拆分');
      visited.add(p);
      const text = await raw(p);
      if (Buffer.byteLength(text) > 2 * 1024 * 1024) throw new Error('上游源文件过大，本项隔离');
      files.push({ path: p, text });
      for (const dep of extractDependencies(text, p, treePaths)) await visit(dep);
    }
    await visit(path);
    // A published skill is a bundle: reference Markdown can change without touching SKILL.md.
    const skill = path.match(/^(skills\/[^/]+)\/SKILL\.md$/);
    if (skill) for (const entry of blobs.filter(b => b.path.startsWith(skill[1] + '/') && b.path.endsWith('.md'))) await visit(entry.path);
    files.sort((a, b) => a.path.localeCompare(b.path));
    sources[source.id] = { id: source.id, commit: commit.sha, path, blobSha: blobs.find(b => b.path === path).sha, hash: hash(JSON.stringify(files)), files };
  }
  const index = blobs.filter(b => /^docs\/.*\.(md|mdx)$/.test(b.path) || /^skills\/.*\.(md|json)$/.test(b.path) || /^registry\/.*(?:\.json|SKILL\.md)$/.test(b.path) || /^(?:skills-manifest|package)\.json$/.test(b.path)).map(b => ({ path: b.path, blobSha: b.sha, url: `https://github.com/${registry.repository}/blob/${commit.sha}/${b.path}` }));
  return { commit: commit.sha, collectedAt: new Date().toISOString(), sources, index };
}
export function diffIndex(before, after) {
  const old = new Map(before.map(x => [x.path, x])); const fresh = new Map(after.map(x => [x.path, x]));
  const removed = before.filter(x => !fresh.has(x.path));
  const added = after.filter(x => !old.has(x.path));
  const moves = []; const matched = new Set();
  for (const entry of added) { const previous = removed.find(x => x.blobSha === entry.blobSha && !matched.has(x.path)); if (previous) { moves.push({ type: 'moved', path: entry.path, from: previous.path }); matched.add(previous.path); } }
  return [...moves, ...added.filter(x => !moves.some(m => m.path === x.path)).map(x => ({ type: 'added', path: x.path })), ...removed.filter(x => !matched.has(x.path)).map(x => ({ type: 'deleted', path: x.path })), ...after.filter(x => old.has(x.path) && old.get(x.path).blobSha !== x.blobSha).map(x => ({ type: 'modified', path: x.path }))];
}
export function affectedPages(pages, observed) {
  return pages.filter(p => p.sources.some(id => p.reviewedSources[id]?.hash !== observed.sources[id]?.hash));
}
