<script>
  // ----- INTRO logic ---------------------------------------------------------
  (function(){
    const intro = document.getElementById('intro');
    const startBtn = document.getElementById('introBtn');
    const skipBtn  = document.getElementById('skipIntro');

const SEEN_KEY = 'cm_intro_seen_v1';
const seen = localStorage.getItem(SEEN_KEY);
if(seen){ intro.classList.add('hide'); }
...
localStorage.setItem(SEEN_KEY, '1');

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
// Affiche un feu d’artifice plein écran pendant `duration` ms
function showFireworks(duration = 5000) {
  // canvas plein écran qui n’intercepte pas les clics
  let canvas = document.getElementById('fireworks-overlay');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'fireworks-overlay';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
  }

  const conf = confetti.create(canvas, { resize: true, useWorker: true });
  const end = Date.now() + duration;

  (function frame() {
    // Plusieurs « explosions » à des positions aléatoires
    for (let i = 0; i < 3; i++) {
      conf({
        particleCount: 80,
        spread: 70,
        startVelocity: 60,
        gravity: 1.0,
        ticks: 120,
        origin: { x: Math.random(), y: Math.random() * 0.4 + 0.1 } // en haut/milieu de l’écran
      });
    }
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    } else {
      setTimeout(() => { canvas.remove(); }, 300);
    }
  })();
}
