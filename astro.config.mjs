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
  const dirMap = {
    '1-articles': 'blog/articles',
    '0-dailynote': 'blog/daily',
    '0-workspace/0-dailynote': 'blog/daily',
    '1-软件研发': 'wiki/software-engineering',
    '1-ai-coding': 'wiki/ai-coding',
    '1-ai-agent': 'wiki/ai-agent',
    '2-tools': 'wiki/tools',
    '2-tips': 'wiki/tips',
    '2-wiki': 'wiki',
    '2-solutions': 'wiki/solutions',
    '2-topics': 'wiki/topics',
    '2-spikes': 'wiki/spikes',
    '1-aichat': 'wiki/notes',
    articles: 'blog/articles',
    daily: 'blog/daily',
    'wiki-software-engineering': 'wiki/software-engineering',
    'wiki-ai-coding': 'wiki/ai-coding',
    'wiki-ai-agent': 'wiki/ai-agent',
    'wiki-tools': 'wiki/tools',
    'wiki-tips': 'wiki/tips',
    solutions: 'wiki/solutions',
    topics: 'wiki/topics',
    spikes: 'wiki/spikes',
    notes: 'wiki/notes',
  };
  const norm = slug.replace(/^\/+|\/+$/g, '');
  if (!norm) return ['/blog'];
  if (norm.startsWith('blog/')) return [`/${norm}`];
  if (norm.startsWith('wiki/')) return [`/${norm}`];
  if (norm === 'blog' || norm === 'wiki') return [`/${norm}`];
  for (const [prefix, mapped] of Object.entries(dirMap)) {
    if (norm === prefix) return [`/${mapped}`];
    if (norm.startsWith(prefix + '/')) {
      const rest = norm.slice(prefix.length + 1).replace(/^\/+|\/+$/g, '');
      return rest ? [`/${mapped}/${rest}`] : [`/${mapped}`];
    }
  }
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
      title: '海松的博客与知识库',
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
