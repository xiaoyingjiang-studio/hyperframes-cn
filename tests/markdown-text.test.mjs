import test from 'node:test';
import assert from 'node:assert/strict';
import { toMarkdown } from '../scripts/lib/discovery.mjs';
import { markdownText } from '../scripts/lib/markdown-text.mjs';

test('摘要中的命令标点经 Markdown 转义后仍与可见正文一致', async () => {
  const answer = '使用 `npx hyperframes@0.9.92` 创建 my_project，支持字幕与配音；保留 * 原样符号。';
  const markdown = toMarkdown(`<main data-pagefind-body><p>${answer}</p></main>`, 'https://example.com/start/cli/');
  assert.equal(markdown.includes(answer), false);
  assert.equal(await markdownText(markdown), answer);
  assert.equal((await markdownText(markdown)).includes('伪造摘要'), false);
});
