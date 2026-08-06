import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const noteSchema = z.object({
  title: z.string(),
  type: z.enum(['article', 'daily', 'solution', 'topic', 'spike', 'note', 'wiki']).optional(),
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
});

function stripDirFromId(dirPrefix?: string | string[]) {
  const dirs = (Array.isArray(dirPrefix) ? dirPrefix : [dirPrefix ?? '']).filter(Boolean);
  return function generateId({ entry }: { entry: string; base: unknown; data: unknown }) {
    let id = entry.replace(/\\/g, '/').replace(/\.mdx?$/i, '');
    for (const d of dirs) {
      if (!d) continue;
      const prefix = d.replace(/\\/g, '/').replace(/\/$/, '') + '/';
      if (id.startsWith(prefix)) {
        id = id.slice(prefix.length);
        break;
      }
      if (id.startsWith(d + '/')) {
        id = id.slice(d.length + 1);
        break;
      }
    }
    return id
      .toLowerCase()
      .split('/')
      .map((s) => s.replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, ''))
      .filter(Boolean)
      .join('/');
  };
}

const mk = (pattern: string | string[], dirPrefix?: string | string[]) =>
  defineCollection({
    loader: glob({
      pattern,
      generateId: stripDirFromId(dirPrefix),
    }),
    schema: noteSchema,
  });

export const collections = {
  blog: mk('blog/**/*.md', 'blog'),
  wiki: mk('wiki/**/*.md', 'wiki'),
};
