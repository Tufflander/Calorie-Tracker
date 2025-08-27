/* Service Worker: cache shell & data, serve offline */
const CACHE = 'calcoach-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './data/au_food_sample.json',
  './js/app.js','./js/router.js','./js/store.js','./js/db.js','./js/utils.js',
  './js/ui.js','./js/onboarding.js','./js/targets.js','./js/logging.js',
  './js/fooddb.js','./js/coaching.js','./js/metrics.js','./js/charts.js',
  './js/miniCalculator.js','./js/education.js',
  './assets/icons/icon-192-maskable.svg','./assets/icons/icon-512-maskable.svg'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(cached=>{
      const fetchP = fetch(request).then(resp=>{
        const copy = resp.clone();
        caches.open(CACHE).then(c=>c.put(request, copy));
        return resp;
      }).catch(()=>cached);
      return cached || fetchP;
    })
  );
});
