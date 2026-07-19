# AI Coach Engine — Phase 5.4

`src/modules/ai-coach.js` converts outputs from Human Performance, Decision, and Predictive Analytics into concise coaching narratives and structured reports.

## Browser API

```js
IronCoach.buildMorningBrief(state)
IronCoach.buildEveningReview(state)
IronCoach.weeklyReview(history)
IronCoach.monthlyReview(history)
IronCoach.generateCoaching(state)
```

The coach remains explainable: recommendations expose scores, watch items, priorities, confidence, and the underlying decision rationale.
