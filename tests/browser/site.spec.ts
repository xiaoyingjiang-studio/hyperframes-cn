import { test, expect } from '@playwright/test';
test('Studio 首页下载、案例和图片可用，页面无横向溢出',async({page},info)=>{
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toContainText('把想法做成视频');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await expect(page.locator('.studio-product')).toHaveText('HyperFrames Studio');
 for (const link of await page.getByRole('link',{name:'下载 Studio',exact:true}).all()) await expect(link).toHaveAttribute('href','https://hyperframes.studio/studio/download');
 await page.getByRole('link',{name:'查看作品',exact:true}).click();await expect(page).toHaveURL(/#works$/);
 await expect(page.locator('#works')).toBeInViewport();
 await expect(page.locator('.studio-work')).toHaveCount(4);
 for (const image of await page.locator('img:visible').all()) { await image.scrollIntoViewIfNeeded(); await expect.poll(()=>image.evaluate(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0)).toBeTruthy(); }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:`artifacts/qa/home-${info.project.name}.png`,animations:'disabled'});
 await page.screenshot({path:`artifacts/qa/home-full-${info.project.name}.png`,fullPage:true,animations:'disabled'});
});
test('首页加载本地可变字体，标题使用中等字重',async({page})=>{
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 const font=await page.locator('h1').evaluate(element=>{const style=getComputedStyle(element);return {family:style.fontFamily,weight:style.fontWeight,size:parseFloat(style.fontSize),loaded:[...document.fonts].some(face=>face.family==='Studio Sans'&&face.status==='loaded')};});
 expect(font.family).toContain('Studio Sans');expect(font.loaded).toBeTruthy();expect(font.weight).toBe('500');expect(font.size).toBeLessThanOrEqual(56);
});
test('减少动态效果时正文可见、无入场或跟随动画',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await page.locator('.studio-work').first().scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length)).toBe(0);
 await page.goto('/');await expect(page.locator('.studio-title-fragment').first()).toHaveCSS('opacity','1');
 await expect(page.locator('.studio-title-fragment').first()).toHaveCSS('transform','none');
 await expect(page.locator('.studio-play')).toHaveCSS('transform','none');
});
test('桌面导航高亮跟随鼠标与键盘焦点',async({page},info)=>{
 test.skip(info.project.name!=='desktop','桌面导航交互');
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 const nav=page.getByRole('navigation',{name:'主导航',exact:true});const indicator=nav.locator('.studio-nav-indicator');
 const initial=await indicator.evaluate(element=>(element as HTMLElement).style.transform);
 await nav.getByRole('link',{name:'作品',exact:true}).hover();
 await expect.poll(()=>indicator.evaluate(element=>(element as HTMLElement).style.transform)).not.toBe(initial);
 await nav.getByRole('link',{name:'中文指南',exact:true}).focus();
 await expect.poll(()=>indicator.evaluate(element=>parseFloat((element as HTMLElement).style.width))).toBeGreaterThan(0);
});
for(const query of ['字幕','配音','中文字体','Codex','render'])test(`本地搜索：${query}`,async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'搜索网站'}).click();await page.getByRole('searchbox').fill(query);
 await expect(page.locator('#search-results a').first()).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#site-search')).not.toBeVisible();
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
test('首页主题独立保存，进入首页不覆盖文档主题偏好',async({page})=>{
 await page.goto('/start/cli/');await page.evaluate(()=>localStorage.setItem('starlight-theme','dark'));
 await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'切换明暗主题'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'切换明暗主题'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 expect(await page.evaluate(()=>localStorage.getItem('starlight-theme'))).toBe('dark');
 await page.goto('/start/cli/');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'切换明暗主题'}).click();await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
test('手机公共导航可展开、跳转并用 Escape 关闭',async({page},info)=>{
 test.skip(info.project.name!=='mobile','仅验证手机导航');
 for(const path of ['/','/start/studio/']){
  await page.goto(path);const menu=page.locator('.mobile-navigation');await menu.locator('summary').click();
  await expect(menu).toHaveAttribute('open','');
  await expect(page.getByRole('navigation',{name:'移动主导航'}).getByRole('link',{name:'下载 Studio'})).toHaveAttribute('href','https://hyperframes.studio/studio/download');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.keyboard.press('Escape');await expect(menu).not.toHaveAttribute('open');await expect(menu.locator('summary')).toBeFocused();
 }
 await page.locator('.mobile-navigation summary').click();await page.getByRole('navigation',{name:'移动主导航'}).getByRole('link',{name:'作品',exact:true}).click();await expect(page).toHaveURL(/\/showcase\/$/);
});
test('首页视频在用户播放前不请求 MP4，播放后时间推进',async({page})=>{
 const mediaRequests:string[]=[];page.on('request',request=>{if(request.url().endsWith('.mp4'))mediaRequests.push(request.url());});
 await page.goto('/');const video=page.locator('#studio-preview');await expect(video).toHaveAttribute('preload','none');
 await expect(video).not.toHaveAttribute('autoplay');await expect(video.locator('source')).toHaveAttribute('src','/media/studio-first-video.mp4');
 await expect(page.locator('#studio-preview-caption')).toContainText('等待过程已加速');
 const play=page.getByRole('button',{name:'播放 Studio 官方创作演示'});await play.scrollIntoViewIfNeeded();expect(mediaRequests).toHaveLength(0);
 await play.click();await expect(play).toBeHidden();await expect(video).toBeVisible();
 await expect.poll(()=>video.evaluate(el=>(el as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
 expect(mediaRequests.length).toBeGreaterThan(0);
});

test('创作流程支持键盘切换，真实界面图片均可读取',async({page})=>{
 await page.goto('/');
 const tabs=page.getByRole('tablist',{name:'Studio 创作步骤'}).getByRole('tab');
 await expect(tabs).toHaveCount(3);
 await tabs.nth(0).click();
 for(let index=0;index<3;index++){
  await expect(tabs.nth(index)).toHaveAttribute('aria-selected','true');
  const panel=page.getByRole('tabpanel');await expect(panel).toBeVisible();
  await expect(panel).toContainText(['描述想法','预览修改','导出作品'][index]);
  const image=panel.locator('img');await image.scrollIntoViewIfNeeded();
  await expect.poll(()=>image.evaluate(img=>(img as HTMLImageElement).naturalWidth>0)).toBeTruthy();
  if(index<2){await tabs.nth(index).focus();await page.keyboard.press('ArrowRight');await expect(tabs.nth(index+1)).toBeFocused();}
 }
 await page.keyboard.press('Home');await expect(tabs.nth(0)).toBeFocused();await expect(tabs.nth(0)).toHaveAttribute('aria-selected','true');
 await page.keyboard.press('End');await expect(tabs.nth(2)).toBeFocused();await expect(tabs.nth(2)).toHaveAttribute('aria-selected','true');
});

test('作品按点击加载，关闭播放层停止媒体并恢复焦点',async({page})=>{
 const requests:string[]=[];
 page.on('request',request=>{if(request.url().includes('/homepage/showcase/hq/'))requests.push(request.url());});
 await page.route('https://static.heygen.ai/hyperframes-oss/homepage/showcase/hq/*.mp4',route=>route.fulfill({path:'public/media/product-intro.mp4',contentType:'video/mp4'}));
 await page.goto('/');const work=page.locator('.studio-work').first();await work.scrollIntoViewIfNeeded();
 expect(requests).toHaveLength(0);
 await work.click();const dialog=page.locator('#studio-film');await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('heading')).toHaveText('Cow 1.0');
 await expect.poll(()=>dialog.locator('video').evaluate(el=>(el as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
 expect(requests.length).toBeGreaterThan(0);
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(work).toBeFocused();
 await expect(dialog.locator('video')).not.toHaveAttribute('src');
 expect(await dialog.locator('video').evaluate(el=>(el as HTMLVideoElement).paused)).toBeTruthy();
 await work.click();await dialog.getByRole('button',{name:'关闭作品'}).click();await expect(dialog).not.toBeVisible();
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
