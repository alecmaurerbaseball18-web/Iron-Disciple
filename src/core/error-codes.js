/* ==========================================================================
 * Registry Validation Helpers
 * ========================================================================== */

function validateDefinition(definition) {

    if (!definition || typeof definition !== "object") {
        throw new TypeError("Invalid error definition.");
    }

    const required = [
        "code",
        "name",
        "category",
        "severity",
        "recoverable",
        "retryable",
        "defaultMessage",
        "description"
    ];

    for (const property of required) {

        if (!(property in definition)) {
            throw new Error(
                `Missing required property '${property}' on ${definition.code ?? "unknown error"}`
            );
        }

    }

    if (!Object.values(ErrorSeverity).includes(definition.severity)) {
        throw new Error(
            `Invalid severity '${definition.severity}' for ${definition.code}`
        );
    }

    if (!Object.values(ErrorCategory).includes(definition.category)) {
        throw new Error(
            `Invalid category '${definition.category}' for ${definition.code}`
        );
    }

    if (typeof definition.code !== "string" ||
        !/^IRON\d{4}$/.test(definition.code)) {

        throw new Error(
            `Invalid error code format '${definition.code}'`
        );

    }

}
/**
 * Iron Disciple OS
 * Error Codes Registry
 *
 * File: core/error-codes.js
 * Version: 1.0.0
 * Phase: 6.1.1.6.2
 *
 * Central, immutable source of truth for framework error codes and their
 * default behavioral metadata.
 */
(function initializeIronDiscipleErrorCodes(global) {
    "use strict";

    if (!global || !global.IronDisciple) {
        throw new Error("Iron Disciple Error Codes requires core/bootstrap.js.");
    }

    var IronDisciple = global.IronDisciple;
    var Utilities = IronDisciple.get("Utilities");

    if (!Utilities) {
        throw new Error("Iron Disciple Error Codes requires core/utilities.js.");
    }

    var VERSION = "1.0.0";
    var BUILD = "phase-6.1.1.6.2";

    function definition(name, code, category, severity, recoverable, retryable, defaultMessage, description) {
        return Utilities.deepFreeze({
            name: name,
            code: code,
            category: category,
            severity: severity,
            recoverable: Boolean(recoverable),
            retryable: Boolean(retryable),
            defaultMessage: defaultMessage,
            description: description
        });
    }

    var DEFINITIONS = {
        INITIALIZATION: {
            UNKNOWN: definition(
                "INITIALIZATION.UNKNOWN",
                "IRON-1000",
                "initialization",
                "critical",
                false,
                false,
                "The application could not initialize.",
                "An unspecified failure prevented Iron Disciple OS from initializing."
            ),
            BOOTSTRAP_FAILED: definition(
                "INITIALIZATION.BOOTSTRAP_FAILED",
                "IRON-1001",
                "initialization",
                "critical",
                false,
                false,
                "The core bootstrap process failed.",
                "The runtime bootstrap could not establish the global application container."
            ),
            MODULE_START_FAILED: definition(
                "INITIALIZATION.MODULE_START_FAILED",
                "IRON-1002",
                "initialization",
                "error",
                true,
                true,
                "A module failed to start.",
                "A registered module could not complete its initialization lifecycle."
            ),
            INVALID_ENVIRONMENT: definition(
                "INITIALIZATION.INVALID_ENVIRONMENT",
                "IRON-1003",
                "initialization",
                "critical",
                false,
                false,
                "The current runtime environment is unsupported.",
                "A required browser or runtime capability is unavailable."
            )
        },
        CONFIGURATION: {
            UNKNOWN: definition(
                "CONFIGURATION.UNKNOWN",
                "IRON-1100",
                "configuration",
                "error",
                true,
                false,
                "The application configuration is invalid.",
                "An unspecified configuration failure occurred."
            ),
            MISSING_VALUE: definition(
                "CONFIGURATION.MISSING_VALUE",
                "IRON-1101",
                "configuration",
                "error",
                true,
                false,
                "A required configuration value is missing.",
                "A required configuration key was not supplied or resolved."
            ),
            INVALID_VALUE: definition(
                "CONFIGURATION.INVALID_VALUE",
                "IRON-1102",
                "configuration",
                "error",
                true,
                false,
                "A configuration value is invalid.",
                "A configuration key contains a value outside its accepted format or range."
            ),
            INVALID_SCHEMA: definition(
                "CONFIGURATION.INVALID_SCHEMA",
                "IRON-1103",
                "configuration",
                "critical",
                false,
                false,
                "The configuration schema is invalid.",
                "The configuration definition itself is malformed or internally inconsistent."
            )
        },
        VALIDATION: {
            UNKNOWN: definition(
                "VALIDATION.UNKNOWN",
                "IRON-1200",
                "validation",
                "warning",
                true,
                false,
                "The supplied value is invalid.",
                "An unspecified input validation failure occurred."
            ),
                DEPENDENCY: Object.freeze({

        MODULE_NOT_FOUND: defineError({
            code: "IRON1300",
            name: "MODULE_NOT_FOUND",
            category: ErrorCategory.DEPENDENCY,
            severity: ErrorSeverity.ERROR,
            recoverable: false,
            retryable: false,
            defaultMessage: "Required module was not found.",
            description: "A required dependency could not be located."
        }),

        VERSION_MISMATCH: defineError({
            code: "IRON1301",
            name: "VERSION_MISMATCH",
            category: ErrorCategory.DEPENDENCY,
            severity: ErrorSeverity.ERROR,
            recoverable: false,
            retryable: false,
            defaultMessage: "Dependency version mismatch.",
            description: "Loaded dependency version is incompatible."
        })

    }),

    MODULE: Object.freeze({

        INITIALIZATION_FAILED: defineError({
            code: "IRON1400",
            name: "INITIALIZATION_FAILED",
            category: ErrorCategory.MODULE,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: true,
            defaultMessage: "Module initialization failed.",
            description: "Module could not complete initialization."
        }),

        SHUTDOWN_FAILED: defineError({
            code: "IRON1401",
            name: "SHUTDOWN_FAILED",
            category: ErrorCategory.MODULE,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: true,
            defaultMessage: "Module shutdown failed.",
            description: "Module failed to shut down cleanly."
        })

    }),

    STATE: Object.freeze({

        INVALID_STATE: defineError({
            code: "IRON1500",
            name: "INVALID_STATE",
            category: ErrorCategory.STATE,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: false,
            defaultMessage: "Invalid application state.",
            description: "The requested operation is not valid for the current state."
        }),

        STATE_CORRUPTION: defineError({
            code: "IRON1501",
            name: "STATE_CORRUPTION",
            category: ErrorCategory.STATE,
            severity: ErrorSeverity.FATAL,
            recoverable: false,
            retryable: false,
            defaultMessage: "State corruption detected.",
            description: "Application state integrity verification failed."
        })

    }),

    PERSISTENCE: Object.freeze({

        SAVE_FAILED: defineError({
            code: "IRON1600",
            name: "SAVE_FAILED",
            category: ErrorCategory.PERSISTENCE,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: true,
            defaultMessage: "Failed to save data.",
            description: "Persistent storage operation failed."
        }),

        LOAD_FAILED: defineError({
            code: "IRON1601",
            name: "LOAD_FAILED",
            category: ErrorCategory.PERSISTENCE,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: true,
            defaultMessage: "Failed to load data.",
            description: "Persistent data could not be loaded."
        })

    }),

    SCHEDULER: Object.freeze({

        INVALID_SCHEDULE: defineError({
            code: "IRON1700",
            name: "INVALID_SCHEDULE",
            category: ErrorCategory.SCHEDULER,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: false,
            defaultMessage: "Invalid schedule.",
            description: "Scheduler rejected an invalid schedule."
        }),

        CONFLICT_DETECTED: defineError({
            code: "IRON1701",
            name: "CONFLICT_DETECTED",
            category: ErrorCategory.SCHEDULER,
            severity: ErrorSeverity.WARN,
            recoverable: true,
            retryable: false,
            defaultMessage: "Schedule conflict detected.",
            description: "Scheduling conflict requires user resolution."
        })

    }),

    PLANNER: Object.freeze({

        PLAN_FAILED: defineError({
            code: "IRON1800",
            name: "PLAN_FAILED",
            category: ErrorCategory.PLANNER,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: true,
            defaultMessage: "Planning operation failed.",
            description: "Planner could not generate a valid plan."
        }),

        GOAL_UNREACHABLE: defineError({
            code: "IRON1801",
            name: "GOAL_UNREACHABLE",
            category: ErrorCategory.PLANNER,
            severity: ErrorSeverity.WARN,
            recoverable: true,
            retryable: false,
            defaultMessage: "Goal cannot currently be achieved.",
            description: "Planner determined the requested goal is unreachable."
        })

    }),

    NETWORK: Object.freeze({

        CONNECTION_FAILED: defineError({
            code: "IRON1900",
            name: "CONNECTION_FAILED",
            category: ErrorCategory.NETWORK,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: true,
            defaultMessage: "Network connection failed.",
            description: "Unable to establish a network connection."
        }),

        REQUEST_TIMEOUT: defineError({
            code: "IRON1901",
            name: "REQUEST_TIMEOUT",
            category: ErrorCategory.NETWORK,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: true,
            defaultMessage: "Network request timed out.",
            description: "A network request exceeded the allowed timeout."
        })

    }),

    TIMEOUT: Object.freeze({

        OPERATION_TIMEOUT: defineError({
            code: "IRON1950",
            name: "OPERATION_TIMEOUT",
            category: ErrorCategory.TIMEOUT,
            severity: ErrorSeverity.ERROR,
            recoverable: true,
            retryable: true,
            defaultMessage: "Operation timed out.",
            description: "Execution exceeded the configured timeout."
        })

    }),

    INTERNAL: Object.freeze({

        UNKNOWN: defineError({
            code: "IRON1999",
            name: "UNKNOWN",
            category: ErrorCategory.INTERNAL,
            severity: ErrorSeverity.FATAL,
            recoverable: false,
            retryable: false,
            defaultMessage: "Unknown internal error.",
            description: "An unexpected framework error occurred."
        })

    })
            REQUIRED_FIELD: definition(
                "VALIDATION.REQUIRED_FIELD",
                "IRON-1201",
                "validation",
                "warning",
                true,
                false,
                "A required field is missing.",
                "Validation failed because a required field was not supplied."
            ),
            INVALID_TYPE: definition(
                "VALIDATION.INVALID_TYPE",
                "IRON-1202",
                "validation",
                "warning",
                true,
                false,
                "A value has an invalid type.",
                "The supplied value does not match the required data type."
            ),
            OUT_OF_RANGE: definition(
                "VALIDATION.OUT_OF_RANGE",
                "IRON-1203",
                "validation",
                "warning",
                true,
                false,
                "A value is outside the allowed range.",
                "The supplied value is below the minimum or above the maximum permitted value."
            ),
            INVALID_FORMAT: definition(
                "VALIDATION.INVALID_FORMAT",
                "IRON-1204",
                "validation",
                "warning",
                true,
                false,
                "A value has an invalid format.",
                "The supplied value does not match the expected structure or pattern."
            ),
            INVALID_JSON: definition(
                "VALIDATION.INVALID_JSON",
                "IRON-1205",
                "validation",
                "warning",
                true,
                false,
                "The supplied JSON is invalid.",
                "JSON parsing or structural validation failed."
            )
        },
        DEPENDENCY: {
            UNKNOWN: definition(
                "DEPENDENCY.UNKNOWN",
                "IRON-1300",
                "dependency",
                "critical",
                false,
                false,
                "A required dependency is unavailable.",
                "An unspecified dependency failure occurred."
            ),
            MODULE_NOT_FOUND: definition(
                "DEPENDENCY.MODULE_NOT_FOUND",
                "IRON-1301",
                "dependency",
                "critical",
                false,
                false,
                "A required module could not be found.",
                "A module requested through the runtime registry is missing."
            ),
            VERSION_MISMATCH: definition(
                "DEPENDENCY.VERSION_MISMATCH",
                "IRON-1302",
                "dependency",
                "critical",
                false,
                false,
                "A dependency version is incompatible.",
                "The installed dependency does not satisfy the required version contract."
            ),
            SERVICE_UNAVAILABLE: definition(
                "DEPENDENCY.SERVICE_UNAVAILABLE",
                "IRON-1303",
                "dependency",
                "error",
                true,
                true,
                "A required service is unavailable.",
                "A dependent runtime service is temporarily unavailable or not ready."
            )
        },
        MODULE: {
            UNKNOWN: definition(
                "MODULE.UNKNOWN",
                "IRON-1400",
                "module",
                "error",
                true,
                false,
                "A module operation failed.",
                "An unspecified module-level failure occurred."
            ),
            REGISTRATION_FAILED: definition(
                "MODULE.REGISTRATION_FAILED",
                "IRON-1401",
                "module",
                "error",
                true,
                false,
                "A module could not be registered.",
                "The runtime rejected or could not complete module registration."
            ),
            OPERATION_FAILED: definition(
                "MODULE.OPERATION_FAILED",
                "IRON-1402",
                "module",
                "error",
                true,
                true,
                "A module operation failed.",
                "A module could not complete a requested operation."
            ),
            DISABLED: definition(
                "MODULE.DISABLED",
                "IRON-1403",
                "module",
                "warning",
                true,
                false,
                "The requested module is disabled.",
                "The operation cannot continue because its owning module is disabled."
            )
        },
        STATE: {
            UNKNOWN: definition(
                "STATE.UNKNOWN",
                "IRON-1500",
                "state",
                "error",
                true,
                false,
                "Application state is invalid.",
                "An unspecified state-management failure occurred."
            ),
            INVALID_TRANSITION: definition(
                "STATE.INVALID_TRANSITION",
                "IRON-1501",
                "state",
                "error",
                true,
                false,
                "The requested state transition is invalid.",
                "The system cannot move from its current state to the requested state."
            ),
            CORRUPTED: definition(
                "STATE.CORRUPTED",
                "IRON-1502",
                "state",
                "critical",
                true,
                false,
                "Application state is corrupted.",
                "Stored or in-memory state failed integrity validation."
            ),
            CONFLICT: definition(
                "STATE.CONFLICT",
                "IRON-1503",
                "state",
                "warning",
                true,
                true,
                "A state conflict was detected.",
                "Concurrent or incompatible state changes produced a conflict."
            )
        },
        PERSISTENCE: {
            UNKNOWN: definition(
                "PERSISTENCE.UNKNOWN",
                "IRON-1600",
                "persistence",
                "error",
                true,
                true,
                "A persistence operation failed.",
                "An unspecified storage or persistence failure occurred."
            ),
            SAVE_FAILED: definition(
                "PERSISTENCE.SAVE_FAILED",
                "IRON-1601",
                "persistence",
                "error",
                true,
                true,
                "Data could not be saved.",
                "The persistence layer failed while writing application data."
            ),
            LOAD_FAILED: definition(
                "PERSISTENCE.LOAD_FAILED",
                "IRON-1602",
                "persistence",
                "error",
                true,
                true,
                "Data could not be loaded.",
                "The persistence layer failed while reading application data."
            ),
            QUOTA_EXCEEDED: definition(
                "PERSISTENCE.QUOTA_EXCEEDED",
                "IRON-1603",
                "persistence",
                "critical",
                true,
                false,
                "Storage capacity has been exceeded.",
                "The runtime cannot persist additional data because storage quota is exhausted."
            )
        },
        SCHEDULER: {
            UNKNOWN: definition(
                "SCHEDULER.UNKNOWN",
                "IRON-1700",
                "scheduler",
                "error",
                true,
                true,
                "A scheduling operation failed.",
                "An unspecified scheduler failure occurred."
            ),
            CONFLICT: definition(
                "SCHEDULER.CONFLICT",
                "IRON-1701",
                "scheduler",
                "warning",
                true,
                false,
                "A scheduling conflict was detected.",
                "Two or more schedule items cannot be placed as requested."
            ),
            INVALID_WINDOW: definition(
                "SCHEDULER.INVALID_WINDOW",
                "IRON-1702",
                "scheduler",
                "warning",
                true,
                false,
                "The scheduling window is invalid.",
                "The requested start, end, or duration values do not form a valid time window."
            ),
            EXECUTION_FAILED: definition(
                "SCHEDULER.EXECUTION_FAILED",
                "IRON-1703",
                "scheduler",
                "error",
                true,
                true,
                "A scheduled operation failed to execute.",
                "A task reached its execution time but could not complete."
            )
        },
        PLANNER: {
            UNKNOWN: definition(
                "PLANNER.UNKNOWN",
                "IRON-1750",
                "planner",
                "error",
                true,
                true,
                "A planning operation failed.",
                "An unspecified planning-engine failure occurred."
            ),
            NO_FEASIBLE_PLAN: definition(
                "PLANNER.NO_FEASIBLE_PLAN",
                "IRON-1751",
                "planner",
                "warning",
                true,
                false,
                "No feasible plan could be generated.",
                "The active goals, constraints, and available time do not permit a valid plan."
            ),
            INVALID_CONSTRAINT: definition(
                "PLANNER.INVALID_CONSTRAINT",
                "IRON-1752",
                "planner",
                "warning",
                true,
                false,
                "A planning constraint is invalid.",
                "A constraint supplied to the planning engine is malformed or contradictory."
            ),
            OPTIMIZATION_FAILED: definition(
                "PLANNER.OPTIMIZATION_FAILED",
                "IRON-1753",
                "planner",
                "error",
                true,
                true,
                "Plan optimization failed.",
                "The planning engine could not optimize a valid candidate plan."
            )
        },
        TIMEOUT: {
            UNKNOWN: definition(
                "TIMEOUT.UNKNOWN",
                "IRON-1801",
                "timeout",
                "error",
                true,
                true,
                "An operation timed out.",
                "An operation exceeded its allowed execution time."
            ),
            MODULE_OPERATION: definition(
                "TIMEOUT.MODULE_OPERATION",
                "IRON-1802",
                "timeout",
                "error",
                true,
                true,
                "A module operation timed out.",
                "A module did not complete an operation before its configured deadline."
            ),
            NETWORK_REQUEST: definition(
                "TIMEOUT.NETWORK_REQUEST",
                "IRON-1803",
                "timeout",
                "error",
                true,
                true,
                "A network request timed out.",
                "A remote request did not complete before its configured deadline."
            )
        },
        NETWORK: {
            UNKNOWN: definition(
                "NETWORK.UNKNOWN",
                "IRON-1850",
                "network",
                "error",
                true,
                true,
                "A network operation failed.",
                "An unspecified network failure occurred."
            ),
            OFFLINE: definition(
                "NETWORK.OFFLINE",
                "IRON-1851",
                "network",
                "warning",
                true,
                true,
                "The device is offline.",
                "The requested network operation cannot continue without connectivity."
            ),
            REQUEST_FAILED: definition(
                "NETWORK.REQUEST_FAILED",
                "IRON-1852",
                "network",
                "error",
                true,
                true,
                "The network request failed.",
                "A remote request failed before producing a usable response."
            ),
            INVALID_RESPONSE: definition(
                "NETWORK.INVALID_RESPONSE",
                "IRON-1853",
                "network",
                "error",
                true,
                true,
                "The network response is invalid.",
                "A remote service returned an unreadable or contract-incompatible response."
            )
        },
        INTERNAL: {
            UNKNOWN: definition(
                "INTERNAL.UNKNOWN",
                "IRON-1900",
                "internal",
                "fatal",
                false,
                false,
                "An unexpected internal error occurred.",
                "An unspecified framework-owned internal failure occurred."
            ),
            INVARIANT_VIOLATION: definition(
                "INTERNAL.INVARIANT_VIOLATION",
                "IRON-1901",
                "internal",
                "fatal",
                false,
                false,
                "An internal invariant was violated.",
                "A condition that must always be true inside the runtime was false."
            ),
            UNSUPPORTED_OPERATION: definition(
                "INTERNAL.UNSUPPORTED_OPERATION",
                "IRON-1902",
                "internal",
                "error",
                true,
                false,
                "The requested operation is unsupported.",
                "The runtime does not implement the requested operation in the current context."
            ),
            UNHANDLED_ERROR: definition(
                "INTERNAL.UNHANDLED_ERROR",
                "IRON-1999",
                "internal",
                "fatal",
                false,
                false,
                "An unhandled error occurred.",
                "A failure escaped its owning subsystem without being normalized."
            )
        }
    };

    Utilities.deepFreeze(DEFINITIONS);

    var byCode = Object.create(null);
    var byName = Object.create(null);
    var flatDefinitions = [];

    Object.keys(DEFINITIONS).forEach(function indexCategory(categoryName) {
        Object.keys(DEFINITIONS[categoryName]).forEach(function indexDefinition(definitionName) {
            var entry = DEFINITIONS[categoryName][definitionName];
            byCode[entry.code] = entry;
            byName[entry.name] = entry;
            flatDefinitions.push(entry);
        });
    });

    Object.freeze(flatDefinitions);

    function normalizeCode(value) {
        if (value && typeof value === "object" && value.code) {
            value = value.code;
        }
        return String(value || "").trim().toUpperCase();
    }

    function normalizeName(value) {
        return String(value || "").trim().toUpperCase();
    }

    function lookup(value) {
        var code = normalizeCode(value);
        var name = normalizeName(value);
        return byCode[code] || byName[name] || null;
    }

    function cloneList(list) {
        return list.slice();
    }

    function validate() {
        var seenCodes = Object.create(null);
        var seenNames = Object.create(null);
        var errors = [];
        var codePattern = /^IRON-\d{4}$/;
        var allowedSeverities = ["debug", "info", "warning", "error", "critical", "fatal"];

        flatDefinitions.forEach(function inspect(entry) {
            if (!codePattern.test(entry.code)) {
                errors.push("Invalid code format: " + entry.code);
            }
            if (seenCodes[entry.code]) {
                errors.push("Duplicate code: " + entry.code);
            }
            if (seenNames[entry.name]) {
                errors.push("Duplicate name: " + entry.name);
            }
            if (allowedSeverities.indexOf(entry.severity) === -1) {
                errors.push("Invalid severity for " + entry.code + ": " + entry.severity);
            }
            if (!entry.category) {
                errors.push("Missing category for " + entry.code);
            }
            if (!entry.defaultMessage) {
                errors.push("Missing default message for " + entry.code);
            }
            if (!entry.description) {
                errors.push("Missing description for " + entry.code);
            }
            seenCodes[entry.code] = true;
            seenNames[entry.name] = true;
        });

        return Utilities.deepFreeze({
            valid: errors.length === 0,
            count: flatDefinitions.length,
            errors: errors
        });
    }

    var ErrorCodes = {
        version: VERSION,
        build: BUILD,
        definitions: DEFINITIONS,
        lookup: lookup,
        lookupByName: function lookupByName(name) {
            return byName[normalizeName(name)] || null;
        },
        exists: function exists(value) {
            return Boolean(lookup(value));
        },
        category: function category(value) {
            var entry = lookup(value);
            return entry ? entry.category : null;
        },
        severity: function severity(value) {
            var entry = lookup(value);
            return entry ? entry.severity : null;
        },
        description: function description(value) {
            var entry = lookup(value);
            return entry ? entry.description : null;
        },
        defaultMessage: function defaultMessage(value) {
            var entry = lookup(value);
            return entry ? entry.defaultMessage : null;
        },
        isRetryable: function isRetryable(value) {
            var entry = lookup(value);
            return entry ? entry.retryable : false;
        },
        isRecoverable: function isRecoverable(value) {
            var entry = lookup(value);
            return entry ? entry.recoverable : false;
        },
        categories: function categories() {
            return Object.keys(DEFINITIONS);
        },
        list: function list(category) {
            if (!category) {
                return cloneList(flatDefinitions);
            }
            var normalizedCategory = normalizeName(category);
            if (!DEFINITIONS[normalizedCategory]) {
                return [];
            }
            return Object.keys(DEFINITIONS[normalizedCategory]).map(function mapDefinition(key) {
                return DEFINITIONS[normalizedCategory][key];
            });
        },
        search: function search(query) {
            var term = String(query || "").trim().toLowerCase();
            if (!term) {
                return cloneList(flatDefinitions);
            }
            return flatDefinitions.filter(function matches(entry) {
                return entry.code.toLowerCase().indexOf(term) !== -1 ||
                    entry.name.toLowerCase().indexOf(term) !== -1 ||
                    entry.category.toLowerCase().indexOf(term) !== -1 ||
                    entry.severity.toLowerCase().indexOf(term) !== -1 ||
                    entry.defaultMessage.toLowerCase().indexOf(term) !== -1 ||
                    entry.description.toLowerCase().indexOf(term) !== -1;
            });
        },
        validate: validate
    };

    Utilities.deepFreeze(ErrorCodes);
    IronDisciple.register("ErrorCodes", ErrorCodes);

    Object.defineProperty(IronDisciple, "errorCodes", {
        value: ErrorCodes,
        enumerable: true,
        configurable: false,
        writable: false
    });
}(typeof window !== "undefined" ? window : globalThis));
