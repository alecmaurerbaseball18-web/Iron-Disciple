(function(global){
  "use strict";
  class EventBus{
    constructor(){this.events=new Map()}
    on(name,listener){
      const listeners=this.events.get(name)||new Set();
      listeners.add(listener);this.events.set(name,listeners);
      return ()=>{listeners.delete(listener);if(!listeners.size)this.events.delete(name)};
    }
    emit(name,payload){
      (this.events.get(name)||[]).forEach(listener=>{
        try{listener(payload)}catch(error){console.error(`[IronEvents] ${name} listener failed`,error)}
      });
      global.dispatchEvent?.(new CustomEvent(`iron-disciple:${name}`,{detail:payload}));
    }
  }
  global.EventBus=EventBus;
  global.IronEvents=new EventBus();
})(window);
