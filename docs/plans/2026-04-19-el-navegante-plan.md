# El Navegante Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the monolithic `paper.html` into a modular narrative portfolio with 5 fullscreen snap-scroll sections, where scroll position drives live transitions between Storm / Night / Dawn scenes.

**Architecture:** Vanilla HTML/CSS/JS split into single-responsibility files. The ocean scene lives as a `position:fixed` layer beneath all sections. An `IntersectionObserver` watches each section and switches the body class (`.storm`, `.dawn`, or default night) as sections enter the viewport, which drives the existing CSS scene variants.

**Tech Stack:** HTML5, CSS3 (custom properties, snap scroll, backdrop-filter), Vanilla JavaScript (ES6 modules, IntersectionObserver, Canvas 2D). No frameworks. No build step.

**Design reference:** [docs/plans/2026-04-19-el-navegante-design.md](2026-04-19-el-navegante-design.md)

---

## Verification model

This is a static frontend project without a test framework. Each task has a **Verify** step — open `index.html` in a browser and observe the specific behavior listed. If the observation fails, stop and debug before continuing.

Keep a terminal running a simple static server from the project root:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/` to verify.

---

## Phase 1 — Modular refactor (no behavior change)

The goal of this phase: split `paper.html` into modules **without changing the user-visible result**. After every task in this phase, the site must look and behave exactly like the original.

---

### Task 1: Create directory skeleton

**Files:**
- Create: `css/` (empty directory)
- Create: `js/scene/` (empty directory)
- Create: `content/` (empty directory)
- Create: `index.html` (empty for now — we will build it incrementally)

**Step 1:** Create directories.

```bash
mkdir -p css js/scene content
```

**Step 2:** Keep `paper.html` untouched as the reference — do not delete it until Phase 1 is complete.

**Step 3:** Commit.

```bash
git init 2>/dev/null || true
git add .
git commit -m "chore: create modular directory skeleton"
```

**Verify:** `ls` shows `css/`, `js/scene/`, `content/`, and the original `paper.html`.

---

### Task 2: Extract base.css (reset, typography, variables)

**Files:**
- Create: `css/base.css`

**Step 1:** Copy lines 8-10 from `paper.html` (the reset and body rules) into `css/base.css`, then add CSS custom properties for the palette at the top.

```css
:root {
  --c-deep: #020b18;
  --c-deeper: #071630;
  --c-blue-1: #0e2446;
  --c-blue-2: #153866;
  --c-blue-3: #1d5791;
  --c-blue-4: #2b7cba;
  --c-blue-5: #3b8dbb;
  --c-blue-6: #69b4d4;
  --c-gold: #f9d949;
  --c-gold-soft: #f4d690;
  --c-cream: #f4e7c6;
  --c-cream-soft: #e8e3d3;
  --f-serif: 'Cormorant Garamond', Georgia, serif;
  --f-sans: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  width: 100%;
  min-height: 100%;
  background: var(--c-deep);
  font-family: var(--f-sans);
  color: var(--c-cream-soft);
  scroll-behavior: smooth;
}

body { overflow-x: hidden; }
```

**Step 2:** Commit.

```bash
git add css/base.css
git commit -m "feat: extract base reset and design tokens"
```

**Verify:** `css/base.css` exists and contains the variables block.

---

### Task 3: Extract scene.css (all scene visuals)

**Files:**
- Create: `css/scene.css`

**Step 1:** Copy **all** scene-related CSS from `paper.html` (lines 12-317, skipping the tweaks panel at 229-291) into `css/scene.css`. This includes:

- `#scene`, `.nebula`, `#grain`, `#vignette`
- `.aur` aurora
- `#mw`, `.hl`, `#moon` + moon pseudo-elements
- `#stc`, `#shs`, `.sh`, `.sh-dust`, all keyframes
- `.cld` clouds
- `#refl` moon reflection
- `.par`, `.wc`, `.ws`, `.edge` layers
- `#mountains`
- Boat, whale, fish animations (`@keyframes boatsail`, `bob`, `bob2`, `whbr`, `fishj`)
- `.splash`, `.flock`, `@keyframes flya`, `.spk`, `@keyframes spkp`
- `#beam`, `@keyframes beamsweep`
- `#title` styles
- Storm / dawn / calm body-class overrides

**Step 2:** Commit.

```bash
git add css/scene.css
git commit -m "feat: extract scene styles into dedicated module"
```

**Verify:** Line count roughly 250-280 lines; file opens in editor without syntax errors visible.

---

### Task 4: Extract tweaks.css (controls panel)

**Files:**
- Create: `css/tweaks.css`

**Step 1:** Copy the tweaks panel CSS (lines 229-291 and 585-591 from `paper.html`) into `css/tweaks.css`.

**Step 2:** Commit.

```bash
git add css/tweaks.css
git commit -m "feat: extract tweaks panel styles"
```

**Verify:** File contains `#tweaks`, `#tweaks-btn`, toggle, slider styles.

---

### Task 5: Extract js/scene/stars.js

**Files:**
- Create: `js/scene/stars.js`

**Step 1:** Extract the stars canvas logic (lines 616-678 from `paper.html`) as an ES module.

```js
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
```

**Step 2:** Commit.

```bash
git add js/scene/stars.js
git commit -m "feat: extract stars module"
```

**Verify:** File exports `createStars` and `spawnShootingStar`.

---

### Task 6: Extract js/scene/rain.js

**Files:**
- Create: `js/scene/rain.js`

**Step 1:** Extract rain logic (lines 771-787 from `paper.html`).

```js
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
```

**Step 2:** Commit.

```bash
git add js/scene/rain.js
git commit -m "feat: extract rain module"
```

**Verify:** File exports `buildRain`.

---

### Task 7: Extract js/scene/parallax.js

**Files:**
- Create: `js/scene/parallax.js`

**Step 1:** Extract parallax logic (lines 790-800).

```js
export function createParallax(scene, layers, initialMultiplier = 0.1) {
  let mul = initialMultiplier;

  scene.addEventListener('mousemove', (e) => {
    const r = scene.getBoundingClientRect();
    const mx = e.clientX - r.left - r.width / 2;
    const my = e.clientY - r.top - r.height / 2;
    layers.forEach((el) => {
      const sp = (parseFloat(el.dataset.speed) || 0) * mul;
      el.style.transform = `translate(${(-mx * sp).toFixed(1)}px,${(-my * sp * 0.22).toFixed(1)}px)`;
    });
  });

  return { setMultiplier: (v) => { mul = v; } };
}
```

**Step 2:** Commit.

```bash
git add js/scene/parallax.js
git commit -m "feat: extract parallax module"
```

**Verify:** File exports `createParallax`.

---

### Task 8: Extract js/scene/reflections.js (sparkles + birds + reflection)

**Files:**
- Create: `js/scene/reflections.js`

**Step 1:** Extract `updateRefl`, `initSparkles`, `makeFlock`, `buildBirds` (lines 681-741).

```js
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
    [78, 28, -8, 5, 1],
    [112, 44, -22, 8, 1],
    [55, 20, 5, 3, 0.8],
    [96, 62, -46, 6, 1.1],
    [135, 52, -30, 4, 0.9]
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
```

**Step 2:** Commit.

```bash
git add js/scene/reflections.js
git commit -m "feat: extract reflection, sparkle, and bird modules"
```

**Verify:** File exports `updateReflection`, `initSparkles`, `buildBirds`.

---

### Task 9: Extract js/tweaks.js (control panel wiring)

**Files:**
- Create: `js/tweaks.js`

**Step 1:** Extract the tweaks state management and wiring (lines 594-610 and 806-922). Export a single `initTweaks(api)` function where `api` exposes `setStars`, `setWaves`, `setParallax`, `setGrain`, `setScene`.

```js
export const TWEAK_DEFAULTS = {
  scene: 'night',
  waves: 0.4,
  stars: 90,
  parallax: 0.1,
  grain: 0.3,
  show_title: true,
  show_lighthouse: true,
  show_boat: true,
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
  }

  function applyGrain(v) { document.getElementById('grain').style.opacity = v; }

  function applyScene(s) {
    document.body.classList.remove('dawn', 'storm', 'calm');
    if (s === 'dawn') document.body.classList.add('dawn');
    if (s === 'storm') document.body.classList.add('storm');
    document.querySelectorAll('#seg-scene button').forEach((b) => {
      b.classList.toggle('act', b.dataset.s === s);
    });
  }

  const toggleMap = {
    title: '#title',
    lighthouse: '.par[data-speed="0.04"][style*="bottom:20vh"]',
    boat: '.main-boat',
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
    whale: state.show_whale, fish: state.show_fish, birds: state.show_birds,
    mountains: state.show_mountains, beam: state.show_beam
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
    b.addEventListener('click', () => {
      state.scene = b.dataset.s; applyScene(state.scene);
    });
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
```

**Step 2:** Commit.

```bash
git add js/tweaks.js
git commit -m "feat: extract tweaks panel module"
```

**Verify:** File exports `initTweaks` and `TWEAK_DEFAULTS`.

---

### Task 10: Create js/main.js orchestrator

**Files:**
- Create: `js/main.js`

**Step 1:** Write the orchestrator that wires all modules together.

```js
import { createStars, spawnShootingStar } from './scene/stars.js';
import { buildRain } from './scene/rain.js';
import { createParallax } from './scene/parallax.js';
import { updateReflection, initSparkles, buildBirds } from './scene/reflections.js';
import { initTweaks, TWEAK_DEFAULTS } from './tweaks.js';

const scene = document.getElementById('scene');
const canvas = document.getElementById('stc');
const shootingContainer = document.getElementById('shs');
const refl = document.getElementById('refl');
const sparkleContainer = document.getElementById('spkw');
const birdContainer = document.getElementById('brd');
const rainContainer = document.getElementById('rain-container');

const stars = createStars(scene, canvas, TWEAK_DEFAULTS.stars);
const parLayers = document.querySelectorAll('#scene .par[data-speed]');
const parallax = createParallax(scene, parLayers, TWEAK_DEFAULTS.parallax);

buildRain(rainContainer);
updateReflection(scene, refl);
initSparkles(scene, sparkleContainer);
buildBirds(birdContainer);
setTimeout(() => spawnShootingStar(shootingContainer), 1500);

initTweaks({
  setStars: (n) => stars.setCount(n),
  setParallax: (v) => parallax.setMultiplier(v)
});

let t = 0;
function loop() {
  t += 0.016;
  stars.draw(t * 8);
  requestAnimationFrame(loop);
}
loop();

window.addEventListener('resize', () => {
  stars.init();
  updateReflection(scene, refl);
  initSparkles(scene, sparkleContainer);
});
```

**Step 2:** Commit.

```bash
git add js/main.js
git commit -m "feat: create main orchestrator"
```

**Verify:** File imports all modules and wires them.

---

### Task 11: Build index.html (modular replacement for paper.html)

**Files:**
- Create: `index.html`

**Step 1:** Create a new `index.html` that:
- Links the three CSS files in order: `base.css`, `scene.css`, `tweaks.css`.
- Preloads Google Fonts.
- Contains the **exact same DOM** as the scene portion of `paper.html` (lines 325-531), plus the tweaks panel (lines 534-591).
- Loads `js/main.js` as `type="module"` at the end of body.

Use this skeleton, filling in the scene markup copied verbatim from `paper.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>El Navegante</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet">

<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/scene.css">
<link rel="stylesheet" href="css/tweaks.css">
</head>
<body>

<!-- PASTE scene markup from paper.html lines 325-531 here verbatim -->

<!-- PASTE tweaks panel from paper.html lines 534-591 here verbatim -->

<script type="module" src="js/main.js"></script>
</body>
</html>
```

**Step 2:** Open `http://localhost:8000/` in browser.

**Verify:**
- Moon, stars, waves, boats all animate exactly as in `paper.html`.
- Tweaks panel opens/closes and all controls work.
- Switching scene to Storm shows rain + darker background.
- Switching scene to Dawn shows warm gradient.
- No console errors.

If anything differs from the original, fix before proceeding.

**Step 3:** Commit.

```bash
git add index.html
git commit -m "feat: wire modular index.html (parity with paper.html)"
```

---

### Task 12: Archive the original paper.html

**Files:**
- Move: `paper.html` → `paper.original.html` (kept for reference only)

**Step 1:**

```bash
mv paper.html paper.original.html
```

**Step 2:** Commit.

```bash
git add -A
git commit -m "chore: archive original monolithic file"
```

**Verify:** `index.html` still loads correctly at `/`; `paper.original.html` is the untouched original.

---

## Phase 2 — Narrative sections

Now we add the 5 portfolio sections that live **on top of** the fixed scene layer.

---

### Task 13: Make the scene layer fixed & add sections container

**Files:**
- Modify: `css/scene.css` — change `#scene` from `position:fixed;inset:0` to still `position:fixed;inset:0` but ensure `z-index:0`.
- Modify: `index.html` — wrap scene and add a new `<main id="story">` element after the scene.

**Step 1:** In `css/scene.css`, confirm `#scene` rule sets `z-index:0` (add if missing).

**Step 2:** In `index.html`, immediately after the closing `</div>` of `<div id="scene">`, add:

```html
<main id="story">
  <!-- sections added in subsequent tasks -->
</main>
```

**Step 3:** Commit.

```bash
git add -A
git commit -m "feat: scaffold narrative story container"
```

**Verify:** Site still looks identical; no visual change yet.

---

### Task 14: Create css/sections.css with snap scroll layout

**Files:**
- Create: `css/sections.css`
- Modify: `index.html` — link the new stylesheet after `scene.css`.

**Step 1:** Write the sections stylesheet.

```css
/* ============ STORY CONTAINER ============ */
#story {
  position: relative;
  z-index: 50;
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
  scroll-behavior: smooth;
}

#story::-webkit-scrollbar { width: 3px; }
#story::-webkit-scrollbar-thumb { background: rgba(244, 231, 198, 0.2); border-radius: 2px; }

.chapter {
  scroll-snap-align: start;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10vh 8vw;
  position: relative;
}

.chapter-label {
  font-family: var(--f-sans);
  font-size: 10px;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: rgba(244, 231, 198, 0.5);
  margin-bottom: 24px;
}

.chapter h2 {
  font-family: var(--f-serif);
  font-weight: 400;
  font-size: clamp(40px, 6vw, 88px);
  line-height: 1;
  color: var(--c-cream);
  margin-bottom: 20px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6);
}

.chapter h2 em { font-style: italic; color: var(--c-gold-soft); }

.chapter .rule {
  width: 60px;
  height: 1px;
  background: rgba(244, 231, 198, 0.35);
  margin: 24px 0;
}

.chapter p {
  font-family: var(--f-serif);
  font-size: clamp(16px, 1.3vw, 20px);
  line-height: 1.7;
  color: rgba(244, 231, 198, 0.85);
  max-width: 560px;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}

/* Hero — centered, no label */
#hero { align-items: flex-start; }
#hero h1 {
  font-family: var(--f-serif);
  font-weight: 400;
  font-size: clamp(56px, 9vw, 140px);
  line-height: 0.95;
  color: var(--c-cream);
  margin-bottom: 16px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.6);
}
#hero h1 em { font-style: italic; color: var(--c-gold-soft); }
#hero .tagline {
  font-family: var(--f-sans);
  font-size: 11px;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: rgba(244, 231, 198, 0.55);
}

/* Projects grid */
.projects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  max-width: 900px;
  margin-top: 32px;
}

.project {
  padding: 20px 22px;
  background: rgba(8, 18, 36, 0.55);
  border: 1px solid rgba(244, 231, 198, 0.12);
  border-radius: 6px;
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
  transition: border-color 0.3s, transform 0.3s;
}

.project:hover {
  border-color: rgba(244, 214, 144, 0.4);
  transform: translateY(-2px);
}

.project h3 {
  font-family: var(--f-serif);
  font-style: italic;
  font-weight: 500;
  font-size: 22px;
  color: var(--c-cream);
  margin-bottom: 6px;
}

.project .tag {
  font-family: var(--f-sans);
  font-size: 9px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--c-gold-soft);
  margin-bottom: 12px;
}

.project p {
  font-size: 14px;
  color: rgba(244, 231, 198, 0.75);
  line-height: 1.55;
}

/* Contact */
.signal {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.signal a {
  font-family: var(--f-serif);
  font-style: italic;
  font-size: 20px;
  color: var(--c-gold-soft);
  text-decoration: none;
  border-bottom: 1px solid rgba(244, 214, 144, 0.25);
  padding-bottom: 3px;
  width: fit-content;
  transition: color 0.3s, border-color 0.3s;
}
.signal a:hover { color: var(--c-cream); border-color: var(--c-cream); }

/* Scroll hint */
.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--f-sans);
  font-size: 9px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(244, 231, 198, 0.4);
  animation: hint-bob 2.4s ease-in-out infinite;
}
@keyframes hint-bob {
  0%, 100% { transform: translate(-50%, 0); opacity: 0.4; }
  50% { transform: translate(-50%, 6px); opacity: 0.8; }
}
```

**Step 2:** Add `<link rel="stylesheet" href="css/sections.css">` to `index.html` after `scene.css`.

**Step 3:** Commit.

```bash
git add -A
git commit -m "feat: add sections layout with snap scroll"
```

**Verify:** Still no visible change (no sections added yet); CSS loads without 404.

---

### Task 15: Add Hero section

**Files:**
- Modify: `index.html` — replace the existing `#title` block and add hero section inside `#story`.
- Modify: `css/scene.css` — remove or comment out the old `#title` styles (they move to Hero now).

**Step 1:** Remove the existing `<div id="title">...</div>` block from the scene markup (it was inside `#scene`). The hero section will replace it.

**Step 2:** Inside `<main id="story">`, add:

```html
<section id="hero" class="chapter">
  <h1>El <em>Navegante</em></h1>
  <div class="rule"></div>
  <div class="tagline">Backend · Systems · Paper-cut code</div>
  <div class="scroll-hint">Scroll to begin</div>
</section>
```

**Step 3:** Verify in browser. The hero title should appear over the ocean scene.

**Step 4:** Commit.

```bash
git add -A
git commit -m "feat: hero section — El Navegante"
```

---

### Task 16: Create content/projects.js data

**Files:**
- Create: `content/projects.js`

**Step 1:**

```js
export const PROJECTS = [
  {
    name: 'Abyssal',
    tag: 'Distributed storage',
    scene: 'storm',
    description: 'A database engine that holds itself together under pressure. Raw, invisible, unshakable.'
  },
  {
    name: 'Marea',
    tag: 'Generative API',
    scene: 'night',
    description: 'Music written by the sea. Tides become notes, currents become silence.'
  },
  {
    name: 'Vigía',
    tag: 'Observability',
    scene: 'night',
    description: 'A lighthouse for systems. Always awake, always watching the dark waters of production.'
  },
  {
    name: 'Alba Protocol',
    tag: 'Open source',
    scene: 'dawn',
    description: 'An interface framework carved from the first light. Small, honest, easy to hold.'
  },
  {
    name: 'Paper',
    tag: 'Code as art',
    scene: 'dawn',
    description: 'This place. A site that breathes. Proof that engineers can also make weather.'
  }
];
```

**Step 2:** Commit.

```bash
git add content/projects.js
git commit -m "feat: seed project data"
```

---

### Task 17: Add Origin, Projects, Horizon, and Signal sections

**Files:**
- Modify: `index.html` — add four sections inside `#story`.
- Modify: `js/main.js` — render projects from data.

**Step 1:** Add the four sections after `#hero`:

```html
<section id="origin" class="chapter" data-scene="storm">
  <div class="chapter-label">Chapter I · The Storm</div>
  <h2>Where it <em>begins</em></h2>
  <div class="rule"></div>
  <p>
    Every system I build starts in rough weather. Servers that refuse to sleep,
    queues that overflow, logs that read like dark poetry. I learned to trust
    the wind — to listen before I write, to let the wave pass before I push.
  </p>
  <p>
    I build the parts nobody sees: engines, pipes, guardians. The ballast
    beneath the boat.
  </p>
</section>

<section id="works" class="chapter" data-scene="night">
  <div class="chapter-label">Chapter II · The Night</div>
  <h2>The <em>chapters</em></h2>
  <div class="rule"></div>
  <p>Islands of work — each one a small country with its own weather.</p>
  <div class="projects" id="projects-grid"></div>
</section>

<section id="horizon" class="chapter" data-scene="dawn">
  <div class="chapter-label">Chapter III · The Dawn</div>
  <h2>What <em>comes</em></h2>
  <div class="rule"></div>
  <p>
    I am writing tools that teach themselves to rest. Interfaces that feel
    like paper, not glass. Systems that know when to be quiet.
  </p>
  <p>
    If the night taught me to listen, the morning is teaching me to speak.
  </p>
</section>

<section id="signal" class="chapter" data-scene="dawn">
  <div class="chapter-label">Chapter IV · The Lighthouse</div>
  <h2>Leave a <em>signal</em></h2>
  <div class="rule"></div>
  <p>If any of this resonates — the silence, the craft, the salt — write.</p>
  <div class="signal">
    <a href="mailto:hello@navegante.dev">hello@navegante.dev</a>
    <a href="https://github.com/" target="_blank" rel="noopener">github.com/navegante</a>
  </div>
</section>
```

**Step 2:** In `js/main.js`, import and render projects:

```js
import { PROJECTS } from '../content/projects.js';

const grid = document.getElementById('projects-grid');
if (grid) {
  grid.innerHTML = PROJECTS.map((p) => `
    <article class="project" data-scene="${p.scene}">
      <div class="tag">${p.tag}</div>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
    </article>
  `).join('');
}
```

**Step 3:** Open browser and scroll.

**Verify:**
- Five sections scroll with snap behavior.
- Each section is one viewport tall.
- Projects grid shows 5 cards.
- Hero title still visible as first snap point.
- Ocean scene visible behind every section.

**Step 4:** Commit.

```bash
git add -A
git commit -m "feat: narrative sections — origin, works, horizon, signal"
```

---

## Phase 3 — Scroll drives scene

---

### Task 18: Create js/narrative.js — scene switching on scroll

**Files:**
- Create: `js/narrative.js`

**Step 1:**

```js
export function createNarrative(sections, onSceneChange) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        const target = entry.target.dataset.scene || 'night';
        onSceneChange(target);
      }
    });
  }, {
    root: document.getElementById('story'),
    threshold: [0.5]
  });

  sections.forEach((s) => observer.observe(s));
  return { disconnect: () => observer.disconnect() };
}
```

**Step 2:** Commit.

```bash
git add js/narrative.js
git commit -m "feat: narrative scene switcher"
```

---

### Task 19: Wire narrative into main.js

**Files:**
- Modify: `js/main.js`

**Step 1:** Import and wire:

```js
import { createNarrative } from './narrative.js';

const tweaksApi = initTweaks({
  setStars: (n) => stars.setCount(n),
  setParallax: (v) => parallax.setMultiplier(v)
});

const sections = document.querySelectorAll('#story .chapter[data-scene]');
createNarrative(sections, (mode) => tweaksApi.setScene(mode));
```

(Change the earlier `initTweaks` call to capture its return value as `tweaksApi`.)

**Step 2:** Open browser, scroll slowly.

**Verify:**
- Hero (no data-scene) → night (default).
- Origin section enters view → scene becomes Storm (rain falls, background darker).
- Works section → scene returns to Night.
- Horizon / Signal → scene becomes Dawn (warm sunrise gradient).
- Scroll back up — scenes reverse smoothly.

**Step 3:** Commit.

```bash
git add -A
git commit -m "feat: scroll position drives scene transitions"
```

---

## Phase 4 — Polish

---

### Task 20: Smooth scene transitions

**Files:**
- Modify: `css/scene.css`

**Step 1:** Add a transition to `#scene` background changes:

```css
#scene {
  transition: background 1.6s ease;
}
#scene .cld, #moon {
  transition: filter 1.6s ease, opacity 1.6s ease;
}
```

**Step 2:** Verify: scrolling between sections now dissolves between weather states instead of snapping.

**Step 3:** Commit.

```bash
git add css/scene.css
git commit -m "polish: crossfade scene transitions"
```

---

### Task 21: Fade chapter content on enter

**Files:**
- Modify: `css/sections.css`
- Modify: `js/narrative.js` — toggle an `.in-view` class.

**Step 1:** Add to `sections.css`:

```css
.chapter > *:not(.scroll-hint) {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 1.1s ease, transform 1.1s ease;
}
.chapter.in-view > *:not(.scroll-hint) {
  opacity: 1;
  transform: translateY(0);
}
.chapter > *:nth-child(2) { transition-delay: 0.15s; }
.chapter > *:nth-child(3) { transition-delay: 0.25s; }
.chapter > *:nth-child(4) { transition-delay: 0.35s; }
.chapter > *:nth-child(5) { transition-delay: 0.45s; }
```

**Step 2:** In `js/narrative.js`, add class toggling:

```js
if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
  entry.target.classList.add('in-view');
  const target = entry.target.dataset.scene || 'night';
  onSceneChange(target);
}
```

Also observe `#hero` so it fades in on load. To trigger hero immediately, add `in-view` class to hero on first paint in `main.js`:

```js
requestAnimationFrame(() => document.getElementById('hero')?.classList.add('in-view'));
```

**Step 3:** Verify: each chapter's text and title fade in as it enters view.

**Step 4:** Commit.

```bash
git add -A
git commit -m "polish: fade chapter content on entry"
```

---

### Task 22: Hide tweaks panel by default + remove auto-open

**Files:**
- Modify: `js/tweaks.js` — remove the `togglePanel(true)` auto-call at the end.

**Step 1:** Remove any line that auto-opens the panel; the visitor should see the story, not the dev panel. The gear button remains available.

**Step 2:** Also remove the `window.parent.postMessage` blocks (they were for an external editor we no longer use).

**Step 3:** Verify: site loads with panel closed. Gear button in top-right opens it.

**Step 4:** Commit.

```bash
git add js/tweaks.js
git commit -m "polish: tweaks panel closed by default"
```

---

### Task 23: Final QA pass

**Verify each item; fix before marking complete:**

1. [ ] `index.html` loads with no console errors.
2. [ ] Hero title visible immediately, scroll hint pulsing.
3. [ ] Scroll snaps cleanly between 5 sections.
4. [ ] Scene transitions: Hero (night) → Origin (storm with rain) → Works (night) → Horizon (dawn) → Signal (dawn).
5. [ ] Project cards render from `content/projects.js` data.
6. [ ] Project cards have hover effect.
7. [ ] Email and GitHub links in Signal section are clickable.
8. [ ] Tweaks gear opens panel; all tweaks still function.
9. [ ] Resize browser — scene re-initializes, no layout breaks.
10. [ ] Scroll back up — scenes reverse smoothly.
11. [ ] Ocean animations (whale, fish, boats, stars) continue uninterrupted during scroll.
12. [ ] No horizontal overflow at any scroll position.

**Commit:**

```bash
git add -A
git commit -m "docs: final QA pass complete"
```

---

## Done

The portfolio is live at `index.html`. All modules are single-responsibility. The original `paper.html` is preserved as `paper.original.html` for reference.

---

## Execution Handoff

**Two execution options:**

1. **Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Parallel Session (separate)** — Open new session with `executing-plans`, batch execution with checkpoints.

Which approach, amigo?
