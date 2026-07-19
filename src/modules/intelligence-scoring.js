(function(global){
"use strict";
function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,Number(v)||0))}
function scoreReadiness({readinessScore=100,sleep=0,stress=0,soreness=0,shoulderPain=0}={}){
  let score=clamp(readinessScore);
  if(sleep>0&&sleep<7)score-=Math.min(20,(7-sleep)*5);
  score-=Math.max(0,Number(stress)-5)*2;
  score-=Math.max(0,Number(soreness)-5)*2;
  score-=Math.max(0,Number(shoulderPain)-2)*3;
  return Math.round(clamp(score));
}
function urgencyScore(item={}){
  let score=0;
  if(item.blocked)score-=20;
  if(item.overdue)score+=40;
  if(item.today)score+=25;
  if(item.priority==="high")score+=30;
  if(item.priority==="medium")score+=15;
  if(item.category==="recovery")score+=10;
  if(item.category==="mission")score+=8;
  if(item.action==="PRIORITIZE")score+=20;
  if(item.action==="REPLACE")score-=5;
  return score;
}
global.IronIntelligenceScoring={clamp,scoreReadiness,urgencyScore};
})(window);
