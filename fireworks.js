// fireworks.js — feu d'artifice + son propre, sans dépendance
// - Démarre le son UNE fois au début
// - Ne relance pas le son entre les explosions
// - Coupe le son net et enlève le canvas à la fin
// - Respecte prefers-reduced-motion

(function () {
  const PREFERS_REDUCED =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Canvas plein écran, au-dessus de tout
  function createCanvas() {
    let canvas = document.getElementById("fireworks-overlay");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "fireworks-overlay";
      canvas.style.position = "fixed";
      canvas.style.inset = "0";
      canvas.style.zIndex = "10000";
      canvas.style.pointerEvents = "none";
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth || document.documentElement.clientWidth || 1024;
      canvas.height = window.innerHeight || document.documentElement.clientHeight || 768;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    return {
      canvas,
      ctx,
      cleanup: () => window.removeEventListener("resize", resize)
    };
  }

  // -------- Particules ----------
  class Particle {
    constructor(x, y, color, angle, speed) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1; // 1 → 0
      this.decay = Math.random() * 0.015 + 0.012;
      this.color = color;
      this.size = Math.random() * 2 + 1.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05; // gravité
      this.vx *= 0.99; // frottements
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

  const rand = (min, max) => Math.random() * (max - min) + min;

  function explode(particles, cx, cy) {
    const palette = ["#ff5252", "#ffd166", "#6ee7b7", "#60a5fa", "#a78bfa", "#f472b6"];
    const color = palette[(Math.random() * palette.length) | 0];
    const count = 90;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(2.5, 6.5) * (i < count * 0.85 ? 1 : 1.6);
      particles.push(new Particle(cx, cy, color, angle, speed));
    }
  }

  // API publique
  // duration ms (défaut 7000) — le son est géré ici (start/stop)
  window.showFireworks = function showFireworks(duration = 7000) {
    if (PREFERS_REDUCED) return;

    const { canvas, ctx, cleanup } = createCanvas();
    const particles = [];

    const endAt = performance.now() + duration;

    // Démarre le son UNE seule fois (alias géré côté index.html)
    if (window.__startFireworksSound) {
      window.__startFireworksSound();
    } else if (window.__playFireworkSound) {
      window.__playFireworkSound();
    }

    // Légères variations autour du centre
    const jitter = () => ({
      x: canvas.width / 2 + rand(-canvas.width * 0.05, canvas.width * 0.05),
      y: canvas.height / 2 + rand(-canvas.height * 0.05, canvas.height * 0.05)
    });

    // Première explosion immédiate
    const c0 = jitter();
    explode(particles, c0.x, c0.y);

    function frame(now) {
      // Fin : coupe le son et nettoie immédiatement
      if (now >= endAt) {
        if (window.__stopFireworksSound) window.__stopFireworksSound();
        cleanup();
        canvas.remove();
        return;
      }

      // Traînée
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rendu additif lumineux
      ctx.globalCompositeOperation = "lighter";

      // MAJ + dessin des particules
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.update()) {
          particles.splice(i, 1);
          continue;
        }
        p.draw(ctx);
      }

      // Nouvelles explosions régulières, sans toucher au son
      if (Math.random() < 0.08) {
        const c = jitter();
        explode(particles, c.x, c.y);
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  };
})();
