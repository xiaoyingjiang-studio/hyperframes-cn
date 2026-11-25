const base = process.argv[2] || process.env.SMOKE_URL || 'http://localhost:4321';
for (const [path, expected] of [['/',200],['/start/cli/',200],['/showcase/',200],['/pagefind/pagefind.js',200],['/media/product-intro.mp4',200],['/sitemap.xml',200],['/robots.txt',200],['/llms.txt',200],['/content/start-cli.md',200],['/content-manifest.json',200],['/not-a-real-page-9d6/',404]]) {
  const r = await fetch(new URL(path,base),{signal:AbortSignal.timeout(20000)});
  if(r.status!==expected) throw new Error(`${path}: ${r.status}，预期 ${expected}`);
  console.log(`${r.status} ${path}`);
}
