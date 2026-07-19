/**
 * Iron Disciple OS
 * Core Runtime Integration
 *
 * Loads after bootstrap, constants, and utilities. This bridge verifies the
 * required core modules before the legacy application starts. It intentionally
 * does not change application state or replace existing app helpers yet.
 */
(function initializeIronDiscipleCoreIntegration(global) {
    "use strict";

    if (!global || !global.IronDisciple) {
        throw new Error(
            "Iron Disciple core integration requires core/bootstrap.js."
        );
    }

    var IronDisciple = global.IronDisciple;

    IronDisciple.ready(
        function markCoreReady(namespace) {
            var status = Object.freeze({
                ready: true,
                version: "1.0.0",
                modules: Object.freeze([
                    "Constants",
                    "Utilities"
                ]),
                initializedAt: new Date().toISOString()
            });

            namespace.Core = status;

            if (
                global.document &&
                typeof global.CustomEvent === "function" &&
                typeof global.document.dispatchEvent === "function"
            ) {
                global.document.dispatchEvent(
                    new global.CustomEvent(
                        "iron-disciple:core-ready",
                        {
                            detail: status
                        }
                    )
                );
            }

            return status;
        },
        {
            modules: [
                "Constants",
                "Utilities"
            ]
        }
    );
}(typeof window !== "undefined" ? window : globalThis));
