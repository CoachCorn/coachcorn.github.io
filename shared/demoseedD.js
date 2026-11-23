/* Demo-space seed for the DEFENSIVE side (signed out only): a made-up opponent offense scout, one sample game in the Defensive Almanac, and one gameplan.
   Fake opponent, generic calls, nothing of Deer Creek's. Signed in, this never runs. Same fixed seed every time, so every iPad shows the same demo.
   Needs shared/scout.js and shared/scoutO.js loaded first, and SCOUTO.useDemoWords() already called (the pages do both).
   Runs once per iPad (flag demoseedD_v1). The suite's "Reset demo" removes the flag and the three stores, so the next visit seeds again.
   Real stores written: oscout_v1_demo, dalmanac_v1_demo, dgameplan_v1_demo. */
(function(root){
const SIGNED=()=>{try{const s=JSON.parse(localStorage.getItem('suite_sync'));return!!(s&&s.token&&s.exp>Date.now())}catch(e){return false}};
const FMFLAG='demoseedD_fm1';
const FLAG='demoseedD_v1',OPP='Mesa Ridge';
const rng=seed=>{let sd=seed;return()=>{sd|=0;sd=sd+0x6D2B79F5|0;let t=Math.imul(sd^sd>>>15,1|sd);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const wp=(rnd,a,w)=>{let r=rnd()*w.reduce((x,y)=>x+y,0);for(let i=0;i<a.length;i++){r-=w[i];if(r<0)return a[i]}return a[a.length-1]};
/* formation, share of plays, chance it is a pass */
const FORMS=[['Trips RT',16,.68],['Trips LT',10,.66],['Ace',18,.38],['Twins',12,.45],['Bunch RT',10,.6],['Wing LT',9,.28],['Wing RT',7,.3],['Slot RT',8,.55]];
const RUNS=[['STRETCH',4,'field'],['ZONE',4,null],['POWER',3,null],['COUNTER',2,'bdy'],['DRAW',1,null],['ISO',1,null]];
const PASSES=[['MESH',3],['STICK',3],['VERTS',2],['CROSS',2]];

/* one made-up game of their offense: rows in the shape SCOUTO.parseOffense makes */
function oppGame(seed,gm){const S=root.SCOUT,O=root.SCOUTO,rnd=rng(seed),rows=[];let dn=1,di=10,f=rnd()*20+25|0;
 for(let n=1;n<=58;n++){const fm=wp(rnd,FORMS.map(x=>x[0]),FORMS.map(x=>x[1])),pass=rnd()<FORMS.find(x=>x[0]===fm)[2]+(dn===3&&di>=7?.25:0)-(dn===3&&di<=3?.3:0);
  const h=wp(rnd,['L','M','R'],[3,2,4]);let call,kind,dir='',gain,res;
  if(pass){call=wp(rnd,PASSES.map(x=>x[0]),PASSES.map(x=>x[1]));kind='P';dir=rnd()<.5?'L':'R';const q=rnd();
   if(q<.05){res='Sack';gain=-(3+rnd()*5|0)}else if(q<.34){res='Incomplete';gain=0}else{res='Complete';gain=q<.6?3+(rnd()*7|0):q<.88?9+(rnd()*9|0):18+(rnd()*25|0)}}
  else{const r=wp(rnd,RUNS,RUNS.map(x=>x[1]));call=r[0];kind='R';res='Rush';
   const field=h==='L'?'R':h==='R'?'L':(rnd()<.5?'L':'R'),bdy=field==='L'?'R':'L';
   dir=r[2]==='field'?(rnd()<.82?field:bdy):r[2]==='bdy'?(rnd()<.72?bdy:field):(rnd()<.6?field:bdy);
   const q=rnd();gain=q<.1?-(1+rnd()*3|0):q<.5?1+(rnd()*4|0):q<.88?5+(rnd()*6|0):11+(rnd()*30|0);
   if(call==='ZONE'&&rnd()<.1){kind='RPO'}}
  const d=O.decode(call),row={pn:n,gm,dn,di,h,f,zone:S.zoneOf(f),fm:S.normFm(fm),ff:fm.toUpperCase(),fam:O.famOf(fm),bf:'',call,cn:d.known?d.concept:call,kind,dir,res,ef:O.effOf(dn,di,gain)?1:0};
  rows.push(row);
  f=Math.max(2,Math.min(98,f+gain));di-=gain;if(di<=0){dn=1;di=Math.min(10,100-f)}else{dn++;if(dn>4){dn=1;di=10;f=rnd()*30+25|0}}}
 return{name:'Game '+(gm+1),rows,off:false}}

function seedScout(){const O=root.SCOUTO,st=O.store('demo');if(st.names().length)return;
 st.put(OPP,{games:[oppGame(20261104,0),oppGame(20261111,1),oppGame(20261118,2)]},'replace','demo')}

/* one sample game in the Defensive Almanac: our calls against their made-up offense */
function seedAlmanac(){const KEY='dalmanac_v1_demo';let D=null;try{D=JSON.parse(localStorage.getItem(KEY))}catch(e){D=null}
 if(D&&D.games&&D.games.length)return;
 const O=root.SCOUTO,rnd=rng(20261120),t0=Date.UTC(2026,10,20,1,0,0),plays=[];let dn=1,di=10,f=28,ts=t0,n=0,half=false,pkg='BASE';
 const drive=()=>{plays.push({k:'d',pid:'zm'+ts,ts:ts+1,upd:ts+1});ts+=2;dn=1;di=10;f=rnd()*35+22|0};
 while(n<44){const fm=wp(rnd,FORMS.map(x=>x[0]),FORMS.map(x=>x[1])),passy=dn===3&&di>=5||dn===2&&di>=8;
  const pass=rnd()<FORMS.find(x=>x[0]===fm)[2]+(passy?.25:0),h=wp(rnd,['L','M','R'],[3,2,4]);let call,dir,res,gain,rp=pass?'P':'R';
  if(pass){call=wp(rnd,PASSES.map(x=>x[0]),PASSES.map(x=>x[1]));dir=rnd()<.5?'L':'R';const q=rnd();
   if(q<.07){res='Sack';gain=-(4+rnd()*4|0)}else if(q<.15){res='Interception';gain=0}else if(q<.42){res='Incomplete';gain=0}else{res='Complete';gain=q<.7?3+(rnd()*7|0):9+(rnd()*16|0)}}
  else{call=wp(rnd,RUNS.map(x=>x[0]),RUNS.map(x=>x[1]));res='Rush';const field=h==='L'?'R':h==='R'?'L':'R';dir=rnd()<.65?field:(field==='L'?'R':'L');const q=rnd();gain=q<.14?-(1+rnd()*3|0):q<.55?1+(rnd()*4|0):q<.9?5+(rnd()*6|0):11+(rnd()*20|0)}
  pkg=passy?'NICKEL':'BASE';
  const front=pkg==='NICKEL'?'4-2-5':(rnd()<.7?'4-3':'3-4'),cov=passy?wp(rnd,['COVER 2','COVER 4','MAN'],[3,3,2]):wp(rnd,['COVER 3','COVER 1','COVER 2'],[6,2,2]),
   press=rnd()<.18?wp(rnd,['A-GAP','EDGE','ZONE BLITZ','NICKEL BLITZ'],[2,2,2,1]):'';
  const hv=[];if(!pass&&gain<0)hv.push('TFL');if(res==='Sack')hv.push('SACK','TFL');if(res==='Interception'||(res==='Incomplete'&&rnd()<.3))hv.push('PBU');
  const side=f<=50?'Own':'Opp',yd=f<=50?f:100-f,td=!['Incomplete','Interception','Sack'].includes(res)&&f+gain>=100;if(td)gain=100-f;
  plays.push({pid:'p'+ts.toString(36),ts,upd:ts,dn,di,side,yd,f,hash:h,form:fm.toUpperCase(),call,concept:O.decode(call).concept||'',pkg,front,fcode:'',mods:[],press,cov,rp,dir,result:res,td:false,dtd:false,gain,havoc:[...new Set(hv)]});
  ts+=30000;n++;
  if(td||res==='Interception'){drive();continue}
  f=Math.max(1,Math.min(99,f+gain));di-=gain;if(di<=0){dn=1;di=Math.min(10,100-f)}else{dn++;if(dn>4){drive();continue}}
  if(n>=22&&!half){half=true;plays.push({k:'h',pid:'zm'+ts,ts:ts+1,upd:ts+1});ts+=2;dn=1;di=10;f=rnd()*30+25|0}}
 const g={id:'dDemoSample',opp:OPP,date:new Date(t0).toISOString(),scout:OPP,pkg:'BASE',demo:true,plays};
 localStorage.setItem(KEY,JSON.stringify({v:1,games:[g],cur:g.id}))}

/* one gameplan on their scout: their top 3 formations, with a few of our answers filled in */
function seedPlan(){const KEY='dgameplan_v1_demo';let S=null;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}
 if(S&&S.plans&&S.plans.length)return;
 const rows=root.SCOUTO.store('demo').rows(OPP),m={};rows.forEach(x=>{if(x.fam)m[x.fam]=(m[x.fam]||0)+1});
 const top=Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]),uid=k=>k+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
 const mine=[{'fr|fronts':['4-3|'],'fr|pops':['EDGE'],'fr|cov':['COVER 3'],'br|fronts':['3-4|'],'br|cov':['COVER 1'],'p1|fronts':['4-2-5|'],'p1|pops':['ZONE BLITZ'],'p1|cov':['COVER 4','COVER 2'],'p2|fronts':['4-2-5|'],'p2|cov':['COVER 2']},
  {'fr|fronts':['4-3|','3-4|'],'fr|cov':['COVER 3'],'p1|fronts':['4-2-5|'],'p1|cov':['COVER 4']},{}];
 const p={id:uid('p'),name:OPP+' week',scout:OPP,upd:Date.now(),blocks:top.map((f,i)=>({id:uid('b'),form:f,note:i===0?'Their base look. Stay balanced.':'',cells:mine[i]||{}}))};
 localStorage.setItem(KEY,JSON.stringify({v:1,plans:[p],cur:p.id,deleted:[]}))}

/* Standard drawings for the demo formations, written into the demo glossary the same way "Save as standard" does it in the offense Gameplan.
   Bunch is left undrawn on purpose: draw it once in the offense Gameplan, Save as standard, and it appears here, in the Defensive Almanac chips and in the Almanac. */

function formations(){if(SIGNED()||typeof GL==='undefined')return;
 try{if(localStorage.getItem(FMFLAG))return;const g=GL.load('demo');if(!g)return;
  const LOS=150,base=()=>({X:{x:88,y:154,on:1},Z:{x:616,y:152,on:1},M:{x:165,y:190,on:0},Q:{x:235,y:208,on:1},T:{x:210,y:245,on:1},H:{x:525,y:168,on:0},Y:{x:395,y:152,on:0},F:{x:430,y:190,on:0},A:{x:300,y:230,on:0},B:{x:260,y:245,on:0},
   LT:{x:163,y:LOS,on:1},LG:{x:199,y:LOS,on:1},C:{x:235,y:LOS,on:1},RG:{x:271,y:LOS,on:1},RT:{x:307,y:LOS,on:1}});
  const set=(t,k,x,y)=>{t[k]={x,y,on:1}};
  const F={
   Trips:{side:'RT',pers:'10',fn:t=>{set(t,'Z',616,LOS);set(t,'Y',545,LOS);set(t,'H',580,174)}},
   Twins:{side:'RT',pers:'10',fn:t=>{set(t,'Y',130,174);set(t,'H',560,174)}},
   Ace:{side:'',pers:'11',fn:t=>{set(t,'M',350,LOS);set(t,'H',560,174)}},
   Wing:{side:'RT',pers:'11',fn:t=>{set(t,'M',350,LOS);set(t,'Y',330,174);t.H.on=0}},
   Slot:{side:'RT',pers:'10',fn:t=>{set(t,'H',560,174)}}};
  let n=0;Object.keys(F).forEach(name=>{const t=GL.find(g,'formation',name);if(!t||(t.draw&&t.draw.t))return;const d=base();F[name].fn(d);t.draw={t:d,side:F[name].side,pers:F[name].pers,at:Date.now()};GL.touch(t);n++});
  const na=aliasesInto(g);if(n||na)GL.save(g);localStorage.setItem(FMFLAG,'1')}catch(e){}}

/* Made-up shorthand for the demo, written as glossary aliases ("Also called") so the type-it bars on both sides show it working. Runs on a glossary object; the caller saves. */
const DEMO_ALIASES=[['formation','Trips',['tr']],['formation','Bunch',['bn']],['formation','Twins',['tw']],['run','Inside Zone',['iz']],['run','Outside Zone',['oz']],['pass','Four Verts',['verts']],['pass','Y-Cross',['yx']],
 ['coverage','Cover 1',['c1']],['coverage','Cover 2',['c2']],['coverage','Cover 3',['c3']],['coverage','Cover 4',['c4']],['pressure','Fire Zone',['fz']],['pressure','Double A',['dbla']],['package','Nickel',['nk']]];
function aliasesInto(g){if(SIGNED()||!g||typeof GL==='undefined'||g.demoAl)return 0;let n=0;
 try{DEMO_ALIASES.forEach(([ty,nm,al])=>{const t=GL.find(g,ty,nm);if(!t)return;t.aliases=t.aliases||[];al.forEach(a=>{if(!t.aliases.some(x=>String(x).toUpperCase()===a.toUpperCase())){t.aliases.push(a);n++}});GL.touch(t)});g.demoAl=1}catch(e){}return n}

/* The keys Reset demo must clear for this side. */
const KEYS=['oscout_v1_demo','dalmanac_v1_demo','dgameplan_v1_demo','dpos_v1_demo','dstrength_v1_demo',FLAG,FMFLAG];

function ensure(){if(SIGNED())return;
 try{if(localStorage.getItem(FLAG))return;seedScout();seedAlmanac();seedPlan();localStorage.setItem(FLAG,'1')}catch(e){}}
function aliases(){if(SIGNED()||typeof GL==='undefined')return;try{const g=GL.load('demo');if(g&&aliasesInto(g))GL.save(g)}catch(e){}}
function all(){ensure();formations();aliases()}
root.DemoSeedD={ensure,formations,aliasesInto,all,KEYS,OPP};
})(typeof window!=='undefined'?window:globalThis);
