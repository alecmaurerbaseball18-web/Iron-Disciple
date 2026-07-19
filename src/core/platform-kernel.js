/* Iron Disciple OS — Platform Kernel v1.5.0 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.IDOSPlatformKernel = api;
  if (root && root.document && typeof root.state !== 'undefined') api.install(root);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const VERSION = '1.5.0';
  const SCHEMA_VERSION = 5;
  const VALID_STATUSES = new Set(['active', 'foundation', 'planned', 'disabled']);
  const VALID_TASK_STATUSES = new Set(['open', 'done', 'skipped']);

  const clone = value => JSON.parse(JSON.stringify(value));
  const isObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const unique = values => [...new Set(values)];

  function normalizeModule(module, fallbackIndex = 0) {
    const raw = isObject(module) ? module : {};
    const id = String(raw.id || `module-${fallbackIndex + 1}`).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    return {
      id,
      name: String(raw.name || id || 'Module').trim(),
      view: String(raw.view || 'control').trim(),
      status: VALID_STATUSES.has(raw.status) ? raw.status : 'planned',
      icon: String(raw.icon || '◇'),
      version: String(raw.version || '0.1.0'),
      capabilities: unique(Array.isArray(raw.capabilities) ? raw.capabilities.map(String) : []),
      taskTypes: unique(Array.isArray(raw.taskTypes) ? raw.taskTypes.map(String) : []),
      registeredAt: raw.registeredAt || new Date(0).toISOString()
    };
  }

  function validateModuleContract(module) {
    const errors = [];
    if (!isObject(module)) return { valid:false, errors:['Module must be an object.'] };
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(module.id || ''))) errors.push('Module id must be kebab-case.');
    if (!String(module.name || '').trim()) errors.push('Module name is required.');
    if (!String(module.view || '').trim()) errors.push('Module view is required.');
    if (!VALID_STATUSES.has(module.status)) errors.push('Module status is invalid.');
    if (!Array.isArray(module.capabilities)) errors.push('Module capabilities must be an array.');
    return { valid:errors.length === 0, errors };
  }

  function migrateState(input) {
    const state = isObject(input) ? clone(input) : {};
    state.os = isObject(state.os) ? state.os : {};
    const from = Number(state.os.schemaVersion || 0);
    state.os.tasks = Array.isArray(state.os.tasks) ? state.os.tasks : [];
    state.os.schedules = Array.isArray(state.os.schedules) ? state.os.schedules : [];
    state.os.templates = Array.isArray(state.os.templates) ? state.os.templates : [];
    state.os.modules = Array.isArray(state.os.modules) ? state.os.modules : [];
    state.os.activity = Array.isArray(state.os.activity) ? state.os.activity : [];
    state.os.migrations = Array.isArray(state.os.migrations) ? state.os.migrations : [];

    state.os.tasks = state.os.tasks.map((task, index) => ({
      id: String(task.id || `task-${index + 1}`),
      title: String(task.title || 'Untitled task').trim(),
      module: String(task.module || 'planner'),
      date: task.date || '',
      priority: ['high','medium','low'].includes(task.priority) ? task.priority : 'medium',
      status: VALID_TASK_STATUSES.has(task.status) ? task.status : 'open',
      estimate: Math.max(0, Number(task.estimate || 0)),
      source: task.source || 'manual', sourceId: task.sourceId || null,
      dependsOn: unique(Array.isArray(task.dependsOn) ? task.dependsOn.filter(Boolean).map(String) : []),
      completionRule: task.completionRule === 'roll-forward' ? 'roll-forward' : 'single',
      createdAt: task.createdAt || new Date(0).toISOString(), completedAt: task.completedAt || null,
      notes: String(task.notes || '')
    }));

    state.os.modules = state.os.modules.map(normalizeModule);
    const seen = new Set();
    state.os.modules = state.os.modules.filter(module => !seen.has(module.id) && seen.add(module.id));
    state.os.kernel = { version:VERSION, schemaVersion:SCHEMA_VERSION, migratedFrom:from, lastMigrationAt:new Date().toISOString(), ...(state.os.kernel || {}) };
    state.os.schemaVersion = SCHEMA_VERSION;
    if (from !== SCHEMA_VERSION) state.os.migrations.push({ from, to:SCHEMA_VERSION, at:new Date().toISOString() });
    return state;
  }

  function dependencyState(task, tasks = []) {
    const dependencyIds = Array.isArray(task.dependsOn) ? task.dependsOn : [];
    if (!dependencyIds.length) return { blocked:false, missing:[], incomplete:[] };
    const map = new Map(tasks.map(item => [String(item.id), item]));
    const missing = dependencyIds.filter(id => !map.has(String(id)));
    const incomplete = dependencyIds.filter(id => map.has(String(id)) && map.get(String(id)).status !== 'done');
    return { blocked:missing.length > 0 || incomplete.length > 0, missing, incomplete };
  }

  function detectDependencyCycles(tasks = []) {
    const graph = new Map(tasks.map(task => [String(task.id), (task.dependsOn || []).map(String)]));
    const visiting = new Set(); const visited = new Set(); const cycles = [];
    function visit(id, path) {
      if (visiting.has(id)) { cycles.push([...path.slice(path.indexOf(id)), id]); return; }
      if (visited.has(id) || !graph.has(id)) return;
      visiting.add(id); path.push(id);
      graph.get(id).forEach(next => visit(next, path));
      path.pop(); visiting.delete(id); visited.add(id);
    }
    graph.forEach((_, id) => visit(id, []));
    return cycles;
  }

  function applyCompletion(taskId, tasks = [], completedAt = new Date().toISOString()) {
    const output = tasks.map(item => ({ ...item, dependsOn:Array.isArray(item.dependsOn) ? [...item.dependsOn] : [] }));
    const task = output.find(item => String(item.id) === String(taskId));
    if (!task) return { tasks:output, changed:false, reason:'missing' };
    const dependency = dependencyState(task, output);
    if (task.status !== 'done' && dependency.blocked) return { tasks:output, changed:false, reason:'blocked', dependency };
    const completing = task.status !== 'done';
    task.status = completing ? 'done' : 'open';
    task.completedAt = completing ? completedAt : null;
    return { tasks:output, changed:true, reason:completing ? 'completed' : 'reopened', dependency };
  }

  function buildKernelReport(state) {
    const os = state?.os || {};
    const moduleResults = (os.modules || []).map(module => ({ id:module.id, ...validateModuleContract(module) }));
    const cycles = detectDependencyCycles(os.tasks || []);
    const duplicateTaskIds = (os.tasks || []).length - new Set((os.tasks || []).map(task => String(task.id))).size;
    const blockedTasks = (os.tasks || []).filter(task => task.status !== 'done' && dependencyState(task, os.tasks || []).blocked).length;
    return {
      schemaVersion:Number(os.schemaVersion || 0), expectedSchemaVersion:SCHEMA_VERSION,
      modulesValid:moduleResults.every(result => result.valid), moduleResults,
      duplicateTaskIds, dependencyCycles:cycles, blockedTasks,
      valid: Number(os.schemaVersion || 0) === SCHEMA_VERSION && moduleResults.every(result => result.valid) && duplicateTaskIds === 0 && cycles.length === 0
    };
  }

  function install(app) {
    const migrated = migrateState(app.state);
    Object.keys(app.state).forEach(key => delete app.state[key]);
    Object.assign(app.state, migrated);

    function persist() {
      try { app.localStorage.setItem(app.KEY, JSON.stringify(app.state)); } catch {}
    }

    function registerModule(definition) {
      const module = normalizeModule({ ...definition, registeredAt:new Date().toISOString() }, app.state.os.modules.length);
      const contract = validateModuleContract(module);
      if (!contract.valid) throw new Error(contract.errors.join(' '));
      const index = app.state.os.modules.findIndex(item => item.id === module.id);
      if (index >= 0) app.state.os.modules[index] = module; else app.state.os.modules.push(module);
      persist(); return module;
    }

    function kernelCompleteTask(taskId) {
      const result = applyCompletion(taskId, app.state.os.tasks);
      if (!result.changed) return result;
      app.state.os.tasks = result.tasks;
      if (typeof app.logActivity === 'function') app.logActivity(`task.${result.reason}`, 'core', app.state.os.tasks.find(t => t.id === taskId)?.title || 'Task');
      persist();
      if (typeof app.render === 'function') app.render();
      return result;
    }

    app.registerModule = registerModule;
    app.kernelCompleteTask = kernelCompleteTask;
    app.kernelReport = () => buildKernelReport(app.state);

    const priorRender = app.render;
    app.render = function kernelRender() {
      priorRender();
      const version = app.document.querySelector('[data-view="more"] .version');
      if (version) version.textContent = `Iron Disciple OS ${VERSION} — Core Platform Complete`;
      app.document.querySelectorAll('[data-platform-task]').forEach(button => {
        const task = app.state.os.tasks.find(item => String(item.id) === String(button.dataset.platformTask));
        if (!task) return;
        const dependency = dependencyState(task, app.state.os.tasks);
        button.disabled = task.status !== 'done' && dependency.blocked;
        button.title = dependency.blocked ? 'Complete prerequisite tasks first.' : 'Toggle task';
        button.closest('.platform-task')?.classList.toggle('blocked', dependency.blocked);
      });
    };

    app.document.addEventListener('click', event => {
      const button = event.target.closest('[data-platform-task]');
      if (!button) return;
      const task = app.state.os.tasks.find(item => String(item.id) === String(button.dataset.platformTask));
      if (!task || task.status === 'done') return;
      const dependency = dependencyState(task, app.state.os.tasks);
      if (dependency.blocked) {
        event.preventDefault(); event.stopImmediatePropagation();
        app.alert('This task is blocked until its prerequisite tasks are complete.');
      }
    }, true);

    persist();
    app.render();
  }

  return { VERSION, SCHEMA_VERSION, normalizeModule, validateModuleContract, migrateState, dependencyState, detectDependencyCycles, applyCompletion, buildKernelReport, install };
});
