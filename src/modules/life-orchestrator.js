/**
 * Iron Disciple OS — Life Orchestrator
 * Sprint 6.1.1, Task 6.1.1.2: Configuration System
 *
 * Provides the non-invasive runtime foundation for Phase 6 plus a validated,
 * immutable, versioned configuration layer. Planning, scheduling, and
 * optimization business logic remain intentionally out of scope.
 *
 * @version 6.1.2
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

  const VERSION = '6.1.2';
  const BUILD = 'life-orchestrator-configuration';
  const MODULE_NAME = 'IronLife';
  const AUTHOR = 'Iron Disciple';
  const STATE_VERSION = 1;
  const CONFIG_VERSION = 1;
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

  const ConfigurationSource = Object.freeze({
    DEFAULT: 'default',
    PERSISTED: 'persisted',
    INITIALIZE: 'initialize',
    RUNTIME: 'runtime',
    IMPORT: 'import',
    RESET: 'reset'
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
    Object.getOwnPropertyNames(value).forEach((property) => deepFreeze(value[property], references));
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

  function getByPath(object, path) {
    if (!path) return object;
    const parts = Array.isArray(path) ? path : String(path).split('.').filter(Boolean);
    let cursor = object;
    for (const part of parts) {
      if (cursor === null || cursor === undefined || !Object.prototype.hasOwnProperty.call(cursor, part)) return undefined;
      cursor = cursor[part];
    }
    return cursor;
  }

  function setByPath(object, path, value) {
    const parts = Array.isArray(path) ? path : String(path).split('.').filter(Boolean);
    if (!parts.length) throw new TypeError('Configuration path cannot be empty.');
    let cursor = object;
    parts.slice(0, -1).forEach((part) => {
      if (!isPlainObject(cursor[part])) cursor[part] = {};
      cursor = cursor[part];
    });
    cursor[parts[parts.length - 1]] = deepClone(value);
    return object;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function elapsedMs(start) {
    return Math.max(0, Date.now() - start);
  }

  const DEFAULT_CONFIG = deepFreeze({
    debug: false,
    strictDependencies: false,
    autoInitialize: false,
    logging: {
      enabled: true,
      level: 'warning',
      console: false,
      retainEntries: 250
    },
    diagnostics: {
      retainChecks: 100,
      includeDependencyDetails: true
    },
    persistence: {
      enabled: true,
      autoLoad: true,
      autoSave: true,
      storage: 'localStorage',
      storageKey: `${CACHE_PREFIX}:configuration`,
      stateVersion: STATE_VERSION,
      configVersion: CONFIG_VERSION
    },
    retry: {
      attempts: MAX_RETRIES,
      timeoutMs: DEFAULT_TIMEOUT_MS,
      backoffMs: 250
    },
    limits: {
      eventHistory: EVENT_LIMIT,
      timelineItems: 250,
      dailyTasks: 100,
      activePlugins: 50
    },
    planner: {
      enabled: true,
      timezone: 'local',
      dayStart: '04:00',
      dayEnd: '23:59',
      minimumBlockMinutes: 5,
      defaultBufferMinutes: 10,
      protectSleep: true
    },
    scheduler: {
      enabled: true,
      allowOverlaps: false,
      travelBufferMinutes: 15,
      mealSpacingMinutes: 240,
      maximumPlanningDays: 31
    },
    optimization: {
      enabled: true,
      maxPasses: 10,
      timeoutMs: 1500,
      preserveFixedEvents: true,
      explainChanges: true
    }
  });

  const CONFIG_RULES = deepFreeze({
    debug: { type: 'boolean' },
    strictDependencies: { type: 'boolean' },
    autoInitialize: { type: 'boolean' },
    'logging.enabled': { type: 'boolean' },
    'logging.level': { type: 'enum', values: ['debug', 'info', 'warning', 'error', 'silent'] },
    'logging.console': { type: 'boolean' },
    'logging.retainEntries': { type: 'integer', min: 0, max: 10000 },
    'diagnostics.retainChecks': { type: 'integer', min: 1, max: 10000 },
    'diagnostics.includeDependencyDetails': { type: 'boolean' },
    'persistence.enabled': { type: 'boolean' },
    'persistence.autoLoad': { type: 'boolean' },
    'persistence.autoSave': { type: 'boolean' },
    'persistence.storage': { type: 'enum', values: ['localStorage', 'sessionStorage', 'none'] },
    'persistence.storageKey': { type: 'string', minLength: 1, maxLength: 200 },
    'persistence.stateVersion': { type: 'integer', min: 1, max: 100000 },
    'persistence.configVersion': { type: 'integer', min: 1, max: 100000 },
    'retry.attempts': { type: 'integer', min: 0, max: 20 },
    'retry.timeoutMs': { type: 'integer', min: 0, max: 120000 },
    'retry.backoffMs': { type: 'integer', min: 0, max: 60000 },
    'limits.eventHistory': { type: 'integer', min: 0, max: 100000 },
    'limits.timelineItems': { type: 'integer', min: 1, max: 10000 },
    'limits.dailyTasks': { type: 'integer', min: 1, max: 10000 },
    'limits.activePlugins': { type: 'integer', min: 0, max: 1000 },
    'planner.enabled': { type: 'boolean' },
    'planner.timezone': { type: 'string', minLength: 1, maxLength: 100 },
    'planner.dayStart': { type: 'time' },
    'planner.dayEnd': { type: 'time' },
    'planner.minimumBlockMinutes': { type: 'integer', min: 1, max: 1440 },
    'planner.defaultBufferMinutes': { type: 'integer', min: 0, max: 1440 },
    'planner.protectSleep': { type: 'boolean' },
    'scheduler.enabled': { type: 'boolean' },
    'scheduler.allowOverlaps': { type: 'boolean' },
    'scheduler.travelBufferMinutes': { type: 'integer', min: 0, max: 1440 },
    'scheduler.mealSpacingMinutes': { type: 'integer', min: 0, max: 1440 },
    'scheduler.maximumPlanningDays': { type: 'integer', min: 1, max: 366 },
    'optimization.enabled': { type: 'boolean' },
    'optimization.maxPasses': { type: 'integer', min: 1, max: 1000 },
    'optimization.timeoutMs': { type: 'integer', min: 1, max: 120000 },
    'optimization.preserveFixedEvents': { type: 'boolean' },
    'optimization.explainChanges': { type: 'boolean' }
  });

  const runtime = {
    lifecycle: LifecycleState.CREATED,
    initializedAt: null,
    stoppedAt: null,
    lastHealthCheckAt: null,
    initializationCount: 0,
    config: DEFAULT_CONFIG,
    configRevision: 0,
    configSource: ConfigurationSource.DEFAULT,
    configUpdatedAt: null,
    environment: null,
    dependencies: Object.create(null),
    validations: [],
    warnings: [],
    errors: []
  };

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

  function getStorage(config) {
    const settings = config || runtime.config;
    if (!settings.persistence.enabled || settings.persistence.storage === 'none') return null;
    try {
      const storage = root && root[settings.persistence.storage];
      return storage && typeof storage.getItem === 'function' ? storage : null;
    } catch (_error) {
      return null;
    }
  }

  function detectEnvironment() {
    const hasProcess = typeof process === 'object' && process && process.versions && process.versions.node;
    const hasWindow = typeof window === 'object' && window && window.window === window;
    const hasDocument = typeof document === 'object' && document;
    const isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined' && root instanceof ServiceWorkerGlobalScope;
    const displayModeStandalone = Boolean(hasWindow && typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches);
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

  function validateRule(path, value, rule) {
    let valid = true;
    let expected = rule.type;
    if (rule.type === 'boolean') valid = typeof value === 'boolean';
    else if (rule.type === 'string') valid = typeof value === 'string' && value.length >= (rule.minLength || 0) && value.length <= (rule.maxLength || Infinity);
    else if (rule.type === 'integer') valid = Number.isInteger(value) && value >= rule.min && value <= rule.max;
    else if (rule.type === 'enum') {
      valid = rule.values.includes(value);
      expected = rule.values.join(' | ');
    } else if (rule.type === 'time') {
      valid = typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
      expected = 'HH:MM';
    }

    return valid ? null : deepFreeze({
      path,
      code: 'INVALID_CONFIG_VALUE',
      message: `Configuration value at "${path}" must be ${expected}.`,
      expected,
      received: deepClone(value),
      severity: Severity.ERROR
    });
  }

  function unknownConfigPaths(candidate, template, prefix) {
    const issues = [];
    if (!isPlainObject(candidate)) return issues;
    Object.keys(candidate).forEach((key) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (!Object.prototype.hasOwnProperty.call(template, key)) {
        issues.push(deepFreeze({
          path,
          code: 'UNKNOWN_CONFIG_KEY',
          message: `Unknown configuration key "${path}".`,
          severity: Severity.WARNING
        }));
      } else if (isPlainObject(candidate[key]) && isPlainObject(template[key])) {
        issues.push(...unknownConfigPaths(candidate[key], template[key], path));
      }
    });
    return issues;
  }

  function validateConfig(candidate, options) {
    const settings = options || {};
    const complete = settings.complete !== false;
    const merged = complete ? mergeConfig(DEFAULT_CONFIG, candidate || {}) : deepClone(candidate || {});
    const errors = [];
    const warnings = unknownConfigPaths(candidate || {}, DEFAULT_CONFIG, '');

    Object.keys(CONFIG_RULES).forEach((path) => {
      const value = getByPath(merged, path);
      const issue = validateRule(path, value, CONFIG_RULES[path]);
      if (issue) errors.push(issue);
    });

    const dayStart = getByPath(merged, 'planner.dayStart');
    const dayEnd = getByPath(merged, 'planner.dayEnd');
    if (/^\d{2}:\d{2}$/.test(dayStart || '') && /^\d{2}:\d{2}$/.test(dayEnd || '') && dayStart === dayEnd) {
      warnings.push(deepFreeze({
        path: 'planner',
        code: 'DAY_WINDOW_ZERO_LENGTH',
        message: 'planner.dayStart and planner.dayEnd are identical.',
        severity: Severity.WARNING
      }));
    }

    return deepFreeze({
      ok: errors.length === 0,
      valid: errors.length === 0,
      errors,
      warnings,
      normalized: deepFreeze(merged),
      checkedAt: nowIso()
    });
  }

  function configurationEnvelope(config, source) {
    return {
      module: MODULE_NAME,
      version: VERSION,
      configVersion: CONFIG_VERSION,
      stateVersion: STATE_VERSION,
      source: source || runtime.configSource,
      revision: runtime.configRevision,
      savedAt: nowIso(),
      config: deepClone(config || runtime.config)
    };
  }

  function persistConfig() {
    const storage = getStorage(runtime.config);
    if (!storage || !runtime.config.persistence.autoSave) {
      return { ok: false, code: 'PERSISTENCE_UNAVAILABLE' };
    }
    try {
      storage.setItem(runtime.config.persistence.storageKey, JSON.stringify(configurationEnvelope(runtime.config, runtime.configSource)));
      return { ok: true, code: 'CONFIG_SAVED' };
    } catch (error) {
      const issue = makeIssue('CONFIG_SAVE_FAILED', error.message || 'Configuration could not be persisted.', Severity.WARNING);
      runtime.warnings.push(issue);
      trimDiagnostics();
      return { ok: false, code: issue.code, error: issue };
    }
  }

  function loadPersistedConfig(baseConfig) {
    const storage = getStorage(baseConfig);
    if (!storage || !baseConfig.persistence.autoLoad) return null;
    try {
      const raw = storage.getItem(baseConfig.persistence.storageKey);
      if (!raw) return null;
      const envelope = JSON.parse(raw);
      if (!envelope || !isPlainObject(envelope.config)) throw new TypeError('Persisted configuration envelope is invalid.');
      const validation = validateConfig(envelope.config);
      if (!validation.ok) throw new TypeError('Persisted configuration did not pass validation.');
      return validation.normalized;
    } catch (error) {
      runtime.warnings.push(makeIssue('CONFIG_LOAD_FAILED', error.message || 'Persisted configuration could not be loaded.', Severity.WARNING));
      trimDiagnostics();
      return null;
    }
  }

  function applyConfiguration(candidate, source, options) {
    const settings = options || {};
    const validation = validateConfig(candidate);
    if (!validation.ok) {
      return structuredResult('configure', false, {
        code: 'CONFIG_VALIDATION_FAILED',
        message: 'Configuration was rejected because one or more values are invalid.',
        validation
      });
    }
    if (settings.rejectUnknown && validation.warnings.some((issue) => issue.code === 'UNKNOWN_CONFIG_KEY')) {
      return structuredResult('configure', false, {
        code: 'UNKNOWN_CONFIG_KEYS',
        message: 'Configuration contains unknown keys.',
        validation
      });
    }

    runtime.config = validation.normalized;
    runtime.configRevision += 1;
    runtime.configSource = source || ConfigurationSource.RUNTIME;
    runtime.configUpdatedAt = nowIso();
    trimDiagnostics();
    const persistence = settings.persist === false ? { ok: false, code: 'PERSISTENCE_SKIPPED' } : persistConfig();

    return structuredResult('configure', true, {
      code: 'CONFIG_APPLIED',
      message: 'Configuration applied successfully.',
      revision: runtime.configRevision,
      source: runtime.configSource,
      config: runtime.config,
      validation,
      persistence
    });
  }

  function configure(patch, options) {
    if (!isPlainObject(patch)) {
      return structuredResult('configure', false, {
        code: 'INVALID_CONFIG_PATCH',
        message: 'Configuration patch must be a plain object.'
      });
    }
    const candidate = mergeConfig(runtime.config, patch);
    return applyConfiguration(candidate, ConfigurationSource.RUNTIME, options);
  }

  function setConfig(path, value, options) {
    const patch = {};
    try {
      setByPath(patch, path, value);
    } catch (error) {
      return structuredResult('setConfig', false, { code: 'INVALID_CONFIG_PATH', message: error.message });
    }
    const result = configure(patch, options);
    return deepFreeze({ ...deepClone(result), operation: 'setConfig', path: String(path) });
  }

  function getConfig(path) {
    const value = getByPath(runtime.config, path);
    return value === undefined ? undefined : deepFreeze(deepClone(value));
  }

  function resetConfig(path, options) {
    if (!path) return applyConfiguration(DEFAULT_CONFIG, ConfigurationSource.RESET, options);
    const defaultValue = getByPath(DEFAULT_CONFIG, path);
    if (defaultValue === undefined) {
      return structuredResult('resetConfig', false, {
        code: 'UNKNOWN_CONFIG_PATH',
        message: `Unknown configuration path "${path}".`
      });
    }
    const candidate = deepClone(runtime.config);
    setByPath(candidate, path, defaultValue);
    const result = applyConfiguration(candidate, ConfigurationSource.RESET, options);
    return deepFreeze({ ...deepClone(result), operation: 'resetConfig', path: String(path) });
  }

  function exportConfig(options) {
    const settings = options || {};
    const envelope = deepFreeze(configurationEnvelope(runtime.config, runtime.configSource));
    return settings.asObject ? envelope : JSON.stringify(envelope, null, settings.pretty === false ? 0 : 2);
  }

  function importConfig(input, options) {
    let parsed = input;
    try {
      if (typeof input === 'string') parsed = JSON.parse(input);
    } catch (error) {
      return structuredResult('importConfig', false, {
        code: 'CONFIG_IMPORT_PARSE_FAILED',
        message: error.message || 'Configuration JSON could not be parsed.'
      });
    }
    const candidate = isPlainObject(parsed) && isPlainObject(parsed.config) ? parsed.config : parsed;
    if (!isPlainObject(candidate)) {
      return structuredResult('importConfig', false, {
        code: 'INVALID_CONFIG_IMPORT',
        message: 'Imported configuration must be an object or a configuration envelope.'
      });
    }
    const base = options && options.replace === true ? DEFAULT_CONFIG : runtime.config;
    const merged = mergeConfig(base, candidate);
    const result = applyConfiguration(merged, ConfigurationSource.IMPORT, options);
    return deepFreeze({ ...deepClone(result), operation: 'importConfig' });
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
      message: environment.type !== EnvironmentType.UNKNOWN ? `Runtime detected as ${environment.type}.` : 'Runtime environment could not be identified.'
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
        message: environment.features.localStorage ? 'Local storage is available.' : 'Local storage is unavailable; persistence must degrade gracefully.'
      });
      checks.push({
        id: 'indexed-db',
        passed: environment.features.indexedDB,
        severity: Severity.INFO,
        message: environment.features.indexedDB ? 'IndexedDB is available.' : 'IndexedDB is unavailable; advanced persistence will be disabled.'
      });
    }

    const configValidation = validateConfig(runtime.config);
    checks.push({
      id: 'configuration-valid',
      passed: configValidation.ok,
      severity: Severity.ERROR,
      message: configValidation.ok ? 'Life Orchestrator configuration is valid.' : 'Life Orchestrator configuration is invalid.'
    });

    const missingRequired = Object.values(dependencies).filter((entry) => entry.required && entry.state !== DependencyState.AVAILABLE);
    checks.push({
      id: 'required-dependencies',
      passed: missingRequired.length === 0,
      severity: Severity.ERROR,
      message: missingRequired.length ? `Missing required dependencies: ${missingRequired.map((entry) => entry.global).join(', ')}.` : 'All required dependencies are available.'
    });

    const missingOptional = Object.values(dependencies).filter((entry) => !entry.required && entry.state !== DependencyState.AVAILABLE);
    checks.push({
      id: 'optional-dependencies',
      passed: missingOptional.length === 0,
      severity: Severity.INFO,
      message: missingOptional.length ? `${missingOptional.length} optional integration(s) are not currently available.` : 'All optional integrations are available.'
    });

    const normalizedChecks = checks.map((check) => deepFreeze({ ...check, checkedAt: nowIso() }));
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
      configuration: configValidation,
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
      const optionPatch = isPlainObject(options) ? options : {};
      let candidate = mergeConfig(DEFAULT_CONFIG, optionPatch);
      const persisted = loadPersistedConfig(candidate);
      if (persisted) {
        candidate = mergeConfig(persisted, optionPatch);
        runtime.configSource = ConfigurationSource.PERSISTED;
      } else {
        runtime.configSource = Object.keys(optionPatch).length ? ConfigurationSource.INITIALIZE : ConfigurationSource.DEFAULT;
      }

      const configuration = validateConfig(candidate);
      if (!configuration.ok) {
        runtime.lifecycle = LifecycleState.FAILED;
        return structuredResult('initialize', false, {
          code: 'INITIALIZATION_CONFIG_INVALID',
          message: 'Life Orchestrator configuration is invalid.',
          configuration,
          durationMs: elapsedMs(started)
        });
      }

      runtime.config = configuration.normalized;
      runtime.configRevision += 1;
      runtime.configUpdatedAt = nowIso();
      runtime.environment = detectEnvironment();
      const validation = validateRuntime();

      if (!validation.ok && runtime.config.strictDependencies) {
        runtime.lifecycle = LifecycleState.FAILED;
        const issue = makeIssue('INITIALIZATION_VALIDATION_FAILED', 'Strict bootstrap validation failed.', Severity.ERROR, validation);
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
      persistConfig();

      return structuredResult('initialize', true, {
        code: validation.degraded ? 'INITIALIZED_DEGRADED' : 'INITIALIZED',
        message: validation.degraded ? 'Life Orchestrator initialized with non-blocking limitations.' : 'Life Orchestrator initialized successfully.',
        validation,
        configuration: {
          revision: runtime.configRevision,
          source: runtime.configSource,
          updatedAt: runtime.configUpdatedAt
        },
        environment: runtime.environment,
        durationMs: elapsedMs(started)
      });
    } catch (error) {
      runtime.lifecycle = LifecycleState.FAILED;
      const issue = makeIssue('INITIALIZATION_EXCEPTION', error && error.message ? error.message : 'Unexpected initialization failure.', Severity.CRITICAL, { name: error && error.name ? error.name : 'Error' });
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
      return structuredResult('shutdown', true, { code: 'ALREADY_STOPPED', message: 'Life Orchestrator is not running.' });
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
    runtime.configRevision = 0;
    runtime.configSource = ConfigurationSource.DEFAULT;
    runtime.configUpdatedAt = null;
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
      configuration: {
        revision: runtime.configRevision,
        source: runtime.configSource,
        updatedAt: runtime.configUpdatedAt,
        valid: validateConfig(runtime.config).ok
      },
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
      configVersion: CONFIG_VERSION,
      author: AUTHOR,
      api: '6.1.2-configuration'
    });
  }

  function health() {
    const started = Date.now();
    if (!runtime.environment) runtime.environment = detectEnvironment();
    const validation = validateRuntime();
    runtime.lastHealthCheckAt = nowIso();
    const healthyState = runtime.lifecycle === LifecycleState.READY || runtime.lifecycle === LifecycleState.DEGRADED;
    const ok = healthyState && validation.ok;
    const grade = !healthyState || !validation.ok ? 'unhealthy' : validation.degraded || runtime.warnings.length ? 'degraded' : 'healthy';
    return deepFreeze({
      module: MODULE_NAME,
      ok,
      grade,
      state: runtime.lifecycle,
      validation,
      warnings: deepClone(runtime.warnings),
      errors: deepClone(runtime.errors),
      dependencies: deepClone(runtime.dependencies),
      configuration: {
        revision: runtime.configRevision,
        source: runtime.configSource,
        updatedAt: runtime.configUpdatedAt
      },
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
    configVersion: CONFIG_VERSION,
    cachePrefix: CACHE_PREFIX,
    dependencies: DEPENDENCY_DEFINITIONS.map((entry) => entry.global),
    capabilities: [
      'lifecycle-management',
      'environment-detection',
      'dependency-discovery',
      'runtime-validation',
      'structured-health-reporting',
      'validated-configuration',
      'configuration-import-export',
      'configuration-persistence'
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
      CONFIG_VERSION,
      DEFAULT_TIMEOUT_MS,
      MAX_RETRIES,
      EVENT_LIMIT,
      CACHE_PREFIX
    }),
    enums: deepFreeze({ LifecycleState, Severity, DependencyState, EnvironmentType, ConfigurationSource }),
    defaultConfig: DEFAULT_CONFIG,
    configRules: CONFIG_RULES,
    initialize,
    shutdown,
    reset,
    status,
    version,
    health,
    validate: validateRuntime,
    detectEnvironment,
    inspectDependencies,
    getDependency,
    configure,
    setConfig,
    getConfig,
    resetConfig,
    validateConfig,
    exportConfig,
    importConfig
  };

  return deepFreeze(api);
});
