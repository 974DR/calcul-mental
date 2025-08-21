// sw.js (v17) — scope: /calcul-mental/
const CACHE = 'cm-v17';
const ASSETS = [
  './',               // la racine du dossier
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// HTML: network-first ; autres: cache-first
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const wantsHTML = req.headers.get('accept')?.includes('text/html');

  if (wantsHTML) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(caches.match(req).then(r => r || fetch(req)));
});
