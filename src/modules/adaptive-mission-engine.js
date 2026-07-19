class AdaptiveMissionEngine {
  constructor({readiness="GREEN",readinessScore=100,sleep=0,shoulderPain=0,soreness=0,stress=0,timeline=[]}) {
    Object.assign(this,{readiness,readinessScore,sleep,shoulderPain,soreness,stress,timeline});
  }
  riskLevel(){
    let p=0;
    if(this.readiness==="YELLOW")p+=2;if(this.readiness==="RED")p+=5;
    if(this.readinessScore<75)p+=2;if(this.readinessScore<60)p+=3;
    if(this.sleep>0&&this.sleep<6.5)p+=2;if(this.sleep>0&&this.sleep<5.5)p+=3;
    if(this.shoulderPain>=3)p+=2;if(this.shoulderPain>=6)p+=4;
    if(this.soreness>=6)p+=2;if(this.stress>=8)p+=2;
    return p>=8?"RED":p>=4?"YELLOW":"GREEN";
  }
  categoryRule(category){
    const risk=this.riskLevel();
    if(risk==="GREEN")return{action:"KEEP",note:null};
    if(risk==="YELLOW"){
      const r={
        strength:{action:"REDUCE",note:"Reduce sets by 20%; cap RPE at 8."},
        golf:{action:"REDUCE",note:"Reduce ball count by 20%; prioritize contact."},
        softball:{action:"REDUCE",note:this.shoulderPain>=3?"Dry footwork, hitting mechanics, and arm care only.":"Reduce reps by 30%; no max-effort throwing."},
        recovery:{action:"KEEP",note:"Keep easy walking, hydration, and mobility."},
        nutrition:{action:"KEEP",note:"Maintain planned portions and hydration."},
        mission:{action:"KEEP",note:"Complete faith, readiness, and review."}
      };return r[category]||r.mission;
    }
    const r={
      strength:{action:"REPLACE",note:"Replace with 15–20 minutes of mobility and activation."},
      golf:{action:"REPLACE",note:"Dry rehearsal or 20–30 slow contact reps only."},
      softball:{action:"REPLACE",note:"No throwing or sprinting. Arm care and dry footwork only."},
      recovery:{action:"PRIORITIZE",note:"Easy walking only if helpful; complete full mobility."},
      nutrition:{action:"PRIORITIZE",note:"Complete meals and hydration. Do not increase the deficit."},
      mission:{action:"PRIORITIZE",note:"Complete faith, check-in, and evening review."}
    };return r[category]||r.mission;
  }
  adjustedTimeline(){return this.timeline.map(x=>({...x,...this.categoryRule(x.category)}))}
  summary(){
    const all=this.adjustedTimeline(),active=all.filter(x=>!x.completed);
    const order={PRIORITIZE:0,KEEP:1,REDUCE:2,REPLACE:3};active.sort((a,b)=>(order[a.action]??9)-(order[b.action]??9));
    const deferred=all.filter(x=>!x.completed&&["REDUCE","REPLACE"].includes(x.action)&&["golf","softball","strength"].includes(x.category));
    const risk=this.riskLevel();
    return{
      risk,
      headline:risk==="GREEN"?"Full Mission Authorized":risk==="YELLOW"?"Reduced-Volume Mission":"Recovery-Priority Mission",
      instruction:risk==="GREEN"?"Complete the mission without adding volume.":risk==="YELLOW"?"Keep the mission, reduce fatigue-producing work, and prioritize quality.":"Replace hard training with recovery work and protect sleep.",
      plan:active,deferred,firstAction:active[0]||null
    };
  }
}