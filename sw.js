// sw.js
// ========= 974DR Calcul mental (GitHub Pages sous /calcul-mental/) =========

// 1) Incrémente la version à chaque changement de la liste ASSETS
const CACHE = 'cm-v7';

// 2) Fichiers à mettre en cache (chemins RELATIFS au dossier du site)
const TO_CACHE = [
  'index.html',
  'fireworks.js',
  'icon-192.png',
  'icon-512.png',
  'manifest.webmanifest'
];

// Utilitaires: fabrique des chemins corrects pour un site en sous-dossier
const SCOPE_URL = new URL(self.registration.scope); // ex: https://974dr.github.io/calcul-mental/
function toScopedPath(p) {
  // Retourne juste le pathname résolu, ex: /calcul-mental/index.html
  return new URL(p, SCOPE_URL).pathname;
}

// Liste finale en chemins SCOPÉS (inclut aussi le dossier lui-même pour "/calcul-mental/")
const ASSETS = TO_CACHE.map(toScopedPath).concat([SCOPE_URL.pathname]);

// ---------------- Install & precache ----------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ---------------- Activate & clean old caches ----------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// ---------------- Fetch strategy ----------------
// - Navigations: réseau d'abord, fallback vers index.html du sous-dossier en offline
// - Autres requêtes: cache d'abord, sinon réseau
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Navigations (ouverture/refresh d'une page)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(toScopedPath('index.html')))
    );
    return;
  }

  // Autres ressources
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
