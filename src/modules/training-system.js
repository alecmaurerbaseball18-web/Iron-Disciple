(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.TrainingSystem=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const VERSION='2.1.0';
  const SCHEMA_VERSION=1;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const number=value=>Number.isFinite(Number(value))?Number(value):0;
  const list=value=>Array.isArray(value)?value.filter(Boolean).map(String):value?String(value).split(',').map(x=>x.trim()).filter(Boolean):[];
  const slug=value=>String(value||'exercise').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const seedExercises=()=>[
    {id:'band-squat',name:'Band Squat',category:'Lower Body',movement:'Squat',equipment:['Resistance bands'],difficulty:'Beginner',primaryMuscles:['Quadriceps','Glutes'],secondaryMuscles:['Hamstrings','Core'],instructions:'Stand on the band, brace, sit between the hips, and drive through the full foot.',cues:['Brace before descending','Keep knees tracking over toes','Stand tall without leaning back'],commonMistakes:['Knees collapsing inward','Heels lifting','Losing trunk position'],alternatives:['Goblet Squat','Box Squat']},
    {id:'band-chest-press',name:'Band Chest Press',category:'Upper Body',movement:'Horizontal push',equipment:['Resistance bands'],difficulty:'Beginner',primaryMuscles:['Chest'],secondaryMuscles:['Triceps','Front deltoids'],instructions:'Anchor the band behind you, keep ribs stacked, and press without shrugging.',cues:['Shoulders down and back','Press slightly inward','Control the return'],commonMistakes:['Overarching the back','Shrugging','Letting elbows flare excessively'],alternatives:['Push-up','Dumbbell Bench Press']},
    {id:'band-row',name:'Band Row',category:'Upper Body',movement:'Horizontal pull',equipment:['Resistance bands'],difficulty:'Beginner',primaryMuscles:['Upper back','Lats'],secondaryMuscles:['Biceps','Rear deltoids'],instructions:'Brace the torso, lead with the elbows, and finish with controlled shoulder blades.',cues:['Keep ribs stacked','Pull elbows toward back pockets','Pause at full contraction'],commonMistakes:['Leaning backward','Shrugging','Rushing the return'],alternatives:['Chest-Supported Row','Cable Row']},
    {id:'romanian-deadlift',name:'Romanian Deadlift',category:'Lower Body',movement:'Hinge',equipment:['Dumbbells or bands'],difficulty:'Intermediate',primaryMuscles:['Hamstrings','Glutes'],secondaryMuscles:['Back extensors','Core'],instructions:'Soften the knees, push the hips back, keep the spine neutral, and stand tall.',cues:['Hips travel backward','Keep load close','Stop when hamstrings limit range'],commonMistakes:['Squatting the movement','Rounding the back','Overextending at lockout'],alternatives:['Band Good Morning','Hip Hinge Drill']},
    {id:'split-squat',name:'Split Squat',category:'Lower Body',movement:'Single-leg squat',equipment:['Bodyweight or dumbbells'],difficulty:'Intermediate',primaryMuscles:['Quadriceps','Glutes'],secondaryMuscles:['Hamstrings','Calves'],instructions:'Use a stable split stance, lower vertically, and drive through the front foot.',cues:['Stay tall','Front foot stays planted','Control the bottom position'],commonMistakes:['Narrow stance','Pushing from the back leg','Front heel lifting'],alternatives:['Reverse Lunge','Supported Split Squat']},
    {id:'band-lat-pulldown',name:'Band Lat Pulldown',category:'Upper Body',movement:'Vertical pull',equipment:['Resistance bands','High anchor'],difficulty:'Beginner',primaryMuscles:['Lats'],secondaryMuscles:['Biceps','Upper back'],instructions:'Anchor overhead, pull elbows down toward the ribs, and return under control.',cues:['Lead with elbows','Keep neck relaxed','Avoid leaning far backward'],commonMistakes:['Pulling only with hands','Shrugging','Using momentum'],alternatives:['Assisted Pull-up','Straight-Arm Pulldown']},
    {id:'overhead-press',name:'Standing Overhead Press',category:'Upper Body',movement:'Vertical push',equipment:['Dumbbells or bands'],difficulty:'Intermediate',primaryMuscles:['Shoulders'],secondaryMuscles:['Triceps','Core'],instructions:'Brace the trunk and press overhead while keeping the ribs stacked.',cues:['Squeeze glutes','Finish with arms beside ears','Lower with control'],commonMistakes:['Excessive back arch','Pressing forward','Shrugging early'],alternatives:['Half-Kneeling Press','Incline Press']},
    {id:'push-up',name:'Push-up',category:'Upper Body',movement:'Horizontal push',equipment:['Bodyweight'],difficulty:'Beginner',primaryMuscles:['Chest'],secondaryMuscles:['Triceps','Shoulders','Core'],instructions:'Maintain a straight body line, lower under control, and press the floor away.',cues:['Brace like a plank','Elbows about 30–45 degrees','Reach at the top'],commonMistakes:['Hips sagging','Head reaching forward','Partial range'],alternatives:['Incline Push-up','Band Chest Press']},
    {id:'glute-bridge',name:'Glute Bridge',category:'Lower Body',movement:'Hip extension',equipment:['Bodyweight or band'],difficulty:'Beginner',primaryMuscles:['Glutes'],secondaryMuscles:['Hamstrings','Core'],instructions:'Drive through the feet, extend the hips, and finish without arching the lower back.',cues:['Ribs down','Pause at the top','Keep knees aligned'],commonMistakes:['Overarching','Pushing through toes','Knees collapsing'],alternatives:['Hip Thrust','Frog Pump']},
    {id:'pallof-press',name:'Pallof Press',category:'Core',movement:'Anti-rotation',equipment:['Resistance band','Anchor'],difficulty:'Beginner',primaryMuscles:['Core'],secondaryMuscles:['Glutes','Shoulders'],instructions:'Stand perpendicular to the anchor and press the band forward without rotating.',cues:['Stay square','Exhale during press','Move only the arms'],commonMistakes:['Rotating toward anchor','Holding breath','Using too much resistance'],alternatives:['Dead Bug','Side Plank']},
    {id:'calf-raise',name:'Standing Calf Raise',category:'Lower Body',movement:'Plantar flexion',equipment:['Bodyweight or load'],difficulty:'Beginner',primaryMuscles:['Calves'],secondaryMuscles:[],instructions:'Rise through the ball of the foot, pause at the top, and lower through a controlled range.',cues:['Keep pressure through big toe','Pause at peak','Use full range'],commonMistakes:['Bouncing','Rolling ankles outward','Rushing reps'],alternatives:['Single-Leg Calf Raise','Seated Calf Raise']},
    {id:'face-pull',name:'Band Face Pull',category:'Upper Body',movement:'Upper-back pull',equipment:['Resistance band','Anchor'],difficulty:'Beginner',primaryMuscles:['Rear deltoids','Upper back'],secondaryMuscles:['Rotator cuff'],instructions:'Pull toward eye level while separating the hands and keeping the shoulders down.',cues:['Lead with elbows','Finish hands apart','Control the return'],commonMistakes:['Shrugging','Pulling too low','Using momentum'],alternatives:['Band Pull-Apart','Rear-Delt Fly']}
  ];
  function normalizeExercise(raw,index=0){
    const source=raw&&typeof raw==='object'?raw:{};
    return {id:String(source.id||slug(source.name)||`exercise-${index+1}`),name:String(source.name||`Exercise ${index+1}`).trim(),category:String(source.category||'General'),movement:String(source.movement||source.category||'General'),equipment:list(source.equipment),difficulty:String(source.difficulty||'Beginner'),primaryMuscles:list(source.primaryMuscles),secondaryMuscles:list(source.secondaryMuscles),instructions:String(source.instructions||''),cues:list(source.cues),commonMistakes:list(source.commonMistakes),alternatives:list(source.alternatives),createdAt:source.createdAt||null,custom:Boolean(source.custom)};
  }
  function mergeExerciseLibraries(existing=[]){
    const byName=new Map();
    [...seedExercises(),...existing].forEach((item,index)=>{const ex=normalizeExercise(item,index);const key=ex.name.toLowerCase();byName.set(key,{...(byName.get(key)||{}),...ex});});
    return [...byName.values()];
  }
  function normalizeWorkout(raw,index=0,library=[]){
    const source=raw&&typeof raw==='object'?raw:{};const nameMap=new Map(library.map(x=>[x.name.toLowerCase(),x.id]));
    const exercises=(Array.isArray(source.exercises)?source.exercises:[]).map((item,i)=>{const e=item&&typeof item==='object'?item:{};return{id:String(e.id||`${source.id||`workout-${index+1}`}-exercise-${i+1}`),exerciseId:String(e.exerciseId||nameMap.get(String(e.name||'').toLowerCase())||''),name:String(e.name||library.find(x=>x.id===e.exerciseId)?.name||`Exercise ${i+1}`),sets:Math.max(1,number(e.sets)||3),reps:String(e.reps||'10'),load:String(e.load||''),restSeconds:Math.max(0,number(e.restSeconds)||90),tempo:String(e.tempo||'controlled'),notes:String(e.notes||'')};});
    return{id:String(source.id||`workout-${index+1}`),date:String(source.date||''),name:String(source.name||'Workout'),type:String(source.type||'Strength'),exercises,done:Boolean(source.done),template:Boolean(source.template),createdAt:source.createdAt||null,updatedAt:source.updatedAt||null};
  }
  function estimateOneRepMax(weight,reps){const w=number(weight),r=number(reps);if(w<=0||r<=0)return 0;if(r===1)return Math.round(w*10)/10;return Math.round((w*(1+r/30))*10)/10;}
  function setVolume(set){return number(set.weight)*number(set.reps);}
  function sessionMetrics(session){const sets=(session?.exercises||[]).flatMap(x=>x.sets||[]).filter(x=>x.completed||number(x.reps)>0);const totalVolume=sets.reduce((sum,x)=>sum+setVolume(x),0);const totalReps=sets.reduce((sum,x)=>sum+number(x.reps),0);const avgRpe=sets.length?sets.reduce((sum,x)=>sum+number(x.rpe),0)/sets.length:0;return{sets:sets.length,totalReps,totalVolume:Math.round(totalVolume),avgRpe:Math.round(avgRpe*10)/10,durationMinutes:Math.max(0,number(session?.durationMinutes))};}
  function recordsForSession(session,priorSessions=[]){
    const records=[];
    for(const exercise of session?.exercises||[]){
      const completed=(exercise.sets||[]).filter(x=>x.completed||number(x.reps)>0);if(!completed.length)continue;
      const bestWeight=Math.max(...completed.map(x=>number(x.weight)),0);const bestReps=Math.max(...completed.map(x=>number(x.reps)),0);const bestE1rm=Math.max(...completed.map(x=>estimateOneRepMax(x.weight,x.reps)),0);const volume=completed.reduce((sum,x)=>sum+setVolume(x),0);
      const prior=(priorSessions||[]).flatMap(s=>(s.exercises||[]).filter(x=>x.exerciseId===exercise.exerciseId||x.name===exercise.name));
      const priorSets=prior.flatMap(x=>x.sets||[]).filter(x=>x.completed||number(x.reps)>0);
      const priorWeight=Math.max(...priorSets.map(x=>number(x.weight)),0);const priorReps=Math.max(...priorSets.map(x=>number(x.reps)),0);const priorE1rm=Math.max(...priorSets.map(x=>estimateOneRepMax(x.weight,x.reps)),0);const priorVolume=Math.max(...prior.map(x=>(x.sets||[]).reduce((sum,set)=>sum+setVolume(set),0)),0);
      if(bestWeight>priorWeight&&bestWeight>0)records.push({exerciseId:exercise.exerciseId,exercise:exercise.name,type:'weight',value:bestWeight,unit:'lb'});
      if(bestReps>priorReps&&bestReps>0)records.push({exerciseId:exercise.exerciseId,exercise:exercise.name,type:'reps',value:bestReps,unit:'reps'});
      if(bestE1rm>priorE1rm&&bestE1rm>0)records.push({exerciseId:exercise.exerciseId,exercise:exercise.name,type:'estimated-1rm',value:bestE1rm,unit:'lb'});
      if(volume>priorVolume&&volume>0)records.push({exerciseId:exercise.exerciseId,exercise:exercise.name,type:'volume',value:Math.round(volume),unit:'lb'});
    }
    return records;
  }
  function progressionRecommendation({targetSets=0,completedSets=0,averageRpe=0,pain=0,technique=8}={}){
    const completion=targetSets?completedSets/targetSets:0;
    if(number(pain)>=6)return{action:'regress',label:'Regress',detail:'Stop loading progression and choose a pain-free alternative.'};
    if(number(pain)>=3)return{action:'hold',label:'Hold',detail:'Keep or reduce the load until discomfort remains below 3/10.'};
    if(completion>=1&&number(averageRpe)<=8&&number(technique)>=8)return{action:'increase',label:'Increase',detail:'Add a small amount of resistance or one rep per set next time.'};
    if(completion<0.75||number(averageRpe)>=9||number(technique)<7)return{action:'reduce',label:'Reduce',detail:'Reduce load or volume and rebuild clean repetitions.'};
    return{action:'repeat',label:'Repeat',detail:'Repeat the prescription and improve total quality or one additional rep.'};
  }
  function migrateTrainingState(input){
    const state=clone(input||{});state.exerciseLibrary=mergeExerciseLibraries(state.exerciseLibrary||[]);state.workouts=(state.workouts||[]).map((w,i)=>normalizeWorkout(w,i,state.exerciseLibrary));state.training={schemaVersion:SCHEMA_VERSION,sessions:[],activeSessionId:null,settings:{defaultRestSeconds:90,autoPR:true},...(state.training||{})};state.training.sessions=Array.isArray(state.training.sessions)?state.training.sessions:[];return state;
  }
  return{VERSION,SCHEMA_VERSION,seedExercises,normalizeExercise,mergeExerciseLibraries,normalizeWorkout,estimateOneRepMax,setVolume,sessionMetrics,recordsForSession,progressionRecommendation,migrateTrainingState};
});
