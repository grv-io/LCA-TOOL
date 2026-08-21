# CONTRACTS — shared interfaces (change only by group agreement)

These are the boundaries between Ritesh, Harsh and Gaurav. Code against these; do not depend on each other's internals.

## 1. Pydantic schemas — `backend/app/schemas/`

Ritesh creates these files on **day 1** (stubs are fine). Harsh and Gaurav may **add** optional fields to their own sections but must not rename/remove anything.

### `schemas/scenario.py`
```python
class Flow(BaseModel):
    name: str                      # e.g. "bauxite", "electricity", "scrap_aluminium"
    quantity: float                # per functional unit (1 t metal)
    unit: str                      # "kg", "kWh", "MJ", "m3", "tkm"
    is_recycled: bool = False
    source: Literal["user", "ai_estimated", "default"] = "user"
    confidence: float | None = None    # 0-1, set by imputer when source == "ai_estimated"

class Stage(BaseModel):
    name: str                      # "mining", "beneficiation", "smelting", "refining", "casting", "transport", "use", "eol"
    inputs: list[Flow] = []
    outputs: list[Flow] = []
    energy: list[Flow] = []
    transport: list[Flow] = []     # unit "tkm", name = mode ("truck", "rail", "ship")

class Scenario(BaseModel):
    id: str | None = None
    name: str
    metal: Literal["aluminium", "steel", "copper"]
    route: str                     # "primary", "recycled", "bf_bof", "eaf", "hybrid"
    region: str = "IN"             # ISO country code, drives grid factor
    boundary: Literal["cradle_to_gate", "cradle_to_grave"] = "cradle_to_gate"
    functional_unit: str = "1 t metal at gate"
    recycled_content: float = 0.0  # 0-1
    eol_recovery_rate: float = 0.0 # 0-1
    product_lifetime_years: float | None = None
    stages: list[Stage]
```

### `schemas/result.py`
```python
class ImpactValue(BaseModel):
    mean: float
    p05: float | None = None
    p95: float | None = None
    unit: str

class Impacts(BaseModel):
    gwp: ImpactValue               # kg CO2-eq
    energy: ImpactValue            # MJ
    water: ImpactValue             # m3
    acidification: ImpactValue     # kg SO2-eq

class Circularity(BaseModel):
    recycled_content: float
    eol_recovery_rate: float
    mci: float                     # 0-1
    resource_efficiency: float     # t output / t input
    linear_flow_index: float

class Provenance(BaseModel):
    factor_id: str
    source: str
    year: int
    region: str
    uncertainty_gsd: float | None = None   # geometric std dev for lognormal

class Result(BaseModel):
    scenario_id: str | None
    impacts: Impacts
    per_stage: dict[str, Impacts]          # stage name -> impacts
    circularity: Circularity
    provenance: list[Provenance]
    ai_estimated_fields: list[str] = []    # dotted paths e.g. "stages[2].energy[0].quantity"
    monte_carlo_runs: int = 0

class CompareResult(BaseModel):
    baseline: Result
    alternative: Result
    delta_pct: dict[str, float]            # {"gwp": -72.3, "energy": ..., "mci": +0.41}
    savings_breakdown: dict[str, float]    # stage -> kg CO2-eq saved
```

### `schemas/ml.py`
```python
class ImputeRequest(BaseModel):
    scenario: Scenario                     # partial; missing quantities = None or omitted flows

class ImputeResponse(BaseModel):
    scenario: Scenario                     # filled; source="ai_estimated" + confidence on filled flows
    filled_fields: list[str]

class SurrogateRequest(BaseModel):
    metal: str
    route: str
    region: str
    recycled_content: float
    grid_renewable_share: float
    ore_grade: float | None = None
    eol_recovery_rate: float

class SurrogateResponse(BaseModel):
    gwp: float
    energy: float
    water: float
    mci: float

class ParseRequest(BaseModel):
    text: str

class ParseResponse(BaseModel):
    scenario: Scenario
    warnings: list[str] = []

class RecommendRequest(BaseModel):
    compare: CompareResult

class Recommendation(BaseModel):
    title: str
    rationale: str                         # must cite numbers from compare
    estimated_gwp_reduction_pct: float | None = None
    priority: Literal["high", "medium", "low"]

class RecommendResponse(BaseModel):
    recommendations: list[Recommendation]
```

## 2. Python function signatures

Ritesh exposes (in `backend/app/core/`):
```python
def run_lca(scenario: Scenario, mc_runs: int = 0) -> Result
def compare(baseline: Scenario, alternative: Scenario, mc_runs: int = 0) -> CompareResult
def list_factors(metal: str | None = None) -> list[Provenance]
def compute_mci(recycled_content, eol_recovery_rate, lifetime_ratio=1.0, ...) -> Circularity
```

Harsh exposes (in `backend/app/ml/` and `backend/app/llm/`):
```python
def impute(req: ImputeRequest) -> ImputeResponse
def surrogate_predict(req: SurrogateRequest) -> SurrogateResponse
def parse_text(req: ParseRequest) -> ParseResponse
def recommend(req: RecommendRequest) -> RecommendResponse
```

Gaurav wraps all of the above in FastAPI routers and consumes them from the frontend.

## 3. HTTP API (Gaurav implements; Ritesh and Harsh just need to know it exists)

| Method | Path | Body → Response |
|---|---|---|
| POST | `/api/scenarios` | Scenario → Scenario (with id) |
| GET | `/api/scenarios` | → list[Scenario] |
| GET | `/api/scenarios/{id}` | → Scenario |
| POST | `/api/lca/run?mc=0` | Scenario → Result |
| POST | `/api/lca/compare?mc=0` | {baseline, alternative} → CompareResult |
| GET | `/api/factors?metal=` | → list[Provenance] |
| POST | `/api/ml/impute` | ImputeRequest → ImputeResponse |
| POST | `/api/ml/surrogate` | SurrogateRequest → SurrogateResponse |
| POST | `/api/llm/parse` | ParseRequest → ParseResponse |
| POST | `/api/llm/recommend` | RecommendRequest → RecommendResponse |
| POST | `/api/reports/pdf` | {scenario_ids or compare} → application/pdf |

## 4. Factor CSV format — `backend/data/factors/*.csv` (Ritesh owns; Harsh reads)

```
factor_id,metal,route,stage,flow_name,unit,gwp_per_unit,energy_per_unit,water_per_unit,acid_per_unit,region,source,year,uncertainty_gsd,notes
al_bauxite_mining_IN,aluminium,primary,mining,bauxite,kg,0.0045,0.06,0.0002,0.00002,IN,IBM Yearbook 2023 + IAI 2022,2022,1.3,
grid_IN,any,any,any,electricity,kWh,0.71,9.5,0.0025,0.0032,IN,CEA CO2 Baseline v19,2023,1.1,
...
```

## 5. Environment variables

```
DATABASE_URL=postgresql+psycopg://lca:lca@db:5432/lca      # Gaurav
ANTHROPIC_API_KEY=...                                     # Harsh (backend only, never frontend)
ML_ARTIFACTS_DIR=backend/app/ml/artifacts                 # Harsh
NEXT_PUBLIC_API_URL=http://localhost:8000                 # Gaurav
```

## 6. Day-1 stubs (so nobody is blocked)

- **Ritesh:** `schemas/` complete; `core/lca_engine.run_lca()` returns hard-coded plausible Result for any Scenario.
- **Harsh:** `ml/imputer.impute()` returns the input scenario with `source="ai_estimated", confidence=0.5` on any flow with `quantity is None`; `llm/parse_text()` returns a fixed aluminium Scenario.
- **Gaurav:** all routes wired to the stubs; frontend fetches `/api/lca/run` and shows the numbers.
