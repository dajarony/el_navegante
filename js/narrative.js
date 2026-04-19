export function createNarrative(sections, onSceneChange) {
  const story = document.getElementById('story');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        entry.target.classList.add('in-view');
        const target = entry.target.dataset.scene || 'night';
        onSceneChange(target);
      }
    });
  }, {
    root: story,
    threshold: [0.5]
  });

  const hero = document.getElementById('hero');
  if (hero) observer.observe(hero);
  sections.forEach((s) => observer.observe(s));

  return { disconnect: () => observer.disconnect() };
}
