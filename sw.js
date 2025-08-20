// sw.js
const CACHE = 'cm-v8'; // change ce nom à chaque mise à jour
const ASSETS = [
  'index.html',
  'fireworks.js',
  'icon-192.png',
  'icon-512.png',
  'manifest.webmanifest',
];

// Install + precache
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate + nettoyage anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Navigation : fallback sur index.html du même répertoire
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('index.html'))
    );
    return;
  }

  // Le reste : cache d’abord puis réseau
  event.respondWith(caches.match(req).then((res) => res || fetch(req)));
});
