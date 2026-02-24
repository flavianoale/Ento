const CACHE = 'entomon-pro-v1';
const ASSETS = ['./','./index.html','./style.css','./app.js','./data.js','./manifest.json','./service-worker.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request).then(network => {
    const copy = network.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return network;
  }).catch(() => caches.match('./index.html'))));
});
