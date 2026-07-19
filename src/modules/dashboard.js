(function(global){
"use strict";

const KEY="iron_dashboard_v4";
const DEFAULT_LAYOUT=["mission","shift","projects","body","faith","readiness","quick"];

function readLayout(){
  try{
    const saved=JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved)&&saved.length?saved:DEFAULT_LAYOUT.slice();
  }catch{return DEFAULT_LAYOUT.slice()}
}
function writeLayout(layout){
  localStorage.setItem(KEY,JSON.stringify(layout));
}
function esc(value=""){
  return String(value).replace(/[&<>"']/g,ch=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[ch]);
}
function safeGet(path,fallback=null){
  try{
    const parts=path.split(".");
    let value=global.AppState?.state||global.AppState?.get?.()||{};
    for(const part of parts)value=value?.[part];
    return value??fallback;
  }catch{return fallback}
}
function todayLabel(){
  return new Date().toLocaleDateString([],{
    weekday:"long",month:"long",day:"numeric"
  });
}

const IronDashboard={
  version:"4.0.0-alpha.5",

  missionData(){
    const daily=global.IronDaily?.data?.()||safeGet("daily.command",{});
    return {
      priorities:(daily?.topThree||[]).filter(Boolean),
      summary:global.IronDaily?.summary?.()||safeGet("daily.summary",{})
    };
  },

  projectData(){
    const summary=global.IronProjects?.summary?.()||safeGet("projects.summary",{});
    const items=global.IronProjects?.all?.()||safeGet("projects.items",[]);
    return {summary,items};
  },

  operationsData(){
    const ops=safeGet("operations",{});
    return {
      incidents:Array.isArray(ops.incidents)?ops.incidents:[],
      arrests:Array.isArray(ops.arrests)?ops.arrests:[],
      reports:Array.isArray(ops.reports)?ops.reports:[],
      tasks:Array.isArray(ops.tasks)?ops.tasks:[]
    };
  },

  readinessData(){
    const readiness=safeGet("readiness",{})||{};
    const intelligence=safeGet("intelligence",{})||{};
    const score=readiness.score??intelligence.score??null;
    return {score,readiness,intelligence};
  },

  card(id){
    const mission=this.missionData();
    const project=this.projectData();
    const ops=this.operationsData();
    const readiness=this.readinessData();
    const daily=global.IronDaily?.data?.()||{body:{},faith:{}};

    const cards={
      mission:()=>`
        <article class="dash-card" data-card="mission">
          <div class="dash-card-head"><span>Mission</span><button data-dashboard-open="daily">Open</button></div>
          <h2>Today’s Top Priorities</h2>
          <ol class="dash-list">
            ${(mission.priorities.length?mission.priorities:["Set your top three priorities"]).map(x=>`<li>${esc(x)}</li>`).join("")}
          </ol>
          <small>${mission.summary?.percentage??0}% of daily system complete</small>
        </article>`,
      shift:()=>`
        <article class="dash-card" data-card="shift">
          <div class="dash-card-head"><span>Shift</span><button data-dashboard-open="operations">Open</button></div>
          <h2>Operational Snapshot</h2>
          <div class="dash-metrics">
            <div><strong>${ops.incidents.length}</strong><span>Incidents</span></div>
            <div><strong>${ops.arrests.length}</strong><span>Arrests</span></div>
            <div><strong>${ops.reports.length}</strong><span>Reports</span></div>
            <div><strong>${ops.tasks.filter(x=>!x.done).length}</strong><span>Open Tasks</span></div>
          </div>
        </article>`,
      projects:()=>`
        <article class="dash-card" data-card="projects">
          <div class="dash-card-head"><span>Projects</span><button data-dashboard-open="projects">Open</button></div>
          <h2>${esc(project.summary?.nextProject?.title||"No active project")}</h2>
          <p>${esc(project.summary?.nextProject?.nextAction||"Add a project and define the next action.")}</p>
          <small>${project.summary?.active??0} active · ${project.summary?.blocked??0} blocked</small>
        </article>`,
      body:()=>`
        <article class="dash-card" data-card="body">
          <div class="dash-card-head"><span>Body</span><button data-dashboard-open="daily">Open</button></div>
          <h2>Performance Targets</h2>
          <div class="dash-checks">
            ${[
              ["Workout",daily.body?.workout],
              ["10,000 Steps",daily.body?.steps],
              ["Nutrition",daily.body?.nutrition],
              ["Hydration",daily.body?.hydration]
            ].map(([label,done])=>`<span class="${done?"done":""}">${done?"✓":"○"} ${label}</span>`).join("")}
          </div>
        </article>`,
      faith:()=>`
        <article class="dash-card" data-card="faith">
          <div class="dash-card-head"><span>Faith</span><button data-dashboard-open="daily">Open</button></div>
          <h2>${daily.faith?.completed?"Faith Practice Complete":"Faith Practice Pending"}</h2>
          <p>${esc(daily.faith?.scripture||"Add today’s scripture or study notes.")}</p>
        </article>`,
      readiness:()=>`
        <article class="dash-card" data-card="readiness">
          <div class="dash-card-head"><span>Readiness</span><button data-dashboard-open="intelligence">Open</button></div>
          <h2>${readiness.score==null?"No score yet":`${Math.round(readiness.score)} / 100`}</h2>
          <p>${readiness.score==null?"Complete your daily inputs to generate a readiness signal.":readiness.score>=80?"High readiness. Execute the plan.":readiness.score>=60?"Moderate readiness. Prioritize essentials.":"Low readiness. Protect recovery and simplify."}</p>
        </article>`,
      quick:()=>`
        <article class="dash-card dash-quick" data-card="quick">
          <div class="dash-card-head"><span>Quick Add</span></div>
          <h2>Capture it immediately</h2>
          <div class="dash-quick-grid">
            <button data-dashboard-open="operations">Incident</button>
            <button data-dashboard-open="operations">Arrest</button>
            <button data-dashboard-open="projects">Project</button>
            <button data-dashboard-open="daily">Priority</button>
          </div>
        </article>`
    };
    return cards[id]?.()||"";
  },

  render(){
    const host=document.getElementById("dashboardGrid");
    if(!host)return;
    const layout=readLayout();
    host.innerHTML=layout.map(id=>this.card(id)).join("");
    const date=document.getElementById("dashboardDate");
    if(date)date.textContent=todayLabel();

    const summary=global.IronDaily?.summary?.()||{};
    const bar=document.getElementById("dashboardProgressBar");
    if(bar)bar.style.width=`${summary.percentage||0}%`;
    const text=document.getElementById("dashboardProgressText");
    if(text)text.textContent=`${summary.percentage||0}% complete today`;
  },

  openTab(tab){
    const button=document.querySelector(`[data-tab="${CSS.escape(tab)}"]`);
    if(button)button.click();
  },

  moveCard(id,direction){
    const layout=readLayout();
    const index=layout.indexOf(id);
    const next=index+direction;
    if(index<0||next<0||next>=layout.length)return;
    [layout[index],layout[next]]=[layout[next],layout[index]];
    writeLayout(layout);
    this.render();
  },

  bind(){
    document.addEventListener("click",event=>{
      const open=event.target.closest("[data-dashboard-open]");
      if(open)this.openTab(open.dataset.dashboardOpen);

      const move=event.target.closest("[data-dashboard-move]");
      if(move)this.moveCard(move.dataset.dashboardMove,Number(move.dataset.direction||0));
    });

    document.getElementById("dashboardRefresh")?.addEventListener("click",()=>this.render());
    document.getElementById("dashboardResetLayout")?.addEventListener("click",()=>{
      writeLayout(DEFAULT_LAYOUT.slice());
      this.render();
    });

    global.IronEvents?.on?.("daily:updated",()=>this.render());
    global.IronEvents?.on?.("projects:updated",()=>this.render());
    global.IronEvents?.on?.("operations:updated",()=>this.render());
  },

  init(){
    this.bind();
    this.render();
  }
};

global.IronDashboard=IronDashboard;
})(window);
