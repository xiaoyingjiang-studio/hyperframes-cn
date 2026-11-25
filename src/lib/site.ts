import config from '../../site.config.json';
export const site = {
  name: 'HyperFrames 中文指南',
  description: '从一句中文提示词，到一个可以继续编辑的视频。了解 HyperFrames，找到适合你的创作方式。',
  url: process.env.SITE_URL || config.url,
  repository: process.env.PUBLIC_REPOSITORY || config.repository,
  indexable: process.env.SITE_INDEXABLE ? process.env.SITE_INDEXABLE === 'true' : config.indexable,
};
export const groups = [
  { label: '了解产品', prefix: 'overview', pages: ['what-is-hyperframes', 'choose-your-path', 'free-and-paid'] },
  { label: '快速开始', prefix: 'start', pages: ['studio', 'codex', 'claude-code', 'cursor', 'cli'] },
  { label: '产品能力', prefix: 'features', pages: ['editing', 'captions', 'motion', 'media', 'skills-catalog', 'render-share'] },
  { label: '学习指南', prefix: 'guides', pages: ['prompting', 'chinese-typography', 'windows', 'project-structure', 'troubleshooting'] },
  { label: '案例与项目', prefix: 'showcase', pages: ['', 'product-intro', 'chinese-explainer', 'data-story', 'footage-edit'] },
  { label: '更新动态', prefix: 'updates', pages: ['', 'first-edition', 'site-changelog'] },
  { label: '关于与贡献', prefix: 'community', pages: ['about', 'contributing', 'sources', 'licenses'] },
];
export const cases = [
  { id: 'product-intro', eyebrow: 'PRODUCT LAUNCH', title: '把产品价值，讲成一段视频', description: '用标题、浏览器界面与时间轴，演示一支 8 秒的产品介绍。', duration: '8 秒', category: '产品介绍', color: '#82efb3' },
  { id: 'chinese-explainer', eyebrow: 'CHINESE EXPLAINER', title: '让中文信息，有清楚的节奏', description: '一句话、一幅图、一个重点，演示中文排版与字幕时序。', duration: '8 秒', category: '知识讲解', color: '#f2d48a' },
  { id: 'data-story', eyebrow: 'DATA IN MOTION', title: '让数字变化，变得看得见', description: '用一组明确标注的示例数据，演示图表动画与信息层级。', duration: '8 秒', category: '数据动画', color: '#a7c7f3' },
  { id: 'footage-edit', eyebrow: 'EDIT YOUR FOOTAGE', title: '已有素材，也能重新组织', description: '将本站原创片段重新剪辑，叠加中文字幕和节奏提示。', duration: '8 秒', category: '素材剪辑', color: '#eba5a0' },
];
