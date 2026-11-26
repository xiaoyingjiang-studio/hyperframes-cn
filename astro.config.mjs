import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import siteConfig from './site.config.json' with { type: 'json' };
import knowledge from './content/knowledge.json' with { type: 'json' };
import pages from './content/pages.json' with { type: 'json' };

const repository = process.env.PUBLIC_REPOSITORY || siteConfig.repository;
export default defineConfig({
  site: process.env.SITE_URL || siteConfig.url,
  output: 'static',
  trailingSlash: 'always',
  integrations: [starlight({
    title: 'HyperFrames 创作知识库',
    favicon: '/favicon.ico',
    disable404Route: true,
    pagefind: { index: { rootSelector: '[data-pagefind-body]' } },
    description: 'HyperFrames 中文学习与实践：产品能力、快速开始、案例与持续更新。',
    defaultLocale: 'root',
    locales: { root: { label: '简体中文', lang: 'zh-CN' } },
    social: [{ icon: 'github', label: 'GitHub', href: repository }],
    editLink: { baseUrl: `${repository}/edit/main/` },
    customCss: ['./src/styles/global.css', './src/styles/discovery.css', './src/styles/docs.css'],
    components: {
      Header: './src/components/Header.astro',
      PageTitle: './src/components/PageTitle.astro',
      Footer: './src/components/Footer.astro',
    },
    sidebar: [
      { label: '从这里开始', link: '/knowledge/' },
      ...knowledge.sections.map(section => ({
        label: section.title,
        collapsed: section.id !== 'orientation',
        items: knowledge.entities.filter(entity => entity.section === section.id && entity.articleId !== 'knowledge' && pages.some(page => page.id === entity.articleId)).sort((a, b) => Number(b.type === 'directory') - Number(a.type === 'directory')).map(entity => ({ slug: entity.route.replace(/^\/|\/$/g, ''), ...(entity.type === 'directory' ? { label: `${section.title}总览` } : {}) })),
      })).filter(section => section.items.length),
    ],
  })],
});
