export const siteConfig = {
  title: '海松知道',
  titleEn: 'Something Haisong know',
  description: 'AI编程方法论与AI应用实践',
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
      { label: '作品', link: '/works/' },
      { label: '联系', link: '/contact/' },
    ],
  },
  works: {
    title: '作品展示',
    titleEn: 'Selected Works',
    lead: '智慧不是对往事的记忆，而是对体验的转化。',
    items: [
      {
        title: '海松知道',
        summary: '个人小站：文章与知识库双轨沉淀。',
        link: 'https://www.haisong.cc',
        tags: ['个人小站'],
      },
      {
        title: 'Trae 实战手册',
        summary: '围绕 Trae 编程智能体的分步操作指南与可复用 SOP。',
        link: '/wiki/编程智能体trae实战手册/编程智能体trae实战手册/',
        tags: ['Trae', '操作手册'],
      },
      {
        title: 'OpenCode 实战手册',
        summary: '基于 OpenCode 的开源协作与自动化落地手册。',
        link: '/wiki/opencode实战手册/opencode实战手册/',
        tags: ['OpenCode', '方法论'],
      },
      {
        title: '基础设施编排',
        summary: 'Docker Compose + Traefik + Nginx 的三层分离部署方案。',
        link: '/deploy/',
        tags: ['DevOps', 'Traefik', 'Docker'],
      },
    ],
  },
  contact: {
    title: '联系海松',
    titleEn: 'Get in Touch',
    lead: '关于AI编程、知识库、AI应用相关问题，欢迎通过以下方式建立联络。',
    channels: [
      {
        label: '邮箱',
        value: 'zouhaisong at foxmail.com',
        link: '',
        icon: 'email',
      },
      {
        label: '站点',
        value: 'www.haisong.cc',
        link: 'https://www.haisong.cc',
        icon: 'link',
      },
    ],
  },
  footer: {
    icp: '沪ICP备2026037718号-1',
    icpLink: 'https://beian.miit.gov.cn/',
  },
};

export default siteConfig;
