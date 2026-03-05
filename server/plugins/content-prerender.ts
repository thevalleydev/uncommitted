/**
 * Dynamically adds all blog content routes to prerender at build time.
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
      
      for (const article of articles) {
        // Skip drafts and items without a path
        if (article._path && !article.draft) {
          routes.add(article._path)
        }
      }
      
      console.log(`[content-prerender] Added ${articles.filter(a => !a.draft).length} blog routes`)
    } catch (error) {
      console.error('[content-prerender] Failed to query content:', error)
    }
  })
})
