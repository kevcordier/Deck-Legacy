---
name: release
description: Cut a new Deck-Legacy release — bumps the root package.json version (major/minor/patch/prerelease…), commits it with the patch notes since the last tag, creates the v* git tag and pushes both (which deploys the web client and the API). Maintainer only.
argument-hint: '<major|minor|patch|premajor|preminor|prepatch|prerelease|X.Y.Z[-beta.N]>'
disable-model-invocation: true
---

# Release

Arguments: `$ARGUMENTS` — the bump type passed to `npm version`, or an explicit version. If empty, ask
(default suggestion while in beta: `prerelease`, e.g. `1.0.0-beta.5` → `1.0.0-beta.6`).

Pushing a `v*` tag deploys the web client and the API (`.github/workflows/deploy.yml`): maintainer
only (CLAUDE.md rule 9). Only the **root** `package.json` carries the release version.

## 1. Preconditions — stop if any fails

```bash
git switch main && git pull --ff-only origin main
git status --porcelain          # must be empty
git describe --tags --abbrev=0  # last tag = LAST
git log --oneline LAST..HEAD    # must not be empty
```

## 2. Bump the version

```bash
npm version $ARGUMENTS --no-git-tag-version   # prints vX.Y.Z… = NEW
```

`npm version` only edits the root `package.json` (no pnpm workspace recursion, no commit, no tag).

## 3. Write the patch notes

From `git log --format='%s (%h)' --no-merges LAST..HEAD`, group by Conventional Commit type, drop
`Release …` commits and keep the scope:

```text
Release NEW

## Features
- engine: … (abc1234)

## Fixes
- card-119: … (def5678)

## Chores
- deps: … (0123abc)
```

Sections: Features (`feat`), Fixes (`fix`), Performance (`perf`), Refactoring (`refactor`), Docs
(`docs`), Chores (`chore`, `ci`, `build`, `test`, `style`), Other (anything else). Omit empty sections.
Write the notes in English to a scratchpad file `NOTES`.

## 4. Commit and tag

```bash
git add package.json
git commit -F NOTES                 # pre-commit hook runs; never --no-verify
git tag -a NEW -F NOTES
```

If the hook fails, fix nothing silently: report the failure, `git checkout package.json`, and stop.

## 5. Confirm, then push

Show the user NEW and the notes, and ask for confirmation (the push deploys). Then:

```bash
git push origin main NEW
```

Report the tag and the Actions URL: <https://github.com/kevcordier/Deck-Legacy/actions>.
