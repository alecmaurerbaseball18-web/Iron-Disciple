(function testIronDiscipleUtilities(global) {
    "use strict";

    var Utilities;
    var passed = 0;
    var failed = 0;

    function assert(name, condition, details) {
        if (condition) {
            passed += 1;
            console.log("PASS:", name);
            return;
        }

        failed += 1;
        console.error(
            "FAIL:",
            name,
            details || ""
        );
    }

    function assertEqual(name, actual, expected) {
        assert(
            name,
            Object.is(actual, expected),
            {
                actual: actual,
                expected: expected
            }
        );
    }

    function assertArrayEqual(name, actual, expected) {
        assert(
            name,
            Array.isArray(actual) &&
                JSON.stringify(actual) === JSON.stringify(expected),
            {
                actual: actual,
                expected: expected
            }
        );
    }

    async function runTests() {
        Utilities =
            global.IronDisciple.get("Utilities");

        assert(
            "Utilities module exists",
            Utilities &&
                typeof Utilities === "object"
        );

        assert(
            "Utilities namespace is frozen",
            Object.isFrozen(Utilities)
        );

        assertEqual(
            "toInteger converts numeric string",
            Utilities.toInteger("12.8"),
            12
        );

        assertEqual(
            "toInteger truncates negative values",
            Utilities.toInteger("-12.8"),
            -12
        );

        assertEqual(
            "toInteger uses fallback",
            Utilities.toInteger("invalid", 7),
            7
        );

        assertEqual(
            "snap rounds to nearest increment",
            Utilities.snap(12, 5),
            10
        );

        assertEqual(
            "snap rounds upward when nearest",
            Utilities.snap(13, 5),
            15
        );

        assertArrayEqual(
            "range creates increasing range",
            Utilities.range(1, 5),
            [1, 2, 3, 4]
        );

        assertArrayEqual(
            "range creates decreasing range",
            Utilities.range(5, 1, -1),
            [5, 4, 3, 2]
        );

        assertEqual(
            "formatISODate formats local date",
            Utilities.formatISODate(
                new Date(2026, 6, 18)
            ),
            "2026-07-18"
        );

        assertEqual(
            "formatISOTime formats local time",
            Utilities.formatISOTime(
                new Date(2026, 6, 18, 14, 37, 52)
            ),
            "14:37:52"
        );

        assertEqual(
            "formatISODateTime formats local date and time",
            Utilities.formatISODateTime(
                new Date(2026, 6, 18, 14, 37, 52)
            ),
            "2026-07-18T14:37:52"
        );

        assertEqual(
            "startOfQuarter returns quarter start",
            Utilities.formatISODate(
                Utilities.startOfQuarter(
                    new Date(2026, 7, 12)
                )
            ),
            "2026-07-01"
        );

        assertEqual(
            "endOfQuarter returns quarter end",
            Utilities.formatISODate(
                Utilities.endOfQuarter(
                    new Date(2026, 7, 12)
                )
            ),
            "2026-09-30"
        );

        var original = {
            profile: {
                name: "Alec"
            },
            values: [1, 2, 3]
        };

        var cloned =
            Utilities.deepClone(original);

        cloned.profile.name = "Changed";
        cloned.values.push(4);

        assertEqual(
            "deepClone separates nested objects",
            original.profile.name,
            "Alec"
        );

        assertArrayEqual(
            "deepClone separates nested arrays",
            original.values,
            [1, 2, 3]
        );

        var pathObject = {};

        Utilities.setPath(
            pathObject,
            "profile.goals.0.name",
            "Test Goal"
        );

        assertEqual(
            "setPath creates nested structure",
            Utilities.getPath(
                pathObject,
                "profile.goals.0.name"
            ),
            "Test Goal"
        );

        assert(
            "hasPath detects nested property",
            Utilities.hasPath(
                pathObject,
                "profile.goals.0.name"
            )
        );

        assert(
            "deletePath removes nested property",
            Utilities.deletePath(
                pathObject,
                "profile.goals.0.name"
            )
        );

        assert(
            "deleted path no longer exists",
            !Utilities.hasPath(
                pathObject,
                "profile.goals.0.name"
            )
        );

        var sleepStartedAt = Date.now();

        await Utilities.sleep(25);

        assert(
            "sleep waits approximately requested duration",
            Date.now() - sleepStartedAt >= 20
        );

        var retryAttempts = 0;

        var retryResult =
            await Utilities.retry(
                async function retryOperation() {
                    retryAttempts += 1;

                    if (retryAttempts < 3) {
                        throw new Error(
                            "Temporary failure"
                        );
                    }

                    return "success";
                },
                3,
                1
            );

        assertEqual(
            "retry eventually resolves",
            retryResult,
            "success"
        );

        assertEqual(
            "retry used three attempts",
            retryAttempts,
            3
        );

        var condition = false;

        setTimeout(function enableCondition() {
            condition = true;
        }, 25);

        var waitResult =
            await Utilities.waitUntil(
                function checkCondition() {
                    return condition;
                },
                5,
                200
            );

        assertEqual(
            "waitUntil resolves when condition becomes true",
            waitResult,
            true
        );

        console.log(
            "Utilities test summary:",
            {
                passed: passed,
                failed: failed,
                total: passed + failed
            }
        );

        if (failed > 0) {
            throw new Error(
                failed +
                " Utilities test(s) failed."
            );
        }
    }

    runTests().catch(function handleTestFailure(error) {
        console.error(
            "Utilities test suite failed:",
            error
        );

        if (
            typeof process !== "undefined" &&
            process
        ) {
            process.exitCode = 1;
        }
    });

}(typeof globalThis !== "undefined"
    ? globalThis
    : window));
