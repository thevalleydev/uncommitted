/**
 * Accessibility tests using axe-core.
 * Validates WCAG 2.1 AA compliance across all pages and viewports.
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: 'Blog article', path: '/blog/welcome-to-uncommitted' },
  { name: 'About', path: '/about' },
]

for (const page of pages) {
  test.describe(`Accessibility: ${page.name}`, () => {
    test(`should have no WCAG 2.1 AA violations`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page: pw })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      // Log violations for debugging
      if (results.violations.length > 0) {
        console.log(
          `Violations on ${page.name}:`,
          JSON.stringify(
            results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.length,
              help: v.helpUrl,
            })),
            null,
            2,
          ),
        )
      }

      expect(results.violations).toEqual([])
    })

    test(`should have proper heading hierarchy`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      // Collect all headings in order
      const headings = await pw.$$eval(
        'h1, h2, h3, h4, h5, h6',
        (els) =>
          els.map((el) => ({
            level: parseInt(el.tagName[1]),
            text: el.textContent?.trim().slice(0, 60) ?? '',
          })),
      )

      // Must have exactly one h1
      const h1s = headings.filter((h) => h.level === 1)
      expect(h1s.length).toBe(1)

      // Heading levels should not skip (e.g., h1 → h3)
      for (let i = 1; i < headings.length; i++) {
        const prevLevel = headings[i - 1].level
        const currLevel = headings[i].level
        // Current level can be deeper by at most 1, or can go up freely
        if (currLevel > prevLevel) {
          expect(currLevel - prevLevel).toBeLessThanOrEqual(1)
        }
      }
    })

    test(`should have sufficient color contrast`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page: pw })
        .withRules(['color-contrast'])
        .analyze()

      expect(results.violations).toEqual([])
    })

    test(`should have alt text on all images`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page: pw })
        .withRules(['image-alt'])
        .analyze()

      expect(results.violations).toEqual([])
    })

    test(`should have proper ARIA landmarks`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      // Must have a banner (header), main, and contentinfo (footer)
      const banner = await pw.locator('[role="banner"], header').first()
      const main = await pw.locator('[role="main"], main').first()
      const contentinfo = await pw.locator('[role="contentinfo"], footer').first()

      await expect(banner).toBeVisible()
      await expect(main).toBeVisible()
      await expect(contentinfo).toBeVisible()
    })

    test(`should have accessible navigation`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      // Nav elements must have aria-label
      const navs = await pw.locator('nav').all()
      for (const nav of navs) {
        const label = await nav.getAttribute('aria-label')
        expect(label).toBeTruthy()
      }
    })

    test(`should support keyboard navigation`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      // Tab through the page and verify focus is visible
      await pw.keyboard.press('Tab')
      const firstFocused = await pw.evaluate(() => {
        const el = document.activeElement
        return el ? el.tagName.toLowerCase() : null
      })

      // First tab should focus the skip link or a nav element
      expect(firstFocused).toBeTruthy()

      // Tab several more times — focus should always land on an interactive element
      for (let i = 0; i < 5; i++) {
        await pw.keyboard.press('Tab')
        const tag = await pw.evaluate(() => {
          const el = document.activeElement
          return el?.tagName.toLowerCase() ?? 'body'
        })
        expect(['a', 'button', 'input', 'select', 'textarea', 'summary']).toContain(tag)
      }
    })

    test(`dark mode should also pass axe checks`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      // Toggle dark mode
      const toggle = pw.getByRole('button', { name: /switch to dark mode/i })
      if (await toggle.isVisible()) {
        await toggle.click()
        // Wait for transition
        await pw.waitForTimeout(400)
      }

      const results = await new AxeBuilder({ page: pw })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      if (results.violations.length > 0) {
        console.log(
          `Dark mode violations on ${page.name}:`,
          JSON.stringify(
            results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.length,
            })),
            null,
            2,
          ),
        )
      }

      expect(results.violations).toEqual([])
    })
  })
}
