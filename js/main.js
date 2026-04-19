import { createStars, spawnShootingStar } from './scene/stars.js';
import { buildRain } from './scene/rain.js';
import { createParallax } from './scene/parallax.js';
import { updateReflection, initSparkles, buildBirds } from './scene/reflections.js';
import { initTweaks, TWEAK_DEFAULTS } from './tweaks.js';
import { createNarrative } from './narrative.js';
import { PROJECTS } from '../content/projects.js';

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

const tweaksApi = initTweaks({
  setStars: (n) => stars.setCount(n),
  setParallax: (v) => parallax.setMultiplier(v)
});

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

const sections = document.querySelectorAll('#story .chapter[data-scene]');
createNarrative(sections, (mode) => tweaksApi.setScene(mode));

requestAnimationFrame(() => document.getElementById('hero')?.classList.add('in-view'));

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
