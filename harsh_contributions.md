# What We Have Done — Detailed Log

---

## 2026-08-22 — Codebase Study for U4 Implementation

### What was done
- Cloned the `LCA-TOOL` repository from `https://github.com/grv-io/LCA-TOOL.git`
- Created tracking directory (`tracking/`) with `todo.md` and `done.md`
- Performed a complete, thorough read of the entire repository.

---

## 2026-08-22 — U4 Implementation: Real ML Imputer (k-NN)

### Status: ✅ COMPLETE (including corrections)

### What changed

**1. Training data generator** — `scripts/make_training_data.js` (NEW FILE)
- Node.js script that generates 500 physics-grounded training rows
- Uses exact same constants and formulas as `data.js`/`calc.js`
- Random scenarios: metal (50/50), route mix r∈[0,1], renewable s∈[0,0.8], grid factors from all available (national + state)
- Adds ±8% random noise to simulate real-world measurement variation
- Outputs to `prototype/js/ml_data.js` wrapped in an IIFE to avoid `const` redeclaration

**2. Generated training data** — `prototype/js/ml_data.js` (NEW FILE)
- 500 rows, 38.7 KB
- Format: `DC.ML_ROWS = [{metal, r, s, gridFactor, elec, thermal}, ...]`

**3. k-NN imputer function & Backend Integration** — `prototype/js/calc.js` (APPENDED & MODIFIED)
- Added `DC.knnImpute(st)` at the end of the IIFE.
  - 4 features: [metal==aluminium?1:0, r, s, gridFactor], normalized to [0,1]. Min bounds set correctly (gridFactor min = 0.18).
  - Euclidean distance, k=7 nearest neighbours.
  - Returns: `{elec, thermal, confElec, confThermal}` (Confidence = `1 - (stddev/mean)`, clamped [0.50, 0.99]).
- **Backend Sync (Correction):** Updated `DC.compute(st)` and `DC.monteCarlo(st)` to use `DC.knnImpute(st)` estimates by default if no user override is present. This ensures the KPIs on `results.html` are computed mathematically using the ML predictions rather than the naive hardcoded blend.

**4. Assess page integration** — `prototype/assess.html` (4 surgical edits)
- Added `<script src="js/ml_data.js">` after ui.js
- Modified `fillDefaults()`: calls `DC.knnImpute(st)` to get k-NN predictions, uses them for elec/thermal values
- Modified `setBadge()`: for elec/thermal, shows real k-NN confidence (e.g. `estimated · 93%`) instead of hardcoded values. Transport stays at `estimated · 64%`
- Added explanatory note: "Estimates: k-NN model (k=7) over 500 physics-generated scenarios — not hardcoded."

**5. Documentation** — `prototype/DATA_SPEC.md` (APPENDED §8)
- New section documenting k-NN methodology: features, normalization, algorithm, behaviour

### Files touched

| File | Action |
|---|---|
| `scripts/make_training_data.js` | NEW |
| `prototype/js/ml_data.js` | NEW (generated) |
| `prototype/js/calc.js` | APPEND (`knnImpute`) & MODIFY (`compute`, `monteCarlo`) |
| `prototype/assess.html` | MODIFY |
| `prototype/DATA_SPEC.md` | APPEND |

### What was verified
- Node smoke test passed (Dynamic confidence proven).
- Backend computation test passed: `DC.compute` successfully pulls the ~13506 estimate instead of the hardcoded 14500 when calculating KPIs.

### What is still pending
- U5 (GitHub Pages + QR) is next

### Blockers or warnings
- None. Implementation follows the plan exactly.
