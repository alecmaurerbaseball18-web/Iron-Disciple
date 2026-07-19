class ShiftEngine {
  constructor({schedule={},today=new Date(),defaultShift="off"}){this.schedule=schedule;this.today=today;this.defaultShift=defaultShift}
  key(d){return d.toISOString().slice(0,10)}
  shiftFor(date=this.today){const v=this.schedule[this.key(date)];if(!v)return this.defaultShift;return typeof v==="string"?v:(v.shift||this.defaultShift)}
  missionTypeFor(date=this.today){const s=this.shiftFor(date);if(s==="day"||s==="night")return"workday";if(s==="recovery")return"recovery";if(s==="tournament")return"tournament";return"offday"}
  wakeTime(s=this.shiftFor()){return s==="day"?"4:45 AM":s==="night"?"4:45 PM":"Flexible"}
  targetSleepWindow(s=this.shiftFor()){return s==="day"?"9:00 PM–4:45 AM":s==="night"?"8:30 AM–4:45 PM":"7.5–9 hours"}
  missionTimeline(s=this.shiftFor()){
    if(s==="day")return[["4:45 AM","Wake, hydration, faith, readiness"],["5:05 AM","Meal 1 and work preparation"],["6:00 AM–7:00 PM","Shift mission and portable training"],["7:30 PM","Meal 3, mobility, decompression"],["9:00 PM","Sleep target"]];
    if(s==="night")return[["4:45 PM","Wake, hydration, faith, readiness"],["5:05 PM","Meal 1 and work preparation"],["6:00 PM–7:00 AM","Shift mission and portable training"],["7:30 AM","Meal 3, mobility, sleep preparation"],["8:30 AM","Sleep target"]];
    if(s==="recovery")return[["Morning","Faith, readiness, hydration"],["Midday","Easy walk and mobility"],["Afternoon","Meal prep and recovery"],["Evening","Stretching and early sleep"]];
    if(s==="tournament")return[["Pre-event","Faith, hydration, familiar meal"],["Warm-up","Progressive movement and sport work"],["Competition","Execute routine and conserve energy"],["Post-event","Hydration, protein/carbohydrate, mobility"]];
    return[["Morning","Faith, readiness, Meal 1"],["Training Block 1","Strength"],["Training Block 2","Golf"],["Training Block 3","Softball"],["Evening","Mobility, review, sleep preparation"]]
  }
  nutritionTiming(s=this.shiftFor()){
    if(s==="day")return[["Meal 1","5:05 AM","Before shift"],["Meal 2","11:30 AM","Mid-shift"],["Meal 3","7:30 PM","After shift"]];
    if(s==="night")return[["Meal 1","5:05 PM","Before shift"],["Meal 2","12:00 AM","Mid-shift"],["Meal 3","7:30 AM","After shift"]];
    return[["Meal 1","After waking","Before training"],["Meal 2","4–5 hours later","Between training blocks"],["Meal 3","Evening","Recovery meal"]]
  }
  trainingRules(s=this.shiftFor()){
    if(s==="day"||s==="night")return{maxMinutes:95,strength:"Portable circuit only",golf:"No-equipment rehearsal",softball:"No-equipment footwork or dry swings",cardio:"Zone 2 or accumulated walking",note:"Do not turn a workday into a full off-day training session."};
    if(s==="recovery")return{maxMinutes:60,strength:"Mobility and activation only",golf:"Slow rehearsal only",softball:"No hard throwing",cardio:"Easy walking only",note:"Finish the day feeling better than you started."};
    return{maxMinutes:180,strength:"Full prescription",golf:"Full academy assignment",softball:"Full academy assignment",cardio:"Scheduled conditioning",note:"Complete full training without adding unnecessary volume."}
  }
  nextShiftChange(days=14){const c=this.shiftFor(this.today);for(let i=1;i<=days;i++){const d=new Date(this.today);d.setDate(d.getDate()+i);const n=this.shiftFor(d);if(n!==c)return{date:d,from:c,to:n}}return null}
}