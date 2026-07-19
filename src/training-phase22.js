/* Iron Disciple OS — Phase 2.2 Training Session Tools */
(()=>{
'use strict';
const A=window.TrainingAdvanced;if(!A)return;
let timerHandle=null;
function migrate(){state.training=A.normalizeTrainingAdvanced(state.training);state.version='2.2.0';const m=state.os?.modules?.find(x=>x.id==='training');if(m){m.version='2.2.0';m.capabilities=[...new Set([...(m.capabilities||[]),'workout-templates','warmup-generator','cooldown-generator','rest-timer','supersets-circuits'])];}}
function inject(){
 const panel=document.querySelector('[data-body-panel="training"]');if(panel&&!document.querySelector('#trainingTemplates')){
  const stats=document.querySelector('#trainingStats');stats?.insertAdjacentHTML('afterend','<section class="training-template-panel"><div class="section-head"><div><span class="kicker">QUICK START</span><h3>Workout Templates</h3></div></div><div id="trainingTemplates" class="metric-grid"></div></section>');
 }
 const dialog=document.querySelector('#trainingSessionDialog .dialog-shell');if(dialog&&!document.querySelector('#trainingSessionTools')){
  dialog.querySelector('.dialog-head')?.insertAdjacentHTML('afterend','<section id="trainingSessionTools" class="training-session-tools"><div><strong id="restTimerDisplay">Rest ready</strong><small id="restTimerDetail">Complete a set to begin its prescribed rest.</small></div><div class="workout-actions"><button id="restTimerMinus" class="mini-btn" type="button">−15s</button><button id="restTimerToggle" class="secondary-btn small" type="button">Start 90s</button><button id="restTimerPlus" class="mini-btn" type="button">+15s</button></div><details><summary>Warm-up & cool-down</summary><div id="sessionPreparation"></div></details></section>');
 }
}
function renderTemplates(){const box=document.querySelector('#trainingTemplates');if(!box)return;box.innerHTML=state.training.advanced.templates.map(t=>`<article class="review-card"><span class="kicker">${esc(t.type)}</span><strong>${esc(t.name)}</strong><small>${esc(t.description||'')}</small><button class="secondary-btn small" data-use-training-template="${t.id}">Add to Plan</button></article>`).join('');}
function workoutForSession(){const s=state.training.sessions.find(x=>x.id===state.training.activeSessionId);return state.workouts.find(x=>x.id===s?.workoutId);}
function renderPreparation(){const box=document.querySelector('#sessionPreparation');const workout=workoutForSession();if(!box||!workout)return;const section=(title,items)=>`<div class="prep-list"><strong>${title}</strong>${items.map(x=>`<div class="list-card"><div><b>${esc(x.name)}</b><small>${esc(x.detail)}</small></div><span>${x.duration}m</span></div>`).join('')}</div>`;box.innerHTML=section('Warm-up',A.warmupForWorkout(workout,state.exerciseLibrary))+section('Cool-down',A.cooldownForWorkout(workout));}
function restState(){return state.training.advanced.restTimer;}
function setTimer(seconds){const r=restState();r.remaining=Math.max(0,Number(seconds)||0);r.running=r.remaining>0;r.endsAt=r.running?new Date(Date.now()+r.remaining*1000).toISOString():null;persist();tickTimer();}
function persist(){localStorage.setItem(KEY,JSON.stringify(state));}
function tickTimer(){clearInterval(timerHandle);const update=()=>{const r=restState();if(r.running&&r.endsAt)r.remaining=Math.max(0,Math.ceil((new Date(r.endsAt)-Date.now())/1000));if(r.remaining<=0){r.running=false;r.endsAt=null;}const display=document.querySelector('#restTimerDisplay'),detail=document.querySelector('#restTimerDetail'),toggle=document.querySelector('#restTimerToggle');if(display)display.textContent=r.remaining?`${Math.floor(r.remaining/60)}:${String(r.remaining%60).padStart(2,'0')} rest`:'Rest ready';if(detail)detail.textContent=r.running?'Timer is running.':'Complete a set or start a manual timer.';if(toggle)toggle.textContent=r.running?'Pause':r.remaining?`Resume ${r.remaining}s`:'Start 90s';if(!r.running)clearInterval(timerHandle);};update();if(restState().running)timerHandle=setInterval(update,1000);}
function toggleTimer(){const r=restState();if(!r.remaining)return setTimer(90);if(r.running){r.remaining=Math.max(0,Math.ceil((new Date(r.endsAt)-Date.now())/1000));r.running=false;r.endsAt=null;persist();tickTimer();}else setTimer(r.remaining);}
function annotateGroups(){document.querySelectorAll('[data-training-workout]').forEach(card=>{const w=state.workouts.find(x=>x.id===card.dataset.trainingWorkout);if(!w)return;const groups=A.groupExercises(w.exercises);if(groups.some(g=>g.type!=='straight')&&!card.querySelector('.training-group-summary'))card.querySelector('.exercise-lines')?.insertAdjacentHTML('beforebegin',`<small class="training-group-summary">${groups.filter(g=>g.type!=='straight').map(g=>`${g.type}: ${g.exercises.map(x=>esc(x.name)).join(' + ')}`).join(' · ')}</small>`);});}
function bind(){
 document.addEventListener('click',e=>{const use=e.target.closest('[data-use-training-template]');if(use){const t=state.training.advanced.templates.find(x=>x.id===use.dataset.useTrainingTemplate);if(t){state.workouts.push(A.buildWorkoutFromTemplate(t,state.exerciseLibrary,todayKey()));save();}}
 });
 document.addEventListener('change',e=>{if(e.target.matches('#trainingSessionDialog [data-set-field="completed"]')&&e.target.checked){const ex=e.target.closest('[data-session-exercise]'),workout=workoutForSession(),idx=Number(ex?.dataset.sessionExercise||0),seconds=workout?.exercises?.[idx]?.restSeconds||90;setTimer(seconds);}});
 document.querySelector('#restTimerToggle')?.addEventListener('click',toggleTimer);document.querySelector('#restTimerMinus')?.addEventListener('click',()=>setTimer(Math.max(0,restState().remaining-15)));document.querySelector('#restTimerPlus')?.addEventListener('click',()=>setTimer(restState().remaining+15));
 document.querySelector('#trainingSessionDialog')?.addEventListener('toggle',renderPreparation);
}
migrate();inject();bind();const prior=render;render=function training22Render(){prior();renderTemplates();annotateGroups();renderPreparation();tickTimer();const v=document.querySelector('[data-view="more"] .version');if(v)v.textContent='Iron Disciple OS 2.2.0 — Training Templates & Session Tools';};persist();render();
})();
