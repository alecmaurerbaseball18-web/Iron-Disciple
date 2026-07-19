/* Iron Disciple OS — Phase 1 Onboarding & Reliability */
(() => {
  'use strict';

  const REQUIRED_PROFILE_FIELDS = [
    'name', 'weeklyTrainingHours', 'currentWeight', 'goalWeight',
    'currentBodyFat', 'goalBodyFat', 'golfHandicap', 'softballPosition'
  ];

  function ensureHardeningState() {
    state.system = state.system || {};
    state.system.onboardingComplete = Boolean(state.system.onboardingComplete);
    state.system.lastHealthCheckAt = state.system.lastHealthCheckAt || '';
    state.system.healthCheckPassed = Boolean(state.system.healthCheckPassed);
  }

  function profileIsComplete() {
    return REQUIRED_PROFILE_FIELDS.every(key => String(state.profile?.[key] ?? '').trim() !== '');
  }

  function eventsAreReady() {
    return Array.isArray(state.tournaments) && state.tournaments.some(event => event.name && event.date);
  }

  function setupIsComplete() {
    return profileIsComplete() && eventsAreReady();
  }

  function injectOnboardingUI() {
    if (!document.querySelector('#foundationWelcome')) {
      const countdowns = document.querySelector('#tournamentCountdowns');
      countdowns?.insertAdjacentHTML('beforebegin', `
        <section id="foundationWelcome" class="foundation-welcome" hidden>
          <div>
            <span class="kicker">FIRST-RUN SETUP</span>
            <h3>Finish your foundation before training plans are activated.</h3>
            <p>Confirm your starting measurements, target outcomes, training availability, and tournament dates.</p>
          </div>
          <button id="startOnboarding" class="primary-btn">Complete Setup</button>
        </section>`);
    }

    if (!document.querySelector('#runFoundationCheck')) {
      const heading = document.querySelector('#foundationStatus')?.previousElementSibling;
      heading?.insertAdjacentHTML('beforeend', '<button id="runFoundationCheck" class="secondary-btn small">Run Check</button>');
    }

    if (!document.querySelector('#onboardingDialog')) {
      document.body.insertAdjacentHTML('beforeend', `
        <dialog id="onboardingDialog" class="onboarding-dialog">
          <form id="onboardingForm" method="dialog">
            <div class="modal-head"><div><span class="kicker">PHASE 1 SETUP</span><h3>Configure Iron Disciple</h3></div><button value="cancel" class="icon-btn" aria-label="Close">×</button></div>
            <p class="onboarding-copy">These values guide every future workout, nutrition, golf, and softball recommendation.</p>
            <div class="foundation-form-grid">
              <label>Name<input name="name" required autocomplete="name"></label>
              <label>Training hours per week<input name="weeklyTrainingHours" required type="number" min="1" max="40" step="1"></label>
              <label>Current weight (lb)<input name="currentWeight" required type="number" min="80" max="500" step="0.1"></label>
              <label>Goal weight (lb)<input name="goalWeight" required type="number" min="80" max="500" step="0.1"></label>
              <label>Current body fat (%)<input name="currentBodyFat" required type="number" min="1" max="70" step="0.1"></label>
              <label>Goal body fat (%)<input name="goalBodyFat" required type="number" min="1" max="70" step="0.1"></label>
              <label>Golf handicap<input name="golfHandicap" required type="number" min="-10" max="54" step="0.1"></label>
              <label>Softball position<input name="softballPosition" required></label>
            </div>
            <div class="onboarding-event-summary">
              <span class="kicker">EVENTS LOADED</span>
              <strong id="onboardingEventCount">0 target events</strong>
              <small>You can edit dates from Profile & Events after setup.</small>
            </div>
            <div id="onboardingWarnings" class="validation-message" hidden></div>
            <div class="modal-actions"><button value="cancel" class="secondary-btn">Not Yet</button><button id="finishOnboarding" value="default" class="primary-btn">Save Foundation</button></div>
          </form>
        </dialog>`);
    }
  }

  function fillOnboardingForm() {
    const form = document.querySelector('#onboardingForm');
    if (!form) return;
    REQUIRED_PROFILE_FIELDS.forEach(key => {
      if (form.elements[key]) form.elements[key].value = state.profile?.[key] ?? '';
    });
    const count = state.tournaments?.length || 0;
    document.querySelector('#onboardingEventCount').textContent = `${count} target event${count === 1 ? '' : 's'}`;
  }

  function validateGoals(data) {
    const warnings = [];
    if (Number(data.goalWeight) >= Number(data.currentWeight)) warnings.push('Goal weight is not below current weight. Confirm this is intentional.');
    if (Number(data.goalBodyFat) >= Number(data.currentBodyFat)) warnings.push('Goal body-fat percentage is not below the current percentage.');
    return warnings;
  }

  function openOnboarding() {
    fillOnboardingForm();
    const warnings = document.querySelector('#onboardingWarnings');
    warnings.hidden = true;
    warnings.textContent = '';
    document.querySelector('#onboardingDialog').showModal();
  }

  function saveOnboarding(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    ['weeklyTrainingHours','currentWeight','goalWeight','currentBodyFat','goalBodyFat','golfHandicap'].forEach(key => data[key] = Number(data[key]));
    const warnings = validateGoals(data);
    const warningBox = document.querySelector('#onboardingWarnings');
    if (warnings.length && form.dataset.warningsConfirmed !== 'true') {
      warningBox.textContent = `${warnings.join(' ')} Press “Save Foundation” again to confirm.`;
      warningBox.hidden = false;
      form.dataset.warningsConfirmed = 'true';
      return;
    }
    form.dataset.warningsConfirmed = 'false';
    state.profile = { ...state.profile, ...data };
    state.bodyGoals.weight = data.goalWeight;
    state.bodyGoals.bodyFat = data.goalBodyFat;
    state.system.onboardingComplete = true;
    save();
    document.querySelector('#onboardingDialog').close();
    document.querySelector('#appStatus').textContent = 'Foundation setup complete';
  }

  function runHealthCheck(showResult = true) {
    const checks = {
      navigation: Boolean(document.querySelector('.bottom-nav')),
      dashboard: Boolean(document.querySelector('[data-view="today"]')),
      profile: profileIsComplete(),
      events: eventsAreReady(),
      storage: (() => {
        try {
          const key = '__id_health_check__';
          localStorage.setItem(key, 'ok');
          const ok = localStorage.getItem(key) === 'ok';
          localStorage.removeItem(key);
          return ok;
        } catch { return false; }
      })(),
      backup: Boolean(document.querySelector('#exportData') && document.querySelector('#importData')),
      offline: 'serviceWorker' in navigator,
      settings: Boolean(state.settings)
    };
    const passed = Object.values(checks).every(Boolean);
    state.system.lastHealthCheckAt = new Date().toISOString();
    state.system.healthCheckPassed = passed;
    localStorage.setItem(KEY, JSON.stringify(state));
    if (showResult) {
      const failed = Object.entries(checks).filter(([, ready]) => !ready).map(([name]) => name);
      alert(passed ? 'Phase 1 foundation check passed.' : `Foundation check needs attention: ${failed.join(', ')}.`);
      render();
    }
    return checks;
  }

  function renderHardening() {
    const welcome = document.querySelector('#foundationWelcome');
    if (welcome) welcome.hidden = state.system.onboardingComplete && setupIsComplete();

    const status = document.querySelector('#foundationStatus');
    if (status && state.system.lastHealthCheckAt) {
      const timestamp = new Date(state.system.lastHealthCheckAt).toLocaleString();
      status.insertAdjacentHTML('beforeend', `<article class="review-card"><span class="kicker">LAST CHECK</span><strong>${state.system.healthCheckPassed ? 'Passed' : 'Attention'}</strong><small>${esc(timestamp)}</small></article>`);
    }
  }

  ensureHardeningState();
  injectOnboardingUI();

  document.querySelector('#startOnboarding')?.addEventListener('click', openOnboarding);
  document.querySelector('#onboardingForm')?.addEventListener('submit', saveOnboarding);
  document.querySelector('#runFoundationCheck')?.addEventListener('click', () => runHealthCheck(true));

  const baseRender = render;
  render = function hardenedRender() {
    baseRender();
    renderHardening();
  };

  if (!state.system.onboardingComplete && !profileIsComplete()) {
    document.querySelector('#foundationWelcome').hidden = false;
  }

  render();
})();
