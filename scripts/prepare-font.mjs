import { writeFile, readFile, mkdir, copyFile } from 'node:fs/promises';
import { request, file } from './lib/io.mjs';
await mkdir(file('.cache/fonts'),{recursive:true});
const ids=['product-intro','chinese-explainer','data-story','footage-edit'];
let text='';for(const id of ids)text+=await readFile(file(`examples/${id}/index.html`),'utf8');
text=[...new Set((text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,'')+'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789，。；：、！？（） /·→').split(''))].join('');
const css=await (await request(`https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@600&text=${encodeURIComponent(text)}`)).text();
const url=css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
if(!url)throw new Error('未取得官方字体子集地址');
const font=await request(url);await writeFile(file('examples/shared/font.ttf'),Buffer.from(await font.arrayBuffer()));
const license=await (await request('https://api.github.com/repos/google/fonts/contents/ofl/notosanssc/OFL.txt',{headers:{'User-Agent':'hyperframes-cn'}})).json();
await writeFile(file('.cache/fonts/OFL.txt'),Buffer.from(license.content,'base64'));
for(const dest of ['examples/shared','public/examples/shared',...ids.flatMap(id=>[`examples/${id}`,`public/examples/${id}`])]){
  await mkdir(file(dest),{recursive:true});
  if(dest!=='examples/shared')await copyFile(file('examples/shared/font.ttf'),file(`${dest}/font.ttf`));
  await copyFile(file('.cache/fonts/OFL.txt'),file(`${dest}/OFL.txt`));
}
console.log('已从官方 Google Fonts 来源准备 Noto Sans SC 教学子集，并保留 OFL。');
