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
  /* Demo scout: a made-up opponent (fixed seed, same every time) so predicted defense shows numbers when signed out */
  let DEMOSC=null;
  window.GSCOUT={KEY,norm,prog,
    demo:function(){if(DEMOSC)return DEMOSC;let sd=20270128;const rnd=()=>{sd|=0;sd=sd+0x6D2B79F5|0;let t=Math.imul(sd^sd>>>15,1|sd);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const wp=(a)=>{let r=rnd()*a.reduce((x,y)=>x+y[1],0);for(const y of a){r-=y[1];if(r<0)return y[0]}return a[a.length-1][0]};
 const prof={'DEMO FORMATION 1':{ps:'11',n:38,lk:[['COVER 3','BASE','4',46],['QUARTERS','OVER','4',24],['MAN FREE','BASE','5',18],['COVER 3','TITE','4',12]],cv:[['COVER 3',50],['QUARTERS',30],['MAN FREE',20]],fr:[['BASE',45],['OVER',35],['TITE',20]],rs:[['4',70],['5',20],['3',10]]},
  'DEMO FORMATION 2':{ps:'12',n:34,lk:[['QUARTERS','HEAVY','4',42],['COVER 3','UNDER','4',28],['COVER 2','BASE','5',20],['COVER 2','HEAVY','3',10]],cv:[['QUARTERS',45],['COVER 3',30],['COVER 2',25]],fr:[['HEAVY',40],['UNDER',35],['BASE',25]],rs:[['4',60],['5',30],['3',10]]},
  'TRIPS':{ps:'11',n:20,cv:[['COVER 3',55],['QUARTERS',45]],fr:[['BASE',60],['OVER',40]],rs:[['4',80],['5',20]]},
  'BUNCH':{ps:'11',n:20,cv:[['MAN FREE',60],['COVER 3',40]],fr:[['TITE',50],['BASE',50]],rs:[['4',60],['5',40]]},
  'TWINS':{ps:'12',n:20,cv:[['COVER 2',50],['QUARTERS',50]],fr:[['UNDER',60],['BASE',40]],rs:[['4',90],['3',10]]},
  'ACE':{ps:'12',n:20,cv:[['COVER 3',60],['MAN FREE',40]],fr:[['HEAVY',50],['BASE',50]],rs:[['4',75],['5',25]]},
  'EMPTY':{ps:'10',n:16,cv:[['QUARTERS',50],['MAN FREE',50]],fr:[['TITE',60],['OVER',40]],rs:[['4',50],['5',50]]}};
 const rows=[];let pn=1;for(const fm in prof){const q=prof[fm];for(let i=0;i<q.n;i++){const L=q.lk?wp(q.lk.map(x=>[x,x[3]])):null;rows.push({pn:pn++,dn:1+Math.floor(rnd()*3),di:1+Math.floor(rnd()*10),h:'',f:null,fm,ps:q.ps,fr:L?L[1]:wp(q.fr),rs:L?L[2]:wp(q.rs),cv:L?L[0]:wp(q.cv),ef:0,ex:0,gn:null,pt:'',cn:''})}}
 // outcomes against the made-up defense: each concept has a built-in strength, a couple play better into one coverage
 const CP={'MESH':[.60,.12,'MAN FREE'],'STICK':[.56,.12,'COVER 3'],'FOUR VERTS':[.40,.30,'COVER 2'],'Y-CROSS':[.52,.16,'QUARTERS'],'INSIDE ZONE':[.40,.08,'COVER 2'],'OUTSIDE ZONE':[.47,.12,'COVER 3'],'POWER':[.43,.10,''],'COUNTER':[.52,.18,'QUARTERS'],'DRAW':[.34,.06,''],'ISO':[.32,.05,'']},CK=Object.keys(CP);
 for(const r of rows){const k=CK[Math.floor(rnd()*CK.length)],c=CP[k],b=c[2]&&r.cv===c[2]?.16:0,e=rnd()<c[0]+b,x=rnd()<c[1]+b/2;r.cn=k;r.pt=/ZONE|POWER|COUNTER|DRAW|ISO/.test(k)?'Run':'Pass';r.ef=e?1:0;r.ex=x?1:0;r.gn=x?16+Math.floor(rnd()*14):e?5+Math.floor(rnd()*6):Math.floor(rnd()*4)-1}
 return DEMOSC={name:'Demo opponent (made up)',rows,from:'Demo scout (made up)'}},
    all:p=>Object.values(read(p).opps).sort((a,b)=>(b.upd||0)-(a.upd||0)),
    get:(opp,p)=>{const k=norm(opp);if(!k)return null;const O=read(p).opps;if(O[k])return O[k];
      // loose match: a saved name inside the typed one or the other way round ("MUSTANG" vs "EDMOND MUSTANG")
      const hit=Object.keys(O).find(n=>n.length>2&&(k.includes(n)||n.includes(k)));return hit?O[hit]:null},
    put:(opp,s,p)=>{const k=norm(opp);if(!k)throw new Error('Name the opponent first');const o=read(p);o.opps[k]={name:k,rows:s.rows,src:s.src||'',label:s.label||'',at:s.at||Date.now(),upd:Date.now()};
      if(o.del)delete o.del[k];write(o,p);return o.opps[k]},
    remove:(opp,p)=>{const k=norm(opp),o=read(p);if(!o.opps[k])return false;delete o.opps[k];(o.del=o.del||{})[k]=Date.now();write(o,p);return true}};
})();
