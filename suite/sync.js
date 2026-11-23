/* Suite sync: keeps the glossary and Almanac games on this device in step with the program's server copy.
   Runs only in the shell (suite/index.html). Local data is always saved first; sync is extra.
   Glossary: merged term by term (newest change wins).
   Games: a game changed only here is sent up; changed only on another device is brought down;
   changed on both is merged play by play (plays carry permanent ids). */
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
 const okGame=g=>g&&typeof g.id==='string'&&Array.isArray(g.plays);
 /* A game tombstone is {deleted:true}. A game's own "deleted" field is an ARRAY of deleted play ids (undo, delete play),
    which must never be read as "the game was deleted" (that was the 11/22-11/23 disappearing-game bug). */
 const isTomb=b=>!!b&&b.deleted===true;
 const newest=g=>Math.max(g.upd||0,...(g.plays||[]).map(p=>p.upd||p.ts||0));const okGl=g=>g&&Array.isArray(g.terms);
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
 /* Merge two copies of one game play by play: every play from both sides, newest edit of each play,
    deletions on either side win, plays in the order they were logged. Other game fields: ours, filling gaps from theirs. */
 function mergeGame(a,b){const fix=g=>Object.assign({},g,{plays:(g.plays||[]).map((p,k)=>p.pid?p:Object.assign({},p,{pid:'o'+k,ts:k}))});a=fix(a);b=fix(b);
  const out=Object.assign({},b,a);const del=new Set([...(a.deleted||[]),...(b.deleted||[])]);
  const by=new Map();for(const p of [...b.plays,...a.plays]){const q=by.get(p.pid);if(!q||(p.upd||0)>=(q.upd||0))by.set(p.pid,p)}
  const plays=[...by.values()].filter(p=>!del.has(p.pid)).sort((x,y)=>(x.ts||0)-(y.ts||0)||String(x.pid).localeCompare(String(y.pid)));
  out.plays=plays;out.deleted=[...del];
  if(a.scout||b.scout)out.scout=((a.scout&&a.scout.at)||0)>=((b.scout&&b.scout.at)||0)?(a.scout||b.scout):b.scout;
  return out}
 async function syncGames(s,list){const w=almanacWin();if(!w)return; // the Almanac tab writes games; wait until it has loaded
  if(w.syncBusy&&w.syncBusy())return; // a play is being edited
  let A;try{A=JSON.parse(localStorage.getItem(ALM))}catch(e){A=null}if(!A||!Array.isArray(A.games))return;
  s.games=s.games||{};
  if((s.gv||0)<2){for(const id in s.games)if(s.games[id]&&s.games[id].gone)delete s.games[id];s.gv=2} // re-check games the old bug hid
  const upsert=[],remove=[],local=new Map(A.games.map(g=>[g.id,g])),dels=new Map((A.delGames||[]).map(x=>[x.id,x.at||0]));
  for(const g of A.games){if(/^demo/i.test(g.id)||g.demo)continue;
   const key='game/'+g.id,h=hash(JSON.stringify(g)),mem=s.games[g.id],sv=list.find(d=>d.key===key);
   if(!sv){const r=await call('PUT','/doc',{key,baseRev:0,body:g,device:device()});if(r.status===200)s.games[g.id]={rev:r.data.rev,h};continue}
   if(mem&&mem.rev===sv.rev){if(mem.h!==h){const r=await call('PUT','/doc',{key,baseRev:sv.rev,body:g,device:device()});if(r.status===200)s.games[g.id]={rev:r.data.rev,h};else if(r.status===409)delete s.games[g.id]}continue}
   // the server copy changed since we last saw it: merge it with ours play by play
   for(let tries=0;tries<3;tries++){
    const r=await call('GET','/doc?key='+encodeURIComponent(key));if(r.status!==200||!r.data.body)break;const b=r.data.body;
    if(isTomb(b)){
     if(newest(g)>(b.upd||0)){const p=await call('PUT','/doc',{key,baseRev:r.data.rev,body:g,device:device()});if(p.status===200){s.games[g.id]={rev:p.data.rev,h};break}if(p.status!==409)break;continue} // edited here after the delete: keep it
     remove.push(g.id);s.games[g.id]={rev:r.data.rev,gone:true};break}   // deleted on another device (Recently deleted keeps it 7 days)
    if(!okGame(b))break;
    const m=mergeGame(g,b),mh=hash(JSON.stringify(m)),sh=hash(JSON.stringify(b));
    if(mh!==h){upsert.push(m);Object.assign(g,m)}
    if(mh===sh){s.games[g.id]={rev:r.data.rev,h:mh};break}
    const p=await call('PUT','/doc',{key,baseRev:r.data.rev,body:m,device:device()});
    if(p.status===200){s.games[g.id]={rev:p.data.rev,h:mh};break}if(p.status!==409)break}}
  for(const d of list){if(!d.key.startsWith('game/'))continue;const id=d.key.slice(5),mem=s.games[id];if(local.has(id))continue;
   if(mem&&mem.gone&&mem.rev===d.rev)continue;
   const r=await call('GET','/doc?key='+encodeURIComponent(d.key));if(r.status!==200||!r.data.body)continue;const b=r.data.body;
   if(isTomb(b)){s.games[id]={rev:r.data.rev,gone:true};continue}
   if(!okGame(b))continue;
   if(dels.has(id)&&newest(b)<=dels.get(id)){   // the coach deleted it here (explicitly): tell the server, unless it was edited elsewhere after that
    const p=await call('PUT','/doc',{key:d.key,baseRev:r.data.rev,body:{id,deleted:true,plays:[],upd:dels.get(id)},device:device()});if(p.status===200)s.games[id]={rev:p.data.rev,gone:true};continue}
   upsert.push(b);s.games[id]={rev:r.data.rev,h:hash(JSON.stringify(b))}}   // on the server but not here: bring it down (never inferred as a delete)
  if(remove.length&&w.syncRemove)w.syncRemove(remove);
  if(upsert.length){w.syncUpsert(upsert);for(const g of upsert)if(!s.games[g.id])s.games[g.id]={rev:0,h:hash(JSON.stringify(g))}}}

 /* --- schedule: rows merged by id, newest edit wins, deletions stick --- */
 const SCH=()=>'schedule_v1_'+(st().program||'deer-creek');
 function mergeRows(a,b){const del=new Set([...(a.deleted||[]),...(b.deleted||[])]),by=new Map();
  for(const r of [...(b.rows||[]),...(a.rows||[])]){const q=by.get(r.id);if(!q||(r.upd||0)>=(q.upd||0))by.set(r.id,r)}
  return{rows:[...by.values()].filter(r=>!del.has(r.id)).sort((x,y)=>String(x.date||'').localeCompare(String(y.date||''))),deleted:[...del]}}
 async function syncSchedule(s,list){let local=null;try{local=JSON.parse(localStorage.getItem(SCH()))}catch(e){}
  const sv=list.find(d=>d.key==='schedule');const lh=local?hash(JSON.stringify(local)):'';
  if(!sv){if(local){const r=await call('PUT','/doc',{key:'schedule',baseRev:0,body:local,device:device()});if(r.status===200){s.schRev=r.data.rev;s.schH=lh}}return}
  if(sv.rev===s.schRev&&lh===s.schH)return;
  for(let t=0;t<3;t++){const r=await call('GET','/doc?key=schedule');if(r.status!==200)return;const srv=r.data.body||{rows:[]};
   const m=local?mergeRows(local,srv):srv,mh=hash(JSON.stringify(m));
   if(mh!==lh){localStorage.setItem(SCH(),JSON.stringify(m));local=m;dispatchSch()}
   if(mh===hash(JSON.stringify(srv))){s.schRev=r.data.rev;s.schH=mh;return}
   const p=await call('PUT','/doc',{key:'schedule',baseRev:r.data.rev,body:m,device:device()});if(p.status===200){s.schRev=p.data.rev;s.schH=mh;return}if(p.status!==409)return}}
 function dispatchSch(){document.querySelectorAll('iframe').forEach(f=>{try{f.contentWindow.postMessage({schedule:'changed'},location.origin)}catch(e){}})}


 /* --- gameplan: whole plans merged by id, newest edit wins, deletions stick --- */
 const GPK=()=>'gameplan_v1_'+(st().program||'deer-creek');
 function mergePlans(a,b){const del=new Set([...(a.deleted||[]),...(b.deleted||[])]),by=new Map();
  for(const r of [...(b.rows||[]),...(a.rows||[])]){const q=by.get(r.id);if(!q||(r.upd||0)>=(q.upd||0))by.set(r.id,r)}
  return{rows:[...by.values()].filter(r=>!del.has(r.id)),deleted:[...del]}}
 function gpNotify(){document.querySelectorAll('iframe').forEach(f=>{try{f.contentWindow.postMessage({gameplan:'changed'},location.origin)}catch(e){}})}
 async function syncGameplan(s,list){let local=null;try{local=JSON.parse(localStorage.getItem(GPK()))}catch(e){}
  /* the demo (sample) plan is only for a device that is not signed in: signing in removes it and loads the coaches' plans */
  if(local&&(local.rows||[]).some(r=>r.sample)){local={rows:local.rows.filter(r=>!r.sample),deleted:local.deleted||[]};try{localStorage.setItem(GPK(),JSON.stringify(local))}catch(e){}gpNotify()}
  const sv=list.find(d=>d.key==='gameplan');const lh=local?hash(JSON.stringify(local)):'';
  if(!sv){if(local&&(local.rows.length||(local.deleted||[]).length)){const r=await call('PUT','/doc',{key:'gameplan',baseRev:0,body:local,device:device()});if(r.status===200){s.gpRev=r.data.rev;s.gpH=lh}else throw new Error('Gameplans did not sync: '+((r.data&&r.data.error)||r.status))}return}
  if(sv.rev===s.gpRev&&lh===s.gpH)return;
  for(let t=0;t<3;t++){const r=await call('GET','/doc?key=gameplan');if(r.status!==200)return;const srv=r.data.body||{rows:[],deleted:[]};
   const m=local?mergePlans(local,srv):srv,mh=hash(JSON.stringify(m));
   if(mh!==lh){localStorage.setItem(GPK(),JSON.stringify(m));local=m;gpNotify()}
   if(mh===hash(JSON.stringify(srv))){s.gpRev=r.data.rev;s.gpH=mh;return}
   const p=await call('PUT','/doc',{key:'gameplan',baseRev:r.data.rev,body:m,device:device()});if(p.status===200){s.gpRev=p.data.rev;s.gpH=mh;return}if(p.status!==409)throw new Error('Gameplans did not sync: '+((p.data&&p.data.error)||p.status))}}

 /* --- Film Room: one document per game (newest save wins); finished games too; deletions stick --- */
 const J=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
 function filmLocal(){const out=new Map(),list=J('fr:games',[]),pub=J('fr:pub',{index:[],games:{}});
  for(const g of list){const st=J('fr:game:'+g.id,null);if(st)out.set('film/'+g.id,{upd:+(localStorage.getItem('fr:upd:'+g.id)||0),body:{meta:g,state:st}})}
  const pu=+(localStorage.getItem('fr:upd:pub')||0);for(const x of pub.index){const g=pub.games[x.id];if(g)out.set('film/pub-'+x.id,{upd:pu,body:{pub:x,game:g}})}
  return out}
 function filmWrite(key,body,upd){const id=key.slice(5);
  if(id.startsWith('pub-')){const pub=J('fr:pub',{index:[],games:{}}),gid=id.slice(4);
   if(body.deleted){pub.index=pub.index.filter(x=>x.id!==gid);delete pub.games[gid]}else{pub.games[gid]=body.game;if(!pub.index.some(x=>x.id===gid))pub.index.push(body.pub||{id:gid,label:gid})}
   localStorage.setItem('fr:pub',JSON.stringify(pub));return}
  let list=J('fr:games',[]);
  if(body.deleted){list=list.filter(g=>g.id!==id);localStorage.removeItem('fr:game:'+id);localStorage.removeItem('fr:upd:'+id)}
  else{localStorage.setItem('fr:game:'+id,JSON.stringify(body.state));localStorage.setItem('fr:upd:'+id,String(upd||Date.now()));const i=list.findIndex(g=>g.id===id);if(i>=0)list[i]=body.meta;else list.push(body.meta)}
  localStorage.setItem('fr:games',JSON.stringify(list))}
 async function syncFilm(s,list){s.film=s.film||{};const loc=filmLocal(),dead=new Set(J('fr:deleted',[]).map(i=>'film/'+i));let wrote=false;
  for(const k of dead){const sv=list.find(d=>d.key===k);const m=s.film[k];if(sv&&!(m&&m.gone&&m.rev===sv.rev)){const r=await call('PUT','/doc',{key:k,baseRev:sv.rev,body:{deleted:true,upd:Date.now()},device:device()});if(r.status===200)s.film[k]={rev:r.data.rev,gone:true}}}
  for(const [k,v] of loc){if(dead.has(k))continue;const sv=list.find(d=>d.key===k),m=s.film[k];
   if(!sv){const r=await call('PUT','/doc',{key:k,baseRev:0,body:Object.assign({upd:v.upd},v.body),device:device()});if(r.status===200)s.film[k]={rev:r.data.rev,upd:v.upd};continue}
   if(m&&m.rev===sv.rev){if(v.upd>(m.upd||0)){const r=await call('PUT','/doc',{key:k,baseRev:sv.rev,body:Object.assign({upd:v.upd},v.body),device:device()});if(r.status===200)s.film[k]={rev:r.data.rev,upd:v.upd}}continue}
   const r=await call('GET','/doc?key='+encodeURIComponent(k));if(r.status!==200||!r.data.body)continue;const b=r.data.body;
   if(b.deleted){filmWrite(k,b);wrote=true;s.film[k]={rev:r.data.rev,gone:true};continue}
   if((b.upd||0)>=v.upd){filmWrite(k,b,b.upd);wrote=true;s.film[k]={rev:r.data.rev,upd:b.upd||0}}
   else{const p=await call('PUT','/doc',{key:k,baseRev:r.data.rev,body:Object.assign({upd:v.upd},v.body),device:device()});if(p.status===200)s.film[k]={rev:p.data.rev,upd:v.upd}}}
  for(const d of list){if(!d.key.startsWith('film/')||loc.has(d.key)||dead.has(d.key))continue;const m=s.film[d.key];if(m&&m.rev===d.rev)continue;
   const r=await call('GET','/doc?key='+encodeURIComponent(d.key));if(r.status!==200||!r.data.body)continue;const b=r.data.body;
   s.film[d.key]={rev:r.data.rev,upd:b.upd||0,gone:!!b.deleted};if(!b.deleted){filmWrite(d.key,b,b.upd);wrote=true}}
  if(wrote){const f=document.querySelector('iframe[title="Film Room"]');try{f&&f.contentWindow.postMessage({film:'reload'},location.origin)}catch(e){}}}

 async function syncNow(){const s0=st();if(busy||!s0.token||!(s0.exp>Date.now())||!navigator.onLine)return emit();busy=true;emit();
  try{const s=st();const lr=await call('GET','/docs');if(lr.status!==200)throw new Error(lr.data.error||'Server error');
   const list=lr.data.docs||[];await syncGlossary(s,list);await syncGames(s,list);await syncSchedule(s,list);await syncGameplan(s,list);await syncFilm(s,list);
   const x=st();Object.assign(x,{glRev:s.glRev,glSig:s.glSig,games:s.games,gv:s.gv,schRev:s.schRev,schH:s.schH,gpRev:s.gpRev,gpH:s.gpH,film:s.film,last:Date.now(),error:null});put(x)}
  catch(e){const x=st();x.error=e.message||'Sync failed';put(x)}
  finally{busy=false;emit()}}
 function soon(ms=4000){clearTimeout(timer);timer=setTimeout(syncNow,ms)}
 function start(){addEventListener('online',()=>soon(1000));addEventListener('storage',e=>{if(e.key===ALM||(e.key&&(e.key.indexOf('glossary_v1_')===0||e.key.indexOf('schedule_v1_')===0||e.key.indexOf('gameplan_v1_')===0||e.key.indexOf('fr:')===0)))soon()});
  setInterval(()=>soon(0),60000);soon(3000)}
 root.SUITESYNC={mergeGame,mergeRows,status,login,setup,signOut,syncNow,start,onChange:f=>listeners.push(f)};
})(window);
