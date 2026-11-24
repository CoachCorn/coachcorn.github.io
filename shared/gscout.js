/* Opponent defense scouts, one per opponent for the whole program (offense side).
   Loaded once from the Gameplan or the Almanac; both read it, and the suite syncs it to every signed-in device
   (server documents gscout/<opponent>, newest save wins, deletions stick).
   Store: localStorage 'gscout_v1_<program>' = { opps: { NAME: {name, rows, src, at, upd} }, del: { NAME: time } }.
   Signed out (demo) uses program 'demo', which never syncs. */
(function(){
  const signed=()=>{try{const s=JSON.parse(localStorage.getItem('suite_sync'));return!!(s&&s.token&&s.exp>Date.now())}catch(e){return false}};
  const prog=()=>{if(!signed())return'demo';try{return(JSON.parse(localStorage.getItem('suite_sync'))||{}).program||'deer-creek'}catch(e){return'deer-creek'}};
  const KEY=p=>'gscout_v1_'+(p||prog());
  // "v. Mustang", "vs Mustang", "Week 9 v. Mustang" all name the opponent MUSTANG
  const norm=s=>{s=String(s==null?'':s).trim();const m=s.match(/(?:^|\s)(?:v\.?|vs\.?)\s+(.+)$/i);if(m)s=m[1];return s.replace(/\s+/g,' ').trim().toUpperCase()};
  const read=p=>{try{const o=JSON.parse(localStorage.getItem(KEY(p)));if(o&&o.opps)return o}catch(e){}return{opps:{},del:{}}};
  const write=(o,p)=>localStorage.setItem(KEY(p),JSON.stringify(o));
  window.GSCOUT={KEY,norm,prog,
    all:p=>Object.values(read(p).opps).sort((a,b)=>(b.upd||0)-(a.upd||0)),
    get:(opp,p)=>{const k=norm(opp);if(!k)return null;const O=read(p).opps;if(O[k])return O[k];
      // loose match: a saved name inside the typed one or the other way round ("MUSTANG" vs "EDMOND MUSTANG")
      const hit=Object.keys(O).find(n=>n.length>2&&(k.includes(n)||n.includes(k)));return hit?O[hit]:null},
    put:(opp,s,p)=>{const k=norm(opp);if(!k)throw new Error('Name the opponent first');const o=read(p);o.opps[k]={name:k,rows:s.rows,src:s.src||'',label:s.label||'',at:s.at||Date.now(),upd:Date.now()};
      if(o.del)delete o.del[k];write(o,p);return o.opps[k]},
    remove:(opp,p)=>{const k=norm(opp),o=read(p);if(!o.opps[k])return false;delete o.opps[k];(o.del=o.del||{})[k]=Date.now();write(o,p);return true}};
})();
