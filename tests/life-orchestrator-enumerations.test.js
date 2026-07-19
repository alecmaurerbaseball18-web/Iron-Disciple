'use strict';
const assert = require('assert');
const path = require('path');
const modulePath = path.resolve(__dirname, '../src/modules/life-orchestrator.js');

delete require.cache[modulePath];
const IronLife = require(modulePath);

assert.strictEqual(IronLife.VERSION, '6.1.3');
assert.strictEqual(IronLife.BUILD, 'life-orchestrator-enumerations');
assert(Object.isFrozen(IronLife.enums));
assert(Object.isFrozen(IronLife.constants));

const names = IronLife.listEnums();
assert(Object.isFrozen(names));
assert(names.includes('ShiftType'));
assert(names.includes('TaskStatus'));
assert(names.includes('ConflictType'));
assert(names.length >= 20);

const shiftType = IronLife.getEnum('ShiftType');
assert(Object.isFrozen(shiftType));
assert.strictEqual(shiftType.DAY, 'day-shift');
assert.strictEqual(shiftType.NIGHT, 'night-shift');
assert.strictEqual(IronLife.getEnum('UnknownEnum'), null);

assert.strictEqual(IronLife.isEnumValue('Priority', 'critical'), true);
assert.strictEqual(IronLife.isEnumValue('Priority', 'not-a-priority'), false);
assert.strictEqual(IronLife.isEnumValue('Missing', 'critical'), false);

assert.strictEqual(IronLife.getConstant('time.minutesPerDay'), 1440);
assert.strictEqual(IronLife.getConstant('scoring.maximumConfidence'), 100);
assert.strictEqual(IronLife.getConstant('missing.path'), null);

const vocabulary = IronLife.validateVocabulary();
assert.strictEqual(vocabulary.ok, true);
assert.strictEqual(vocabulary.errors.length, 0);
assert.strictEqual(vocabulary.enumCount, names.length);
assert(vocabulary.constantCount >= 5);

assert.strictEqual(IronLife.enums.TaskStatus.COMPLETED, 'completed');
assert.strictEqual(IronLife.enums.ScheduleItemType.SLEEP, 'sleep');
assert.strictEqual(IronLife.enums.ResolutionStrategy.SHORTEN, 'shorten');
assert.strictEqual(IronLife.enums.TimeGranularity.FIFTEEN_MINUTES, 15);

console.log('Life Orchestrator enumeration and constants tests passed.');
