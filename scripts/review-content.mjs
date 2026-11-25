import { readFile, writeFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { json, save, file } from './lib/io.mjs';
const ids=process.argv.slice(2);
if(!ids.length)throw new Error('用法：node scripts/review-content.mjs <contentId> [contentId...]；先人工检查正文、命令和候选报告。');
const pages=await json('content/pages.json');const observed=await json('.upstream/observed.json');const status=await json('content/sync-status.json');
const registry=await json('content/sources.json');
for(const id of ids){
  const page=pages.find(p=>p.id===id);if(!page)throw new Error(`未知页面：${id}`);
  const raw=await readFile(file(page.file),'utf8');const {data}=matter(raw);
  const missing=page.sources.filter(s=>!observed.sources[s]||observed.sources[s].hash==='deleted');if(missing.length)throw new Error('来源删除或缺失，需要先人工修复映射');
  page.reviewedSources=Object.fromEntries(page.sources.map(s=>[s,{hash:observed.sources[s].hash,commit:observed.sources[s].commit,path:observed.sources[s].path}]));
  for (const source of registry.sources.filter(s=>page.sources.includes(s.id))) { source.path=observed.sources[source.id].path; if(observed.sources[source.id].blobSha)source.blobSha=observed.sources[source.id].blobSha; }
  const updated=raw.replace(/^reviewedAt: .+$/m,`reviewedAt: "${new Date().toISOString().slice(0,10)}"`).replace(/^status: .+$/m,`status: "${data.kind==='original'||data.kind==='case'?'practice':'reviewed'}"`);
  await writeFile(file(page.file),updated);
  status.pendingPageIds=status.pendingPageIds.filter(p=>p!==id);
  console.log(`已记录人工核对：${id}`);
}
await save('content/pages.json',pages);await save('content/sync-status.json',status);
await save('content/sources.json',registry);
