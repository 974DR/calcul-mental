// fireworks.js — feux d'artifice centrés, sans dépendance
(function () {
  const PREFERS_REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createCanvas() {
    let canvas = document.getElementById('fireworks-overlay');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'fireworks-overlay';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.zIndex = '9999';
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return { canvas, ctx, cleanup: () => window.removeEventListener('resize', resize) };
  }

  class Particle {
    constructor(x, y, color, angle, speed) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1;             // 1 → 0
      this.decay = Math.random() * 0.015 + 0.012; // vitesse de disparition
      this.color = color;
      this.size = Math.random() * 2 + 1.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05;           // gravité légère
      this.vx *= 0.99;           // frottements
      this.vy *= 0.99;
      this.life -= this.decay;
      return this.life > 0;
    }
    draw(ctx) {
      ctx.globalAlpha = Math.max(this.life, 0);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function rand(min, max) { return Math.random() * (max - min) + window.__playFireworkSound && window.__playFireworkSound();
  function explode(particles, cx, cy) {
    const palette = ['#ff5252', '#ffd166', '#6ee7b7', '#60a5fa', '#a78bfa', '#f472b6'];
    const color = palette[(Math.random() * palette.length) | 0];

    // 1 explosion principale + quelques étincelles plus rapides
    const count = 90;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(2.5, 6.5) * (i < count * 0.85 ? 1 : 1.6);
      particles.push(new Particle(cx, cy, color, angle, speed));
    }
  }

  // API publique
  window.showFireworks = function showFireworks(duration = 5000) {
    if (PREFERS_REDUCED) return; // respect accessibilité

    const { canvas, ctx, cleanup } = createCanvas();
    const particles = [];
    const endAt = performance.now() + duration;

    // Pour un centre "vivant" (légère variation autour du centre)
    const jitter = () => ({
      x: canvas.width / 2 + rand(-canvas.width * 0.05, canvas.width * 0.05),
      y: canvas.height / 2 + rand(-canvas.height * 0.05, canvas.height * 0.05)
    });

    // Première explosion immédiate
    const first = jitter();
    explode(particles, first.x, first.y);

    function frame(now) {
      // fond semi-transparent pour l'effet de traînée
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // mélange additif pour un rendu lumineux
      ctx.globalCompositeOperation = 'lighter';

      // mettre à jour + dessiner
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.update()) { particles.splice(i, 1); continue; }
        p.draw(ctx);
      }

      // Tant que la durée n'est pas écoulée, déclencher des explosions régulières au centre
      if (now < endAt) {
        if (Math.random() < 0.08) {
          const c = jitter();
          explode(particles, c.x, c.y);
        }
        requestAnimationFrame(frame);
      } else if (particles.length) {
        // Laisser finir les particules restantes
        requestAnimationFrame(frame);
      } else {
        // Nettoyer
        cleanup();
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  };
})();
