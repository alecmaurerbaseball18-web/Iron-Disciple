'use strict';
const assert=require('assert');
const path=require('path');
const modulePath=path.resolve(__dirname,'../src/modules/life-orchestrator.js');

delete require.cache[modulePath];
const IronLife=require(modulePath);

assert.strictEqual(IronLife.VERSION,'6.1.3');
assert.strictEqual(IronLife.BUILD,'life-orchestrator-enumerations');
assert(Object.isFrozen(IronLife),'public API must be immutable');
assert(Object.isFrozen(IronLife.metadata),'metadata must be immutable');
assert(Object.isFrozen(IronLife.defaultConfig),'default configuration must be immutable');
assert.strictEqual(IronLife.detectEnvironment().type,'node');

const initial=IronLife.status();
assert.strictEqual(initial.state,'created');
assert.strictEqual(initial.ready,false);

const initialized=IronLife.initialize({debug:true,diagnostics:{retainChecks:20}});
assert.strictEqual(initialized.ok,true);
assert(['ready','degraded'].includes(initialized.state));
assert(initialized.validation);
assert.strictEqual(IronLife.status().initializationCount,1);

const duplicate=IronLife.initialize();
assert.strictEqual(duplicate.ok,true);
assert.strictEqual(duplicate.code,'ALREADY_INITIALIZED');
assert.strictEqual(IronLife.status().initializationCount,1);

const dependencies=IronLife.inspectDependencies();
assert.strictEqual(Object.keys(dependencies).length,8);
assert.strictEqual(IronLife.getDependency('missing-module'),null);

const health=IronLife.health();
assert.strictEqual(typeof health.ok,'boolean');
assert(['healthy','degraded','unhealthy'].includes(health.grade));
assert.strictEqual(health.state,IronLife.status().state);

const version=IronLife.version();
assert.strictEqual(version.version,'6.1.3');
assert.strictEqual(version.stateVersion,1);

const shutdown=IronLife.shutdown('test');
assert.strictEqual(shutdown.ok,true);
assert.strictEqual(shutdown.state,'stopped');
assert.strictEqual(IronLife.status().ready,false);

const reset=IronLife.reset();
assert.strictEqual(reset.ok,true);
assert.strictEqual(reset.state,'created');
assert.strictEqual(IronLife.status().initializationCount,0);

console.log('Life Orchestrator bootstrap tests passed.');
