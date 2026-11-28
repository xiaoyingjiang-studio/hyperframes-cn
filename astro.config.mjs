import { defineConfig } from 'astro/config';
import siteConfig from './site.config.json' with { type: 'json' };
import guideTables from './scripts/lib/guide-tables.mjs';

export default defineConfig({
  site: process.env.SITE_URL || siteConfig.url,
  output: 'static',
  trailingSlash: 'always',
  publicDir: './public-studio',
  markdown: { rehypePlugins: [guideTables] },
});
