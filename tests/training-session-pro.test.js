'use strict';const assert=require('assert');const P=require('../src/modules/training-session-pro.js');
const w={exercises:[{exerciseId:'a',name:'A'},{exerciseId:'b',name:'B'}]};const sw=P.substituteExercise(w,'a',{id:'c',name:'C'});assert.equal(sw.exercises[0].exerciseId,'c');assert.equal(w.exercises[0].exerciseId,'a');
const grouped=P.assignGroups(w.exercises,'superset',[0,1]);assert.equal(grouped[0].groupType,'superset');assert.equal(grouped[0].groupId,grouped[1].groupId);
const p=P.completionProgress({exercises:[{sets:[{completed:true},{completed:false}]}]});assert.deepEqual(p,{complete:1,total:2,percent:50});
const h=P.sessionHistory([{id:'1',status:'completed',date:'2026-01-01',metrics:{sets:3,totalReps:10,totalVolume:100,avgRpe:8}}]);assert.equal(h.length,1);
console.log('training-session-pro tests passed');
