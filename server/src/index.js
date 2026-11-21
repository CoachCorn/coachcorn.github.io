/* Coach suite server (Cloudflare Worker + D1).
   Per-program passcode login -> signed token. Documents (glossary, games) stored per program with a revision number;
   a write must name the revision it was based on, otherwise the server answers 409 with its copy so the device can merge. */
const enc=new TextEncoder();
const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const ub64u=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4)),c=>c.charCodeAt(0));
const hex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
const PROG=/^[a-z0-9][a-z0-9-]{1,40}$/, DOCKEY=/^(glossary|schedule|game\/[A-Za-z0-9_.-]{1,80}|film\/[A-Za-z0-9_.-]{1,80})$/;
const MAX_BODY=1500000, TOKEN_DAYS=60, LOCK_FAILS=10, LOCK_MIN=15, PBKDF2_ITER=20000;

async function pbkdf2(code,salt){const k=await crypto.subtle.importKey('raw',enc.encode(code),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:PBKDF2_ITER,hash:'SHA-256'},k,256))}
async function hmacKey(env){if(!env.SIGNING_KEY)throw new Error('SIGNING_KEY not set');return crypto.subtle.importKey('raw',enc.encode(env.SIGNING_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
async function sign(env,payload){const body=b64u(enc.encode(JSON.stringify(payload)));const sig=await crypto.subtle.sign('HMAC',await hmacKey(env),enc.encode(body));return body+'.'+b64u(sig)}
async function verify(env,tok){if(!tok||tok.split('.').length!==2)return null;const[body,sig]=tok.split('.');
 const ok=await crypto.subtle.verify('HMAC',await hmacKey(env),ub64u(sig),enc.encode(body));if(!ok)return null;
 const p=JSON.parse(new TextDecoder().decode(ub64u(body)));return p.exp>Date.now()?p:null}
function eq(a,b){if(a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0}

function cors(env,req){const o=req.headers.get('Origin')||'',allow=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim());
 return allow.includes(o)?{'Access-Control-Allow-Origin':o,'Vary':'Origin','Access-Control-Allow-Headers':'Content-Type, Authorization, X-Admin-Key','Access-Control-Allow-Methods':'GET, PUT, POST, OPTIONS','Access-Control-Max-Age':'86400'}:{}}
const J=(env,req,data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...cors(env,req)}});
async function readJson(req){const t=await req.text();if(t.length>MAX_BODY)throw Object.assign(new Error('Too large'),{status:413});try{return JSON.parse(t||'{}')}catch(e){throw Object.assign(new Error('Bad JSON'),{status:400})}}

async function auth(env,req){const h=req.headers.get('Authorization')||'';const p=await verify(env,h.replace(/^Bearer\s+/i,''));
 if(!p)throw Object.assign(new Error('Sign in again'),{status:401});
 const row=await env.DB.prepare('SELECT pass_hash FROM programs WHERE id=?').bind(p.p).first();
 // a passcode change invalidates old tokens (token carries the first 12 chars of the hash it was issued under)
 if(!row||row.pass_hash.slice(0,12)!==p.h)throw Object.assign(new Error('Sign in again'),{status:401});
 return p}

const routes={
 'GET /health':async(env,req)=>J(env,req,{ok:true,time:new Date().toISOString()}),

 /* Create a program or change its passcode. Needs the ADMIN_KEY secret. */
 'POST /setup':async(env,req)=>{const k=req.headers.get('X-Admin-Key')||'';if(!env.ADMIN_KEY||!eq(k,env.ADMIN_KEY))return J(env,req,{error:'Admin key is wrong'},403);
  const b=await readJson(req),id=String(b.program||'').toLowerCase(),code=String(b.code||'');
  if(!PROG.test(id))return J(env,req,{error:'Program id: lowercase letters, numbers and dashes'},400);
  if(code.length<8)return J(env,req,{error:'Passcode needs at least 8 characters'},400);
  const salt=b64u(crypto.getRandomValues(new Uint8Array(16))),hash=await pbkdf2(code,salt);
  await env.DB.prepare('INSERT INTO programs(id,name,pass_salt,pass_hash,created) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,pass_salt=excluded.pass_salt,pass_hash=excluded.pass_hash')
   .bind(id,String(b.name||id).slice(0,80),salt,hash,new Date().toISOString()).run();
  await env.DB.prepare('DELETE FROM fails WHERE program=?').bind(id).run();
  return J(env,req,{ok:true,program:id})},

 'POST /login':async(env,req)=>{const b=await readJson(req),id=String(b.program||'').toLowerCase(),code=String(b.code||'');
  if(!PROG.test(id))return J(env,req,{error:'Unknown program or wrong passcode'},401);
  const since=Date.now()-LOCK_MIN*60000;
  const f=await env.DB.prepare('SELECT COUNT(*) n FROM fails WHERE program=? AND at>?').bind(id,since).first();
  if(f&&f.n>=LOCK_FAILS)return J(env,req,{error:'Too many wrong tries. Wait '+LOCK_MIN+' minutes.'},429);
  const row=await env.DB.prepare('SELECT id,name,pass_salt,pass_hash FROM programs WHERE id=?').bind(id).first();
  const h=row?await pbkdf2(code,row.pass_salt):await pbkdf2(code,'x');
  if(!row||!eq(h,row.pass_hash)){await env.DB.prepare('INSERT INTO fails(program,at) VALUES(?,?)').bind(id,Date.now()).run();return J(env,req,{error:'Unknown program or wrong passcode'},401)}
  await env.DB.prepare('DELETE FROM fails WHERE program=? AND at<?').bind(id,since).run();
  const exp=Date.now()+TOKEN_DAYS*86400000;
  return J(env,req,{token:await sign(env,{p:id,h:row.pass_hash.slice(0,12),exp}),program:id,name:row.name,exp})},

 /* List documents (no bodies), optionally only those changed after ?since= */
 'GET /docs':async(env,req,url)=>{const p=await auth(env,req),since=url.searchParams.get('since')||'';
  const r=await env.DB.prepare('SELECT key,rev,updated,device FROM docs WHERE program=? AND updated>? ORDER BY updated').bind(p.p,since).all();
  return J(env,req,{docs:r.results||[],now:new Date().toISOString()})},

 'GET /doc':async(env,req,url)=>{const p=await auth(env,req),key=url.searchParams.get('key')||'';if(!DOCKEY.test(key))return J(env,req,{error:'Bad key'},400);
  const r=await env.DB.prepare('SELECT key,rev,body,updated,device FROM docs WHERE program=? AND key=?').bind(p.p,key).first();
  return r?J(env,req,{key:r.key,rev:r.rev,body:JSON.parse(r.body),updated:r.updated,device:r.device}):J(env,req,{key,rev:0,body:null},404)},

 /* Write a document. baseRev must equal the server's rev (0 for a new one), else 409 with the server copy. */
 'PUT /doc':async(env,req)=>{const p=await auth(env,req),b=await readJson(req),key=String(b.key||'');if(!DOCKEY.test(key))return J(env,req,{error:'Bad key'},400);
  if(b.body==null)return J(env,req,{error:'No body'},400);
  const body=JSON.stringify(b.body),now=new Date().toISOString(),dev=String(b.device||'').slice(0,40),base=+b.baseRev||0;
  if(body.length>MAX_BODY)return J(env,req,{error:'Too large'},413);
  const res=base===0
   ?await env.DB.prepare('INSERT INTO docs(program,key,rev,body,updated,device) VALUES(?,?,1,?,?,?) ON CONFLICT(program,key) DO NOTHING').bind(p.p,key,body,now,dev).run()
   :await env.DB.prepare('UPDATE docs SET rev=rev+1,body=?,updated=?,device=? WHERE program=? AND key=? AND rev=?').bind(body,now,dev,p.p,key,base).run();
  if(!res.meta||!res.meta.changes){const cur=await env.DB.prepare('SELECT rev,body,updated,device FROM docs WHERE program=? AND key=?').bind(p.p,key).first();
   return J(env,req,{error:'Changed on another device',rev:cur?cur.rev:0,body:cur?JSON.parse(cur.body):null,updated:cur&&cur.updated,device:cur&&cur.device},409)}
  return J(env,req,{ok:true,key,rev:base+1,updated:now})}
};

/* Create the tables on first use, so no manual database step is needed. */
let schemaReady=false;
async function ensureSchema(env){if(schemaReady)return;await env.DB.batch([
 env.DB.prepare('CREATE TABLE IF NOT EXISTS programs (id TEXT PRIMARY KEY, name TEXT NOT NULL, pass_salt TEXT NOT NULL, pass_hash TEXT NOT NULL, created TEXT NOT NULL)'),
 env.DB.prepare('CREATE TABLE IF NOT EXISTS docs (program TEXT NOT NULL, key TEXT NOT NULL, rev INTEGER NOT NULL, body TEXT NOT NULL, updated TEXT NOT NULL, device TEXT, PRIMARY KEY (program, key))'),
 env.DB.prepare('CREATE TABLE IF NOT EXISTS fails (program TEXT NOT NULL, at INTEGER NOT NULL)'),
 env.DB.prepare('CREATE INDEX IF NOT EXISTS fails_p ON fails(program, at)')]);schemaReady=true}
export default{async fetch(req,env){const url=new URL(req.url);
 if(req.method!=='OPTIONS')try{await ensureSchema(env)}catch(e){return J(env,req,{error:'Database not connected'},500)}
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(env,req)});
 const h=routes[req.method+' '+url.pathname];if(!h)return J(env,req,{error:'Not found'},404);
 try{return await h(env,req,url)}catch(e){return J(env,req,{error:e.status?e.message:'Server error'},e.status||500)}}};
