(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.IronDecision=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const VERSION='5.2.0';
  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
  const round=(n,step=1)=>Math.round((Number(n)||0)/step)*step;
  const mean=values=>{const list=(values||[]).map(Number).filter(Number.isFinite);return list.length?list.reduce((a,b)=>a+b,0)/list.length:0;};
  const isoDate=value=>{const d=value instanceof Date?value:new Date(value||Date.now());return Number.isNaN(d.getTime())?new Date().toISOString().slice(0,10):d.toISOString().slice(0,10);};
  const normalizeText=value=>String(value==null?'':value).trim().toLowerCase();
  const unique=list=>Array.from(new Set((list||[]).filter(Boolean)));
  const sortByScore=list=>(list||[]).slice().sort((a,b)=>b.score-a.score||b.confidence-a.confidence||String(a.id).localeCompare(String(b.id)));
  const priorityLabel=score=>score>=90?'critical':score>=80?'high':score>=65?'medium':'supporting';
  const riskLabel=score=>score>=80?'critical':score>=60?'high':score>=35?'moderate':'low';
  const confidenceLabel=score=>score>=90?'very-high':score>=75?'high':score>=55?'moderate':'limited';

  const DEFAULT_WEIGHTS=Object.freeze({
    healthRisk:100,tournamentDeadline:95,recoveryNeed:90,goalAlignment:85,
    consistency:75,opportunity:70,convenience:60,timeFit:65,workConstraint:80
  });

  const MISSION_LIBRARY=Object.freeze({
    medical:{id:'medical',title:'Protect health and stop aggravating activity',domain:'recovery',category:'medical',defaultMinutes:0},
    recover:{id:'recover',title:'Restore recovery capacity',domain:'recovery',category:'recovery',defaultMinutes:30},
    sleep:{id:'sleep',title:'Correct sleep debt',domain:'recovery',category:'sleep',defaultMinutes:0},
    hydrate:{id:'hydrate',title:'Correct hydration deficit',domain:'nutrition',category:'hydration',defaultMinutes:5},
    fuel:{id:'fuel',title:'Restore training fuel',domain:'nutrition',category:'nutrition',defaultMinutes:15},
    strength:{id:'strength',title:'Complete strength training',domain:'training',category:'strength',defaultMinutes:60},
    power:{id:'power',title:'Complete power and speed work',domain:'training',category:'power',defaultMinutes:45},
    conditioning:{id:'conditioning',title:'Complete conditioning work',domain:'training',category:'conditioning',defaultMinutes:40},
    mobility:{id:'mobility',title:'Complete mobility and tissue care',domain:'recovery',category:'mobility',defaultMinutes:20},
    golf:{id:'golf',title:'Complete focused golf practice',domain:'sport',category:'golf',defaultMinutes:45},
    softball:{id:'softball',title:'Complete focused softball practice',domain:'sport',category:'softball',defaultMinutes:45},
    taper:{id:'taper',title:'Taper and sharpen for competition',domain:'sport',category:'taper',defaultMinutes:30},
    mealPrep:{id:'meal-prep',title:'Prepare meals and remove nutrition friction',domain:'nutrition',category:'meal-prep',defaultMinutes:45},
    spiritual:{id:'spiritual',title:'Complete Bible study and prayer',domain:'spiritual',category:'spiritual',defaultMinutes:20},
    admin:{id:'admin',title:'Complete priority administrative work',domain:'work',category:'administrative',defaultMinutes:30},
    rest:{id:'rest',title:'Take a full rest day',domain:'recovery',category:'rest',defaultMinutes:0}
  });

  function safePerformance(input){
    if(input.performance&&Number.isFinite(Number(input.performance.score)))return input.performance;
    const api=root&&root.IronPerformance;
    if(api&&typeof api.buildHumanPerformance==='function'){
      try{return api.buildHumanPerformance(input).performance;}catch(_error){}
    }
    return {
      score:clamp(input.performanceScore??input.readiness??70),
      readiness:{score:clamp(input.readiness??70),components:{}},
      recovery:{score:clamp(input.recovery??70),components:{}},
      components:{
        sleep:clamp(input.sleep?.score??input.sleepScore??70),
        nutrition:clamp(input.nutrition?.score??input.nutritionScore??70),
        hydration:clamp(input.hydration?.score??input.hydrationScore??70),
        trainingLoad:clamp(input.trainingLoadScore??70),
        consistency:clamp(input.consistency??70),
        mental:clamp(input.mentalReadiness??70)
      },
      confidence:45
    };
  }

  function normalizeGoal(goal,index){
    if(typeof goal==='string')return {id:normalizeText(goal).replace(/\s+/g,'-')||`goal-${index}`,name:goal,type:normalizeText(goal),priority:70,deadline:null};
    return {
      id:String(goal?.id||`goal-${index}`),name:String(goal?.name||goal?.title||goal?.type||'Goal'),
      type:normalizeText(goal?.type||goal?.name||goal?.title),priority:clamp(goal?.priority??70),
      deadline:goal?.deadline?isoDate(goal.deadline):null,progress:clamp(goal?.progress??0),active:goal?.active!==false
    };
  }

  function normalizeEvent(event,index,date){
    const eventDate=event?.date||event?.eventDate||event?.start;
    const days=Number.isFinite(Number(event?.daysAway))?Math.max(0,Number(event.daysAway)):eventDate?Math.max(0,Math.ceil((new Date(eventDate)-new Date(date))/(86400000))):999;
    return {
      id:String(event?.id||`event-${index}`),type:normalizeText(event?.type||event?.sport||event?.title),
      title:String(event?.title||event?.name||event?.type||'Event'),date:eventDate?isoDate(eventDate):null,
      daysAway:Math.min(999,days),importance:clamp(event?.importance??80),travel:Boolean(event?.travel),durationMinutes:Math.max(0,Number(event?.durationMinutes)||0)
    };
  }

  function normalizeTimeBlocks(blocks=[]){
    return blocks.map((block,index)=>({
      id:String(block?.id||`block-${index}`),title:String(block?.title||block?.name||'Busy'),
      start:String(block?.start||''),end:String(block?.end||''),fixed:block?.fixed!==false,
      domain:normalizeText(block?.domain||block?.type||'calendar')
    })).filter(block=>block.start&&block.end);
  }

  function assessSituation(input={}){
    const date=isoDate(input.date),performance=safePerformance(input);
    const readiness=clamp(input.readiness?.score??input.readiness??performance.readiness?.score??performance.components?.readiness??70);
    const recovery=clamp(input.recovery?.score??input.recovery??performance.recovery?.score??performance.components?.recovery??70);
    const sleepScore=clamp(input.sleep?.score??performance.components?.sleep??70);
    const hydrationScore=clamp(input.hydration?.score??performance.components?.hydration??70);
    const nutritionScore=clamp(input.nutrition?.score??performance.components?.nutrition??70);
    const mental=clamp(input.mentalReadiness??performance.components?.mental??70);
    const stress=clamp(input.stress??input.profile?.stress??5,0,10);
    const soreness=clamp(input.soreness??input.recovery?.soreness??3,0,10);
    const pain=clamp(input.pain??input.recovery?.pain??0,0,10);
    const fatigue=clamp(input.fatigue??(100-mean([readiness,recovery])),0,100);
    const availableMinutes=Math.max(0,Number(input.availableMinutes??input.profile?.availableMinutes??60)||0);
    const goals=(Array.isArray(input.goals)?input.goals:input.goal?[input.goal]:[]).map(normalizeGoal).filter(goal=>goal.active);
    const events=(Array.isArray(input.events)?input.events:input.tournament?[input.tournament]:[]).map((event,index)=>normalizeEvent(event,index,date));
    const schedule=input.schedule||{};
    const training=input.training||{};
    const nutrition=input.nutrition||{};
    const work=input.work||{};
    const injuries=(Array.isArray(input.injuries)?input.injuries:[]).map((injury,index)=>({
      id:String(injury?.id||`injury-${index}`),area:String(injury?.area||injury?.name||'unspecified'),
      severity:clamp(injury?.severity??0,0,10),active:injury?.active!==false,restriction:String(injury?.restriction||'')
    })).filter(injury=>injury.active);
    const habits=input.habits||{};
    return {
      version:VERSION,date,performance,
      scores:{performance:clamp(performance.score??70),readiness,recovery,sleep:sleepScore,hydration:hydrationScore,nutrition:nutritionScore,mental,consistency:clamp(performance.components?.consistency??input.consistency??70)},
      strain:{stress,soreness,pain,fatigue,trainingLoad:clamp(training.load??training.trainingLoad??50),acuteLoad:Math.max(0,Number(training.acuteLoad)||0),chronicLoad:Math.max(0,Number(training.chronicLoad)||0)},
      capacity:{availableMinutes,equipment:Array.isArray(input.equipment)?input.equipment:[],location:String(input.location||'general'),energy:readiness},
      schedule:{shiftType:normalizeText(schedule.shiftType||work.shiftType),shiftHours:Math.max(0,Number(schedule.shiftHours??work.shiftHours)||0),travel:Boolean(schedule.travel),busyBlocks:normalizeTimeBlocks(schedule.busyBlocks||input.calendar||[])},
      nutrition:{calories:Number(nutrition.caloriesConsumed??nutrition.calories??0)||0,calorieTarget:Math.max(1,Number(nutrition.calorieTarget??nutrition.targets?.calories??2400)||2400),protein:Number(nutrition.proteinConsumed??nutrition.protein??0)||0,proteinTarget:Math.max(1,Number(nutrition.proteinTarget??nutrition.targets?.protein??180)||180),water:Number(nutrition.waterConsumed??input.hydration?.consumed??0)||0,waterTarget:Math.max(1,Number(nutrition.waterTarget??input.hydration?.target??96)||96)},
      training:{plannedType:normalizeText(training.plannedType||training.type||'strength'),plannedMinutes:Math.max(0,Number(training.plannedMinutes??training.durationMinutes??60)||0),daysSinceRest:Math.max(0,Number(training.daysSinceRest??2)||0),completed:Boolean(training.completed),lastSession:normalizeText(training.lastSession)},
      goals,events,injuries,habits,
      context:{weather:input.weather||null,notes:String(input.notes||''),sourceConfidence:clamp(performance.confidence??45)}
    };
  }

  function daysToDeadline(goal,date){
    if(!goal.deadline)return 999;
    return Math.max(0,Math.ceil((new Date(goal.deadline)-new Date(date))/86400000));
  }

  function goalAffinity(mission,goals=[]){
    if(!goals.length)return 50;
    const text=`${mission.id} ${mission.domain} ${mission.category}`;
    let best=0;
    goals.forEach(goal=>{
      let affinity=20;
      const type=goal.type;
      if(/fat|weight|cut|recomp|nutrition/.test(type)&&['fuel','meal-prep','strength','conditioning'].includes(mission.id))affinity=75;
      if(/strength|muscle|hypertrophy/.test(type)&&['strength','fuel','sleep','recover'].includes(mission.id))affinity=85;
      if(/golf/.test(type)&&['golf','taper','mobility','sleep','hydrate'].includes(mission.id))affinity=90;
      if(/softball/.test(type)&&['softball','power','taper','mobility','sleep','hydrate'].includes(mission.id))affinity=90;
      if(/spirit|bible|prayer|faith/.test(type)&&mission.id==='spiritual')affinity=95;
      if(/work|admin|career|promotion/.test(type)&&mission.id==='admin')affinity=90;
      if(text.includes(type))affinity=95;
      best=Math.max(best,affinity*(goal.priority/100));
    });
    return clamp(best||50);
  }

  function eventPressure(mission,events=[]){
    let score=0;
    events.forEach(event=>{
      if(event.daysAway>14)return;
      const relevant=(/golf/.test(event.type)&&['golf','taper','mobility','hydrate','sleep'].includes(mission.id))||(/softball/.test(event.type)&&['softball','power','taper','mobility','hydrate','sleep'].includes(mission.id));
      if(!relevant)return;
      const proximity=event.daysAway===0?100:event.daysAway===1?95:event.daysAway<=3?85:event.daysAway<=7?70:50;
      score=Math.max(score,proximity*(event.importance/100));
    });
    return clamp(score);
  }

  function recoveryNeed(mission,situation){
    const need=clamp(100-mean([situation.scores.readiness,situation.scores.recovery,situation.scores.sleep])+situation.strain.pain*5+situation.strain.soreness*2);
    if(['recover','sleep','mobility','rest','medical','hydrate','fuel'].includes(mission.id))return need;
    if(['strength','power','conditioning','softball'].includes(mission.id))return clamp(100-need);
    return 50;
  }

  function healthSafety(mission,situation){
    const risk=clamp(situation.strain.pain*10+situation.injuries.reduce((sum,item)=>sum+item.severity*4,0));
    if(mission.id==='medical')return risk;
    if(['recover','rest','mobility'].includes(mission.id))return clamp(risk*.8+20);
    if(['strength','power','conditioning','softball'].includes(mission.id))return clamp(100-risk);
    return 50;
  }

  function convenience(mission,situation){
    const minutes=mission.defaultMinutes;
    if(minutes===0)return 90;
    if(situation.capacity.availableMinutes>=minutes)return 90;
    if(situation.capacity.availableMinutes>=minutes*.6)return 65;
    return 25;
  }

  function consistencyNeed(mission,situation){
    const habit=situation.habits[mission.category]??situation.habits[mission.id];
    if(typeof habit==='boolean')return habit?25:85;
    if(Number.isFinite(Number(habit)))return clamp(100-Number(habit));
    return clamp(100-situation.scores.consistency+40);
  }

  function opportunity(mission,situation){
    const high=mean([situation.scores.readiness,situation.scores.recovery,situation.scores.sleep]);
    if(['strength','power','conditioning','golf','softball'].includes(mission.id))return clamp(high);
    if(['recover','sleep','rest'].includes(mission.id))return clamp(100-high);
    return 60;
  }

  function calculatePriorities(input={},options={}){
    const situation=input?.scores?input:assessSituation(input);
    const weights={...DEFAULT_WEIGHTS,...(options.weights||{})};
    const candidates=Object.values(MISSION_LIBRARY).map(mission=>{
      const factors={
        healthRisk:healthSafety(mission,situation),
        tournamentDeadline:eventPressure(mission,situation.events),
        recoveryNeed:recoveryNeed(mission,situation),
        goalAlignment:goalAffinity(mission,situation.goals),
        consistency:consistencyNeed(mission,situation),
        opportunity:opportunity(mission,situation),
        convenience:convenience(mission,situation),
        timeFit:convenience(mission,situation),
        workConstraint:situation.schedule.shiftHours>=12&&mission.defaultMinutes>45?35:70
      };
      let weighted=0,total=0;
      Object.entries(factors).forEach(([key,value])=>{const w=weights[key]||0;weighted+=value*w;total+=w;});
      let score=total?weighted/total:0;
      if(mission.id==='medical'&&situation.strain.pain<5&&!situation.injuries.some(i=>i.severity>=6))score*=.25;
      if(mission.id==='taper'&&!situation.events.some(e=>e.daysAway<=7))score*=.45;
      if(mission.id==='sleep'&&situation.scores.sleep>=80)score*=.7;
      if(mission.id==='hydrate'&&situation.scores.hydration>=85)score*=.7;
      if(mission.id==='fuel'&&situation.scores.nutrition>=85)score*=.7;
      if(mission.id===situation.training.plannedType)score+=5;
      score=clamp(score);
      return {...mission,score:Math.round(score),priority:priorityLabel(score),confidence:Math.round(clamp(50+situation.context.sourceConfidence*.35)),factors,reasons:factorReasons(factors,mission,situation)};
    });
    return sortByScore(candidates).map((item,index)=>({...item,rank:index+1}));
  }

  function factorReasons(factors,mission,situation){
    const reasons=[];
    if(factors.healthRisk>=75)reasons.push('Health and pain constraints materially affect this decision.');
    if(factors.tournamentDeadline>=65)reasons.push('Competition proximity increases this mission’s urgency.');
    if(factors.recoveryNeed>=75)reasons.push('Current readiness and recovery create a strong need for this action.');
    if(factors.goalAlignment>=75)reasons.push('This action strongly supports an active goal.');
    if(factors.opportunity>=80)reasons.push('Current performance capacity creates a high-value opportunity.');
    if(factors.convenience<45)reasons.push('Available time constrains execution.');
    if(situation.schedule.shiftHours>=12&&mission.defaultMinutes>45)reasons.push('A long work shift reduces practical capacity.');
    return reasons;
  }

  function evaluateRisks(input={}){
    const situation=input?.scores?input:assessSituation(input);
    const ratio=situation.strain.chronicLoad>0?situation.strain.acuteLoad/situation.strain.chronicLoad:null;
    const calorieRatio=situation.nutrition.calories/situation.nutrition.calorieTarget;
    const proteinRatio=situation.nutrition.protein/situation.nutrition.proteinTarget;
    const waterRatio=situation.nutrition.water/situation.nutrition.waterTarget;
    const risks=[
      risk('injury',clamp(situation.strain.pain*11+situation.strain.soreness*4+(ratio&&ratio>1.5?25:0)+situation.injuries.reduce((sum,i)=>sum+i.severity*5,0)),'Pain, soreness, injuries, and workload are combined.',['Stop painful activity','Use a recovery or medical plan','Reduce loading until symptoms improve']),
      risk('sleep-debt',clamp((100-situation.scores.sleep)*1.15+situation.schedule.shiftHours*.8),'Sleep score and work-duration strain are combined.',['Protect the next sleep window','Reduce optional late activity','Avoid using caffeine too close to sleep']),
      risk('dehydration',clamp((1-Math.min(waterRatio,1))*100+(100-situation.scores.hydration)*.45),'Water completion and hydration score are combined.',['Drink water now','Add electrolytes when sweating heavily','Spread intake across the day']),
      risk('under-fueling',clamp((1-Math.min(calorieRatio,1))*80+(1-Math.min(proteinRatio,1))*35),'Energy and protein intake are below target.',['Complete a protein-centered meal','Add carbohydrates around training','Do not pair hard training with a severe deficit']),
      risk('overtraining',clamp((ratio&&ratio>1?Math.min(50,(ratio-1)*100):0)+(100-situation.scores.recovery)*.5+situation.training.daysSinceRest*2),'Workload ratio, recovery, and rest frequency are combined.',['Reduce volume','Insert a rest or recovery day','Resume progression after recovery rebounds']),
      risk('burnout',clamp(situation.strain.stress*7+(100-situation.scores.mental)*.45+situation.schedule.shiftHours*1.2),'Stress, mental readiness, and work demands are combined.',['Reduce nonessential commitments','Choose a minimum effective session','Schedule decompression and sleep']),
      risk('performance-regression',clamp((100-situation.scores.performance)*.6+(100-situation.scores.consistency)*.4),'Current performance and consistency scores are combined.',['Restore the weakest daily input','Use one measurable priority','Review the weekly trend before adding volume'])
    ];
    return risks.sort((a,b)=>b.score-a.score);
  }

  function risk(id,score,reason,mitigations){
    const rounded=Math.round(clamp(score));
    return {id,score:rounded,probability:rounded,severity:riskLabel(rounded),confidence:Math.round(clamp(55+rounded*.35)),reason,mitigations};
  }

  function detectConflicts(situation,priorities,risks){
    const conflicts=[];
    const event=situation.events.slice().sort((a,b)=>a.daysAway-b.daysAway)[0];
    if(event&&event.daysAway<=1&&['strength','power','conditioning'].includes(situation.training.plannedType)){
      conflicts.push({id:'event-vs-heavy-training',severity:'high',between:[situation.training.plannedType,event.type||'competition'],resolution:'Replace heavy training with taper, mobility, and event-specific sharpening.'});
    }
    if(situation.scores.recovery<55&&['strength','power','conditioning'].includes(situation.training.plannedType)){
      conflicts.push({id:'recovery-vs-training',severity:'high',between:['recovery',situation.training.plannedType],resolution:'Reduce training volume and intensity or use active recovery.'});
    }
    if(situation.scores.sleep<55&&situation.training.plannedMinutes>=45){
      conflicts.push({id:'sleep-vs-volume',severity:'medium',between:['sleep',situation.training.plannedType],resolution:'Prioritize sleep and use a shorter minimum-effective session.'});
    }
    if(situation.nutrition.calories<situation.nutrition.calorieTarget*.65&&situation.scores.readiness>=70){
      conflicts.push({id:'fat-loss-vs-performance',severity:'medium',between:['energy deficit','performance'],resolution:'Increase protein and carbohydrates enough to protect training quality; resume the planned deficit after recovery.'});
    }
    if(situation.schedule.shiftHours>=12&&priorities[0]?.defaultMinutes>45){
      conflicts.push({id:'work-vs-duration',severity:'medium',between:['work schedule',priorities[0].id],resolution:'Use a compressed session or move the full session to the next viable window.'});
    }
    if(risks.find(item=>item.id==='injury'&&item.score>=60)){
      conflicts.push({id:'injury-vs-performance',severity:'critical',between:['injury risk','performance goal'],resolution:'Health protection overrides performance progression.'});
    }
    return conflicts;
  }

  function resolveConflicts(input={},prioritiesInput=null,risksInput=null){
    const situation=input?.scores?input:assessSituation(input);
    const priorities=prioritiesInput||calculatePriorities(situation);
    const risks=risksInput||evaluateRisks(situation);
    const conflicts=detectConflicts(situation,priorities,risks);
    let selected=priorities[0];
    if(conflicts.some(c=>c.severity==='critical'))selected=priorities.find(p=>p.id==='medical')||selected;
    else if(conflicts.some(c=>c.id==='event-vs-heavy-training'))selected=priorities.find(p=>p.id==='taper')||priorities.find(p=>p.id==='mobility')||selected;
    else if(conflicts.some(c=>c.id==='recovery-vs-training'))selected=priorities.find(p=>p.id==='recover')||priorities.find(p=>p.id==='rest')||selected;
    else if(conflicts.some(c=>c.id==='sleep-vs-volume')&&priorities.find(p=>p.id==='sleep')?.score>=selected.score-8)selected=priorities.find(p=>p.id==='sleep');
    return {selected,conflicts,overrides:conflicts.map(c=>c.resolution),resolved:conflicts.length===0||Boolean(selected)};
  }

  function selectMission(input={}){
    const situation=input?.scores?input:assessSituation(input);
    const priorities=calculatePriorities(situation);
    const risks=evaluateRisks(situation);
    const resolution=resolveConflicts(situation,priorities,risks);
    const primary=resolution.selected||priorities[0];
    const secondary=priorities.filter(item=>item.id!==primary.id).slice(0,3);
    return {
      id:`mission-${situation.date}-${primary.id}`,date:situation.date,
      primary:{...primary,objective:primary.title},secondary,
      priority:primary.priority,score:primary.score,confidence:primary.confidence,
      reasons:unique([...(primary.reasons||[]),...resolution.overrides]),conflicts:resolution.conflicts,
      status:primary.id==='medical'?'hold':primary.id==='recover'||primary.id==='rest'?'recovery':'execute'
    };
  }

  function action(id,title,domain,minutes,priority,details={}){
    return {id,title,domain,minutes:Math.max(0,Number(minutes)||0),priority,completed:false,...details};
  }

  function buildActionPlan(input={},missionInput=null){
    const situation=input?.scores?input:assessSituation(input);
    const mission=missionInput||selectMission(situation);
    const primary=mission.primary;
    const actions=[];
    if(primary.id==='medical')actions.push(action('stop-painful-activity','Stop painful or aggravating activity','recovery',0,100),action('assess-injury','Arrange appropriate medical assessment when warranted','recovery',15,98));
    if(['recover','rest','sleep'].includes(primary.id))actions.push(action('recovery-walk','Complete an easy recovery walk','recovery',20,90),action('mobility','Complete gentle mobility','recovery',15,85),action('sleep-window','Protect the next sleep window','recovery',0,95));
    if(primary.id==='strength')actions.push(action('strength-session','Complete the planned strength session','training',Math.min(situation.training.plannedMinutes||60,situation.capacity.availableMinutes||60),95,{intensity:situation.scores.readiness>=85?'high':'moderate'}));
    if(primary.id==='power')actions.push(action('power-session','Complete low-fatigue power and speed work','training',Math.min(45,situation.capacity.availableMinutes||45),95,{intensity:'high',volume:'low'}));
    if(primary.id==='conditioning')actions.push(action('conditioning-session','Complete the planned conditioning session','training',Math.min(40,situation.capacity.availableMinutes||40),95));
    if(primary.id==='golf')actions.push(action('golf-practice','Complete focused golf practice','sport',Math.min(45,situation.capacity.availableMinutes||45),95,{focus:'highest-priority skill'}));
    if(primary.id==='softball')actions.push(action('softball-practice','Complete focused softball skill work','sport',Math.min(45,situation.capacity.availableMinutes||45),95,{focus:'quality over fatigue'}));
    if(primary.id==='taper')actions.push(action('event-sharpen','Complete short event-specific sharpening','sport',25,95),action('avoid-fatigue','Avoid high-fatigue lower-body or throwing volume','recovery',0,90));
    if(primary.id==='hydrate')actions.push(action('water-now','Drink 24–32 oz of water','nutrition',5,95),action('hydration-plan','Schedule remaining water intake','nutrition',5,85));
    if(primary.id==='fuel')actions.push(action('recovery-meal','Eat a protein-centered meal with carbohydrates','nutrition',20,95));
    if(primary.id==='meal-prep')actions.push(action('meal-prep','Prepare the next 2–3 days of meals','nutrition',Math.min(45,situation.capacity.availableMinutes||45),95));
    if(primary.id==='mobility')actions.push(action('mobility-session','Complete full-body mobility and tissue care','recovery',Math.min(20,situation.capacity.availableMinutes||20),95));
    if(primary.id==='spiritual')actions.push(action('bible-prayer','Complete Bible study and prayer','spiritual',20,95));
    if(primary.id==='admin')actions.push(action('priority-admin','Complete the single highest-value administrative task','work',Math.min(30,situation.capacity.availableMinutes||30),95));
    if(situation.scores.hydration<75&&!actions.some(a=>a.id==='water-now'))actions.push(action('water-now','Drink 24 oz of water','nutrition',5,82));
    if(situation.scores.nutrition<70&&!actions.some(a=>a.id==='recovery-meal'))actions.push(action('protein-meal','Complete a protein-centered meal','nutrition',20,80));
    if(!situation.habits.spiritual)actions.push(action('bible-prayer','Complete Bible study and prayer','spiritual',20,65));
    actions.sort((a,b)=>b.priority-a.priority);
    return {missionId:mission.id,primaryObjective:primary.title,actions,minimumPlan:actions.slice(0,3),backupPlan:buildBackupPlan(primary,situation),estimatedMinutes:actions.reduce((sum,item)=>sum+item.minutes,0)};
  }

  function buildBackupPlan(primary,situation){
    if(primary.id==='strength')return ['Perform the first two compound movements only','Use 70–80% of planned volume','Finish with 10 minutes of mobility'];
    if(['golf','softball','power'].includes(primary.id))return ['Complete 15 minutes of quality skill work','Stop before fatigue changes mechanics','Finish with hydration and mobility'];
    if(['recover','rest','sleep'].includes(primary.id))return ['Take a 10-minute walk','Hydrate','Protect bedtime'];
    if(situation.capacity.availableMinutes<20)return ['Complete the single highest-priority action','Schedule the remaining work for the next available block'];
    return ['Complete the minimum plan','Defer optional actions without abandoning the primary objective'];
  }

  function parseClock(value){
    const match=String(value||'').match(/^(\d{1,2}):(\d{2})/);
    return match?Number(match[1])*60+Number(match[2]):null;
  }
  function formatClock(minutes){
    const value=((minutes%1440)+1440)%1440,h=Math.floor(value/60),m=value%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }

  function generateTimeline(input={},planInput=null,options={}){
    const situation=input?.scores?input:assessSituation(input);
    const plan=planInput||buildActionPlan(situation);
    let cursor=parseClock(options.startTime||'06:00');
    const end=parseClock(options.endTime||'22:00');
    const fixed=situation.schedule.busyBlocks.map(block=>({...block,startMin:parseClock(block.start),endMin:parseClock(block.end)})).filter(b=>b.startMin!=null&&b.endMin!=null).sort((a,b)=>a.startMin-b.startMin);
    const timeline=[];
    function nextAvailable(duration){
      let candidate=cursor;
      for(const block of fixed){
        if(candidate+duration<=block.startMin)break;
        if(candidate<block.endMin&&candidate+duration>block.startMin)candidate=block.endMin;
      }
      cursor=candidate+duration+10;
      return candidate;
    }
    fixed.forEach(block=>timeline.push({type:'fixed',title:block.title,start:formatClock(block.startMin),end:formatClock(block.endMin),domain:block.domain}));
    plan.actions.forEach(item=>{
      if(item.minutes<=0)return;
      const start=nextAvailable(item.minutes),finish=start+item.minutes;
      if(end!=null&&finish>end)return;
      timeline.push({type:'action',actionId:item.id,title:item.title,start:formatClock(start),end:formatClock(finish),domain:item.domain,priority:item.priority});
    });
    return timeline.sort((a,b)=>parseClock(a.start)-parseClock(b.start));
  }

  function explain(decision={}){
    const mission=decision.mission||decision;
    const lines=[];
    if(mission.primary)lines.push(`Primary decision: ${mission.primary.title}.`);
    (mission.reasons||[]).forEach(reason=>lines.push(reason));
    (mission.conflicts||[]).forEach(conflict=>lines.push(`Conflict resolved: ${conflict.resolution}`));
    if(decision.situation?.scores){
      const s=decision.situation.scores;
      lines.push(`Readiness ${Math.round(s.readiness)}, recovery ${Math.round(s.recovery)}, sleep ${Math.round(s.sleep)}, nutrition ${Math.round(s.nutrition)}, hydration ${Math.round(s.hydration)}.`);
    }
    const topRisk=decision.risks?.[0];
    if(topRisk&&topRisk.score>=35)lines.push(`Top risk: ${topRisk.id} at ${topRisk.score}/100.`);
    return {summary:lines[0]||'No decision available.',details:lines,confidence:mission.confidence||decision.confidence||0,confidenceLabel:confidenceLabel(mission.confidence||decision.confidence||0)};
  }

  function makeDecision(input={},options={}){
    const situation=assessSituation(input);
    const priorities=calculatePriorities(situation,options);
    const risks=evaluateRisks(situation);
    const resolution=resolveConflicts(situation,priorities,risks);
    const mission=selectMission(situation);
    const plan=buildActionPlan(situation,mission);
    const timeline=generateTimeline(situation,plan,options.timeline||{});
    const decision={
      version:VERSION,date:situation.date,situation,priorities,risks,resolution,mission,plan,timeline,
      decision:mission.primary.title,priority:mission.priority,confidence:mission.confidence,
      reasons:mission.reasons,actions:plan.actions,warnings:risks.filter(r=>r.score>=60),alternatives:mission.secondary,
      generatedAt:new Date().toISOString()
    };
    decision.explanation=explain(decision);
    return decision;
  }

  function dailyMission(input={},options={}){
    const decision=makeDecision(input,options);
    return {
      date:decision.date,title:"Today's Mission",primaryObjective:decision.mission.primary.title,
      secondaryObjectives:decision.mission.secondary.map(item=>item.title),
      trainingGoal:decision.plan.actions.find(a=>a.domain==='training'||a.domain==='sport')||null,
      nutritionGoal:decision.plan.actions.find(a=>a.domain==='nutrition')||null,
      recoveryGoal:decision.plan.actions.find(a=>a.domain==='recovery')||null,
      spiritualGoal:decision.plan.actions.find(a=>a.domain==='spiritual')||null,
      administrativeGoal:decision.plan.actions.find(a=>a.domain==='work')||null,
      topActions:decision.plan.minimumPlan,watchItems:decision.warnings,confidence:decision.confidence
    };
  }

  function weeklyPlanning(history=[]){
    const rows=(Array.isArray(history)?history:[]).slice(-7).map(day=>makeDecision(day));
    const missionCounts={};
    rows.forEach(row=>{const id=row.mission.primary.id;missionCounts[id]=(missionCounts[id]||0)+1;});
    const topRisks={};
    rows.forEach(row=>row.risks.filter(r=>r.score>=35).forEach(r=>{topRisks[r.id]=(topRisks[r.id]||[]).concat(r.score);}));
    return {
      version:VERSION,days:rows.length,averageConfidence:Math.round(mean(rows.map(r=>r.confidence))),
      dominantMission:Object.entries(missionCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]||null,
      missionDistribution:missionCounts,
      recurringRisks:Object.entries(topRisks).map(([id,scores])=>({id,average:Math.round(mean(scores)),occurrences:scores.length})).sort((a,b)=>b.average-a.average),
      priorities:rows.length?unique(rows.flatMap(r=>r.mission.secondary.slice(0,2).map(x=>x.title))).slice(0,5):[],
      recommendation:rows.length?'Keep one primary objective per day and correct the most frequent risk before adding workload.':'Log daily inputs to establish a decision baseline.'
    };
  }

  function monthlyReview(history=[]){
    const rows=(Array.isArray(history)?history:[]).slice(-31).map(day=>makeDecision(day));
    const primary={};rows.forEach(r=>{primary[r.mission.primary.id]=(primary[r.mission.primary.id]||0)+1;});
    const warnings=rows.flatMap(r=>r.warnings.map(w=>w.id));
    const warningCounts={};warnings.forEach(id=>warningCounts[id]=(warningCounts[id]||0)+1);
    return {
      version:VERSION,days:rows.length,averagePerformance:Math.round(mean(rows.map(r=>r.situation.scores.performance))),
      averageReadiness:Math.round(mean(rows.map(r=>r.situation.scores.readiness))),
      averageRecovery:Math.round(mean(rows.map(r=>r.situation.scores.recovery))),
      dominantDecision:Object.entries(primary).sort((a,b)=>b[1]-a[1])[0]?.[0]||null,
      frequentWarnings:Object.entries(warningCounts).sort((a,b)=>b[1]-a[1]).map(([id,count])=>({id,count})).slice(0,5),
      decisionConfidence:Math.round(mean(rows.map(r=>r.confidence))),
      note:rows.length?'Use the dominant decision and recurring warnings to adjust next month’s training, recovery, and scheduling assumptions.':'Insufficient history for a monthly review.'
    };
  }

  function fromAppState(state={},options={}){
    const performanceApi=root&&root.IronPerformance;
    let performance=options.performance;
    if(!performance&&performanceApi&&typeof performanceApi.fromAppState==='function'){
      try{performance=performanceApi.fromAppState(state,options.performanceOptions||{}).performance;}catch(_error){}
    }
    const date=isoDate(options.date),body=state.body?.[date]||{};
    return makeDecision({
      ...options,date,performance,
      sleep:{score:options.sleepScore,hours:body.sleep},
      hydration:{score:options.hydrationScore,consumed:body.water,target:options.waterTarget},
      nutrition:{...(options.nutrition||{}),calories:body.calories,protein:body.protein,water:body.water},
      training:{...(options.training||{}),completed:Boolean(state.workout?.done)},
      habits:{...(options.habits||{}),spiritual:Boolean(state.spiritual?.[date]?.done)}
    },options);
  }

  return Object.freeze({
    VERSION,DEFAULT_WEIGHTS,MISSION_LIBRARY,assessSituation,calculatePriorities,evaluateRisks,
    resolveConflicts,selectMission,buildActionPlan,generateTimeline,makeDecision,explain,
    dailyMission,weeklyPlanning,monthlyReview,fromAppState,priorityLabel,riskLabel,confidenceLabel
  });
});
