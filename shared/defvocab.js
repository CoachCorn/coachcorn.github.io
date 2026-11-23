/* Defensive vocabulary shared by the Defensive Almanac and the defensive gameplan grid: glossary terms first, Deer Creek's confirmed calls as built-in defaults
   (a program with its own glossary is not forced onto these). Needs shared/glossary.js and shared/scoutO.js loaded first.
   DefVocab(program, signed) -> {lists(), addWord(type,name,extra), forms(), glo(), reload()} */
(function(root){
/* Demo space (signed out): generic football words only, nothing of Deer Creek's. */
const DEMO={
 pkg:['BASE','NICKEL','DIME'],
 fr:[['4-3','','BASE'],['3-4','','BASE'],['4-2-5','','NICKEL'],['3-3-5','','NICKEL']],
 cov:['COVER 1','COVER 2','COVER 3','COVER 4','MAN'],
 press:['A-GAP','EDGE','ZONE BLITZ','FIRE ZONE','NICKEL BLITZ','DOUBLE A']};
const DEMO_MEAN={'4-3':'Four down linemen, three linebackers.','3-4':'Three down linemen, four linebackers.','4-2-5':'Four down linemen, two linebackers, five defensive backs.','3-3-5':'Three down linemen, three linebackers, five defensive backs.',
 'COVER 1':'Man coverage with one deep safety.','COVER 2':'Two deep safeties, corners in the flats.','COVER 3':'Three deep defenders.','COVER 4':'Four deep defenders.','MAN':'Man coverage.',
 'A-GAP':'Linebackers blitz the A gaps.','EDGE':'An edge defender blitzes.','ZONE BLITZ':'Zone coverage with a lineman dropping.','FIRE ZONE':'Five rush, zone behind it.','NICKEL BLITZ':'The nickel back blitzes.','DOUBLE A':'Two linebackers show in the A gaps.'};
/* Defender positions: a letter and a name each program picks for itself. A program's glossary holds them as terms (type position, side D, permanent id);
   a device with no glossary yet keeps them in its own list (dpos_v1_<program>) until one exists. */
const POS={
 dc:[['pos.end','End','E','Defensive end (two: field and boundary).'],['pos.spur','Spur','S','Field outside linebacker. Always to the field.'],['pos.will','Will','W','Boundary outside linebacker.'],
  ['pos.mike','Mike','M','Inside linebacker.'],['pos.hawk','Hawk','H','Boundary inside linebacker.'],['pos.bandit','Bandit','B','Boundary safety.'],['pos.free','Free','F','Field safety.'],['pos.corner','Corner','C','Corner (two).']],
 demo:[['pos.end','End','E','Defensive end.'],['pos.tackle','Tackle','T','Defensive tackle.'],['pos.sam','Sam','S','Strong-side linebacker.'],['pos.mike','Mike','M','Middle linebacker.'],['pos.will','Will','W','Weak-side linebacker.'],
  ['pos.corner','Corner','C','Cornerback.'],['pos.ss','Strong safety','SS','Strong safety.'],['pos.fs','Free safety','FS','Free safety.']]};
const posDefaults=signed=>(signed?POS.dc:POS.demo).map(x=>({id:x[0],name:x[1],letter:x[2],desc:x[3]}));
const posKey=program=>'dpos_v1_'+program;

function DefVocab(PROGRAM,SIGNED){
const DEF_PKG=SIGNED?['BASE','CYCLONE','COBRA','NICKEL','DIME']:['BASE','NICKEL','DIME'];
const DEF_FR=SIGNED?[['BASE','5-0-5','odd'],['TITE','4-0-4','odd'],['HEAVY','4i-0-4i','odd'],['BEAR','3-0-3','odd'],['MASS','2-0-2','odd'],['OVER','4i-1-5','odd'],['UNDER','5-1-4i','odd'],['WIDE','9-0-9','odd'],
 ['INLAW','4-2i-2i-4','even'],['OUTLAW','5-3-3-5','even'],['VIPER','4-2-2-4','even'],['LOAD','9-3-1-5','even'],['CHOKE','4-0-4-9','even'],['BEAR','5-3-0-3-5','even'],['OVER','4-2-3-5','even'],['UNDER','5-3-2-4','even']]:DEMO.fr;
const DEF_COV=SIGNED?['STAR','SCREW','RUTH','CLAMP','CLEO','BLACK','SINK','READ']:DEMO.cov;
const DEF_PRESS=SIGNED?['SMOKE','FOG','WILD','CAT','OKIE','SOONER','STATE','COWBOY','FOX','MIKE','MOSS','MOW','TECH','RAIDER','SAW','SHARK','SWOOP','HOOP','IRONMAN','SPIDERMAN','SUPERMAN','THOR','WOLVERINE','BATMAN','KATANA','DOJO','JACK','SENSEI','ZEN','WARRIOR','OMEGA','BETA','CHARLIE','BOX','NICKEL','SPIKE','WILL','CHEAT']:DEMO.press;
let GLO=null;try{GLO=GL.load(PROGRAM)}catch(e){}
const un=(a,b)=>{const seen=new Set(a.map(x=>String(x).toUpperCase()));return a.concat(b.filter(x=>!seen.has(String(x).toUpperCase())))};
const gl=type=>GLO?GL.active(GLO,type).filter(t=>!t.side||t.side==='D'):[];
/* Their formations are tagged in our own formation names, so they live in the glossary as offense (O) formations. */
const glForms=()=>{try{return GLO?GL.active(GLO,'formation').map(t=>SCOUTO.famOf(t.name)).filter(Boolean):[]}catch(e){return[]}};

const EXTRA={};
function lists(){
 const fr=gl('front').map(t=>[t.name,t.code||'',t.package||'']),seen=new Set(fr.map(x=>x[0].toUpperCase()+'|'+x[1]));
 DEF_FR.forEach(x=>{const k=x[0].toUpperCase()+'|'+x[1];if(!seen.has(k)){seen.add(k);fr.push(x)}});
 (EXTRA.front||[]).forEach(x=>{const k=x[0].toUpperCase()+'|'+x[1];if(!seen.has(k)){seen.add(k);fr.push(x)}});
 return{pkg:un(un(DEF_PKG,gl('package').map(t=>t.name)),EXTRA.package||[]),
  fr,
  mods:un(['MUG','BOSS'],gl('frontmod').map(t=>t.name)),
  cov:un(un(DEF_COV,gl('coverage').map(t=>t.name)),EXTRA.coverage||[]),
  press:un(un(DEF_PRESS,gl('pressure').map(t=>t.name)),EXTRA.pressure||[])}}
/* New words go into the program glossary (marked "needs review", same as the offense Almanac). Only if the glossary could not take it does the page keep it on its own. */
function addWord(type,name,x){name=String(name||'').trim().toUpperCase();if(!name)return'';x=x||{};let ok=false;if(type==='formation')name=SCOUTO.famOf(name);
 if(GLO){try{if(GL.find(GLO,type,name)){ok=true}else{const t={type,name:type==='formation'?name.charAt(0)+name.slice(1).toLowerCase():name,side:x.side||'D',source:'game',needsReview:true,meaning:{text:'Added during a game. Needs a definition.'}};if(type==='front'){if(x.code)t.code=x.code;if(x.package)t.package=x.package}GL.add(GLO,t);GL.save(GLO);ok=true}}catch(e){ok=false}}
 if(!ok){EXTRA[type]=EXTRA[type]||[];const dup=EXTRA[type].some(y=>(Array.isArray(y)?y[0]:y)===name);if(!dup)EXTRA[type].push(type==='front'?[name,x.code||'',x.package||'']:name)}
 return name}


/* ---- defender positions (letters) ---- */
function positions(){
 if(GLO){const t=GL.active(GLO,'position').filter(x=>!x.side||x.side==='D');if(t.length)return t.map((x,i)=>({id:x.id,name:x.name,letter:x.letter||'',desc:(x.meaning&&x.meaning.text)||'',o:x.order==null?i:x.order})).sort((a,b)=>a.o-b.o).map(({o,...r})=>r)}
 try{const l=JSON.parse(localStorage.getItem(posKey(PROGRAM)));if(Array.isArray(l)&&l.length)return l}catch(e){}
 return posDefaults(SIGNED)}
/* list: [{id,name,letter,desc}]. Returns true when saved. */
function setPositions(list){list=list.map(x=>({id:x.id,name:String(x.name||'').trim(),letter:String(x.letter||'').trim().toUpperCase(),desc:String(x.desc||'').trim()})).filter(x=>x.name&&x.letter);
 if(GLO){try{const keep=new Set();list.forEach((x,i)=>{keep.add(x.id);let t=GL.byId(GLO,x.id);
   if(!t){GL.add(GLO,{id:x.id,type:'position',name:x.name,side:'D',source:'coach',letter:x.letter,order:i,meaning:{text:x.desc}});return}
   if(t.status!=='active')GL.activate(t);if(t.name!==x.name)GL.rename(GLO,t,x.name);t.letter=x.letter;t.order=i;GL.setMeaning(t,x.desc);GL.touch(t)});
  GLO.terms.filter(t=>t.type==='position'&&t.status==='active'&&!keep.has(t.id)).forEach(t=>GL.retire(t));GL.save(GLO);return true}catch(e){return false}}
 try{localStorage.setItem(posKey(PROGRAM),JSON.stringify(list));return true}catch(e){return false}}
function resetPositions(){return setPositions(posDefaults(SIGNED))}

/* Defensive strength: a per-program setting. Default Field/Boundary (Deer Creek). Kept in the glossary file when there is one (so it syncs), else on this device. */
const STRENGTH_MODES=[
 {id:'fb',name:'Field / Boundary',desc:'Strength is the field side. The wide side of the hash.'},
 {id:'lr',name:'Left / Right',desc:'Strength is a fixed side, set each play.'},
 {id:'pass',name:'To / Away from pass strength',desc:'Strength goes to the side with more eligible receivers.'},
 {id:'te',name:'To / Away from the TE',desc:'Strength goes to the tight end side.'},
 {id:'custom',name:'Custom',desc:'Write your own rule. It is kept as your note.'}];
const MID_MODES=[
 {id:'multi',name:'Side with more WRs, then QB throwing arm',desc:'Middle hash has no field. Go to the side with more WRs. If balanced (2x2), go to the QB\'s throwing arm side.'},
 {id:'arm',name:'QB throwing arm side',desc:'Always the QB\'s throwing arm side.'},
 {id:'left',name:'Left',desc:'Always left.'},{id:'right',name:'Right',desc:'Always right.'}];
const strKey=pr=>'dstrength_v1_'+pr;
const STR_DEF=()=>({mode:'fb',custom:'',mid:'multi'});
function strength(){let v=null;if(GLO&&GLO.dstrength)v=GLO.dstrength;else try{v=JSON.parse(localStorage.getItem(strKey(PROGRAM)))}catch(e){}
 const d=STR_DEF();return v&&typeof v==='object'?{mode:STRENGTH_MODES.some(m=>m.id===v.mode)?v.mode:d.mode,custom:String(v.custom||''),mid:MID_MODES.some(m=>m.id===v.mid)?v.mid:d.mid}:d}
function setStrength(v){const d=STR_DEF(),o={mode:STRENGTH_MODES.some(m=>m.id===(v&&v.mode))?v.mode:d.mode,custom:String((v&&v.custom)||'').trim(),mid:MID_MODES.some(m=>m.id===(v&&v.mid))?v.mid:d.mid};
 if(o.mode==='custom'&&!o.custom)return false;
 if(GLO){try{GLO.dstrength=o;GL.save(GLO);return true}catch(e){return false}}
 try{localStorage.setItem(strKey(PROGRAM),JSON.stringify(o));return true}catch(e){return false}}
function resetStrength(){return setStrength(STR_DEF())}

/* Shorthand: every alias in the glossary ("Also called") for the typed-entry bars. kind matches the bar's own slots. */
const ALIAS_KIND={coverage:'cov',pressure:'press',package:'pkg',frontmod:'mod',front:'front',formation:'form',run:'concept',pass:'concept'};
function aliases(){const out=[];if(!GLO)return out;try{GLO.terms.forEach(t=>{if(t.status!=='active'||!t.aliases||!t.aliases.length)return;const k=ALIAS_KIND[t.type];if(!k)return;
  t.aliases.forEach(a=>{a=String(a||'').trim();if(a&&a.toUpperCase()!==String(t.name).toUpperCase())out.push({kind:k,alias:a,name:t.name})})})}catch(e){}return out}

return{aliases,strength,setStrength,resetStrength,STRENGTH_MODES,MID_MODES,lists,addWord,forms:glForms,glo:()=>GLO,positions,setPositions,resetPositions,posDefaults:()=>posDefaults(SIGNED),reload:()=>{try{GLO=GL.load(PROGRAM)}catch(e){}}}}
root.DefVocab=DefVocab
/* The demo glossary is first seeded by the offense Almanac with Deer Creek's defensive words. Swap those for generic ones, once, so the demo space has nothing of Deer Creek's.
   Words a coach added in the demo are kept. Does nothing when there is no glossary yet (the lists above already carry the generic words). */
DefVocab.demoGlossary=function(program){try{const g=GL.load(program);if(!g||g.demoDef)return false;
 g.terms=g.terms.filter(t=>!(t.side==='D'&&t.source==='seed'&&['front','frontmod','shell','coverage','pressure','package','position'].includes(t.type)));
 DEMO.fr.forEach(f=>GL.add(g,{type:'front',name:f[0],side:'D',source:'seed',package:f[2],meaning:{text:DEMO_MEAN[f[0]]||''}}));
 DEMO.cov.forEach(c=>GL.add(g,{type:'coverage',name:c,side:'D',source:'seed',meaning:{text:DEMO_MEAN[c]||''}}));
 DEMO.press.forEach(c=>GL.add(g,{type:'pressure',name:c,side:'D',source:'seed',meaning:{text:DEMO_MEAN[c]||''}}));
 DEMO.pkg.forEach(c=>GL.add(g,{type:'package',name:c,side:'D',source:'seed',meaning:{text:''}}));
 POS.demo.forEach((x,i)=>GL.add(g,{id:x[0],type:'position',name:x[1],side:'D',source:'seed',letter:x[2],order:i,meaning:{text:x[3]}}));
 g.demoDef=1;g.demoAl=0;GL.save(g);return true}catch(e){return false}};
})(typeof window!=='undefined'?window:globalThis);
