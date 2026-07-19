class ProfessionalDashboardEngine {
  constructor({today=new Date(),shift="off",dayState={},missionScores={},readiness=0,water=0}) {
    this.today=today;
    this.shift=shift;
    this.dayState=dayState||{};
    this.missionScores=missionScores||{};
    this.readiness=Number(readiness)||0;
    this.water=Number(water)||0;
  }

  timelineTemplate(){
    const commonEnd=[
      {id:"mobility",label:"Mobility & Flexibility",detail:"Complete the prescribed recovery sequence.",category:"recovery"},
      {id:"review",label:"Evening Review",detail:"Record the win, lesson, tomorrow focus, and save today.",category:"mission"}
    ];

    if(this.shift==="day"){
      return[
        {id:"wake",time:"4:45 AM",label:"Wake & Hydrate",detail:"Water, medication as prescribed, and readiness check.",category:"recovery"},
        {id:"faith",time:"5:00 AM",label:"Faith Assignment",detail:"Podcast, Scripture takeaway, prayer, and application.",category:"mission"},
        {id:"meal1",time:"5:20 AM",label:"Meal 1",detail:"Complete the planned beef, rice, and broccoli meal.",category:"nutrition"},
        {id:"shift",time:"6:00 AM",label:"Day Shift",detail:"Execute work responsibilities and accumulate walking.",category:"mission"},
        {id:"meal2",time:"11:30 AM",label:"Meal 2",detail:"Complete the planned meal and hydration check.",category:"nutrition"},
        {id:"portable",time:"During Shift",label:"Portable Training",detail:"Workday cardio, strength circuit, and no-equipment skill work.",category:"strength"},
        {id:"meal3",time:"7:30 PM",label:"Meal 3",detail:"Post-shift recovery meal.",category:"nutrition"},
        {id:"mobility",time:"8:10 PM",label:"Mobility & Flexibility",detail:"Hips, calves, chest, shoulders, and breathing.",category:"recovery"},
        {id:"review",time:"8:35 PM",label:"Evening Review",detail:"Record today and prepare for sleep.",category:"mission"},
        {id:"sleep",time:"9:00 PM",label:"Sleep Window",detail:"Protect the longest practical sleep opportunity.",category:"recovery"}
      ];
    }

    if(this.shift==="night"){
      return[
        {id:"wake",time:"4:45 PM",label:"Wake & Hydrate",detail:"Water, medication as prescribed, and readiness check.",category:"recovery"},
        {id:"faith",time:"5:00 PM",label:"Faith Assignment",detail:"Podcast, Scripture takeaway, prayer, and application.",category:"mission"},
        {id:"meal1",time:"5:20 PM",label:"Meal 1",detail:"Complete the planned meal before shift.",category:"nutrition"},
        {id:"shift",time:"6:00 PM",label:"Night Shift",detail:"Execute work responsibilities and accumulate walking.",category:"mission"},
        {id:"meal2",time:"12:00 AM",label:"Meal 2",detail:"Complete the planned meal and hydration check.",category:"nutrition"},
        {id:"portable",time:"During Shift",label:"Portable Training",detail:"Workday cardio, strength circuit, and no-equipment skill work.",category:"strength"},
        {id:"meal3",time:"7:30 AM",label:"Meal 3",detail:"Post-shift recovery meal.",category:"nutrition"},
        {id:"mobility",time:"8:00 AM",label:"Mobility & Flexibility",detail:"Downshift before sleep.",category:"recovery"},
        {id:"review",time:"8:15 AM",label:"Evening Review",detail:"Record today and prepare the room for sleep.",category:"mission"},
        {id:"sleep",time:"8:30 AM",label:"Sleep Window",detail:"Dark, cool room and uninterrupted sleep opportunity.",category:"recovery"}
      ];
    }

    if(this.shift==="recovery"){
      return[
        {id:"faith",time:"Morning",label:"Faith Assignment",detail:"Podcast, reflection, and prayer.",category:"mission"},
        {id:"meal1",time:"After Waking",label:"Meal 1",detail:"Complete the planned meal.",category:"nutrition"},
        {id:"walk",time:"Midday",label:"Easy Walk",detail:"20–30 minutes only if it improves recovery.",category:"recovery"},
        {id:"mobility",time:"Afternoon",label:"Recovery Mobility",detail:"Complete the full recovery sequence.",category:"recovery"},
        {id:"meal2",time:"Afternoon",label:"Meal 2",detail:"Complete the planned meal.",category:"nutrition"},
        {id:"meal3",time:"Evening",label:"Meal 3",detail:"Complete the planned meal.",category:"nutrition"},
        {id:"review",time:"Evening",label:"Evening Review",detail:"Record recovery status and prepare for sleep.",category:"mission"}
      ];
    }

    if(this.shift==="tournament"){
      return[
        {id:"faith",time:"Pre-Event",label:"Faith & Composure",detail:"Prayer, gratitude, and event intention.",category:"mission"},
        {id:"meal1",time:"Pre-Event",label:"Familiar Meal",detail:"Protein, carbohydrate, and hydration.",category:"nutrition"},
        {id:"warmup",time:"T−60",label:"Progressive Warm-Up",detail:"Movement, arm care, and sport-specific preparation.",category:"strength"},
        {id:"competition",time:"Event",label:"Competition",detail:"Execute routine and conserve unnecessary energy.",category:"mission"},
        {id:"recovery",time:"Post-Event",label:"Post-Event Recovery",detail:"Hydrate, refuel, mobility, and pain check.",category:"recovery"},
        {id:"review",time:"Evening",label:"Event Review",detail:"Record performance, recovery, and lessons.",category:"mission"}
      ];
    }

    return[
      {id:"faith",time:"Morning",label:"Faith Assignment",detail:"Podcast, Scripture takeaway, prayer, and application.",category:"mission"},
      {id:"meal1",time:"Morning",label:"Meal 1",detail:"Complete the planned meal before training.",category:"nutrition"},
      {id:"strength",time:"Block 1",label:"Tactical Athlete",detail:"Complete today’s readiness-adjusted strength session.",category:"strength"},
      {id:"golf",time:"Block 2",label:"Golf Academy",detail:"Complete the current lesson and log contact.",category:"golf"},
      {id:"meal2",time:"Midday",label:"Meal 2",detail:"Complete the planned meal and hydration check.",category:"nutrition"},
      {id:"softball",time:"Block 3",label:"Softball Academy",detail:"Complete fielding, hitting, speed, or arm-care work.",category:"softball"},
      {id:"cardio",time:"Flexible",label:"Cardio / Walking",detail:"Complete scheduled Zone 2 or walking target.",category:"recovery"},
      {id:"meal3",time:"Evening",label:"Meal 3",detail:"Complete the planned recovery meal.",category:"nutrition"},
      ...commonEnd.map((x,i)=>({...x,time:i===0?"Evening":"Night"}))
    ];
  }

  completionFromDayState(id){
    const s=this.dayState;
    const direct={
      faith:Boolean(s.faithCompleted),
      golf:Boolean(s.golfCompleted),
      softball:Boolean(s.softballCompleted),
      meal1:Boolean(s.meal1Completed),
      meal2:Boolean(s.meal2Completed),
      meal3:Boolean(s.meal3Completed),
      review:Boolean(s.win||s.lesson||s.tomorrow)
    };
    return direct[id]||false;
  }

  timeline(savedChecks={}){
    return this.timelineTemplate().map(item=>({
      ...item,
      completed:savedChecks[item.id]??this.completionFromDayState(item.id)
    }));
  }

  nextTask(items){
    return items.find(x=>!x.completed)||null;
  }

  progress(items){
    if(!items.length)return 0;
    return Math.round(items.filter(x=>x.completed).length/items.length*100);
  }

  rings(timelineItems){
    const scores=this.missionScores;
    const missionProgress=this.progress(timelineItems);
    return[
      {key:"mission",label:"Mission",value:Math.max(Number(scores.mission)||0,missionProgress)},
      {key:"recovery",label:"Recovery",value:Number(scores.recovery)||this.readiness},
      {key:"strength",label:"Strength",value:Number(scores.strength)||0},
      {key:"golf",label:"Golf",value:Number(scores.golf)||0},
      {key:"softball",label:"Softball",value:Number(scores.softball)||0},
      {key:"nutrition",label:"Nutrition",value:Number(scores.nutrition)||0}
    ].map(x=>({...x,value:Math.max(0,Math.min(100,Math.round(x.value)))}));
  }
}