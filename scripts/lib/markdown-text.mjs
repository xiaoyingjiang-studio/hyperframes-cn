import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { load } from 'cheerio';

let processor;
export async function markdownText(markdown) {
  // Compare exported literal text; typography must not rewrite CLI flags or quotes.
  processor ||= createMarkdownProcessor({ smartypants: false });
  const rendered = await (await processor).render(markdown);
  return load(rendered.code)('body').text().replace(/\s+/g, ' ').trim();
}
