import assert from 'node:assert/strict';

const base = process.argv[2] || process.env.SMOKE_URL || 'http://127.0.0.1:4321';
const legacy = process.env.SMOKE_LEGACY === 'true';
const handbook = !legacy && process.env.SMOKE_HANDBOOK !== 'false';
const common = [['/', 200], ['/sitemap.xml', 200], ['/robots.txt', 200], ['/llms.txt', 200], ['/content-manifest.json', 200], ['/not-a-real-page-9d6/', 404]];
const routes = legacy
  ? [['/start/cli/', 200], ['/showcase/', 200], ['/content/start-cli.md', 200]]
  : [['/media/xiaoyingjiang-creator.webp', 200], ['/content/studio-home.md', 200], ['/hyperframes/', 404], ['/start/cli/', 404], ['/content/start-cli.md', 404]];
if (handbook) routes.push(['/creators/', 200], ['/creators/readiness/', 200], ['/creators/mandarin-video-localization/', 200], ['/creators/subtitles-or-dubbing/', 200]);
for (const [path, expected] of [...common, ...routes]) {
  const response = await fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, expected, `${path} 状态不符`);
  if (path === '/content-manifest.json' && !legacy) {
    const manifest = await response.json();
    assert.equal(manifest.publisher, '小影匠工作室');
    assert.ok(manifest.pages.some(page => page.id === 'studio-home' && page.route === '/'));
    assert.ok(!manifest.pages.some(page => page.id === 'home' || page.route === '/start/cli/'));
  }
  console.log(`${response.status} ${path}`);
}

if (process.env.SITE_INDEXABLE === 'true' && process.env.OLD_DEFAULT_HOST) {
  for (const path of ['/', '/start/cli/?from=legacy']) {
    const response = await fetch(`https://${process.env.OLD_DEFAULT_HOST}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 301, `旧主机迁移状态不符：${path}`);
    assert.equal(response.headers.get('location'), new URL(path, base).href, `旧主机迁移地址不符：${path}`);
    console.log(`301 legacy ${path}`);
  }
}
