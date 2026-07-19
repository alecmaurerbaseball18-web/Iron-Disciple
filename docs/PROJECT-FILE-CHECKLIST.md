# Iron Disciple OS — Project File Checklist

**Audit scope:** repository structure, exact duplicates, file naming, local HTML references, JavaScript syntax, and included automated tests.

## Current audit summary

- [x] Exact duplicate files removed.
- [x] Embedded full-repository ZIP removed.
- [x] GitHub workflow filename corrected (`shellcheck.yml`).
- [x] Core integration file moved to its referenced location (`core/integration.js`).
- [x] Repository folder standardized as `Iron-Disciple-OS-Cleaned`.
- [x] All remaining JavaScript files pass `node --check` syntax validation.
- [x] All local `src` and `href` references in `index.html` and `404.html` resolve to existing files.
- [x] Core utility and logger automated tests pass using the repository’s intended test commands.

## Complete and uncomplicated files

### Application entry and presentation
- [x] `index.html` — primary application entry point.
- [x] `404.html` — GitHub Pages fallback entry.
- [x] `app.js` — primary application runtime.
- [x] `styles.css` — application styling.
- [x] `icon.svg` — application icon.
- [x] `manifest.webmanifest` — PWA metadata.
- [x] `service-worker.js` — offline/runtime caching service worker.

### Core runtime
- [x] `core/bootstrap.js`
- [x] `core/constants.js`
- [x] `core/utilities.js`
- [x] `core/integration.js`
- [x] `core/logger.js`

### Test and deployment support
- [x] `.github/workflows/static.yml` — GitHub Pages deployment.
- [x] `.github/workflows/test.yml` — JavaScript syntax and core behavior tests.
- [x] `.github/workflows/shellcheck.yml` — shell-script lint workflow.
- [x] `test/logger.test.js`
- [x] `test/utilities.test.js`

### Project documentation
- [x] `README.md`
- [x] `ARCHITECTURE.md`
- [x] `CHANGELOG.md`
- [x] `DEPLOYMENT.md`
- [x] `TESTING.md`
- [x] `CORE-README.md`
- [x] `GITHUB_DEPLOYMENT_FIX.md`

## Feature files present but requiring functional verification

These files are uniquely named and syntactically valid. Their presence does **not** prove that every feature is wired into the current `index.html`/`app.js` runtime. Each should be tested in a browser before the project is considered fully complete.

### Daily execution and dashboard
- [ ] `daily.js` — verify priorities, checklists, faith fields, reset, and persistence.
- [ ] `dashboard.js` — verify dashboard cards, counts, navigation, and refresh behavior.
- [ ] `weekly-engine.js` — verify weekly calculations and rollover behavior.
- [ ] `events.js` — verify event publication/subscription behavior.

### Mission and coaching
- [ ] `mission.js`
- [ ] `mission-engine.js`
- [ ] `mission-index.js`
- [ ] `adaptive-mission-engine.js`
- [ ] `coach-engine.js`
- [ ] `program-engine.js`
- [ ] `program-library.js`

### Training and recovery
- [ ] `workout-engine.js`
- [ ] `workout-index.js`
- [ ] `recovery-engine.js`
- [ ] `recovery-index.js`
- [ ] `golf.js`
- [ ] `golf-pro-engine.js`
- [ ] `softball.js`
- [ ] `softball-pro-engine.js`
- [ ] `tournament-engine.js`

### Nutrition and body data
- [ ] `nutrition.js`
- [ ] `nutrition-engine.js`
- [ ] `nutrition-index.js`
- [ ] `data.js`

### Professional and operations modules
- [ ] `operations.js`
- [ ] `officer.js`
- [ ] `professional-dashboard.js`
- [ ] `professional-dashboard-engine.js`
- [ ] `command-center.js`
- [ ] `command-center-engine.js`
- [ ] `command-index.js`
- [ ] `projects.js`

### Scheduling, storage, and migration
- [ ] `shift.js`
- [ ] `shift-engine.js`
- [ ] `storage.js`
- [ ] `storage-compat.js`
- [ ] `state.js`
- [ ] `migration-engine.js`

### Intelligence system
- [ ] `intelligence.js`
- [ ] `intelligence-engine.js`
- [ ] `intelligence-recommendations.js`
- [ ] `intelligence-scoring.js`
- [ ] `engines.js`

## Remaining work required before “fully complete”

- [ ] Run the complete manual browser test plan in `TESTING.md` on desktop and mobile.
- [ ] Confirm every standalone feature file above is intentionally used, dynamically loaded, or retained for a planned migration.
- [ ] Remove any feature file found to be obsolete only after browser testing confirms it is not required.
- [ ] Verify installability and offline operation after deployment to HTTPS/GitHub Pages.
- [ ] Test save, reload, import, export, and migration behavior with real data.
- [ ] Verify responsive layout on iPhone-sized screens and a desktop browser.
- [ ] Verify accessibility: keyboard navigation, focus order, dialogs, labels, and screen-reader status messages.
- [ ] Reconcile version labels across `README.md`, `ARCHITECTURE.md`, `TESTING.md`, and the application UI; the documents currently describe different release generations.
- [ ] Update `CHANGELOG.md` to reflect the actual current release and this cleanup.
- [ ] Decide whether legacy architecture documents (`CORE-README.md`, `GITHUB_DEPLOYMENT_FIX.md`) should be moved into a `docs/archive/` folder.

## Definition of done

The project is complete when all automated checks pass, every manual browser check is marked complete, all feature modules are confirmed as active or intentionally archived, offline/install behavior works on the deployed site, and all version documentation agrees.
