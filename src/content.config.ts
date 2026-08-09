import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader, LoaderContext } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';
import { docsLoader as starlightDocsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';

const TITLE_PLACEHOLDER = '__TITLE_PLACEHOLDER__';
const DATE_PLACEHOLDER = new Date(0);

function slugToTitle(slug: string): string {
  const parts = slug
    .split(/[\\/]/)
    .filter((p) => p && !p.startsWith('_'));
  const base = parts[parts.length - 1] || slug;
  return base
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isPlaceholderDate(d: unknown): d is Date {
  return d instanceof Date && d.getTime() === DATE_PLACEHOLDER.getTime();
}

function docsLoader(): Loader {
  const baseLoader = starlightDocsLoader();

  return {
    name: baseLoader.name,
    load: async (ctx: LoaderContext) => {
      await baseLoader.load(ctx);

      const rootDir = fileURLToPath(ctx.config.root);

      for (const [id, entry] of ctx.store.entries()) {
        const data = { ...entry.data } as Record<string, unknown>;
        let changed = false;

        if (!data.title || data.title === TITLE_PLACEHOLDER) {
          const fallback = entry.filePath ? path.basename(entry.filePath, path.extname(entry.filePath)) : '';
          data.title = slugToTitle(id || fallback);
          changed = true;
        }

        if ((data.date === undefined || isPlaceholderDate(data.date)) && entry.filePath) {
          const absPath = path.isAbsolute(entry.filePath)
            ? entry.filePath
            : path.resolve(rootDir, entry.filePath);
          try {
            const stat = fs.statSync(absPath);
            data.date = stat.mtime;
            changed = true;
          } catch {
            if (!data.date) {
              data.date = new Date();
              changed = true;
            }
          }
        }

        if (changed) {
          ctx.store.set({ ...entry, data, digest: undefined });
        }
      }
    },
  };
}

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: (context) =>
      blogSchema(context).extend({
        title: z.string().default(TITLE_PLACEHOLDER),
        date: z.date().default(DATE_PLACEHOLDER),
      }),
  }),
});

const i18n = defineCollection({
  loader: i18nLoader(),
  schema: i18nSchema(),
});

export const collections = { docs, i18n };
