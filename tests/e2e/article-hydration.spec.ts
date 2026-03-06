/**
 * Regression tests for article page hydration.
 *
 * GitHub Pages (and the local static server) redirect /blog/slug → /blog/slug/.
 * Before the fix, route.path included the trailing slash, so the useAsyncData
 * key on the client ("blog-/blog/slug/") didn't match the prerendered payload
 * key ("blog-/blog/slug"), leaving article.value null and throwing a 404.
 *
 * These tests navigate to the post-redirect URL (with trailing slash) and assert
 * that the article content is visible after hydration — not a 404 page.
 */
import { test, expect } from '@playwright/test'

const articleSlug = 'welcome-to-uncommitted'
const articlePath = `/blog/${articleSlug}`

test.describe('Article hydration: trailing-slash URL', () => {
  test('article content is visible when navigating to URL with trailing slash', async ({
    page,
  }) => {
    // Navigate directly to the trailing-slash URL (the shape the browser sees
    // after the GitHub Pages / static-server redirect).
    await page.goto(`${articlePath}/`)
    await page.waitForLoadState('networkidle')

    // The article <h1> must be present and non-empty — a 404 page has no article h1.
    const h1 = page.locator('article h1').first()
    await expect(h1).toBeVisible()
    const heading = await h1.textContent()
    expect(heading?.trim().length).toBeGreaterThan(0)
  })

  test('page does not show a 404 error when navigating to URL with trailing slash', async ({
    page,
  }) => {
    await page.goto(`${articlePath}/`)
    await page.waitForLoadState('networkidle')

    // A 404 page from Nuxt contains "404" in the document.
    // The article page must NOT contain a standalone 404 heading.
    const body = await page.textContent('body')
    expect(body).not.toMatch(/\b404\b/)
  })

  test('article content is still visible after client-side hydration completes', async ({
    page,
  }) => {
    await page.goto(`${articlePath}/`)
    // Wait for Vue to fully hydrate by polling for the absence of the
    // data-v-inspector / nuxt-loading indicators and for the first paragraph
    // inside the prose content block to appear.
    await page.waitForLoadState('networkidle')

    const proseContent = page.locator('.prose p').first()
    await expect(proseContent).toBeVisible()
    const text = await proseContent.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('canonical URL in <head> does not contain a trailing slash', async ({ page }) => {
    await page.goto(`${articlePath}/`)
    await page.waitForLoadState('networkidle')

    const canonical = await page.$eval(
      'link[rel="canonical"]',
      (el) => el.getAttribute('href') ?? '',
    )
    expect(canonical).not.toMatch(/\/$/)
    expect(canonical).toContain(articleSlug)
  })
})
