(function testIronDiscipleErrorTypes(global) {
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
        "src/core/utilities.js",
        "src/core/errors.js"
    ].forEach(function load(relativePath) {
        vm.runInThisContext(fs.readFileSync(path.join(root, relativePath), "utf8"), {
            filename: relativePath
        });
    });

    var ErrorTypes = global.IronDisciple.get("ErrorTypes");

    function assert(name, condition, details) {
        if (condition) {
            passed += 1;
            console.log("PASS:", name);
        } else {
            failed += 1;
            console.error("FAIL:", name, details || "");
        }
    }

    assert("ErrorTypes module is registered", Boolean(ErrorTypes));
    assert("ErrorTypes module is frozen", Object.isFrozen(ErrorTypes));
    assert("IronDisciple.errorTypes exposes module", global.IronDisciple.errorTypes === ErrorTypes);
    assert("Severity registry is frozen", Object.isFrozen(ErrorTypes.severity));
    assert("Category registry is frozen", Object.isFrozen(ErrorTypes.category));

    var validation = new ErrorTypes.ValidationError("Invalid value", {
        module: "TestModule",
        metadata: { field: "weight" },
        context: { value: -1 },
        traceId: "trace-1",
        retryCount: 2
    });

    assert("Typed error inherits from Error", validation instanceof Error);
    assert("Typed error inherits from IronLifeError", validation instanceof ErrorTypes.IronLifeError);
    assert("Typed error keeps concrete type", validation instanceof ErrorTypes.ValidationError);
    assert("Typed error has stable name and code", validation.name === "ValidationError" && validation.code === "IRON-1200");
    assert("Typed error has category and severity defaults", validation.category === "validation" && validation.severity === "warning");
    assert("Typed error stores module and trace", validation.module === "TestModule" && validation.traceId === "trace-1");
    assert("Typed error has UUID and ISO timestamp", /^[0-9a-f-]{36}$/i.test(validation.id) && !Number.isNaN(Date.parse(validation.timestamp)));
    assert("Typed error metadata is immutable", Object.isFrozen(validation.metadata));
    assert("Typed error context is immutable", Object.isFrozen(validation.context));
    assert("Retry count is normalized", validation.retryCount === 2);

    var json = validation.toJSON();
    assert("toJSON returns immutable object", Object.isFrozen(json));
    assert("toJSON contains transport fields", json.message === "Invalid value" && json.stack && json.version === "1.0.0");

    var retried = validation.withRetryCount(3);
    assert("withRetryCount returns same concrete type", retried instanceof ErrorTypes.ValidationError);
    assert("withRetryCount preserves identity and changes retry count", retried.id === validation.id && retried.retryCount === 3);
    assert("withRetryCount does not mutate original", validation.retryCount === 2);

    var caused = new ErrorTypes.NetworkError("Request failed", {
        cause: new Error("socket closed")
    });
    assert("Cause is sanitized", caused.cause && caused.cause.message === "socket closed");
    assert("Cause is immutable", Object.isFrozen(caused.cause));

    var constructors = [
        "InitializationError",
        "ConfigurationError",
        "ValidationError",
        "DependencyError",
        "ModuleError",
        "StateError",
        "PersistenceError",
        "SchedulerError",
        "PlannerError",
        "TimeoutError",
        "NetworkError",
        "InternalError"
    ];

    assert("All required typed constructors exist", constructors.every(function exists(name) {
        return typeof ErrorTypes[name] === "function";
    }));

    assert("isIronLifeError recognizes framework errors", ErrorTypes.isIronLifeError(validation));
    assert("isIronLifeError rejects ordinary errors", !ErrorTypes.isIronLifeError(new Error("ordinary")));

    var serializedOrdinary = ErrorTypes.serialize(new Error("ordinary"));
    assert("serialize normalizes ordinary errors", serializedOrdinary.name === "InternalError" && serializedOrdinary.message === "ordinary");

    console.log("Error types test summary:", { passed: passed, failed: failed });
    if (failed) process.exitCode = 1;
}(globalThis));
