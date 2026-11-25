import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, writeFile, readFile, rm } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { root } from '../scripts/lib/io.mjs';
test('真实脚本闭环：新增、更新、失败隔离与第二次幂等运行', { timeout: 30000 }, async () => {
  const cache = resolve(root, '.cache'); await mkdir(cache, { recursive: true });
  const directory = await mkdtemp(resolve(cache, 'knowledge-flow-'));
  const write = async (name, body) => { const p = resolve(directory, name); await mkdir(dirname(p), { recursive: true }); await writeFile(p, body); };
  const save = (name, value) => write(name, JSON.stringify(value));
  const read = async name => JSON.parse(await readFile(resolve(directory, name), 'utf8'));
  try {
    await cp(resolve(root, 'scripts'), resolve(directory, 'scripts'), { recursive: true });
    const pages = ['good', 'failed'].map(id => ({ id, file: `src/content/docs/${id}.md`, route: `/${id}/`, sources: ['source'], reviewedSources: { source: { hash: 'old', commit: 'a'.repeat(40), path: 'docs/a.md' } } }));
    const original = '---\ntitle: 测试\ncontentId: good\nkind: tutorial\nsources: [source]\nreviewedAt: "2026-11-25"\nstatus: reviewed\n---\n\n原有正文。';
    for (const page of pages) await write(page.file, original.replace('contentId: good', `contentId: ${page.id}`));
    await save('content/pages.json', pages);
    await save('content/discovery.json', { pages: pages.map(p => ({ id: p.id, answer: '旧摘要'.repeat(20), question: p.id, terms: ['fixture', p.id] })) });
    await save('content/knowledge-queue.json', { tasks: [] });
    await save('content/sync-status.json', { pendingPageIds: [] });
    await write('content/glossary.md', '这是本地测试夹具，不代表官方功能或真实服务。');
    await write('run.mjs', `
      import {syncKnowledge} from './scripts/knowledge-sync.mjs';
      import {json} from './scripts/lib/io.mjs';
      const quote='The same project and assets are checked before publishing.';
      const snapshot={id:'source',hash:'fresh',commit:'b'.repeat(40),path:'docs/a.md',files:[{path:'docs/a.md',text:quote}]};
      let calls=0;
      const loadInventory=async()=>{const previous=await json('content/knowledge.json',{entities:[]});return{pages:await json('content/pages.json'),knowledge:{release:{tag:'v1.0.0'},entities:['good','failed','new'].map(id=>({id,articleId:id,title:id,question:id,type:'tutorial',file:'src/content/docs/'+id+'.md',route:'/'+id+'/',sources:['source'],entries:['cli-agent'],related:[],...previous.entities.find(e=>e.id===id)}))},observed:{commit:snapshot.commit,sources:{source:snapshot}}};};
      const request=async(input,{role})=>{calls++;if(role==='verify')return{supported:input.entity.id!=='failed',issues:input.entity.id==='failed'?['来源冲突']:[],evidence:[{sourceId:'source',path:'docs/a.md',quote,sections:['answer','检查结果']}]};return{title:'怎样检查项目与素材',question:'怎样在发布前检查同一项目与素材？',body:'依据同一项目与素材执行检查，明确适用条件与限制。'.repeat(20)+'\\n\\n## 检查结果\\n\\n检查画面和声音。',answer:'依据同一份项目与素材比较结果，检查内容、时序与声音。这里说明检查方法，不能把未执行的操作写成已经验证成功。',summary:'测试夹具更新'};};
      process.argv.push('--apply');
      await syncKnowledge({loadInventory,request});
      const first=calls;await syncKnowledge({loadInventory,request});
      if(calls!==first)throw Error('重复运行不应改写已完成或退避任务');
    `);
    await promisify(execFile)(process.execPath, ['run.mjs'], { cwd: directory, env: { ...process.env, GITHUB_REPOSITORY: '', GITHUB_TOKEN: '' }, windowsHide: true, timeout: 20000 });
    const result = await read('content/pages.json');
    assert.equal(result.length, 3);
    assert.match(await readFile(resolve(directory, 'src/content/docs/new.md'), 'utf8'), /title: 怎样检查项目与素材/);
    assert.equal((await read('content/knowledge.json')).entities.find(e => e.id === 'new').question, '怎样在发布前检查同一项目与素材？');
    assert.equal(result.find(p => p.id === 'good').validation.mode, 'independent-model-and-evidence');
    assert.equal(result.find(p => p.id === 'new').reviewedSources.source.hash, 'fresh');
    assert.equal(await readFile(resolve(directory, pages[1].file), 'utf8'), original.replace('contentId: good', 'contentId: failed'));
    assert.deepEqual((await read('content/knowledge-queue.json')).tasks.map(t => t.articleId), ['failed']);
    assert.match(await readFile(resolve(directory, pages[0].file), 'utf8'), /reviewedAt: "2026-11-25"/);
  } finally { assert.ok(directory.startsWith(cache + sep)); await rm(directory, { recursive: true, force: true }); }
});
