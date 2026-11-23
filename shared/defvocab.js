/* Defensive vocabulary shared by the Defensive Almanac and the defensive gameplan grid: glossary terms first, Deer Creek's confirmed calls as built-in defaults
   (a program with its own glossary is not forced onto these). Needs shared/glossary.js and shared/scoutO.js loaded first.
   DefVocab(program, signed) -> {lists(), addWord(type,name,extra), forms(), glo(), reload()} */
(function(root){
function DefVocab(PROGRAM,SIGNED){
const DEF_PKG=SIGNED?['BASE','CYCLONE','COBRA','NICKEL','DIME']:['BASE','NICKEL','DIME'];
const DEF_FR=SIGNED?[['BASE','5-0-5','odd'],['TITE','4-0-4','odd'],['HEAVY','4i-0-4i','odd'],['BEAR','3-0-3','odd'],['MASS','2-0-2','odd'],['OVER','4i-1-5','odd'],['UNDER','5-1-4i','odd'],['WIDE','9-0-9','odd'],
 ['INLAW','4-2i-2i-4','even'],['OUTLAW','5-3-3-5','even'],['VIPER','4-2-2-4','even'],['LOAD','9-3-1-5','even'],['CHOKE','4-0-4-9','even'],['BEAR','5-3-0-3-5','even'],['OVER','4-2-3-5','even'],['UNDER','5-3-2-4','even']]:[];
const DEF_COV=SIGNED?['STAR','SCREW','RUTH','CLAMP','CLEO','BLACK','SINK','READ']:[];
const DEF_PRESS=SIGNED?['SMOKE','FOG','WILD','CAT','OKIE','SOONER','STATE','COWBOY','FOX','MIKE','MOSS','MOW','TECH','RAIDER','SAW','SHARK','SWOOP','HOOP','IRONMAN','SPIDERMAN','SUPERMAN','THOR','WOLVERINE','BATMAN','KATANA','DOJO','JACK','SENSEI','ZEN','WARRIOR','OMEGA','BETA','CHARLIE','BOX','NICKEL','SPIKE','WILL','CHEAT']:[];
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

return{lists,addWord,forms:glForms,glo:()=>GLO,reload:()=>{try{GLO=GL.load(PROGRAM)}catch(e){}}}}
root.DefVocab=DefVocab})(typeof window!=='undefined'?window:globalThis);
