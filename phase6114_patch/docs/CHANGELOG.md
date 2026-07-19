# Changelog

## 6.1.4 — Shared Utility Library Completion

- Extended the canonical core utility module without introducing a competing namespace.
- Added RFC 4122 version 4 UUID generation with secure-runtime support and a compatibility fallback.
- Added structured safe execution for synchronous and asynchronous operations.
- Added immutable benchmarking results and an independently controlled stopwatch utility.
- Added focused regression coverage for identity, safe execution, timing, immutability, and compatibility.
- Updated the offline cache version to `iron-disciple-v6.1.4`.

## 6.1.3 — Shared Enumerations and Constants

- Added the canonical vocabulary for shifts, priorities, life states, modules, events, tasks, conflicts, schedule items, readiness, recovery, planning horizons, and resolution strategies.
- Added immutable grouped system constants for identity, runtime limits, time, scoring, and validation patterns.
- Added enum discovery, enum-value validation, constant lookup, and vocabulary integrity APIs.
- Added dedicated regression coverage for immutability, uniqueness, lookup behavior, and public compatibility.

## 6.1.2 — Life Orchestrator Configuration System

- Added validated, deeply immutable runtime configuration.
- Added planner, scheduler, optimization, retry, diagnostics, logging, and persistence domains.
- Added dotted-path reads and writes, deep-merge updates, path and full resets, and revision tracking.
- Added configuration import/export envelopes and graceful browser-storage persistence.
- Added configuration regression tests and runtime health validation.

## 6.1.1 — Life Orchestrator Bootstrap

- Added the non-invasive `window.IronLife` orchestration bootstrap.
- Added immutable metadata, configuration defaults, and lifecycle controls.
- Added environment detection, dependency discovery, runtime validation, and health reporting.
- Added browser and CommonJS compatibility with dedicated bootstrap regression tests.
- Registered the module in both application shells and the service-worker cache.

## 5.5.0 — Personal Knowledge Engine

- Added personal baseline modeling and data-quality scoring.
- Added lag-aware relationship discovery with confidence and evidence labels.
- Added habit, training, nutrition, and work-shift response analysis.
- Added nearest-history personal response prediction.
- Added decision-outcome evaluation and continuous-learning hooks.
- Added unified personal profile, insight, and knowledge report APIs.


## 5.4.0 — AI Coach Engine

- Added structured morning briefings and evening reviews.
- Added weekly and monthly coaching reports.
- Added explainable decision, goal, performance, recovery, and habit coaching.
- Integrated Human Performance, Decision, and Predictive Analytics outputs through `window.IronCoach`.
- Added regression coverage and service-worker registration for the new production module.


## 5.3.0 — Predictive Analytics Engine
- Added body-composition, readiness, recovery, and training-response forecasting.
- Added goal probability and Monte Carlo goal simulation.
- Added injury-risk, plateau, regression, and opportunity detection.
- Added scenario simulation and browser API `window.IronPredict`.
# Changelog

## 5.1.0 — Human Performance Engine
- Added unified performance, readiness, and recovery scoring.
- Added adaptive training decisions and tournament taper guidance.
- Added daily briefings, cross-domain recommendations, and weekly performance reports.
- Added browser and Node-compatible public API as `IronPerformance`.


## 1.0.0 RC1 — Session 1

- Stabilized application shell and navigation.
- Added URL/hash state with browser back and forward support.
- Added install-app prompt handling.
- Added accessibility improvements: skip navigation, focus visibility, ARIA current-page state, live status region, keyboard shortcuts, and reduced-motion support.
- Added responsive desktop navigation rail.
- Improved dialog scrolling and backdrop behavior.
- Updated app/version documentation.


## 3.1.0 — Mission Control Decision Layer

- Consolidated Mission Control around the active Today dashboard.
- Added a next-best-action command brief using Big Three, schedule, tasks, and goals.
- Added readiness-aware capacity guidance from daily body inputs.
- Added quarterly and monthly goal-pressure runway.
- Added current schedule progress and next-block signal.
- Published Mission Control output into the shared application state and event bus.

## 5.2.0 — Decision Engine
- Added centralized situation assessment and mission selection.
- Added weighted priority ranking, explainable conflict resolution, and risk scoring.
- Added executable action plans, timeline generation, daily missions, and weekly/monthly decision reviews.
- Integrated `window.IronDecision` after the Human Performance Engine.
