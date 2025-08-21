// sw.js (v24) — PWA calcul-mental
// HTML: network-first (avec navigationPreload) ; autres: stale-while-revalidate

const CACHE = 'cm-v24';
const ASSETS = [
  './',                    // racine du site
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './fireworks.js',
  './fireworks.mp3'
];

// ===== Install : précache + navigation preload =====
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // active la précharge des navigations si dispo (accélère le network-first)
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)));
  })());
  self.clients.claim();
});

// ===== Fetch =====
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Détecte les navigations/HTML
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Network-first : essaie le réseau, sinon cache (index.html en secours)
    event.respondWith((async () => {
      try {
        // utilise la réponse préchargée si dispo
        const preload = await event.preloadResponse;
        if (preload) {
          const copy = preload.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return preload;
        }
        const net = await fetch(req);
        const copy = net.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return net;
      } catch {
        const cached = await caches.match(req);
        return cached || caches.match('./index.html');
      }
    })());
    return;
  }

  // Autres ressources : stale-while-revalidate
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const fetchPromise = fetch(req)
      .then((res) => {
        // ne met en cache que les réponses 200 / basic (même origine)
        if (res && res.status === 200 && res.type === 'basic') {
          cache.put(req, res.clone());
        }
        return res;
      })
      .catch(() => null);

    // renvoie le cache immédiatement si présent, sinon attend le réseau
    return cached || fetchPromise || (await fetch(req).catch(() => cached));
  })());
});

// ===== Mise à jour immédiate optionnelle =====
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
