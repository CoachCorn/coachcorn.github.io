/* Suite sync: keeps the glossary and Almanac games on this device in step with the program's server copy.
   Runs only in the shell (suite/index.html). Local data is always saved first; sync is extra.
   Glossary: merged term by term (newest change wins).
   Games: a game changed only here is sent up; changed only on another device is brought down;
   changed on both keeps both (the other device's copy is added as a separate game). */
(function(root){
 const SK='suite_sync';
 const st=()=>{try{return JSON.parse(localStorage.getItem(SK))||{}}catch(e){return{}}};
 const put=s=>{try{localStorage.setItem(SK,JSON.stringify(s))}catch(e){}};
 const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return(h>>>0).toString(36)+':'+s.length};
 const ALM='almanac_v1';
 let busy=false,timer=null,listeners=[];
 const emit=()=>listeners.forEach(f=>{try{f(status())}catch(e){}});
 function status(){const s=st();return{signedIn:!!(s.token&&s.exp>Date.now()),url:s.url,program:s.program,name:s.name,last:s.last,error:s.error,busy}}
 function device(){const s=st();if(!s.device){s.device='ipad-'+Math.random().toString(36).slice(2,8);put(s)}return s.device}
 async function call(method,path,body,auth=true){const s=st();if(!s.url)throw new Error('No server address');
  const h={'Content-Type':'application/json'};if(auth)h.Authorization='Bearer '+s.token;
  const r=await fetch(s.url.replace(/\/$/,'')+path,{method,headers:h,body:body?JSON.stringify(body):undefined});
  let j={};try{j=await r.json()}catch(e){}
  if(r.status===401&&auth){const x=st();delete x.token;x.error='Signed out. Sign in again.';put(x);emit()}
  return{status:r.status,data:j}}
 async function login(url,program,code){const s=st();s.url=url.trim().replace(/\/$/,'');s.program=program.trim().toLowerCase();put(s);
  const r=await call('POST','/login',{program:s.program,code},false);if(r.status!==200)throw new Error(r.data.error||'Sign in failed');
  const x=st();Object.assign(x,{token:r.data.token,exp:r.data.exp,name:r.data.name,error:null});put(x);emit();return r.data}
 async function setup(url,program,name,code,admin){const s=st();s.url=url.trim().replace(/\/$/,'');put(s);
  const r=await fetch(s.url+'/setup',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Key':admin},body:JSON.stringify({program,name,code})});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Setup failed');return j}
 function signOut(){const s=st();delete s.token;delete s.exp;s.error=null;put(s);emit()}

 /* --- glossary --- */
 const okGame=g=>g&&typeof g.id==='string'&&Array.isArray(g.plays);const okGl=g=>g&&Array.isArray(g.terms);
 const sig=g=>g?g.terms.map(t=>t.id+'@'+(t.updated||'')).sort().join('|'):'';
 async function syncGlossary(s,list){if(!root.GL)return;const key=GL.key(s.program);let local=GL.load(s.program);
  const srv=list.find(d=>d.key==='glossary');
  for(let tries=0;tries<3;tries++){
   let serverRev=srv&&tries===0?srv.rev:null,server=null;
   if(srv&&(srv.rev!==s.glRev||tries>0)){const r=await call('GET','/doc?key=glossary');if(r.status===200){server=okGl(r.data.body)?r.data.body:null;serverRev=r.data.rev}}
   if(server){if(!local){local=GL.migrate(server);GL.save(local)}else{const m=GL.merge(local,server);if(m.added||m.updated){GL.save(local)}}s.glRev=serverRev}
   if(!local)return;
   const base=srv||server?(serverRev||s.glRev||0):0;
   if(server&&sig(local)===sig(server)){s.glSig=sig(local);return}
   if(!server&&srv&&s.glSig===sig(local))return; // nothing new either side
   const r=await call('PUT','/doc',{key:'glossary',baseRev:base,body:local,device:device()});
   if(r.status===200){s.glRev=r.data.rev;s.glSig=sig(local);return}
   if(r.status!==409)throw new Error(r.data.error||'Glossary sync failed');
   // someone else wrote first: merge theirs and try again
   if(okGl(r.data.body)){const m=GL.merge(local,r.data.body);if(m.added||m.updated)GL.save(local)}srv&&(srv.rev=r.data.rev);s.glRev=null}
  }

 /* --- games --- */
 function almanacWin(){const f=document.querySelector('iframe[title=Almanac]');try{return f&&f.contentWindow&&f.contentWindow.syncUpsert?f.contentWindow:null}catch(e){return null}}
 async function syncGames(s,list){const w=almanacWin();if(!w)return; // the Almanac tab writes games; wait until it has loaded
  if(w.syncBusy&&w.syncBusy())return; // a play is being edited
  let A;try{A=JSON.parse(localStorage.getItem(ALM))}catch(e){A=null}if(!A||!Array.isArray(A.games))return;
  s.games=s.games||{};const upsert=[];const local=new Map(A.games.map(g=>[g.id,g]));
  for(const g of A.games){if(/^demo/i.test(g.id)||g.demo)continue;
   const key='game/'+g.id,h=hash(JSON.stringify(g)),mem=s.games[g.id],sv=list.find(d=>d.key===key);
   if(!sv){const r=await call('PUT','/doc',{key,baseRev:0,body:g,device:device()});if(r.status===200)s.games[g.id]={rev:r.data.rev,h};continue}
   if(mem&&mem.rev===sv.rev){if(mem.h!==h){const r=await call('PUT','/doc',{key,baseRev:sv.rev,body:g,device:device()});if(r.status===200)s.games[g.id]={rev:r.data.rev,h}}continue}
   const r=await call('GET','/doc?key='+encodeURIComponent(key));if(r.status!==200||!okGame(r.data.body))continue;const sb=r.data.body,sh=hash(JSON.stringify(sb));
   if(sh===h){s.games[g.id]={rev:r.data.rev,h};continue}
   if(mem&&mem.h===h){upsert.push(sb);s.games[g.id]={rev:r.data.rev,h:sh};continue} // only the other device changed it
   // both changed: keep ours, add theirs as its own game, then send ours up
   const copy=Object.assign({},sb,{id:sb.id+'-'+(r.data.device||'other').replace(/[^a-z0-9]/gi,'').slice(0,10)+'-'+Date.now().toString(36),opp:(sb.opp||'Game')+' (other iPad)'});
   if(!local.has(copy.id))upsert.push(copy);
   const p=await call('PUT','/doc',{key,baseRev:r.data.rev,body:g,device:device()});if(p.status===200)s.games[g.id]={rev:p.data.rev,h}}
  for(const d of list){if(!d.key.startsWith('game/'))continue;const id=d.key.slice(5);if(local.has(id)||(s.games[id]&&s.games[id].gone))continue;
   if(s.games[id]&&!local.has(id)){s.games[id].gone=true;continue} // deleted on this device: leave it deleted here
   const r=await call('GET','/doc?key='+encodeURIComponent(d.key));if(r.status===200&&okGame(r.data.body)){upsert.push(r.data.body);s.games[id]={rev:r.data.rev,h:hash(JSON.stringify(r.data.body))}}}
  if(upsert.length){w.syncUpsert(upsert);for(const g of upsert)if(!s.games[g.id])s.games[g.id]={rev:0,h:hash(JSON.stringify(g))}}}

 async function syncNow(){const s0=st();if(busy||!s0.token||!(s0.exp>Date.now())||!navigator.onLine)return emit();busy=true;emit();
  try{const s=st();const lr=await call('GET','/docs');if(lr.status!==200)throw new Error(lr.data.error||'Server error');
   const list=lr.data.docs||[];await syncGlossary(s,list);await syncGames(s,list);
   const x=st();Object.assign(x,{glRev:s.glRev,glSig:s.glSig,games:s.games,last:Date.now(),error:null});put(x)}
  catch(e){const x=st();x.error=e.message||'Sync failed';put(x)}
  finally{busy=false;emit()}}
 function soon(ms=4000){clearTimeout(timer);timer=setTimeout(syncNow,ms)}
 function start(){addEventListener('online',()=>soon(1000));addEventListener('storage',e=>{if(e.key===ALM||(e.key&&e.key.indexOf('glossary_v1_')===0))soon()});
  setInterval(()=>soon(0),60000);soon(3000)}
 root.SUITESYNC={status,login,setup,signOut,syncNow,start,onChange:f=>listeners.push(f)};
})(window);
