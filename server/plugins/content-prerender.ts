/**
 * Dynamically adds all blog content routes and tag routes to prerender at build time.
 * Respects the `draft` frontmatter field - draft posts are not prerendered.
 */
import { serverQueryContent } from '#content/server'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('prerender:routes', async (routes) => {
    try {
      // Create a minimal event object for serverQueryContent
      const event = {} as any
      
      // Query all blog content
      const articles = await serverQueryContent(event, 'blog').find()
      
      const published = articles.filter(a => a._path && !a.draft)
      
      for (const article of published) {
        routes.add(article._path!)
      }
      
      // Collect unique tags from all published articles and add tag routes
      const tags = new Set<string>()
      for (const article of published) {
        if (Array.isArray(article.tags)) {
          for (const tag of article.tags) {
            tags.add(tag)
          }
        }
      }
      for (const tag of tags) {
        routes.add(`/blog/tag/${tag}`)
      }
      
      console.log(`[content-prerender] Added ${published.length} blog routes and ${tags.size} tag routes`)
    } catch (error) {
      console.error('[content-prerender] Failed to query content:', error)
    }
  })
})
