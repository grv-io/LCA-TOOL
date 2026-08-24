# DATA SPEC — the mini calculator

Every number the prototype ever shows is defined here. `js/data.js` copies §1–§2, `js/calc.js` implements §3–§6. If a screen shows a number not derivable from this file, that's a bug.

The model is deliberately simple (one blended route + grid formula) but every constant is real and cited — that's what makes it defensible in Q&A.

---

## §1 Constants

**Grid intensity (kg CO₂e per kWh):**

| key | value | label shown in UI |
|---|---|---|
| IN | 0.71 | India (0.71 kg CO₂/kWh) |
| WORLD | 0.48 | World average (0.48) |
| EU | 0.28 | Europe (0.28) |
| renewable mix | 0.04 | (used internally for the renewable slider) |

**Route parameters (per tonne of metal):**

| metal | route | elec_kWh | base_CO2_kg (non-electric) | base_energy_GJ |
|---|---|---|---|---|
| aluminium | primary | 14500 | 6300 | 50 |
| aluminium | recycled | 800 | 350 | 8 |
| steel | bf_bof | 120 | 2100 | 21 |
| steel | eaf | 450 | 380 | 2 |
| copper | primary | 3300 | 1900 | 28 |
| copper | recycled | 900 | 500 | 6 |

Copper values are indicative, from EF 3.1 / IDEMAT ranges (primary Cu ≈ 4.2 t CO₂e/t on the IN grid, recycled ≈ 1.1 t). Copper stage shares: linear 25/30/35/5/5, circular 0/12/72/10/6. Copper is OUTSIDE the current EU CBAM product scope (Reg. 2023/956) — the CBAM card shows a note instead of a cost.

What base_CO2 contains (say this in Q&A): aluminium primary = anode CO₂ + PFC emissions + alumina refining thermal + mining/calcination/transport; steel BF-BOF = coke + blast furnace + BOF, which is why its electricity is small.

**MCI parameters:** recycling process efficiency Ef = 0.9, utility factor X = 1.0 (industry-average product).

## §2 Provenance table (shown on results + report)

| factor | source (link on site) | year | used for |
|---|---|---|---|
| Grid intensity — India | CEA CO₂ Baseline Database v19 | 2023 | IN grid |
| Smelting electricity, PFC & anode | International Aluminium Institute LCI | 2022 | Al primary |
| Alumina refining & mining | EF 3.1 / ELCD | 2022 | Al primary base |
| Remelting route | IDEMAT 2024, TU Delft | 2024 | Al recycled |
| BF-BOF & EAF inventories | worldsteel LCI methodology | 2023 | steel routes |
| Transport factors | EF 3.1 | 2022 | transport line |
| MCI methodology | Ellen MacArthur Foundation, MCI v3 | 2019 | circularity |

Show rows relevant to the active metal + the grid + MCI rows.

## §3 Core formulas (calc.js)

Inputs: `metal`, `region`, `r` = recycled content 0–1, `cr` = end-of-life recovery 0–1, `s` = renewable share 0–1.
Route pair: aluminium → (primary, recycled); steel → (bf_bof, eaf).

```
grid_eff   = grid[region] * (1 - s) + 0.04 * s

gwp_route(route)   = elec_kWh(route) * grid_eff + base_CO2(route)        # kg CO2e / t
energy_route(route)= elec_kWh(route) * 0.0103 + base_energy_GJ(route)    # GJ / t  (0.0103 = primary-energy factor incl. generation losses)

gwp    = (1 - r) * gwp_route(linear) + r * gwp_route(circular)
energy = (1 - r) * energy_route(linear) + r * energy_route(circular)
water  = 0.004 * gwp        # m3 / t   (fixed intensity ratio, EF 3.1 derived)
acid   = 0.005 * gwp        # kg SO2e / t

elec_share = (blended elec_kWh * grid_eff) / gwp     # used by recommendations
```

**Displayed range (uncertainty):** range = p05-p95 from a 1,000-run Monte Carlo, factor gsd 1.1. Each run applies independent lognormal noise to grid factor, electricity use and base_CO2. GWP uses the sampled p05-p95 directly; water and acidification ranges are derived from the GWP samples using their fixed ratios.

**MCI (Ellen MacArthur, X = 1):**
```
V  = 1 - r
W0 = 1 - cr
Wc = cr * (1 - 0.9)
Wf = r * (1 - 0.9) / 0.9
W  = W0 + (Wf + Wc) / 2
LFI = (V + W) / (2 + (Wf - Wc) / 2)
MCI = max(0, 1 - 0.9 * LFI)          # round to 2 dp; chakra spokes = round(MCI * 24)
```

**Stage split for the bar chart (fixed shares of GWP per route):**

| route | Mining | Refining | Smelting/Furnace | Casting | Transport |
|---|---|---|---|---|---|
| al primary | 6% | 24% | 62% | 4% | 4% |
| al recycled | 0% | 10% (sorting) | 74% (remelt) | 10% | 6% |
| bf_bof | 9% | 14% (sinter/coke) | 66% | 6% | 5% |
| eaf | 0% | 8% | 78% | 9% | 5% |
(blend the two route rows by `r`, same as gwp)

## §4 The 4 presets (data.js) + EXPECTED OUTPUTS — verify before demo

Defaults: region IN, s = 0.

| # | preset | r | cr | GWP t CO₂e/t | Energy GJ/t | Water m³/t | Acid kg/t | MCI |
|---|---|---|---|---|---|---|---|---|
| 1 | Aluminium — Primary | 0.00 | 0.15 | **16.6** | **199** | **66** | **83** | **0.16** |
| 2 | Aluminium — Recycled | 1.00 | 0.70 | **0.92** | **16** | **3.7** | **4.6** | **0.83** |
| 3 | Steel — BF-BOF | 0.00 | 0.25 | **2.19** | **22** | **8.7** | **10.9** | **0.20** |
| 4 | Steel — EAF | 1.00 | 0.85 | **0.70** | **6.6** | **2.8** | **3.5** | **0.89** |
| 5 | Copper — Primary | 0.00 | 0.30 | **4.24** | **62** | **17.0** | **21.2** | **0.22** |
| 6 | Copper — Recycled | 1.00 | 0.80 | **1.14** | **15.3** | **4.6** | **5.7** | **0.87** |

Hand-check example (preset 1): 14500 × 0.71 + 6300 = 16,595 kg ≈ 16.6 t ✓. If your build shows anything else, the bug is yours, not the spec's.

**Demo state for compare page** (what we drag to on stage): r = 0.60, cr = 0.55 → GWP **7.2**, MCI **0.59**, delta vs preset 1 = **−9.4 t (−57%)**.

## §5 Sentence templates (fill with computed values, 1 decimal)

- Chakra caption: MCI < 0.3 → `MCI {mci} — a largely linear flow. Raising recovery lifts the score fastest.` · 0.3–0.6 → `MCI {mci} — partly circular. Scrap share is now the biggest lever.` · > 0.6 → `MCI {mci} — a strongly circular flow. Hold recovery high to keep it.`
- Compare human line: `Every 10% more scrap saves about {(gwp_linear - gwp_circular) / 10 / 1000} tonnes of CO₂ per tonne of {metal}.` (Al IN: ≈ 1.6)
- Delta strip: `− {saving} t CO₂e per tonne` + `− {pct}% emissions · MCI {mci_base} → {mci_now}`

## §6 Recommendation rules (max 3 cards, ordered by tonnes saved)

1. **If r < 0.6:** `Lift scrap share to 60%` — `Cuts GWP from {gwp_now} to {gwp_at_r60} t CO₂e/t at current grid intensity.` — priority high
2. **If s < 0.5 and elec_share > 0.4:** `Contract renewable power` — `Electricity is {elec_share}% of your footprint; a 50% renewable PPA removes ~{saving_at_s50} t.` — high if saving > 2 t else medium. (Preset 1: share 62%, saving ≈ 4.9 t)
3. **If cr < 0.7:** `Raise end-of-life recovery` — `Recovery above 70% lifts MCI to {mci_at_cr70} — the strongest circularity lever after scrap.` — medium
4. **Fallback (all good):** `Optimise logistics` — `Your route is near best practice; transport ({transport_pct}%) is the remaining lever.` — medium

## §7 Plain-English matcher (assess page)

Lowercase the text, then:
- metal: contains `alumini`/`aluminum` → aluminium; `steel` → steel
- region: any of `odisha, jharkhand, india, gujarat, rajasthan` → IN; `europe` → EU; else keep current
- route: `recycl`/`scrap charge`/`remelt` → circular route; `blast`/`smelter`/`primary` → linear route
- `scrap {n}%` or `{n}% scrap` (regex the number) → r = n/100
- `solar`/`wind`/`renewab`/`hydro` → s = 0.5; `coal` → s = 0
- Everything matched → green chip; metal or route not found → keep defaults + saffron chip `estimated from library`

## §8 k-NN imputer (assess page, U4)

The "estimated" badges on the assess page use a k-nearest-neighbours model instead of hardcoded confidence percentages:

**Training data:** 500 rows generated by `prototype/scripts/make_training_data.js` using the exact formulas from §3, with ±8% random noise to simulate real-world measurement variation. Stored in `prototype/js/ml_data.js`.

**Features (4-dimensional):**
| Index | Feature | Range | Normalization |
|---|---|---|---|
| 0 | metal (aluminium=1, steel=0) | [0, 1] | identity |
| 1 | recycled content r | [0, 1] | identity |
| 2 | renewable share s | [0, 0.8] | ÷ 0.8 |
| 3 | grid factor | [0.04, 0.92] | (v − 0.04) ÷ 0.88 |

**Algorithm:**
- Distance = Euclidean over normalized features
- k = 7 nearest neighbours
- Prediction = mean of neighbours' `elec` and `thermal` values
- Confidence = `1 − (stddev of neighbours / mean)`, clamped to [0.50, 0.99]

**Behaviour:** Changing metal, route, state grid, or renewable share changes both the predicted value AND its confidence % dynamically. The badge text updates from e.g. `estimated · 91%` to `estimated · 84%` as the user changes inputs. When the user edits a field manually, the badge switches to `you` (unchanged from existing behaviour).

## §9 Benchmarks (U8, "Where you stand" card)

Indicative GWP benchmarks in t CO₂e/t, from IAI / worldsteel / EF 3.1 public summaries. Blend linear/circular by `r`, same as gwp. "best" = world best practice (hydro-powered Al smelters, high-scrap EAF).

| metal | linear india | linear best | circular india | circular best |
|---|---|---|---|---|
| aluminium | 17.8 | 5.5 | 1.0 | 0.5 |
| steel | 2.55 | 1.8 | 0.9 | 0.4 |
| copper | 4.6 | 3.0 | 1.3 | 0.8 |

## §10 Hindi toggle (U7) and scenario library (U9)

- **U7:** `DC.I18N` in data.js maps ~54 static UI strings EN→HI. `ui.js` injects a `हिंदी`/`EN` link into the nav and swaps matching text nodes (reversible; re-applied after dynamic re-renders via MutationObserver). Numbers and dynamic sentences stay in English in v1.
- **U9:** `DC.saveScenario/savedScenarios/loadScenario/deleteScenario` persist up to 20 scenarios in `localStorage` key `dc_saved`. Results page has a "Save scenario" button; the dashboard shows a "Saved scenarios" grid with Load/Delete.
- **Note for U4 (k-NN):** the model is trained on aluminium/steel only. For copper, the assess page falls back to library defaults (no k-NN badge confidence). TODO: regenerate `ml_data.js` with copper rows and 3-way metal encoding.
