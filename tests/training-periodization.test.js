const assert=require('assert');global.TrainingAdvanced=require('../src/modules/training-advanced');const P=require('../src/modules/training-periodization');
const plan=P.generateProgram({startDate:'2026-07-19',eventDate:'2026-10-11',eventName:'Softball',availability:5,sport:'Softball'});
assert(plan.weeks.length>=12);assert.equal(plan.weeks.at(-1).phase,'taper');assert(plan.weeks.some(w=>w.phase==='build'));
const low=P.adjustWeekForReadiness(plan.weeks[2],{score:35,pain:4});assert(low.volumeMultiplier<plan.weeks[2].volumeMultiplier);
const templates=TrainingAdvanced.seedTemplates();const library=[{id:'band-squat',name:'Band Squat'}];const workouts=P.materializeWeeks(plan,templates,library,{weeks:1,fromDate:'2026-07-19'});assert(workouts.length>=2);assert(workouts.every(w=>w.programId===plan.id));
console.log('training-periodization tests passed');
