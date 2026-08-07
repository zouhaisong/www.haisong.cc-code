export const siteConfig = {
  title: '海松知道',
  description: '海松知道 - 文章 · 知识库 · 方法沉淀',
  tagline: 'Sth Haisong know',
  logo: '',
  logoAlternate: '',
  logoText: '海松知道',
  logoWidth: '28px',
  logoHeight: '28px',
  favicon: {
    path: '/favicons',
    image: '/favicon.svg',
  },
  seo: {
    author: 'Haisong',
    keywords: ['海松', '博客', '知识库', '方法沉淀', '技术笔记'],
    robots: 'index, follow',
  },
  nav: [
    { label: '首页', href: '/' },
    { label: '博客', href: '/blog/' },
    { label: '知识库', href: '/wiki/' },
  ],
  social: [],
  lang: 'zh-CN',
  locale: {
    root: { label: '简体中文', lang: 'zh-CN' },
  },
};

export default siteConfig;
