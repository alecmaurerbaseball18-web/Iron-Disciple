(function(global){
  "use strict";

class NutritionEngine {
  constructor({missionLogs=[],nutritionLogs=[],settings={},today=new Date()}) {
    this.missionLogs=missionLogs||[];
    this.nutritionLogs=nutritionLogs||[];
    this.settings=settings||{};
    this.today=today;
  }

  avg(values){
    const clean=values.filter(v=>Number.isFinite(Number(v))&&Number(v)!==0);
    return clean.length?clean.reduce((a,b)=>a+Number(b),0)/clean.length:0;
  }

  recentWeights(days=14){
    return this.missionLogs.slice(-days).map(x=>({date:x.date,weight:Number(x.weight)||0})).filter(x=>x.weight>0);
  }

  sevenDayAverage(){
    const weights=this.recentWeights(7).map(x=>x.weight);
    return this.avg(weights);
  }

  previousSevenDayAverage(){
    const weights=this.recentWeights(14).map(x=>x.weight);
    if(weights.length<8)return 0;
    return this.avg(weights.slice(0,7));
  }

  weeklyChange(){
    const current=this.sevenDayAverage();
    const previous=this.previousSevenDayAverage();
    return current&&previous?current-previous:0;
  }

  weeklyPercent(){
    const previous=this.previousSevenDayAverage();
    return previous?this.weeklyChange()/previous*100:0;
  }

  compliance(days=7){
    const recent=this.nutritionLogs.slice(-days);
    if(!recent.length)return 0;
    return Math.round(this.avg(recent.map(x=>{
      const meals=(Number(x.mealsCompleted)||0)/3*70;
      const water=Math.min(1,(Number(x.water)||0)/128)*20;
      const plan=x.onPlan?10:0;
      return meals+water+plan;
    })));
  }

  estimatedProtein(){
    const beef=Number(this.settings.beefOz||6);
    const meals=3;
    return Math.round(beef*meals*7);
  }

  estimatedCalories(){
    const beef=Number(this.settings.beefOz||6);
    const rice=Number(this.settings.riceCups||1);
    const broccoli=Number(this.settings.broccoliCups||1.5);
    const beefCalories=beef*70;
    const riceCalories=rice*205;
    const broccoliCalories=broccoli*30;
    return Math.round((beefCalories+riceCalories+broccoliCalories)*3);
  }

  hydrationTarget({shift="off",trainingMinutes=0,temperatureRisk=false}={}){
    let target=128;
    if(shift==="day"||shift==="night")target+=16;
    if(trainingMinutes>=90)target+=16;
    if(temperatureRisk)target+=16;
    return Math.min(176,target);
  }

  recommendation({readiness="GREEN",shift="off",trainingMinutes=0}={}){
    const change=this.weeklyChange();
    const pct=this.weeklyPercent();
    const compliance=this.compliance();
    const current=this.sevenDayAverage();

    const base={
      action:"Maintain portions",
      beefDelta:0,
      riceDelta:0,
      broccoliDelta:0,
      reason:"Insufficient trend data. Follow the current plan consistently."
    };

    if(!current||!this.previousSevenDayAverage())return base;

    if(compliance<75){
      return{
        action:"Improve compliance first",
        beefDelta:0,riceDelta:0,broccoliDelta:0,
        reason:`Nutrition compliance is ${compliance}%. Do not change portions until execution is consistent.`
      };
    }

    if(readiness==="RED"){
      return{
        action:"Protect recovery",
        beefDelta:0,riceDelta:0.25,broccoliDelta:0,
        reason:"Readiness is red. Do not create a larger deficit; add carbohydrate around recovery if appetite and digestion permit."
      };
    }

    if(pct<-1.0){
      return{
        action:"Increase performance fuel",
        beefDelta:0,riceDelta:0.25,broccoliDelta:0,
        reason:`Weight is falling about ${Math.abs(pct).toFixed(1)}% per week, which may threaten performance.`
      };
    }

    if(pct<-0.3){
      return{
        action:"Maintain portions",
        beefDelta:0,riceDelta:0,broccoliDelta:0,
        reason:`Weight is falling at a productive rate: ${Math.abs(change).toFixed(1)} lb per week.`
      };
    }

    if(pct<=0.2){
      return{
        action:"Small calorie reduction",
        beefDelta:0,riceDelta:-0.25,broccoliDelta:0.5,
        reason:`Weight trend is nearly flat despite ${compliance}% compliance. Reduce rice slightly and increase broccoli.`
      };
    }

    return{
      action:"Reduce energy intake",
      beefDelta:0,riceDelta:-0.25,broccoliDelta:0.5,
      reason:`Seven-day average increased ${change.toFixed(1)} lb. Make one small portion adjustment, not a crash diet.`
    };
  }

  safeguards({sleep=0,readiness="GREEN",weightChangePercent=0}={}){
    const alerts=[];
    if(sleep>0&&sleep<6)alerts.push({level:"critical",title:"Low sleep",text:"Do not aggressively reduce food after inadequate sleep."});
    if(readiness==="RED")alerts.push({level:"critical",title:"Recovery compromised",text:"Maintain protein and hydration; avoid extra restriction."});
    if(weightChangePercent<-1.0)alerts.push({level:"warning",title:"Loss rate too fast",text:"Increase carbohydrate slightly to preserve training quality."});
    if(!alerts.length)alerts.push({level:"good",title:"Nutrition guardrails clear",text:"Continue the current plan and reassess from weekly averages."});
    return alerts;
  }
}

  const required=(value,name)=>{if(value===undefined||value===null)throw new Error(`[IronNutrition] Missing ${name}`);return value};

  class NutritionModule {
    constructor(config){this.config=config||{}}

    engine(){
      const c=this.config;
      return new NutritionEngine({
        missionLogs:c.get(c.keys.logs,[]),
        nutritionLogs:c.get(c.keys.nutritionLogs,[]),
        settings:c.settings(),
        today:c.today
      });
    }

    summary(){
      const c=this.config;
      const engine=this.engine();
      const shift=typeof c.shiftForToday==="function"?c.shiftForToday():"off";
      const mission=c.getMission?.()||null;
      const readiness=mission?.readiness?.level||"GREEN";
      const trainingMinutes=mission?.estimatedMinutes||0;
      const recommendation=engine.recommendation({readiness,shift,trainingMinutes});
      const summary={
        recommendation,
        sevenDayAverage:engine.sevenDayAverage(),
        previousSevenDayAverage:engine.previousSevenDayAverage(),
        weeklyChange:engine.weeklyChange(),
        weeklyPercent:engine.weeklyPercent(),
        compliance:engine.compliance(),
        estimatedProtein:engine.estimatedProtein(),
        estimatedCalories:engine.estimatedCalories(),
        hydrationTarget:engine.hydrationTarget({shift,trainingMinutes}),
        recentWeights:engine.recentWeights(14),
        safeguards:engine.safeguards({
          sleep:Number(c.elements.sleep?.value||0),
          readiness,
          weightChangePercent:engine.weeklyPercent()
        }),
        shift,readiness,trainingMinutes,
        plan:c.settings()
      };
      global.AppState?.set("nutrition.summary",summary,{source:"IronNutrition.summary"});
      global.AppState?.set("hydration.targetOz",summary.hydrationTarget||128,{source:"IronNutrition.summary"});
      global.IronEvents?.emit("nutrition:updated",summary);
      return summary;
    }

    render(){
      const c=this.config,e=c.elements,s=this.summary(),rec=s.recommendation;
      required(e.nutritionAction,"nutritionAction").textContent=rec.action;
      e.nutritionReason.textContent=rec.reason;
      e.nutritionWeightAvg.textContent=s.sevenDayAverage?`${s.sevenDayAverage.toFixed(1)} lb`:"—";
      e.nutritionWeeklyChange.textContent=s.previousSevenDayAverage?`${s.weeklyChange>=0?"+":""}${s.weeklyChange.toFixed(1)} lb`:"—";
      e.nutritionCompliance.textContent=`${s.compliance}%`;
      e.nutritionProtein.textContent=`~${s.estimatedProtein} g`;
      e.estimatedCalories.textContent=`~${s.estimatedCalories}`;
      e.nutritionHydrationTarget.textContent=`${s.hydrationTarget} oz`;
      e.currentMealPlan.innerHTML=["Meal 1","Meal 2","Meal 3"].map(name=>`
        <div class="meal-plan-row"><strong>${name}</strong><span>${s.plan.beefOz} oz beef · ${s.plan.riceCups} cup rice · ${s.plan.broccoliCups} cups broccoli</span></div>`).join("");
      const delta=n=>n>0?`+${n}`:`${n}`;
      e.portionRecommendation.innerHTML=`<p><b>${rec.action}</b><br>${rec.reason}</p><div class="portion-change"><div><span>Beef / meal</span><strong>${delta(rec.beefDelta)} oz</strong></div><div><span>Rice / meal</span><strong>${delta(rec.riceDelta)} cup</strong></div><div><span>Broccoli / meal</span><strong>${delta(rec.broccoliDelta)} cup</strong></div></div>`;
      e.nutritionSafeguards.innerHTML=s.safeguards.map(x=>`<div class="alert ${x.level}"><strong>${x.title}</strong><span>${x.text}</span></div>`).join("");
      c.drawLine(e.nutritionWeightChart,s.recentWeights.map(x=>x.weight),false);
      global.IronEvents?.emit("nutrition:rendered",s);
      return s;
    }

    save(){
      const c=this.config,e=c.elements;
      const logs=c.get(c.keys.nutritionLogs,[]).filter(x=>x.date!==c.dateKey);
      const entry={
        date:c.dateKey,
        mealsCompleted:[e.meal1Completed.checked,e.meal2Completed.checked,e.meal3Completed.checked].filter(Boolean).length,
        onPlan:e.nutritionOnPlan.checked,
        hunger:Number(e.nutritionHunger.value||0),
        notes:e.nutritionNotes.value,
        water:Number(global.AppState?.get("hydration.currentOz",0)||0),
        weight:Number(e.weight.value||0)
      };
      logs.push(entry);logs.sort((a,b)=>a.date.localeCompare(b.date));
      c.set(c.keys.nutritionLogs,logs);
      c.saveDayState();
      this.render();
      global.AppState?.set("nutrition.latestLog",entry,{source:"IronNutrition.save"});
      global.IronEvents?.emit("nutrition:log-saved",entry);
      c.notify?.("Nutrition log saved.");
      return entry;
    }

    hydrationTarget(){return this.summary().hydrationTarget}
  }

  global.NutritionEngine=NutritionEngine;
  global.IronNutrition={
    create(config){return new NutritionModule(config)},
    NutritionModule
  };
})(window);
