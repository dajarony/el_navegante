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
