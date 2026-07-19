/* Iron Disciple OS — Platform Automation v1.4.0 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.IDOSPlatformAutomation = api;
  if (root && root.document && typeof root.state !== 'undefined') api.install(root);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const VERSION = '1.4.0';
  const VALID_DAYS = ['sun','mon','tue','wed','thu','fri','sat'];
  const DAY_MS = 86400000;

  const isoDate = value => {
    const d = value instanceof Date ? new Date(value) : new Date(value || Date.now());
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };
  const weekday = value => VALID_DAYS[new Date(value).getDay()];
  const addDays = (value, days) => new Date(new Date(value).getTime() + (days * DAY_MS));
  const taskFingerprint = task => `${task.source || 'manual'}:${task.sourceId || task.id || ''}:${task.date || ''}`;
  const normalizePriority = value => ['high','medium','low'].includes(value) ? value : 'medium';

  function createScheduledTasks({ schedules = [], templates = [], tasks = [], from = new Date(), days = 7, makeId = () => Math.random().toString(36).slice(2) }) {
    const output = [];
    const fingerprints = new Set(tasks.map(taskFingerprint));
    for (let offset = 0; offset < Math.max(1, days); offset += 1) {
      const date = addDays(from, offset);
      const dateKey = isoDate(date);
      const day = weekday(date);
      schedules.forEach(schedule => {
        if (schedule.enabled === false || !Array.isArray(schedule.days) || !schedule.days.includes(day)) return;
        if (schedule.startDate && dateKey < schedule.startDate) return;
        if (schedule.endDate && dateKey > schedule.endDate) return;
        const template = templates.find(item => item.id === schedule.templateId);
        if (!template) return;
        const task = {
          id: makeId(), title: String(schedule.title || template.title || template.name || 'Scheduled task').trim(),
          module: schedule.module || template.module || 'planner', date: dateKey,
          priority: normalizePriority(schedule.priority || template.priority), status: 'open',
          estimate: Number(schedule.estimate ?? template.estimate ?? 0), source: 'schedule', sourceId: schedule.id,
          createdAt: new Date().toISOString(), completedAt: null, notes: schedule.notes || template.notes || ''
        };
        const key = taskFingerprint(task);
        if (!fingerprints.has(key)) { fingerprints.add(key); output.push(task); }
      });
    }
    return output;
  }

  function buildNotifications({ tasks = [], tournaments = [], calendar = [], dismissed = {}, today = isoDate() }) {
    const notices = [];
    const openToday = tasks.filter(task => task.date === today && task.status !== 'done');
    const overdue = tasks.filter(task => task.date && task.date < today && task.status !== 'done');
    if (overdue.length) notices.push({ key:'tasks-overdue', level:'high', title:`${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`, detail:'Review or reschedule unfinished work.', route:'control' });
    if (openToday.length) notices.push({ key:'tasks-open', level:'medium', title:`${openToday.length} task${openToday.length === 1 ? '' : 's'} remain today`, detail:'Complete the highest-priority action next.', route:'control' });
    const future = [...tournaments, ...calendar.filter(item => item.category === 'Tournament')]
      .filter(item => item.date && item.date >= today)
      .sort((a,b) => a.date.localeCompare(b.date));
    if (future[0]) {
      const days = Math.ceil((new Date(`${future[0].date}T00:00:00`) - new Date(`${today}T00:00:00`)) / DAY_MS);
      if (days <= 14) notices.push({ key:`event-${future[0].id || future[0].title}`, level: days <= 3 ? 'high' : 'medium', title:`${future[0].name || future[0].title} in ${days} day${days === 1 ? '' : 's'}`, detail:'Keep preparation aligned with the event date.', route:'control' });
    }
    return notices.filter(notice => dismissed[notice.key] !== today);
  }

  function buildDashboardCards({ tasks = [], tournaments = [], calendar = [], achievements = [], today = isoDate() }) {
    const cards = [];
    const todayTasks = tasks.filter(task => task.date === today);
    const open = todayTasks.filter(task => task.status !== 'done');
    const done = todayTasks.length - open.length;
    if (todayTasks.length) cards.push({ key:'task-progress', rank:10, kicker:'TODAY', title:`${done}/${todayTasks.length} tasks complete`, detail: open.length ? `${open.length} action${open.length === 1 ? '' : 's'} remain.` : 'Today’s queue is complete.', route:'control' });
    const urgent = open.find(task => task.priority === 'high');
    if (urgent) cards.push({ key:'priority', rank:5, kicker:'NEXT ACTION', title:urgent.title, detail:`${urgent.module} · ${urgent.estimate || 0} min`, route:'control' });
    const future = [...tournaments, ...calendar.filter(item => item.category === 'Tournament')].filter(item => item.date && item.date >= today).sort((a,b)=>a.date.localeCompare(b.date));
    if (future[0]) {
      const days = Math.ceil((new Date(`${future[0].date}T00:00:00`) - new Date(`${today}T00:00:00`)) / DAY_MS);
      cards.push({ key:'countdown', rank:15, kicker:'COUNTDOWN', title:`${days} days`, detail:future[0].name || future[0].title, route:'control' });
    }
    if (achievements.length) cards.push({ key:'achievement', rank:30, kicker:'MOMENTUM', title:achievements.at(-1).title, detail:'Latest achievement earned.', route:'control' });
    if (!cards.length) cards.push({ key:'empty', rank:99, kicker:'READY', title:'Build today’s mission', detail:'Add a task or recurring schedule to begin.', route:'control' });
    return cards.sort((a,b) => a.rank - b.rank);
  }

  function install(app) {
    const { document, localStorage } = app;
    const nowIso = () => new Date().toISOString();

    function ensureAutomationState() {
      app.state.os = app.state.os || {};
      app.state.os.tasks = Array.isArray(app.state.os.tasks) ? app.state.os.tasks : [];
      app.state.os.schedules = Array.isArray(app.state.os.schedules) ? app.state.os.schedules : [];
      app.state.os.templates = Array.isArray(app.state.os.templates) ? app.state.os.templates : [];
      app.state.os.notifications = Array.isArray(app.state.os.notifications) ? app.state.os.notifications : [];
      app.state.os.notificationDismissals = app.state.os.notificationDismissals && typeof app.state.os.notificationDismissals === 'object' ? app.state.os.notificationDismissals : {};
      app.state.os.automation = { version: VERSION, lastRunAt:null, lookaheadDays:7, ...(app.state.os.automation || {}) };
    }

    function runScheduler() {
      ensureAutomationState();
      const generated = createScheduledTasks({ schedules:app.state.os.schedules, templates:app.state.os.templates, tasks:app.state.os.tasks, days:app.state.os.automation.lookaheadDays, makeId:app.id });
      app.state.os.tasks.push(...generated);
      app.state.os.automation.lastRunAt = nowIso();
      if (generated.length && typeof app.logActivity === 'function') app.logActivity('scheduler.generated','planner',`${generated.length} scheduled task${generated.length === 1 ? '' : 's'} generated`);
      return generated.length;
    }

    function refreshAutomationNotifications() {
      ensureAutomationState();
      const routed = buildNotifications({ tasks:app.state.os.tasks, tournaments:app.state.tournaments || [], calendar:app.state.os.calendar || [], dismissed:app.state.os.notificationDismissals });
      const retained = app.state.os.notifications.filter(item => item.source !== 'automation');
      app.state.os.notifications = [...retained, ...routed.map(item => ({ ...item, id:app.id(), source:'automation', createdAt:nowIso() }))];
    }

    function injectUI() {
      const control = document.querySelector('[data-view="control"]');
      if (!control || document.querySelector('#automationDashboard')) return;
      const brief = document.querySelector('#osPriorityBrief');
      brief?.insertAdjacentHTML('afterend', `<section class="section-block" id="automationDashboard"><div class="section-head"><div><span class="kicker">DYNAMIC COMMAND CARDS</span><h3>What matters now</h3></div><button id="automationRun" class="secondary-btn">Run Automation</button></div><div id="automationCards" class="automation-card-grid"></div></section>`);
      const notices = document.querySelector('#osNotifications');
      notices?.closest('.section-block')?.querySelector('.section-head')?.insertAdjacentHTML('beforeend','<button id="automationClearNotices" class="mini-btn">Dismiss Today</button>');
      const schedules = document.querySelector('#platformSchedules');
      schedules?.closest('.section-block')?.querySelector('.section-head')?.insertAdjacentHTML('beforeend','<button id="automationAddTemplate" class="mini-btn">Add Template</button>');
    }

    function renderAutomation() {
      ensureAutomationState();
      runScheduler();
      refreshAutomationNotifications();
      injectUI();
      const cards = buildDashboardCards({ tasks:app.state.os.tasks, tournaments:app.state.tournaments || [], calendar:app.state.os.calendar || [], achievements:app.state.os.achievements || [] });
      const target = document.querySelector('#automationCards');
      if (target) target.innerHTML = cards.map(card => `<button class="automation-card" data-nav="${app.esc(card.route)}"><span class="kicker">${app.esc(card.kicker)}</span><strong>${app.esc(card.title)}</strong><small>${app.esc(card.detail)}</small></button>`).join('');
      const notices = document.querySelector('#osNotifications');
      if (notices) notices.innerHTML = app.state.os.notifications.map(n => `<article class="list-card os-notice ${app.esc(n.level || 'medium')}"><div class="grow"><strong>${app.esc(n.title)}</strong><small>${app.esc(n.detail || '')}</small></div><button class="mini-btn" data-automation-dismiss="${app.esc(n.key || n.id)}">×</button></article>`).join('') || app.empty('No active notifications.');
      const count = document.querySelector('#osNoticeCount'); if (count) count.textContent = `${app.state.os.notifications.length} active`;
      const version = document.querySelector('[data-view="more"] .version'); if (version) version.textContent = `Iron Disciple OS ${VERSION} — Core Platform Automated`;
    }

    function addTemplate() {
      const name = app.prompt('Template name'); if (!name) return;
      const title = app.prompt('Default task title', name); if (!title) return;
      const module = (app.prompt('Module', 'planner') || 'planner').trim().toLowerCase();
      const priority = normalizePriority((app.prompt('Priority: high, medium, or low', 'medium') || 'medium').trim().toLowerCase());
      const estimate = Math.max(0, Number(app.prompt('Estimated minutes', '30') || 0));
      app.state.os.templates.push({ id:app.id(), name:name.trim(), title:title.trim(), module, priority, estimate, createdAt:nowIso() });
      app.save();
    }

    ensureAutomationState();
    runScheduler();
    refreshAutomationNotifications();
    injectUI();

    document.addEventListener('click', event => {
      if (event.target.closest('#automationRun')) { const count = runScheduler(); refreshAutomationNotifications(); app.save(); app.alert(`${count} new scheduled task${count === 1 ? '' : 's'} generated.`); }
      if (event.target.closest('#automationAddTemplate')) addTemplate();
      const dismiss = event.target.closest('[data-automation-dismiss]');
      if (dismiss) { app.state.os.notificationDismissals[dismiss.dataset.automationDismiss] = isoDate(); app.save(); }
      if (event.target.closest('#automationClearNotices')) { app.state.os.notifications.forEach(n => { app.state.os.notificationDismissals[n.key || n.id] = isoDate(); }); app.save(); }
    });

    const previousRender = app.render;
    app.render = function automatedRender() { ensureAutomationState(); runScheduler(); refreshAutomationNotifications(); previousRender(); renderAutomation(); };
    localStorage.setItem(app.KEY, JSON.stringify(app.state));
    app.render();
  }

  return { VERSION, VALID_DAYS, isoDate, weekday, addDays, taskFingerprint, createScheduledTasks, buildNotifications, buildDashboardCards, install };
});
