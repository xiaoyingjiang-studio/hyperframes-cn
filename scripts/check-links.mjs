import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { json, file } from './lib/io.mjs';
const pages=await json('content/pages.json');const urls=new Set();
for(const page of pages){const text=await readFile(file(page.file),'utf8');for(const m of text.matchAll(/https:\/\/[^\s)"<>]+/g))urls.add(m[0]);}
const result=[];
for(const url of urls){try{const r=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(12000)});result.push({url,status:r.status,ok:r.ok,transient:[403,429].includes(r.status)});}catch{result.push({url,status:'network-error',ok:false,transient:true});}}
await mkdir(file('artifacts'),{recursive:true});await writeFile(file('artifacts/external-links.json'),JSON.stringify({date:new Date().toISOString(),results:result},null,2));
console.log(`检查 ${result.length} 个外链，${result.filter(x=>!x.ok).length} 个需人工核对（403/429 不直接判断链接失效）。`);
if(process.argv.includes('--strict')&&result.some(x=>!x.ok&&!x.transient))process.exitCode=1;
