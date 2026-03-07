/**
 * Composable for generating consistent SEO meta tags and structured data across pages.
 * Uses graph-based JSON-LD approach for optimal search engine understanding.
 */

interface BreadcrumbItem {
  name: string
  path?: string // Optional for last item (current page)
}

interface HowToStep {
  name: string
  text: string
  image?: string
}

interface ArticleOptions {
  publishedTime: string
  modifiedTime?: string
  author?: string
  tags?: string[]
  section?: string
  cover?: string
}

interface CollectionItem {
  name: string
  url: string
  description?: string
  image?: string
}

interface SeoOptions {
  title: string
  description: string
  path: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'profile'
  breadcrumbs?: BreadcrumbItem[]
  article?: ArticleOptions
  collection?: CollectionItem[]
  howTo?: {
    name: string
    description: string
    steps: HowToStep[]
    totalTime?: string
  }
}

const SITE_URL = 'https://uncommitted.blog'
const SITE_NAME = 'Uncommitted'

export function usePageSeo(options: SeoOptions) {
  const fullTitle = options.title.includes(SITE_NAME)
    ? options.title
    : `${options.title} - ${SITE_NAME}`

  const canonicalUrl = `${SITE_URL}${options.path}`
  const ogImageUrl = options.ogImage ?? `${SITE_URL}/og-default.svg`

  // Core meta tags
  useSeoMeta({
    title: fullTitle,
    ogTitle: options.title,
    description: options.description,
    ogDescription: options.description,
    ogType: options.ogType ?? 'website',
    ogSiteName: SITE_NAME,
    ogImage: ogImageUrl,
    ogUrl: canonicalUrl,
    ogLocale: 'en_US',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: ogImageUrl,
    ...(options.article
      ? {
          articlePublishedTime: options.article.publishedTime,
          articleModifiedTime: options.article.modifiedTime,
          articleAuthor: options.article.author ? [options.article.author] : undefined,
          articleTag: options.article.tags,
          articleSection: options.article.section,
        }
      : {}),
  })

  // Canonical URL
  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  })

  // Build schema.org structured data
  const schemas: Parameters<typeof useSchemaOrg>[0] = []

  // WebPage schema (always present)
  schemas.push(
    defineWebPage({
      name: options.title,
      description: options.description,
      url: canonicalUrl,
    })
  )

  // Breadcrumb schema
  if (options.breadcrumbs?.length) {
    schemas.push(
      defineBreadcrumb({
        itemListElement: options.breadcrumbs.map((item, index) => ({
          '@type': 'ListItem' as const,
          position: index + 1,
          name: item.name,
          ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
        })),
      })
    )
  }

  // Article schema
  if (options.article) {
    schemas.push(
      defineArticle({
        headline: options.title,
        description: options.description,
        datePublished: options.article.publishedTime,
        dateModified: options.article.modifiedTime ?? options.article.publishedTime,
        author: options.article.author ? {
          '@type': 'Person',
          name: options.article.author,
        } : undefined,
        image: options.article.cover ?? ogImageUrl,
        articleSection: (options.article.section ?? 'Technology') as never,
        keywords: options.article.tags,
      })
    )
  }

  // ItemList schema for collection pages
  if (options.collection?.length) {
    schemas.push({
      '@type': 'ItemList',
      name: options.title,
      description: options.description,
      numberOfItems: options.collection.length,
      itemListElement: options.collection.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: `${SITE_URL}${item.url}`,
        description: item.description,
      })),
    } as never)
  }

  // HowTo schema for tutorial content
  if (options.howTo) {
    schemas.push({
      '@type': 'HowTo',
      name: options.howTo.name,
      description: options.howTo.description,
      totalTime: options.howTo.totalTime,
      step: options.howTo.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        image: step.image,
      })),
    } as never)
  }

  useSchemaOrg(schemas)
}

/**
 * Helper to generate breadcrumbs for common page types
 */
export function useBreadcrumbs(type: 'home' | 'blog' | 'article' | 'tag' | 'about', extra?: { name: string; path?: string }): BreadcrumbItem[] {
  const home: BreadcrumbItem = { name: 'Home', path: '/' }
  const blog: BreadcrumbItem = { name: 'Blog', path: '/blog' }

  switch (type) {
    case 'home':
      return [home]
    case 'blog':
      return [home, blog]
    case 'article':
      return extra ? [home, blog, extra] : [home, blog]
    case 'tag':
      return extra ? [home, blog, { name: 'Tags', path: '/blog' }, extra] : [home, blog]
    case 'about':
      return [home, { name: 'About', path: '/about' }]
    default:
      return [home]
  }
}
