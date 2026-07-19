'use strict';
const assert=require('assert');
const engine=require('../src/modules/human-performance-engine.js');

const strong={
  profile:{weightLb:220,stress:2,availableMinutes:75},
  sleep:{hours:8,quality:90,targetHours:7.5},readiness:90,soreness:2,pain:0,mentalReadiness:88,
  hydration:{consumed:110,target:110,electrolytes:true},
  nutrition:{calories:2450,calorieTarget:2500,protein:205,proteinTarget:200,carbs:290,carbTarget:300,fiber:32,fiberTarget:30},
  training:{plannedType:'strength',plannedMinutes:70,load:60,acuteLoad:320,chronicLoad:300,priorDayLoad:45,daysSinceRest:2},
  schedule:{eventType:'golf',eventDays:10}
};
const weak={...strong,sleep:{hours:4.5,quality:35,targetHours:7.5},readiness:35,soreness:8,pain:5,mentalReadiness:40,hydration:{consumed:30,target:110},nutrition:{calories:900,calorieTarget:2500,protein:55,proteinTarget:200,carbs:70,carbTarget:300,fiber:8,fiberTarget:30},profile:{weightLb:220,stress:9,availableMinutes:60}};

assert.equal(engine.VERSION,'5.1.0');
const high=engine.buildPerformanceScore(strong);
const low=engine.buildPerformanceScore(weak);
assert(high.score>low.score,'strong inputs must produce higher performance');
assert(high.score>=75,'strong scenario should be performance ready');
assert(low.score<65,'weak scenario should be constrained');
assert.equal(engine.trainingDecision(strong).action,'push');
assert(['reduce','recover'].includes(engine.trainingDecision(weak).action));
assert.equal(engine.tournamentPlan({...strong,schedule:{eventType:'softball',eventDays:1}}).phase,'prime');
const briefing=engine.dailyBriefing(strong);
assert(briefing.actions.length>=1&&briefing.performance.score===high.score);
const history=Array.from({length:14},(_,i)=>({...strong,readiness:70+i,sleep:{hours:6.5+i*.1,quality:65+i,targetHours:7.5}}));
const report=engine.weeklyReport(history);
assert.equal(report.days,7);assert(report.averages.overall>0);assert(report.biggestWin);assert(report.biggestLimiter);
const all=engine.buildHumanPerformance({...strong,history});
assert(all.performance&&all.readiness&&all.recovery&&all.trainingDecision&&all.briefing&&all.weekly);
console.log('Human Performance Engine passed:',high.score,low.score,report.grade);
