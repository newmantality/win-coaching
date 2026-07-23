
const PROFILE_KEY='project_win_profile_v2';
const INVITE_KEY='project_win_invites_v2';
function getProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{return null}}
function saveProfile(profile){localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));applyProfile(profile)}
function getInvites(){try{return JSON.parse(localStorage.getItem(INVITE_KEY)||'[]')}catch{return[]}}
function setInvites(invites){localStorage.setItem(INVITE_KEY,JSON.stringify(invites));renderInvites()}
function initials(name='Coach'){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join('')||'C'}
function applyProfile(profile){
  if(!profile)return;
  $('#workspaceLabel').textContent=profile.organization;
  $('#profileBtn').textContent=initials(profile.name);
  const teams=[profile.primaryTeam||'Varsity','JV','Freshman'];
  $('#teamSwitcher').innerHTML=[...new Set(teams)].map(t=>`<option ${t===profile.activeTeam?'selected':''}>${escapeHtml(t)}</option>`).join('');
  markActiveTeam(profile.activeTeam||profile.primaryTeam||'Varsity');
}
function markActiveTeam(team){$$('.team-card').forEach(c=>c.classList.toggle('active-team',$('h3',c)?.textContent===team))}
function openSetup(){const p=getProfile();$('#coachName').value=p?.name||'';$('#orgName').value=p?.organization||'';$('#coachRole').value=p?.role||'Head Coach';$('#primaryTeam').value=p?.primaryTeam||'Varsity';$('#onboarding').classList.remove('hidden')}
function closeSetup(){if(getProfile())$('#onboarding').classList.add('hidden')}
function renderInvites(){const list=$('#inviteList');if(!list)return;const invites=getInvites();list.innerHTML=invites.length?invites.map(i=>`<div class="invite-item"><span>${escapeHtml(i.email)} • ${escapeHtml(i.team)}</span><strong>Pending</strong></div>`).join(''):'<p class="empty">No pending invitations.</p>'}
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE_KEY='project_win_plays_v1';
let generatedPlay=null;
let customPositions=[{n:1,x:50,y:78},{n:2,x:20,y:60},{n:3,x:80,y:60},{n:4,x:32,y:30},{n:5,x:68,y:30}];

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function getPlays(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
function setPlays(plays){localStorage.setItem(STORAGE_KEY,JSON.stringify(plays));renderAll()}
function uid(){return crypto?.randomUUID?.() || Date.now().toString(36)}
function escapeHtml(v=''){return v.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function courtSVG(positions, arrows=[]){return `<svg class="court" viewBox="0 0 600 420" role="img" aria-label="Basketball play diagram">
<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#162039"/></marker></defs>
<rect width="600" height="420" fill="#c88f56"/><path d="M0 395H600M150 395V250H450V395M225 395A75 75 0 0 1 375 395M115 395A185 185 0 0 1 485 395" fill="none" stroke="#f8ead7" stroke-width="5"/><rect x="260" y="381" width="80" height="5" fill="#162039"/><circle cx="300" cy="335" r="6" fill="#162039"/>
${arrows.map(a=>`<path d="M${a.x1} ${a.y1} Q ${a.cx} ${a.cy} ${a.x2} ${a.y2}" fill="none" stroke="#162039" stroke-width="6" stroke-dasharray="${a.dash?'12 10':'0'}" marker-end="url(#arrow)"/>`).join('')}
${positions.map(p=>`<g class="player" data-n="${p.n}" transform="translate(${p.x/100*600},${p.y/100*420})"><circle r="24" fill="#0b1020" stroke="#72e2a7" stroke-width="5"/><text text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="900" fill="#fff">${p.n}</text></g>`).join('')}</svg>`}
function autoName(situation,goal){const map={'Half-court offense':'Flow','Baseline out of bounds':'Baseline','Sideline out of bounds':'Sideline','After timeout':'ATO','Press break':'Escape','Last-second shot':'Final'};const g={'Open three':'Flare','Layup':'Dive','Post touch':'Seal','Best player isolation':'Clear','Backdoor cut':'Backdoor'};return `${map[situation]} ${g[goal]}`}
function buildPlay(data){const base=[{n:1,x:50,y:76},{n:2,x:18,y:58},{n:3,x:82,y:58},{n:4,x:34,y:30},{n:5,x:66,y:30}];let arrows=[];let steps=[];
if(data.goal==='Open three'){arrows=[{x1:300,y1:315,cx:260,cy:235,x2:180,y2:180},{x1:400,y1:125,cx:465,cy:170,x2:500,y2:245,dash:true},{x1:110,y1:245,cx:160,cy:200,x2:250,y2:170}];steps=['1 enters to 4 and cuts through.','5 screens the weak-side defender.','2 uses the screen and lifts behind the arc.','4 skips the ball to 2 for the shot.'];}
else if(data.goal==='Layup'){arrows=[{x1:300,y1:315,cx:380,cy:260,x2:390,y2:170},{x1:400,y1:125,cx:350,cy:190,x2:300,y2:250,dash:true},{x1:190,y1:125,cx:240,cy:170,x2:300,y2:210}];steps=['5 sets a high ball screen for 1.','1 attacks the paint.','4 dives behind the help defender.','1 finishes or drops the pass to 4.'];}
else if(data.goal==='Post touch'){arrows=[{x1:490,y1:245,cx:430,cy:210,x2:405,y2:150},{x1:200,y1:125,cx:250,cy:125,x2:300,y2:145,dash:true},{x1:300,y1:315,cx:370,cy:270,x2:470,y2:240}];steps=['3 feeds the wing.','5 seals on the strong-side block.','1 clears to improve the passing angle.','Wing enters to 5 and spaces for the kick-out.'];}
else if(data.goal==='Backdoor cut'){arrows=[{x1:110,y1:245,cx:150,cy:180,x2:250,y2:120},{x1:300,y1:315,cx:220,cy:260,x2:120,y2:235},{x1:400,y1:125,cx:370,cy:180,x2:330,y2:230,dash:true}];steps=['2 lifts and sells the catch.','1 dribbles toward 2.','2 plants and cuts backdoor.','1 delivers the bounce pass at the rim.'];}
else{arrows=[{x1:300,y1:315,cx:360,cy:260,x2:420,y2:210},{x1:400,y1:125,cx:350,cy:180,x2:310,y2:230,dash:true}];steps=['Clear one side of the floor.','5 screens for the best player.','Attack the mismatch with spacing.','Weak-side players stay ready for the kick-out.'];}
return {id:uid(),name:data.name||autoName(data.situation,data.goal),type:'AI Generated',sport:'Basketball',situation:data.situation,defense:data.defense,goal:data.goal,strength:data.strength,positions:base,arrows,steps,notes:['Play with pace.','Screen with contact and proper angle.','Make the simple read based on help defense.'],createdAt:new Date().toISOString()}}
function showView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-item,.mobile-nav').forEach(n=>n.classList.toggle('active',n.dataset.view===id));$('#sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'})}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));$$('[data-go]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)));$('#menuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#profileBtn').addEventListener('click',openSetup);
$('#finishSetup').addEventListener('click',()=>{const name=$('#coachName').value.trim();const organization=$('#orgName').value.trim();const primaryTeam=$('#primaryTeam').value.trim()||'Varsity';if(!name||!organization)return toast('Enter your name and organization');saveProfile({name,organization,role:$('#coachRole').value,primaryTeam,activeTeam:getProfile()?.activeTeam||primaryTeam});closeSetup();toast('Workspace ready')});
$('#teamSwitcher').addEventListener('change',e=>{const p=getProfile();if(!p)return;p.activeTeam=e.target.value;saveProfile(p);toast(`Switched to ${p.activeTeam}`)});
$$('.open-team').forEach(b=>b.addEventListener('click',()=>{const p=getProfile()||{name:'Coach',organization:'Project WIN',role:'Head Coach',primaryTeam:b.dataset.team};p.activeTeam=b.dataset.team;saveProfile(p);showView('dashboard');toast(`${b.dataset.team} selected`)}));
$('#inviteCoach').addEventListener('click',()=>{const email=$('#inviteEmail').value.trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return toast('Enter a valid email');const invites=getInvites();invites.unshift({email,team:$('#inviteTeam').value,createdAt:new Date().toISOString()});setInvites(invites);$('#inviteEmail').value='';toast('Invite saved for launch')});

function normalizeAIPlay(play){
  const positions=(play.positions||[]).map((p,i)=>({n:Number(p.n)||i+1,x:Number(p.x)||50,y:Number(p.y)||50}));
  const arrows=(play.arrows||[]).map(a=>{const x1=Number(a.x1)||50,y1=Number(a.y1)||50,x2=Number(a.x2)||50,y2=Number(a.y2)||50;return {x1:x1/100*600,y1:y1/100*420,x2:x2/100*600,y2:y2/100*420,cx:(x1+x2)/200*600,cy:(y1+y2)/200*420-(a.type==='screen'?0:25),dash:a.type==='screen'};});
  return {...play,id:uid(),type:'AI Generated',sport:'Basketball',positions,arrows,createdAt:new Date().toISOString()};
}
function displayGenerated(play){generatedPlay=play;$('#generatedTitle').textContent=play.name;$('#generatedTag').textContent=play.source==='ai'?'Live AI':'Demo';$('#generatedCourt').innerHTML=courtSVG(play.positions,play.arrows||[]);$('#generatedDetails').classList.remove('empty');$('#generatedDetails').innerHTML=`<h3>Sequence</h3><ol>${play.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol><h3>Coaching points</h3><ul>${(play.notes||[]).map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ul>${play.counters?.length?`<h3>Counters</h3><ul>${play.counters.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ul>`:''}`;$('#saveGenerated').disabled=false;$('#shareGenerated').disabled=false;}
$('#generatorForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=$('#generateBtn');btn.disabled=true;btn.textContent='Coach Copilot is designing…';$('#generatorMessage').textContent='Reading the defense, goal, and personnel…';
  const payload={prompt:$('#aiPrompt').value.trim(),situation:$('#situation').value,defense:$('#defense').value,goal:$('#goal').value,strength:$('#strength').value,name:$('#playName').value.trim()};
  try{
    const r=await fetch('/api/generate-play',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok)throw new Error(data.error||'AI request failed');displayGenerated(normalizeAIPlay(data.play));$('#generatorMessage').textContent='Generated by WIN Coach Copilot.';toast('AI play generated');
  }catch(err){
    const demo=buildPlay(payload);demo.source='demo';demo.counters=['If the defense switches, slip the screen and attack the mismatch.'];displayGenerated(demo);$('#generatorMessage').textContent=`Demo mode: ${err.message}`;toast('Demo play shown — connect AI to go live');
  }finally{btn.disabled=false;btn.textContent='Generate AI play';}
});
async function checkAI(){try{const r=await fetch('/api/status');const d=await r.json();$('#aiStatus').textContent=d.aiConnected?'AI Connected':'Demo Mode';$('#aiStatus').classList.toggle('connected',d.aiConnected)}catch{$('#aiStatus').textContent='Static Preview'}}
checkAI();
$('#saveGenerated').addEventListener('click',()=>{if(!generatedPlay)return;const plays=getPlays();plays.unshift({...generatedPlay,id:uid()});setPlays(plays);toast('Saved to playbook')});
$('#shareGenerated').addEventListener('click',()=>generatedPlay&&sharePlay(generatedPlay));

function renderCustomCourt(){const wrap=$('#customCourt');wrap.innerHTML=courtSVG(customPositions);const svg=$('svg',wrap);let active=null;
$$('.player',svg).forEach(g=>{g.style.cursor='grab';g.addEventListener('pointerdown',e=>{active=g.dataset.n;g.setPointerCapture(e.pointerId)});g.addEventListener('pointermove',e=>{if(active!==g.dataset.n)return;const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const local=pt.matrixTransform(svg.getScreenCTM().inverse());const p=customPositions.find(x=>String(x.n)===active);p.x=Math.max(4,Math.min(96,local.x/600*100));p.y=Math.max(5,Math.min(95,local.y/420*100));g.setAttribute('transform',`translate(${local.x},${local.y})`)});g.addEventListener('pointerup',()=>active=null)});}
$('#resetPlayers').addEventListener('click',()=>{customPositions=[{n:1,x:50,y:78},{n:2,x:20,y:60},{n:3,x:80,y:60},{n:4,x:32,y:30},{n:5,x:68,y:30}];renderCustomCourt()});
$('#saveCustom').addEventListener('click',()=>{const play={id:uid(),name:$('#customName').value.trim()||'Custom Play',type:'Custom',sport:'Basketball',situation:'Custom',positions:JSON.parse(JSON.stringify(customPositions)),arrows:[],steps:$('#customSteps').value.split('\n').map(s=>s.replace(/^\d+\.\s*/,'' )).filter(Boolean),notes:$('#customNotes').value.split('\n').filter(Boolean),createdAt:new Date().toISOString()};const plays=getPlays();plays.unshift(play);setPlays(plays);toast('Custom play saved')});

async function sharePlay(play){const payload=btoa(unescape(encodeURIComponent(JSON.stringify(play))));const url=`${location.origin}${location.pathname}#share=${encodeURIComponent(payload)}`;const text=`${play.name} — player play view`;
try{if(navigator.share){await navigator.share({title:play.name,text,url})}else{await navigator.clipboard.writeText(url);toast('Share link copied')}}catch(e){if(e.name!=='AbortError')toast('Unable to share on this browser')}}
function deletePlay(id){setPlays(getPlays().filter(p=>p.id!==id));toast('Play removed')}
function renderPlaybook(){const plays=getPlays();const grid=$('#playbookGrid');if(!plays.length){grid.innerHTML='<div class="card empty">Your playbook is empty. Generate or draw your first play.</div>';return}grid.innerHTML=plays.map(p=>`<article class="card play-card"><div class="mini-court">${courtSVG(p.positions,p.arrows||[])}</div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.type)} • ${escapeHtml(p.situation||'Basketball')}</p><div class="actions"><button class="secondary share-one" data-id="${p.id}">Share</button><button class="danger delete-one" data-id="${p.id}">Delete</button></div></article>`).join('');$$('.share-one',grid).forEach(b=>b.addEventListener('click',()=>sharePlay(plays.find(p=>p.id===b.dataset.id))));$$('.delete-one',grid).forEach(b=>b.addEventListener('click',()=>deletePlay(b.dataset.id)))}
function renderDashboard(){const plays=getPlays();$('#savedCount').textContent=plays.length;const ai=plays.filter(p=>p.type==='AI Generated').length;const aiEl=$('#aiCount');if(aiEl)aiEl.textContent=ai;const profile=getProfile();const greeting=$('#greetingName');if(greeting)greeting.textContent=profile?.name||'Coach';const r=$('#recentPlays');r.classList.toggle('empty',!plays.length);r.innerHTML=plays.length?plays.slice(0,4).map(p=>`<article class="recent-play-card" data-go="playbook"><div class="mini-court">${courtSVG(p.positions,p.arrows||[])}</div><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.situation||'Basketball')}</span></article>`).join(''):'No plays saved yet. Generate your first play.';$$('[data-go]',r).forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)))}
function renderAll(){renderDashboard();renderPlaybook()}
$('#sharePlaybook').addEventListener('click',async()=>{const plays=getPlays();if(!plays.length)return toast('Save a play first');const payload=btoa(unescape(encodeURIComponent(JSON.stringify({name:'Shared Playbook',plays}))));const url=`${location.origin}${location.pathname}#book=${encodeURIComponent(payload)}`;try{if(navigator.share)await navigator.share({title:'Shared Playbook',url});else{await navigator.clipboard.writeText(url);toast('Playbook link copied')}}catch(e){if(e.name!=='AbortError')toast('Unable to share')}})

let currentPractice=[];
function buildPracticePlan(){
 const focus=$('#practiceFocus').value;
 const maps={
  'Game preparation':[['Dynamic warm-up',10],['Opponent actions walkthrough',15],['Shell defense',15],['Special situations',15],['Controlled scrimmage',25],['Free throws and review',10]],
  'Shooting and skill development':[['Ball handling warm-up',10],['Form shooting',10],['Finishing series',15],['Game-speed shooting',20],['Advantage games',20],['Competitive shooting',15]],
  'Defense and rebounding':[['Movement prep',10],['Closeout technique',15],['Shell defense',20],['Rebounding wars',15],['Transition defense',15],['Live play',15]],
  'Offensive installation':[['Warm-up and passing',10],['Teach new action',20],['Breakdown reads',15],['5-on-0 execution',15],['Guided defense',15],['Live scrimmage',15]],
  'Recovery practice':[['Mobility',10],['Light shooting',20],['Film and teaching',20],['Walkthrough',20],['Free throws',10],['Team review',10]]
 };
 currentPractice=(maps[focus]||maps['Game preparation']).map(([name,min],i)=>({id:uid(),name,min,note:i===0?'Set the tone and communicate.':'Coach the day’s primary emphasis.'}));
 renderPractice();toast('Practice plan built');
}
function renderPractice(){const wrap=$('#practiceBlocks');if(!wrap)return;wrap.innerHTML=currentPractice.map((b,i)=>`<div class="practice-block"><strong>${b.min} min</strong><div><b>${escapeHtml(b.name)}</b><span>${escapeHtml(b.note)}</span></div><button class="danger remove-block" data-i="${i}">×</button></div>`).join('')||'<div class="empty">Choose a focus and build your practice.</div>';$('#sharePractice').disabled=!currentPractice.length;$$('.remove-block',wrap).forEach(b=>b.addEventListener('click',()=>{currentPractice.splice(Number(b.dataset.i),1);renderPractice()}));}
$('#buildPractice')?.addEventListener('click',buildPracticePlan);
$('#addPracticeBlock')?.addEventListener('click',()=>{currentPractice.push({id:uid(),name:'New practice block',min:10,note:'Add your coaching emphasis.'});renderPractice()});
$('#sharePractice')?.addEventListener('click',async()=>{const title=$('#practiceTitle').value||'Practice Plan';const text=title+'\n'+currentPractice.map(b=>`${b.min} min — ${b.name}`).join('\n');try{if(navigator.share)await navigator.share({title,text});else{await navigator.clipboard.writeText(text);toast('Practice plan copied')}}catch(e){if(e.name!=='AbortError')toast('Unable to share')}});
const dateInput=$('#practiceDate');if(dateInput)dateInput.value=new Date().toISOString().slice(0,10);
function loadShared(){const hash=location.hash;if(!hash)return false;try{if(hash.startsWith('#share=')){const play=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(hash.slice(7))))));document.body.innerHTML=`<main class="main"><article class="card"><p class="eyebrow">PLAYER VIEW</p><h1>${escapeHtml(play.name)}</h1><div class="court-wrap">${courtSVG(play.positions,play.arrows||[])}</div><h2>Steps</h2><ol>${play.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol><h2>Coaching points</h2><ul>${(play.notes||[]).map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ul></article></main>`;return true}if(hash.startsWith('#book=')){const book=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(hash.slice(6))))));document.body.innerHTML=`<main class="main"><p class="eyebrow">PLAYER PLAYBOOK</p><h1>${escapeHtml(book.name)}</h1><div class="playbook-grid">${book.plays.map(p=>`<article class="card play-card"><div class="mini-court">${courtSVG(p.positions,p.arrows||[])}</div><h3>${escapeHtml(p.name)}</h3><ol>${p.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol></article>`).join('')}</div></main>`;return true}}catch(e){console.error(e)}return false}
if(!loadShared()){renderCustomCourt();renderAll();renderInvites();const p=getProfile();if(p){applyProfile(p);closeSetup()}else{openSetup()}}
