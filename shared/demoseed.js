/* Demo-space seed: a fake, good 9-game season (8-1) for the signed-out demo. Used by the Almanac and Stats tabs.
   Nothing here ever touches the real program data (signed in = never runs) and nothing syncs. Fake players, fake opponents. */
(function(){
const SIGNED=()=>{try{const s=JSON.parse(localStorage.getItem('suite_sync'));return!!(s&&s.token&&s.exp>Date.now())}catch(e){return false}};
const ROSTER={'7':'Demo QB1','10':'Demo QB2','22':'Demo RB1','28':'Demo RB2','34':'Demo RB3','1':'Demo WR1','81':'Demo WR2','85':'Demo WR3','3':'Demo WR4','88':'Demo TE1','87':'Demo TE2'};
const PLAYERS=Object.keys(ROSTER).sort((a,b)=>a-b),PASSERS=['7','10'];
const name=j=>ROSTER[String(j).replace(/#/g,'')]||'';
const label=j=>{const n=name(j);return'#'+String(j).replace(/#/g,'')+(n?' '+n:'')};
const rosterText=()=>Object.keys(ROSTER).map(j=>j+' '+ROSTER[j]).join('\n');
const OPP=[['Ridgeview','2026-08-28','H',49,7,'#3b6ea8'],['Lakeside','2026-09-04','A',42,14,'#a8423b'],['Westbrook','2026-09-11','H',35,21,'#5a8f4a'],['North Fork','2026-09-18','A',56,10,'#8a5ab0'],
 ['Eastland','2026-09-25','H',38,17,'#c98a2b'],['Mesa Ridge','2026-10-02','A',31,35,'#2b8f8f'],['Fairview','2026-10-09','H',45,20,'#b0507a'],['Summit','2026-10-16','A',41,13,'#6b7b8c'],['Prairie View','2026-10-23','H',52,6,'#7a6a3b']];
const FORM=['Trips','Bunch','Twins','Ace','Wing','Slot'],MOT=['JET','ORBIT','FLY','TRADE'],TAG=['SWITCH','SPEED','BUBBLE','SPLIT'],
 RUN=['INSIDE ZONE','OUTSIDE ZONE','POWER','COUNTER','DRAW','ISO'],PASS=['MESH','STICK','FOUR VERTS','Y-CROSS'];
function game(seed,opp,idx){let sd=seed;const rnd=()=>{sd|=0;sd=sd+0x6D2B79F5|0;let t=Math.imul(sd^sd>>>15,1|sd);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const pick=a=>a[Math.floor(rnd()*a.length)],ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
 const wp=(a,w)=>{let r=rnd()*w.reduce((x,y)=>x+y,0);for(let i=0;i<a.length;i++){r-=w[i];if(r<0)return a[i]}return a[a.length-1]};
 const g={id:'g'+(1787900000000+idx*604800000),opp,program:'demo',plays:[]};
 let down=1,dist=10,f=ri(22,38),n=0,half=false;
 const newDrive=()=>{if(n>=27&&!half){half=true;g.plays.push({k:'h'})}else g.plays.push({k:'d'});down=1;dist=10;f=ri(22,42)};
 const qb=()=>wp(PASSERS,[9,1]);
 while(n<58){
  const run=rnd()<.54,p={k:'p',down,dist,f,ptype:run?'run':'pass',formation:pick(FORM),hash:pick(['L','M','R']),dir:pick(['RT','LT']),motion:rnd()<.3?pick(MOT):null,shift:rnd()<.06,jumbo:false,call:null,tag:rnd()<.45?pick(TAG):null,result:'',gain:0,player:null};
  if(run){p.call=wp(RUN,[5,4,3,2,2,1]);p.player=wp(['22','28','34','7'],[10,4,1,1]);p.result='RUSH';const q=rnd();p.gain=q<.07?-ri(1,3):q<.42?ri(2,5):q<.82?ri(6,11):ri(12,38);if(p.player==='7')p.passer='7'}
  else{p.call=wp(PASS,[4,3,3,2]);p.passer=qb();const r=rnd();p.player=wp(['1','81','85','3','88','87','22','28'],[5,4,3,3,2,1,1,1]);
   if(r<.04){p.result='SACK';p.gain=-ri(4,8);p.player=null}else if(r<.24){p.result='INC';p.gain=0}else if(r<.255){p.result='INT';p.gain=0}
   else{p.result='COMP';const q=rnd();p.gain=q<.45?ri(3,9):q<.8?ri(10,18):ri(19,48)}}
  {const ft=rnd()<.5?pick(['TIGHT','STACK','BUNCH']):null;p.ftags=ft?[ft]:[];p.ftag=ft||'';p.tags=p.tag?[p.tag]:[];if(!run)p.target=pick(['HITCH','SLANT','OUT','CURL','DIG','POST','CORNER','GO','SEAM','FLAT','CROSS','SCREEN'])}
  if(down<3&&rnd()<.015&&p.result!=='INT'){p.result='PEN';p.gain=rnd()<.5?-5:5;p.player=null}
  if(p.result!=='PEN'&&p.result!=='INC'&&f+p.gain>=100){p.gain=100-f;p.td=true}
  g.plays.push(p);n++;
  if(p.td||p.result==='INT'){newDrive();continue}
  f=Math.max(1,f+p.gain);dist-=p.gain;
  if(p.result==='PEN')continue;
  if(dist<=0){down=1;dist=Math.min(10,100-f)}else{down++;if(down>4){newDrive();continue}}
  if(down===4&&f<55&&rnd()<.6){newDrive()}
 }
 return g}
function ensure(){if(SIGNED())return;let A=null;try{A=JSON.parse(localStorage.getItem('almanac_demo'))}catch(e){A=null}
 let S=null;try{S=JSON.parse(localStorage.getItem('schedule_v1_demo'))}catch(e){S=null}
 const freshA=!A;if(!A)A={games:[],cur:null,lists:{},v:15};
 let chA=freshA;
 if(!A.seasonSeeded){const gs=OPP.map((o,i)=>game(20260828+i*7919,o[0],i));A.games=gs.concat(A.games);A.seasonSeeded=1;chA=true;
  if(!A.cur)A.cur=A.games[0].id;
  }
 if(chA)localStorage.setItem('almanac_demo',JSON.stringify(A));
  if(!S||!S.rows||!S.rows.length){const sr=OPP.map((o,i)=>({id:'sd'+i,opp:o[0],date:o[1],ha:o[2],us:o[3],them:o[4],color:o[5],logo:null,game:(A.games.find(g=>g.opp===o[0]&&!g.demo)||{}).id||null,upd:Date.now()}));
  localStorage.setItem('schedule_v1_demo',JSON.stringify({rows:sr,deleted:[]}))}
}
window.DemoSeed={ROSTER,PLAYERS,PASSERS,name,label,rosterText,ensure,signed:SIGNED};
})();
