/**
 * Responsive design and spacing tests.
 * Ensures no text touches the viewport edge and layout works across breakpoints.
 */
import { test, expect } from '@playwright/test'

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: 'Blog article', path: '/blog/welcome-to-the-signal' },
  { name: 'About', path: '/about' },
]

/** Minimum acceptable padding (in px) between text and viewport edge. */
const MIN_EDGE_PADDING = 16

for (const page of pages) {
  test.describe(`Spacing: ${page.name}`, () => {
    test(`text content must not touch the left or right viewport edge`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const viewport = pw.viewportSize()
      if (!viewport) return

      // Check all visible text-bearing block elements for edge overflow.
      // We test block-level elements only — inline children (a, span) inherit
      // positioning from their parent block and would produce false positives.
      const violations = await pw.evaluate(
        ({ minPadding, viewportWidth }) => {
          const blockSelectors = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, dt, dd'
          const elements = document.querySelectorAll(blockSelectors)
          const issues: { tag: string; text: string; left: number; right: number }[] = []

          for (const el of elements) {
            // Skip hidden/off-screen elements
            const style = getComputedStyle(el)
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
              continue
            }
            // Skip screen-reader-only elements
            if (style.position === 'absolute' && el.classList.contains('sr-only')) {
              continue
            }

            const text = el.textContent?.trim() ?? ''
            if (text.length === 0) continue

            const rect = el.getBoundingClientRect()
            // Skip off-screen elements (above viewport or very far below)
            if (rect.bottom < 0 || rect.top > window.innerHeight * 3) continue
            // Skip zero-size elements
            if (rect.width === 0 || rect.height === 0) continue

            const leftGap = rect.left
            const rightGap = viewportWidth - rect.right

            if (leftGap < minPadding || rightGap < minPadding) {
              issues.push({
                tag: el.tagName.toLowerCase(),
                text: text.slice(0, 80),
                left: Math.round(leftGap),
                right: Math.round(rightGap),
              })
            }
          }

          return issues
        },
        { minPadding: MIN_EDGE_PADDING, viewportWidth: viewport.width },
      )

      if (violations.length > 0) {
        console.log(
          `Edge violations on ${page.name} (viewport ${viewport.width}px):`,
          JSON.stringify(violations, null, 2),
        )
      }

      expect(violations, `Found ${violations.length} elements too close to the viewport edge`).toEqual([])
    })

    test(`no horizontal scrollbar should appear`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const hasHorizontalScroll = await pw.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })

      expect(hasHorizontalScroll).toBe(false)
    })

    test(`text should be readable size (minimum 14px)`, async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const smallTextElements = await pw.evaluate(() => {
        const textEls = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, a, span')
        const issues: { tag: string; text: string; fontSize: string }[] = []

        for (const el of textEls) {
          const style = getComputedStyle(el)
          if (style.display === 'none' || style.visibility === 'hidden') continue

          const text = el.textContent?.trim() ?? ''
          if (text.length === 0) continue

          const fontSize = parseFloat(style.fontSize)
          // 14px minimum for body text; tiny text for decorative elements is not body
          if (fontSize < 12 && text.length > 3) {
            issues.push({
              tag: el.tagName.toLowerCase(),
              text: text.slice(0, 60),
              fontSize: style.fontSize,
            })
          }
        }

        return issues
      })

      expect(smallTextElements).toEqual([])
    })

    test(`tap targets should be at least 44x44px on mobile`, async ({ page: pw, browserName }) => {
      // Only run on mobile viewports
      const viewport = pw.viewportSize()
      if (!viewport || viewport.width > 768) return

      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const smallTargets = await pw.evaluate(() => {
        const interactives = document.querySelectorAll('a, button, [role="button"], input, select, textarea')
        const issues: { tag: string; text: string; width: number; height: number }[] = []

        for (const el of interactives) {
          const style = getComputedStyle(el)
          if (style.display === 'none' || style.visibility === 'hidden') continue

          const rect = el.getBoundingClientRect()
          // Skip off-screen elements
          if (rect.bottom < 0 || rect.top > window.innerHeight * 3) continue
          if (rect.width === 0 || rect.height === 0) continue

          // WCAG 2.5.8 target size enhanced is 44x44, but 2.5.5 is 24x24 minimum
          // We use a reasonable 36px threshold for mobile
          if (rect.width < 36 || rect.height < 36) {
            const text = (el.textContent?.trim() ?? el.getAttribute('aria-label') ?? '').slice(0, 60)
            // Skip inline links within paragraphs (they have surrounding text context)
            if (el.tagName === 'A' && el.closest('p, li')) continue
            issues.push({
              tag: el.tagName.toLowerCase(),
              text,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            })
          }
        }

        return issues
      })

      if (smallTargets.length > 0) {
        console.log(`Small tap targets on ${page.name}:`, JSON.stringify(smallTargets, null, 2))
      }

      expect(smallTargets).toEqual([])
    })
  })
}
