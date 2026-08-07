import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const baseSchema = z.object({
  title: z.string(),
  type: z
    .enum(['article', 'daily', 'solution', 'topic', 'spike', 'note', 'wiki'])
    .optional(),
  date: z
    .union([z.string().datetime(), z.string().date(), z.date()])
    .optional()
    .transform((d) => (d ? new Date(d) : undefined)),
  updated: z
    .union([z.string().datetime(), z.string().date(), z.date()])
    .optional()
    .transform((d) => (d ? new Date(d) : undefined)),
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
    type: 'content',
    schema: baseSchema,
  }),
  wiki: defineCollection({
    type: 'content',
    schema: baseSchema,
  }),
};
