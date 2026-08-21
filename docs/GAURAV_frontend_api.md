# GAURAV — Frontend, API glue, Reports, Deploy

**Mission:** you are the integrator. You never write LCA math or ML logic — you call Ritesh's and Harsh's functions and make them usable, visible, and deployed. You also own the repo itself (git setup, CI, Docker).
**Branch:** `gaurav-app` (see docs/GIT_WORKFLOW.md)

> NOTE FOR AI ASSISTANTS: do the tasks in order (T1, T2, ...). Each task names exact files with full code or precise templates. Run each CHECK. Never edit files in the FORBIDDEN list — if a function you need from core/ml is missing, use the stub behavior and message the owner; do not implement it yourself.

## Folder ownership

| ALLOWED (only you edit these) | FORBIDDEN (never edit) |
|---|---|
| `frontend/` (all of it) | `backend/app/core/`, `backend/data/`, `backend/app/schemas/` (Ritesh) |
| `backend/app/main.py`, `backend/app/db.py` | `backend/app/ml/`, `backend/app/llm/` (Harsh) |
| `backend/app/api/`, `backend/app/reports/` | `docs/CONTRACTS.md` (group agreement only) |
| `backend/tests/test_api/`, `backend/scripts/` | |
| `docker/`, `docker-compose.yml`, `.github/workflows/`, root `README.md`, `.gitignore`, `backend/requirements.txt` (initial file; others append) | |

---

## T1 — Repo bootstrap (Day 1, FIRST — before anyone clones)

1. Follow `docs/GIT_WORKFLOW.md` → "One-time setup → Gaurav" (create GitHub repo, push, add collaborators).
2. **File: `.gitignore`** (repo root)
```
.venv/
__pycache__/
*.pyc
.env
backend/.env
backend/app/ml/artifacts/
backend/app/ml/data/
node_modules/
frontend/.next/
.DS_Store
*.parquet
```
3. **File: `backend/requirements.txt`** (initial; Ritesh/Harsh append their own lines, keep alphabetical)
```
alembic
anthropic
fastapi
httpx
jinja2
joblib
lightgbm
numpy
pandas
pyarrow
pydantic
pytest
python-dotenv
scikit-learn
sqlalchemy
uvicorn
```
(`weasyprint` gets added in T7 — it needs system libraries, so keep it out until then.)
4. **File: `backend/.env.example`**
```
DATABASE_URL=sqlite:///./lca.db
ANTHROPIC_API_KEY=put-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```
5. Push: `git add . && git commit -m "bootstrap: gitignore, requirements, env example" && git push` (this first commit can go straight to main since nobody else has cloned yet).

## T2 — FastAPI skeleton (Day 1–2)

Create empty `__init__.py` in `backend/app/api/`, `backend/app/reports/`, `backend/tests/test_api/`.

**File: `backend/app/main.py`**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import factors, lca, llm, ml, reports, scenarios

app = FastAPI(title="LCA Tool API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # add the Vercel URL at deploy time
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (scenarios.router, lca.router, ml.router, llm.router,
               factors.router, reports.router):
    app.include_router(router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
```

**File: `backend/app/api/lca.py`**
```python
from fastapi import APIRouter
from pydantic import BaseModel

from app.core.lca_engine import compare, run_lca
from app.schemas.result import CompareResult, Result
from app.schemas.scenario import Scenario

router = APIRouter(tags=["lca"])


class ComparePayload(BaseModel):
    baseline: Scenario
    alternative: Scenario


@router.post("/lca/run", response_model=Result)
def lca_run(scenario: Scenario, mc: int = 0) -> Result:
    return run_lca(scenario, mc_runs=mc)


@router.post("/lca/compare", response_model=CompareResult)
def lca_compare(payload: ComparePayload, mc: int = 0) -> CompareResult:
    return compare(payload.baseline, payload.alternative, mc_runs=mc)
```

**File: `backend/app/api/ml.py`**
```python
from fastapi import APIRouter

from app.ml.imputer import impute
from app.ml.surrogate import surrogate_predict
from app.schemas.ml import (
    ImputeRequest, ImputeResponse, SurrogateRequest, SurrogateResponse,
)

router = APIRouter(tags=["ml"])


@router.post("/ml/impute", response_model=ImputeResponse)
def ml_impute(req: ImputeRequest) -> ImputeResponse:
    return impute(req)


@router.post("/ml/surrogate", response_model=SurrogateResponse)
def ml_surrogate(req: SurrogateRequest) -> SurrogateResponse:
    return surrogate_predict(req)
```

**File: `backend/app/api/llm.py`** — same pattern: `/llm/parse` → `app.llm.parse_input.parse_text`, `/llm/recommend` → `app.llm.recommend.recommend`.
**File: `backend/app/api/factors.py`** — `GET /factors?metal=` → `app.core.lca_engine.list_factors(metal)`.
**File: `backend/app/api/scenarios.py`** — for now an in-memory dict `{id: Scenario}` with POST (assign `str(uuid4())` as id), GET list, GET by id (404 if missing). DB comes in T4.
**File: `backend/app/api/reports.py`** — for now `POST /reports/pdf` returns `{"detail": "not implemented yet"}` with status 501. Real in T7.

CHECK (from `backend/`, venv active, after Ritesh's T1–T2 are merged):
```
uvicorn app.main:app --reload
```
Open http://localhost:8000/docs — you should see all routes. Try POST `/api/lca/run` with:
```json
{"name": "test", "metal": "aluminium", "route": "primary"}
```
Expected: JSON result with `impacts.gwp.mean` = 17000.

**File: `backend/tests/test_api/test_routes.py`** — use `fastapi.testclient.TestClient`, assert `/health` returns 200 and `/api/lca/run` returns gwp > 0.

## T3 — CI + Docker (Day 2–3)

**File: `.github/workflows/ci.yml`**
```yaml
name: ci
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r backend/requirements.txt
      - run: cd backend && python -m pytest -q
```
(Add a frontend job with `npm ci && npm run build` after T5.)

**File: `docker/backend.Dockerfile`**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**File: `docker-compose.yml`**
```yaml
services:
  api:
    build: { context: ., dockerfile: docker/backend.Dockerfile }
    ports: ["8000:8000"]
    env_file: backend/.env
    depends_on: [db]
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: lca
      POSTGRES_PASSWORD: lca
      POSTGRES_DB: lca
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```
CHECK: `docker compose up --build` → http://localhost:8000/health returns ok. Announce **M1** in the group.

## T4 — Database (Week 1)

**File: `backend/app/db.py`** — SQLAlchemy engine + `SessionLocal` from `DATABASE_URL` (default sqlite). Models: `ScenarioORM` (id str pk, name, json column holding the full Scenario dump), `ResultORM` (id, scenario_id, json result, created_at). Keep it simple: store Pydantic dumps as JSON — no column-per-field.
- Replace the in-memory dict in `api/scenarios.py` with DB reads/writes. `POST /api/lca/run` also saves the Result.
- `pip install psycopg[binary]` + add to requirements when switching Docker Postgres on.
- **File: `backend/scripts/seed.py`** — imports `app.core.seed_scenarios.get_seed_scenarios()` (Ritesh T6) and inserts the 4 scenarios. Until his T6 exists, seed with one hand-written aluminium scenario.

## T5 — Frontend skeleton (Week 1)

```
cd <repo root>
npx create-next-app@latest frontend --typescript --tailwind --app --eslint
cd frontend
npx shadcn@latest init
npm install @tanstack/react-query zustand recharts plotly.js react-plotly.js
npm install -D @types/react-plotly.js
```

**File: `frontend/src/lib/api.ts`** — one tiny typed client; every call goes through it:
```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
```
Mirror the backend types in `frontend/src/lib/types.ts` (Scenario, Result, CompareResult, ...) by hand from `docs/CONTRACTS.md` — or generate with `npx openapi-typescript http://localhost:8000/openapi.json -o src/lib/api-types.ts`.

Pages (App Router):
1. `/` **Dashboard** — list scenarios (GET /scenarios), "New scenario" button.
2. `/scenarios/new` **Builder** — 3 steps:
   - Step 1 form: metal, route, region, boundary, recycled %, EoL recovery (react-hook-form + zod mirroring the Pydantic rules).
   - Step 2: stages accordion; each flow row = name, quantity, unit, and a "leave blank → AI estimates" hint.
   - Step 3: a textarea "Describe your process in plain English" → POST /llm/parse → prefill the form; show `warnings`.
   - "Estimate missing" button → POST /ml/impute → AI-filled fields rendered with an **amber "AI" badge + confidence bar**; user can overwrite (badge switches to "user").
   - Save (POST /scenarios) → Run (POST /lca/run) → go to results.
3. `/scenarios/[id]/results` **Results** — see T6.
4. `/compare` **Compare** — see T6.

CHECK: `npm run dev` → dashboard lists the seeded scenarios.

## T6 — Results, charts, compare (Week 2)

- **KPI cards**: GWP, energy, water, acidification, MCI. When `monte_carlo_runs > 0` show the p05–p95 band under the number ("16.4 t CO2-eq (15.1–17.9)"). "Run with uncertainty" toggle refetches with `?mc=1000`.
- **Per-stage stacked bar** (Recharts `BarChart`, one bar per impact, stacked by stage).
- **Sankey** (react-plotly.js, type: "sankey"): nodes ore → concentrate → metal → product → EoL scrap → recycled/landfill. Write `frontend/src/lib/sankey.ts` that converts a `Result` (+ scenario recycled/recovery rates) into Plotly `{node: {label}, link: {source, target, value}}`. This chart is the demo centerpiece — make it look good in dark and light.
- **Circularity radar** (Recharts `RadarChart`: recycled content, recovery rate, MCI, resource efficiency).
- **Compare page**: pick two scenarios → POST /lca/compare → side-by-side KPI cards, delta % chips (green negative gwp), waterfall of `savings_breakdown` (Recharts BarChart trick or a simple horizontal bar list).
- **Sliders**: recycled content, grid renewable share, EoL recovery → debounce 150 ms → POST /ml/surrogate → update numbers live. Label the panel "surrogate estimate (instant)".
- Every page needs loading, empty, and error states (a red box with the API error text is enough).

## T7 — PDF reports + provenance UI (Week 3)

1. `pip install weasyprint` (Windows: install GTK runtime — https://doc.courtbouillon.org/weasyprint/stable/first_steps.html; in Docker add `RUN apt-get update && apt-get install -y libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf-2.0-0` to the Dockerfile). Add `weasyprint` to requirements.
2. **File: `backend/app/reports/templates/report.html.j2`** — sections in ISO 14044 style: 1. Goal & scope, 2. Functional unit & boundary, 3. Inventory table, 4. Data sources (provenance table: factor_id, source, year, region), 5. Impact results (+ uncertainty), 6. Circularity (MCI inputs and result), 7. Comparison, 8. Recommendations, 9. Limitations.
3. **File: `backend/app/reports/pdf.py`** — `render_pdf(result | compare) -> bytes` via Jinja2 + `weasyprint.HTML(string=html).write_pdf()`. Wire `POST /api/reports/pdf` to return it with `media_type="application/pdf"`.
4. Frontend: "Download PDF" button on results + compare pages.
5. **Provenance drawer**: clicking a stage/factor opens a side sheet showing source, year, region, gsd from `result.provenance` — this is what turns "AI black box" into "trustworthy tool" for judges.
6. Recommendations panel on Compare → POST /llm/recommend → priority chips + rationale text.

## T8 — Deploy + demo (Week 4)

1. Backend → Render or Railway (Docker deploy, point at `docker/backend.Dockerfile`), Postgres → Neon/Supabase free tier, set env vars (`DATABASE_URL`, `ANTHROPIC_API_KEY`).
2. Frontend → Vercel (`frontend/` as root), set `NEXT_PUBLIC_API_URL` to the Render URL; add the Vercel domain to CORS `allow_origins` in `main.py`.
3. Run `scripts/seed.py` against prod DB — the demo must need ZERO typing.
4. Root **README.md**: problem statement, architecture diagram (mermaid), stack, data sources (link Ritesh's factors README), the validation table from `docs/VALIDATION.md`, Harsh's EVAL.md headline numbers, how to run locally, team.
5. Rehearse the 3-minute demo script from `PLAN.md` section 9 on the live deployment; record a screen capture as backup.

## Definition of done
- [ ] Day 1: repo live, collaborators added, T1 pushed
- [ ] `docker compose up` → working API; `npm run dev` → working UI against it
- [ ] Every route in CONTRACTS section 3 implemented + tested
- [ ] Results/Compare/Report pages complete with real numbers, provenance drawer, AI badges
- [ ] Deployed URLs + validation table in README

## Streamlit escape hatch (only if Week 2 slips badly)
Single `backend/streamlit_app.py` importing Ritesh's and Harsh's functions directly: sidebar form → run → `st.metric` cards + Plotly bar/Sankey → download PDF button. Keep the FastAPI routes; Streamlit is just another client. This cuts the frontend workload by ~80% at the cost of polish.

## If stuck
- CORS errors in browser console → the frontend origin is missing from `allow_origins`.
- `ImportError: app.core...` → Ritesh's PR not merged yet or you didn't run the DAILY ROUTINE; use his stub versions, never write your own engine code.
- WeasyPrint fails on Windows → develop the PDF inside Docker instead of fighting GTK locally.
