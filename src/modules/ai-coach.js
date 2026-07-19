(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.IronCoach=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const VERSION='5.4.0';
  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
  const round=(n,step=1)=>Math.round((Number(n)||0)/step)*step;
  const mean=v=>{const a=(v||[]).map(Number).filter(Number.isFinite);return a.length?a.reduce((s,n)=>s+n,0)/a.length:0;};
  const text=v=>String(v==null?'':v).trim();
  const isoDate=v=>{const d=v?new Date(v):new Date();return Number.isNaN(d.getTime())?new Date().toISOString().slice(0,10):d.toISOString().slice(0,10);};
  const scoreLabel=n=>n>=90?'elite':n>=80?'strong':n>=70?'solid':n>=60?'watch':'recovery-needed';
  const grade=n=>n>=93?'A':n>=85?'B':n>=75?'C':n>=65?'D':'F';
  const uniq=a=>[...new Set((a||[]).filter(Boolean))];

  function safeCall(api,name,input,fallback=null){
    try{return api&&typeof api[name]==='function'?api[name](input):fallback;}catch(_){return fallback;}
  }

  function resolveSystems(input={}){
    const performance=input.performance||safeCall(root&&root.IronPerformance,'buildHumanPerformance',input,{})||{};
    const decision=input.decision||safeCall(root&&root.IronDecision,'makeDecision',input,{})||{};
    const forecast=input.forecast||safeCall(root&&root.IronPredict,'forecast',input,{})||{};
    return {performance,decision,forecast};
  }

  function normalize(input={}){
    const systems=resolveSystems(input);
    const p=systems.performance||{},d=systems.decision||{},f=systems.forecast||{};
    const readiness=clamp(input.readiness?.score??input.readiness??p.readiness?.score??p.scores?.readiness??70);
    const recovery=clamp(input.recovery?.score??input.recovery??p.recovery?.score??p.scores?.recovery??70);
    const performance=clamp(input.performanceScore??p.score??p.performanceScore??mean([readiness,recovery]));
    const sleep=clamp(input.sleep?.score??input.sleepScore??p.sleep?.score??70);
    const hydration=clamp(input.hydration?.score??input.hydrationScore??p.hydration?.score??70);
    const nutrition=clamp(input.nutrition?.score??input.nutritionScore??p.nutrition?.score??70);
    const stress=clamp(input.stress??5,0,10);
    const pain=clamp(input.pain??0,0,10);
    const consistency=clamp(input.consistency?.score??input.consistency??p.consistency?.score??70);
    const mission=d.mission?.primary||d.mission||{};
    const primary=text(mission.title||mission.name||mission.id||d.decision||input.primaryObjective||'Execute the highest-value action');
    const confidence=clamp(d.confidence??f.confidence??mean([readiness,recovery,consistency]));
    const body30=f.body?.projections?.find(x=>x.days===30)||null;
    return {date:isoDate(input.date),name:text(input.name||input.userName||''),readiness,recovery,performance,sleep,hydration,nutrition,stress,pain,consistency,primary,confidence,decision:d,forecast:f,raw:input,body30};
  }

  function coachingSignals(state){
    const wins=[],watch=[],actions=[];
    if(state.readiness>=85)wins.push(`Readiness is ${state.readiness}, supporting a high-value training or skill session.`);
    if(state.recovery>=85)wins.push(`Recovery is strong at ${state.recovery}.`);
    if(state.nutrition>=85)wins.push(`Nutrition execution is strong at ${state.nutrition}.`);
    if(state.consistency>=90)wins.push(`Consistency is elite at ${state.consistency}.`);
    if(state.sleep<70){watch.push(`Sleep is limiting performance at ${state.sleep}.`);actions.push('Protect bedtime and add 30–60 minutes of sleep opportunity.');}
    if(state.hydration<75){watch.push(`Hydration is below the preferred range at ${state.hydration}.`);actions.push('Front-load fluids and include electrolytes around training or long shifts.');}
    if(state.recovery<65){watch.push(`Recovery is low at ${state.recovery}.`);actions.push('Reduce training intensity and prioritize mobility, food, and sleep.');}
    if(state.pain>=4){watch.push(`Pain is elevated at ${state.pain}/10.`);actions.push('Avoid aggravating movements and use a pain-safe training alternative.');}
    if(state.stress>=8){watch.push(`Stress is elevated at ${state.stress}/10.`);actions.push('Reduce nonessential load and schedule a brief decompression block.');}
    if(state.nutrition<70){watch.push(`Nutrition adherence is limiting progress at ${state.nutrition}.`);actions.push('Complete the next planned protein-centered meal and return to the calorie target.');}
    const decisionActions=(state.decision.plan?.actions||state.decision.actions||[]).map(a=>text(a.title||a.action||a)).filter(Boolean);
    actions.push(...decisionActions.slice(0,4));
    if(!actions.length)actions.push('Complete the primary mission and maintain normal recovery habits.');
    return {wins:uniq(wins),watch:uniq(watch),actions:uniq(actions)};
  }

  function buildMorningBrief(input={}){
    const s=normalize(input),signals=coachingSignals(s);
    const greeting=s.name?`Good morning, ${s.name}.`:'Good morning.';
    const summary=s.recovery>=80&&s.readiness>=80?'You are positioned for productive work today.':s.recovery<65?'Today should emphasize restoration and disciplined execution.':'You can make progress today, but manage fatigue deliberately.';
    return {version:VERSION,type:'morning-brief',date:s.date,greeting,missionScore:Math.round(mean([s.performance,s.readiness,s.recovery,s.consistency])),status:scoreLabel(mean([s.performance,s.readiness,s.recovery])),primaryObjective:s.primary,confidence:Math.round(s.confidence),summary,metrics:{performance:s.performance,readiness:s.readiness,recovery:s.recovery,sleep:s.sleep,hydration:s.hydration,nutrition:s.nutrition,consistency:s.consistency},priorities:signals.actions.slice(0,5),wins:signals.wins,watchItems:signals.watch,narrative:[greeting,summary,`Primary objective: ${s.primary}.`,...signals.watch.slice(0,2),...signals.actions.slice(0,3)].join(' ')};
  }

  function buildEveningReview(input={}){
    const s=normalize(input);const completed=input.completed||input.habitsCompleted||[];const missed=input.missed||input.habitsMissed||[];
    const execution=clamp(input.executionScore??input.completionRate??(completed.length||missed.length?100*completed.length/Math.max(1,completed.length+missed.length):s.consistency));
    const score=Math.round(mean([s.performance,s.nutrition,s.hydration,s.sleep,execution]));
    const notes=[];
    if(execution>=85)notes.push('Execution was strong. Preserve the same structure tomorrow.');
    else notes.push('Execution was incomplete. Reduce friction and make the first missed action easier tomorrow.');
    if(s.sleep<70)notes.push('Sleep remains the most immediate lever for tomorrow.');
    if(s.hydration<75)notes.push('Finish the day hydrated without disrupting sleep.');
    return {version:VERSION,type:'evening-review',date:s.date,score,grade:grade(score),completed,missed,metrics:{performance:s.performance,nutrition:s.nutrition,hydration:s.hydration,sleep:s.sleep,execution:Math.round(execution)},coachNotes:notes,tomorrowFocus:s.recovery<70?'Recovery and sleep':'Repeat the highest-value behaviors',narrative:`Today scored ${score}. ${notes.join(' ')}`};
  }

  function summarizeHistory(history=[]){
    const rows=(Array.isArray(history)?history:[]).map(normalize);
    const metric=k=>round(mean(rows.map(r=>r[k])),1);
    const first=rows[0],last=rows.at(-1);
    return {rows,count:rows.length,performance:metric('performance'),readiness:metric('readiness'),recovery:metric('recovery'),sleep:metric('sleep'),hydration:metric('hydration'),nutrition:metric('nutrition'),consistency:metric('consistency'),performanceChange:first&&last?round(last.performance-first.performance,1):0,recoveryChange:first&&last?round(last.recovery-first.recovery,1):0};
  }

  function weeklyReview(history=[],options={}){
    const h=summarizeHistory(history);const overall=Math.round(mean([h.performance,h.readiness,h.recovery,h.sleep,h.hydration,h.nutrition,h.consistency]));
    const wins=[],improvements=[];
    const metrics=['performance','readiness','recovery','sleep','hydration','nutrition','consistency'];
    metrics.sort((a,b)=>h[b]-h[a]);
    wins.push(`${metrics[0]} led the week at ${h[metrics[0]]}.`,`${metrics[1]} was also strong at ${h[metrics[1]]}.`);
    improvements.push(`${metrics.at(-1)} was the weakest area at ${h[metrics.at(-1)]}.`);
    if(h.sleep<75)improvements.push('Create a fixed sleep window before adding more training volume.');
    if(h.recoveryChange<0)improvements.push(`Recovery declined ${Math.abs(h.recoveryChange)} points across the review period.`);
    return {version:VERSION,type:'weekly-review',period:options.period||'7-day',days:h.count,overallScore:overall,grade:grade(overall),metrics:h,wins,improvements,nextWeekMission:improvements[0]||'Maintain current execution and progress training gradually.',coachSummary:`Weekly grade: ${grade(overall)}. ${wins.join(' ')} ${improvements.join(' ')}`};
  }

  function monthlyReview(history=[],options={}){
    const h=summarizeHistory(history),overall=Math.round(mean([h.performance,h.recovery,h.sleep,h.nutrition,h.consistency]));
    const weightRows=(history||[]).map(x=>Number(x.weight??x.body?.weight)).filter(Number.isFinite);
    const weightChange=weightRows.length>1?round(weightRows.at(-1)-weightRows[0],.1):null;
    return {version:VERSION,type:'monthly-review',period:options.period||'30-day',days:h.count,overallScore:overall,grade:grade(overall),performanceChange:h.performanceChange,recoveryChange:h.recoveryChange,weightChange,metrics:h,mostEffectiveHabit:h.consistency>=85?'Consistent completion of planned actions':'No habit has enough consistency to declare a clear winner',limitingFactor:h.sleep<h.recovery&&h.sleep<h.nutrition?'Sleep':h.nutrition<h.recovery?'Nutrition':'Recovery',recommendedChanges:[h.sleep<75?'Increase sleep opportunity by 30–45 minutes.':null,h.nutrition<80?'Simplify meals and protect protein intake.':null,h.recovery<75?'Schedule a deload or recovery block.':null].filter(Boolean),nextMonthObjectives:['Raise the weakest metric by at least 5 points','Maintain the strongest habit','Complete one formal weekly review']};
  }

  function explainDecision(decision={}){
    const reasons=(decision.reasons||decision.explanation?.reasons||[]).map(r=>text(r.reason||r)).filter(Boolean);
    const risks=(decision.risks||decision.riskAssessment?.risks||[]).filter(r=>Number(r.probability??r.score)>=50).map(r=>`${text(r.name||r.type)} risk is ${Math.round(r.probability??r.score)}%.`);
    const primary=text(decision.mission?.primary?.title||decision.mission?.primary?.id||decision.decision||'Recommended action');
    return {version:VERSION,primary,confidence:Math.round(clamp(decision.confidence??70)),reasons:uniq([...reasons,...risks]),plainLanguage:`${primary} is recommended because ${uniq([...reasons,...risks]).slice(0,3).join('; ')||'it best aligns with the current performance state and priorities'}.`};
  }

  function goalCoach(input={}){
    const s=normalize(input);const goal=input.goal||s.forecast.goal||{};const probability=clamp(goal.probability??s.forecast.goal?.probability??50);const status=text(goal.status||s.forecast.goal?.status||'uncertain');
    const limiting=s.sleep<75?'sleep consistency':s.nutrition<75?'nutrition adherence':s.recovery<75?'recovery management':'execution consistency';
    const improvement=limiting==='sleep consistency'?'Increase nightly sleep opportunity by 30–45 minutes.':limiting==='nutrition adherence'?'Hit protein and calorie targets for seven straight days.':limiting==='recovery management'?'Reduce unnecessary fatigue and schedule one recovery day.':'Complete the daily primary mission before optional work.';
    return {version:VERSION,goal:text(goal.name||goal.metric||goal.type||'Active goal'),probability:Math.round(probability),status,estimatedCompletion:goal.estimatedCompletion||goal.estimatedDate||null,largestLimitingFactor:limiting,fastestImprovement:improvement,coachMessage:`The goal is ${status} at ${Math.round(probability)}% probability. The largest controllable limiter is ${limiting}.`};
  }

  function performanceCoach(input={}){const s=normalize(input),signals=coachingSignals(s);return {version:VERSION,score:s.performance,status:scoreLabel(s.performance),recommendation:signals.actions[0],wins:signals.wins,watchItems:signals.watch};}
  function recoveryCoach(input={}){const s=normalize(input);const mode=s.recovery>=85?'train':s.recovery>=70?'maintain':'restore';return {version:VERSION,score:s.recovery,mode,recommendation:mode==='train'?'Proceed with planned training while preserving normal recovery habits.':mode==='maintain'?'Keep intensity controlled and emphasize sleep, hydration, and nutrition.':'Use a recovery session, remove high-fatigue work, and prioritize sleep.',confidence:Math.round(mean([s.recovery,s.sleep,s.hydration]))};}

  function habitCoach(input={}){
    const habits=input.habits||[];const normalized=habits.map(h=>({name:text(h.name||h.id),completion:clamp(h.completion??h.rate??0),impact:Number(h.impact??h.correlation??0)}));
    const ranked=normalized.slice().sort((a,b)=>(b.impact*b.completion)-(a.impact*a.completion));
    return {version:VERSION,highestImpact:ranked.slice(0,3),lowestImpact:ranked.slice(-3).reverse(),recommendation:ranked.length?`Protect ${ranked[0].name} before adding new habits.`:'Track at least seven days before ranking habits.'};
  }

  function buildMissionReport(input={}){const morning=buildMorningBrief(input);return {version:VERSION,date:morning.date,mission:morning.primaryObjective,score:morning.missionScore,status:morning.status,confidence:morning.confidence,focus:morning.priorities[0],watchItem:morning.watchItems[0]||null,brief:morning.narrative};}
  function generateCoaching(input={}){return {version:VERSION,morning:buildMorningBrief(input),mission:buildMissionReport(input),performance:performanceCoach(input),recovery:recoveryCoach(input),goal:goalCoach(input),decision:explainDecision(resolveSystems(input).decision||{}),generatedAt:new Date().toISOString()};}
  function fromAppState(state={},options={}){return generateCoaching({...state,...options,date:options.date||new Date()});}

  return Object.freeze({VERSION,normalize,buildMorningBrief,buildEveningReview,weeklyReview,monthlyReview,explainDecision,generateCoaching,buildMissionReport,goalCoach,performanceCoach,recoveryCoach,habitCoach,fromAppState,scoreLabel,grade});
});
