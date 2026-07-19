const assert=require('assert');const L=require('../src/modules/training-library-pro.js');
const merged=L.merge([{id:'push-up',name:'Push-up',category:'Upper Body',movement:'Push',equipment:['Bodyweight'],primaryMuscles:['Chest'],secondaryMuscles:[],goals:['Strength'],favorite:true}]);
assert(merged.length>=30,'expanded library should contain at least 30 exercises');
assert.strictEqual(merged.find(x=>x.id==='push-up').favorite,true,'existing preference preserved');
assert(L.filter(merged,{equipment:'Resistance bands'}).length>0,'equipment filter works');
assert(L.filter(merged,{goal:'Golf'}).length>0,'goal filter works');
const perf=L.performance('push-up',[{status:'completed',completedAt:'2026-07-01',exercises:[{exerciseId:'push-up',sets:[{weight:50,reps:10,rpe:7,completed:true}]}]}]);
assert(perf.suggestedWeight>=50,'performance suggestion calculated');
console.log('training-library-pro tests passed');
