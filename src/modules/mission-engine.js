(function(global){
  "use strict";


  const DEFAULT_MISSION_PROFILE=Object.freeze({
    identity:"Become who you said you would be.",
    phase:"BUILD",
    goals:Object.freeze([
      Object.freeze({
        id:"body",
        category:"BODY",
        title:"Reach 225 lb @ 10% Body Fat",
        priority:10,
        activeProgram:"tactical_beginner"
      }),
      Object.freeze({
        id:"golf",
        category:"GOLF",
        title:"Break 80",
        priority:8,
        activeProgram:"break80"
      }),
      Object.freeze({
        id:"softball",
        category:"SOFTBALL",
        title:"Become an Elite Third Baseman",
        priority:7,
        activeProgram:"third_baseman"
      }),
      Object.freeze({
        id:"family",
        category:"FAMILY",
        title:"Intentional Husband and Father",
        priority:10,
        activeProgram:null
      }),
      Object.freeze({
        id:"career",
        category:"CAREER",
        title:"Elite Police Supervisor",
        priority:9,
        activeProgram:null
      })
    ])
  });

  function cloneMissionProfile(){
    return {
      identity:DEFAULT_MISSION_PROFILE.identity,
      phase:DEFAULT_MISSION_PROFILE.phase,
      goals:DEFAULT_MISSION_PROFILE.goals.map(goal=>({...goal}))
    };
  }

  class MissionEngine {
    constructor({
      readiness="GREEN",
      readinessScore=100,
      sleep=0,
      shoulderPain=0,
      soreness=0,
      stress=0,
      timeline=[]
    }={}){
      Object.assign(this,{
        readiness,
        readinessScore:Number(readinessScore)||0,
        sleep:Number(sleep)||0,
        shoulderPain:Number(shoulderPain)||0,
        soreness:Number(soreness)||0,
        stress:Number(stress)||0,
        timeline:Array.isArray(timeline)?timeline:[]
      });
    }


    getMissionProfile(){
      return cloneMissionProfile();
    }

    riskLevel(){
      let points=0;
      if(this.readiness==="YELLOW")points+=2;
      if(this.readiness==="RED")points+=5;
      if(this.readinessScore<75)points+=2;
      if(this.readinessScore<60)points+=3;
      if(this.sleep>0&&this.sleep<6.5)points+=2;
      if(this.sleep>0&&this.sleep<5.5)points+=3;
      if(this.shoulderPain>=3)points+=2;
      if(this.shoulderPain>=6)points+=4;
      if(this.soreness>=6)points+=2;
      if(this.stress>=8)points+=2;
      return points>=8?"RED":points>=4?"YELLOW":"GREEN";
    }

    categoryRule(category){
      const risk=this.riskLevel();
      if(risk==="GREEN")return {action:"KEEP",note:null};

      if(risk==="YELLOW"){
        const rules={
          strength:{action:"REDUCE",note:"Reduce sets by 20%; cap RPE at 8."},
          golf:{action:"REDUCE",note:"Reduce ball count by 20%; prioritize contact."},
          softball:{
            action:"REDUCE",
            note:this.shoulderPain>=3
              ?"Dry footwork, hitting mechanics, and arm care only."
              :"Reduce reps by 30%; no max-effort throwing."
          },
          recovery:{action:"KEEP",note:"Keep easy walking, hydration, and mobility."},
          nutrition:{action:"KEEP",note:"Maintain planned portions and hydration."},
          mission:{action:"KEEP",note:"Complete faith, readiness, and review."}
        };
        return rules[category]||rules.mission;
      }

      const rules={
        strength:{action:"REPLACE",note:"Replace with 15–20 minutes of mobility and activation."},
        golf:{action:"REPLACE",note:"Dry rehearsal or 20–30 slow contact reps only."},
        softball:{action:"REPLACE",note:"No throwing or sprinting. Arm care and dry footwork only."},
        recovery:{action:"PRIORITIZE",note:"Easy walking only if helpful; complete full mobility."},
        nutrition:{action:"PRIORITIZE",note:"Complete meals and hydration. Do not increase the deficit."},
        mission:{action:"PRIORITIZE",note:"Complete faith, check-in, and evening review."}
      };
      return rules[category]||rules.mission;
    }

    adjustedTimeline(){
      return this.timeline.map(item=>({...item,...this.categoryRule(item.category)}));
    }

    summary(){
      const all=this.adjustedTimeline();
      const active=all.filter(item=>!item.completed);
      const order={PRIORITIZE:0,KEEP:1,REDUCE:2,REPLACE:3};
      active.sort((a,b)=>(order[a.action]??9)-(order[b.action]??9));

      const deferred=all.filter(item=>
        !item.completed &&
        ["REDUCE","REPLACE"].includes(item.action) &&
        ["golf","softball","strength"].includes(item.category)
      );
      const risk=this.riskLevel();

      return {
        risk,
        headline:risk==="GREEN"
          ?"Full Mission Authorized"
          :risk==="YELLOW"
            ?"Reduced-Volume Mission"
            :"Recovery-Priority Mission",
        instruction:risk==="GREEN"
          ?"Complete the mission without adding volume."
          :risk==="YELLOW"
            ?"Keep the mission, reduce fatigue-producing work, and prioritize quality."
            :"Replace hard training with recovery work and protect sleep.",
        plan:active,
        deferred,
        firstAction:active[0]||null,
        generatedAt:new Date().toISOString()
      };
    }
  }

  const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));

  function renderPlanRows(items){
    if(!items.length)return '<div class="status-good"><b>All planned tasks are complete.</b></div>';
    return items.map(item=>`
      <div class="adaptive-plan-row">
        <div>
          <b>${escapeHtml(item.label)}</b>
          <span class="adaptive-note">${escapeHtml(item.note||item.detail||"")}</span>
        </div>
        <span class="adaptive-badge ${escapeHtml(String(item.action||"keep").toLowerCase())}">
          ${escapeHtml(item.action||"KEEP")}
        </span>
      </div>`).join("");
  }

  function renderCarryoverRows(items){
    if(!items.length)return '<div class="status-good"><b>No sport or strength work needs to carry over.</b></div>';
    return items.map(item=>`
      <div class="carryover-row">
        <b>${escapeHtml(item.label)}</b><br>
        <small>${escapeHtml(item.note||"")}</small>
      </div>`).join("");
  }

  const IronMission={
    version:"3.0.0-alpha.11",


    getMissionProfile(){
      return cloneMissionProfile();
    },

    create(options){
      return new MissionEngine(options);
    },

    build(config={}){
      const professional=config.professionalEngine;
      const timeline=professional
        ? professional.timeline(config.timelineChecks||{})
        : (config.timeline||[]);

      return new MissionEngine({
        readiness:config.readiness||"GREEN",
        readinessScore:config.readinessScore??100,
        sleep:config.sleep,
        shoulderPain:config.shoulderPain,
        soreness:config.soreness,
        stress:config.stress,
        timeline
      });
    },

    summarize(config={},metadata={}){
      const summary=this.build(config).summary();
      global.AppState?.set("mission.adaptive",summary,{
        source:metadata.source||"mission:summarize"
      });
      global.IronEvents?.emit("mission:updated",summary);
      if(summary.firstAction)global.IronEvents?.emit("mission:first-action",summary.firstAction);
      if(!summary.plan.length)global.IronEvents?.emit("mission:completed",summary);
      return summary;
    },

    persistCarryover(summary,{dayKey,storage}={}){
      if(!dayKey||!storage)return [];
      const state=storage.get(dayKey,{})||{};
      const carryover=(summary?.deferred||[]).map(item=>({
        id:item.id,
        label:item.label,
        category:item.category,
        reason:item.note
      }));
      state.adaptiveCarryover=carryover;
      storage.set(dayKey,state);
      global.AppState?.set("mission.carryover",carryover,{source:"mission:persist-carryover"});
      global.IronEvents?.emit("mission:carryover-updated",carryover);
      return carryover;
    },

    render(config={},elements={},options={}){
      const summary=this.summarize(config,{source:options.source||"mission:render"});

      if(elements.headline)elements.headline.textContent=summary.headline;
      if(elements.instruction)elements.instruction.textContent=summary.instruction;
      if(elements.risk)elements.risk.textContent=summary.risk;
      if(elements.taskCount)elements.taskCount.textContent=summary.plan.length;
      if(elements.deferredCount)elements.deferredCount.textContent=summary.deferred.length;
      if(elements.firstAction)elements.firstAction.textContent=summary.firstAction?.label||"Mission complete";
      if(elements.plan)elements.plan.innerHTML=renderPlanRows(summary.plan);
      if(elements.carryover)elements.carryover.innerHTML=renderCarryoverRows(summary.deferred);

      this.persistCarryover(summary,{
        dayKey:options.dayKey,
        storage:options.storage
      });

      global.IronEvents?.emit("mission:rendered",summary);
      return summary;
    },

    MissionEngine
  };

  global.IronMission=IronMission;
})(window);
