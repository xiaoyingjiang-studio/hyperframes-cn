import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import siteConfig from './site.config.json' with { type: 'json' };

const repository = process.env.PUBLIC_REPOSITORY || siteConfig.repository;
export default defineConfig({
  site: process.env.SITE_URL || siteConfig.url,
  output: 'static',
  trailingSlash: 'always',
  integrations: [starlight({
    title: 'HyperFrames 中文指南',
    disable404Route: true,
    pagefind: { index: { rootSelector: '[data-pagefind-body]' } },
    description: 'HyperFrames 中文学习与实践：产品能力、快速开始、案例与持续更新。',
    defaultLocale: 'root',
    locales: { root: { label: '简体中文', lang: 'zh-CN' } },
    social: [{ icon: 'github', label: 'GitHub', href: repository }],
    editLink: { baseUrl: `${repository}/edit/main/` },
    customCss: ['./src/styles/global.css', './src/styles/discovery.css'],
    components: {
      Header: './src/components/Header.astro',
      PageTitle: './src/components/PageTitle.astro',
      Footer: './src/components/Footer.astro',
    },
    sidebar: [
      { label: '了解产品', items: [{ autogenerate: { directory: 'overview' } }] },
      { label: '快速开始', items: [{ autogenerate: { directory: 'start' } }] },
      { label: '产品能力', items: [{ autogenerate: { directory: 'features' } }] },
      { label: '学习指南', items: [{ autogenerate: { directory: 'guides' } }] },
      { label: '案例与项目', items: [{ autogenerate: { directory: 'showcase' } }] },
      { label: '更新动态', items: [{ autogenerate: { directory: 'updates' } }] },
      { label: '关于与贡献', items: [{ autogenerate: { directory: 'community' } }] },
    ],
  })],
});
