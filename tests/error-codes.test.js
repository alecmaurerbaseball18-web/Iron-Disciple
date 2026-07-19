(function testIronDiscipleErrorCodes(global) {
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
        "src/core/error-codes.js",
        "src/core/errors.js"
    ].forEach(function load(relativePath) {
        vm.runInThisContext(fs.readFileSync(path.join(root, relativePath), "utf8"), {
            filename: relativePath
        });
    });

    var ErrorCodes = global.IronDisciple.get("ErrorCodes");
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

    assert("ErrorCodes module is registered", Boolean(ErrorCodes));
    assert("ErrorCodes module is deeply frozen", Object.isFrozen(ErrorCodes) && Object.isFrozen(ErrorCodes.definitions));
    assert("IronDisciple.errorCodes exposes registry", global.IronDisciple.errorCodes === ErrorCodes);

    var required = ErrorCodes.definitions.VALIDATION.REQUIRED_FIELD;
    assert("Named definition contains canonical metadata",
        required.code === "IRON-1201" &&
        required.category === "validation" &&
        required.severity === "warning" &&
        required.recoverable === true &&
        required.retryable === false &&
        Boolean(required.defaultMessage) &&
        Boolean(required.description)
    );

    assert("lookup resolves code", ErrorCodes.lookup("IRON-1201") === required);
    assert("lookup normalizes code case", ErrorCodes.lookup("iron-1201") === required);
    assert("lookup accepts definition object", ErrorCodes.lookup(required) === required);
    assert("lookupByName resolves symbolic name", ErrorCodes.lookupByName("validation.required_field") === required);
    assert("exists recognizes known and unknown codes", ErrorCodes.exists("IRON-1201") && !ErrorCodes.exists("IRON-9998"));
    assert("metadata helpers return registry values",
        ErrorCodes.category(required.code) === "validation" &&
        ErrorCodes.severity(required.code) === "warning" &&
        ErrorCodes.defaultMessage(required.code) === required.defaultMessage &&
        ErrorCodes.description(required.code) === required.description
    );
    assert("behavior helpers return registry values",
        ErrorCodes.isRecoverable(required.code) === true &&
        ErrorCodes.isRetryable(required.code) === false &&
        ErrorCodes.isRetryable("IRON-1852") === true
    );

    var all = ErrorCodes.list();
    var validation = ErrorCodes.list("validation");
    assert("list returns all definitions", all.length >= 40);
    assert("category list is filtered", validation.length >= 5 && validation.every(function isValidation(entry) {
        return entry.category === "validation";
    }));
    assert("categories returns canonical groups",
        ErrorCodes.categories().indexOf("VALIDATION") !== -1 &&
        ErrorCodes.categories().indexOf("INTERNAL") !== -1
    );
    assert("search finds code metadata", ErrorCodes.search("timeout").length >= 3);
    assert("unknown lookups fail gracefully",
        ErrorCodes.lookup("IRON-9998") === null &&
        ErrorCodes.category("IRON-9998") === null &&
        ErrorCodes.list("missing").length === 0
    );

    var validationResult = ErrorCodes.validate();
    assert("registry validation passes", validationResult.valid === true && validationResult.errors.length === 0);
    assert("registry codes are unique", new Set(all.map(function code(entry) { return entry.code; })).size === all.length);
    assert("registry names are unique", new Set(all.map(function name(entry) { return entry.name; })).size === all.length);
    assert("every entry is immutable", all.every(Object.isFrozen));

    var typed = new ErrorTypes.ValidationError(null, {
        code: required.code,
        module: "RegistryTest"
    });
    assert("typed errors derive defaults from registry",
        typed.message === required.defaultMessage &&
        typed.code === required.code &&
        typed.category === required.category &&
        typed.severity === required.severity &&
        typed.recoverable === required.recoverable &&
        typed.retryable === required.retryable
    );

    var rejectedUnknown = false;
    try {
        new ErrorTypes.ValidationError("Invalid", { code: "IRON-9998" });
    } catch (error) {
        rejectedUnknown = error instanceof RangeError;
    }
    assert("typed errors reject unknown codes", rejectedUnknown);

    var network = new ErrorTypes.NetworkError("Request failed", {
        code: ErrorCodes.definitions.NETWORK.REQUEST_FAILED.code
    });
    assert("typed errors inherit retry behavior from registry", network.retryable === true && network.recoverable === true);
    assert("serialized errors include retryable metadata", network.toJSON().retryable === true);

    console.log("Error codes test summary:", { passed: passed, failed: failed });
    if (failed) process.exitCode = 1;
}(globalThis));
