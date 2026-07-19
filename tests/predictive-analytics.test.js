'use strict';
const assert=require('assert');
const engine=require('../src/modules/predictive-analytics.js');
const history=Array.from({length:35},(_,i)=>({
  date:new Date(Date.UTC(2026,5,1+i)).toISOString().slice(0,10),
  weight:220-i*.18,bodyFat:30-i*.06,readiness:72+i*.25,recovery:70+i*.2,
  sleep:74+i*.1,hydration:76+i*.1,performance:73+i*.22,trainingLoad:55+i*.2,
  strength:70+i*.3,pain:1,stress:4,calories:2300,protein:190
}));
assert.equal(engine.VERSION,'5.3.0');
assert.equal(engine.normalizeHistory(history).length,35);
const t=engine.trend(history,'weight');
assert(t.weeklyChange<0);
const body=engine.bodyCompositionForecast({history,weight:214,bodyFat:28});
assert.equal(body.projections.length,5);
assert(body.projections.find(x=>x.days===30).weight<214);
const readiness=engine.readinessForecast({history,readiness:82,sleep:{score:88},hydration:{score:85},training:{load:50}});
assert.equal(readiness.forecast.length,7);
const injury=engine.injuryRisk({history,recovery:80,sleep:{score:85},pain:1,soreness:2,training:{acuteLoad:310,chronicLoad:300}});
assert.equal(injury.risks.length,6);
const plateau=engine.detectPlateau({history});
assert(Array.isArray(plateau.checks));
const goal=engine.goalProbability({history,goal:{metric:'weight',current:214,target:205,days:90}});
assert(goal.probability>=0&&goal.probability<=100);
const simulation=engine.simulate({history,weight:214,bodyFat:28,readiness:80,recovery:80},{sleepHours:1,calorieChange:250});
assert(simulation.projectedImpact.readiness>0);
const monte=engine.monteCarloGoal({history,goal:{metric:'weight',current:214,target:205,days:90}},{iterations:500,seed:1});
assert.equal(monte.iterations,500);
const result=engine.forecast({history,weight:214,bodyFat:28,readiness:82,recovery:80,sleep:{score:88},hydration:{score:85},goal:{metric:'weight',current:214,target:205,days:90}});
assert(result.summary.length>=3);
console.log('Predictive Analytics passed:',goal.probability,monte.probability,result.injury.level);
