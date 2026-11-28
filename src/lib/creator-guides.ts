import discovery from '../../content/discovery.json';
import { creatorGuidePages } from '../../scripts/lib/landing-pages.mjs';

export const creatorGuides = creatorGuidePages.map(page => {
  const intent = discovery.pages.find(({ id }) => id === page.id);
  if (!intent?.title) throw new Error(`未登记手册文章标题和摘要：${page.id}`);
  return { ...page, ...intent, title: intent.title };
});

const hub = discovery.pages.find(({ id }) => id === 'creator-guides');
if (!hub?.title) throw new Error('未登记出海手册总览标题和摘要');
export const handbook = { ...hub, title: hub.title };
