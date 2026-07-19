/**
 * Iron Disciple OS — Life Orchestrator
 * Task 6.1.1.1: Module Bootstrap
 *
 * Establishes the non-invasive runtime foundation for Phase 6. The bootstrap
 * intentionally contains no planning, scheduling, or optimization business
 * logic. It provides lifecycle control, environment detection, dependency
 * discovery, capability validation, immutable metadata, and structured health
 * reporting for later Life Orchestrator subsystems.
 *
 * @version 6.1.1
 */
(function universalModuleDefinition(root, factory) {
  const api = factory(root);

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else if (root && typeof root === 'object') {
    Object.defineProperty(root, 'IronLife', {
      value: api,
      enumerable: true,
      configurable: true,
      writable: false
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createIronLife(root) {
  'use strict';

  const VERSION = '6.1.1';
  const BUILD = 'life-orchestrator-bootstrap';
  const MODULE_NAME = 'IronLife';
  const AUTHOR = 'Iron Disciple';
  const STATE_VERSION = 1;
  const DEFAULT_TIMEOUT_MS = 5000;
  const MAX_RETRIES = 3;
  const EVENT_LIMIT = 1000;
  const CACHE_PREFIX = 'iron-disciple-life';

  const LifecycleState = Object.freeze({
    CREATED: 'created',
    INITIALIZING: 'initializing',
    READY: 'ready',
    DEGRADED: 'degraded',
    SHUTTING_DOWN: 'shutting-down',
    STOPPED: 'stopped',
    FAILED: 'failed'
  });

  const Severity = Object.freeze({
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
  });

  const DependencyState = Object.freeze({
    AVAILABLE: 'available',
    MISSING: 'missing',
    INVALID: 'invalid'
  });

  const EnvironmentType = Object.freeze({
    BROWSER: 'browser',
    PWA: 'pwa',
    SERVICE_WORKER: 'service-worker',
    NODE: 'node',
    UNKNOWN: 'unknown'
  });

  const DEPENDENCY_DEFINITIONS = Object.freeze([
    Object.freeze({ key: 'missionControl', global: 'IronMissionControl', required: false }),
    Object.freeze({ key: 'decisionEngine', global: 'IronDecision', required: false }),
    Object.freeze({ key: 'humanPerformance', global: 'IronPerformance', required: false }),
    Object.freeze({ key: 'predictiveAnalytics', global: 'IronPredict', required: false }),
    Object.freeze({ key: 'aiCoach', global: 'IronCoach', required: false }),
    Object.freeze({ key: 'personalKnowledge', global: 'IronKnowledge', required: false }),
    Object.freeze({ key: 'nutrition', global: 'IronNutrition', required: false }),
    Object.freeze({ key: 'training', global: 'IronTraining', required: false })
  ]);

  const DEFAULT_CONFIG = deepFreeze({
    debug: false,
    strictDependencies: false,
    autoInitialize: false,
    diagnostics: {
      retainChecks: 100,
      includeDependencyDetails: true
    },
    persistence: {
      enabled: true,
      storageKey: `${CACHE_PREFIX}:bootstrap`,
      stateVersion: STATE_VERSION
    },
    retry: {
      attempts: MAX_RETRIES,
      timeoutMs: DEFAULT_TIMEOUT_MS
    },
    limits: {
      eventHistory: EVENT_LIMIT
    }
  });

  const runtime = {
    lifecycle: LifecycleState.CREATED,
    initializedAt: null,
    stoppedAt: null,
    lastHealthCheckAt: null,
    initializationCount: 0,
    config: DEFAULT_CONFIG,
    environment: null,
    dependencies: Object.create(null),
    validations: [],
    warnings: [],
    errors: []
  };

  function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== '[object Object]') return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
  }

  function deepClone(value, seen) {
    if (value === null || typeof value !== 'object') return value;
    if (value instanceof Date) return new Date(value.getTime());

    const references = seen || new WeakMap();
    if (references.has(value)) return references.get(value);

    if (Array.isArray(value)) {
      const output = [];
      references.set(value, output);
      value.forEach((entry) => output.push(deepClone(entry, references)));
      return output;
    }

    const output = {};
    references.set(value, output);
    Object.keys(value).forEach((key) => {
      output[key] = deepClone(value[key], references);
    });
    return output;
  }

  function deepFreeze(value, seen) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    const references = seen || new WeakSet();
    if (references.has(value)) return value;
    references.add(value);
    Object.getOwnPropertyNames(value).forEach((property) => {
      deepFreeze(value[property], references);
    });
    return Object.freeze(value);
  }

  function mergeConfig(base, override) {
    if (!isPlainObject(override)) return deepClone(base);
    const output = deepClone(base);
    Object.keys(override).forEach((key) => {
      const incoming = override[key];
      if (isPlainObject(incoming) && isPlainObject(output[key])) {
        output[key] = mergeConfig(output[key], incoming);
      } else if (incoming !== undefined) {
        output[key] = deepClone(incoming);
      }
    });
    return output;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function elapsedMs(start) {
    return Math.max(0, Date.now() - start);
  }

  function makeIssue(code, message, severity, details) {
    return deepFreeze({
      code,
      message,
      severity: severity || Severity.WARNING,
      details: details ? deepClone(details) : null,
      timestamp: nowIso()
    });
  }

  function trimDiagnostics() {
    const configured = Number(runtime.config.diagnostics.retainChecks);
    const limit = Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : 100;
    if (runtime.validations.length > limit) runtime.validations.splice(0, runtime.validations.length - limit);
    if (runtime.warnings.length > limit) runtime.warnings.splice(0, runtime.warnings.length - limit);
    if (runtime.errors.length > limit) runtime.errors.splice(0, runtime.errors.length - limit);
  }

  function safeStorageAvailable(storageName) {
    try {
      const storage = root && root[storageName];
      if (!storage || typeof storage.setItem !== 'function') return false;
      const probe = `${CACHE_PREFIX}:probe:${Date.now()}`;
      storage.setItem(probe, '1');
      storage.removeItem(probe);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function detectEnvironment() {
    const hasProcess = typeof process === 'object' && process && process.versions && process.versions.node;
    const hasWindow = typeof window === 'object' && window && window.window === window;
    const hasDocument = typeof document === 'object' && document;
    const isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined' && root instanceof ServiceWorkerGlobalScope;
    const displayModeStandalone = Boolean(
      hasWindow &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches
    );
    const iosStandalone = Boolean(hasWindow && window.navigator && window.navigator.standalone === true);

    let type = EnvironmentType.UNKNOWN;
    if (isServiceWorker) type = EnvironmentType.SERVICE_WORKER;
    else if (hasWindow && hasDocument && (displayModeStandalone || iosStandalone)) type = EnvironmentType.PWA;
    else if (hasWindow && hasDocument) type = EnvironmentType.BROWSER;
    else if (hasProcess) type = EnvironmentType.NODE;

    return deepFreeze({
      type,
      browser: type === EnvironmentType.BROWSER || type === EnvironmentType.PWA,
      pwa: type === EnvironmentType.PWA,
      serviceWorker: type === EnvironmentType.SERVICE_WORKER,
      node: type === EnvironmentType.NODE,
      online: root && root.navigator && typeof root.navigator.onLine === 'boolean' ? root.navigator.onLine : null,
      features: {
        localStorage: safeStorageAvailable('localStorage'),
        sessionStorage: safeStorageAvailable('sessionStorage'),
        indexedDB: Boolean(root && root.indexedDB),
        serviceWorker: Boolean(root && root.navigator && root.navigator.serviceWorker),
        cacheStorage: Boolean(root && root.caches),
        webCrypto: Boolean(root && root.crypto && typeof root.crypto.getRandomValues === 'function'),
        performance: Boolean(root && root.performance && typeof root.performance.now === 'function'),
        broadcastChannel: Boolean(root && root.BroadcastChannel)
      },
      detectedAt: nowIso()
    });
  }

  function dependencyVersion(instance) {
    if (!instance) return null;
    if (typeof instance.VERSION === 'string') return instance.VERSION;
    if (typeof instance.version === 'string') return instance.version;
    if (typeof instance.version === 'function') {
      try {
        const result = instance.version();
        if (typeof result === 'string') return result;
        if (result && typeof result.version === 'string') return result.version;
      } catch (_error) {
        return null;
      }
    }
    return null;
  }

  function inspectDependencies() {
    const results = Object.create(null);
    DEPENDENCY_DEFINITIONS.forEach((definition) => {
      const instance = root && root[definition.global];
      const available = Boolean(instance && (typeof instance === 'object' || typeof instance === 'function'));
      results[definition.key] = deepFreeze({
        key: definition.key,
        global: definition.global,
        required: definition.required,
        state: available ? DependencyState.AVAILABLE : DependencyState.MISSING,
        version: available ? dependencyVersion(instance) : null,
        detectedAt: nowIso()
      });
    });
    runtime.dependencies = results;
    return deepClone(results);
  }

  function validateRuntime() {
    const started = Date.now();
    const environment = runtime.environment || detectEnvironment();
    const dependencies = inspectDependencies();
    const checks = [];

    checks.push({
      id: 'environment-recognized',
      passed: environment.type !== EnvironmentType.UNKNOWN,
      severity: Severity.WARNING,
      message: environment.type !== EnvironmentType.UNKNOWN
        ? `Runtime detected as ${environment.type}.`
        : 'Runtime environment could not be identified.'
    });

    if (environment.browser || environment.pwa) {
      checks.push({
        id: 'document-api',
        passed: typeof document === 'object' && typeof document.createElement === 'function',
        severity: Severity.ERROR,
        message: 'Browser document API is available.'
      });
      checks.push({
        id: 'local-storage',
        passed: environment.features.localStorage,
        severity: Severity.WARNING,
        message: environment.features.localStorage
          ? 'Local storage is available.'
          : 'Local storage is unavailable; persistence must degrade gracefully.'
      });
      checks.push({
        id: 'indexed-db',
        passed: environment.features.indexedDB,
        severity: Severity.INFO,
        message: environment.features.indexedDB
          ? 'IndexedDB is available.'
          : 'IndexedDB is unavailable; advanced persistence will be disabled.'
      });
    }

    const missingRequired = Object.values(dependencies).filter((entry) => entry.required && entry.state !== DependencyState.AVAILABLE);
    checks.push({
      id: 'required-dependencies',
      passed: missingRequired.length === 0,
      severity: Severity.ERROR,
      message: missingRequired.length
        ? `Missing required dependencies: ${missingRequired.map((entry) => entry.global).join(', ')}.`
        : 'All required dependencies are available.'
    });

    const missingOptional = Object.values(dependencies).filter((entry) => !entry.required && entry.state !== DependencyState.AVAILABLE);
    checks.push({
      id: 'optional-dependencies',
      passed: missingOptional.length === 0,
      severity: Severity.INFO,
      message: missingOptional.length
        ? `${missingOptional.length} optional integration(s) are not currently available.`
        : 'All optional integrations are available.'
    });

    const normalizedChecks = checks.map((check) => deepFreeze({
      ...check,
      checkedAt: nowIso()
    }));

    runtime.validations.push(...normalizedChecks);
    normalizedChecks.filter((check) => !check.passed && check.severity !== Severity.INFO).forEach((check) => {
      runtime.warnings.push(makeIssue(`validation:${check.id}`, check.message, check.severity));
    });
    trimDiagnostics();

    const blocking = normalizedChecks.filter((check) => !check.passed && (check.severity === Severity.ERROR || check.severity === Severity.CRITICAL));
    return deepFreeze({
      ok: blocking.length === 0,
      degraded: normalizedChecks.some((check) => !check.passed),
      checks: normalizedChecks,
      dependencySummary: {
        available: Object.values(dependencies).filter((entry) => entry.state === DependencyState.AVAILABLE).length,
        missing: Object.values(dependencies).filter((entry) => entry.state === DependencyState.MISSING).length,
        requiredMissing: missingRequired.length
      },
      durationMs: elapsedMs(started),
      checkedAt: nowIso()
    });
  }

  function structuredResult(operation, ok, payload) {
    return deepFreeze({
      operation,
      ok: Boolean(ok),
      state: runtime.lifecycle,
      version: VERSION,
      timestamp: nowIso(),
      ...(payload ? deepClone(payload) : {})
    });
  }

  function initialize(options) {
    const started = Date.now();

    if (runtime.lifecycle === LifecycleState.INITIALIZING) {
      return structuredResult('initialize', false, {
        code: 'INITIALIZATION_IN_PROGRESS',
        message: 'Life Orchestrator initialization is already in progress.'
      });
    }

    if (runtime.lifecycle === LifecycleState.READY || runtime.lifecycle === LifecycleState.DEGRADED) {
      return structuredResult('initialize', true, {
        code: 'ALREADY_INITIALIZED',
        message: 'Life Orchestrator is already initialized.',
        initializedAt: runtime.initializedAt,
        durationMs: 0
      });
    }

    runtime.lifecycle = LifecycleState.INITIALIZING;

    try {
      runtime.config = deepFreeze(mergeConfig(DEFAULT_CONFIG, options || {}));
      runtime.environment = detectEnvironment();
      const validation = validateRuntime();

      if (!validation.ok && runtime.config.strictDependencies) {
        runtime.lifecycle = LifecycleState.FAILED;
        const issue = makeIssue(
          'INITIALIZATION_VALIDATION_FAILED',
          'Strict bootstrap validation failed.',
          Severity.ERROR,
          validation
        );
        runtime.errors.push(issue);
        trimDiagnostics();
        return structuredResult('initialize', false, {
          code: issue.code,
          message: issue.message,
          validation,
          durationMs: elapsedMs(started)
        });
      }

      runtime.lifecycle = validation.degraded ? LifecycleState.DEGRADED : LifecycleState.READY;
      runtime.initializedAt = nowIso();
      runtime.stoppedAt = null;
      runtime.initializationCount += 1;

      return structuredResult('initialize', true, {
        code: validation.degraded ? 'INITIALIZED_DEGRADED' : 'INITIALIZED',
        message: validation.degraded
          ? 'Life Orchestrator initialized with non-blocking limitations.'
          : 'Life Orchestrator initialized successfully.',
        validation,
        environment: runtime.environment,
        durationMs: elapsedMs(started)
      });
    } catch (error) {
      runtime.lifecycle = LifecycleState.FAILED;
      const issue = makeIssue(
        'INITIALIZATION_EXCEPTION',
        error && error.message ? error.message : 'Unexpected initialization failure.',
        Severity.CRITICAL,
        { name: error && error.name ? error.name : 'Error' }
      );
      runtime.errors.push(issue);
      trimDiagnostics();
      return structuredResult('initialize', false, {
        code: issue.code,
        message: issue.message,
        error: issue,
        durationMs: elapsedMs(started)
      });
    }
  }

  function shutdown(reason) {
    if (runtime.lifecycle === LifecycleState.STOPPED || runtime.lifecycle === LifecycleState.CREATED) {
      return structuredResult('shutdown', true, {
        code: 'ALREADY_STOPPED',
        message: 'Life Orchestrator is not running.'
      });
    }

    runtime.lifecycle = LifecycleState.SHUTTING_DOWN;
    runtime.stoppedAt = nowIso();
    runtime.lifecycle = LifecycleState.STOPPED;

    return structuredResult('shutdown', true, {
      code: 'SHUTDOWN_COMPLETE',
      message: 'Life Orchestrator shut down successfully.',
      reason: reason || 'manual',
      stoppedAt: runtime.stoppedAt
    });
  }

  function reset(options) {
    const preserveDiagnostics = Boolean(options && options.preserveDiagnostics);
    runtime.lifecycle = LifecycleState.CREATED;
    runtime.initializedAt = null;
    runtime.stoppedAt = null;
    runtime.lastHealthCheckAt = null;
    runtime.initializationCount = 0;
    runtime.config = DEFAULT_CONFIG;
    runtime.environment = null;
    runtime.dependencies = Object.create(null);
    if (!preserveDiagnostics) {
      runtime.validations.length = 0;
      runtime.warnings.length = 0;
      runtime.errors.length = 0;
    }

    return structuredResult('reset', true, {
      code: 'RESET_COMPLETE',
      message: 'Life Orchestrator bootstrap state was reset.',
      diagnosticsPreserved: preserveDiagnostics
    });
  }

  function status() {
    const dependencyValues = Object.values(runtime.dependencies);
    return deepFreeze({
      module: MODULE_NAME,
      version: VERSION,
      build: BUILD,
      state: runtime.lifecycle,
      ready: runtime.lifecycle === LifecycleState.READY || runtime.lifecycle === LifecycleState.DEGRADED,
      degraded: runtime.lifecycle === LifecycleState.DEGRADED,
      initializedAt: runtime.initializedAt,
      stoppedAt: runtime.stoppedAt,
      initializationCount: runtime.initializationCount,
      environment: runtime.environment ? deepClone(runtime.environment) : detectEnvironment(),
      dependencies: {
        total: DEPENDENCY_DEFINITIONS.length,
        available: dependencyValues.filter((entry) => entry.state === DependencyState.AVAILABLE).length,
        missing: dependencyValues.filter((entry) => entry.state === DependencyState.MISSING).length
      },
      warningCount: runtime.warnings.length,
      errorCount: runtime.errors.length,
      timestamp: nowIso()
    });
  }

  function version() {
    return deepFreeze({
      module: MODULE_NAME,
      version: VERSION,
      build: BUILD,
      stateVersion: STATE_VERSION,
      author: AUTHOR,
      api: '6.1.1-bootstrap'
    });
  }

  function health() {
    const started = Date.now();
    if (!runtime.environment) runtime.environment = detectEnvironment();
    const validation = validateRuntime();
    runtime.lastHealthCheckAt = nowIso();

    const healthyState = runtime.lifecycle === LifecycleState.READY || runtime.lifecycle === LifecycleState.DEGRADED;
    const ok = healthyState && validation.ok;
    const grade = !healthyState || !validation.ok
      ? 'unhealthy'
      : validation.degraded || runtime.warnings.length
        ? 'degraded'
        : 'healthy';

    return deepFreeze({
      module: MODULE_NAME,
      ok,
      grade,
      state: runtime.lifecycle,
      validation,
      warnings: deepClone(runtime.warnings),
      errors: deepClone(runtime.errors),
      dependencies: deepClone(runtime.dependencies),
      checkedAt: runtime.lastHealthCheckAt,
      durationMs: elapsedMs(started)
    });
  }

  function getDependency(key) {
    const definition = DEPENDENCY_DEFINITIONS.find((entry) => entry.key === key || entry.global === key);
    if (!definition) return null;
    const instance = root && root[definition.global];
    return instance || null;
  }

  const metadata = deepFreeze({
    name: MODULE_NAME,
    version: VERSION,
    build: BUILD,
    author: AUTHOR,
    stateVersion: STATE_VERSION,
    cachePrefix: CACHE_PREFIX,
    dependencies: DEPENDENCY_DEFINITIONS.map((entry) => entry.global),
    capabilities: [
      'lifecycle-management',
      'environment-detection',
      'dependency-discovery',
      'runtime-validation',
      'structured-health-reporting'
    ]
  });

  const api = {
    VERSION,
    BUILD,
    MODULE_NAME,
    AUTHOR,
    metadata,
    constants: deepFreeze({
      STATE_VERSION,
      DEFAULT_TIMEOUT_MS,
      MAX_RETRIES,
      EVENT_LIMIT,
      CACHE_PREFIX
    }),
    enums: deepFreeze({ LifecycleState, Severity, DependencyState, EnvironmentType }),
    defaultConfig: DEFAULT_CONFIG,
    initialize,
    shutdown,
    reset,
    status,
    version,
    health,
    validate: validateRuntime,
    detectEnvironment,
    inspectDependencies,
    getDependency
  };

  return deepFreeze(api);
});
