# Bug Fix Checklist

Run through **every item** before opening a PR for a bug fix. If any item fails, address it before submitting.

---

## Fix Quality

### Scope
- [ ] Fix addresses **only** the reported bug
- [ ] No unrelated refactoring or "improvements"
- [ ] Changes are **minimal** — smallest fix that solves the problem
- [ ] No new dependencies added (unless absolutely required and justified)

### Correctness
- [ ] Fix actually resolves the reported issue
- [ ] Fix handles edge cases mentioned in the bug report
- [ ] Fix doesn't introduce new bugs or regressions
- [ ] Fix works in both development and production builds

### Code Quality
- [ ] Code follows existing patterns in the codebase
- [ ] No commented-out code left behind
- [ ] No console.log statements left in (unless intentional logging)
- [ ] TypeScript types are correct (no `any` unless unavoidable)

---

## Testing

### Manual Testing
- [ ] Reproduced the original bug before fixing
- [ ] Verified the fix resolves the issue
- [ ] Tested the happy path still works
- [ ] Tested related functionality isn't broken

### Build Testing
- [ ] `pnpm generate` completes without errors
- [ ] No new warnings introduced
- [ ] Static output includes all expected files

### If Tests Exist
- [ ] All existing tests pass
- [ ] Added test for the bug if appropriate (regression test)

---

## PR Requirements

### Commit Message
Format: `fix: <short description>`

Example: `fix: use UTC timezone for date formatting to prevent hydration mismatch`

- [ ] Commit message starts with `fix:`
- [ ] Message clearly describes what was fixed
- [ ] Message is under 72 characters

### PR Description
- [ ] PR body includes `Closes #<issue-number>` or `Fixes #<issue-number>`
- [ ] Description explains **what** was changed
- [ ] Description explains **why** this fixes the bug
- [ ] If complex, includes brief explanation of root cause

### PR Title
Format: `fix: <description>` (same as commit for single-commit PRs)

---

## Pre-Submit Verification

Before opening the PR:
- [ ] Pulled latest `main` and rebased if needed
- [ ] No merge conflicts
- [ ] All files are saved and committed
- [ ] Double-checked the diff shows only intended changes

---

## Example Good PR

**Title:** `fix: use UTC timezone for blog post dates`

**Body:**
```
Closes #42

## What
Changed date formatting in BlogCard.vue and [...slug].vue to use explicit UTC timezone.

## Why
The server renders dates in UTC, but the client was using local timezone, causing hydration mismatch. Posts dated "2026-03-04" appeared as "March 3, 2026" in EST timezone.

## Testing
- Verified date now shows correctly in both SSG output and client navigation
- Checked multiple articles with different dates
```
