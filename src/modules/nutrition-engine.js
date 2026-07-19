class NutritionEngine {
  constructor({missionLogs=[],nutritionLogs=[],settings={},today=new Date()}) {
    this.missionLogs=missionLogs||[];
    this.nutritionLogs=nutritionLogs||[];
    this.settings=settings||{};
    this.today=today;
  }

  avg(values){
    const clean=values.filter(v=>Number.isFinite(Number(v))&&Number(v)!==0);
    return clean.length?clean.reduce((a,b)=>a+Number(b),0)/clean.length:0;
  }

  recentWeights(days=14){
    return this.missionLogs.slice(-days).map(x=>({date:x.date,weight:Number(x.weight)||0})).filter(x=>x.weight>0);
  }

  sevenDayAverage(){
    const weights=this.recentWeights(7).map(x=>x.weight);
    return this.avg(weights);
  }

  previousSevenDayAverage(){
    const weights=this.recentWeights(14).map(x=>x.weight);
    if(weights.length<8)return 0;
    return this.avg(weights.slice(0,7));
  }

  weeklyChange(){
    const current=this.sevenDayAverage();
    const previous=this.previousSevenDayAverage();
    return current&&previous?current-previous:0;
  }

  weeklyPercent(){
    const previous=this.previousSevenDayAverage();
    return previous?this.weeklyChange()/previous*100:0;
  }

  compliance(days=7){
    const recent=this.nutritionLogs.slice(-days);
    if(!recent.length)return 0;
    return Math.round(this.avg(recent.map(x=>{
      const meals=(Number(x.mealsCompleted)||0)/3*70;
      const water=Math.min(1,(Number(x.water)||0)/128)*20;
      const plan=x.onPlan?10:0;
      return meals+water+plan;
    })));
  }

  estimatedProtein(){
    const beef=Number(this.settings.beefOz||6);
    const meals=3;
    return Math.round(beef*meals*7);
  }

  estimatedCalories(){
    const beef=Number(this.settings.beefOz||6);
    const rice=Number(this.settings.riceCups||1);
    const broccoli=Number(this.settings.broccoliCups||1.5);
    const beefCalories=beef*70;
    const riceCalories=rice*205;
    const broccoliCalories=broccoli*30;
    return Math.round((beefCalories+riceCalories+broccoliCalories)*3);
  }

  hydrationTarget({shift="off",trainingMinutes=0,temperatureRisk=false}={}){
    let target=128;
    if(shift==="day"||shift==="night")target+=16;
    if(trainingMinutes>=90)target+=16;
    if(temperatureRisk)target+=16;
    return Math.min(176,target);
  }

  recommendation({readiness="GREEN",shift="off",trainingMinutes=0}={}){
    const change=this.weeklyChange();
    const pct=this.weeklyPercent();
    const compliance=this.compliance();
    const current=this.sevenDayAverage();

    const base={
      action:"Maintain portions",
      beefDelta:0,
      riceDelta:0,
      broccoliDelta:0,
      reason:"Insufficient trend data. Follow the current plan consistently."
    };

    if(!current||!this.previousSevenDayAverage())return base;

    if(compliance<75){
      return{
        action:"Improve compliance first",
        beefDelta:0,riceDelta:0,broccoliDelta:0,
        reason:`Nutrition compliance is ${compliance}%. Do not change portions until execution is consistent.`
      };
    }

    if(readiness==="RED"){
      return{
        action:"Protect recovery",
        beefDelta:0,riceDelta:0.25,broccoliDelta:0,
        reason:"Readiness is red. Do not create a larger deficit; add carbohydrate around recovery if appetite and digestion permit."
      };
    }

    if(pct<-1.0){
      return{
        action:"Increase performance fuel",
        beefDelta:0,riceDelta:0.25,broccoliDelta:0,
        reason:`Weight is falling about ${Math.abs(pct).toFixed(1)}% per week, which may threaten performance.`
      };
    }

    if(pct<-0.3){
      return{
        action:"Maintain portions",
        beefDelta:0,riceDelta:0,broccoliDelta:0,
        reason:`Weight is falling at a productive rate: ${Math.abs(change).toFixed(1)} lb per week.`
      };
    }

    if(pct<=0.2){
      return{
        action:"Small calorie reduction",
        beefDelta:0,riceDelta:-0.25,broccoliDelta:0.5,
        reason:`Weight trend is nearly flat despite ${compliance}% compliance. Reduce rice slightly and increase broccoli.`
      };
    }

    return{
      action:"Reduce energy intake",
      beefDelta:0,riceDelta:-0.25,broccoliDelta:0.5,
      reason:`Seven-day average increased ${change.toFixed(1)} lb. Make one small portion adjustment, not a crash diet.`
    };
  }

  safeguards({sleep=0,readiness="GREEN",weightChangePercent=0}={}){
    const alerts=[];
    if(sleep>0&&sleep<6)alerts.push({level:"critical",title:"Low sleep",text:"Do not aggressively reduce food after inadequate sleep."});
    if(readiness==="RED")alerts.push({level:"critical",title:"Recovery compromised",text:"Maintain protein and hydration; avoid extra restriction."});
    if(weightChangePercent<-1.0)alerts.push({level:"warning",title:"Loss rate too fast",text:"Increase carbohydrate slightly to preserve training quality."});
    if(!alerts.length)alerts.push({level:"good",title:"Nutrition guardrails clear",text:"Continue the current plan and reassess from weekly averages."});
    return alerts;
  }
}