(function(global){
  "use strict";

  class StorageService {
    constructor(storage){
      this.storage=storage;
    }

    getRaw(key,fallback=null){
      try{
        const value=this.storage.getItem(key);
        return value===null?fallback:value;
      }catch(error){
        console.error(`[Storage] Unable to read ${key}`,error);
        return fallback;
      }
    }

    setRaw(key,value){
      try{
        this.storage.setItem(key,String(value));
        return true;
      }catch(error){
        console.error(`[Storage] Unable to write ${key}`,error);
        return false;
      }
    }

    get(key,fallback=null){
      const raw=this.getRaw(key,null);
      if(raw===null)return fallback;
      try{
        const parsed=JSON.parse(raw);
        return parsed??fallback;
      }catch(error){
        console.warn(`[Storage] Invalid JSON for ${key}; using fallback.`,error);
        return fallback;
      }
    }

    set(key,value){
      try{
        return this.setRaw(key,JSON.stringify(value));
      }catch(error){
        console.error(`[Storage] Unable to serialize ${key}`,error);
        return false;
      }
    }

    remove(key){
      try{
        this.storage.removeItem(key);
        return true;
      }catch(error){
        console.error(`[Storage] Unable to remove ${key}`,error);
        return false;
      }
    }

    has(key){
      return this.getRaw(key,null)!==null;
    }

    keys(){
      const result=[];
      try{
        for(let i=0;i<this.storage.length;i++){
          const key=this.storage.key(i);
          if(key!==null)result.push(key);
        }
      }catch(error){
        console.error("[Storage] Unable to enumerate keys",error);
      }
      return result;
    }

    bytes(){
      return this.keys().reduce((total,key)=>{
        const value=this.getRaw(key,"");
        return total+((key.length+(value?.length||0))*2);
      },0);
    }
  }

  const service=new StorageService(global.localStorage);
  global.StorageService=StorageService;
  global.IronStorage=service;
})(window);
