// sw.js (v22) — PWA calcul-mental
// Stratégie : HTML en network-first, le reste en cache-first

const CACHE = 'cm-v22';
const ASSETS = [
  './',                    // racine du site
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './fireworks.js',
  './fireworks.mp3'
];

// ===== Install : précache =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ===== Activate : nettoie anciens caches =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// ===== Fetch =====
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // On détecte les navigations/HTML
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Network-first pour garder le site à jour
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          // Offline : page du cache (index.html en dernier recours)
          caches.match(req).then((r) => r || caches.match('./index.html'))
        )
    );
    return;
  }

  // Pour les autres ressources : cache-first (+ mise en cache au vol)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // On ne met en cache que les réponses valides (status 200, type "basic")
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached); // si tout échoue
    })
  );
});
