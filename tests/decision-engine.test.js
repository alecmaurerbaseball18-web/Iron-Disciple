'use strict';
const assert=require('assert');
const engine=require('../src/modules/decision-engine.js');

const strong={
  date:'2026-07-19',performance:{score:90,confidence:90,readiness:{score:92},recovery:{score:88},components:{sleep:90,nutrition:92,hydration:88,mental:90,consistency:86}},
  readiness:92,recovery:88,sleep:{score:90},hydration:{score:88},nutrition:{score:92,calories:2400,calorieTarget:2450,protein:205,proteinTarget:200,water:105,waterTarget:110},
  mentalReadiness:90,stress:2,soreness:2,pain:0,availableMinutes:75,
  training:{plannedType:'strength',plannedMinutes:65,load:60,acuteLoad:300,chronicLoad:290,daysSinceRest:2},
  goals:[{name:'Build strength',type:'strength',priority:95},{name:'Bible study',type:'spiritual',priority:70}],habits:{spiritual:false}
};
const weak={
  ...strong,performance:{score:42,confidence:85,readiness:{score:35},recovery:{score:40},components:{sleep:32,nutrition:45,hydration:40,mental:38,consistency:50}},
  readiness:35,recovery:40,sleep:{score:32},hydration:{score:40},nutrition:{score:45,calories:900,calorieTarget:2450,protein:60,proteinTarget:200,water:30,waterTarget:110},
  mentalReadiness:38,stress:9,soreness:8,pain:6,availableMinutes:30,
  training:{plannedType:'strength',plannedMinutes:70,load:90,acuteLoad:500,chronicLoad:280,daysSinceRest:8}
};

assert.equal(engine.VERSION,'5.2.0');
const situation=engine.assessSituation(strong);
assert.equal(situation.date,'2026-07-19');
assert.equal(situation.scores.readiness,92);
const priorities=engine.calculatePriorities(strong);
assert(priorities.length>=10);
assert(priorities.every((item,index)=>index===0||priorities[index-1].score>=item.score));
const strongDecision=engine.makeDecision(strong);
assert(strongDecision.mission.primary);
assert(strongDecision.actions.length>=1);
assert(strongDecision.explanation.details.length>=2);
assert(strongDecision.confidence>0);
const weakDecision=engine.makeDecision(weak);
assert(['medical','recover','rest','sleep'].includes(weakDecision.mission.primary.id));
assert(weakDecision.warnings.length>=1);
assert(weakDecision.risks[0].score>=weakDecision.risks.at(-1).score);
const tournament=engine.makeDecision({...strong,events:[{type:'softball',title:'Tournament',daysAway:1,importance:100}],training:{...strong.training,plannedType:'strength'}});
assert(['taper','mobility','recover'].includes(tournament.mission.primary.id));
assert(tournament.resolution.conflicts.some(c=>c.id==='event-vs-heavy-training'));
const timeline=engine.generateTimeline(strong,strongDecision.plan,{startTime:'06:00',endTime:'22:00'});
assert(Array.isArray(timeline));
const daily=engine.dailyMission(strong);
assert(daily.primaryObjective&&daily.topActions.length>=1);
const history=Array.from({length:14},(_,i)=>({...strong,date:`2026-07-${String(i+1).padStart(2,'0')}`,readiness:70+i,recovery:68+i}));
assert.equal(engine.weeklyPlanning(history).days,7);
assert.equal(engine.monthlyReview(history).days,14);
console.log('Decision Engine passed:',strongDecision.mission.primary.id,weakDecision.mission.primary.id,tournament.mission.primary.id);
