(function(global){
"use strict";

const APP_KEY="ironDiscipleOS.v1";
const PREF_KEY="ironDiscipleOS.missionControl.v3";
const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
const percent=(done,total)=>total?Math.round(done/total*100):0;
const todayKey=()=>new Date().toISOString().slice(0,10);
const parseTime=value=>{
  const match=String(value||"").match(/^(\d{1,2}):(\d{2})$/);
  if(!match)return null;
  const date=new Date();date.setHours(Number(match[1]),Number(match[2]),0,0);return date;
};
const readJson=(key,fallback={})=>{try{return JSON.parse(localStorage.getItem(key)||"null")||fallback}catch{return fallback}};

function readiness(state){
  const body=state.body?.[todayKey()]||{};
  const goals=state.bodyGoals||{};
  const signals=[];
  if(Number(body.sleep)>0)signals.push(clamp(Number(body.sleep)/(Number(goals.sleep)||7.5)*100));
  if(Number(body.water)>0)signals.push(clamp(Number(body.water)/(Number(goals.water)||128)*100));
  if(Number(body.protein)>0)signals.push(clamp(Number(body.protein)/(Number(goals.protein)||200)*100));
  if(Number(body.steps)>0)signals.push(clamp(Number(body.steps)/(Number(goals.steps)||10000)*100));
  if(state.workout?.done)signals.push(100);
  if(!signals.length)return null;
  return Math.round(signals.reduce((sum,value)=>sum+value,0)/signals.length);
}

function nextAction(state,now=new Date()){
  const big=(state.bigThree||[]).find(item=>!item.done&&String(item.text||"").trim());
  if(big)return {title:big.text,reason:"This is one of today’s defining outcomes and has the highest execution priority.",view:"execute",type:"Big Three"};

  const blocks=(state.timeBlocks||[]).filter(item=>!item.done).map(item=>({...item,at:parseTime(item.time)}));
  const upcoming=blocks.filter(item=>item.at&&item.at>=now).sort((a,b)=>a.at-b.at)[0];
  if(upcoming)return {title:upcoming.title,reason:`Scheduled for ${upcoming.time}. ${upcoming.detail||"Protect the time block and begin on schedule."}`,view:"execute",type:"Schedule"};

  const priority={High:0,Medium:1,Low:2};
  const task=(state.tasks||[]).filter(item=>!item.done).sort((a,b)=>(priority[a.priority||"Medium"]-priority[b.priority||"Medium"])||String(a.due||"9999").localeCompare(String(b.due||"9999")))[0];
  if(task)return {title:task.text,reason:`Highest-priority open task${task.due?` due ${task.due}`:""}.`,view:"execute",type:"Task"};

  const goal=(state.goals||[]).filter(item=>clamp(item.progress)<100).sort((a,b)=>clamp(a.progress)-clamp(b.progress))[0];
  if(goal)return {title:goal.text,reason:`This active goal is only ${clamp(goal.progress)}% complete and needs a defined next action.`,view:"mission",type:"Goal"};

  return {title:"Complete the daily review",reason:"Planned work is complete. Capture the win, the lesson, and tomorrow’s first priority.",view:"execute",type:"Review"};
}

function goalRunway(state){
  return (state.goals||[])
    .filter(goal=>["Quarterly","Monthly"].includes(goal.horizon)&&clamp(goal.progress)<100)
    .sort((a,b)=>clamp(a.progress)-clamp(b.progress))
    .slice(0,3)
    .map(goal=>({id:goal.id,text:goal.text,horizon:goal.horizon,progress:clamp(goal.progress),pressure:clamp(goal.progress)<35?"risk":clamp(goal.progress)<70?"watch":"good"}));
}

function scheduleSignal(state,now=new Date()){
  const blocks=(state.timeBlocks||[]).map(item=>({...item,at:parseTime(item.time)})).filter(item=>item.at).sort((a,b)=>a.at-b.at);
  const current=blocks.filter(item=>item.at<=now).at(-1)||null;
  const next=blocks.find(item=>item.at>now&&!item.done)||null;
  const completed=blocks.filter(item=>item.done).length;
  return {current,next,completed,total:blocks.length,progress:percent(completed,blocks.length)};
}

function executionForecast(state,now=new Date()){
  const big=state.bigThree||[];
  const tasks=state.tasks||[];
  const blocks=state.timeBlocks||[];
  const weightedDone=big.filter(x=>x.done).length*3+tasks.filter(x=>x.done).length+blocks.filter(x=>x.done).length*2;
  const weightedTotal=Math.max(1,big.length*3+tasks.length+blocks.length*2);
  const completion=percent(weightedDone,weightedTotal);
  const start=new Date(now);start.setHours(6,0,0,0);
  const end=new Date(now);end.setHours(22,0,0,0);
  const elapsed=clamp((now-start)/(end-start)*100);
  const pace=elapsed?completion/elapsed:completion;
  const projected=clamp(Math.round(completion+(100-elapsed)*pace));
  const label=projected>=85?"On track":projected>=60?"Recoverable":"At risk";
  return {completion,elapsed:Math.round(elapsed),projected,label};
}

function blockerRadar(state,now=new Date(),score=readiness(state)){
  const blockers=[];
  const today=todayKey();
  const overdue=(state.tasks||[]).filter(item=>!item.done&&item.due&&String(item.due)<today);
  if(overdue.length)blockers.push({level:"high",title:`${overdue.length} overdue task${overdue.length===1?"":"s"}`,detail:"Clear or reschedule overdue commitments before adding more work.",view:"execute"});
  const missed=(state.timeBlocks||[]).filter(item=>!item.done&&parseTime(item.time)&&parseTime(item.time)<now);
  if(missed.length)blockers.push({level:"medium",title:`${missed.length} missed schedule block${missed.length===1?"":"s"}`,detail:"Reassign the work to a realistic block or consciously drop it.",view:"execute"});
  if(score!=null&&score<60)blockers.push({level:"high",title:"Low recovery capacity",detail:"Reduce nonessential volume and protect sleep, hydration, and nutrition.",view:"body"});
  const goal=goalRunway(state).find(item=>item.pressure==="risk");
  if(goal)blockers.push({level:"medium",title:`Goal runway: ${goal.text}`,detail:`${goal.horizon} progress is ${goal.progress}%. Define the next measurable action.`,view:"mission"});
  return blockers.slice(0,3);
}

function commandPlan(state,now=new Date()){
  const plan=[];
  const primary=nextAction(state,now);
  plan.push({...primary,rank:1});
  const openBig=(state.bigThree||[]).filter(item=>!item.done&&item.text&&item.text!==primary.title);
  const openTasks=(state.tasks||[]).filter(item=>!item.done&&item.text&&item.text!==primary.title);
  const upcoming=(state.timeBlocks||[]).filter(item=>!item.done&&item.title&&item.title!==primary.title&&parseTime(item.time)>=now).sort((a,b)=>parseTime(a.time)-parseTime(b.time));
  if(openBig[0])plan.push({rank:2,title:openBig[0].text,type:"Big Three",view:"execute",reason:"Second defining outcome for today."});
  else if(upcoming[0])plan.push({rank:2,title:upcoming[0].title,type:"Schedule",view:"execute",reason:`Protected block at ${upcoming[0].time}.`});
  else if(openTasks[0])plan.push({rank:2,title:openTasks[0].text,type:"Task",view:"execute",reason:"Next open execution item."});
  const candidates=[...openBig.slice(1).map(x=>({title:x.text,type:"Big Three",view:"execute",reason:"Complete the daily priority set."})),...upcoming.slice(1).map(x=>({title:x.title,type:"Schedule",view:"execute",reason:`Scheduled for ${x.time}.`})),...openTasks.slice(1).map(x=>({title:x.text,type:"Task",view:"execute",reason:"Keep the queue moving."}))];
  if(plan.length<3&&candidates[0])plan.push({...candidates[0],rank:3});
  if(plan.length<3)plan.push({rank:plan.length+1,title:"Complete the daily review",type:"Review",view:"execute",reason:"Close the loop and set tomorrow’s first move."});
  return plan.slice(0,3);
}

function momentum(state,now=new Date()){
  const score=readiness(state);
  const forecast=executionForecast(state,now);
  const schedule=scheduleSignal(state,now);
  const big=percent((state.bigThree||[]).filter(x=>x.done).length,Math.max(3,(state.bigThree||[]).length));
  const inputs=[forecast.completion,big,schedule.progress];
  if(score!=null)inputs.push(score);
  const value=Math.round(inputs.reduce((sum,item)=>sum+item,0)/inputs.length);
  return {value,label:value>=80?"Strong":value>=60?"Building":value>=40?"Unsteady":"Stalled"};
}

function briefing(state,now=new Date()){
  const score=readiness(state);
  const action=nextAction(state,now);
  const runway=goalRunway(state);
  const schedule=scheduleSignal(state,now);
  const execution=percent((state.bigThree||[]).filter(x=>x.done).length,Math.max(3,(state.bigThree||[]).length));
  const status=score==null?"Needs inputs":score>=80?"Ready":score>=60?"Controlled":"Recover";
  const forecast=executionForecast(state,now);
  const blockers=blockerRadar(state,now,score);
  const plan=commandPlan(state,now);
  const momentumSignal=momentum(state,now);
  return {version:"3.2.0",score,status,action,runway,schedule,execution,forecast,blockers,plan,momentum:momentumSignal,generatedAt:new Date().toISOString()};
}

function preferences(){return {...{showRunway:true,showSchedule:true},...readJson(PREF_KEY,{})}}
function savePreferences(value){localStorage.setItem(PREF_KEY,JSON.stringify({...preferences(),...value}));return preferences()}

const api={version:"3.2.0",APP_KEY,PREF_KEY,readState:()=>readJson(APP_KEY,{}),readiness,nextAction,goalRunway,scheduleSignal,executionForecast,blockerRadar,commandPlan,momentum,briefing,preferences,savePreferences};
global.IronMissionControl=api;
})(window);
