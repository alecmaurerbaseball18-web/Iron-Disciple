'use strict';
const assert = require('assert');
const path = require('path');
const modulePath = path.resolve(__dirname, '../src/modules/life-orchestrator.js');

delete require.cache[modulePath];
const IronLife = require(modulePath);

assert.strictEqual(IronLife.VERSION, '6.1.2');
assert.strictEqual(IronLife.BUILD, 'life-orchestrator-configuration');
assert(Object.isFrozen(IronLife.defaultConfig));
assert(Object.isFrozen(IronLife.configRules));

const defaultConfig = IronLife.getConfig();
assert(Object.isFrozen(defaultConfig));
assert.strictEqual(defaultConfig.planner.protectSleep, true);
assert.strictEqual(defaultConfig.scheduler.allowOverlaps, false);

const validation = IronLife.validateConfig({
  planner: { minimumBlockMinutes: 15 },
  logging: { level: 'info' }
});
assert.strictEqual(validation.ok, true);
assert.strictEqual(validation.normalized.planner.minimumBlockMinutes, 15);

const invalid = IronLife.validateConfig({ retry: { attempts: 99 } });
assert.strictEqual(invalid.ok, false);
assert(invalid.errors.some((issue) => issue.path === 'retry.attempts'));

const unknown = IronLife.validateConfig({ futureFeature: { enabled: true } });
assert.strictEqual(unknown.ok, true);
assert(unknown.warnings.some((issue) => issue.code === 'UNKNOWN_CONFIG_KEY'));

const initialized = IronLife.initialize({
  debug: true,
  persistence: { enabled: false },
  planner: { defaultBufferMinutes: 20 }
});
assert.strictEqual(initialized.ok, true);
assert.strictEqual(IronLife.getConfig('debug'), true);
assert.strictEqual(IronLife.getConfig('planner.defaultBufferMinutes'), 20);

const configured = IronLife.configure({
  logging: { level: 'debug', retainEntries: 500 },
  scheduler: { travelBufferMinutes: 25 }
});
assert.strictEqual(configured.ok, true);
assert.strictEqual(configured.revision, 2);
assert.strictEqual(IronLife.getConfig('logging.level'), 'debug');
assert.strictEqual(IronLife.getConfig('scheduler.travelBufferMinutes'), 25);

const set = IronLife.setConfig('optimization.maxPasses', 20);
assert.strictEqual(set.ok, true);
assert.strictEqual(IronLife.getConfig('optimization.maxPasses'), 20);

const rejected = IronLife.setConfig('optimization.maxPasses', 0);
assert.strictEqual(rejected.ok, false);
assert.strictEqual(IronLife.getConfig('optimization.maxPasses'), 20);

const exported = IronLife.exportConfig();
const parsed = JSON.parse(exported);
assert.strictEqual(parsed.module, 'IronLife');
assert.strictEqual(parsed.config.optimization.maxPasses, 20);

const imported = IronLife.importConfig(JSON.stringify({
  config: {
    planner: { dayStart: '05:00' },
    scheduler: { maximumPlanningDays: 14 }
  }
}));
assert.strictEqual(imported.ok, true);
assert.strictEqual(IronLife.getConfig('planner.dayStart'), '05:00');
assert.strictEqual(IronLife.getConfig('scheduler.maximumPlanningDays'), 14);

const resetPath = IronLife.resetConfig('planner.dayStart');
assert.strictEqual(resetPath.ok, true);
assert.strictEqual(IronLife.getConfig('planner.dayStart'), IronLife.defaultConfig.planner.dayStart);

const strictUnknown = IronLife.configure({ futureFeature: true }, { rejectUnknown: true });
assert.strictEqual(strictUnknown.ok, false);

const status = IronLife.status();
assert(status.configuration.revision >= 4);
assert.strictEqual(status.configuration.valid, true);

console.log('Life Orchestrator configuration tests passed.');
