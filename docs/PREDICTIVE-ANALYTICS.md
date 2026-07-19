# Predictive Analytics Engine — Phase 5.3

`src/modules/predictive-analytics.js` exposes `window.IronPredict` in the browser and a CommonJS API in Node.

## Core APIs

- `forecast(input)` — unified forecast bundle
- `goalProbability(input)` — probability and estimated completion date
- `bodyCompositionForecast(input)` / `weightProjection(input)`
- `readinessForecast(input)` and `recoveryForecast(input)`
- `injuryRisk(input)`
- `detectPlateau(input)` and `regressionDetection(input)`
- `trainingResponse(input)`
- `simulate(input, changes)`
- `monteCarloGoal(input, options)`
- `opportunityDetection(input)`
- `fromAppState(state, options)`

Predictions are decision-support estimates, not medical diagnoses. Confidence is reduced when history is sparse or volatile.
