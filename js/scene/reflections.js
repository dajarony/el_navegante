export function updateReflection(scene, refl) {
  const wTop = scene.offsetHeight * 0.70;
  const moonCX = scene.offsetWidth * 0.58 + 48;
  const W = 180;
  const H = scene.offsetHeight * 0.18;
  refl.style.top = wTop + 'px';
  refl.style.height = H + 'px';
  refl.style.width = W + 'px';
  refl.style.left = (moonCX - W / 2) + 'px';
}

export function initSparkles(scene, container) {
  container.innerHTML = '';
  const cx = scene.offsetWidth * 0.58 + 48;
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div');
    el.className = 'spk';
    el.style.left = (cx + (Math.random() - 0.5) * 90) + 'px';
    el.style.bottom = (Math.random() * 80 + 18) + 'px';
    const dur = (Math.random() * 2.2 + 1.4).toFixed(1);
    const del = (Math.random() * 3.5).toFixed(1);
    el.style.animation = `spkp ${dur}s ${del}s ease-in-out infinite`;
    container.appendChild(el);
  }
}

function makeFlock(n, scale) {
  let p = '';
  for (let i = 0; i < n; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = col * 32 * scale + row * 14 * scale;
    const by = row * 16 * scale + col * 6 * scale;
    p += `<path d="M${bx},${by} Q${bx + 8 * scale},${by - 5 * scale} ${bx + 16 * scale},${by} Q${bx + 24 * scale},${by - 5 * scale} ${bx + 32 * scale},${by}" fill="none" stroke="#0b1d3a" stroke-width="${1.8 * scale}" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 ${120 * scale} ${60 * scale}" width="${120 * scale}" height="${60 * scale}" style="overflow:visible">${p}</svg>`;
}

export function buildBirds(container) {
  container.innerHTML = '';
  const flocks = [
    [78, 85, -20, 5, 1],
    [112, 110, -55, 8, 1],
    [55, 70, 10, 3, 0.8],
    [96, 150, -90, 6, 1.1],
    [135, 130, -60, 4, 0.9]
  ];
  flocks.forEach(([top, dur, delay, n, scale]) => {
    const el = document.createElement('div');
    el.className = 'flock';
    el.style.top = top + 'px';
    el.style.animationDuration = dur + 's';
    el.style.animationDelay = delay + 's';
    el.innerHTML = makeFlock(n, scale);
    container.appendChild(el);
  });
}
