import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { z } from 'astro/zod';

const baseSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  type: z
    .enum(['article', 'solution', 'topic', 'wiki'])
    .optional(),
  date: z
    .union([z.coerce.date(), z.date()])
    .optional(),
  updated: z
    .union([z.coerce.date(), z.date()])
    .optional(),
  tags: z.array(z.string()).default([]),
  summary: z.string().default(''),
  publish: z.boolean().default(true),
  seealso: z.array(z.string()).default([]),
  cover: z.string().optional(),
  author: z.string().default('海松'),
  draft: z.boolean().optional(),
});

export const collections = {
  blog: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: baseSchema,
  }),
  wiki: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/wiki' }),
    schema: baseSchema,
  }),
};
