import guides from '../../content/creator-guides.json' with { type: 'json' };

const studioImage = {
  image: '/media/xiaoyingjiang-creator.webp',
  imageWidth: 1440,
  imageHeight: 960,
};

export const creatorGuidePages = guides.map(guide => ({
  ...guide,
  validation: /** @type {{ mode: string, checkedAt: string, revision: string, digest: string } | undefined} */ ('validation' in guide ? guide.validation : undefined),
  ...studioImage,
  id: `creator-${guide.slug}`,
  route: `/creators/${guide.slug}/`,
  file: `src/content/creators/${guide.slug}.md`,
  kind: 'article',
}));

export const landingPages = [
  {
    id: 'studio-home',
    route: '/',
    file: 'src/pages/index.astro',
    kind: 'home',
    ...studioImage,
  },
  {
    id: 'creator-guides',
    route: '/creators/',
    file: 'src/pages/creators/index.astro',
    kind: 'index',
    ...studioImage,
  },
  ...creatorGuidePages,
];
