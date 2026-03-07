/**
 * Dynamic sitemap source for tag pages.
 * The @nuxtjs/sitemap module picks up this /__sitemap__/urls endpoint automatically.
 * Each tag URL gets a lastmod derived from the most recently updated article with that tag.
 */
import { serverQueryContent } from '#content/server'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const articles = await serverQueryContent(event, 'blog')
    .where({ draft: { $ne: true } })
    .find()

  // Build a map of tag -> most recent lastmod date
  const tagLastmod = new Map<string, string>()
  for (const article of articles) {
    if (!Array.isArray(article.tags)) continue
    const lastmod: string = article.updated || article.date || ''
    for (const tag of article.tags as string[]) {
      const existing = tagLastmod.get(tag)
      if (!existing || lastmod > existing) {
        tagLastmod.set(tag, lastmod)
      }
    }
  }

  return [...tagLastmod.entries()].map(([tag, lastmod]) => ({
    loc: `/blog/tag/${encodeURIComponent(tag)}`,
    changefreq: 'weekly',
    priority: 0.6,
    ...(lastmod ? { lastmod } : {}),
  }))
})
