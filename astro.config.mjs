import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import siteConfig from './src/config/site.config.mjs';

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
          label: '博客',
          link: '/blog/',
        },
        {
          label: '维基',
          items: [
            { link: '/wiki/', label: '维基首页' },
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
          title: '博客',
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
    remarkPlugins: [
      'remark-frontmatter',
      'remark-gfm',
      'remark-breaks',
      ['remark-wiki-link', { pageResolver: (name) => [name] }],
    ],
    rehypePlugins: [
      'rehype-slug',
      ['rehype-autolink-headings', { behavior: 'wrap' }],
      ['rehype-pretty-code', { theme: { light: 'github-light', dark: 'github-dark' } }],
    ],
    shikiConfig: {
      wrap: true,
    },
  },
});
