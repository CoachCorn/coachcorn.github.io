/* Auto-capitalization on, everywhere text is typed. Search and type-it boxes capitalize every letter (the same as the offense
   Almanac's own boxes); name boxes capitalize each word; notes, definitions and other sentence boxes capitalize the first letter of each sentence.
   Works on boxes added later too. A box that already sets autocapitalize itself is left alone, and so are numbers, passwords,
   emails, links, dates and files. */
(function(){
const SKIP='input[type=number],input[type=checkbox],input[type=radio],input[type=file],input[type=range],input[type=hidden],input[type=password],input[type=email],input[type=url],input[type=date],input[type=time],input[type=color],input[type=tel],input[inputmode=numeric],input[inputmode=decimal],input[inputmode=tel]';
const ALL=/search|type |type the|type it|play|call/i;
const SENT=/definition|meaning|describe|desc\b|note|remember|what he does|rule|comment|anything you want/i;
function fix(el){if(el.hasAttribute('autocapitalize')||el.matches(SKIP))return;
 const hint=(el.placeholder||'')+' '+(el.getAttribute('aria-label')||'')+' '+(el.dataset.k||'')+' '+(el.id||'');
 el.setAttribute('autocapitalize',el.tagName==='TEXTAREA'||SENT.test(hint)?'sentences':el.type==='search'||ALL.test(hint)?'characters':'words')}
function scan(r){if(r.nodeType!==1)return;if(r.matches&&r.matches('input,textarea'))fix(r);if(r.querySelectorAll)r.querySelectorAll('input,textarea').forEach(fix)}
function start(){scan(document.documentElement);new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(scan))).observe(document.documentElement,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
