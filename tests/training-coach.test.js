const assert=require('assert');const C=require('../src/modules/training-coach');
const w={name:'A',exercises:[{name:'x'},{name:'y'}]};assert.equal(C.moveExercise(w.exercises,0,1)[0].name,'y');assert.equal(C.removeExercise(w.exercises,0).length,1);
const sessions=[{status:'completed',completedAt:new Date().toISOString(),durationMinutes:60,metrics:{avgRpe:7},exercises:[{exerciseId:'bench',targetSets:1,sets:[{completed:true,weight:100,reps:10,rpe:7}]}]}];
assert.equal(C.weeklyLoad(sessions).load,420);assert.equal(C.progression('bench',sessions).action,'increase');assert.equal(C.exerciseHistory('bench',sessions)[0].volume,1000);console.log('training-coach tests passed');
