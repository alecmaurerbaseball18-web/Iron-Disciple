/**
 * Iron Disciple OS
 * Core Logger
 *
 * File: core/logger.js
 * Version: 1.0.0
 *
 * Purpose:
 * Provides consistent application logging with configurable severity levels,
 * timestamps, history retention, and browser/Node compatibility.
 *
 * Dependencies:
 * - core/bootstrap.js
 * - core/constants.js
 * - core/utilities.js
 *
 * Global Registration:
 * IronDisciple.register("Logger", Logger)
 */

(function initializeIronDiscipleLogger(global) {
    "use strict";

    if (!global || !global.IronDisciple) {
        throw new Error(
            "Iron Disciple Logger requires core/bootstrap.js."
        );
    }

    var IronDisciple = global.IronDisciple;
    var Utilities = IronDisciple.get("Utilities");
    var VERSION = "1.0.0";

    var LEVELS = Object.freeze({
        TRACE: 10,
        DEBUG: 20,
        INFO: 30,
        WARN: 40,
        ERROR: 50,
        SILENT: 100
    });

    var levelNames = Object.freeze({
        10: "TRACE",
        20: "DEBUG",
        30: "INFO",
        40: "WARN",
        50: "ERROR",
        100: "SILENT"
    });

    var configuration = {
        level: LEVELS.INFO,
        enabled: true,
        includeTimestamp: true,
        historyLimit: 250
    };

    var history = [];

    function normalizeLevel(level) {
        var normalized;

        if (typeof level === "number") {
            return levelNames[level]
                ? level
                : null;
        }

        if (typeof level !== "string") {
            return null;
        }

        normalized = level.trim().toUpperCase();

        return Object.prototype.hasOwnProperty.call(
            LEVELS,
            normalized
        )
            ? LEVELS[normalized]
            : null;
    }

    function getConsoleMethod(levelName) {
        if (!global.console) {
            return null;
        }

        if (
            levelName === "ERROR" &&
            typeof global.console.error === "function"
        ) {
            return global.console.error.bind(global.console);
        }

        if (
            levelName === "WARN" &&
            typeof global.console.warn === "function"
        ) {
            return global.console.warn.bind(global.console);
        }

        if (
            levelName === "DEBUG" &&
            typeof global.console.debug === "function"
        ) {
            return global.console.debug.bind(global.console);
        }

        if (
            levelName === "TRACE" &&
            typeof global.console.trace === "function"
        ) {
            return global.console.trace.bind(global.console);
        }

        if (typeof global.console.log === "function") {
            return global.console.log.bind(global.console);
        }

        return null;
    }

    function trimHistory() {
        var excess;

        if (history.length <= configuration.historyLimit) {
            return;
        }

        excess =
            history.length -
            configuration.historyLimit;

        history.splice(0, excess);
    }

    function createEntry(level, message, details) {
        return Object.freeze({
            timestamp: new Date().toISOString(),
            level: levelNames[level],
            message: Utilities.toStringSafe(
                message,
                ""
            ),
            details:
                typeof details === "undefined"
                    ? null
                    : details
        });
    }

    function shouldLog(level) {
        return (
            configuration.enabled === true &&
            level >= configuration.level &&
            level < LEVELS.SILENT
        );
    }

    function write(level, message, details) {
        var entry;
        var output;
        var consoleMethod;

        if (!shouldLog(level)) {
            return null;
        }

        entry = createEntry(
            level,
            message,
            details
        );

        history.push(entry);
        trimHistory();

        output = configuration.includeTimestamp
            ? "[" +
              entry.timestamp +
              "] [" +
              entry.level +
              "] " +
              entry.message
            : "[" +
              entry.level +
              "] " +
              entry.message;

        consoleMethod = getConsoleMethod(
            entry.level
        );

        if (consoleMethod) {
            if (entry.details === null) {
                consoleMethod(output);
            } else {
                consoleMethod(
                    output,
                    entry.details
                );
            }
        }

        return entry;
    }

    function trace(message, details) {
        return write(
            LEVELS.TRACE,
            message,
            details
        );
    }

    function debug(message, details) {
        return write(
            LEVELS.DEBUG,
            message,
            details
        );
    }

    function info(message, details) {
        return write(
            LEVELS.INFO,
            message,
            details
        );
    }

    function warn(message, details) {
        return write(
            LEVELS.WARN,
            message,
            details
        );
    }

    function error(message, details) {
        return write(
            LEVELS.ERROR,
            message,
            details
        );
    }

    function setLevel(level) {
        var normalized =
            normalizeLevel(level);

        if (normalized === null) {
            throw new TypeError(
                "Logger level must be TRACE, DEBUG, INFO, WARN, ERROR, SILENT, or a valid numeric level."
            );
        }

        configuration.level = normalized;

        return levelNames[normalized];
    }

    function getLevel() {
        return levelNames[
            configuration.level
        ];
    }

    function enable() {
        configuration.enabled = true;
    }

    function disable() {
        configuration.enabled = false;
    }

    function isEnabled() {
        return configuration.enabled;
    }

    function configure(options) {
        var settings = options || {};
        var limit;

        if (
            Object.prototype.hasOwnProperty.call(
                settings,
                "level"
            )
        ) {
            setLevel(settings.level);
        }

        if (
            typeof settings.enabled ===
            "boolean"
        ) {
            configuration.enabled =
                settings.enabled;
        }

        if (
            typeof settings.includeTimestamp ===
            "boolean"
        ) {
            configuration.includeTimestamp =
                settings.includeTimestamp;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                settings,
                "historyLimit"
            )
        ) {
            limit = Utilities.toInteger(
                settings.historyLimit,
                configuration.historyLimit
            );

            if (limit < 0) {
                throw new RangeError(
                    "Logger historyLimit cannot be negative."
                );
            }

            configuration.historyLimit =
                limit;

            trimHistory();
        }

        return getConfiguration();
    }

    function getConfiguration() {
        return Object.freeze({
            level: getLevel(),
            enabled:
                configuration.enabled,
            includeTimestamp:
                configuration.includeTimestamp,
            historyLimit:
                configuration.historyLimit
        });
    }

    function getHistory() {
        return history.slice();
    }

    function clearHistory() {
        history.length = 0;
    }

    function createChild(context) {
        var prefix =
            Utilities.toStringSafe(
                context,
                ""
            ).trim();

        function createChildMethod(method) {
            return function childLoggerMethod(
                message,
                details
            ) {
                var finalMessage = prefix
                    ? "[" +
                      prefix +
                      "] " +
                      Utilities.toStringSafe(
                          message,
                          ""
                      )
                    : message;

                return method(
                    finalMessage,
                    details
                );
            };
        }

        return Object.freeze({
            trace: createChildMethod(
                trace
            ),
            debug: createChildMethod(
                debug
            ),
            info: createChildMethod(
                info
            ),
            warn: createChildMethod(
                warn
            ),
            error: createChildMethod(
                error
            )
        });
    }

    var Logger = Object.freeze({
        VERSION: VERSION,
        LEVELS: LEVELS,

        trace: trace,
        debug: debug,
        info: info,
        warn: warn,
        error: error,

        setLevel: setLevel,
        getLevel: getLevel,

        enable: enable,
        disable: disable,
        isEnabled: isEnabled,

        configure: configure,
        getConfiguration:
            getConfiguration,

        getHistory: getHistory,
        clearHistory: clearHistory,

        createChild: createChild
    });

    IronDisciple.register(
        "Logger",
        Logger,
        {
            version: VERSION,
            dependencies: [
                "Utilities"
            ]
        }
    );

}(
    typeof globalThis !== "undefined"
        ? globalThis
        : window
));
