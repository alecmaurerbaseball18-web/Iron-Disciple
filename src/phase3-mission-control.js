(function(global){
"use strict";
const byId=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[ch]);
let current=null;

function render(){
  if(!global.IronMissionControl||!byId("missionControlPanel"))return null;
  current=global.IronMissionControl.briefing(global.IronMissionControl.readState());
  byId("missionControlStatus").textContent=current.status;
  byId("missionControlNext").textContent=current.action.title;
  byId("missionControlReason").textContent=current.action.reason;
  byId("missionControlExecute").textContent=`Open ${current.action.type}`;
  byId("missionReadinessScore").textContent=current.score==null?"--":`${current.score}/100`;
  byId("missionReadinessBar").style.width=`${current.score??0}%`;
  byId("missionReadinessGuidance").textContent=current.score==null?"Log sleep, hydration, nutrition, steps, or training completion to generate a capacity signal.":current.score>=80?"Capacity is high. Execute the planned session and protect momentum.":current.score>=60?"Capacity is moderate. Prioritize the Big Three and avoid unnecessary volume.":"Capacity is limited. Reduce intensity, protect recovery, and complete only essential work.";
  const runway=byId("missionGoalRunway");
  runway.innerHTML=current.runway.length?current.runway.map(goal=>`<div class="mission-runway-item ${goal.pressure}"><div><strong>${esc(goal.text)}</strong><small>${esc(goal.horizon)}</small></div><span>${goal.progress}%</span></div>`).join(""):'<div class="list-card"><small>No active monthly or quarterly goals. Define the current mission.</small></div>';
  const schedule=byId("missionScheduleSignal");
  const next=current.schedule.next;
  schedule.innerHTML=`<div class="mission-schedule-progress"><strong>${current.schedule.progress}%</strong><span>${current.schedule.completed}/${current.schedule.total} blocks complete</span></div><div class="mission-schedule-next"><small>NEXT BLOCK</small><strong>${esc(next?.title||"No remaining scheduled block")}</strong><span>${esc(next?.time||"Flexible")}${next?.detail?` · ${esc(next.detail)}`:""}</span></div>`;
  byId("missionMomentumScore").textContent=`${current.momentum.value}`;
  byId("missionMomentumLabel").textContent=current.momentum.label;
  byId("missionForecastValue").textContent=`${current.forecast.projected}%`;
  byId("missionForecastLabel").textContent=current.forecast.label;
  const blockers=byId("missionBlockers");
  blockers.innerHTML=current.blockers.length?current.blockers.map(item=>`<button class="mission-blocker ${item.level}" data-mission-view="${esc(item.view)}" type="button"><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></button>`).join(""):'<div class="mission-clear"><strong>No critical blockers detected.</strong><span>Protect the plan and keep executing.</span></div>';
  const plan=byId("missionCommandPlan");
  plan.innerHTML=current.plan.map(item=>`<button class="mission-plan-step" data-mission-view="${esc(item.view)}" type="button"><span>${item.rank}</span><div><strong>${esc(item.title)}</strong><small>${esc(item.type)} · ${esc(item.reason)}</small></div></button>`).join("");
  byId("missionCloseoutStatus").textContent=current.closeout.status;
  byId("missionCloseoutProgress").textContent=`${current.closeout.execution}%`;
  byId("missionCloseoutGuidance").textContent=current.closeout.guidance;
  const carryover=byId("missionCarryover");
  carryover.innerHTML=current.closeout.carryover.length?current.closeout.carryover.map(item=>`<button class="mission-carryover-item" data-mission-view="${esc(item.view)}" type="button"><span>${esc(item.type)}</span><strong>${esc(item.title)}</strong></button>`).join(""):'<div class="mission-clear"><strong>No unresolved carryover detected.</strong><span>Finish the review and preserve a clean launch for tomorrow.</span></div>';
  byId("missionTomorrowTitle").textContent=current.tomorrow.title;
  byId("missionTomorrowSource").textContent=current.tomorrow.source;
  byId("missionTomorrowOpen").dataset.missionView=current.tomorrow.view;
  global.AppState?.set?.("missionControl.brief",current,{source:"phase3-mission-control"});
  global.IronEvents?.emit?.("mission-control:rendered",current);
  return current;
}

function openAction(){
  if(!current)render();
  const target=current?.action?.view||"execute";
  document.querySelector(`[data-nav="${target}"]`)?.click();
}

function bind(){
  byId("missionControlExecute")?.addEventListener("click",openAction);
  byId("missionControlRefresh")?.addEventListener("click",render);
  document.addEventListener("click",event=>{const target=event.target.closest("[data-mission-view]");if(target)document.querySelector(`[data-nav="${target.dataset.missionView}"]`)?.click()});
  document.addEventListener("change",event=>{
    if(event.target.matches('[data-toggle], [data-task-toggle], [data-time-toggle]'))setTimeout(render,0);
  });
  document.addEventListener("click",event=>{
    if(event.target.closest('[data-delete], [data-edit-goal], #addGoal, #editBigThree, #quickAddTask'))setTimeout(render,50);
  });
  global.IronEvents?.on?.("state:changed",render);
  window.addEventListener("storage",event=>{if(event.key===global.IronMissionControl.APP_KEY)render()});
}

document.addEventListener("DOMContentLoaded",()=>{bind();render()});
global.IronMissionControlUI={version:"3.3.0",render,openAction};
})(window);
