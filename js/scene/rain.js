export function buildRain(container, drops = 140) {
  container.innerHTML = '';
  for (let i = 0; i < drops; i++) {
    const r = document.createElement('div');
    r.className = 'rain';
    r.style.left = (Math.random() * 100) + '%';
    r.style.top = (-Math.random() * 40) + '%';
    const dur = (Math.random() * 0.6 + 0.6).toFixed(2);
    const del = (Math.random() * 2).toFixed(2);
    r.style.animationDuration = dur + 's';
    r.style.animationDelay = '-' + del + 's';
    container.appendChild(r);
  }
}
