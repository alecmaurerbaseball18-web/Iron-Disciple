# Phase 6.1.1.6.1 Patch Notes — Error Types

## Added

- `src/core/errors.js`
- Canonical `IronLifeError` base class
- Twelve typed framework errors
- Immutable severity and category registries
- Structured metadata, context, tracing, cause, and retry fields
- Transport-safe serialization
- Immutable retry-count cloning
- `tests/errors.test.js`
- `docs/ERROR-TYPES.md`

## Updated

- Browser script loading in `index.html` and `404.html`
- Service-worker cache and asset list

## Scope boundary

This milestone defines error types only. Error-code lookup, factories, registries, recovery policies, safe execution, and centralized error management are intentionally deferred to later 6.1.1.6 milestones.
