/* Iron Disciple OS — Core Platform Hardening v1.3.0 */
(() => {
  'use strict';

  const VERSION = '1.3.0';
  const CRASH_KEY = 'ironDiscipleOS.crashRecovery.v1';
  const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
  const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

  function ensureHardeningState() {
    state.os = state.os || {};
    state.os.settings = {
      units: 'imperial', notifications: true, developerMode: false,
      autoSnapshot: true, compactMissionControl: false, theme: 'system',
      ...(state.os.settings || {})
    };
    state.os.errors = Array.isArray(state.os.errors) ? state.os.errors : [];
    state.os.security = {
      lastImportAt: null, lastImportStatus: 'none', lastIntegrityCheckAt: null,
      recoveryAvailable: Boolean(localStorage.getItem(CRASH_KEY)),
      ...(state.os.security || {})
    };
  }

  function recordError(kind, message, detail = {}) {
    ensureHardeningState();
    state.os.errors.push({
      id: id(), kind, message: String(message || 'Unknown error').slice(0, 500),
      detail, timestamp: new Date().toISOString()
    });
    if (state.os.errors.length > 100) state.os.errors.splice(0, state.os.errors.length - 100);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  function saveRecovery(reason = 'runtime') {
    try {
      const payload = { app: 'Iron Disciple OS', version: VERSION, reason, savedAt: new Date().toISOString(), data: state };
      localStorage.setItem(CRASH_KEY, JSON.stringify(payload));
      state.os.security.recoveryAvailable = true;
    } catch (error) {
      recordError('recovery', error.message);
    }
  }

  function restoreRecovery() {
    try {
      const raw = localStorage.getItem(CRASH_KEY);
      if (!raw) return alert('No crash-recovery copy is available.');
      const parsed = JSON.parse(raw);
      if (!parsed?.data || typeof parsed.data !== 'object') throw new Error('Recovery copy is invalid.');
      if (!confirm(`Restore recovery copy from ${new Date(parsed.savedAt).toLocaleString()}?`)) return;
      state = merge(structuredClone(defaults), sanitizeObject(parsed.data));
      save();
      alert('Recovery copy restored.');
    } catch (error) {
      recordError('recovery.restore', error.message);
      alert('The recovery copy could not be restored.');
    }
  }

  function sanitizeObject(value, depth = 0) {
    if (depth > 30) throw new Error('Backup nesting is too deep.');
    if (value === null || ['string','number','boolean'].includes(typeof value)) return value;
    if (Array.isArray(value)) return value.slice(0, 20000).map(item => sanitizeObject(item, depth + 1));
    if (typeof value !== 'object') return null;
    const clean = Object.create(null);
    for (const [key, item] of Object.entries(value)) {
      if (BLOCKED_KEYS.has(key)) continue;
      clean[key] = sanitizeObject(item, depth + 1);
    }
    return clean;
  }

  function validateImport(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid backup structure.');
    const candidate = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
    if (!candidate.mission || !candidate.settings) throw new Error('Required application sections are missing.');
    if (candidate.os && candidate.os.tasks && !Array.isArray(candidate.os.tasks)) throw new Error('Task database is malformed.');
    return sanitizeObject(candidate);
  }

  function installSecureImport() {
    const input = document.querySelector('#importFile');
    if (!input) return;
    input.onchange = async event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      try {
        if (file.size > MAX_IMPORT_BYTES) throw new Error('Backup exceeds the 5 MB safety limit.');
        const parsed = JSON.parse(await file.text());
        const clean = validateImport(parsed);
        if (!confirm('Restore this verified backup? Current device data will be replaced.')) return;
        saveRecovery('before-import');
        state = merge(structuredClone(defaults), clean);
        ensureHardeningState();
        state.os.security.lastImportAt = new Date().toISOString();
        state.os.security.lastImportStatus = 'passed';
        save();
        alert('Backup verified and restored.');
      } catch (error) {
        ensureHardeningState();
        state.os.security.lastImportAt = new Date().toISOString();
        state.os.security.lastImportStatus = 'failed';
        recordError('import', error.message);
        alert(`Import blocked: ${error.message}`);
      }
    };
  }

  function applyTheme() {
    const theme = state.os?.settings?.theme || 'system';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'system' ? 'dark light' : theme;
  }

  function injectSettings() {
    const form = document.querySelector('[data-view="more"] .form-card');
    if (!form || document.querySelector('#platformTheme')) return;
    form.insertAdjacentHTML('beforeend', `
      <label>Appearance<select id="platformTheme"><option value="system">System</option><option value="dark">Dark</option><option value="light">Light</option></select></label>
      <label>Units<select id="platformUnits"><option value="imperial">Imperial</option><option value="metric">Metric</option></select></label>
      <label class="toggle-row">Developer mode<input id="platformDeveloperMode" type="checkbox"></label>
      <label class="toggle-row">Automatic recovery copy<input id="platformAutoRecovery" type="checkbox"></label>
    `);
    const menu = document.querySelector('[data-view="more"] .menu-list');
    menu?.insertAdjacentHTML('beforeend', '<button id="platformRestoreRecovery"><span>Restore Recovery Copy</span><small>Recover data saved before a crash or import</small></button><button data-nav="developer" id="platformDeveloperLink"><span>Developer Console</span><small>Storage, queues, errors, and application internals</small></button>');
  }

  function injectDeveloperConsole() {
    if (document.querySelector('[data-view="developer"]')) return;
    document.querySelector('[data-view="more"]').insertAdjacentHTML('beforebegin', `
      <section class="view" data-view="developer">
        <section class="page-intro"><span class="kicker">DEVELOPER MODE</span><h2>Platform Console</h2><p>Inspect the application without altering module data.</p></section>
        <div class="developer-actions"><button id="devRefresh" class="primary-btn">Refresh</button><button id="devIntegrity" class="secondary-btn">Run Integrity Check</button><button id="devClearErrors" class="secondary-btn">Clear Errors</button></div>
        <div id="devSummary" class="review-grid"></div>
        <div class="platform-grid"><section class="section-block flush"><div class="section-head"><div><span class="kicker">QUEUES</span><h3>Runtime Services</h3></div></div><div id="devQueues" class="card-list"></div></section><section class="section-block flush"><div class="section-head"><div><span class="kicker">STORAGE</span><h3>Device Capacity</h3></div></div><div id="devStorage" class="card-list"></div></section></div>
        <section class="section-block"><div class="section-head"><div><span class="kicker">ERROR LOG</span><h3>Captured Runtime Errors</h3></div></div><div id="devErrors" class="card-list"></div></section>
        <section class="section-block"><div class="section-head"><div><span class="kicker">DATABASE</span><h3>Read-only State Preview</h3></div></div><pre id="devStatePreview" class="developer-code"></pre></section>
      </section>`);
  }

  async function storageReport() {
    let estimate = {};
    try { estimate = await navigator.storage?.estimate?.() || {}; } catch {}
    const localBytes = new Blob(Object.values(localStorage)).size;
    const used = Number(estimate.usage || localBytes);
    const quota = Number(estimate.quota || 0);
    return { used, quota, localBytes };
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B','KB','MB','GB']; let i = 0; let n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
  }

  function integrityResults() {
    ensureHardeningState();
    const uniqueTaskIds = new Set((state.os.tasks || []).map(x => x.id)).size === (state.os.tasks || []).length;
    const validDates = [...(state.os.tasks || []), ...(state.os.calendar || [])].every(x => !x.date || /^\d{4}-\d{2}-\d{2}$/.test(x.date));
    const moduleIds = new Set((state.os.modules || []).map(x => x.id));
    const uniqueModules = moduleIds.size === (state.os.modules || []).length;
    return [
      ['Application state', Boolean(state && typeof state === 'object')],
      ['Task identifiers', uniqueTaskIds],
      ['Stored dates', validDates],
      ['Module identifiers', uniqueModules],
      ['Local storage', (() => { try { localStorage.setItem('__id_test','1'); localStorage.removeItem('__id_test'); return true; } catch { return false; } })()],
      ['Service worker', 'serviceWorker' in navigator],
      ['Recovery system', Boolean(state.os.security)]
    ];
  }

  async function renderDeveloper() {
    const view = document.querySelector('[data-view="developer"]');
    if (!view) return;
    const allowed = Boolean(state.os.settings.developerMode);
    view.querySelectorAll('button,pre').forEach(el => el.hidden = !allowed);
    const summary = document.querySelector('#devSummary');
    if (!allowed) {
      summary.innerHTML = '<article class="review-card"><span class="kicker">LOCKED</span><strong>Developer mode is disabled</strong><small>Enable it in More → Settings.</small></article>';
      document.querySelector('#devQueues').innerHTML = empty('Developer mode is required.');
      document.querySelector('#devStorage').innerHTML = empty('Developer mode is required.');
      document.querySelector('#devErrors').innerHTML = empty('Developer mode is required.');
      return;
    }
    const results = integrityResults();
    summary.innerHTML = results.map(([name, pass]) => `<article class="review-card"><span class="kicker">${pass ? 'PASS' : 'CHECK'}</span><strong>${esc(name)}</strong><small>${pass ? 'Healthy' : 'Needs attention'}</small></article>`).join('');
    document.querySelector('#devQueues').innerHTML = [
      ['Tasks', state.os.tasks?.length || 0], ['Schedules', state.os.schedules?.length || 0],
      ['Notifications', state.os.notifications?.length || 0], ['Activity events', state.os.activity?.length || 0],
      ['Snapshots', JSON.parse(localStorage.getItem('ironDiscipleOS.snapshots.v1') || '[]').length]
    ].map(([name,value]) => `<article class="list-card"><strong>${esc(name)}</strong><small>${value}</small></article>`).join('');
    const storage = await storageReport();
    document.querySelector('#devStorage').innerHTML = `<article class="list-card"><strong>Application data</strong><small>${formatBytes(storage.localBytes)}</small></article><article class="list-card"><strong>Browser usage</strong><small>${formatBytes(storage.used)}${storage.quota ? ` of ${formatBytes(storage.quota)}` : ''}</small></article><article class="list-card"><strong>Recovery copy</strong><small>${localStorage.getItem(CRASH_KEY) ? 'Available' : 'Not created'}</small></article>`;
    document.querySelector('#devErrors').innerHTML = state.os.errors.slice(-20).reverse().map(error => `<article class="list-card"><div class="grow"><small>${new Date(error.timestamp).toLocaleString()} · ${esc(error.kind)}</small><strong>${esc(error.message)}</strong></div></article>`).join('') || empty('No runtime errors have been captured.');
    document.querySelector('#devStatePreview').textContent = JSON.stringify({ version: VERSION, os: state.os, profile: state.profile, tournaments: state.tournaments }, null, 2).slice(0, 30000);
  }

  function syncControls() {
    const theme = document.querySelector('#platformTheme'); if (theme) theme.value = state.os.settings.theme || 'system';
    const units = document.querySelector('#platformUnits'); if (units) units.value = state.os.settings.units || 'imperial';
    const dev = document.querySelector('#platformDeveloperMode'); if (dev) dev.checked = Boolean(state.os.settings.developerMode);
    const recovery = document.querySelector('#platformAutoRecovery'); if (recovery) recovery.checked = state.os.settings.autoRecovery !== false;
    const link = document.querySelector('#platformDeveloperLink'); if (link) link.hidden = !state.os.settings.developerMode;
    const version = document.querySelector('[data-view="more"] .version'); if (version) version.textContent = `Iron Disciple OS ${VERSION} — Core Platform Hardened`;
  }

  ensureHardeningState();
  injectSettings();
  injectDeveloperConsole();
  installSecureImport();
  applyTheme();
  syncControls();

  window.addEventListener('error', event => { recordError('javascript', event.message, { file:event.filename, line:event.lineno, column:event.colno }); if (state.os.settings.autoRecovery !== false) saveRecovery('javascript-error'); });
  window.addEventListener('unhandledrejection', event => { recordError('promise', event.reason?.message || event.reason || 'Unhandled promise rejection'); if (state.os.settings.autoRecovery !== false) saveRecovery('promise-rejection'); });
  window.addEventListener('pagehide', () => { if (state.os.settings.autoRecovery !== false) saveRecovery('pagehide'); });

  document.addEventListener('change', event => {
    if (event.target.matches('#platformTheme')) { state.os.settings.theme = event.target.value; applyTheme(); save(); }
    if (event.target.matches('#platformUnits')) { state.os.settings.units = event.target.value; save(); }
    if (event.target.matches('#platformDeveloperMode')) { state.os.settings.developerMode = event.target.checked; save(); }
    if (event.target.matches('#platformAutoRecovery')) { state.os.settings.autoRecovery = event.target.checked; save(); }
  });
  document.addEventListener('click', event => {
    if (event.target.closest('#platformRestoreRecovery')) restoreRecovery();
    if (event.target.closest('#devRefresh')) renderDeveloper();
    if (event.target.closest('#devIntegrity')) { state.os.security.lastIntegrityCheckAt = new Date().toISOString(); renderDeveloper(); alert(integrityResults().every(([,pass]) => pass) ? 'Integrity check passed.' : 'Integrity check found items to review.'); }
    if (event.target.closest('#devClearErrors')) { state.os.errors = []; save(); }
  });

  const baseRender = render;
  render = function hardenedRender() { ensureHardeningState(); baseRender(); applyTheme(); syncControls(); if (document.querySelector('[data-view="developer"]')?.classList.contains('active')) renderDeveloper(); };
  const baseNav = nav;
  nav = function hardenedNav(name, options = {}) { baseNav(name, options); if (name === 'developer') { document.querySelector('#pageTitle').textContent = 'Developer Console'; document.title = 'Developer Console · Iron Disciple OS'; renderDeveloper(); } };

  localStorage.setItem(KEY, JSON.stringify(state));
  render();
})();
