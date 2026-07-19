class WeeklyReviewEngine {
  constructor({
    missionLogs=[],
    exerciseLogs=[],
    golfLogs=[],
    softballLogs=[],
    nutritionLogs=[],
    today=new Date()
  }) {
    this.missionLogs=missionLogs||[];
    this.exerciseLogs=exerciseLogs||[];
    this.golfLogs=golfLogs||[];
    this.softballLogs=softballLogs||[];
    this.nutritionLogs=nutritionLogs||[];
    this.today=today;
  }

  avg(values){
    const clean=values.filter(v=>Number.isFinite(Number(v)));
    return clean.length?clean.reduce((a,b)=>a+Number(b),0)/clean.length:0;
  }

  weekStart(date=this.today){
    const d=new Date(date);
    d.setHours(12,0,0,0);
    const day=d.getDay();
    d.setDate(d.getDate()-day);
    return d;
  }

  key(date){return date.toISOString().slice(0,10)}

  logsInCurrentWeek(logs){
    const start=this.weekStart();
    const end=new Date(start); end.setDate(end.getDate()+7);
    return logs.filter(x=>{
      const d=new Date(`${x.date}T12:00:00`);
      return d>=start && d<end;
    });
  }

  missionSummary(){
    const logs=this.logsInCurrentWeek(this.missionLogs);
    const completed=logs.filter(x=>(x.ironScore||0)>=70).length;
    return{
      logged:logs.length,
      completed,
      avgIron:Math.round(this.avg(logs.map(x=>x.ironScore||0))),
      avgReadiness:Math.round(this.avg(logs.map(x=>x.readinessScore||0))),
      avgSleep:this.avg(logs.map(x=>x.sleep||0)),
      avgWater:Math.round(this.avg(logs.map(x=>x.water||0)))
    };
  }

  trainingSummary(){
    const logs=this.logsInCurrentWeek(this.exerciseLogs);
    const painful=logs.filter(x=>x.pain).length;
    const quality=logs.filter(x=>
      !x.pain &&
      Number(x.technique)>=8 &&
      Number(x.rpe)<=8 &&
      Number(x.setsDone)>=Number(x.setsPlanned)
    ).length;
    return{
      exercises:logs.length,
      quality,
      painful,
      avgRpe:this.avg(logs.map(x=>x.rpe||0)),
      avgTechnique:this.avg(logs.map(x=>x.technique||0))
    };
  }

  golfSummary(){
    const logs=this.logsInCurrentWeek(this.golfLogs);
    return{
      sessions:logs.length,
      completed:logs.filter(x=>x.completed).length,
      avgContact:Math.round(this.avg(logs.map(x=>x.contact||0))),
      avgConfidence:this.avg(logs.map(x=>x.confidence||0))
    };
  }

  softballSummary(){
    const logs=this.logsInCurrentWeek(this.softballLogs);
    return{
      sessions:logs.length,
      completed:logs.filter(x=>x.completed).length,
      avgConfidence:this.avg(logs.map(x=>x.confidence||0)),
      avgArmFatigue:this.avg(logs.map(x=>x.armFatigue||0)),
      avgShoulderPain:this.avg(logs.map(x=>x.shoulderPain||0))
    };
  }

  nutritionSummary(){
    const logs=this.logsInCurrentWeek(this.nutritionLogs);
    const meals=logs.reduce((sum,x)=>sum+(Number(x.mealsCompleted)||0),0);
    const possible=logs.length*3;
    return{
      days:logs.length,
      mealCompliance:possible?Math.round(meals/possible*100):0,
      onPlan:logs.length?Math.round(logs.filter(x=>x.onPlan).length/logs.length*100):0,
      avgHunger:this.avg(logs.map(x=>x.hunger||0))
    };
  }

  categoryScores(){
    const m=this.missionSummary();
    const t=this.trainingSummary();
    const g=this.golfSummary();
    const s=this.softballSummary();
    const n=this.nutritionSummary();

    return{
      execution:m.logged?Math.min(100,Math.round(m.avgIron*.7+(m.logged/7*100)*.3)):0,
      recovery:m.logged?Math.min(100,Math.round(
        Math.min(100,m.avgSleep/7.5*100)*.45+
        m.avgReadiness*.4+
        Math.min(100,m.avgWater/128*100)*.15
      )):0,
      strength:t.exercises?Math.max(0,Math.round(
        t.quality/t.exercises*60+
        Math.min(100,t.avgTechnique*10)*.25+
        Math.max(0,100-t.painful*25)*.15
      )):0,
      golf:g.sessions?Math.round(g.avgContact*.55+g.avgConfidence*10*.25+(g.completed/g.sessions*100)*.2):0,
      softball:s.sessions?Math.round(
        s.avgConfidence*10*.35+
        (s.completed/s.sessions*100)*.3+
        Math.max(0,100-s.avgArmFatigue*10-s.avgShoulderPain*8)*.35
      ):0,
      nutrition:n.days?Math.round(n.mealCompliance*.65+n.onPlan*.35):0
    };
  }

  grade(score){
    if(score>=90)return"A";
    if(score>=80)return"B";
    if(score>=70)return"C";
    if(score>=60)return"D";
    return"F";
  }

  overallScore(){
    const s=this.categoryScores();
    return Math.round(
      s.execution*.22+
      s.recovery*.22+
      s.strength*.16+
      s.golf*.13+
      s.softball*.15+
      s.nutrition*.12
    );
  }

  nextWeekPriorities(){
    const scores=this.categoryScores();
    const names={
      execution:"Daily execution",
      recovery:"Sleep and recovery",
      strength:"Strength quality",
      golf:"Golf contact",
      softball:"Softball readiness",
      nutrition:"Nutrition compliance"
    };
    const instructions={
      execution:"Complete the minimum mission daily and never miss twice.",
      recovery:"Protect sleep, hydration, easy mobility, and recovery days.",
      strength:"Repeat current loads with clean technique before progressing.",
      golf:"Remain on the current academy lesson and prioritize contact.",
      softball:"Protect the arm and complete the current skill progression.",
      nutrition:"Complete all three planned meals and avoid unplanned calories."
    };
    return Object.entries(scores)
      .sort((a,b)=>a[1]-b[1])
      .slice(0,3)
      .map(([key,score],index)=>({
        rank:index+1,
        key,
        title:names[key],
        score,
        instruction:instructions[key]
      }));
  }

  wins(){
    const s=this.categoryScores();
    return Object.entries(s)
      .filter(([,score])=>score>=80)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(([key,score])=>({key,score}));
  }

  warnings(){
    const warnings=[];
    const m=this.missionSummary();
    const t=this.trainingSummary();
    const s=this.softballSummary();

    if(m.avgSleep>0 && m.avgSleep<6.5){
      warnings.push("Weekly sleep average is below 6.5 hours.");
    }
    if(m.avgReadiness>0 && m.avgReadiness<75){
      warnings.push("Weekly readiness average is below 75.");
    }
    if(t.painful>0){
      warnings.push(`${t.painful} painful exercise entr${t.painful===1?"y was":"ies were"} logged.`);
    }
    if(s.avgArmFatigue>=6 || s.avgShoulderPain>=4){
      warnings.push("Arm recovery requires priority before hard throwing.");
    }
    return warnings;
  }

  review(){
    const score=this.overallScore();
    return{
      weekStart:this.weekStart(),
      score,
      grade:this.grade(score),
      categories:this.categoryScores(),
      mission:this.missionSummary(),
      training:this.trainingSummary(),
      golf:this.golfSummary(),
      softball:this.softballSummary(),
      nutrition:this.nutritionSummary(),
      priorities:this.nextWeekPriorities(),
      wins:this.wins(),
      warnings:this.warnings()
    };
  }
}