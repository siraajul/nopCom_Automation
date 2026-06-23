import { defineConfig } from 'vitepress';

// VitePress documentation site for the nopCommerce Playwright automation framework.
// Dev:   npm run docs:dev
// Build: npm run docs:build  ->  docs/.vitepress/dist
export default defineConfig({
  title: 'nopCommerce Automation',
  description:
    'Playwright + TypeScript test automation framework for demo.nopcommerce.com — POM, data-driven, Cloudflare-ready, 34 tests across 9 features.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'How to Run', link: '/guide/running' },
      {
        text: 'Deliverables',
        items: [
          { text: 'Step 1 — Feature Selection', link: '/Step1-Identify-Key-Areas' },
          { text: 'Step 2 — Test Scenarios', link: '/Step2-Test-Scenarios' },
        ],
      },
      { text: 'GitHub', link: 'https://github.com/siraajul/nopCom_Automation' },
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [{ text: 'Introduction', link: '/' }],
      },
      {
        text: 'Guide',
        items: [{ text: 'How to Run', link: '/guide/running' }],
      },
      {
        text: 'Assignment Deliverables',
        items: [
          { text: 'Step 1 — Feature Selection', link: '/Step1-Identify-Key-Areas' },
          { text: 'Step 2 — Test Scenarios', link: '/Step2-Test-Scenarios' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/siraajul/nopCom_Automation' },
    ],

    search: { provider: 'local' },

    footer: {
      message: 'Built with Playwright + TypeScript · Page Object Model',
      copyright: 'nopCommerce demo-store automation',
    },
  },
});
