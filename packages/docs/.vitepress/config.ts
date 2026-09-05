import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

const base = process.env.DOCS_BASE ?? '/okapi/'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'src',
  base,
  lang: 'en-US',
  title: 'Okapi',
  description: 'A library for handling API and HTTP errors with ease.',
  head: [['link', { rel: 'icon', href: `${base}favicon.ico` }]],
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    search: {
      provider: 'local',
    },

    logo: {
      light: '/okapi-logo-black.svg',
      dark: '/okapi-logo-white.svg',
      alt: 'Okapi',
    },

    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Docs',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Quick Start', link: '/quick-start' },
          { text: 'API', link: '/api' },
          { text: 'i18n', link: '/i18n' },
          { text: 'Error Kinds', link: '/error-kinds' },
          { text: 'Custom Validation Errors', link: '/custom-validation-errors' },
          { text: 'Types', link: '/types' },
          { text: 'Adapters', link: '/adapters' },
          // { text: 'Examples', link: '/examples', activeMatch: '/examples' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Quick Start', link: '/quick-start' },
        ],
        collapsed: false,
      },
      {
        text: 'Core concepts',
        items: [
          { text: 'API', link: '/api' },
          { text: 'i18n', link: '/i18n' },
          { text: 'Error Kinds', link: '/error-kinds' },
          { text: 'Custom Validation Errors', link: '/custom-validation-errors' },
          { text: 'Types', link: '/types' },
        ],
        collapsed: false,
      },
      {
        text: 'Adapters',
        link: '/adapters',
        items: [
          {
            text: 'Native Fetch',
            link: '/adapters/native-fetch',
          },
          {
            text: 'Axios',
            link: '/adapters/axios',
          },
          {
            text: 'ofetch',
            link: '/adapters/ofetch',
          },
        ],
        collapsed: false,
      },
      // {
      //   text: 'Examples',
      //   link: '/examples',
      //   items: [
      //     { text: 'Native Fetch', link: '/examples/fetch' },
      //   ],
      //   collapsed: false,
      // },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright:
        'Copyright © 2026-present <a href="https://github.com/alexovn" target="_blank">Nikita Aleksov (alexovn)</a>',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/alexovn/okapi' }],
  },
})
