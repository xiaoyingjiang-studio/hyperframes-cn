import { spawn } from 'node:child_process';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { file, save } from './lib/io.mjs';
const cli = file('node_modules/hyperframes/bin/hyperframes.mjs');
const ids = ['product-intro','chinese-explainer','data-story','footage-edit'];
const record = { date:new Date().toISOString(), platform:process.platform, node:process.version, hyperframes:'0.9.92', gsap:'3.15.1', notes:'无配音、无外部生成服务；嵌入 Noto Sans SC 教学字形子集，OFL 许可随附；示例数据明确标注。', examples:[] };
async function run(cmd,args,opts={}) { return await new Promise((resolve,reject)=>{ let out=''; const child=spawn(cmd,args,{cwd:file('.'),...opts,windowsHide:true}); child.stdout.on('data',x=>{out+=x;});child.stderr.on('data',x=>{out+=x;});child.on('error',reject);child.on('close',code=>{if(code===0)resolve(out);else reject(new Error(out.slice(-7000)));});}); }
await mkdir(file('public/media'),{recursive:true});
for(const id of ids){
  const entry={id,commands:[],status:'failed'};
  try{
    if(id==='footage-edit'){ await copyFile(file('public/media/product-intro.mp4'),file('examples/footage-edit/product-intro.mp4')); await copyFile(file('public/media/product-intro.mp4'),file('public/examples/footage-edit/product-intro.mp4')); }
    for(const command of ['lint','check']){ const args=[cli,command,`examples/${id}`]; const log=await run(process.execPath,args); entry.commands.push({command:`hyperframes ${command} examples/${id}`,passed:true,log:log.replace(/\x1b\[[0-9;]*m/g,'').slice(-10000)}); console.log(`${id}: ${command} passed`); }
    const output=file(`public/media/${id}.mp4`);
    const args=[cli,'render',`examples/${id}`,'--output',output,'--fps','30','--quality','standard','--workers','2'];
    const log=await run(process.execPath,args);entry.commands.push({command:`hyperframes render examples/${id} --output public/media/${id}.mp4 --fps 30 --quality standard --workers 2`,passed:true,log:log.replace(/\x1b\[[0-9;]*m/g,'').slice(-3000)});
    await run('ffmpeg',['-y','-ss',id==='footage-edit'?'4':'5.8','-i',output,'-frames:v','1','-q:v','2',file(`public/media/${id}.jpg`)]);
    const probe=await run('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name,width,height,r_frame_rate','-of','json',output]);entry.media=JSON.parse(probe);entry.status='passed';
    await writeFile(file(`public/media/${id}.vtt`),`WEBVTT\n\n00:00.000 --> 00:08.000\n${id==='chinese-explainer'?'写需求，看预览，改细节。一次讲清一个重点。':id==='data-story'?'示例数据：A 组 24，B 组 48，C 组 72；非产品指标。':id==='footage-edit'?'已有素材，继续编辑。素材来自本站原创片段。':'从一个想法，到一支视频。项目可以继续编辑。'}\n`);
    console.log(`${id}: rendered, probed, poster generated`);
  }catch(error){entry.error=error.message;console.error(`${id}: ${error.message}`);}
  record.examples.push(entry);await save('public/examples/verification.json',record);
}
if(record.examples.some(e=>e.status!=='passed'))process.exitCode=1;
