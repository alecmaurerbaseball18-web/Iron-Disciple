(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.IronKnowledge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const VERSION='5.5.0';
  const DAY=86400000;
  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
  const round=(n,d=1)=>{const p=10**d;return Math.round((Number(n)||0)*p)/p;};
  const text=v=>String(v==null?'':v).trim();
  const finite=v=>Number.isFinite(Number(v));
  const numeric=a=>(a||[]).map(Number).filter(Number.isFinite);
  const mean=a=>{const v=numeric(a);return v.length?v.reduce((s,n)=>s+n,0)/v.length:0;};
  const median=a=>{const v=numeric(a).sort((x,y)=>x-y);if(!v.length)return 0;const m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2;};
  const stdev=a=>{const v=numeric(a);if(v.length<2)return 0;const m=mean(v);return Math.sqrt(v.reduce((s,n)=>s+(n-m)**2,0)/(v.length-1));};
  const quantile=(a,q)=>{const v=numeric(a).sort((x,y)=>x-y);if(!v.length)return 0;const i=(v.length-1)*q,l=Math.floor(i),h=Math.ceil(i);return l===h?v[l]:v[l]+(v[h]-v[l])*(i-l);};
  const isoDate=v=>{const d=v?new Date(v):new Date();return Number.isNaN(d.getTime())?new Date().toISOString().slice(0,10):d.toISOString().slice(0,10);};
  const uniq=a=>[...new Set((a||[]).filter(Boolean))];
  const slug=v=>text(v).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  function correlation(xs,ys){
    const pairs=[];for(let i=0;i<Math.min(xs.length,ys.length);i++)if(finite(xs[i])&&finite(ys[i]))pairs.push([Number(xs[i]),Number(ys[i])]);
    if(pairs.length<3)return {r:0,n:pairs.length};
    const mx=mean(pairs.map(p=>p[0])),my=mean(pairs.map(p=>p[1]));
    let num=0,dx=0,dy=0;for(const [x,y] of pairs){const a=x-mx,b=y-my;num+=a*b;dx+=a*a;dy+=b*b;}
    return {r:dx&&dy?num/Math.sqrt(dx*dy):0,n:pairs.length};
  }

  function linearRegression(xs,ys){
    const pairs=[];for(let i=0;i<Math.min(xs.length,ys.length);i++)if(finite(xs[i])&&finite(ys[i]))pairs.push([Number(xs[i]),Number(ys[i])]);
    if(pairs.length<3)return {slope:0,intercept:mean(ys),r2:0,n:pairs.length};
    const mx=mean(pairs.map(p=>p[0])),my=mean(pairs.map(p=>p[1]));let num=0,den=0;
    for(const [x,y] of pairs){num+=(x-mx)*(y-my);den+=(x-mx)**2;}
    const slope=den?num/den:0,intercept=my-slope*mx;const c=correlation(pairs.map(p=>p[0]),pairs.map(p=>p[1]));
    return {slope,intercept,r2:c.r*c.r,n:pairs.length};
  }

  function confidence(sampleSize,strength=0,consistency=1,completeness=1){
    const sample=clamp((sampleSize/30)*100);const signal=clamp(Math.abs(strength)*100);return Math.round(clamp(sample*.42+signal*.33+clamp(consistency*100)*.15+clamp(completeness*100)*.10));
  }
  function evidenceLabel(c,n){return n<5?'insufficient-data':c>=80?'strong-evidence':c>=60?'moderate-confidence':c>=40?'preliminary':'weak-evidence';}

  function normalizeHabitMap(value){
    if(Array.isArray(value))return Object.fromEntries(value.map(h=>[slug(h.name||h.id||h),finite(h.completed)?Number(h.completed):h.completed===false?0:1]));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[slug(k),typeof v==='object'?Number(v.completed??v.value??0):Number(v===true?1:v||0)]));
    return {};
  }

  function normalizeRecord(record={},index=0){
    const body=record.body||record.bodyComposition||{};
    const performance=record.performance||{};
    const nutrition=record.nutrition||{};
    const training=record.training||{};
    const sleepObj=record.sleep||{};
    const hydrationObj=record.hydration||{};
    const recoveryObj=record.recovery||{};
    const readinessObj=record.readiness||{};
    const date=isoDate(record.date||record.timestamp||new Date(Date.now()+index*DAY));
    return {
      date,timestamp:new Date(date).getTime(),
      weight:finite(record.weight??body.weight)?Number(record.weight??body.weight):null,
      bodyFat:finite(record.bodyFat??body.bodyFat)?Number(record.bodyFat??body.bodyFat):null,
      waist:finite(record.waist??body.waist)?Number(record.waist??body.waist):null,
      sleepHours:finite(record.sleepHours??sleepObj.hours??sleepObj.duration)?Number(record.sleepHours??sleepObj.hours??sleepObj.duration):null,
      sleepScore:finite(record.sleepScore??sleepObj.score)?clamp(record.sleepScore??sleepObj.score):null,
      readiness:finite(record.readinessScore??readinessObj.score??record.readiness)?clamp(record.readinessScore??readinessObj.score??record.readiness):null,
      recovery:finite(record.recoveryScore??recoveryObj.score??record.recovery)?clamp(record.recoveryScore??recoveryObj.score??record.recovery):null,
      performance:finite(record.performanceScore??performance.score??record.performance)?clamp(record.performanceScore??performance.score??record.performance):null,
      hydration:finite(record.hydrationScore??hydrationObj.score??record.hydration)?clamp(record.hydrationScore??hydrationObj.score??record.hydration):null,
      calories:finite(record.calories??nutrition.calories)?Number(record.calories??nutrition.calories):null,
      protein:finite(record.protein??nutrition.protein)?Number(record.protein??nutrition.protein):null,
      carbs:finite(record.carbs??nutrition.carbs)?Number(record.carbs??nutrition.carbs):null,
      trainingLoad:finite(record.trainingLoad??training.load??training.volume)?Number(record.trainingLoad??training.load??training.volume):null,
      soreness:finite(record.soreness??recoveryObj.soreness)?clamp(record.soreness??recoveryObj.soreness,0,10):null,
      stress:finite(record.stress)?clamp(record.stress,0,10):null,
      mood:finite(record.mood)?clamp(record.mood,0,10):null,
      shift:text(record.shift||record.shiftType||record.workSchedule?.shift||'off').toLowerCase(),
      sport:text(record.sport||training.sport||''),
      trainingType:text(record.trainingType||training.type||''),
      completed:record.completed==null?null:Boolean(record.completed),
      habits:normalizeHabitMap(record.habits||record.habitCompletion),
      pain:record.pain||record.painAreas||{},
      raw:record
    };
  }

  function normalizeHistory(history=[]){return (Array.isArray(history)?history:[]).map(normalizeRecord).sort((a,b)=>a.timestamp-b.timestamp);}

  const BASELINE_METRICS=['weight','bodyFat','waist','sleepHours','sleepScore','readiness','recovery','performance','hydration','calories','protein','carbs','trainingLoad','soreness','stress','mood'];
  function buildBaseline(history=[],options={}){
    const rows=normalizeHistory(history);const windowDays=Math.max(7,Number(options.windowDays)||42);const cutoff=rows.length?rows.at(-1).timestamp-(windowDays-1)*DAY:0;const recent=rows.filter(r=>r.timestamp>=cutoff);
    const metrics={};
    for(const key of BASELINE_METRICS){const values=recent.map(r=>r[key]).filter(finite).map(Number);metrics[key]={count:values.length,mean:round(mean(values),2),median:round(median(values),2),stdev:round(stdev(values),2),low:round(quantile(values,.1),2),high:round(quantile(values,.9),2),min:values.length?Math.min(...values):null,max:values.length?Math.max(...values):null};}
    const completeness=rows.length?round(rows.reduce((s,r)=>s+BASELINE_METRICS.filter(k=>finite(r[k])).length,0)/(rows.length*BASELINE_METRICS.length),3):0;
    return {version:VERSION,type:'personal-baseline',windowDays,sampleSize:recent.length,dateRange:recent.length?{from:recent[0].date,to:recent.at(-1).date}:null,metrics,completeness,confidence:confidence(recent.length,Math.min(1,completeness),1,completeness),evidence:evidenceLabel(confidence(recent.length,completeness,1,completeness),recent.length)};
  }

  function metricPairs(rows,predictor,outcome,lag=0){
    const xs=[],ys=[];for(let i=0;i<rows.length-lag;i++){const x=rows[i][predictor],y=rows[i+lag][outcome];if(finite(x)&&finite(y)){xs.push(Number(x));ys.push(Number(y));}}return {xs,ys};
  }

  function discoverPatterns(history=[],options={}){
    const rows=normalizeHistory(history);const predictors=options.predictors||['sleepHours','sleepScore','hydration','calories','protein','trainingLoad','stress','soreness','mood'];const outcomes=options.outcomes||['readiness','recovery','performance','weight'];const patterns=[];
    for(const predictor of predictors)for(const outcome of outcomes){if(predictor===outcome)continue;for(const lag of [0,1]){const {xs,ys}=metricPairs(rows,predictor,outcome,lag);const c=correlation(xs,ys);if(c.n<5||Math.abs(c.r)<(options.minimumCorrelation||.2))continue;const reg=linearRegression(xs,ys);const split=median(xs);const low=ys.filter((_,i)=>xs[i]<=split),high=ys.filter((_,i)=>xs[i]>split);const effect=round(mean(high)-mean(low),2);const conf=confidence(c.n,c.r,Math.min(1,Math.abs(effect)/(stdev(ys)||1)),c.n/Math.max(1,rows.length));patterns.push({id:`${predictor}-${outcome}-lag${lag}`,predictor,outcome,lagDays:lag,direction:c.r>=0?'positive':'negative',strength:round(Math.abs(c.r),3),correlation:round(c.r,3),effect,unitEffect:round(reg.slope,3),sampleSize:c.n,confidence:conf,evidence:evidenceLabel(conf,c.n),relationship:`Higher ${predictor} is associated with ${c.r>=0?'higher':'lower'} ${outcome}${lag?` the next day`:''}.`,possibleConfounders:['Work schedule','Training load','Incomplete logging'],causal:false});}}
    patterns.sort((a,b)=>b.confidence-a.confidence||b.strength-a.strength);return {version:VERSION,type:'pattern-discovery',sampleSize:rows.length,patterns,strong:patterns.filter(p=>p.confidence>=80),preliminary:patterns.filter(p=>p.confidence<60),disclaimer:'Patterns describe association, not proven causation.'};
  }

  function collectHabitNames(rows){return uniq(rows.flatMap(r=>Object.keys(r.habits||{})));}
  function analyzeHabitImpact(history=[],options={}){
    const rows=normalizeHistory(history),outcomes=options.outcomes||['readiness','recovery','performance'];const impacts=[];
    for(const habit of collectHabitNames(rows))for(const outcome of outcomes){const done=[],notDone=[];for(const r of rows){if(!finite(r[outcome])||r.habits[habit]==null)continue;(Number(r.habits[habit])>0?done:notDone).push(Number(r[outcome]));}const n=done.length+notDone.length;if(done.length<3||notDone.length<3)continue;const effect=mean(done)-mean(notDone);const pooled=stdev([...done,...notDone])||1;const strength=Math.min(1,Math.abs(effect)/pooled);const balance=Math.min(done.length,notDone.length)/Math.max(done.length,notDone.length);const conf=confidence(n,strength,balance,n/Math.max(1,rows.length));impacts.push({habit,outcome,completedDays:done.length,missedDays:notDone.length,sampleSize:n,impact:round(effect,2),direction:effect>=0?'beneficial':'counterproductive',strength:round(strength,3),confidence:conf,evidence:evidenceLabel(conf,n),statement:`Completing ${habit.replace(/-/g,' ')} is associated with ${effect>=0?'+':''}${round(effect,1)} ${outcome} points.`});}
    impacts.sort((a,b)=>b.confidence-a.confidence||Math.abs(b.impact)-Math.abs(a.impact));
    return {version:VERSION,type:'habit-impact',sampleSize:rows.length,impacts,highestImpact:impacts.filter(x=>x.direction==='beneficial').slice(0,5),counterproductive:impacts.filter(x=>x.direction==='counterproductive').slice(0,5),insufficientData:rows.length<7};
  }

  function analyzeTrainingResponse(history=[],options={}){
    const rows=normalizeHistory(history);const groups={};for(const r of rows){const key=slug(r.trainingType||'unclassified');(groups[key]||(groups[key]=[])).push(r);}
    const profiles=Object.entries(groups).map(([type,items])=>{const next=[];for(const r of items){const i=rows.indexOf(r),n=rows[i+1];if(n)next.push(n);}const completion=items.filter(x=>x.completed!=null);return {type,sessions:items.length,averageLoad:round(mean(items.map(x=>x.trainingLoad)),1),sameDayPerformance:round(mean(items.map(x=>x.performance)),1),nextDayReadiness:round(mean(next.map(x=>x.readiness)),1),nextDayRecovery:round(mean(next.map(x=>x.recovery)),1),averageSoreness:round(mean(next.map(x=>x.soreness)),1),completionRate:completion.length?round(100*completion.filter(x=>x.completed).length/completion.length,1):null,confidence:confidence(items.length,.4,1,items.length/Math.max(1,rows.length))};}).sort((a,b)=>b.confidence-a.confidence);
    const loads=numeric(rows.map(r=>r.trainingLoad)),recovery=numeric(rows.map(r=>r.recovery));const loadRecovery=correlation(rows.map(r=>r.trainingLoad),rows.map(r=>r.recovery));
    return {version:VERSION,type:'training-response',sampleSize:rows.length,profiles,bestResponse:profiles.slice().sort((a,b)=>(b.nextDayReadiness||0)-(a.nextDayReadiness||0))[0]||null,loadRange:loads.length?{low:round(quantile(loads,.25),1),typical:round(median(loads),1),high:round(quantile(loads,.75),1)}:null,loadRecoveryCorrelation:round(loadRecovery.r,3),averageRecovery:round(mean(recovery),1)};
  }

  function analyzeNutritionResponse(history=[],options={}){
    const rows=normalizeHistory(history);const targets=options.targets||{};const metrics=['calories','protein','carbs','hydration'];const relationships=[];
    for(const m of metrics){const p=metricPairs(rows,m,'recovery',1),c=correlation(p.xs,p.ys),reg=linearRegression(p.xs,p.ys);relationships.push({metric:m,outcome:'nextDayRecovery',sampleSize:c.n,correlation:round(c.r,3),unitEffect:round(reg.slope,3),confidence:confidence(c.n,c.r,1,c.n/Math.max(1,rows.length))});}
    const adherence={};for(const m of ['calories','protein']){const target=Number(targets[m]);const vals=rows.map(r=>r[m]).filter(finite);adherence[m]=target&&vals.length?round(100*vals.filter(v=>Math.abs(v-target)<=target*.1).length/vals.length,1):null;}
    const calorieVariation=stdev(rows.map(r=>r.calories));
    return {version:VERSION,type:'nutrition-response',sampleSize:rows.length,relationships:relationships.sort((a,b)=>b.confidence-a.confidence),average:{calories:round(mean(rows.map(r=>r.calories)),0),protein:round(mean(rows.map(r=>r.protein)),0),carbs:round(mean(rows.map(r=>r.carbs)),0),hydration:round(mean(rows.map(r=>r.hydration)),1)},calorieVariation:round(calorieVariation,0),adherence,insight:calorieVariation>350?'Daily calorie variability is high enough to reduce trend predictability.':'Calorie consistency is within a useful range.'};
  }

  function analyzeShiftResponse(history=[]){
    const rows=normalizeHistory(history),groups={};for(const r of rows){const key=slug(r.shift||'off');(groups[key]||(groups[key]=[])).push(r);}
    const profiles=Object.entries(groups).map(([shift,items])=>({shift,days:items.length,sleepHours:round(mean(items.map(x=>x.sleepHours)),1),readiness:round(mean(items.map(x=>x.readiness)),1),recovery:round(mean(items.map(x=>x.recovery)),1),performance:round(mean(items.map(x=>x.performance)),1),hydration:round(mean(items.map(x=>x.hydration)),1),trainingCompletion:items.filter(x=>x.completed!=null).length?round(100*items.filter(x=>x.completed).length/items.filter(x=>x.completed!=null).length,1):null,confidence:confidence(items.length,.35,1,items.length/Math.max(1,rows.length))})).sort((a,b)=>b.days-a.days);
    const best=profiles.slice().sort((a,b)=>b.readiness-a.readiness)[0]||null,worst=profiles.slice().sort((a,b)=>a.readiness-b.readiness)[0]||null;
    return {version:VERSION,type:'shift-response',sampleSize:rows.length,profiles,bestShift:best,worstShift:worst,readinessDifference:best&&worst?round(best.readiness-worst.readiness,1):0};
  }

  function distance(a,b,keys){let sum=0,n=0;for(const k of keys){if(!finite(a[k])||!finite(b[k]))continue;const scale=['sleepHours','stress','soreness'].includes(k)?10:100;sum+=((Number(a[k])-Number(b[k]))/scale)**2;n++;}return n?Math.sqrt(sum/n):Infinity;}
  function predictPersonalResponse(state={},action={},history=[]){
    if(Array.isArray(state)){history=state;state=action||{};action=arguments[2]||{};}
    const rows=normalizeHistory(history.length?history:state.history||[]),current=normalizeRecord(state),keys=['sleepHours','readiness','recovery','hydration','trainingLoad','stress','soreness'];const actionType=slug(action.type||action.action||action.trainingType||'');
    let candidates=rows.map((r,i)=>({r,i,d:distance(current,r,keys)})).filter(x=>Number.isFinite(x.d));if(actionType)candidates=candidates.filter(x=>slug(x.r.trainingType)===actionType||slug(x.r.raw.action)===actionType);candidates.sort((a,b)=>a.d-b.d);const neighbors=candidates.slice(0,Math.min(12,candidates.length));
    const outcomes=neighbors.map(x=>rows[x.i+1]).filter(Boolean);const baseline=buildBaseline(rows);const predicted={readiness:round(mean(outcomes.map(x=>x.readiness))||baseline.metrics.readiness.mean,1),recovery:round(mean(outcomes.map(x=>x.recovery))||baseline.metrics.recovery.mean,1),performance:round(mean(outcomes.map(x=>x.performance))||baseline.metrics.performance.mean,1),soreness:round(mean(outcomes.map(x=>x.soreness))||baseline.metrics.soreness.mean,1)};const similarity=neighbors.length?1-mean(neighbors.map(x=>Math.min(1,x.d))):0;const conf=confidence(outcomes.length,similarity,1,outcomes.length/12);
    return {version:VERSION,type:'personal-response-prediction',action:actionType||text(action.type||action.action||'unspecified'),matchedCases:outcomes.length,predicted,confidence:conf,evidence:evidenceLabel(conf,outcomes.length),historicalComparison:{readiness:round(predicted.readiness-baseline.metrics.readiness.mean,1),recovery:round(predicted.recovery-baseline.metrics.recovery.mean,1),performance:round(predicted.performance-baseline.metrics.performance.mean,1)},explanation:outcomes.length?`Prediction is based on ${outcomes.length} similar historical conditions.`:'Insufficient similar history; baseline estimates were used.'};
  }

  function evaluateDecisionOutcome(record={}){
    const expected=record.expectedOutcome||{},actual=record.actualOutcome||{};const keys=uniq([...Object.keys(expected),...Object.keys(actual)]).filter(k=>finite(expected[k])&&finite(actual[k]));const comparisons=keys.map(k=>{const e=Number(expected[k]),a=Number(actual[k]),tolerance=Math.max(1,Math.abs(e)*.1);return {metric:k,expected:e,actual:a,error:round(a-e,2),accuracy:round(clamp(100-(Math.abs(a-e)/tolerance)*50),1)};});const adherence=clamp(record.adherence??(record.completed===false?0:100));const outcomeAccuracy=comparisons.length?mean(comparisons.map(x=>x.accuracy)):50;const successScore=Math.round(clamp(outcomeAccuracy*.65+adherence*.35));
    return {version:VERSION,type:'decision-outcome',decision:text(record.decision||record.recommendation||''),date:isoDate(record.date),comparisons,adherence,successScore,status:successScore>=80?'successful':successScore>=60?'mixed':'unsuccessful',lesson:adherence<60?'Execution was too low to judge the recommendation reliably.':successScore>=80?'The recommendation performed close to or better than expected.':'The model should reduce confidence in this recommendation under similar conditions.'};
  }

  function buildPersonalProfile(history=[],options={}){
    const rows=normalizeHistory(history),baseline=buildBaseline(rows,options),patterns=discoverPatterns(rows,options),habits=analyzeHabitImpact(rows,options),training=analyzeTrainingResponse(rows,options),nutrition=analyzeNutritionResponse(rows,options),shifts=analyzeShiftResponse(rows);const strongest=patterns.patterns[0]||null;
    return {version:VERSION,type:'personal-profile',sampleSize:rows.length,dateRange:rows.length?{from:rows[0].date,to:rows.at(-1).date}:null,baseline,patterns,habits,training,nutrition,shifts,modelConfidence:Math.round(mean([baseline.confidence,...patterns.patterns.slice(0,5).map(x=>x.confidence),...habits.impacts.slice(0,5).map(x=>x.confidence)].filter(finite))),headline:strongest?strongest.relationship:'More history is required before a reliable personal pattern can be declared.',generatedAt:new Date().toISOString()};
  }

  function generateInsights(history=[],options={}){
    const profile=buildPersonalProfile(history,options),insights=[];
    for(const p of profile.patterns.patterns.slice(0,5))insights.push({category:'pattern',priority:p.confidence,confidence:p.confidence,evidence:p.evidence,title:`${p.predictor} → ${p.outcome}`,message:p.relationship,action:p.direction==='positive'?`Protect conditions that raise ${p.predictor}.`:`Avoid unnecessary increases in ${p.predictor}.`});
    for(const h of profile.habits.highestImpact.slice(0,3))insights.push({category:'habit',priority:h.confidence+Math.abs(h.impact),confidence:h.confidence,evidence:h.evidence,title:h.habit.replace(/-/g,' '),message:h.statement,action:`Prioritize ${h.habit.replace(/-/g,' ')} before adding lower-impact habits.`});
    if(profile.shifts.worstShift&&profile.shifts.readinessDifference>=4)insights.push({category:'shift',priority:85,confidence:profile.shifts.worstShift.confidence,evidence:evidenceLabel(profile.shifts.worstShift.confidence,profile.shifts.worstShift.days),title:`${profile.shifts.worstShift.shift} shift readiness`,message:`Readiness averages ${profile.shifts.readinessDifference} points lower than the best shift profile.`,action:'Use a shift-specific sleep, hydration, and training schedule.'});
    if(profile.nutrition.calorieVariation>350)insights.push({category:'nutrition',priority:75,confidence:70,evidence:'moderate-confidence',title:'Calorie consistency',message:`Daily calories vary by approximately ${profile.nutrition.calorieVariation}.`,action:'Keep most days within a 250-calorie band to improve predictability.'});
    insights.sort((a,b)=>b.priority-a.priority);return {version:VERSION,type:'personal-insights',sampleSize:profile.sampleSize,modelConfidence:profile.modelConfidence,insights,topInsight:insights[0]||null,limitations:profile.sampleSize<14?['Fewer than 14 records limits reliability.']:[],generatedAt:new Date().toISOString()};
  }

  function buildKnowledgeReport(history=[],options={}){
    const profile=buildPersonalProfile(history,options),insights=generateInsights(history,options);return {version:VERSION,type:'knowledge-report',period:options.period||'all-history',sampleSize:profile.sampleSize,modelConfidence:profile.modelConfidence,evidence:evidenceLabel(profile.modelConfidence,profile.sampleSize),baselineSummary:{sleepHours:profile.baseline.metrics.sleepHours.mean,readiness:profile.baseline.metrics.readiness.mean,recovery:profile.baseline.metrics.recovery.mean,performance:profile.baseline.metrics.performance.mean},strongestPatterns:profile.patterns.patterns.slice(0,5),highestImpactHabits:profile.habits.highestImpact.slice(0,5),shiftProfiles:profile.shifts.profiles,trainingProfiles:profile.training.profiles,nutritionSummary:profile.nutrition,insights:insights.insights,recommendations:uniq(insights.insights.slice(0,5).map(x=>x.action)),disclaimer:'Personal insights are observational and should not be treated as medical diagnosis or proof of causation.',generatedAt:new Date().toISOString()};
  }

  function fromAppState(state={},options={}){
    const history=options.history||state.history||state.logs||[];const report=buildKnowledgeReport(history,{...state.settings,...options});const coach=root&&root.IronCoach&&typeof root.IronCoach.generateCoaching==='function'?root.IronCoach.generateCoaching(state):null;return {...report,currentPrediction:options.action?predictPersonalResponse(state,options.action,history):null,coachContext:coach?{mission:coach.mission,goal:coach.goal}:null};
  }

  return Object.freeze({VERSION,normalizeRecord,normalizeHistory,buildBaseline,discoverPatterns,analyzeHabitImpact,analyzeTrainingResponse,analyzeNutritionResponse,analyzeShiftResponse,predictPersonalResponse,evaluateDecisionOutcome,buildPersonalProfile,generateInsights,buildKnowledgeReport,fromAppState,correlation,linearRegression,evidenceLabel});
});
