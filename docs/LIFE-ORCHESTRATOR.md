# Life Orchestrator

## Current implementation

**Version:** 6.1.2  
**Sprint:** 6.1.1 — Core Infrastructure  
**Completed task:** 6.1.1.2 — Configuration System

The Life Orchestrator currently provides a non-invasive runtime bootstrap and a validated, immutable configuration system. Planning, scheduling, conflict resolution, and next-action logic have not yet been activated.

## Runtime API

- `initialize(options)`
- `shutdown(reason)`
- `reset(options)`
- `status()`
- `version()`
- `health()`
- `validate()`
- `detectEnvironment()`
- `inspectDependencies()`
- `getDependency(key)`

## Configuration API

- `getConfig(path?)` — returns an immutable copy of all configuration or a dotted path.
- `configure(patch, options?)` — deeply merges and validates a runtime patch.
- `setConfig(path, value, options?)` — updates one dotted configuration path.
- `resetConfig(path?, options?)` — resets one path or the complete configuration.
- `validateConfig(candidate, options?)` — returns normalized configuration, errors, and warnings.
- `exportConfig(options?)` — exports a versioned JSON envelope or immutable object.
- `importConfig(input, options?)` — imports an envelope or plain configuration object.

## Configuration domains

- lifecycle and debug controls
- logging
- diagnostics
- persistence and autosave
- retry policy
- safety limits
- planner defaults
- scheduler defaults
- optimization defaults

Unknown keys generate warnings. Invalid values are rejected before runtime configuration changes. Configuration objects returned from the public API are deeply frozen.

## Persistence

In supported browser environments, configuration can be loaded from and saved to `localStorage` or `sessionStorage`. Persistence degrades safely when storage is unavailable. Node-based tests run without browser storage.

## Next task

Task 6.1.1.3 will formalize shared enumerations and constants used across future Life Orchestrator subsystems.
