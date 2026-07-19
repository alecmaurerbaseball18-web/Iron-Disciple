/* Iron Disciple OS — Core Platform Services */
(() => {
  'use strict';

  const PLATFORM_SCHEMA_VERSION = 3;
  const SNAPSHOT_KEY = 'ironDiscipleOS.snapshots.v1';
  const MAX_SNAPSHOTS = 7;

  const isoDate = (value = new Date()) => {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? todayKey() : d.toISOString().slice(0, 10);
  };
  const nowIso = () => new Date().toISOString();
  const weekday = date => ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()];

  function ensurePlatformState() {
    state.os = state.os || {};
    state.os.schemaVersion = Math.max(Number(state.os.schemaVersion || 0), PLATFORM_SCHEMA_VERSION);
    state.os.tasks = Array.isArray(state.os.tasks) ? state.os.tasks : [];
    state.os.schedules = Array.isArray(state.os.schedules) ? state.os.schedules : [];
    state.os.templates = Array.isArray(state.os.templates) ? state.os.templates : [];
    state.os.activity = Array.isArray(state.os.activity) ? state.os.activity : [];
    state.os.errors = Array.isArray(state.os.errors) ? state.os.errors : [];
    state.os.settings = {
      units: 'imperial', notifications: true, developerMode: false,
      autoSnapshot: true, compactMissionControl: false,
      ...(state.os.settings || {})
    };
    seedTemplates();
    generateScheduledTasks();
    snapshotDaily();
  }

  function seedTemplates() {
    if (state.os.templates.length) return;
    state.os.templates = [
      { id:'tpl-workout', name:'Workout', module:'training', title:'Complete scheduled workout', priority:'high', estimate:60 },
      { id:'tpl-mobility', name:'Mobility', module:'training', title:'Complete mobility routine', priority:'medium', estimate:15 },
      { id:'tpl-golf', name:'Golf Practice', module:'golf', title:'Complete golf practice block', priority:'medium', estimate:45 },
      { id:'tpl-softball', name:'Softball Practice', module:'softball', title:'Complete softball practice block', priority:'medium', estimate:45 },
      { id:'tpl-faith', name:'Bible Study', module:'faith', title:'Complete Bible study and prayer', priority:'medium', estimate:20 },
      { id:'tpl-weighin', name:'Weigh-in', module:'nutrition', title:'Record morning weigh-in', priority:'low', estimate:5 }
    ];
  }

  function taskKey(task) { return `${task.source || 'manual'}:${task.sourceId || task.id}:${task.date}`; }
  function addTask(task, log = true) {
    const normalized = {
      id: task.id || id(), title: String(task.title || '').trim(), module: task.module || 'planner',
      date: task.date || todayKey(), priority: task.priority || 'medium', status: task.status || 'open',
      estimate: Number(task.estimate || 0), source: task.source || 'manual', sourceId: task.sourceId || '',
      createdAt: task.createdAt || nowIso(), completedAt: task.completedAt || null, notes: task.notes || ''
    };
    if (!normalized.title) return null;
    const duplicate = state.os.tasks.some(existing => taskKey(existing) === taskKey(normalized));
    if (duplicate) return null;
    state.os.tasks.push(normalized);
    if (log) logActivity('task.created', normalized.module, normalized.title, { taskId: normalized.id });
    return normalized;
  }

  function generateScheduledTasks(date = new Date()) {
    const dateKey = isoDate(date);
    const day = weekday(date);
    state.os.schedules.filter(s => s.enabled !== false && Array.isArray(s.days) && s.days.includes(day)).forEach(schedule => {
      const template = state.os.templates.find(t => t.id === schedule.templateId);
      if (!template) return;
      addTask({ ...template, id:id(), date:dateKey, source:'schedule', sourceId:schedule.id }, false);
    });
  }

  function logActivity(type, module, title, detail = {}) {
    state.os.activity.push({ id:id(), type, module:module || 'core', title, detail, timestamp:nowIso() });
    if (state.os.activity.length > 1000) state.os.activity.splice(0, state.os.activity.length - 1000);
  }

  function todayTasks() {
    const today = todayKey();
    return state.os.tasks.filter(t => t.date === today).sort((a,b) => {
      const rank = { high:0, medium:1, low:2 };
      return (a.status === 'done') - (b.status === 'done') || (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3);
    });
  }

  function taskCompletion() {
    const tasks = todayTasks();
    return tasks.length ? percent(tasks.filter(t => t.status === 'done').length, tasks.length) : 0;
  }

  function toggleTask(taskId) {
    const task = state.os.tasks.find(t => t.id === taskId); if (!task) return;
    const complete = task.status !== 'done';
    task.status = complete ? 'done' : 'open';
    task.completedAt = complete ? nowIso() : null;
    logActivity(complete ? 'task.completed' : 'task.reopened', task.module, task.title, { taskId });
    save();
  }

  function addManualTask() {
    const title = prompt('Task'); if (!title) return;
    const date = prompt('Date (YYYY-MM-DD)', todayKey()); if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return alert('Use YYYY-MM-DD.');
    const module = (prompt('Module', 'planner') || 'planner').trim().toLowerCase();
    const priority = (prompt('Priority: high, medium, or low', 'medium') || 'medium').trim().toLowerCase();
    addTask({ title, date, module, priority:['high','medium','low'].includes(priority) ? priority : 'medium' });
    save();
  }

  function addSchedule() {
    const name = prompt('Schedule name'); if (!name) return;
    const templateNames = state.os.templates.map(t => `${t.id}: ${t.name}`).join('\n');
    const templateId = prompt(`Template ID:\n${templateNames}`, state.os.templates[0]?.id || '');
    if (!state.os.templates.some(t => t.id === templateId)) return alert('Template not found.');
    const daysRaw = prompt('Days (comma separated: mon,tue,wed,thu,fri,sat,sun)', 'mon,wed,fri');
    const days = String(daysRaw || '').toLowerCase().split(',').map(x=>x.trim()).filter(x=>['sun','mon','tue','wed','thu','fri','sat'].includes(x));
    if (!days.length) return alert('Add at least one valid day.');
    state.os.schedules.push({ id:id(), name:name.trim(), templateId, days:[...new Set(days)], enabled:true, createdAt:nowIso() });
    generateScheduledTasks(); logActivity('schedule.created','planner',name.trim()); save();
  }

  function injectPlatformUI() {
    const control = document.querySelector('[data-view="control"]'); if (!control || document.querySelector('#platformTaskEngine')) return;
    const priorityBrief = document.querySelector('#osPriorityBrief');
    priorityBrief?.insertAdjacentHTML('afterend', `
      <div class="platform-grid" id="platformTaskEngine">
        <section class="section-block flush"><div class="section-head"><div><span class="kicker">TASK ENGINE</span><h3>Today’s Queue</h3></div><button id="platformAddTask" class="primary-btn">Add Task</button></div><div id="platformTasks" class="card-list"></div></section>
        <section class="section-block flush"><div class="section-head"><div><span class="kicker">SCHEDULER</span><h3>Recurring Plans</h3></div><button id="platformAddSchedule" class="secondary-btn">Add Schedule</button></div><div id="platformSchedules" class="card-list"></div></section>
      </div>
      <div class="platform-grid">
        <section class="section-block flush"><div class="section-head"><div><span class="kicker">ANALYTICS</span><h3>Recent Activity</h3></div><span id="platformActivityCount" class="status-pill">0 events</span></div><div id="platformActivity" class="card-list"></div></section>
        <section class="section-block flush"><div class="section-head"><div><span class="kicker">BACKUP MANAGER</span><h3>Recovery Snapshots</h3></div><button id="platformSnapshot" class="secondary-btn">Snapshot Now</button></div><div id="platformSnapshots" class="card-list"></div></section>
      </div>`);
  }

  function renderPlatform() {
    injectPlatformUI();
    const tasks = document.querySelector('#platformTasks');
    if (tasks) tasks.innerHTML = todayTasks().map(t => `<article class="list-card platform-task ${t.status === 'done' ? 'done' : ''}"><button class="task-toggle" data-platform-task="${t.id}" aria-label="Toggle task">${t.status === 'done' ? '✓' : '○'}</button><div class="grow"><small>${esc(t.module)} · ${esc(t.priority)}${t.estimate ? ` · ${t.estimate} min` : ''}</small><strong>${esc(t.title)}</strong></div></article>`).join('') || empty('No tasks are scheduled for today.');
    const schedules = document.querySelector('#platformSchedules');
    if (schedules) schedules.innerHTML = state.os.schedules.map(s => { const tpl=state.os.templates.find(t=>t.id===s.templateId); return `<article class="list-card"><div class="grow"><small>${esc((s.days||[]).join(', '))}</small><strong>${esc(s.name)}</strong><p>${esc(tpl?.name || 'Missing template')}</p></div><button class="mini-btn" data-platform-delete-schedule="${s.id}">×</button></article>`; }).join('') || empty('No recurring schedules yet.');
    const activity = document.querySelector('#platformActivity');
    if (activity) activity.innerHTML = state.os.activity.slice(-8).reverse().map(a => `<article class="list-card"><div class="grow"><small>${new Date(a.timestamp).toLocaleString()} · ${esc(a.module)}</small><strong>${esc(a.title)}</strong></div></article>`).join('') || empty('Activity will appear as the system is used.');
    const count = document.querySelector('#platformActivityCount'); if (count) count.textContent = `${state.os.activity.length} events`;
    renderSnapshots();
    const brief = document.querySelector('#osPriorityBrief p');
    if (brief) {
      let status = brief.querySelector('[data-platform-task-status]');
      if (!status) { status = document.createElement('span'); status.dataset.platformTaskStatus = ''; brief.append(status); }
      status.textContent = ` Today’s task queue is ${taskCompletion()}% complete.`;
    }
  }

  function getSnapshots() { try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '[]'); } catch { return []; } }
  function setSnapshots(items) { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(items.slice(-MAX_SNAPSHOTS))); }
  function checksum(text) { let h=2166136261; for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)} return (h>>>0).toString(16).padStart(8,'0'); }
  function createSnapshot(reason = 'manual') {
    const payload = JSON.stringify(state);
    const snapshots = getSnapshots();
    const snapshot = { id:id(), createdAt:nowIso(), reason, schemaVersion:PLATFORM_SCHEMA_VERSION, checksum:checksum(payload), payload };
    snapshots.push(snapshot); setSnapshots(snapshots); logActivity('backup.snapshot','core',`Snapshot created (${reason})`); return snapshot;
  }
  function snapshotDaily() {
    if (!state.os.settings.autoSnapshot) return;
    const today = todayKey(); const snapshots = getSnapshots();
    if (!snapshots.some(s => String(s.createdAt).startsWith(today))) createSnapshot('daily');
  }
  function restoreSnapshot(snapshotId) {
    const snapshot = getSnapshots().find(s => s.id === snapshotId); if (!snapshot) return;
    if (checksum(snapshot.payload) !== snapshot.checksum) return alert('Snapshot integrity check failed.');
    if (!confirm(`Restore snapshot from ${new Date(snapshot.createdAt).toLocaleString()}? Current data will be replaced.`)) return;
    try { const restored=JSON.parse(snapshot.payload); localStorage.setItem(KEY, JSON.stringify(restored)); location.reload(); } catch { alert('Snapshot could not be restored.'); }
  }
  function renderSnapshots() {
    const target = document.querySelector('#platformSnapshots'); if (!target) return;
    target.innerHTML = getSnapshots().slice().reverse().map(s => `<article class="list-card"><div class="grow"><small>${esc(s.reason)} · checksum ${esc(s.checksum)}</small><strong>${new Date(s.createdAt).toLocaleString()}</strong></div><button class="mini-btn" data-platform-restore="${s.id}">Restore</button></article>`).join('') || empty('No recovery snapshots yet.');
  }

  ensurePlatformState(); injectPlatformUI();

  window.addEventListener('error', event => {
    state.os.errors.push({ id:id(), message:event.message, source:event.filename || '', line:event.lineno || 0, timestamp:nowIso() });
    if (state.os.errors.length > 100) state.os.errors.shift();
    localStorage.setItem(KEY, JSON.stringify(state));
  });

  document.addEventListener('click', event => {
    const task = event.target.closest('[data-platform-task]'); if (task) toggleTask(task.dataset.platformTask);
    if (event.target.closest('#platformAddTask')) addManualTask();
    if (event.target.closest('#platformAddSchedule')) addSchedule();
    if (event.target.closest('#platformSnapshot')) { createSnapshot('manual'); save(); }
    const scheduleDelete = event.target.closest('[data-platform-delete-schedule]');
    if (scheduleDelete) { state.os.schedules = state.os.schedules.filter(s=>s.id!==scheduleDelete.dataset.platformDeleteSchedule); save(); }
    const restore = event.target.closest('[data-platform-restore]'); if (restore) restoreSnapshot(restore.dataset.platformRestore);
  });

  const previousRender = render;
  render = function platformRender() { ensurePlatformState(); previousRender(); renderPlatform(); };
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
})();
