import { joinURL, withoutTrailingSlash } from 'ufo'
import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'
import { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'

const base = process.env.DOCS_BASE ?? '/okapi/'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'src',
  base,
  lang: 'en-US',
  title: 'Okapi',
  description: 'A library for handling API and HTTP errors with ease',
  head: [
    // Basic
    ['link', { rel: 'icon', href: `${base}favicon.ico` }],

    // Open Graph
    ['meta', { property: 'og:site_name', content: 'Okapi' }],
    ['meta', { property: 'og:type', content: 'website' }],
    [
      'meta',
      {
        property: 'og:image',
        content:
          'https://res.cloudinary.com/drh75w8s9/image/upload/v1792928376/okapi-banner_dcsnfe.jpg',
      },
    ],

    // Twitter
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: 'okapi' }],
    [
      'meta',
      {
        name: 'twitter:image',
        content:
          'https://res.cloudinary.com/drh75w8s9/image/upload/v1792928376/okapi-banner_dcsnfe.jpg',
      },
    ],
  ],
  transformPageData(pageData, { siteConfig }) {
    pageData.frontmatter.head ??= []

    pageData.frontmatter.head.push(
      [
        'meta',
        {
          property: 'og:title',
          content: pageData.frontmatter.title || pageData.title || siteConfig.site.title,
        },
      ],
      [
        'meta',
        {
          property: 'og:description',
          content:
            pageData.frontmatter.description || pageData.description || siteConfig.site.description,
        },
      ],
      [
        'meta',
        {
          name: 'twitter:title',
          content: pageData.frontmatter.title || pageData.title || siteConfig.site.title,
        },
      ],
      [
        'meta',
        {
          name: 'twitter:description',
          content:
            pageData.frontmatter.description || pageData.description || siteConfig.site.description,
        },
      ],
    )

    pageData.frontmatter.head.push([
      'link',
      {
        rel: 'canonical',
        href: joinURL(
          'https://okapi.alexovn.dev',
          siteConfig.site.base,
          withoutTrailingSlash(pageData.filePath.replace(/(index)?\.md$/, '')),
        ),
      },
    ])

    pageData.frontmatter.head.push([
      'meta',
      {
        property: 'og:url',
        content: joinURL(
          'https://okapi.alexovn.dev',
          siteConfig.site.base,
          withoutTrailingSlash(pageData.filePath.replace(/(index)?\.md$/, '')),
        ),
      },
    ])
  },
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
      md.use(copyOrDownloadAsMarkdownButtons)
    },
  },
  vite: {
    plugins: [groupIconVitePlugin(), llmstxt()],
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
