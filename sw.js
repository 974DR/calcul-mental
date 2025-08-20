// sw.js
const CACHE = 'cm-v5'; // change à chaque modif de la liste ASSETS
const ASSETS = [
  '/',                   // GitHub Pages (racine du site)
  '/index.html',
  '/fireworks.js',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest',
];

// --- Install & precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// --- Activate & clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// --- Fetch strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Pour les navigations (ouvrir/rafraîchir une page)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Pour le reste : cache d'abord, sinon réseau
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
