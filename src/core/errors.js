/**
 * Iron Disciple OS
 * Core Error Types
 *
 * File: core/errors.js
 * Version: 1.0.0
 * Phase: 6.1.1.6.1
 *
 * Defines the canonical error hierarchy used by the Iron Disciple runtime.
 * This milestone intentionally contains type definitions only; registration,
 * storage, recovery, and orchestration are implemented in later milestones.
 */
(function initializeIronDiscipleErrors(global) {
    "use strict";

    if (!global || !global.IronDisciple) {
        throw new Error("Iron Disciple Error Types requires core/bootstrap.js.");
    }

    var IronDisciple = global.IronDisciple;
    var Utilities = IronDisciple.get("Utilities");

    if (!Utilities) {
        throw new Error("Iron Disciple Error Types requires core/utilities.js.");
    }

    var VERSION = "1.0.0";
    var BUILD = "phase-6.1.1.6.1";

    var ErrorSeverity = Object.freeze({
        DEBUG: "debug",
        INFO: "info",
        WARNING: "warning",
        ERROR: "error",
        CRITICAL: "critical",
        FATAL: "fatal"
    });

    var ErrorCategory = Object.freeze({
        INITIALIZATION: "initialization",
        CONFIGURATION: "configuration",
        VALIDATION: "validation",
        DEPENDENCY: "dependency",
        MODULE: "module",
        STATE: "state",
        PERSISTENCE: "persistence",
        SCHEDULER: "scheduler",
        PLANNER: "planner",
        TIMEOUT: "timeout",
        NETWORK: "network",
        INTERNAL: "internal"
    });

    var DEFAULTS = Object.freeze({
        code: "IRON-1800",
        module: "Unknown",
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.INTERNAL,
        recoverable: false,
        retryCount: 0
    });

    function safeClone(value, fallback) {
        try {
            return Utilities.deepClone(value);
        } catch (_error) {
            return fallback;
        }
    }

    function freezeObject(value) {
        if (!value || typeof value !== "object") {
            return value;
        }
        return Utilities.deepFreeze(value);
    }

    function normalizeMessage(message) {
        if (message instanceof Error) {
            return message.message || message.name || "Iron Disciple error";
        }
        if (message === undefined || message === null || message === "") {
            return "Iron Disciple error";
        }
        return String(message);
    }

    function normalizeNonNegativeInteger(value) {
        var parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0
            ? Math.floor(parsed)
            : 0;
    }

    function normalizeCause(cause) {
        if (!cause) {
            return null;
        }

        if (cause instanceof Error) {
            return freezeObject({
                name: cause.name || "Error",
                message: cause.message || String(cause),
                stack: cause.stack || null,
                code: cause.code || null
            });
        }

        return freezeObject({
            name: "Cause",
            message: String(cause),
            stack: null,
            code: null
        });
    }

    function defineImmutable(target, name, value, enumerable) {
        Object.defineProperty(target, name, {
            value: value,
            enumerable: enumerable !== false,
            configurable: false,
            writable: false
        });
    }

    /**
     * Base error for every framework-owned failure.
     *
     * @param {string|Error} message Human-readable explanation.
     * @param {Object} [options] Structured error context.
     */
    class IronLifeError extends Error {
        constructor(message, options) {
            var settings = options && typeof options === "object" ? options : {};
            var normalizedMessage = normalizeMessage(message);

            super(normalizedMessage);

            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }

            defineImmutable(this, "name", settings.name || this.constructor.name || "IronLifeError");
            defineImmutable(this, "id", settings.id || Utilities.uuid());
            defineImmutable(this, "timestamp", settings.timestamp || new Date().toISOString());
            defineImmutable(this, "code", String(settings.code || DEFAULTS.code));
            defineImmutable(this, "module", String(settings.module || DEFAULTS.module));
            defineImmutable(this, "severity", String(settings.severity || DEFAULTS.severity).toLowerCase());
            defineImmutable(this, "category", String(settings.category || DEFAULTS.category).toLowerCase());
            defineImmutable(this, "metadata", freezeObject(safeClone(settings.metadata || {}, {})));
            defineImmutable(this, "context", freezeObject(safeClone(settings.context || {}, {})));
            defineImmutable(this, "recoverable", Boolean(settings.recoverable));
            defineImmutable(this, "retryCount", normalizeNonNegativeInteger(settings.retryCount));
            defineImmutable(this, "traceId", settings.traceId ? String(settings.traceId) : null);
            defineImmutable(this, "parentTraceId", settings.parentTraceId ? String(settings.parentTraceId) : null);
            defineImmutable(this, "cause", normalizeCause(settings.cause || (message instanceof Error ? message : null)), false);
            defineImmutable(this, "version", VERSION);
            defineImmutable(this, "build", BUILD);
        }

        /**
         * Produces a transport-safe, immutable representation.
         *
         * @returns {Object}
         */
        toJSON() {
            return freezeObject({
                id: this.id,
                timestamp: this.timestamp,
                name: this.name,
                message: this.message,
                code: this.code,
                module: this.module,
                severity: this.severity,
                category: this.category,
                metadata: safeClone(this.metadata, {}),
                context: safeClone(this.context, {}),
                recoverable: this.recoverable,
                retryCount: this.retryCount,
                traceId: this.traceId,
                parentTraceId: this.parentTraceId,
                cause: safeClone(this.cause, null),
                stack: this.stack || null,
                version: this.version,
                build: this.build
            });
        }

        /**
         * Returns a new error of the same type with an updated retry count.
         * The original error remains unchanged.
         *
         * @param {number} retryCount
         * @returns {IronLifeError}
         */
        withRetryCount(retryCount) {
            return new this.constructor(this.message, {
                id: this.id,
                timestamp: this.timestamp,
                code: this.code,
                module: this.module,
                severity: this.severity,
                category: this.category,
                metadata: this.metadata,
                context: this.context,
                recoverable: this.recoverable,
                retryCount: retryCount,
                traceId: this.traceId,
                parentTraceId: this.parentTraceId,
                cause: this.cause
            });
        }
    }

    function createTypedError(className, category, defaultCode, defaults) {
        var typeDefaults = defaults || {};

        return class extends IronLifeError {
            constructor(message, options) {
                var settings = Object.assign({}, typeDefaults, options || {}, {
                    name: className,
                    category: options && options.category ? options.category : category,
                    code: options && options.code ? options.code : defaultCode
                });
                super(message, settings);
            }
        };
    }

    var InitializationError = createTypedError(
        "InitializationError",
        ErrorCategory.INITIALIZATION,
        "IRON-1000",
        { recoverable: false, severity: ErrorSeverity.CRITICAL }
    );

    var ConfigurationError = createTypedError(
        "ConfigurationError",
        ErrorCategory.CONFIGURATION,
        "IRON-1100",
        { recoverable: true, severity: ErrorSeverity.ERROR }
    );

    var ValidationError = createTypedError(
        "ValidationError",
        ErrorCategory.VALIDATION,
        "IRON-1200",
        { recoverable: true, severity: ErrorSeverity.WARNING }
    );

    var DependencyError = createTypedError(
        "DependencyError",
        ErrorCategory.DEPENDENCY,
        "IRON-1300",
        { recoverable: false, severity: ErrorSeverity.CRITICAL }
    );

    var ModuleError = createTypedError(
        "ModuleError",
        ErrorCategory.MODULE,
        "IRON-1400",
        { recoverable: true, severity: ErrorSeverity.ERROR }
    );

    var StateError = createTypedError(
        "StateError",
        ErrorCategory.STATE,
        "IRON-1500",
        { recoverable: true, severity: ErrorSeverity.ERROR }
    );

    var PersistenceError = createTypedError(
        "PersistenceError",
        ErrorCategory.PERSISTENCE,
        "IRON-1600",
        { recoverable: true, severity: ErrorSeverity.ERROR }
    );

    var SchedulerError = createTypedError(
        "SchedulerError",
        ErrorCategory.SCHEDULER,
        "IRON-1700",
        { recoverable: true, severity: ErrorSeverity.ERROR }
    );

    var PlannerError = createTypedError(
        "PlannerError",
        ErrorCategory.PLANNER,
        "IRON-1750",
        { recoverable: true, severity: ErrorSeverity.ERROR }
    );

    var TimeoutError = createTypedError(
        "TimeoutError",
        ErrorCategory.TIMEOUT,
        "IRON-1801",
        { recoverable: true, severity: ErrorSeverity.ERROR }
    );

    var NetworkError = createTypedError(
        "NetworkError",
        ErrorCategory.NETWORK,
        "IRON-1850",
        { recoverable: true, severity: ErrorSeverity.ERROR }
    );

    var InternalError = createTypedError(
        "InternalError",
        ErrorCategory.INTERNAL,
        "IRON-1900",
        { recoverable: false, severity: ErrorSeverity.FATAL }
    );

    var ErrorTypes = {
        version: VERSION,
        build: BUILD,
        severity: ErrorSeverity,
        category: ErrorCategory,
        IronLifeError: IronLifeError,
        InitializationError: InitializationError,
        ConfigurationError: ConfigurationError,
        ValidationError: ValidationError,
        DependencyError: DependencyError,
        ModuleError: ModuleError,
        StateError: StateError,
        PersistenceError: PersistenceError,
        SchedulerError: SchedulerError,
        PlannerError: PlannerError,
        TimeoutError: TimeoutError,
        NetworkError: NetworkError,
        InternalError: InternalError,
        isIronLifeError: function isIronLifeError(value) {
            return value instanceof IronLifeError;
        },
        serialize: function serialize(error) {
            if (error instanceof IronLifeError) {
                return error.toJSON();
            }
            return new InternalError(error instanceof Error ? error.message : String(error), {
                cause: error instanceof Error ? error : null
            }).toJSON();
        }
    };

    Object.freeze(ErrorTypes);
    IronDisciple.register("ErrorTypes", ErrorTypes);

    Object.defineProperty(IronDisciple, "errorTypes", {
        value: ErrorTypes,
        enumerable: true,
        configurable: false,
        writable: false
    });
}(typeof window !== "undefined" ? window : globalThis));
