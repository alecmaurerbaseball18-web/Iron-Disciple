(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.TrainingPeriodization=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const VERSION='2.5.0';
  const dayMs=86400000;
  const iso=d=>new Date(d).toISOString().slice(0,10);
  const addDays=(date,n)=>{const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+n);return iso(d)};
  const daysBetween=(a,b)=>Math.ceil((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/dayMs);
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  const uid=p=>`${p}-${Math.random().toString(36).slice(2,9)}`;
  function phaseForWeek(index,total){
    const remaining=total-index;
    if(remaining<=1)return{key:'taper',name:'Tournament Taper',intensity:'moderate',volume:0.45,focus:'Freshness, movement quality, and confidence'};
    if(remaining<=3)return{key:'peak',name:'Performance Peak',intensity:'high',volume:0.65,focus:'Power, speed, and sport-specific readiness'};
    const ratio=index/Math.max(1,total);
    if(ratio<0.35)return{key:'foundation',name:'Foundation',intensity:'moderate',volume:0.85,focus:'Movement quality, work capacity, and base strength'};
    if(ratio<0.75)return{key:'build',name:'Strength & Capacity',intensity:'high',volume:1,focus:'Progressive strength, muscle retention, and conditioning'};
    return{key:'convert',name:'Athletic Conversion',intensity:'high',volume:0.8,focus:'Convert strength into usable speed, power, and durability'};
  }
  function weeklyPrescription(phase,availability=5){
    const days=clamp(availability,2,7);
    const base={foundation:['Lower Body Strength','Upper Body Strength','Recovery & Mobility'],build:['Lower Body Strength','Upper Body Strength','Tournament Prep Full Body'],convert:['Tournament Prep Full Body','Upper Body Strength','Recovery & Mobility'],peak:['Tournament Prep Full Body','Upper Body Strength','Recovery & Mobility'],taper:['Recovery & Mobility','Tournament Prep Full Body']};
    const sessions=[...(base[phase.key]||base.foundation)];
    if(days>=4&&phase.key!=='taper')sessions.push('Recovery & Mobility');
    if(days>=6&&['foundation','build'].includes(phase.key))sessions.push('Tournament Prep Full Body');
    return sessions.slice(0,Math.max(2,Math.min(days,sessions.length)));
  }
  function generateProgram({startDate,eventDate,eventName='Primary Tournament',availability=5,sport='Multi-sport'}={}){
    const start=startDate||iso(new Date());
    if(!eventDate||daysBetween(start,eventDate)<1)throw new Error('Choose a future tournament date.');
    const weeks=Math.max(1,Math.ceil(daysBetween(start,eventDate)/7));
    const blocks=[];
    for(let i=0;i<weeks;i++){
      const weekStart=addDays(start,i*7),phase=phaseForWeek(i,weeks);
      blocks.push({week:i+1,startDate:weekStart,endDate:addDays(weekStart,6),phase:phase.key,phaseName:phase.name,focus:phase.focus,intensity:phase.intensity,volumeMultiplier:phase.volume,sessions:weeklyPrescription(phase,availability)});
    }
    return{id:uid('program'),name:`${eventName} Preparation`,eventName,eventDate,sport,startDate:start,availability:clamp(availability,2,7),status:'draft',createdAt:new Date().toISOString(),weeks:blocks};
  }
  function adjustWeekForReadiness(week,{score=75,pain=0}={}){
    const next=JSON.parse(JSON.stringify(week));
    if(Number(pain)>=6){next.adjustment='Recovery only';next.sessions=['Recovery & Mobility'];next.volumeMultiplier=.35;return next;}
    if(Number(pain)>=3||Number(score)<45){next.adjustment='Reduce volume 30%';next.volumeMultiplier=Math.round(next.volumeMultiplier*.7*100)/100;next.sessions=next.sessions.slice(0,Math.max(2,next.sessions.length-1));return next;}
    if(Number(score)<65){next.adjustment='Hold intensity; reduce optional work';next.volumeMultiplier=Math.round(next.volumeMultiplier*.85*100)/100;return next;}
    next.adjustment='Proceed as planned';return next;
  }
  function materializeWeeks(program,templates,library,{weeks=4,fromDate}={}){
    const build=typeof TrainingAdvanced!=='undefined'?TrainingAdvanced.buildWorkoutFromTemplate:null;
    const start=fromDate||iso(new Date());
    const selected=(program?.weeks||[]).filter(w=>w.endDate>=start).slice(0,clamp(weeks,1,12));
    const output=[];const offsets=[0,2,4,5,6];
    selected.forEach(week=>week.sessions.forEach((name,i)=>{
      const template=(templates||[]).find(t=>t.name===name);if(!template)return;
      const date=addDays(week.startDate,offsets[i]??i);
      const workout=build?build(template,library,date):{id:uid('workout'),date,name:template.name,type:template.type,exercises:[]};
      workout.programId=program.id;workout.programWeek=week.week;workout.phase=week.phase;workout.periodization={volumeMultiplier:week.volumeMultiplier,focus:week.focus};output.push(workout);
    }));
    return output;
  }
  return{VERSION,addDays,daysBetween,phaseForWeek,weeklyPrescription,generateProgram,adjustWeekForReadiness,materializeWeeks};
});
