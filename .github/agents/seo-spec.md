# SEO and AEO Specification for The Signal

Every article published on The Signal must meet these SEO and Answer Engine Optimization (AEO) requirements. The Nuxt app handles JSON-LD generation automatically from frontmatter, but the content itself must be structured for both search engines and AI answer engines.

---

## Frontmatter requirements

Every article **must** include:

| Field | Requirement |
|-------|-------------|
| `title` | 50-65 characters. Include primary keyword naturally. No clickbait. |
| `description` | 120-155 characters. Include primary keyword. Write as a compelling sentence, not a keyword list. |
| `date` | ISO 8601 date (YYYY-MM-DD) |
| `tags` | 2-5 tags. First tag is the primary topic. |
| `readingTime` | Estimated reading time (word count / 250, rounded) |

Optional but encouraged:

| Field | Purpose |
|-------|---------|
| `updated` | Last modified date (improves freshness signals) |
| `cover` | OG image path (the app generates a default if missing) |

---

## JSON-LD (handled by the app)

The Nuxt app automatically generates this structured data from frontmatter:

- **`Article`** schema with headline, description, datePublished, dateModified, author
- **`BreadcrumbList`** for navigation context
- **`WebSite`** schema on the homepage
- **`Person`** schema on the about page

The agent's job is to provide **accurate, complete frontmatter** so the generated JSON-LD is correct.

---

## On-page SEO checklist

### Title tag
- [ ] Primary keyword appears in the title
- [ ] Title is unique across the entire blog
- [ ] Title reads naturally (not keyword-stuffed)
- [ ] Length: 50-65 characters

### Meta description
- [ ] Primary keyword appears naturally
- [ ] Compelling enough to earn a click
- [ ] No duplicate descriptions across articles
- [ ] Length: 120-155 characters

### Heading structure
- [ ] `##` (H2) headings contain secondary keywords where natural
- [ ] At least 3 H2 sections in the article
- [ ] Heading hierarchy is logical (no jumping from H2 to H4)
- [ ] Headings describe what the section contains (not clever/vague)

### Content structure for AEO
- [ ] Article answers the core question within the first 2 paragraphs
- [ ] Each major section has a clear topic sentence
- [ ] At least one definition or concise explanation that could be extracted as a featured snippet
- [ ] Lists or tables where appropriate (AI engines love structured answers)
- [ ] FAQ-style Q&A section at the end if the topic warrants it

### Internal and external links
- [ ] At least 1 internal link to another article or the about page
- [ ] At least 1 external link to an authoritative source
- [ ] All links use descriptive anchor text
- [ ] No broken links

### Keyword usage
- [ ] Primary keyword appears in: title, first paragraph, at least one H2, meta description
- [ ] Secondary keywords appear in H2s and body text naturally
- [ ] Keyword density stays under 2% (write for humans, not crawlers)
- [ ] Related terms and synonyms appear throughout (semantic richness)

---

## AEO-specific guidelines

Answer Engine Optimization means structuring content so AI systems can extract clear, accurate answers.

### Write extractable answers
When explaining a concept, include one clear, self-contained explanation early in the section:

**Bad:** Spread the definition across three paragraphs with caveats mixed in.

**Good:** State the clear answer first, then add nuance:
> "Server-side rendering (SSR) generates HTML on the server for each request, sending a fully rendered page to the browser. This improves initial load time and gives search crawlers complete content to index."

Then follow with nuance, trade-offs, and examples.

### Use question headings strategically
When a section answers a common question, phrase the heading as that question:

```markdown
## What makes SSR different from static generation?
```

This matches how people actually search and how AI engines parse content.

### Provide structured comparisons
When comparing options, use a table:

```markdown
| Feature | SSR | SSG | CSR |
|---------|-----|-----|-----|
| Initial load | Fast | Fastest | Slow |
| SEO | Excellent | Excellent | Poor without extra work |
```

### Include "People also ask" content
End longer articles with a brief FAQ section addressing 2-4 related questions. Use `###` headings for each question.

---

## URL structure

Article slugs must be:
- Lowercase
- Hyphen-separated
- Descriptive (include the primary keyword)
- Under 60 characters
- No stop words unless they aid readability

**Good:** `server-side-rendering-vs-static-generation`
**Bad:** `a-comprehensive-guide-to-understanding-the-differences-between-ssr-and-ssg`
**Bad:** `ssr-vs-ssg` (too cryptic for readers)

---

## Image SEO (when images are included)

- Filename: descriptive, hyphenated (`nuxt-content-folder-structure.png`)
- Alt text: describes what the image shows, includes relevant keyword naturally
- Dimensions: specify width/height to prevent layout shift
- Format: WebP preferred, PNG for screenshots, SVG for diagrams
