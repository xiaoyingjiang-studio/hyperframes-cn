import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { load } from 'cheerio';

let processor;
export async function markdownText(markdown) {
  processor ||= createMarkdownProcessor();
  const rendered = await (await processor).render(markdown);
  return load(rendered.code)('body').text().replace(/\s+/g, ' ').trim();
}
