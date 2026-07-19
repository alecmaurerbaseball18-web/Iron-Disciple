class CommandCenterEngine {
  constructor({missionLogs=[],exerciseLogs=[],golfLogs=[],softballLogs=[],nutritionLogs=[],throwingLogs=[],schedule={},today=new Date(),tournaments={}}) {
    Object.assign(this,{missionLogs,exerciseLogs,golfLogs,softballLogs,nutritionLogs,throwingLogs,schedule,today,tournaments});
  }
  avg(a){const v=a.filter(x=>Number.isFinite(Number(x)));return v.length?v.reduce((s,x)=>s+Number(x),0)/v.length:0}
  key(d){return d.toISOString().slice(0,10)}
  shift(){const r=this.schedule[this.key(this.today)]||"off";return({workday:"day",offday:"off"}[r]||r)}
  shiftLabel(){return({day:"Day Shift",night:"Night Shift",off:"Off Day",recovery:"Recovery",tournament:"Tournament"}[this.shift()]||"Off Day")}
  nextEvent(){
    const e=Object.entries(this.tournaments).map(([key,v])=>({key,...v,days:Math.max(0,Math.ceil((v.date-this.today)/86400000))})).sort((a,b)=>a.date-b.date);
    return e.find(x=>x.date>=this.today)||e.at(-1)||null;
  }
  readiness(){
    const r=this.missionLogs.slice(-7); if(!r.length)return 0;
    const sleep=Math.min(100,this.avg(r.map(x=>Math.min(1,(x.sleep||0)/7.5)*100)));
    const ready=this.avg(r.map(x=>x.readinessScore||0));
    const water=Math.min(100,this.avg(r.map(x=>Math.min(1,(x.water||0)/128)*100)));
    return Math.round(sleep*.35+ready*.5+water*.15);
  }
  weeklyGrade(){
    const r=this.missionLogs.slice(-7); if(!r.length)return{score:0,grade:"—"};
    const score=Math.round(this.avg(r.map(x=>x.ironScore||0)));
    return{score,grade:score>=90?"A":score>=80?"B":score>=70?"C":score>=60?"D":"F"};
  }
  scores(){
    const m=this.missionLogs.slice(-7),g=this.golfLogs.slice(-6),s=this.softballLogs.slice(-6),n=this.nutritionLogs.slice(-7),e=this.exerciseLogs.slice(-20);
    return{
      mission:Math.round(this.avg(m.map(x=>x.ironScore||0))),
      recovery:this.readiness(),
      strength:e.length?Math.round(this.avg(e.map(x=>(x.setsPlanned?Math.min(100,(x.setsDone||0)/x.setsPlanned*100):0)*.45+(x.technique||0)*10*.35+(x.pain?0:100)*.2))):0,
      golf:g.length?Math.round(this.avg(g.map(x=>(x.contact||0)*.6+(x.confidence||0)*4))):0,
      softball:s.length?Math.max(0,Math.round(this.avg(s.map(x=>(x.confidence||0)*10-(x.armFatigue||0)*4-(x.shoulderPain||0)*5)))):0,
      nutrition:n.length?Math.round(this.avg(n.map(x=>((x.mealsCompleted||0)/3*70)+(x.onPlan?30:0)))):0
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
    const out=[],r=this.missionLogs.slice(-7),g=this.golfLogs.at(-1),t=this.throwingLogs.at(-1),n=this.nutritionLogs.at(-1);
    const sleep=this.avg(r.map(x=>x.sleep||0)),ready=this.avg(r.map(x=>x.readinessScore||0));
    if(sleep>0&&sleep<6.5)out.push({level:"critical",title:"Sleep debt",text:`Seven-day average is ${sleep.toFixed(1)} hours.`});
    if(ready>0&&ready<75)out.push({level:"warning",title:"Readiness below target",text:`Average readiness is ${Math.round(ready)}.`});
    if(t&&(t.armFatigue>=6||t.shoulderPain>=4))out.push({level:"critical",title:"Throwing restriction",text:"No max-effort throwing until arm status improves."});
    if(g&&g.contact>0&&g.contact<65)out.push({level:"warning",title:"Golf contact regression",text:"Return to half-swings and checkpoint work."});
    if(n&&n.mealsCompleted<3)out.push({level:"info",title:"Meal compliance gap",text:"Complete the planned three-meal structure."});
    if(!out.length)out.push({level:"good",title:"Operation stable",text:"No critical issue is active."});
    return out;
  }
  summary(){
    const latest=this.missionLogs.at(-1)||{},grade=this.weeklyGrade(),event=this.nextEvent();
    return{
      shift:this.shiftLabel(),readiness:this.readiness(),ironScore:latest.ironScore||0,weight:latest.weight||0,sleep:latest.sleep||0,water:latest.water||0,
      weeklyGrade:grade,scores:this.scores(),priority:this.priority(),alerts:this.alerts(),nextEvent:event
    };
  }
}