/* Iron Disciple OS — Phase 1 Foundation Enhancements */
(() => {
  'use strict';

  const SCHEMA_VERSION = 1;
  const PROFILE_DEFAULTS = {
    name: '',
    currentWeight: 220,
    goalWeight: 195,
    currentBodyFat: 30,
    goalBodyFat: 10,
    golfHandicap: 18.6,
    softballPosition: 'Third Base',
    weeklyTrainingHours: 10,
    notes: ''
  };
  const TOURNAMENT_DEFAULTS = [
    { id: id(), name: 'Charity Softball Tournament', sport: 'Softball', date: '2026-10-11', priority: 'Primary' },
    { id: id(), name: 'Softball Tournament', sport: 'Softball', date: '2026-10-17', priority: 'Primary' },
    { id: id(), name: 'Golf Tournament', sport: 'Golf', date: '2026-10-19', priority: 'Primary' }
  ];

  function ensureFoundationState() {
    state.schemaVersion = Number(state.schemaVersion || SCHEMA_VERSION);
    state.profile = { ...PROFILE_DEFAULTS, ...(state.profile || {}) };
    state.tournaments = Array.isArray(state.tournaments) && state.tournaments.length
      ? state.tournaments
      : TOURNAMENT_DEFAULTS;
    state.system = {
      createdAt: state.system?.createdAt || new Date().toISOString(),
      lastSavedAt: state.system?.lastSavedAt || '',
      lastBackupAt: state.system?.lastBackupAt || '',
      ...state.system
    };
  }

  function daysUntil(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${date}T00:00:00`);
    return Math.ceil((target - today) / 86400000);
  }

  function injectFoundationUI() {
    if (!document.querySelector('[data-view="profile"]')) {
      const moreView = document.querySelector('[data-view="more"]');
      moreView.insertAdjacentHTML('beforebegin', `
        <section class="view" data-view="profile">
          <section class="page-intro">
            <div><span class="kicker">FOUNDATION</span><h2>Profile & Events</h2><p>Set the personal targets and competition dates that guide every future module.</p></div>
            <div class="mission-score"><strong id="profileCompleteness">0%</strong><span>Profile complete</span></div>
          </section>

          <form id="profileForm" class="form-card">
            <div class="form-heading"><span class="kicker">ATHLETE PROFILE</span><h3>Starting Point & Targets</h3><p>These values become the source of truth for training, nutrition, golf, and softball planning.</p></div>
            <div class="foundation-form-grid">
              <label>Name<input name="name" autocomplete="name" placeholder="Alec"></label>
              <label>Weekly training availability<input name="weeklyTrainingHours" type="number" min="1" max="40" step="1"></label>
              <label>Current weight (lb)<input name="currentWeight" type="number" min="80" max="500" step="0.1"></label>
              <label>Goal weight (lb)<input name="goalWeight" type="number" min="80" max="500" step="0.1"></label>
              <label>Current body fat (%)<input name="currentBodyFat" type="number" min="1" max="70" step="0.1"></label>
              <label>Goal body fat (%)<input name="goalBodyFat" type="number" min="1" max="70" step="0.1"></label>
              <label>Golf handicap<input name="golfHandicap" type="number" min="-10" max="54" step="0.1"></label>
              <label>Softball position<input name="softballPosition" placeholder="Third Base"></label>
            </div>
            <label>Planning notes<textarea name="notes" placeholder="Schedule limitations, injuries, equipment, or priorities"></textarea></label>
            <button class="primary-btn" type="submit">Save Profile</button>
          </form>

          <section class="section-block">
            <div class="section-head"><div><span class="kicker">COMPETITION CALENDAR</span><h3>Tournaments & Deadlines</h3></div><button id="addTournament" class="primary-btn small">Add Event</button></div>
            <div id="tournamentList" class="foundation-event-grid"></div>
          </section>

          <section class="section-block">
            <div class="section-head"><div><span class="kicker">SYSTEM CHECK</span><h3>Phase 1 Foundation</h3></div></div>
            <div id="foundationStatus" class="review-grid"></div>
          </section>
        </section>`);
    }

    if (!document.querySelector('[data-nav="profile"]')) {
      const install = document.querySelector('#installApp');
      install.insertAdjacentHTML('afterend', '<button data-nav="profile"><span>Profile & Events</span><small>Personal targets and tournament dates</small></button>');
    }

    if (!document.querySelector('#tournamentCountdowns')) {
      const hero = document.querySelector('[data-view="today"] .hero-card');
      hero.insertAdjacentHTML('afterend', `
        <section id="tournamentCountdowns" class="section-block foundation-countdowns">
          <div class="section-head"><div><span class="kicker">TARGET DATES</span><h3>Tournament Countdown</h3></div><button class="text-btn" data-nav="profile">Manage</button></div>
          <div id="countdownGrid" class="metric-grid"></div>
        </section>`);
    }
  }

  function profileCompleteness() {
    const p = state.profile;
    const fields = ['name','currentWeight','goalWeight','currentBodyFat','goalBodyFat','golfHandicap','softballPosition','weeklyTrainingHours'];
    return Math.round(fields.filter(key => String(p[key] ?? '').trim() !== '').length / fields.length * 100);
  }

  function renderFoundation() {
    const form = document.querySelector('#profileForm');
    if (!form) return;
    Object.entries(state.profile).forEach(([key, value]) => {
      const input = form.elements[key];
      if (input) input.value = value ?? '';
    });
    document.querySelector('#profileCompleteness').textContent = `${profileCompleteness()}%`;

    const sorted = [...state.tournaments].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    document.querySelector('#tournamentList').innerHTML = sorted.map(event => {
      const days = daysUntil(event.date);
      const timing = days < 0 ? `${Math.abs(days)} days ago` : days === 0 ? 'Today' : `${days} days remaining`;
      return `<article class="foundation-event-card">
        <div><span class="kicker">${esc(event.sport || 'Event')} · ${esc(event.priority || 'Primary')}</span><strong>${esc(event.name)}</strong><small>${esc(event.date)} · ${timing}</small></div>
        <div class="button-row"><button class="mini-btn" data-edit-tournament="${event.id}">Edit</button><button class="mini-btn" data-delete-tournament="${event.id}">×</button></div>
      </article>`;
    }).join('') || empty('Add the tournament or deadline you are preparing for.');

    const upcoming = sorted.filter(event => daysUntil(event.date) >= 0).slice(0, 3);
    document.querySelector('#countdownGrid').innerHTML = upcoming.map(event => {
      const days = daysUntil(event.date);
      return `<button class="metric countdown-metric" data-nav="profile"><span>${esc(event.sport)}</span><strong>${days}</strong><small>days · ${esc(event.name)}</small></button>`;
    }).join('') || '<div class="metric"><span>Events</span><strong>0</strong><small>Add a target date</small></div>';

    const checks = [
      ['Navigation', Boolean(document.querySelector('.bottom-nav'))],
      ['Dashboard', Boolean(document.querySelector('[data-view="today"]'))],
      ['Profile', profileCompleteness() === 100],
      ['Events', state.tournaments.length > 0],
      ['Local save', storageAvailable()],
      ['Versioned backup', true],
      ['Offline shell', 'serviceWorker' in navigator],
      ['Settings', Boolean(state.settings)]
    ];
    document.querySelector('#foundationStatus').innerHTML = checks.map(([label, ready]) => `<article class="review-card"><span class="kicker">${esc(label)}</span><strong>${ready ? 'Ready' : 'Needs input'}</strong><small>${ready ? 'Foundation available' : 'Complete this item'}</small></article>`).join('');
    bindFoundationDynamic();
  }

  function storageAvailable() {
    try {
      const key = '__iron_disciple_test__';
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch { return false; }
  }

  function tournamentFields(event = {}) {
    return `<label>Event name<input name="name" required value="${esc(event.name || '')}"></label>
      <label>Sport<select name="sport">${['Softball','Golf','Fitness','Other'].map(value => `<option ${event.sport === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
      <label>Date<input name="date" type="date" required value="${esc(event.date || todayKey())}"></label>
      <label>Priority<select name="priority">${['Primary','Secondary','Practice'].map(value => `<option ${event.priority === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>`;
  }

  function bindFoundationDynamic() {
    document.querySelectorAll('[data-edit-tournament]').forEach(button => button.onclick = () => {
      const event = state.tournaments.find(item => item.id === button.dataset.editTournament);
      if (!event) return;
      openModal('Edit Event', tournamentFields(event), data => Object.assign(event, data));
    });
    document.querySelectorAll('[data-delete-tournament]').forEach(button => button.onclick = () => {
      if (!confirm('Delete this event?')) return;
      state.tournaments = state.tournaments.filter(item => item.id !== button.dataset.deleteTournament);
      save();
    });
  }

  function bindFoundationStatic() {
    document.querySelector('#profileForm').onsubmit = event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target));
      ['weeklyTrainingHours','currentWeight','goalWeight','currentBodyFat','goalBodyFat','golfHandicap'].forEach(key => data[key] = num(data[key]));
      state.profile = { ...state.profile, ...data };
      state.bodyGoals.weight = data.goalWeight || state.bodyGoals.weight;
      state.bodyGoals.bodyFat = data.goalBodyFat || state.bodyGoals.bodyFat;
      save();
      document.querySelector('#appStatus').textContent = 'Profile saved';
    };
    document.querySelector('#addTournament').onclick = () => openModal('Add Tournament or Event', tournamentFields({ priority: 'Primary' }), data => state.tournaments.push({ id: id(), ...data }));
  }

  function installVersionedBackup() {
    document.querySelector('#exportData').onclick = () => {
      state.system.lastBackupAt = new Date().toISOString();
      state.system.lastSavedAt = state.system.lastBackupAt;
      localStorage.setItem(KEY, JSON.stringify(state));
      const backup = {
        app: 'Iron Disciple OS',
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        data: state
      };
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
      link.download = `iron-disciple-v${SCHEMA_VERSION}-backup-${todayKey()}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    };

    document.querySelector('#importFile').onchange = async event => {
      try {
        const file = event.target.files?.[0];
        if (!file) return;
        const parsed = JSON.parse(await file.text());
        const imported = parsed?.app === 'Iron Disciple OS' && parsed?.data ? parsed.data : parsed;
        if (!imported || typeof imported !== 'object' || Array.isArray(imported)) throw new Error('Invalid backup structure');
        if (!confirm('Restore this backup? Current data on this device will be replaced.')) return;
        state = merge(structuredClone(defaults), imported);
        ensureFoundationState();
        save();
        event.target.value = '';
        alert('Backup restored successfully.');
      } catch (error) {
        console.error(error);
        alert('That file is not a valid Iron Disciple backup.');
      }
    };
  }

  ensureFoundationState();
  injectFoundationUI();

  const baseRender = render;
  render = function phase1Render() {
    state.system.lastSavedAt = new Date().toISOString();
    baseRender();
    renderFoundation();
  };

  const baseNav = nav;
  nav = function phase1Nav(name, options = {}) {
    baseNav(name, options);
    if (name === 'profile') {
      document.querySelector('#pageTitle').textContent = 'Profile';
      document.title = 'Profile · Iron Disciple OS';
      renderFoundation();
    }
  };

  bindFoundationStatic();
  installVersionedBackup();
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
  nav(location.hash.slice(1) || 'today', { replace: true });
})();
