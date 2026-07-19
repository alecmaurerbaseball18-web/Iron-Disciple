(function(global){
"use strict";
const priorityOrder={high:0,medium:1,low:2};
function buildContext(overrides={}){
  const s=global.AppState;
  return {
    readiness:{
      score:s?.get("readiness.score",100),
      level:s?.get("readiness.level","GREEN"),
      shoulderPain:s?.get("recovery.shoulderPain",0),
      soreness:s?.get("recovery.soreness",0),
      stress:s?.get("recovery.stress",0),
      sleep:s?.get("recovery.sleep",0)
    },
    mission:s?.get("mission.adaptive",{})||{},
    shift:s?.get("shift.current",{})||{},
    nutrition:s?.get("nutrition.summary",{})||{},
    workout:{
      activeExercise:s?.get("workout.activeExercise",null),
      entries:s?.get("workout.entries",[])||[]
    },
    command:s?.get("command.summary",{})||{},
    professional:s?.get("professional.summary",{})||{},
    ...overrides
  };
}
const IronIntelligence={
  version:"3.0.0-alpha.12",
  buildContext,
  evaluate(overrides={},metadata={}){
    const context=buildContext(overrides);
    const readinessScore=global.IronIntelligenceScoring.scoreReadiness({
      readinessScore:context.readiness.score,
      sleep:context.readiness.sleep,
      stress:context.readiness.stress,
      soreness:context.readiness.soreness,
      shoulderPain:context.readiness.shoulderPain
    });
    const recommendations=[...global.IronIntelligenceRecommendations.buildRecommendations(context)]
      .sort((a,b)=>(priorityOrder[a.priority]??9)-(priorityOrder[b.priority]??9));
    const priorities=recommendations.slice(0,3);
    const summary={
      readinessScore,
      status:readinessScore>=75?"GREEN":readinessScore>=60?"YELLOW":"RED",
      recommendationCount:recommendations.length,
      topPriority:priorities[0]||null,
      generatedAt:new Date().toISOString()
    };
    global.AppState?.batch({
      "intelligence.summary":summary,
      "intelligence.recommendations":recommendations,
      "intelligence.priorities":priorities
    },{source:metadata.source||"intelligence:evaluate"});
    global.IronEvents?.emit("intelligence:updated",{summary,recommendations,priorities});
    global.IronEvents?.emit("intelligence:recommendations",recommendations);
    if(priorities[0])global.IronEvents?.emit("intelligence:priority-changed",priorities[0]);
    return {context,summary,recommendations,priorities};
  }
};
global.IronIntelligence=IronIntelligence;
})(window);
