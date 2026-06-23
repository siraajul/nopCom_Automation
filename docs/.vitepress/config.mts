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
    // Shorter nav-bar title so it fits on very small phones (320px). The full
    // title is still used for <title>/SEO via the top-level `title`.
    siteTitle: 'nopCommerce QA',

    // No top `nav`: all navigation lives in the sidebar, so the site has a
    // SINGLE menu control on mobile (the sidebar "Menu" toggle) instead of two
    // hamburgers (a top nav hamburger + a sidebar toggle). The logo links home
    // and the GitHub icon is provided via socialLinks below.
    sidebar: [
      {
        text: 'Overview',
        items: [{ text: 'Introduction', link: '/' }],
      },
      {
        text: 'Guide',
        items: [
          { text: 'How to Run', link: '/guide/running' },
          { text: 'Getting Past Cloudflare', link: '/Cloudflare-Bypass' },
        ],
      },
      {
        text: 'Assignment Deliverables',
        items: [
          { text: 'Step 1: Feature Selection', link: '/feature-selection' },
          { text: 'Step 2: Test Scenarios', link: '/test-scenarios' },
          { text: 'Step 3: Script Automation', link: '/script-automation' },
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
