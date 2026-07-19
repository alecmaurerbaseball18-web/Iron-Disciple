(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.IronPerformance=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const VERSION='5.1.0';
  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
  const round=(n,step=1)=>Math.round((Number(n)||0)/step)*step;
  const mean=values=>{const valid=(values||[]).map(Number).filter(Number.isFinite);return valid.length?valid.reduce((s,v)=>s+v,0)/valid.length:0;};
  const weightedMean=items=>{let total=0,weight=0;(items||[]).forEach(item=>{const value=Number(item?.value),w=Number(item?.weight);if(Number.isFinite(value)&&Number.isFinite(w)&&w>0){total+=value*w;weight+=w;}});return weight?total/weight:0;};
  const isoDate=value=>{const d=value instanceof Date?value:new Date(value||Date.now());return Number.isNaN(d.getTime())?new Date().toISOString().slice(0,10):d.toISOString().slice(0,10);};
  const labelScore=score=>score>=90?'Elite':score>=80?'Excellent':score>=70?'Good':score>=60?'Controlled':score>=45?'Compromised':'Recovery Required';
  const grade=score=>score>=93?'A':score>=85?'B':score>=75?'C':score>=65?'D':'F';
  const trend=(current,prior,tolerance=2)=>current>prior+tolerance?'improving':current<prior-tolerance?'declining':'stable';

  function normalizeInput(input={}){
    const profile=input.profile||{};
    const training=input.training||{};
    const nutrition=input.nutrition||{};
    const recovery=input.recovery||{};
    const schedule=input.schedule||{};
    return {
      date:isoDate(input.date),
      profile:{
        weightLb:clamp(profile.weightLb||220,80,500),
        goal:String(profile.goal||profile.mode||'recomp'),
        experience:String(profile.experience||'intermediate'),
        stress:clamp(profile.stress??input.stress??5,0,10),
        availableMinutes:clamp(profile.availableMinutes||input.availableMinutes||60,0,360)
      },
      sleep:{
        hours:clamp(input.sleep?.hours??recovery.sleepHours??7,0,14),
        quality:clamp(input.sleep?.quality??recovery.sleepQuality??70),
        targetHours:clamp(input.sleep?.targetHours||7.5,5,12)
      },
      readiness:clamp(input.readiness??recovery.readiness??70),
      soreness:clamp(input.soreness??recovery.soreness??3,0,10),
      pain:clamp(input.pain??recovery.pain??0,0,10),
      mentalReadiness:clamp(input.mentalReadiness??recovery.mentalReadiness??70),
      hydration:{
        consumed:Math.max(0,Number(input.hydration?.consumed??nutrition.waterConsumed??0)||0),
        target:Math.max(1,Number(input.hydration?.target??nutrition.waterTarget??96)||96),
        electrolytes:Boolean(input.hydration?.electrolytes??nutrition.electrolytes)
      },
      nutrition:{
        calories:Math.max(0,Number(nutrition.caloriesConsumed??nutrition.calories??0)||0),
        calorieTarget:Math.max(1,Number(nutrition.calorieTarget??nutrition.targets?.calories??2400)||2400),
        protein:Math.max(0,Number(nutrition.proteinConsumed??nutrition.protein??0)||0),
        proteinTarget:Math.max(1,Number(nutrition.proteinTarget??nutrition.targets?.protein??180)||180),
        carbs:Math.max(0,Number(nutrition.carbsConsumed??nutrition.carbs??0)||0),
        carbTarget:Math.max(1,Number(nutrition.carbTarget??nutrition.targets?.carbs??250)||250),
        fiber:Math.max(0,Number(nutrition.fiberConsumed??nutrition.fiber??0)||0),
        fiberTarget:Math.max(1,Number(nutrition.fiberTarget??nutrition.targets?.fiber??30)||30),
        compliance:clamp(nutrition.compliance??0)
      },
      training:{
        plannedType:String(training.plannedType||training.type||'strength').toLowerCase(),
        plannedMinutes:clamp(training.plannedMinutes||training.durationMinutes||60,0,360),
        load:clamp(training.load??training.trainingLoad??50),
        acuteLoad:Math.max(0,Number(training.acuteLoad??training.load7d??0)||0),
        chronicLoad:Math.max(0,Number(training.chronicLoad??training.load28d??0)||0),
        completed:Boolean(training.completed),
        priorDayLoad:clamp(training.priorDayLoad??0),
        daysSinceRest:clamp(training.daysSinceRest??2,0,30)
      },
      schedule:{
        eventType:String(schedule.eventType||schedule.activity||'').toLowerCase(),
        eventDate:schedule.eventDate?isoDate(schedule.eventDate):null,
        eventDays:clamp(schedule.eventDays??999,0,999),
        doubleSession:Boolean(schedule.doubleSession),
        shiftHours:clamp(schedule.shiftHours??0,0,24),
        travel:Boolean(schedule.travel)
      },
      history:Array.isArray(input.history)?input.history:[]
    };
  }

  function sleepScore(data){
    const duration=clamp(data.sleep.hours/data.sleep.targetHours*100);
    return Math.round(weightedMean([{value:duration,weight:.65},{value:data.sleep.quality,weight:.35}]));
  }

  function hydrationScore(data){return Math.round(clamp(data.hydration.consumed/data.hydration.target*100));}

  function nutritionScore(data){
    if(data.nutrition.compliance>0)return Math.round(data.nutrition.compliance);
    const calorieRatio=data.nutrition.calories/data.nutrition.calorieTarget;
    const calories=clamp(100-Math.abs(1-calorieRatio)*150);
    const protein=clamp(data.nutrition.protein/data.nutrition.proteinTarget*100);
    const carbs=clamp(data.nutrition.carbs/data.nutrition.carbTarget*100);
    const fiber=clamp(data.nutrition.fiber/data.nutrition.fiberTarget*100);
    return Math.round(weightedMean([{value:calories,weight:.3},{value:protein,weight:.35},{value:carbs,weight:.2},{value:fiber,weight:.15}]));
  }

  function loadRatio(data){
    const chronic=data.training.chronicLoad;
    if(!chronic)return null;
    return data.training.acuteLoad/chronic;
  }

  function trainingLoadScore(data){
    const ratio=loadRatio(data);
    if(ratio==null)return Math.round(clamp(100-Math.max(0,data.training.load-70)*1.5));
    if(ratio>=.8&&ratio<=1.3)return 90;
    if(ratio<.6)return 65;
    if(ratio<.8)return 78;
    if(ratio<=1.5)return 68;
    return 45;
  }

  function muscularScore(data){
    const sorenessPenalty=data.soreness*7;
    const painPenalty=data.pain*10;
    const priorPenalty=Math.max(0,data.training.priorDayLoad-65)*.5;
    return Math.round(clamp(100-sorenessPenalty-painPenalty-priorPenalty));
  }

  function nervousSystemScore(data){
    const sleep=sleepScore(data);
    const stressPenalty=data.profile.stress*4;
    const loadPenalty=Math.max(0,data.training.priorDayLoad-60)*.35;
    return Math.round(clamp(weightedMean([{value:data.readiness,weight:.55},{value:sleep,weight:.45}])-stressPenalty-loadPenalty));
  }

  function buildReadiness(input={}){
    const data=normalizeInput(input);
    const components={
      nervousSystem:nervousSystemScore(data),
      muscular:muscularScore(data),
      nutrition:nutritionScore(data),
      sleep:sleepScore(data),
      hydration:hydrationScore(data),
      mental:Math.round(clamp(data.mentalReadiness-data.profile.stress*2))
    };
    let score=Math.round(weightedMean([
      {value:components.nervousSystem,weight:.22},
      {value:components.muscular,weight:.2},
      {value:components.sleep,weight:.2},
      {value:components.nutrition,weight:.15},
      {value:components.hydration,weight:.1},
      {value:components.mental,weight:.13}
    ]));
    if(data.pain>=7)score=Math.min(score,35);
    else if(data.pain>=4)score=Math.min(score,55);
    return {score,label:labelScore(score),components,limiter:Object.entries(components).sort((a,b)=>a[1]-b[1])[0][0],data};
  }

  function buildRecovery(input={}){
    const readiness=buildReadiness(input),data=readiness.data;
    const components={
      sleep:readiness.components.sleep,
      muscular:readiness.components.muscular,
      hydration:readiness.components.hydration,
      nutrition:readiness.components.nutrition,
      loadManagement:trainingLoadScore(data),
      stress:Math.round(clamp(100-data.profile.stress*10))
    };
    const score=Math.round(weightedMean([
      {value:components.sleep,weight:.25},{value:components.muscular,weight:.22},
      {value:components.hydration,weight:.12},{value:components.nutrition,weight:.16},
      {value:components.loadManagement,weight:.15},{value:components.stress,weight:.1}
    ]));
    const status=score>=80?'Recovered':score>=65?'Functional':score>=50?'Limited':'Under-Recovered';
    return {score,status,components,loadRatio:loadRatio(data),limiter:Object.entries(components).sort((a,b)=>a[1]-b[1])[0][0]};
  }

  function consistencyScore(history=[]){
    if(!history.length)return 70;
    const recent=history.slice(-14);
    const values=recent.map(day=>{
      const habits=['sleep','nutrition','hydration','training'].map(key=>{
        const value=day?.[key];
        if(typeof value==='boolean')return value?100:0;
        if(typeof value==='number')return clamp(value);
        if(value&&typeof value==='object'&&Number.isFinite(Number(value.score)))return clamp(value.score);
        return null;
      }).filter(v=>v!=null);
      return habits.length?mean(habits):null;
    }).filter(v=>v!=null);
    return values.length?Math.round(mean(values)):70;
  }

  function buildPerformanceScore(input={}){
    const data=normalizeInput(input),readiness=buildReadiness(data),recovery=buildRecovery(data);
    const components={
      readiness:readiness.score,
      recovery:recovery.score,
      sleep:readiness.components.sleep,
      nutrition:readiness.components.nutrition,
      hydration:readiness.components.hydration,
      trainingLoad:trainingLoadScore(data),
      mental:readiness.components.mental,
      consistency:consistencyScore(data.history)
    };
    const score=Math.round(weightedMean([
      {value:components.readiness,weight:.2},{value:components.recovery,weight:.2},
      {value:components.sleep,weight:.13},{value:components.nutrition,weight:.12},
      {value:components.hydration,weight:.08},{value:components.trainingLoad,weight:.12},
      {value:components.mental,weight:.07},{value:components.consistency,weight:.08}
    ]));
    return {version:VERSION,date:data.date,score,label:labelScore(score),grade:grade(score),components,readiness,recovery,confidence:Math.round(clamp(45+Math.min(data.history.length,28)*1.8))};
  }

  function eventTaper(data){
    const days=data.schedule.eventDays;
    if(days===0)return {phase:'event',volumeMultiplier:.25,intensityMultiplier:.75};
    if(days===1)return {phase:'pre-event',volumeMultiplier:.35,intensityMultiplier:.65};
    if(days<=3)return {phase:'taper',volumeMultiplier:.55,intensityMultiplier:.8};
    if(days<=7)return {phase:'sharpen',volumeMultiplier:.75,intensityMultiplier:.9};
    return {phase:'normal',volumeMultiplier:1,intensityMultiplier:1};
  }

  function trainingDecision(input={}){
    const data=normalizeInput(input),performance=buildPerformanceScore(data),score=performance.score;
    const taper=eventTaper(data);
    let action='train',intensity='moderate',volumeMultiplier=1,title='Complete the planned session';
    if(data.pain>=7){action='medical-stop';intensity='none';volumeMultiplier=0;title='Stop training and address pain';}
    else if(score<45){action='recover';intensity='very-low';volumeMultiplier=.25;title='Replace training with active recovery';}
    else if(score<60){action='reduce';intensity='low';volumeMultiplier=.55;title='Run a reduced-volume session';}
    else if(score<75){action='maintain';intensity='moderate';volumeMultiplier=.8;title='Train, but leave reserve';}
    else if(score>=90&&data.pain<2&&data.soreness<4){action='push';intensity='high';volumeMultiplier=1.05;title='High-readiness performance session';}
    if(taper.phase!=='normal'){
      volumeMultiplier=Math.min(volumeMultiplier,taper.volumeMultiplier);
      if(action==='push')action='maintain';
      title=taper.phase==='event'?'Event-day activation only':taper.phase==='pre-event'?'Pre-event primer':`Tournament ${taper.phase}`;
    }
    const available=data.profile.availableMinutes;
    const duration=Math.round(Math.min(data.training.plannedMinutes*volumeMultiplier,available));
    return {action,title,intensity,volumeMultiplier:round(volumeMultiplier,.05),durationMinutes:duration,taper,plannedType:data.training.plannedType,reason:decisionReason(performance,data,action)};
  }

  function decisionReason(performance,data,action){
    const limiter=performance.readiness.limiter.replace(/([A-Z])/g,' $1').toLowerCase();
    if(action==='medical-stop')return `Pain is ${data.pain}/10; performance progression is not appropriate.`;
    if(action==='recover')return `Performance score is ${performance.score}, with ${limiter} as the primary limiter.`;
    if(action==='reduce')return `Readiness is constrained. Reduce fatigue while preserving the training habit.`;
    if(action==='push')return `Performance score is ${performance.score} with no major pain or soreness constraint.`;
    return `Performance score is ${performance.score}; maintain quality and avoid unnecessary fatigue.`;
  }

  function tournamentPlan(input={}){
    const data=normalizeInput(input),type=data.schedule.eventType||'event',days=data.schedule.eventDays;
    const common={eventType:type,daysUntil:days,travel:data.schedule.travel};
    if(days===0)return {...common,phase:'compete',training:'Warm-up and activation only',nutrition:'Use the event-day fueling plan and begin hydration early.',recovery:'Cool down, rehydrate, and eat a recovery meal after competition.'};
    if(days===1)return {...common,phase:'prime',training:'Short technique-focused primer; no fatigue work.',nutrition:'Meet carbohydrate and hydration targets before evening.',recovery:'Prioritize sleep and reduce optional workload.'};
    if(days<=3)return {...common,phase:'taper',training:'Reduce volume 40–50% while preserving movement speed.',nutrition:'Maintain protein and raise carbohydrate availability around practice.',recovery:'Protect sleep and address soreness daily.'};
    if(days<=7)return {...common,phase:'sharpen',training:'Keep intensity, reduce junk volume, and rehearse event-specific skills.',nutrition:'Maintain planned calories and consistent hydration.',recovery:'Avoid introducing unfamiliar exercises or foods.'};
    return {...common,phase:'build',training:'Continue progressive training with scheduled recovery.',nutrition:'Follow adaptive daily targets.',recovery:'Monitor readiness trend rather than one isolated score.'};
  }

  function recommendations(input={}){
    const data=normalizeInput(input),performance=buildPerformanceScore(data),decision=trainingDecision(data);
    const items=[];
    items.push({priority:1,domain:'training',title:decision.title,detail:decision.reason,action:decision.action});
    if(performance.components.hydration<75)items.push({domain:'hydration',title:'Close the hydration gap',detail:`Drink approximately ${round(Math.max(0,data.hydration.target-data.hydration.consumed),8)} oz across the next several hours.`,action:'hydrate'});
    if(performance.components.nutrition<75)items.push({domain:'nutrition',title:'Restore fuel availability',detail:'Prioritize protein and planned carbohydrates before adding discretionary calories.',action:'fuel'});
    if(performance.components.sleep<75)items.push({domain:'sleep',title:'Protect tonight’s sleep window',detail:`Target at least ${data.sleep.targetHours} hours and begin shutdown earlier.`,action:'sleep'});
    if(data.schedule.eventDays<=7)items.push({domain:'event',title:`${tournamentPlan(data).phase} for ${data.schedule.eventType||'the event'}`,detail:tournamentPlan(data).training,action:'event-plan'});
    return items.sort((a,b)=>(a.priority||5)-(b.priority||5)).slice(0,5).map((item,index)=>({...item,priority:index+1}));
  }

  function dailyBriefing(input={}){
    const performance=buildPerformanceScore(input),decision=trainingDecision(input),actions=recommendations(input);
    return {
      version:VERSION,date:performance.date,
      headline:`Performance ${performance.score} — ${performance.label}`,
      summary:`Recovery is ${performance.recovery.status.toLowerCase()}. ${decision.title}.`,
      performance,decision,actions,
      topPriority:actions[0]||null,
      generatedAt:new Date().toISOString()
    };
  }

  function weeklyReport(history=[]){
    const days=(Array.isArray(history)?history:[]).slice(-7).map(day=>buildPerformanceScore(day));
    const previous=(Array.isArray(history)?history:[]).slice(-14,-7).map(day=>buildPerformanceScore(day));
    const averages={
      overall:Math.round(mean(days.map(x=>x.score))),
      readiness:Math.round(mean(days.map(x=>x.components.readiness))),
      recovery:Math.round(mean(days.map(x=>x.components.recovery))),
      sleep:Math.round(mean(days.map(x=>x.components.sleep))),
      nutrition:Math.round(mean(days.map(x=>x.components.nutrition))),
      hydration:Math.round(mean(days.map(x=>x.components.hydration))),
      consistency:Math.round(mean(days.map(x=>x.components.consistency)))
    };
    const priorOverall=Math.round(mean(previous.map(x=>x.score)));
    const ranked=Object.entries(averages).filter(([k])=>k!=='overall').sort((a,b)=>b[1]-a[1]);
    return {
      version:VERSION,days:days.length,grade:grade(averages.overall),averages,
      trend:previous.length?trend(averages.overall,priorOverall):'baseline',
      change:previous.length?averages.overall-priorOverall:0,
      biggestWin:ranked[0]?{domain:ranked[0][0],score:ranked[0][1]}:null,
      biggestLimiter:ranked.at(-1)?{domain:ranked.at(-1)[0],score:ranked.at(-1)[1]}:null,
      coachNote:weeklyCoachNote(averages,ranked)
    };
  }

  function weeklyCoachNote(averages,ranked){
    if(!ranked.length)return 'Log daily inputs to establish a performance baseline.';
    const best=ranked[0][0],limiter=ranked.at(-1)[0];
    if(averages.overall>=85)return `Excellent week. Preserve ${best} while improving ${limiter} without adding unnecessary volume.`;
    if(averages.overall>=70)return `The system is functional. Keep ${best} stable and make ${limiter} the single improvement target next week.`;
    return `Recovery capacity is constrained. Reduce optional workload and rebuild ${limiter} before pursuing progression.`;
  }

  function buildHumanPerformance(input={}){
    const data=normalizeInput(input);
    const performance=buildPerformanceScore(data);
    return {
      version:VERSION,date:data.date,
      performance,
      readiness:performance.readiness,
      recovery:performance.recovery,
      trainingDecision:trainingDecision(data),
      tournament:tournamentPlan(data),
      recommendations:recommendations(data),
      briefing:dailyBriefing(data),
      weekly:data.history.length?weeklyReport(data.history):null,
      status:{score:performance.score,label:performance.label,grade:performance.grade,confidence:performance.confidence},
      generatedAt:new Date().toISOString()
    };
  }

  function fromAppState(state={},options={}){
    const date=isoDate(options.date),body=state.body?.[date]||{},goals=state.bodyGoals||{};
    const nutritionApi=root?.IronNutrition;
    let nutritionTargets=options.nutritionTargets||{};
    if(!Object.keys(nutritionTargets).length&&nutritionApi?.targets){
      try{nutritionTargets=nutritionApi.targets(options.profile||{},options.context||{});}catch(_error){nutritionTargets={};}
    }
    return buildHumanPerformance({
      date,profile:{...(options.profile||{}),weightLb:options.profile?.weightLb||body.weight||220},
      sleep:{hours:body.sleep||options.sleepHours,quality:options.sleepQuality,targetHours:goals.sleep||7.5},
      readiness:options.readiness,mentalReadiness:options.mentalReadiness,soreness:options.soreness,pain:options.pain,
      hydration:{consumed:body.water||0,target:nutritionTargets.water||goals.water||96,electrolytes:options.electrolytes},
      nutrition:{calories:body.calories||0,protein:body.protein||0,carbs:body.carbs||0,fiber:body.fiber||0,targets:nutritionTargets},
      training:{...(options.training||{}),completed:Boolean(state.workout?.done)},schedule:options.schedule||{},history:options.history||[]
    });
  }

  return Object.freeze({
    VERSION,normalizeInput,sleepScore,hydrationScore,nutritionScore,trainingLoadScore,muscularScore,nervousSystemScore,
    buildReadiness,buildRecovery,consistencyScore,buildPerformanceScore,eventTaper,trainingDecision,tournamentPlan,
    recommendations,dailyBriefing,weeklyReport,buildHumanPerformance,fromAppState,labelScore,grade
  });
});
