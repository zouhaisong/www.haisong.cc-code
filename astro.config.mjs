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
      logo: {
        light: './public/images/logo.svg',
        dark: './public/images/logo-dark.svg',
        alt: siteConfig.logo.text ?? siteConfig.title,
        replacesTitle: false,
      },
      favicon: siteConfig.favicon,
      social: [],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
        activeHeadingTracking: true,
      },
      expressiveCode: {
        themes: ['github-light', 'github-dark'],
      },
      sidebar: [
        {
          label: '知识库',
          items: [
            { autogenerate: { directory: 'wiki' } },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      components: {
        
        Logo: './src/components/Logo.astro',
        SiteTitle: './src/components/SiteTitle.astro',
      },
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
          prefix: 'blog',
          authors: {
            '海松': {
              name: '海松',
            },
          },
          navigation: 'none',
          postCount: 10,
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
