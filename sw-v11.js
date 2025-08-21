// sw-v11.js
const CACHE = 'cm-v11';

// construit des URLs absolues à partir du scope du SW
const toURL = (p) => new URL(p, self.location).toString();

// ⚠️ on VERSIONNE index.html pour casser le cache ancien
const INDEX_VER = '11';
const INDEX_URL = toURL(`index.html?v=${INDEX_VER}`);

const ASSETS = [
  '', // racine
  `index.html?v=${INDEX_VER}`, // versionnée pour forcer le réseau
  'fireworks.js',
  'icon-192.png',
  'icon-512.png',
  'manifest.webmanifest',
  'mixkit-angelic-swell-presentation-2672.wav',
  'fireworks.mp3',
].map(toURL);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // on recharge depuis le réseau pour index.html
      await cache.add(new Request(INDEX_URL, { cache: 'reload' }));
      // les autres peuvent venir du cache normal
      await cache.addAll(ASSETS.filter(u => !u.includes('index.html?v=')));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Pages de navigation : réseau d’abord, fallback cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'reload' })
        .catch(() => caches.match(INDEX_URL))
    );
    return;
  }

  // Autres ressources : cache d’abord, sinon réseau
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
