/**
 * Iron Disciple OS
 * Core Runtime Bootstrap
 *
 * Provides the single global module registry used by the core runtime.
 */
(function initializeIronDiscipleBootstrap(global) {
    "use strict";

    if (!global) {
        throw new Error("Iron Disciple requires a global runtime object.");
    }

    if (
        global.IronDisciple &&
        typeof global.IronDisciple.register === "function" &&
        typeof global.IronDisciple.get === "function"
    ) {
        return;
    }

    var modules = Object.create(null);
    var readyQueue = [];

    function normalizeName(name) {
        var normalized = String(name || "").trim();
        if (!normalized) {
            throw new TypeError("A non-empty module name is required.");
        }
        return normalized;
    }

    function has(name) {
        return Object.prototype.hasOwnProperty.call(modules, String(name));
    }

    function get(name) {
        return has(name) ? modules[String(name)] : undefined;
    }

    function dependenciesReady(required) {
        return required.every(has);
    }

    function flushReadyQueue() {
        var pending = readyQueue.slice();
        var progressed = true;

        while (progressed && pending.length) {
            progressed = false;
            pending = pending.filter(function executeReadyEntry(entry) {
                if (!dependenciesReady(entry.modules)) {
                    return true;
                }
                entry.callback(api);
                progressed = true;
                return false;
            });
        }

        readyQueue = pending;
    }

    function register(name, value, options) {
        var key = normalizeName(name);
        var replace = Boolean(options && options.replace);

        if (has(key) && !replace) {
            throw new Error("Iron Disciple module already registered: " + key);
        }

        modules[key] = value;
        api.Modules[key] = {
            name: key,
            registeredAt: new Date().toISOString()
        };
        flushReadyQueue();
        return value;
    }

    function remove(name) {
        var key = normalizeName(name);
        var existed = has(key);
        if (existed) {
            delete modules[key];
            delete api.Modules[key];
        }
        return existed;
    }

    function list() {
        return Object.keys(modules).sort();
    }

    function ready(callback, options) {
        if (typeof callback !== "function") {
            throw new TypeError("IronDisciple.ready requires a callback.");
        }

        var required = Array.isArray(options && options.modules)
            ? options.modules.map(normalizeName)
            : [];

        if (dependenciesReady(required)) {
            return callback(api);
        }

        readyQueue.push({
            callback: callback,
            modules: required
        });
        return undefined;
    }

    var api = {
        version: "1.0.0",
        Modules: Object.create(null),
        register: register,
        unregister: remove,
        get: get,
        has: has,
        list: list,
        ready: ready
    };

    global.IronDisciple = api;
}(typeof window !== "undefined" ? window : globalThis));
