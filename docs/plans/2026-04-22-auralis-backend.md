# AURALIS Smart Keyboard Backend — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the AURALIS keyboard backend — a FastAPI event-driven monolith con filosofía Nioisec que recibe texto del teclado Android, lo limpia de PII, lo analiza y corrige en paralelo, y devuelve un JSON consolidado.

**Architecture:** Micro-Kernel (Dajarony v3) con EventBus pub/sub interno. El Kernel no conoce la lógica de los módulos; coordina eventos por `trace_id`. Security layer (Nioisec) es un peaje obligatorio antes de que cualquier módulo procese datos.

**Tech Stack:** Python 3.10, FastAPI, uvicorn, pytest, python-jose (JWT mock), cryptography (AES-256 mock), asyncio, PyYAML, python-dotenv

---

## Task 0: Project Scaffold

**Files:**
- Create: `C:\Users\gatak\Desktop\teclado-movil\` (carpeta raíz)
- Create: `requirements.txt`
- Create: `.env.example`
- Create: `pytest.ini`
- Create: `README.md`

**Step 1: Crear la carpeta y estructura completa**

```bash
mkdir C:\Users\gatak\Desktop\teclado-movil
cd C:\Users\gatak\Desktop\teclado-movil
mkdir app seguridad modules\analyzer modules\fixer modules\profiler shared doc cambios tests\seguridad tests\modules tests\app
```

**Step 2: Crear requirements.txt**

```
fastapi==0.111.0
uvicorn==0.29.0
pydantic==2.7.1
python-dotenv==1.0.1
python-jose==3.3.0
cryptography==42.0.7
pyyaml==6.0.1
asyncpg==0.29.0
pytest==8.2.0
pytest-asyncio==0.23.6
httpx==0.27.0
```

**Step 3: Crear .env.example**

```
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-here
ENVIRONMENT=development
```

**Step 4: Crear pytest.ini**

```ini
[pytest]
asyncio_mode = auto
testpaths = tests
```

**Step 5: Inicializar git e instalar dependencias**

```bash
git init
pip install -r requirements.txt
```

**Step 6: Commit**

```bash
git add .
git commit -m "chore: project scaffold — AURALIS backend Nioisec"
```

---

## Task 1: Shared — Logger y BaseModule

**Files:**
- Create: `shared/logger.py`
- Create: `shared/base_module.py`
- Create: `shared/__init__.py`
- Create: `tests/app/__init__.py`
- Create: `tests/seguridad/__init__.py`
- Create: `tests/modules/__init__.py`
- Test: `tests/test_base_module.py`

**Step 1: Crear shared/logger.py**

```python
import logging
import os

def get_logger(name: str) -> logging.Logger:
    level = logging.DEBUG if os.getenv("ENVIRONMENT") == "development" else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(name)s] %(levelname)s %(message)s"
    )
    return logging.getLogger(name)
```

**Step 2: Escribir test para BaseModule**

```python
# tests/test_base_module.py
import pytest
from shared.base_module import BaseModule

class ConcreteModule(BaseModule):
    async def on_event(self, event_type: str, data: dict) -> None:
        pass

def test_base_module_has_name():
    mod = ConcreteModule(name="TestModule")
    assert mod.name == "TestModule"

def test_base_module_status_default():
    mod = ConcreteModule(name="TestModule")
    assert mod.status == "active"
```

**Step 3: Correr test — debe fallar**

```bash
python -m pytest tests/test_base_module.py -v
```
Expected: `FAILED — ModuleNotFoundError`

**Step 4: Crear shared/base_module.py**

```python
from abc import ABC, abstractmethod
from shared.logger import get_logger

class BaseModule(ABC):
    def __init__(self, name: str):
        self.name = name
        self.status = "active"
        self.logger = get_logger(name)

    @abstractmethod
    async def on_event(self, event_type: str, data: dict) -> None:
        pass
```

**Step 5: Correr test — debe pasar**

```bash
python -m pytest tests/test_base_module.py -v
```
Expected: `PASSED`

**Step 6: Commit**

```bash
git add shared/ tests/test_base_module.py tests/
git commit -m "feat: shared logger and BaseModule abstract class"
```

---

## Task 2: EventBus

**Files:**
- Create: `app/__init__.py`
- Create: `app/event_bus.py`
- Test: `tests/app/test_event_bus.py`

**Step 1: Escribir tests**

```python
# tests/app/test_event_bus.py
import pytest
import asyncio
from app.event_bus import EventBus

@pytest.mark.asyncio
async def test_subscriber_receives_event():
    bus = EventBus()
    received = []

    async def handler(data):
        received.append(data)

    bus.subscribe("test:event", handler)
    await bus.emit("test:event", {"msg": "hello"})
    await asyncio.sleep(0.05)
    assert received == [{"msg": "hello"}]

@pytest.mark.asyncio
async def test_no_subscriber_does_not_crash():
    bus = EventBus()
    await bus.emit("unknown:event", {})  # Should not raise

@pytest.mark.asyncio
async def test_multiple_subscribers_all_receive():
    bus = EventBus()
    log = []

    async def h1(data): log.append("h1")
    async def h2(data): log.append("h2")

    bus.subscribe("evt", h1)
    bus.subscribe("evt", h2)
    await bus.emit("evt", {})
    await asyncio.sleep(0.05)
    assert "h1" in log and "h2" in log
```

**Step 2: Correr tests — deben fallar**

```bash
python -m pytest tests/app/test_event_bus.py -v
```
Expected: `FAILED — ModuleNotFoundError`

**Step 3: Crear app/event_bus.py**

```python
import asyncio
from typing import Callable, Any
from shared.logger import get_logger

logger = get_logger("EventBus")

class EventBus:
    def __init__(self):
        self._listeners: dict[str, list[Callable]] = {}

    def subscribe(self, event_type: str, callback: Callable) -> None:
        self._listeners.setdefault(event_type, []).append(callback)
        logger.debug(f"Subscribed to '{event_type}'")

    async def emit(self, event_type: str, data: Any) -> None:
        logger.debug(f"Emitting '{event_type}'")
        for callback in self._listeners.get(event_type, []):
            asyncio.create_task(callback(data))
```

**Step 4: Correr tests — deben pasar**

```bash
python -m pytest tests/app/test_event_bus.py -v
```
Expected: `3 passed`

**Step 5: Commit**

```bash
git add app/ tests/app/
git commit -m "feat: EventBus pub/sub system"
```

---

## Task 3: Seguridad — PII Scrubber (Nioisec)

**Files:**
- Create: `seguridad/__init__.py`
- Create: `seguridad/pii_scrubber.py`
- Test: `tests/seguridad/test_pii_scrubber.py`

**Step 1: Escribir tests**

```python
# tests/seguridad/test_pii_scrubber.py
import pytest
from seguridad.pii_scrubber import NIoiSecScrubber

@pytest.fixture
def scrubber():
    return NIoiSecScrubber()

def test_removes_email(scrubber):
    result = scrubber.scrub("Escríbeme a test@gmail.com")
    assert "[EMAIL_REMOVED]" in result
    assert "test@gmail.com" not in result

def test_removes_credit_card(scrubber):
    result = scrubber.scrub("Mi tarjeta es 4111 1111 1111 1111")
    assert "[CREDIT_CARD_REMOVED]" in result

def test_removes_phone(scrubber):
    result = scrubber.scrub("Llámame al +1-800-555-1234")
    assert "[PHONE_REMOVED]" in result

def test_clean_text_unchanged(scrubber):
    text = "Hola, ¿cómo estás?"
    assert scrubber.scrub(text) == text

def test_scrub_returns_report(scrubber):
    text = "email: user@test.com y tarjeta 4111111111111111"
    result, report = scrubber.scrub_with_report(text)
    assert report["total_removed"] == 2
```

**Step 2: Correr tests — deben fallar**

```bash
python -m pytest tests/seguridad/test_pii_scrubber.py -v
```

**Step 3: Crear seguridad/pii_scrubber.py**

```python
import re
from typing import Tuple

class NIoiSecScrubber:
    def __init__(self):
        self.patterns = {
            "credit_card": r"\b(?:\d[ -]*?){13,16}\b",
            "email": r"[\w\.-]+@[\w\.-]+\.\w+",
            "phone": r"\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}",
        }

    def scrub(self, text: str) -> str:
        result = text
        for label, pattern in self.patterns.items():
            result = re.sub(pattern, f"[{label.upper()}_REMOVED]", result)
        return result

    def scrub_with_report(self, text: str) -> Tuple[str, dict]:
        result = text
        total = 0
        detail = {}
        for label, pattern in self.patterns.items():
            matches = re.findall(pattern, result)
            count = len(matches)
            if count:
                result = re.sub(pattern, f"[{label.upper()}_REMOVED]", result)
                detail[label] = count
                total += count
        return result, {"total_removed": total, "detail": detail}
```

**Step 4: Correr tests — deben pasar**

```bash
python -m pytest tests/seguridad/test_pii_scrubber.py -v
```
Expected: `5 passed`

**Step 5: Commit**

```bash
git add seguridad/ tests/seguridad/
git commit -m "feat(nioisec): PII scrubber with email, card, phone patterns"
```

---

## Task 4: Seguridad — Auth Guard (mock JWT)

**Files:**
- Create: `seguridad/auth_guard.py`
- Test: `tests/seguridad/test_auth_guard.py`

**Step 1: Escribir tests**

```python
# tests/seguridad/test_auth_guard.py
import pytest
from fastapi import HTTPException
from seguridad.auth_guard import AuthGuard

@pytest.fixture
def guard():
    return AuthGuard(secret="test-secret", mock_mode=True)

def test_valid_dev_token_passes(guard):
    payload = guard.verify("dev-token")
    assert payload["sub"] == "dev-user"

def test_invalid_token_raises_401(guard):
    with pytest.raises(HTTPException) as exc:
        guard.verify("bad-token")
    assert exc.value.status_code == 401

def test_empty_token_raises_401(guard):
    with pytest.raises(HTTPException):
        guard.verify("")
```

**Step 2: Correr tests — deben fallar**

```bash
python -m pytest tests/seguridad/test_auth_guard.py -v
```

**Step 3: Crear seguridad/auth_guard.py**

```python
import os
from fastapi import HTTPException
from shared.logger import get_logger

logger = get_logger("AuthGuard")

class AuthGuard:
    def __init__(self, secret: str = None, mock_mode: bool = False):
        self.secret = secret or os.getenv("JWT_SECRET", "dev-secret")
        self.mock_mode = mock_mode or os.getenv("ENVIRONMENT") == "development"

    def verify(self, token: str) -> dict:
        if not token:
            raise HTTPException(status_code=401, detail="Token missing")
        if self.mock_mode:
            if token == "dev-token":
                return {"sub": "dev-user"}
            raise HTTPException(status_code=401, detail="Invalid token")
        # En producción: usar python-jose para verificar JWT real
        # from jose import jwt, JWTError
        # try:
        #     return jwt.decode(token, self.secret, algorithms=["HS256"])
        # except JWTError:
        #     raise HTTPException(status_code=401, detail="Invalid token")
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Step 4: Correr tests — deben pasar**

```bash
python -m pytest tests/seguridad/test_auth_guard.py -v
```
Expected: `3 passed`

**Step 5: Commit**

```bash
git add seguridad/auth_guard.py tests/seguridad/test_auth_guard.py
git commit -m "feat(nioisec): mock JWT auth guard"
```

---

## Task 5: Seguridad — Encryptor (mock AES-256)

**Files:**
- Create: `seguridad/encryptor.py`
- Test: `tests/seguridad/test_encryptor.py`

**Step 1: Escribir tests**

```python
# tests/seguridad/test_encryptor.py
import pytest
from seguridad.encryptor import Encryptor

@pytest.fixture
def enc():
    return Encryptor(mock_mode=True)

def test_encrypt_returns_string(enc):
    result = enc.encrypt("datos sensibles")
    assert isinstance(result, str)
    assert result != "datos sensibles"

def test_decrypt_roundtrip(enc):
    original = "perfil de contacto"
    encrypted = enc.encrypt(original)
    assert enc.decrypt(encrypted) == original
```

**Step 2: Correr tests — deben fallar**

```bash
python -m pytest tests/seguridad/test_encryptor.py -v
```

**Step 3: Crear seguridad/encryptor.py**

```python
import base64
import os

class Encryptor:
    def __init__(self, mock_mode: bool = False):
        self.mock_mode = mock_mode or os.getenv("ENVIRONMENT") == "development"

    def encrypt(self, text: str) -> str:
        if self.mock_mode:
            return base64.b64encode(text.encode()).decode()
        # Producción: usar cryptography.fernet con AES-256
        raise NotImplementedError("Configure ENVIRONMENT=production con clave AES")

    def decrypt(self, token: str) -> str:
        if self.mock_mode:
            return base64.b64decode(token.encode()).decode()
        raise NotImplementedError("Configure ENVIRONMENT=production con clave AES")
```

**Step 4: Correr tests — deben pasar**

```bash
python -m pytest tests/seguridad/test_encryptor.py -v
```

**Step 5: Commit**

```bash
git add seguridad/encryptor.py tests/seguridad/test_encryptor.py
git commit -m "feat(nioisec): mock encryptor (base64 dev, AES-256 prod stub)"
```

---

## Task 6: FixerModule

**Files:**
- Create: `modules/__init__.py`
- Create: `modules/fixer/__init__.py`
- Create: `modules/fixer/index.py`
- Test: `tests/modules/test_fixer.py`

**Step 1: Escribir tests**

```python
# tests/modules/test_fixer.py
import pytest
import asyncio
from app.event_bus import EventBus
from modules.fixer.index import FixerModule

@pytest.fixture
def setup():
    bus = EventBus()
    fixer = FixerModule(bus=bus)
    return bus, fixer

@pytest.mark.asyncio
async def test_fixer_emits_text_fixed(setup):
    bus, fixer = setup
    results = []

    async def capture(data): results.append(data)
    bus.subscribe("text:fixed", capture)

    await bus.emit("text:sanitized", {"safe_text": "hola amigo", "trace_id": "abc"})
    await asyncio.sleep(0.1)

    assert len(results) == 1
    assert results[0]["trace_id"] == "abc"
    assert "fixed_text" in results[0]

@pytest.mark.asyncio
async def test_fixer_preserves_trace_id(setup):
    bus, fixer = setup
    results = []
    async def capture(data): results.append(data)
    bus.subscribe("text:fixed", capture)

    await bus.emit("text:sanitized", {"safe_text": "texto", "trace_id": "xyz-999"})
    await asyncio.sleep(0.1)
    assert results[0]["trace_id"] == "xyz-999"
```

**Step 2: Correr tests — deben fallar**

```bash
python -m pytest tests/modules/test_fixer.py -v
```

**Step 3: Crear modules/fixer/index.py**

```python
from shared.base_module import BaseModule
from shared.logger import get_logger

logger = get_logger("FixerModule")

class FixerModule(BaseModule):
    def __init__(self, bus):
        super().__init__(name="FixerModule")
        self.bus = bus
        bus.subscribe("text:sanitized", self.on_event)

    async def on_event(self, event_type: str, data: dict) -> None:
        await self._fix(data)

    async def _fix(self, data: dict) -> None:
        safe_text = data.get("safe_text", "")
        trace_id = data.get("trace_id")
        logger.info(f"[{trace_id}] Fixing text...")

        # Mock: en producción, llamar a OpenAI con prompt de corrección
        fixed = self._mock_fix(safe_text)

        await self.bus.emit("text:fixed", {
            "trace_id": trace_id,
            "fixed_text": fixed,
            "original": safe_text,
        })

    def _mock_fix(self, text: str) -> str:
        # Simulación: capitaliza primera letra y añade punto final
        if not text:
            return text
        fixed = text.strip()
        if fixed:
            fixed = fixed[0].upper() + fixed[1:]
        if not fixed.endswith((".", "!", "?")):
            fixed += "."
        return fixed
```

**Nota:** `FixerModule.on_event` recibe `(event_type, data)` pero el EventBus llama con `(data)`. Ajustar la suscripción:

```python
bus.subscribe("text:sanitized", self._fix)  # directo a _fix
```

Y actualizar `on_event` para que sea solo el método abstracto requerido:

```python
async def on_event(self, event_type: str, data: dict) -> None:
    pass  # No usado directamente — suscripción directa a _fix
```

**Step 4: Correr tests — deben pasar**

```bash
python -m pytest tests/modules/test_fixer.py -v
```
Expected: `2 passed`

**Step 5: Commit**

```bash
git add modules/ tests/modules/test_fixer.py
git commit -m "feat: FixerModule — grammar correction (mock)"
```

---

## Task 7: AnalyzerModule

**Files:**
- Create: `modules/analyzer/index.py`
- Create: `modules/analyzer/prompts.yaml`
- Create: `modules/analyzer/__init__.py`
- Test: `tests/modules/test_analyzer.py`

**Step 1: Crear modules/analyzer/prompts.yaml**

```yaml
analysis:
  system: |
    Eres un experto en análisis de comunicación humana.
    Analiza el texto recibido e identifica: tono emocional, intención real, nivel de confianza.
    Responde SIEMPRE en JSON con las claves: tone, intent, confidence, suggestion.
  user_template: "Analiza este mensaje: {text}"
```

**Step 2: Escribir tests**

```python
# tests/modules/test_analyzer.py
import pytest
import asyncio
from app.event_bus import EventBus
from modules.analyzer.index import AnalyzerModule

@pytest.fixture
def setup():
    bus = EventBus()
    analyzer = AnalyzerModule(bus=bus)
    return bus, analyzer

@pytest.mark.asyncio
async def test_analyzer_emits_analysis_completed(setup):
    bus, _ = setup
    results = []
    async def capture(data): results.append(data)
    bus.subscribe("analysis:completed", capture)

    await bus.emit("text:sanitized", {"safe_text": "estoy cansado", "trace_id": "t1"})
    await asyncio.sleep(0.1)

    assert len(results) == 1
    assert results[0]["trace_id"] == "t1"
    assert "tone" in results[0]
    assert "intent" in results[0]
    assert "confidence" in results[0]

@pytest.mark.asyncio
async def test_analyzer_preserves_trace_id(setup):
    bus, _ = setup
    results = []
    async def capture(data): results.append(data)
    bus.subscribe("analysis:completed", capture)

    await bus.emit("text:sanitized", {"safe_text": "texto", "trace_id": "trace-99"})
    await asyncio.sleep(0.1)
    assert results[0]["trace_id"] == "trace-99"
```

**Step 3: Correr tests — deben fallar**

```bash
python -m pytest tests/modules/test_analyzer.py -v
```

**Step 4: Crear modules/analyzer/index.py**

```python
import yaml
import os
from shared.base_module import BaseModule
from shared.logger import get_logger

logger = get_logger("AnalyzerModule")
_PROMPTS_PATH = os.path.join(os.path.dirname(__file__), "prompts.yaml")

class AnalyzerModule(BaseModule):
    def __init__(self, bus):
        super().__init__(name="AnalyzerModule")
        self.bus = bus
        with open(_PROMPTS_PATH, "r", encoding="utf-8") as f:
            self.prompts = yaml.safe_load(f)
        bus.subscribe("text:sanitized", self._analyze)

    async def on_event(self, event_type: str, data: dict) -> None:
        pass

    async def _analyze(self, data: dict) -> None:
        safe_text = data.get("safe_text", "")
        trace_id = data.get("trace_id")
        logger.info(f"[{trace_id}] Analyzing text...")

        result = self._mock_analyze(safe_text)
        result["trace_id"] = trace_id

        await self.bus.emit("analysis:completed", result)

    def _mock_analyze(self, text: str) -> dict:
        # Mock: en producción, llamar a OpenAI con prompts.yaml
        keywords_stress = ["cansado", "agotado", "no puedo", "harto"]
        tone = "Estrés / Agotamiento" if any(k in text.lower() for k in keywords_stress) else "Neutral"
        return {
            "tone": tone,
            "intent": "Expresión emocional" if tone != "Neutral" else "Comunicación directa",
            "confidence": "Media",
            "suggestion": "Responder con empatía y brevedad." if tone != "Neutral" else "Respuesta estándar.",
        }
```

**Step 5: Correr tests — deben pasar**

```bash
python -m pytest tests/modules/test_analyzer.py -v
```
Expected: `2 passed`

**Step 6: Commit**

```bash
git add modules/analyzer/ tests/modules/test_analyzer.py
git commit -m "feat: AnalyzerModule — sentiment analysis (mock + prompts.yaml)"
```

---

## Task 8: ProfilerModule (mock DB)

**Files:**
- Create: `modules/profiler/index.py`
- Create: `modules/profiler/__init__.py`
- Test: `tests/modules/test_profiler.py`

**Step 1: Escribir tests**

```python
# tests/modules/test_profiler.py
import pytest
import asyncio
from app.event_bus import EventBus
from modules.profiler.index import ProfilerModule

@pytest.fixture
def setup():
    bus = EventBus()
    profiler = ProfilerModule(bus=bus)
    return bus, profiler

@pytest.mark.asyncio
async def test_profiler_saves_analysis(setup):
    bus, profiler = setup

    await bus.emit("analysis:completed", {
        "trace_id": "t1",
        "tone": "Estrés",
        "intent": "Expresión emocional",
        "confidence": "Media",
        "contact_id": "user-123",
    })
    await asyncio.sleep(0.1)

    profile = profiler.get_profile("user-123")
    assert profile is not None
    assert len(profile["history"]) == 1

@pytest.mark.asyncio
async def test_profiler_accumulates_history(setup):
    bus, profiler = setup

    for i in range(3):
        await bus.emit("analysis:completed", {
            "trace_id": f"t{i}",
            "tone": "Neutral",
            "contact_id": "user-456",
        })
    await asyncio.sleep(0.2)

    assert len(profiler.get_profile("user-456")["history"]) == 3
```

**Step 2: Correr tests — deben fallar**

```bash
python -m pytest tests/modules/test_profiler.py -v
```

**Step 3: Crear modules/profiler/index.py**

```python
from shared.base_module import BaseModule
from shared.logger import get_logger
from seguridad.encryptor import Encryptor

logger = get_logger("ProfilerModule")

class ProfilerModule(BaseModule):
    def __init__(self, bus):
        super().__init__(name="ProfilerModule")
        self.bus = bus
        self.encryptor = Encryptor(mock_mode=True)
        self._store: dict[str, dict] = {}  # mock DB: contact_id → profile
        bus.subscribe("analysis:completed", self._save_profile)

    async def on_event(self, event_type: str, data: dict) -> None:
        pass

    async def _save_profile(self, data: dict) -> None:
        contact_id = data.get("contact_id", "anon")
        logger.info(f"Updating profile for contact: {contact_id}")

        entry = {
            "tone": data.get("tone"),
            "intent": data.get("intent"),
            "trace_id": data.get("trace_id"),
        }
        encrypted_entry = self.encryptor.encrypt(str(entry))

        if contact_id not in self._store:
            self._store[contact_id] = {"history": []}
        self._store[contact_id]["history"].append(encrypted_entry)
        # Producción: INSERT INTO contact_profiles ... via asyncpg

    def get_profile(self, contact_id: str) -> dict | None:
        return self._store.get(contact_id)
```

**Step 4: Correr tests — deben pasar**

```bash
python -m pytest tests/modules/test_profiler.py -v
```
Expected: `2 passed`

**Step 5: Commit**

```bash
git add modules/profiler/ tests/modules/test_profiler.py
git commit -m "feat: ProfilerModule — contact memory (mock in-memory store)"
```

---

## Task 9: Kernel Principal (main.py) con trace_id coordination

**Files:**
- Create: `app/main.py`
- Test: `tests/app/test_kernel.py`

**Step 1: Escribir tests del Kernel**

```python
# tests/app/test_kernel.py
import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_returns_alive():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["kernel"] == "alive"
    assert "modules" in data

def test_process_requires_auth():
    res = client.post("/api/v1/process", json={"text": "hola"})
    assert res.status_code == 401

def test_process_with_dev_token_returns_result():
    res = client.post(
        "/api/v1/process",
        json={"text": "estoy muy cansado hoy", "contact_id": "user-1"},
        headers={"Authorization": "Bearer dev-token"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "analysis" in data
    assert "fixed_text" in data
    assert "trace_id" in data

def test_process_pii_is_scrubbed():
    res = client.post(
        "/api/v1/process",
        json={"text": "Mi email es secret@test.com llámame"},
        headers={"Authorization": "Bearer dev-token"},
    )
    assert res.status_code == 200
    # El texto fijo NO debe contener el email original
    fixed = res.json()["fixed_text"]
    assert "secret@test.com" not in fixed
```

**Step 2: Correr tests — deben fallar**

```bash
python -m pytest tests/app/test_kernel.py -v
```

**Step 3: Crear app/main.py**

```python
import asyncio
import uuid
import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional

from app.event_bus import EventBus
from seguridad.pii_scrubber import NIoiSecScrubber
from seguridad.auth_guard import AuthGuard
from modules.fixer.index import FixerModule
from modules.analyzer.index import AnalyzerModule
from modules.profiler.index import ProfilerModule
from shared.logger import get_logger

logger = get_logger("AURALIS-KERNEL")
security = HTTPBearer()

class ProcessRequest(BaseModel):
    text: str
    contact_id: Optional[str] = "anon"

class DajaronyKernel:
    def __init__(self):
        self.bus = EventBus()
        self.scrubber = NIoiSecScrubber()
        self.auth = AuthGuard()
        self._pending: dict[str, dict] = {}
        self._futures: dict[str, asyncio.Future] = {}
        self._modules = {}

    async def boot(self):
        logger.info("🌀 AURALIS KERNEL: Iniciando secuencia Nioisec...")
        self._modules["fixer"] = FixerModule(bus=self.bus)
        self._modules["analyzer"] = AnalyzerModule(bus=self.bus)
        self._modules["profiler"] = ProfilerModule(bus=self.bus)
        self.bus.subscribe("analysis:completed", self._on_analysis)
        self.bus.subscribe("text:fixed", self._on_fixed)
        logger.info("✅ Kernel operativo.")

    async def process(self, text: str, contact_id: str) -> dict:
        trace_id = str(uuid.uuid4())[:8]
        safe_text, report = self.scrubber.scrub_with_report(text)

        loop = asyncio.get_event_loop()
        future = loop.create_future()
        self._futures[trace_id] = future
        self._pending[trace_id] = {"contact_id": contact_id}

        await self.bus.emit("text:sanitized", {
            "safe_text": safe_text,
            "trace_id": trace_id,
            "contact_id": contact_id,
        })

        try:
            result = await asyncio.wait_for(future, timeout=10.0)
            result["trace_id"] = trace_id
            result["pii_removed"] = report["total_removed"]
            return result
        except asyncio.TimeoutError:
            raise HTTPException(status_code=504, detail="Processing timeout")
        finally:
            self._futures.pop(trace_id, None)
            self._pending.pop(trace_id, None)

    async def _on_analysis(self, data: dict):
        trace_id = data.get("trace_id")
        if trace_id in self._pending:
            self._pending[trace_id]["analysis"] = data
            self._try_resolve(trace_id)

    async def _on_fixed(self, data: dict):
        trace_id = data.get("trace_id")
        if trace_id in self._pending:
            self._pending[trace_id]["fixed"] = data
            self._try_resolve(trace_id)

    def _try_resolve(self, trace_id: str):
        p = self._pending.get(trace_id, {})
        if "analysis" in p and "fixed" in p:
            future = self._futures.get(trace_id)
            if future and not future.done():
                future.set_result({
                    "success": True,
                    "fixed_text": p["fixed"]["fixed_text"],
                    "analysis": {
                        "tone": p["analysis"].get("tone"),
                        "intent": p["analysis"].get("intent"),
                        "confidence": p["analysis"].get("confidence"),
                        "suggestion": p["analysis"].get("suggestion"),
                    },
                })

    def health(self) -> dict:
        return {
            "kernel": "alive",
            "security_layer": "active",
            "philosophy": "nioisec",
            "modules": {name: mod.status for name, mod in self._modules.items()},
        }

kernel = DajaronyKernel()
app = FastAPI(title="AURALIS Nioisec Engine", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await kernel.boot()

@app.get("/health")
async def health():
    return kernel.health()

@app.post("/api/v1/process")
async def process(
    req: ProcessRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    kernel.auth.verify(credentials.credentials)
    result = await kernel.process(text=req.text, contact_id=req.contact_id)
    return result
```

**Step 4: Correr tests — deben pasar**

```bash
python -m pytest tests/app/test_kernel.py -v
```
Expected: `4 passed`

**Step 5: Correr toda la suite**

```bash
python -m pytest -v
```
Expected: todos los tests pasan

**Step 6: Commit**

```bash
git add app/main.py tests/app/test_kernel.py
git commit -m "feat: DajaronyKernel — trace_id coordination, full pipeline"
```

---

## Task 10: Dockerfile + README + prueba manual

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `README.md`

**Step 1: Crear Dockerfile**

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV ENVIRONMENT=production
EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**Step 2: Crear .dockerignore**

```
__pycache__
*.pyc
.env
.git
tests/
```

**Step 3: Prueba manual local**

```bash
uvicorn app.main:app --reload --port 8080
```

Abrir `http://localhost:8080/docs` — debe mostrar Swagger con los 2 endpoints.

Probar con curl:

```bash
curl -X POST http://localhost:8080/api/v1/process \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  -d '{"text": "hola me llamo juan y mi email es juan@test.com estoy muy cansado", "contact_id": "juan-1"}'
```

Expected: JSON con `success: true`, `fixed_text`, `analysis`, y `pii_removed: 1`

**Step 4: Commit final**

```bash
git add Dockerfile .dockerignore README.md
git commit -m "chore: Dockerfile for Cloud Run + README"
```

---

## Resumen de Commits

| Task | Commit |
|------|--------|
| 0 | `chore: project scaffold` |
| 1 | `feat: shared logger and BaseModule` |
| 2 | `feat: EventBus pub/sub system` |
| 3 | `feat(nioisec): PII scrubber` |
| 4 | `feat(nioisec): mock JWT auth guard` |
| 5 | `feat(nioisec): mock encryptor` |
| 6 | `feat: FixerModule` |
| 7 | `feat: AnalyzerModule` |
| 8 | `feat: ProfilerModule` |
| 9 | `feat: DajaronyKernel — full pipeline` |
| 10 | `chore: Dockerfile + README` |

## Para conectar OpenAI (cuando tengas la key)

En `modules/fixer/index.py` y `modules/analyzer/index.py`, reemplaza el método `_mock_*` por:

```python
from openai import AsyncOpenAI
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def _call_openai(self, text: str) -> dict:
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": text}]
    )
    return response.choices[0].message.content
```
