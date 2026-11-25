import test from 'node:test';
import assert from 'node:assert/strict';
import { diffIndex, affectedPages, extractDependencies, collect } from '../scripts/lib/upstream.mjs';
import { Budget, generateDraft, validateDraft, checkCommands, DraftError } from '../scripts/lib/ai.mjs';
import { hash } from '../scripts/lib/io.mjs';
import { applyCandidate } from '../scripts/lib/candidate.mjs';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
test('人工修改后拒绝候选覆盖；正常候选保留日期并标记待审',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'hyperframes-cn-test-'));const path=join(directory,'page.md');
 try {
  const raw='---\nstatus: "reviewed"\nreviewedAt: "2026-11-25"\n---\n\n原稿';await writeFile(path,raw);
  await writeFile(path,raw+'人工修改');await assert.rejects(applyCandidate(path,hash(raw),'模型改稿'),/拒绝覆盖/);assert.match(await readFile(path,'utf8'),/人工修改/);
  await writeFile(path,raw);await applyCandidate(path,hash(raw),'合法候选正文');const result=await readFile(path,'utf8');assert.match(result,/needs-review/);assert.match(result,/2026-11-25/);assert.match(result,/合法候选正文/);
 } finally { await rm(directory,{recursive:true,force:true}); }
});
test('识别新增、删除、修改与原样移动，移动不重复计数',()=>{
 const old=[{path:'old.mdx',blobSha:'a'},{path:'gone.mdx',blobSha:'b'},{path:'edit.mdx',blobSha:'c'}];
 const fresh=[{path:'new.mdx',blobSha:'a'},{path:'added.mdx',blobSha:'d'},{path:'edit.mdx',blobSha:'e'}];
 const result=diffIndex(old,fresh);assert.deepEqual(result.map(x=>x.type).sort(),['added','deleted','modified','moved']);
});
test('共享片段变化影响映射页面，不刷新无关文章',()=>{
 const pages=[{id:'one',sources:['intro'],reviewedSources:{intro:{hash:'old'}}},{id:'two',sources:['cli'],reviewedSources:{cli:{hash:'same'}}}];
 assert.deepEqual(affectedPages(pages,{sources:{intro:{hash:'new'},cli:{hash:'same'}}}).map(x=>x.id),['one']);
 assert.deepEqual(affectedPages(pages,{sources:{intro:{hash:'old'},cli:{hash:'same'}}}),[]);
});
test('共享片段只解析路径，拒绝源文件树以外的路径',()=>{
 const result=extractDependencies('import { X } from "/snippets/a.jsx"; import Y from "../../outside.js";', 'docs/guides/x.mdx',new Set(['docs/snippets/a.jsx']));assert.deepEqual(result,['docs/snippets/a.jsx']);
});
test('采集固定提交并递归纳入共享片段，源码只作为文本',async()=>{
 const sha='a'.repeat(40);const content={'docs/a.mdx':'import X from "/snippets/x.jsx";\nhello','docs/snippets/x.jsx':'export default () => { throw Error("must not execute") };'};
 const fetcher=async url=>({json:async()=>url.includes('/commits/')?{sha}:{tree:Object.keys(content).map(path=>({path,type:'blob',sha:hash(content[path])}))},text:async()=>content[url.split(`${sha}/`)[1]]});
 const result=await collect({repository:'example/upstream',sources:[{id:'a',path:'docs/a.mdx'}]},{fetcher});
 assert.equal(result.commit,sha);assert.equal(result.sources.a.files.length,2);assert.equal(result.sources.a.hash,hash(JSON.stringify(result.sources.a.files)));
});
test('缺少 AI 配置时跳过生成且不发请求',async()=>{
 const result=await generateDraft({},{env:{},fetcher:()=>{throw Error('must not call')}});assert.equal(result.skipped,true);
});
test('候选稿拒绝 HTML、模块代码和不安全链接',()=>{
 const prefix='这是一篇正文。'.repeat(30);for(const value of [`${prefix}\n<script>alert(1)</script>`,`${prefix}\nimport fs from "fs";`,`${prefix}[x](javascript:alert)`])assert.throws(()=>validateDraft(value));
 assert.equal(validateDraft(prefix),prefix);
});
test('命令校验允许官方新命令，拒绝模型杜撰参数',()=>{
 assert.deepEqual(checkCommands('npx hyperframes check\nnpx hyperframes render --invented','npx hyperframes lint','npx hyperframes check'),['npx hyperframes render --invented']);
});
const env={AI_ENDPOINT:'https://model.example/chat/completions',AI_MODEL:'test-model',AI_API_KEY:'not-a-real-secret',AI_MAX_TOTAL_TOKENS:'100000'};
test('认证错误立即停止，不重试，不回显响应正文',async()=>{
 let calls=0;await assert.rejects(generateDraft({},{env,fetcher:async()=>{calls++;return {ok:false,status:401}},sleep:async()=>{}}),e=>e instanceof DraftError&&e.fatal);assert.equal(calls,1);
});
test('限流最多重试两次，终止后报告上层停止生成',async()=>{
 let calls=0;await assert.rejects(generateDraft({},{env,fetcher:async()=>{calls++;return {ok:false,status:429}},sleep:async()=>{}}),e=>e.fatal);assert.equal(calls,3);
});
test('合法响应返回 Markdown 和用量；每次尝试计入预算',async()=>{
 const budget=new Budget(env);let calls=0;
 const result=await generateDraft({current:'原稿'},{env,budget,fetcher:async()=>{calls++;if(calls===1)return {ok:false,status:503};return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({body:'中文正文。'.repeat(35),summary:'更新步骤',checks:['核实安装版本']})}}],usage:{total_tokens:50}})}},sleep:async()=>{}});
 assert.equal(budget.calls,2);assert.equal(result.usage.total_tokens,50);assert.equal(result.summary,'更新步骤');
});
test('预算耗尽不发出请求',async()=>{
 let called=false;await assert.rejects(generateDraft({},{env:{...env,AI_MAX_CALLS:'0'},fetcher:()=>{called=true}}),e=>e.fatal);assert.equal(called,false);
});
