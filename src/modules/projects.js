(function(global){
"use strict";

const STORAGE_KEY="iron_projects_v4";
const CATEGORIES=["Home","Fitness","Golf","Softball","Work","Faith","Other"];

function read(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{return []}
}
function write(items){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(items));
  return items;
}
function uid(){
  return crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
}
function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g,ch=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[ch]);
}
function normalizeProject(input={}){
  return {
    id:input.id||uid(),
    title:String(input.title||"Untitled Project").trim(),
    category:CATEGORIES.includes(input.category)?input.category:"Other",
    status:["planned","active","blocked","complete"].includes(input.status)?input.status:"planned",
    priority:["high","medium","low"].includes(input.priority)?input.priority:"medium",
    dueDate:input.dueDate||"",
    nextAction:String(input.nextAction||"").trim(),
    notes:String(input.notes||"").trim(),
    createdAt:input.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
}

const IronProjects={
  version:"4.0.0-alpha.5",

  all(){
    return read();
  },

  add(input){
    const project=normalizeProject(input);
    const items=read();
    items.unshift(project);
    write(items);
    this.publish("projects:add");
    this.render();
    return project;
  },

  update(id,patch={}){
    const items=read().map(item=>item.id===id?normalizeProject({...item,...patch,id:item.id,createdAt:item.createdAt}):item);
    write(items);
    this.publish("projects:update");
    this.render();
  },

  remove(id){
    write(read().filter(item=>item.id!==id));
    this.publish("projects:remove");
    this.render();
  },

  cycleStatus(id){
    const order=["planned","active","blocked","complete"];
    const item=read().find(x=>x.id===id);
    if(!item)return;
    const next=order[(order.indexOf(item.status)+1)%order.length];
    this.update(id,{status:next});
  },

  summary(){
    const items=read();
    const counts={planned:0,active:0,blocked:0,complete:0};
    items.forEach(item=>counts[item.status]=(counts[item.status]||0)+1);
    const next=items
      .filter(x=>x.status!=="complete")
      .sort((a,b)=>{
        const p={high:0,medium:1,low:2};
        return (p[a.priority]??9)-(p[b.priority]??9);
      })[0]||null;
    return {
      total:items.length,
      ...counts,
      nextProject:next,
      updatedAt:new Date().toISOString()
    };
  },

  publish(source="projects:update"){
    const projects=read();
    const summary=this.summary();
    global.AppState?.batch({
      "projects.items":projects,
      "projects.summary":summary
    },{source});
    global.IronEvents?.emit("projects:updated",{projects,summary});
    return {projects,summary};
  },

  render(){
    const host=document.getElementById("projectsList");
    if(!host)return;

    const filter=document.getElementById("projectsFilter")?.value||"all";
    const items=read().filter(item=>filter==="all"||item.status===filter);

    const summary=this.summary();
    const countMap={
      projectsTotalCount:summary.total,
      projectsActiveCount:summary.active,
      projectsBlockedCount:summary.blocked,
      projectsCompleteCount:summary.complete
    };
    Object.entries(countMap).forEach(([id,value])=>{
      const el=document.getElementById(id);
      if(el)el.textContent=value;
    });

    const next=document.getElementById("projectsNextAction");
    if(next){
      next.textContent=summary.nextProject
        ?`${summary.nextProject.title}${summary.nextProject.nextAction?` — ${summary.nextProject.nextAction}`:""}`
        :"No open projects";
    }

    host.innerHTML=items.length?items.map(item=>`
      <article class="project-card ${escapeHtml(item.status)}">
        <div class="project-topline">
          <span class="project-category">${escapeHtml(item.category)}</span>
          <span class="project-priority ${escapeHtml(item.priority)}">${escapeHtml(item.priority)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        ${item.nextAction?`<p><strong>Next:</strong> ${escapeHtml(item.nextAction)}</p>`:""}
        ${item.dueDate?`<p><strong>Due:</strong> ${escapeHtml(item.dueDate)}</p>`:""}
        ${item.notes?`<small>${escapeHtml(item.notes)}</small>`:""}
        <div class="project-actions">
          <button data-project-status="${escapeHtml(item.id)}">${escapeHtml(item.status)}</button>
          <button data-project-edit="${escapeHtml(item.id)}">Edit</button>
          <button data-project-delete="${escapeHtml(item.id)}">Delete</button>
        </div>
      </article>
    `).join(""):`<p class="ops-empty">No projects in this view.</p>`;

    this.publish("projects:render");
    global.IronEvents?.emit("projects:rendered",summary);
  },

  fillForm(item){
    const form=document.getElementById("projectForm");
    if(!form)return;
    form.elements.id.value=item.id||"";
    form.elements.title.value=item.title||"";
    form.elements.category.value=item.category||"Home";
    form.elements.status.value=item.status||"planned";
    form.elements.priority.value=item.priority||"medium";
    form.elements.dueDate.value=item.dueDate||"";
    form.elements.nextAction.value=item.nextAction||"";
    form.elements.notes.value=item.notes||"";
    form.scrollIntoView({behavior:"smooth",block:"start"});
  },

  bind(){
    document.getElementById("projectForm")?.addEventListener("submit",event=>{
      event.preventDefault();
      const form=event.currentTarget;
      const data=Object.fromEntries(new FormData(form).entries());
      if(!String(data.title||"").trim())return;
      if(data.id)this.update(data.id,data);
      else this.add(data);
      form.reset();
      form.elements.id.value="";
    });

    document.getElementById("projectFormReset")?.addEventListener("click",()=>{
      const form=document.getElementById("projectForm");
      form?.reset();
      if(form)form.elements.id.value="";
    });

    document.getElementById("projectsFilter")?.addEventListener("change",()=>this.render());

    document.addEventListener("click",event=>{
      const status=event.target.closest("[data-project-status]");
      if(status)this.cycleStatus(status.dataset.projectStatus);

      const edit=event.target.closest("[data-project-edit]");
      if(edit){
        const item=read().find(x=>x.id===edit.dataset.projectEdit);
        if(item)this.fillForm(item);
      }

      const remove=event.target.closest("[data-project-delete]");
      if(remove&&confirm("Delete this project?"))this.remove(remove.dataset.projectDelete);
    });
  },

  seed(){
    if(read().length)return;
    write([
      normalizeProject({title:"Dog Wash Station",category:"Home",status:"active",priority:"high",nextAction:"Confirm hinge and lid support placement"}),
      normalizeProject({title:"Charity Tournament Preparation",category:"Fitness",status:"active",priority:"high",nextAction:"Complete today’s training and nutrition targets"}),
      normalizeProject({title:"Golf Swing Development",category:"Golf",status:"active",priority:"medium",nextAction:"Practice takeaway and chest-turn drill"}),
      normalizeProject({title:"C Squad Operations",category:"Work",status:"active",priority:"high",nextAction:"Complete shift pass-down"})
    ]);
  },

  init(){
    this.seed();
    this.bind();
    this.render();
  }
};

global.IronProjects=IronProjects;
})(window);
