// sw.js
const CACHE = 'cm-v9'; // ← nouvelle version

// Construire des URLs relatives au scope du SW (donc /calcul-mental/)
const toURL = (p) => new URL(p, self.location).toString();

const ASSETS = [
  '',                 // équivaut à index.html
  'index.html',
  'fireworks.js',
  'icon-192.png',
  'icon-512.png',
  'manifest.webmanifest',
  'mixkit-angelic-swell-presentation-2672.wav',
  // ajoute ici d'autres fichiers si besoin (css/js) **sans** slash initial
].map(toURL);

// --- Install & precache
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
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

  // Pour les navigations (ouvrir/rafraîchir une page) → fallback sur index.html du scope
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(toURL('index.html')))
    );
    return;
  }

  // Pour le reste : cache d'abord, sinon réseau
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
}); 
