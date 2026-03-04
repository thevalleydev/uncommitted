# Design System Guide for The Signal

This document defines the visual design language for The Signal. Every component, page, and visual element must follow these principles. When creating or modifying any UI, consult this guide first.

---

## Core principles

### 1. Modern minimalism
Less is more. Every element on the page should earn its place. If something can be removed without losing meaning, remove it. White space (or dark space in dark mode) is a design element, not wasted area.

### 2. Responsive-first thinking
Every component must work beautifully across all viewport sizes. Design decisions are mobile-first, enhanced for larger screens. Never assume a fixed width.

### 3. Dark/light mode parity
Every visual element must look intentional in both light and dark modes. Dark mode is not an afterthought. It requires its own color choices, contrast ratios, and shadow treatments.

### 4. Subtle depth through glass
Use glassmorphism (backdrop-blur + translucent backgrounds) to create gentle layering. Glass effects should suggest depth without being distracting. The effect is most impactful on overlapping elements like the sticky header and floating cards.

---

## Color system

### Light mode palette
- **Background**: `zinc-50` (not white; slightly warm, reduces eye strain)
- **Surface (glass)**: `white/70` with `backdrop-blur-xl`
- **Text primary**: `zinc-900`
- **Text secondary**: `zinc-500`
- **Text muted**: `zinc-400`
- **Borders**: `zinc-200/50` (translucent, works with glass)
- **Accent**: `signal-600` (amber)
- **Accent hover**: `signal-700`

### Dark mode palette
- **Background**: `zinc-950` (deep, near-black)
- **Surface (glass)**: `zinc-900/60` with `backdrop-blur-xl`
- **Text primary**: `zinc-50` to `zinc-100`
- **Text secondary**: `zinc-400`
- **Text muted**: `zinc-500`
- **Borders**: `zinc-800/50` (subtle, doesn't cut the glass feel)
- **Accent**: `signal-400` (brighter amber for dark backgrounds)
- **Accent hover**: `signal-300`

### Contrast requirements
- Body text on background: minimum 7:1 ratio (WCAG AAA)
- Secondary text: minimum 4.5:1 ratio (WCAG AA)
- Interactive elements: clear hover/focus states in both modes

---

## Glassmorphism rules

### When to use glass
- Sticky header (always)
- Blog post cards
- Table of contents
- Author footer card
- Any floating or overlapping surface

### When NOT to use glass
- Page backgrounds
- Inline text elements
- Navigation links
- Simple list items

### Glass implementation
```css
/* Light mode */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Dark mode */
.dark .glass {
  background: rgba(24, 24, 27, 0.6);
  border: 1px solid rgba(63, 63, 70, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Glass intensity levels
- **Full glass** (`.glass`): Cards, header. Prominent blur and translucency.
- **Subtle glass** (`.glass-subtle`): Secondary surfaces. Lighter effect.
- Never stack multiple glass layers on top of each other (creates muddiness).

---

## Spacing and layout

### Container widths
- **Narrow** (`container-narrow`): `max-w-2xl` (672px). Used for article text, about page prose.
- **Wide** (`container-wide`): `max-w-5xl` (1024px). Used for grids, header, footer.

### Horizontal padding
- Mobile: `px-6` (24px on each side)
- Tablet: `px-8` (32px)
- Desktop (wide containers): `px-12` (48px through `lg:px-12`)

Content should never touch the viewport edges. Comfortable padding creates breathing room that makes the design feel intentional, not cramped.

### Vertical rhythm
- Section spacing: `py-20` to `py-24` (generous vertical breathing room)
- Between heading and content: `mb-8` to `mb-12`
- Between cards in a grid: `gap-6`
- Paragraph spacing in prose: handled by Tailwind Typography

### Grid layouts
- Blog card grid: `sm:grid-cols-2 lg:grid-cols-3`
- Always use CSS Grid over Flexbox for card layouts
- Cards should be equal height in a row

---

## Typography

### Font stack
- **Headings and UI**: Inter (sans-serif)
- **Body text in articles**: Handled by Tailwind Typography (uses body font)
- **Serif accent**: Lora (available for pull quotes or special elements)

### Heading sizes
- Page title (`h1`): `text-3xl sm:text-4xl` or `text-4xl sm:text-5xl` for hero
- Section heading (`h2`): Handled by prose styles
- Subsection (`h3`): Handled by prose styles
- All headings: `font-bold tracking-tight`

### Text colors by context
| Context | Light | Dark |
|---------|-------|------|
| Page title | `zinc-900` | `zinc-50` |
| Body text | `zinc-800` (default) | `zinc-200` (default) |
| Secondary text | `zinc-500` | `zinc-400` |
| Muted / meta | `zinc-400` | `zinc-500` |
| Links | `signal-600` | `signal-400` |

---

## Interactive elements

### Buttons
- Primary: `bg-signal-600 text-white` with `shadow-lg shadow-signal-600/20`
- Hover: `bg-signal-700` with slightly stronger shadow
- Dark mode shadow: `shadow-signal-500/10` (less intense)
- Border radius: `rounded-full` for primary actions
- Padding: `px-7 py-3` (generous, touch-friendly)

### Cards
- Use `.glass` for the surface
- Border radius: `rounded-2xl` (16px, modern feel)
- Hover: `.card-hover` class (slight lift + shadow increase)
- Dark mode hover shadow: stronger with visible darkness underneath

### Links
- Accent color: `signal-600` / `signal-400` (dark)
- Underline on hover only (except in prose where Tailwind Typography handles it)
- Smooth transition: `transition-colors`

### Tag pills
- Light: `bg-zinc-100 text-zinc-600`
- Dark: `bg-zinc-800/60 text-zinc-400`
- Hover: accent tint (`bg-signal-100` / `bg-signal-900/40`)

---

## Component patterns

### Sticky header
- Always sticky (`sticky top-0 z-50`)
- Glass surface with bottom border
- Padding: `py-4` (compact, not bulky)
- Contains: logo, nav links, dark mode toggle

### Blog card
- Glass surface with `rounded-2xl`
- Content: date, title, description, tags
- Entire card is a link (NuxtLink wraps everything)
- Hover: lift + shadow via `.card-hover`
- Title changes color on group hover

### Author footer (in articles)
- Glass surface with `rounded-2xl`
- Avatar circle with initials
- Name + role text
- Light: `bg-signal-100` avatar / Dark: `bg-signal-900/40` avatar

---

## Transitions and animation

- Color transitions: `transition-colors duration-300` (for dark mode toggle)
- Hover effects: `transition-all duration-200 ease-out`
- Cards: translate + shadow on hover (subtle, max `-translate-y-0.5`)
- No bouncing, no sliding, no attention-seeking animations
- Prefer `ease-out` for hover, `ease-in-out` for state changes

---

## What to avoid

- **Bright white backgrounds**: Use `zinc-50` in light mode, never `white`
- **Hard borders**: Prefer translucent borders (`zinc-200/50`, `zinc-800/50`)
- **Heavy shadows in light mode**: Keep shadows subtle (`shadow-sm`)
- **Colored backgrounds for sections**: The glass treatment handles visual separation
- **Rounded corners inconsistency**: Cards and surfaces use `rounded-2xl`, buttons use `rounded-full` or `rounded-xl`
- **Edge-to-edge content**: Always maintain comfortable horizontal padding
- **Fixed pixel widths**: Use max-width with percentage/responsive padding
- **Dark mode as an afterthought**: Design both modes simultaneously
- **Overly decorative elements**: No gradients on backgrounds, no patterns, no decorative shapes
- **Inconsistent spacing**: Follow the vertical rhythm system above

---

## Checklist for new components

When creating any new UI element:

- [ ] Works at 320px, 768px, 1024px, and 1440px viewports
- [ ] Has explicit `dark:` variants for all color classes
- [ ] Uses the correct container width (narrow or wide)
- [ ] Follows the spacing system (no arbitrary magic numbers)
- [ ] Glass surfaces use the `.glass` or `.glass-subtle` class
- [ ] Interactive elements have visible hover/focus states in both modes
- [ ] Text meets contrast requirements in both modes
- [ ] Border radius matches the system (`rounded-2xl` for surfaces, `rounded-xl` for small elements)
- [ ] Transitions are smooth and subtle
- [ ] No content touches the viewport edge at any screen size
