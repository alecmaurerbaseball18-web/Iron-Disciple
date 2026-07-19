(function(global){
"use strict";
function buildRecommendations(context={}){
  const out=[],r=context.readiness||{},m=context.mission||{},s=context.shift||{},
        n=context.nutrition||{},w=context.workout||{};
  if((r.score??100)<60)out.push({id:"recovery-first",category:"recovery",priority:"high",title:"Protect recovery",detail:"Replace hard training with mobility, hydration, and sleep protection."});
  else if((r.score??100)<75)out.push({id:"reduce-volume",category:"training",priority:"high",title:"Reduce training volume",detail:"Keep quality work, but reduce fatigue-producing sets and repetitions."});
  if(Number(r.shoulderPain||0)>=3)out.push({id:"protect-shoulder",category:"softball",priority:"high",title:"Protect the throwing shoulder",detail:"Avoid max-effort throwing and complete arm-care work."});
  if(s.shift==="night")out.push({id:"night-shift-sleep",category:"recovery",priority:"high",title:"Protect post-shift sleep",detail:"Do not add training after the shift."});
  if((n.hydrationPercent??100)<75)out.push({id:"hydration-gap",category:"nutrition",priority:"medium",title:"Close the hydration gap",detail:"Prioritize water before adding more training volume."});
  if(m.firstAction)out.push({id:"mission-first-action",category:"mission",priority:"high",title:"Execute the next mission task",detail:m.firstAction.label||"Complete the next priority."});
  if(w.activeExercise)out.push({id:"resume-workout",category:"strength",priority:"medium",title:"Resume active workout",detail:w.activeExercise.name||"Continue the current exercise."});
  if(!out.length)out.push({id:"maintain-plan",category:"mission",priority:"medium",title:"Maintain the plan",detail:"No major constraints detected. Complete the scheduled mission without adding volume."});
  return out;
}
global.IronIntelligenceRecommendations={buildRecommendations};
})(window);
