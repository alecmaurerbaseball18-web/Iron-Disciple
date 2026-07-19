/**
 * Iron Disciple OS
 * Core Event Bus
 *
 * Browser-native publish/subscribe system.
 */

(function initializeEventBus(global) {
    "use strict";

    var IronDisciple = global.IronDisciple;

    if (!IronDisciple) {
        throw new Error("Bootstrap must load before EventBus.");
    }

    var listeners = Object.create(null);

    function normalize(eventName) {
        if (typeof eventName !== "string") {
            throw new TypeError("Event name must be a string.");
        }

        eventName = eventName.trim();

        if (!eventName.length) {
            throw new Error("Event name cannot be empty.");
        }

        return eventName;
    }

    function on(eventName, callback) {

        eventName = normalize(eventName);

        if (typeof callback !== "function") {
            throw new TypeError("Callback must be a function.");
        }

        if (!listeners[eventName]) {
            listeners[eventName] = [];
        }

        listeners[eventName].push(callback);

        return function unsubscribe() {
            off(eventName, callback);
        };
    }

    function once(eventName, callback) {

        var unsubscribe = on(eventName, function () {

            unsubscribe();

            callback.apply(null, arguments);

        });

        return unsubscribe;
    }

    function off(eventName, callback) {

        eventName = normalize(eventName);

        var list = listeners[eventName];

        if (!list) {
            return;
        }

        listeners[eventName] = list.filter(function (listener) {
            return listener !== callback;
        });
    }

    function emit(eventName, payload) {

        eventName = normalize(eventName);

        var list = listeners[eventName];

        if (!list) {
            return;
        }

        list.slice().forEach(function (listener) {

            try {

                listener(payload);

            } catch (error) {

                console.error(
                    "Iron Disciple EventBus listener failed:",
                    error
                );

            }

        });

    }

    function clear(eventName) {

        if (eventName === undefined) {

            listeners = Object.create(null);
            return;

        }

        delete listeners[normalize(eventName)];

    }

    function listenerCount(eventName) {

        eventName = normalize(eventName);

        return listeners[eventName]
            ? listeners[eventName].length
            : 0;

    }

    var EventBus = Object.freeze({

        on: on,
        once: once,
        off: off,

        emit: emit,

        clear: clear,

        listenerCount: listenerCount

    });

    IronDisciple.EventBus = EventBus;

    IronDisciple.register(
        "EventBus",
        EventBus,
        {
            version: "1.0.0",
            dependencies: []
        }
    );

})(typeof window !== "undefined" ? window : globalThis);
