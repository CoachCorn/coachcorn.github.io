/* Every plain file picker on a page becomes a drop zone: drag a file onto the dashed box, or tap Choose file.
   Skips pickers that are hidden or sit inside a label button (those already have their own button). */
(function(){
 const css=`.fdz{border:2px dashed var(--line,#3a4654);border-radius:12px;padding:14px;text-align:center;margin:6px 0;transition:border-color .15s,background .15s}
.fdz.on{border-color:var(--acc,#9b7bff);background:rgba(155,123,255,.08)}.fdz .fdt{font-size:14px;opacity:.75;margin-bottom:8px}.fdz .fdn{font-size:13px;margin-top:8px;opacity:.85;word-break:break-all}`;
 const st=document.createElement('style');st.textContent=css;(document.head||document.documentElement).appendChild(st);
 function up(inp){if(inp.dataset.fdz||inp.hidden||inp.closest('label')||inp.dataset.nodrop!=null||inp.style.display==='none')return;inp.dataset.fdz='1';
  const box=document.createElement('div');box.className='fdz';const multi=inp.multiple;
  box.innerHTML=`<div class="fdt">Drop ${multi?'files':'a file'} here, or</div><button type="button" class="btn">Choose file${multi?'s':''}</button><div class="fdn"></div>`;
  inp.parentNode.insertBefore(box,inp);box.appendChild(inp);inp.style.display='none';
  box.querySelector('button').onclick=()=>inp.click();
  const show=()=>{const f=[...(inp.files||[])];box.querySelector('.fdn').textContent=f.length?f.map(x=>x.name).join(', '):''};
  inp.addEventListener('change',show);
  ['dragenter','dragover'].forEach(t=>box.addEventListener(t,e=>{e.preventDefault();box.classList.add('on')}));
  ['dragleave','dragend'].forEach(t=>box.addEventListener(t,e=>{if(!box.contains(e.relatedTarget))box.classList.remove('on')}));
  box.addEventListener('drop',e=>{e.preventDefault();box.classList.remove('on');const fs=e.dataTransfer&&e.dataTransfer.files;if(!fs||!fs.length)return;
   try{inp.files=fs}catch(x){try{const dt=new DataTransfer();[...fs].forEach(f=>dt.items.add(f));inp.files=dt.files}catch(y){return}}
   inp.dispatchEvent(new Event('change',{bubbles:true}))})}
 const scan=r=>{(r.querySelectorAll?r:document).querySelectorAll('input[type=file]').forEach(up)};
 const go=()=>{scan(document);new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches&&n.matches('input[type=file]'))up(n);else scan(n)}))).observe(document.body,{childList:true,subtree:true})};
 if(document.body)go();else addEventListener('DOMContentLoaded',go);
})();
