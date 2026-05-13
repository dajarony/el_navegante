# Portfolio Dajarony — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convertir el portfolio de demostración "El Navegante" en el portfolio real de Dajarony Ysaac Guzmán Marmolejos con proyectos reales, textos personalizados y datos de contacto correctos.

**Architecture:** Solo se modifican 2 archivos: `content/projects.js` (proyectos reales) e `index.html` (textos narrativos, bugs, contacto). Sin nuevas dependencias, sin backend, sin build step. El sitio se abre directamente como HTML estático.

**Tech Stack:** HTML, CSS, Vanilla JS — sin framework, sin bundler.

---

## Task 1: Actualizar proyectos reales

**Files:**
- Modify: `content/projects.js`

**Step 1: Reemplazar el contenido completo del archivo**

```js
export const PROJECTS = [
  {
    name: 'Auralis + Trinidad',
    tag: 'AI Governance',
    scene: 'dawn',
    description: 'A governance layer for AI agents. Every action governed by a contract. Nothing sensitive executes without a human in the loop.'
  },
  {
    name: 'Akira SASE',
    tag: 'Cybersecurity',
    scene: 'storm',
    description: 'Offensive and defensive security in one platform. Authorized reconnaissance, threat detection, automated response. Built for SOCs and red teams.'
  },
  {
    name: 'NeuroRecall',
    tag: 'EdTech · AI',
    scene: 'winter',
    description: 'Upload a PDF. The AI generates the questions. The algorithm decides what to study and when. Built for dense syllabi and quiet nights.'
  },
  {
    name: 'Dajarony Trading AI',
    tag: 'FinTech · AI',
    scene: 'dawn',
    description: 'Autonomous gold trading system. Multi-LLM decisions, automatic risk management, emergency circuit breakers. Waits for no one.'
  },
  {
    name: 'VPN Backend Auralis',
    tag: 'Infrastructure',
    scene: 'night',
    description: 'Enterprise VPN backend with WireGuard, Firebase auth, and AI security analysis. 97% test coverage. Production-ready.'
  }
];
```

**Step 2: Verificar visualmente**

Abrir `index.html` en el navegador. Navegar a "The chapters" (Chapter II). Deben aparecer exactamente 5 tarjetas con los nombres correctos.

**Step 3: Commit**

```bash
git add content/projects.js
git commit -m "feat: replace demo projects with real Dajarony portfolio projects"
```

---

## Task 2: Corregir bugs en index.html

**Files:**
- Modify: `index.html`

**Step 1: Corregir `getElementById('sc2')` — línea 437**

Buscar:
```js
const scene = document.getElementById('sc2') || document.getElementById('scene');
```
Reemplazar con:
```js
const scene = document.getElementById('scene');
```

**Step 2: Corregir toggle montañas — estado visual inconsistente**

Buscar (en el panel de tweaks, alrededor de línea 396):
```html
<div class="row"><label>Montañas</label><div class="toggle on" data-t="mountains"></div></div>
```
Reemplazar con (eliminar clase `on`):
```html
<div class="row"><label>Montañas</label><div class="toggle" data-t="mountains"></div></div>
```

**Step 3: Corregir Chapter IV duplicado — sección signal**

Buscar (alrededor de línea 321):
```html
<div class="chapter-label">Chapter IV · The Lighthouse</div>
```
Reemplazar con:
```html
<div class="chapter-label">Chapter V · The Lighthouse</div>
```

**Step 4: Verificar visualmente**

Abrir `index.html`. Comprobar:
- El toggle de montañas aparece apagado (gris, sin brillo)
- No hay errores en consola relacionados con `sc2`
- Al llegar a la sección de contacto el label dice "Chapter V"

**Step 5: Commit**

```bash
git add index.html
git commit -m "fix: sc2 legacy selector, mountains toggle state, chapter V label"
```

---

## Task 3: Actualizar textos narrativos de los capítulos

**Files:**
- Modify: `index.html`

**Step 1: Actualizar Chapter I · The Storm (alrededor de línea 291–295)**

Buscar el bloque `<section id="origin"`:
```html
<p>Every system I build starts in rough weather. Servers that refuse to sleep, queues that overflow, logs that read like dark poetry. I learned to trust the wind — to listen before I write, to let the wave pass before I push.</p>
<p style="margin-top:16px">I build the parts nobody sees: engines, pipes, guardians. The ballast beneath the boat.</p>
```
Reemplazar con:
```html
<p>I build things that hold under pressure. Security platforms that hunt threats before they surface. VPN engines that route silence across hostile networks. Governance layers that keep AI agents honest.</p>
<p style="margin-top:16px">The storm taught me where systems break. I build where others stop reading the logs.</p>
```

**Step 2: Actualizar Chapter III · The Dawn (alrededor de línea 307–311)**

Buscar el bloque `<section id="horizon"`:
```html
<p>I am writing tools that teach themselves to rest. Interfaces that feel like paper, not glass. Systems that know when to be quiet.</p>
<p style="margin-top:16px">If the night taught me to listen, the morning is teaching me to speak.</p>
```
Reemplazar con:
```html
<p>I am building the layer between intelligence and trust. Agents that plan, contract, and wait for permission before they act. Systems that learn from gold markets at 3am. Tools that turn a PDF into a tutor.</p>
<p style="margin-top:16px">If the storm taught me to defend, the dawn is teaching me to architect.</p>
```

**Step 3: Actualizar Chapter IV · The Winter (alrededor de línea 315–319)**

Buscar el bloque `<section id="winter"`:
```html
<p>There is a kind of clarity that only comes in winter. When the noise dies down, when the sea grows still beneath the ice, and the only sound is the fall of something soft and white.</p>
<p style="margin-top:16px">I build in those moments. Quietly. Carefully. One flake at a time.</p>
```
Reemplazar con:
```html
<p>There is a kind of clarity that only comes when you build alone, quietly, for months. No framework to hide behind. Just the problem, the algorithm, and the terminal at 2am.</p>
<p style="margin-top:16px">NeuroRecall was born in that silence. So was everything else worth keeping.</p>
```

**Step 4: Verificar visualmente**

Navegar por todas las secciones del portfolio y leer los textos. Deben fluir con el estilo del sitio.

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: personalize narrative chapters for Dajarony portfolio"
```

---

## Task 4: Actualizar datos de contacto

**Files:**
- Modify: `index.html`

**Step 1: Añadir nombre completo antes de los links de contacto**

Buscar el bloque `<section id="signal"` y dentro el `<div class="signal">`:
```html
<div class="signal">
  <a href="mailto:hello@navegante.dev">hello@navegante.dev</a>
  <a href="https://github.com/" target="_blank" rel="noopener">github.com/navegante</a>
</div>
```
Reemplazar con:
```html
<p style="margin-top:0;margin-bottom:20px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:18px;color:rgba(244,231,198,.7)">Dajarony Ysaac Guzmán Marmolejos</p>
<div class="signal">
  <a href="mailto:gataka534@gmail.com">gataka534@gmail.com</a>
  <a href="https://github.com/dajarony" target="_blank" rel="noopener">github.com/dajarony</a>
</div>
```

**Step 2: Verificar visualmente**

Navegar a la última sección (Chapter V · The Lighthouse). Debe mostrar el nombre, el email y el GitHub correctos. Hacer clic en ambos links para confirmar que funcionan.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: real contact info — Dajarony email and GitHub"
```

---

## Verificación Final

Abrir `index.html` en el navegador y recorrer todo el portfolio:

- [ ] Hero: "El Navegante" visible
- [ ] Chapter I: texto sobre seguridad y sistemas
- [ ] Chapter II: 5 tarjetas de proyectos reales (Auralis+Trinidad, Akira SASE, NeuroRecall, Trading AI, VPN Auralis)
- [ ] Chapter III: texto sobre IA y arquitectura
- [ ] Chapter IV: texto sobre NeuroRecall y el silencio
- [ ] Chapter V: nombre completo, gataka534@gmail.com, github.com/dajarony
- [ ] Panel Tweaks: toggle Montañas aparece apagado
- [ ] Consola del navegador: sin errores
