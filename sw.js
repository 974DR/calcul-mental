// sw.js
const CACHE_NAME = 'cm-v12';               // ⬅️ bump
const ASSETS = [
  'index.html',
  'fireworks.js',
  'fireworks.mp3',
  'icon-192.png',
  'icon-512.png',
  'manifest.webmanifest',
  'mixkit-angelic-swell-presentation-2672.wav',
];

// Install: pré-cache fichiers statiques
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: supprime les vieux caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: HTML en network-first, le reste en cache-first
self.addEventListener('fetch', event => {
  const req = event.request;
  const isHTML = req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(r => r || fetch(req))
  );
});
