import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const noteSchema = z.object({
  title: z.string(),
  type: z.enum([
    'article',
    'daily',
    'wiki-se',
    'wiki-aicoding',
    'wiki-aiagent',
    'wiki-tools',
    'wiki-tips',
    'wiki',
    'solution',
    'topic',
    'spike',
    'note',
  ]).optional(),
  date: z.union([z.string().datetime(), z.string().date(), z.date()]).transform((d) => new Date(d)),
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
  // Blog
  articles: mk('1-articles/**/*.md', '1-articles'),
  daily: mk('0-workspace/0-DailyNote/**/*.md', ['0-workspace', '0-DailyNote']),

  // Wiki 多领域
  'wiki-software-engineering': mk('1-\u8f6f\u4ef6\u7814\u53d1/**/*.md', '1-\u8f6f\u4ef6\u7814\u53d1'),
  'wiki-ai-coding': mk('1-ai-coding/**/*.md', '1-ai-coding'),
  'wiki-ai-agent': mk('1-ai-agent/**/*.md', '1-ai-agent'),
  'wiki-tools': mk('2-tools/**/*.md', '2-tools'),
  'wiki-tips': mk('2-tips/**/*.md', '2-tips'),
  wiki: mk('2-wiki/**/*.md', '2-wiki'),

  // Solutions
  solutions: mk('2-solutions/**/*.md', '2-solutions'),
  topics: mk('2-topics/**/*.md', '2-topics'),
  spikes: mk('2-spikes/**/*.md', '2-spikes'),

  // 其他 / AI 聊天
  notes: mk('1-aichat/**/*.md', '1-aichat'),
};
