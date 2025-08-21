// sw.js (v15) — simple, fiable
const CACHE = 'cm-v15';
const ASSETS = [
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png'
];

// Install : précache de base
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate : supprime les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k!==CACHE ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

// Fetch : network-first pour HTML, cache-first pour le reste
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const wantsHTML = req.headers.get('accept')?.includes('text/html');

  if (wantsHTML) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
    return;
  }

  event.respondWith(caches.match(req).then(r => r || fetch(req)));
});
