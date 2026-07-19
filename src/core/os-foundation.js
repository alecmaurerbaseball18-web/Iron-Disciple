/* Iron Disciple OS — Core Application Framework */
(() => {
  'use strict';

  const OS_SCHEMA_VERSION = 2;
  const moduleRegistry = [
    { id:'mission-control', name:'Mission Control', view:'control', status:'active', icon:'⌂' },
    { id:'training', name:'Training', view:'body', status:'foundation', icon:'△' },
    { id:'nutrition', name:'Nutrition', view:'body', status:'foundation', icon:'◇' },
    { id:'golf', name:'Golf', view:'golf', status:'active', icon:'⛳' },
    { id:'softball', name:'Softball', view:'control', status:'foundation', icon:'◆' },
    { id:'faith', name:'Faith', view:'knowledge', status:'foundation', icon:'✦' },
    { id:'planner', name:'Planner', view:'execute', status:'active', icon:'✓' },
    { id:'projects', name:'Projects', view:'build', status:'active', icon:'◇' }
  ];

  function ensureOSState() {
    state.os = state.os || {};
    state.os.schemaVersion = OS_SCHEMA_VERSION;
    state.os.notifications = Array.isArray(state.os.notifications) ? state.os.notifications : [];
    state.os.achievements = Array.isArray(state.os.achievements) ? state.os.achievements : [];
    state.os.calendar = Array.isArray(state.os.calendar) ? state.os.calendar : [];
    state.os.notes = Array.isArray(state.os.notes) ? state.os.notes : [];
    state.os.activity = Array.isArray(state.os.activity) ? state.os.activity : [];
    state.os.modules = moduleRegistry;
    state.os.settings = { units:'imperial', notifications:true, developerMode:false, ...(state.os.settings || {}) };
    seedCalendar();
    refreshNotifications();
    evaluateAchievements(false);
  }

  function seedCalendar() {
    const existing = new Set(state.os.calendar.map(item => `${item.source}:${item.sourceId}`));
    (state.tournaments || []).forEach(event => {
      const key = `tournament:${event.id}`;
      if (!existing.has(key)) state.os.calendar.push({ id:id(), source:'tournament', sourceId:event.id, title:event.name, date:event.date, category:event.sport || 'Tournament', done:false });
    });
  }

  function daysUntil(date) {
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(`${date}T00:00:00`);
    return Math.ceil((target - today) / 86400000);
  }

  function completionItems() {
    const body = bodyToday();
    return [
      ['Big Three', state.bigThree.length > 0 && state.bigThree.slice(0,3).every(x => x.done)],
      ['Workout', Boolean(state.workout?.done)],
      ['Habits', state.habits.length > 0 && state.habits.every(x => x.done)],
      ['Water', Number(body.water || 0) >= Number(state.bodyGoals.water || 128)],
      ['Steps', Number(body.steps || 0) >= Number(state.bodyGoals.steps || 10000)],
      ['Evening Review', state.routines.some(x => /evening/i.test(x.text) && x.done)]
    ];
  }

  function missionScore() {
    const items = completionItems();
    return percent(items.filter(([,done]) => done).length, items.length);
  }

  function refreshNotifications() {
    const notices = [];
    if (!state.workout?.done) notices.push({ id:'workout-due', level:'priority', title:'Workout remains open', detail:state.workout?.name || 'Plan today’s training.' });
    const body = bodyToday();
    if (Number(body.water || 0) < Number(state.bodyGoals.water || 128)) notices.push({ id:'water-due', level:'normal', title:'Hydration target incomplete', detail:`${body.water || 0}/${state.bodyGoals.water || 128} oz logged.` });
    const next = [...(state.tournaments || [])].filter(x => x.date && daysUntil(x.date) >= 0).sort((a,b) => a.date.localeCompare(b.date))[0];
    if (next) notices.push({ id:'next-event', level:'info', title:`${daysUntil(next.date)} days until ${next.name}`, detail:`${next.sport || 'Event'} preparation window.` });
    state.os.notifications = notices;
  }

  function evaluateAchievements(announce=true) {
    const earned = new Set(state.os.achievements.map(x => x.key));
    const candidates = [
      ['foundation-ready','Foundation Ready','Completed the application foundation setup.', Boolean(state.system?.onboardingComplete)],
      ['first-workout','First Rep','Completed the first logged workout.', Boolean(state.workout?.done || state.workouts?.some(x => x.done))],
      ['mission-100','Mission Complete','Reached a 100% daily mission score.', missionScore() === 100],
      ['event-loaded','Target Locked','Added tournament goals to the unified calendar.', (state.tournaments || []).length > 0]
    ];
    const newlyEarned = [];
    candidates.forEach(([key,title,detail,condition]) => {
      if (condition && !earned.has(key)) {
        const achievement = { id:id(), key, title, detail, earnedAt:new Date().toISOString() };
        state.os.achievements.push(achievement); newlyEarned.push(achievement);
      }
    });
    if (announce && newlyEarned.length) document.querySelector('#appStatus').textContent = `Achievement earned: ${newlyEarned[0].title}`;
  }

  function injectUI() {
    if (!document.querySelector('[data-view="control"]')) {
      document.querySelector('[data-view="more"]').insertAdjacentHTML('beforebegin', `
        <section class="view" data-view="control">
          <section class="page-intro control-intro"><div><span class="kicker">MISSION CONTROL</span><h2>Your operating picture</h2><p>One command center for preparation, execution, and progress.</p></div><div class="mission-score"><strong id="osMissionScore">0%</strong><span>Today</span></div></section>
          <div id="osPriorityBrief" class="control-brief"></div>
          <div class="control-grid">
            <section class="section-block flush"><div class="section-head"><div><span class="kicker">TODAY</span><h3>Universal Progress</h3></div></div><div id="osProgressList" class="os-progress-list"></div></section>
            <section class="section-block flush"><div class="section-head"><div><span class="kicker">ALERTS</span><h3>Notifications</h3></div><span id="osNoticeCount" class="status-pill">0</span></div><div id="osNotifications" class="card-list"></div></section>
          </div>
          <section class="section-block"><div class="section-head"><div><span class="kicker">CALENDAR</span><h3>Unified Schedule</h3></div><button id="osAddEvent" class="primary-btn">Add Event</button></div><div id="osCalendar" class="os-calendar"></div></section>
          <div class="control-grid">
            <section class="section-block flush"><div class="section-head"><div><span class="kicker">KNOWLEDGE</span><h3>Universal Notes</h3></div><button id="osAddNote" class="secondary-btn">Add Note</button></div><div id="osNotes" class="card-list"></div></section>
            <section class="section-block flush"><div class="section-head"><div><span class="kicker">MOMENTUM</span><h3>Achievements</h3></div></div><div id="osAchievements" class="card-list"></div></section>
          </div>
          <section class="section-block"><div class="section-head"><div><span class="kicker">MODULE REGISTRY</span><h3>Expandable System</h3></div></div><div id="osModules" class="module-grid"></div></section>
          <section class="section-block"><div class="section-head"><div><span class="kicker">DIAGNOSTICS</span><h3>System Integrity</h3></div><button id="osRunDiagnostics" class="secondary-btn">Run Diagnostics</button></div><div id="osDiagnostics" class="review-grid"></div></section>
        </section>`);
    }
    if (!document.querySelector('.bottom-nav [data-nav="control"]')) {
      document.querySelector('.bottom-nav [data-nav="today"]').insertAdjacentHTML('afterend','<button data-nav="control"><span>▦</span><small>Control</small></button>');
    }
    const moreMenu = document.querySelector('[data-view="more"] .menu-list');
    if (moreMenu && !moreMenu.querySelector('[data-nav="control"]')) moreMenu.insertAdjacentHTML('afterbegin','<button data-nav="control"><span>Mission Control</span><small>Progress, calendar, alerts, notes, and diagnostics</small></button>');
    const version = document.querySelector('[data-view="more"] .version');
    if (version) version.textContent = 'Iron Disciple OS 1.2.0 — Core Platform';
  }

  function renderControl() {
    refreshNotifications(); evaluateAchievements(false); seedCalendar();
    const score = missionScore();
    const scoreEl = document.querySelector('#osMissionScore'); if (scoreEl) scoreEl.textContent = `${score}%`;
    const next = [...(state.tournaments || [])].filter(x => x.date && daysUntil(x.date) >= 0).sort((a,b) => a.date.localeCompare(b.date))[0];
    const brief = document.querySelector('#osPriorityBrief');
    if (brief) brief.innerHTML = `<div><span class="kicker">COMMANDER'S BRIEF</span><h3>${score >= 80 ? 'Protect the momentum.' : 'Win the next action.'}</h3><p>${next ? `${esc(next.name)} is ${daysUntil(next.date)} days away. ` : ''}${state.workout?.done ? 'Training is complete.' : 'Training is still open.'}</p></div><button class="primary-btn" data-nav="execute">Open Today’s Plan</button>`;
    const progress = document.querySelector('#osProgressList');
    if (progress) progress.innerHTML = completionItems().map(([label,done]) => `<div class="os-progress-row"><span>${done?'✓':'○'}</span><strong>${esc(label)}</strong><small>${done?'Complete':'Open'}</small></div>`).join('');
    const notices = document.querySelector('#osNotifications');
    if (notices) notices.innerHTML = state.os.notifications.map(n => `<article class="list-card os-notice ${n.level}"><strong>${esc(n.title)}</strong><small>${esc(n.detail)}</small></article>`).join('') || empty('No active notifications.');
    const count = document.querySelector('#osNoticeCount'); if (count) count.textContent = `${state.os.notifications.length} active`;
    const calendar = document.querySelector('#osCalendar');
    if (calendar) calendar.innerHTML = [...state.os.calendar].sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,12).map(e => `<article class="calendar-row"><time>${esc(e.date)}</time><div><strong>${esc(e.title)}</strong><small>${esc(e.category || 'General')}</small></div><button class="icon-btn" data-os-delete-event="${e.id}">×</button></article>`).join('') || empty('No calendar events.');
    const notes = document.querySelector('#osNotes');
    if (notes) notes.innerHTML = state.os.notes.slice(-6).reverse().map(n => `<article class="list-card"><span class="type-pill">${esc(n.tag || 'General')}</span><strong>${esc(n.title)}</strong><small>${esc(n.body)}</small></article>`).join('') || empty('Capture a note from any area of life.');
    const achievements = document.querySelector('#osAchievements');
    if (achievements) achievements.innerHTML = state.os.achievements.slice(-6).reverse().map(a => `<article class="list-card achievement-card"><strong>🏆 ${esc(a.title)}</strong><small>${esc(a.detail)}</small></article>`).join('') || empty('Achievements will appear as milestones are completed.');
    const modules = document.querySelector('#osModules');
    if (modules) modules.innerHTML = state.os.modules.map(m => `<button class="module-card" data-nav="${m.view}"><span>${m.icon}</span><strong>${esc(m.name)}</strong><small>${esc(m.status)}</small></button>`).join('');
    renderDiagnostics(false);
  }

  function diagnosticResults() {
    const storage = (()=>{try{localStorage.setItem('__os_test','1');localStorage.removeItem('__os_test');return true}catch{return false}})();
    return [
      ['Schema', state.os?.schemaVersion === OS_SCHEMA_VERSION],
      ['Storage', storage],
      ['Module registry', state.os?.modules?.length === moduleRegistry.length],
      ['Calendar integrity', Array.isArray(state.os?.calendar)],
      ['Backup controls', Boolean(document.querySelector('#exportData') && document.querySelector('#importData'))],
      ['Offline shell', 'serviceWorker' in navigator],
      ['Profile', Boolean(state.profile?.name)],
      ['Tournament targets', (state.tournaments || []).length > 0]
    ];
  }

  function renderDiagnostics(announce=true) {
    const results = diagnosticResults();
    const target = document.querySelector('#osDiagnostics');
    if (target) target.innerHTML = results.map(([name,pass]) => `<article class="review-card"><span class="kicker">${pass?'PASS':'CHECK'}</span><strong>${esc(name)}</strong><small>${pass?'Healthy':'Needs attention'}</small></article>`).join('');
    state.system = state.system || {}; state.system.lastCoreDiagnosticAt = new Date().toISOString(); state.system.coreDiagnosticPassed = results.every(([,pass])=>pass);
    localStorage.setItem(KEY, JSON.stringify(state));
    if (announce) alert(state.system.coreDiagnosticPassed ? 'Core framework diagnostics passed.' : 'Diagnostics found items that need attention.');
  }

  function addEvent() {
    const title = prompt('Event name'); if (!title) return;
    const date = prompt('Date (YYYY-MM-DD)', todayKey()); if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return alert('Use YYYY-MM-DD.');
    const category = prompt('Category', 'General') || 'General';
    state.os.calendar.push({ id:id(), title:title.trim(), date, category, source:'manual', done:false }); save();
  }

  function addNote() {
    const title = prompt('Note title'); if (!title) return;
    const body = prompt('Note'); if (!body) return;
    const tag = prompt('Tag', 'General') || 'General';
    state.os.notes.push({ id:id(), title:title.trim(), body:body.trim(), tag:tag.trim(), createdAt:new Date().toISOString() }); save();
  }

  ensureOSState(); injectUI();

  document.addEventListener('click', event => {
    const navButton = event.target.closest('[data-nav]');
    if (navButton && navButton.dataset.nav === 'control') nav('control');
    if (event.target.closest('#osAddEvent')) addEvent();
    if (event.target.closest('#osAddNote')) addNote();
    if (event.target.closest('#osRunDiagnostics')) renderDiagnostics(true);
    const del = event.target.closest('[data-os-delete-event]');
    if (del) { state.os.calendar = state.os.calendar.filter(x => x.id !== del.dataset.osDeleteEvent); save(); }
  });

  const baseRender = render;
  render = function osFrameworkRender() { ensureOSState(); baseRender(); renderControl(); };
  const baseNav = nav;
  nav = function osFrameworkNav(name, options={}) { baseNav(name, options); if (name === 'control') { document.querySelector('#pageTitle').textContent='Mission Control'; document.title='Mission Control · Iron Disciple OS'; renderControl(); } };

  localStorage.setItem(KEY, JSON.stringify(state));
  render();
})();
