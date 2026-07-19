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

(function(global){
  "use strict";

  const LABELS={
    day:"Day Shift",
    night:"Night Shift",
    off:"Off Day",
    recovery:"Recovery",
    tournament:"Tournament"
  };

  function normalizeSchedule(schedule={}){
    const mapped={};
    Object.entries(schedule||{}).forEach(([date,value])=>{
      if(["day","night","off","recovery","tournament"].includes(value))mapped[date]=value;
      else if(value==="workday")mapped[date]="day";
      else if(value==="offday")mapped[date]="off";
      else mapped[date]=value;
    });
    return mapped;
  }

  function label(value){return LABELS[value]||"Off Day"}

  function escapeHtml(value){
    return String(value??"").replace(/[&<>"']/g,char=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[char]));
  }

  const IronShift={
    version:"3.0.0-alpha.11",
    normalizeSchedule,
    label,

    create({schedule={},today=new Date(),defaultShift="off"}={}){
      return new ShiftEngine({
        schedule:normalizeSchedule(schedule),
        today,
        defaultShift
      });
    },

    summarize(config={}){
      const engine=this.create(config);
      const shift=engine.shiftFor(config.today);
      const rules=engine.trainingRules(shift);
      const summary={
        shift,
        label:label(shift),
        wakeTime:engine.wakeTime(shift),
        sleepWindow:engine.targetSleepWindow(shift),
        rules,
        timeline:engine.missionTimeline(shift),
        meals:engine.nutritionTiming(shift),
        nextChange:engine.nextShiftChange(config.previewDays||14),
        generatedAt:new Date().toISOString()
      };
      global.AppState?.set("shift.current",summary,{source:config.source||"shift:summarize"});
      global.IronEvents?.emit("shift:updated",summary);
      return {engine,summary};
    },

    render(config={},elements={}){
      const {engine,summary}=this.summarize({...config,source:config.source||"shift:render"});
      if(elements.title)elements.title.textContent=summary.label;
      if(elements.description)elements.description.textContent=summary.rules.note;
      if(elements.wake)elements.wake.textContent=summary.wakeTime;
      if(elements.sleep)elements.sleep.textContent=summary.sleepWindow;
      if(elements.maxTraining)elements.maxTraining.textContent=`${summary.rules.maxMinutes} min`;
      if(elements.nextChange){
        elements.nextChange.textContent=summary.nextChange
          ? `${summary.nextChange.date.toLocaleDateString("en-US",{month:"short",day:"numeric"})}: ${label(summary.nextChange.to)}`
          : `No change in ${config.previewDays||14} days`;
      }
      if(elements.timeline){
        elements.timeline.innerHTML=summary.timeline.map((item,index)=>
          `<div><span>${index+1}</span><p><b>${escapeHtml(item[0])}</b><br>${escapeHtml(item[1])}</p></div>`
        ).join("");
      }
      if(elements.meals){
        elements.meals.innerHTML=summary.meals.map(item=>
          `<div class="meal-row"><div><b>${escapeHtml(item[0])}</b><br><small>${escapeHtml(item[2])}</small></div><strong>${escapeHtml(item[1])}</strong></div>`
        ).join("");
      }
      if(elements.trainingRules){
        const rules=summary.rules;
        elements.trainingRules.innerHTML=
          `<div class="rule-grid">`+
          `<div><span>Strength</span><strong>${escapeHtml(rules.strength)}</strong></div>`+
          `<div><span>Golf</span><strong>${escapeHtml(rules.golf)}</strong></div>`+
          `<div><span>Softball</span><strong>${escapeHtml(rules.softball)}</strong></div>`+
          `<div><span>Cardio</span><strong>${escapeHtml(rules.cardio)}</strong></div>`+
          `</div><p class="commander-note">${escapeHtml(rules.note)}</p>`;
      }
      if(elements.preview){
        const rows=[];
        for(let i=0;i<(config.previewDays||14);i++){
          const date=new Date(config.today);
          date.setDate(date.getDate()+i);
          const shift=engine.shiftFor(date);
          rows.push(
            `<div class="shift-row"><div><b>${date.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</b></div>`+
            `<span class="shift-badge ${escapeHtml(shift)}">${escapeHtml(label(shift))}</span></div>`
          );
        }
        elements.preview.innerHTML=rows.join("");
      }
      global.IronEvents?.emit("shift:rendered",summary);
      return summary;
    },

    ShiftEngine
  };

  global.IronShift=IronShift;
})(window);
