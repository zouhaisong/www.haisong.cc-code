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

function pageResolver(permalink) {
  const slug = String(permalink || '')
    .replace(/\.(md|mdx)$/i, '')
    .toLowerCase()
    .split(/\s+/)
    .join('-')
    .replace(/[^a-z0-9-_/\u4e00-\u9fff]/g, '');
  const norm = slug.replace(/^\/+|\/+$/g, '');
  if (!norm) return ['/blog'];
  if (norm.startsWith('blog/') || norm.startsWith('wiki/')) return [`/${norm}`];
  if (norm === 'blog' || norm === 'wiki') return [`/${norm}`];
  return [`/wiki/${norm}`];
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

export default defineConfig({
  site: 'https://www.haisong.cc',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    starlight({
      title: '海松知道',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      customCss: ['./src/styles/custom.css'],
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
