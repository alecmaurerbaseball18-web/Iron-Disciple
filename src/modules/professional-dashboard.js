(function(global){
  "use strict";

  const clamp=value=>Math.max(0,Math.min(100,Math.round(Number(value)||0)));

  class ProfessionalDashboardEngine{
    constructor({today=new Date(),shift="off",dayState={},missionScores={},readiness=0,water=0}={}){
      this.today=today;
      this.shift=shift;
      this.dayState=dayState||{};
      this.missionScores=missionScores||{};
      this.readiness=Number(readiness)||0;
      this.water=Number(water)||0;
    }

    timelineTemplate(){
      const commonEnd=[
        {id:"mobility",label:"Mobility & Flexibility",detail:"Complete the prescribed recovery sequence.",category:"recovery"},
        {id:"review",label:"Evening Review",detail:"Record the win, lesson, tomorrow focus, and save today.",category:"mission"}
      ];
      if(this.shift==="day")return[
        {id:"wake",time:"4:45 AM",label:"Wake & Hydrate",detail:"Water, medication as prescribed, and readiness check.",category:"recovery"},
        {id:"faith",time:"5:00 AM",label:"Faith Assignment",detail:"Podcast, Scripture takeaway, prayer, and application.",category:"mission"},
        {id:"meal1",time:"5:20 AM",label:"Meal 1",detail:"Complete the planned beef, rice, and broccoli meal.",category:"nutrition"},
        {id:"shift",time:"6:00 AM",label:"Day Shift",detail:"Execute work responsibilities and accumulate walking.",category:"mission"},
        {id:"meal2",time:"11:30 AM",label:"Meal 2",detail:"Complete the planned meal and hydration check.",category:"nutrition"},
        {id:"portable",time:"During Shift",label:"Portable Training",detail:"Workday cardio, strength circuit, and no-equipment skill work.",category:"strength"},
        {id:"meal3",time:"7:30 PM",label:"Meal 3",detail:"Post-shift recovery meal.",category:"nutrition"},
        {id:"mobility",time:"8:10 PM",label:"Mobility & Flexibility",detail:"Hips, calves, chest, shoulders, and breathing.",category:"recovery"},
        {id:"review",time:"8:35 PM",label:"Evening Review",detail:"Record today and prepare for sleep.",category:"mission"},
        {id:"sleep",time:"9:00 PM",label:"Sleep Window",detail:"Protect the longest practical sleep opportunity.",category:"recovery"}
      ];
      if(this.shift==="night")return[
        {id:"wake",time:"4:45 PM",label:"Wake & Hydrate",detail:"Water, medication as prescribed, and readiness check.",category:"recovery"},
        {id:"faith",time:"5:00 PM",label:"Faith Assignment",detail:"Podcast, Scripture takeaway, prayer, and application.",category:"mission"},
        {id:"meal1",time:"5:20 PM",label:"Meal 1",detail:"Complete the planned meal before shift.",category:"nutrition"},
        {id:"shift",time:"6:00 PM",label:"Night Shift",detail:"Execute work responsibilities and accumulate walking.",category:"mission"},
        {id:"meal2",time:"12:00 AM",label:"Meal 2",detail:"Complete the planned meal and hydration check.",category:"nutrition"},
        {id:"portable",time:"During Shift",label:"Portable Training",detail:"Workday cardio, strength circuit, and no-equipment skill work.",category:"strength"},
        {id:"meal3",time:"7:30 AM",label:"Meal 3",detail:"Post-shift recovery meal.",category:"nutrition"},
        {id:"mobility",time:"8:00 AM",label:"Mobility & Flexibility",detail:"Downshift before sleep.",category:"recovery"},
        {id:"review",time:"8:15 AM",label:"Evening Review",detail:"Record today and prepare the room for sleep.",category:"mission"},
        {id:"sleep",time:"8:30 AM",label:"Sleep Window",detail:"Dark, cool room and uninterrupted sleep opportunity.",category:"recovery"}
      ];
      if(this.shift==="recovery")return[
        {id:"faith",time:"Morning",label:"Faith Assignment",detail:"Podcast, reflection, and prayer.",category:"mission"},
        {id:"meal1",time:"After Waking",label:"Meal 1",detail:"Complete the planned meal.",category:"nutrition"},
        {id:"walk",time:"Midday",label:"Easy Walk",detail:"20–30 minutes only if it improves recovery.",category:"recovery"},
        {id:"mobility",time:"Afternoon",label:"Recovery Mobility",detail:"Complete the full recovery sequence.",category:"recovery"},
        {id:"meal2",time:"Afternoon",label:"Meal 2",detail:"Complete the planned meal.",category:"nutrition"},
        {id:"meal3",time:"Evening",label:"Meal 3",detail:"Complete the planned meal.",category:"nutrition"},
        {id:"review",time:"Evening",label:"Evening Review",detail:"Record recovery status and prepare for sleep.",category:"mission"}
      ];
      if(this.shift==="tournament")return[
        {id:"faith",time:"Pre-Event",label:"Faith & Composure",detail:"Prayer, gratitude, and event intention.",category:"mission"},
        {id:"meal1",time:"Pre-Event",label:"Familiar Meal",detail:"Protein, carbohydrate, and hydration.",category:"nutrition"},
        {id:"warmup",time:"T−60",label:"Progressive Warm-Up",detail:"Movement, arm care, and sport-specific preparation.",category:"strength"},
        {id:"competition",time:"Event",label:"Competition",detail:"Execute routine and conserve unnecessary energy.",category:"mission"},
        {id:"recovery",time:"Post-Event",label:"Post-Event Recovery",detail:"Hydrate, refuel, mobility, and pain check.",category:"recovery"},
        {id:"review",time:"Evening",label:"Event Review",detail:"Record performance, recovery, and lessons.",category:"mission"}
      ];
      return[
        {id:"faith",time:"Morning",label:"Faith Assignment",detail:"Podcast, Scripture takeaway, prayer, and application.",category:"mission"},
        {id:"meal1",time:"Morning",label:"Meal 1",detail:"Complete the planned meal before training.",category:"nutrition"},
        {id:"strength",time:"Block 1",label:"Tactical Athlete",detail:"Complete today’s readiness-adjusted strength session.",category:"strength"},
        {id:"golf",time:"Block 2",label:"Golf Academy",detail:"Complete the current lesson and log contact.",category:"golf"},
        {id:"meal2",time:"Midday",label:"Meal 2",detail:"Complete the planned meal and hydration check.",category:"nutrition"},
        {id:"softball",time:"Block 3",label:"Softball Academy",detail:"Complete fielding, hitting, speed, or arm-care work.",category:"softball"},
        {id:"cardio",time:"Flexible",label:"Cardio / Walking",detail:"Complete scheduled Zone 2 or walking target.",category:"recovery"},
        {id:"meal3",time:"Evening",label:"Meal 3",detail:"Complete the planned recovery meal.",category:"nutrition"},
        ...commonEnd.map((x,i)=>({...x,time:i===0?"Evening":"Night"}))
      ];
    }

    completionFromDayState(id){
      const s=this.dayState;
      return ({faith:Boolean(s.faithCompleted),golf:Boolean(s.golfCompleted),softball:Boolean(s.softballCompleted),meal1:Boolean(s.meal1Completed),meal2:Boolean(s.meal2Completed),meal3:Boolean(s.meal3Completed),review:Boolean(s.win||s.lesson||s.tomorrow)})[id]||false;
    }
    timeline(savedChecks={}){return this.timelineTemplate().map(item=>({...item,completed:savedChecks[item.id]??this.completionFromDayState(item.id)}))}
    nextTask(items){return items.find(x=>!x.completed)||null}
    progress(items){return items.length?Math.round(items.filter(x=>x.completed).length/items.length*100):0}
    rings(items){
      const missionProgress=this.progress(items),scores=this.missionScores;
      return[
        {key:"mission",label:"Mission",value:Math.max(Number(scores.mission)||0,missionProgress)},
        {key:"recovery",label:"Recovery",value:Number(scores.recovery)||this.readiness},
        {key:"strength",label:"Strength",value:Number(scores.strength)||0},
        {key:"golf",label:"Golf",value:Number(scores.golf)||0},
        {key:"softball",label:"Softball",value:Number(scores.softball)||0},
        {key:"nutrition",label:"Nutrition",value:Number(scores.nutrition)||0}
      ].map(x=>({...x,value:clamp(x.value)}));
    }
  }

  const keyFor=dateKey=>`id-v21-timeline-${dateKey}`;
  const loadChecks=dateKey=>global.IronStorage?.get(keyFor(dateKey),{})||{};
  const saveChecks=(dateKey,checks)=>global.IronStorage?.set(keyFor(dateKey),checks);
  const ringClass=value=>value>=85?"good":value>=70?"watch":"risk";
  const byId=id=>document.getElementById(id);

  function create(config){return new ProfessionalDashboardEngine(config)}

  function summary(config){
    const engine=create(config),checks=loadChecks(config.dateKey),timeline=engine.timeline(checks),next=engine.nextTask(timeline),progress=engine.progress(timeline),rings=engine.rings(timeline);
    return {timeline,nextTask:next,progress,rings,checks};
  }

  function publish(data,source="professional-dashboard"){
    global.AppState?.set("dashboard.timeline",data.timeline,{source});
    global.AppState?.set("dashboard.progress",data.progress,{source});
    global.AppState?.set("dashboard.nextTask",data.nextTask||null,{source});
    global.AppState?.set("professional.summary",data,{source});
    global.IronEvents?.emit("professional:updated",data);
  }

  function render(config,hooks={}){
    const data=summary(config);publish(data,hooks.source||"professional-render");
    const progressEl=byId("professionalMissionProgress"),ringsEl=byId("professionalRings"),titleEl=byId("nextTaskTitle"),detailEl=byId("nextTaskDetail"),completeEl=byId("completeNextTask"),timelineEl=byId("professionalTimeline");
    if(progressEl)progressEl.textContent=`${data.progress}% complete`;
    if(ringsEl)ringsEl.innerHTML=data.rings.map(x=>`<div class="professional-ring ${ringClass(x.value)}" style="--value:${x.value}"><strong>${x.value}</strong><span>${x.label}</span></div>`).join("");
    if(data.nextTask){
      if(titleEl)titleEl.textContent=data.nextTask.label;
      if(detailEl)detailEl.textContent=`${data.nextTask.time} — ${data.nextTask.detail}`;
      if(completeEl){completeEl.disabled=false;completeEl.textContent="Complete Next Task"}
    }else{
      if(titleEl)titleEl.textContent="Daily Mission Complete";
      if(detailEl)detailEl.textContent="Complete the evening review and protect the next sleep window.";
      if(completeEl){completeEl.disabled=true;completeEl.textContent="All Tasks Complete"}
    }
    if(timelineEl){
      timelineEl.innerHTML=data.timeline.map(item=>`<div class="professional-timeline-item ${item.completed?"completed":""} ${data.nextTask?.id===item.id?"current":""}" data-timeline-id="${item.id}"><button class="timeline-check" aria-label="${item.completed?"Mark incomplete":"Mark complete"}">${item.completed?"✓":""}</button><div class="timeline-copy"><b>${item.label}</b><small>${item.detail}</small></div><div class="timeline-time">${item.time}</div></div>`).join("");
      timelineEl.querySelectorAll("[data-timeline-id]").forEach(row=>row.querySelector(".timeline-check")?.addEventListener("click",()=>toggle(config,row.dataset.timelineId,undefined,hooks)));
    }
    global.IronEvents?.emit("professional:rendered",data);
    return data;
  }

  function toggle(config,id,forceValue,hooks={}){
    const checks=loadChecks(config.dateKey);
    checks[id]=forceValue===undefined?!Boolean(checks[id]):Boolean(forceValue);
    saveChecks(config.dateKey,checks);
    const data=render(config,hooks);
    hooks.onChange?.(data);
    global.IronEvents?.emit("professional:task-toggled",{id,completed:checks[id],summary:data});
    return data;
  }

  function completeNext(config,hooks={}){
    const data=summary(config);
    return data.nextTask?toggle(config,data.nextTask.id,true,hooks):data;
  }

  function reset(config,hooks={}){
    global.IronStorage?.remove(keyFor(config.dateKey));
    const data=render(config,hooks);
    hooks.onChange?.(data);
    global.IronEvents?.emit("professional:reset",data);
    return data;
  }

  global.ProfessionalDashboardEngine=ProfessionalDashboardEngine;
  global.IronProfessional={create,summary,render,toggle,completeNext,reset,loadChecks,keyFor};
})(window);
