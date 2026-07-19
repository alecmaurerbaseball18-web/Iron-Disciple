# Iron Disciple Decision Engine 5.2

`src/modules/decision-engine.js` is the cross-domain orchestration layer. It consumes normalized performance, training, nutrition, recovery, schedule, event, goal, injury, and habit inputs and returns one explainable daily decision.

## Browser API

```js
const result = IronDecision.makeDecision(appState);
```

## Primary APIs

- `assessSituation(input)`
- `calculatePriorities(input)`
- `evaluateRisks(input)`
- `resolveConflicts(input)`
- `selectMission(input)`
- `buildActionPlan(input)`
- `generateTimeline(input)`
- `makeDecision(input)`
- `explain(decision)`
- `dailyMission(input)`
- `weeklyPlanning(history)`
- `monthlyReview(history)`
- `fromAppState(state, options)`

The engine is deterministic and explainable. Health and pain constraints override performance progression; near-term competition can override high-fatigue training; poor recovery can replace a planned session with recovery work.
