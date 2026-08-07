import { defineCollection } from 'astro/content/config';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      summary: z.string().optional(),
      pubDate: z.coerce.date().optional(),
      date: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.string().optional(),
      tags: z.array(z.string()).default([]),
      author: z.string().default('海松'),
      draft: z.boolean().default(false),
      publish: z.boolean().default(true),
    })
    .transform((data) => {
      const pubDate = data.pubDate ?? data.date;
      if (!pubDate) {
        throw new Error('blog entry requires either `pubDate` or `date` in frontmatter');
      }
      return {
        ...data,
        pubDate,
        description: data.description ?? data.summary,
        draft: data.draft || !data.publish,
      };
    }),
});

const wiki = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/wiki' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, wiki };
