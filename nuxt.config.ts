/**
 * Nuxt configuration for Uncommitted blog.
 * SSG mode targeting GitHub Pages deployment.
 */
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/seo',
    '@nuxt/image',
  ],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://thevalleydev.github.io',
    name: 'Uncommitted',
    description: 'Works in progress. Project logs, fragments, and ideas that may or may not ship.',
    defaultLocale: 'en',
    identity: {
      type: 'Organization',
    },
  },

  ogImage: {
    enabled: true,
    defaults: {
      width: 1200,
      height: 630,
    },
  },

  content: {
    highlight: {
      theme: 'github-dark',
    },
    documentDriven: false,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/blog', '/about', '/sitemap.xml'],
    },
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/uncommitted/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#6366f1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/uncommitted/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/uncommitted/apple-touch-icon.svg' },
        { rel: 'manifest', href: '/uncommitted/site.webmanifest' },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap',
        },
      ],
    },
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Uncommitted',
      url: 'https://thevalleydev.github.io/uncommitted',
      logo: 'https://thevalleydev.github.io/uncommitted/favicon.svg',
      description: 'Works in progress. Project logs, fragments, and ideas that may or may not ship.',
    },
  },

  sitemap: {
    defaults: {
      changefreq: 'weekly',
      priority: 0.5,
    },
    urls: [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/blog', priority: 0.9, changefreq: 'daily' },
      { loc: '/about', priority: 0.5, changefreq: 'monthly' },
    ],
  },

  robots: {
    robotsTxt: false, // Using static public/robots.txt
  },

  linkChecker: {
    enabled: false,
  },

  routeRules: {
    '/': { prerender: true },
    '/blog/**': { prerender: true },
    '/about': { prerender: true },
  },

  devtools: { enabled: true },
})
