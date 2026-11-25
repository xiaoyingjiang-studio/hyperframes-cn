import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
export const collections = {
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: z.object({
      contentId: z.string(),
      kind: z.enum(['adaptation', 'original', 'tutorial', 'case', 'update', 'index', 'capability', 'mechanism', 'skill', 'workflow', 'catalog']),
      sources: z.array(z.string()),
      reviewedAt: z.string().optional(),
      appliesTo: z.string(),
      status: z.enum(['reviewed', 'needs-review', 'practice', 'source-based', 'auto-checked']),
      verification: z.string().optional(),
    }) }),
  }),
};
