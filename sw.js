<script>
  // ----- INTRO logic ---------------------------------------------------------
  (function(){
    const intro = document.getElementById('intro');
    const startBtn = document.getElementById('introBtn');
    const skipBtn  = document.getElementById('skipIntro');

    // Ne montrer l'intro qu'une fois par appareil (jusqu'au prochain vidage du cache)
    const SEEN_KEY = 'cm_intro_seen_v1';
    const seen = localStorage.getItem(SEEN_KEY);
    if(seen){ intro.classList.add('hide'); } // déjà vu → pas d'intro

    function closeIntro(playSound){
      try{
        if(playSound){
          const audio = new Audio('intro-sound.mp3'); // facultatif
          audio.play().catch(()=>{}); // iOS exige un clic pour jouer: on est dans un clic, donc OK
        }
      }catch(e){}
      intro.classList.add('hide');
      localStorage.setItem(SEEN_KEY, '1');
      // focus sur le bouton Démarrer si présent
      const start = document.getElementById('startBtn');
      if(start) setTimeout(()=>start.focus({preventScroll:true}), 200);
    }

    startBtn?.addEventListener('click', ()=>closeIntro(true));
    skipBtn?.addEventListener('click', ()=>closeIntro(false));
  })();
</script>
const CACHE = 'cm-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
