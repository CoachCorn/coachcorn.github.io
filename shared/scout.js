/* Scout reader shared by the Gameplan grid. Copied from the Almanac's scout importer (almanac/index.html, "Opponent scout").
   Reads the Raw Data tab (.xlsx or .csv), splits it into opponent blocks and answers "what does this defense do". Pure functions, no page code.
   When the Almanac importer changes, change this copy too (or move the Almanac onto this file). */
(function(root){
const SC_MIN=3; // fewest plays that count as a usable sample
const ZONES=[['BACKED UP',20],['OWN 20–40',40],['OPEN FIELD',60],['PLUS TERRITORY',80],['OPP 20–10',90],['RED ZONE',99]]; // upper edge = Ball on (1-99, own side first)
const zoneOf=f=>f==null?null:(ZONES.find(z=>f<=z[1])||ZONES[5])[0];
const ZN_KEY={'BACKE':'BACKED UP','OWN 2':'OWN 20–40','OPEN ':'OPEN FIELD','PLUS ':'PLUS TERRITORY','OPP 2':'OPP 20–10','RED Z':'RED ZONE'};
const znNorm=s=>ZN_KEY[String(s||'').toUpperCase().slice(0,5)]||null;
const dbk=(dn,di)=>(dn===1||dn>=4)?'*':(di<=3?'1-3':di<=6?'4-6':'7+');
const normFm=s=>String(s||'').toUpperCase().replace(/\s+(LT|RT|LEFT|RIGHT)\.?$/,'').replace(/\s+/g,' ').trim();
/* Front names -> structural technique codes (locked with Noah). BEAR / OVER / UNDER exist in both an odd and an even version. */
const TECH={odd:{BASE:'5-0-5',TITE:'4-0-4',HEAVY:'4i-0-4i',BEAR:'3-0-3',MASS:'2-0-2',OVER:'4i-1-5',UNDER:'5-1-4i',WIDE:'9-0-9'},
 even:{INLAW:'4-2i-2i-4',OUTLAW:'5-3-3-5',VIPER:'4-2-2-4',LOAD:'9-3-1-5',CHOKE:'4-0-4-9',BEAR:'5-3-0-3-5',OVER:'4-2-3-5',UNDER:'5-3-2-4'}};
function frontCode(name,rush){const t=String(name||'').toUpperCase().split(/\s+/).filter(x=>x&&x!=='DBL'),mods=t.filter(x=>x==='MUG'||x==='BOSS'),base=t.find(x=>x!=='MUG'&&x!=='BOSS');if(!base)return'';
 const o=TECH.odd[base],e=TECH.even[base];const c=(o&&e)?(+rush===3?o:''):(o||e||'');return c?c+(mods.length?' '+mods.join(' '):''):''}
/* --- file reading: .xlsx is a zip of XML files; no library needed --- */
const colIdx=s=>{let n=0;for(const ch of s)n=n*26+ch.charCodeAt(0)-64;return n-1};
async function inflateRaw(raw){if(typeof DecompressionStream==='undefined')throw new Error('This browser cannot open .xlsx files. On the Raw Data tab use File > Download > CSV and pick that instead.');
 const ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(raw);w.close();return new Uint8Array(await new Response(ds.readable).arrayBuffer())}
async function unzipX(buf){const u=new Uint8Array(buf),dv=new DataView(buf);let e=u.length-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw new Error('That does not look like an .xlsx file');
 const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const out={};
 for(let i=0;i<n;i++){if(dv.getUint32(p,true)!==0x02014b50)break;const meth=dv.getUint16(p+10,true),csz=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true);
  const name=new TextDecoder().decode(u.subarray(p+46,p+46+nl));p+=46+nl+el+cl;
  if(!/^xl\/(workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|worksheets\/[^\/]+\.xml)$/.test(name))continue;
  const ln=dv.getUint16(lo+26,true),le=dv.getUint16(lo+28,true),ds=lo+30+ln+le,raw=u.subarray(ds,ds+csz);out[name]=meth===0?raw:await inflateRaw(raw)}
 return out}
const xmlDoc=u8=>new DOMParser().parseFromString(new TextDecoder().decode(u8),'application/xml');
async function readXlsx(buf){const z=await unzipX(buf);if(!z['xl/workbook.xml'])throw new Error('No workbook found in that file');
 const wb=xmlDoc(z['xl/workbook.xml']),rel=xmlDoc(z['xl/_rels/workbook.xml.rels']),rmap={};
 for(const r of rel.getElementsByTagName('Relationship'))rmap[r.getAttribute('Id')]=r.getAttribute('Target');
 const RNS='http://schemas.openxmlformats.org/officeDocument/2006/relationships',ss=[];
 if(z['xl/sharedStrings.xml'])for(const si of xmlDoc(z['xl/sharedStrings.xml']).getElementsByTagName('si')){const ts=[];for(const c of si.children){if(c.tagName==='t')ts.push(c);else if(c.tagName==='r')ts.push(...c.getElementsByTagName('t'))}ss.push(ts.map(t=>t.textContent).join(''))}
 const sheets=[...wb.getElementsByTagName('sheet')].map(s=>{const id=s.getAttribute('r:id')||s.getAttributeNS(RNS,'id');return{name:s.getAttribute('name'),path:'xl/'+String(rmap[id]||'').replace(/^\/?(xl\/)?/,'')}});
 const grid=u8=>{const doc=xmlDoc(u8),rows=[];for(const r of doc.getElementsByTagName('row')){const ri=+r.getAttribute('r')-1,arr=[];
   for(const c of r.getElementsByTagName('c')){const ci=colIdx((c.getAttribute('r')||'').replace(/\d+/,'')),t=c.getAttribute('t'),ve=c.getElementsByTagName('v')[0];let v='';
    if(t==='inlineStr')v=[...c.getElementsByTagName('t')].map(x=>x.textContent).join('');else if(ve){v=ve.textContent;if(t==='s')v=ss[+v]==null?'':ss[+v];else if(t==='b')v=v==='1'?'TRUE':'FALSE'}arr[ci]=v}
   rows[ri]=arr}return rows};
 const pick=sheets.find(s=>/raw\s*data/i.test(s.name));const order=pick?[pick,...sheets.filter(s=>s!==pick)]:sheets;
 for(const s of order){if(!z[s.path])continue;const g=grid(z[s.path]);if(findHeader(g)>=0)return{rows:g,sheet:s.name}}
 throw new Error('Could not find a sheet with a PLAY # column. Pick the Raw Data tab export.')}
function parseCsv(t){const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}
 else if(ch==='"')q=true;else if(ch===','){r.push(c);c=''}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&t[i+1]==='\n')i++;r.push(c);rows.push(r);r=[];c=''}else c+=ch}
 if(c!==''||r.length){r.push(c);rows.push(r)}return rows}
const cellS=v=>String(v==null?'':v).trim();
function findHeader(g){for(let i=0;i<Math.min(g.length,12);i++){if((g[i]||[]).some(c=>cellS(c).toUpperCase()==='PLAY #'))return i}return -1}
/* --- turn the sheet rows into defensive plays, split into opponent blocks --- */
function parseScout(g){const hi=findHeader(g),H={};(g[hi]||[]).forEach((c,i)=>{const k=cellS(c).toUpperCase();if(k&&H[k]==null)H[k]=i});
 const need=['DN','DIST','OFF FORM','COVERAGE'],miss=need.filter(k=>H[k]==null);if(miss.length)throw new Error('Missing columns: '+miss.join(', '));
 const pn=H['PLAY #'],get=(r,k)=>H[k]==null?'':cellS(r[H[k]]);
 const blocks=[];let cur=null,last=-1,skipped=0,zoneMis=0,zoneChk=0;
 const open=(name,lab)=>{cur={name,labeled:lab,rows:[],first:null,lastPn:null};blocks.push(cur);last=-1};
 for(let i=hi+1;i<g.length;i++){const r=g[i];if(!r)continue;const cells=r.map(cellS),first=cells[pn],others=cells.filter((x,j)=>j!==pn&&x!=='').length;
  if(first!==''&&isNaN(+first)&&others===0){open(first,true);continue}
  if(first===''||isNaN(+first))continue;const pnum=+first;
  const odk=get(r,'ODK').toUpperCase();if(H['ODK']!=null&&odk&&odk!=='D'){skipped++;continue}
  if(!cur||pnum<last)open('',false);last=pnum;
  const dn=+get(r,'DN'),di=+get(r,'DIST');if(!(dn>=1&&dn<=4)||isNaN(di)){skipped++;continue}
  const f=yardF(get(r,'YARD LN')),zs=znNorm(get(r,'FIELD ZONE')),zc=zoneOf(f);if(zs&&zc){zoneChk++;if(zs!==zc)zoneMis++}
  const gn=parseFloat(get(r,'GN/LS'));
  const row={pn:pnum,dn,di,h:get(r,'HASH').toUpperCase(),f,fm:normFm(get(r,'OFF FORM')),ps:get(r,'PERSONNEL'),fr:get(r,'FRONT FAMILY').toUpperCase(),rs:get(r,'PRESSURE BROUGHT'),cv:get(r,'COVERAGE').toUpperCase(),
   ef:get(r,'EFF').toUpperCase()==='Y'?1:0,ex:/^Y/i.test(get(r,'EXPLOSIVE?'))?1:0,gn:isNaN(gn)?null:gn,pt:get(r,'PLAY TYPE'),cn:get(r,'RUN CONCEPT FAMILY')||get(r,'CONCEPT FAMILY')};
  if(cur.first==null)cur.first=pnum;cur.lastPn=pnum;cur.rows.push(row)}
 blocks.forEach((b,i)=>{if(!b.name)b.name='Block '+(i+1)+' (plays '+b.first+'–'+b.lastPn+')'});
 return{blocks:blocks.filter(b=>b.rows.length),skipped,zoneMis,zoneChk}}
function yardF(v){const s=cellS(v);if(!s)return null;const n=parseFloat(s.replace('+',''));if(isNaN(n)||n===0)return null;if(n<0)return Math.min(50,-n);return n>=50?50:100-n}
/* --- predict: formation + down & distance + field zone, falling back until at least SC_MIN plays --- */
function scoutLookup(rows,dd){const fm=normFm(dd.formation),bk=dbk(dd.down,dd.dist),zn=zoneOf(dd.f);
 const lv=[['formation · down & distance · field zone',x=>x.fm===fm&&x.dn===dd.down&&dbk(x.dn,x.di)===bk&&zoneOf(x.f)===zn],
  ['formation · down & distance',x=>x.fm===fm&&x.dn===dd.down&&dbk(x.dn,x.di)===bk],['formation only',x=>x.fm===fm],['down & distance only (too few plays from this formation)',x=>x.dn===dd.down&&dbk(x.dn,x.di)===bk]];
 for(let i=0;i<lv.length;i++){const s=rows.filter(lv[i][1]).filter(x=>x.cv&&x.fr&&x.rs!=='');if(s.length>=SC_MIN)return scoutBuild(i,lv[i][0],s)}
 return null}
function scoutBuild(i,label,s){const tally=(fn)=>{const m={};for(const x of s){const k=fn(x);m[k]=(m[k]||0)+1}return Object.entries(m).sort((a,b)=>b[1]-a[1])};
 const pct=c=>Math.round(100*c/s.length);
 const looks=tally(x=>x.fr+'|'+x.rs+'|'+x.cv).slice(0,2).map(([k,c])=>{const[fr,rs,cv]=k.split('|');return{fr,rs,cv,n:c,p:pct(c)}});
 const top=fn=>{const t=tally(fn)[0];return t?{k:t[0],p:pct(t[1])}:null};
 return{lvl:i,label,n:s.length,looks,cov:top(x=>x.cv),rush:top(x=>x.rs),front:top(x=>x.fr)}}

 async function readFile(f){let rows,sheet='';if(/\.csv$/i.test(f.name)){rows=parseCsv(await f.text());if(findHeader(rows)<0)throw new Error('Could not find a PLAY # column in that CSV');sheet='CSV'}else{const x=await readXlsx(await f.arrayBuffer());rows=x.rows;sheet=x.sheet}
  const P=parseScout(rows);if(!P.blocks.length)throw new Error('No defensive plays found');P.sheet=sheet;return P}
 root.SCOUT={SC_MIN,readFile,normFm,frontCode,scoutBuild,dbk,zoneOf};
})(window);
