// sw.js
const CACHE = 'cm-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './fireworks.js' // si présent
];

// Installe et précache
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Active et nettoie les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Navigation: réseau d'abord, sinon index offline
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Pour les navigations (tap sur un lien / chargement page)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Pour le reste: cache d'abord puis réseau
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
