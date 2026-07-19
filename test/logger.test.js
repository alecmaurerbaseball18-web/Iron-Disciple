"use strict";

const path = require("path");
const assert = require("assert");

global.window = global;

require(path.join(__dirname, "../core/bootstrap.js"));
require(path.join(__dirname, "../core/constants.js"));
require(path.join(__dirname, "../core/utilities.js"));
require(path.join(__dirname, "../core/logger.js"));

const Logger = IronDisciple.get("Logger");

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log("✓", name);
        passed += 1;
    } catch (error) {
        console.error("✗", name);
        console.error(error.stack || error);
        failed += 1;
    }
}

function resetLogger() {
    Logger.enable();
    Logger.configure({
        level: "INFO",
        includeTimestamp: true,
        historyLimit: 250
    });
    Logger.clearHistory();
}

test("Logger module is registered", () => {
    assert.strictEqual(IronDisciple.has("Logger"), true);
});

test("Logger can be retrieved", () => {
    assert(Logger);
});

test("Logger namespace is frozen", () => {
    assert.strictEqual(Object.isFrozen(Logger), true);
});

test("Logger exposes trace()", () => {
    assert.strictEqual(typeof Logger.trace, "function");
});

test("Logger exposes debug()", () => {
    assert.strictEqual(typeof Logger.debug, "function");
});

test("Logger exposes info()", () => {
    assert.strictEqual(typeof Logger.info, "function");
});

test("Logger exposes warn()", () => {
    assert.strictEqual(typeof Logger.warn, "function");
});

test("Logger exposes error()", () => {
    assert.strictEqual(typeof Logger.error, "function");
});

test("Logger exposes setLevel()", () => {
    assert.strictEqual(typeof Logger.setLevel, "function");
});

test("Logger exposes getLevel()", () => {
    assert.strictEqual(typeof Logger.getLevel, "function");
});

test("Logger exposes enable()", () => {
    assert.strictEqual(typeof Logger.enable, "function");
});

test("Logger exposes disable()", () => {
    assert.strictEqual(typeof Logger.disable, "function");
});

test("Logger exposes isEnabled()", () => {
    assert.strictEqual(typeof Logger.isEnabled, "function");
});

test("Logger exposes configure()", () => {
    assert.strictEqual(typeof Logger.configure, "function");
});

test("Logger exposes getConfiguration()", () => {
    assert.strictEqual(typeof Logger.getConfiguration, "function");
});

test("Logger exposes getHistory()", () => {
    assert.strictEqual(typeof Logger.getHistory, "function");
});

test("Logger exposes clearHistory()", () => {
    assert.strictEqual(typeof Logger.clearHistory, "function");
});

test("Logger exposes createChild()", () => {
    assert.strictEqual(typeof Logger.createChild, "function");
});

test("Logger accepts string log levels", () => {
    resetLogger();

    assert.strictEqual(Logger.setLevel("DEBUG"), "DEBUG");
    assert.strictEqual(Logger.getLevel(), "DEBUG");

    assert.strictEqual(Logger.setLevel("ERROR"), "ERROR");
    assert.strictEqual(Logger.getLevel(), "ERROR");
});

test("Logger accepts numeric log levels", () => {
    resetLogger();

    assert.strictEqual(Logger.setLevel(20), "DEBUG");
    assert.strictEqual(Logger.getLevel(), "DEBUG");
});

test("Logger rejects invalid log levels", () => {
    resetLogger();

    assert.throws(
        () => Logger.setLevel("INVALID"),
        TypeError
    );
});

test("Logger can be enabled and disabled", () => {
    resetLogger();

    Logger.disable();
    assert.strictEqual(Logger.isEnabled(), false);

    Logger.enable();
    assert.strictEqual(Logger.isEnabled(), true);
});

test("Disabled logger does not create history entries", () => {
    resetLogger();

    Logger.disable();
    const result = Logger.info("This should not be logged");

    assert.strictEqual(result, null);
    assert.strictEqual(Logger.getHistory().length, 0);
});

test("Logger records INFO entries", () => {
    resetLogger();

    const entry = Logger.info("Information message");

    assert(entry);
    assert.strictEqual(entry.level, "INFO");
    assert.strictEqual(entry.message, "Information message");
    assert.strictEqual(Logger.getHistory().length, 1);
});

test("Logger preserves details", () => {
    resetLogger();

    const details = {
        missionId: 42,
        status: "ACTIVE"
    };

    const entry = Logger.warn("Warning message", details);

    assert.strictEqual(entry.details, details);
});

test("Logger entries are frozen", () => {
    resetLogger();

    const entry = Logger.info("Frozen entry");

    assert.strictEqual(Object.isFrozen(entry), true);
});

test("Logger filters entries below the configured level", () => {
    resetLogger();
    Logger.setLevel("WARN");

    const infoResult = Logger.info("Filtered information");
    const warnResult = Logger.warn("Visible warning");

    assert.strictEqual(infoResult, null);
    assert(warnResult);
    assert.strictEqual(Logger.getHistory().length, 1);
    assert.strictEqual(Logger.getHistory()[0].level, "WARN");
});

test("SILENT level prevents all logging", () => {
    resetLogger();
    Logger.setLevel("SILENT");

    assert.strictEqual(Logger.error("Hidden error"), null);
    assert.strictEqual(Logger.getHistory().length, 0);
});

test("Logger clearHistory empties history", () => {
    resetLogger();

    Logger.info("First message");
    Logger.warn("Second message");

    assert.strictEqual(Logger.getHistory().length, 2);

    Logger.clearHistory();

    assert.strictEqual(Logger.getHistory().length, 0);
});

test("Logger getHistory returns a copy", () => {
    resetLogger();

    Logger.info("Original entry");

    const firstCopy = Logger.getHistory();
    firstCopy.length = 0;

    assert.strictEqual(Logger.getHistory().length, 1);
});

test("Logger enforces the history limit", () => {
    resetLogger();

    Logger.configure({
        level: "INFO",
        historyLimit: 2
    });

    Logger.info("First");
    Logger.info("Second");
    Logger.info("Third");

    const history = Logger.getHistory();

    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0].message, "Second");
    assert.strictEqual(history[1].message, "Third");
});

test("Logger rejects a negative history limit", () => {
    resetLogger();

    assert.throws(
        () => Logger.configure({ historyLimit: -1 }),
        RangeError
    );
});

test("Logger returns a frozen configuration object", () => {
    resetLogger();

    const configuration = Logger.getConfiguration();

    assert.strictEqual(Object.isFrozen(configuration), true);
    assert.strictEqual(configuration.level, "INFO");
    assert.strictEqual(configuration.enabled, true);
    assert.strictEqual(configuration.historyLimit, 250);
});

test("Logger configure updates multiple settings", () => {
    resetLogger();

    const configuration = Logger.configure({
        level: "ERROR",
        enabled: false,
        includeTimestamp: false,
        historyLimit: 10
    });

    assert.strictEqual(configuration.level, "ERROR");
    assert.strictEqual(configuration.enabled, false);
    assert.strictEqual(configuration.includeTimestamp, false);
    assert.strictEqual(configuration.historyLimit, 10);
});

test("Child logger prefixes messages", () => {
    resetLogger();

    const child = Logger.createChild("MISSION");
    const entry = child.info("Generated");

    assert(entry);
    assert.strictEqual(entry.message, "[MISSION] Generated");
});

test("Child logger is frozen", () => {
    resetLogger();

    const child = Logger.createChild("TEST");

    assert.strictEqual(Object.isFrozen(child), true);
});

test("Child logger exposes all severity methods", () => {
    resetLogger();

    const child = Logger.createChild("TEST");

    assert.strictEqual(typeof child.trace, "function");
    assert.strictEqual(typeof child.debug, "function");
    assert.strictEqual(typeof child.info, "function");
    assert.strictEqual(typeof child.warn, "function");
    assert.strictEqual(typeof child.error, "function");
});

test("Logger converts non-string messages safely", () => {
    resetLogger();

    const entry = Logger.info(12345);

    assert.strictEqual(entry.message, "12345");
});

resetLogger();

console.log("");
console.log("--------------------------------");
console.log(`Logger Tests Passed: ${passed}`);
console.log(`Logger Tests Failed: ${failed}`);
console.log("--------------------------------");

if (failed > 0) {
    process.exit(1);
}

console.log("Logger test suite completed successfully.");
