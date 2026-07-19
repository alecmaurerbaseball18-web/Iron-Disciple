
(function(g){
const KEY='iron_officer_workspace';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{cases:[],court:[],reports:[]}}catch{return{cases:[],court:[],reports:[]}}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
g.IronOfficer={
init(){
 const host=document.getElementById('officerWorkspace'); if(!host)return;
 host.innerHTML=`<section class="card"><h2>Officer Workspace</h2>
 <p>Case Board, Court Tracker, Report Builder, Evidence Tracker and Supervisor tools.</p>
 <div class='dash-metrics'>
 <div><strong>${load().cases.length}</strong><span>Cases</span></div>
 <div><strong>${load().court.length}</strong><span>Court</span></div>
 <div><strong>${load().reports.length}</strong><span>Reports</span></div>
 </div>
 <textarea id='owNotes' placeholder='Quick investigative notes'></textarea>
 <button id='owSave'>Save Notes</button>
 <div id='owSaved'></div></section>`;
 document.getElementById('owSave').onclick=()=>{
   let d=load(); d.notes=document.getElementById('owNotes').value; save(d);
   document.getElementById('owSaved').textContent='Saved.';
 };
}};
})(window);
