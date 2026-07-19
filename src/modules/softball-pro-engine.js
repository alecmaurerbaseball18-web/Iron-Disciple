class SoftballProEngine {
  constructor({academyLogs=[],fieldingLogs=[],throwingLogs=[],hittingLogs=[],speedLogs=[],armCareLogs=[],state={},today=new Date()}) {
    this.academyLogs=academyLogs; this.fieldingLogs=fieldingLogs; this.throwingLogs=throwingLogs;
    this.hittingLogs=hittingLogs; this.speedLogs=speedLogs; this.armCareLogs=armCareLogs;
    this.state=state; this.today=today;
  }
  avg(values){const v=values.filter(x=>Number.isFinite(Number(x)));return v.length?v.reduce((a,b)=>a+Number(b),0)/v.length:0}
  moduleScores(){
    const f=this.fieldingLogs.slice(-6),t=this.throwingLogs.slice(-6),h=this.hittingLogs.slice(-6),s=this.speedLogs.slice(-6),a=this.armCareLogs.slice(-6);
    return {
      fielding:f.length?Math.round(this.avg(f.map(x=>x.cleanPct||0))*.45+this.avg(f.map(x=>x.firstStepPct||0))*.3+this.avg(f.map(x=>x.completed?100:0))*.25):0,
      throwing:t.length?Math.round(this.avg(t.map(x=>x.accuracyPct||0))*.45+this.avg(t.map(x=>(x.velocityQuality||0)*10))*.25+this.avg(t.map(x=>Math.max(0,100-(x.armFatigue||0)*10-(x.shoulderPain||0)*10)))*.3):0,
      hitting:h.length?Math.round(this.avg(h.map(x=>x.hardContactPct||0))*.45+this.avg(h.map(x=>x.lineDrivePct||0))*.25+this.avg(h.map(x=>(x.confidence||0)*10))*.2+this.avg(h.map(x=>x.completed?100:0))*.1):0,
      speed:s.length?Math.round(this.avg(s.map(x=>x.reactionScore||0))*.4+this.avg(s.map(x=>x.firstStepScore||0))*.35+this.avg(s.map(x=>x.completed?100:0))*.25):0,
      armCare:a.length?Math.round(this.avg(a.map(x=>x.completed?100:0))*.5+this.avg(a.map(x=>Math.max(0,100-(x.shoulderPain||0)*10-(x.armFatigue||0)*8)))*.5):0
    };
  }
  weakestModule(){return Object.entries(this.moduleScores()).sort((a,b)=>a[1]-b[1])[0]}
  automaticPracticePlan({availableMinutes=60,readiness="GREEN",shoulderPain=0,armFatigue=0}={}){
    const weak=this.weakestModule()[0];
    let mult=readiness==="RED"?.45:readiness==="YELLOW"?.75:1;
    if(shoulderPain>=4||armFatigue>=7)mult=Math.min(mult,.5);
    const total=Math.max(20,Math.round(availableMinutes*mult));
    const allocations={
      fielding:{fielding:.45,throwing:.15,hitting:.15,speed:.15,armCare:.1},
      throwing:{throwing:.35,armCare:.25,fielding:.2,hitting:.1,speed:.1},
      hitting:{hitting:.45,fielding:.15,speed:.15,throwing:.1,armCare:.15},
      speed:{speed:.4,fielding:.25,hitting:.15,throwing:.1,armCare:.1},
      armCare:{armCare:.45,fielding:.2,hitting:.15,speed:.1,throwing:.1}
    };
    const map=allocations[weak]||allocations.fielding;
    return {focus:weak,totalMinutes:total,blocks:Object.entries(map).map(([module,pct])=>({module,minutes:Math.max(5,Math.round(total*pct)),assignment:this.assignment(module,{shoulderPain,armFatigue,readiness})}))};
  }
  assignment(module,{shoulderPain=0,armFatigue=0,readiness="GREEN"}={}){
    const noThrow=shoulderPain>=6||readiness==="RED";
    const reduced=shoulderPain>=3||armFatigue>=6||readiness==="YELLOW";
    const a={
      fielding:"Ready-position hold 5×20 sec; forehand 3×8; backhand 3×8; slow roller 3×8; mixed reaction 20 reps.",
      throwing:noThrow?"No throwing. Dry field-to-throw footwork 3×8 plus pain-free arm care.":reduced?"10 easy throws at 30–45 ft; 10 at 50–60%; no max-effort throws.":"10 throws at 30–45 ft; 15 at 60 ft; 10 game-footwork throws; 5 across-diamond throws.",
      hitting:"Stance hold 3×20 sec; load 3×10; 20 middle; 20 opposite gap; 20 pull gap; 10 situational swings.",
      speed:"6×10-yard starts; lateral shuffle to sprint 4/side; reaction break 10 reps; home-to-first 4 reps.",
      armCare:"Band pull-apart 2×15; face pull 2×15; external rotation 2×12/arm; scap push-up 2×10; forearm mobility."
    };
    return a[module]||a.fielding;
  }
  diagnostics({issue="",cleanPct=0,accuracyPct=0,hardContactPct=0,reactionScore=0,shoulderPain=0,armFatigue=0}={}){
    const out=[],q=issue.toLowerCase();
    if(q.includes("high throw"))out.push({area:"Throwing",title:"High Throws",cause:"Front side opens early or release is late.",drill:"Right-left footwork plus chest-high target throws.",cue:"Finish over the front leg."});
    if(q.includes("low throw"))out.push({area:"Throwing",title:"Low Throws",cause:"Release is early or elbow position drops.",drill:"Short-distance chest-target throwing.",cue:"Throw through the target’s chest."});
    if(q.includes("pull throw"))out.push({area:"Throwing",title:"Pulled Throws",cause:"Feet rush and the front side flies open.",drill:"Pause at separation and middle-target throws.",cue:"Feet first; chest follows."});
    if(q.includes("pop up"))out.push({area:"Hitting",title:"Pop-Ups",cause:"Posture rises or the barrel works under the ball.",drill:"Middle-line tee work and balanced finish.",cue:"Stay through the middle."});
    if(q.includes("roll over"))out.push({area:"Hitting",title:"Early Roll-Over",cause:"Hands rotate too early.",drill:"Opposite-field tee work.",cue:"Keep the barrel through the zone."});
    if(q.includes("slow first step"))out.push({area:"Defense",title:"Slow First Step",cause:"Weight is on the heels or a false step delays movement.",drill:"Directional first-step reaction calls.",cue:"Move on contact."});
    if(cleanPct>0&&cleanPct<75)out.push({area:"Defense",title:"Fielding Consistency",cause:"Route or glove presentation is inconsistent.",drill:"Slow controlled forehand/backhand reps.",cue:"Feet create the angle; glove receives out front."});
    if(accuracyPct>0&&accuracyPct<70)out.push({area:"Throwing",title:"Throwing Accuracy",cause:"Field-to-throw sequence is inconsistent.",drill:"Dry gather, replace, separate, throw progression.",cue:"Field, gather, replace, separate, finish."});
    if(hardContactPct>0&&hardContactPct<60)out.push({area:"Hitting",title:"Hard Contact Below Target",cause:"Load, timing, or barrel path is inconsistent.",drill:"20 middle swings at controlled effort.",cue:"Small load, controlled stride, stay through the ball."});
    if(reactionScore>0&&reactionScore<70)out.push({area:"Speed",title:"Reaction Speed",cause:"Ready position or visual reaction is late.",drill:"Random left/right reaction breaks.",cue:"Be moving on contact."});
    if(shoulderPain>=4||armFatigue>=6)out.push({area:"Arm Health",title:"Arm Load Too High",cause:"Current throwing stress exceeds recovery.",drill:"No hard throwing; arm care and dry footwork only.",cue:"Protect availability for competition."});
    if(!out.length)out.push({area:"Overall",title:"No Major Fault Detected",cause:"Current entries do not identify a dominant fault.",drill:"Continue the assigned module.",cue:"Quality reps before extra volume."});
    return out;
  }
}