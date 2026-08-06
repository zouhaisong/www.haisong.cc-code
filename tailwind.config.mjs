export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './1-articles/**/*.{md,mdx}',
    './0-workspace/**/*.{md,mdx}',
    './1-软件研发/**/*.{md,mdx}',
    './1-ai-coding/**/*.{md,mdx}',
    './1-ai-agent/**/*.{md,mdx}',
    './2-tools/**/*.{md,mdx}',
    './2-tips/**/*.{md,mdx}',
    './2-wiki/**/*.{md,mdx}',
    './2-solutions/**/*.{md,mdx}',
    './2-topics/**/*.{md,mdx}',
    './2-spikes/**/*.{md,mdx}',
    './1-aichat/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
