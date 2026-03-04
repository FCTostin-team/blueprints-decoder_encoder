# Contributing Guide

First off, huge thanks for considering a contribution. This project is community-driven, and every well-scoped bugfix, UX tweak, localization patch, or docs upgrade helps keep the tool reliable for the Factorio player base.

If you want to contribute like a pro, this guide documents the expected workflow end-to-end.

## Introduction

Welcome aboard.

This repository is a static frontend app focused on one thing: a clean, deterministic blueprint decode/edit/encode pipeline. Contributions should preserve that simplicity while improving developer ergonomics, user experience, and correctness.

What we value:
- Reproducible fixes.
- Minimal, focused PRs.
- Clear commit history.
- Respect for existing architecture and UI behavior.

## I Have a Question

Please do not use GitHub Issues for usage questions or general support requests.

Issues are reserved for:
- Confirmed bugs.
- Actionable feature requests.
- Concrete technical tasks.

For questions, use community channels instead:
- Telegram chat: <https://t.me/FCTostin>
- YouTube community touchpoint: <https://www.youtube.com/@FCT-Ostin>
- Steam group: <https://steamcommunity.com/groups/FCTgroup>

When asking a question, include:
- What you are trying to do.
- What you already tried.
- Screenshots or sample blueprint input (if safe to share).

## Reporting Bugs

Before opening a new bug report:
1. Search existing open Issues for duplicates.
2. Re-test on the latest `main` branch.
3. Confirm the bug is reproducible.

A high-signal bug report should include:

- **Environment**
  - OS and version (for example: `Windows 11`, `Ubuntu 24.04`, `macOS 14`).
  - Browser and version (for example: `Chrome 131`, `Firefox 132`).
  - App version/tag/commit SHA.

- **Steps to Reproduce**
  - Exact input and click path.
  - Whether issue occurs consistently or intermittently.

- **Expected vs Actual Behavior**
  - What should happen.
  - What actually happened.

- **Artifacts**
  - Console errors.
  - Screenshot or screen recording.
  - Minimal blueprint string sample when possible.

Bug reports missing repro steps or environment details may be closed until updated.

## Suggesting Enhancements

Feature requests are welcome, but they need clear product value.

Please include:
- **Problem statement**: what friction exists today?
- **Proposed solution**: what behavior should change?
- **Use cases**: who benefits and in which workflow?
- **Scope estimate**: small UX tweak vs larger architecture impact.

Strong enhancement proposals are incremental, backwards-compatible, and don’t overcomplicate the client-only architecture.

## Local Development and Setup

### 1) Fork and clone

```bash
git clone https://github.com/<your-username>/blueprints-decoder_encoder.git
cd blueprints-decoder_encoder
```

### 2) Add upstream remote

```bash
git remote add upstream https://github.com/FCTostin-team/blueprints-decoder_encoder.git
git fetch upstream
```

### 3) Run locally

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Alternative static servers are fine as long as behavior is equivalent.

### 4) Optional environment setup

This project does not require `.env` or backend credentials. If you need local-only toggles for debugging, keep them out of committed code.

## Pull Request Process

### Branch naming strategy

Use descriptive branch names:
- `feature/<short-feature-name>`
- `bugfix/<issue-id-or-short-name>`
- `docs/<scope>`
- `refactor/<scope>`

Examples:
- `feature/multi-copy-actions`
- `bugfix/217-search-wraparound`
- `docs/readme-refresh`

### Commit format

Use **Conventional Commits**:
- `feat: add ...`
- `fix: resolve ...`
- `docs: update ...`
- `refactor: simplify ...`
- `chore: ...`

Example:
```bash
git commit -m "fix: guard decode flow when blueprint input is empty"
```

### Keep branch up to date

Before opening your PR:

```bash
git fetch upstream
git rebase upstream/main
```

### PR description checklist

Every PR should include:
- Summary of changes.
- Linked issue(s), if applicable (`Closes #123`).
- Testing notes (what you validated locally).
- Screenshots or GIFs for UI-visible changes.
- Migration notes if behavior changed.

Small, focused PRs get reviewed and merged faster than mixed “kitchen sink” patches.

## Styleguides

This repo is plain frontend (`HTML`, `CSS`, `JavaScript`) with no build tooling.

General style expectations:
- Preserve current code style and naming conventions.
- Keep logic readable and side effects explicit.
- Avoid unnecessary abstractions for simple flows.
- Do not reformat unrelated code in the same PR.

Linting/formatting:
- No enforced linter pipeline is currently configured.
- If you use local tools (ESLint/Prettier), keep output consistent with existing code and avoid broad formatting churn.

Architecture expectations:
- Keep the app client-only.
- Keep translation dictionaries in `profiles/` isolated by locale.
- Prefer additive and backward-compatible changes.

## Testing

New or changed behavior should be validated before opening a PR.

Minimum checks:

```bash
# Serve locally
python -m http.server 8080
```

Manual validation checklist:
- Decode known-good blueprint string.
- Edit JSON and encode back.
- Verify invalid JSON path shows errors cleanly.
- Verify search/replace still works after changes.
- Verify language switch and history persistence are unaffected.

If your change touches UI/UX, attach screenshots in the PR.

## Code Review Process

Maintainers review PRs based on correctness, scope, and maintainability.

Typical flow:
1. Maintainer performs initial triage.
2. Feedback is posted inline or as review summary.
3. Contributor pushes follow-up commits.
4. PR is approved and merged when concerns are resolved.

Guidelines:
- One maintainer approval is generally expected for straightforward changes.
- Large or risky changes may require additional review.
- Respond to review comments with concrete updates, not unresolved threads.
- Keep discussions technical and collaborative.

Thanks again for contributing and helping keep this tool sharp.
