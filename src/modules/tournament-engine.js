class TournamentEngine {
  constructor({
    today=new Date(),
    events={},
    missionLogs=[],
    golfLogs=[],
    softballLogs=[],
    exerciseLogs=[]
  }) {
    this.today=today;
    this.events=events||{};
    this.missionLogs=missionLogs||[];
    this.golfLogs=golfLogs||[];
    this.softballLogs=softballLogs||[];
    this.exerciseLogs=exerciseLogs||[];
  }

  avg(values){
    const clean=values.filter(v=>Number.isFinite(Number(v)));
    return clean.length?clean.reduce((a,b)=>a+Number(b),0)/clean.length:0;
  }

  daysUntil(date){
    return Math.ceil((date-this.today)/86400000);
  }

  sortedEvents(){
    return Object.entries(this.events)
      .map(([key,event])=>({key,...event,days:this.daysUntil(event.date)}))
      .sort((a,b)=>a.date-b.date);
  }

  nextEvent(){
    return this.sortedEvents().find(x=>x.days>=0)||this.sortedEvents().at(-1)||null;
  }

  phase(){
    const event=this.nextEvent();
    if(!event)return"General Training";
    const d=event.days;
    if(d===0)return"Event Day";
    if(d<=2)return"Final Taper";
    if(d<=7)return"Peak Week";
    if(d<=14)return"Taper";
    if(d<=30)return"Performance";
    if(d<=60)return"Development";
    return"Foundation";
  }

  volumeMultiplier(){
    const phase=this.phase();
    const map={
      "Foundation":1,
      "Development":1,
      "Performance":0.9,
      "Taper":0.75,
      "Peak Week":0.6,
      "Final Taper":0.4,
      "Event Day":0
    };
    return map[phase]??1;
  }

  readinessScore(){
    const mission=this.missionLogs.slice(-7);
    const golf=this.golfLogs.slice(-5);
    const softball=this.softballLogs.slice(-5);
    const exercise=this.exerciseLogs.slice(-12);

    const readiness=this.avg(mission.map(x=>x.readinessScore||0));
    const sleep=Math.min(100,this.avg(mission.map(x=>Math.min(1,(x.sleep||0)/7.5)*100)));
    const hydration=Math.min(100,this.avg(mission.map(x=>Math.min(1,(x.water||0)/128)*100)));
    const golfScore=golf.length?this.avg(golf.map(x=>(x.contact||0)*0.7+(x.confidence||0)*3)):70;
    const softballScore=softball.length?this.avg(softball.map(x=>(x.confidence||0)*10-(x.armFatigue||0)*4-(x.shoulderPain||0)*5)):70;
    const painPenalty=exercise.filter(x=>x.pain).length*8;

    return Math.max(0,Math.min(100,Math.round(
      readiness*0.28+
      sleep*0.22+
      hydration*0.12+
      golfScore*0.16+
      softballScore*0.18+
      80*0.04-
      painPenalty
    )));
  }

  readinessLabel(){
    const score=this.readinessScore();
    if(score>=85)return"Competition Ready";
    if(score>=70)return"On Track";
    if(score>=55)return"Needs Recovery";
    return"Not Ready";
  }

  trainingPlan(){
    const phase=this.phase();
    const multiplier=this.volumeMultiplier();
    const event=this.nextEvent();

    const plans={
      "Foundation":{
        strength:"Build strength and movement quality.",
        golf:"Mechanics and contact volume.",
        softball:"Fielding, hitting, throwing progression.",
        recovery:"Standard recovery routine."
      },
      "Development":{
        strength:"Build strength and explosive qualities.",
        golf:"Increase skill volume without chasing speed.",
        softball:"Increase throwing and game-skill volume gradually.",
        recovery:"One dedicated recovery day each week."
      },
      "Performance":{
        strength:"Maintain strength; reduce unnecessary accessory volume.",
        golf:"More one-ball and target-based practice.",
        softball:"Game-speed fielding, hitting, and controlled throwing.",
        recovery:"Protect sleep and arm recovery."
      },
      "Taper":{
        strength:"Reduce sets by 25%; keep movement speed high.",
        golf:"Reduce balls; emphasize start line and routine.",
        softball:"Reduce total reps; maintain game-speed quality.",
        recovery:"Prioritize sleep, mobility, and hydration."
      },
      "Peak Week":{
        strength:"Two short sessions only; no soreness-producing work.",
        golf:"Short confidence sessions; no swing rebuild.",
        softball:"Short fielding and hitting tune-ups; protect the arm.",
        recovery:"Daily mobility, hydration, and full sleep windows."
      },
      "Final Taper":{
        strength:"Activation only.",
        golf:"20–30 quality balls or dry routine rehearsal.",
        softball:"Easy throws, light fielding, brief hitting.",
        recovery:"No fatigue. Stop while feeling sharp."
      },
      "Event Day":{
        strength:"None.",
        golf:"Competition warm-up only.",
        softball:"Competition warm-up only.",
        recovery:"Hydrate, fuel, and recover between events."
      }
    };

    return{
      phase,
      multiplier,
      event,
      ...plans[phase]
    };
  }

  eventDayTimeline(type){
    if(type==="golf"){
      return[
        ["T−180 min","Wake, hydrate, familiar meal"],
        ["T−90 min","Arrive, check in, light mobility"],
        ["T−60 min","Putting and short game"],
        ["T−35 min","Wedges and irons"],
        ["T−15 min","Driver and first-tee visualization"],
        ["Start","Commit to routine and target"],
        ["Post-round","Hydration, protein/carbohydrate, mobility"]
      ];
    }
    return[
      ["T−180 min","Wake, hydrate, familiar meal"],
      ["T−90 min","Arrive, equipment check, easy movement"],
      ["T−60 min","Dynamic warm-up and arm care"],
      ["T−40 min","Progressive throwing"],
      ["T−25 min","Fielding and hitting warm-up"],
      ["Start","Play under control; conserve unnecessary throws"],
      ["Post-game","Hydrate, refuel, shoulder and hip mobility"]
    ];
  }

  packingList(type){
    const common=[
      "Water and electrolytes",
      "Planned meals / snacks",
      "Medication and normal essentials",
      "Sunscreen",
      "Change of shirt and socks",
      "Mobility band",
      "Towel"
    ];
    if(type==="golf"){
      return[
        ...common,
        "Golf clubs",
        "Golf balls",
        "Tees",
        "Glove",
        "Rangefinder",
        "Ball marker and divot tool",
        "Rain gear"
      ];
    }
    return[
      ...common,
      "Glove",
      "Bat",
      "Cleats",
      "Batting gloves",
      "Protective equipment",
      "Extra laces",
      "Arm-care bands"
    ];
  }

  eventChecklist(type){
    if(type==="golf"){
      return[
        "Confirm tee time and travel time",
        "Charge rangefinder / phone",
        "Review first three-hole strategy",
        "Set one swing cue only",
        "Hydrate before arrival",
        "Complete full warm-up",
        "Record score, fairways, greens, penalties, and putts"
      ];
    }
    return[
      "Confirm game time and travel time",
      "Inspect glove, bat, and cleats",
      "Complete arm readiness check",
      "Set defensive and hitting cues",
      "Hydrate before arrival",
      "Complete progressive throwing warm-up",
      "Record arm fatigue after each game"
    ];
  }

  recoveryPlan(type){
    return[
      "Rehydrate until urine returns to pale yellow",
      "Eat a familiar protein-and-carbohydrate meal",
      "Complete 10–15 minutes of easy mobility",
      type==="softball"?"Complete pain-free shoulder and forearm care":"Walk 10–20 minutes if it improves stiffness",
      "Log soreness, shoulder pain, and energy",
      "Prioritize the next full sleep window",
      "Use recovery-only training the following day if readiness is Yellow or Red"
    ];
  }
}