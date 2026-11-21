/* Shared program glossary (schema v1). One glossary per program, stored on the device.
   Every tool (Almanac, Film Room, gameplan grid) reads and writes the same copy through this file.
   Rules: only add fields; ignore unknown fields; terms keep a permanent id; names are labels.
   Design doc: claude/glossary-schema-v1.md in the "Selling My Stuff" project. */
(function(root){
 const SCHEMA=1;
 const U=s=>String(s==null?'':s).trim().toUpperCase();
 const now=()=>new Date().toISOString();
 const today=()=>now().slice(0,10);
 const slug=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'x';
 const key=program=>'glossary_v1_'+program;

 function blank(program,name){return{schema:SCHEMA,program,name:name||program,rev:0,updated:now(),terms:[]}}

 /* Upgrade older files. v1 is the first version, so this only fills missing fields. */
 function migrate(g){if(!g||typeof g!=='object')return null;
  g.schema=g.schema||1;g.terms=Array.isArray(g.terms)?g.terms:[];g.rev=g.rev||0;
  for(const t of g.terms){t.aliases=t.aliases||[];t.meaning=t.meaning||{text:''};t.links=t.links||{};t.history=t.history||[];t.status=t.status||'active';t.uses=t.uses||[]}
  return g}

 function load(program){try{return migrate(JSON.parse(localStorage.getItem(key(program))))}catch(e){return null}}
 function save(g){g.rev=(g.rev||0)+1;g.updated=now();try{localStorage.setItem(key(g.program),JSON.stringify(g))}catch(e){}return g}

 const names=t=>[t.name,...(t.aliases||[])].map(U);
 /* Find a term by type and name or alias (case does not matter). Active terms win over retired ones. */
 function find(g,type,name){if(!g)return null;const n=U(name);if(!n)return null;
  const hits=g.terms.filter(t=>t.type===type&&names(t).includes(n));
  return hits.find(t=>t.status==='active')||hits[0]||null}
 function byId(g,id){return g?g.terms.find(t=>t.id===id)||null:null}
 function active(g,type,use){return g?g.terms.filter(t=>t.type===type&&t.status==='active'&&(!use||!t.uses.length||t.uses.includes(use))):[]}
 function newId(g,type,name){let id=type+'.'+slug(name),i=2;while(byId(g,id))id=type+'.'+slug(name)+'-'+(i++);return id}

 /* Add a term, or return the existing one (adding a missing use). o: {type,name,side,source,needsReview,meaning,uses,links,aliases,id,code,package,maps_to} */
 function add(g,o){const ex=find(g,o.type,o.name);
  if(ex){let ch=false;for(const u of o.uses||[])if(!ex.uses.includes(u)){ex.uses.push(u);ch=true}
   if(ex.status==='retired'&&o.reactivate){ex.status='active';ch=true}if(ch)ex.updated=now();return{term:ex,changed:ch}}
  const t=Object.assign({id:o.id||newId(g,o.type,o.name),type:o.type,side:o.side||'O',status:'active',name:String(o.name).trim(),aliases:[],meaning:{text:''},links:{},uses:[],source:'seed',needsReview:false,added:today(),history:[]},o);
  delete t.reactivate;t.updated=t.updated||now();t.history=[{since:today(),name:t.name,meaning:t.meaning.text||''}];
  g.terms.push(t);return{term:t,changed:true}}

 /* Rename keeps the old name as an alias so old plays and imports still match. */
 function rename(g,t,newName){newName=String(newName||'').trim();if(!newName||newName===t.name)return false;
  const old=t.name;t.name=newName;t.aliases=[old,...t.aliases.filter(a=>U(a)!==U(newName)&&U(a)!==U(old))];
  t.history.push({since:today(),name:newName,meaning:t.meaning.text||''});t.updated=now();return true}
 function setMeaning(t,text){text=String(text||'').trim();if(text===(t.meaning.text||''))return false;t.meaning.text=text;t.history.push({since:today(),name:t.name,meaning:text});t.updated=now();return true}
 function retire(t){if(t.status==='retired')return false;t.status='retired';t.updated=now();return true}
 function activate(t){if(t.status==='active')return false;t.status='active';t.updated=now();return true}
 /* Take one use off a term (e.g. a tag removed from the run list only). Retire it when no use is left. */
 function dropUse(t,use){if(!t.uses.includes(use))return false;t.uses=t.uses.filter(u=>u!==use);if(!t.uses.length)t.status='retired';t.updated=now();return true}

 /* Meaning of a term on a date: the history entry that was current then. */
 function asOf(t,date){const h=t.history||[];let r=h[0]||{name:t.name,meaning:t.meaning.text};for(const e of h)if(e.since<=date)r=e;return r}

 /* Merge an imported glossary. Same id: the copy changed most recently (term.updated) wins. Seed terms carry updated '0' so they never beat an edit. */
 function merge(g,inc){inc=migrate(JSON.parse(JSON.stringify(inc)));if(!inc)throw new Error('Not a glossary file');
  if(inc.program&&g.program&&inc.program!==g.program)throw new Error('That glossary is for '+inc.program+', not '+g.program);
  const r={added:0,updated:0,kept:0,clashes:[]};
  for(const t of inc.terms){const mine=byId(g,t.id);
   if(!mine){const same=find(g,t.type,t.name);if(same){r.clashes.push(t.name+' (same name, different id)');continue}g.terms.push(t);r.added++;continue}
   if(JSON.stringify(mine)===JSON.stringify(t))continue;
   const a=mine.updated||'',b=t.updated||'';
   if(b>a){Object.assign(mine,t);r.updated++}else r.kept++}
  return r}

 const touch=t=>{t.updated=now()};
 const reviewList=g=>g?g.terms.filter(t=>t.needsReview):[];
 root.GL={SCHEMA,touch,U,slug,key,blank,migrate,load,save,find,byId,active,add,rename,setMeaning,retire,activate,dropUse,asOf,merge,reviewList};
})(typeof window!=='undefined'?window:globalThis);
