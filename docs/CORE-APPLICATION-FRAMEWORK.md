# Core Application Framework

This release converts Iron Disciple OS into a shared application framework.

## Implemented

- Central `state.os` namespace with schema versioning
- Mission Control dashboard
- Universal daily progress score
- In-app notification engine
- Achievement engine
- Unified calendar seeded from tournament targets
- Universal tagged notes
- Module registry for expandable features
- Core system diagnostics
- Shared settings namespace

## Architecture rule

Future modules should register themselves in the module registry and store cross-module records in `state.os`. Domain-specific detail may remain within its module, but shared dates, notifications, achievements, notes, and progress must report to the core framework.
