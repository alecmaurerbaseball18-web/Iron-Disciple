# Life Orchestrator

## Current implementation

**Version:** 6.1.3  
**Sprint:** 6.1.1 — Core Infrastructure  
**Completed task:** 6.1.1.3 — Shared Enumerations and Constants

The Life Orchestrator currently provides a non-invasive runtime bootstrap, a validated immutable configuration system, and the canonical constants and enumerations required by future orchestration subsystems. Planning, scheduling, conflict resolution, and next-action logic have not yet been activated.

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

## Shared vocabulary API

- `listEnums()` — lists all registered enum names.
- `getEnum(name)` — returns an immutable enum or `null`.
- `isEnumValue(name, value)` — tests membership without callers duplicating value lists.
- `getConstant(path?)` — reads immutable grouped constants using dotted paths.
- `validateVocabulary()` — verifies enum freezing and duplicate-value safety.

The registry includes lifecycle, dependency, environment, shift, priority, life-state, module-state, event, task, conflict, schedule-item, flexibility, energy, readiness, recovery, confidence, planning-horizon, time-granularity, source, and resolution-strategy vocabularies.

## Next task

Task 6.1.1.4 will consolidate and harden the shared utility library used by the remaining Life Orchestrator infrastructure.
