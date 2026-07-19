/**
 * Iron Disciple OS
 * Core Constants
 *
 * File: core/constants.js
 * Version: 1.0.0
 *
 * Purpose:
 * Provides the shared constants, enumerations, limits, defaults,
 * and schema metadata used by all Iron Disciple engines and providers.
 *
 * Runtime:
 * Browser-native JavaScript.
 *
 * Dependencies:
 * None.
 *
 * Global Export:
 * window.IronDisciple.Constants
 */

(function initializeIronDiscipleConstants(global) {
    "use strict";

    if (!global) {
        throw new Error(
            "Iron Disciple Constants could not initialize because no global object was available."
        );
    }

    /**
     * Creates a deeply frozen object.
     *
     * This prevents engines, providers, rules, or application code from
     * accidentally modifying global constants at runtime.
     *
     * @param {*} value
     * @returns {*}
     */
    function deepFreeze(value) {
        if (
            value === null ||
            typeof value !== "object" ||
            Object.isFrozen(value)
        ) {
            return value;
        }

        Object.getOwnPropertyNames(value).forEach(function freezeProperty(name) {
            deepFreeze(value[name]);
        });

        return Object.freeze(value);
    }

    /**
     * Creates the root namespace without destroying any previously loaded
     * Iron Disciple modules.
     */
    var IronDisciple = global.IronDisciple || {};

    /**
     * Product and schema metadata.
     */
    var VERSION = {
        PRODUCT_NAME: "Iron Disciple OS",
        PRODUCT_VERSION: "1.0.0",
        CONSTANTS_VERSION: "1.0.0",
        PROGRAM_ENGINE_VERSION: "1.0.0",
        MISSION_SCHEMA_VERSION: "1.0.0",
        PROFILE_SCHEMA_VERSION: "1.0.0",
        CONTEXT_SCHEMA_VERSION: "1.0.0",
        PROVIDER_SCHEMA_VERSION: "1.0.0",
        RULE_SCHEMA_VERSION: "1.0.0",
        DIAGNOSTICS_SCHEMA_VERSION: "1.0.0"
    };
    /**
     * Global diagnostics configuration.
     *
     * These values are consumed by every subsystem that performs
     * logging, health checks, profiling, or performance monitoring.
     */
    var DIAGNOSTICS = {
        ENABLED: true,
        LOG_LEVEL: "INFO",
        PERFORMANCE_MONITORING: true,
        HEALTH_CHECKS: true,
        ERROR_REPORTING: true,
        TRACE_EXECUTION: false,
        MAX_LOG_ENTRIES: 1000,
        MAX_ERROR_HISTORY: 250,
        SLOW_OPERATION_THRESHOLD_MS: 100,
        STORAGE_WARNING_PERCENT: 80
    };
    /**
     * Engine operating modes.
     */
    var ENGINE_MODE = {
        AUTO: "AUTO",
        LEGACY: "LEGACY",
        ADVANCED: "ADVANCED",
        SAFE: "SAFE"
    };

    /**
     * Engine lifecycle states.
     */
    var ENGINE_STATUS = {
        UNINITIALIZED: "UNINITIALIZED",
        READY: "READY",
        GENERATING: "GENERATING",
        VALIDATING: "VALIDATING",
        REPAIRING: "REPAIRING",
        DEGRADED: "DEGRADED",
        SAFE_MODE: "SAFE_MODE",
        FAILED: "FAILED"
    };

    /**
     * Mission lifecycle states.
     */
    var MISSION_STATUS = {
        DRAFT: "DRAFT",
        GENERATED: "GENERATED",
        VALIDATED: "VALIDATED",
        REPAIRED: "REPAIRED",
        CERTIFIED: "CERTIFIED",
        ACTIVE: "ACTIVE",
        COMPLETED: "COMPLETED",
        PARTIALLY_COMPLETED: "PARTIALLY_COMPLETED",
        DEFERRED: "DEFERRED",
        FAILED: "FAILED",
        CANCELLED: "CANCELLED"
    };

    /**
     * Supported objective categories.
     *
     * CUSTOM allows plugins to introduce new domains without changing
     * the core engine.
     */
    var CATEGORY = {
        BODY: "BODY",
        GOLF: "GOLF",
        SOFTBALL: "SOFTBALL",
        NUTRITION: "NUTRITION",
        FAMILY: "FAMILY",
        FAITH: "FAITH",
        CAREER: "CAREER",
        RECOVERY: "RECOVERY",
        PROJECT: "PROJECT",
        MINDSET: "MINDSET",
        FINANCE: "FINANCE",
        HOME: "HOME",
        LEARNING: "LEARNING",
        SERVICE: "SERVICE",
        CUSTOM: "CUSTOM"
    };

    /**
     * Objective role within a mission.
     */
    var OBJECTIVE_ROLE = {
        PRIMARY: "PRIMARY",
        SUPPORTING: "SUPPORTING",
        REQUIRED: "REQUIRED",
        OPTIONAL: "OPTIONAL",
        RECOVERY: "RECOVERY",
        FALLBACK: "FALLBACK"
    };

    /**
     * Objective execution state.
     */
    var OBJECTIVE_STATUS = {
        PROPOSED: "PROPOSED",
        SELECTED: "SELECTED",
        DEFERRED: "DEFERRED",
        BLOCKED: "BLOCKED",
        READY: "READY",
        IN_PROGRESS: "IN_PROGRESS",
        PAUSED: "PAUSED",
        COMPLETED: "COMPLETED",
        PARTIALLY_COMPLETED: "PARTIALLY_COMPLETED",
        SKIPPED: "SKIPPED",
        FAILED: "FAILED",
        CANCELLED: "CANCELLED"
    };

    /**
     * General priority levels.
     *
     * Numeric values are intentionally spaced apart so additional levels
     * can be inserted later without rewriting every rule.
     */
    var PRIORITY = {
        CRITICAL: 100,
        VERY_HIGH: 90,
        HIGH: 75,
        MEDIUM: 50,
        LOW: 25,
        VERY_LOW: 10,
        NONE: 0
    };

    /**
     * Candidate selection state.
     */
    var CANDIDATE_STATUS = {
        GENERATED: "GENERATED",
        NORMALIZED: "NORMALIZED",
        SCORED: "SCORED",
        SELECTED: "SELECTED",
        DEFERRED: "DEFERRED",
        REJECTED: "REJECTED",
        INVALID: "INVALID"
    };

    /**
     * Candidate disposition reasons.
     */
    var DISPOSITION_REASON = {
        SELECTED: "SELECTED",
        LOWER_SCORE: "LOWER_SCORE",
        TIME_BUDGET: "TIME_BUDGET",
        CONFLICT: "CONFLICT",
        DEPENDENCY: "DEPENDENCY",
        RULE_FAILURE: "RULE_FAILURE",
        INVALID: "INVALID",
        DUPLICATE: "DUPLICATE",
        PROVIDER_FAILURE: "PROVIDER_FAILURE",
        SAFETY: "SAFETY",
        RECOVERY: "RECOVERY",
        FALLBACK_REPLACED: "FALLBACK_REPLACED",
        UNKNOWN: "UNKNOWN"
    };

    /**
     * Dependency strength.
     */
    var DEPENDENCY_STRENGTH = {
        HARD: "HARD",
        SOFT: "SOFT"
    };

    /**
     * Dependency relationships.
     */
    var DEPENDENCY_TYPE = {
        REQUIRES: "REQUIRES",
        OPTIONAL: "OPTIONAL",
        RECOMMENDED: "RECOMMENDED",
        BLOCKING: "BLOCKING",
        PRECEDES: "PRECEDES",
        FOLLOWS: "FOLLOWS"
    };

    /**
     * Conflict classifications.
     */
    var CONFLICT_TYPE = {
        TIME: "TIME",
        EQUIPMENT: "EQUIPMENT",
        LOCATION: "LOCATION",
        RESOURCE: "RESOURCE",
        FATIGUE: "FATIGUE",
        RECOVERY: "RECOVERY",
        SKILL: "SKILL",
        SAFETY: "SAFETY",
        SCHEDULE: "SCHEDULE",
        DUPLICATE: "DUPLICATE",
        IDENTITY: "IDENTITY",
        CUSTOM: "CUSTOM"
    };

    /**
     * Conflict severity.
     */
    var CONFLICT_SEVERITY = {
        CRITICAL: "CRITICAL",
        HIGH: "HIGH",
        MEDIUM: "MEDIUM",
        LOW: "LOW",
        INFORMATIONAL: "INFORMATIONAL"
    };

    /**
     * Conflict resolution actions.
     */
    var CONFLICT_RESOLUTION = {
        KEEP_HIGHER_PRIORITY: "KEEP_HIGHER_PRIORITY",
        KEEP_REQUIRED: "KEEP_REQUIRED",
        DEFER_LOWER_PRIORITY: "DEFER_LOWER_PRIORITY",
        SHORTEN: "SHORTEN",
        SUBSTITUTE: "SUBSTITUTE",
        REORDER: "REORDER",
        REMOVE: "REMOVE",
        WARN: "WARN",
        IGNORE: "IGNORE",
        UNRESOLVED: "UNRESOLVED"
    };

    /**
     * Rule result classifications.
     */
    var RULE_RESULT = {
        PASS: "PASS",
        WARNING: "WARNING",
        MODIFICATION: "MODIFICATION",
        FAIL: "FAIL",
        SKIPPED: "SKIPPED",
        ERROR: "ERROR"
    };

    /**
     * Rule categories.
     */
    var RULE_CATEGORY = {
        SAFETY: "SAFETY",
        SCHEDULE: "SCHEDULE",
        IDENTITY: "IDENTITY",
        RECOVERY: "RECOVERY",
        FAMILY: "FAMILY",
        CONFLICT: "CONFLICT",
        TIME_BUDGET: "TIME_BUDGET",
        DEPENDENCY: "DEPENDENCY",
        PROVIDER: "PROVIDER",
        VALIDATION: "VALIDATION",
        CUSTOM: "CUSTOM"
    };

    /**
     * Validation result levels.
     */
    var VALIDATION_LEVEL = {
        VALID: "VALID",
        WARNING: "WARNING",
        ERROR: "ERROR",
        CRITICAL: "CRITICAL"
    };

    /**
     * Validation layers.
     */
    var VALIDATION_LAYER = {
        STRUCTURAL: "STRUCTURAL",
        LOGICAL: "LOGICAL",
        IDENTITY: "IDENTITY",
        SAFETY: "SAFETY",
        DEPENDENCY: "DEPENDENCY",
        CONFLICT: "CONFLICT",
        TIME_BUDGET: "TIME_BUDGET",
        INTEGRITY: "INTEGRITY"
    };

    /**
     * Repair priorities.
     */
    var REPAIR_PRIORITY = {
        CRITICAL: 100,
        HIGH: 75,
        MEDIUM: 50,
        LOW: 25,
        COSMETIC: 10
    };

    /**
     * Repair actions.
     */
    var REPAIR_ACTION = {
        ADD_DEFAULT: "ADD_DEFAULT",
        REMOVE_INVALID: "REMOVE_INVALID",
        NORMALIZE_VALUE: "NORMALIZE_VALUE",
        REASSIGN_ID: "REASSIGN_ID",
        CLAMP_VALUE: "CLAMP_VALUE",
        REMOVE_DUPLICATE: "REMOVE_DUPLICATE",
        REMOVE_CYCLE: "REMOVE_CYCLE",
        RESOLVE_CONFLICT: "RESOLVE_CONFLICT",
        SUBSTITUTE_OBJECTIVE: "SUBSTITUTE_OBJECTIVE",
        REDUCE_DURATION: "REDUCE_DURATION",
        DEFER_OBJECTIVE: "DEFER_OBJECTIVE",
        ENTER_SAFE_MODE: "ENTER_SAFE_MODE"
    };

    /**
     * Readiness classifications.
     */
    var READINESS_BAND = {
        CRITICAL: "CRITICAL",
        VERY_LOW: "VERY_LOW",
        LOW: "LOW",
        MODERATE: "MODERATE",
        HIGH: "HIGH",
        PEAK: "PEAK",
        UNKNOWN: "UNKNOWN"
    };

    /**
     * Intensity classifications.
     */
    var INTENSITY = {
        REST: "REST",
        VERY_LOW: "VERY_LOW",
        LOW: "LOW",
        MODERATE: "MODERATE",
        HIGH: "HIGH",
        VERY_HIGH: "VERY_HIGH",
        MAXIMUM: "MAXIMUM"
    };

    /**
     * Energy demand classifications.
     */
    var ENERGY_DEMAND = {
        NONE: "NONE",
        VERY_LOW: "VERY_LOW",
        LOW: "LOW",
        MODERATE: "MODERATE",
        HIGH: "HIGH",
        VERY_HIGH: "VERY_HIGH"
    };

    /**
     * Time flexibility.
     */
    var TIME_FLEXIBILITY = {
        FIXED: "FIXED",
        LIMITED: "LIMITED",
        FLEXIBLE: "FLEXIBLE",
        ANYTIME: "ANYTIME"
    };

    /**
     * Objective carry-forward policies.
     */
    var CARRY_FORWARD_POLICY = {
        EXPIRE: "EXPIRE",
        CARRY_FORWARD: "CARRY_FORWARD",
        REGENERATE: "REGENERATE",
        ESCALATE: "ESCALATE",
        MANUAL: "MANUAL"
    };

    /**
     * Provider health.
     */
    var PROVIDER_HEALTH = {
        UNKNOWN: "UNKNOWN",
        HEALTHY: "HEALTHY",
        DEGRADED: "DEGRADED",
        UNAVAILABLE: "UNAVAILABLE",
        DISABLED: "DISABLED"
    };

    /**
     * Provider execution modes.
     */
    var PROVIDER_MODE = {
        SYNCHRONOUS: "SYNCHRONOUS",
        ASYNCHRONOUS: "ASYNCHRONOUS",
        HYBRID: "HYBRID"
    };

    /**
     * Provider capabilities.
     */
    var PROVIDER_CAPABILITY = {
        GENERATE_CANDIDATES: "GENERATE_CANDIDATES",
        GENERATE_OBJECTIVE: "GENERATE_OBJECTIVE",
        ADAPTIVE_GENERATION: "ADAPTIVE_GENERATION",
        SUBSTITUTIONS: "SUBSTITUTIONS",
        READINESS_AWARE: "READINESS_AWARE",
        RECOVERY_AWARE: "RECOVERY_AWARE",
        SCHEDULE_AWARE: "SCHEDULE_AWARE",
        EQUIPMENT_AWARE: "EQUIPMENT_AWARE",
        LOCATION_AWARE: "LOCATION_AWARE",
        TRAVEL_AWARE: "TRAVEL_AWARE",
        WEATHER_AWARE: "WEATHER_AWARE",
        ASYNC: "ASYNC",
        EXPLAINABLE: "EXPLAINABLE"
    };

    /**
     * Diagnostic log levels.
     */
    var LOG_LEVEL = {
        TRACE: "TRACE",
        DEBUG: "DEBUG",
        INFO: "INFO",
        WARNING: "WARNING",
        ERROR: "ERROR",
        CRITICAL: "CRITICAL",
        NONE: "NONE"
    };

    /**
     * Diagnostic event categories.
     */
    var DIAGNOSTIC_EVENT = {
        ENGINE_INITIALIZED: "ENGINE_INITIALIZED",
        GENERATION_STARTED: "GENERATION_STARTED",
        GENERATION_COMPLETED: "GENERATION_COMPLETED",
        GENERATION_FAILED: "GENERATION_FAILED",
        INPUT_NORMALIZED: "INPUT_NORMALIZED",
        CONTEXT_BUILT: "CONTEXT_BUILT",
        PROVIDER_REGISTERED: "PROVIDER_REGISTERED",
        PROVIDER_UNREGISTERED: "PROVIDER_UNREGISTERED",
        PROVIDER_STARTED: "PROVIDER_STARTED",
        PROVIDER_COMPLETED: "PROVIDER_COMPLETED",
        PROVIDER_FAILED: "PROVIDER_FAILED",
        FALLBACK_PROVIDER_USED: "FALLBACK_PROVIDER_USED",
        CANDIDATE_GENERATED: "CANDIDATE_GENERATED",
        CANDIDATE_NORMALIZED: "CANDIDATE_NORMALIZED",
        CANDIDATE_REJECTED: "CANDIDATE_REJECTED",
        CANDIDATE_SCORED: "CANDIDATE_SCORED",
        RULE_APPLIED: "RULE_APPLIED",
        RULE_FAILED: "RULE_FAILED",
        DEPENDENCY_RESOLVED: "DEPENDENCY_RESOLVED",
        DEPENDENCY_FAILED: "DEPENDENCY_FAILED",
        CONFLICT_DETECTED: "CONFLICT_DETECTED",
        CONFLICT_RESOLVED: "CONFLICT_RESOLVED",
        OBJECTIVE_SELECTED: "OBJECTIVE_SELECTED",
        OBJECTIVE_DEFERRED: "OBJECTIVE_DEFERRED",
        VALIDATION_STARTED: "VALIDATION_STARTED",
        VALIDATION_COMPLETED: "VALIDATION_COMPLETED",
        VALIDATION_FAILED: "VALIDATION_FAILED",
        REPAIR_STARTED: "REPAIR_STARTED",
        REPAIR_APPLIED: "REPAIR_APPLIED",
        REPAIR_COMPLETED: "REPAIR_COMPLETED",
        REPAIR_EXHAUSTED: "REPAIR_EXHAUSTED",
        SAFE_MODE_ENTERED: "SAFE_MODE_ENTERED",
        BRIEFING_BUILT: "BRIEFING_BUILT",
        COMPATIBILITY_WARNING: "COMPATIBILITY_WARNING"
    };

    /**
     * Error codes used across engines.
     */
    var ERROR_CODE = {
        UNKNOWN: "UNKNOWN",
        INVALID_CONFIGURATION: "INVALID_CONFIGURATION",
        INVALID_PROFILE: "INVALID_PROFILE",
        INVALID_CONTEXT: "INVALID_CONTEXT",
        INVALID_GOAL: "INVALID_GOAL",
        INVALID_CANDIDATE: "INVALID_CANDIDATE",
        INVALID_OBJECTIVE: "INVALID_OBJECTIVE",
        INVALID_MISSION: "INVALID_MISSION",
        INVALID_PROVIDER: "INVALID_PROVIDER",
        INVALID_RULE: "INVALID_RULE",
        PROVIDER_NOT_FOUND: "PROVIDER_NOT_FOUND",
        PROVIDER_EXECUTION_FAILED: "PROVIDER_EXECUTION_FAILED",
        PROVIDER_TIMEOUT: "PROVIDER_TIMEOUT",
        RULE_EXECUTION_FAILED: "RULE_EXECUTION_FAILED",
        VALIDATION_FAILED: "VALIDATION_FAILED",
        REPAIR_FAILED: "REPAIR_FAILED",
        REPAIR_LIMIT_EXCEEDED: "REPAIR_LIMIT_EXCEEDED",
        DEPENDENCY_MISSING: "DEPENDENCY_MISSING",
        DEPENDENCY_CYCLE: "DEPENDENCY_CYCLE",
        CONFLICT_UNRESOLVED: "CONFLICT_UNRESOLVED",
        TIME_BUDGET_EXCEEDED: "TIME_BUDGET_EXCEEDED",
        SAFE_MODE_FAILED: "SAFE_MODE_FAILED",
        ASYNC_PROVIDER_IN_SYNC_PIPELINE: "ASYNC_PROVIDER_IN_SYNC_PIPELINE"
    };

    /**
     * Mission phase classifications.
     */
    var MISSION_PHASE = {
        FOUNDATION: "FOUNDATION",
        BUILD: "BUILD",
        PERFORMANCE: "PERFORMANCE",
        PEAK: "PEAK",
        RECOVERY: "RECOVERY",
        MAINTENANCE: "MAINTENANCE",
        TRANSITION: "TRANSITION",
        CUSTOM: "CUSTOM"
    };

    /**
     * Goal state.
     */
    var GOAL_STATUS = {
        PLANNED: "PLANNED",
        ACTIVE: "ACTIVE",
        PAUSED: "PAUSED",
        COMPLETED: "COMPLETED",
        CANCELLED: "CANCELLED",
        ARCHIVED: "ARCHIVED"
    };

    /**
     * Goal type.
     */
    var GOAL_TYPE = {
        OUTCOME: "OUTCOME",
        PERFORMANCE: "PERFORMANCE",
        PROCESS: "PROCESS",
        HABIT: "HABIT",
        MAINTENANCE: "MAINTENANCE",
        IDENTITY: "IDENTITY",
        CUSTOM: "CUSTOM"
    };

    /**
     * Goal horizon.
     */
    var GOAL_HORIZON = {
        TODAY: "TODAY",
        SHORT_TERM: "SHORT_TERM",
        MEDIUM_TERM: "MEDIUM_TERM",
        LONG_TERM: "LONG_TERM",
        LIFETIME: "LIFETIME"
    };

    /**
     * Identity roles.
     */
    var IDENTITY_ROLE = {
        DISCIPLE: "DISCIPLE",
        SPOUSE: "SPOUSE",
        PARENT: "PARENT",
        PROFESSIONAL: "PROFESSIONAL",
        ATHLETE: "ATHLETE",
        LEADER: "LEADER",
        STEWARD: "STEWARD",
        STUDENT: "STUDENT",
        FRIEND: "FRIEND",
        COMMUNITY_MEMBER: "COMMUNITY_MEMBER",
        CUSTOM: "CUSTOM"
    };

    /**
     * Mission integrity components.
     */
    var INTEGRITY_COMPONENT = {
        STRUCTURE: "STRUCTURE",
        IDENTITY: "IDENTITY",
        DEPENDENCY_HEALTH: "DEPENDENCY_HEALTH",
        CONFLICT_HEALTH: "CONFLICT_HEALTH",
        SAFETY: "SAFETY",
        CONTINUITY: "CONTINUITY",
        RECOVERY: "RECOVERY",
        FEASIBILITY: "FEASIBILITY",
        TIME_BUDGET: "TIME_BUDGET"
    };

    /**
     * Common source classifications.
     */
    var SOURCE_TYPE = {
        USER: "USER",
        PROFILE: "PROFILE",
        MISSION_ENGINE: "MISSION_ENGINE",
        PROGRAM_ENGINE: "PROGRAM_ENGINE",
        EXECUTION_ENGINE: "EXECUTION_ENGINE",
        PROVIDER: "PROVIDER",
        RULE: "RULE",
        FALLBACK: "FALLBACK",
        SYSTEM: "SYSTEM",
        LEGACY: "LEGACY"
    };

    /**
     * Result status for internal operations.
     */
    var OPERATION_STATUS = {
        SUCCESS: "SUCCESS",
        PARTIAL: "PARTIAL",
        FAILURE: "FAILURE",
        SKIPPED: "SKIPPED"
    };

    /**
     * Default scoring weights.
     *
     * These are deliberately centralized. The Scoring Engine will consume
     * these values but may receive configuration overrides.
     */
    var DEFAULT_SCORING_WEIGHTS = {
        BASE_PRIORITY: 1.0,
        GOAL_WEIGHT: 1.0,
        URGENCY: 0.8,
        CONTINUITY: 0.65,
        SCHEDULE_FIT: 0.75,
        READINESS: 0.7,
        RECOVERY_FIT: 0.8,
        REQUIREMENT: 1.2,
        OVERDUE: 0.9,
        IDENTITY_ALIGNMENT: 1.0,
        CONFLICT_PENALTY: 1.0,
        FATIGUE_PENALTY: 0.8,
        TIME_PENALTY: 0.6,
        DEPENDENCY_BONUS: 0.4,
        NON_NEGOTIABLE_BONUS: 1.5
    };

    /**
     * Default mission integrity weights.
     *
     * The values total 100.
     */
    var DEFAULT_INTEGRITY_WEIGHTS = {
        STRUCTURE: 15,
        IDENTITY: 15,
        DEPENDENCY_HEALTH: 10,
        CONFLICT_HEALTH: 10,
        SAFETY: 20,
        CONTINUITY: 10,
        RECOVERY: 10,
        FEASIBILITY: 5,
        TIME_BUDGET: 5
    };

    /**
     * Default thresholds.
     */
    var DEFAULT_THRESHOLDS = {
        MINIMUM_VALID_SCORE: 0,
        MAXIMUM_SCORE: 1000,
        MINIMUM_INTEGRITY_SCORE: 70,
        SAFE_MODE_INTEGRITY_SCORE: 50,
        READINESS_CRITICAL_MAX: 20,
        READINESS_VERY_LOW_MAX: 35,
        READINESS_LOW_MAX: 50,
        READINESS_MODERATE_MAX: 70,
        READINESS_HIGH_MAX: 85,
        READINESS_PEAK_MAX: 100,
        MAXIMUM_OBJECTIVES: 12,
        MINIMUM_OBJECTIVES: 1,
        MAXIMUM_CANDIDATES_PER_PROVIDER: 25,
        MAXIMUM_TOTAL_CANDIDATES: 250,
        MAXIMUM_RULES: 250,
        MAXIMUM_REPAIR_ATTEMPTS: 20,
        MAXIMUM_DEPENDENCY_DEPTH: 20,
        MAXIMUM_DIAGNOSTIC_EVENTS: 2000
    };

    /**
     * Default time settings expressed in minutes.
     */
    var DEFAULT_TIME = {
        DEFAULT_DAILY_BUDGET_MINUTES: 180,
        MINIMUM_OBJECTIVE_DURATION_MINUTES: 5,
        DEFAULT_OBJECTIVE_DURATION_MINUTES: 30,
        MAXIMUM_OBJECTIVE_DURATION_MINUTES: 480,
        DEFAULT_TRANSITION_MINUTES: 5,
        PROVIDER_TIMEOUT_MILLISECONDS: 5000
    };

    /**
     * Default compatibility settings.
     */
    var DEFAULT_COMPATIBILITY = {
        ENABLE_LEGACY_CONSTRUCTOR: true,
        ENABLE_LEGACY_OUTPUT: true,
        PRESERVE_LEGACY_TASK_NAMES: true,
        ACCEPT_UNKNOWN_CATEGORIES: true,
        EMIT_WARNINGS: true,
        MUTATE_INPUT: false
    };

    /**
     * Default diagnostics settings.
     */
    var DEFAULT_DIAGNOSTICS = {
        ENABLED: true,
        LOG_LEVEL: LOG_LEVEL.INFO,
        INCLUDE_PROVIDER_TIMINGS: true,
        INCLUDE_SCORING_BREAKDOWN: true,
        INCLUDE_RULE_RESULTS: true,
        INCLUDE_REPAIRS: true,
        INCLUDE_DEFERRED_OBJECTIVES: true,
        INCLUDE_INTEGRITY_HISTORY: true,
        INCLUDE_PIPELINE_SNAPSHOTS: false,
        INCLUDE_STACK_TRACES: false
    };

    /**
     * Default repair settings.
     */
    var DEFAULT_REPAIR = {
        ENABLED: true,
        MAX_ATTEMPTS: DEFAULT_THRESHOLDS.MAXIMUM_REPAIR_ATTEMPTS,
        ENTER_SAFE_MODE_ON_EXHAUSTION: true,
        REMOVE_INVALID_OBJECTIVES: true,
        NORMALIZE_OUT_OF_RANGE_VALUES: true,
        REASSIGN_DUPLICATE_IDS: true,
        REMOVE_DEPENDENCY_CYCLES: true,
        DEFER_CONFLICTING_OBJECTIVES: true,
        REDUCE_DURATION_TO_FIT_BUDGET: true
    };

    /**
     * Default provider settings.
     */
    var DEFAULT_PROVIDERS = {
        ENABLE_FALLBACK_PROVIDERS: true,
        FALLBACK_ON_PROVIDER_ERROR: true,
        ALLOW_MULTIPLE_PROVIDERS_PER_CATEGORY: true,
        MAX_CANDIDATES_PER_PROVIDER:
            DEFAULT_THRESHOLDS.MAXIMUM_CANDIDATES_PER_PROVIDER,
        PROVIDER_TIMEOUT_MILLISECONDS:
            DEFAULT_TIME.PROVIDER_TIMEOUT_MILLISECONDS,
        SKIP_ASYNC_PROVIDERS_IN_SYNC_MODE: true
    };

    /**
     * Default rule settings.
     */
    var DEFAULT_RULES = {
        ENABLED: true,
        ISOLATE_RULE_FAILURES: true,
        STOP_ON_CRITICAL_FAILURE: true,
        APPLY_MODIFICATIONS_IMMEDIATELY: true,
        MAX_RULES: DEFAULT_THRESHOLDS.MAXIMUM_RULES
    };

    /**
     * Default selection settings.
     */
    var DEFAULT_SELECTION = {
        DAILY_TIME_BUDGET_MINUTES:
            DEFAULT_TIME.DEFAULT_DAILY_BUDGET_MINUTES,
        MAXIMUM_OBJECTIVES: DEFAULT_THRESHOLDS.MAXIMUM_OBJECTIVES,
        MINIMUM_OBJECTIVES: DEFAULT_THRESHOLDS.MINIMUM_OBJECTIVES,
        ALWAYS_INCLUDE_REQUIRED_OBJECTIVES: true,
        ALLOW_BUDGET_OVERRUN_FOR_CRITICAL_OBJECTIVES: true,
        ENABLE_DYNAMIC_DURATION_REDUCTION: true,
        ENABLE_DEFERRED_LIST: true
    };

    /**
     * Complete Program Engine default options.
     *
     * Engines should clone this object before applying user overrides.
     */
    var DEFAULT_OPTIONS = {
        mode: ENGINE_MODE.AUTO,

        compatibility: {
            enableLegacyConstructor:
                DEFAULT_COMPATIBILITY.ENABLE_LEGACY_CONSTRUCTOR,
            enableLegacyOutput:
                DEFAULT_COMPATIBILITY.ENABLE_LEGACY_OUTPUT,
            preserveLegacyTaskNames:
                DEFAULT_COMPATIBILITY.PRESERVE_LEGACY_TASK_NAMES,
            acceptUnknownCategories:
                DEFAULT_COMPATIBILITY.ACCEPT_UNKNOWN_CATEGORIES,
            emitWarnings:
                DEFAULT_COMPATIBILITY.EMIT_WARNINGS,
            mutateInput:
                DEFAULT_COMPATIBILITY.MUTATE_INPUT
        },

        diagnostics: {
            enabled: DEFAULT_DIAGNOSTICS.ENABLED,
            logLevel: DEFAULT_DIAGNOSTICS.LOG_LEVEL,
            includeProviderTimings:
                DEFAULT_DIAGNOSTICS.INCLUDE_PROVIDER_TIMINGS,
            includeScoringBreakdown:
                DEFAULT_DIAGNOSTICS.INCLUDE_SCORING_BREAKDOWN,
            includeRuleResults:
                DEFAULT_DIAGNOSTICS.INCLUDE_RULE_RESULTS,
            includeRepairs:
                DEFAULT_DIAGNOSTICS.INCLUDE_REPAIRS,
            includeDeferredObjectives:
                DEFAULT_DIAGNOSTICS.INCLUDE_DEFERRED_OBJECTIVES,
            includeIntegrityHistory:
                DEFAULT_DIAGNOSTICS.INCLUDE_INTEGRITY_HISTORY,
            includePipelineSnapshots:
                DEFAULT_DIAGNOSTICS.INCLUDE_PIPELINE_SNAPSHOTS,
            includeStackTraces:
                DEFAULT_DIAGNOSTICS.INCLUDE_STACK_TRACES
        },

        providers: {
            enableFallbackProviders:
                DEFAULT_PROVIDERS.ENABLE_FALLBACK_PROVIDERS,
            fallbackOnProviderError:
                DEFAULT_PROVIDERS.FALLBACK_ON_PROVIDER_ERROR,
            allowMultipleProvidersPerCategory:
                DEFAULT_PROVIDERS.ALLOW_MULTIPLE_PROVIDERS_PER_CATEGORY,
            maxCandidatesPerProvider:
                DEFAULT_PROVIDERS.MAX_CANDIDATES_PER_PROVIDER,
            providerTimeoutMilliseconds:
                DEFAULT_PROVIDERS.PROVIDER_TIMEOUT_MILLISECONDS,
            skipAsyncProvidersInSyncMode:
                DEFAULT_PROVIDERS.SKIP_ASYNC_PROVIDERS_IN_SYNC_MODE
        },

        rules: {
            enabled: DEFAULT_RULES.ENABLED,
            isolateRuleFailures:
                DEFAULT_RULES.ISOLATE_RULE_FAILURES,
            stopOnCriticalFailure:
                DEFAULT_RULES.STOP_ON_CRITICAL_FAILURE,
            applyModificationsImmediately:
                DEFAULT_RULES.APPLY_MODIFICATIONS_IMMEDIATELY,
            maxRules: DEFAULT_RULES.MAX_RULES
        },

        scoring: {
            weights: DEFAULT_SCORING_WEIGHTS,
            minimumValidScore:
                DEFAULT_THRESHOLDS.MINIMUM_VALID_SCORE,
            maximumScore:
                DEFAULT_THRESHOLDS.MAXIMUM_SCORE
        },

        selection: {
            dailyTimeBudgetMinutes:
                DEFAULT_SELECTION.DAILY_TIME_BUDGET_MINUTES,
            maximumObjectives:
                DEFAULT_SELECTION.MAXIMUM_OBJECTIVES,
            minimumObjectives:
                DEFAULT_SELECTION.MINIMUM_OBJECTIVES,
            alwaysIncludeRequiredObjectives:
                DEFAULT_SELECTION.ALWAYS_INCLUDE_REQUIRED_OBJECTIVES,
            allowBudgetOverrunForCriticalObjectives:
                DEFAULT_SELECTION.ALLOW_BUDGET_OVERRUN_FOR_CRITICAL_OBJECTIVES,
            enableDynamicDurationReduction:
                DEFAULT_SELECTION.ENABLE_DYNAMIC_DURATION_REDUCTION,
            enableDeferredList:
                DEFAULT_SELECTION.ENABLE_DEFERRED_LIST
        },

        validation: {
            enabled: true,
            minimumIntegrityScore:
                DEFAULT_THRESHOLDS.MINIMUM_INTEGRITY_SCORE,
            rejectInvalidCandidates: true,
            rejectInvalidObjectives: true,
            requireUniqueIds: true,
            detectDependencyCycles: true,
            detectConflicts: true,
            enforceTimeBudget: true
        },

        repair: {
            enabled: DEFAULT_REPAIR.ENABLED,
            maxAttempts: DEFAULT_REPAIR.MAX_ATTEMPTS,
            enterSafeModeOnExhaustion:
                DEFAULT_REPAIR.ENTER_SAFE_MODE_ON_EXHAUSTION,
            removeInvalidObjectives:
                DEFAULT_REPAIR.REMOVE_INVALID_OBJECTIVES,
            normalizeOutOfRangeValues:
                DEFAULT_REPAIR.NORMALIZE_OUT_OF_RANGE_VALUES,
            reassignDuplicateIds:
                DEFAULT_REPAIR.REASSIGN_DUPLICATE_IDS,
            removeDependencyCycles:
                DEFAULT_REPAIR.REMOVE_DEPENDENCY_CYCLES,
            deferConflictingObjectives:
                DEFAULT_REPAIR.DEFER_CONFLICTING_OBJECTIVES,
            reduceDurationToFitBudget:
                DEFAULT_REPAIR.REDUCE_DURATION_TO_FIT_BUDGET
        },

        deterministic: true,
        strict: false,
        freezeOutput: false
    };

    /**
     * Legacy task names preserved for existing Iron Disciple behavior.
     */
    var LEGACY_TASK_NAMES = {
        BODY: "Strength Training",
        GOLF: "Golf Practice",
        SOFTBALL: "Softball Development",
        FAMILY: "Intentional Family Time",
        CAREER: "Professional Development",
        FAITH: "Faith and Spiritual Development",
        NUTRITION: "Nutrition Compliance",
        RECOVERY: "Recovery and Mobility",
        PROJECT: "Priority Project Work"
    };

    /**
     * Legacy default priorities.
     */
    var LEGACY_PRIORITIES = {
        BODY: PRIORITY.HIGH,
        GOLF: PRIORITY.MEDIUM,
        SOFTBALL: PRIORITY.MEDIUM,
        FAMILY: PRIORITY.HIGH,
        CAREER: PRIORITY.MEDIUM,
        FAITH: PRIORITY.HIGH,
        NUTRITION: PRIORITY.HIGH,
        RECOVERY: PRIORITY.MEDIUM,
        PROJECT: PRIORITY.LOW
    };

    /**
     * Category aliases used by the compatibility layer.
     */
    var CATEGORY_ALIASES = {
        WORKOUT: CATEGORY.BODY,
        FITNESS: CATEGORY.BODY,
        HEALTH: CATEGORY.BODY,
        STRENGTH: CATEGORY.BODY,
        EXERCISE: CATEGORY.BODY,

        DIET: CATEGORY.NUTRITION,
        FOOD: CATEGORY.NUTRITION,
        MEALS: CATEGORY.NUTRITION,

        SPIRITUAL: CATEGORY.FAITH,
        BIBLE: CATEGORY.FAITH,
        PRAYER: CATEGORY.FAITH,

        WORK: CATEGORY.CAREER,
        POLICE: CATEGORY.CAREER,
        PROFESSIONAL: CATEGORY.CAREER,

        REST: CATEGORY.RECOVERY,
        SLEEP: CATEGORY.RECOVERY,
        MOBILITY: CATEGORY.RECOVERY,

        HOME_PROJECT: CATEGORY.PROJECT,
        PROJECTS: CATEGORY.PROJECT,
        DIY: CATEGORY.PROJECT,

        EDUCATION: CATEGORY.LEARNING,
        STUDY: CATEGORY.LEARNING,

        MONEY: CATEGORY.FINANCE,
        BUDGET: CATEGORY.FINANCE
    };

    /**
     * Numeric limits.
     */
    var LIMITS = {
        PRIORITY_MIN: 0,
        PRIORITY_MAX: 100,
        PERCENT_MIN: 0,
        PERCENT_MAX: 100,
        DURATION_MINUTES_MIN:
            DEFAULT_TIME.MINIMUM_OBJECTIVE_DURATION_MINUTES,
        DURATION_MINUTES_MAX:
            DEFAULT_TIME.MAXIMUM_OBJECTIVE_DURATION_MINUTES,
        SCORE_MIN: DEFAULT_THRESHOLDS.MINIMUM_VALID_SCORE,
        SCORE_MAX: DEFAULT_THRESHOLDS.MAXIMUM_SCORE,
        MAXIMUM_OBJECTIVES:
            DEFAULT_THRESHOLDS.MAXIMUM_OBJECTIVES,
        MAXIMUM_CANDIDATES_PER_PROVIDER:
            DEFAULT_THRESHOLDS.MAXIMUM_CANDIDATES_PER_PROVIDER,
        MAXIMUM_TOTAL_CANDIDATES:
            DEFAULT_THRESHOLDS.MAXIMUM_TOTAL_CANDIDATES,
        MAXIMUM_RULES:
            DEFAULT_THRESHOLDS.MAXIMUM_RULES,
        MAXIMUM_REPAIR_ATTEMPTS:
            DEFAULT_THRESHOLDS.MAXIMUM_REPAIR_ATTEMPTS,
        MAXIMUM_DEPENDENCY_DEPTH:
            DEFAULT_THRESHOLDS.MAXIMUM_DEPENDENCY_DEPTH,
        MAXIMUM_DIAGNOSTIC_EVENTS:
            DEFAULT_THRESHOLDS.MAXIMUM_DIAGNOSTIC_EVENTS
    };

    /**
     * Reserved internal identifier prefixes.
     */
    var ID_PREFIX = {
        MISSION: "mission",
        OBJECTIVE: "objective",
        CANDIDATE: "candidate",
        GOAL: "goal",
        PROVIDER: "provider",
        RULE: "rule",
        CONFLICT: "conflict",
        DEPENDENCY: "dependency",
        REPAIR: "repair",
        VALIDATION: "validation",
        DIAGNOSTIC: "diagnostic"
    };

    /**
     * Public constants object.
     */
    var Constants = {
        VERSION: VERSION,

        ENGINE_MODE: ENGINE_MODE,
        ENGINE_STATUS: ENGINE_STATUS,
        MISSION_STATUS: MISSION_STATUS,

        
        CATEGORY: CATEGORY,
        CATEGORY_ALIASES: CATEGORY_ALIASES,

        OBJECTIVE_ROLE: OBJECTIVE_ROLE,
        OBJECTIVE_STATUS: OBJECTIVE_STATUS,

        PRIORITY: PRIORITY,
        CANDIDATE_STATUS: CANDIDATE_STATUS,
        DISPOSITION_REASON: DISPOSITION_REASON,

        DEPENDENCY_STRENGTH: DEPENDENCY_STRENGTH,
        DEPENDENCY_TYPE: DEPENDENCY_TYPE,

        CONFLICT_TYPE: CONFLICT_TYPE,
        CONFLICT_SEVERITY: CONFLICT_SEVERITY,
        CONFLICT_RESOLUTION: CONFLICT_RESOLUTION,

        RULE_RESULT: RULE_RESULT,
        RULE_CATEGORY: RULE_CATEGORY,

        VALIDATION_LEVEL: VALIDATION_LEVEL,
        VALIDATION_LAYER: VALIDATION_LAYER,

        REPAIR_PRIORITY: REPAIR_PRIORITY,
        REPAIR_ACTION: REPAIR_ACTION,

        READINESS_BAND: READINESS_BAND,
        INTENSITY: INTENSITY,
        ENERGY_DEMAND: ENERGY_DEMAND,
        TIME_FLEXIBILITY: TIME_FLEXIBILITY,

        CARRY_FORWARD_POLICY: CARRY_FORWARD_POLICY,

        PROVIDER_HEALTH: PROVIDER_HEALTH,
        PROVIDER_MODE: PROVIDER_MODE,
        PROVIDER_CAPABILITY: PROVIDER_CAPABILITY,

        LOG_LEVEL: LOG_LEVEL,
        DIAGNOSTIC_EVENT: DIAGNOSTIC_EVENT,

        ERROR_CODE: ERROR_CODE,
        DIAGNOSTICS: DIAGNOSTICS,
 RUNTIME_LIMITS: Object.freeze({
    MAX_EVENT_LOOP_BLOCK_MS: 50,
    MAX_RENDER_TIME_MS: 16,
    MAX_MEMORY_WARN_MB: 200,
    MAX_MEMORY_CRITICAL_MB: 350,
    MAX_STATE_HISTORY: 100,
    MAX_BACKGROUND_TASKS: 10,
    MAX_CONCURRENT_AI_TASKS: 3,
    MAX_CACHE_ITEMS: 500,
    CACHE_TTL_MS: 300000,
    AUTOSAVE_INTERVAL_MS: 30000,
    HEARTBEAT_INTERVAL_MS: 10000
}),

FEATURE_FLAGS: Object.freeze({

    // Core
    AI_COACH: true,
    MISSION_CONTROL: true,
    TRAINING_SYSTEM: true,
    NUTRITION_SYSTEM: true,
    KNOWLEDGE_ENGINE: true,
    LIFE_ORCHESTRATOR: true,
    PREDICTIVE_ANALYTICS: true,

    // UI
    ENABLE_ANIMATIONS: true,
    ENABLE_SOUND_EFFECTS: false,
    ENABLE_HAPTIC_FEEDBACK: true,
    ENABLE_SPLASH_SCREEN: true,
    ENABLE_DEV_CONSOLE: true,

    // Performance
    ENABLE_BACKGROUND_SYNC: true,
    ENABLE_CACHE: true,
    ENABLE_PREFETCH: true,
    ENABLE_PERFORMANCE_MONITOR: true,

    // Experimental
    ENABLE_EXPERIMENTAL_UI: false,
    ENABLE_BETA_FEATURES: false,
    ENABLE_DEBUG_TOOLS: false

}),

EVENTS: Object.freeze({

    /* Application */
    APP_INITIALIZED: "app:initialized",
    APP_READY: "app:ready",
    APP_SHUTDOWN: "app:shutdown",

    /* Navigation */
    VIEW_CHANGED: "view:changed",
    TAB_CHANGED: "tab:changed",
    MODAL_OPENED: "modal:opened",
    MODAL_CLOSED: "modal:closed",

    /* Storage */
    STORAGE_UPDATED: "storage:updated",
    STORAGE_CLEARED: "storage:cleared",

    /* Missions */
    MISSION_CREATED: "mission:created",
    MISSION_UPDATED: "mission:updated",
    MISSION_COMPLETED: "mission:completed",

    /* Training */
    WORKOUT_STARTED: "training:started",
    WORKOUT_COMPLETED: "training:completed",

    /* Nutrition */
    MEAL_LOGGED: "nutrition:mealLogged",
    WEIGHT_UPDATED: "nutrition:weightUpdated",

    /* AI */
    AI_RESPONSE: "ai:response",
    AI_ERROR: "ai:error",

    /* System */
    ERROR_OCCURRED: "system:error",
    WARNING_OCCURRED: "system:warning",
    PERFORMANCE_WARNING: "system:performanceWarning"

}),
        
        MISSION_PHASE: MISSION_PHASE,

        GOAL_STATUS: GOAL_STATUS,
        GOAL_TYPE: GOAL_TYPE,
        GOAL_HORIZON: GOAL_HORIZON,

        IDENTITY_ROLE: IDENTITY_ROLE,
        INTEGRITY_COMPONENT: INTEGRITY_COMPONENT,

        SOURCE_TYPE: SOURCE_TYPE,
        OPERATION_STATUS: OPERATION_STATUS,

        DEFAULT_SCORING_WEIGHTS: DEFAULT_SCORING_WEIGHTS,
        DEFAULT_INTEGRITY_WEIGHTS: DEFAULT_INTEGRITY_WEIGHTS,
        DEFAULT_THRESHOLDS: DEFAULT_THRESHOLDS,
        DEFAULT_TIME: DEFAULT_TIME,

        DEFAULT_COMPATIBILITY: DEFAULT_COMPATIBILITY,
        DEFAULT_DIAGNOSTICS: DEFAULT_DIAGNOSTICS,
        DEFAULT_REPAIR: DEFAULT_REPAIR,
        DEFAULT_PROVIDERS: DEFAULT_PROVIDERS,
        DEFAULT_RULES: DEFAULT_RULES,
        DEFAULT_SELECTION: DEFAULT_SELECTION,
        DEFAULT_OPTIONS: DEFAULT_OPTIONS,

        LEGACY_TASK_NAMES: LEGACY_TASK_NAMES,
        LEGACY_PRIORITIES: LEGACY_PRIORITIES,

        LIMITS: LIMITS,
        ID_PREFIX: ID_PREFIX
    };
/**
 * Freeze all exported values.
 */
deepFreeze(Constants);

/**
 * Expose the constants through the legacy global properties.
 */
IronDisciple.Constants = Constants;
IronDisciple.constants = Constants;

/**
 * Register the module with the Bootstrap registry.
 */
if (typeof IronDisciple.register === "function") {
    if (
        typeof IronDisciple.has !== "function" ||
        !IronDisciple.has("Constants")
    ) {
        IronDisciple.register(
            "Constants",
            Constants,
            {
                version: VERSION.CONSTANTS_VERSION,
                dependencies: []
            }
        );
    }
}

/**
 * Track loaded modules for diagnostics and dependency checks.
 */
IronDisciple.Modules = IronDisciple.Modules || {};
IronDisciple.Modules.Constants = {
    name: "Constants",
    version: VERSION.CONSTANTS_VERSION,
    loaded: true
};

global.IronDisciple = IronDisciple;
})(
    typeof window !== "undefined"
        ? window
        : globalThis
);
