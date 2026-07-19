(function(global){
"use strict";

const KEY="iron_daily_command_v4";
const DEFAULTS={
  date:"",
  topThree:["","",""],
  shiftTasks:[
    {id:"lineup",label:"Lineup",done:false},
    {id:"ethos",label:"Ethos",done:false},
    {id:"reports",label:"Approve Reports",done:false},
    {id:"passdown",label:"Pass-Down",done:false},
    {id:"kurt",label:"Check on Kurt",done:false}
  ],
  body:{
    workout:false,
    steps:false,
    mobilityAM:false,
    mobilityPM:false,
    nutrition:false,
    hydration:false
  },
  faith:{
    scripture:"",
    prayer:"",
    gratitude:"",
    completed:false
  },
  notes:"",
  wins:"",
  updatedAt:""
};

function today(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function clone(value){return JSON.parse(JSON.stringify(value))}
function read(){
  let data;
  try{data=JSON.parse(localStorage.getItem(KEY))}catch{}
  if(!data||data.date!==today()){
    data=clone(DEFAULTS);
    data.date=today();
    write(data);
  }
  return data;
}
function write(data){
  data.updatedAt=new Date().toISOString();
  localStorage.setItem(KEY,JSON.stringify(data));
  return data;
}
function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g,ch=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[ch]);
}

const IronDaily={
  version:"4.0.0-alpha.5",

  data(){return read()},

  update(mutator,source="daily:update"){
    const data=read();
    mutator(data);
    write(data);
    this.publish(source);
    this.render();
    return data;
  },

  summary(){
    const d=read();
    const priorities=d.topThree.filter(Boolean).length;
    const shiftDone=d.shiftTasks.filter(x=>x.done).length;
    const bodyValues=Object.values(d.body);
    const bodyDone=bodyValues.filter(Boolean).length;
    const faithDone=d.faith.completed?1:0;
    const complete=shiftDone+bodyDone+faithDone;
    const total=d.shiftTasks.length+bodyValues.length+1;
    return {
      date:d.date,
      priorities,
      shiftDone,
      shiftTotal:d.shiftTasks.length,
      bodyDone,
      bodyTotal:bodyValues.length,
      faithDone,
      complete,
      total,
      percentage:total?Math.round((complete/total)*100):0,
      updatedAt:d.updatedAt
    };
  },

  publish(source="daily:update"){
    const data=read();
    const summary=this.summary();
    global.AppState?.batch({
      "daily.command":data,
      "daily.summary":summary
    },{source});
    global.IronEvents?.emit("daily:updated",{data,summary});
    return {data,summary};
  },

  toggleShift(id){
    this.update(d=>{
      const item=d.shiftTasks.find(x=>x.id===id);
      if(item)item.done=!item.done;
    },"daily:shift-toggle");
  },

  toggleBody(key){
    this.update(d=>{
      if(Object.prototype.hasOwnProperty.call(d.body,key))d.body[key]=!d.body[key];
    },"daily:body-toggle");
  },

  saveText(){
    const d=read();
    document.querySelectorAll("[data-daily-priority]").forEach(input=>{
      const i=Number(input.dataset.dailyPriority);
      d.topThree[i]=input.value.trim();
    });
    d.faith.scripture=document.getElementById("dailyScripture")?.value.trim()||"";
    d.faith.prayer=document.getElementById("dailyPrayer")?.value.trim()||"";
    d.faith.gratitude=document.getElementById("dailyGratitude")?.value.trim()||"";
    d.notes=document.getElementById("dailyNotes")?.value.trim()||"";
    d.wins=document.getElementById("dailyWins")?.value.trim()||"";
    write(d);
    this.publish("daily:text-save");
    this.render();
  },

  carryProjectAction(){
    const project=global.IronProjects?.summary?.().nextProject;
    if(!project)return;
    this.update(d=>{
      const openIndex=d.topThree.findIndex(x=>!x);
      const text=`${project.title}${project.nextAction?` — ${project.nextAction}`:""}`;
      d.topThree[openIndex>=0?openIndex:2]=text;
    },"daily:project-carry");
  },

  clearDay(){
    const fresh=clone(DEFAULTS);
    fresh.date=today();
    write(fresh);
    this.publish("daily:clear");
    this.render();
  },

  render(){
    const d=read();
    const summary=this.summary();

    document.querySelectorAll("[data-daily-priority]").forEach(input=>{
      const i=Number(input.dataset.dailyPriority);
      if(document.activeElement!==input)input.value=d.topThree[i]||"";
    });

    const shiftHost=document.getElementById("dailyShiftTasks");
    if(shiftHost){
      shiftHost.innerHTML=d.shiftTasks.map(item=>`
        <button class="daily-check ${item.done?"done":""}" data-daily-shift="${escapeHtml(item.id)}">
          <span>${item.done?"✓":"○"}</span><strong>${escapeHtml(item.label)}</strong>
        </button>
      `).join("");
    }

    const bodyLabels={
      workout:"Workout",
      steps:"10,000 Steps",
      mobilityAM:"Morning Mobility",
      mobilityPM:"Evening Mobility",
      nutrition:"Nutrition Target",
      hydration:"Hydration Target"
    };
    const bodyHost=document.getElementById("dailyBodyTasks");
    if(bodyHost){
      bodyHost.innerHTML=Object.entries(bodyLabels).map(([key,label])=>`
        <button class="daily-check ${d.body[key]?"done":""}" data-daily-body="${escapeHtml(key)}">
          <span>${d.body[key]?"✓":"○"}</span><strong>${escapeHtml(label)}</strong>
        </button>
      `).join("");
    }

    const fields={
      dailyScripture:d.faith.scripture,
      dailyPrayer:d.faith.prayer,
      dailyGratitude:d.faith.gratitude,
      dailyNotes:d.notes,
      dailyWins:d.wins
    };
    Object.entries(fields).forEach(([id,value])=>{
      const el=document.getElementById(id);
      if(el&&document.activeElement!==el)el.value=value||"";
    });

    const faithBtn=document.getElementById("dailyFaithComplete");
    if(faithBtn){
      faithBtn.classList.toggle("done",d.faith.completed);
      faithBtn.textContent=d.faith.completed?"✓ Faith Completed":"Mark Faith Complete";
    }

    const progress=document.getElementById("dailyProgressBar");
    if(progress)progress.style.width=`${summary.percentage}%`;

    const progressText=document.getElementById("dailyProgressText");
    if(progressText)progressText.textContent=`${summary.complete} of ${summary.total} complete (${summary.percentage}%)`;

    const dateLabel=document.getElementById("dailyDateLabel");
    if(dateLabel){
      const parsed=new Date(`${d.date}T12:00:00`);
      dateLabel.textContent=parsed.toLocaleDateString([],{
        weekday:"long",month:"long",day:"numeric"
      });
    }

    this.publish("daily:render");
    global.IronEvents?.emit("daily:rendered",summary);
  },

  bind(){
    document.addEventListener("click",event=>{
      const shift=event.target.closest("[data-daily-shift]");
      if(shift)this.toggleShift(shift.dataset.dailyShift);

      const body=event.target.closest("[data-daily-body]");
      if(body)this.toggleBody(body.dataset.dailyBody);
    });

    document.getElementById("dailySave")?.addEventListener("click",()=>this.saveText());

    document.getElementById("dailyFaithComplete")?.addEventListener("click",()=>{
      this.update(d=>d.faith.completed=!d.faith.completed,"daily:faith-toggle");
    });

    document.getElementById("dailyCarryProject")?.addEventListener("click",()=>this.carryProjectAction());

    document.getElementById("dailyClear")?.addEventListener("click",()=>{
      if(confirm("Reset today’s Daily Command Center?"))this.clearDay();
    });

    document.querySelectorAll("[data-daily-autosave]").forEach(el=>{
      el.addEventListener("change",()=>this.saveText());
      el.addEventListener("blur",()=>this.saveText());
    });
  },

  init(){
    this.bind();
    this.render();
  }
};

global.IronDaily=IronDaily;
})(window);
