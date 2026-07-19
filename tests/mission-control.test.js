'use strict';
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const store=new Map();
const context={window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},console,Date};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/modules/mission-control-v3.js','utf8'),context);
const mc=context.IronMissionControl;
assert(mc,'Mission Control API should load');
const state={
 bigThree:[{id:'1',text:'Finish workout',done:false}],
 timeBlocks:[{id:'b',time:'23:59',title:'Evening review',done:false}],
 tasks:[{id:'t',text:'Low task',priority:'Low',done:false}],
 goals:[{id:'g',text:'Tournament preparation',horizon:'Quarterly',progress:25}],
 body:{},bodyGoals:{sleep:8,water:100,protein:200,steps:10000},workout:{done:false}
};
let brief=mc.briefing(state,new Date('2026-07-19T08:00:00'));
assert.equal(brief.action.title,'Finish workout');
assert.equal(brief.action.type,'Big Three');
assert.equal(brief.runway[0].pressure,'risk');
assert.equal(brief.score,null);
state.body[new Date().toISOString().slice(0,10)]={sleep:8,water:100,protein:200,steps:10000};
state.workout.done=true;
brief=mc.briefing(state,new Date('2026-07-19T08:00:00'));
assert.equal(brief.score,100);
assert.equal(brief.status,'Ready');
state.bigThree[0].done=true;
brief=mc.briefing(state,new Date('2026-07-19T08:00:00'));
assert.equal(brief.action.type,'Schedule');
assert.equal(brief.version,'3.2.0');
assert.equal(brief.momentum.value,46);
assert.equal(brief.forecast.label,'On track');
assert.equal(brief.plan.length,3);
state.tasks=[{id:'late',text:'Overdue report',priority:'High',due:'2026-07-18',done:false}];
state.timeBlocks=[{id:'missed',time:'07:00',title:'Morning block',done:false}];
brief=mc.briefing(state,new Date('2026-07-19T08:00:00'));
assert(brief.blockers.some(item=>item.title.includes('overdue')));
assert(brief.blockers.some(item=>item.title.includes('missed')));
console.log('Mission Control tests passed');
