(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.IronPredict=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const VERSION='5.3.0';
  const DAY=86400000;
  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
  const round=(n,step=1)=>Math.round((Number(n)||0)/step)*step;
  const mean=values=>{const a=(values||[]).map(Number).filter(Number.isFinite);return a.length?a.reduce((s,n)=>s+n,0)/a.length:0;};
  const median=values=>{const a=(values||[]).map(Number).filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
  const stdev=values=>{const a=(values||[]).map(Number).filter(Number.isFinite);if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,n)=>s+(n-m)**2,0)/(a.length-1));};
  const isoDate=value=>{const d=value instanceof Date?value:new Date(value||Date.now());return Number.isNaN(d.getTime())?new Date().toISOString().slice(0,10):d.toISOString().slice(0,10);};
  const addDays=(date,days)=>isoDate(new Date(new Date(date).getTime()+days*DAY));
  const sigmoid=x=>1/(1+Math.exp(-x));
  const pct=(n,d)=>d?100*n/d:0;
  const normalizeText=v=>String(v==null?'':v).trim().toLowerCase();
  const confidenceLabel=n=>n>=90?'very-high':n>=75?'high':n>=55?'moderate':'limited';
  const riskLabel=n=>n>=80?'critical':n>=60?'high':n>=35?'moderate':'low';

  function linearRegression(points=[]){
    const rows=points.map((p,i)=>({x:Number.isFinite(Number(p.x))?Number(p.x):i,y:Number(p.y)})).filter(p=>Number.isFinite(p.y));
    if(rows.length<2)return {slope:0,intercept:rows[0]?.y||0,r2:0,n:rows.length};
    const mx=mean(rows.map(p=>p.x)),my=mean(rows.map(p=>p.y));
    const ssx=rows.reduce((s,p)=>s+(p.x-mx)**2,0);
    const slope=ssx?rows.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0)/ssx:0;
    const intercept=my-slope*mx;
    const sst=rows.reduce((s,p)=>s+(p.y-my)**2,0);
    const sse=rows.reduce((s,p)=>s+(p.y-(intercept+slope*p.x))**2,0);
    return {slope,intercept,r2:sst?clamp(1-sse/sst,0,1):0,n:rows.length};
  }

  function normalizeHistory(history=[]){
    return (Array.isArray(history)?history:[]).map((row,index)=>{
      const body=row.body||{};const performance=row.performance||{};const nutrition=row.nutrition||{};const training=row.training||{};
      return {
        date:isoDate(row.date||addDays(Date.now(),index-history.length+1)),
        weight:Number(row.weight??body.weight),bodyFat:Number(row.bodyFat??body.bodyFat),waist:Number(row.waist??body.waist),
        leanMass:Number(row.leanMass??body.leanMass),fatMass:Number(row.fatMass??body.fatMass),
        readiness:Number(row.readiness?.score??row.readiness??performance.readiness?.score),recovery:Number(row.recovery?.score??row.recovery??performance.recovery?.score),
        performance:Number(row.performanceScore??performance.score),sleep:Number(row.sleep?.score??row.sleepScore??row.sleep),hydration:Number(row.hydration?.score??row.hydrationScore),
        nutrition:Number(row.nutritionScore??nutrition.score),calories:Number(row.calories??nutrition.calories??nutrition.caloriesConsumed),protein:Number(row.protein??nutrition.protein),
        trainingLoad:Number(row.trainingLoad??training.load),strength:Number(row.strengthScore??training.strengthScore),pain:Number(row.pain??row.soreness?.pain),stress:Number(row.stress),
        compliance:Number(row.compliance??row.adherence),steps:Number(row.steps),restingHeartRate:Number(row.restingHeartRate),hrv:Number(row.hrv)
      };
    }).sort((a,b)=>a.date.localeCompare(b.date));
  }

  function series(history,key){return history.map((r,i)=>({x:i,y:r[key]})).filter(p=>Number.isFinite(p.y));}

  function trend(history,key,options={}){
    const rows=normalizeHistory(history);const window=Math.max(3,Number(options.window)||30);const points=series(rows.slice(-window),key);const reg=linearRegression(points);
    const values=points.map(p=>p.y);const daily=reg.slope;const weekly=daily*7;
    const direction=Math.abs(weekly)<(options.flatThreshold??0.15)?'stable':weekly>0?'up':'down';
    const confidence=clamp(25+Math.min(points.length,30)*1.8+reg.r2*35-stdev(values)*.2);
    return {metric:key,n:points.length,current:values.at(-1)??null,average:values.length?round(mean(values),.1):null,dailyChange:round(daily,.01),weeklyChange:round(weekly,.01),direction,r2:round(reg.r2,.01),confidence:Math.round(confidence),confidenceLabel:confidenceLabel(confidence)};
  }

  function bodyCompositionForecast(input={},options={}){
    const history=normalizeHistory(input.history||input.bodyHistory||[]);const current=input.current||{};
    const latest=history.at(-1)||{};const weight=Number(current.weight??input.weight??latest.weight)||0;
    const bodyFat=Number(current.bodyFat??input.bodyFat??latest.bodyFat);
    const weightTrend=trend(history,'weight',{window:options.window||28,flatThreshold:.05});
    let dailyWeight=weightTrend.n>=4?weightTrend.dailyChange:Number(input.expectedWeeklyWeightChange??options.weeklyWeightChange??0)/7;
    dailyWeight=Math.max(-.35,Math.min(.25,dailyWeight));
    const bfTrend=trend(history,'bodyFat',{window:options.window||42,flatThreshold:.03});
    let dailyBf=bfTrend.n>=4?bfTrend.dailyChange:(dailyWeight<0?dailyWeight*.11:dailyWeight*.07);
    dailyBf=Math.max(-.08,Math.min(.05,dailyBf));
    const horizons=options.horizons||[7,30,90,180,365];
    const projections=horizons.map(days=>{
      const projectedWeight=Math.max(0,weight+dailyWeight*days);
      const projectedBodyFat=Number.isFinite(bodyFat)?clamp(bodyFat+dailyBf*days,3,60):null;
      const fatMass=projectedBodyFat==null?null:projectedWeight*projectedBodyFat/100;
      const leanMass=fatMass==null?null:projectedWeight-fatMass;
      const uncertainty=Math.max(1,Math.sqrt(days)*(.12+Math.abs(dailyWeight)*.35));
      return {days,date:addDays(input.date||Date.now(),days),weight:round(projectedWeight,.1),bodyFat:projectedBodyFat==null?null:round(projectedBodyFat,.1),fatMass:fatMass==null?null:round(fatMass,.1),leanMass:leanMass==null?null:round(leanMass,.1),range:{weightLow:round(projectedWeight-uncertainty,.1),weightHigh:round(projectedWeight+uncertainty,.1)}};
    });
    const confidence=clamp(mean([weightTrend.confidence,bfTrend.n?bfTrend.confidence:45])+Math.min(history.length,30));
    return {version:VERSION,current:{weight:round(weight,.1),bodyFat:Number.isFinite(bodyFat)?round(bodyFat,.1):null},rate:{weightPerWeek:round(dailyWeight*7,.1),bodyFatPerMonth:round(dailyBf*30,.1)},projections,confidence:Math.round(confidence),confidenceLabel:confidenceLabel(confidence),assumptions:['Recent trends continue','No major medication, illness, or training disruption','Recorded measurements are reasonably consistent']};
  }

  function readinessForecast(input={},options={}){
    const history=normalizeHistory(input.history||[]);const current=Number(input.readiness?.score??input.readiness??history.at(-1)?.readiness??70);
    const readinessTrend=trend(history,'readiness',{window:14,flatThreshold:.5});const recoveryTrend=trend(history,'recovery',{window:14,flatThreshold:.5});
    const sleep=Number(input.sleep?.score??input.sleepScore??history.at(-1)?.sleep??70);const hydration=Number(input.hydration?.score??input.hydrationScore??history.at(-1)?.hydration??70);
    const load=Number(input.trainingLoad??input.training?.load??history.at(-1)?.trainingLoad??50);const rest=Boolean(input.restPlanned||input.training?.restPlanned);
    const baseDrift=Math.max(-3,Math.min(3,(readinessTrend.dailyChange||0)*.55+(recoveryTrend.dailyChange||0)*.25));
    const recoveryImpulse=(sleep-70)*.035+(hydration-70)*.025-(load-55)*.035+(rest?3:0);
    const days=options.days||7;const forecast=[];let score=current;
    for(let day=1;day<=days;day++){
      const decay=Math.pow(.78,day-1);score=clamp(score+baseDrift+recoveryImpulse*decay);
      const uncertainty=2+day*.8;
      forecast.push({day,date:addDays(input.date||Date.now(),day),score:Math.round(score),range:{low:Math.round(clamp(score-uncertainty)),high:Math.round(clamp(score+uncertainty))}});
    }
    const confidence=clamp(40+Math.min(history.length,21)*2+mean([readinessTrend.r2,recoveryTrend.r2])*20);
    return {version:VERSION,current:Math.round(current),forecast,nextWeekAverage:Math.round(mean(forecast.map(x=>x.score))),trend:readinessTrend.direction,confidence:Math.round(confidence),confidenceLabel:confidenceLabel(confidence)};
  }

  function recoveryForecast(input={},options={}){
    const mapped={...input,readiness:input.recovery??input.readiness};const result=readinessForecast(mapped,options);
    return {...result,current:Math.round(Number(input.recovery?.score??input.recovery??result.current)),metric:'recovery'};
  }

  function injuryRisk(input={}){
    const history=normalizeHistory(input.history||[]);const current=history.at(-1)||{};
    const sleep=clamp(input.sleep?.score??input.sleepScore??current.sleep??70);const recovery=clamp(input.recovery?.score??input.recovery??current.recovery??70);
    const soreness=clamp(input.soreness??0,0,10);const pain=clamp(input.pain??current.pain??0,0,10);const stress=clamp(input.stress??current.stress??5,0,10);
    const acute=Math.max(0,Number(input.training?.acuteLoad??input.acuteLoad??0));const chronic=Math.max(1,Number(input.training?.chronicLoad??input.chronicLoad??(acute||1)));const ratio=acute/chronic;
    const workload=clamp((ratio-1)*80+50);const base=clamp((100-recovery)*.25+(100-sleep)*.18+soreness*4+pain*7+stress*2+Math.max(0,workload-50)*.35);
    const areas=input.bodyAreas||['shoulder','knee','back','elbow','hip','neck'];
    const areaModifiers={shoulder:Number(input.throwingVolume??0)*.08+Number(input.pressVolume??0)*.03,knee:Number(input.sprintVolume??0)*.08+Number(input.lowerBodyVolume??0)*.03,back:Number(input.hingeVolume??0)*.04,elbow:Number(input.throwingVolume??0)*.06,hip:Number(input.sprintVolume??0)*.04,neck:Number(input.contactLoad??0)*.05};
    const risks=areas.map(area=>{const score=clamp(base+(areaModifiers[area]||0)+(input.injuries||[]).filter(x=>normalizeText(x.area)===area).reduce((s,x)=>s+Number(x.severity||0)*5,0));return {area,score:Math.round(score),probability:Math.round(clamp(score*.82)),level:riskLabel(score),drivers:[pain>=4?'pain':'',soreness>=6?'soreness':'',ratio>1.3?'rapid workload increase':'',sleep<60?'sleep debt':'',recovery<60?'poor recovery':''].filter(Boolean),mitigation:score>=60?'Reduce aggravating load, prioritize recovery, and reassess symptoms before hard training.':score>=35?'Control volume, warm up thoroughly, and monitor symptoms.':'Maintain progressive loading and recovery habits.'};}).sort((a,b)=>b.score-a.score);
    const confidence=clamp(45+Math.min(history.length,21)*1.5+(acute>0&&chronic>0?15:0));
    return {version:VERSION,overall:Math.round(mean(risks.slice(0,3).map(r=>r.score))),level:riskLabel(mean(risks.slice(0,3).map(r=>r.score))),workloadRatio:round(ratio,.01),risks,confidence:Math.round(confidence),confidenceLabel:confidenceLabel(confidence)};
  }

  function detectPlateau(input={}){
    const history=normalizeHistory(input.history||[]);const checks=[];
    const definitions=[['weight','.weight',.08,21],['strength','.strength',.2,28],['readiness','.readiness',.35,14],['recovery','.recovery',.35,14]];
    definitions.forEach(([id,_path,threshold,days])=>{
      const t=trend(history,id,{window:days,flatThreshold:threshold});
      const enough=t.n>=Math.min(7,days);const plateau=enough&&Math.abs(t.weeklyChange)<=threshold;
      const declining=enough&&t.weeklyChange<-threshold;
      let reason='Insufficient history';
      if(enough)reason=plateau?`The ${id} trend has remained effectively flat.`:declining?`The ${id} trend is declining.`:`The ${id} trend is still progressing.`;
      checks.push({type:id,detected:plateau,status:plateau?'plateau':declining?'regression':'progressing',trend:t,reason,recommendation:plateau?(id==='weight'?'Audit calorie accuracy and adherence before changing targets.':id==='strength'?'Deload or change progression stimulus while preserving technique.':'Reduce accumulated fatigue and improve sleep consistency.'):'Continue the current plan while monitoring the trend.'});
    });
    return {version:VERSION,detected:checks.some(x=>x.detected),plateaus:checks.filter(x=>x.detected),checks,confidence:Math.round(mean(checks.map(x=>x.trend.confidence)))};
  }

  function regressionDetection(input={}){
    const history=normalizeHistory(input.history||[]);const metrics=input.metrics||['weight','strength','readiness','recovery','sleep','hydration','performance'];
    const alerts=metrics.map(metric=>trend(history,metric,{window:21,flatThreshold:.2})).filter(t=>t.n>=5&&t.direction==='down').map(t=>({metric:t.metric,severity:Math.abs(t.weeklyChange)>5?'high':Math.abs(t.weeklyChange)>2?'moderate':'low',weeklyChange:t.weeklyChange,confidence:t.confidence,message:`${t.metric} is trending down ${Math.abs(t.weeklyChange)} units per week.`}));
    return {version:VERSION,detected:alerts.length>0,alerts:alerts.sort((a,b)=>Math.abs(b.weeklyChange)-Math.abs(a.weeklyChange)),recommendation:alerts.length?'Correct the most credible declining driver before increasing training stress.':'No meaningful regression detected.'};
  }

  function goalProbability(input={}){
    const goal=input.goal||{};const history=normalizeHistory(input.history||[]);const metric=normalizeText(goal.metric||goal.type||'weight').replace(/\s+/g,'');
    const key=metric.includes('bodyfat')?'bodyFat':metric.includes('strength')?'strength':metric.includes('readiness')?'readiness':'weight';
    const latest=Number(goal.current??input.current??history.at(-1)?.[key]);const target=Number(goal.target);const deadline=goal.deadline?new Date(goal.deadline):new Date(Date.now()+(Number(goal.days)||90)*DAY);const days=Math.max(1,Math.ceil((deadline-new Date(input.date||Date.now()))/DAY));
    if(!Number.isFinite(latest)||!Number.isFinite(target))return {version:VERSION,probability:0,confidence:20,status:'insufficient-data',reason:'Current and target values are required.'};
    const t=trend(history,key,{window:Math.min(42,history.length),flatThreshold:.01});const direction=Math.sign(target-latest);const expected=latest+t.dailyChange*days;const gap=Math.abs(target-latest);const projectedProgress=direction===0?1:direction*(expected-latest);const progressRatio=gap?projectedProgress/gap:1;
    const volatility=stdev(series(history,key).map(p=>p.y));const uncertainty=Math.max(.5,volatility*Math.sqrt(days/7));const z=gap?((direction*(expected-target))/uncertainty):3;
    let probability=clamp(sigmoid(z)*100);
    if(t.n<5)probability=clamp(50+(progressRatio-.5)*25);
    const confidence=clamp(30+Math.min(t.n,30)*2+t.r2*25-Math.min(volatility,20));
    const estimatedDays=Math.abs(t.dailyChange)>.0001&&Math.sign(t.dailyChange)===direction?Math.ceil(gap/Math.abs(t.dailyChange)):null;
    return {version:VERSION,metric:key,current:round(latest,.1),target:round(target,.1),deadline:isoDate(deadline),daysRemaining:days,probability:Math.round(probability),confidence:Math.round(confidence),confidenceLabel:confidenceLabel(confidence),projectedAtDeadline:round(expected,.1),estimatedCompletion:estimatedDays!=null?addDays(input.date||Date.now(),estimatedDays):null,status:probability>=75?'on-track':probability>=45?'at-risk':'off-track',trend:t};
  }

  function trainingResponse(input={}){
    const history=normalizeHistory(input.history||[]);const loadTrend=trend(history,'trainingLoad',{window:28,flatThreshold:.5});const strengthTrend=trend(history,'strength',{window:42,flatThreshold:.2});const recoveryTrend=trend(history,'recovery',{window:21,flatThreshold:.5});
    const responsiveness=clamp(50+strengthTrend.weeklyChange*4-recoveryTrend.weeklyChange*-1-Math.max(0,loadTrend.weeklyChange-10));
    const classification=responsiveness>=75?'high-responder':responsiveness>=55?'positive':responsiveness>=35?'mixed':'poor-response';
    return {version:VERSION,score:Math.round(responsiveness),classification,loadTrend,strengthTrend,recoveryTrend,next30Days:{strengthChange:round(strengthTrend.dailyChange*30,.1),recoveryChange:round(recoveryTrend.dailyChange*30,.1)},recommendation:classification==='poor-response'?'Reduce fatigue, confirm nutrition adequacy, and use a deload before adding volume.':classification==='mixed'?'Hold volume steady and improve recovery consistency.':'Continue progressive overload while preserving recovery.'};
  }

  function simulate(input={},changes={},options={}){
    const baseline=forecast(input,options);const days=Number(options.days)||30;
    const calories=Number(changes.calories??changes.calorieChange??0);const sleepHours=Number(changes.sleepHours??changes.sleepChange??0);const trainingPct=Number(changes.trainingLoadPercent??0);const hydrationPct=Number(changes.hydrationPercent??0);
    const weightDelta=calories*days/3500*.45;const recoveryDelta=clamp(sleepHours*4+hydrationPct*.08-trainingPct*.06,-25,25);const readinessDelta=clamp(sleepHours*3.5+hydrationPct*.06-trainingPct*.05,-25,25);const strengthDelta=clamp(trainingPct*.06+recoveryDelta*.12+Math.max(0,calories)*.001,-15,15);
    return {version:VERSION,days,changes,baseline:{readiness:baseline.readiness.nextWeekAverage,goalProbability:baseline.goal?.probability??null,weight30:baseline.body.projections.find(p=>p.days===30)?.weight??null},projectedImpact:{weight:round(weightDelta,.1),readiness:round(readinessDelta,.1),recovery:round(recoveryDelta,.1),strengthPercent:round(strengthDelta,.1)},interpretation:[weightDelta<-.5?'Expected faster weight loss.':weightDelta>.5?'Expected weight gain or slower loss.':'Minimal direct weight effect.',readinessDelta>=3?'Readiness is likely to improve.':readinessDelta<=-3?'Readiness is likely to decline.':'Readiness impact is likely small.',strengthDelta>=2?'Training performance may improve.':strengthDelta<=-2?'Training performance may decline.':'Strength impact is likely small.']};
  }

  function monteCarloGoal(input={},options={}){
    const iterations=Math.max(200,Math.min(10000,Number(options.iterations)||2000));const goal=input.goal||{};const history=normalizeHistory(input.history||[]);const key=normalizeText(goal.metric||goal.type).includes('body')?'bodyFat':normalizeText(goal.metric||goal.type).includes('strength')?'strength':'weight';
    const current=Number(goal.current??history.at(-1)?.[key]);const target=Number(goal.target);const days=Math.max(1,Number(goal.days)||Math.ceil((new Date(goal.deadline||Date.now()+90*DAY)-new Date(input.date||Date.now()))/DAY));const t=trend(history,key,{window:42,flatThreshold:.01});const residual=Math.max(.02,stdev(series(history,key).map(p=>p.y))*.08);const direction=Math.sign(target-current);let success=0;const completion=[];
    let seed=Number(options.seed)||5331;const random=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};const normal=()=>Math.sqrt(-2*Math.log(Math.max(random(),1e-9)))*Math.cos(2*Math.PI*random());
    for(let i=0;i<iterations;i++){let value=current;let reached=null;for(let d=1;d<=days;d++){value+=t.dailyChange+normal()*residual;if(reached==null&&direction*(value-target)>=0)reached=d;}if(direction*(value-target)>=0){success++;completion.push(reached||days);}}
    const probability=Math.round(100*success/iterations);completion.sort((a,b)=>a-b);
    return {version:VERSION,iterations,probability,averageCompletionDays:completion.length?Math.round(mean(completion)):null,bestCaseDays:completion.length?completion[Math.floor(completion.length*.1)]:null,worstCaseDays:completion.length?completion[Math.floor(completion.length*.9)]:null,estimatedCompletion:completion.length?addDays(input.date||Date.now(),Math.round(mean(completion))):null,confidence:Math.round(clamp(35+Math.min(history.length,30)*2+t.r2*25)),status:probability>=75?'likely':probability>=45?'uncertain':'unlikely'};
  }

  function opportunityDetection(input={}){
    const readiness=clamp(input.readiness?.score??input.readiness??70),recovery=clamp(input.recovery?.score??input.recovery??70),sleep=clamp(input.sleep?.score??input.sleepScore??70),stress=clamp(input.stress??5,0,10),pain=clamp(input.pain??0,0,10);
    const score=clamp(mean([readiness,recovery,sleep])+(5-stress)*2-pain*5);const opportunities=[];
    if(score>=85)opportunities.push({type:'high-performance-window',score:Math.round(score),recommendation:'Schedule the highest-value strength, power, or skill session today.',confidence:Math.round(mean([readiness,recovery,sleep]))});
    if(readiness>=88&&recovery>=85&&pain<=1)opportunities.push({type:'personal-best-window',score:Math.round(mean([readiness,recovery])),recommendation:'A controlled personal-record attempt may be appropriate if warm-up performance confirms readiness.',confidence:85});
    if(score<60)opportunities.push({type:'recovery-opportunity',score:Math.round(100-score),recommendation:'Use today to restore sleep, hydration, mobility, and nutrition rather than forcing intensity.',confidence:80});
    return {version:VERSION,score:Math.round(score),opportunities};
  }

  function forecast(input={},options={}){
    let decision=input.decision;
    const decisionApi=root&&root.IronDecision;
    if(!decision&&decisionApi&&typeof decisionApi.makeDecision==='function'){try{decision=decisionApi.makeDecision(input);}catch(_error){}}
    const body=bodyCompositionForecast(input,options.body||{});const readiness=readinessForecast(input,options.readiness||{});const recovery=recoveryForecast(input,options.recovery||{});const injury=injuryRisk(input);const plateau=detectPlateau(input);const regression=regressionDetection(input);const response=trainingResponse(input);const opportunity=opportunityDetection(input);
    const goal=input.goal?goalProbability(input):null;
    return {version:VERSION,date:isoDate(input.date),body,readiness,recovery,injury,plateau,regression,response,opportunity,goal,decision:decision?{primary:decision.mission?.primary?.id||decision.decision,confidence:decision.confidence}:null,summary:buildSummary({body,readiness,recovery,injury,plateau,regression,response,opportunity,goal}),generatedAt:new Date().toISOString()};
  }

  function buildSummary(result){
    const notes=[];const body30=result.body.projections.find(p=>p.days===30);
    if(body30)notes.push(`30-day projected weight: ${body30.weight}.`);
    notes.push(`Next-week readiness average: ${result.readiness.nextWeekAverage}.`);
    notes.push(`Overall injury risk: ${result.injury.level}.`);
    if(result.goal)notes.push(`Goal probability: ${result.goal.probability}% (${result.goal.status}).`);
    if(result.plateau.detected)notes.push(`${result.plateau.plateaus.length} plateau signal(s) detected.`);
    if(result.regression.detected)notes.push(`${result.regression.alerts.length} regression signal(s) detected.`);
    if(result.opportunity.opportunities.length)notes.push(result.opportunity.opportunities[0].recommendation);
    return notes;
  }

  function fromAppState(state={},options={}){
    const history=options.history||state.analytics?.history||state.history||[];const date=isoDate(options.date);const body=state.body?.[date]||{};
    return forecast({...options,date,history,weight:body.weight??options.weight,bodyFat:body.bodyFat??options.bodyFat,sleep:{score:options.sleepScore??body.sleepScore},hydration:{score:options.hydrationScore},nutrition:{score:options.nutritionScore},goal:options.goal});
  }

  return Object.freeze({VERSION,normalizeHistory,linearRegression,trend,bodyCompositionForecast,weightProjection:bodyCompositionForecast,readinessForecast,recoveryForecast,injuryRisk,detectPlateau,regressionDetection,goalProbability,trainingResponse,simulate,monteCarloGoal,opportunityDetection,forecast,performanceForecast:forecast,fromAppState,confidenceLabel,riskLabel});
});
