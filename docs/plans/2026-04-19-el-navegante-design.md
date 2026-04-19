# El Navegante — Diseño del Portafolio

**Fecha:** 2026-04-19
**Proyecto:** Transformar `paper.html` (escena animada "Océano Vivo") en un portafolio web completo.

---

## 1. Concepto

Portafolio personal con forma de **viaje narrativo**. El visitante no solo ve proyectos — vive una historia. El protagonista es **"El Navegante"**: alguien que construye software (backend, sistemas) y también crea arte. Alguien que domina la lógica y la belleza.

La escena animada existente (océano nocturno con luna, barcos, faro, ballena, peces) es el **corazón** del sitio, no un adorno.

---

## 2. Narrativa — Las tres escenas como viaje

Los tres modos que ya existen en el código (`night`, `dawn`, `storm`) se convierten en **capítulos de la historia**:

| Escena | Significado narrativo | Sección del portafolio |
|--------|----------------------|------------------------|
| **Tormenta** | Caos, esfuerzo, origen, proyectos difíciles | Origen / Quién soy |
| **Noche** | Calma creativa, trabajo profundo, reflexión | Proyectos (núcleo) |
| **Alba** | Horizonte, futuro, apertura | Contacto / Hacia dónde voy |

El scroll del usuario **cambia la escena en vivo**. El viaje se siente, no se explica.

---

## 3. Proyectos inventados

| Proyecto | Escena | Descripción |
|----------|--------|-------------|
| **Abyssal** | Tormenta | Motor de base de datos distribuida. Código puro, invisible, brutal. |
| **Marea** | Noche | API generativa que crea música a partir de datos oceánicos en tiempo real. |
| **Vigía** | Noche | Sistema de monitoreo — como el faro, siempre alerta. |
| **Alba Protocol** | Alba | Framework open source que construye interfaces desde cero. |
| **Papel** | Alba | Este mismo sitio — el arte como código. |

---

## 4. Arquitectura técnica

**Opción elegida: C — Secciones a pantalla completa con snap scroll.**

Cada sección ocupa el 100% del viewport. El usuario "salta" de escena en escena como capítulos cinematográficos. Cada archivo tiene **una sola responsabilidad** (no monolítico).

### Estructura de archivos

```
/
├── index.html              ← estructura mínima, solo secciones
├── css/
│   ├── base.css            ← reset, tipografías, variables
│   ├── scene.css           ← todo lo del océano animado
│   ├── sections.css        ← layout de las secciones del portafolio
│   └── tweaks.css          ← panel de ajustes
├── js/
│   ├── scene/
│   │   ├── stars.js        ← estrellas y fugaces
│   │   ├── rain.js         ← lluvia de tormenta
│   │   ├── parallax.js     ← parallax del ratón
│   │   └── reflections.js  ← reflejo lunar + destellos
│   ├── narrative.js        ← detecta scroll y cambia escena
│   ├── tweaks.js           ← panel de ajustes
│   └── main.js             ← orquestador, solo llama a los módulos
└── content/
    └── projects.js         ← data de los proyectos (fácil de editar)
```

---

## 5. Secciones del portafolio

1. **Hero / La Escena** — océano animado + nombre "El Navegante" + frase poética.
2. **El Origen (Tormenta)** — quién es, de dónde viene, su filosofía.
3. **Los Capítulos (Noche)** — los proyectos como islas en el mar.
4. **El Horizonte (Alba)** — lo que construye ahora, hacia dónde va.
5. **El Faro (Alba)** — contacto, contado como "deja tu señal".

---

## 6. Estilo visual — NO TOCAR

Se mantiene **exactamente** el estilo del `paper.html` original:

- Paleta: azules profundos (`#020b18`, `#071630`, `#0e2446`, `#1d5791`, `#2b7cba`), dorado (`#f9d949`, `#f4d690`), crema (`#f4e7c6`, `#e8e3d3`).
- Tipografía: **Cormorant Garamond** (serif, itálica para títulos) + **Helvetica Neue** (sans, para subtítulos con letter-spacing amplio).
- Textura: grano de papel SVG, viñeta profunda.
- Animaciones: olas, nubes, estrellas, estrellas fugaces, luna, faro — todo preservado.
- Estética: paper cutout, capas con parallax, `drop-shadow` en todos los SVG.

---

## 7. Idioma y tono

- **Idioma:** Inglés.
- **Tono:** Poético, minimalista, melancólico pero luminoso. Siguiendo la línea del original (`"A paper-cut portrait"`, `"Night · Full moon · Calm sea"`).
- **Evitar:** jerga corporativa, buzzwords, "passionate developer", etc.
- **Buscar:** frases cortas, imágenes marítimas, silencio entre palabras.

---

## 8. Principios

- **YAGNI** — sin frameworks, sin librerías. HTML + CSS + JS vanilla, igual que el original.
- **Modularidad** — cada archivo una cosa. Nada mezclado.
- **Respeto al original** — el océano es el corazón. Las secciones flotan en él, no lo aplastan.
- **Cinematográfico** — el viaje se siente. No se explica.

---

## 9. Siguiente paso

Crear el plan de implementación detallado (con `writing-plans`) y luego ejecutar paso a paso.
