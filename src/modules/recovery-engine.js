(function(global){
  "use strict";

  class RecoveryEngine {
    constructor({state,events,storage,targetHydrationOz=128}={}){
      this.state=state;
      this.events=events;
      this.storage=storage;
      this.targetHydrationOz=targetHydrationOz;
    }

    normalize(input={}){
      return {
        sleepHours:Number(input.sleep)||0,
        energy:Number(input.energy)||0,
        stress:Number(input.stress)||0,
        soreness:Number(input.soreness)||0,
        shoulderPain:Number(input.shoulderPain)||0
      };
    }

    assess(input={},logs=[]){
      const values=this.normalize(input);
      let score=100;

      if(values.sleepHours>0&&values.sleepHours<5)score-=40;
      else if(values.sleepHours>=5&&values.sleepHours<6)score-=28;
      else if(values.sleepHours>=6&&values.sleepHours<6.5)score-=14;

      if(values.energy>0&&values.energy<=2)score-=35;
      else if(values.energy>=3&&values.energy<=4)score-=18;
      else if(values.energy===5)score-=8;

      if(values.stress>=8)score-=30;
      else if(values.stress>=5)score-=14;

      if(values.soreness>=8)score-=28;
      else if(values.soreness>=5)score-=14;

      if(values.shoulderPain>=6)score-=45;
      else if(values.shoulderPain>=3)score-=20;

      if((logs||[]).slice(-3).filter(x=>x.trainingMode==="Build").length>=2)score-=8;
      score=Math.max(0,Math.min(100,Math.round(score)));

      const triggers=[];
      if(values.sleepHours>0&&values.sleepHours<5)triggers.push("sleep under 5 hours");
      else if(values.sleepHours>0&&values.sleepHours<6.5)triggers.push("reduced sleep");
      if(values.energy>0&&values.energy<=2)triggers.push("very low energy");
      else if(values.energy>=3&&values.energy<=5)triggers.push("reduced energy");
      if(values.stress>=8)triggers.push("high stress");
      else if(values.stress>=5)triggers.push("moderate stress");
      if(values.soreness>=8)triggers.push("severe soreness");
      else if(values.soreness>=5)triggers.push("moderate soreness");
      if(values.shoulderPain>=6)triggers.push("significant shoulder pain");
      else if(values.shoulderPain>=3)triggers.push("shoulder pain");

      let level="GREEN",multiplier=1;
      if(values.shoulderPain>=6||score<60){level="RED";multiplier=0;}
      else if(values.shoulderPain>=3||score<80){level="YELLOW";multiplier=.8;}

      const result={...values,level,score,multiplier,triggers,recommendations:this.recommendations({...values,level,score})};
      this.state?.set("recovery",result,{source:"recovery:assess"});
      this.state?.set("readiness",{level,score,multiplier,triggers},{source:"recovery:assess"});
      this.events?.emit("recovery:updated",result);
      this.events?.emit("recovery:score-changed",{level,score,triggers});
      this.events?.emit("recovery:recommendations-updated",result.recommendations);
      return result;
    }

    recommendations(recovery){
      const out=[];
      if(recovery.level==="RED")out.push("Replace hard training with recovery work.","Protect the longest practical sleep opportunity.");
      else if(recovery.level==="YELLOW")out.push("Reduce fatigue-producing volume by about 20%.","Keep movement quality high and stop before form declines.");
      else out.push("Proceed with the planned mission without adding unnecessary volume.");
      if(recovery.sleepHours>0&&recovery.sleepHours<6.5)out.push("Prioritize sleep and avoid extra conditioning.");
      if(recovery.shoulderPain>=3)out.push("Keep shoulder work pain-free and avoid high-intensity throwing.");
      if(recovery.soreness>=5)out.push("Add easy mobility and reduce loading for sore muscle groups.");
      if(recovery.stress>=5)out.push("Use a shorter, clearly defined training session.");
      return out;
    }

    syncHydration(currentOz=0,targetOz=this.targetHydrationOz){
      const hydration={currentOz:Math.max(0,Number(currentOz)||0),targetOz:Math.max(1,Number(targetOz)||this.targetHydrationOz)};
      this.state?.set("hydration",hydration,{source:"recovery:hydration"});
      this.events?.emit("recovery:hydration-updated",hydration);
      return hydration;
    }

    throwingGuidance({shoulderPain=0,armFatigue=0,readinessLevel="GREEN"}={}){
      const shoulder=Number(shoulderPain)||0,fatigue=Number(armFatigue)||0;
      if(shoulder>=6||readinessLevel==="RED")return {level:"STOP",text:"No throwing. Complete pain-free arm care and recovery only.",className:"red-note"};
      if(shoulder>=3||fatigue>=6||readinessLevel==="YELLOW")return {level:"REDUCED",text:"Reduce throwing volume and intensity by 40%. No max-effort throws.",className:"yellow-note"};
      return {level:"FULL",text:"Complete the prescribed throwing progression with clean mechanics.",className:"green-note"};
    }

    renderReadiness(element,recovery,note=""){
      if(!element||!recovery)return;
      element.className=`readiness-note ${recovery.level.toLowerCase()}-note`;
      element.innerHTML=`<b>${recovery.level} — ${recovery.score}/100</b><br>${note}${recovery.triggers.length?`<br><small>Triggered by: ${recovery.triggers.join(", ")}.</small>`:"<br><small>Zeros are neutral. Entered values only change readiness when they cross a threshold.</small>"}`;
    }
  }

  const RecoveryModule={
    create(options){return new RecoveryEngine(options);},
    RecoveryEngine
  };
  global.RecoveryModule=RecoveryModule;
})(window);
