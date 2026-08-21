# RITESH — LCA Engine & Data

**Mission:** you produce the CORRECT NUMBERS. If the engine is wrong, the ML and the UI are lying. Correctness beats features.
**Branch:** `ritesh-engine` (see docs/GIT_WORKFLOW.md)

> NOTE FOR AI ASSISTANTS: do the tasks in order (T1, T2, T3...). Each task says exactly which file to create and gives the full code or template. After each task run its CHECK command. Never edit files in the FORBIDDEN list.

## Folder ownership

| ALLOWED (only you edit these) | FORBIDDEN (never edit) |
|---|---|
| `backend/app/schemas/` (you write first; others only propose additions) | `backend/app/ml/`, `backend/app/llm/` (Harsh) |
| `backend/app/core/` | `backend/app/api/`, `backend/app/reports/`, `backend/app/main.py`, `backend/app/db.py` (Gaurav) |
| `backend/data/` | `frontend/`, `docker/`, `docker-compose.yml` (Gaurav) |
| `backend/tests/test_core/` | `docs/CONTRACTS.md` (group agreement only) |
| `notebooks/validation.ipynb` | `backend/requirements.txt` — you may ONLY ADD your own lines (numpy, pandas), alphabetical |

## Who depends on you
- Harsh trains ML on the output of your `run_lca()`.
- Gaurav's API calls your `run_lca()`, `compare()`, `compute_mci()`, `list_factors()`.
- That is why **T1–T2 (the stubs) must be pushed on Day 1** — fake numbers are fine; the function signatures unblock everyone.

---

## T1 — Schemas (Day 1, push same day)

Create these files. Copy the code EXACTLY.

**File: `backend/app/__init__.py`** — empty file (just create it)
**File: `backend/app/schemas/__init__.py`** — empty file
**File: `backend/app/core/__init__.py`** — empty file
**File: `backend/tests/__init__.py`** — empty file
**File: `backend/tests/test_core/__init__.py`** — empty file

**File: `backend/app/schemas/scenario.py`**
```python
from typing import Literal, Optional
from pydantic import BaseModel


class Flow(BaseModel):
    name: str                         # e.g. "bauxite", "electricity", "scrap_aluminium"
    quantity: Optional[float] = None  # per functional unit (1 t metal); None = unknown, AI will fill
    unit: str                         # "kg", "kWh", "MJ", "m3", "tkm"
    is_recycled: bool = False
    source: Literal["user", "ai_estimated", "default"] = "user"
    confidence: Optional[float] = None  # 0-1, set by imputer when source == "ai_estimated"


class Stage(BaseModel):
    name: str                         # "mining", "beneficiation", "smelting", "refining", "casting", "transport", "use", "eol"
    inputs: list[Flow] = []
    outputs: list[Flow] = []
    energy: list[Flow] = []
    transport: list[Flow] = []        # unit "tkm", name = mode ("truck", "rail", "ship")


class Scenario(BaseModel):
    id: Optional[str] = None
    name: str
    metal: Literal["aluminium", "steel", "copper"]
    route: str                        # "primary", "recycled", "bf_bof", "eaf", "hybrid"
    region: str = "IN"
    boundary: Literal["cradle_to_gate", "cradle_to_grave"] = "cradle_to_gate"
    functional_unit: str = "1 t metal at gate"
    recycled_content: float = 0.0     # 0-1
    eol_recovery_rate: float = 0.0    # 0-1
    product_lifetime_years: Optional[float] = None
    stages: list[Stage] = []
```

**File: `backend/app/schemas/result.py`**
```python
from typing import Optional
from pydantic import BaseModel


class ImpactValue(BaseModel):
    mean: float
    p05: Optional[float] = None
    p95: Optional[float] = None
    unit: str


class Impacts(BaseModel):
    gwp: ImpactValue            # kg CO2-eq
    energy: ImpactValue         # MJ
    water: ImpactValue          # m3
    acidification: ImpactValue  # kg SO2-eq


class Circularity(BaseModel):
    recycled_content: float
    eol_recovery_rate: float
    mci: float                  # 0-1
    resource_efficiency: float  # t output / t input
    linear_flow_index: float


class Provenance(BaseModel):
    factor_id: str
    source: str
    year: int
    region: str
    uncertainty_gsd: Optional[float] = None


class Result(BaseModel):
    scenario_id: Optional[str] = None
    impacts: Impacts
    per_stage: dict[str, Impacts]
    circularity: Circularity
    provenance: list[Provenance] = []
    ai_estimated_fields: list[str] = []
    monte_carlo_runs: int = 0


class CompareResult(BaseModel):
    baseline: Result
    alternative: Result
    delta_pct: dict[str, float]
    savings_breakdown: dict[str, float]
```

**File: `backend/app/schemas/ml.py`** — copy the `schemas/ml.py` code block from `docs/CONTRACTS.md` section 1 exactly, with these imports at the top:
```python
from typing import Literal, Optional
from pydantic import BaseModel

from .result import CompareResult
from .scenario import Scenario
```
(Change every `X | None = None` in that block to `Optional[X] = None` to match the import style — both work, just be consistent.)

CHECK (from the `backend/` folder, venv active, after `pip install pydantic`):
```
python -c "from app.schemas.scenario import Scenario; print('ok')"
```
Expected: prints `ok`. If "No module named app" — you are not inside the `backend/` folder.

THEN: `git add . && git commit -m "schemas: v1" && git push`, open a PR to main, tell the group.

## T2 — Engine stub (Day 1)

**File: `backend/app/core/lca_engine.py`**
```python
"""Factor-based LCA engine. v1 = stub with plausible hard-coded numbers.
Gaurav's API and Harsh's ML call run_lca() - keep the signature EXACTLY like this."""
from typing import Optional

from app.schemas.result import (
    CompareResult, Circularity, ImpactValue, Impacts, Result,
)
from app.schemas.scenario import Scenario

# plausible GWP per tonne of metal, kg CO2-eq (stub values, replaced in T5)
_STUB_GWP = {
    ("aluminium", "primary"): 17000.0,
    ("aluminium", "recycled"): 900.0,
    ("steel", "bf_bof"): 2200.0,
    ("steel", "eaf"): 700.0,
}


def _iv(value: float, unit: str) -> ImpactValue:
    return ImpactValue(mean=value, unit=unit)


def run_lca(scenario: Scenario, mc_runs: int = 0) -> Result:
    gwp = _STUB_GWP.get((scenario.metal, scenario.route), 5000.0)
    impacts = Impacts(
        gwp=_iv(gwp, "kg CO2-eq"),
        energy=_iv(gwp * 12.0, "MJ"),
        water=_iv(gwp * 0.004, "m3"),
        acidification=_iv(gwp * 0.005, "kg SO2-eq"),
    )
    circ = Circularity(
        recycled_content=scenario.recycled_content,
        eol_recovery_rate=scenario.eol_recovery_rate,
        mci=0.3,
        resource_efficiency=0.8,
        linear_flow_index=0.7,
    )
    return Result(
        scenario_id=scenario.id,
        impacts=impacts,
        per_stage={"total": impacts},
        circularity=circ,
        monte_carlo_runs=0,
    )


def compare(baseline: Scenario, alternative: Scenario, mc_runs: int = 0) -> CompareResult:
    b = run_lca(baseline, mc_runs)
    a = run_lca(alternative, mc_runs)

    def delta(x: float, y: float) -> float:
        return round((y - x) / x * 100.0, 1) if x else 0.0

    savings = {}
    for stage_name, stage_impacts in b.per_stage.items():
        alt_stage = a.per_stage.get(stage_name)
        alt_gwp = alt_stage.gwp.mean if alt_stage else 0.0
        savings[stage_name] = stage_impacts.gwp.mean - alt_gwp

    return CompareResult(
        baseline=b,
        alternative=a,
        delta_pct={
            "gwp": delta(b.impacts.gwp.mean, a.impacts.gwp.mean),
            "energy": delta(b.impacts.energy.mean, a.impacts.energy.mean),
            "water": delta(b.impacts.water.mean, a.impacts.water.mean),
            "mci": round(a.circularity.mci - b.circularity.mci, 3),
        },
        savings_breakdown=savings,
    )


def list_factors(metal: Optional[str] = None):
    return []  # real version in T5
```

**File: `backend/tests/test_core/test_stub.py`**
```python
from app.core.lca_engine import compare, run_lca
from app.schemas.scenario import Scenario


def _scn(metal, route):
    return Scenario(name=f"{metal}-{route}", metal=metal, route=route)


def test_run_lca_returns_result():
    r = run_lca(_scn("aluminium", "primary"))
    assert r.impacts.gwp.mean > 0


def test_recycled_lower_than_primary():
    c = compare(_scn("aluminium", "primary"), _scn("aluminium", "recycled"))
    assert c.delta_pct["gwp"] < 0
```

**File: `backend/pytest.ini`** (create only if it does not exist yet)
```
[pytest]
pythonpath = .
```

CHECK (from the `backend/` folder): `python -m pytest tests/test_core -q` → 2 passed.

Push and PR. **You are done with Day 1 — Harsh and Gaurav are now unblocked.**

## T3 — Factor CSVs (start Day 1, finish Week 1)

**File: `backend/data/factors/common.csv`** — start with this exact content, then extend:
```
factor_id,metal,route,stage,flow_name,unit,gwp_per_unit,energy_per_unit,water_per_unit,acid_per_unit,region,source,year,uncertainty_gsd,notes
grid_IN,any,any,any,electricity,kWh,0.71,9.5,0.0025,0.0032,IN,CEA CO2 Baseline Database v19,2023,1.1,India grid average
grid_WORLD,any,any,any,electricity,kWh,0.48,8.6,0.0020,0.0021,WORLD,IEA 2023,2023,1.1,
diesel,any,any,any,diesel,kg,3.2,45.6,0.0004,0.0250,WORLD,EF 3.1,2022,1.15,combustion incl upstream
natural_gas,any,any,any,natural_gas,MJ,0.065,1.12,0.00002,0.00003,WORLD,EF 3.1,2022,1.1,
truck_tkm,any,any,transport,truck,tkm,0.11,1.7,0.00003,0.00040,WORLD,EF 3.1,2022,1.2,
rail_tkm,any,any,transport,rail,tkm,0.03,0.5,0.00001,0.00010,WORLD,EF 3.1,2022,1.2,
ship_tkm,any,any,transport,ship,tkm,0.011,0.16,0.000005,0.00020,WORLD,EF 3.1,2022,1.2,
```
Then create `aluminium.csv` (bauxite mining, Bayer alumina refining including caustic + thermal energy, anode production, Hall-Heroult electrolysis 13500–15000 kWh per tonne, casting, and the recycled route: scrap collection, shredding, remelting 600–1000 kWh per tonne plus gas) and `steel.csv` (iron ore mining, sinter/pellet, coke, blast furnace, BOF, and EAF route: scrap, EAF electricity ~450 kWh per tonne, electrodes, lime, casting). Target ~40 rows per metal. EVERY row must have source + year + region — you defend these numbers in judging Q&A.

Free sources: US LCI (NREL), EF 3.1 / ELCD, IDEMAT 2024 (TU Delft), IAI aluminium LCI reports, worldsteel LCI, IBM Mineral Yearbook, CEA CO2 Baseline Database, JPC steel stats.

Also write **`backend/data/factors/README.md`**: how each factor was derived, unit conventions, known gaps.

## T4 — Circularity / MCI (Week 1)

**File: `backend/app/core/circularity.py`**
```python
"""Material Circularity Indicator per Ellen MacArthur Foundation methodology."""
from app.schemas.result import Circularity


def compute_mci(
    recycled_content: float,            # Fr: fraction of feedstock from recycled sources (0-1)
    eol_recovery_rate: float,           # Cr: fraction collected for recycling at end of life (0-1)
    lifetime_ratio: float = 1.0,        # X = (L/Lav)*(U/Uav); 1.0 = industry average product
    recycling_efficiency: float = 0.9,  # Ec/Ef: efficiency of the recycling processes
) -> Circularity:
    M = 1.0  # mass of product, normalised
    Fr, Cr, Ef = recycled_content, eol_recovery_rate, recycling_efficiency

    V = M * (1 - Fr)                # virgin feedstock
    W0 = M * (1 - Cr)               # waste to landfill / energy recovery
    Wc = M * Cr * (1 - Ef)          # waste from recycling the product at end of life
    Wf = M * Fr * (1 - Ef) / Ef     # waste generated producing the recycled feedstock
    W = W0 + (Wf + Wc) / 2          # total unrecovered waste

    lfi = (V + W) / (2 * M + (Wf - Wc) / 2)  # Linear Flow Index, 0-1
    F = 0.9 / max(lifetime_ratio, 1e-9)      # utility factor F(X)
    mci = max(0.0, 1.0 - lfi * F)

    total_in = V + (M * Fr / Ef if Ef else 0.0)
    return Circularity(
        recycled_content=Fr,
        eol_recovery_rate=Cr,
        mci=round(mci, 4),
        resource_efficiency=round(M / total_in, 4) if total_in else 0.0,
        linear_flow_index=round(lfi, 4),
    )
```

**File: `backend/tests/test_core/test_circularity.py`** — assert:
- fully linear (`Fr=0, Cr=0`) → `mci` is close to 0.1 (the EMF floor for a fully linear product at X=1)
- fully circular (`Fr=1, Cr=1, recycling_efficiency=1`) → `mci == 1.0`
- for 20 random inputs, `0 <= mci <= 1`

Wire it into the engine: in `run_lca()`, replace the hard-coded `Circularity(...)` with `compute_mci(scenario.recycled_content, scenario.eol_recovery_rate)`.

## T5 — Real factor-based engine (Week 1)

**File: `backend/app/core/factors.py`** — load all CSVs in `backend/data/factors/` with pandas into one DataFrame at import time. Expose:
```python
class FactorNotFound(Exception): ...

def get_factor(flow_name, unit, region, metal, route, stage): ...  # returns one row
def list_factors(metal=None): ...                                  # returns list[Provenance]
```
Matching order inside `get_factor` (first match wins):
1. exact match on (metal, route, stage, flow_name, region)
2. (any, any, any, flow_name, region)
3. same but region = WORLD
4. raise `FactorNotFound` with a message that lists which flow_names ARE available (so debugging is easy).

Then rewrite `run_lca()` in `lca_engine.py` — KEEP the signature:
1. For each stage, for each flow in `stage.inputs + stage.energy + stage.transport`: skip if `flow.quantity is None` (imputation happens before the engine); otherwise find the factor and add `flow.quantity * factor.gwp_per_unit` (same for energy/water/acid).
2. Sum stages → totals. Fill `per_stage`, `provenance` (one entry per distinct factor used), `ai_estimated_fields` (dotted path like `stages[2].energy[0].quantity` for every flow with `source == "ai_estimated"`).
3. `boundary == "cradle_to_gate"` → skip stages named `use` and `eol`; `cradle_to_grave` → include them.
4. Circularity from `compute_mci`.

**Validation tests define "correct".** **File: `backend/tests/test_core/test_validation.py`** — build the 4 seed scenarios (T6) and assert GWP in kg CO2-eq per tonne:

| Scenario | assert gwp.mean between |
|---|---|
| Al primary, region IN | 16000 and 20000 |
| Al recycled | 500 and 1500 |
| Steel BF-BOF | 1900 and 2400 |
| Steel EAF | 400 and 1000 |

If a test fails, your FACTORS or seed quantities are wrong (usually electricity: remember 1 MWh = 1000 kWh) — fix the data, never widen the test.

## T6 — Seed scenarios (Week 1; Harsh and Gaurav need this)

**File: `backend/app/core/seed_scenarios.py`** — `def get_seed_scenarios() -> list[Scenario]` returning the 4 canonical scenarios (Al primary IN, Al recycled IN, steel BF-BOF IN, steel EAF IN) with complete stage/flow quantity lists that match your CSV flow names. Harsh generates training data from these; Gaurav seeds the demo database from them.

## T7 — Monte Carlo (Week 2)

**File: `backend/app/core/montecarlo.py`** — used when `run_lca(scenario, mc_runs=N)` with N > 0:
1. For each factor used, sample N values from a lognormal: `np.random.lognormal(mean=np.log(value), sigma=np.log(gsd))` with gsd from the CSV (default 1.1 if missing).
2. Vectorise with numpy — build one (N x number_of_flows) array; do NOT loop in Python per run.
3. Produce N totals per impact category → `ImpactValue(mean=..., p05=np.percentile(v, 5), p95=np.percentile(v, 95))`.
4. Set `monte_carlo_runs=N`. N=1000 must finish in under 2 seconds.

## T8 — Validation notebook (Week 3)
`notebooks/validation.ipynb`: your outputs vs 8–10 published values (IAI, worldsteel, India-specific studies), one table with % error per row. Export the table into a new file `docs/VALIDATION.md`. This single table is the team's proof of correctness — Gaurav puts it in the README and the pitch.

## T9 — Stretch (Week 4)
Copper CSVs + validation tests; co-product allocation (mass basis) in `core/allocation.py`; factor QA sweep (no duplicate factor_ids, unit sanity, every row has gsd).

## Definition of done
- [ ] T1–T2 pushed on Day 1
- [ ] All 4 seed scenarios inside validation ranges (T5 tests green)
- [ ] `python -m pytest tests/test_core -q` fully green
- [ ] Every factor row has source, year, region, gsd
- [ ] `docs/VALIDATION.md` exists with % errors

## If stuck
- Import errors → run commands from the `backend/` folder; check every package folder has `__init__.py`; check `pytest.ini` exists.
- A number is 1000x off → kWh vs MWh mixup in a CSV or seed scenario.
- Need a new schema field → propose in group chat first, then add it yourself as OPTIONAL with a default so nobody's code breaks.
