/**
 * Iron Disciple OS
 * Core Utilities
 *
 * File: core/utilities.js
 * Version: 1.1.0
 *
 * Purpose:
 * Provides deterministic, side-effect-free helper functions shared by
 * Iron Disciple engines, providers, models, rules, diagnostics, and adapters.
 *
 * Runtime:
 * Browser-native JavaScript.
 *
 * Dependencies:
 * - core/bootstrap.js
 * - core/constants.js
 *
 * Global Registration:
 * IronDisciple.register("Utilities", Utilities)
 *
 * Assembly:
 * This file is delivered in numbered sections. Paste every section into this
 * same file in order. Do not close the module wrapper until the final section.
 */

(function initializeIronDiscipleUtilities(global) {
    "use strict";

    if (!global || !global.IronDisciple) {
        throw new Error(
            "Iron Disciple Utilities requires core/bootstrap.js to be loaded first."
        );
    }

    var IronDisciple = global.IronDisciple;

    if (typeof IronDisciple.register !== "function") {
        throw new Error(
            "Iron Disciple Utilities requires a valid module registry."
        );
    }

    var Constants = IronDisciple.get("Constants");
    var VERSION = "1.1.0";
    var objectPrototype = Object.prototype;
    var hasOwnProperty = objectPrototype.hasOwnProperty;
    var toString = objectPrototype.toString;

    /**
     * Public utility namespace.
     *
     * Functions are assigned throughout the file and frozen during final
     * registration.
     */
    var Utilities = {};

    /**
     * Internal marker used to distinguish omitted arguments from arguments
     * intentionally supplied as undefined.
     */
    var UNSET = {
        marker: "IRON_DISCIPLE_UNSET"
    };

    /**
     * Returns whether an object owns a property directly.
     *
     * @param {*} target
     * @param {string|number|symbol} property
     * @returns {boolean}
     */
    function owns(target, property) {
        return (
            target !== null &&
            typeof target !== "undefined" &&
            hasOwnProperty.call(Object(target), property)
        );
    }

    /**
     * Returns the normalized internal type tag for a value.
     *
     * Examples:
     * - "Array"
     * - "Object"
     * - "Date"
     * - "RegExp"
     *
     * @param {*} value
     * @returns {string}
     */
    function getTypeTag(value) {
        return toString.call(value).slice(8, -1);
    }

    /**
     * Determines whether a value is neither null nor undefined.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isDefined(value) {
        return value !== null && typeof value !== "undefined";
    }

    /**
     * Determines whether a value is undefined.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isUndefined(value) {
        return typeof value === "undefined";
    }

    /**
     * Determines whether a value is null.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isNull(value) {
        return value === null;
    }

    /**
     * Determines whether a value is a string.
     *
     * Primitive strings and String objects are accepted.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isString(value) {
        return (
            typeof value === "string" ||
            getTypeTag(value) === "String"
        );
    }

    /**
     * Determines whether a value is a non-empty string after trimming.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isNonEmptyString(value) {
        return isString(value) && String(value).trim().length > 0;
    }

    /**
     * Determines whether a value is a number and not NaN.
     *
     * Infinity is accepted. Use isFiniteNumber when finite values are required.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isNumber(value) {
        return (
            typeof value === "number" &&
            !Number.isNaN(value)
        );
    }

    /**
     * Determines whether a value is a finite number.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isFiniteNumber(value) {
        return (
            typeof value === "number" &&
            Number.isFinite(value)
        );
    }

    /**
     * Determines whether a value is an integer.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isInteger(value) {
        return Number.isInteger(value);
    }

    /**
     * Determines whether a value is a safe integer.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isSafeInteger(value) {
        return Number.isSafeInteger(value);
    }

    /**
     * Determines whether a value is a boolean.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isBoolean(value) {
        return typeof value === "boolean";
    }

    /**
     * Determines whether a value is a function.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isFunction(value) {
        return typeof value === "function";
    }

    /**
     * Determines whether a value is an array.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isArray(value) {
        return Array.isArray(value);
    }

    /**
     * Determines whether a value is an object, excluding null.
     *
     * Arrays, dates, maps, sets, and class instances are accepted.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isObject(value) {
        return value !== null && typeof value === "object";
    }

    /**
     * Determines whether a value is a plain object.
     *
     * Objects created with `{}` or `Object.create(null)` are accepted.
     * Arrays, dates, maps, sets, and class instances are rejected.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isPlainObject(value) {
        var prototype;

        if (getTypeTag(value) !== "Object") {
            return false;
        }

        prototype = Object.getPrototypeOf(value);

        return (
            prototype === null ||
            prototype === Object.prototype
        );
    }

    /**
     * Determines whether a value is a Date object containing a valid date.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isDate(value) {
        return (
            getTypeTag(value) === "Date" &&
            !Number.isNaN(value.getTime())
        );
    }

    /**
     * Determines whether a value is a regular expression.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isRegExp(value) {
        return getTypeTag(value) === "RegExp";
    }

    /**
     * Determines whether a value is a Map.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isMap(value) {
        return getTypeTag(value) === "Map";
    }

    /**
     * Determines whether a value is a Set.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isSet(value) {
        return getTypeTag(value) === "Set";
    }

    /**
     * Determines whether a value behaves like a Promise.
     *
     * This intentionally uses duck typing to support promises created in
     * another window or execution realm.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isPromise(value) {
        return (
            isDefined(value) &&
            (
                typeof value === "object" ||
                typeof value === "function"
            ) &&
            isFunction(value.then) &&
            isFunction(value.catch)
        );
    }

    /**
     * Determines whether a value is iterable.
     *
     * Strings are iterable and therefore return true.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isIterable(value) {
        return (
            isDefined(value) &&
            typeof Symbol !== "undefined" &&
            Symbol.iterator &&
            isFunction(value[Symbol.iterator])
        );
    }

    /**
     * Determines whether a value is array-like.
     *
     * Functions are excluded even though they expose a length property.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isArrayLike(value) {
        return (
            isDefined(value) &&
            !isFunction(value) &&
            isFiniteNumber(value.length) &&
            value.length >= 0 &&
            Number.isInteger(value.length)
        );
    }

    /**
     * Determines whether a value is a primitive.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isPrimitive(value) {
        return (
            value === null ||
            (
                typeof value !== "object" &&
                typeof value !== "function"
            )
        );
    }

    /**
     * Determines whether a value is empty.
     *
     * Empty values:
     * - null
     * - undefined
     * - ""
     * - whitespace-only strings
     * - []
     * - {}
     * - Map with size 0
     * - Set with size 0
     *
     * Numbers and booleans are never considered empty.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isEmpty(value) {
        if (!isDefined(value)) {
            return true;
        }

        if (isString(value)) {
            return String(value).trim().length === 0;
        }

        if (isArray(value)) {
            return value.length === 0;
        }

        if (isMap(value) || isSet(value)) {
            return value.size === 0;
        }

        if (isPlainObject(value)) {
            return Object.keys(value).length === 0;
        }

        return false;
    }

    /**
     * Determines whether a value can be interpreted as a numeric value
     * without accepting empty strings or booleans.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isNumeric(value) {
        if (isNumber(value)) {
            return true;
        }

        if (!isNonEmptyString(value)) {
            return false;
        }

        return Number.isFinite(Number(value));
    }

    /**
     * Returns the first value that is neither null nor undefined.
     *
     * Unlike logical OR, valid false, zero, and empty-string values are retained.
     *
     * @returns {*}
     */
    function coalesce() {
        var index;

        for (index = 0; index < arguments.length; index += 1) {
            if (isDefined(arguments[index])) {
                return arguments[index];
            }
        }

        return undefined;
    }

    /**
     * Returns a fallback when a value is null or undefined.
     *
     * @param {*} value
     * @param {*} fallback
     * @returns {*}
     */
    function defaultTo(value, fallback) {
        return isDefined(value) ? value : fallback;
    }

    /**
     * Converts a value to a boolean using strict, predictable rules.
     *
     * Recognized true strings:
     * - "true"
     * - "yes"
     * - "y"
     * - "1"
     * - "on"
     *
     * Recognized false strings:
     * - "false"
     * - "no"
     * - "n"
     * - "0"
     * - "off"
     * - ""
     *
     * @param {*} value
     * @param {boolean} [fallback=false]
     * @returns {boolean}
     */
    function toBoolean(value, fallback) {
        var normalized;

        if (isBoolean(value)) {
            return value;
        }

        if (value === 1) {
            return true;
        }

        if (value === 0) {
            return false;
        }

        if (isString(value)) {
            normalized = String(value).trim().toLowerCase();

            if (
                normalized === "true" ||
                normalized === "yes" ||
                normalized === "y" ||
                normalized === "1" ||
                normalized === "on"
            ) {
                return true;
            }

            if (
                normalized === "false" ||
                normalized === "no" ||
                normalized === "n" ||
                normalized === "0" ||
                normalized === "off" ||
                normalized === ""
            ) {
                return false;
            }
        }

        return isBoolean(fallback) ? fallback : false;
    }

    /**
     * Converts a value to a finite number.
     *
     * @param {*} value
     * @param {number} [fallback=0]
     * @returns {number}
     */
    function toNumber(value, fallback) {
        var converted = Number(value);

        if (Number.isFinite(converted)) {
            return converted;
        }

        return isFiniteNumber(fallback) ? fallback : 0;
    }

    /**
     * Converts a value to an integer using truncation.
     *
     * @param {*} value
     * @param {number} [fallback=0]
     * @returns {number}
     */
      function toInteger(value, fallback) {
        var converted = Number(value);

        if (!Number.isFinite(converted)) {
            return isInteger(fallback) ? fallback : 0;
        }

        return converted < 0
            ? Math.ceil(converted)
            : Math.floor(converted);
    }
    /**
     * Converts a value to a string.
     *
     * Null and undefined become the supplied fallback rather than literal
     * "null" or "undefined" strings.
     *
     * @param {*} value
     * @param {string} [fallback=""]
     * @returns {string}
     */
    function toStringSafe(value, fallback) {
        if (!isDefined(value)) {
            return isString(fallback) ? String(fallback) : "";
        }

        return String(value);
    }

    /**
     * Returns the enumerable own keys of an object.
     *
     * Non-object inputs return an empty array.
     *
     * @param {*} value
     * @returns {string[]}
     */
    function keys(value) {
        if (!isObject(value) && !isFunction(value)) {
            return [];
        }

        return Object.keys(value);
    }

    /**
     * Returns the enumerable own values of an object.
     *
     * @param {*} value
     * @returns {*[]}
     */
    function values(value) {
        return keys(value).map(function mapValue(key) {
            return value[key];
        });
    }

    /**
     * Returns enumerable own key-value pairs.
     *
     * @param {*} value
     * @returns {Array<Array<*>>}
     */
    function entries(value) {
        return keys(value).map(function mapEntry(key) {
            return [key, value[key]];
        });
    }

    /**
     * Creates an object from key-value pairs.
     *
     * Invalid entries are ignored.
     *
     * @param {*} pairs
     * @returns {Object}
     */
    function fromEntries(pairs) {
        var result = {};
        var index;
        var pair;

        if (!isArray(pairs)) {
            return result;
        }

        for (index = 0; index < pairs.length; index += 1) {
            pair = pairs[index];

            if (isArray(pair) && pair.length >= 2) {
                result[pair[0]] = pair[1];
            }
        }

        return result;
    }

    /**
     * Creates a shallow clone of a value.
     *
     * Supported:
     * - Arrays
     * - Plain objects
     * - Dates
     * - Regular expressions
     * - Maps
     * - Sets
     *
     * Primitive values are returned unchanged.
     *
     * @param {*} value
     * @returns {*}
     */
    function clone(value) {
        if (isArray(value)) {
            return value.slice();
        }

        if (isDate(value)) {
            return new Date(value.getTime());
        }

        if (isRegExp(value)) {
            return new RegExp(value.source, value.flags);
        }

        if (isMap(value)) {
            return new Map(value);
        }

        if (isSet(value)) {
            return new Set(value);
        }

        if (isPlainObject(value)) {
            return Object.assign({}, value);
        }

        return value;
    }

    /**
     * Creates a deep clone while preserving supported built-in types.
     *
     * Circular references are preserved through a WeakMap when available.
     *
     * Functions are returned by reference.
     * DOM nodes and unsupported host objects are returned by reference.
     *
     * @param {*} value
     * @param {WeakMap} [seen]
     * @returns {*}
     */
    function deepClone(value, seen) {
        var references = seen;
        var result;
        var key;

        if (isPrimitive(value) || isFunction(value)) {
            return value;
        }

        if (isDate(value)) {
            return new Date(value.getTime());
        }

        if (isRegExp(value)) {
            result = new RegExp(value.source, value.flags);
            result.lastIndex = value.lastIndex;
            return result;
        }

        if (!references && typeof WeakMap !== "undefined") {
            references = new WeakMap();
        }

        if (references && references.has(value)) {
            return references.get(value);
        }

        if (isArray(value)) {
            result = [];

            if (references) {
                references.set(value, result);
            }

            for (key = 0; key < value.length; key += 1) {
                result[key] = deepClone(value[key], references);
            }

            return result;
        }

        if (isMap(value)) {
            result = new Map();

            if (references) {
                references.set(value, result);
            }

            value.forEach(function cloneMapEntry(mapValue, mapKey) {
                result.set(
                    deepClone(mapKey, references),
                    deepClone(mapValue, references)
                );
            });

            return result;
        }

        if (isSet(value)) {
            result = new Set();

            if (references) {
                references.set(value, result);
            }

            value.forEach(function cloneSetEntry(setValue) {
                result.add(deepClone(setValue, references));
            });

            return result;
        }

        if (isPlainObject(value)) {
            result = Object.create(Object.getPrototypeOf(value));

            if (references) {
                references.set(value, result);
            }

            keys(value).forEach(function cloneObjectProperty(property) {
                result[property] = deepClone(
                    value[property],
                    references
                );
            });

            return result;
        }

        return value;
    }

    /**
     * Copies enumerable own properties from source objects into a target.
     *
     * This is a shallow operation.
     *
     * @param {Object} target
     * @returns {Object}
     */
    function assign(target) {
        var destination;
        var sourceIndex;
        var source;

        destination = isObject(target) || isFunction(target)
            ? target
            : {};

        for (
            sourceIndex = 1;
            sourceIndex < arguments.length;
            sourceIndex += 1
        ) {
            source = arguments[sourceIndex];

            if (!isDefined(source)) {
                continue;
            }

            keys(Object(source)).forEach(function copyProperty(property) {
                destination[property] = source[property];
            });
        }

        return destination;
    }

    /**
     * Creates a new shallow-merged object.
     *
     * Inputs are never mutated.
     *
     * @returns {Object}
     */
    function merge() {
        var result = {};
        var index;

        for (index = 0; index < arguments.length; index += 1) {
            if (isDefined(arguments[index])) {
                assign(result, arguments[index]);
            }
        }

        return result;
    }

    /**
     * Internal recursive merge implementation.
     *
     * Arrays are replaced by default rather than concatenated.
     *
     * Supported options:
     * - arrayStrategy: "replace" | "concat"
     * - cloneValues: boolean
     *
     * @param {Object} target
     * @param {Object} source
     * @param {Object} options
     * @returns {Object}
     */
    function mergeDeepInto(target, source, options) {
        var result = target;
        var settings = options || {};

        if (!isPlainObject(source)) {
            return result;
        }

        keys(source).forEach(function mergeProperty(property) {
            var sourceValue = source[property];
            var targetValue = result[property];

            if (isPlainObject(sourceValue)) {
                result[property] = mergeDeepInto(
                    isPlainObject(targetValue)
                        ? targetValue
                        : {},
                    sourceValue,
                    settings
                );

                return;
            }

            if (isArray(sourceValue)) {
                if (
                    settings.arrayStrategy === "concat" &&
                    isArray(targetValue)
                ) {
                    result[property] = targetValue.concat(
                        settings.cloneValues === false
                            ? sourceValue
                            : deepClone(sourceValue)
                    );
                } else {
                    result[property] =
                        settings.cloneValues === false
                            ? sourceValue.slice()
                            : deepClone(sourceValue);
                }

                return;
            }

            result[property] =
                settings.cloneValues === false
                    ? sourceValue
                    : deepClone(sourceValue);
        });

        return result;
    }

    /**
     * Deeply merges plain objects into a new object.
     *
     * Default behavior:
     * - Plain objects merge recursively.
     * - Arrays replace earlier arrays.
     * - Values are cloned.
     *
     * Optional final settings object:
     *
     * {
     *     __mergeOptions: true,
     *     arrayStrategy: "replace" | "concat",
     *     cloneValues: true | false
     * }
     *
     * @returns {Object}
     */
    function deepMerge() {
        var args = Array.prototype.slice.call(arguments);
        var options = {
            arrayStrategy: "replace",
            cloneValues: true
        };
        var result = {};
        var finalArgument;
        var index;

        if (args.length > 0) {
            finalArgument = args[args.length - 1];

            if (
                isPlainObject(finalArgument) &&
                finalArgument.__mergeOptions === true
            ) {
                options = assign(options, finalArgument);
                args.pop();
            }
        }

        for (index = 0; index < args.length; index += 1) {
            if (isPlainObject(args[index])) {
                result = mergeDeepInto(
                    result,
                    args[index],
                    options
                );
            }
        }

        return result;
    }

    /**
     * Returns a copy of an object containing only selected properties.
     *
     * @param {*} source
     * @param {string|string[]} propertyNames
     * @returns {Object}
     */
    function pick(source, propertyNames) {
        var result = {};
        var names = isArray(propertyNames)
            ? propertyNames
            : Array.prototype.slice.call(arguments, 1);

        if (!isDefined(source)) {
            return result;
        }

        names.forEach(function pickProperty(property) {
            if (owns(source, property)) {
                result[property] = source[property];
            }
        });

        return result;
    }

    /**
     * Returns a copy of an object excluding selected properties.
     *
     * @param {*} source
     * @param {string|string[]} propertyNames
     * @returns {Object}
     */
    function omit(source, propertyNames) {
        var result = {};
        var names = isArray(propertyNames)
            ? propertyNames
            : Array.prototype.slice.call(arguments, 1);
        var excluded = Object.create(null);

        names.forEach(function indexExcludedProperty(property) {
            excluded[property] = true;
        });

        if (!isDefined(source)) {
            return result;
        }

        keys(Object(source)).forEach(function omitProperty(property) {
            if (!excluded[property]) {
                result[property] = source[property];
            }
        });

        return result;
    }

    /**
     * Maps the values of an object's enumerable own properties.
     *
     * @param {*} source
     * @param {Function} iteratee
     * @returns {Object}
     */
    function mapValues(source, iteratee) {
        var result = {};

        if (!isDefined(source) || !isFunction(iteratee)) {
            return result;
        }

        keys(Object(source)).forEach(function mapProperty(property) {
            result[property] = iteratee(
                source[property],
                property,
                source
            );
        });

        return result;
    }

    /**
     * Filters the enumerable own properties of an object.
     *
     * @param {*} source
     * @param {Function} predicate
     * @returns {Object}
     */
    function filterObject(source, predicate) {
        var result = {};

        if (!isDefined(source) || !isFunction(predicate)) {
            return result;
        }

        keys(Object(source)).forEach(function filterProperty(property) {
            if (
                predicate(
                    source[property],
                    property,
                    source
                )
            ) {
                result[property] = source[property];
            }
        });

        return result;
    }

    /**
     * Removes properties whose values are undefined.
     *
     * @param {*} source
     * @returns {Object}
     */
    function compactObject(source) {
        return filterObject(
            source,
            function retainDefinedValues(value) {
                return typeof value !== "undefined";
            }
        );
    }

    /**
     * Returns a copy containing only properties whose values are defined.
     *
     * Null values are retained.
     *
     * @param {*} source
     * @returns {Object}
     */
    function removeUndefined(source) {
        return compactObject(source);
    }

    /**
     * Returns a copy with null and undefined properties removed.
     *
     * @param {*} source
     * @returns {Object}
     */
    function removeNullish(source) {
        return filterObject(
            source,
            function retainNonNullishValues(value) {
                return isDefined(value);
            }
        );
    }

    /**
     * Creates a shallow frozen copy of a value.
     *
     * Primitive values are returned unchanged.
     *
     * @param {*} value
     * @returns {*}
     */
    function freeze(value) {
        if (!isObject(value) && !isFunction(value)) {
            return value;
        }

        return Object.freeze(value);
    }

    /**
     * Deeply freezes supported object graphs.
     *
     * Circular references are handled through a WeakSet when available.
     *
     * @param {*} value
     * @param {WeakSet} [seen]
     * @returns {*}
     */
    function deepFreeze(value, seen) {
        var references = seen;

        if (
            !isObject(value) &&
            !isFunction(value)
        ) {
            return value;
        }

        if (Object.isFrozen(value)) {
            return value;
        }

        if (!references && typeof WeakSet !== "undefined") {
            references = new WeakSet();
        }

        if (references) {
            if (references.has(value)) {
                return value;
            }

            references.add(value);
        }

        if (isMap(value)) {
            value.forEach(function freezeMapEntry(mapValue, mapKey) {
                deepFreeze(mapKey, references);
                deepFreeze(mapValue, references);
            });
        } else if (isSet(value)) {
            value.forEach(function freezeSetEntry(setValue) {
                deepFreeze(setValue, references);
            });
        } else {
            Object.getOwnPropertyNames(value).forEach(
                function freezeProperty(property) {
                    deepFreeze(value[property], references);
                }
            );
        }

        return Object.freeze(value);
    }

    /**
     * Safely retrieves a nested property.
     *
     * Path formats:
     * - "profile.goals.0.category"
     * - ["profile", "goals", 0, "category"]
     *
     * @param {*} source
     * @param {string|Array<string|number>} path
     * @param {*} [fallback]
     * @returns {*}
     */
    function getPath(source, path, fallback) {
        var segments;
        var current;
        var index;

        if (isArray(path)) {
            segments = path.slice();
        } else if (isString(path)) {
            segments = String(path)
                .replace(/\[(\d+)\]/g, ".$1")
                .split(".")
                .filter(function removeEmptySegment(segment) {
                    return segment !== "";
                });
        } else {
            return fallback;
        }

        current = source;

        for (index = 0; index < segments.length; index += 1) {
            if (!isDefined(current)) {
                return fallback;
            }

            current = current[segments[index]];
        }

        return isDefined(current) ? current : fallback;
    }

    /**
     * Determines whether a nested path exists as an own-property chain.
     *
     * @param {*} source
     * @param {string|Array<string|number>} path
     * @returns {boolean}
     */
    function hasPath(source, path) {
        var segments;
        var current;
        var index;

        if (isArray(path)) {
            segments = path.slice();
        } else if (isString(path)) {
            segments = String(path)
                .replace(/\[(\d+)\]/g, ".$1")
                .split(".")
                .filter(function removeEmptySegment(segment) {
                    return segment !== "";
                });
        } else {
            return false;
        }

        current = source;

        for (index = 0; index < segments.length; index += 1) {
            if (!isDefined(current) || !owns(current, segments[index])) {
                return false;
            }

            current = current[segments[index]];
        }

        return true;
    }

    /**
     * Sets a nested property on an object.
     *
     * Missing intermediate containers are created automatically.
     *
     * This function mutates the supplied target and returns it.
     *
     * @param {Object} target
     * @param {string|Array<string|number>} path
     * @param {*} value
     * @returns {Object}
     */
    function setPath(target, path, value) {
        var segments;
        var current;
        var index;
        var segment;
        var nextSegment;

        if (!isObject(target)) {
            throw new TypeError(
                "setPath requires an object target."
            );
        }

        if (isArray(path)) {
            segments = path.slice();
        } else if (isNonEmptyString(path)) {
            segments = String(path)
                .replace(/\[(\d+)\]/g, ".$1")
                .split(".")
                .filter(function removeEmptySegment(item) {
                    return item !== "";
                });
        } else {
            throw new TypeError(
                "setPath requires a valid path."
            );
        }

        current = target;

        for (index = 0; index < segments.length; index += 1) {
            segment = segments[index];

            if (index === segments.length - 1) {
                current[segment] = value;
                break;
            }

            nextSegment = segments[index + 1];

            if (
                !isObject(current[segment]) &&
                !isArray(current[segment])
            ) {
                current[segment] =
                    String(Number(nextSegment)) === String(nextSegment)
                        ? []
                        : {};
            }

            current = current[segment];
        }

        return target;
    }

    /**
     * Deletes a nested property.
     *
     * Returns true when a property was deleted.
     *
     * @param {*} target
     * @param {string|Array<string|number>} path
     * @returns {boolean}
     */
    function deletePath(target, path) {
        var segments;
        var parentPath;
        var property;
        var parent;

        if (!isObject(target)) {
            return false;
        }

        if (isArray(path)) {
            segments = path.slice();
        } else if (isNonEmptyString(path)) {
            segments = String(path)
                .replace(/\[(\d+)\]/g, ".$1")
                .split(".")
                .filter(function removeEmptySegment(segment) {
                    return segment !== "";
                });
        } else {
            return false;
        }

        if (segments.length === 0) {
            return false;
        }

        property = segments.pop();
        parentPath = segments;
        parent =
            parentPath.length === 0
                ? target
                : getPath(target, parentPath);

        if (!isDefined(parent) || !owns(parent, property)) {
            return false;
        }

        return delete parent[property];
    }

    /**
     * Assign the first section's public functions.
     *
     * Final freezing and registration occur in the final section.
     */
    assign(Utilities, {
        VERSION: VERSION,

        owns: owns,
        getTypeTag: getTypeTag,

        isDefined: isDefined,
        isUndefined: isUndefined,
        isNull: isNull,
        isString: isString,
        isNonEmptyString: isNonEmptyString,
        isNumber: isNumber,
        isFiniteNumber: isFiniteNumber,
        isInteger: isInteger,
        isSafeInteger: isSafeInteger,
        isBoolean: isBoolean,
        isFunction: isFunction,
        isArray: isArray,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isDate: isDate,
        isRegExp: isRegExp,
        isMap: isMap,
        isSet: isSet,
        isPromise: isPromise,
        isIterable: isIterable,
        isArrayLike: isArrayLike,
        isPrimitive: isPrimitive,
        isEmpty: isEmpty,
        isNumeric: isNumeric,

        coalesce: coalesce,
        defaultTo: defaultTo,

        toBoolean: toBoolean,
        toNumber: toNumber,
        toInteger: toInteger,
        toStringSafe: toStringSafe,

        keys: keys,
        values: values,
        entries: entries,
        fromEntries: fromEntries,

        clone: clone,
        deepClone: deepClone,
        assign: assign,
        merge: merge,
        deepMerge: deepMerge,

        pick: pick,
        omit: omit,
        mapValues: mapValues,
        filterObject: filterObject,
        compactObject: compactObject,
        removeUndefined: removeUndefined,
        removeNullish: removeNullish,

        freeze: freeze,
        deepFreeze: deepFreeze,

        getPath: getPath,
        hasPath: hasPath,
        setPath: setPath,
        deletePath: deletePath
    });

    /*
     * Continue directly below this line with Section 2.
     * Do not close the IIFE yet.
     */    /**
     * Converts an array-like or iterable value into an array.
     *
     * Null and undefined return an empty array.
     * Non-iterable scalar values become a one-item array.
     *
     * @param {*} value
     * @returns {*[]}
     */
    function toArray(value) {
        if (!isDefined(value)) {
            return [];
        }

        if (isArray(value)) {
            return value.slice();
        }

        if (isString(value)) {
            return Array.from(String(value));
        }

        if (isIterable(value)) {
            return Array.from(value);
        }

        if (isArrayLike(value)) {
            return Array.prototype.slice.call(value);
        }

        return [value];
    }

    /**
     * Returns a new array with null and undefined values removed.
     *
     * False, zero, and empty strings are retained.
     *
     * @param {*} collection
     * @returns {*[]}
     */
    function compact(collection) {
        return toArray(collection).filter(
            function retainDefinedValue(value) {
                return isDefined(value);
            }
        );
    }

    /**
     * Returns a new array containing only truthy values.
     *
     * @param {*} collection
     * @returns {*[]}
     */
    function compactTruthy(collection) {
        return toArray(collection).filter(Boolean);
    }

    /**
     * Returns the first element of a collection.
     *
     * @param {*} collection
     * @param {*} [fallback]
     * @returns {*}
     */
    function first(collection, fallback) {
        var array = toArray(collection);

        return array.length > 0 ? array[0] : fallback;
    }

    /**
     * Returns the final element of a collection.
     *
     * @param {*} collection
     * @param {*} [fallback]
     * @returns {*}
     */
    function last(collection, fallback) {
        var array = toArray(collection);

        return array.length > 0
            ? array[array.length - 1]
            : fallback;
    }

    /**
     * Returns the first n elements of a collection.
     *
     * @param {*} collection
     * @param {number} [count=1]
     * @returns {*[]}
     */
    function take(collection, count) {
        var array = toArray(collection);
        var limit = Math.max(0, toInteger(count, 1));

        return array.slice(0, limit);
    }

    /**
     * Returns all elements except the first n.
     *
     * @param {*} collection
     * @param {number} [count=1]
     * @returns {*[]}
     */
    function drop(collection, count) {
        var array = toArray(collection);
        var amount = Math.max(0, toInteger(count, 1));

        return array.slice(amount);
    }

    /**
     * Returns the last n elements of a collection.
     *
     * @param {*} collection
     * @param {number} [count=1]
     * @returns {*[]}
     */
    function takeRight(collection, count) {
        var array = toArray(collection);
        var limit = Math.max(0, toInteger(count, 1));

        if (limit === 0) {
            return [];
        }

        return array.slice(Math.max(0, array.length - limit));
    }

    /**
     * Returns all elements except the last n.
     *
     * @param {*} collection
     * @param {number} [count=1]
     * @returns {*[]}
     */
    function dropRight(collection, count) {
        var array = toArray(collection);
        var amount = Math.max(0, toInteger(count, 1));

        if (amount === 0) {
            return array;
        }

        return array.slice(0, Math.max(0, array.length - amount));
    }

    /**
     * Returns a new array with duplicate primitive values removed.
     *
     * Object values are compared by reference.
     *
     * @param {*} collection
     * @returns {*[]}
     */
    function unique(collection) {
        var array = toArray(collection);
        var seen = new Set();
        var result = [];

        array.forEach(function collectUnique(value) {
            if (!seen.has(value)) {
                seen.add(value);
                result.push(value);
            }
        });

        return result;
    }

    /**
     * Returns a new array with duplicates removed according to an iteratee.
     *
     * @param {*} collection
     * @param {Function|string} iteratee
     * @returns {*[]}
     */
    function uniqueBy(collection, iteratee) {
        var array = toArray(collection);
        var seen = new Set();
        var result = [];
        var selector;

        if (isFunction(iteratee)) {
            selector = iteratee;
        } else if (isString(iteratee)) {
            selector = function selectByPath(value) {
                return getPath(value, iteratee);
            };
        } else {
            selector = function identity(value) {
                return value;
            };
        }

        array.forEach(function collectUniqueValue(value, index) {
            var key = selector(value, index, array);

            if (!seen.has(key)) {
                seen.add(key);
                result.push(value);
            }
        });

        return result;
    }

    /**
     * Flattens one level of nested arrays.
     *
     * @param {*} collection
     * @returns {*[]}
     */
    function flatten(collection) {
        var result = [];

        toArray(collection).forEach(function flattenValue(value) {
            if (isArray(value)) {
                Array.prototype.push.apply(result, value);
            } else {
                result.push(value);
            }
        });

        return result;
    }

    /**
     * Recursively flattens nested arrays.
     *
     * @param {*} collection
     * @param {number} [maximumDepth=Infinity]
     * @returns {*[]}
     */
    function flattenDeep(collection, maximumDepth) {
        var result = [];
        var limit = isFiniteNumber(maximumDepth)
            ? Math.max(0, maximumDepth)
            : Infinity;

        function visit(value, depth) {
            if (isArray(value) && depth < limit) {
                value.forEach(function visitNested(item) {
                    visit(item, depth + 1);
                });

                return;
            }

            result.push(value);
        }

        toArray(collection).forEach(function visitRoot(value) {
            visit(value, 0);
        });

        return result;
    }

    /**
     * Splits a collection into fixed-size chunks.
     *
     * @param {*} collection
     * @param {number} size
     * @returns {Array<*[]>}
     */
    function chunk(collection, size) {
        var array = toArray(collection);
        var chunkSize = Math.max(1, toInteger(size, 1));
        var result = [];
        var index;

        for (
            index = 0;
            index < array.length;
            index += chunkSize
        ) {
            result.push(array.slice(index, index + chunkSize));
        }

        return result;
    }

    /**
     * Divides a collection into matching and non-matching groups.
     *
     * Returns:
     *
     * [
     *     matchingValues,
     *     nonMatchingValues
     * ]
     *
     * @param {*} collection
     * @param {Function} predicate
     * @returns {Array<*[]>}
     */
    function partition(collection, predicate) {
        var matches = [];
        var failures = [];
        var array = toArray(collection);
        var test = isFunction(predicate)
            ? predicate
            : Boolean;

        array.forEach(function partitionValue(value, index) {
            if (test(value, index, array)) {
                matches.push(value);
            } else {
                failures.push(value);
            }
        });

        return [matches, failures];
    }

    /**
     * Groups collection values by an iteratee result.
     *
     * @param {*} collection
     * @param {Function|string} iteratee
     * @returns {Object}
     */
    function groupBy(collection, iteratee) {
        var result = {};
        var array = toArray(collection);
        var selector;

        if (isFunction(iteratee)) {
            selector = iteratee;
        } else if (isString(iteratee)) {
            selector = function selectByPath(value) {
                return getPath(value, iteratee);
            };
        } else {
            selector = function identity(value) {
                return value;
            };
        }

        array.forEach(function groupValue(value, index) {
            var key = String(selector(value, index, array));

            if (!owns(result, key)) {
                result[key] = [];
            }

            result[key].push(value);
        });

        return result;
    }

    /**
     * Creates an object keyed by an iteratee result.
     *
     * Later values replace earlier values with the same key.
     *
     * @param {*} collection
     * @param {Function|string} iteratee
     * @returns {Object}
     */
    function keyBy(collection, iteratee) {
        var result = {};
        var array = toArray(collection);
        var selector;

        if (isFunction(iteratee)) {
            selector = iteratee;
        } else if (isString(iteratee)) {
            selector = function selectByPath(value) {
                return getPath(value, iteratee);
            };
        } else {
            selector = function identity(value) {
                return value;
            };
        }

        array.forEach(function assignKey(value, index) {
            var key = selector(value, index, array);

            if (isDefined(key)) {
                result[String(key)] = value;
            }
        });

        return result;
    }

    /**
     * Creates an object keyed by an iteratee result where each key contains
     * an array of matching values.
     *
     * This is an alias with explicit intent for indexed collections.
     *
     * @param {*} collection
     * @param {Function|string} iteratee
     * @returns {Object}
     */
    function indexBy(collection, iteratee) {
        return groupBy(collection, iteratee);
    }

    /**
     * Returns values from the first collection that do not occur in any
     * following collection.
     *
     * Object values are compared by reference.
     *
     * @returns {*[]}
     */
    function difference() {
        var collections = Array.prototype.slice.call(arguments);
        var primary = toArray(collections.shift());
        var excluded = new Set(
            flatten(
                collections.map(function normalizeCollection(value) {
                    return toArray(value);
                })
            )
        );

        return primary.filter(function retainDifference(value) {
            return !excluded.has(value);
        });
    }

    /**
     * Returns values from the first collection that occur in every following
     * collection.
     *
     * Duplicate values are removed.
     *
     * @returns {*[]}
     */
    function intersection() {
        var collections = Array.prototype.slice.call(arguments);
        var primary;
        var remaining;

        if (collections.length === 0) {
            return [];
        }

        primary = unique(toArray(collections.shift()));
        remaining = collections.map(function createLookup(value) {
            return new Set(toArray(value));
        });

        return primary.filter(function retainIntersection(value) {
            return remaining.every(function containsValue(set) {
                return set.has(value);
            });
        });
    }

    /**
     * Returns the unique union of all supplied collections.
     *
     * @returns {*[]}
     */
    function union() {
        var collections = Array.prototype.slice.call(arguments);

        return unique(
            flatten(
                collections.map(function normalizeCollection(value) {
                    return toArray(value);
                })
            )
        );
    }

    /**
     * Returns values appearing exactly once across all supplied collections.
     *
     * @returns {*[]}
     */
    function symmetricDifference() {
        var collections = Array.prototype.slice.call(arguments);
        var counts = new Map();
        var order = [];

        collections.forEach(function countCollection(collection) {
            unique(toArray(collection)).forEach(
                function countValue(value) {
                    if (!counts.has(value)) {
                        counts.set(value, 0);
                        order.push(value);
                    }

                    counts.set(value, counts.get(value) + 1);
                }
            );
        });

        return order.filter(function retainSingleOccurrence(value) {
            return counts.get(value) === 1;
        });
    }

    /**
     * Returns whether a collection contains a value.
     *
     * @param {*} collection
     * @param {*} value
     * @returns {boolean}
     */
    function includes(collection, value) {
        if (isString(collection)) {
            return String(collection).indexOf(String(value)) >= 0;
        }

        return toArray(collection).indexOf(value) >= 0;
    }

    /**
     * Counts values satisfying a predicate.
     *
     * Without a predicate, returns the collection length.
     *
     * @param {*} collection
     * @param {Function} [predicate]
     * @returns {number}
     */
    function count(collection, predicate) {
        var array = toArray(collection);

        if (!isFunction(predicate)) {
            return array.length;
        }

        return array.reduce(function countMatches(total, value, index) {
            return predicate(value, index, array)
                ? total + 1
                : total;
        }, 0);
    }

    /**
     * Counts values by iteratee result.
     *
     * @param {*} collection
     * @param {Function|string} iteratee
     * @returns {Object}
     */
    function countBy(collection, iteratee) {
        var groups = groupBy(collection, iteratee);

        return mapValues(
            groups,
            function countGroup(values) {
                return values.length;
            }
        );
    }

    /**
     * Returns an array containing a value repeated n times.
     *
     * A function value is invoked for each item.
     *
     * @param {number} countValue
     * @param {*|Function} value
     * @returns {*[]}
     */
    function times(countValue, value) {
        var amount = Math.max(0, toInteger(countValue, 0));
        var result = [];
        var index;

        for (index = 0; index < amount; index += 1) {
            result.push(
                isFunction(value)
                    ? value(index)
                    : value
            );
        }

        return result;
    }

    /**
     * Returns a numeric range.
     *
     * Examples:
     *
     * range(5)       -> [0, 1, 2, 3, 4]
     * range(2, 5)    -> [2, 3, 4]
     * range(5, 1, -1)-> [5, 4, 3, 2]
     *
     * @param {number} start
     * @param {number} [end]
     * @param {number} [step=1]
     * @returns {number[]}
     */
    function range(start, end, step) {
        var rangeStart;
        var rangeEnd;
        var increment;
        var result = [];
        var current;

        if (!isDefined(end)) {
            rangeStart = 0;
            rangeEnd = toNumber(start, 0);
        } else {
            rangeStart = toNumber(start, 0);
            rangeEnd = toNumber(end, 0);
        }

        increment = isDefined(step)
            ? toNumber(step, 1)
            : rangeStart <= rangeEnd
                ? 1
                : -1;

        if (increment === 0) {
            throw new RangeError(
                "range step cannot be zero."
            );
        }

        if (
            rangeStart < rangeEnd &&
            increment < 0
        ) {
            return result;
        }

        if (
            rangeStart > rangeEnd &&
            increment > 0
        ) {
            return result;
        }

        if (increment > 0) {
            for (
                current = rangeStart;
                current < rangeEnd;
                current += increment
            ) {
                result.push(current);
            }
        } else {
            for (
                current = rangeStart;
                current > rangeEnd;
                current += increment
            ) {
                result.push(current);
            }
        }

        return result;
    }

    /**
     * Moves an item from one array position to another.
     *
     * Inputs are not mutated.
     *
     * @param {*} collection
     * @param {number} fromIndex
     * @param {number} toIndex
     * @returns {*[]}
     */
    function move(collection, fromIndex, toIndex) {
        var array = toArray(collection);
        var sourceIndex = toInteger(fromIndex, 0);
        var destinationIndex = toInteger(toIndex, 0);
        var item;

        if (sourceIndex < 0) {
            sourceIndex = array.length + sourceIndex;
        }

        if (destinationIndex < 0) {
            destinationIndex = array.length + destinationIndex;
        }

        if (
            sourceIndex < 0 ||
            sourceIndex >= array.length
        ) {
            return array;
        }

        destinationIndex = Math.max(
            0,
            Math.min(destinationIndex, array.length - 1)
        );

        item = array.splice(sourceIndex, 1)[0];
        array.splice(destinationIndex, 0, item);

        return array;
    }

    /**
     * Inserts a value into an array at a specified index.
     *
     * Inputs are not mutated.
     *
     * @param {*} collection
     * @param {number} index
     * @param {*} value
     * @returns {*[]}
     */
    function insertAt(collection, index, value) {
        var array = toArray(collection);
        var position = Math.max(
            0,
            Math.min(
                toInteger(index, array.length),
                array.length
            )
        );

        array.splice(position, 0, value);

        return array;
    }

    /**
     * Removes the value at an index.
     *
     * Inputs are not mutated.
     *
     * @param {*} collection
     * @param {number} index
     * @returns {*[]}
     */
    function removeAt(collection, index) {
        var array = toArray(collection);
        var position = toInteger(index, -1);

        if (position < 0) {
            position = array.length + position;
        }

        if (
            position >= 0 &&
            position < array.length
        ) {
            array.splice(position, 1);
        }

        return array;
    }

    /**
     * Removes values satisfying a predicate.
     *
     * Inputs are not mutated.
     *
     * @param {*} collection
     * @param {Function} predicate
     * @returns {*[]}
     */
    function removeWhere(collection, predicate) {
        var array = toArray(collection);

        if (!isFunction(predicate)) {
            return array;
        }

        return array.filter(function retainValue(value, index) {
            return !predicate(value, index, array);
        });
    }

    /**
     * Replaces the value at an index.
     *
     * Inputs are not mutated.
     *
     * @param {*} collection
     * @param {number} index
     * @param {*} value
     * @returns {*[]}
     */
    function replaceAt(collection, index, value) {
        var array = toArray(collection);
        var position = toInteger(index, -1);

        if (position < 0) {
            position = array.length + position;
        }

        if (
            position >= 0 &&
            position < array.length
        ) {
            array[position] = value;
        }

        return array;
    }

    /**
     * Returns a stable-sorted copy of a collection.
     *
     * Values considered equal by the comparator retain their original order.
     *
     * @param {*} collection
     * @param {Function} [comparator]
     * @returns {*[]}
     */
    function stableSort(collection, comparator) {
        var array = toArray(collection);
        var compare = isFunction(comparator)
            ? comparator
            : function defaultComparator(left, right) {
                if (left < right) {
                    return -1;
                }

                if (left > right) {
                    return 1;
                }

                return 0;
            };

        return array
            .map(function decorate(value, index) {
                return {
                    value: value,
                    index: index
                };
            })
            .sort(function compareDecorated(left, right) {
                var result = compare(
                    left.value,
                    right.value
                );

                return result === 0
                    ? left.index - right.index
                    : result;
            })
            .map(function undecorate(item) {
                return item.value;
            });
    }

    /**
     * Sorts a collection by one or more selectors.
     *
     * Selectors may be functions or property paths.
     *
     * Orders may contain:
     * - "asc"
     * - "desc"
     *
     * @param {*} collection
     * @param {Function|string|Array<Function|string>} selectors
     * @param {string|string[]} [orders="asc"]
     * @returns {*[]}
     */
    function sortBy(collection, selectors, orders) {
        var selectorList = isArray(selectors)
            ? selectors.slice()
            : [selectors];
        var orderList = isArray(orders)
            ? orders.slice()
            : [orders || "asc"];

        selectorList = selectorList.map(
            function normalizeSelector(selector) {
                if (isFunction(selector)) {
                    return selector;
                }

                if (isString(selector)) {
                    return function selectPath(value) {
                        return getPath(value, selector);
                    };
                }

                return function identity(value) {
                    return value;
                };
            }
        );

        return stableSort(
            collection,
            function compareBySelectors(left, right) {
                var index;
                var leftValue;
                var rightValue;
                var direction;

                for (
                    index = 0;
                    index < selectorList.length;
                    index += 1
                ) {
                    leftValue = selectorList[index](left);
                    rightValue = selectorList[index](right);

                    if (leftValue === rightValue) {
                        continue;
                    }

                    direction =
                        String(
                            orderList[index] ||
                            orderList[orderList.length - 1] ||
                            "asc"
                        ).toLowerCase() === "desc"
                            ? -1
                            : 1;

                    if (!isDefined(leftValue)) {
                        return 1;
                    }

                    if (!isDefined(rightValue)) {
                        return -1;
                    }

                    if (leftValue < rightValue) {
                        return -1 * direction;
                    }

                    if (leftValue > rightValue) {
                        return 1 * direction;
                    }
                }

                return 0;
            }
        );
    }

    /**
     * Sorts objects by descending numeric priority with deterministic
     * tie-breaking.
     *
     * Tie-break order:
     * 1. Priority descending
     * 2. Score descending
     * 3. ID ascending
     * 4. Original position
     *
     * @param {*} collection
     * @returns {*[]}
     */
    function sortByPriority(collection) {
        return stableSort(
            collection,
            function comparePriority(left, right) {
                var leftPriority = toNumber(
                    left && left.priority,
                    0
                );
                var rightPriority = toNumber(
                    right && right.priority,
                    0
                );
                var leftScore = toNumber(
                    left && left.score,
                    0
                );
                var rightScore = toNumber(
                    right && right.score,
                    0
                );
                var leftId = toStringSafe(
                    left && left.id,
                    ""
                );
                var rightId = toStringSafe(
                    right && right.id,
                    ""
                );

                if (leftPriority !== rightPriority) {
                    return rightPriority - leftPriority;
                }

                if (leftScore !== rightScore) {
                    return rightScore - leftScore;
                }

                if (leftId < rightId) {
                    return -1;
                }

                if (leftId > rightId) {
                    return 1;
                }

                return 0;
            }
        );
    }

    /**
     * Returns the value producing the minimum selector result.
     *
     * @param {*} collection
     * @param {Function|string} [iteratee]
     * @returns {*}
     */
    function minBy(collection, iteratee) {
        var array = toArray(collection);
        var selector;
        var selected;
        var selectedValue;

        if (array.length === 0) {
            return undefined;
        }

        if (isFunction(iteratee)) {
            selector = iteratee;
        } else if (isString(iteratee)) {
            selector = function selectPath(value) {
                return getPath(value, iteratee);
            };
        } else {
            selector = function identity(value) {
                return value;
            };
        }

        selected = array[0];
        selectedValue = selector(selected, 0, array);

        array.slice(1).forEach(function compareValue(value, index) {
            var candidateValue = selector(
                value,
                index + 1,
                array
            );

            if (candidateValue < selectedValue) {
                selected = value;
                selectedValue = candidateValue;
            }
        });

        return selected;
    }

    /**
     * Returns the value producing the maximum selector result.
     *
     * @param {*} collection
     * @param {Function|string} [iteratee]
     * @returns {*}
     */
    function maxBy(collection, iteratee) {
        var array = toArray(collection);
        var selector;
        var selected;
        var selectedValue;

        if (array.length === 0) {
            return undefined;
        }

        if (isFunction(iteratee)) {
            selector = iteratee;
        } else if (isString(iteratee)) {
            selector = function selectPath(value) {
                return getPath(value, iteratee);
            };
        } else {
            selector = function identity(value) {
                return value;
            };
        }

        selected = array[0];
        selectedValue = selector(selected, 0, array);

        array.slice(1).forEach(function compareValue(value, index) {
            var candidateValue = selector(
                value,
                index + 1,
                array
            );

            if (candidateValue > selectedValue) {
                selected = value;
                selectedValue = candidateValue;
            }
        });

        return selected;
    }

    /**
     * Returns the sum of numeric collection values.
     *
     * Non-numeric values are treated as zero.
     *
     * @param {*} collection
     * @returns {number}
     */
    function sum(collection) {
        return toArray(collection).reduce(
            function addValue(total, value) {
                return total + toNumber(value, 0);
            },
            0
        );
    }

    /**
     * Returns the sum of values selected from a collection.
     *
     * @param {*} collection
     * @param {Function|string} iteratee
     * @returns {number}
     */
    function sumBy(collection, iteratee) {
        var selector;

        if (isFunction(iteratee)) {
            selector = iteratee;
        } else if (isString(iteratee)) {
            selector = function selectPath(value) {
                return getPath(value, iteratee);
            };
        } else {
            selector = function identity(value) {
                return value;
            };
        }

        return toArray(collection).reduce(
            function addSelectedValue(total, value, index, array) {
                return total + toNumber(
                    selector(value, index, array),
                    0
                );
            },
            0
        );
    }

    /**
     * Returns the arithmetic mean of numeric collection values.
     *
     * Empty collections return zero.
     *
     * @param {*} collection
     * @returns {number}
     */
    function average(collection) {
        var array = toArray(collection);

        return array.length === 0
            ? 0
            : sum(array) / array.length;
    }

    /**
     * Returns the arithmetic mean of selected collection values.
     *
     * @param {*} collection
     * @param {Function|string} iteratee
     * @returns {number}
     */
    function averageBy(collection, iteratee) {
        var array = toArray(collection);

        return array.length === 0
            ? 0
            : sumBy(array, iteratee) / array.length;
    }
/******************************************************************************
 * Collection Searching
 *****************************************************************************/

/**
 * Returns the first collection value satisfying a predicate.
 *
 * Returns the supplied fallback when no value matches.
 *
 * @param {*} collection
 * @param {Function} predicate
 * @param {*} [fallback]
 * @returns {*}
 */
function find(
    collection,
    predicate,
    fallback
) {

    var array =
        toArray(collection);

    var index;

    if (!isFunction(predicate)) {
        return fallback;
    }

    for (
        index = 0;
        index < array.length;
        index += 1
    ) {

        if (
            predicate(
                array[index],
                index,
                array
            )
        ) {
            return array[index];
        }

    }

    return fallback;

}

/**
 * Returns the final collection value satisfying a predicate.
 *
 * Returns the supplied fallback when no value matches.
 *
 * @param {*} collection
 * @param {Function} predicate
 * @param {*} [fallback]
 * @returns {*}
 */
function findLast(
    collection,
    predicate,
    fallback
) {

    var array =
        toArray(collection);

    var index;

    if (!isFunction(predicate)) {
        return fallback;
    }

    for (
        index = array.length - 1;
        index >= 0;
        index -= 1
    ) {

        if (
            predicate(
                array[index],
                index,
                array
            )
        ) {
            return array[index];
        }

    }

    return fallback;

}

/**
 * Returns the index of the first value satisfying a predicate.
 *
 * Returns -1 when no value matches.
 *
 * @param {*} collection
 * @param {Function} predicate
 * @returns {number}
 */
function findIndex(
    collection,
    predicate
) {

    var array =
        toArray(collection);

    var index;

    if (!isFunction(predicate)) {
        return -1;
    }

    for (
        index = 0;
        index < array.length;
        index += 1
    ) {

        if (
            predicate(
                array[index],
                index,
                array
            )
        ) {
            return index;
        }

    }

    return -1;

}

/**
 * Returns the index of the final value satisfying a predicate.
 *
 * Returns -1 when no value matches.
 *
 * @param {*} collection
 * @param {Function} predicate
 * @returns {number}
 */
function findLastIndex(
    collection,
    predicate
) {

    var array =
        toArray(collection);

    var index;

    if (!isFunction(predicate)) {
        return -1;
    }

    for (
        index = array.length - 1;
        index >= 0;
        index -= 1
    ) {

        if (
            predicate(
                array[index],
                index,
                array
            )
        ) {
            return index;
        }

    }

    return -1;

}

/******************************************************************************
 * Collection Predicate Operations
 *****************************************************************************/

/**
 * Returns whether at least one collection value satisfies a predicate.
 *
 * @param {*} collection
 * @param {Function} predicate
 * @returns {boolean}
 */
function some(
    collection,
    predicate
) {

    var array =
        toArray(collection);

    if (!isFunction(predicate)) {
        return false;
    }

    return array.some(
        function testValue(
            value,
            index
        ) {

            return predicate(
                value,
                index,
                array
            );

        }
    );

}

/**
 * Returns whether every collection value satisfies a predicate.
 *
 * Empty collections return true, consistent with Array.prototype.every().
 *
 * @param {*} collection
 * @param {Function} predicate
 * @returns {boolean}
 */
function every(
    collection,
    predicate
) {

    var array =
        toArray(collection);

    if (!isFunction(predicate)) {
        return false;
    }

    return array.every(
        function testValue(
            value,
            index
        ) {

            return predicate(
                value,
                index,
                array
            );

        }
    );

}

/**
 * Returns values that do not satisfy a predicate.
 *
 * @param {*} collection
 * @param {Function} predicate
 * @returns {*[]}
 */
function reject(
    collection,
    predicate
) {

    var array =
        toArray(collection);

    if (!isFunction(predicate)) {
        return array;
    }

    return array.filter(
        function retainRejectedValue(
            value,
            index
        ) {

            return !predicate(
                value,
                index,
                array
            );

        }
    );

}
    /**
 * Creates a shuffled copy of an array using the Fisher-Yates algorithm.
 *
 * This is an internal helper. The original array is not modified.
 *
 * @param {Array} array
 * @returns {Array}
 */
function shuffleArray(array) {
    var result = array.slice();
    var currentIndex = result.length;
    var randomIndex;
    var temporaryValue;

    while (currentIndex > 1) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = result[currentIndex];
        result[currentIndex] = result[randomIndex];
        result[randomIndex] = temporaryValue;
    }

    return result;
}

/**
 * Returns one randomly selected value from a collection.
 *
 * Returns undefined when the collection is empty.
 *
 * @param {*} collection
 * @returns {*}
 */
function sample(collection) {
    var array = toArray(collection);

    if (array.length === 0) {
        return undefined;
    }

    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns a requested number of randomly selected values from a collection.
 *
 * Values are selected without replacement. The original collection is not
 * modified. A count below zero is treated as zero. A count larger than the
 * collection length returns all available values in random order.
 *
 * @param {*} collection
 * @param {number} count
 * @returns {Array}
 */
function sampleSize(collection, count) {
    var array = toArray(collection);
    var size = toInteger(count, 1);

    if (size <= 0 || array.length === 0) {
        return [];
    }

    size = Math.min(size, array.length);

    return shuffleArray(array).slice(0, size);
}

/**
 * Returns a randomly shuffled copy of a collection.
 *
 * The original collection is not modified.
 *
 * @param {*} collection
 * @returns {Array}
 */
function shuffle(collection) {
    return shuffleArray(toArray(collection));
}
    /**
 * Zips multiple collections together.
 *
 * Example:
 * zip([1,2], ["a","b"])
 * -> [[1,"a"], [2,"b"]]
 *
 * @returns {Array<*[]>}
 */
function zip() {
    var collections = Array.prototype.slice.call(arguments).map(toArray);
    var maximumLength = 0;
    var result = [];
    var index;
    var collectionIndex;

    collections.forEach(function determineMaximumLength(collection) {
        if (collection.length > maximumLength) {
            maximumLength = collection.length;
        }
    });

    for (index = 0; index < maximumLength; index += 1) {
        var row = [];

        for (
            collectionIndex = 0;
            collectionIndex < collections.length;
            collectionIndex += 1
        ) {
            row.push(collections[collectionIndex][index]);
        }

        result.push(row);
    }

    return result;
}

/**
 * Converts zipped rows back into grouped collections.
 *
 * Example:
 * unzip([[1,"a"],[2,"b"]])
 * -> [[1,2],["a","b"]]
 *
 * @param {*} collection
 * @returns {Array<*[]>}
 */
function unzip(collection) {
    return zip.apply(null, toArray(collection));
}

/**
 * Creates an object from parallel key and value collections.
 *
 * Example:
 * zipObject(["a","b"], [1,2])
 * -> { a:1, b:2 }
 *
 * @param {*} keysCollection
 * @param {*} valuesCollection
 * @returns {Object}
 */
function zipObject(keysCollection, valuesCollection) {
    var keysArray = toArray(keysCollection);
    var valuesArray = toArray(valuesCollection);
    var result = {};
    var length = Math.min(keysArray.length, valuesArray.length);
    var index;

    for (index = 0; index < length; index += 1) {
        result[keysArray[index]] = valuesArray[index];
    }

    return result;
}
    /**
 * Assign Section 2 utilities to the public namespace.
     */
    assign(Utilities, {
        toArray: toArray,
        compact: compact,
        compactTruthy: compactTruthy,

        
first: first,
last: last,
take: take,
drop: drop,
takeRight: takeRight,
dropRight: dropRight,

find: find,
findLast: findLast,
findIndex: findIndex,
findLastIndex: findLastIndex,
        
some: some,
every: every,
reject: reject,

sample: sample,
sampleSize: sampleSize,
shuffle: shuffle,

zip: zip,
unzip: unzip,
zipObject: zipObject,

groupBy: groupBy,
keyBy: keyBy,
indexBy: indexBy,
countBy: countBy,

unique: unique,
uniqueBy: uniqueBy,

    

        flatten: flatten,
        flattenDeep: flattenDeep,
        chunk: chunk,
        partition: partition,
        
        difference: difference,
        intersection: intersection,
        union: union,
        symmetricDifference: symmetricDifference,

        includes: includes,
        count: count,
        times: times,
        range: range,

        move: move,
        insertAt: insertAt,
        removeAt: removeAt,
        removeWhere: removeWhere,
        replaceAt: replaceAt,

        stableSort: stableSort,
        sortBy: sortBy,
        sortByPriority: sortByPriority,

        minBy: minBy,
        maxBy: maxBy,
        sum: sum,
        sumBy: sumBy,
        average: average,
        averageBy: averageBy
    });

    /*
     * Continue directly below this line with Section 3.
     * Do not close the IIFE yet.
     */    /**************************************************************************
     * Section 3
     * String Utilities
     **************************************************************************/

    /**
     * Returns a normalized string with leading and trailing whitespace removed.
     *
     * Null and undefined values return an empty string.
     *
     * @param {*} value
     * @returns {string}
     */
    function trim(value) {
        return toStringSafe(value, "").trim();
    }

    /**
     * Removes leading whitespace from a string.
     *
     * @param {*} value
     * @returns {string}
     */
    function trimStart(value) {
        return toStringSafe(value, "").replace(/^\s+/, "");
    }

    /**
     * Removes trailing whitespace from a string.
     *
     * @param {*} value
     * @returns {string}
     */
    function trimEnd(value) {
        return toStringSafe(value, "").replace(/\s+$/, "");
    }

    /**
     * Collapses consecutive whitespace characters into a single space.
     *
     * Leading and trailing whitespace is removed.
     *
     * @param {*} value
     * @returns {string}
     */
    function normalizeWhitespace(value) {
        return trim(value).replace(/\s+/g, " ");
    }

    /**
     * Returns a lowercase normalized string.
     *
     * @param {*} value
     * @returns {string}
     */
    function lowerCase(value) {
        return toStringSafe(value, "").toLowerCase();
    }

    /**
     * Returns an uppercase normalized string.
     *
     * @param {*} value
     * @returns {string}
     */
    function upperCase(value) {
        return toStringSafe(value, "").toUpperCase();
    }

    /**
     * Converts the first character of a string to uppercase.
     *
     * Remaining characters are preserved.
     *
     * @param {*} value
     * @returns {string}
     */
    function upperFirst(value) {
        var text = toStringSafe(value, "");

        if (text.length === 0) {
            return "";
        }

        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    /**
     * Converts the first character of a string to lowercase.
     *
     * Remaining characters are preserved.
     *
     * @param {*} value
     * @returns {string}
     */
    function lowerFirst(value) {
        var text = toStringSafe(value, "");

        if (text.length === 0) {
            return "";
        }

        return text.charAt(0).toLowerCase() + text.slice(1);
    }

    /**
     * Converts a string into an array of normalized words.
     *
     * Handles:
     * - camelCase
     * - PascalCase
     * - snake_case
     * - kebab-case
     * - whitespace-delimited text
     * - acronym boundaries
     *
     * Examples:
     *
     * splitWords("missionObjective") -> ["mission", "Objective"]
     * splitWords("MissionID")         -> ["Mission", "ID"]
     * splitWords("mission_id")        -> ["mission", "id"]
     *
     * @param {*} value
     * @returns {string[]}
     */
    function splitWords(value) {
        var text = normalizeWhitespace(value);

        if (text.length === 0) {
            return [];
        }

        text = text
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
            .replace(/[_\-./\\]+/g, " ")
            .replace(/[^\p{L}\p{N}]+/gu, " ");

        return normalizeWhitespace(text)
            .split(" ")
            .filter(function retainWord(word) {
                return word.length > 0;
            });
    }
/**
 * Capitalizes the first character of a string.
 *
 * Remaining characters are left unchanged.
 *
 * @param {*} value
 * @returns {string}
 */
function capitalize(value) {
    var text = toStringSafe(value);

    if (text.length === 0) {
        return "";
    }

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}
    /**
     * Converts a value to camelCase.
     *
     * @param {*} value
     * @returns {string}
     */
    function camelCase(value) {
        var words = splitWords(value);

        if (words.length === 0) {
            return "";
        }

        return words
            .map(function convertWord(word, index) {
                var normalized = lowerCase(word);

                return index === 0
                    ? normalized
                    : upperFirst(normalized);
            })
            .join("");
    }

    /**
     * Converts a value to PascalCase.
     *
     * @param {*} value
     * @returns {string}
     */
    function pascalCase(value) {
        return splitWords(value)
            .map(function convertWord(word) {
                return upperFirst(lowerCase(word));
            })
            .join("");
    }

    /**
     * Converts a value to snake_case.
     *
     * @param {*} value
     * @returns {string}
     */
    function snakeCase(value) {
        return splitWords(value)
            .map(lowerCase)
            .join("_");
    }

    /**
     * Converts a value to kebab-case.
     *
     * @param {*} value
     * @returns {string}
     */
    function kebabCase(value) {
        return splitWords(value)
            .map(lowerCase)
            .join("-");
    }

    /**
     * Converts a value to CONSTANT_CASE.
     *
     * @param {*} value
     * @returns {string}
     */
    function constantCase(value) {
        return splitWords(value)
            .map(upperCase)
            .join("_");
    }

    /**
     * Converts a value to dot.case.
     *
     * @param {*} value
     * @returns {string}
     */
    function dotCase(value) {
        return splitWords(value)
            .map(lowerCase)
            .join(".");
    }

    /**
     * Converts a value to path/case.
     *
     * @param {*} value
     * @returns {string}
     */
    function pathCase(value) {
        return splitWords(value)
            .map(lowerCase)
            .join("/");
    }

    /**
     * Converts a value to a human-readable title.
     *
     * Minor words remain lowercase unless they are the first or last word.
     *
     * @param {*} value
     * @returns {string}
     */
    function titleCase(value) {
        var minorWords = new Set([
            "a",
            "an",
            "and",
            "as",
            "at",
            "but",
            "by",
            "for",
            "from",
            "in",
            "nor",
            "of",
            "on",
            "or",
            "per",
            "the",
            "to",
            "via",
            "with"
        ]);

        var words = splitWords(value);

        return words
            .map(function convertTitleWord(word, index) {
                var normalized = lowerCase(word);
                var isBoundary =
                    index === 0 ||
                    index === words.length - 1;

                if (
                    !isBoundary &&
                    minorWords.has(normalized)
                ) {
                    return normalized;
                }

                return upperFirst(normalized);
            })
            .join(" ");
    }

    /**
     * Converts a value to sentence case.
     *
     * @param {*} value
     * @returns {string}
     */
    function sentenceCase(value) {
        var words = splitWords(value);

        if (words.length === 0) {
            return "";
        }

        return upperFirst(
            words
                .map(lowerCase)
                .join(" ")
        );
    }

    /**
     * Returns whether a string starts with a search value.
     *
     * @param {*} value
     * @param {*} search
     * @param {number} [position=0]
     * @returns {boolean}
     */
    function startsWith(value, search, position) {
        var text = toStringSafe(value, "");
        var query = toStringSafe(search, "");
        var startPosition = Math.max(
            0,
            toInteger(position, 0)
        );

        return text.slice(
            startPosition,
            startPosition + query.length
        ) === query;
    }

    /**
     * Returns whether a string ends with a search value.
     *
     * @param {*} value
     * @param {*} search
     * @param {number} [length]
     * @returns {boolean}
     */
    function endsWith(value, search, length) {
        var text = toStringSafe(value, "");
        var query = toStringSafe(search, "");
        var endPosition = isDefined(length)
            ? Math.min(
                Math.max(0, toInteger(length, text.length)),
                text.length
            )
            : text.length;

        return text.slice(
            Math.max(0, endPosition - query.length),
            endPosition
        ) === query;
    }

    /**
     * Returns whether a string contains another string.
     *
     * @param {*} value
     * @param {*} search
     * @param {number} [position=0]
     * @returns {boolean}
     */
    function contains(value, search, position) {
        return toStringSafe(value, "").indexOf(
            toStringSafe(search, ""),
            Math.max(0, toInteger(position, 0))
        ) >= 0;
    }

    /**
     * Performs a case-insensitive substring check.
     *
     * @param {*} value
     * @param {*} search
     * @returns {boolean}
     */
    function containsIgnoreCase(value, search) {
        return lowerCase(value).indexOf(
            lowerCase(search)
        ) >= 0;
    }

    /**
     * Returns whether two values are equal after string normalization.
     *
     * Comparison is case-sensitive.
     *
     * @param {*} left
     * @param {*} right
     * @returns {boolean}
     */
    function equalsNormalized(left, right) {
        return normalizeWhitespace(left) ===
            normalizeWhitespace(right);
    }

    /**
     * Returns whether two values are equal after whitespace and case
     * normalization.
     *
     * @param {*} left
     * @param {*} right
     * @returns {boolean}
     */
    function equalsIgnoreCase(left, right) {
        return lowerCase(
            normalizeWhitespace(left)
        ) === lowerCase(
            normalizeWhitespace(right)
        );
    }

    /**
     * Repeats a string a specified number of times.
     *
     * @param {*} value
     * @param {number} countValue
     * @returns {string}
     */
    function repeat(value, countValue) {
        var text = toStringSafe(value, "");
        var amount = Math.max(
            0,
            toInteger(countValue, 0)
        );
        var result = "";

        while (amount > 0) {
            if (amount % 2 === 1) {
                result += text;
            }

            amount = Math.floor(amount / 2);

            if (amount > 0) {
                text += text;
            }
        }

        return result;
    }

    /**
     * Pads the beginning of a string until it reaches the specified length.
     *
     * @param {*} value
     * @param {number} targetLength
     * @param {*} [fillValue=" "]
     * @returns {string}
     */
    function padStart(value, targetLength, fillValue) {
        var text = toStringSafe(value, "");
        var desiredLength = Math.max(
            0,
            toInteger(targetLength, 0)
        );
        var fill = isDefined(fillValue)
            ? toStringSafe(fillValue, "")
            : " ";
        var required;
        var padding;

        if (
            text.length >= desiredLength ||
            fill.length === 0
        ) {
            return text;
        }

        required = desiredLength - text.length;
        padding = repeat(
            fill,
            Math.ceil(required / fill.length)
        ).slice(0, required);

        return padding + text;
    }

    /**
     * Pads the end of a string until it reaches the specified length.
     *
     * @param {*} value
     * @param {number} targetLength
     * @param {*} [fillValue=" "]
     * @returns {string}
     */
    function padEnd(value, targetLength, fillValue) {
        var text = toStringSafe(value, "");
        var desiredLength = Math.max(
            0,
            toInteger(targetLength, 0)
        );
        var fill = isDefined(fillValue)
            ? toStringSafe(fillValue, "")
            : " ";
        var required;
        var padding;

        if (
            text.length >= desiredLength ||
            fill.length === 0
        ) {
            return text;
        }

        required = desiredLength - text.length;
        padding = repeat(
            fill,
            Math.ceil(required / fill.length)
        ).slice(0, required);

        return text + padding;
    }

    /**
     * Pads both sides of a string until it reaches the specified length.
     *
     * Additional padding is placed on the right when the required amount is
     * odd.
     *
     * @param {*} value
     * @param {number} targetLength
     * @param {*} [fillValue=" "]
     * @returns {string}
     */
    function pad(value, targetLength, fillValue) {
        var text = toStringSafe(value, "");
        var desiredLength = Math.max(
            0,
            toInteger(targetLength, 0)
        );
        var totalPadding;
        var leftLength;
        var rightLength;

        if (text.length >= desiredLength) {
            return text;
        }

        totalPadding = desiredLength - text.length;
        leftLength = Math.floor(totalPadding / 2);
        rightLength = totalPadding - leftLength;

        return padStart(
            padEnd(
                text,
                text.length + rightLength,
                fillValue
            ),
            desiredLength,
            fillValue
        );
    }

    /**
     * Truncates a string to a maximum length.
     *
     * The omission marker is included within the maximum length.
     *
     * @param {*} value
     * @param {number} maximumLength
     * @param {*} [omission="..."]
     * @returns {string}
     */
    function truncate(value, maximumLength, omission) {
        var text = toStringSafe(value, "");
        var limit = Math.max(
            0,
            toInteger(maximumLength, 0)
        );
        var marker = isDefined(omission)
            ? toStringSafe(omission, "")
            : "...";

        if (text.length <= limit) {
            return text;
        }

        if (limit === 0) {
            return "";
        }

        if (marker.length >= limit) {
            return marker.slice(0, limit);
        }

        return text.slice(
            0,
            limit - marker.length
        ) + marker;
    }

    /**
     * Truncates a string without splitting the final word when practical.
     *
     * @param {*} value
     * @param {number} maximumLength
     * @param {*} [omission="..."]
     * @returns {string}
     */
    function truncateWords(value, maximumLength, omission) {
        var text = normalizeWhitespace(value);
        var limit = Math.max(
            0,
            toInteger(maximumLength, 0)
        );
        var marker = isDefined(omission)
            ? toStringSafe(omission, "")
            : "...";
        var availableLength;
        var candidate;
        var finalSpace;

        if (text.length <= limit) {
            return text;
        }

        if (limit === 0) {
            return "";
        }

        if (marker.length >= limit) {
            return marker.slice(0, limit);
        }

        availableLength = limit - marker.length;
        candidate = text.slice(0, availableLength);
        finalSpace = candidate.lastIndexOf(" ");

        if (finalSpace > 0) {
            candidate = candidate.slice(0, finalSpace);
        }

        return trimEnd(candidate) + marker;
    }

    /**
     * Escapes characters with special meaning in regular expressions.
     *
     * @param {*} value
     * @returns {string}
     */
    function escapeRegExp(value) {
        return toStringSafe(value, "")
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    /**
     * Escapes text for safe insertion into HTML content.
     *
     * This function does not create trusted HTML. It only converts the most
     * common HTML-sensitive characters to entities.
     *
     * @param {*} value
     * @returns {string}
     */
    function escapeHtml(value) {
        var text = toStringSafe(value, "");

        return text.replace(
            /[&<>"']/g,
            function replaceHtmlCharacter(character) {
                switch (character) {
                    case "&":
                        return "&amp;";

                    case "<":
                        return "&lt;";

                    case ">":
                        return "&gt;";

                    case "\"":
                        return "&quot;";

                    case "'":
                        return "&#39;";

                    default:
                        return character;
                }
            }
        );
    }

    /**
     * Converts supported HTML entities back to their literal characters.
     *
     * This intentionally decodes only entities produced by escapeHtml().
     *
     * @param {*} value
     * @returns {string}
     */
    function unescapeHtml(value) {
        return toStringSafe(value, "")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, "\"")
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, "&");
    }

    /**
     * Removes basic HTML tags from a string.
     *
     * This is a formatting helper, not a security sanitizer.
     *
     * @param {*} value
     * @returns {string}
     */
    function stripHtml(value) {
        return normalizeWhitespace(
            toStringSafe(value, "")
                .replace(/<[^>]*>/g, " ")
        );
    }

    /**
     * Removes accents and diacritical marks where supported.
     *
     * @param {*} value
     * @returns {string}
     */
    function deburr(value) {
        var text = toStringSafe(value, "");

        if (!isFunction(text.normalize)) {
            return text;
        }

        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    /**
     * Produces a URL-safe lowercase slug.
     *
     * @param {*} value
     * @param {Object} [options]
     * @param {string} [options.separator="-"]
     * @param {boolean} [options.preserveUnicode=false]
     * @param {number} [options.maximumLength=0]
     * @returns {string}
     */
    function slugify(value, options) {
        var settings = assign(
            {
                separator: "-",
                preserveUnicode: false,
                maximumLength: 0
            },
            isPlainObject(options)
                ? options
                : {}
        );

        var separator = toStringSafe(
            settings.separator,
            "-"
        ) || "-";

        var text = lowerCase(
            settings.preserveUnicode
                ? value
                : deburr(value)
        );

        var separatorPattern = new RegExp(
            escapeRegExp(separator) + "+",
            "g"
        );

        if (settings.preserveUnicode) {
            text = text
                .replace(/[^\p{L}\p{N}]+/gu, separator);
        } else {
            text = text
                .replace(/[^a-z0-9]+/g, separator);
        }

        text = text
            .replace(separatorPattern, separator)
            .replace(
                new RegExp(
                    "^" + escapeRegExp(separator) + "+"
                ),
                ""
            )
            .replace(
                new RegExp(
                    escapeRegExp(separator) + "+$"
                ),
                ""
            );

        if (
            toInteger(settings.maximumLength, 0) > 0 &&
            text.length > settings.maximumLength
        ) {
            text = text.slice(
                0,
                settings.maximumLength
            );

            text = text.replace(
                new RegExp(
                    escapeRegExp(separator) + "+$"
                ),
                ""
            );
        }

        return text;
    }

    /**
     * Produces a safe JavaScript-style identifier.
     *
     * The result:
     * - contains letters, numbers, underscores, and dollar signs
     * - does not begin with a number
     * - falls back when no valid characters remain
     *
     * @param {*} value
     * @param {*} [fallback="value"]
     * @returns {string}
     */
    function toIdentifier(value, fallback) {
        var safeFallback = camelCase(
            defaultTo(fallback, "value")
        ) || "value";

        var identifier = camelCase(
            deburr(value)
                .replace(/[$]+/g, " Dollar ")
        );

        identifier = identifier.replace(
            /[^A-Za-z0-9_$]/g,
            ""
        );

        if (identifier.length === 0) {
            identifier = safeFallback;
        }

        if (/^[0-9]/.test(identifier)) {
            identifier = "_" + identifier;
        }

        return identifier;
    }

    /**
     * Returns whether a value is a syntactically valid JavaScript-style
     * identifier.
     *
     * This does not reject reserved language keywords.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isIdentifier(value) {
        return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(
            toStringSafe(value, "")
        );
    }

    /**
     * Removes characters that are commonly invalid in filenames.
     *
     * Reserved Windows device names are prefixed with an underscore.
     *
     * @param {*} value
     * @param {Object} [options]
     * @param {string} [options.replacement="_"]
     * @param {number} [options.maximumLength=255]
     * @param {string} [options.fallback="file"]
     * @returns {string}
     */
    function sanitizeFilename(value, options) {
        var settings = assign(
            {
                replacement: "_",
                maximumLength: 255,
                fallback: "file"
            },
            isPlainObject(options)
                ? options
                : {}
        );

        var replacement = toStringSafe(
            settings.replacement,
            "_"
        );

        var filename = normalizeWhitespace(value)
            .replace(/[<>:"/\\|?*\u0000-\u001F]/g, replacement)
            .replace(/\.+$/g, "")
            .replace(/\s+$/g, "");

        if (replacement.length > 0) {
            filename = filename.replace(
                new RegExp(
                    escapeRegExp(replacement) + "+",
                    "g"
                ),
                replacement
            );
        }

        if (filename.length === 0) {
            filename = toStringSafe(
                settings.fallback,
                "file"
            ) || "file";
        }

        if (
            /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i.test(
                filename
            )
        ) {
            filename = "_" + filename;
        }

        filename = filename.slice(
            0,
            Math.max(
                1,
                toInteger(
                    settings.maximumLength,
                    255
                )
            )
        );

        return filename;
    }

    /**
     * Performs basic interpolation using named placeholders.
     *
     * Example:
     *
     * interpolate(
     *     "Mission {missionId} contains {count} objectives.",
     *     {
     *         missionId: "mission-1",
     *         count: 4
     *     }
     * );
     *
     * Missing values leave the original placeholder unchanged by default.
     *
     * @param {*} template
     * @param {Object} valuesObject
     * @param {Object} [options]
     * @param {boolean} [options.removeMissing=false]
     * @returns {string}
     */
    function interpolate(template, valuesObject, options) {
        var text = toStringSafe(template, "");
        var valuesMap = isObject(valuesObject)
            ? valuesObject
            : {};

        var settings = assign(
            {
                removeMissing: false
            },
            isPlainObject(options)
                ? options
                : {}
        );

        return text.replace(
            /\{([^{}]+)\}/g,
            function replacePlaceholder(
                placeholder,
                path
            ) {
                var value = getPath(
                    valuesMap,
                    trim(path)
                );

                if (!isDefined(value)) {
                    return settings.removeMissing
                        ? ""
                        : placeholder;
                }

                return toStringSafe(value, "");
            }
        );
    }

    /**
     * Returns a pluralized form based on a numeric count.
     *
     * This helper intentionally supports explicit singular and plural forms
     * rather than attempting full language-aware inflection.
     *
     * @param {number} countValue
     * @param {*} singular
     * @param {*} [plural]
     * @returns {string}
     */
    function pluralize(countValue, singular, plural) {
        var countNumber = toNumber(
            countValue,
            0
        );

        if (Math.abs(countNumber) === 1) {
            return toStringSafe(
                singular,
                ""
            );
        }

        if (isDefined(plural)) {
            return toStringSafe(
                plural,
                ""
            );
        }

        return toStringSafe(
            singular,
            ""
        ) + "s";
    }

    /**
     * Returns a count followed by the correct singular or plural label.
     *
     * @param {number} countValue
     * @param {*} singular
     * @param {*} [plural]
     * @returns {string}
     */
    function formatCount(countValue, singular, plural) {
        var countNumber = toNumber(
            countValue,
            0
        );

        return String(countNumber) +
            " " +
            pluralize(
                countNumber,
                singular,
                plural
            );
    }

    /**
     * Returns a string with the first matching occurrence replaced.
     *
     * Unlike String.prototype.replace, a string search value is treated as a
     * literal string.
     *
     * @param {*} value
     * @param {*} search
     * @param {*} replacement
     * @returns {string}
     */
    function replaceFirst(value, search, replacement) {
        var text = toStringSafe(value, "");

        if (isRegExp(search)) {
            return text.replace(
                search,
                toStringSafe(replacement, "")
            );
        }

        var query = toStringSafe(search, "");

        if (query.length === 0) {
            return text;
        }

        var index = text.indexOf(query);

        if (index < 0) {
            return text;
        }

        return text.slice(0, index) +
            toStringSafe(replacement, "") +
            text.slice(index + query.length);
    }

    /**
     * Returns a string with every literal occurrence replaced.
     *
     * Regular expression search values are delegated to String.replace().
     *
     * @param {*} value
     * @param {*} search
     * @param {*} replacement
     * @returns {string}
     */
    function replaceAll(value, search, replacement) {
        var text = toStringSafe(value, "");
        var replacementText = toStringSafe(
            replacement,
            ""
        );

        if (isRegExp(search)) {
            return text.replace(
                search,
                replacementText
            );
        }

        var query = toStringSafe(search, "");

        if (query.length === 0) {
            return text;
        }

        return text.split(query).join(
            replacementText
        );
    }

    /**
     * Wraps a string at a specified line length.
     *
     * Existing line breaks are preserved.
     *
     * @param {*} value
     * @param {number} [maximumLineLength=80]
     * @returns {string}
     */
    function wrapText(value, maximumLineLength) {
        var text = toStringSafe(value, "");
        var limit = Math.max(
            1,
            toInteger(maximumLineLength, 80)
        );

        return text
            .split(/\r?\n/)
            .map(function wrapLine(line) {
                var words = normalizeWhitespace(line)
                    .split(" ")
                    .filter(Boolean);

                var lines = [];
                var currentLine = "";

                words.forEach(function appendWord(word) {
                    var candidate = currentLine.length === 0
                        ? word
                        : currentLine + " " + word;

                    if (
                        candidate.length <= limit ||
                        currentLine.length === 0
                    ) {
                        currentLine = candidate;
                    } else {
                        lines.push(currentLine);
                        currentLine = word;
                    }
                });

                if (currentLine.length > 0) {
                    lines.push(currentLine);
                }

                return lines.join("\n");
            })
            .join("\n");
    }
/**
 * Escapes HTML special characters.
 *
 * @param {*} value
 * @returns {string}
 */
    /**
     * Assign Section 3 utilities to the public namespace.
     */
    assign(Utilities, {
        trim: trim,
        trimStart: trimStart,
        trimEnd: trimEnd,
        
        lowerCase: lowerCase,
        upperCase: upperCase,
        upperFirst: upperFirst,
        lowerFirst: lowerFirst,

        splitWords: splitWords,
        camelCase: camelCase,
        capitalize: capitalize,
        pascalCase: pascalCase,
        snakeCase: snakeCase,
        kebabCase: kebabCase,
        constantCase: constantCase,
        dotCase: dotCase,
        pathCase: pathCase,
        titleCase: titleCase,
        sentenceCase: sentenceCase,

        startsWith: startsWith,
        endsWith: endsWith,
        contains: contains,
        containsIgnoreCase: containsIgnoreCase,
        equalsNormalized: equalsNormalized,
        equalsIgnoreCase: equalsIgnoreCase,

        repeat: repeat,
        padStart: padStart,
        padEnd: padEnd,
        pad: pad,

        truncate: truncate,
        truncateWords: truncateWords,

        escapeRegExp: escapeRegExp,
        escapeHtml: escapeHtml,
        unescapeHtml: unescapeHtml,
        stripHtml: stripHtml,
        deburr: deburr,

        slugify: slugify,
        toIdentifier: toIdentifier,
        isIdentifier: isIdentifier,
        sanitizeFilename: sanitizeFilename,

        interpolate: interpolate,
        pluralize: pluralize,
        formatCount: formatCount,

        replaceFirst: replaceFirst,
        replaceAll: replaceAll,
        wrapText: wrapText
    });

    /*
     * Continue directly below this line with Section 4.
     * Do not close the IIFE yet.
     */    /**************************************************************************
     * Section 4
     * Numeric Utilities
     **************************************************************************/

    /**
     * Constrains a finite number to an inclusive range.
     *
     * When minimum is greater than maximum, the boundaries are normalized
     * automatically.
     *
     * @param {*} value
     * @param {*} minimum
     * @param {*} maximum
     * @returns {number}
     */
    function clamp(value, minimum, maximum) {
        var numericValue = toNumber(value, 0);
        var lower = toNumber(minimum, 0);
        var upper = toNumber(maximum, 0);
        var temporary;

        if (lower > upper) {
            temporary = lower;
            lower = upper;
            upper = temporary;
        }

        return Math.min(
            upper,
            Math.max(lower, numericValue)
        );
    }
    /**
     * Clamps a value to the inclusive range [0, 1].
     *
     * @param {*} value
     * @returns {number}
     */
    function clamp01(value) {
        return clamp(value, 0, 1);
    }
    /**
     * Maps a value from one range into another.
    * Returns the destination minimum when the source
     * range has zero length.
     *
     * @param {*} value
     * @param {*} sourceMinimum
     * @param {*} sourceMaximum
     * @param {*} destinationMinimum
     * @param {*} destinationMaximum
     * @returns {number}
     */
    function mapRange(
        value,
        sourceMinimum,
        sourceMaximum,
        destinationMinimum,
        destinationMaximum
    ) {
        var factor = inverseLerp(
            sourceMinimum,
            sourceMaximum,
            value
        );

        return lerp(
            destinationMinimum,
            destinationMaximum,
            factor
        );
    }
    /**
     * Returns whether a numeric value falls within an inclusive range.
     *
     * When minimum is greater than maximum, the boundaries are normalized
     * automatically.
     *
     * @param {*} value
     * @param {*} minimum
     * @param {*} maximum
     * @returns {boolean}
     */
    function isBetween(value, minimum, maximum) {
        var numericValue = toNumber(value, NaN);
        var lower = toNumber(minimum, NaN);
        var upper = toNumber(maximum, NaN);
        var temporary;

        if (
            !isFiniteNumber(numericValue) ||
            !isFiniteNumber(lower) ||
            !isFiniteNumber(upper)
        ) {
            return false;
        }

        if (lower > upper) {
            temporary = lower;
            lower = upper;
            upper = temporary;
        }

        return numericValue >= lower &&
            numericValue <= upper;
    }

    /**
     * Returns whether a numeric value falls within an exclusive range.
     *
     * @param {*} value
     * @param {*} minimum
     * @param {*} maximum
     * @returns {boolean}
     */
    function isBetweenExclusive(value, minimum, maximum) {
        var numericValue = toNumber(value, NaN);
        var lower = toNumber(minimum, NaN);
        var upper = toNumber(maximum, NaN);
        var temporary;

        if (
            !isFiniteNumber(numericValue) ||
            !isFiniteNumber(lower) ||
            !isFiniteNumber(upper)
        ) {
            return false;
        }

        if (lower > upper) {
            temporary = lower;
            lower = upper;
            upper = temporary;
        }

        return numericValue > lower &&
            numericValue < upper;
    }

    /**
     * Returns the mathematical sign of a finite number.
     *
     * @param {*} value
     * @returns {-1|0|1}
     */
    function sign(value) {
        var numericValue = toNumber(value, 0);

        if (numericValue > 0) {
            return 1;
        }

        if (numericValue < 0) {
            return -1;
        }

        return 0;
    }

    /**
     * Returns the absolute numeric value.
     *
     * @param {*} value
     * @returns {number}
     */
    function absolute(value) {
        return Math.abs(
            toNumber(value, 0)
        );
    }

    /**
     * Safely divides one number by another.
     *
     * The fallback is returned when the denominator is zero or either value
     * cannot be converted to a finite number.
     *
     * @param {*} numerator
     * @param {*} denominator
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function safeDivide(numerator, denominator, fallback) {
        var left = toNumber(numerator, NaN);
        var right = toNumber(denominator, NaN);
        var fallbackValue = toNumber(fallback, 0);

        if (
            !isFiniteNumber(left) ||
            !isFiniteNumber(right) ||
            right === 0
        ) {
            return fallbackValue;
        }

        return left / right;
    }

    /**
     * Returns the remainder after numeric division.
     *
     * The fallback is returned when the divisor is zero or either operand is
     * invalid.
     *
     * @param {*} dividend
     * @param {*} divisor
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function safeModulo(dividend, divisor, fallback) {
        var left = toNumber(dividend, NaN);
        var right = toNumber(divisor, NaN);
        var fallbackValue = toNumber(fallback, 0);

        if (
            !isFiniteNumber(left) ||
            !isFiniteNumber(right) ||
            right === 0
        ) {
            return fallbackValue;
        }

        return left % right;
    }

    /**
     * Rounds a number to a specified number of decimal places.
     *
     * @param {*} value
     * @param {number} [decimalPlaces=0]
     * @returns {number}
     */
    function roundTo(value, decimalPlaces) {
        var numericValue = toNumber(value, 0);
        var places = clamp(
            toInteger(decimalPlaces, 0),
            0,
            15
        );
        var factor = Math.pow(10, places);

        return Math.round(
            (numericValue + Number.EPSILON) * factor
        ) / factor;
    }

    /**
     * Floors a number to a specified number of decimal places.
     *
     * @param {*} value
     * @param {number} [decimalPlaces=0]
     * @returns {number}
     */
    function floorTo(value, decimalPlaces) {
        var numericValue = toNumber(value, 0);
        var places = clamp(
            toInteger(decimalPlaces, 0),
            0,
            15
        );
        var factor = Math.pow(10, places);

        return Math.floor(
            numericValue * factor
        ) / factor;
    }

    /**
     * Ceils a number to a specified number of decimal places.
     *
     * @param {*} value
     * @param {number} [decimalPlaces=0]
     * @returns {number}
     */
    function ceilTo(value, decimalPlaces) {
        var numericValue = toNumber(value, 0);
        var places = clamp(
            toInteger(decimalPlaces, 0),
            0,
            15
        );
        var factor = Math.pow(10, places);

        return Math.ceil(
            numericValue * factor
        ) / factor;
    }

    /**
     * Truncates a number to a specified number of decimal places.
     *
     * @param {*} value
     * @param {number} [decimalPlaces=0]
     * @returns {number}
     */
    function truncateTo(value, decimalPlaces) {
        var numericValue = toNumber(value, 0);
        var places = clamp(
            toInteger(decimalPlaces, 0),
            0,
            15
        );
        var factor = Math.pow(10, places);

        return Math.trunc(
            numericValue * factor
        ) / factor;
    }

    /**
     * Rounds a value to the nearest multiple of an increment.
     *
     * Example:
     *
     * roundToIncrement(47, 5) -> 45
     * roundToIncrement(48, 5) -> 50
     *
     * @param {*} value
     * @param {*} increment
     * @returns {number}
     */
    function roundToIncrement(value, increment) {
        var numericValue = toNumber(value, 0);
        var step = absolute(increment);

        if (step === 0) {
            return numericValue;
        }

        return Math.round(
            numericValue / step
        ) * step;
    }

    /**
     * Floors a value to the nearest lower multiple of an increment.
     *
     * @param {*} value
     * @param {*} increment
     * @returns {number}
     */
    function floorToIncrement(value, increment) {
        var numericValue = toNumber(value, 0);
        var step = absolute(increment);

        if (step === 0) {
            return numericValue;
        }

        return Math.floor(
            numericValue / step
        ) * step;
    }

    /**
     * Rounds a value upward to the nearest increment.
     *
     * @param {*} value
     * @param {*} increment
     * @returns {number}
     */
    function ceilToIncrement(value, increment) {
        var numericValue = toNumber(value, 0);
        var step = absolute(increment);

        if (step === 0) {
            return numericValue;
        }

        return Math.ceil(
            numericValue / step
        ) * step;
    }

    /**
     * Snaps a value to the nearest increment.
     *
     * Alias for roundToIncrement().
     *
     * @param {*} value
     * @param {*} increment
     * @returns {number}
     */
    function snap(value, increment) {
        return roundToIncrement(value, increment);
    }
     
    /**
     * Returns a random integer within an inclusive range.
     *
     * Examples:
     * randomInt(1, 6)
     * randomInt(10)
     *
     * @param {*} minimum
     * @param {*} [maximum]
     * @returns {number}
     */
    function randomInt(minimum, maximum) {
        var min;
        var max;

        if (!isDefined(maximum)) {
            min = 0;
            max = toInteger(minimum, 0);
        } else {
            min = toInteger(minimum, 0);
            max = toInteger(maximum, 0);
        }

        if (min > max) {
            return randomInt(max, min);
        }

        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;
    }

    /**
     * Returns a random floating-point number.
     *
     * Examples:
     * randomFloat()
     * randomFloat(5)
     * randomFloat(10, 20)
     *
     * @param {*} minimum
     * @param {*} [maximum]
     * @returns {number}
     */
    function randomFloat(minimum, maximum) {
        var min;
        var max;

        if (!isDefined(minimum)) {
            min = 0;
            max = 1;
        } else if (!isDefined(maximum)) {
            min = 0;
            max = toNumber(minimum, 1);
        } else {
            min = toNumber(minimum, 0);
            max = toNumber(maximum, 0);
        }

        if (min > max) {
            return randomFloat(max, min);
        }

        return (Math.random() * (max - min)) + min;
    }

    /**
     * Returns a random value from a collection.
     *
     * Undefined is returned for empty collections.
     *
     * @param {*} collection
     * @returns {*}
     */
    function randomChoice(collection) {
        var array = toArray(collection);

        if (array.length === 0) {
            return undefined;
        }

        return array[randomInt(0, array.length - 1)];
    }

    /**
     * Returns a random boolean value.
     *
     * @returns {boolean}
     */
    function randomBoolean() {
        return Math.random() >= 0.5;
    }
    /**
     * Returns a ratio as a decimal value.
     *
     * Example:
     *
     * ratio(25, 100) -> 0.25
     *
     * @param {*} part
     * @param {*} total
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function ratio(part, total, fallback) {
        return safeDivide(
            part,
            total,
            fallback
        );
    }

    /**
     * Returns a ratio expressed as a percentage.
     *
     * Example:
     *
     * percentage(25, 100) -> 25
     *
     * @param {*} part
     * @param {*} total
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function percentage(part, total, fallback) {
        return safeDivide(
            part,
            total,
            safeDivide(fallback, 100, 0)
        ) * 100;
    }

    /**
     * Applies a percentage increase to a value.
     *
     * Example:
     *
     * increaseByPercent(100, 10) -> 110
     *
     * @param {*} value
     * @param {*} percentValue
     * @returns {number}
     */
    function increaseByPercent(value, percentValue) {
        var numericValue = toNumber(value, 0);
        var percent = toNumber(percentValue, 0);

        return numericValue *
            (1 + percent / 100);
    }

    /**
     * Applies a percentage decrease to a value.
     *
     * Example:
     *
     * decreaseByPercent(100, 10) -> 90
     *
     * @param {*} value
     * @param {*} percentValue
     * @returns {number}
     */
    function decreaseByPercent(value, percentValue) {
        var numericValue = toNumber(value, 0);
        var percent = toNumber(percentValue, 0);

        return numericValue *
            (1 - percent / 100);
    }

    /**
     * Calculates the percentage change between two values.
     *
     * The fallback is returned when the original value is zero.
     *
     * Example:
     *
     * percentageChange(100, 125) -> 25
     *
     * @param {*} originalValue
     * @param {*} newValue
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function percentageChange(
        originalValue,
        newValue,
        fallback
    ) {
        var original = toNumber(
            originalValue,
            NaN
        );
        var current = toNumber(
            newValue,
            NaN
        );

        if (
            !isFiniteNumber(original) ||
            !isFiniteNumber(current) ||
            original === 0
        ) {
            return toNumber(fallback, 0);
        }

        return (
            (current - original) /
            absolute(original)
        ) * 100;
    }

    /**
     * Normalizes a value from an input range to a zero-to-one scale.
     *
     * By default, the result is clamped to the inclusive range [0, 1].
     *
     * @param {*} value
     * @param {*} minimum
     * @param {*} maximum
     * @param {boolean} [shouldClamp=true]
     * @returns {number}
     */
    function normalizeRange(
        value,
        minimum,
        maximum,
        shouldClamp
    ) {
        var numericValue = toNumber(value, 0);
        var lower = toNumber(minimum, 0);
        var upper = toNumber(maximum, 0);
        var normalized;

        if (lower === upper) {
            return 0;
        }

        normalized = (
            numericValue - lower
        ) / (
            upper - lower
        );

        return shouldClamp === false
            ? normalized
            : clamp(normalized, 0, 1);
    }

    /**
     * Performs linear interpolation between two values.
     *
     * A factor of zero returns start.
     * A factor of one returns end.
     *
     * @param {*} start
     * @param {*} end
     * @param {*} factor
     * @returns {number}
     */
    function lerp(start, end, factor) {
        var from = toNumber(start, 0);
        var to = toNumber(end, 0);
        var amount = toNumber(factor, 0);

        return from + (
            to - from
        ) * amount;
    }

    /**
     * Calculates the interpolation factor of a value between two boundaries.
     *
     * @param {*} start
     * @param {*} end
     * @param {*} value
     * @param {boolean} [shouldClamp=true]
     * @returns {number}
     */
    function inverseLerp(
        start,
        end,
        value,
        shouldClamp
    ) {
        return normalizeRange(
            value,
            start,
            end,
            shouldClamp
        );
    }

    /**
     * Maps a value from one numeric range into another numeric range.
     *
     * @param {*} value
     * @param {*} inputMinimum
     * @param {*} inputMaximum
     * @param {*} outputMinimum
     * @param {*} outputMaximum
     * @param {boolean} [shouldClamp=true]
     * @returns {number}
     */
    function remap(
        value,
        inputMinimum,
        inputMaximum,
        outputMinimum,
        outputMaximum,
        shouldClamp
    ) {
        var factor = normalizeRange(
            value,
            inputMinimum,
            inputMaximum,
            shouldClamp
        );

        return lerp(
            outputMinimum,
            outputMaximum,
            factor
        );
    }

    /**
     * Returns whether two finite numbers are approximately equal.
     *
     * The comparison uses both absolute and relative tolerance so it remains
     * useful for values of different magnitudes.
     *
     * @param {*} left
     * @param {*} right
     * @param {*} [epsilon=1e-9]
     * @returns {boolean}
     */
    function nearlyEqual(left, right, epsilon) {
        var leftValue = toNumber(left, NaN);
        var rightValue = toNumber(right, NaN);
        var tolerance = absolute(
            defaultTo(epsilon, 1e-9)
        );
        var difference;
        var scale;

        if (
            !isFiniteNumber(leftValue) ||
            !isFiniteNumber(rightValue)
        ) {
            return false;
        }

        if (leftValue === rightValue) {
            return true;
        }

        difference = absolute(
            leftValue - rightValue
        );

        scale = Math.max(
            1,
            absolute(leftValue),
            absolute(rightValue)
        );

        return difference <=
            tolerance * scale;
    }

    /**
     * Compares two numeric values in ascending order.
     *
     * Invalid values are placed after valid finite numbers.
     *
     * @param {*} left
     * @param {*} right
     * @returns {-1|0|1}
     */
    function compareNumbers(left, right) {
        var leftValue = toNumber(left, NaN);
        var rightValue = toNumber(right, NaN);
        var leftValid = isFiniteNumber(leftValue);
        var rightValid = isFiniteNumber(rightValue);

        if (!leftValid && !rightValid) {
            return 0;
        }

        if (!leftValid) {
            return 1;
        }

        if (!rightValid) {
            return -1;
        }

        if (leftValue < rightValue) {
            return -1;
        }

        if (leftValue > rightValue) {
            return 1;
        }

        return 0;
    }

    /**
     * Compares two numeric values in descending order.
     *
     * Invalid values are placed after valid finite numbers.
     *
     * @param {*} left
     * @param {*} right
     * @returns {-1|0|1}
     */
    function compareNumbersDescending(left, right) {
        var result = compareNumbers(
            left,
            right
        );

        if (result === 0) {
            return 0;
        }

        return result * -1;
    }

    /**
     * Returns the arithmetic mean of finite numeric values.
     *
     * Invalid values are excluded.
     * Empty collections return the supplied fallback.
     *
     * Section 2 already exposes average(), which preserves collection length
     * by treating non-numeric values as zero. mean() is stricter and excludes
     * invalid values entirely.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function mean(collection, fallback) {
        var numbers = toArray(collection)
            .map(function convertValue(value) {
                return toNumber(value, NaN);
            })
            .filter(isFiniteNumber);

        if (numbers.length === 0) {
            return toNumber(fallback, 0);
        }

        return sum(numbers) /
            numbers.length;
    }

    /**
     * Returns the median of finite numeric values.
     *
     * Invalid values are excluded.
     * Empty collections return the supplied fallback.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function median(collection, fallback) {
        var numbers = toArray(collection)
            .map(function convertValue(value) {
                return toNumber(value, NaN);
            })
            .filter(isFiniteNumber)
            .sort(compareNumbers);

        var midpoint;

        if (numbers.length === 0) {
            return toNumber(fallback, 0);
        }

        midpoint = Math.floor(
            numbers.length / 2
        );

        if (numbers.length % 2 === 1) {
            return numbers[midpoint];
        }

        return (
            numbers[midpoint - 1] +
            numbers[midpoint]
        ) / 2;
    }
    /**
     * Returns the most frequently occurring finite numeric value.
     *
     * Invalid values are excluded.
     * When multiple values share the highest frequency, the value that
     * appears first in the normalized collection is returned.
     * Empty collections return the supplied fallback.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function mode(collection, fallback) {
        var numbers = toArray(collection)
            .map(function convertValue(value) {
                return toNumber(value, NaN);
            })
            .filter(isFiniteNumber);

        var frequencies = new Map();
        var selectedValue;
        var highestFrequency = 0;

        if (numbers.length === 0) {
            return toNumber(fallback, 0);
        }

        numbers.forEach(function countValue(value) {
            var frequency =
                (frequencies.get(value) || 0) + 1;

            frequencies.set(value, frequency);

            if (frequency > highestFrequency) {
                highestFrequency = frequency;
                selectedValue = value;
            }
        });

        return selectedValue;
    }
    /**
     * Returns the population variance of finite numeric values.
     *
     * Invalid values are excluded.
     * Empty collections return the supplied fallback.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function variance(collection, fallback) {
        var numbers = toArray(collection)
            .map(function convertValue(value) {
                return toNumber(value, NaN);
            })
            .filter(isFiniteNumber);

        var averageValue;

        if (numbers.length === 0) {
            return toNumber(fallback, 0);
        }

        averageValue = mean(numbers);

        return numbers.reduce(
            function accumulateVariance(total, value) {
                var difference =
                    value - averageValue;

                return total +
                    difference * difference;
            },
            0
        ) / numbers.length;
    }

    /**
     * Returns the sample variance of finite numeric values.
     *
     * At least two valid values are required.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function sampleVariance(collection, fallback) {
        var numbers = toArray(collection)
            .map(function convertValue(value) {
                return toNumber(value, NaN);
            })
            .filter(isFiniteNumber);

        var averageValue;

        if (numbers.length < 2) {
            return toNumber(fallback, 0);
        }

        averageValue = mean(numbers);

        return numbers.reduce(
            function accumulateVariance(total, value) {
                var difference =
                    value - averageValue;

                return total +
                    difference * difference;
            },
            0
        ) / (
            numbers.length - 1
        );
    }

    /**
     * Returns the population standard deviation of finite numeric values.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function standardDeviation(collection, fallback) {
        return Math.sqrt(
            variance(
                collection,
                fallback
            )
        );
    }

    /**
     * Returns the sample standard deviation of finite numeric values.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function sampleStandardDeviation(collection, fallback) {
        return Math.sqrt(
            sampleVariance(
                collection,
                fallback
            )
        );
    }

    /**
     * Returns a weighted arithmetic mean.
     *
     * Supported input formats:
     *
     * weightedMean(
     *     [80, 60],
     *     [0.75, 0.25]
     * );
     *
     * weightedMean([
     *     { value: 80, weight: 0.75 },
     *     { value: 60, weight: 0.25 }
     * ]);
     *
     * Values with invalid numbers, invalid weights, or non-positive weights
     * are excluded.
     *
     * @param {*} valuesOrEntries
     * @param {*} [weights]
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function weightedMean(
        valuesOrEntries,
        weights,
        fallback
    ) {
        var values = toArray(valuesOrEntries);
        var weightValues = isDefined(weights)
            ? toArray(weights)
            : null;

        var weightedTotal = 0;
        var totalWeight = 0;

        values.forEach(
            function accumulateWeightedValue(
                entry,
                index
            ) {
                var value;
                var weight;

                if (
                    weightValues === null &&
                    isObject(entry)
                ) {
                    value = toNumber(
                        entry.value,
                        NaN
                    );

                    weight = toNumber(
                        entry.weight,
                        NaN
                    );
                } else {
                    value = toNumber(
                        entry,
                        NaN
                    );

                    weight = toNumber(
                        weightValues &&
                        weightValues[index],
                        NaN
                    );
                }

                if (
                    !isFiniteNumber(value) ||
                    !isFiniteNumber(weight) ||
                    weight <= 0
                ) {
                    return;
                }

                weightedTotal +=
                    value * weight;

                totalWeight += weight;
            }
        );

        if (totalWeight === 0) {
            return toNumber(fallback, 0);
        }

        return weightedTotal /
            totalWeight;
    }

    /**
     * Returns the smallest finite numeric value.
     *
     * Invalid values are excluded.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function minimum(collection, fallback) {
        var numbers = toArray(collection)
            .map(function convertValue(value) {
                return toNumber(value, NaN);
            })
            .filter(isFiniteNumber);

        if (numbers.length === 0) {
            return toNumber(fallback, 0);
        }

        return Math.min.apply(
            Math,
            numbers
        );
    }

    /**
     * Returns the largest finite numeric value.
     *
     * Invalid values are excluded.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function maximum(collection, fallback) {
        var numbers = toArray(collection)
            .map(function convertValue(value) {
                return toNumber(value, NaN);
            })
            .filter(isFiniteNumber);

        if (numbers.length === 0) {
            return toNumber(fallback, 0);
        }

        return Math.max.apply(
            Math,
            numbers
        );
    }

    /**
     * Returns the numeric span between the minimum and maximum values.
     *
     * @param {*} collection
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function numericRange(collection, fallback) {
        var numbers = toArray(collection)
            .map(function convertValue(value) {
                return toNumber(value, NaN);
            })
            .filter(isFiniteNumber);

        if (numbers.length === 0) {
            return toNumber(fallback, 0);
        }

        return maximum(numbers) -
            minimum(numbers);
    }

    /**
     * Returns the percentile value for a sorted numeric distribution.
     *
     * Percentile must be expressed from 0 through 100.
     * Linear interpolation is used between adjacent values.
     *
     * @param {*} collection
     * @param {*} percentileValue
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function percentile(
        collection,
        percentileValue,
        fallback
    ) {
        var numbers = toArray(collection)
            .map(function convertValue(value) {
                return toNumber(value, NaN);
            })
            .filter(isFiniteNumber)
            .sort(compareNumbers);

        var requestedPercentile = clamp(
            percentileValue,
            0,
            100
        );

        var position;
        var lowerIndex;
        var upperIndex;
        var interpolation;

        if (numbers.length === 0) {
            return toNumber(fallback, 0);
        }

        if (numbers.length === 1) {
            return numbers[0];
        }

        position = (
            requestedPercentile / 100
        ) * (
            numbers.length - 1
        );

        lowerIndex = Math.floor(position);
        upperIndex = Math.ceil(position);
        interpolation =
            position - lowerIndex;

        if (lowerIndex === upperIndex) {
            return numbers[lowerIndex];
        }

        return lerp(
            numbers[lowerIndex],
            numbers[upperIndex],
            interpolation
        );
    }

    /**
     * Converts a value into a finite score within a defined score range.
     *
     * This is intended for engine scoring boundaries and ensures that invalid
     * score values cannot propagate through mission generation.
     *
     * @param {*} value
     * @param {*} [minimum=0]
     * @param {*} [maximum=100]
     * @param {*} [fallback=0]
     * @returns {number}
     */
    function normalizeScore(
        value,
        minimum,
        maximum,
        fallback
    ) {
        var lower = toNumber(
            defaultTo(minimum, 0),
            0
        );

        var upper = toNumber(
            defaultTo(maximum, 100),
            100
        );

        var numericValue = toNumber(
            value,
            NaN
        );

        if (!isFiniteNumber(numericValue)) {
            numericValue = toNumber(
                fallback,
                lower
            );
        }

        return clamp(
            numericValue,
            lower,
            upper
        );
    }
    /**
     * Returns whether a value represents a positive finite number.
     *
     * Zero is not considered positive.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isPositive(value) {
        var numericValue = toNumber(value, NaN);

        return (
            isFiniteNumber(numericValue) &&
            numericValue > 0
        );
    }

    /**
     * Returns whether a value represents a negative finite number.
     *
     * Zero is not considered negative.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isNegative(value) {
        var numericValue = toNumber(value, NaN);

        return (
            isFiniteNumber(numericValue) &&
            numericValue < 0
        );
    }

    /**
     * Returns whether a value represents a whole number.
     *
     * Whole numbers are non-negative integers:
     * 0, 1, 2, 3, and so forth.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isWholeNumber(value) {
        var numericValue = toNumber(value, NaN);

        return (
            isFiniteNumber(numericValue) &&
            Number.isInteger(numericValue) &&
            numericValue >= 0
        );
    }

    /**
     * Returns whether a value represents a finite number
     * containing a fractional component.
     *
     * Examples:
     * - 1.5  -> true
     * - -2.7 -> true
     * - 4    -> false
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isDecimal(value) {
        var numericValue = toNumber(value, NaN);

        return (
            isFiniteNumber(numericValue) &&
            !Number.isInteger(numericValue)
        );
    }
    /**
     * Assign Section 4 utilities to the public namespace.
     */
    assign(Utilities, {
      isPositive: isPositive,
        isNegative: isNegative,
        isWholeNumber: isWholeNumber,
        isDecimal: isDecimal,
        
        clamp: clamp,
     clamp01: clamp01,
        lerp: lerp,
        inverseLerp: inverseLerp,
        mapRange: mapRange,
        isBetween: isBetween,
        isBetweenExclusive: isBetweenExclusive,
        sign: sign,
        absolute: absolute,

        safeDivide: safeDivide,
        safeModulo: safeModulo,

        roundTo: roundTo,
        floorTo: floorTo,
        ceilTo: ceilTo,
        truncateTo: truncateTo,

        snap: snap,

        randomInt: randomInt,
        randomFloat: randomFloat,
        randomChoice: randomChoice,
        randomBoolean: randomBoolean,

        roundToIncrement: roundToIncrement,
        floorToIncrement: floorToIncrement,
        ceilToIncrement: ceilToIncrement,

        ratio: ratio,
        percentage: percentage,
        increaseByPercent: increaseByPercent,
        decreaseByPercent: decreaseByPercent,
        percentageChange: percentageChange,

        normalizeRange: normalizeRange,
        remap: remap,

        nearlyEqual: nearlyEqual,
        compareNumbers: compareNumbers,
        compareNumbersDescending:
            compareNumbersDescending,
       
        mean: mean,
        median: median,
        mode: mode,
        variance: variance,
        
        sampleVariance: sampleVariance,
        standardDeviation: standardDeviation,
        sampleStandardDeviation:
            sampleStandardDeviation,
        weightedMean: weightedMean,

        minimum: minimum,
        maximum: maximum,
        numericRange: numericRange,
        percentile: percentile,

        normalizeScore: normalizeScore
    });

    /*
     * Continue directly below this line with Section 5.
     * Do not close the IIFE yet.
     */    /**************************************************************************
     * Section 5A
     * Date & Time Foundation
     **************************************************************************/

    /*
     * Date-handling conventions:
     *
     * 1. Date utilities never mutate caller-owned Date objects.
     * 2. Functions returning dates always return new Date instances.
     * 3. Invalid or unsupported inputs return null unless a valid fallback is
     *    explicitly supplied.
     * 4. Date-only ISO strings are interpreted as local calendar dates.
     * 5. Ambiguous locale-dependent strings are rejected.
     *
     * Examples of accepted strings:
     *
     * "2026-07-18"
     * "2026-07-18T14:30:00"
     * "2026-07-18T14:30:00Z"
     * "2026-07-18T14:30:00-04:00"
     *
     * Examples of intentionally rejected strings:
     *
     * "07/18/2026"
     * "July 18, 2026"
     * "18-07-2026"
     */

    /**
     * Returns whether a value is a Date object.
     *
     * This internal helper is intentionally separate from isValidDate().
     * A Date object can exist while still containing an invalid timestamp.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isDateObject(value) {
        return Object.prototype.toString.call(value) ===
            "[object Date]";
    }

    /**
     * Returns whether a value is a Date object containing a valid timestamp.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isValidDate(value) {
        return isDateObject(value) &&
            Number.isFinite(value.getTime());
    }

    /**
     * Creates a valid local Date from an ISO calendar-date string.
     *
     * Date-only strings require special handling because:
     *
     * new Date("2026-07-18")
     *
     * is interpreted as midnight UTC by JavaScript. That can resolve to the
     * previous local calendar day in negative UTC offsets.
     *
     * This helper constructs the date using local calendar components instead.
     *
     * @param {string} value
     * @returns {Date|null}
     */
    function parseLocalIsoDate(value) {
        var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        var year;
        var monthIndex;
        var day;
        var result;

        if (!match) {
            return null;
        }

        year = Number(match[1]);
        monthIndex = Number(match[2]) - 1;
        day = Number(match[3]);

        /*
         * Years from 0 through 99 receive special treatment from the Date
         * constructor, so the full year is assigned after construction.
         */
        result = new Date(0);

        result.setHours(0, 0, 0, 0);
        result.setFullYear(
            year,
            monthIndex,
            day
        );

        /*
         * Date automatically rolls invalid dates forward. For example,
         * February 30 becomes a date in March. Verify the resulting calendar
         * components to reject that normalization.
         */
        if (
            result.getFullYear() !== year ||
            result.getMonth() !== monthIndex ||
            result.getDate() !== day
        ) {
            return null;
        }

        return result;
    }

    /**
     * Returns whether a string follows a supported ISO-8601 date-time shape.
     *
     * This intentionally rejects locale-dependent date formats.
     *
     * Supported examples:
     *
     * 2026-07-18T14:30
     * 2026-07-18T14:30:45
     * 2026-07-18T14:30:45.250
     * 2026-07-18T14:30:45Z
     * 2026-07-18T14:30:45-04:00
     *
     * @param {string} value
     * @returns {boolean}
     */
    function isSupportedIsoDateTime(value) {
        return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(
            value
        );
    }

    /**
     * Converts a supported value to a new valid Date instance.
     *
     * This internal conversion function does not apply a fallback.
     *
     * Supported values:
     *
     * - valid Date objects
     * - finite millisecond timestamps
     * - ISO calendar dates
     * - supported ISO date-time strings
     *
     * @param {*} value
     * @returns {Date|null}
     */
    function convertToDate(value) {
        var text;
        var result;
        var localDate;

        if (isValidDate(value)) {
            return new Date(
                value.getTime()
            );
        }

        if (
            typeof value === "number" &&
            Number.isFinite(value)
        ) {
            result = new Date(value);

            return isValidDate(result)
                ? result
                : null;
        }

        if (typeof value !== "string") {
            return null;
        }

        text = value.trim();

        if (text.length === 0) {
            return null;
        }

        localDate = parseLocalIsoDate(text);

        if (localDate !== null) {
            return localDate;
        }

        if (!isSupportedIsoDateTime(text)) {
            return null;
        }

        result = new Date(text);

        return isValidDate(result)
            ? result
            : null;
    }

    /**
     * Returns a new Date representing the current instant.
     *
     * Calling this function multiple times can produce different timestamps.
     *
     * @returns {Date}
     */
    function now() {
        return new Date();
    }

    /**
     * Returns a cloned Date instance.
     *
     * This function accepts Date objects only. It does not parse strings or
     * timestamps. Invalid Date objects return null.
     *
     * @param {*} value
     * @returns {Date|null}
     */
    function cloneDate(value) {
        if (!isValidDate(value)) {
            return null;
        }

        return new Date(
            value.getTime()
        );
    }

    /**
     * Converts a supported input to a new valid Date instance.
     *
     * A valid fallback is converted and cloned when the primary value cannot
     * be converted. If neither value is valid, null is returned.
     *
     * The function never returns the caller's original Date object.
     *
     * @param {*} value
     * @param {*} [fallback=null]
     * @returns {Date|null}
     */
    function toDate(value, fallback) {
        var result = convertToDate(value);

        if (result !== null) {
            return result;
        }

        if (!isDefined(fallback)) {
            return null;
        }

        return convertToDate(fallback);
    }

    /**
     * Returns a new Date normalized to the beginning of its local calendar
     * day.
     *
     * The original Date is never modified.
     *
     * @param {*} value
     * @returns {Date|null}
     */
    function startOfDay(value) {
        var result = toDate(value);

        if (result === null) {
            return null;
        }

        result.setHours(
            0,
            0,
            0,
            0
        );

        return result;
    }

    /**
     * Returns a new Date representing the beginning of the current local
     * calendar day.
     *
     * An optional reference date can be supplied for deterministic testing.
     *
     * Examples:
     *
     * today();
     *
     * today(
     *     new Date("2026-07-18T16:45:00-04:00")
     * );
     *
     * @param {*} [referenceDate]
     * @returns {Date}
     */
    function today(referenceDate) {
        var source = isDefined(referenceDate)
            ? toDate(referenceDate)
            : now();

        /*
         * An invalid explicit reference does not silently become the current
         * date. This makes invalid test inputs and programming errors visible.
         */
        if (source === null) {
            return null;
        }

        return startOfDay(source);
    }

    /**
     * Returns the timestamp in milliseconds for a valid date input.
     *
     * Invalid values return the supplied fallback.
     *
     * @param {*} value
     * @param {*} [fallback=NaN]
     * @returns {number}
     */
    function dateTimestamp(value, fallback) {
        var result = toDate(value);

        if (result === null) {
            return isDefined(fallback)
                ? toNumber(fallback, NaN)
                : NaN;
        }

        return result.getTime();
    }

    /**
     * Returns a date's local ISO calendar key in YYYY-MM-DD format.
     *
     * This is useful for:
     *
     * - mission-date identifiers
     * - daily tracking records
     * - calendar-day comparisons
     * - streak indexing
     *
     * This is a local calendar representation, not a UTC serialization.
     *
     * @param {*} value
     * @param {*} [fallback=""]
     * @returns {string}
     */
    function dateKey(value, fallback) {
        var result = toDate(value);
        var year;
        var month;
        var day;

        if (result === null) {
            return toStringSafe(
                fallback,
                ""
            );
        }

        year = String(
            result.getFullYear()
        );

        month = padStart(
            result.getMonth() + 1,
            2,
            "0"
        );

        day = padStart(
            result.getDate(),
            2,
            "0"
        );

        return year +
            "-" +
            month +
            "-" +
            day;
    }

    /**
     * Returns a Date created from a local YYYY-MM-DD calendar key.
     *
     * Invalid keys return the supplied fallback when that fallback can be
     * converted to a valid date.
     *
     * @param {*} value
     * @param {*} [fallback=null]
     * @returns {Date|null}
     */
    function dateFromKey(value, fallback) {
        var text = typeof value === "string"
            ? value.trim()
            : "";

        var result = parseLocalIsoDate(text);

        if (result !== null) {
            return result;
        }

        return isDefined(fallback)
            ? toDate(fallback)
            : null;
    }

    /**
     * Returns a new Date with millisecond precision removed.
     *
     * This can be useful when timestamps originate from systems that store
     * second-level precision only.
     *
     * @param {*} value
     * @returns {Date|null}
     */
    function startOfSecond(value) {
        var result = toDate(value);

        if (result === null) {
            return null;
        }

        result.setMilliseconds(0);

        return result;
    }

    /**
     * Returns a new Date normalized to the beginning of its minute.
     *
     * @param {*} value
     * @returns {Date|null}
     */
    function startOfMinute(value) {
        var result = toDate(value);

        if (result === null) {
            return null;
        }

        result.setSeconds(
            0,
            0
        );

        return result;
    }

    /**
     * Returns a new Date normalized to the beginning of its hour.
     *
     * @param {*} value
     * @returns {Date|null}
     */
    function startOfHour(value) {
        var result = toDate(value);

        if (result === null) {
            return null;
        }

        result.setMinutes(
            0,
            0,
            0
        );

        return result;
    }

    /**
     * Assign Section 5A utilities to the public namespace.
     */
    assign(Utilities, {
        isValidDate: isValidDate,

        now: now,
        today: today,

        cloneDate: cloneDate,
        toDate: toDate,

        startOfSecond: startOfSecond,
        startOfMinute: startOfMinute,
        startOfHour: startOfHour,
        startOfDay: startOfDay,

        dateTimestamp: dateTimestamp,
        dateKey: dateKey,
        dateFromKey: dateFromKey
    });

    /*
     * Continue directly below this line with Section 5B.
     * Do not close the IIFE yet.
     */    /**************************************************************************
     * Section 5B
     * Date & Time Comparison
     **************************************************************************/

    /**
     * Returns whether two supported date values represent the same instant.
     *
     * Invalid inputs return false.
     *
     * @param {*} left
     * @param {*} right
     * @returns {boolean}
     */
    function isSameInstant(left, right) {
        var leftDate = toDate(left);
        var rightDate = toDate(right);

        if (
            leftDate === null ||
            rightDate === null
        ) {
            return false;
        }

        return leftDate.getTime() ===
            rightDate.getTime();
    }

    /**
     * Returns whether two supported date values fall on the same local
     * calendar day.
     *
     * Time-of-day values are ignored.
     *
     * Invalid inputs return false.
     *
     * @param {*} left
     * @param {*} right
     * @returns {boolean}
     */
    function isSameDay(left, right) {
        var leftDate = toDate(left);
        var rightDate = toDate(right);

        if (
            leftDate === null ||
            rightDate === null
        ) {
            return false;
        }

        return leftDate.getFullYear() ===
                rightDate.getFullYear() &&
            leftDate.getMonth() ===
                rightDate.getMonth() &&
            leftDate.getDate() ===
                rightDate.getDate();
    }

    /**
     * Returns whether two supported date values fall in the same local
     * calendar month and year.
     *
     * Invalid inputs return false.
     *
     * @param {*} left
     * @param {*} right
     * @returns {boolean}
     */
    function isSameMonth(left, right) {
        var leftDate = toDate(left);
        var rightDate = toDate(right);

        if (
            leftDate === null ||
            rightDate === null
        ) {
            return false;
        }

        return leftDate.getFullYear() ===
                rightDate.getFullYear() &&
            leftDate.getMonth() ===
                rightDate.getMonth();
    }

    /**
     * Returns whether two supported date values fall in the same local
     * calendar year.
     *
     * Invalid inputs return false.
     *
     * @param {*} left
     * @param {*} right
     * @returns {boolean}
     */
    function isSameYear(left, right) {
        var leftDate = toDate(left);
        var rightDate = toDate(right);

        if (
            leftDate === null ||
            rightDate === null
        ) {
            return false;
        }

        return leftDate.getFullYear() ===
            rightDate.getFullYear();
    }

    /**
     * Returns the normalized start of the week for a date.
     *
     * The first day of the week is configurable:
     *
     * 0 = Sunday
     * 1 = Monday
     * ...
     * 6 = Saturday
     *
     * Invalid inputs return null.
     *
     * This helper remains private to Section 5B. A public startOfWeek()
     * implementation will be added in the boundary subsection.
     *
     * @param {*} value
     * @param {number} [weekStartsOn=0]
     * @returns {Date|null}
     */
    function comparisonWeekStart(value, weekStartsOn) {
        var result = startOfDay(value);
        var firstDay = clamp(
            toInteger(weekStartsOn, 0),
            0,
            6
        );
        var currentDay;
        var difference;

        if (result === null) {
            return null;
        }

        currentDay = result.getDay();

        difference = (
            currentDay - firstDay + 7
        ) % 7;

        result.setDate(
            result.getDate() - difference
        );

        return result;
    }

    /**
     * Returns whether two supported dates fall in the same local calendar
     * week.
     *
     * By default, weeks begin on Sunday.
     *
     * Invalid inputs return false.
     *
     * @param {*} left
     * @param {*} right
     * @param {number} [weekStartsOn=0]
     * @returns {boolean}
     */
    function isSameWeek(left, right, weekStartsOn) {
        var leftStart = comparisonWeekStart(
            left,
            weekStartsOn
        );

        var rightStart = comparisonWeekStart(
            right,
            weekStartsOn
        );

        if (
            leftStart === null ||
            rightStart === null
        ) {
            return false;
        }

        return isSameDay(
            leftStart,
            rightStart
        );
    }

    /**
     * Returns whether a supported date value falls on the current local
     * calendar day.
     *
     * An optional reference date can be supplied for deterministic tests.
     *
     * Invalid primary inputs return false.
     * Invalid reference inputs fall back to the current date through today().
     *
     * @param {*} value
     * @param {*} [referenceDate]
     * @returns {boolean}
     */
    function isToday(value, referenceDate) {
        var candidate = toDate(value);
        var reference = today(referenceDate);

        if (
            candidate === null ||
            reference === null
        ) {
            return false;
        }

        return isSameDay(
            candidate,
            reference
        );
    }

    /**
     * Returns whether a supported date value falls on the local calendar day
     * immediately before the reference date.
     *
     * An optional reference date can be supplied for deterministic tests.
     *
     * @param {*} value
     * @param {*} [referenceDate]
     * @returns {boolean}
     */
    function isYesterday(value, referenceDate) {
        var candidate = toDate(value);
        var reference = today(referenceDate);

        if (
            candidate === null ||
            reference === null
        ) {
            return false;
        }

        reference.setDate(
            reference.getDate() - 1
        );

        return isSameDay(
            candidate,
            reference
        );
    }

    /**
     * Returns whether a supported date value falls on the local calendar day
     * immediately after the reference date.
     *
     * An optional reference date can be supplied for deterministic tests.
     *
     * @param {*} value
     * @param {*} [referenceDate]
     * @returns {boolean}
     */
    function isTomorrow(value, referenceDate) {
        var candidate = toDate(value);
        var reference = today(referenceDate);

        if (
            candidate === null ||
            reference === null
        ) {
            return false;
        }

        reference.setDate(
            reference.getDate() + 1
        );

        return isSameDay(
            candidate,
            reference
        );
    }

    /**
     * Returns whether the left date occurs before the right date.
     *
     * By default, exact timestamps are compared.
     *
     * When compareCalendarDay is true, both values are normalized to the
     * beginning of their local calendar days before comparison.
     *
     * Invalid inputs return false.
     *
     * @param {*} left
     * @param {*} right
     * @param {boolean} [compareCalendarDay=false]
     * @returns {boolean}
     */
    function isBefore(
        left,
        right,
        compareCalendarDay
    ) {
        var leftDate = compareCalendarDay === true
            ? startOfDay(left)
            : toDate(left);

        var rightDate = compareCalendarDay === true
            ? startOfDay(right)
            : toDate(right);

        if (
            leftDate === null ||
            rightDate === null
        ) {
            return false;
        }

        return leftDate.getTime() <
            rightDate.getTime();
    }

    /**
     * Returns whether the left date occurs after the right date.
     *
     * By default, exact timestamps are compared.
     *
     * When compareCalendarDay is true, both values are normalized to the
     * beginning of their local calendar days before comparison.
     *
     * Invalid inputs return false.
     *
     * @param {*} left
     * @param {*} right
     * @param {boolean} [compareCalendarDay=false]
     * @returns {boolean}
     */
    function isAfter(
        left,
        right,
        compareCalendarDay
    ) {
        var leftDate = compareCalendarDay === true
            ? startOfDay(left)
            : toDate(left);

        var rightDate = compareCalendarDay === true
            ? startOfDay(right)
            : toDate(right);

        if (
            leftDate === null ||
            rightDate === null
        ) {
            return false;
        }

        return leftDate.getTime() >
            rightDate.getTime();
    }

    /**
     * Returns whether the left date occurs before or at the same instant as
     * the right date.
     *
     * Invalid inputs return false.
     *
     * @param {*} left
     * @param {*} right
     * @param {boolean} [compareCalendarDay=false]
     * @returns {boolean}
     */
    function isBeforeOrEqual(
        left,
        right,
        compareCalendarDay
    ) {
        var leftDate = compareCalendarDay === true
            ? startOfDay(left)
            : toDate(left);

        var rightDate = compareCalendarDay === true
            ? startOfDay(right)
            : toDate(right);

        if (
            leftDate === null ||
            rightDate === null
        ) {
            return false;
        }

        return leftDate.getTime() <=
            rightDate.getTime();
    }

    /**
     * Returns whether the left date occurs after or at the same instant as
     * the right date.
     *
     * Invalid inputs return false.
     *
     * @param {*} left
     * @param {*} right
     * @param {boolean} [compareCalendarDay=false]
     * @returns {boolean}
     */
    function isAfterOrEqual(
        left,
        right,
        compareCalendarDay
    ) {
        var leftDate = compareCalendarDay === true
            ? startOfDay(left)
            : toDate(left);

        var rightDate = compareCalendarDay === true
            ? startOfDay(right)
            : toDate(right);

        if (
            leftDate === null ||
            rightDate === null
        ) {
            return false;
        }

        return leftDate.getTime() >=
            rightDate.getTime();
    }

    /**
     * Returns whether a date occurs before the supplied reference instant.
     *
     * When no reference is supplied, the current instant is used.
     *
     * @param {*} value
     * @param {*} [referenceDate]
     * @returns {boolean}
     */
    function isPast(value, referenceDate) {
        var candidate = toDate(value);

        var reference = isDefined(referenceDate)
            ? toDate(referenceDate)
            : now();

        if (
            candidate === null ||
            reference === null
        ) {
            return false;
        }

        return candidate.getTime() <
            reference.getTime();
    }

    /**
     * Returns whether a date occurs after the supplied reference instant.
     *
     * When no reference is supplied, the current instant is used.
     *
     * @param {*} value
     * @param {*} [referenceDate]
     * @returns {boolean}
     */
    function isFuture(value, referenceDate) {
        var candidate = toDate(value);

        var reference = isDefined(referenceDate)
            ? toDate(referenceDate)
            : now();

        if (
            candidate === null ||
            reference === null
        ) {
            return false;
        }

        return candidate.getTime() >
            reference.getTime();
    }

    /**
     * Returns whether a date occurs before the beginning of the reference
     * calendar day.
     *
     * A due date earlier today is not considered overdue when calendar-day
     * comparison is used.
     *
     * @param {*} value
     * @param {*} [referenceDate]
     * @returns {boolean}
     */
    function isBeforeToday(value, referenceDate) {
        var candidate = startOfDay(value);
        var reference = today(referenceDate);

        if (
            candidate === null ||
            reference === null
        ) {
            return false;
        }

        return candidate.getTime() <
            reference.getTime();
    }

    /**
     * Returns whether a date occurs after the end of the reference calendar
     * day.
     *
     * This helper compares calendar days rather than exact timestamps.
     *
     * @param {*} value
     * @param {*} [referenceDate]
     * @returns {boolean}
     */
    function isAfterToday(value, referenceDate) {
        var candidate = startOfDay(value);
        var reference = today(referenceDate);

        if (
            candidate === null ||
            reference === null
        ) {
            return false;
        }

        return candidate.getTime() >
            reference.getTime();
    }

    /**
     * Returns whether a valid date falls on Saturday or Sunday.
     *
     * Invalid inputs return false.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isWeekend(value) {
        var result = toDate(value);
        var day;

        if (result === null) {
            return false;
        }

        day = result.getDay();

        return day === 0 ||
            day === 6;
    }

    /**
     * Returns whether a valid date falls from Monday through Friday.
     *
     * Invalid inputs return false.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function isWeekday(value) {
        var result = toDate(value);

        if (result === null) {
            return false;
        }

        return !isWeekend(result);
    }

    /**
     * Returns whether a date falls on a specified day of the week.
     *
     * Day values follow JavaScript's convention:
     *
     * 0 = Sunday
     * 1 = Monday
     * ...
     * 6 = Saturday
     *
     * Invalid dates or day values return false.
     *
     * @param {*} value
     * @param {*} dayOfWeek
     * @returns {boolean}
     */
    function isDayOfWeek(value, dayOfWeek) {
        var result = toDate(value);
        var requestedDay = toNumber(
            dayOfWeek,
            NaN
        );

        if (
            result === null ||
            !Number.isInteger(requestedDay) ||
            requestedDay < 0 ||
            requestedDay > 6
        ) {
            return false;
        }

        return result.getDay() ===
            requestedDay;
    }

    /**
     * Compares two supported date values in ascending chronological order.
     *
     * Valid dates sort before invalid values.
     *
     * @param {*} left
     * @param {*} right
     * @returns {-1|0|1}
     */
    function compareDates(left, right) {
        var leftDate = toDate(left);
        var rightDate = toDate(right);

        if (
            leftDate === null &&
            rightDate === null
        ) {
            return 0;
        }

        if (leftDate === null) {
            return 1;
        }

        if (rightDate === null) {
            return -1;
        }

        return compareNumbers(
            leftDate.getTime(),
            rightDate.getTime()
        );
    }

    /**
     * Compares two supported date values in descending chronological order.
     *
     * Valid dates sort before invalid values.
     *
     * @param {*} left
     * @param {*} right
     * @returns {-1|0|1}
     */
    function compareDatesDescending(left, right) {
        var result = compareDates(
            left,
            right
        );

        if (result === 0) {
            return 0;
        }

        return result * -1;
    }

    /**
     * Assign Section 5B utilities to the public namespace.
     */
    assign(Utilities, {
        isSameInstant: isSameInstant,
        isSameDay: isSameDay,
        isSameWeek: isSameWeek,
        isSameMonth: isSameMonth,
        isSameYear: isSameYear,

        isToday: isToday,
        isYesterday: isYesterday,
        isTomorrow: isTomorrow,

        isBefore: isBefore,
        isAfter: isAfter,
        isBeforeOrEqual: isBeforeOrEqual,
        isAfterOrEqual: isAfterOrEqual,

        isPast: isPast,
        isFuture: isFuture,
        isBeforeToday: isBeforeToday,
        isAfterToday: isAfterToday,

        isWeekend: isWeekend,
        isWeekday: isWeekday,
        isDayOfWeek: isDayOfWeek,

        compareDates: compareDates,
        compareDatesDescending:
            compareDatesDescending
    });

    /*
     * Continue directly below this line with Section 5C.
     * Do not close the IIFE yet.
     */    /**************************************************************************
     * Section 5C.1
     * Date & Time Arithmetic — Elapsed Time
     **************************************************************************/

    /*
     * Elapsed-time arithmetic operates on timestamps.
     *
     * This means:
     *
     * addHours(date, 24)
     *
     * adds exactly 24 elapsed hours. It is not guaranteed to produce the same
     * local clock time on the following calendar day when daylight-saving
     * transitions occur.
     *
     * Calendar-aware arithmetic such as addDays() will be implemented in
     * Section 5C.2 using calendar components instead of elapsed milliseconds.
     */

    var MILLISECONDS_PER_SECOND = 1000;
    var MILLISECONDS_PER_MINUTE =
        60 * MILLISECONDS_PER_SECOND;
    var MILLISECONDS_PER_HOUR =
        60 * MILLISECONDS_PER_MINUTE;

    /**
     * Converts an arithmetic amount into a finite number.
     *
     * Invalid values return null rather than silently becoming zero.
     *
     * Numeric strings are accepted when supported by toNumber().
     *
     * This helper remains private.
     *
     * @param {*} value
     * @returns {number|null}
     */
    function dateArithmeticAmount(value) {
        var result = toNumber(
            value,
            NaN
        );

        return Number.isFinite(result)
            ? result
            : null;
    }

    /**
     * Safely multiplies a date arithmetic amount by a time-unit multiplier.
     *
     * Values producing a non-finite result are rejected.
     *
     * This helper remains private.
     *
     * @param {*} value
     * @param {number} multiplier
     * @returns {number|null}
     */
    function dateArithmeticMilliseconds(
        value,
        multiplier
    ) {
        var amount = dateArithmeticAmount(value);
        var result;

        if (amount === null) {
            return null;
        }

        result = amount * multiplier;

        return Number.isFinite(result)
            ? result
            : null;
    }

    /**
     * Returns a new Date offset by an elapsed number of milliseconds.
     *
     * The original value is never modified.
     *
     * Fractional millisecond values are accepted, although JavaScript Date
     * timestamps are ultimately represented with millisecond precision.
     *
     * Invalid dates or amounts return null.
     *
     * @param {*} value
     * @param {*} amount
     * @returns {Date|null}
     */
    function addMilliseconds(value, amount) {
        var result = toDate(value);
        var milliseconds =
            dateArithmeticMilliseconds(
                amount,
                1
            );
        var timestamp;

        if (
            result === null ||
            milliseconds === null
        ) {
            return null;
        }

        timestamp =
            result.getTime() +
            milliseconds;

        if (!Number.isFinite(timestamp)) {
            return null;
        }

        result.setTime(timestamp);

        return isValidDate(result)
            ? result
            : null;
    }

    /**
     * Returns a new Date offset by an elapsed number of seconds.
     *
     * The original value is never modified.
     *
     * Fractional amounts are supported.
     *
     * Invalid dates or amounts return null.
     *
     * @param {*} value
     * @param {*} amount
     * @returns {Date|null}
     */
    function addSeconds(value, amount) {
        var milliseconds =
            dateArithmeticMilliseconds(
                amount,
                MILLISECONDS_PER_SECOND
            );

        if (milliseconds === null) {
            return null;
        }

        return addMilliseconds(
            value,
            milliseconds
        );
    }

    /**
     * Returns a new Date offset by an elapsed number of minutes.
     *
     * The original value is never modified.
     *
     * Fractional amounts are supported.
     *
     * Invalid dates or amounts return null.
     *
     * @param {*} value
     * @param {*} amount
     * @returns {Date|null}
     */
    function addMinutes(value, amount) {
        var milliseconds =
            dateArithmeticMilliseconds(
                amount,
                MILLISECONDS_PER_MINUTE
            );

        if (milliseconds === null) {
            return null;
        }

        return addMilliseconds(
            value,
            milliseconds
        );
    }

    /**
     * Returns a new Date offset by an elapsed number of hours.
     *
     * This function adds exact elapsed hours using timestamps. It is not
     * calendar-day arithmetic.
     *
     * The original value is never modified.
     *
     * Fractional amounts are supported.
     *
     * Invalid dates or amounts return null.
     *
     * @param {*} value
     * @param {*} amount
     * @returns {Date|null}
     */
    function addHours(value, amount) {
        var milliseconds =
            dateArithmeticMilliseconds(
                amount,
                MILLISECONDS_PER_HOUR
            );

        if (milliseconds === null) {
            return null;
        }

        return addMilliseconds(
            value,
            milliseconds
        );
    }

    /**
     * Returns a new Date moved backward by an elapsed number of milliseconds.
     *
     * Supplying a negative amount moves the date forward.
     *
     * Invalid dates or amounts return null.
     *
     * @param {*} value
     * @param {*} amount
     * @returns {Date|null}
     */
    function subtractMilliseconds(value, amount) {
        var numericAmount =
            dateArithmeticAmount(amount);

        if (numericAmount === null) {
            return null;
        }

        return addMilliseconds(
            value,
            -numericAmount
        );
    }

    /**
     * Returns a new Date moved backward by an elapsed number of seconds.
     *
     * Supplying a negative amount moves the date forward.
     *
     * Invalid dates or amounts return null.
     *
     * @param {*} value
     * @param {*} amount
     * @returns {Date|null}
     */
    function subtractSeconds(value, amount) {
        var numericAmount =
            dateArithmeticAmount(amount);

        if (numericAmount === null) {
            return null;
        }

        return addSeconds(
            value,
            -numericAmount
        );
    }

    /**
     * Returns a new Date moved backward by an elapsed number of minutes.
     *
     * Supplying a negative amount moves the date forward.
     *
     * Invalid dates or amounts return null.
     *
     * @param {*} value
     * @param {*} amount
     * @returns {Date|null}
     */
    function subtractMinutes(value, amount) {
        var numericAmount =
            dateArithmeticAmount(amount);

        if (numericAmount === null) {
            return null;
        }

        return addMinutes(
            value,
            -numericAmount
        );
    }

    /**
     * Returns a new Date moved backward by an elapsed number of hours.
     *
     * This function subtracts exact elapsed hours using timestamps.
     *
     * Supplying a negative amount moves the date forward.
     *
     * Invalid dates or amounts return null.
     *
     * @param {*} value
     * @param {*} amount
     * @returns {Date|null}
     */
    function subtractHours(value, amount) {
        var numericAmount =
            dateArithmeticAmount(amount);

        if (numericAmount === null) {
            return null;
        }

        return addHours(
            value,
            -numericAmount
        );
    }

    /**
     * Returns a new Date offset by a structured elapsed-time duration.
     *
     * Supported duration properties:
     *
     * {
     *     hours: 2,
     *     minutes: 30,
     *     seconds: 15,
     *     milliseconds: 250
     * }
     *
     * Missing properties are treated as zero.
     *
     * Calendar units such as days, weeks, months, and years are intentionally
     * unsupported here because they require calendar-aware arithmetic.
     *
     * Invalid duration properties return null.
     *
     * @param {*} value
     * @param {*} duration
     * @returns {Date|null}
     */
    function addElapsedTime(value, duration) {
        var result = toDate(value);
        var source;
        var hours;
        var minutes;
        var seconds;
        var milliseconds;
        var total;

        if (
            result === null ||
            duration === null ||
            typeof duration !== "object" ||
            Array.isArray(duration)
        ) {
            return null;
        }

        source = duration;

        hours = isDefined(source.hours)
            ? dateArithmeticAmount(source.hours)
            : 0;

        minutes = isDefined(source.minutes)
            ? dateArithmeticAmount(source.minutes)
            : 0;

        seconds = isDefined(source.seconds)
            ? dateArithmeticAmount(source.seconds)
            : 0;

        milliseconds =
            isDefined(source.milliseconds)
                ? dateArithmeticAmount(
                    source.milliseconds
                )
                : 0;

        if (
            hours === null ||
            minutes === null ||
            seconds === null ||
            milliseconds === null
        ) {
            return null;
        }

        total =
            (
                hours *
                MILLISECONDS_PER_HOUR
            ) +
            (
                minutes *
                MILLISECONDS_PER_MINUTE
            ) +
            (
                seconds *
                MILLISECONDS_PER_SECOND
            ) +
            milliseconds;

        if (!Number.isFinite(total)) {
            return null;
        }

        return addMilliseconds(
            result,
            total
        );
    }

    /**
     * Returns a new Date moved backward by a structured elapsed-time
     * duration.
     *
     * Supported duration properties:
     *
     * {
     *     hours: 2,
     *     minutes: 30,
     *     seconds: 15,
     *     milliseconds: 250
     * }
     *
     * Invalid duration properties return null.
     *
     * @param {*} value
     * @param {*} duration
     * @returns {Date|null}
     */
    function subtractElapsedTime(value, duration) {
        var result = toDate(value);
        var source;

        if (
            result === null ||
            duration === null ||
            typeof duration !== "object" ||
            Array.isArray(duration)
        ) {
            return null;
        }

        source = {
            hours: isDefined(duration.hours)
                ? -dateArithmeticAmount(
                    duration.hours
                )
                : 0,

            minutes: isDefined(duration.minutes)
                ? -dateArithmeticAmount(
                    duration.minutes
                )
                : 0,

            seconds: isDefined(duration.seconds)
                ? -dateArithmeticAmount(
                    duration.seconds
                )
                : 0,

            milliseconds:
                isDefined(duration.milliseconds)
                    ? -dateArithmeticAmount(
                        duration.milliseconds
                    )
                    : 0
        };

        /*
         * Negating null produces zero, so the original values must be checked
         * explicitly before forwarding the duration.
         */
        if (
            (
                isDefined(duration.hours) &&
                dateArithmeticAmount(
                    duration.hours
                ) === null
            ) ||
            (
                isDefined(duration.minutes) &&
                dateArithmeticAmount(
                    duration.minutes
                ) === null
            ) ||
            (
                isDefined(duration.seconds) &&
                dateArithmeticAmount(
                    duration.seconds
                ) === null
            ) ||
            (
                isDefined(duration.milliseconds) &&
                dateArithmeticAmount(
                    duration.milliseconds
                ) === null
            )
        ) {
            return null;
        }

        return addElapsedTime(
            result,
            source
        );
    }

    /**
     * Assign Section 5C.1 utilities to the public namespace.
     */
    assign(Utilities, {
        addMilliseconds: addMilliseconds,
        addSeconds: addSeconds,
        addMinutes: addMinutes,
        addHours: addHours,

        subtractMilliseconds:
            subtractMilliseconds,
        subtractSeconds: subtractSeconds,
        subtractMinutes: subtractMinutes,
        subtractHours: subtractHours,

        addElapsedTime: addElapsedTime,
        subtractElapsedTime:
            subtractElapsedTime
    });

    /*
     * Continue directly below this line with Section 5C.2.
     * Do not close the IIFE yet.
     *//******************************************************************************
 * Section 5C.2
 * Calendar Arithmetic
 *
 * Part A
 *
 * Internal Calendar Helpers
 *****************************************************************************/

/**
 * Returns whether a year is a leap year.
 *
 * @param {number} year
 * @returns {boolean}
 */
function isLeapYear(year) {

    year = toInteger(year, NaN);

    if (!Number.isFinite(year)) {
        return false;
    }

    return (
        year % 4 === 0 &&
        year % 100 !== 0
    ) || (
        year % 400 === 0
    );

}

/**
 * Returns the number of days in a month.
 *
 * Month is zero-based.
 *
 * January = 0
 * February = 1
 * ...
 * December = 11
 *
 * Invalid inputs return null.
 *
 * @param {number} year
 * @param {number} month
 * @returns {number|null}
 */
function daysInMonth(year, month) {

    year = toInteger(year, NaN);
    month = toInteger(month, NaN);

    if (
        !Number.isFinite(year) ||
        !Number.isFinite(month)
    ) {
        return null;
    }

    if (
        month < 0 ||
        month > 11
    ) {
        return null;
    }

    return new Date(
        year,
        month + 1,
        0
    ).getDate();

}

/**
 * Internal helper used for calendar arithmetic.
 *
 * Creates a cloned Date before applying a mutation.
 *
 * @private
 *
 * @param {*} value
 * @param {Function} callback
 * @returns {Date|null}
 */
function calendarAdjust(
    value,
    callback
) {

    var result = toDate(value);

    if (
        result === null ||
        !isFunction(callback)
    ) {
        return null;
    }

    callback(result);

    return isValidDate(result)
        ? result
        : null;

}

/******************************************************************************
 * Calendar Day Arithmetic
 *****************************************************************************/

/**
 * Adds calendar days.
 *
 * Unlike addHours(), this preserves calendar semantics rather than elapsed
 * milliseconds.
 *
 * @param {*} value
 * @param {*} amount
 * @returns {Date|null}
 */
function addDays(
    value,
    amount
) {

    var days =
        dateArithmeticAmount(amount);

    if (days === null) {
        return null;
    }

    return calendarAdjust(
        value,
        function(result) {

            result.setDate(
                result.getDate() + days
            );

        }
    );

}

/**
 * Subtracts calendar days.
 *
 * @param {*} value
 * @param {*} amount
 * @returns {Date|null}
 */
function subtractDays(
    value,
    amount
) {

    var days =
        dateArithmeticAmount(amount);

    if (days === null) {
        return null;
    }

    return addDays(
        value,
        -days
    );

}

/******************************************************************************
 * Calendar Week Arithmetic
 *****************************************************************************/

/**
 * Adds calendar weeks.
 *
 * @param {*} value
 * @param {*} amount
 * @returns {Date|null}
 */
function addWeeks(
    value,
    amount
) {

    var weeks =
        dateArithmeticAmount(amount);

    if (weeks === null) {
        return null;
    }

    return addDays(
        value,
        weeks * 7
    );

}

/**
 * Subtracts calendar weeks.
 *
 * @param {*} value
 * @param {*} amount
 * @returns {Date|null}
 */
function subtractWeeks(
    value,
    amount
) {

    var weeks =
        dateArithmeticAmount(amount);

    if (weeks === null) {
        return null;
    }

    return addWeeks(
        value,
        -weeks
    );

}

/******************************************************************************
 * Calendar Metadata
 *****************************************************************************/

/**
 * Returns the number of days in the month containing the supplied date.
 *
 * @param {*} value
 * @returns {number|null}
 */
function getDaysInMonth(
    value
) {

    var result =
        toDate(value);

    if (result === null) {
        return null;
    }

    return daysInMonth(
        result.getFullYear(),
        result.getMonth()
    );

}

/**
 * Returns whether the supplied date falls within a leap year.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isLeapYearDate(value) {
    var result = toDate(value);

    if (result === null) {
        return false;
    }

    return isLeapYear(
        result.getFullYear()
    );
}

/******************************************************************************
 * Calendar Month Arithmetic
 *****************************************************************************/

/**
 * Adds calendar months.
 *
 * Month arithmetic is clamped to the final valid day of the destination
 * month.
 *
 * Examples:
 *
 * Jan 31 + 1 month = Feb 28 (or 29)
 * Mar 31 - 1 month = Feb 28 (or 29)
 *
 * @param {*} value
 * @param {*} amount
 * @returns {Date|null}
 */
function addMonths(
    value,
    amount
) {

    var result = toDate(value);
    var months = dateArithmeticAmount(amount);

    var originalDay;

    var targetYear;
    var targetMonth;

    var maximumDay;

    if (
        result === null ||
        months === null
    ) {
        return null;
    }

    originalDay = result.getDate();

    targetYear = result.getFullYear();
    targetMonth = result.getMonth() + months;

    /*
     * Normalize month overflow.
     */

    targetYear += Math.floor(targetMonth / 12);

    targetMonth =
        (
            targetMonth % 12 +
            12
        ) % 12;

    maximumDay =
        daysInMonth(
            targetYear,
            targetMonth
        );

    /*
     * Prevent rollover while changing month.
     */

    result.setDate(1);

    result.setFullYear(
        targetYear
    );

    result.setMonth(
        targetMonth
    );

    result.setDate(
        Math.min(
            originalDay,
            maximumDay
        )
    );

    return result;

}

/**
 * Subtracts calendar months.
 *
 * Uses the same clamped arithmetic as addMonths().
 *
 * @param {*} value
 * @param {*} amount
 * @returns {Date|null}
 */function subtractMonths(
    value,
    amount
) {

    var months =
        dateArithmeticAmount(amount);

    if (months === null) {
        return null;
    }

    return addMonths(
        value,
        -months
    );

}

/******************************************************************************
 * Calendar Year Arithmetic
 *****************************************************************************/

/**
 * Adds calendar years.
 *
 * Leap years are clamped to the last valid day of February when necessary.
 *
 * Examples:
 *
 * Feb 29, 2024 + 1 year = Feb 28, 2025
 * Feb 29, 2024 + 4 years = Feb 29, 2028
 *
 * @param {*} value
 * @param {*} amount
 * @returns {Date|null}
 */
function addYears(
    value,
    amount
) {

    var result = toDate(value);
    var years = dateArithmeticAmount(amount);

    var month;
    var day;
    var targetYear;
    var maximumDay;

    if (
        result === null ||
        years === null
    ) {
        return null;
    }

    month = result.getMonth();
    day = result.getDate();
    targetYear = result.getFullYear() + years;

    maximumDay = daysInMonth(
        targetYear,
        month
    );

    /*
     * Prevent JavaScript rollover while changing years.
     */
    result.setDate(1);

    result.setFullYear(
        targetYear
    );

    result.setMonth(
        month
    );

    result.setDate(
        Math.min(
            day,
            maximumDay
        )
    );

    return result;

}

/**
 * Subtracts calendar years.
 *
 * Uses the same clamped arithmetic as addYears().
 *
 * @param {*} value
 * @param {*} amount
 * @returns {Date|null}
 */
function subtractYears(
    value,
    amount
) {

    var years =
        dateArithmeticAmount(amount);

    if (years === null) {
        return null;
    }
return addYears(
    value,
    -years
);

}

/******************************************************************************
 * Calendar Metadata
 *****************************************************************************/

/**
 * Returns the calendar quarter containing the supplied date.
 *
 * Quarter values:
 *
 * January through March = 1
 * April through June = 2
 * July through September = 3
 * October through December = 4
 *
 * @param {*} value
 * @returns {number|null}
 */
function getQuarter(
    value
) {

    var result =
        toDate(value);

    if (result === null) {
        return null;
    }

    return Math.floor(
        result.getMonth() / 3
    ) + 1;

}

/**
 * Returns the ordinal day of the year for the supplied date.
 *
 * January 1 returns 1.
 * December 31 returns 365 or 366.
 *
 * UTC calendar timestamps are used internally to prevent daylight-saving
 * transitions from affecting the calculation.
 *
 * @param {*} value
 * @returns {number|null}
 */
function getDayOfYear(
    value
) {

    var result =
        toDate(value);

    var currentTimestamp;
    var yearStartTimestamp;

    if (result === null) {
        return null;
    }

    currentTimestamp = Date.UTC(
        result.getFullYear(),
        result.getMonth(),
        result.getDate()
    );

    yearStartTimestamp = Date.UTC(
        result.getFullYear(),
        0,
        1
    );

    return Math.floor(
        (
            currentTimestamp -
            yearStartTimestamp
        ) /
        (
            24 *
            60 *
            60 *
            1000
        )
    ) + 1;

}

/**
 * Returns the ISO-8601 week number for the supplied date.
 *
 * ISO weeks:
 *
 * - Begin on Monday.
 * - Week 1 is the week containing January 4.
 * - Week numbers range from 1 through 52 or 53.
 *
 * UTC calendar values are used internally so daylight-saving transitions do
 * not alter the result.
 *
 * @param {*} value
 * @returns {number|null}
 */
function getWeekOfYear(
    value
) {

    var result =
        toDate(value);

    var workingDate;
    var dayNumber;
    var firstThursday;

    if (result === null) {
        return null;
    }

    /*
     * Reconstruct the local calendar date in UTC. This preserves the intended
     * year, month, and day while avoiding timezone and daylight-saving effects.
     */
    workingDate = new Date(
        Date.UTC(
            result.getFullYear(),
            result.getMonth(),
            result.getDate()
        )
    );

    /*
     * Convert Sunday from zero to seven so Monday becomes the first day of the
     * ISO week.
     */
    dayNumber =
        workingDate.getUTCDay() || 7;

    /*
     * Move to the Thursday belonging to the current ISO week.
     */
    workingDate.setUTCDate(
        workingDate.getUTCDate() +
        4 -
        dayNumber
    );

    /*
     * January 1 of the ISO week-numbering year.
     */
    firstThursday = new Date(
        Date.UTC(
            workingDate.getUTCFullYear(),
            0,
            1
        )
    );

    return Math.ceil(
        (
            (
                workingDate -
                firstThursday
            ) /
            (
                24 *
                60 *
                60 *
                1000
            ) +
            1
        ) /
        7
    );

}

/******************************************************************************
 * Section 5C.2 Public Assignment
 *****************************************************************************/

/**
 * Assigns the calendar-arithmetic and calendar-metadata utilities.
 *
 * Final freezing and module registration occur in the final utilities
 * section.
 */
assign(Utilities, {

    addDays: addDays,
    subtractDays: subtractDays,

    addWeeks: addWeeks,
    subtractWeeks: subtractWeeks,

    addMonths: addMonths,
    subtractMonths: subtractMonths,

    addYears: addYears,
    subtractYears: subtractYears,

    getDaysInMonth: getDaysInMonth,
    isLeapYearDate: isLeapYearDate,

    getQuarter: getQuarter,
    getDayOfYear: getDayOfYear,
    getWeekOfYear: getWeekOfYear

});

/*
 * Section 5C.2 complete.
 *
 * Continue directly below this line with Section 5D.
 * Do not close the IIFE yet.
 *//*****************************************************************************
/******************************************************************************
 * Section 5D
 * Date Boundaries
 *
 * Part A
 *
 * Boundary Foundation
 *****************************************************************************/

/**
 * Internal helper used to clone a date before applying a boundary operation.
 *
 * @private
 *
 * @param {*} value
 * @param {Function} callback
 * @returns {Date|null}
 */
function boundaryAdjust(
    value,
    callback
) {

    var result =
        toDate(value);

    if (
        result === null ||
        !isFunction(callback)
    ) {
        return null;
    }

    callback(result);

    return isValidDate(result)
        ? result
        : null;

}

/******************************************************************************
 * Second Boundary
 *****************************************************************************/

/**
 * Returns the final millisecond of the supplied second.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function endOfSecond(
    value
) {

    return boundaryAdjust(
        value,
        function setSecondBoundary(result) {

            result.setMilliseconds(999);

        }
    );

}

/******************************************************************************
 * Minute Boundary
 *****************************************************************************/

/**
 * Returns the final millisecond of the supplied minute.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function endOfMinute(
    value
) {

    return boundaryAdjust(
        value,
        function setMinuteBoundary(result) {

            result.setSeconds(
                59,
                999
            );

        }
    );

}

/******************************************************************************
 * Hour Boundary
 *****************************************************************************/

/**
 * Returns the final millisecond of the supplied hour.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function endOfHour(
    value
) {

    return boundaryAdjust(
        value,
        function setHourBoundary(result) {

            result.setMinutes(
                59,
                59,
                999
            );

        }
    );

}

/******************************************************************************
 * Day Boundary
 *****************************************************************************/

/**
 * Returns the final millisecond of the supplied day.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function endOfDay(
    value
) {

    return boundaryAdjust(
        value,
        function setDayBoundary(result) {

            result.setHours(
                23,
                59,
                59,
                999
            );

        }
    );

}

/*
 * Continue directly below this line with Section 5D Part B.
 * Do not register these functions yet.
 *//******************************************************************************
 * Week Boundaries
 *****************************************************************************/

/**
 * Returns the beginning of the calendar week containing the supplied date.
 *
 * By default, weeks begin on Sunday.
 *
 * weekStartsOn values:
 *
 * 0 = Sunday
 * 1 = Monday
 * 2 = Tuesday
 * 3 = Wednesday
 * 4 = Thursday
 * 5 = Friday
 * 6 = Saturday
 *
 * Invalid week-start values are clamped between zero and six.
 *
 * @param {*} value
 * @param {number} [weekStartsOn=0]
 * @returns {Date|null}
 */
function startOfWeek(
    value,
    weekStartsOn
) {

    return comparisonWeekStart(
        value,
        weekStartsOn
    );

}

/**
 * Returns the final millisecond of the calendar week containing the supplied
 * date.
 *
 * The week-start convention must match the convention used by startOfWeek().
 *
 * @param {*} value
 * @param {number} [weekStartsOn=0]
 * @returns {Date|null}
 */
function endOfWeek(
    value,
    weekStartsOn
) {

    var beginning =
        startOfWeek(
            value,
            weekStartsOn
        );

    var finalDay;

    if (beginning === null) {
        return null;
    }

    finalDay =
        addDays(
            beginning,
            6
        );

    if (finalDay === null) {
        return null;
    }

    
   return endOfDay(
    finalDay
);

}

/******************************************************************************
 * Month Boundaries
 *****************************************************************************/

/**
 * Returns the beginning of the month containing the supplied date.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function startOfMonth(
    value
) {

    return boundaryAdjust(
        value,
        function setMonthStart(result) {

            result.setDate(1);

            result.setHours(
                0,
                0,
                0,
                0
            );

        }
    );

}

/**
 * Returns the final millisecond of the month containing the supplied date.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function endOfMonth(
    value
) {

    return boundaryAdjust(
        value,
        function setMonthEnd(result) {

            result.setDate(
                daysInMonth(
                    result.getFullYear(),
                    result.getMonth()
                )
            );

                    result.setHours(
                23,
                59,
                59,
                999
            );

        }
    );

}

/******************************************************************************
 * Quarter Boundaries
 *****************************************************************************/

/**
 * Returns the beginning of the quarter containing the supplied date.
 *
 * Quarter ranges:
 *
 * Q1: January   - March
 * Q2: April     - June
 * Q3: July      - September
 * Q4: October   - December
 *
 * @param {*} value
 * @returns {Date|null}
 */
/**
 * Returns the beginning of the quarter containing the supplied date.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function startOfQuarter(
    value
) {

    return boundaryAdjust(
        value,
        function setQuarterStart(result) {

            var quarterMonth =
                Math.floor(
                    result.getMonth() / 3
                ) * 3;

            result.setMonth(
                quarterMonth,
                1
            );

            result.setHours(
                0,
                0,
                0,
                0
            );

        }
    );

}
    function endOfQuarter(
        value
) {

    return boundaryAdjust(
        value,
        function setQuarterEnd(result) {

            var quarterMonth =
                Math.floor(
                    result.getMonth() / 3
                ) * 3;

            var finalMonth =
                quarterMonth + 2;

            result.setMonth(
                finalMonth,
                daysInMonth(
                    result.getFullYear(),
                    finalMonth
                )
            );

            result.setHours(
                23,
                59,
                59,
                999
            );

        }
    );

}
/******************************************************************************
 * Year Boundaries
 *****************************************************************************/

/**
 * Returns the beginning of the year containing the supplied date.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function startOfYear(
    value
) {

    return boundaryAdjust(
        value,
        function setYearStart(result) {

            result.setMonth(
                0,
                1
            );

            result.setHours(
                0,
                0,
                0,
                0
            );

        }
    );

}

/**
 * Returns the final millisecond of the year containing the supplied date.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function endOfYear(
    value
) {

    return boundaryAdjust(
        value,
        function setYearEnd(result) {

            result.setMonth(
                11,
                31
            );

            result.setHours(
                23,
                59,
                59,
                999
            );

        }
    );

}
    /******************************************************************************
 * Section 5D Public Assignment
 *****************************************************************************/

/**
 * Assigns the date-boundary utilities.
 *
 * Final freezing and module registration occur in the final utilities
 * section.
 */
assign(Utilities, {

    startOfWeek: startOfWeek,
    endOfWeek: endOfWeek,

    startOfMonth: startOfMonth,
    endOfMonth: endOfMonth,

    startOfQuarter: startOfQuarter,
    endOfQuarter: endOfQuarter,

    startOfYear: startOfYear,
    endOfYear: endOfYear,

    endOfSecond: endOfSecond,
    endOfMinute: endOfMinute,
    endOfHour: endOfHour,
    endOfDay: endOfDay

});

/*
 * Section 5D complete.
 *
 * Continue directly below this line with Section 5E.
 * Do not close the module.
 */
/******************************************************************************
 * Section 5E
 * Date Differences
 *
 * Part A
 *
 * Difference Foundation
 *****************************************************************************/

/**
 * Internal helper used to normalize two dates before calculating a
 * difference.
 *
 * @private
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @param {Function} callback
 * @returns {number|null}
 */
function differenceAdjust(
    firstValue,
    secondValue,
    callback
) {

    var firstDate =
        toDate(firstValue);

    var secondDate =
        toDate(secondValue);

    if (
        firstDate === null ||
        secondDate === null ||
        !isFunction(callback)
    ) {
        return null;
    }

    return callback(
        firstDate,
        secondDate
    );

}

/******************************************************************************
 * Elapsed Time Differences
 *****************************************************************************/

/**
 * Returns the elapsed milliseconds between two dates.
 *
 * Positive values indicate the second date occurs after the first.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @returns {number|null}
 */
function millisecondsBetween(
    firstValue,
    secondValue
) {

    return differenceAdjust(
        firstValue,
        secondValue,
        function(
            firstDate,
            secondDate
        ) {

            return (
                secondDate.getTime() -
                firstDate.getTime()
            );

        }
    );

}

/**
 * Returns the elapsed seconds between two dates.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @returns {number|null}
 */
function secondsBetween(
    firstValue,
    secondValue
) {

    var result =
        millisecondsBetween(
            firstValue,
            secondValue
        );

    if (result === null) {
        return null;
    }

    return result /
        MILLISECONDS_PER_SECOND;

}

/**
 * Returns the elapsed minutes between two dates.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @returns {number|null}
 */
function minutesBetween(
    firstValue,
    secondValue
) {

    var result =
        millisecondsBetween(
            firstValue,
            secondValue
        );

    if (result === null) {
        return null;
    }

    return result /
        MILLISECONDS_PER_MINUTE;

}

/**
 * Returns the elapsed hours between two dates.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @returns {number|null}
 */
function hoursBetween(
    firstValue,
    secondValue
) {

    var result =
        millisecondsBetween(
            firstValue,
            secondValue
        );

    if (result === null) {
        return null;
    }

        return result /
        MILLISECONDS_PER_HOUR;

}
/******************************************************************************
 * Calendar Differences
 *****************************************************************************/

/**
 * Returns the number of calendar days between two dates.
 *
 * Both dates are normalized to the beginning of their respective days before
 * calculating the difference.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @returns {number|null}
 */
function daysBetween(
    firstValue,
    secondValue
) {

    return differenceAdjust(
        firstValue,
        secondValue,
        function(
            firstDate,
            secondDate
        ) {

            firstDate =
                startOfDay(firstDate);

            secondDate =
                startOfDay(secondDate);

            return Math.round(
                (
                    secondDate.getTime() -
                    firstDate.getTime()
                ) /
                (
                    24 *
                    60 *
                    60 *
                    1000
                )
            );

        }
    );

}

/**
 * Returns the number of calendar weeks between two dates.
 *
 * Both dates are normalized to the beginning of their respective weeks.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @param {number} [weekStartsOn=0]
 * @returns {number|null}
 */
function weeksBetween(
    firstValue,
    secondValue,
    weekStartsOn
) {

    var firstWeek =
        startOfWeek(
            firstValue,
            weekStartsOn
        );

    var secondWeek =
        startOfWeek(
            secondValue,
            weekStartsOn
        );

    var result;

    if (
        firstWeek === null ||
        secondWeek === null
    ) {
        return null;
    }

    result =
        daysBetween(
            firstWeek,
            secondWeek
        );

    if (result === null) {
        return null;
    }

    return result / 7;

}

/**
 * Returns the number of calendar months between two dates.
 *
 * Partial months are ignored.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @returns {number|null}
 */
function monthsBetween(
    firstValue,
    secondValue
) {

    return differenceAdjust(
        firstValue,
        secondValue,
        function(
            firstDate,
            secondDate
        ) {

            return (
                (
                    secondDate.getFullYear() -
                    firstDate.getFullYear()
                ) * 12
            ) +
            (
                secondDate.getMonth() -
                firstDate.getMonth()
            );

        }
    );

}

/**
 * Returns the number of calendar years between two dates.
 *
 * Partial years are ignored.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @returns {number|null}
 */
function yearsBetween(
    firstValue,
    secondValue
) {

    var result =
        monthsBetween(
            firstValue,
            secondValue
        );

    if (result === null) {
        return null;
    }

    return Math.trunc(
        result / 12
    );    
}

/******************************************************************************
 * Business-Day Differences
 *****************************************************************************/

/**
 * Returns true when the supplied date falls on a weekday.
 *
 * Monday through Friday are treated as business days.
 *
 * @private
 *
 * @param {*} value
 * @returns {boolean}
 */
function isBusinessDay(
    value
) {

    var result =
        toDate(value);

    var day;

    if (result === null) {
        return false;
    }

    day =
        result.getDay();

    return (
        day !== 0 &&
        day !== 6
    );

}

/**
 * Returns the number of business days between two dates.
 *
 * The starting date is excluded.
 * The ending date is included when it is a business day.
 *
 * Positive values indicate the second date occurs after the first.
 * Negative values indicate the second date occurs before the first.
 *
 * Saturdays and Sundays are excluded.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @returns {number|null}
 */
function businessDaysBetween(
    firstValue,
    secondValue
) {

    var firstDate =
        startOfDay(firstValue);

    var secondDate =
        startOfDay(secondValue);

    var direction;
    var currentDate;
    var count = 0;

    if (
        firstDate === null ||
        secondDate === null
    ) {
        return null;
    }

    if (
        firstDate.getTime() ===
        secondDate.getTime()
    ) {
        return 0;
    }

    direction =
        secondDate.getTime() >
        firstDate.getTime()
            ? 1
            : -1;

    currentDate =
        cloneDate(firstDate);

    while (
        currentDate.getTime() !==
        secondDate.getTime()
    ) {

        currentDate.setDate(
            currentDate.getDate() +
            direction
        );

        if (isBusinessDay(currentDate)) {
            count += direction;
        }

    }

    return count;

}

        /******************************************************************************
 * Section 5E Public Assignment
 *****************************************************************************/

/**
 * Assigns the date-difference utilities.
 *
 * Final freezing and module registration occur in the final utilities
 * section.
 */
assign(Utilities, {

    millisecondsBetween: millisecondsBetween,
    secondsBetween: secondsBetween,
    minutesBetween: minutesBetween,
    hoursBetween: hoursBetween,

    daysBetween: daysBetween,
    weeksBetween: weeksBetween,
    monthsBetween: monthsBetween,
    yearsBetween: yearsBetween,

    businessDaysBetween: businessDaysBetween

});

/*
 * Section 5E complete.
 *
 * Continue directly below this line with Section 5F.
 * Do not close the module.
 */
/******************************************************************************
 * Section 5F
 * Date Formatting
 *
 * Part A
 *
 * Formatting Foundation
 *****************************************************************************/

/**
 * Pads a numeric date component with leading zeroes.
 *
 * @private
 *
 * @param {*} value
 * @param {number} [length=2]
 * @returns {string}
 */
function padDateValue(
    value,
    length
) {

    var result =
        String(
            toInteger(
                value,
                0
            )
        );

    length =
        Math.max(
            1,
            toInteger(
                length,
                2
            )
        );

    while (
        result.length <
        length
    ) {

        result =
            "0" +
            result;

    }

    return result;

}
/**
 * Internal helper used by every public formatting function.
 *
 * @private
 *
 * @param {*} value
 * @param {Function} callback
 * @returns {string|null}
 */
function formatAdjust(
    value,
    callback
) {

    var result =
        toDate(value);

    if (
        result === null ||
        !isFunction(callback)
    ) {
        return null;
    }

    return callback(
        result
    );

}

/**
 * Returns an ISO-8601 formatted local date.
 *
 * Example:
 *
 * 2026-07-18
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatISODate(
    value
) {

    return formatAdjust(
        value,
        function formatDate(result) {

            return (
                result.getFullYear() +
                "-" +
                padDateValue(
                    result.getMonth() + 1
                ) +
                "-" +
                padDateValue(
                    result.getDate()
                )
            );

        }
    );

}

/**
 * Returns an ISO-8601 formatted local time.
 *
 * Example:
 *
 * 14:37:52
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatISOTime(
    value
) {

    return formatAdjust(
        value,
        function formatTime(result) {

            return (
                padDateValue(
                    result.getHours()
                ) +
                ":" +
                padDateValue(
                    result.getMinutes()
                ) +
                ":" +
                padDateValue(
                    result.getSeconds()
                )
            );

        }
    );

}

/**
 * Returns an ISO-8601 formatted local date/time.
 *
 * Example:
 *
 * 2026-07-18T14:37:52
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatISODateTime(
    value
) {

    var datePart =
        formatISODate(value);

    var timePart =
        formatISOTime(value);

    if (
        datePart === null ||
        timePart === null
    ) {
        return null;
    }

    return (
        datePart +
        "T" +
        timePart
    );

}
/******************************************************************************
 * Human-Readable Formatting
 *****************************************************************************/

var MONTH_NAMES_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

var MONTH_NAMES_LONG = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

var DAY_NAMES_SHORT = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
];

var DAY_NAMES_LONG = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

/**
 * Converts a 24-hour clock hour to a 12-hour clock hour.
 *
 * Midnight and noon both return 12.
 *
 * @private
 *
 * @param {*} value
 * @returns {number}
 */
function toTwelveHourClock(
    value
) {

    var hour =
        clamp(
            toInteger(
                value,
                0
            ),
            0,
            23
        );

    hour =
        hour % 12;

    return hour === 0
        ? 12
        : hour;

}

/**
 * Returns the meridiem indicator for a 24-hour clock hour.
 *
 * @private
 *
 * @param {*} value
 * @returns {string}
 */
function getMeridiem(
    value
) {

    return (
        clamp(
            toInteger(
                value,
                0
            ),
            0,
            23
        ) < 12
    )
        ? "AM"
        : "PM";

}

/**
 * Returns a short human-readable date.
 *
 * Example:
 *
 * Jul 18, 2026
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatShortDate(
    value
) {

    return formatAdjust(
        value,
        function(result) {

            return (
                MONTH_NAMES_SHORT[
                    result.getMonth()
                ] +
                " " +
                result.getDate() +
                ", " +
                result.getFullYear()
            );

        }
    );

}

/**
 * Returns a long human-readable date.
 *
 * Example:
 *
 * July 18, 2026
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatLongDate(
    value
) {

    return formatAdjust(
        value,
        function(result) {

            return (
                MONTH_NAMES_LONG[
                    result.getMonth()
                ] +
                " " +
                result.getDate() +
                ", " +
                result.getFullYear()
            );

        }
    );

}

/**
 * Returns a full human-readable date including the weekday.
 *
 * Example:
 *
 * Saturday, July 18, 2026
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatFullDate(
    value
) {

    return formatAdjust(
        value,
        function(result) {

            return (
                DAY_NAMES_LONG[
                    result.getDay()
                ] +
                ", " +
                MONTH_NAMES_LONG[
                    result.getMonth()
                ] +
                " " +
                result.getDate() +
                ", " +
                result.getFullYear()
            );

        }
    );

}

/**
 * Returns a short weekday name.
 *
 * Example:
 *
 * Sat
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatShortWeekday(
    value
) {

    return formatAdjust(
        value,
        function(result) {

            return DAY_NAMES_SHORT[
                result.getDay()
            ];

        }
    );

}

/**
 * Returns a long weekday name.
 *
 * Example:
 *
 * Saturday
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatLongWeekday(
    value
) {

  return formatAdjust(
    value,
    function(result) {

        return DAY_NAMES_LONG[
            result.getDay()
        ];

    }
);

}  
    
/******************************************************************************
 * Time Formatting
 *****************************************************************************/

/**
 * Returns a human-readable 12-hour time.
 *
 * Example:
 *
 * 2:37 PM
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatTime(
    value
) {

    return formatAdjust(
        value,
        function(result) {

            return (
                toTwelveHourClock(
                    result.getHours()
                ) +
                ":" +
                padDateValue(
                    result.getMinutes()
                ) +
                " " +
                getMeridiem(
                    result.getHours()
                )
            );

        }
    );

}

/**
 * Returns a human-readable 12-hour time including seconds.
 *
 * Example:
 *
 * 2:37:52 PM
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatTimeWithSeconds(
    value
) {

    return formatAdjust(
        value,
        function(result) {

            return (
                toTwelveHourClock(
                    result.getHours()
                ) +
                ":" +
                padDateValue(
                    result.getMinutes()
                ) +
                ":" +
                padDateValue(
                    result.getSeconds()
                ) +
                " " +
                getMeridiem(
                    result.getHours()
                )
            );

        }
    );

}

/******************************************************************************
 * Date-Time Formatting
 *****************************************************************************/

/**
 * Returns the default human-readable date.
 *
 * Example:
 *
 * Jul 18, 2026
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatDate(
    value
) {

    return formatShortDate(
        value
    );

}

/**
 * Returns the default human-readable date and time.
 *
 * Example:
 *
 * Jul 18, 2026 2:37 PM
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatDateTime(
    value
) {

    var date =
        formatDate(value);

    var time =
        formatTime(value);

    if (
        date === null ||
        time === null
    ) {
        return null;
    }

    return (
        date +
        " " +
        time
    );

}

/**
 * Returns a verbose human-readable date and time.
 *
 * Example:
 *
 * Saturday, July 18, 2026 2:37 PM
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatLongDateTime(
    value
) {

    var date =
        formatFullDate(
            value
        );

    var time =
        formatTime(
            value
        );

    if (
        date === null ||
        time === null
    ) {
        return null;
    }

    return (
        date +
        " " +
        time
    );

}
/******************************************************************************
 * Relative Formatting
 *****************************************************************************/

/**
 * Returns a human-readable relative date.
 *
 * Examples:
 *
 * Today
 * Yesterday
 * Tomorrow
 * 5 days ago
 * In 3 days
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatRelativeDate(
    value
) {

    var difference =
        daysBetween(
            today(),
            value
        );

    if (difference === null) {
        return null;
    }

    switch (difference) {

        case -1:
            return "Yesterday";

        case 0:
            return "Today";

        case 1:
            return "Tomorrow";

    }

    if (difference < 0) {

        return (
            Math.abs(difference) +
            " days ago"
        );

    }

    return (
        "In " +
        difference +
        " days"
    );

}

/******************************************************************************
 * Duration Formatting
 *****************************************************************************/

/**
 * Formats an elapsed duration expressed in milliseconds.
 *
 * Examples:
 *
 * 45s
 * 5m 12s
 * 2h 14m
 * 3d 5h
 *
 * @param {*} value
 * @returns {string|null}
 */
    function formatDuration(value) {
    var milliseconds = toInteger(value, null);
    var seconds;
    var minutes;
    var hours;
    var days;

    if (milliseconds === null || milliseconds < 0) {
        return null;
    }

    seconds = Math.floor(
        milliseconds / MILLISECONDS_PER_SECOND
    );

    minutes = Math.floor(seconds / 60);
    hours = Math.floor(minutes / 60);
    days = Math.floor(hours / 24);

    if (days > 0) {
        return (
            days +
            "d " +
            (hours % 24) +
            "h"
        );
    }

    if (hours > 0) {
        return (
            hours +
            "h " +
            (minutes % 60) +
            "m"
        );
    }

    if (minutes > 0) {
        return (
            minutes +
            "m " +
            (seconds % 60) +
            "s"
        );
    }

    return seconds + "s";
}

/**
 * Formats the elapsed time between two dates.
 *
 * @param {*} firstValue
 * @param {*} secondValue
 * @returns {string|null}
 */
function formatElapsedTime(
    firstValue,
    secondValue
) {

    var difference =
        millisecondsBetween(
            firstValue,
            secondValue
        );

    if (difference === null) {
        return null;
    }

    return formatDuration(
        Math.abs(
            difference
        )
    );

}
    /******************************************************************************
 * Machine Formatting
 *****************************************************************************/

/**
 * Returns a compact calendar date.
 *
 * Example:
 *
 * 20260718
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatCompactDate(
    value
) {

    return formatAdjust(
        value,
        function(result) {

            return (
                result.getFullYear() +
                padDateValue(
                    result.getMonth() + 1
                ) +
                padDateValue(
                    result.getDate()
                )
            );

        }
    );

}

/**
 * Returns a sortable timestamp.
 *
 * Example:
 *
 * 2026-07-18 14:37:52
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatTimestamp(
    value
) {

    return formatAdjust(
        value,
        function(result) {

            return (
                result.getFullYear() +
                "-" +
                padDateValue(
                    result.getMonth() + 1
                ) +
                "-" +
                padDateValue(
                    result.getDate()
                ) +
                " " +
                padDateValue(
                    result.getHours()
                ) +
                ":" +
                padDateValue(
                    result.getMinutes()
                ) +
                ":" +
                padDateValue(
                    result.getSeconds()
                )
            );

        }
    );

}

/**
 * Returns a filename-safe timestamp.
 *
 * Example:
 *
 * 20260718_143752
 *
 * @param {*} value
 * @returns {string|null}
 */
function formatFileTimestamp(
    value
) {

    return formatAdjust(
        value,
        function(result) {

            return (
                result.getFullYear() +
                padDateValue(
                    result.getMonth() + 1
                ) +
                padDateValue(
                    result.getDate()
                ) +
                "_" +
                padDateValue(
                    result.getHours()
                ) +
                padDateValue(
                    result.getMinutes()
                ) +
                padDateValue(
                    result.getSeconds()
                )
            );

        }
    );

}

/******************************************************************************
 * Section 5F Public Assignment
 *****************************************************************************/

assign(Utilities, {

    formatISODate: formatISODate,
    formatISOTime: formatISOTime,
    formatISODateTime: formatISODateTime,

    formatShortDate: formatShortDate,
    formatLongDate: formatLongDate,
    formatFullDate: formatFullDate,

    formatShortWeekday: formatShortWeekday,
    formatLongWeekday: formatLongWeekday,

    formatDate: formatDate,
    formatTime: formatTime,
    formatTimeWithSeconds: formatTimeWithSeconds,
    formatDateTime: formatDateTime,
    formatLongDateTime: formatLongDateTime,

    formatRelativeDate: formatRelativeDate,

    formatDuration: formatDuration,
    formatElapsedTime: formatElapsedTime,

    formatCompactDate: formatCompactDate,
    formatTimestamp: formatTimestamp,
    formatFileTimestamp: formatFileTimestamp

});

/*
 * Section 5 complete.
 *
 * Date Utilities complete.
 */
/******************************************************************************
 * Section 6A
 * Function Utilities
 *
 * Part A
 *
 * Functional Foundation
 *****************************************************************************/
/******************************************************************************
 * Identity
 ******************************************************************************/

/**
 * Returns the supplied value unchanged.
 *
 * Useful as a default callback, transformation function,
 * or placeholder where a function is required.
 *
 * @param {*} value
 * @returns {*}
 */
function identity(value) {
    return value;
}
/******************************************************************************
 * No Operation
 ******************************************************************************/

/**
 * Performs no action.
 *
 * Useful as a default callback, placeholder function,
 * or optional event handler.
 *
 * @returns {undefined}
 */
function noop() {}
    /******************************************************************************
 * Constant Function
 ******************************************************************************/

/**
 * Creates a function that always returns the supplied value.
 *
 * The returned function ignores all arguments passed to it.
 *
 * @param {*} value
 * @returns {Function}
 */
function constant(value) {
    return function constantFunction() {
        return value;
    };
}
    /******************************************************************************
 * Negate Predicate
 ******************************************************************************/

/**
 * Creates a function that returns the logical opposite
 * of the supplied predicate's result.
 *
 * The predicate receives the original arguments and calling context.
 *
 * @param {Function} predicate
 * @returns {Function}
 * @throws {TypeError} If predicate is not a function.
 */
function negate(predicate) {
    if (!isFunction(predicate)) {
        throw new TypeError('Expected predicate to be a function.');
    }

    return function negatedPredicate() {
        return !predicate.apply(this, arguments);
    };
}
    /******************************************************************************
 * Compose
 ******************************************************************************/

/**
 * Creates a function that executes the supplied functions
 * from right to left.
 *
 * The rightmost function receives all original arguments.
 * Each remaining function receives the previous function's result.
 *
 * Calling context is preserved for every function.
 *
 * @param {...Function} functions
 * @returns {Function}
 * @throws {TypeError} If any supplied value is not a function.
 */
function compose() {
    var functions = Array.prototype.slice.call(arguments);
    var index;

    for (index = 0; index < functions.length; index += 1) {
        if (!isFunction(functions[index])) {
            throw new TypeError('Expected every compose argument to be a function.');
        }
    }

    if (functions.length === 0) {
        return identity;
    }

    return function composedFunction() {
        var position = functions.length - 1;
        var result = functions[position].apply(this, arguments);

        while (position > 0) {
            position -= 1;
            result = functions[position].call(this, result);
        }

        return result;
    };
}
    /******************************************************************************
 * Pipe
 ******************************************************************************/

/**
 * Creates a function that executes the supplied functions
 * from left to right.
 *
 * The leftmost function receives all original arguments.
 * Each remaining function receives the previous function's result.
 *
 * Calling context is preserved for every function.
 *
 * @param {...Function} functions
 * @returns {Function}
 * @throws {TypeError} If any supplied value is not a function.
 */
function pipe() {
    var functions = Array.prototype.slice.call(arguments);
    var index;

    for (index = 0; index < functions.length; index += 1) {
        if (!isFunction(functions[index])) {
            throw new TypeError('Expected every pipe argument to be a function.');
        }
    }

    if (functions.length === 0) {
        return identity;
    }

    return function pipedFunction() {
        var position = 0;
        var result = functions[position].apply(this, arguments);

        while (position < functions.length - 1) {
            position += 1;
            result = functions[position].call(this, result);
        }

        return result;
    };
}
/******************************************************************************
 * Partial Application
 ******************************************************************************/

/**
 * Creates a function with arguments partially applied from the left.
 *
 * The supplied arguments are placed before any arguments provided
 * when the returned function is invoked.
 *
 * Calling context is preserved.
 *
 * @param {Function} func
 * @param {...*} partialArguments
 * @returns {Function}
 * @throws {TypeError} If func is not a function.
 */
function partial(func) {
    var partialArguments;

    if (!isFunction(func)) {
        throw new TypeError('Expected func to be a function.');
    }

    partialArguments = Array.prototype.slice.call(arguments, 1);

    return function partiallyAppliedFunction() {
        var invocationArguments = Array.prototype.slice.call(arguments);
        var combinedArguments = partialArguments.concat(invocationArguments);

        return func.apply(this, combinedArguments);
    };
}
    /******************************************************************************
 * Partial Right Application
 ******************************************************************************/

/**
 * Creates a function with arguments partially applied from the right.
 *
 * The supplied arguments are placed after any arguments provided
 * when the returned function is invoked.
 *
 * Calling context is preserved.
 *
 * @param {Function} func
 * @param {...*} partialArguments
 * @returns {Function}
 * @throws {TypeError} If func is not a function.
 */
function partialRight(func) {
    var partialArguments;

    if (!isFunction(func)) {
        throw new TypeError('Expected func to be a function.');
    }

    partialArguments = Array.prototype.slice.call(arguments, 1);

    return function partiallyAppliedRightFunction() {
        var invocationArguments = Array.prototype.slice.call(arguments);
        var combinedArguments = invocationArguments.concat(partialArguments);

        return func.apply(this, combinedArguments);
    };
}
    /******************************************************************************
 * Curry
 ******************************************************************************/

/**
 * Creates a curried version of the supplied function.
 *
 * Arguments may be provided individually or in groups across
 * multiple calls until the required arity is satisfied.
 *
 * Additional arguments supplied in the final call are forwarded.
 * Calling context from the final invocation is preserved.
 *
 * @param {Function} func
 * @param {number} [arity=func.length]
 * @returns {Function}
 * @throws {TypeError} If func is not a function.
 * @throws {RangeError} If arity is not a non-negative integer.
 */
function curry(func, arity) {
    var requiredArity;

    if (!isFunction(func)) {
        throw new TypeError('Expected func to be a function.');
    }

    requiredArity = arity === undefined ? func.length : arity;

    if (
        typeof requiredArity !== 'number' ||
        !isFinite(requiredArity) ||
        requiredArity < 0 ||
        Math.floor(requiredArity) !== requiredArity
    ) {
        throw new RangeError('Expected arity to be a non-negative integer.');
    }

    function createCurried(collectedArguments) {
        return function curriedFunction() {
            var invocationArguments = Array.prototype.slice.call(arguments);
            var combinedArguments = collectedArguments.concat(invocationArguments);

            if (combinedArguments.length >= requiredArity) {
                return func.apply(this, combinedArguments);
            }

            return createCurried(combinedArguments);
        };
    }

    return createCurried([]);
}
    /******************************************************************************
 * Ary
 ******************************************************************************/

/**
 * Creates a function that invokes the supplied function with
 * no more than the specified number of arguments.
 *
 * Calling context is preserved.
 *
 * @param {Function} func
 * @param {number} [arity=func.length]
 * @returns {Function}
 * @throws {TypeError} If func is not a function.
 * @throws {RangeError} If arity is not a non-negative integer.
 */
function ary(func, arity) {
    var maxArguments;

    if (!isFunction(func)) {
        throw new TypeError('Expected func to be a function.');
    }

    maxArguments = arity === undefined ? func.length : arity;

    if (
        typeof maxArguments !== 'number' ||
        !isFinite(maxArguments) ||
        maxArguments < 0 ||
        Math.floor(maxArguments) !== maxArguments
    ) {
        throw new RangeError('Expected arity to be a non-negative integer.');
    }

    return function arityLimitedFunction() {
        var invocationArguments = Array.prototype.slice.call(arguments, 0, maxArguments);

        return func.apply(this, invocationArguments);
    };
}
    /******************************************************************************
 * Unary
 ******************************************************************************/

/**
 * Creates a function that invokes the supplied function
 * with only its first argument.
 *
 * This is equivalent to ary(func, 1).
 *
 * Calling context is preserved.
 *
 * @param {Function} func
 * @returns {Function}
 * @throws {TypeError} If func is not a function.
 */
function unary(func) {
    return ary(func, 1);
}
    /******************************************************************************
 * Wrap
 ******************************************************************************/

/**
 * Creates a function that invokes the supplied wrapper,
 * passing the original function as its first argument.
 *
 * Calling context is preserved.
 *
 * @param {Function} func
 * @param {Function} wrapper
 * @returns {Function}
 * @throws {TypeError} If either argument is not a function.
 */
function wrap(func, wrapper) {
    if (!isFunction(func)) {
        throw new TypeError('Expected func to be a function.');
    }

    if (!isFunction(wrapper)) {
        throw new TypeError('Expected wrapper to be a function.');
    }

    return function wrappedFunction() {
        var invocationArguments = [func].concat(
            Array.prototype.slice.call(arguments)
        );

        return wrapper.apply(this, invocationArguments);
    };
}
    /******************************************************************************
 * Attempt
 ******************************************************************************/

/**
 * Invokes the supplied function and captures any thrown error.
 *
 * Returns the function result when successful.
 * Returns the thrown value when execution fails.
 *
 * The supplied arguments are forwarded to the function.
 * Calling context is preserved.
 *
 * @param {Function} func
 * @param {...*} invocationArguments
 * @returns {*}
 * @throws {TypeError} If func is not a function.
 */
function attempt(func) {
    var invocationArguments;

    if (!isFunction(func)) {
        throw new TypeError('Expected func to be a function.');
    }

    invocationArguments = Array.prototype.slice.call(arguments, 1);

    try {
        return func.apply(this, invocationArguments);
    } catch (error) {
        return error;
    }
    
    }
/******************************************************************************
 * Assign Section 6A Public Functions
 ******************************************************************************/

assign(Utilities, {
    identity: identity,
    noop: noop,
    constant: constant,
    negate: negate,

    compose: compose,
    pipe: pipe,

    partial: partial,
    partialRight: partialRight,
    curry: curry,

    ary: ary,
    unary: unary,

    wrap: wrap,
    attempt: attempt
});
 /******************************************************************************
 * Once
 ******************************************************************************/

/**
 * Creates a function that invokes the supplied function only once.
 *
 * The first return value is cached and returned for all subsequent calls.
 *
 * Calling context is preserved during the initial invocation.
 *
 * @param {Function} func
 * @returns {Function}
 * @throws {TypeError} If func is not a function.
 */
function once(func) {
    var invoked = false;
    var result;

    if (!isFunction(func)) {
        throw new TypeError("Expected func to be a function.");
    }

    return function onceFunction() {
        if (!invoked) {
            invoked = true;
            result = func.apply(this, arguments);
        }

        return result;
    };
}
    /******************************************************************************
 * Before
 ******************************************************************************/

/**
 * Creates a function that invokes the supplied function until it has been
 * called fewer than the specified number of times.
 *
 * After the execution limit is reached, the last computed result is returned
 * without invoking the function again.
 *
 * Calling context is preserved during each invocation.
 *
 * @param {number} count
 * @param {Function} func
 * @returns {Function}
 * @throws {RangeError} If count is not a positive integer.
 * @throws {TypeError} If func is not a function.
 */
function before(count, func) {
    var remainingCalls;
    var result;

    if (
        typeof count !== "number" ||
        !isFinite(count) ||
        count <= 0 ||
        Math.floor(count) !== count
    ) {
        throw new RangeError(
            "Expected count to be a positive integer."
        );
    }

    if (!isFunction(func)) {
        throw new TypeError(
            "Expected func to be a function."
        );
    }

    remainingCalls = count;

    return function beforeFunction() {
        if (remainingCalls > 1) {
            remainingCalls -= 1;
            result = func.apply(this, arguments);
        }

        return result;
    };
}
    /******************************************************************************
 * After
 ******************************************************************************/

/**
 * Creates a function that invokes the supplied function only after it has been
 * called at least the specified number of times.
 *
 * Calls made before the threshold return undefined.
 *
 * Calling context is preserved.
 *
 * @param {number} count
 * @param {Function} func
 * @returns {Function}
 * @throws {RangeError} If count is not a non-negative integer.
 * @throws {TypeError} If func is not a function.
 */
function after(count, func) {
    var remainingCalls;

    if (
        typeof count !== "number" ||
        !isFinite(count) ||
        count < 0 ||
        Math.floor(count) !== count
    ) {
        throw new RangeError(
            "Expected count to be a non-negative integer."
        );
    }

    if (!isFunction(func)) {
        throw new TypeError(
            "Expected func to be a function."
        );
    }

    remainingCalls = count;

    return function afterFunction() {
        if (remainingCalls > 0) {
            remainingCalls -= 1;
        }

        if (remainingCalls === 0) {
            return func.apply(this, arguments);
        }

        return undefined;
    };
}
    /******************************************************************************
 * Memoize
 ******************************************************************************/

/**
 * Creates a function that caches results based on a computed cache key.
 *
 * By default, the first argument is used as the cache key.
 * An optional resolver function may be supplied to compute custom keys.
 *
 * Calling context is preserved.
 *
 * The returned function exposes its cache as the `cache` property.
 *
 * @param {Function} func
 * @param {Function} [resolver]
 * @returns {Function}
 * @throws {TypeError} If func is not a function.
 * @throws {TypeError} If resolver is supplied and is not a function.
 */
    function memoize(func, resolver) {
    var cache;

    if (!isFunction(func)) {
        throw new TypeError(
            "Expected func to be a function."
        );
    }

    if (
        typeof resolver !== "undefined" &&
        !isFunction(resolver)
    ) {
        throw new TypeError(
            "Expected resolver to be a function."
        );
    }

    cache = new Map();

    function memoizedFunction() {
        var key = resolver
            ? resolver.apply(this, arguments)
            : arguments[0];
        var result;

        if (cache.has(key)) {
            return cache.get(key);
        }

        result = func.apply(this, arguments);
        cache.set(key, result);

        return result;
    }

    memoizedFunction.cache = cache;

    return memoizedFunction;
}

/******************************************************************************

 * Debounce

 ******************************************************************************/

/**

 * Creates a function that delays invocation until after a period of inactivity.

 *

 * Each call resets the waiting period.

 *

 * The returned function exposes:

 * - cancel() : Cancels any pending invocation.

 * - flush()  : Immediately invokes any pending invocation.

 *

 * Calling context and arguments from the most recent invocation are preserved.

 *

 * @param {Function} func

 * @param {number} wait

 * @returns {Function}

 * @throws {TypeError} If func is not a function.

 * @throws {RangeError} If wait is not a non-negative finite number.

 */

function debounce(func, wait) {

    var timeoutId = null;

    var lastArguments;

    var lastContext;

    var lastResult;

    if (!isFunction(func)) {

        throw new TypeError(

            "Expected func to be a function."

        );

    }

    if (

        typeof wait !== "number" ||

        !isFinite(wait) ||

        wait < 0

    ) {

        throw new RangeError(

            "Expected wait to be a non-negative finite number."

        );

    }

    function invoke() {

        timeoutId = null;

        lastResult = func.apply(lastContext, lastArguments);

    }

    function debouncedFunction() {

        lastContext = this;

        lastArguments = arguments;

        if (timeoutId !== null) {

            clearTimeout(timeoutId);

        }

        timeoutId = setTimeout(invoke, wait);

        return lastResult;

    }

    debouncedFunction.cancel = function cancel() {

        if (timeoutId !== null) {

            clearTimeout(timeoutId);

            timeoutId = null;

        }

    };

    debouncedFunction.flush = function flush() {

        if (timeoutId !== null) {

            clearTimeout(timeoutId);

            invoke();

        }

        return lastResult;

    };

    return debouncedFunction;

}
    /******************************************************************************
 * Throttle
 ******************************************************************************/

/**
 * Creates a function that invokes the supplied function at most once during
 * each waiting period.
 *
 * Additional calls made during the waiting period return the most recent
 * computed result.
 *
 * The returned function exposes:
 * - cancel() : Cancels any pending execution.
 * - flush()  : Immediately executes any pending invocation.
 *
 * Calling context and the most recent arguments are preserved.
 *
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 * @throws {TypeError} If func is not a function.
 * @throws {RangeError} If wait is not a non-negative finite number.
 */
function throttle(func, wait) {
    var timeoutId = null;
    var lastInvokeTime = 0;
    var lastArguments;
    var lastContext;
    var lastResult;

    if (!isFunction(func)) {
        throw new TypeError(
            "Expected func to be a function."
        );
    }

    if (
        typeof wait !== "number" ||
        !isFinite(wait) ||
        wait < 0
    ) {
        throw new RangeError(
            "Expected wait to be a non-negative finite number."
        );
    }

    function invoke() {
        timeoutId = null;
        lastInvokeTime = Date.now();
        lastResult = func.apply(lastContext, lastArguments);
    }

    function throttledFunction() {
        var now = Date.now();
        var remaining;

        lastContext = this;
        lastArguments = arguments;

        remaining = wait - (now - lastInvokeTime);

        if (remaining <= 0 || remaining > wait) {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            invoke();
        } else if (timeoutId === null) {
            timeoutId = setTimeout(invoke, remaining);
        }

        return lastResult;
    }

    throttledFunction.cancel = function cancel() {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    throttledFunction.flush = function flush() {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            invoke();
        }

        return lastResult;
    };

    return throttledFunction;
}
    /******************************************************************************
 * Delay
 ******************************************************************************/

/**
 * Invokes the supplied function after a specified delay.
 *
 * Additional arguments are forwarded to the function.
 *
 * Calling context is not preserved because execution occurs asynchronously.
 *
 * @param {Function} func
 * @param {number} wait
 * @param {...*} invocationArguments
 * @returns {number}
 * @throws {TypeError} If func is not a function.
 * @throws {RangeError} If wait is not a non-negative finite number.
 */
function delay(func, wait) {
    var invocationArguments;

    if (!isFunction(func)) {
        throw new TypeError(
            "Expected func to be a function."
        );
    }

    if (
        typeof wait !== "number" ||
        !isFinite(wait) ||
        wait < 0
    ) {
        throw new RangeError(
            "Expected wait to be a non-negative finite number."
        );
    }

    invocationArguments = Array.prototype.slice.call(arguments, 2);

    return setTimeout(function delayedFunction() {
        func.apply(undefined, invocationArguments);
    }, wait);
}
/******************************************************************************
 * Defer
 ******************************************************************************/

/**
 * Defers invocation of the supplied function until the current call stack
 * has completed.
 *
 * This is equivalent to delay(func, 0, ...arguments).
 *
 * Additional arguments are forwarded to the function.
 *
 * @param {Function} func
 * @param {...*} invocationArguments
 * @returns {number}
 * @throws {TypeError} If func is not a function.
 */
function defer(func) {
    var invocationArguments = Array.prototype.slice.call(arguments, 1);

    return delay.apply(
        undefined,
        [func, 0].concat(invocationArguments)
    );
}
/******************************************************************************
 * Assign Section 6B Public Functions
 ******************************************************************************/

assign(Utilities, {
    once: once,
    before: before,
    after: after,

    memoize: memoize,

    debounce: debounce,
    throttle: throttle,

    delay: delay,
    defer: defer
});
/******************************************************************************
 * Section 7 — Object & Reflection Utilities
 ******************************************************************************/

/**
 * Creates a new object using the supplied prototype.
 *
 * @param {Object|null} prototype
 * @returns {Object}
 */
function create(prototype) {

    if (
        prototype !== null &&
        !isObject(prototype) &&
        !isFunction(prototype)
    ) {
        throw new TypeError(
            "create requires an object, function, or null prototype."
        );
    }

    return Object.create(prototype);

}
/**
 * Assigns default values for undefined properties.
 *
 * Existing values are never overwritten.
 *
 * @param {Object} target
 * @returns {Object}
 */
function defaults(target) {

    var destination;
    var sourceIndex;
    var source;

    destination =
        isObject(target) || isFunction(target)
            ? target
            : {};

    for (
        sourceIndex = 1;
        sourceIndex < arguments.length;
        sourceIndex += 1
    ) {

        source = arguments[sourceIndex];

        if (!isDefined(source)) {
            continue;
        }

        keys(Object(source)).forEach(
            function applyDefault(property) {

                if (
                    typeof destination[property] === "undefined"
                ) {
                    destination[property] = source[property];
                }

            }
        );

    }

    return destination;

}
/**
 * Recursively assigns default values for undefined properties.
 *
 * Existing defined values are never overwritten.
 * Plain objects are processed recursively.
 * Arrays and other values are treated as complete values.
 *
 * @param {Object} target
 * @returns {Object}
 */
function defaultsDeep(target) {

    var destination;
    var sourceIndex;
    var source;

    destination =
        isObject(target) || isFunction(target)
            ? target
            : {};

    for (
        sourceIndex = 1;
        sourceIndex < arguments.length;
        sourceIndex += 1
    ) {

        source = arguments[sourceIndex];

        if (!isDefined(source)) {
            continue;
        }

        keys(Object(source)).forEach(
            function applyDeepDefault(property) {

                var sourceValue = source[property];
                var destinationValue = destination[property];

                if (
                    typeof destinationValue === "undefined"
                ) {
                    destination[property] =
                        deepClone(sourceValue);

                    return;
                }

                if (
                    isPlainObject(destinationValue) &&
                    isPlainObject(sourceValue)
                ) {
                    defaultsDeep(
                        destinationValue,
                        sourceValue
                    );
                }

            }
        );

    }

    return destination;

}
/**
 * Returns whether an object exists in another object's prototype chain.
 *
 * @param {*} prototype
 * @param {*} object
 * @returns {boolean}
 */
function isPrototypeOf(prototype, object) {

    if (
        (
            !isObject(prototype) &&
            !isFunction(prototype)
        ) ||
        (
            !isObject(object) &&
            !isFunction(object)
        )
    ) {
        return false;
    }

    return Object.prototype.isPrototypeOf.call(
        prototype,
        object
    );

}
/**
 * Returns whether an object is extensible.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isExtensible(value) {

    if (
        !isObject(value) &&
        !isFunction(value)
    ) {
        return false;
    }

    return Object.isExtensible(value);

}
/**
 * Returns whether an object is sealed.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isSealed(value) {

    if (
        !isObject(value) &&
        !isFunction(value)
    ) {
        return false;
    }

    return Object.isSealed(value);

}
/**
 * Returns whether an object is frozen.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isFrozen(value) {

    if (
        !isObject(value) &&
        !isFunction(value)
    ) {
        return false;
    }

    return Object.isFrozen(value);

}
/**
 * Seals an object.
 *
 * Primitive values are returned unchanged.
 *
 * @param {*} value
 * @returns {*}
 */
function seal(value) {

    if (
        !isObject(value) &&
        !isFunction(value)
    ) {
        return value;
    }

    return Object.seal(value);

}
/******************************************************************************
 * Section 8 — Equality Utilities
 ******************************************************************************/

/**
 * Compares two values using SameValueZero semantics.
 *
 * Unlike strict equality, NaN is equal to NaN.
 * Positive and negative zero are considered equal.
 *
 * Objects are compared by reference.
 *
 * @param {*} left
 * @param {*} right
 * @returns {boolean}
 */
function sameValueZero(left, right) {

    return (
        left === right ||
        (
            left !== left &&
            right !== right
        )
    );

}
/**
 * Performs a shallow equality comparison.
 *
 * Objects and arrays are compared by their own enumerable
 * properties only. Nested objects are compared by reference.
 *
 * @param {*} left
 * @param {*} right
 * @returns {boolean}
 */
function shallowEquals(left, right) {

    var leftKeys;
    var rightKeys;
    var index;
    var key;

    if (
        sameValueZero(left, right)
    ) {
        return true;
    }

    if (
        (
            !isObject(left) &&
            !isFunction(left)
        ) ||
        (
            !isObject(right) &&
            !isFunction(right)
        )
    ) {
        return false;
    }

    leftKeys = keys(left);
    rightKeys = keys(right);

    if (
        leftKeys.length !== rightKeys.length
    ) {
        return false;
    }

    for (
        index = 0;
        index < leftKeys.length;
        index += 1
    ) {

        key = leftKeys[index];

        if (
            !hasOwn(right, key) ||
            !sameValueZero(
                left[key],
                right[key]
            )
        ) {
            return false;
        }

    }

    return true;

}
/**
 * Compares two arrays element by element.
 *
 * Sparse array holes are distinguished from properties whose
 * value is explicitly undefined.
 *
 * An optional comparator may be supplied for each pair of values.
 * SameValueZero comparison is used by default.
 *
 * @param {*} left
 * @param {*} right
 * @param {Function} [comparator]
 * @returns {boolean}
 */
function arrayEquals(left, right, comparator) {

    var compare;
    var index;
    var leftHasIndex;
    var rightHasIndex;

    if (
        sameValueZero(left, right)
    ) {
        return true;
    }

    if (
        !isArray(left) ||
        !isArray(right)
    ) {
        return false;
    }

    if (
        left.length !== right.length
    ) {
        return false;
    }

    if (
        isDefined(comparator) &&
        !isFunction(comparator)
    ) {
        throw new TypeError(
            "arrayEquals comparator must be a function."
        );
    }

    compare =
        comparator ||
        sameValueZero;

    for (
        index = 0;
        index < left.length;
        index += 1
    ) {

        leftHasIndex =
            hasOwn(left, index);

        rightHasIndex =
            hasOwn(right, index);

        if (
            leftHasIndex !== rightHasIndex
        ) {
            return false;
        }

        if (
            leftHasIndex &&
            !compare(
                left[index],
                right[index],
                index,
                left,
                right
            )
        ) {
            return false;
        }

    }

    return true;

}
/**
 * Compares two objects by their own enumerable properties.
 *
 * Arrays are not considered objects for this comparison.
 *
 * An optional comparator may be supplied for each pair of values.
 * SameValueZero comparison is used by default.
 *
 * @param {*} left
 * @param {*} right
 * @param {Function} [comparator]
 * @returns {boolean}
 */
function objectEquals(left, right, comparator) {

    var compare;
    var leftKeys;
    var rightKeys;
    var index;
    var key;

    if (
        sameValueZero(left, right)
    ) {
        return true;
    }

    if (
        !isPlainObject(left) ||
        !isPlainObject(right)
    ) {
        return false;
    }

    if (
        isDefined(comparator) &&
        !isFunction(comparator)
    ) {
        throw new TypeError(
            "objectEquals comparator must be a function."
        );
    }

    compare =
        comparator ||
        sameValueZero;

    leftKeys = keys(left);
    rightKeys = keys(right);

    if (
        leftKeys.length !== rightKeys.length
    ) {
        return false;
    }

    for (
        index = 0;
        index < leftKeys.length;
        index += 1
    ) {

        key = leftKeys[index];

        if (
            !hasOwn(right, key)
        ) {
            return false;
        }

        if (
            !compare(
                left[key],
                right[key],
                key,
                left,
                right
            )
        ) {
            return false;
        }

    }

    return true;

}
/**
 * Performs a deep equality comparison.
 *
 * Arrays and plain objects are compared recursively.
 * Circular references are supported.
 *
 * Date, RegExp, and boxed primitive objects are compared
 * by their underlying values.
 *
 * Functions and unsupported object types are equal only
 * when they reference the same value.
 *
 * @param {*} left
 * @param {*} right
 * @returns {boolean}
 */
function equals(left, right) {

    var leftStack = [];
    var rightStack = [];

    /**
     * Recursively compares two values.
     *
     * @param {*} leftValue
     * @param {*} rightValue
     * @returns {boolean}
     */
    function compare(leftValue, rightValue) {

        var leftTag;
        var rightTag;
        var leftIndex;
        var rightIndex;
        var result;

        if (
            sameValueZero(
                leftValue,
                rightValue
            )
        ) {
            return true;
        }

        if (
            (
                !isObject(leftValue) &&
                !isFunction(leftValue)
            ) ||
            (
                !isObject(rightValue) &&
                !isFunction(rightValue)
            )
        ) {
            return false;
        }

        if (
            isFunction(leftValue) ||
            isFunction(rightValue)
        ) {
            return false;
        }

        leftTag =
            Object.prototype.toString.call(
                leftValue
            );

        rightTag =
            Object.prototype.toString.call(
                rightValue
            );

        if (
            leftTag !== rightTag
        ) {
            return false;
        }

        switch (leftTag) {

        case "[object Date]":

            return sameValueZero(
                leftValue.getTime(),
                rightValue.getTime()
            );

        case "[object RegExp]":

            return (
                leftValue.source ===
                    rightValue.source &&
                leftValue.global ===
                    rightValue.global &&
                leftValue.ignoreCase ===
                    rightValue.ignoreCase &&
                leftValue.multiline ===
                    rightValue.multiline &&
                leftValue.unicode ===
                    rightValue.unicode &&
                leftValue.sticky ===
                    rightValue.sticky
            );

        case "[object Boolean]":
        case "[object Number]":
        case "[object String]":

            return sameValueZero(
                leftValue.valueOf(),
                rightValue.valueOf()
            );

        default:
            break;

        }

        if (
            !isArray(leftValue) &&
            !isPlainObject(leftValue)
        ) {
            return false;
        }

        if (
            isArray(leftValue) !==
            isArray(rightValue)
        ) {
            return false;
        }

        leftIndex =
            leftStack.indexOf(leftValue);

        rightIndex =
            rightStack.indexOf(rightValue);

        if (
            leftIndex !== -1 ||
            rightIndex !== -1
        ) {
            return (
                leftIndex === rightIndex
            );
        }

        leftStack.push(leftValue);
        rightStack.push(rightValue);

        if (
            isArray(leftValue)
        ) {
            result = arrayEquals(
                leftValue,
                rightValue,
                function compareArrayValues(
                    leftElement,
                    rightElement
                ) {
                    return compare(
                        leftElement,
                        rightElement
                    );
                }
            );
        } else {
            result = objectEquals(
                leftValue,
                rightValue,
                function compareObjectValues(
                    leftProperty,
                    rightProperty
                ) {
                    return compare(
                        leftProperty,
                        rightProperty
                    );
                }
            );
        }

        leftStack.pop();
        rightStack.pop();

        return result;

    }

    return compare(left, right);

}
/******************************************************************************
 * Section 9 — Collection Utilities
 ******************************************************************************/

/**
 * Returns the size of a collection.
 *
 * Supports arrays, strings, array-like objects, plain objects,
 * Map, Set, and other iterable collections.
 *
 * Null and undefined return 0.
 *
 * @param {*} value
 * @returns {number}
 */
function size(value) {

    if (!isDefined(value)) {
        return 0;
    }

    if (
        isString(value) ||
        isArray(value)
    ) {
        return value.length;
    }

    if (
        isMap(value) ||
        isSet(value)
    ) {
        return value.size;
    }

    if (isPlainObject(value)) {
        return keys(value).length;
    }

    if (
        typeof value.length === "number" &&
        value.length >= 0
    ) {
        return value.length;
    }

    if (
        isIterable(value)
    ) {

        var count = 0;

        for (const unused of value) {
            count += 1;
        }

        return count;

    }

    return 0;

}
/**
 * Returns whether a collection contains no values.
 *
 * Supports strings, arrays, array-like objects, plain objects,
 * Map, Set, and iterable collections.
 *
 * Null, undefined, and unsupported values are considered empty.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isEmpty(value) {

    return size(value) === 0;

}
/**
 * Returns the first value from a collection.
 *
 * Supports arrays, strings, array-like objects,
 * Map, Set, and iterable collections.
 *
 * Returns undefined when the collection is empty.
 *
 * @param {*} value
 * @returns {*}
 */
function first(value) {

    var iterator;
    var result;

    if (!isDefined(value)) {
        return undefined;
    }

    if (
        isString(value) ||
        isArray(value) ||
        (
            typeof value.length === "number" &&
            value.length > 0
        )
    ) {
        return value[0];
    }

    if (
        isMap(value) ||
        isSet(value)
    ) {

        iterator =
            value.values();

        result =
            iterator.next();

        return result.done
            ? undefined
            : result.value;

    }

    if (
        isIterable(value)
    ) {

        iterator =
            value[Symbol.iterator]();

        result =
            iterator.next();

        return result.done
            ? undefined
            : result.value;

    }

    return undefined;

}
/**
 * Returns the last value from a collection.
 *
 * Supports arrays, strings, array-like objects,
 * Map, Set, and iterable collections.
 *
 * Returns undefined when the collection is empty.
 *
 * @param {*} value
 * @returns {*}
 */
function last(value) {

    var iterator;
    var result;
    var lastValue;

    if (!isDefined(value)) {
        return undefined;
    }

    if (
        isString(value) ||
        isArray(value) ||
        (
            typeof value.length === "number" &&
            value.length > 0
        )
    ) {
        return value[value.length - 1];
    }

    if (
        isMap(value) ||
        isSet(value)
    ) {

        iterator = value.values();

        result = iterator.next();

        while (!result.done) {

            lastValue = result.value;

            result = iterator.next();

        }

        return lastValue;

    }

    if (
        isIterable(value)
    ) {

        lastValue = undefined;

        for (const item of value) {
            lastValue = item;
        }

        return lastValue;

    }

    return undefined;

}
/**
 * Returns the last value from a collection.
 *
 * Supports arrays, strings, array-like objects,
 * Map, Set, and iterable collections.
 *
 * Returns undefined when the collection is empty.
 *
 * @param {*} value
 * @returns {*}
 */
function last(value) {

    var iterator;
    var result;
    var lastValue;

    if (!isDefined(value)) {
        return undefined;
    }

    if (
        isString(value) ||
        isArray(value) ||
        (
            typeof value.length === "number" &&
            value.length > 0
        )
    ) {
        return value[value.length - 1];
    }

    if (
        isMap(value) ||
        isSet(value)
    ) {

        iterator = value.values();

        result = iterator.next();

        while (!result.done) {
            lastValue = result.value;
            result = iterator.next();
        }

        return lastValue;

    }

    if (
        isIterable(value)
    ) {

        iterator = value[Symbol.iterator]();

        result = iterator.next();

        while (!result.done) {
            lastValue = result.value;
            result = iterator.next();
        }

        return lastValue;

    }

    return undefined;

}
/**
 * Returns whether a collection contains a value.
 *
 * Uses SameValueZero comparison, so NaN matches NaN
 * and positive and negative zero are considered equal.
 *
 * Supports strings, arrays, array-like objects,
 * Map values, Set values, and iterable collections.
 *
 * @param {*} collection
 * @param {*} value
 * @returns {boolean}
 */
function contains(collection, value) {

    var index;
    var iterator;
    var result;

    if (!isDefined(collection)) {
        return false;
    }

    if (isString(collection)) {

        if (!isString(value)) {
            return false;
        }

        return collection.indexOf(value) !== -1;

    }

    if (isSet(collection)) {
        return collection.has(value);
    }

    if (
        isArray(collection) ||
        (
            typeof collection.length === "number" &&
            collection.length >= 0
        )
    ) {

        for (
            index = 0;
            index < collection.length;
            index += 1
        ) {
            if (
                sameValueZero(
                    collection[index],
                    value
                )
            ) {
                return true;
            }
        }

        return false;

    }

    if (isMap(collection)) {
        iterator = collection.values();
    } else if (isIterable(collection)) {
        iterator = collection[Symbol.iterator]();
    } else {
        return false;
    }

    result = iterator.next();

    while (!result.done) {

        if (
            sameValueZero(
                result.value,
                value
            )
        ) {
            return true;
        }

        result = iterator.next();

    }

    return false;

}
/**
 * Groups a collection by a key returned from an iteratee.
 *
 * @param {*} collection
 * @param {Function} iteratee
 * @returns {Object}
 */
function groupBy(collection, iteratee) {

    var result = {};
    var index = 0;
    var value;
    var key;

    if (!isFunction(iteratee)) {
        throw new TypeError(
            "groupBy iteratee must be a function."
        );
    }

    if (!isIterable(collection)) {
        return result;
    }

    for (value of collection) {

        key = iteratee(
            value,
            index,
            collection
        );

        if (
            !hasOwn(result, key)
        ) {
            result[key] = [];
        }

        result[key].push(value);

        index += 1;

    }

    return result;

}
/**
 * Creates an object keyed by the value returned from an iteratee.
 *
 * If multiple values produce the same key, the last value wins.
 *
 * @param {*} collection
 * @param {Function} iteratee
 * @returns {Object}
 */
function keyBy(collection, iteratee) {

    var result = {};
    var index = 0;
    var value;
    var key;

    if (!isFunction(iteratee)) {
        throw new TypeError(
            "keyBy iteratee must be a function."
        );
    }

    if (!isIterable(collection)) {
        return result;
    }

    for (value of collection) {

        key = iteratee(
            value,
            index,
            collection
        );

        result[key] = value;

        index += 1;

    }

    return result;

}
/**
 * Counts collection values by a key returned from an iteratee.
 *
 * @param {*} collection
 * @param {Function} iteratee
 * @returns {Object}
 */
function countBy(collection, iteratee) {

    var result = {};
    var index = 0;
    var value;
    var key;

    if (!isFunction(iteratee)) {
        throw new TypeError(
            "countBy iteratee must be a function."
        );
    }

    if (!isIterable(collection)) {
        return result;
    }

    for (value of collection) {

        key = iteratee(
            value,
            index,
            collection
        );

        if (!hasOwn(result, key)) {
            result[key] = 0;
        }

        result[key] += 1;

        index += 1;

    }

    return result;

}
/******************************************************************************
 * Section 10 — Function Utilities
 ******************************************************************************/

/**
 * Returns the supplied value unchanged.
 *
 * @param {*} value
 * @returns {*}
 */
function identity(value) {

    return value;

}
/**
 * Performs no operation.
 *
 * @returns {undefined}
 */
function noop() {

    return;

}
/**
 * Creates a function that always returns the same value.
 *
 * @param {*} value
 * @returns {Function}
 */
function constant(value) {

    return function constantFunction() {

        return value;

    };

}
/**
 * Creates a function that invokes the supplied function only once.
 *
 * Subsequent calls return the result of the first invocation.
 *
 * @param {Function} callback
 * @returns {Function}
 */
function once(callback) {

    var called = false;
    var result;

    if (!isFunction(callback)) {
        throw new TypeError(
            "once callback must be a function."
        );
    }

    return function invokeOnce() {

        if (!called) {

            result = callback.apply(
                this,
                arguments
            );

            called = true;

        }

        return result;

    };

}
/**
 * Creates a function that invokes the supplied function
 * after it has been called a specified number of times.
 *
 * @param {number} count
 * @param {Function} callback
 * @returns {Function}
 */
function after(count, callback) {

    var remaining;

    if (
        !isNumber(count) ||
        count < 0
    ) {
        throw new TypeError(
            "after count must be a non-negative number."
        );
    }

    if (!isFunction(callback)) {
        throw new TypeError(
            "after callback must be a function."
        );
    }

    remaining = Math.floor(count);

    return function invokeAfter() {

        remaining -= 1;

        if (remaining < 0) {
            return callback.apply(
                this,
                arguments
            );
        }

    };

}
/**
 * Creates a function that invokes the supplied function
 * while it has been called fewer than a specified number
 * of times.
 *
 * After the limit is reached, the result from the final
 * invocation is returned for all subsequent calls.
 *
 * @param {number} count
 * @param {Function} callback
 * @returns {Function}
 */
function before(count, callback) {

    var remaining;
    var result;

    if (
        !isNumber(count) ||
        count < 0
    ) {
        throw new TypeError(
            "before count must be a non-negative number."
        );
    }

    if (!isFunction(callback)) {
        throw new TypeError(
            "before callback must be a function."
        );
    }

    remaining = Math.floor(count);

    return function invokeBefore() {

        if (remaining > 0) {

            remaining -= 1;

            result = callback.apply(
                this,
                arguments
            );

        }

        return result;

    };

}
/**
 * Creates a function that composes callbacks from right to left.
 *
 * The rightmost callback receives all supplied arguments.
 * Each remaining callback receives the previous result.
 *
 * When no callbacks are supplied, identity is returned.
 *
 * @param {...Function} callbacks
 * @returns {Function}
 */
function compose() {

    var callbacks =
        Array.prototype.slice.call(arguments);

    callbacks.forEach(
        function validateCallback(callback) {

            if (!isFunction(callback)) {
                throw new TypeError(
                    "compose callbacks must be functions."
                );
            }

        }
    );

    if (callbacks.length === 0) {
        return identity;
    }

    return function invokeComposition() {

        var index =
            callbacks.length - 1;

        var result =
            callbacks[index].apply(
                this,
                arguments
            );

        for (
            index -= 1;
            index >= 0;
            index -= 1
        ) {
            result = callbacks[index].call(
                this,
                result
            );
        }

        return result;

    };

}
/**
 * Creates a function that pipes callbacks from left to right.
 *
 * The leftmost callback receives all supplied arguments.
 * Each remaining callback receives the previous result.
 *
 * When no callbacks are supplied, identity is returned.
 *
 * @param {...Function} callbacks
 * @returns {Function}
 */
function pipe() {

    var callbacks =
        Array.prototype.slice.call(arguments);

    callbacks.forEach(
        function validateCallback(callback) {

            if (!isFunction(callback)) {
                throw new TypeError(
                    "pipe callbacks must be functions."
                );
            }

        }
    );

    if (callbacks.length === 0) {
        return identity;
    }

    return function invokePipeline() {

        var index = 0;

        var result =
            callbacks[index].apply(
                this,
                arguments
            );

        for (
            index = 1;
            index < callbacks.length;
            index += 1
        ) {
            result = callbacks[index].call(
                this,
                result
            );
        }

        return result;

    };

}
/******************************************************************************
 * Section 10B — Identity, Safe Execution, and Performance Utilities
 ******************************************************************************/

/**
 * Generates an RFC 4122 version 4 compatible UUID.
 *
 * Cryptographically secure random values are used when the runtime exposes
 * `crypto.getRandomValues`. A deterministic-format Math.random fallback keeps
 * the helper available in older browsers and isolated Node test contexts.
 *
 * @returns {string}
 */
function uuid() {
    var cryptoObject = global.crypto;
    var bytes;
    var index;

    if (
        cryptoObject &&
        isFunction(cryptoObject.randomUUID)
    ) {
        return cryptoObject.randomUUID();
    }

    bytes = new Uint8Array(16);

    if (
        cryptoObject &&
        isFunction(cryptoObject.getRandomValues)
    ) {
        cryptoObject.getRandomValues(bytes);
    } else {
        for (index = 0; index < bytes.length; index += 1) {
            bytes[index] = Math.floor(Math.random() * 256);
        }
    }

    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;

    return Array.prototype.map.call(
        bytes,
        function formatByte(value, byteIndex) {
            var hexadecimal = value.toString(16).padStart(2, "0");

            if (
                byteIndex === 4 ||
                byteIndex === 6 ||
                byteIndex === 8 ||
                byteIndex === 10
            ) {
                return "-" + hexadecimal;
            }

            return hexadecimal;
        }
    ).join("");
}

/**
 * Executes a callback and converts success or failure into a structured result.
 *
 * Both synchronous values and Promises are supported. Exceptions are retained
 * as Error objects so callers can inspect stack and custom properties without
 * losing fidelity.
 *
 * @param {Function} callback
 * @param {Object} [options]
 * @param {*} [options.fallback]
 * @param {Object} [options.metadata]
 * @returns {Promise<Object>}
 */
async function safeExecute(callback, options) {
    var startedAt;
    var result;
    var normalizedOptions = isPlainObject(options)
        ? options
        : {};
    var metadata = isPlainObject(normalizedOptions.metadata)
        ? deepClone(normalizedOptions.metadata)
        : {};

    if (!isFunction(callback)) {
        throw new TypeError(
            "safeExecute callback must be a function."
        );
    }

    startedAt = Date.now();

    try {
        result = await callback();

        return deepFreeze({
            ok: true,
            value: result,
            error: null,
            durationMilliseconds: Date.now() - startedAt,
            metadata: metadata
        });
    } catch (error) {
        return deepFreeze({
            ok: false,
            value: owns(normalizedOptions, "fallback")
                ? normalizedOptions.fallback
                : undefined,
            error: error,
            durationMilliseconds: Date.now() - startedAt,
            metadata: metadata
        });
    }
}

/**
 * Measures an operation and returns its value with timing metadata.
 *
 * @param {Function} callback
 * @param {Object} [options]
 * @param {string} [options.label]
 * @param {Object} [options.metadata]
 * @returns {Promise<Object>}
 */
async function benchmark(callback, options) {
    var normalizedOptions = isPlainObject(options)
        ? options
        : {};
    var label = isNonEmptyString(normalizedOptions.label)
        ? String(normalizedOptions.label).trim()
        : "operation";
    var startedAt;
    var startedEpoch;
    var value;
    var duration;
    var performanceObject = global.performance;

    if (!isFunction(callback)) {
        throw new TypeError(
            "benchmark callback must be a function."
        );
    }

    startedEpoch = Date.now();
    startedAt = performanceObject && isFunction(performanceObject.now)
        ? performanceObject.now()
        : startedEpoch;

    value = await callback();

    duration = (
        performanceObject &&
        isFunction(performanceObject.now)
    )
        ? performanceObject.now() - startedAt
        : Date.now() - startedAt;

    return deepFreeze({
        label: label,
        value: value,
        startedAt: new Date(startedEpoch).toISOString(),
        durationMilliseconds: duration,
        metadata: isPlainObject(normalizedOptions.metadata)
            ? deepClone(normalizedOptions.metadata)
            : {}
    });
}

/**
 * Creates an independently controlled elapsed-time tracker.
 *
 * @param {string} [label]
 * @returns {Object}
 */
function createStopwatch(label) {
    var performanceObject = global.performance;
    var now = performanceObject && isFunction(performanceObject.now)
        ? function highResolutionNow() {
            return performanceObject.now();
        }
        : function epochNow() {
            return Date.now();
        };
    var startedAt = now();
    var accumulated = 0;
    var running = true;
    var stopwatchLabel = isNonEmptyString(label)
        ? String(label).trim()
        : "stopwatch";

    function elapsed() {
        return accumulated + (
            running
                ? now() - startedAt
                : 0
        );
    }

    return Object.freeze({
        label: stopwatchLabel,
        elapsed: elapsed,
        stop: function stop() {
            if (running) {
                accumulated += now() - startedAt;
                running = false;
            }

            return accumulated;
        },
        start: function start() {
            if (!running) {
                startedAt = now();
                running = true;
            }

            return elapsed();
        },
        reset: function reset() {
            accumulated = 0;
            startedAt = now();
            running = true;

            return 0;
        },
        isRunning: function isRunning() {
            return running;
        }
    });
}

assign(Utilities, {
    uuid: uuid,
    safeExecute: safeExecute,
    benchmark: benchmark,
    createStopwatch: createStopwatch
});

/******************************************************************************
 * Section 11 — Promise & Async Utilities
 ******************************************************************************/

/**
 * Returns a Promise that resolves after the specified delay.
 *
 * @param {number} milliseconds
 * @param {*} [value]
 * @returns {Promise<*>}
 */
function sleep(milliseconds, value) {

    if (
        !isNumber(milliseconds) ||
        !Number.isFinite(milliseconds) ||
        milliseconds < 0
    ) {
        throw new TypeError(
            "sleep milliseconds must be a finite non-negative number."
        );
    }
    
    milliseconds = Math.floor(milliseconds);

    return new Promise(
        function resolveAfterDelay(resolve) {

            setTimeout(
                function () {
                    resolve(value);
                },
                milliseconds
            );

        }
    );

}
/**
 * Rejects when a promise does not settle within the specified time.
 *
 * Non-Promise values are resolved normally.
 * Timing out does not cancel the underlying operation.
 *
 * @param {*} value
 * @param {number} milliseconds
 * @param {string} [message]
 * @returns {Promise<*>}
 */
function timeout(value, milliseconds, message) {

    if (
        !isNumber(milliseconds) ||
        !Number.isFinite(milliseconds) ||
        milliseconds < 0
    ) {
        throw new TypeError(
            "timeout milliseconds must be a finite non-negative number."
        );
    }

    milliseconds = Math.floor(milliseconds);

    return new Promise(
        function enforceTimeout(resolve, reject) {

            var timer = setTimeout(
                function rejectOnTimeout() {

                    reject(
                        new Error(
                            isDefined(message)
                                ? String(message)
                                : "Operation timed out."
                        )
                    );

                },
                milliseconds
            );

            Promise.resolve(value).then(
                function resolveValue(result) {

                    clearTimeout(timer);
                    resolve(result);

                },
                function rejectValue(error) {

                    clearTimeout(timer);
                    reject(error);

                }
            );

        }
    );

}
/**
 * Retries an asynchronous operation until it succeeds or the
 * maximum number of attempts has been reached.
 *
 * @param {Function} callback
 * @param {number} attempts
 * @param {number} [delayMilliseconds]
 * @returns {Promise<*>}
 */
async function retry(
    callback,
    attempts,
    delayMilliseconds
) {

    var attempt;
    var error;

    if (!isFunction(callback)) {
        throw new TypeError(
            "retry callback must be a function."
        );
    }

    if (
        !isNumber(attempts) ||
        attempts < 1
    ) {
        throw new TypeError(
            "retry attempts must be at least 1."
        );
    }

    attempts = Math.floor(attempts);

    if (!isDefined(delayMilliseconds)) {
        delayMilliseconds = 0;
    }

    if (
        !isNumber(delayMilliseconds) ||
        delayMilliseconds < 0
    ) {
        throw new TypeError(
            "retry delayMilliseconds must be a non-negative number."
        );
    }

    delayMilliseconds =
        Math.floor(delayMilliseconds);

    for (
        attempt = 1;
        attempt <= attempts;
        attempt += 1
    ) {

        try {

            return await callback(
                attempt
            );

        } catch (exception) {

            error = exception;

            if (
                attempt < attempts &&
                delayMilliseconds > 0
            ) {
                await sleep(
                    delayMilliseconds
);
            }

        }

    }

    throw error;

}
/**
 * Waits until a predicate returns a truthy value.
 *
 * The predicate may return a value or a Promise.
 * Its truthy result is returned when the condition succeeds.
 *
 * @param {Function} predicate
 * @param {number} [intervalMilliseconds]
 * @param {number} [timeoutMilliseconds]
 * @returns {Promise<*>}
 */
    async function waitUntil(
        predicate,
        intervalMilliseconds,
        timeoutMilliseconds
    ) {
        var startedAt;
        var elapsed;
        var result;

        if (!isFunction(predicate)) {
            throw new TypeError(
                "waitUntil predicate must be a function."
            );
        }

        if (!isDefined(intervalMilliseconds)) {
            intervalMilliseconds = 50;
        }

        if (
            !isNumber(intervalMilliseconds) ||
            !Number.isFinite(intervalMilliseconds) ||
            intervalMilliseconds < 0
        ) {
            throw new TypeError(
                "waitUntil intervalMilliseconds must be a finite non-negative number."
            );
        }

        if (!isDefined(timeoutMilliseconds)) {
            timeoutMilliseconds = 5000;
        }

        if (
            !isNumber(timeoutMilliseconds) ||
            !Number.isFinite(timeoutMilliseconds) ||
            timeoutMilliseconds < 0
        ) {
            throw new TypeError(
                "waitUntil timeoutMilliseconds must be a finite non-negative number."
            );
        }

        intervalMilliseconds =
            Math.floor(intervalMilliseconds);

        timeoutMilliseconds =
            Math.floor(timeoutMilliseconds);

        startedAt = Date.now();

        while (true) {
            result = await predicate();

            if (result) {
                return result;
            }

            elapsed =
                Date.now() - startedAt;

            if (
                elapsed >=
                timeoutMilliseconds
            ) {
                throw new Error(
                    "waitUntil timed out."
                );
            }

            await sleep(
                Math.min(
                    intervalMilliseconds,
                    Math.max(
                        0,
                        timeoutMilliseconds - elapsed
                    )
                )
            );
        }
    } 
/******************************************************************************
 * Section 11 Public Assignment
 ******************************************************************************/

assign(Utilities, {
    sleep: sleep,
    timeout: timeout,
    retry: retry,
    waitUntil: waitUntil
});

/******************************************************************************
 * Finalization and Registration
 ******************************************************************************/

Object.freeze(Utilities);
IronDisciple.register("Utilities", Utilities);

}(typeof globalThis !== "undefined" ? globalThis : window));
