/* Offensive scout reader: what does this OPPONENT's OFFENSE do. Used by the defensive side (defensive Almanac, defensive gameplan grid).
   Reads the Hudl "All O" export (.xlsx or .csv): one opponent's offensive plays, usually several games back to back.
   Needs shared/scout.js loaded first (it owns the file reading, the yard-line math and the field zones).
   Pure functions on plain rows. Everything returned is counts and percentages with the number of plays behind it. No predicted "best" call.
   Why not a top-3 call list: backtest on one real opponent (5 games, 244 plays) showed formation + hash + zone call lists did not beat a team-wide guess.
   See claude/mustang-offense-backtest-2026-11-23.md in the KDNCE project. */
(function(root){
const S=root.SCOUT;
const MIN=3; // fewest plays that count as a usable sample (Noah's rule)

const U=s=>String(s==null?'':s).trim().toUpperCase().replace(/\s+/g,' ');
const famOf=s=>U(s).replace(/\(FIB\)/g,'').replace(/\b(LT|RT|LEFT|RIGHT)\b\.?/g,'').replace(/\s+/g,' ').trim();

/* One-word calls -> concept, run or pass, and the side when the word fixes one. SEED from Louis's Call Predictor (Deer Creek one-word rules).
   TODO: read these from the program glossary (one words and concepts) so a program can edit them. */
const WORDS={LA:['Power','run','L'],CHARGER:['Power','run','R'],CAROLINA:['GY Counter','run','L'],PANTHER:['GY Counter','run','R'],VEGAS:['Buck Sweep','run','L'],RAIDER:['Buck Sweep','run','R'],
 PITT:['GT Counter','run','L'],PITTSBURGH:['GT Counter','run','L'],STEELER:['GT Counter','run','R'],LAP:['Cross','pass','L'],RACE:['Cross','pass','R'],
 FLASH:['Verticals','pass',null],STRIKE:['Verticals','pass',null],SOONERS:['Zone Insert','run',null],WASHINGTON:['Zone Insert','run',null],COMMANDER:['Zone Insert','run',null],
 BRONCHOS:['Sail','pass',null],CAL:['Cross','pass',null],MINERS:['Verticals','pass',null],AGGIES:['Aggies','pass',null],STANFORD:['Post-Spike','pass',null],TULSA:['Post-Spike','pass',null],
 BRUINS:['Jet Sweep','run',null],FALCON:['Jet Sweep','run',null],STATE:['GY Counter','run',null],TROJANS:['GY Counter','run',null],TROJAN:['GY Counter','run',null],
 TEXAS:['Buck Sweep','run',null],HOUSTON:['GT Counter','run',null]};
/* concept names (Power, GY Counter, ...) with run or pass, from the call-word table. The call word (CHARGER, PANTHER) is the tag; the concept is the play. */
function concepts(){const m={};Object.keys(WORDS).forEach(k=>{const w=WORDS[k];if(!m[w[0]])m[w[0]]={name:w[0],type:w[1]}});m['Solid']=m['Solid']||{name:'Solid',type:'run'};return Object.values(m)}
function decode(call){const t=U(call).split(' ').filter(Boolean),hits=t.filter(x=>WORDS[x]);
 if(t.includes('SOLID')){const w=hits.length?WORDS[hits[hits.length-1]]:null;return{known:true,concept:'Solid',type:'run',dir:w?w[2]:null}}
 if(!hits.length)return{known:false,concept:null,type:null,dir:null};const w=WORDS[hits[hits.length-1]];return{known:true,concept:w[0],type:w[1],dir:w[2]}}

/* Kind of play. A run call that was thrown shows up as a pass in the export, so it counts as an RPO (same rule as the Call Predictor). */
function kindOf(typ,rpoCell,call){const t=U(typ),rp=U(rpoCell);
 if(rp&&!['N','NO','0','FALSE'].includes(rp))return'RPO';
 if(t.startsWith('R'))return'R';
 if(t.startsWith('P'))return decode(call).type==='run'?'RPO':'P';
 return null}

/* Convert a sheet (array of rows of cells) into plays, split into games. Games are found where PLAY # drops back (or from a row with only PLAY # filled, as in the defensive scout). */
function parseOffense(g){const hi=S.findHeader(g),H={};(g[hi]||[]).forEach((c,i)=>{const k=S.cellS(c).toUpperCase();if(k&&H[k]==null)H[k]=i});
 const miss=['DN','DIST','OFF FORM'].filter(k=>H[k]==null);if(miss.length)throw new Error('Missing columns: '+miss.join(', '));
 const pn=H['PLAY #'],get=(r,k)=>H[k]==null?'':S.cellS(r[H[k]]);
 const games=[];let cur=null,last=-1,skipped={other:0,penalty:0,timeout:0,noSituation:0,noKind:0};
 const open=(name,lab)=>{cur={name,labeled:lab,rows:[],first:null,lastPn:null};games.push(cur);last=-1};
 for(let i=hi+1;i<g.length;i++){const r=g[i];if(!r)continue;const cells=r.map(S.cellS),first=cells[pn],others=cells.filter((x,j)=>j!==pn&&x!=='').length;
  if(first!==''&&isNaN(+first)&&others===0){open(first,true);continue}
  if(first===''||isNaN(+first))continue;const pnum=+first;
  if(!cur||pnum<last)open('',false);last=pnum;
  const odk=get(r,'ODK').toUpperCase();if(H['ODK']!=null&&odk&&odk!=='O'){skipped.other++;continue}
  const res=get(r,'RESULT').toUpperCase();if(res==='PENALTY'){skipped.penalty++;continue}if(res==='TIMEOUT'){skipped.timeout++;continue}
  const dn=+get(r,'DN'),di=+get(r,'DIST');if(!(dn>=1&&dn<=4)||isNaN(di)){skipped.noSituation++;continue}
  const call=get(r,'OFF PLAY'),kind=kindOf(get(r,'PLAY TYPE'),get(r,'RPO'),call),d=decode(call),f=S.yardF(get(r,'YARD LN')),dir=get(r,'PLAY DIR').toUpperCase()[0];
  const row={pn:pnum,gm:games.length-1,dn,di,h:get(r,'HASH').toUpperCase()[0]||'',f,zone:S.zoneOf(f),fm:S.normFm(get(r,'OFF FORM')),ff:U(get(r,'OFF FORM')),fam:famOf(get(r,'OFF FORM')),bf:get(r,'BACKFIELD'),
   call,cn:d.known?d.concept:(call?U(call):''),kind,dir:dir==='L'||dir==='R'?dir:'',res:get(r,'RESULT'),ef:get(r,'EFF').toUpperCase()==='Y'?1:(get(r,'EFF')?0:null)};
  if(!row.kind)skipped.noKind++; // kept: still counts for formation / situation totals, but not for run/pass percentages
  if(cur.first==null)cur.first=pnum;cur.lastPn=pnum;cur.rows.push(row)}
 games.forEach((b,i)=>{if(!b.name)b.name='Game '+(i+1)+' (plays '+b.first+'–'+b.lastPn+')'});
 return{games:games.filter(b=>b.rows.length),skipped}}

async function readFile(f){let rows,sheet='';
 if(/\.csv$/i.test(f.name)){rows=S.parseCsv(await f.text());if(S.findHeader(rows)<0)throw new Error('Could not find a PLAY # column in that CSV');sheet='CSV'}
 else{const x=await S.readXlsx(await f.arrayBuffer());rows=x.rows;sheet=x.sheet}
 const P=parseOffense(rows);if(!P.games.length)throw new Error('No offensive plays found. This reader wants the opponent offense export (ODK = O).');P.sheet=sheet;return P}

/* --- tendencies --- */
const dnd=x=>x.dn===1||x.dn>=4?'D'+Math.min(x.dn,4):'D'+x.dn+(x.di<=3?' · 1-3':x.di<=6?' · 4-6':' · 7+');
const DND_LABEL=k=>k.replace('D1','1st down').replace('D2','2nd').replace('D3','3rd').replace('D4','4th');
function split(rows){const typed=rows.filter(x=>x.kind),n=typed.length,c={R:0,P:0,RPO:0};typed.forEach(x=>c[x.kind]++);
 const p=k=>n?Math.round(100*c[k]/n):null,eff=rows.filter(x=>x.ef!=null);
 return{n:rows.length,nTyped:n,run:p('R'),pass:p('P'),rpo:p('RPO'),eff:eff.length?Math.round(100*eff.reduce((a,x)=>a+x.ef,0)/eff.length):null,nEff:eff.length}}
function topConcepts(rows,k){const m={};rows.forEach(x=>{if(x.cn)m[x.cn]=(m[x.cn]||0)+1});const t=rows.filter(x=>x.cn).length;
 return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,k||3).map(([name,c])=>({name,n:c,p:Math.round(100*c/t)}))}

/* Tendency notes: for each way of cutting the plays (formation family, down & distance, hash, formation family + down & distance),
   the run / pass / RPO mix and efficiency as percentage points above or below the opponent's OWN average, with the play count.
   A group needs at least MIN plays. No ranking: groups stay in play-count order within each cut. */
function tendencies(rows){const all=split(rows),out={all,cuts:[]};
 const cut=(label,keyFn,nameFn)=>{const m={};rows.forEach(x=>{const k=keyFn(x);if(k)(m[k]=m[k]||[]).push(x)});
  const groups=Object.entries(m).filter(([k,v])=>v.length>=MIN).sort((a,b)=>b[1].length-a[1].length).map(([k,v])=>{const s=split(v),d=(a,b)=>a==null||b==null?null:a-b;
   return{key:k,name:nameFn?nameFn(k):k,n:v.length,run:s.run,pass:s.pass,rpo:s.rpo,eff:s.eff,dRun:d(s.run,all.run),dPass:d(s.pass,all.pass),dRpo:d(s.rpo,all.rpo),dEff:d(s.eff,all.eff),top:topConcepts(v,3)}});
  out.cuts.push({label,groups})};
 cut('Formation',x=>x.fam);cut('Down & distance',dnd,DND_LABEL);cut('Hash',x=>x.h,k=>({L:'Left hash',M:'Middle hash',R:'Right hash'}[k]));
 cut('Formation + down & distance',x=>x.fam&&x.fam+' | '+dnd(x),k=>{const[a,b]=k.split(' | ');return a+' · '+DND_LABEL(b)});
 return out}

/* Favorite runs by side of the field. Field = the wide side (opposite the hash the ball is on); boundary = the short side. Run plays only (RPOs left out).
   The play direction (L/R) and the hash are read from the same side of the ball, so a run to the left from the right hash is a field run. Middle hash has no field or boundary, so those plays are counted apart.
   Returns top run concepts for each side with the play count behind them. Used by the Offense Scout and, later, the defensive gameplan grid. */
const topCalls=(a,k)=>{const m={},cw={};a.forEach(x=>{const n=x.cn||'(no call logged)';m[n]=(m[n]||0)+1;if(x.call){const w=U(x.call);(cw[n]=cw[n]||{})[w]=(cw[n][w]||0)+1}});
  return Object.entries(m).sort((p,q)=>q[1]-p[1]).slice(0,k||4).map(([name,n])=>({name,n,p:Math.round(100*n/a.length),calls:Object.entries(cw[name]||{}).sort((p,q)=>q[1]-p[1]).slice(0,2).map(([w,c])=>({w,n:c}))}))};
function favRuns(rows){const run=rows.filter(x=>x.kind==='R'),out={field:[],bdy:[],mid:0,nodir:0,n:run.length};
 run.forEach(x=>{if(x.dir!=='L'&&x.dir!=='R'){out.nodir++;return}if(x.h!=='L'&&x.h!=='R'){out.mid++;return}(x.dir===x.h?out.bdy:out.field).push(x)});
 return{n:out.n,mid:out.mid,nodir:out.nodir,field:{n:out.field.length,top:topCalls(out.field)},bdy:{n:out.bdy.length,top:topCalls(out.bdy)}}}
/* favorite pass concepts (pass plays only, RPOs left out) */
function favPass(rows){const ps=rows.filter(x=>x.kind==='P');return{n:ps.length,top:topCalls(ps)}}
/* the same, one row per formation family that has at least MIN runs to each side combined */
function favRunsByForm(rows){const m={};rows.forEach(x=>{if(x.fam)(m[x.fam]=m[x.fam]||[]).push(x)});
 return Object.entries(m).map(([f,v])=>({form:f,fr:favRuns(v)})).filter(x=>x.fr.field.n+x.fr.bdy.n>=MIN).sort((a,b)=>(b.fr.field.n+b.fr.bdy.n)-(a.fr.field.n+a.fr.bdy.n))}

/* Live look-up for the sideline: the opponent offense is in a formation, on this down and distance, on this hash.
   Fall back until a group has at least MIN plays and say which level answered, as the defensive scout does. */
function lookup(rows,look){const fam=famOf(look.formation),db=dnd({dn:look.down,di:look.dist}),zn=S.zoneOf(look.f);
 const lv=[['formation · down & distance · field zone',x=>x.fam===fam&&dnd(x)===db&&x.zone===zn],['formation · down & distance',x=>x.fam===fam&&dnd(x)===db],
  ['formation only',x=>x.fam===fam],['down & distance only',x=>dnd(x)===db]];
 for(let i=0;i<lv.length;i++){const s=rows.filter(lv[i][1]);if(s.length>=MIN){const sp=split(s),ds=s.filter(x=>x.dir),dL=ds.filter(x=>x.dir==='L').length;return{lvl:i,label:lv[i][0],n:s.length,run:sp.run,pass:sp.pass,rpo:sp.rpo,eff:sp.eff,top:topConcepts(s,3),dirN:ds.length,dirL:ds.length?Math.round(100*dL/ds.length):null,dirR:ds.length?100-Math.round(100*dL/ds.length):null}}}
 return null}


/* --- storage: one entry per opponent, kept on the device (key oscout_v1_<program>). Opponent offense scout only; the defensive scout lives in the Almanac / Gameplan.
   Each opponent keeps its games; a game can be switched off so tendencies use only the games you want (for example the last three). --- */
function store(program){const KEY='oscout_v1_'+program;
 const read=()=>{try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.opps)return o}catch(e){}return{opps:{},active:''}};
 const write=o=>{try{localStorage.setItem(KEY,JSON.stringify(o));return true}catch(e){return false}};
 return{KEY,
  names:()=>Object.keys(read().opps).sort((a,b)=>a.localeCompare(b)),
  get:n=>read().opps[n]||null,
  active:()=>{const o=read();return o.opps[o.active]?o.active:Object.keys(o.opps)[0]||''},
  setActive:n=>{const o=read();o.active=n;write(o)},
  /* mode 'replace' swaps all games; 'add' appends the new games to the ones already stored */
  put:(name,P,mode,src)=>{const o=read(),ex=o.opps[name];let games=P.games.map(g=>({name:g.name,rows:g.rows,off:false}));
   if(ex&&mode==='add'){const k=ex.games.length;games=ex.games.concat(games.map((g,i)=>({...g,name:/^Game \d/.test(g.name)?'Game '+(k+i+1)+' (plays '+(g.rows[0]?g.rows[0].pn:'')+'–'+(g.rows.length?g.rows[g.rows.length-1].pn:'')+')':g.name})))}
   o.opps[name]={name,at:new Date().toISOString(),upd:Date.now(),src:src||'',games};if(o.del)delete o.del[name];o.active=name;return write(o)},
  setGameOff:(name,i,off)=>{const o=read();if(o.opps[name]&&o.opps[name].games[i]){o.opps[name].games[i].off=!!off;o.opps[name].upd=Date.now();write(o)}},
  remove:n=>{const o=read();delete o.opps[n];(o.del=o.del||{})[n]=Date.now();if(o.active===n)o.active='';write(o)},
  rows:n=>{const e=read().opps[n];return e?e.games.filter(g=>!g.off).flatMap(g=>g.rows):[]}}}

root.SCOUTO={MIN,concepts,decode,parseOffense,readFile,tendencies,favRuns,favPass,favRunsByForm,lookup,split,famOf,dnd,store};
})(typeof window!=='undefined'?window:globalThis);
