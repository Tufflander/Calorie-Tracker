/* Service Worker v0.2.1 — bump cache key for update */
const CACHE = 'calcoach-v6';
const ASSETS = [
  './','./index.html','./styles.css','./manifest.webmanifest',
  './data/au_food_sample.json',
  './js/app.js','./js/router.js','./js/ui.js','./js/store.js','./js/db.js',
  './js/logging.js','./js/metrics.js','./js/charts.js','./js/coaching.js','./js/targets.js','./js/miniCalculator.js','./js/fooddb.js',
  './assets/icons/icon-192-maskable.svg','./assets/icons/icon-512-maskable.svg'
];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e=>{
  const {request} = e; if(request.method!=='GET') return;
  e.respondWith(caches.match(request).then(cached=>{
    const fetchP = fetch(request).then(resp=>{ const copy = resp.clone(); caches.open(CACHE).then(c=>c.put(request, copy)); return resp; }).catch(()=>cached);
    return cached || fetchP;
  }));
});
