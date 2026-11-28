import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { json, save } from './lib/io.mjs';
import { deployWithRecovery, assertHead } from './lib/publishing.mjs';
const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
assertHead(process.env.RELEASE_SHA || process.env.GITHUB_SHA, sha);
// Do not deploy an older batch after a newer main update has won the production lock.
const main = execFileSync('git', ['ls-remote', 'origin', 'refs/heads/main'], { encoding: 'utf8' }).split(/\s/)[0];
assertHead(sha, main);
const url = process.env.SITE_URL;
if (!url?.startsWith('https://') || !account || !token) throw new Error('缺少正式部署配置');
const cf = async (method, body) => {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/${config.name}/deployments`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const value = await response.json();
  if (!response.ok || !value.success) throw new Error(`Cloudflare 部署 API 失败（${response.status}）`);
  return value.result;
};
const history = await cf('GET');
const previous = (history.deployments || history)[0];
if (!previous?.versions?.length) throw new Error('没有可恢复的已发布版本，自动发布停止');
const currentManifest = await json('dist/content-manifest.json');
let previousManifest;
try { const response = await fetch(new URL('/content-manifest.json', url)); if (!response.ok) throw Error(); previousManifest = await response.json(); }
catch { throw new Error('无法读取上次发布清单，保留当前站点'); }
const changed = currentManifest.pages.filter(page => page.validation && previousManifest.pages.find(p => p.id === page.id)?.contentHash !== page.contentHash);
const repo = process.env.GITHUB_REPOSITORY;
async function github(path, method, body) {
  const r = await fetch(`https://api.github.com/repos/${repo}/${path}`, { method, headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok && r.status !== 422) throw new Error(`故障记录失败（${r.status}）`);
}
let recovery = false;
await deployWithRecovery({
  deploy: async () => {
    execFileSync('pnpm', ['exec', 'wrangler', 'deploy', '--message', `site:${sha}`], { stdio: 'inherit', env: process.env });
    const deployed = await cf('GET');
    const latest = (deployed.deployments || deployed)[0];
    await save('artifacts/release.json', { sha, previous, deployment: latest, changed: changed.map(p => p.id) });
    return latest;
  },
  smoke: async () => {
    const legacy = recovery && previousManifest.pages.some(page => page.route === '/start/cli/');
    const handbook = !recovery || previousManifest.pages.some(page => page.route === '/creators/');
    execFileSync(process.execPath, ['scripts/smoke.mjs', url], { stdio: 'inherit', env: { ...process.env, SMOKE_LEGACY: String(legacy), SMOKE_HANDBOOK: String(handbook) } });
    const manifest = await (await fetch(new URL('/content-manifest.json', url), { cache: 'no-store' })).json();
    if (!recovery) assertHead(sha, manifest.buildSha);
  },
  recordFailure: async () => {
    await save('artifacts/release-failure.json', { sha, previous, failedDigests: changed.map(page => page.validation.digest), reason: '生产发布或线上冒烟失败' });
    for (const page of changed) await github('git/refs', 'POST', { ref: `refs/tags/knowledge-failure-${page.validation.digest}`, sha });
  },
  rollback: async () => {
    await cf('POST', { strategy: 'percentage', versions: previous.versions.map(v => ({ version_id: v.version_id, percentage: v.percentage })) });
    recovery = true;
    console.log('已恢复上一生产部署，开始恢复检查。');
  },
});
