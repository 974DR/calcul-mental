// fireworks.js
function showFireworks(duration = 5000) {
  // créer un canvas en plein écran
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

  // créer une instance de confetti
  const conf = confetti.create(canvas, { resize: true, useWorker: true });
  const end = Date.now() + duration;

  (function frame() {
    // 3 explosions aléatoires par frame
    for (let i = 0; i < 3; i++) {
      conf({
        particleCount: 80,
        spread: 70,
        startVelocity: 60,
        gravity: 1.0,
        ticks: 120,
        origin: { x: Math.random(), y: Math.random() * 0.4 + 0.1 }
      });
    }
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    } else {
      setTimeout(() => { canvas.remove(); }, 300);
    }
  })();
}
