(function(global){
  "use strict";

  class CommandCenterEngine {
    constructor({missionLogs=[],exerciseLogs=[],golfLogs=[],softballLogs=[],nutritionLogs=[],throwingLogs=[],schedule={},today=new Date(),tournaments={}}={}) {
      Object.assign(this,{missionLogs,exerciseLogs,golfLogs,softballLogs,nutritionLogs,throwingLogs,schedule,today,tournaments});
    }
    avg(values){const valid=values.filter(x=>Number.isFinite(Number(x)));return valid.length?valid.reduce((sum,x)=>sum+Number(x),0)/valid.length:0}
    key(date){return date.toISOString().slice(0,10)}
    shift(){const raw=this.schedule[this.key(this.today)]||"off";return({workday:"day",offday:"off"}[raw]||raw)}
    shiftLabel(){return({day:"Day Shift",night:"Night Shift",off:"Off Day",recovery:"Recovery",tournament:"Tournament"}[this.shift()]||"Off Day")}
    nextEvent(){
      const events=Object.entries(this.tournaments)
        .map(([key,value])=>({key,...value,days:Math.max(0,Math.ceil((value.date-this.today)/86400000))}))
        .sort((a,b)=>a.date-b.date);
      return events.find(x=>x.date>=this.today)||events.at(-1)||null;
    }
    readiness(){
      const recent=this.missionLogs.slice(-7);if(!recent.length)return 0;
      const sleep=Math.min(100,this.avg(recent.map(x=>Math.min(1,(x.sleep||0)/7.5)*100)));
      const ready=this.avg(recent.map(x=>x.readinessScore||0));
      const water=Math.min(100,this.avg(recent.map(x=>Math.min(1,(x.water||0)/128)*100)));
      return Math.round(sleep*.35+ready*.5+water*.15);
    }
    weeklyGrade(){
      const recent=this.missionLogs.slice(-7);if(!recent.length)return{score:0,grade:"—"};
      const score=Math.round(this.avg(recent.map(x=>x.ironScore||0)));
      return{score,grade:score>=90?"A":score>=80?"B":score>=70?"C":score>=60?"D":"F"};
    }
    scores(){
      const missions=this.missionLogs.slice(-7),golf=this.golfLogs.slice(-6),softball=this.softballLogs.slice(-6),nutrition=this.nutritionLogs.slice(-7),exercise=this.exerciseLogs.slice(-20);
      return{
        mission:Math.round(this.avg(missions.map(x=>x.ironScore||0))),
        recovery:this.readiness(),
        strength:exercise.length?Math.round(this.avg(exercise.map(x=>(x.setsPlanned?Math.min(100,(x.setsDone||0)/x.setsPlanned*100):0)*.45+(x.technique||0)*10*.35+(x.pain?0:100)*.2))):0,
        golf:golf.length?Math.round(this.avg(golf.map(x=>(x.contact||0)*.6+(x.confidence||0)*4))):0,
        softball:softball.length?Math.max(0,Math.round(this.avg(softball.map(x=>(x.confidence||0)*10-(x.armFatigue||0)*4-(x.shoulderPain||0)*5)))):0,
        nutrition:nutrition.length?Math.round(this.avg(nutrition.map(x=>((x.mealsCompleted||0)/3*70)+(x.onPlan?30:0)))):0
      };
    }
    priority(){
      const scores=this.scores(),[key,score]=Object.entries(scores).sort((a,b)=>a[1]-b[1])[0];
      const map={
        mission:["Daily execution","Complete the minimum mission and avoid missing twice."],
        recovery:["Sleep and recovery","Protect sleep, hydration, mobility, and reduced volume."],
        strength:["Strength quality","Hold resistance until technique and pain status improve."],
        golf:["Golf contact","Return to slow contact drills and the current academy lesson."],
        softball:["Softball readiness","Protect the arm and complete the current progression."],
        nutrition:["Nutrition compliance","Complete all planned meals before changing portions."]
      };
      return{key,score,title:map[key][0],instruction:map[key][1]};
    }
    alerts(){
      const alerts=[],recent=this.missionLogs.slice(-7),golf=this.golfLogs.at(-1),throwing=this.throwingLogs.at(-1),nutrition=this.nutritionLogs.at(-1);
      const sleep=this.avg(recent.map(x=>x.sleep||0)),ready=this.avg(recent.map(x=>x.readinessScore||0));
      if(sleep>0&&sleep<6.5)alerts.push({level:"critical",title:"Sleep debt",text:`Seven-day average is ${sleep.toFixed(1)} hours.`});
      if(ready>0&&ready<75)alerts.push({level:"warning",title:"Readiness below target",text:`Average readiness is ${Math.round(ready)}.`});
      if(throwing&&(throwing.armFatigue>=6||throwing.shoulderPain>=4))alerts.push({level:"critical",title:"Throwing restriction",text:"No max-effort throwing until arm status improves."});
      if(golf&&golf.contact>0&&golf.contact<65)alerts.push({level:"warning",title:"Golf contact regression",text:"Return to half-swings and checkpoint work."});
      if(nutrition&&nutrition.mealsCompleted<3)alerts.push({level:"info",title:"Meal compliance gap",text:"Complete the planned three-meal structure."});
      if(!alerts.length)alerts.push({level:"good",title:"Operation stable",text:"No critical issue is active."});
      return alerts;
    }
    summary(){
      const latest=this.missionLogs.at(-1)||{},grade=this.weeklyGrade(),event=this.nextEvent();
      return{shift:this.shiftLabel(),readiness:this.readiness(),ironScore:latest.ironScore||0,weight:latest.weight||0,sleep:latest.sleep||0,water:latest.water||0,weeklyGrade:grade,scores:this.scores(),priority:this.priority(),alerts:this.alerts(),nextEvent:event};
    }
  }

  const ids={
    status:"commandStatus",summary:"commandSummary",readiness:"commandReadiness",ironScore:"commandIronScore",weeklyGrade:"commandWeeklyGrade",shift:"commandShift",weight:"commandWeight",event:"commandEvent",priority:"commandPriority",scorecard:"commandScorecard",actions:"commandActions",alerts:"commandAlerts",sleep:"commandSleep",water:"commandWater",golf:"commandGolf",softball:"commandSoftball",strength:"commandStrength",nutrition:"commandNutrition"
  };
  const element=id=>global.document?.getElementById(id)||null;
  const scoreClass=value=>value>=85?"command-score-good":value>=70?"command-score-watch":"command-score-risk";

  function render(summary,{activateTab}={}){
    if(!summary)return null;
    const el=Object.fromEntries(Object.entries(ids).map(([key,id])=>[key,element(id)]));
    if(!el.status)return summary;
    el.status.textContent=summary.readiness>=85?"Competition Ready":summary.readiness>=70?"Operation On Track":"Recovery Attention Required";
    el.summary.textContent=summary.priority.instruction;
    el.readiness.textContent=`${summary.readiness}%`;
    el.ironScore.textContent=summary.ironScore;
    el.weeklyGrade.textContent=`${summary.weeklyGrade.grade} · ${summary.weeklyGrade.score}`;
    el.shift.textContent=summary.shift;
    el.weight.textContent=summary.weight?`${Number(summary.weight).toFixed(1)} lb`:"—";
    el.event.textContent=summary.nextEvent?`${summary.nextEvent.name} · ${summary.nextEvent.days}d`:"—";
    el.priority.innerHTML=`<div class="label">PRIMARY FOCUS</div><h2>${summary.priority.title}</h2><p>${summary.priority.instruction}</p><small>Current category score: ${summary.priority.score}</small>`;
    const labels={mission:"Mission",recovery:"Recovery",strength:"Strength",golf:"Golf",softball:"Softball",nutrition:"Nutrition"};
    el.scorecard.innerHTML=Object.entries(summary.scores).map(([key,value])=>`<div><span>${labels[key]}</span><strong class="${scoreClass(value)}">${value}</strong></div>`).join("");
    const actions=[["Mission","mission"],["Coach","coach"],["Golf Plan","golf"],["Softball Plan","softball"],["Nutrition","nutrition"],["Weekly Review","weekly"],["Tournament","tournament"],["System","system"]];
    el.actions.innerHTML=actions.map(([label,tab])=>`<button class="command-action" data-command-tab="${tab}">${label}<small>Open ${tab}</small></button>`).join("");
    el.actions.querySelectorAll("[data-command-tab]").forEach(button=>button.addEventListener("click",()=>activateTab?.(button.dataset.commandTab)));
    el.alerts.innerHTML=summary.alerts.map(alert=>`<div class="command-alert ${alert.level}"><b>${alert.title}</b><br><span>${alert.text}</span></div>`).join("");
    el.sleep.textContent=summary.sleep?`${Number(summary.sleep).toFixed(1)} h`:"—";
    el.water.textContent=summary.water?`${summary.water} oz`:"—";
    el.golf.textContent=summary.scores.golf;
    el.softball.textContent=summary.scores.softball;
    el.strength.textContent=summary.scores.strength;
    el.nutrition.textContent=summary.scores.nutrition;
    return summary;
  }

  function publish(summary,source="command-center"){
    global.AppState?.set?.("command.summary",summary,{source});
    global.IronEvents?.emit?.("command:updated",summary);
    return summary;
  }

  function create(config){return new CommandCenterEngine(config)}
  function renderFromConfig(config,options={}){const summary=create(config).summary();render(summary,options);return publish(summary,options.source||"command-render")}

  global.IronCommand={CommandCenterEngine,create,render,renderFromConfig,publish,scoreClass};
})(window);
