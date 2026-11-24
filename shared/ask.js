/* Styled one-line prompt for the defensive pages. Same look as the offense Almanac's name box (dark card, big capital letters,
   OK / Cancel) instead of the plain browser prompt. ASK(title, value, cb): cb(text) runs only when OK or Enter is pressed with text in the box.
   Escape closes the box and is marked handled, so the shell does not also leave the page. Self-contained: injects its own CSS. */
(function(root){
let st=null;
function css(){if(st)return;st=document.createElement('style');st.textContent=
'.askov{position:fixed;inset:0;background:#000a;display:flex;align-items:center;justify-content:center;z-index:99}'+
'.askbox{background:var(--card,#18232f);color:var(--tx,#e8eef4);border:1px solid var(--line,#2a3948);border-radius:14px;padding:14px;width:min(640px,94vw);max-height:90vh;overflow:auto}'+
'.askbox h3{margin:0 0 10px;font-size:16px}'+
'.askbox input{width:100%;font-size:20px;padding:10px;background:var(--bg,#0f1720);color:var(--tx,#e8eef4);border:1px solid var(--line,#2a3948);border-radius:8px;text-transform:uppercase}'+
'.askbox p{display:flex;gap:10px;margin:12px 0 0}'+
'.askbox button{font:inherit;font-weight:600;text-transform:uppercase;color:var(--tx,#e8eef4);background:var(--card,#18232f);border:1px solid var(--line,#2a3948);border-radius:8px;padding:8px 14px;min-height:40px}'+
'.askbox button.pri{background:var(--blue,#3b9cff);border-color:var(--blue,#3b9cff);color:#fff}';
document.head.appendChild(st)}
function ASK(title,val,cb){css();const o=document.createElement('div');o.className='askov';
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 o.innerHTML='<div class="askbox" role="dialog"><h3>'+esc(title)+'</h3><input type="text" autocapitalize="characters" autocomplete="off" autocorrect="off" value="'+esc(val)+'"><p><button class="pri" data-ok>OK</button><button data-no>Cancel</button></p></div>';
 document.body.appendChild(o);const i=o.querySelector('input');
 const close=()=>{if(o.parentNode)o.parentNode.removeChild(o)};
 const go=()=>{const v=i.value.trim();close();if(v)cb(v)};
 o.querySelector('[data-ok]').onclick=go;o.querySelector('[data-no]').onclick=close;
 o.addEventListener('mousedown',e=>{if(e.target===o)close()});
 i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}});
 setTimeout(()=>{try{i.focus();i.select()}catch(e){}},60)}
root.ASK=ASK})(window);
