# AI-Driven LCA Tool for Circularity & Sustainability in Metallurgy & Mining

**Master Plan** — read this first, then your personal plan in `docs/`.

| Person | File | Owns |
|---|---|---|
| Ritesh — LCA Engine & Data | `docs/RITESH_engine_data.md` | `backend/app/core/`, `backend/data/`, `notebooks/` |
| Harsh — AI/ML & LLM | `docs/HARSH_ai_ml.md` | `backend/app/ml/`, `backend/app/llm/` |
| Gaurav — Frontend, API glue, Reports, Deploy | `docs/GAURAV_frontend_api.md` | `frontend/`, `backend/app/api/`, `backend/app/reports/`, `docker/` |

The **contract between the three of you is `docs/CONTRACTS.md`** — shared JSON schemas and function signatures. Nobody changes it without a group message. Everything else is independent by folder, so merge conflicts are near-zero.

---

## 1. Problem statement (SIH — Ministry of Mines)

Build a tool that performs Life Cycle Assessment (LCA) for metals (aluminium, steel, copper, critical minerals) across mining → processing → use → end-of-life, uses AI to fill missing data and predict impacts, computes circularity indicators, compares linear vs circular pathways, visualises material flows, and generates actionable recommendations + reports.

## 2. Scope (locked for v1)

- **Metals:** aluminium (primary Hall-Héroult vs recycled), steel (BF-BOF vs EAF-scrap). Copper = v2.
- **Functional unit:** 1 tonne of metal at plant gate (cradle-to-gate). Cradle-to-grave (use + EoL) as toggle.
- **Impact categories:** GWP (kg CO2-eq), cumulative energy demand (MJ), water use (m3), acidification (kg SO2-eq).
- **Circularity indicators:** recycled content %, end-of-life recovery rate %, Material Circularity Indicator (MCI, Ellen MacArthur formula), resource efficiency (t output / t input).
- **AI features:** (1) parameter gap-filling with confidence, (2) surrogate model for instant what-if sliders, (3) Monte Carlo uncertainty bands, (4) LLM natural-language input parsing + grounded recommendations.
- **Outputs:** dashboard, results with uncertainty, Sankey material flow, linear-vs-circular compare, PDF report.

**Not in scope:** blockchain, IoT ingestion, fine-tuned LLMs, multi-tenant auth.

## 3. Tech stack

| Layer | Choice |
|---|---|
| Backend | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy + Alembic |
| LCA engine | Factor-based engine (v1) with interface ready for Brightway2.5 swap (v2) |
| ML | scikit-learn, XGBoost/LightGBM, NumPy, pandas |
| LLM | Anthropic Claude API (`claude-opus-5`), structured outputs |
| DB | PostgreSQL (Docker) — SQLite fallback for local dev |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand |
| Charts | Recharts (bar/radar/waterfall), Plotly.js (Sankey) |
| Reports | Jinja2 HTML → WeasyPrint PDF |
| Deploy | Docker Compose; Render/Railway (API), Vercel (UI), Neon/Supabase (Postgres) |
| Tooling | ruff, black, pytest, GitHub Actions |

## 4. Repository layout & ownership

```
lca-tool/
├── PLAN.md                         # this file
├── docs/
│   ├── CONTRACTS.md                # SHARED — schemas & signatures (change only by agreement)
│   ├── RITESH_engine_data.md
│   ├── HARSH_ai_ml.md
│   └── GAURAV_frontend_api.md
├── backend/
│   ├── app/
│   │   ├── main.py                 # Gaurav
│   │   ├── db.py                   # Gaurav
│   │   ├── api/                    # Gaurav  (routers: scenarios, lca, ml, reports)
│   │   ├── core/                   # Ritesh  (lca_engine.py, circularity.py, montecarlo.py, factors.py)
│   │   ├── ml/                     # Harsh  (imputer.py, surrogate.py, train.py, artifacts/)
│   │   ├── llm/                    # Harsh  (parse_input.py, recommend.py, prompts/)
│   │   ├── reports/                # Gaurav  (templates/, pdf.py)
│   │   └── schemas/                # SHARED — generated from CONTRACTS.md (Ritesh writes first, Harsh/Gaurav only add)
│   ├── data/factors/               # Ritesh  (CSV emission-factor tables)
│   ├── tests/
│   │   ├── test_core/              # Ritesh
│   │   ├── test_ml/                # Harsh
│   │   └── test_api/               # Gaurav
│   └── requirements.txt            # each adds own lines; keep alphabetical
├── frontend/                       # Gaurav
├── notebooks/                      # Ritesh (validation), Harsh (ml experiments) — separate files
├── docker/                         # Gaurav
└── docker-compose.yml              # Gaurav
```

**Merge-conflict rules**
1. Only touch folders you own. Need something in someone else's folder → ask them, don't edit.
2. `docs/CONTRACTS.md` and `backend/app/schemas/` change only after group agreement.
3. `requirements.txt` — add your packages on your own lines, alphabetical, one per line.
4. One branch per person: `ritesh-engine`, `harsh-ml`, `gaurav-app`. Rebase on `main` daily; merge to `main` via PR at each milestone.
5. Stubs first: Ritesh publishes `schemas/` + a stub `lca_engine.run()` returning fake numbers on day 1 so Harsh and Gaurav can code against it immediately.

## 5. Timeline (5 weeks, adjust to your deadline)

| Week | Ritesh (Engine & Data) | Harsh (AI/ML) | Gaurav (Frontend/API) |
|---|---|---|---|
| 0 (days 1–3) | Scope, schemas stub, factor CSV started, engine stub | Read EMF MCI doc + ISO 14040; design synthetic dataset; Claude API key + prompt drafts | Repo skeleton, FastAPI health, Next.js hello, Docker Compose, CI |
| 1 | Factor CSVs complete (Al + steel), factor-based engine, circularity/MCI, validation tests | Synthetic data generator (uses Ritesh engine stub), imputer v1 | API routers wired to engine stub, DB models, scenario CRUD, frontend scenario builder |
| 2 | Allocation, cradle-to-grave toggle, Monte Carlo module | Imputer v2 (quantile), surrogate model, LLM input parser | Results page, charts, Sankey, compare page |
| 3 | Validation notebook vs literature, provenance metadata on every factor | Recommendations (grounded), optional RAG, ML API endpoints handed to Gaurav | Report template + PDF, provenance UI, sliders → surrogate |
| 4 | Copper (stretch), Brightway swap (stretch), factor QA | Model eval report (R2, calibration), robustness tests | Deploy, seed demo scenarios, demo script, README |

## 6. Integration milestones (whole team syncs)

- **M1 (end wk 0):** schemas agreed, stubs running, everyone can `docker compose up` and hit `/health`.
- **M2 (end wk 1):** real engine numbers flow through API to frontend scenario page.
- **M3 (end wk 2):** imputation + surrogate + results/compare pages work end-to-end.
- **M4 (end wk 3):** PDF report downloads; recommendations shown; validation table in README.
- **M5 (end wk 4):** deployed, seeded, demo rehearsed.

## 7. Validation targets (engine must land in these ranges)

| Route | GWP (t CO2-eq / t metal) |
|---|---|
| Primary Al (India, coal-heavy grid) | 16–20 |
| Primary Al (global avg) | 12–17 |
| Recycled Al | 0.5–1.5 |
| Steel BF-BOF | 1.9–2.4 |
| Steel EAF (scrap) | 0.4–1.0 |

## 8. Cut list (in order, if time runs out)

1. RAG → direct prompt only
2. Brightway → stay factor-based
3. Postgres → SQLite
4. Next.js → Streamlit single-file app (Gaurav)
5. Copper → drop

## 9. Demo script (3 min)

1. Type NL description → Claude parses to scenario, AI-estimated fields highlighted.
2. Run → KPI cards with uncertainty bands, per-stage bar, Sankey.
3. Compare primary vs recycled → waterfall, drag scrap-share slider (surrogate = instant).
4. Show recommendations citing the numbers.
5. Click provenance on a factor → source/year/region.
6. Download PDF.
