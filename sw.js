// sw.js (pas de balises <script> ici)
const CACHE = 'cm-v2'; // change le nom quand tu modifies la liste
const ASSETS = [
  '/',                 // si ton SW est à la racine du site
  '/index.html',
  '/styles.css',       // ajoute tes fichiers réels
  '/app.js',
  '/intro-sound.mp3',  // si utilisé
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest'
];

// Installe et precache
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

// Réseau d'abord pour les requêtes de même origine, sinon fallback offline
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Pour les navigations (tap sur un lien), renvoyer index.html en offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Pour le reste: cache d'abord puis réseau
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
