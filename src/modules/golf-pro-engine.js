class GolfProEngine {
  constructor({
    swingLogs=[],
    shortGameLogs=[],
    wedgeLogs=[],
    driverLogs=[],
    roundLogs=[],
    state={},
    today=new Date()
  }) {
    this.swingLogs=swingLogs||[];
    this.shortGameLogs=shortGameLogs||[];
    this.wedgeLogs=wedgeLogs||[];
    this.driverLogs=driverLogs||[];
    this.roundLogs=roundLogs||[];
    this.state=state||{};
    this.today=today;
  }

  avg(values){
    const clean=values.filter(v=>Number.isFinite(Number(v)));
    return clean.length?clean.reduce((a,b)=>a+Number(b),0)/clean.length:0;
  }

  currentModule(){
    return this.state.currentModule||"swing";
  }

  moduleScores(){
    const swing=this.swingLogs.slice(-6);
    const short=this.shortGameLogs.slice(-6);
    const wedge=this.wedgeLogs.slice(-6);
    const driver=this.driverLogs.slice(-6);
    const rounds=this.roundLogs.slice(-5);

    return{
      swing:swing.length?Math.round(
        this.avg(swing.map(x=>x.contact||0))*.55+
        this.avg(swing.map(x=>(x.confidence||0)*10))*.25+
        this.avg(swing.map(x=>x.completed?100:0))*.2
      ):0,
      putting:short.length?Math.round(
        this.avg(short.map(x=>x.puttsMadePct||0))*.55+
        this.avg(short.map(x=>Math.max(0,100-(x.lagErrorFt||0)*10)))*.25+
        this.avg(short.map(x=>x.completed?100:0))*.2
      ):0,
      chipping:short.length?Math.round(
        this.avg(short.map(x=>x.upDownPct||0))*.6+
        this.avg(short.map(x=>x.contactPct||0))*.25+
        this.avg(short.map(x=>x.completed?100:0))*.15
      ):0,
      wedges:wedge.length?Math.round(
        this.avg(wedge.map(x=>Math.max(0,100-(x.avgMissYards||0)*8)))*.65+
        this.avg(wedge.map(x=>x.completed?100:0))*.2+
        this.avg(wedge.map(x=>(x.confidence||0)*10))*.15
      ):0,
      driver:driver.length?Math.round(
        this.avg(driver.map(x=>x.fairwayPct||0))*.5+
        this.avg(driver.map(x=>x.startLinePct||0))*.3+
        this.avg(driver.map(x=>(x.confidence||0)*10))*.2
      ):0,
      course:rounds.length?Math.round(
        this.avg(rounds.map(x=>Math.max(0,100-(x.penalties||0)*12)))*.25+
        this.avg(rounds.map(x=>Math.max(0,100-Math.max(0,(x.putts||0)-32)*5)))*.2+
        this.avg(rounds.map(x=>x.fairwayPct||0))*.2+
        this.avg(rounds.map(x=>x.girPct||0))*.2+
        this.avg(rounds.map(x=>(x.confidence||0)*10))*.15
      ):0
    };
  }

  weakestModule(){
    const scores=this.moduleScores();
    return Object.entries(scores).sort((a,b)=>a[1]-b[1])[0];
  }

  automaticPracticePlan({availableMinutes=60,readiness="GREEN"}={}){
    const scores=this.moduleScores();
    const weak=this.weakestModule()[0];
    const multiplier=readiness==="RED"?.5:readiness==="YELLOW"?.8:1;
    const minutes=Math.max(20,Math.round(availableMinutes*multiplier));

    const allocations={
      swing:{swing:.45,putting:.2,chipping:.15,wedges:.1,driver:.1},
      putting:{putting:.45,chipping:.2,swing:.15,wedges:.1,driver:.1},
      chipping:{chipping:.4,putting:.25,swing:.15,wedges:.1,driver:.1},
      wedges:{wedges:.4,putting:.2,chipping:.15,swing:.15,driver:.1},
      driver:{driver:.4,swing:.25,putting:.15,chipping:.1,wedges:.1},
      course:{course:.35,putting:.2,swing:.15,chipping:.1,wedges:.1,driver:.1}
    };
    const map=allocations[weak]||allocations.swing;

    return{
      focus:weak,
      scores,
      totalMinutes:minutes,
      blocks:Object.entries(map).map(([module,pct])=>({
        module,
        minutes:Math.max(5,Math.round(minutes*pct)),
        assignment:this.assignment(module)
      }))
    };
  }

  assignment(module){
    const assignments={
      swing:"Chest-start takeaway 3×10; shaft-parallel freeze 3×8; 20 contact balls at 50–70%.",
      putting:"20 gate putts from 4 ft; 12 clock putts; 15 lag putts from 20–40 ft.",
      chipping:"10 tight-lie chips; 10 rough chips; 10 landing-spot chips; 5 pressure up-and-downs.",
      wedges:"5 balls each at 20, 30, 40, 50, 60, 75, 90, and 105 yards. Record carry and miss.",
      driver:"10 start-line rehearsals; 15 controlled drives; 5 three-ball fairway tests.",
      course:"Simulated 9 holes using one ball, full routine, and penalty tracking."
    };
    return assignments[module]||assignments.swing;
  }

  faultDiagnosis({miss="",contact=0,fairwayPct=0,puttsMadePct=0,avgMissYards=0}={}){
    const issues=[];
    const lower=miss.toLowerCase();

    if(lower.includes("pull hook")){
      issues.push({area:"Swing",title:"Pull Hook",cause:"Face is closing relative to the path or the path is excessively in-to-out.",drill:"Half-swing hold-off drill and start-line gate.",cue:"Keep turning through the shot; do not throw the hands."});
    }
    if(lower.includes("over the top")||lower.includes("slice")){
      issues.push({area:"Swing",title:"Over-the-Top / Slice",cause:"Upper body starts the downswing before pressure shifts.",drill:"Pump drill and back-to-target transition.",cue:"Lead foot pressure first; arms fall."});
    }
    if(contact>0&&contact<70){
      issues.push({area:"Contact",title:"Contact Variability",cause:"Low-point or posture control is inconsistent.",drill:"Line drill and half-swing brush-the-grass work.",cue:"Stay in posture and strike the ground after the ball."});
    }
    if(fairwayPct>0&&fairwayPct<45){
      issues.push({area:"Driver",title:"Driver Dispersion",cause:"Start line and face control are not repeatable.",drill:"Three-ball fairway test with 80% speed.",cue:"Balanced speed and one committed target."});
    }
    if(puttsMadePct>0&&puttsMadePct<70){
      issues.push({area:"Putting",title:"Short-Putt Conversion",cause:"Face control or setup is inconsistent.",drill:"Gate drill from 4 feet, 20 makes.",cue:"Start line first; speed second."});
    }
    if(avgMissYards>8){
      issues.push({area:"Wedges",title:"Wedge Distance Control",cause:"Carry calibration is incomplete.",drill:"Five-ball ladder with one landing target.",cue:"Same tempo; change length, not effort."});
    }
    if(!issues.length){
      issues.push({area:"Overall",title:"No Major Fault Detected",cause:"Current inputs do not identify a dominant fault.",drill:"Continue the assigned academy lesson.",cue:"One target, one cue, balanced finish."});
    }
    return issues;
  }

  wedgeMatrix(){
    const distances=[20,30,40,50,60,75,90,105];
    const logs=this.wedgeLogs;
    return distances.map(distance=>{
      const matches=logs.filter(x=>Number(x.targetDistance)===distance);
      return{
        distance,
        carry:matches.length?this.avg(matches.map(x=>x.actualCarry||0)):0,
        miss:matches.length?this.avg(matches.map(x=>x.avgMissYards||0)):0,
        sessions:matches.length
      };
    });
  }

  roundAverages(){
    const rounds=this.roundLogs.slice(-10);
    return{
      rounds:rounds.length,
      score:this.avg(rounds.map(x=>x.score||0)),
      fairwayPct:this.avg(rounds.map(x=>x.fairwayPct||0)),
      girPct:this.avg(rounds.map(x=>x.girPct||0)),
      putts:this.avg(rounds.map(x=>x.putts||0)),
      penalties:this.avg(rounds.map(x=>x.penalties||0))
    };
  }
}