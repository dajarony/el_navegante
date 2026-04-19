export const TWEAK_DEFAULTS = {
  scene: 'night',
  waves: 1,
  stars: 90,
  parallax: 0.1,
  grain: 0.3,
  show_title: true,
  show_lighthouse: true,
  show_boat: true,
  show_galleon: true,
  show_whale: false,
  show_fish: true,
  show_birds: true,
  show_mountains: false,
  show_beam: true
};

export function initTweaks(api) {
  const state = { ...TWEAK_DEFAULTS };

  function applyWaves(v) {
    document.querySelectorAll('#scene .ws').forEach((el) => {
      const b = el.style.getPropertyValue('--wsd');
      const match = b.match(/([\d.]+)s/);
      if (match) el.style.animationDuration = (parseFloat(match[1]) / v).toFixed(1) + 's';
    });
    document.getElementById('scene').style.setProperty('--wave-amp', (v * 0.62).toFixed(3));
  }

  function applyGrain(v) {
    document.getElementById('grain').style.opacity = v;
  }

  function applyScene(s) {
    document.body.classList.remove('dawn', 'storm', 'calm');
    if (s === 'dawn') document.body.classList.add('dawn');
    if (s === 'storm') document.body.classList.add('storm');
    document.querySelectorAll('#seg-scene button').forEach((b) => {
      b.classList.toggle('act', b.dataset.s === s);
    });
    const sub = document.querySelector('#hero .tagline');
    if (sub) {
      sub.textContent = s === 'dawn'
        ? 'Dawn · Warm horizon · Gentle breeze'
        : s === 'storm'
        ? 'Storm · Rain · Restless sea'
        : 'Night · Full moon · Calm sea';
    }
  }

  const toggleMap = {
    title: '#hero',
    lighthouse: '#lighthouse-wrap',
    boat: '.main-boat',
    galleon: '#galleon',
    whale: '#whale',
    fish: '#fish',
    birds: '#brd',
    mountains: '#mountains',
    beam: '#beam'
  };

  function applyToggle(key, on) {
    const sel = toggleMap[key];
    if (!sel) return;
    document.querySelectorAll(sel).forEach((el) => { el.style.display = on ? '' : 'none'; });
  }

  applyScene(state.scene);
  applyWaves(state.waves);
  api.setParallax(state.parallax);
  applyGrain(state.grain);
  Object.entries({
    title: state.show_title, lighthouse: state.show_lighthouse, boat: state.show_boat,
    galleon: state.show_galleon, whale: state.show_whale, fish: state.show_fish,
    birds: state.show_birds, mountains: state.show_mountains, beam: state.show_beam
  }).forEach(([k, v]) => applyToggle(k, v));

  document.getElementById('r-waves').addEventListener('input', (e) => {
    state.waves = parseFloat(e.target.value); applyWaves(state.waves);
  });
  document.getElementById('r-stars').addEventListener('input', (e) => {
    state.stars = parseInt(e.target.value); api.setStars(state.stars);
  });
  document.getElementById('r-par').addEventListener('input', (e) => {
    state.parallax = parseFloat(e.target.value); api.setParallax(state.parallax);
  });
  document.getElementById('r-grain').addEventListener('input', (e) => {
    state.grain = parseFloat(e.target.value); applyGrain(state.grain);
  });

  document.querySelectorAll('#seg-scene button').forEach((b) => {
    b.addEventListener('click', () => { state.scene = b.dataset.s; applyScene(state.scene); });
  });

  document.querySelectorAll('#tweaks .toggle').forEach((el) => {
    el.addEventListener('click', () => {
      const k = el.dataset.t;
      el.classList.toggle('on');
      const on = el.classList.contains('on');
      state['show_' + k] = on;
      applyToggle(k, on);
    });
  });

  const tweaks = document.getElementById('tweaks');
  const tweaksBtn = document.getElementById('tweaks-btn');
  function togglePanel(force) {
    const on = force !== undefined ? force : !tweaks.classList.contains('on');
    tweaks.classList.toggle('on', on);
    tweaksBtn.classList.toggle('on', on);
  }
  tweaksBtn.addEventListener('click', () => togglePanel());

  return { setScene: applyScene };
}
