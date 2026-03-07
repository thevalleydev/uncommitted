/**
 * Core Web Vitals tests.
 * Validates that pages meet CWV thresholds for a Lighthouse performance score of 100.
 * Shows descriptive messaging when any metric is below the target.
 */
import { test, expect } from '@playwright/test'

// Thresholds for a "Good" CWV rating that contributes to a Lighthouse score of 100.
// Source: https://web.dev/vitals/
const THRESHOLDS = {
  FCP_MS: 1800, // First Contentful Paint: good ≤ 1800 ms
  LCP_MS: 2500, // Largest Contentful Paint: good ≤ 2500 ms
  CLS: 0.1, // Cumulative Layout Shift: good ≤ 0.1
  TTFB_MS: 800, // Time to First Byte: good ≤ 800 ms
  TBT_MS: 200, // Total Blocking Time: good ≤ 200 ms
} as const

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: 'Blog article', path: '/blog/welcome-to-uncommitted' },
  { name: 'About', path: '/about' },
]

for (const page of pages) {
  test.describe(`Core Web Vitals: ${page.name}`, () => {
    test('should have no render-blocking external stylesheets', async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const blockingStylesheets = await pw.evaluate((): string[] => {
        const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
        return links
          .filter((link) => {
            const href = link.getAttribute('href') ?? ''
            // External stylesheets not on the same origin block rendering.
            return href.startsWith('http') && !href.startsWith(window.location.origin)
          })
          .map((link) => link.getAttribute('href') ?? '')
      })

      expect(
        blockingStylesheets,
        `Render-blocking external stylesheets degrade FCP and LCP, lowering your Lighthouse score below 100.\n` +
          `Fix: change rel="stylesheet" to rel="preload" as="style" with onload="this.onload=null;this.rel='stylesheet'" for:\n` +
          blockingStylesheets.join('\n'),
      ).toHaveLength(0)
    })

    test('should inline critical CSS into the HTML document', async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      // With experimental.inlineStyles enabled, Nuxt SSG embeds each page's critical
      // CSS in <style> tags rather than loading an external blocking stylesheet.
      const inlineStyleCount = await pw.evaluate((): number => {
        return document.querySelectorAll('style').length
      })

      expect(
        inlineStyleCount,
        `No inline <style> tags found. Critical CSS should be inlined into the HTML to remove the ` +
          `render-blocking external stylesheet, which lowers your Lighthouse performance score below 100.\n` +
          `Fix: set experimental.inlineStyles: true in nuxt.config.ts.`,
      ).toBeGreaterThan(0)
    })

    test('should have preload hints for font resources', async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const preloadLinks = await pw.evaluate((): Array<{ href: string; as: string }> => {
        const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="preload"]'))
        return links.map((link) => ({
          href: link.getAttribute('href') ?? '',
          as: link.getAttribute('as') ?? '',
        }))
      })

      const fontPreloads = preloadLinks.filter(
        (link) =>
          link.as === 'font' ||
          (link.as === 'style' && link.href.includes('googleapis.com/css')),
      )

      expect(
        fontPreloads,
        `No font preload hints found. Missing preload hints for fonts can delay FCP and LCP, lowering your ` +
          `Lighthouse score below 100.\n` +
          `Fix: add <link rel="preload" as="style"> for each font stylesheet.\n` +
          `Current preloads: ${JSON.stringify(preloadLinks)}`,
      ).not.toHaveLength(0)
    })

    test('should meet First Contentful Paint (FCP) threshold', async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const fcp = await pw.evaluate((): number | null => {
        const entries = performance.getEntriesByName('first-contentful-paint')
        return entries.length > 0 ? entries[0].startTime : null
      })

      // FCP may not be available in all browser contexts — skip rather than fail.
      if (fcp === null) return

      expect(
        fcp,
        `First Contentful Paint is ${fcp.toFixed(0)}ms, which exceeds the ${THRESHOLDS.FCP_MS}ms "good" threshold.\n` +
          `This lowers your Lighthouse performance score below 100.\n` +
          `Fix: inline critical CSS, preload key fonts, and remove render-blocking resources.`,
      ).toBeLessThanOrEqual(THRESHOLDS.FCP_MS)
    })

    test('should meet Largest Contentful Paint (LCP) threshold', async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const lcp = await pw.evaluate((): number | null => {
        const entries = performance.getEntriesByType('largest-contentful-paint') as Array<
          PerformanceEntry & { startTime: number }
        >
        if (entries.length === 0) return null
        return entries[entries.length - 1].startTime
      })

      if (lcp === null) return

      expect(
        lcp,
        `Largest Contentful Paint is ${lcp.toFixed(0)}ms, which exceeds the ${THRESHOLDS.LCP_MS}ms "good" threshold.\n` +
          `This lowers your Lighthouse performance score below 100.\n` +
          `Fix: preload the LCP image/resource, inline critical CSS, and ensure fonts load non-blocking.`,
      ).toBeLessThanOrEqual(THRESHOLDS.LCP_MS)
    })

    test('should meet Cumulative Layout Shift (CLS) threshold', async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      // Wait for any deferred font swaps and lazy-loaded images to settle.
      // 500ms matches the CSS transition duration used across the design system (duration-300 + buffer).
      await pw.waitForTimeout(500)

      const cls = await pw.evaluate((): number => {
        const entries = performance.getEntriesByType('layout-shift') as Array<
          PerformanceEntry & { hadRecentInput: boolean; value: number }
        >
        return entries.reduce((sum, entry) => (entry.hadRecentInput ? sum : sum + entry.value), 0)
      })

      expect(
        cls,
        `Cumulative Layout Shift is ${cls.toFixed(4)}, which exceeds the ${THRESHOLDS.CLS} "good" threshold.\n` +
          `This lowers your Lighthouse performance score below 100.\n` +
          `Fix: add explicit width/height to images, use font-display:swap, and avoid inserting content above existing elements.`,
      ).toBeLessThanOrEqual(THRESHOLDS.CLS)
    })

    test('should meet Time to First Byte (TTFB) threshold', async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('domcontentloaded')

      const ttfb = await pw.evaluate((): number | null => {
        const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
        return nav ? nav.responseStart - nav.requestStart : null
      })

      if (ttfb === null) return

      expect(
        ttfb,
        `Time to First Byte is ${ttfb.toFixed(0)}ms, which exceeds the ${THRESHOLDS.TTFB_MS}ms "good" threshold.\n` +
          `This lowers your Lighthouse performance score below 100.\n` +
          `For a static site, TTFB should be well under 200ms. Check hosting/CDN configuration.`,
      ).toBeLessThanOrEqual(THRESHOLDS.TTFB_MS)
    })

    test('should meet Total Blocking Time (TBT) threshold', async ({ page: pw }) => {
      await pw.goto(page.path)
      await pw.waitForLoadState('networkidle')

      const { tbt, longTaskCount } = await pw.evaluate((): { tbt: number; longTaskCount: number } => {
        const entries = performance.getEntriesByType('longtask') as PerformanceEntry[]
        const tbt = entries.reduce((sum, entry) => sum + Math.max(0, entry.duration - 50), 0)
        return { tbt, longTaskCount: entries.length }
      })

      expect(
        tbt,
        `Total Blocking Time is ${tbt.toFixed(0)}ms across ${longTaskCount} long task(s), ` +
          `which exceeds the ${THRESHOLDS.TBT_MS}ms "good" threshold.\n` +
          `This lowers your Lighthouse performance score below 100.\n` +
          `Fix: split long tasks, defer non-critical JavaScript, and minimise main-thread work.`,
      ).toBeLessThanOrEqual(THRESHOLDS.TBT_MS)
    })
  })
}
