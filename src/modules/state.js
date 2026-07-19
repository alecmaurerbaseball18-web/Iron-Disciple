(function(global){
  "use strict";

  const clone=value=>{
    if(value===undefined)return undefined;
    try{return structuredClone(value)}catch(_){return JSON.parse(JSON.stringify(value))}
  };

  const split=path=>Array.isArray(path)?path:String(path||"").split(".").filter(Boolean);

  class StateStore{
    constructor(initialState={}){
      this.version="4.0.0-alpha.5";
      this.state=clone(initialState)||{};
      this.listeners=new Map();
    }

    get(path,fallback=null){
      const parts=split(path);
      let value=this.state;
      for(const part of parts){
        if(value===null||value===undefined||!(part in Object(value)))return fallback;
        value=value[part];
      }
      return value===undefined?fallback:value;
    }

    set(path,value,metadata={}){
      const parts=split(path);
      if(!parts.length)throw new Error("AppState.set requires a state path.");
      let node=this.state;
      for(const part of parts.slice(0,-1)){
        if(!node[part]||typeof node[part]!=="object")node[part]={};
        node=node[part];
      }
      const key=parts.at(-1);
      const previous=node[key];
      node[key]=value;
      this.notify(parts.join("."),value,previous,metadata);
      return value;
    }

    update(path,updater,metadata={}){
      if(typeof updater!=="function")throw new TypeError("AppState.update requires a function.");
      return this.set(path,updater(this.get(path)),metadata);
    }

    hydrate(values={},metadata={source:"hydrate"}){
      const merge=(target,source,prefix="")=>{
        Object.entries(source||{}).forEach(([key,value])=>{
          const path=prefix?`${prefix}.${key}`:key;
          if(value&&typeof value==="object"&&!Array.isArray(value)){
            if(!target[key]||typeof target[key]!=="object"||Array.isArray(target[key]))target[key]={};
            merge(target[key],value,path);
          }else{
            const previous=target[key];
            target[key]=value;
            this.notify(path,value,previous,metadata);
          }
        });
      };
      merge(this.state,values);
      return this.state;
    }

    subscribe(path,listener,{immediate=false}={}){
      if(typeof listener!=="function")throw new TypeError("AppState.subscribe requires a function.");
      const key=String(path||"*");
      const listeners=this.listeners.get(key)||new Set();
      listeners.add(listener);
      this.listeners.set(key,listeners);
      if(immediate)listener(this.get(path),undefined,{path:key,source:"subscribe"});
      return ()=>{
        listeners.delete(listener);
        if(!listeners.size)this.listeners.delete(key);
      };
    }

    notify(path,value,previous,metadata={}){
      const payload={path,value,previous,...metadata};
      const keys=new Set([path,"*"]);
      const parts=split(path);
      while(parts.length>1){parts.pop();keys.add(parts.join("."))}
      keys.forEach(key=>(this.listeners.get(key)||[]).forEach(listener=>{
        try{listener(value,previous,payload)}catch(error){console.error(`[AppState] listener failed for ${key}`,error)}
      }));
      global.dispatchEvent?.(new CustomEvent("iron-disciple:state-change",{detail:payload}));
    }

    snapshot(path){return clone(path?this.get(path):this.state)}
  }

  const initialState={
    mission:{current:null},
    workout:{activeExerciseId:null,entries:[]},
    hydration:{currentOz:0,targetOz:128},
    readiness:{level:"GREEN",score:100,triggers:[]},
    dashboard:{timeline:[],progress:0,nextTask:null},
    recovery:{sleepHours:0,stress:0,soreness:0,shoulderPain:0},
    nutrition:{},
    settings:{}
  };

  global.StateStore=StateStore;
  global.AppState=new StateStore(initialState);
})(window);
