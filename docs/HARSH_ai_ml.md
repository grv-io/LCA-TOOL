# HARSH — AI/ML & LLM

**Mission:** make the "AI" in the project title real, not decoration. Every AI output must be visible, flagged, and carry a confidence value.
**Branch:** `harsh-ml` (see docs/GIT_WORKFLOW.md)

> NOTE FOR AI ASSISTANTS: do the tasks in order (T1, T2, ...). Each task names the exact file and gives full code or a precise template. Run each CHECK before moving on. Never edit files in the FORBIDDEN list.

## Folder ownership

| ALLOWED (only you edit these) | FORBIDDEN (never edit) |
|---|---|
| `backend/app/ml/` | `backend/app/core/`, `backend/data/`, `backend/app/schemas/` (Ritesh) |
| `backend/app/llm/` | `backend/app/api/`, `backend/app/reports/`, `backend/app/main.py`, `frontend/`, `docker/` (Gaurav) |
| `backend/tests/test_ml/` | `docs/CONTRACTS.md` (group agreement only) |
| `notebooks/ml_*.ipynb` | `backend/requirements.txt` — ONLY ADD your lines (anthropic, lightgbm, scikit-learn, xgboost), alphabetical |

## What you depend on
- Ritesh's schemas (`backend/app/schemas/`) and `run_lca()` — use his Day-1 STUB until the real engine lands end of Week 1. The stub is enough to build your whole pipeline; re-run training when the real engine merges.
- Your functions are called by Gaurav's API. The exact signatures are in `docs/CONTRACTS.md` section 2 — never change them.

---

## T1 — Stubs (Day 1–2, push immediately so Gaurav can wire routes)

Create empty `__init__.py` files in: `backend/app/ml/`, `backend/app/llm/`, `backend/tests/test_ml/`.

**File: `backend/app/ml/imputer.py`** (stub)
```python
"""Parameter gap-filling. v1 stub: fills missing quantities with fixed defaults."""
from app.schemas.ml import ImputeRequest, ImputeResponse

# very rough defaults per (metal, route, flow_name); real model replaces this in T3/T4
_DEFAULTS = {
    ("aluminium", "primary", "electricity"): 14000.0,   # kWh per t
    ("aluminium", "recycled", "electricity"): 800.0,
    ("steel", "eaf", "electricity"): 450.0,
    ("steel", "bf_bof", "electricity"): 120.0,
}


def impute(req: ImputeRequest) -> ImputeResponse:
    scenario = req.scenario.model_copy(deep=True)
    filled = []
    for si, stage in enumerate(scenario.stages):
        for group_name in ("inputs", "energy", "transport"):
            flows = getattr(stage, group_name)
            for fi, flow in enumerate(flows):
                if flow.quantity is None:
                    key = (scenario.metal, scenario.route, flow.name)
                    flow.quantity = _DEFAULTS.get(key, 1.0)
                    flow.source = "ai_estimated"
                    flow.confidence = 0.5
                    filled.append(f"stages[{si}].{group_name}[{fi}].quantity")
    return ImputeResponse(scenario=scenario, filled_fields=filled)
```

**File: `backend/app/ml/surrogate.py`** (stub)
```python
"""Instant what-if predictions. v1 stub: simple linear-ish formula; real model in T5."""
from app.schemas.ml import SurrogateRequest, SurrogateResponse

_BASE_GWP = {
    ("aluminium", "primary"): 17000.0,
    ("aluminium", "recycled"): 900.0,
    ("steel", "bf_bof"): 2200.0,
    ("steel", "eaf"): 700.0,
}


def surrogate_predict(req: SurrogateRequest) -> SurrogateResponse:
    base = _BASE_GWP.get((req.metal, req.route), 5000.0)
    # more recycled content and greener grid -> lower gwp (rough stub logic)
    gwp = base * (1 - 0.9 * req.recycled_content) * (1 - 0.5 * req.grid_renewable_share)
    mci = min(1.0, 0.1 + 0.5 * req.recycled_content + 0.4 * req.eol_recovery_rate)
    return SurrogateResponse(gwp=round(gwp, 1), energy=round(gwp * 12, 1),
                             water=round(gwp * 0.004, 3), mci=round(mci, 3))
```

**File: `backend/app/llm/parse_input.py`** (stub — real Claude call in T6)
```python
"""Natural-language -> Scenario. v1 stub returns a fixed aluminium scenario."""
from app.schemas.ml import ParseRequest, ParseResponse
from app.schemas.scenario import Flow, Scenario, Stage


def parse_text(req: ParseRequest) -> ParseResponse:
    scenario = Scenario(
        name="Parsed scenario (stub)",
        metal="aluminium",
        route="primary",
        region="IN",
        stages=[Stage(name="smelting",
                      energy=[Flow(name="electricity", quantity=None, unit="kWh")])],
    )
    return ParseResponse(scenario=scenario,
                         warnings=["stub parser - not a real LLM call yet"])
```

**File: `backend/app/llm/recommend.py`** (stub)
```python
from app.schemas.ml import Recommendation, RecommendRequest, RecommendResponse


def recommend(req: RecommendRequest) -> RecommendResponse:
    gwp_delta = req.compare.delta_pct.get("gwp", 0.0)
    return RecommendResponse(recommendations=[
        Recommendation(
            title="Increase recycled scrap share",
            rationale=f"The alternative pathway changes GWP by {gwp_delta}% - "
                      "raising scrap share moves you toward it.",
            estimated_gwp_reduction_pct=abs(gwp_delta),
            priority="high",
        ),
        Recommendation(
            title="Source renewable electricity (PPA)",
            rationale="Electricity dominates smelting impacts in the baseline.",
            priority="medium",
        ),
    ])
```

CHECK (from `backend/`): `python -c "from app.ml.imputer import impute; from app.llm.parse_input import parse_text; print('ok')"` → `ok`.
Push, PR to main, tell the group. **Gaurav is now unblocked.**

## T2 — API key + design (Day 2–3)

1. Get an Anthropic API key (console.anthropic.com). Put it ONLY in `backend/.env` as `ANTHROPIC_API_KEY=...`. Never in code, never in the frontend, never committed.
2. Add `anthropic` to `backend/requirements.txt` (alphabetical), `pip install anthropic python-dotenv`.
3. Write `backend/app/ml/DESIGN.md`: list the ~25 parameters the engine needs, mark the 5–8 a real user knows (metal, route, region, recycled %, plant scale), everything else = imputer's job. Ask Ritesh which parameters move the result most.
4. Read once: EMF MCI methodology summary, Anthropic structured-output docs.

## T3 — Synthetic training data (Week 1)

**File: `backend/app/ml/synth.py`**
1. `sample_config(rng)` → dict with random-but-plausible values: metal, route, region (IN/WORLD/EU), recycled_content 0–1, ore grade, plant scale, electricity intensity within the physical range for that route, transport distances, eol_recovery 0–1. Get the ranges from Ritesh's CSVs/DESIGN.md.
2. `build_scenario(config)` → a full `Scenario` object.
3. `generate(n=10000)` → for each config call `run_lca()` (Ritesh's engine — stub now, real later), collect `inputs + outputs` into a flat row, add ~5% random noise to targets so models do not overfit a deterministic engine, save to `backend/app/ml/data/synth_v1.parquet` (add `backend/app/ml/data/` to `.gitignore` — regenerate instead of committing).
4. Make it runnable: `python -m app.ml.synth` from `backend/`.

Re-run this the day Ritesh's real engine merges.

## T4 — Imputer (Week 1 baseline, Week 2 v2)

- v1: `sklearn.impute.IterativeImputer` over the flat parameter matrix from T3. Wire it into `impute()` replacing the `_DEFAULTS` dict: flatten the known values of the incoming scenario, impute the missing ones, write them back with `source="ai_estimated"`.
- v2 (Week 2): one LightGBM regressor per target parameter with quantile objectives (alpha 0.1, 0.5, 0.9). Prediction = p50; `confidence = max(0.0, min(1.0, 1 - (p90 - p10) / max(p50, 1e-9)))`.
- Persist models with joblib into `backend/app/ml/artifacts/` (gitignored; share via Drive). Loader caches models in memory at first call.
- **File: `backend/tests/test_ml/test_imputer.py`**: hide 40% of fields on held-out rows, impute, compute MAPE per field; assert imputed scenarios have no `quantity is None` left and all filled flows are flagged. Log MAPE numbers into `backend/app/ml/EVAL.md`.

## T5 — Surrogate model (Week 2)

- Train `GradientBoostingRegressor` (or LightGBM) mapping (metal, route one-hot, region one-hot, recycled_content, grid_renewable_share, ore_grade, eol_recovery_rate) → (gwp, energy, water, mci) on T3 data.
- Targets: R² > 0.95 vs the engine on held-out rows; single prediction < 20 ms (Gaurav wires this to live sliders).
- Replace the stub in `surrogate_predict()`; persist to `artifacts/surrogate/`.
- Write the R² per target into `EVAL.md` — this number goes in the demo.

## T6 — Real LLM parser with Claude (Week 2)

**File: `backend/app/llm/prompts/parse_scenario.txt`**
```
You extract a metallurgy LCA scenario from the user's text.
Return ONLY a JSON object matching the schema below. No markdown, no explanation.
Rules:
- Values the user did not state -> null. NEVER invent numbers.
- metal must be one of: aluminium, steel, copper.
- route: primary/recycled for aluminium, bf_bof/eaf for steel.
- region: 2-letter ISO code (India -> IN).
JSON schema:
{schema}
```

**File: `backend/app/llm/parse_input.py`** (replace the stub; keep the function name)
```python
import json
import os

from anthropic import Anthropic
from dotenv import load_dotenv

from app.schemas.ml import ParseRequest, ParseResponse
from app.schemas.scenario import Scenario

load_dotenv()
_client = Anthropic()  # reads ANTHROPIC_API_KEY from environment
_MODEL = "claude-opus-5"

_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "prompts", "parse_scenario.txt")
with open(_PROMPT_PATH, encoding="utf-8") as f:
    _SYSTEM = f.read().replace("{schema}", json.dumps(Scenario.model_json_schema()))


def _extract_json(text: str) -> str:
    """Strip markdown fences if the model added them."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return text.strip()


def _call(messages) -> str:
    resp = _client.messages.create(
        model=_MODEL, max_tokens=4096, system=_SYSTEM, messages=messages,
    )
    if resp.stop_reason == "refusal":
        raise ValueError("model declined the request")
    return "".join(b.text for b in resp.content if b.type == "text")


def parse_text(req: ParseRequest) -> ParseResponse:
    messages = [{"role": "user", "content": req.text}]
    raw = _call(messages)
    warnings: list[str] = []
    try:
        scenario = Scenario.model_validate_json(_extract_json(raw))
    except Exception as err:  # one retry, feeding the validation error back
        messages += [
            {"role": "assistant", "content": raw},
            {"role": "user", "content": f"That JSON failed validation: {err}. "
                                        "Return ONLY corrected JSON."},
        ]
        raw = _call(messages)
        scenario = Scenario.model_validate_json(_extract_json(raw))
        warnings.append("parser needed one retry")
    return ParseResponse(scenario=scenario, warnings=warnings)
```

**File: `backend/tests/test_ml/test_parser_manual.py`** — mark with `@pytest.mark.skipif(not os.getenv("ANTHROPIC_API_KEY"), reason="needs key")`. Try 10 messy inputs ("Aluminium smelter in Odisha, 40% scrap, coal heavy grid", "EAF plant in Gujarat mostly solar", ...) and assert metal/route/region come out right and unstated quantities are None.

## T7 — Grounded recommendations (Week 3)

- **File: `backend/app/llm/prompts/recommend.txt`**: input is the `CompareResult` JSON; output is a JSON list of 3–6 recommendations matching the `Recommendation` schema; every `rationale` MUST quote at least one number from the input.
- In `recommend()`: call Claude the same way as T6 (system prompt + JSON validate + one retry). Post-check: if a rationale contains no digit that appears in the input JSON, drop that recommendation.
- Deterministic fallback: if the API call fails (no key, network), return the T1 stub recommendations — the app must never 500 because of the LLM.
- Cache responses in memory keyed by hash of the request JSON (same compare → same answer, no repeated cost).

## T8 — Evaluation + robustness (Week 4)

- Finalize `backend/app/ml/EVAL.md`: imputer MAPE per field, calibration check (do ~80% of true values fall inside the p10–p90 interval?), surrogate R² per target, parser accuracy on your 10 test inputs, recommendation groundedness rate. Gaurav puts the headline numbers in the README and pitch.
- Robustness tests: empty text, non-metal text ("write me a poem"), absurd values (negative quantities, 100x range) → clean Python exceptions with messages, never a crash deep inside sklearn.
- Latency: `impute` and `surrogate_predict` under 100 ms after warm-up.

## Definition of done
- [ ] T1 stubs pushed by Day 2
- [ ] Imputer v2 + surrogate trained, persisted, loaded lazily; stubs fully replaced
- [ ] Parser + recommender run on real Claude API with validation retry and fallback
- [ ] Every AI-filled field carries `source="ai_estimated"` + confidence
- [ ] `EVAL.md` filled with real numbers
- [ ] `python -m pytest tests/test_ml -q` green (API tests skip without a key)

## If stuck
- `anthropic.AuthenticationError` → `ANTHROPIC_API_KEY` missing from `backend/.env` or venv not loaded; check `load_dotenv()` runs.
- Model returns prose instead of JSON → your system prompt was not applied; verify `_SYSTEM` is passed as `system=`, not inside messages.
- Imputer worse than defaults → your synthetic ranges are unrealistic; re-check them against Ritesh's CSVs.
- Need a schema change → group chat first; only optional fields with defaults.
