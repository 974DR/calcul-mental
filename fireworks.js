// fireworks.js
function showFireworks(duration = 5000) {
  let canvas = document.getElementById("fireworks-overlay");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "fireworks-overlay";
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.zIndex = "9999";
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  class Particle {
    constructor(x, y, color, angle, speed) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed;
      this.life = 100;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += 0.05; // gravité
      this.life--;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  let particles = [];
  function explode() {
    const colors = ["#ff4444", "#44ff44", "#4488ff", "#ffff44", "#ff44ff"];
    const x = innerWidth / 2;
    const y = innerHeight / 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = Math.random() * 5 + 2;
      particles.push(new Particle(x, y, color, angle, speed));
    }
  }

  let end = Date.now() + duration;
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.update();
      p.draw();
      if (p.life <= 0) particles.splice(i, 1);
    });
    if (Date.now() < end) {
      if (Math.random() < 0.05) explode();
      requestAnimationFrame(loop);
    } else {
      canvas.remove();
    }
  }
  explode();
  loop();
}
