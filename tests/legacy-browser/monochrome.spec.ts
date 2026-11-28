import { test, expect } from '@playwright/test';

test('首页、文档、代码与 404 在明暗主题下使用黑白灰界面', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    for (const route of ['/', '/skills/figma/', '/start/cli/', '/404.html']) {
      await page.goto(route);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const colored = await page.evaluate(() => {
        const issues: string[] = [];
        for (const node of document.querySelectorAll('body, body *')) {
          if (!node.getClientRects().length || node.closest('img, video, canvas, iframe, script, style')) continue;
          const css = getComputedStyle(node);
          for (const property of ['color', 'background-color', 'border-top-color']) {
            const value = css.getPropertyValue(property);
            const match = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (!match || match[4] === '0') continue;
            const values = match.slice(1, 4).map(Number);
            if (Math.max(...values) - Math.min(...values) > 2) issues.push(`${node.tagName}.${node.classList.value.slice(0, 45)} ${property}: ${value}`);
          }
        }
        return issues.slice(0, 15);
      });
      expect(colored, `${theme} ${route}`).toEqual([]);
      if (['/', '/skills/figma/'].includes(route)) {
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: `artifacts/qa/monochrome-${route === '/' ? 'home' : 'docs'}-${theme}-${info.project.name}.png`, animations: 'disabled' });
      }
    }
  }
});
