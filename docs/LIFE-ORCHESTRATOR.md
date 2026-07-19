# Life Orchestrator

## Version 6.1.1 — Bootstrap

`src/modules/life-orchestrator.js` establishes the Phase 6 orchestration runtime without changing existing application behavior.

### Current capabilities

- Immutable module metadata and configuration defaults
- Browser, PWA, service-worker, Node, and unknown-environment detection
- Lazy discovery of existing Iron Disciple production modules
- Structured runtime validation and diagnostics
- Lifecycle methods: `initialize()`, `shutdown()`, and `reset()`
- Structured `status()`, `version()`, and `health()` reports
- Browser namespace `window.IronLife`
- CommonJS compatibility for repository tests

### Browser usage

```javascript
const result = window.IronLife.initialize();
const status = window.IronLife.status();
const health = window.IronLife.health();
```

Initialization is deliberately non-invasive. Missing optional integrations are reported as diagnostics rather than throwing or preventing the current application from loading.

### Scope boundary

This release does not include planning, scheduling, timeline generation, conflict resolution, or next-best-action logic. Those capabilities will build on this bootstrap in later Phase 6 implementation units.
