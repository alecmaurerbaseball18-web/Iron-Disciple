(function testPhase6114Utilities(global) {
    "use strict";

    var fs = require("fs");
    var path = require("path");
    var vm = require("vm");
    var root = path.resolve(__dirname, "..");
    var passed = 0;
    var failed = 0;

    [
        "src/core/bootstrap.js",
        "src/core/constants.js",
        "src/core/utilities.js"
    ].forEach(function load(relativePath) {
        vm.runInThisContext(
            fs.readFileSync(path.join(root, relativePath), "utf8"),
            { filename: relativePath }
        );
    });

    var Utilities = global.IronDisciple.get("Utilities");

    function assert(name, condition, details) {
        if (condition) {
            passed += 1;
            console.log("PASS:", name);
            return;
        }

        failed += 1;
        console.error("FAIL:", name, details || "");
    }

    async function run() {
        var firstUuid = Utilities.uuid();
        var secondUuid = Utilities.uuid();
        var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        assert("uuid returns RFC 4122 v4 format", uuidPattern.test(firstUuid), firstUuid);
        assert("uuid returns distinct values", firstUuid !== secondUuid);

        var success = await Utilities.safeExecute(function successOperation() {
            return "complete";
        }, { metadata: { module: "test" } });

        assert("safeExecute reports success", success.ok === true);
        assert("safeExecute preserves value", success.value === "complete");
        assert("safeExecute freezes result", Object.isFrozen(success));
        assert("safeExecute clones metadata", success.metadata.module === "test");

        var expectedError = new Error("planned failure");
        var failure = await Utilities.safeExecute(function failedOperation() {
            throw expectedError;
        }, { fallback: "fallback" });

        assert("safeExecute reports failure", failure.ok === false);
        assert("safeExecute preserves error identity", failure.error === expectedError);
        assert("safeExecute returns configured fallback", failure.value === "fallback");

        var measured = await Utilities.benchmark(async function measuredOperation() {
            await Utilities.sleep(10);
            return 42;
        }, { label: "phase-test" });

        assert("benchmark preserves operation value", measured.value === 42);
        assert("benchmark applies label", measured.label === "phase-test");
        assert("benchmark records non-negative duration", measured.durationMilliseconds >= 0);
        assert("benchmark freezes result", Object.isFrozen(measured));

        var stopwatch = Utilities.createStopwatch("test-watch");
        await Utilities.sleep(8);
        var stoppedAt = stopwatch.stop();
        await Utilities.sleep(8);
        var stillStoppedAt = stopwatch.elapsed();

        assert("stopwatch records elapsed time", stoppedAt >= 0);
        assert("stopped stopwatch does not materially advance", Math.abs(stillStoppedAt - stoppedAt) < 3);
        assert("stopwatch exposes immutable API", Object.isFrozen(stopwatch));
        assert("stopwatch reports stopped state", stopwatch.isRunning() === false);

        stopwatch.start();
        assert("stopwatch restarts", stopwatch.isRunning() === true);
        stopwatch.reset();
        assert("stopwatch reset keeps timer running", stopwatch.isRunning() === true);

        assert("Utilities namespace remains frozen", Object.isFrozen(Utilities));

        console.log("Phase 6.1.1.4 utility test summary:", {
            passed: passed,
            failed: failed,
            total: passed + failed
        });

        if (failed > 0) {
            throw new Error(failed + " Phase 6.1.1.4 utility test(s) failed.");
        }
    }

    run().catch(function handleFailure(error) {
        console.error(error);
        process.exitCode = 1;
    });
}(globalThis));
