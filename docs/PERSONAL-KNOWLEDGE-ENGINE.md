# Personal Knowledge Engine — Phase 5.5

`src/modules/personal-knowledge-engine.js` is the longitudinal learning layer for Iron Disciple OS. It converts logged history into personal baselines, observational patterns, habit-impact estimates, shift-specific profiles, training and nutrition response profiles, personal response predictions, and outcome feedback.

## Browser API

The module is exposed as `window.IronKnowledge`.

```js
const report = IronKnowledge.buildKnowledgeReport(history);
const prediction = IronKnowledge.predictPersonalResponse(currentState, { type: 'strength' }, history);
```

## Public API

- `buildBaseline(history, options)`
- `discoverPatterns(history, options)`
- `analyzeHabitImpact(history, options)`
- `analyzeTrainingResponse(history, options)`
- `analyzeNutritionResponse(history, options)`
- `analyzeShiftResponse(history)`
- `predictPersonalResponse(state, action, history)`
- `evaluateDecisionOutcome(record)`
- `buildPersonalProfile(history, options)`
- `generateInsights(history, options)`
- `buildKnowledgeReport(history, options)`
- `fromAppState(state, options)`

## Evidence controls

All patterns include sample size, confidence, evidence classification, and a correlation-not-causation warning. Small or incomplete datasets are labeled as insufficient or preliminary rather than presented as reliable conclusions.

## Integration contract

The engine can consume historical records directly or through `fromAppState()`. When the AI Coach is present, `fromAppState()` also exposes coach context without making the knowledge engine responsible for coaching language or high-level decisions.
