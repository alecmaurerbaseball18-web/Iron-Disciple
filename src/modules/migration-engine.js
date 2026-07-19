class MigrationEngine {
  constructor(storage=localStorage) {
    this.storage=storage;
    this.versionKey="id-app-version";
    this.migrationKey="id-v1-migration-complete";
    this.currentVersion="1.5.0";
  }

  getJson(key,fallback){
    try{
      const value=this.storage.getItem(key);
      return value===null?fallback:JSON.parse(value);
    }catch{
      return fallback;
    }
  }

  setJson(key,value){
    this.storage.setItem(key,JSON.stringify(value));
  }

  firstArray(keys){
    for(const key of keys){
      const value=this.getJson(key,null);
      if(Array.isArray(value) && value.length) return value;
    }
    return [];
  }

  firstObject(keys){
    for(const key of keys){
      const value=this.getJson(key,null);
      if(value && typeof value==="object" && !Array.isArray(value) && Object.keys(value).length) return value;
    }
    return {};
  }

  mergeUnique(arrays,identity){
    const map=new Map();
    arrays.flat().forEach(item=>{
      if(!item || typeof item!=="object") return;
      const id=identity(item);
      if(!id) return;
      map.set(id,{...(map.get(id)||{}),...item});
    });
    return [...map.values()].sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  }

  migrate(){
    if(this.storage.getItem(this.migrationKey)==="true"){
      this.storage.setItem(this.versionKey,this.currentVersion);
      return {ran:false,counts:this.counts()};
    }

    const v1Logs=this.getJson("id-v1-logs",[]);
    const oldLogs=this.firstArray([
      "id-logs-v07","id-logs-v06","id-logs-v05","id-logs-v04","id-logs-v03"
    ]);
    const logs=this.mergeUnique([oldLogs,v1Logs],x=>x.date);

    const v1Exercise=this.getJson("id-v1-exercise",[]);
    const oldExercise=this.firstArray([
      "id-exercise-v06","id-exercise-v05","id-exercise-logs-v05"
    ]);
    const exercise=this.mergeUnique([oldExercise,v1Exercise],x=>`${x.date}|${x.exerciseId}`);

    const v1Golf=this.getJson("id-v1-golf-logs",[]);
    const oldGolf=this.firstArray(["id-golf-logs-v06"]);
    const golf=this.mergeUnique([oldGolf,v1Golf],x=>x.date);

    const v1Softball=this.getJson("id-v1-softball-logs",[]);
    const oldSoftball=this.firstArray(["id-softball-logs-v07"]);
    const softball=this.mergeUnique([oldSoftball,v1Softball],x=>x.date);

    const v1Schedule=this.getJson("id-v1-schedule",{});
    const oldSchedule=this.firstObject([
      "id-schedule-v07","id-schedule-v06","id-schedule-v05","id-schedule-v04","id-schedule-v03"
    ]);
    const schedule={...oldSchedule,...v1Schedule};

    const v1Settings=this.getJson("id-v1-settings",{});
    const oldSettings=this.firstObject([
      "id-settings-v07","id-settings-v06","id-settings-v05","id-settings-v04","id-settings-v03"
    ]);
    const settings={...oldSettings,...v1Settings};

    const oldBands=this.firstArray(["id-bands-v06","id-band-options-v05"]);
    const v1Bands=this.getJson("id-v1-bands",[]);
    const bands=v1Bands.length?v1Bands:oldBands;

    const golfState={
      ...this.firstObject(["id-golf-state-v06"]),
      ...this.getJson("id-v1-golf-state",{})
    };
    const softballState={
      ...this.firstObject(["id-softball-state-v07"]),
      ...this.getJson("id-v1-softball-state",{})
    };

    this.setJson("id-v1-logs",logs);
    this.setJson("id-v1-exercise",exercise);
    this.setJson("id-v1-golf-logs",golf);
    this.setJson("id-v1-softball-logs",softball);
    this.setJson("id-v1-schedule",schedule);
    this.setJson("id-v1-settings",settings);
    if(bands.length)this.setJson("id-v1-bands",bands);
    this.setJson("id-v1-golf-state",golfState);
    this.setJson("id-v1-softball-state",softballState);

    this.storage.setItem(this.migrationKey,"true");
    this.storage.setItem(this.versionKey,this.currentVersion);

    return {ran:true,counts:this.counts()};
  }

  counts(){
    return{
      mission:this.getJson("id-v1-logs",[]).length,
      exercise:this.getJson("id-v1-exercise",[]).length,
      golf:this.getJson("id-v1-golf-logs",[]).length,
      softball:this.getJson("id-v1-softball-logs",[]).length,
      nutrition:this.getJson("id-v1-nutrition-logs",[]).length,
      schedule:Object.keys(this.getJson("id-v1-schedule",{})).length
    };
  }

  integrity(){
    const issues=[];
    const counts=this.counts();
    const schedule=this.getJson("id-v1-schedule",{});
    const logs=this.getJson("id-v1-logs",[]);
    const validShifts=new Set(["day","night","off","workday","offday","recovery","tournament"]);

    Object.entries(schedule).forEach(([date,value])=>{
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) issues.push(`Invalid schedule date: ${date}`);
      if(!validShifts.has(value)) issues.push(`Unknown schedule value on ${date}: ${value}`);
    });

    const duplicateDates=logs.map(x=>x.date).filter((date,i,arr)=>date&&arr.indexOf(date)!==i);
    if(duplicateDates.length)issues.push("Duplicate daily log dates detected.");

    if(!counts.schedule)issues.push("No schedule entries are saved.");
    if(!counts.mission)issues.push("No completed mission logs are saved yet.");

    return{
      healthy:issues.length===0,
      issues,
      counts,
      storageBytes:this.storageBytes()
    };
  }

  storageBytes(){
    let total=0;
    for(let i=0;i<this.storage.length;i++){
      const key=this.storage.key(i);
      total+=(key?.length||0)+(this.storage.getItem(key)?.length||0);
    }
    return total*2;
  }

  backupDue(){
    const last=this.storage.getItem("id-last-backup");
    if(!last)return true;
    return (Date.now()-new Date(last).getTime())>7*86400000;
  }

  markBackup(){
    this.storage.setItem("id-last-backup",new Date().toISOString());
  }

  clearToday(dateKey){
    this.storage.removeItem(`id-v1-day-${dateKey}`);
  }

  clearAllIronDisciple(){
    const keys=[];
    for(let i=0;i<this.storage.length;i++){
      const key=this.storage.key(i);
      if(key && (key.startsWith("id-")||key.startsWith("iron-disciple")))keys.push(key);
    }
    keys.forEach(k=>this.storage.removeItem(k));
    return keys.length;
  }
}