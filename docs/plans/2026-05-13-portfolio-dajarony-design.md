# El Navegante → Portfolio de Dajarony — Design
**Fecha:** 2026-05-13
**Aprobado por:** Dajarony Ysaac Guzmán Marmolejos

---

## Objetivo

Convertir el portfolio de demostración "El Navegante" en el portfolio real de Dajarony. El sitio conserva toda la escena náutica animada y el estilo visual. Solo cambian: contenido, textos narrativos, proyectos, y datos de contacto. Se corrigen los bugs encontrados en la revisión previa.

---

## Cambios de Contenido

### Hero (sin cambios visuales)
- Título: `El Navegante` — se conserva como nombre del portfolio
- Tagline: `Night · Full moon · Calm sea` — se conserva

### Chapter I · The Storm
**Texto nuevo:**
> I build things that hold under pressure. Security platforms that hunt threats before they surface. VPN engines that route silence across hostile networks. Governance layers that keep AI agents honest.
>
> The storm taught me where systems break. I build where others stop reading the logs.

### Chapter II · The Night (sección de proyectos)
**Texto sin cambios:**
> Islands of work — each one a small country with its own weather.

### Chapter III · The Dawn
**Texto nuevo:**
> I am building the layer between intelligence and trust. Agents that plan, contract, and wait for permission before they act. Systems that learn from gold markets at 3am. Tools that turn a PDF into a tutor.
>
> If the storm taught me to defend, the dawn is teaching me to architect.

### Chapter IV · The Winter
**Texto nuevo:**
> There is a kind of clarity that only comes when you build alone, quietly, for months. No framework to hide behind. Just the problem, the algorithm, and the terminal at 2am.
>
> NeuroRecall was born in that silence. So was everything else worth keeping.

### Chapter V · The Lighthouse (contacto)
**Texto sin cambios + datos reales:**
> If any of this resonates — the silence, the craft, the salt — write.

```
gataka534@gmail.com
github.com/dajarony
```

Añadir nombre completo: **Dajarony Ysaac Guzmán Marmolejos**

---

## Proyectos — content/projects.js

5 proyectos seleccionados de 6 (se omite Piscinas por ser el más específico de dominio):

| name | tag | scene | description |
|------|-----|-------|-------------|
| Auralis + Trinidad | AI Governance | dawn | A governance layer for AI agents. Every action governed by a contract. Nothing sensitive executes without a human in the loop. |
| Akira SASE | Cybersecurity | storm | Offensive and defensive security in one platform. Authorized reconnaissance, threat detection, automated response. Built for SOCs and red teams. |
| NeuroRecall | EdTech · AI | winter | Upload a PDF. The AI generates the questions. The algorithm decides what to study and when. Built for dense syllabi and quiet nights. |
| Dajarony Trading AI | FinTech · AI | dawn | Autonomous gold trading system. Multi-LLM decisions, automatic risk management, emergency circuit breakers. Waits for no one. |
| VPN Backend Auralis | Infrastructure | night | Enterprise VPN backend with WireGuard, Firebase auth, and AI security analysis. 97% test coverage. Production-ready. |

---

## Bugs a corregir

| Bug | Fix |
|-----|-----|
| Chapter IV duplicado (Winter + Lighthouse) | Cambiar Lighthouse a `Chapter V` |
| Toggle montañas: clase `on` en HTML pero `show_mountains: false` en defaults | Eliminar clase `on` del toggle HTML |
| `getElementById('sc2')` — legacy sin uso | Cambiar a `getElementById('scene')` directamente |
| Email placeholder `hello@navegante.dev` | Reemplazar con `gataka534@gmail.com` |
| GitHub placeholder `https://github.com/` | Reemplazar con `https://github.com/dajarony` |

---

## Archivos a modificar

| Archivo | Qué cambia |
|---------|-----------|
| `index.html` | Textos de capítulos, datos de contacto, bug sc2, toggle montañas, chapter label |
| `content/projects.js` | 5 proyectos reales |

---

## Fuera de alcance

- Código muerto (`js/main.js`, `js/scene/`) — no se toca, no afecta al usuario
- Animaciones, CSS, escenas — sin cambios
- AURALIS backend — proyecto separado, no relacionado con este portfolio
