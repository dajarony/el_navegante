export function createStars(scene, canvas, initialCount = 110) {
  const ctx = canvas.getContext('2d');
  let stars = [];
  let starCount = initialCount;

  function init() {
    canvas.width = scene.offsetWidth;
    canvas.height = scene.offsetHeight;
    stars = [];
    for (let i = 0; i < starCount; i++) {
      const isSparkle = Math.random() < 0.35;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.65,
        r: isSparkle ? Math.random() * 1.6 + 1.1 : Math.random() * 1.2 + 0.4,
        sp: Math.random() * 0.0015 + 0.0005,
        ph: Math.random() * Math.PI * 2,
        baseA: 0.45 + Math.random() * 0.3,
        hue: Math.random() < 0.15 ? 'cyan' : (Math.random() < 0.1 ? 'warm' : 'gold'),
        kind: isSparkle ? 'sparkle' : 'dot'
      });
    }
  }

  function drawSparkle(cx, cy, r, a, col) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = col;
    ctx.globalAlpha = a;
    ctx.beginPath();
    const L = r * 3.2, S = r * 0.55;
    ctx.moveTo(0, -L);
    ctx.quadraticCurveTo(S, -S, L, 0);
    ctx.quadraticCurveTo(S, S, 0, L);
    ctx.quadraticCurveTo(-S, S, -L, 0);
    ctx.quadraticCurveTo(-S, -S, 0, -L);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = Math.min(1, a * 1.3);
    ctx.fillStyle = `rgba(255,250,220,${(a * 0.9).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const pulse = 0.5 + 0.5 * Math.sin(s.ph + t * s.sp);
      const a = s.baseA + pulse * 0.15;
      let col;
      if (s.hue === 'cyan') col = `rgba(180,220,255,${(a * 0.85).toFixed(2)})`;
      else if (s.hue === 'warm') col = `rgba(255,210,170,${(a * 0.85).toFixed(2)})`;
      else col = `rgba(249,217,73,${(a * 0.92).toFixed(2)})`;

      if (s.kind === 'sparkle') drawSparkle(s.x, s.y, s.r, a, col);
      else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      }
    }
  }

  function setCount(n) { starCount = Math.round(n); init(); }

  init();
  return { draw, init, setCount };
}

export function spawnShootingStar(container) {
  const el = document.createElement('div');
  el.className = 'sh';
  el.style.width = (Math.random() * 200 + 400) + 'px';
  el.style.top = (Math.random() * 28 - 4) + '%';
  el.style.left = (Math.random() * 38 + 58) + '%';
  const dur = (Math.random() * 6 + 12).toFixed(1);
  el.style.animationDuration = dur + 's';

  const numParticles = Math.floor(Math.random() * 6) + 8;
  for (let i = 0; i < numParticles; i++) {
    const dust = document.createElement('div');
    dust.className = 'sh-dust';
    dust.style.setProperty('--rx', Math.random().toFixed(2));
    dust.style.setProperty('--ry', (Math.random() * 2 - 1).toFixed(2));
    dust.style.animationDuration = (Math.random() * 1.5 + 0.8) + 's';
    dust.style.animationDelay = (Math.random() * (dur * 0.6)) + 's';
    el.appendChild(dust);
  }

  container.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000);
  setTimeout(() => spawnShootingStar(container), Math.random() * 14000 + 8000);
}
