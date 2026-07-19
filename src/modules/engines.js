class MissionEngine {
  constructor({logs=[],schedule={},today,tournamentDates={}}){this.logs=logs;this.schedule=schedule;this.today=today;this.tournamentDates=tournamentDates}
  dateKey(d){return d.toISOString().slice(0,10)}
  type(override){
    if(override&&override!=="auto")return override;
    const k=this.dateKey(this.today);if(this.tournamentDates[k])return"tournament";if(this.schedule[k])return this.schedule[k];
    const base=new Date("2026-07-16T12:00:00"),n=Math.floor((this.today-base)/86400000),r=["offday","workday","workday","recovery","offday","workday","workday"];
    return r[((n%7)+7)%7]
  }
  readiness(i){
    // Zero means "not reported" or "no issue" and never lowers readiness.
    let s=100;
    if(i.sleep>0&&i.sleep<5)s-=40;
    else if(i.sleep>=5&&i.sleep<6)s-=28;
    else if(i.sleep>=6&&i.sleep<6.5)s-=14;

    if(i.energy>0&&i.energy<=2)s-=35;
    else if(i.energy>=3&&i.energy<=4)s-=18;
    else if(i.energy===5)s-=8;

    if(i.stress>=8)s-=30;
    else if(i.stress>=5)s-=14;

    if(i.soreness>=8)s-=28;
    else if(i.soreness>=5)s-=14;

    if(i.shoulderPain>=6)s-=45;
    else if(i.shoulderPain>=3)s-=20;

    if(this.logs.slice(-3).filter(x=>x.trainingMode==="Build").length>=2)s-=8;
    s=Math.max(0,Math.min(100,Math.round(s)));

    const triggers=[];
    if(i.sleep>0&&i.sleep<5)triggers.push("sleep under 5 hours");
    else if(i.sleep>0&&i.sleep<6.5)triggers.push("reduced sleep");
    if(i.energy>0&&i.energy<=2)triggers.push("very low energy");
    else if(i.energy>=3&&i.energy<=5)triggers.push("reduced energy");
    if(i.stress>=8)triggers.push("high stress");
    else if(i.stress>=5)triggers.push("moderate stress");
    if(i.soreness>=8)triggers.push("severe soreness");
    else if(i.soreness>=5)triggers.push("moderate soreness");
    if(i.shoulderPain>=6)triggers.push("significant shoulder pain");
    else if(i.shoulderPain>=3)triggers.push("shoulder pain");

    if(i.shoulderPain>=6||s<60)return{level:"RED",score:s,multiplier:0,triggers};
    if(i.shoulderPain>=3||s<80)return{level:"YELLOW",score:s,multiplier:.8,triggers};
    return{level:"GREEN",score:s,multiplier:1,triggers}
  }
  phase(){
    const d=Math.ceil((new Date("2026-10-11T12:00:00")-this.today)/86400000);
    if(d<=0)return"Competition";if(d<=14)return"Peak";if(d<=30)return"Performance";if(d<=60)return"Development";return"Foundation"
  }
  build({override,input}){
    let type=this.type(override),ready=this.readiness(input);if(ready.level==="RED"&&type!=="tournament")type="recovery";
    const template=MISSION_LIBRARY[type],phase=this.phase();let mult=ready.multiplier;
    if(phase==="Peak"&&type!=="tournament")mult*=.8;if(phase==="Competition")mult*=.7;
    const priorities=ready.level==="RED"?["Recovery","Faith"]:input.shoulderPain>=3?["Shoulder Health",type==="workday"?"Conditioning":"Golf Contact"]:type==="tournament"?["Competition","Recovery"]:type==="recovery"?["Recovery","Mobility"]:type==="offday"?["Strength","Golf Contact"]:["Conditioning","Movement Quality"];
    const adjustments=[];if(ready.level==="YELLOW")adjustments.push("Reduce lifting sets, golf balls, and softball volume by 20%.","Keep easy cardio and add five minutes of mobility.");
    if(ready.level==="RED")adjustments.push("No hard throwing, sprinting, or heavy band work.","Complete faith, nutrition, mobility, and sleep preparation.");
    if(input.shoulderPain>=3)adjustments.push("No high-intensity throwing. Keep shoulder work pain-free.");
    if(phase==="Peak")adjustments.push("Peak phase: prioritize precision and recovery over extra volume.");
    const note=ready.level==="GREEN"?`Cleared for the ${template.label.toLowerCase()} mission. Execute at full quality; do not add unnecessary volume.`:ready.level==="YELLOW"?"Maintain the mission at reduced volume without digging a recovery hole.":"Recovery takes priority. Protect the shoulder and rebuild readiness.";
    return{type,template,phase,readiness:ready,multiplier:mult,priorities,adjustments,note,estimatedMinutes:Math.max(30,Math.round((template.baseMinutes+35)*Math.max(mult,.55)))}
  }
}

class TacticalAthleteEngine {
  constructor(logs=[],bands=[],today=new Date()){this.logs=logs;this.bands=[...bands].sort((a,b)=>a.rank-b.rank);this.today=today}
  week(){const s=new Date("2026-07-16T12:00:00");return Math.max(1,Math.floor((this.today-s)/604800000)+1)}
  mode(phase,readiness){if(readiness==="RED")return"Recovery";if(this.week()%5===0)return"Deload";if(["Peak","Competition"].includes(phase))return"Taper";if(readiness==="YELLOW")return"Maintain";return"Build"}
  sets(base,phase,readiness){const m=this.mode(phase,readiness);if(m==="Recovery")return 0;if(m==="Deload")return Math.max(2,Math.ceil(base*.6));if(m==="Taper")return Math.max(2,Math.ceil(base*.7));if(m==="Maintain")return Math.max(2,Math.ceil(base*.8));return base}
  for(id){return this.logs.filter(x=>x.exerciseId===id).sort((a,b)=>a.date.localeCompare(b.date))}
  recommendation(id){
    const l=this.for(id);if(!l.length)return{status:"Start",text:"Establish a clean baseline with 1–2 reps in reserve."};
    const x=l.at(-1);if(x.pain)return{status:"Reduce",text:"Pain was logged. Reduce resistance or use an easier variation."};
    if(x.rpe>=9||x.technique<=6||x.setsDone<x.setsPlanned)return{status:"Maintain",text:"Repeat or slightly reduce until every set is clean."};
    const q=l.filter(v=>!v.pain&&v.rpe<=8&&v.technique>=8&&v.setsDone>=v.setsPlanned).slice(-2);
    if(q.length>=2){const n=this.bands.find(b=>b.rank>(x.bandRank||0));return n?{status:"Progress",text:`Advance to ${n.label} next session.`}:{status:"Progress",text:"Add reps, range, or tempo before more resistance."}}
    return{status:"Maintain",text:"Record one more quality session before increasing resistance."}
  }
  best(id){const l=this.for(id);return l.length?l.reduce((b,x)=>((x.bandRank||0)*1000+x.reps)>((b.bandRank||0)*1000+b.reps)?x:b):null}
}

class AcademyEngine {
  constructor(lessons,logs=[],state={},type="golf"){this.lessons=lessons;this.logs=logs;this.state=state;this.type=type}
  current(){return this.lessons.find(x=>x.id===(this.state.currentLesson||this.lessons[0].id))||this.lessons[0]}
  lessonLogs(id){return this.logs.filter(x=>x.lessonId===id).sort((a,b)=>a.date.localeCompare(b.date))}
  status(id){
    const lesson=this.lessons.find(x=>x.id===id),logs=this.lessonLogs(id);if(!logs.length)return{label:"Not Started",complete:false};
    const good=logs.filter(x=>this.type==="golf"?(x.completed&&x.contact>=lesson.success.contact&&x.confidence>=lesson.success.confidence):(x.completed&&x.confidence>=lesson.success.confidence&&x.armFatigue<=lesson.success.armFatigueMax&&x.shoulderPain<=3));
    return{label:good.length>=lesson.success.sessions?"Mastered":"In Progress",complete:good.length>=lesson.success.sessions}
  }
  recommendation(){
    const lesson=this.current(),s=this.status(lesson.id);if(!s.complete)return{lesson,action:"Continue"};
    const next=this.lessons[this.lessons.findIndex(x=>x.id===lesson.id)+1];return next?{lesson:next,action:"Advance"}:{lesson,action:"Maintain"}
  }
}

class DashboardEngine {
  constructor({mission=[],exercise=[],golf=[],softball=[]}){this.mission=mission;this.exercise=exercise;this.golf=golf;this.softball=softball}
  avg(a){const v=a.filter(x=>Number.isFinite(Number(x)));return v.length?v.reduce((s,x)=>s+Number(x),0)/v.length:0}
  recent(n=7){return this.mission.slice(-n)}
  scores(){
    const r=this.recent(),mission=Math.round(this.avg(r.map(x=>x.ironScore||0))),recovery=r.length?Math.round(this.avg(r.map(x=>Math.min(100,(x.sleep||0)/7.5*100)))*.4+this.avg(r.map(x=>x.readinessScore||0))*.4+this.avg(r.map(x=>Math.min(100,(x.water||0)/128*100)))*.2):0;
    const ex=this.exercise.slice(-20),strength=ex.length?Math.round(this.avg(ex.map(x=>x.setsPlanned?Math.min(100,(x.setsDone||0)/x.setsPlanned*100):0))*.45+this.avg(ex.map(x=>(x.technique||0)*10))*.35+this.avg(ex.map(x=>x.pain?0:100))*.2):0;
    const g=this.golf.slice(-6),golf=g.length?Math.round(this.avg(g.map(x=>x.contact||0))*.5+this.avg(g.map(x=>(x.confidence||0)*10))*.3+this.avg(g.map(x=>x.completed?100:0))*.2):0;
    const sb=this.softball.slice(-6),softball=sb.length?Math.round(this.avg(sb.map(x=>(x.confidence||0)*10))*.4+this.avg(sb.map(x=>x.completed?100:0))*.3+this.avg(sb.map(x=>Math.max(0,100-(x.armFatigue||0)*10-(x.shoulderPain||0)*8)))*.3):0;
    const faith=r.length?Math.round(this.avg(r.map(x=>x.faithCompleted?100:0))):0;
    return{mission,recovery,strength,golf,softball,faith}
  }
  readiness(){const s=this.scores();return Math.round(s.strength*.22+s.recovery*.23+s.golf*.18+s.softball*.22+s.mission*.15)}
  trend(a){const v=a.filter(x=>Number(x));if(v.length<2)return"—";const d=v.at(-1)-v[0];return Math.abs(d)<.25?"→":d>0?"↑":"↓"}
}
