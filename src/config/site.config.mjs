export const siteConfig = {
  title: '海松知道',
  titleEn: 'Something Haisong know',
  description: '沉淀编程智能体实践方法论与体系化知识',
  locale: {
    lang: 'zh-CN',
    label: '简体中文',
  },
  url: 'https://www.haisong.cc',
  logo: {
    src: '/images/logo.svg',
    alternate: '/images/logo-dark.svg',
    text: '海松知道',
    textEn: 'Something Haisong know',
  },
  favicon: '/favicon.svg',
  seo: {
    defaultOGImage: '/images/logo.svg',
    defaultTwitterImage: '/images/logo.svg',
    siteName: '海松知道',
    twitter: {
      creator: '@haisong',
      card: 'summary_large_image',
    },
    keywords: [
      '编程智能体',
      'AI 编程',
      'OpenCode',
      'Trae',
      'Codex',
      'Pi',
      '方法论',
    ],
  },
  navigation: {
    header: [
      { label: '文章', link: '/blog/' },
      { label: '知识库', link: '/wiki/' },
    ],
  },
};

export default siteConfig;
