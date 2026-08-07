import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

import remarkWikiLink from 'remark-wiki-link';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkFrontmatter from 'remark-frontmatter';

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

import { siteConfig } from './src/config/site.config.mjs';

import starlightBlog from 'starlight-blog'

function pageResolver(permalink) {
  const slug = String(permalink || '')
    .replace(/\.(md|mdx)$/i, '')
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');
  if (!slug) return ['/blog'];
  if (slug.startsWith('blog/') || slug.startsWith('wiki/')) return [`/${slug}`];
  if (slug === 'blog' || slug === 'wiki') return [`/${slug}`];
  return [`/wiki/${slug}`];
}

function hrefTemplate(permalink) {
  const s = String(permalink || '').replace(/^\/+|\/+$/g, '');
  return `/${s}/`;
}

const remarkPlugins = [
  remarkFrontmatter,
  remarkGfm,
  remarkBreaks,
  [remarkWikiLink, { permalinks: [], pageResolver, hrefTemplate }],
];

const rehypePlugins = [
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: 'append' }],
  [rehypePrettyCode, { theme: 'github-dark' }],
];

const starlightTitle = siteConfig.logoText || siteConfig.title;

export default defineConfig({
  site: 'https://www.haisong.cc',
  trailingSlash: 'ignore',
  legacy: {
    collectionsBackwardsCompat: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    starlight({
      title: starlightTitle,
      description: siteConfig.description,
      defaultLocale: 'root',
      locales: siteConfig.locale,
      customCss: ['./src/styles/custom.css'],
      plugins: [starlightBlog()],
    }),
    sitemap(),
    mdx(),
  ],
  markdown: {
    remarkPlugins,
    rehypePlugins,
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
