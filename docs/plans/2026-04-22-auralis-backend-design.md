# AURALIS Smart Keyboard — Backend Design
**Fecha:** 2026-04-22  
**Filosofía:** Nioisec + Dajarony v3.0  
**Stack:** FastAPI / Python 3.10 · OpenAI API (mock inicial) · Neon PostgreSQL · Google Cloud Run

---

## 1. Estructura de Carpetas

```
teclado-movil/
├── app/
│   ├── main.py           # Micro-Kernel Dajarony (chasis puro)
│   └── event_bus.py      # Sistema pub/sub interno
├── seguridad/
│   ├── pii_scrubber.py   # NIoiSecScrubber — regex PII
│   ├── encryptor.py      # AES-256 para datos en reposo
│   └── auth_guard.py     # Validación JWT por request
├── modules/
│   ├── analyzer/
│   │   ├── index.py      # Lógica sentimientos/intenciones
│   │   └── prompts.yaml  # Prompts OpenAI externalizados
│   ├── fixer/
│   │   └── index.py      # Corrección gramatical
│   └── profiler/
│       └── index.py      # Memoria contactos — Neon DB
├── shared/
│   ├── base_module.py    # Clase abstracta para BPs
│   └── logger.py         # Trazabilidad STDG centralizada
├── doc/
│   ├── contratos_api.yaml
│   └── mapa_stdg.json
├── cambios/
│   └── registro-cambios.md
├── .env.example
├── Dockerfile
├── requirements.txt
└── README.md
```

---

## 2. Arquitectura: Event-Driven Monolito Modular

El Kernel no conoce la lógica de ningún módulo. Solo emite eventos y escucha resultados. Los módulos son independientes entre sí — se comunican únicamente a través del EventBus.

---

## 3. Diccionario de Eventos (Contrato del Sistema)

| Evento              | Emitido por        | Escuchado por          | Payload                        |
|---------------------|--------------------|------------------------|--------------------------------|
| `input:received`    | Kernel / Endpoint  | SecurityModule         | `{raw_text, trace_id, meta}`   |
| `text:sanitized`    | SecurityModule     | AnalyzerModule, Fixer  | `{safe_text, trace_id}`        |
| `analysis:completed`| AnalyzerModule     | Kernel, Profiler       | `{tone, intent, confidence}`   |
| `text:fixed`        | FixerModule        | Kernel                 | `{fixed_text, trace_id}`       |

---

## 4. Flujo Completo por Request

```
[Android Teclado]
      │ POST /api/v1/process {text, jwt}
      ▼
[auth_guard.py] ── JWT inválido ──► 401
      │ JWT válido
      ▼
[Kernel] emite input:received (trace_id generado aquí)
      │
      ▼
[pii_scrubber.py] limpia PII → emite text:sanitized
      │
      ├──────────────────────────┐
      ▼                          ▼
[AnalyzerModule]           [FixerModule]
 (OpenAI mock/real)         (OpenAI mock/real)
 emite analysis:completed   emite text:fixed
      │                          │
      └────────────┬─────────────┘
                   ▼
            [Kernel] recibe ambos por trace_id
            empaqueta JSON consolidado
                   │
                   ▼
            [Android] ← respuesta HTTP

[Profiler] ← background, no bloquea respuesta
```

---

## 5. Coordinación de Eventos (trace_id)

El Kernel mantiene un `dict[trace_id → asyncio.Future]` por request activo. Cuando recibe `analysis:completed` y `text:fixed` del mismo `trace_id`, resuelve el Future y responde la petición HTTP. Timeout de 10s por request.

---

## 6. Filosofía Nioisec

- **Peaje obligatorio:** todo texto pasa por `pii_scrubber.py` antes de llegar a OpenAI o Neon DB.
- **Zero-Knowledge:** OpenAI nunca ve el texto crudo, solo el texto ofuscado.
- **Datos en reposo:** los perfiles de contacto se encriptan con AES-256 antes de guardarse en Neon.
- **Auth:** JWT validado en cada request por `auth_guard.py`.

---

## 7. MVP Mock vs Producción

| Componente      | Mock (MVP)                        | Producción                     |
|-----------------|-----------------------------------|--------------------------------|
| OpenAI          | Respuesta hardcodeada             | `openai` SDK con `OPENAI_API_KEY` |
| Neon DB         | Dict en memoria                   | `asyncpg` + `DATABASE_URL`     |
| Auth JWT        | Token fijo `"dev-token"`          | Verificación real con secret   |
| Encryptor       | Texto plano (sin encriptar)       | AES-256 con `cryptography` lib |

---

## 8. Endpoints

| Método | Path                | Descripción                              |
|--------|---------------------|------------------------------------------|
| POST   | `/api/v1/process`   | Entrada principal — texto del teclado    |
| GET    | `/health`           | Estado del kernel y módulos              |

---

## 9. Deploy

- **Local:** `uvicorn app.main:app --reload --port 8080`
- **Cloud Run:** Dockerfile incluido, puerto 8080, variable `ENVIRONMENT=production`
- **Variables de entorno:** `OPENAI_API_KEY`, `DATABASE_URL`, `JWT_SECRET`
