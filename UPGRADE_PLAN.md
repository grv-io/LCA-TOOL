# UPGRADE PLAN — from "good prototype" to "selected prototype"

Goal: maximize our selection chances in the internal hackathon by adding a few HIGH-IMPACT upgrades to the existing DhatuChakra prototype.
Honesty first: nobody can guarantee 100% selection. But every upgrade below is chosen because it directly hits what judges score: real working tech, India relevance, economic impact, and demo wow-factor.

> NOTE FOR AI ASSISTANTS (including small/weak models): This file is your instruction manual.
> - Do the upgrades in order U1 → U5 first. U6–U9 only if time remains.
> - Each upgrade tells you: WHY, WHICH FILES, STEPS, and a DONE CHECK.
> - Never invent numbers. Every number you need is written in this file or in `prototype/js/data.js` / `prototype/DATA_SPEC.md`.
> - Never change `prototype/js/calc.js` formulas except where this file explicitly says so.
> - Keep Ritesh's current UI style (see `progress ritesh.md`): dense dashboard, `.page-hero`, cards with tricolor accent. Do not redesign.

---

## How judges score (why these upgrades)

| What judges look for | Which upgrade answers it |
|---|---|
| "Is the AI real or just a label?" | U4 (real k-NN ML model in browser) |
| "Is this India-specific or a copied global tool?" | U2 (India state map), U7 (Hindi toggle) |
| "What is the economic impact in rupees?" | U3 (CBAM export-cost calculator) |
| "Is the science real?" | U1 (real Monte Carlo, not a fake ±9%) |
| "Can I try it myself right now?" | U5 (live link + QR code) |
| "Depth beyond 2 metals?" | U6 (copper) |

---

## TIER 1 — do all five (each ≈ one evening)

### U1 — Real Monte Carlo uncertainty (replace the fake ±9%)

**Why:** right now ranges are `value × 0.92 / × 1.09` — a judge who asks "how did you get this range?" breaks us. Real Monte Carlo is ~40 lines of JS and turns the same question into our strongest answer.

**Files:** `prototype/js/calc.js` (add one function), `prototype/js/ui.js` (small histogram), `prototype/results.html` (wire it).

**Steps:**
1. In `calc.js` add `DC.monteCarlo(st, runs)`:
   - For each of `runs = 1000` iterations: multiply each factor by a random lognormal noise. Use gsd = 1.1: `noise = Math.exp(1.1 ? (Math.log(1.1) * gauss()) : 0)` where `gauss()` = standard normal via Box–Muller: `Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random())`.
   - Noise multiplies: grid factor, elec_kWh, base_CO2 (three independent noises).
   - Collect 1000 gwp values. Sort them. Return `{p05: arr[50], p50: arr[500], p95: arr[950], samples: arr}`.
2. In `results.html`: when the page loads, run `DC.monteCarlo(st, 1000)` and show KPI ranges as `p05 – p95` (replace `DC.range()` for GWP; keep ×ratios for water/acid derived from the GWP samples).
3. In `ui.js` add `DC.histogram(el, samples)`: 20 bins, draw as small SVG bars (navy, 120px tall) inside a card titled `Uncertainty (1,000 Monte Carlo runs)` under the KPI row.
4. Update `prototype/DATA_SPEC.md`: replace the ±9% display rule with "range = p05–p95 from 1,000-run Monte Carlo, factor gsd 1.1".

**DONE CHECK:** open results page → histogram card visible; GWP range for preset 1 is roughly 14.5–19 t (it will vary slightly each load — that is correct behavior). Say in demo: "ye range har run me thoda alag hai kyunki ye sach me 1000 simulations hai."

### U2 — India state map for grid selection

**Why:** "Region: dropdown" is generic. An India map you CLICK is instantly memorable, deeply Indian, and technically meaningful (grid intensity varies by state). This will be the screenshot after the chakra.

**Files:** new `prototype/assets/india-map.svg` (get a free SVG map: search "india states svg map wikimedia" — public domain; save locally), `prototype/js/data.js` (state table), `prototype/assess.html` (embed map).

**State grid data — add to data.js exactly this (indicative values derived from CEA v19 national 0.71 + state generation mix; label them "indicative" in UI):**
```
DC.STATE_GRID = {
  "Odisha":        { factor: 0.88, note: "coal-dominant" },
  "Jharkhand":     { factor: 0.91, note: "coal-dominant" },
  "Chhattisgarh":  { factor: 0.92, note: "coal-dominant" },
  "Gujarat":       { factor: 0.62, note: "gas + solar share" },
  "Rajasthan":     { factor: 0.55, note: "high solar share" },
  "Maharashtra":   { factor: 0.72, note: "mixed" },
  "Karnataka":     { factor: 0.45, note: "hydro + solar" },
  "Tamil Nadu":    { factor: 0.58, note: "wind share" },
  "Himachal":      { factor: 0.18, note: "hydro-dominant" },
  "National avg":  { factor: 0.71, note: "CEA v19" },
};
```
**Steps:**
1. Embed the SVG inline in assess.html (right column above the smart-entry card, ~260px tall). Give each listed state's `<path>` an `id`.
2. Color states by factor: green (<0.4), mustard (0.4–0.7), saffron (>0.7) at 45% opacity. Others stay `--line`.
3. Click a state → set `st.stateGrid = factor`, highlight the state with a 2px navy stroke, show a chip: `Odisha — 0.88 kg CO₂/kWh (indicative)`.
4. In `calc.js` `gridEff()`: if `st.stateGrid` exists, use it instead of `DC.GRID[region].factor`. ONE line change.
5. Caption under map: `Indicative state intensities derived from CEA CO₂ Baseline v19 + state generation mix.`

**DONE CHECK:** clicking Odisha vs Himachal changes preset-1 GWP from ≈19.1 t to ≈8.9 t. Demo line: "same smelter, different state — the map shows why plant location is a climate decision."

### U3 — CBAM export-cost calculator (the ₹ number)

**Why:** judges remember money. EU CBAM makes our tool legally necessary for exporters — this card converts CO₂ into rupees.

**Files:** `prototype/js/data.js` (constants), `prototype/compare.html` or `results.html` (one new card).

**Constants (technically correct — cite EU Regulation 2023/956):**
```
DC.CBAM = {
  phaseIn: { 2026: 0.025, 2027: 0.05, 2028: 0.10, 2029: 0.225, 2030: 0.485, 2034: 1.0 },
  etsPriceEUR: 75,          // adjustable slider 50–100 €/t CO2
  eurToInr: 90,             // adjustable
  benchmark: { aluminium: 6.0, steel: 1.8 },  // indicative EU benchmark t CO2e/t; label "indicative"
};
```
**Card UI:** inputs: export tonnes/year (default 10,000), year selector (2026–2030), ETS price slider. Output big number:
`CBAM cost ≈ max(0, gwp_t − benchmark) × phaseIn[year] × etsPriceEUR × eurToInr × tonnes` in ₹ crore (divide by 1e7).
Below in green: `Savings with your circular scenario: ₹X crore/year` (baseline cost − current cost).

**DONE CHECK (hand-verify):** preset 1 (16.6 t), year 2026, 10,000 t, €75, ₹90: (16.6−6.0)×0.025×75×90×10000 = ₹1.79 crore. By 2030 (0.485): ₹34.7 crore. Demo line: "2030 tak ye ek smelter ka ₹35 crore ka sawaal hai — hamara tool isko manage karta hai."

### U4 — Real ML imputer (k-NN, runs in the browser)

**Why:** our biggest vulnerability is "AI is just a label". This makes it real: an actual k-nearest-neighbours model, trained on physics-generated scenarios, predicting missing parameters WITH real confidence. Small, honest, defensible.

**Files:** new `prototype/scripts/make_training_data.js` (node, run once), new `prototype/js/ml_data.js` (generated, ~500 rows), `prototype/js/calc.js` (add `DC.knnImpute`), `prototype/assess.html` (use it for the estimated fields).

**Steps:**
1. Write `make_training_data.js` (node): loop 500 times → random scenario (random metal, route mix r∈[0,1], region, s∈[0,0.8]) → compute elec_kWh/thermal/gwp via existing formulas → add ±8% random noise → write rows to `ml_data.js` as `DC.ML_ROWS = [ {metal, r, s, gridFactor, elec, thermal}, ... ]`.
2. `DC.knnImpute(st)` in calc.js:
   - Features: [metal==aluminium?1:0, r, s, gridFactor] — normalize each to 0–1.
   - Distance = Euclidean. Take k = 7 nearest rows.
   - Prediction = mean of neighbours' `elec` (and `thermal`).
   - Confidence = `1 − (stddev of neighbours / mean)` clamped 0.5–0.99.
3. In assess.html: the "estimated" fields now come from `knnImpute`, and the badge shows the REAL confidence: `estimated · 91%` (changes when metal/route/state changes!).
4. Add one line under the fields: `Estimates: k-NN model (k=7) over 500 physics-generated scenarios — not hardcoded.`

**DONE CHECK:** switching state on the map changes both the estimate AND its confidence %. Demo line: "confidence badal raha hai kyunki model sach me neighbours dekh raha hai — hardcoded nahi hai."

### U5 — Ship it: GitHub Pages + QR code

**Why:** "try it on your phone right now" beats any slide.

**Steps:**
1. Repo → Settings → Pages → Deploy from branch → `main`, folder `/ (root)`. URL becomes `https://grv-io.github.io/LCA-TOOL/prototype/`.
2. Test the URL on a phone. Fix anything broken (paths are already relative — should just work).
3. Generate a QR (any free QR generator) for that URL → save as `prototype/assets/qr.png` → add to PPT slide 2 links box and slide 6.
4. Put the URL in the repo About section and in `README.md`.

**DONE CHECK:** open the QR with a phone camera → prototype loads on mobile data.

---

## TIER 2 — strong differentiators (pick any if time remains)

### U6 — Copper (third metal)
Add to `data.js` ROUTES: `copper: { linear: {key:"primary", elec_kWh: 3300, base_CO2_kg: 1900, base_energy_GJ: 28}, circular: {key:"recycled", elec_kWh: 900, base_CO2_kg: 500, base_energy_GJ: 6}, flowNames: {virgin:"Copper ore", inter:"Concentrate", metal:"Copper"} }` (indicative, from EF 3.1/IDEMAT ranges — primary Cu ≈ 4.2 t CO₂e/t on IN grid, recycled ≈ 1.1 t). Add stage shares (copy steel's), THERMAL_MJ entry, one preset card. DONE CHECK: copper primary IN shows ≈ 4.2 t.

### U7 — Hindi / English toggle
A `भाषा: हिंदी` switch in the header. Implementation: `data.js` gets `DC.I18N = { "Global warming": "ग्लोबल वार्मिंग", ... }` (~40 strings); a function walks elements with `data-i18n` attributes. Ministry-of-Mines context me ye bahut strong signal hai. DONE CHECK: toggle flips all labels; numbers unchanged.

### U8 — Benchmark strip on results
One horizontal bar: `Your plant ▮ 16.6` vs `India average ▮ 17.8` vs `World best practice ▮ 12.0` (Al primary; put India avg/world best per metal-route in data.js, cite IAI). Judges love "where do I stand". DONE CHECK: bar updates when sliders move.

### U9 — Scenario library
`Save scenario` button → localStorage array → dashboard lists saved cards with name + GWP + MCI, click to load. Enables demo story: "plant manager compares 3 investment options". DONE CHECK: save 2 scenarios, refresh browser, both still listed.

---

## DO NOT BUILD (time traps with low judge value)
- Real LLM API calls from the browser (API key leak + wifi risk) — keyword parser + U4 is enough for internal round
- Login/accounts, databases, backend of any kind
- Blockchain, IoT sensors, WebGPU in-browser LLMs
- A mobile app

## Pitch upgrades (zero code, do in parallel)
1. **1-page methodology handout** (print 5 copies): formulas, factor table with citations, validation table. Hand it to judges — nobody else will have one.
2. **Demo video (90 sec)** recorded on the live URL — link in PPT (already placeholdered).
3. **Q&A drill**: each teammate answers these 5 aloud twice: Where do factors come from? How is MCI computed? What does the confidence % mean? Why is this India-specific? What's the full-build plan? (Answers: DATA_SPEC.md, EMF formula in calc.js, U4 k-NN stddev, U2 map + CEA + CBAM, docs/archive/.)

## Suggested order (2 people can parallelize)
| Evening | Person A | Person B |
|---|---|---|
| 1 | U1 Monte Carlo | U3 CBAM card |
| 2 | U4 k-NN imputer | U2 India map |
| 3 | U5 deploy + QR | U8 benchmark or U6 copper |
| 4 | Polish + mobile test | Handout + video + Q&A drill |
