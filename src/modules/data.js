const EVENTS = {
  "2026-10-11":"tournament",
  "2026-10-17":"tournament",
  "2026-10-19":"tournament"
};

const TOURNAMENTS = {
  softball1:new Date("2026-10-11T12:00:00"),
  softball2:new Date("2026-10-17T12:00:00"),
  golf:new Date("2026-10-19T12:00:00")
};

const DEFAULT_BANDS = [
  {label:"10 lb",rank:10,weight:10},{label:"20 lb",rank:20,weight:20},{label:"30 lb",rank:30,weight:30},{label:"40 lb",rank:40,weight:40},{label:"50 lb",rank:50,weight:50},{label:"60 lb",rank:60,weight:60},{label:"70 lb",rank:70,weight:70},{label:"80 lb",rank:80,weight:80},{label:"90 lb",rank:90,weight:90},{label:"100 lb",rank:100,weight:100},{label:"110 lb",rank:110,weight:110},{label:"120 lb",rank:120,weight:120},{label:"130 lb",rank:130,weight:130},{label:"140 lb",rank:140,weight:140},{label:"150 lb",rank:150,weight:150}
];

const EXERCISES = {
  squat:{name:"Band Front Squat",sets:4,min:8,max:12,rest:75,tempo:"3-1-1",cue:"Brace first. Sit between the hips. Drive the floor away."},
  rdl:{name:"Band Romanian Deadlift",sets:4,min:10,max:10,rest:75,tempo:"3-1-1",cue:"Soft knees. Push hips back. Keep the spine long and bands close."},
  press:{name:"Band Chest Press / Push-Up",sets:4,min:8,max:15,rest:60,tempo:"2-0-1",cue:"Ribs down. Shoulder blades controlled. Press without shrugging."},
  row:{name:"One-Arm Band Row",sets:4,min:10,max:12,rest:60,tempo:"2-1-1",cue:"Square the torso. Pull elbow toward the hip. Pause without twisting."},
  pallof:{name:"Pallof Press",sets:3,min:12,max:12,rest:45,tempo:"2-sec hold",cue:"Stack ribs over pelvis. Resist rotation. Exhale during the hold."},
  plank:{name:"Front Plank",sets:3,min:30,max:60,rest:45,tempo:"seconds",cue:"Squeeze glutes. Pull elbows toward toes. Do not let the back sag."},
  split:{name:"Band Split Squat",sets:3,min:10,max:10,rest:60,tempo:"3-0-1",cue:"Stay tall. Drop straight down. Drive through the whole front foot."},
  overhead:{name:"Band Overhead Press",sets:3,min:8,max:12,rest:60,tempo:"2-0-1",cue:"Brace hard. Keep ribs down. Press in a pain-free path."},
  facepull:{name:"Face Pull",sets:3,min:15,max:15,rest:45,tempo:"2-1-2",cue:"Pull toward the eyebrows. Rotate thumbs behind you. Avoid shrugging."}
};

const MISSION_LIBRARY = {
  workday:{
    label:"Workday",baseMinutes:95,workout:["split","overhead","facepull"],
    objective:"Maintain conditioning, strength, and sport mechanics without excessive fatigue.",
    victory:"Complete the portable mission, nutrition, faith, mobility, and evening review.",
    sections:[
      ["✝ Faith",[["Podcast study","Listen to your daily Bible-study podcast and record one application.",20],["Prayer","Pray for family, work, wisdom, discipline, and gratitude.",8]]],
      ["💪 Workday Training",[["Zone 2 cardio","35–40 minutes at conversation pace.",38],["Portable strength","Complete the Tactical Athlete prescription below.",25]]],
      ["⛳ Golf WG1",[["Chest-start takeaway","3×10; shaft-parallel checkpoint 3×8; slow swing rehearsal 10 reps.",12]]],
      ["🥎 Softball WS1",[["Third-base footwork","Ready hold 5×20 sec; first step left/right 5×6; charge and backhand patterns 3×8.",12]]]
    ]
  },
  offday:{
    label:"Off Day",baseMinutes:175,workout:["squat","rdl","press","row","pallof","plank"],
    objective:"Build full-body strength, golf contact, and softball mechanics.",
    victory:"Complete the readiness-adjusted full session with high-quality technique.",
    sections:[
      ["✝ Faith",[["Podcast study","Record title, Scripture/topic, takeaway, and application.",25],["Prayer","Complete focused prayer and gratitude.",10]]],
      ["💪 Workout A",[["Warm-up","March 2 min; cat-camel 8; open books 6/side; 90/90 hips 8; squat 10; reverse lunge 5/side; scap push-up 10.",8],["Strength","Complete the Tactical Athlete prescription below.",55],["Zone 2 walk","30 minutes.",30]]],
      ["⛳ Golf G1",[["Contact session","10 wedges; 15 half 7-iron; 15 three-quarter 7-iron; 10 full 7-iron; 10 driver/fairway; 5 pressure balls.",55]]],
      ["🥎 Softball",[["Arm care and hitting","Pull-apart 2×15; face pull 2×15; external rotation 2×12/arm; stance/load/stride work; dry swings 4×10; situational swings.",35]]]
    ]
  },
  recovery:{
    label:"Recovery",baseMinutes:60,workout:[],
    objective:"Restore readiness while maintaining faith, nutrition, walking, and mobility.",
    victory:"Finish the day feeling better than you started.",
    sections:[
      ["✝ Faith",[["Podcast study","Listen and record one application.",20],["Prayer","Complete prayer and gratitude.",8]]],
      ["❤️ Recovery",[["Easy walk","20–30 minutes only if it improves recovery.",25],["Mobility","Cat-camel; open books; 90/90; hip flexor; calf; wall slides; slow breathing.",15]]]
    ]
  },
  tournament:{
    label:"Tournament",baseMinutes:75,workout:[],
    objective:"Perform with confidence while protecting energy, hydration, and the throwing shoulder.",
    victory:"Execute warm-up, competition, between-event recovery, and post-event recovery.",
    sections:[
      ["✝ Faith",[["Prayer","Pray for gratitude, composure, health, and honorable competition.",8]]],
      ["🏆 Competition",[["Dynamic warm-up","5–8 minutes.",8],["Sport warm-up","Build gradually and stop after quality is established.",25],["Mental routine","Visualize the first successful play or shot.",5]]],
      ["❤️ Recovery",[["Hydrate and fuel","Water plus electrolytes; familiar protein and carbohydrate.",10],["Mobility","Shoulders, hips, and calves. Avoid unnecessary extra volume.",10]]]
    ]
  }
};

const COMMON_SECTIONS = [
  ["🍽 Nutrition",[["Meal 1","Use saved portions.",10],["Meal 2","Use saved portions.",10],["Meal 3","Use saved portions.",10]]],
  ["❤️ Evening Recovery",[["Mobility","Hip flexor, hamstring, calf, chest, and shoulder stretches.",10],["Sleep preparation","Dark, cool room; protect the longest practical sleep window.",5]]]
];

const GOLF_LESSONS = [
  {id:"setup",name:"Setup & Posture",phase:"Foundation",objective:"Build a repeatable athletic address position.",cue:"Balanced over mid-foot; arms hang naturally.",drills:[["Mirror setup hold","5×20 sec"],["Ball-position check","10 reps"],["Alignment rehearsal","10 reps"]],success:{contact:70,confidence:6,sessions:2}},
  {id:"takeaway",name:"Chest-Driven Takeaway",phase:"Foundation",objective:"Start the club with the chest rather than the hands.",cue:"Chest starts the club; hands stay quiet.",drills:[["Chest-start takeaway","3×10"],["Pause at shaft parallel","3×8"],["Slow-motion full rehearsal","10 reps"]],success:{contact:72,confidence:6,sessions:2}},
  {id:"shaft_parallel",name:"Shaft-Parallel Checkpoint",phase:"Foundation",objective:"Reach a repeatable first checkpoint without pulling the club inside.",cue:"Clubhead just outside the hands; shaft parallel to target line.",drills:[["Freeze at parallel","3×8"],["Alignment-stick checkpoint","3×10"],["Mirror rehearsal","10 reps"]],success:{contact:74,confidence:6,sessions:2}},
  {id:"top",name:"Compact Top Position",phase:"Development",objective:"Create a compact, balanced top with width and no sway.",cue:"Turn around the spine; do not lift the arms.",drills:[["Top pause","3×8"],["Wall turn drill","3×10"],["Lead-arm width rehearsal","2×10"]],success:{contact:76,confidence:7,sessions:2}},
  {id:"transition",name:"Pressure Shift & Transition",phase:"Development",objective:"Begin down with pressure shift and body sequence rather than pulling the hands.",cue:"Lead foot pressure first; hands ride.",drills:[["Pressure-shift rehearsal","3×8"],["Pump drill","3×6"],["Back-to-target transition","2×8"]],success:{contact:78,confidence:7,sessions:3}},
  {id:"impact",name:"Impact & Low Point",phase:"Performance",objective:"Control low point and improve compression.",cue:"Chest keeps turning; strike the ground after the ball.",drills:[["Impact rehearsal","3×8"],["Brush-the-grass drill","3×10"],["Line drill","20 balls"]],success:{contact:80,confidence:7,sessions:3}},
  {id:"driver",name:"Driver Start Line",phase:"Performance",objective:"Produce a predictable start line with balanced speed.",cue:"Same chest-driven motion; finish balanced.",drills:[["Tee-height check","10 reps"],["Start-line gate","20 balls"],["Three-shot fairway test","5 rounds"]],success:{contact:78,confidence:8,sessions:3}},
  {id:"pressure",name:"Pressure Practice",phase:"Peak",objective:"Transfer mechanics into a one-ball, full-routine environment.",cue:"Commit to target and routine; no mechanical rebuilds.",drills:[["Simulated 9 holes","One ball each shot"],["Five-ball pressure finish","Restart after poor routine"],["Post-shot reset","Every shot"]],success:{contact:80,confidence:8,sessions:3}}
];

const GOLF_FAULTS = {
  "pull hook":{title:"Pull Hook",drills:["Chest-rotation hold-off","Start-line gate","Half-swing face control"],cue:"Keep turning; do not throw the hands."},
  "over the top":{title:"Over the Top",drills:["Pump drill","Back-to-target drill","Slow transition rehearsal"],cue:"Lead foot pressure first; arms fall."},
  "thin":{title:"Thin / Top",drills:["Chair drill","Brush-the-grass","Half-swing contact"],cue:"Stay in posture and turn through."},
  "fat":{title:"Fat Contact",drills:["Step-through drill","Line drill","Lead-side pressure rehearsal"],cue:"Pressure forward before the club descends."},
  "inside":{title:"Club Too Far Inside",drills:["Outside-hand checkpoint","Alignment-stick takeaway","Chest-start rehearsal"],cue:"Chest moves the club; clubhead stays outside hands."}
};

const SOFTBALL_LESSONS = [
  {id:"ready_position",name:"Third-Base Ready Position",phase:"Foundation",objective:"Build a balanced, reactive setup with no false step.",cue:"Chest over knees; weight on the balls of the feet; glove low.",drills:[["Ready-position hold","5×20 sec"],["First step left","5×6"],["First step right","5×6"]],success:{confidence:6,armFatigueMax:4,sessions:2}},
  {id:"forehand_backhand",name:"Forehand & Backhand Routes",phase:"Foundation",objective:"Improve first-step direction and field through the ball.",cue:"Feet create the angle; glove receives the ball out front.",drills:[["Forehand route","3×8"],["Backhand crossover","3×8"],["Mixed reaction calls","20 reps"]],success:{confidence:6,armFatigueMax:4,sessions:2}},
  {id:"slow_roller",name:"Slow Roller & Barehand",phase:"Development",objective:"Attack slow rollers with controlled body position and a quick release.",cue:"Charge under control; feet keep moving through the throw.",drills:[["Charge and breakdown","3×8"],["Barehand pickup","3×8"],["Right-left throw footwork","3×8"]],success:{confidence:7,armFatigueMax:4,sessions:2}},
  {id:"throwing_sequence",name:"Field-to-Throw Sequence",phase:"Development",objective:"Connect fielding footwork to a strong, accurate throw.",cue:"Field, gather, replace feet, separate, rotate, finish.",drills:[["Dry field-to-throw","3×8"],["Short throws at 50–60%","20"],["Game-footwork throws","10"]],success:{confidence:7,armFatigueMax:5,sessions:3}},
  {id:"hitting_load",name:"Hitting Load & Separation",phase:"Development",objective:"Create a repeatable load and maintain balance.",cue:"Small load; controlled stride; hips begin while hands stay back.",drills:[["Stance hold","3×20 sec"],["Load without stride","3×10"],["Stride and freeze","3×10"],["Dry swings","4×10"]],success:{confidence:7,armFatigueMax:5,sessions:3}},
  {id:"all_fields",name:"All-Field Contact",phase:"Performance",objective:"Drive the ball through the middle and both gaps.",cue:"Stay through the ball; do not roll over early.",drills:[["Middle","20 swings"],["Opposite gap","20 swings"],["Pull gap","20 swings"],["Situational finish","10 swings"]],success:{confidence:8,armFatigueMax:5,sessions:3}},
  {id:"speed_reaction",name:"First-Step Speed",phase:"Performance",objective:"Improve acceleration and lateral reaction for third base.",cue:"Push the ground away; no false step.",drills:[["10-yard start","6 reps"],["Lateral shuffle to sprint","4/side"],["Reaction break","10 reps"]],success:{confidence:8,armFatigueMax:5,sessions:3}},
  {id:"game_simulation",name:"Tournament Simulation",phase:"Peak",objective:"Perform fielding, hitting, throwing, and sprinting under game-like pressure.",cue:"Full routine, one rep, game speed, recover between efforts.",drills:[["Five defensive innings","5 plays each"],["One-ball hitting decisions","25 swings"],["Game-speed throws","10"],["Home-to-first starts","4"]],success:{confidence:8,armFatigueMax:4,sessions:3}}
];

const SOFTBALL_FAULTS = {
  "high throw":{title:"Throws High",drills:["Front-side stability","Finish over lead leg","50% accuracy throws"],cue:"Stay through the target and finish over the front leg."},
  "low throw":{title:"Throws Low",drills:["Dry arm-path rehearsal","Short-distance accuracy","Balanced finish"],cue:"Throw through the chest of the target."},
  "pull throw":{title:"Pulling Throws",drills:["Right-left footwork","Pause at separation","Middle-target throws"],cue:"Feet first; chest follows."},
  "pop up":{title:"Pop-Ups",drills:["Level dry swings","Middle-line tee work","Balanced finish"],cue:"Stay in posture and drive through the middle."},
  "roll over":{title:"Rolling Over",drills:["Opposite-field tee work","Delay early wrist roll","Middle-gap swings"],cue:"Keep the barrel through the zone."},
  "slow first step":{title:"Slow First Step",drills:["Ready-position hold","Directional first step","Reaction call drill"],cue:"Be moving on contact, not after the ball is already past you."}
};
