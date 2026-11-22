/* Past-game importer: reads an .xlsx (no library, built-in unzip) or .csv in the Hudl column order and turns offensive plays into Almanac games. Used by Stats. */
(function(){
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
function yardF(v){const s=cellS(v);if(!s)return null;const n=parseFloat(s.replace('+',''));if(isNaN(n)||n===0)return null;if(n<0)return Math.min(50,-n);return n>=50?50:100-n}
const resCode=(s,pt,gn)=>{const u=String(s||'').toUpperCase();if(/FUMB|^FUM/.test(u))return'FUM';if(/INTERC|^INT\b/.test(u))return'INT';if(/SACK/.test(u))return'SACK';if(/SCRAM/.test(u))return'SCRAM';if(/PENAL|^PEN\b/.test(u))return'PEN';if(/INCOMP|^INC\b/.test(u))return'INC';if(/COMP/.test(u))return'COMP';if(/RUSH|^RUN/.test(u))return'RUSH';return pt==='run'?'RUSH':(gn>0?'COMP':'INC')};
const ttl=x=>String(x||'').toLowerCase().replace(/\b\w/g,m=>m.toUpperCase());
function splitForm(s){const t=String(s||'').trim().split(/\s+/).filter(Boolean);if(!t.length)return{formation:null,dir:null,ftags:[]};const i=t.findIndex(x=>/^(LT|RT|LEFT|RIGHT|L|R)\.?$/i.test(x));
 if(i<0)return{formation:ttl(t.join(' ')),dir:null,ftags:[]};return{formation:ttl(t.slice(0,i).join(' '))||null,dir:/^R/i.test(t[i])?'RT':'LT',ftags:t.slice(i+1).map(x=>x.toUpperCase())}}
function parseOwn(g,fname){const hi=findHeader(g),H={};(g[hi]||[]).forEach((c,i)=>{const k=cellS(c).toUpperCase();if(k&&H[k]==null)H[k]=i});
 const miss=['DN','DIST'].filter(k=>H[k]==null);if(miss.length)throw new Error('Missing columns: '+miss.join(', '));
 const get=(r,k)=>H[k]==null?'':cellS(r[H[k]]),pn=H['PLAY #'],base=String(fname||'Game').replace(/\.[^.]+$/,'');
 const blocks=[];let cur=null,last=-1,skipped=0,prev=null,stamp=Date.now();
 const open=name=>{cur={name,plays:[]};blocks.push(cur);last=-1;prev=null};
 for(let i=hi+1;i<g.length;i++){const r=g[i];if(!r)continue;const cells=r.map(cellS),first=cells[pn],others=cells.filter((x,j)=>j!==pn&&x!=='').length;
  if(first!==''&&isNaN(+first)&&others===0){open(first);continue}
  const dn=+get(r,'DN'),di=+get(r,'DIST');if(!(dn>=1&&dn<=4)||isNaN(di)){continue}
  const odk=get(r,'ODK').toUpperCase();if(H['ODK']!=null&&odk&&odk!=='O'){skipped++;continue}
  const pnum=first!==''&&!isNaN(+first)?+first:null;if(!cur||(pnum!=null&&pnum<last))open('');if(pnum!=null)last=pnum;
  const pt=/^run/i.test(get(r,'PLAY TYPE'))?'run':/^pass/i.test(get(r,'PLAY TYPE'))?'pass':(/rush|scram/i.test(get(r,'RESULT'))?'run':'pass'),gnv=parseFloat(get(r,'GN/LS')),gn=isNaN(gnv)?0:gnv,res=get(r,'RESULT'),fm=splitForm(get(r,'OFF FORM'));
  const mo=get(r,'MOTION').toUpperCase(),mm=mo.match(/^([XZYHMFABT])\s+(.+)$/),f=yardF(get(r,'YARD LN')),tg=get(r,'TAG').toUpperCase().split(/\s+/).filter(Boolean),hs=get(r,'HASH').toUpperCase().charAt(0),fib=get(r,'FIB?').toUpperCase().charAt(0);
  const jumbo=fm.ftags.includes('JUMBO'),fts=fm.ftags.filter(x=>x!=='JUMBO');
  const p={k:'p',pid:'i'+(stamp++).toString(36),ts:stamp,down:dn,dist:di,f:f==null?25:f,ptype:pt,formation:fm.formation,dir:fm.dir,motion:mm?mm[2]:(mo||null),mpos:mm?mm[1]:null,shift:/^Y/i.test(get(r,'SHIFT')),jumbo,
   call:get(r,'PLAY').toUpperCase()||null,owc:get(r,'ONE WORD CALL').toUpperCase()||null,tags:tg,tag:tg.join(' '),ftags:fts,ftag:fts.join(' '),rgs:false,shot:/^Y/i.test(get(r,'SHOT')),result:resCode(res,pt,gn),gain:gn,
   player:get(r,'PLAYER').replace(/#/g,'')||null,target:get(r,'TARGET').toUpperCase()||null,hash:'LMR'.includes(hs)&&hs?hs:null,fib:fib==='Y'||fib==='N'?fib:null,glf:null,passer:get(r,'QB NUMBER').replace(/#/g,'')||null,td:/\bTD\b|TOUCHDOWN/i.test(res)};
  const p10=get(r,'P & 10').toUpperCase()==='Y';
  if(prev&&(p10||(p.down===1&&!(prev.f+prev.gain===p.f)&&!prev.td)||prev.td))cur.plays.push({k:'d'});
  cur.plays.push(p);prev=p}
 blocks.forEach((b,i)=>{if(!b.name)b.name=blocks.length>1?base+' '+(i+1):base;b.n=b.plays.filter(x=>x.k==='p').length});
 return{blocks:blocks.filter(b=>b.n),skipped}}
window.Importer={readXlsx,parseCsv,findHeader,parseOwn,cellS};
})();
