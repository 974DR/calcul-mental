// sw.js — v13
const CACHE = 'cm-v13';
const ASSETS = [
  'index.html',
  'fireworks.js',        // si tu le sépares plus tard
  'fireworks.mp3',
  'icon-192.png',
  'icon-512.png',
  'manifest.webmanifest',
  'mixkit-angelic-swell-presentation-2672.wav'
];

// Install: précache
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: purge anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

// Fetch: HTML en network-first, le reste en cache-first
self.addEventListener('fetch', e => {
  const req = e.request;
  const wantsHTML = req.headers.get('accept') && req.headers.get('accept').includes('text/html');

  if (wantsHTML) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
