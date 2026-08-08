import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';

import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkWikiLink from 'remark-wiki-link';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

import siteConfig from './src/config/site.config.mjs';
import rehypeObsidianCallout from './src/plugins/rehype-obsidian-callout.mjs';

export default defineConfig({
  site: siteConfig.url,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      defaultLocale: siteConfig.locale.lang,
      locales: {
        root: {
          label: siteConfig.locale.label,
          lang: siteConfig.locale.lang,
        },
      },
      favicon: siteConfig.favicon,
      social: [],
      expressiveCode: {
        themes: ['github-light', 'github-dark'],
      },
      sidebar: [
        {
          label: '文章',
          link: '/blog/',
        },
        {
          label: '知识库',
          items: [
            { link: '/wiki/', label: '知识库首页' },
            { autogenerate: { directory: 'wiki' } },
          ],
        },
      ],
      components: {},
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:site_name',
            content: siteConfig.seo.siteName ?? siteConfig.title,
          },
        },
      ],
      plugins: [
        starlightBlog({
          title: '文章',
          authors: {},
          postsPerPage: 10,
          recentPostCount: 5,
        }),
      ],
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkFrontmatter,
        remarkGfm,
        remarkBreaks,
        [remarkWikiLink, { pageResolver: (name) => [name] }],
      ],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [rehypePrettyCode, { theme: { light: 'github-light', dark: 'github-dark' } }],
        rehypeObsidianCallout,
      ],
    }),
    shikiConfig: {
      wrap: true,
    },
  },
});
