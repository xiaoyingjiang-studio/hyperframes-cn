import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { save } from './lib/io.mjs';
import { deployWithRecovery } from './lib/publishing.mjs';
const run = process.env.GITHUB_RUN_ID, attempt = process.env.GITHUB_RUN_ATTEMPT;
if (!/^\d+$/.test(run || '') || !/^\d+$/.test(attempt || '')) throw new Error('演练仅在受信 CI 中运行');
const name = `hyperframes-cn-rehearsal-${run}-${attempt}`;
const base = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${name}`;
const call = async (suffix, method = 'GET', body) => {
  const r = await fetch(base + suffix, { method, headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (['GET', 'DELETE'].includes(method) && r.status === 404) return null;
  const value = await r.json();
  if (!r.ok || !value.success) throw new Error(`隔离演练 API 失败（${r.status}）`);
  return value.result;
};
if (await call('/deployments')) throw new Error('演练 Worker 已存在，拒绝覆盖');
const directory = resolve('.cache/release-rehearsal'); await mkdir(directory, { recursive: true });
await writeFile(resolve(directory, 'wrangler.json'), JSON.stringify({ name, main: './index.mjs', compatibility_date: '2026-11-25', workers_dev: true }));
let url, created = false, recovered = false, phase = 'a';
const report = { name, productionUntouched: true, recovered: false, cleaned: false };
const deploy = async label => {
  await writeFile(resolve(directory, 'index.mjs'), `export default {fetch(){return new Response(${JSON.stringify(label)},{headers:{'X-Robots-Tag':'noindex'}})}};\n`);
  created = true;
  const log = execFileSync('pnpm', ['exec', 'wrangler', 'deploy', '--config', resolve(directory, 'wrangler.json')], { encoding: 'utf8', env: process.env });
  url = log.match(/https:\/\/[a-z0-9.-]+\.workers\.dev/)?.[0] || url;
  if (!url) throw new Error('没有返回演练地址');
  const deployments = await call('/deployments'); return (deployments.deployments || deployments)[0];
};
const check = async expected => {
  let actual;
  for (let i = 0; i < 5; i++) {
    actual = await (await fetch(url + `/?phase=${expected}-${i}`, { cache: 'no-store' })).text();
    if (actual === expected) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('隔离 Worker 的实际响应不匹配：' + expected);
};
try {
  const previous = await deploy('release-a'); await check('release-a');
  report.previous = previous.id;
  try {
    await deployWithRecovery({
      deploy: async () => { const current = await deploy('release-b'); report.failed = current.id; phase = 'b'; return current; },
      smoke: async () => { if (phase === 'b') { await check('release-b'); throw new Error('REHEARSAL_INJECTED_FAILURE'); } await check('release-a'); recovered = true; },
      recordFailure: async () => {},
      rollback: async () => { await call('/deployments', 'POST', { strategy: 'percentage', versions: previous.versions.map(v => ({ version_id: v.version_id, percentage: v.percentage })) }); phase = 'a'; },
    });
  } catch (error) { if (error.message !== 'REHEARSAL_INJECTED_FAILURE' || !recovered) throw error; }
  report.recovered = recovered;
  if (!recovered) throw new Error('没有观察到真实恢复');
  console.log('隔离 Worker 已实际验证：发布 A、发布 B、冒烟失败、恢复 A。');
} finally {
  if (created) { await call('', 'DELETE'); report.cleaned = true; }
  await save('artifacts/release-rehearsal.json', report);
}
