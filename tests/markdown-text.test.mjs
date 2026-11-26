import test from 'node:test';
import assert from 'node:assert/strict';
import { toMarkdown } from '../scripts/lib/discovery.mjs';
import { markdownText } from '../scripts/lib/markdown-text.mjs';

test('摘要中的命令标点经 Markdown 转义后仍与可见正文一致', async () => {
  const answer = '使用 `npx hyperframes@0.9.92` 创建 my_project，用 render --resolution 4k 输出，支持字幕与配音；保留 * 原样符号。';
  const markdown = toMarkdown(`<main data-pagefind-body><p>${answer}</p></main>`, 'https://example.com/start/cli/');
  assert.equal(markdown.includes(answer), false);
  assert.equal(await markdownText(markdown), answer);
  assert.equal((await markdownText(markdown)).includes('伪造摘要'), false);
});

test('表格里的行内 HTML 示例与链接导出后仍为文字和链接', async () => {
  const html = '<main data-pagefind-body><table><tr><th>元素</th><th>用法</th></tr><tr><td><code>&lt;canvas&gt;</code> 或 WebGL</td><td><a href="/guide/">查看条件</a></td></tr></table></main>';
  const markdown = toMarkdown(html, 'https://example.com/');
  assert.ok(markdown.includes('`<canvas>`'));
  assert.ok(markdown.includes('[查看条件](https://example.com/guide/)'));
  assert.ok((await markdownText(markdown)).includes('<canvas> 或 WebGL'));
});
