(function(global){
"use strict";

const KEYS={
  incidents:"iron_operations_incidents",
  arrests:"iron_operations_arrests",
  fieldBook:"iron_operations_fieldbook",
  reports:"iron_operations_reports",
  tasks:"iron_operations_tasks",
  notes:"iron_operations_notes"
};

function read(key,fallback=[]){
  try{
    const value=JSON.parse(localStorage.getItem(key));
    return value??fallback;
  }catch{return fallback}
}
function write(key,value){
  localStorage.setItem(key,JSON.stringify(value));
  return value;
}
function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g,ch=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[ch]);
}
function nowLabel(){
  return new Date().toLocaleString([],{
    month:"short",day:"numeric",hour:"numeric",minute:"2-digit"
  });
}
function item(label,detail="",done=false){
  return {id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,label,detail,done,createdAt:new Date().toISOString()};
}

const IronOperations={
  version:"4.0.0-alpha.5",

  data(){
    return {
      incidents:read(KEYS.incidents),
      arrests:read(KEYS.arrests),
      fieldBook:read(KEYS.fieldBook),
      reports:read(KEYS.reports),
      tasks:read(KEYS.tasks),
      notes:read(KEYS.notes)
    };
  },

  summary(){
    const data=this.data();
    const openTasks=data.tasks.filter(x=>!x.done);
    const pendingReports=data.reports.filter(x=>!x.done);
    return {
      incidents:data.incidents.length,
      arrests:data.arrests.length,
      fieldBook:data.fieldBook.length,
      pendingReports:pendingReports.length,
      openTasks:openTasks.length,
      nextTask:openTasks[0]||null,
      updatedAt:new Date().toISOString()
    };
  },

  add(type,label,detail=""){
    if(!KEYS[type]||!String(label).trim())return null;
    const rows=read(KEYS[type]);
    const record=item(String(label).trim(),String(detail).trim());
    rows.unshift(record);
    write(KEYS[type],rows);
    this.publish("operations:add");
    this.render();
    return record;
  },

  toggle(type,id){
    if(!KEYS[type])return;
    const rows=read(KEYS[type]).map(row=>row.id===id?{...row,done:!row.done}:row);
    write(KEYS[type],rows);
    this.publish("operations:toggle");
    this.render();
  },

  remove(type,id){
    if(!KEYS[type])return;
    write(KEYS[type],read(KEYS[type]).filter(row=>row.id!==id));
    this.publish("operations:remove");
    this.render();
  },

  clearShift(){
    ["incidents","arrests","fieldBook","notes"].forEach(type=>write(KEYS[type],[]));
    this.publish("operations:clear");
    this.render();
  },

  publish(source="operations:update"){
    const data=this.data(),summary=this.summary();
    global.AppState?.batch({
      "operations.summary":summary,
      "operations.incidents":data.incidents,
      "operations.arrests":data.arrests,
      "operations.fieldBook":data.fieldBook,
      "operations.reports":data.reports,
      "operations.tasks":data.tasks,
      "operations.notes":data.notes
    },{source});
    global.IronEvents?.emit("operations:updated",{summary,data});
    return {summary,data};
  },

  passdownText(){
    const d=this.data();
    const lines=(title,rows)=>[
      title,
      ...(rows.length?rows.map((x,i)=>`${i+1}. ${x.label}${x.detail?` — ${x.detail}`:""}`):["None"])
    ];
    return [
      "C SQUAD PASS-DOWN",
      `Generated: ${nowLabel()}`,
      "",
      ...lines("INCIDENT SYNOPSIS",d.incidents),
      "",
      ...lines("CUSTODIAL ARRESTS",d.arrests),
      "",
      ...lines("FIELD BOOK ARRESTS",d.fieldBook),
      "",
      ...lines("PENDING REPORTS",d.reports.filter(x=>!x.done)),
      "",
      ...lines("OPEN TASKS",d.tasks.filter(x=>!x.done)),
      "",
      ...lines("NOTES",d.notes)
    ].join("\n");
  },

  copyPassdown(){
    const text=this.passdownText();
    navigator.clipboard?.writeText(text).then(()=>{
      const button=document.getElementById("operationsCopyPassdown");
      if(button){button.textContent="Copied";setTimeout(()=>button.textContent="Copy Pass-Down",1200)}
    }).catch(()=>{
      const area=document.getElementById("operationsPassdown");
      if(area){area.value=text;area.select()}
    });
    return text;
  },

  renderList(type,elementId){
    const host=document.getElementById(elementId);
    if(!host)return;
    const rows=read(KEYS[type]);
    host.innerHTML=rows.length?rows.map(row=>`
      <div class="ops-row ${row.done?"complete":""}">
        <button class="ops-check" data-ops-toggle="${escapeHtml(type)}" data-id="${escapeHtml(row.id)}" aria-label="Toggle complete">${row.done?"✓":"○"}</button>
        <div><strong>${escapeHtml(row.label)}</strong>${row.detail?`<small>${escapeHtml(row.detail)}</small>`:""}</div>
        <button class="ops-delete" data-ops-delete="${escapeHtml(type)}" data-id="${escapeHtml(row.id)}" aria-label="Delete">×</button>
      </div>
    `).join(""):`<p class="ops-empty">Nothing entered.</p>`;
  },

  render(){
    const summary=this.summary();
    const map={
      operationsIncidentCount:summary.incidents,
      operationsArrestCount:summary.arrests,
      operationsFieldBookCount:summary.fieldBook,
      operationsReportCount:summary.pendingReports,
      operationsTaskCount:summary.openTasks
    };
    Object.entries(map).forEach(([id,value])=>{
      const el=document.getElementById(id);if(el)el.textContent=value;
    });
    const next=document.getElementById("operationsNextTask");
    if(next)next.textContent=summary.nextTask?.label||"No open squad tasks";
    this.renderList("incidents","operationsIncidents");
    this.renderList("arrests","operationsArrests");
    this.renderList("fieldBook","operationsFieldBook");
    this.renderList("reports","operationsReports");
    this.renderList("tasks","operationsTasks");
    this.renderList("notes","operationsNotes");
    const passdown=document.getElementById("operationsPassdown");
    if(passdown)passdown.value=this.passdownText();
    this.publish("operations:render");
    global.IronEvents?.emit("operations:rendered",summary);
    return summary;
  },

  bind(){
    document.addEventListener("click",event=>{
      const toggle=event.target.closest("[data-ops-toggle]");
      if(toggle)this.toggle(toggle.dataset.opsToggle,toggle.dataset.id);
      const remove=event.target.closest("[data-ops-delete]");
      if(remove)this.remove(remove.dataset.opsDelete,remove.dataset.id);
      const opener=event.target.closest("[data-ops-open]");
      if(opener){
        const panel=document.getElementById(opener.dataset.opsOpen);
        if(panel)panel.open=!panel.open;
      }
    });

    document.querySelectorAll("[data-ops-form]").forEach(form=>{
      form.addEventListener("submit",event=>{
        event.preventDefault();
        const type=form.dataset.opsForm;
        const label=form.querySelector("[name=label]")?.value||"";
        const detail=form.querySelector("[name=detail]")?.value||"";
        if(this.add(type,label,detail))form.reset();
      });
    });

    document.getElementById("operationsCopyPassdown")?.addEventListener("click",()=>this.copyPassdown());
    document.getElementById("operationsClearShift")?.addEventListener("click",()=>{
      if(confirm("Clear incidents, arrests, field-book entries, and notes for this shift?"))this.clearShift();
    });
  },

  init(){
    this.bind();
    this.render();
  }
};

global.IronOperations=IronOperations;
})(window);
