# Repository Structure

This package is arranged for direct use as the `main` branch of the Iron Disciple OS GitHub repository.

```text
/
├── .github/workflows/       GitHub Actions deployment and test workflows
├── assets/
│   ├── css/                 Stylesheets
│   └── icons/               App and browser icons
├── docs/                    Architecture, deployment, testing, and audit documents
├── src/
│   ├── core/                Bootstrap, constants, utilities, logging, and integration
│   ├── modules/             Feature engines and supporting application modules
│   └── app.js               Current application runtime entry point
├── tests/                   Automated JavaScript tests
├── 404.html                 GitHub Pages fallback application shell
├── index.html               GitHub Pages entry page
├── manifest.webmanifest     Progressive Web App manifest
├── service-worker.js        Root-scoped offline service worker
├── .gitignore               Files Git should ignore
└── README.md                Project overview and local startup instructions
```

## Why some files remain at the root

GitHub Pages expects `index.html` at the configured publishing root. The service worker also remains at the root so it can control the entire site scope. The PWA manifest and `404.html` are retained at the root to keep deployment routing simple and reliable.

## Main runtime

The currently deployed page loads:

1. `src/core/bootstrap.js`
2. `src/core/constants.js`
3. `src/core/utilities.js`
4. `src/core/integration.js`
5. `src/app.js`

Files under `src/modules/` are organized source modules from the broader project and are retained for continued migration and feature integration.
