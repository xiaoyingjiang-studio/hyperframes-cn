import { test, expect } from '@playwright/test';
test('首页路径、案例和图片可用，页面无横向溢出',async({page},info)=>{
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toContainText('下一帧');
 await expect(page.getByRole('link',{name:'开始制作第一个视频'})).toHaveAttribute('href','/start/studio/');
 for (const image of await page.locator('img').all()) { await image.scrollIntoViewIfNeeded(); await expect.poll(()=>image.evaluate(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0)).toBeTruthy(); }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.goto('/');await page.screenshot({path:`artifacts/qa/home-${info.project.name}.png`});
});
for(const query of ['字幕','配音','中文字体','Codex','render'])test(`本地搜索：${query}`,async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'搜索网站'}).click();await page.getByRole('searchbox').fill(query);
 await expect(page.locator('#search-results a').first()).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
});
test('文档来源、目录和复制代码可用',async({page},info)=>{
 await page.goto('/start/cli/');await expect(page.locator('.source-meta')).toContainText('核对于');
 await expect(page.getByRole('heading',{level:1})).toContainText('CLI');
 await expect(page.locator('.source-meta a').first()).toHaveAttribute('href',/github\.com\/heygen-com\/hyperframes\/blob\/[a-f0-9]{40}\//);
 await expect(page.locator('.expressive-code button').first()).toBeAttached();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:`artifacts/qa/docs-${info.project.name}.png`});
});
test('案例按需加载视频，有字幕与实际媒体文件',async({page,request})=>{
 await page.goto('/showcase/chinese-explainer/');await expect(page.locator('video')).toHaveAttribute('preload','none');
 await expect(page.locator('track')).toHaveAttribute('srclang','zh');expect((await request.get('/media/chinese-explainer.mp4')).ok()).toBeTruthy();
});
test('明暗主题可切换且保留',async({page})=>{
 await page.goto('/');const before=await page.locator('html').getAttribute('data-theme');await page.getByRole('button',{name:'切换明暗主题'}).click();expect(await page.locator('html').getAttribute('data-theme')).not.toBe(before);await page.reload();expect(await page.locator('html').getAttribute('data-theme')).not.toBe(before);
});
test('文档明暗主题的主标题和当前导航有足够对比',async({page})=>{
 await page.goto('/start/cli/');
 for(const theme of ['light','dark']){
  await page.evaluate(t=>{document.documentElement.dataset.theme=t},theme);
  const ratios=await page.evaluate(()=>{
   const luminance=(color:string)=>{const channels=color.match(/[\d.]+/g)!.slice(0,3).map(Number).map(c=>{const s=c/255;return s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4)});return .2126*channels[0]+.7152*channels[1]+.0722*channels[2]};
   const contrast=(a:string,b:string)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
   const heading=getComputedStyle(document.querySelector('h1')!);const active=getComputedStyle(document.querySelector('a[href="/start/cli/"][aria-current="page"]')!);
   return [contrast(heading.color,getComputedStyle(document.body).backgroundColor),contrast(active.color,active.backgroundColor)];
  });
  expect(ratios[0]).toBeGreaterThanOrEqual(4.5);expect(ratios[1]).toBeGreaterThanOrEqual(4.5);
 }
});
test('未知页面真正返回 404，测试站不收录',async({page})=>{
 const response=await page.goto('/does-not-exist-9d6/');expect(response?.status()).toBe(404);await expect(page.getByRole('heading',{level:1})).toContainText('这一帧');
 await page.goto('/start/codex/');await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
});
