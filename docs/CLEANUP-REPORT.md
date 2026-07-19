# Iron Disciple OS — Cleanup Report

## Removed exact duplicates

The following duplicate copies were removed while retaining the canonical file shown after the arrow:

- `bootstrap.js` → retained `core/bootstrap.js`
- `utilities.js` → retained `core/utilities.js`
- `command.js` → retained `command-center.js`
- `github-pages-workflow.yml` and root `static.yml` → retained `.github/workflows/static.yml`
- `index.js` → retained `workout-index.js`
- `intelligence-runtime.js` → retained `intelligence-engine.js`
- `recommendations.js` → retained `intelligence-recommendations.js`
- `scoring.js` → retained `intelligence-scoring.js`
- `professional.js` → retained `professional-dashboard.js`
- `recovery.js` → retained `recovery-engine.js`
- root `tests` → retained `test/logger.test.js`
- `workout.js` → retained `workout-engine.js`

## Removed redundant package

- `iron-disciple-os-v2.3.0-full-repository.zip` was removed because it was an embedded packaged copy inside the working repository.

## Naming and placement corrections

- `.github/workflows/shellcheck.yml.` renamed to `.github/workflows/shellcheck.yml`.
- `integration.js` moved to `core/integration.js` because `index.html` references that path and the file identifies itself as a core integration module.
- Cleaned root folder named `Iron-Disciple-OS-Cleaned`.

## Validation completed

- Exact-content duplicate scan: no duplicate groups remain.
- JavaScript syntax validation: all remaining `.js` files pass `node --check`.
- HTML local-reference validation: no missing local `src` or `href` targets.
- Automated core tests: logger and utilities tests pass using the repository’s intended test commands.

## Important limitation

A static repository audit cannot prove that every screen and interaction works in a real browser. The remaining browser and mobile validation tasks are listed in `PROJECT-FILE-CHECKLIST.md`.
