# Content Quality Checklist

Run through **every item** before committing an article. If any item fails, fix it before opening the PR.

---

## Writing quality

### Voice and tone
- [ ] Reads like Sage Harper wrote it (direct, curious, conversational)
- [ ] No academic or corporate stiffness
- [ ] Contractions used naturally (it's, don't, won't, that's)
- [ ] At least one moment of personality (a joke, an aside, a strong opinion)

### AI detection avoidance
- [ ] **Zero em-dashes (—)** in the entire article
- [ ] No phrases from the banned list in `writing-style.md`
- [ ] Sentence lengths vary (check: does any paragraph have 3+ sentences of similar length?)
- [ ] Paragraph structures vary (not every paragraph is "topic sentence + supporting detail + wrap-up")
- [ ] List items vary in length and grammatical structure
- [ ] Opening does NOT follow the "In today's X, Y is more important than ever" template
- [ ] Closing does NOT follow the "In conclusion" template
- [ ] No three-synonym patterns ("fast, efficient, and streamlined")
- [ ] Transitions between sections are varied (not all "Now let's look at...")

### Substance
- [ ] Article makes a clear, specific point (not vague "X is important" content)
- [ ] At least 3 concrete facts, examples, or data points from research
- [ ] Sources are referenced (inline or in a sources section)
- [ ] Counterarguments or nuance acknowledged where relevant
- [ ] Article length is 800-2500 words (enough depth without padding)

### Readability
- [ ] Paragraphs are 2-4 sentences (occasional 1-sentence paragraphs are fine)
- [ ] No wall-of-text sections longer than 5 sentences without a break
- [ ] Code blocks have language specified and are relevant (not decorative)
- [ ] Every link has descriptive anchor text
- [ ] Headers accurately describe section content

---

## SEO and metadata

### Frontmatter
- [ ] `title` is 50-65 characters and includes primary keyword
- [ ] `description` is 120-155 characters and includes primary keyword
- [ ] `date` is correct ISO format
- [ ] `tags` has 2-5 entries, first one is primary topic
- [ ] `readingTime` is calculated (word count / 250, rounded up)
- [ ] `slug` (filename) is URL-friendly and under 60 characters

### On-page structure
- [ ] Primary keyword in title, first paragraph, at least one H2, and meta description
- [ ] At least 3 H2 sections
- [ ] Heading hierarchy is logical (H2 > H3, no skipping levels)
- [ ] At least 1 internal link to another article or page on the site
- [ ] At least 1 external link to an authoritative source
- [ ] No duplicate content from other articles on the site

### AEO readiness
- [ ] Core question answered within first 2 paragraphs
- [ ] At least one clear, extractable definition or explanation
- [ ] Structured data where helpful (tables, lists)
- [ ] Question-phrased headings where appropriate

---

## Technical

- [ ] File is valid markdown (renders correctly)
- [ ] Frontmatter is valid YAML
- [ ] **No `# H1` heading in the markdown body** — the page template renders the title from frontmatter; starting with `##` is correct
- [ ] Heading hierarchy starts at `##` and never skips levels (`## → ###`, not `## → ####`)
- [ ] No broken internal links
- [ ] No hardcoded absolute URLs to the site (use relative paths)
- [ ] Images have alt text (if any images are included)
- [ ] File is placed in `content/blog/` directory
- [ ] Filename matches the slug pattern: lowercase, hyphenated, `.md` extension

---

## Final pass

Read the article aloud (or simulate reading it aloud). Does it sound like something a human wrote with intention? Or does it sound like content-shaped filler? If the latter, rewrite the weak sections.

Check the opening paragraph one more time. It's the most important paragraph in the article. Does it earn the reader's next paragraph? If not, rewrite it.

Check the last paragraph. Does it leave the reader with something to think about or do? If not, sharpen it.
