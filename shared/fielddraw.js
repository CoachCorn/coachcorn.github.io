/* Field drawing for formations: copied from suite/gameplan.html (the offense grid) so the defensive grid can show the same standard drawings.
   Standard drawings are saved on the glossary's formation terms (term.draw = {t,side,pers}); stdDraw() turns one into a drawing and svgOf() draws it.
   TODO: switch gameplan.html to load this file instead of its own copy, so there is only one. Needs: clone() defined before this loads. */
const clone=window.clone||(o=>JSON.parse(JSON.stringify(o)));
/* position letters: the program's own letters (Almanac lists pWR / pTE / pRB) for the standard slots; same as gameplan.html */
const PSW=window.PSW||['X','Z','H','Y'],PST=window.PST||['M','A','F'],PSR=window.PSR||['B','T'];
const ALMK=window.ALMK||(()=>{try{const s=JSON.parse(localStorage.getItem('suite_sync'));return(s&&s.token&&s.exp>Date.now())?'almanac_v1':'almanac_demo'}catch(e){return'almanac_demo'}});
const almData=window.almData||(()=>{try{return JSON.parse(localStorage.getItem(ALMK()))}catch(e){return null}});
const lab=window.lab||(k=>{const A=almData(),L=(A&&A.lists)||{},g=(key,defs)=>{const i=defs.indexOf(k);if(i<0)return null;const v=L[key]&&L[key][i];return v?String(v).toUpperCase():null};return g('pWR',PSW)||g('pTE',PST)||g('pRB',PSR)||k});
const OFF=40;   // the line of scrimmage sits 40 px (about 3 yards) lower than in version 1 drawings, so the defense has room
const OLK=['LT','LG','C','RG','RT'],SK=['Q','X','Z','M','H','Y','F','A','B','T'];
const LKEY=[['#5aa9ff','Motion'],['#ef5b5b','Shift'],['#2fbf71','Ball carrier'],['#f2b632','Carrier on read']];
const TC={Q:'#ffffff',X:'#5aa9ff',Z:'#a3e635',M:'#f2b632',H:'#2fbf71',Y:'#c58bff',F:'#5ad1c8',A:'#ff9bd0',B:'#b0b8c4',T:'#ef7b5b'};
/* The drawing is the whole field width: 160 ft (high school), 4.4 px per foot. The left hash sits where the center lines up (53'4" from the sideline).
   Noah asked for the hashes drawn farther apart than real: HASHR puts the right hash 66 ft from the left one (real is 53'4"). Change the 66 to change it.
   Numbers are 6 ft tall: top 9 yards (27 ft) from the sideline, bottom 21 ft. */
const PXFT=4.4,YD=3*PXFT,LOS=110+OFF,VW=Math.round(160*PXFT),VH=250+OFF,VT=-70,HASHX=Math.round(53.333*PXFT),HASHR=HASHX+Math.round(66*PXFT),NSHIFT=4,NB=Math.round((21-NSHIFT)*PXFT),NT=Math.round((27-NSHIFT)*PXFT); // numbers drawn NSHIFT ft closer to the sideline than the NFHS spec, at Noah's request
const L1=LOS-28,L2=LOS-66,L3=LOS-112,DP={   // defensive templates, spread for readability (LBs ~7 yds wider apart, safeties wider and deeper)
 '4-3-4':[['DE1','DE',163,L1],['DT1','DT',211,L1],['DT2','DT',259,L1],['DE2','DE',307,L1],['WL','W',185,L2],['ML','M',265,L2],['SL','S',415,L2],['CB1','CB',40,LOS-58],['CB2','CB',450,LOS-58],['FS','FS',170,L3],['SS','SS',300,L3]],
 '3-4-4':[['DE1','DE',163,L1],['NT','NT',235,L1],['DE2','DE',307,L1],['OL1','W',100,LOS-42],['IL1','M',205,L2],['IL2','M',290,L2],['OL2','S',410,LOS-42],['CB1','CB',40,LOS-58],['CB2','CB',450,LOS-58],['FS','FS',170,L3],['SS','SS',300,L3]],
 '3-3-5':[['DE1','DE',163,L1],['NT','NT',235,L1],['DE2','DE',307,L1],['WL','W',180,L2],['ML','M',260,L2],['SL','S',330,L2],['CB1','CB',40,LOS-58],['CB2','CB',450,LOS-58],['FS','FS',170,L3],['SS','SS',300,L3],['NB','N',416,LOS-46]],
 '4-2-5':[['DE1','DE',163,L1],['DT1','DT',211,L1],['DT2','DT',259,L1],['DE2','DE',307,L1],['WL','W',205,L2],['ML','M',290,L2],['CB1','CB',40,LOS-58],['CB2','CB',450,LOS-58],['FS','FS',170,L3],['SS','SS',300,L3],['NB','N',416,LOS-46]]};
function addDefense(t,pre){pre=DP[pre]?pre:'4-3-4';Object.keys(t).forEach(k=>{if(t[k].df)delete t[k]});DP[pre].forEach(([k,lab,x,y])=>{const w=k==='CB1'?t.X:k==='CB2'?t.Z:null;if(w&&w.on)x=w.x;t['D_'+k]={x,y,on:1,df:1,lab}});return pre}
const OLSP=36;   // spacing between offensive linemen
const NUMX=Math.round((NB+NT)/2);
function baseDraw(){const t={},put=(k,x,y,on)=>t[k]={x,y,on};
 put('X',NUMX,114+OFF,1);put('Z',VW-NUMX,112+OFF,1);   // X and Z start on the numbers, each on his side
 put('M',165,150+OFF,1);put('Q',235,168+OFF,1);put('T',210,205+OFF,1);put('H',HASHR,128+OFF,1);
 put('Y',395,112+OFF,0);put('F',430,150+OFF,0);put('A',300,190+OFF,0);put('B',260,205+OFF,0);
 OLK.forEach((k,i)=>put(k,235-2*OLSP+i*OLSP,LOS,1));return{t,l:[],v:2}}
let svgN=0;
function pathD(pts,curve){const P=pts.map(p=>[+p[0],+p[1]]);if(!curve||P.length<3)return'M'+P.map(p=>p[0]+' '+p[1]).join(' L');let d='M'+P[0][0]+' '+P[0][1];
 const cl=(vx,vy,max)=>{const m=Math.hypot(vx,vy);return m>max&&m>0?[vx*max/m,vy*max/m]:[vx,vy]};   // cap each handle so short segments next to long ones can't loop or kink
 for(let i=0;i<P.length-1;i++){const p0=P[i-1]||P[i],p1=P[i],p2=P[i+1],p3=P[i+2]||p2,sl=Math.hypot(p2[0]-p1[0],p2[1]-p1[1])*.4,a=cl((p2[0]-p0[0])/6,(p2[1]-p0[1])/6,sl),b=cl((p3[0]-p1[0])/6,(p3[1]-p1[1])/6,sl);
  d+=' C'+(p1[0]+a[0]).toFixed(1)+' '+(p1[1]+a[1]).toFixed(1)+','+(p2[0]-b[0]).toFixed(1)+' '+(p2[1]-b[1]).toFixed(1)+','+p2[0]+' '+p2[1]}return d}
function svgOf(d,sel,cur,selL){const n=++svgN,used=new Set(),edit=selL!==undefined;
 const lines=(d.l||[]).concat(cur?[cur]:[]);lines.forEach(l=>used.add(l.col||'#ffffff'));
 let s=`<svg viewBox="0 ${VT} ${VW} ${VH-VT}" xmlns="http://www.w3.org/2000/svg"><defs>`+[...used].map(c=>`<marker id="a${n}${c.slice(1)}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L8 4L0 8z" fill="${c}"/></marker>`).join('')+`</defs>`;
 s+=`<rect y="${VT}" width="${VW}" height="${VH-VT}" fill="#101c14"/>`;
 const ylab=(x,y,t,an)=>`<text x="${x}" y="${y}" fill="#ffffff66" font-size="9" font-family="sans-serif" text-anchor="${an||'middle'}">${t}</text>`;
 for(let k=-14;k<=12;k++){const y=LOS+k*5*YD;if(y>VT+2&&y<VH-2)s+=`<line x1="0" x2="${VW}" y1="${y}" y2="${y}" stroke="#ffffff14"/>`}   // 5-yard lines
 // numbers: 6 ft tall, top 9 yards in, bottom 7 yards in, both sides
 s+=`<line x1="1" x2="1" y1="${VT}" y2="${VH}" stroke="#ffffff77" stroke-width="2"/><line x1="${VW-1}" x2="${VW-1}" y1="${VT}" y2="${VH}" stroke="#ffffff77" stroke-width="2"/>`;
 // hash marks, a tick every yard, longer every 5
 for(const hx of [HASHX,HASHR])for(let k=-16;k<=12;k++){const y=LOS+k*YD;if(y<VT+3||y>VH-2)continue;const w=k%5===0?18:9;s+=`<line x1="${hx-w/2}" x2="${hx+w/2}" y1="${y}" y2="${y}" stroke="#ffffff66" stroke-width="1.4"/>`}
 // yard numerals (6 ft tall), both read bottom to top: 4 on the bottom, 0 on top
 for(const [cx,rot] of [[(NB+NT)/2,-90],[VW-(NB+NT)/2,-90]])s+=`<text x="${cx}" y="${LOS}" transform="rotate(${rot} ${cx} ${LOS})" fill="#ffffff26" font-size="36" font-weight="700" font-family="sans-serif" text-anchor="middle" dominant-baseline="central" letter-spacing="3">40</text>`;
 s+=`<line x1="0" x2="${VW}" y1="${LOS}" y2="${LOS}" stroke="#ffffff55" stroke-dasharray="6 5"/>`;
 for(let li=0;li<lines.length;li++){const l=lines[li],c=l.col||'#ffffff',pts=(l.pts||[]).map(p=>p.join(',')).join(' '),pd=pathD(l.pts||[],l.curve);if((l.pts||[]).length<2)continue;
  s+=`<path d="${pd}" fill="none" stroke="${c}" stroke-width="${l.dot&&!l.mv?3:2.6}" stroke-linecap="round" stroke-linejoin="round" ${l.mv?'stroke-dasharray="7 6"':l.dot?'stroke-dasharray="1 7"':''} ${l.arrow&&!l.blk?`marker-end="url(#a${n}${c.slice(1)})"`:''}/>`+(l.blk?(()=>{const q=l.pts,a=q[q.length-2],z=q[q.length-1],dx=z[0]-a[0],dy=z[1]-a[1],m=Math.hypot(dx,dy)||1,px=-dy/m*9,py=dx/m*9;return`<line x1="${z[0]-px}" y1="${z[1]-py}" x2="${z[0]+px}" y2="${z[1]+py}" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`})():'')+(edit&&li<d.l.length?(selL===li?`<path d="${pd}" fill="none" stroke="#9b7bff" stroke-width="9" stroke-opacity=".4" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>`:'')+`<path data-l="${li}" d="${pd}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" pointer-events="stroke"/>`:'')}
 for(const k of Object.keys(d.t).filter(k=>d.t[k].df&&d.t[k].on)){const t=d.t[k];s+=`<g data-k="${k}">${sel===k?`<circle cx="${t.x}" cy="${t.y}" r="17" fill="none" stroke="#9b7bff" stroke-width="2.5"/>`:''}<circle cx="${t.x}" cy="${t.y}" r="12" fill="#2a1416" stroke="#ef5b5b" stroke-width="1.8"/><text x="${t.x}" y="${t.y+3.5}" text-anchor="middle" font-size="9.5" font-weight="800" font-family="sans-serif" fill="#ff8c8c" pointer-events="none">${t.lab||''}</text></g>`}
 const order=[...OLK,...SK],gone=new Set((d.sh||[]).filter(h=>h.k==='pos').map(h=>h.p));
 for(const k of order){const t=d.t[k];if(!t||!t.on)continue;const ol=OLK.includes(k),c=TC[k]||'#fff',dim=gone.has(k)||(edit&&typeof E!=='undefined'&&E&&((E.mode==='shift'&&E.shk===k)||(sel===k&&(E.mode==='line'||E.mode==='free')&&E.col===shiftCol())));
  s+=`<g data-k="${k}" ${dim?'opacity=".8" filter="grayscale(1)"':''}>${sel===k?`<circle cx="${t.x}" cy="${t.y}" r="17" fill="none" stroke="#9b7bff" stroke-width="2.5"/>`:''}<circle cx="${t.x}" cy="${t.y}" r="12" fill="${ol?'#101c14':c}" stroke="${ol?'#e8eef4':'#0008'}" stroke-width="${ol?1.8:1}"/><text x="${t.x}" y="${t.y+4.5}" text-anchor="middle" font-size="12.5" font-weight="800" font-family="sans-serif" fill="${ol?'#e8eef4':'#0b1118'}" pointer-events="none">${ol?'O':lab(k)}</text></g>`}
 (d.sh||[]).forEach((h,i)=>{if(h.k==='txt'){const c=h.col||'#ffffff',on=edit&&typeof E!=='undefined'&&E&&E.selS===i,ln=String(h.t).split('\n'),w=Math.max(30,Math.max(...ln.map(x=>x.length))*8+14),LH=17,ht=ln.length*LH+9,y0=h.y-15;
  s+=(on?`<rect x="${h.x-w/2}" y="${y0}" width="${w}" height="${ht}" rx="6" fill="none" stroke="#9b7bff" stroke-width="2.5"/>`:'')+`<text x="${h.x}" y="${h.y+5}" text-anchor="middle" font-size="14" font-weight="700" font-family="sans-serif" fill="${c}" stroke="#101c14" stroke-width="3.5" paint-order="stroke" pointer-events="none">${ln.map((x,j)=>`<tspan x="${h.x}" dy="${j?LH:0}">${x.replace(/[&<]/g,m=>m==='&'?'&amp;':'&lt;')||' '}</tspan>`).join('')}</text>`+(edit?`<rect data-s="${i}" x="${h.x-w/2}" y="${y0}" width="${w}" height="${ht}" fill="transparent"/>`:'');return}
 if(h.k==='pos'){const c=h.col||'#ffffff',on=edit&&typeof E!=='undefined'&&E&&E.selS===i;s+=(on?`<circle cx="${h.x}" cy="${h.y}" r="17" fill="none" stroke="#9b7bff" stroke-width="2.5"/>`:'')+`<circle cx="${h.x}" cy="${h.y}" r="12" fill="${TC[h.p]||'#fff'}" stroke="#0008" stroke-width="1"/><text x="${h.x}" y="${h.y+4.5}" text-anchor="middle" font-size="12.5" font-weight="800" font-family="sans-serif" fill="#0b1118" pointer-events="none">${lab(h.p)}</text>`+(edit?`<circle data-s="${i}" cx="${h.x}" cy="${h.y}" r="18" fill="transparent"/>`:'');return}
  const c=h.col||'#ffffff',on=edit&&typeof E!=='undefined'&&E&&E.selS===i,geo=h.k==='tri'?`<polygon points="${h.x},${h.y-26} ${h.x+22},${h.y+13} ${h.x-22},${h.y+13}"`:`<circle cx="${h.x}" cy="${h.y}" r="15"`;
  s+=(on?geo+` fill="none" stroke="#9b7bff" stroke-width="9" stroke-opacity=".4" stroke-linejoin="round"/>`:'')+geo+` fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="3 5" stroke-linecap="round" stroke-linejoin="round"/>`+(edit?`<circle data-s="${i}" cx="${h.x}" cy="${h.y}" r="${h.k==='tri'?22:20}" fill="transparent"/>`:'')});
 if(edit&&selL!=null&&d.l[selL]){const q=d.l[selL].pts;for(let j=0;j<q.length-1;j++)s+=`<circle data-m="${selL}:${j}" cx="${(q[j][0]+q[j+1][0])/2}" cy="${(q[j][1]+q[j+1][1])/2}" r="8" fill="#101c14" fill-opacity=".6" stroke="#9b7bff" stroke-width="2" stroke-dasharray="3 2"/>`}
 if(edit&&selL!=null&&d.l[selL])d.l[selL].pts.forEach((q,j)=>{s+=`<circle data-h="${selL}:${j}" cx="${q[0]}" cy="${q[1]}" r="9" fill="#9b7bff" stroke="#fff" stroke-width="2"/>`});
 {const us=LKEY.filter(k=>(d.l||[]).concat(d.sh||[]).some(l=>(l.col||'#ffffff')===k[0]));let lx=10;us.forEach(k=>{s+=`<line x1="${lx}" y1="${VH-10}" x2="${lx+16}" y2="${VH-10}" stroke="${k[0]}" stroke-width="3" stroke-linecap="round"/><text x="${lx+21}" y="${VH-6.5}" font-size="10" fill="#cbd5e1" font-family="system-ui,sans-serif">${k[1]}</text>`;lx+=21+k[1].length*5.6+16})}
 return s+'</svg>'}
function fmParse(name){const m=String(name||'').trim().match(/^(.*?)\s+(LT|RT|LEFT|RIGHT)$/i);if(!m)return{base:String(name||'').trim(),side:''};const x=m[2].toUpperCase();return{base:m[1].trim(),side:(x==='LT'||x==='LEFT')?'LT':'RT'}}
function mirrorDraw(d){const o=clone(d),m=x=>Math.round(VW-x);for(const k in o.t)o.t[k].x=m(o.t[k].x);[['LT','RT'],['LG','RG']].forEach(([a,b])=>{if(o.t[a]&&o.t[b]){const x=o.t[a].x,y=o.t[a].y;o.t[a].x=o.t[b].x;o.t[a].y=o.t[b].y;o.t[b].x=x;o.t[b].y=y}});(o.l||[]).forEach(l=>l.pts=l.pts.map(q=>[m(q[0]),q[1]]));(o.sh||[]).forEach(h=>h.x=m(h.x));return o}
function stdDraw(t,side){const r=t&&t.draw;if(!r||!r.t)return null;const d=Object.assign(baseDraw(),{t:clone(r.t),l:[]});return(!side||!r.side||side===r.side)?d:mirrorDraw(d)}
