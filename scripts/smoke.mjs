const base = process.argv[2] || process.env.SMOKE_URL || 'http://localhost:4321';
for (const [path, expected] of [['/',200],['/start/cli/',200],['/showcase/',200],['/pagefind/pagefind.js',200],['/media/product-intro.mp4',200],['/sitemap.xml',200],['/robots.txt',200],['/llms.txt',200],['/content/start-cli.md',200],['/content-manifest.json',200],['/not-a-real-page-9d6/',404]]) {
  const r = await fetch(new URL(path,base),{signal:AbortSignal.timeout(20000)});
  if(r.status!==expected) throw new Error(`${path}: ${r.status}，预期 ${expected}`);
  console.log(`${r.status} ${path}`);
}
if (process.env.SITE_INDEXABLE === 'true' && process.env.OLD_DEFAULT_HOST) {
  for (const path of ['/', '/start/cli/?from=legacy']) {
    const response = await fetch(`https://${process.env.OLD_DEFAULT_HOST}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    if (response.status !== 301 || response.headers.get('location') !== new URL(path, base).href)
      throw new Error(`旧入口迁移未生效：${path}`);
    console.log(`301 legacy ${path}`);
  }
}
