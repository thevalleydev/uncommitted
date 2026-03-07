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
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://uncommitted.blog',
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

  image: {
    quality: 80,
    format: ['webp', 'png', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/blog', '/about', '/sitemap.xml'],
    },
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' },
      script: [
        {
          // Blocking inline script: applies dark class before first paint to prevent FOUC.
          // Checks localStorage first; falls back to system preference if unset.
          id: 'color-mode-init',
          innerHTML: [
            '(function () {',
            "  var stored = localStorage.getItem('color-mode');",
            "  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;",
            "  if (stored === 'dark' || (stored === null && prefersDark)) {",
            "    document.documentElement.classList.add('dark');",
            '  }',
            '})();',
          ].join('\n'),
        },
      ],
      meta: [
        { name: 'theme-color', content: '#6366f1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
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
          // Non-blocking font load: preload the CSS, then swap rel to stylesheet once downloaded.
          // This eliminates the render-blocking stylesheet that reduces FCP/LCP scores.
          // The onload value is a static, hardcoded string — no user input is interpolated here.
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap',
          onload: "this.onload=null;this.rel='stylesheet'",
        },
      ],
    },
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Uncommitted',
      url: 'https://uncommitted.blog',
      logo: 'https://uncommitted.blog/favicon.svg',
      description: 'Works in progress. Project logs, fragments, and ideas that may or may not ship.',
    },
  },

  sitemap: {
    defaults: {
      changefreq: 'weekly',
      priority: 0.5,
    },
    sources: ['/__sitemap__/urls'],
    urls: [
      { loc: '/', priority: 1.0, changefreq: 'daily', lastmod: new Date().toISOString() },
      { loc: '/blog', priority: 0.9, changefreq: 'daily', lastmod: new Date().toISOString() },
      { loc: '/about', priority: 0.5, changefreq: 'monthly', lastmod: new Date().toISOString() },
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

  experimental: {
    // Inline each page's critical CSS directly into the HTML during SSG.
    // This removes the render-blocking external stylesheet that Vite/Tailwind
    // would otherwise emit, directly addressing FCP/LCP regressions.
    inlineStyles: true,
  },

  devtools: { enabled: true },
})
