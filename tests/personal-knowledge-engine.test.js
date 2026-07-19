'use strict';
const assert=require('assert');
const knowledge=require('../src/modules/personal-knowledge-engine.js');
assert.equal(knowledge.VERSION,'5.5.0');
const history=Array.from({length:42},(_,i)=>{
  const mobility=i%3!==0;
  const night=i>=14&&i<28;
  const sleep=night?6.1+(i%3)*.15:7.3+(i%4)*.12;
  const hydration=night?70+(i%5):84+(i%5);
  const readiness=55+sleep*4+(hydration-70)*.25+(mobility?4:0)-(i%7===0?4:0);
  return {
    date:`2026-${i<23?'06':'07'}-${String(i<23?8+i: i-22).padStart(2,'0')}`,
    weight:225-i*.22,
    bodyFat:30-i*.08,
    sleepHours:sleep,
    sleepScore:sleep*10,
    hydration,
    readiness,
    recovery:readiness-3,
    performance:readiness+2,
    calories:2200+(i%5)*80,
    protein:185+(i%4)*5,
    carbs:210+(i%6)*10,
    trainingLoad:45+(i%4)*10,
    soreness:3+(i%4)*.4,
    stress:night?7:4,
    mood:night?6:8,
    shift:night?'night':'day',
    trainingType:i%2?'strength':'mobility',
    completed:i%6!==0,
    habits:{mobility,proteinTarget:i%5!==0,bedtime:!night&&i%4!==0}
  };
});
const baseline=knowledge.buildBaseline(history);
assert.equal(baseline.sampleSize,42);
assert(baseline.metrics.readiness.mean>0);
const patterns=knowledge.discoverPatterns(history);
assert(patterns.patterns.some(p=>p.predictor==='sleepHours'&&p.outcome==='readiness'));
const habits=knowledge.analyzeHabitImpact(history);
assert(habits.impacts.some(h=>h.habit==='mobility'));
const shifts=knowledge.analyzeShiftResponse(history);
assert.equal(shifts.profiles.length,2);
assert(shifts.readinessDifference>0);
const training=knowledge.analyzeTrainingResponse(history);
assert(training.profiles.length>=2);
const nutrition=knowledge.analyzeNutritionResponse(history);
assert.equal(nutrition.relationships.length,4);
const prediction=knowledge.predictPersonalResponse({...history.at(-1),history},{type:'strength'},history);
assert(prediction.matchedCases>0);
const outcome=knowledge.evaluateDecisionOutcome({decision:'Strength session',expectedOutcome:{readiness:80,recovery:78},actualOutcome:{readiness:82,recovery:77},adherence:100});
assert(outcome.successScore>=60);
const report=knowledge.buildKnowledgeReport(history);
assert(report.insights.length>0);
assert(report.recommendations.length>0);
const stateReport=knowledge.fromAppState({history});
assert.equal(stateReport.sampleSize,42);
console.log('Personal Knowledge Engine passed:',report.modelConfidence,report.insights.length);
