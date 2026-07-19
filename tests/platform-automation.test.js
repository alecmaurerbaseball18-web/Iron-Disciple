const assert = require('assert');
const api = require('../src/core/platform-automation.js');

const fixed = new Date('2026-07-19T12:00:00Z');
const templates = [{ id:'tpl', name:'Workout', title:'Train', module:'training', priority:'high', estimate:60 }];
const schedules = [{ id:'sch', templateId:'tpl', days:['sun','tue'], enabled:true }];
const generated = api.createScheduledTasks({ schedules, templates, tasks:[], from:fixed, days:4, makeId:(()=>{let n=0;return()=>`id${++n}`;})() });
assert.deepStrictEqual(generated.map(x=>x.date), ['2026-07-19','2026-07-21']);
assert.strictEqual(api.createScheduledTasks({ schedules, templates, tasks:generated, from:fixed, days:4 }).length, 0, 'scheduler must be idempotent');

const notices = api.buildNotifications({
  today:'2026-07-19',
  tasks:[{date:'2026-07-18',status:'open'},{date:'2026-07-19',status:'open'}],
  tournaments:[{id:'t1',name:'Tournament',date:'2026-07-21'}], calendar:[], dismissed:{}
});
assert(notices.some(x=>x.key==='tasks-overdue'));
assert(notices.some(x=>x.key==='tasks-open'));
assert(notices.some(x=>x.key==='event-t1'));
assert(!api.buildNotifications({today:'2026-07-19',tasks:[{date:'2026-07-19',status:'open'}],dismissed:{'tasks-open':'2026-07-19'}}).some(x=>x.key==='tasks-open'));

const cards = api.buildDashboardCards({ today:'2026-07-19', tasks:[{date:'2026-07-19',status:'open',priority:'high',title:'Lift',module:'training',estimate:60}], tournaments:[], calendar:[], achievements:[] });
assert.strictEqual(cards[0].key, 'priority');
assert(cards.some(x=>x.key==='task-progress'));
console.log('platform-automation: all tests passed');
