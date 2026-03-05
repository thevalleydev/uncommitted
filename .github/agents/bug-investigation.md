# Bug Investigation Protocol

This document describes how to investigate and diagnose bugs reported on Uncommitted.

---

## Investigation Process

### 1. Understand the Bug Report

Read the issue carefully to understand:
- **What is happening** vs **what should happen**
- **Steps to reproduce** the issue
- **Affected area** (which page, component, or feature)
- **Severity** to prioritize effort appropriately

### 2. Reproduce the Issue

Before fixing, confirm you understand the bug:
- Follow the reproduction steps exactly
- Note any error messages in console or build output
- Check if the issue is consistent or intermittent
- Verify on multiple browsers/devices if it's a frontend bug

### 3. Locate Affected Code

Search strategies:
- **By error message**: Grep for unique strings from error messages
- **By component name**: If the bug is visual, find the relevant Vue component
- **By route**: Check `pages/` directory for page-level issues
- **By feature**: Search for related function names or comments

Common locations in this codebase:
| Area | Location |
|------|----------|
| Pages | `pages/` |
| Components | `components/` |
| Composables | `composables/` |
| Content | `content/` |
| Config | `nuxt.config.ts` |
| Styles | `assets/css/` or component `<style>` blocks |
| Build/Deploy | `.github/workflows/` |

### 4. Identify Root Cause

Ask yourself:
- **When did this break?** Check recent commits if possible
- **Why does this happen?** Trace the data/logic flow
- **What assumption is wrong?** Often bugs are edge cases or mismatched expectations

Common bug patterns in Nuxt:
- **Hydration mismatch**: Server renders different HTML than client expects
- **SSG timing**: Build-time vs runtime data differences
- **Missing prerender**: Route works with client navigation but 404s on direct access
- **Timezone issues**: Server uses UTC, client uses local timezone
- **Path issues**: Incorrect base URL or asset paths

### 5. Document Findings

Before writing the fix, note:
- The exact file(s) and line(s) causing the issue
- Why the current code doesn't work
- What change will fix it
- Any potential side effects

---

## Debugging Tools

### For Build Issues
```bash
# Clean and rebuild
rm -rf .nuxt .output
pnpm generate

# Check prerendered routes
ls .output/public/
```

### For Runtime Issues
- Browser DevTools console for errors
- Vue DevTools for component state
- Network tab for failed requests

### For Content Issues
```bash
# Query content locally
pnpm dev
# Then visit /_content/query?path=/blog
```

---

## What NOT to Do

- **Don't refactor unrelated code** — Fix only what's broken
- **Don't add dependencies** unless absolutely necessary
- **Don't change APIs** unless the bug is in the API design
- **Don't guess** — Understand the root cause before fixing

---

## Escalation

If after investigation you cannot determine the root cause:
1. Document what you've tried
2. List files you've examined
3. Note any suspicious code that might be related
4. Open the PR as a **draft** with your findings
5. Ask for human review in the PR description
