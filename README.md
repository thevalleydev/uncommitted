# The Signal

A clean, modern blog built with [Nuxt Content](https://content.nuxt.com/) and deployed to GitHub Pages. Written by **Sage Harper**.

## How it works

1. **You create a GitHub issue** using the article request template
2. **A conductor workflow** triggers and assigns the issue to the Copilot coding agent
3. **The agent researches** the topic, plans the SEO, writes the article, and opens a PR
4. **You review and merge** the PR
5. **GitHub Actions** builds the static site and deploys it to GitHub Pages

The entire publishing pipeline is automated. You just review and hit merge.

## Stack

- **[Nuxt 3](https://nuxt.com/)** with Content module for markdown-driven pages
- **[Tailwind CSS](https://tailwindcss.com/)** with Typography plugin for clean design
- **[nuxt-schema-org](https://github.com/harlan-zw/nuxt-schema-org)** for JSON-LD structured data
- **[@nuxtjs/sitemap](https://sitemap.nuxtjs.org/)** for automatic sitemap generation
- **GitHub Pages** for hosting (SSG via `nuxt generate`)
- **GitHub Copilot coding agent** for automated article writing

## Local development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Generate static site
pnpm generate

# Preview generated site
pnpm preview
```

## Project structure

```
the-signal/
├── .github/
│   ├── copilot-instructions.md     # Main agent instructions
│   ├── agents/
│   │   ├── writing-style.md        # Voice, tone, banned patterns
│   │   ├── seo-spec.md             # SEO/AEO requirements
│   │   ├── content-quality.md      # Pre-publish checklist
│   │   ├── research-protocol.md    # How to research topics
│   │   └── conductor-workflow.md   # Full workflow reference
│   ├── ISSUE_TEMPLATE/
│   │   └── article-request.yml     # Issue template for articles
│   └── workflows/
│       ├── conductor.yml           # Assigns issues to Copilot
│       └── deploy.yml              # Builds and deploys to GH Pages
├── content/
│   └── blog/                       # Markdown articles go here
├── components/                     # Vue components
├── composables/                    # Shared logic
├── layouts/                        # Page layouts
├── pages/                          # Route pages
├── public/                         # Static assets
└── nuxt.config.ts                  # Nuxt configuration
```

## Writing a new article manually

If you prefer to write an article yourself instead of using the automated pipeline:

1. Create a markdown file in `content/blog/` with the required frontmatter:

```yaml
---
title: "Your Article Title"
description: "A compelling description under 160 characters."
date: "2026-03-04"
tags:
  - topic
readingTime: "5 min read"
---
```

2. Write the article body in markdown
3. Commit and push to `main`
4. The deploy action will build and publish automatically

## SEO features

- **JSON-LD** structured data on every page (Article, BreadcrumbList, WebSite, Person)
- **Open Graph** and **Twitter Card** meta tags
- **Automatic sitemap** at `/sitemap.xml`
- **Canonical URLs** on all pages
- **Semantic HTML** structure
- **AEO-optimized** content structure (extractable answers, question headings, tables)

## Configuration

| Environment variable | Purpose | Default |
|---------------------|---------|---------|
| `NUXT_APP_BASE_URL` | Base URL path for GitHub Pages | `/the-signal/` |
| `NUXT_PUBLIC_SITE_URL` | Full site URL for meta tags | `https://thevalleydev.github.io/the-signal` |

## License

Content is copyright Sage Harper. Code is MIT licensed.
