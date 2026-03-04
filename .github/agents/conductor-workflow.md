# Conductor Workflow Reference

This document describes the full end-to-end workflow for producing an article on The Signal, from issue creation to published post.

---

## Trigger

A new GitHub issue is created with the `article` label using the article-request issue template. The issue contains:

- **Title**: The article topic or proposed title
- **Description**: Context, desired angle, target audience, or any specific requirements
- **Keywords** (optional): Suggested keywords to target
- **References** (optional): Links, papers, or sources the requester wants included

---

## Automated steps

### 1. Issue acknowledgment

The `conductor.yml` GitHub Action fires on the `article` label. It posts a comment confirming the workflow has started and outlining the plan.

### 2. Agent assignment

The action assigns the issue to the Copilot coding agent. Copilot reads:

1. `.github/copilot-instructions.md` (primary instructions)
2. `.github/agents/research-protocol.md` (how to research)
3. `.github/agents/writing-style.md` (voice and banned patterns)
4. `.github/agents/seo-spec.md` (SEO requirements)
5. `.github/agents/content-quality.md` (quality checklist)

### 3. Research phase

The agent follows the research protocol:
- Searches for existing coverage of the topic
- Gathers concrete facts and data points
- Identifies areas of nuance or debate
- Determines the article's unique angle

### 4. Planning phase

The agent creates:
- A working title (may differ from the issue title)
- Target keywords (primary + 2-3 secondary)
- A meta description
- An article outline
- The JSON-LD type (usually `Article`)

### 5. Writing phase

The agent writes the article as a markdown file following:
- The voice and tone rules in `writing-style.md`
- The SEO structure requirements in `seo-spec.md`
- Proper frontmatter format from `copilot-instructions.md`

### 6. Quality check

The agent runs through every item in `content-quality.md`:
- Writing quality (voice, AI detection avoidance, substance)
- SEO metadata (frontmatter, on-page structure, AEO readiness)
- Technical validity (markdown, YAML, links)

### 7. Pull request

The agent commits the article to `content/blog/<slug>.md` and opens a PR:
- PR title: `article: <article title>`
- PR body includes: SEO spec, research sources, and `Closes #<issue-number>`
- The PR targets the `main` branch

---

## Manual steps

### 8. Human review

The repo owner reviews the PR:
- Read the article for quality and accuracy
- Check that the SEO spec makes sense
- Verify research sources are credible
- Request changes if needed

### 9. Merge and deploy

On merge to `main`, the `deploy.yml` GitHub Action:
1. Installs dependencies
2. Runs `nuxt generate` to build the static site
3. Deploys to GitHub Pages

The new article is live within minutes.

---

## Diagram

```
Issue created ──▶ Label "article" added
                        │
                        ▼
              Conductor Action fires
                        │
                        ▼
              Copilot agent assigned
                        │
                ┌───────┴───────┐
                │   Research     │
                │   topic        │
                └───────┬───────┘
                        │
                ┌───────┴───────┐
                │   Plan SEO     │
                │   & outline    │
                └───────┬───────┘
                        │
                ┌───────┴───────┐
                │   Write        │
                │   article      │
                └───────┬───────┘
                        │
                ┌───────┴───────┐
                │   Quality      │
                │   check        │
                └───────┬───────┘
                        │
                        ▼
              PR opened for review
                        │
                        ▼
              Human reviews & merges
                        │
                        ▼
              Deploy Action builds SSG
                        │
                        ▼
              Live on GitHub Pages
```

---

## Failure modes

| Problem | Resolution |
|---------|------------|
| Agent can't research the topic adequately | It should state what it couldn't find and open the PR as draft |
| Article fails quality checklist | Agent should fix issues before opening PR; if it can't, note failures in PR body |
| Issue is too vague | Agent posts a comment asking for clarification and does NOT proceed until the issue is updated |
| Duplicate topic | Agent checks existing `content/blog/` for similar topics and notes this in the PR |
