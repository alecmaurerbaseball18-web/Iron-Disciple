/**
 * Iron Disciple OS
 * Application Bootstrap and Module Registry
 *
 * File: core/bootstrap.js
 * Version: 1.0.0
 *
 * Purpose:
 * Creates the global Iron Disciple namespace and provides a lightweight,
 * browser-native module registration system.
 *
 * Runtime:
 * Browser-native JavaScript.
 *
 * Dependencies:
 * None.
 *
 * Global Export:
 * window.IronDisciple
 */

(function initializeIronDiscipleBootstrap(global) {
    "use strict";

    if (!global) {
        throw new Error(
            "Iron Disciple could not initialize because no global object was available."
        );
    }

    var BOOTSTRAP_VERSION = "1.0.0";
    var PRODUCT_NAME = "Iron Disciple OS";

    /**
     * Reuse an existing namespace when this file is loaded more than once.
     *
     * The bootstrap must never destroy modules or configuration that were
     * already registered.
     */
    var existingNamespace = global.IronDisciple;

    if (
        existingNamespace &&
        existingNamespace.__bootstrapInitialized === true
    ) {
        return;
    }

    var IronDisciple = existingNamespace || {};

    /**
     * Internal module records.
     *
     * Each record contains:
     *
     * {
     *     name,
     *     key,
     *     value,
     *     version,
     *     dependencies,
     *     metadata,
     *     registeredAt,
     *     status
     * }
     */
    var moduleRegistry = Object.create(null);

    /**
     * Stores callbacks waiting for a module to become available.
     */
    var moduleWaiters = Object.create(null);

    /**
     * Central application configuration.
     *
     * This is intentionally separate from module constants. It stores
     * runtime-level settings such as environment, debug mode, and feature
     * flags.
     */
    var runtimeConfiguration = {
        environment: "production",
        debug: false,
        strictModuleRegistration: true,
        allowModuleReplacement: false,
        exposeLegacyModuleProperties: true
    };

    /**
     * Normalizes module names so lookup is consistent.
     *
     * Examples:
     *
     * "Utilities"        -> "utilities"
     * "provider-registry" -> "providerregistry"
     * "Program Engine"   -> "programengine"
     *
     * @param {*} name
     * @returns {string}
     */
    function normalizeModuleKey(name) {
        if (typeof name !== "string") {
            return "";
        }

        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    }

    /**
     * Creates a shallow copy of an object.
     *
     * bootstrap.js has no dependencies, so it cannot rely on Utilities.
     *
     * @param {Object} source
     * @returns {Object}
     */
    function shallowClone(source) {
        var result = {};
        var key;

        if (!source || typeof source !== "object") {
            return result;
        }

        for (key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * Merges source properties into a target object.
     *
     * @param {Object} target
     * @param {Object} source
     * @returns {Object}
     */
    function assign(target, source) {
        var key;

        if (!source || typeof source !== "object") {
            return target;
        }

        for (key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }

        return target;
    }

    /**
     * Creates a standardized registry error.
     *
     * This uses the native Error class because the shared error hierarchy
     * is loaded later.
     *
     * @param {string} message
     * @param {string} code
     * @returns {Error}
     */
    function createBootstrapError(message, code) {
        var error = new Error(message);

        error.name = "IronDiscipleBootstrapError";
        error.code = code || "BOOTSTRAP_ERROR";

        return error;
    }

    /**
     * Returns true when a usable module name has been supplied.
     *
     * @param {*} name
     * @returns {boolean}
     */
    function isValidModuleName(name) {
        return (
            typeof name === "string" &&
            name.trim().length > 0 &&
            normalizeModuleKey(name).length > 0
        );
    }

    /**
     * Validates dependency names.
     *
     * @param {*} dependencies
     * @returns {string[]}
     */
    function normalizeDependencies(dependencies) {
        var normalized = [];
        var seen = Object.create(null);
        var index;
        var dependency;
        var key;

        if (!Array.isArray(dependencies)) {
            return normalized;
        }

        for (index = 0; index < dependencies.length; index += 1) {
            dependency = dependencies[index];

            if (!isValidModuleName(dependency)) {
                continue;
            }

            key = normalizeModuleKey(dependency);

            if (!seen[key]) {
                seen[key] = true;
                normalized.push(dependency.trim());
            }
        }

        return normalized;
    }

    /**
     * Determines whether all declared dependencies are registered.
     *
     * @param {string[]} dependencies
     * @returns {boolean}
     */
    function dependenciesAreAvailable(dependencies) {
        var index;

        for (index = 0; index < dependencies.length; index += 1) {
            if (!IronDisciple.has(dependencies[index])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns missing dependency names.
     *
     * @param {string[]} dependencies
     * @returns {string[]}
     */
    function getMissingDependencies(dependencies) {
        var missing = [];
        var index;

        for (index = 0; index < dependencies.length; index += 1) {
            if (!IronDisciple.has(dependencies[index])) {
                missing.push(dependencies[index]);
            }
        }

        return missing;
    }

    /**
     * Executes callbacks waiting for a newly registered module.
     *
     * Callback failures are isolated so one failed listener does not block
     * the others.
     *
     * @param {string} moduleKey
     * @param {*} moduleValue
     */
    function flushWaiters(moduleKey, moduleValue) {
        var waiters = moduleWaiters[moduleKey];
        var index;

        if (!Array.isArray(waiters) || waiters.length === 0) {
            return;
        }

        delete moduleWaiters[moduleKey];

        for (index = 0; index < waiters.length; index += 1) {
            try {
                waiters[index].resolve(moduleValue);
            } catch (error) {
                if (
                    global.console &&
                    typeof global.console.error === "function"
                ) {
                    global.console.error(
                        "[Iron Disciple] Module waiter callback failed.",
                        error
                    );
                }
            }
        }
    }

    /**
     * Exposes a registered module through a direct namespace property.
     *
     * Example:
     *
     * IronDisciple.register("Utilities", Utilities)
     *
     * creates:
     *
     * IronDisciple.Utilities
     *
     * This preserves convenient browser-console access and compatibility
     * with modules written before the registry was introduced.
     *
     * @param {string} name
     * @param {*} value
     */
    function exposeLegacyProperty(name, value) {
        if (!runtimeConfiguration.exposeLegacyModuleProperties) {
            return;
        }

        if (
            Object.prototype.hasOwnProperty.call(IronDisciple, name) &&
            IronDisciple[name] !== value
        ) {
            return;
        }

        IronDisciple[name] = value;
    }

    /**
     * Registers a module with the Iron Disciple runtime.
     *
     * Supported signatures:
     *
     * register("Utilities", Utilities)
     *
     * register("Utilities", Utilities, {
     *     version: "1.0.0",
     *     dependencies: ["Constants"]
     * })
     *
     * @param {string} name
     * @param {*} value
     * @param {Object} [options]
     * @returns {*}
     */
    IronDisciple.register = function register(name, value, options) {
        var settings = options || {};
        var key;
        var existing;
        var dependencies;
        var missingDependencies;
        var record;

        if (!isValidModuleName(name)) {
            throw createBootstrapError(
                "A valid module name is required.",
                "INVALID_MODULE_NAME"
            );
        }

        if (
            typeof value === "undefined" ||
            value === null
        ) {
            throw createBootstrapError(
                'Module "' + name + '" cannot be registered without a value.',
                "INVALID_MODULE_VALUE"
            );
        }

        key = normalizeModuleKey(name);
        existing = moduleRegistry[key];

        if (existing) {
            if (existing.value === value) {
                return existing.value;
            }

            if (
                settings.replace !== true &&
                runtimeConfiguration.allowModuleReplacement !== true
            ) {
                throw createBootstrapError(
                    'Module "' + name + '" is already registered.',
                    "MODULE_ALREADY_REGISTERED"
                );
            }
        }

        dependencies = normalizeDependencies(settings.dependencies);
        missingDependencies = getMissingDependencies(dependencies);

        if (
            missingDependencies.length > 0 &&
            settings.allowMissingDependencies !== true
        ) {
            throw createBootstrapError(
                'Module "' +
                    name +
                    '" is missing required dependencies: ' +
                    missingDependencies.join(", ") +
                    ".",
                "MISSING_MODULE_DEPENDENCY"
            );
        }

        record = {
            name: name.trim(),
            key: key,
            value: value,
            version:
                typeof settings.version === "string"
                    ? settings.version
                    : null,
            dependencies: dependencies,
            missingDependencies: missingDependencies,
            metadata: shallowClone(settings.metadata),
            registeredAt: new Date().toISOString(),
            status:
                missingDependencies.length > 0
                    ? "DEGRADED"
                    : "READY"
        };

        moduleRegistry[key] = record;

        exposeLegacyProperty(record.name, value);
        flushWaiters(key, value);

        return value;
    };

    /**
     * Retrieves a registered module.
     *
     * By default, missing modules throw an error.
     *
     * Optional lookup:
     *
     * IronDisciple.get("Utilities", { optional: true })
     *
     * @param {string} name
     * @param {Object} [options]
     * @returns {*}
     */
    IronDisciple.get = function get(name, options) {
        var settings = options || {};
        var key;
        var record;

        if (!isValidModuleName(name)) {
            if (settings.optional === true) {
                return null;
            }

            throw createBootstrapError(
                "A valid module name is required.",
                "INVALID_MODULE_NAME"
            );
        }

        key = normalizeModuleKey(name);
        record = moduleRegistry[key];

        if (!record) {
            if (settings.optional === true) {
                return null;
            }

            throw createBootstrapError(
                'Module "' + name + '" has not been registered.',
                "MODULE_NOT_FOUND"
            );
        }

        return record.value;
    };

    /**
     * Returns whether a module is registered.
     *
     * @param {string} name
     * @returns {boolean}
     */
    IronDisciple.has = function has(name) {
        var key;

        if (!isValidModuleName(name)) {
            return false;
        }

        key = normalizeModuleKey(name);

        return Object.prototype.hasOwnProperty.call(
            moduleRegistry,
            key
        );
    };

    /**
     * Removes a module from the registry.
     *
     * This is primarily intended for tests and controlled plugin unloading.
     *
     * Core modules should not ordinarily be unregistered during application
     * execution.
     *
     * @param {string} name
     * @param {Object} [options]
     * @returns {boolean}
     */
    IronDisciple.unregister = function unregister(name, options) {
        var settings = options || {};
        var key;
        var record;

        if (!isValidModuleName(name)) {
            return false;
        }

        key = normalizeModuleKey(name);
        record = moduleRegistry[key];

        if (!record) {
            return false;
        }

        if (
            record.metadata &&
            record.metadata.core === true &&
            settings.force !== true
        ) {
            throw createBootstrapError(
                'Core module "' + record.name + '" cannot be unregistered.',
                "CORE_MODULE_UNREGISTER_DENIED"
            );
        }

        delete moduleRegistry[key];

        if (
            runtimeConfiguration.exposeLegacyModuleProperties &&
            IronDisciple[record.name] === record.value
        ) {
            try {
                delete IronDisciple[record.name];
            } catch (error) {
                IronDisciple[record.name] = undefined;
            }
        }

        return true;
    };

    /**
     * Returns metadata for one registered module.
     *
     * The actual module value is omitted unless explicitly requested.
     *
     * @param {string} name
     * @param {Object} [options]
     * @returns {Object|null}
     */
    IronDisciple.getModuleInfo = function getModuleInfo(name, options) {
        var settings = options || {};
        var key;
        var record;
        var result;

        if (!isValidModuleName(name)) {
            return null;
        }

        key = normalizeModuleKey(name);
        record = moduleRegistry[key];

        if (!record) {
            return null;
        }

        result = {
            name: record.name,
            key: record.key,
            version: record.version,
            dependencies: record.dependencies.slice(),
            missingDependencies: record.missingDependencies.slice(),
            metadata: shallowClone(record.metadata),
            registeredAt: record.registeredAt,
            status: record.status
        };

        if (settings.includeValue === true) {
            result.value = record.value;
        }

        return result;
    };

    /**
     * Returns metadata for all registered modules.
     *
     * @returns {Object[]}
     */
    IronDisciple.listModules = function listModules() {
        var modules = [];
        var key;

        for (key in moduleRegistry) {
            if (
                Object.prototype.hasOwnProperty.call(
                    moduleRegistry,
                    key
                )
            ) {
                modules.push(
                    IronDisciple.getModuleInfo(
                        moduleRegistry[key].name
                    )
                );
            }
        }

        modules.sort(function sortModules(left, right) {
            if (left.name < right.name) {
                return -1;
            }

            if (left.name > right.name) {
                return 1;
            }

            return 0;
        });

        return modules;
    };

    /**
     * Retrieves several required modules at once.
     *
     * Example:
     *
     * var dependencies = IronDisciple.require([
     *     "Constants",
     *     "Utilities"
     * ]);
     *
     * dependencies.Constants
     * dependencies.Utilities
     *
     * @param {string[]} names
     * @param {Object} [options]
     * @returns {Object}
     */
    IronDisciple.require = function requireModules(names, options) {
        var settings = options || {};
        var result = {};
        var index;
        var name;
        var value;

        if (!Array.isArray(names)) {
            throw createBootstrapError(
                "Module requirements must be supplied as an array.",
                "INVALID_REQUIREMENTS"
            );
        }

        for (index = 0; index < names.length; index += 1) {
            name = names[index];

            value = IronDisciple.get(name, {
                optional: settings.optional === true
            });

            if (value !== null) {
                result[name] = value;
            }
        }

        return result;
    };

    /**
     * Returns a Promise that resolves when a module becomes available.
     *
     * This is useful for optional plugins and deferred script loading.
     *
     * @param {string} name
     * @param {Object} [options]
     * @returns {Promise<*>}
     */
    IronDisciple.whenAvailable = function whenAvailable(
        name,
        options
    ) {
        var settings = options || {};
        var key;
        var currentValue;
        var timeoutId;

        if (!isValidModuleName(name)) {
            return Promise.reject(
                createBootstrapError(
                    "A valid module name is required.",
                    "INVALID_MODULE_NAME"
                )
            );
        }

        currentValue = IronDisciple.get(name, {
            optional: true
        });

        if (currentValue !== null) {
            return Promise.resolve(currentValue);
        }

        key = normalizeModuleKey(name);

        return new Promise(function waitForModule(resolve, reject) {
            var waiter = {
                resolve: function resolveModule(value) {
                    if (timeoutId) {
                        global.clearTimeout(timeoutId);
                    }

                    resolve(value);
                },
                reject: reject
            };

            moduleWaiters[key] = moduleWaiters[key] || [];
            moduleWaiters[key].push(waiter);

            if (
                typeof settings.timeoutMilliseconds === "number" &&
                settings.timeoutMilliseconds > 0
            ) {
                timeoutId = global.setTimeout(function timeoutModuleWait() {
                    var waiters = moduleWaiters[key];
                    var waiterIndex;

                    if (Array.isArray(waiters)) {
                        waiterIndex = waiters.indexOf(waiter);

                        if (waiterIndex >= 0) {
                            waiters.splice(waiterIndex, 1);
                        }

                        if (waiters.length === 0) {
                            delete moduleWaiters[key];
                        }
                    }

                    reject(
                        createBootstrapError(
                            'Timed out waiting for module "' +
                                name +
                                '".',
                            "MODULE_WAIT_TIMEOUT"
                        )
                    );
                }, settings.timeoutMilliseconds);
            }
        });
    };

    /**
     * Configures the runtime.
     *
     * Only known configuration properties are accepted.
     *
     * @param {Object} configuration
     * @returns {Object}
     */
    IronDisciple.configure = function configure(configuration) {
        var allowedKeys = {
            environment: true,
            debug: true,
            strictModuleRegistration: true,
            allowModuleReplacement: true,
            exposeLegacyModuleProperties: true
        };
        var key;

        if (!configuration || typeof configuration !== "object") {
            return IronDisciple.getConfiguration();
        }

        for (key in configuration) {
            if (
                Object.prototype.hasOwnProperty.call(
                    configuration,
                    key
                ) &&
                allowedKeys[key]
            ) {
                runtimeConfiguration[key] = configuration[key];
            }
        }

        return IronDisciple.getConfiguration();
    };

    /**
     * Returns a copy of the runtime configuration.
     *
     * @returns {Object}
     */
    IronDisciple.getConfiguration = function getConfiguration() {
        return shallowClone(runtimeConfiguration);
    };

    /**
     * Returns runtime and module status information.
     *
     * @returns {Object}
     */
    IronDisciple.getStatus = function getStatus() {
        var modules = IronDisciple.listModules();
        var degradedModules = [];
        var index;

        for (index = 0; index < modules.length; index += 1) {
            if (modules[index].status !== "READY") {
                degradedModules.push(modules[index].name);
            }
        }

        return {
            product: PRODUCT_NAME,
            bootstrapVersion: BOOTSTRAP_VERSION,
            initialized: true,
            environment: runtimeConfiguration.environment,
            debug: runtimeConfiguration.debug,
            moduleCount: modules.length,
            modules: modules,
            degradedModules: degradedModules,
            healthy: degradedModules.length === 0
        };
    };

    /**
     * Confirms that a module's declared dependencies remain available.
     *
     * @param {string} name
     * @returns {Object}
     */
    IronDisciple.checkModuleDependencies =
        function checkModuleDependencies(name) {
            var key;
            var record;
            var missing;

            if (!isValidModuleName(name)) {
                throw createBootstrapError(
                    "A valid module name is required.",
                    "INVALID_MODULE_NAME"
                );
            }

            key = normalizeModuleKey(name);
            record = moduleRegistry[key];

            if (!record) {
                throw createBootstrapError(
                    'Module "' + name + '" has not been registered.',
                    "MODULE_NOT_FOUND"
                );
            }

            missing = getMissingDependencies(record.dependencies);

            record.missingDependencies = missing;
            record.status =
                missing.length === 0
                    ? "READY"
                    : "DEGRADED";

            return {
                module: record.name,
                ready: missing.length === 0,
                missingDependencies: missing.slice()
            };
        };

    /**
     * Rechecks dependency status for all registered modules.
     *
     * @returns {Object[]}
     */
    IronDisciple.checkAllDependencies =
        function checkAllDependencies() {
            var results = [];
            var key;

            for (key in moduleRegistry) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        moduleRegistry,
                        key
                    )
                ) {
                    results.push(
                        IronDisciple.checkModuleDependencies(
                            moduleRegistry[key].name
                        )
                    );
                }
            }

            return results;
        };

    /**
     * Provides a guarded execution helper for startup code.
     *
     * @param {Function} callback
     * @param {Object} [options]
     * @returns {*}
     */
    IronDisciple.ready = function ready(callback, options) {
        var settings = options || {};
        var requiredModules =
            Array.isArray(settings.modules)
                ? settings.modules
                : [];
        var missing =
            getMissingDependencies(requiredModules);

        if (typeof callback !== "function") {
            throw createBootstrapError(
                "IronDisciple.ready requires a callback function.",
                "INVALID_READY_CALLBACK"
            );
        }

        if (missing.length > 0) {
            throw createBootstrapError(
                "Application startup is missing required modules: " +
                    missing.join(", ") +
                    ".",
                "APPLICATION_DEPENDENCY_MISSING"
            );
        }

        return callback(IronDisciple);
    };

    /**
     * Internal metadata.
     *
     * These properties are intentionally non-enumerable where supported so
     * they do not clutter normal object inspection.
     */
    try {
        Object.defineProperty(
            IronDisciple,
            "__bootstrapInitialized",
            {
                value: true,
                enumerable: false,
                writable: false,
                configurable: false
            }
        );

        Object.defineProperty(
            IronDisciple,
            "__bootstrapVersion",
            {
                value: BOOTSTRAP_VERSION,
                enumerable: false,
                writable: false,
                configurable: false
            }
        );
    } catch (error) {
        IronDisciple.__bootstrapInitialized = true;
        IronDisciple.__bootstrapVersion = BOOTSTRAP_VERSION;
    }

    /**
     * Register bootstrap metadata separately because bootstrap itself cannot
     * register as an ordinary module until the registry methods exist.
     */
    moduleRegistry.bootstrap = {
        name: "Bootstrap",
        key: "bootstrap",
        value: IronDisciple,
        version: BOOTSTRAP_VERSION,
        dependencies: [],
        missingDependencies: [],
        metadata: {
            core: true,
            description:
                "Iron Disciple namespace and module registry."
        },
        registeredAt: new Date().toISOString(),
        status: "READY"
    };

    global.IronDisciple = IronDisciple;
})(
    typeof window !== "undefined"
        ? window
        : typeof globalThis !== "undefined"
            ? globalThis
            : this
);
