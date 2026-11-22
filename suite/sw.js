const V='suite-v69';
const FILES=['./','index.html','glossary.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png','turf.jpg','stats.html','film.html','gameplan.html','mux.min.js','../shared/glossary.js','../shared/scout.js','sync.js','../shared/demoseed.js','../shared/importer.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.indexOf('suite-')===0&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// network first so updates show up when online; cached copy when there is no signal
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(ca=>ca.put(e.request,c));return r})
  .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))))});
