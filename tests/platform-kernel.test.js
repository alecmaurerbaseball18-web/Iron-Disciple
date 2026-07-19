'use strict';
const assert = require('assert');
const kernel = require('../src/core/platform-kernel.js');

const migrated = kernel.migrateState({ os:{ schemaVersion:2, tasks:[{id:'a',title:'A'}], modules:[{id:'training',name:'Training',view:'body',status:'foundation',capabilities:[]}] } });
assert.equal(migrated.os.schemaVersion, 5);
assert.deepEqual(migrated.os.tasks[0].dependsOn, []);
assert.equal(kernel.validateModuleContract(migrated.os.modules[0]).valid, true);

const tasks = [
  { id:'a', status:'open', dependsOn:[] },
  { id:'b', status:'open', dependsOn:['a'] }
];
assert.equal(kernel.dependencyState(tasks[1], tasks).blocked, true);
assert.equal(kernel.applyCompletion('b', tasks).reason, 'blocked');
const first = kernel.applyCompletion('a', tasks);
assert.equal(first.reason, 'completed');
assert.equal(kernel.applyCompletion('b', first.tasks).reason, 'completed');

const cycles = kernel.detectDependencyCycles([{id:'a',dependsOn:['b']},{id:'b',dependsOn:['a']}]);
assert.ok(cycles.length > 0);

const report = kernel.buildKernelReport(migrated);
assert.equal(report.schemaVersion, 5);
assert.equal(report.modulesValid, true);
console.log('platform-kernel tests passed');
