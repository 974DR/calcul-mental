// sw.js — GitHub Pages friendly
const CACHE = 'cm-v7';

// Détecte le sous-dossier (ex: "/calcul-mental/")
const baseURL = (() => {
  const p = self.location.pathname;            // "/calcul-mental/sw.js"
  return p.endsWith('sw.js') ? p.replace(/sw\.js$/, '') : '/';
})();

// Liste des fichiers à precacher (chemins relatifs au dossier du site)
const ASSETS = [
  '',                 // => index.html
  'index.html',
  'fireworks.js',
  'icon-192.png',
  'icon-512.png',
  'manifest.webmanifest',
];

// Helper: fabrique une Request avec le bon chemin
const url = (path) => new URL(baseURL + path, self.location.origin).toString();

// ----- Install: precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS.map(url)))
  );
  self.skipWaiting();
});

// ----- Activate: nettoyage anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// ----- Fetch
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Navigations: réseau d'abord, fallback sur index.html en offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(url('index.html')))
    );
    return;
  }

  // Autres requêtes: cache d'abord, sinon réseau
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
