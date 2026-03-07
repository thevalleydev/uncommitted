/**
 * SEO and structured data validation tests.
 * Ensures JSON-LD, meta tags, and semantic HTML are present and correct.
 */
import { test, expect } from '@playwright/test'

const pages = [
  { name: 'Home', path: '/', expectedType: 'WebSite' },
  { name: 'Blog', path: '/blog', expectedType: 'CollectionPage' },
  { name: 'Blog article', path: '/blog/welcome-to-uncommitted', expectedType: 'Article' },
  { name: 'About', path: '/about', expectedType: 'WebPage' },
]

for (const page of pages) {
  test.describe(`SEO: ${page.name}`, () => {
    test(`should have valid JSON-LD structured data`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const jsonLdScripts = await pw.$$eval(
        'script[type="application/ld+json"]',
        (scripts) =>
          scripts.map((s) => {
            try {
              return { valid: true, data: JSON.parse(s.textContent ?? '') }
            } catch {
              return { valid: false, raw: s.textContent?.slice(0, 200) }
            }
          }),
      )

      // Must have at least one JSON-LD block
      expect(jsonLdScripts.length).toBeGreaterThan(0)

      // All JSON-LD blocks must be valid JSON
      for (const script of jsonLdScripts) {
        expect(script.valid).toBe(true)
      }
    })

    test(`should have essential meta tags`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      // Title must exist and not be empty
      const title = await pw.title()
      expect(title.length).toBeGreaterThan(0)
      expect(title).toContain('Uncommitted')

      // Meta description
      const description = await pw.$eval(
        'meta[name="description"]',
        (el) => el.getAttribute('content') ?? '',
      )
      expect(description.length).toBeGreaterThan(0)

      // OG tags
      const ogTitle = await pw.$eval(
        'meta[property="og:title"]',
        (el) => el.getAttribute('content') ?? '',
      )
      expect(ogTitle.length).toBeGreaterThan(0)

      const ogDescription = await pw.$eval(
        'meta[property="og:description"]',
        (el) => el.getAttribute('content') ?? '',
      )
      expect(ogDescription.length).toBeGreaterThan(0)
    })

    test(`should have proper viewport meta tag`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const viewport = await pw.$eval(
        'meta[name="viewport"]',
        (el) => el.getAttribute('content') ?? '',
      )
      expect(viewport).toContain('width=device-width')
    })

    test(`should have lang attribute on html`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const lang = await pw.$eval('html', (el) => el.getAttribute('lang'))
      expect(lang).toBe('en')
    })

    test(`all links should have accessible names`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const linksWithoutNames = await pw.evaluate(() => {
        const links = document.querySelectorAll('a')
        const issues: { href: string; html: string }[] = []

        for (const link of links) {
          const text = link.textContent?.trim() ?? ''
          const ariaLabel = link.getAttribute('aria-label') ?? ''
          const ariaLabelledBy = link.getAttribute('aria-labelledby') ?? ''
          const title = link.getAttribute('title') ?? ''
          const img = link.querySelector('img[alt]')

          if (!text && !ariaLabel && !ariaLabelledBy && !title && !img) {
            issues.push({
              href: link.getAttribute('href') ?? '',
              html: link.outerHTML.slice(0, 200),
            })
          }
        }

        return issues
      })

      expect(linksWithoutNames).toEqual([])
    })
  })
}
