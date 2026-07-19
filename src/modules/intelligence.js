class IntelligenceEngine {
  constructor({missionLogs=[],exerciseLogs=[],golfLogs=[],softballLogs=[],today=new Date()}) {
    this.missionLogs=missionLogs;
    this.exerciseLogs=exerciseLogs;
    this.golfLogs=golfLogs;
    this.softballLogs=softballLogs;
    this.today=today;
  }

  avg(values){
    const clean=values.filter(v=>Number.isFinite(Number(v)));
    return clean.length?clean.reduce((a,b)=>a+Number(b),0)/clean.length:0;
  }

  recent(days=7){
    return this.missionLogs.slice(-days);
  }

  consecutiveTrainingDays(){
    let count=0;
    for(let i=this.missionLogs.length-1;i>=0;i--){
      const x=this.missionLogs[i];
      if(["Build","Maintain","Taper","Deload"].includes(x.trainingMode)) count++;
      else break;
    }
    return count;
  }

  recommendations(){
    const out=[];
    const recent=this.recent(7);
    const avgSleep=this.avg(recent.map(x=>x.sleep||0));
    const avgReadiness=this.avg(recent.map(x=>x.readinessScore||0));
    const avgIron=this.avg(recent.map(x=>x.ironScore||0));
    const trainingDays=this.consecutiveTrainingDays();
    const lastGolf=this.golfLogs.at(-1);
    const lastSoftball=this.softballLogs.at(-1);
    const recentExercise=this.exerciseLogs.slice(-12);

    if(avgSleep>0 && avgSleep<6.25){
      out.push({
        level:"critical",
        title:"Recovery debt",
        instruction:"Reduce training volume today and protect the longest practical sleep window.",
        reason:`Seven-day sleep average is ${avgSleep.toFixed(1)} hours.`
      });
    } else if(avgSleep>0 && avgSleep<7){
      out.push({
        level:"warning",
        title:"Sleep below target",
        instruction:"Maintain training quality but do not add extra sets or conditioning.",
        reason:`Seven-day sleep average is ${avgSleep.toFixed(1)} hours.`
      });
    }

    if(avgReadiness>0 && avgReadiness<70){
      out.push({
        level:"critical",
        title:"Readiness suppression",
        instruction:"Use a recovery or reduced-volume mission until readiness rises above 75.",
        reason:`Average readiness is ${Math.round(avgReadiness)}.`
      });
    }

    if(trainingDays>=4){
      out.push({
        level:"warning",
        title:"Accumulated workload",
        instruction:"Make the next non-workday a recovery emphasis day.",
        reason:`${trainingDays} consecutive training days are logged.`
      });
    }

    if(lastSoftball && (lastSoftball.armFatigue>=6 || lastSoftball.shoulderPain>=4)){
      out.push({
        level:"critical",
        title:"Arm protection",
        instruction:"No max-effort throwing. Use arm care, dry footwork, and hitting mechanics only.",
        reason:`Arm fatigue ${lastSoftball.armFatigue}/10; shoulder pain ${lastSoftball.shoulderPain}/10.`
      });
    }

    if(lastGolf && lastGolf.completed && lastGolf.contact<65){
      out.push({
        level:"warning",
        title:"Golf contact reset",
        instruction:"Return to half-swings, chest-start takeaway, and shaft-parallel checkpoints.",
        reason:`Last logged contact was ${lastGolf.contact}%.`
      });
    }

    const painful=recentExercise.filter(x=>x.pain);
    if(painful.length){
      const unique=[...new Set(painful.map(x=>x.exerciseId))];
      out.push({
        level:"critical",
        title:"Pain was logged",
        instruction:"Regress or remove painful movements until they can be completed pain-free.",
        reason:`Affected exercise entries: ${unique.length}.`
      });
    }

    if(avgIron>0 && avgIron<70){
      out.push({
        level:"info",
        title:"Execution gap",
        instruction:"Complete the minimum mission first: faith, readiness, training minimum, nutrition, and recovery.",
        reason:`Seven-day Iron Score average is ${Math.round(avgIron)}.`
      });
    }

    if(!out.length){
      out.push({
        level:"good",
        title:"Operation stable",
        instruction:"Continue the current progression. Do not add unnecessary volume.",
        reason:"No meaningful recovery, pain, or consistency warning is active."
      });
    }

    return out;
  }

  tomorrowPlan(){
    const recs=this.recommendations();
    const hasCritical=recs.some(x=>x.level==="critical");
    const hasWarning=recs.some(x=>x.level==="warning");

    if(hasCritical){
      return {
        status:"RECOVERY PRIORITY",
        strength:"Mobility and pain-free activation only",
        golf:"Slow-motion mechanics only",
        softball:"No max-effort throwing",
        cardio:"Easy walking if it improves recovery"
      };
    }

    if(hasWarning){
      return {
        status:"REDUCED VOLUME",
        strength:"Reduce sets by 20%",
        golf:"Keep quality reps; reduce balls by 20%",
        softball:"Moderate intensity and complete arm care",
        cardio:"Zone 2 only"
      };
    }

    return {
      status:"FULL MISSION",
      strength:"Complete prescribed progression",
      golf:"Complete current academy lesson",
      softball:"Complete current academy lesson",
      cardio:"Complete scheduled conditioning"
    };
  }

  missedTaskCarryover(dayState){
    const missed=[];
    if(!dayState)return missed;

    if(dayState.faithCompleted===false) missed.push("Faith assignment");
    if(dayState.golfCompleted===false) missed.push("Golf assignment");
    if(dayState.softballCompleted===false) missed.push("Softball assignment");

    const checks=dayState.checks||[];
    const incomplete=checks.filter(x=>!x).length;
    if(incomplete>0) missed.push(`${incomplete} mission checklist item${incomplete===1?"":"s"}`);

    return missed;
  }
}