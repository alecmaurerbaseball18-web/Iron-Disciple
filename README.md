# Iron Disciple OS 1.0.0 RC1 — Session 1

A mobile-first, offline-capable personal operating system for mission, execution, body, projects, knowledge, golf, and cross-system intelligence.

## Session 1 stabilization

- Audited the flat repository and validated all JavaScript syntax.
- Added hash-based navigation so refresh/back/forward preserve the active system.
- Added keyboard search (`/`), Escape-to-close dialogs, and improved navigation semantics.
- Added install-prompt handling for supported browsers.
- Added a skip link, visible keyboard focus, reduced-motion support, live status messaging, and improved dialog behavior.
- Added a desktop navigation rail while preserving the mobile bottom bar.
- Updated version metadata to RC1 Session 1.

## Run locally

Serve the repository over HTTP. Service workers do not run from `file://` URLs.

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Repository layout

The main-branch folder structure is documented in [`docs/REPOSITORY-STRUCTURE.md`](docs/REPOSITORY-STRUCTURE.md). Deployment, architecture, testing, cleanup, and completion records are maintained in `docs/`.


## Core Application Framework

Mission Control now unifies daily progress, notifications, achievements, calendar events, notes, module discovery, and diagnostics. See `docs/CORE-APPLICATION-FRAMEWORK.md`.
