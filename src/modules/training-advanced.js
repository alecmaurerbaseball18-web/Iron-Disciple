(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.TrainingAdvanced=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const VERSION='2.2.0';
  const clone=v=>JSON.parse(JSON.stringify(v));
  const uid=p=>`${p}-${Math.random().toString(36).slice(2,9)}`;
  const seedTemplates=()=>[
    {id:'upper-strength',name:'Upper Body Strength',type:'Strength',description:'Balanced push-pull strength session.',exercises:[['band-chest-press',4,'6-8',120],['band-row',4,'8-10',120],['overhead-press',3,'8-10',90],['band-lat-pulldown',3,'10-12',90],['face-pull',3,'12-15',60]]},
    {id:'lower-strength',name:'Lower Body Strength',type:'Strength',description:'Squat, hinge, and unilateral strength.',exercises:[['band-squat',4,'6-8',120],['romanian-deadlift',4,'8-10',120],['split-squat',3,'8/side',90],['glute-bridge',3,'12',75],['calf-raise',3,'15',60]]},
    {id:'full-body-tournament',name:'Tournament Prep Full Body',type:'Tournament Prep',description:'Athletic full-body session with controlled fatigue.',exercises:[['band-squat',3,'8',90],['push-up',3,'10-15',60],['band-row',3,'10-12',60],['pallof-press',3,'10/side',45],['face-pull',2,'15',45]]},
    {id:'recovery-mobility',name:'Recovery & Mobility',type:'Recovery',description:'Low-fatigue movement quality and recovery.',exercises:[['glute-bridge',2,'12',30],['pallof-press',2,'8/side',30],['face-pull',2,'15',30],['calf-raise',2,'15',30]]}
  ];
  function buildWorkoutFromTemplate(template,library,date){
    const map=new Map((library||[]).map(e=>[e.id,e]));
    return {id:uid('workout'),date:date||new Date().toISOString().slice(0,10),name:template.name,type:template.type||'Strength',templateId:template.id,done:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),exercises:(template.exercises||[]).map((row,i)=>{const [exerciseId,sets,reps,restSeconds,groupType,groupId]=row;const exercise=map.get(exerciseId)||{};return{id:uid('exercise'),exerciseId,name:exercise.name||exerciseId,sets:Number(sets)||3,reps:String(reps||'10'),load:'',restSeconds:Number(restSeconds)||90,tempo:'controlled',notes:'',groupType:groupType||'straight',groupId:groupId||null,order:i};})};
  }
  function warmupForWorkout(workout,library){
    const patterns=new Set((workout?.exercises||[]).map(x=>(library||[]).find(e=>e.id===x.exerciseId)?.movement||''));
    const items=[{name:'Raise temperature',detail:'3–5 minutes easy walking, cycling, or marching',duration:4}];
    if([...patterns].some(x=>/squat|single-leg/i.test(x)))items.push({name:'Lower-body mobility',detail:'Ankle rocks and bodyweight squats',duration:3});
    if([...patterns].some(x=>/hinge|hip/i.test(x)))items.push({name:'Hinge preparation',detail:'Hip-hinge drill and glute bridges',duration:3});
    if([...patterns].some(x=>/push|pull|upper/i.test(x)))items.push({name:'Shoulder preparation',detail:'Band pull-aparts, scapular push-ups, and light rows',duration:4});
    items.push({name:'Ramp-up sets',detail:'Perform 2–3 progressively heavier practice sets for the first main exercise',duration:5});
    return items;
  }
  function cooldownForWorkout(workout){
    const type=String(workout?.type||'').toLowerCase();
    const items=[{name:'Downshift',detail:'2 minutes slow breathing and easy walking',duration:2},{name:'Targeted mobility',detail:'Hold comfortable stretches for the trained areas; avoid forcing range',duration:5}];
    if(type.includes('tournament')||type.includes('conditioning'))items.push({name:'Recovery reset',detail:'Hydrate, log soreness, and complete 5 minutes of easy movement later today',duration:5});
    return items;
  }
  function normalizeTrainingAdvanced(training){
    const next=clone(training||{});
    next.advanced={schemaVersion:1,templates:seedTemplates(),restTimer:{remaining:0,running:false,endsAt:null},...(next.advanced||{})};
    next.advanced.templates=Array.isArray(next.advanced.templates)&&next.advanced.templates.length?next.advanced.templates:seedTemplates();
    return next;
  }
  function groupExercises(exercises){
    const output=[];const seen=new Set();
    for(const ex of exercises||[]){
      if(ex.groupId&&ex.groupType&&ex.groupType!=='straight'){
        if(seen.has(ex.groupId))continue;seen.add(ex.groupId);
        output.push({type:ex.groupType,id:ex.groupId,exercises:exercises.filter(x=>x.groupId===ex.groupId)});
      }else output.push({type:'straight',id:ex.id,exercises:[ex]});
    }
    return output;
  }
  function nextIncompleteSet(session){
    for(let ei=0;ei<(session?.exercises||[]).length;ei++)for(let si=0;si<(session.exercises[ei].sets||[]).length;si++)if(!session.exercises[ei].sets[si].completed)return{exerciseIndex:ei,setIndex:si};
    return null;
  }
  return{VERSION,seedTemplates,buildWorkoutFromTemplate,warmupForWorkout,cooldownForWorkout,normalizeTrainingAdvanced,groupExercises,nextIncompleteSet};
});
