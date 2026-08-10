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
const EXCERPT_MAX_LENGTH = 200;
const MARKDOWN_EXCERPT_DELIMITER = '<!-- excerpt -->';
const MDX_EXCERPT_DELIMITER = '{/* excerpt */}';

function stripFrontmatter(content: string): string {
  const fmMatch = content.match(/^---\s*\n[\s\S]*?\n---\s*\n?/);
  return fmMatch ? content.slice(fmMatch[0].length) : content;
}

function stripMarkdownFormatting(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*#{1,6}\s.*/gm, '')
    .replace(/^>\s*\[!([^\]]+)\][^\n]*/gim, '')
    .replace(/^>\s?/gm, '')
    .replace(/\[!([^\]]+)\][^\n]*/gi, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*\|.*\|\s*$/gm, '')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractExcerptFromFile(rawContent: string): string | undefined {
  const body = stripFrontmatter(rawContent);

  const delimiterIdx = body.indexOf(MARKDOWN_EXCERPT_DELIMITER);
  const mdxDelimiterIdx = body.indexOf(MDX_EXCERPT_DELIMITER);
  const hasDelim = delimiterIdx !== -1 || mdxDelimiterIdx !== -1;

  if (hasDelim) {
    const idx = delimiterIdx !== -1 ? delimiterIdx : mdxDelimiterIdx;
    const aboveDelim = body.slice(0, idx).trim();
    if (aboveDelim) {
      return aboveDelim;
    }
  }

  const plain = stripMarkdownFormatting(body)
    .replace(/\s+/g, ' ')
    .trim();

  if (!plain) return undefined;

  if (plain.length <= EXCERPT_MAX_LENGTH) {
    return plain;
  }

  let cut = EXCERPT_MAX_LENGTH;
  const lastPunct = plain.slice(0, cut + 1).search(/[。！？!?；;。\.]\s*[^\s。！？!?；;。\.]*$/);
  if (lastPunct !== -1 && lastPunct > EXCERPT_MAX_LENGTH * 0.5) {
    cut = lastPunct + 1;
  } else {
    const lastSpace = plain.slice(0, cut + 1).lastIndexOf(' ');
    if (lastSpace > EXCERPT_MAX_LENGTH * 0.6) {
      cut = lastSpace;
    }
  }

  return plain.slice(0, cut).trim() + '…';
}

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

        if (
          (data.excerpt === undefined || data.excerpt === null || String(data.excerpt).trim() === '') &&
          entry.filePath
        ) {
          const absPath = path.isAbsolute(entry.filePath)
            ? entry.filePath
            : path.resolve(rootDir, entry.filePath);
          try {
            const raw = fs.readFileSync(absPath, 'utf-8');
            const excerpt = extractExcerptFromFile(raw);
            if (excerpt) {
              data.excerpt = excerpt;
              changed = true;
            }
          } catch {
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
