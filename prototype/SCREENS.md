# SCREENS — page-by-page spec with exact copy

Build exactly this. Text in `quotes` goes on screen verbatim (typos included would be your fault — copy carefully). Visual rules come from DESIGN.md; numbers from DATA_SPEC.md.

Shared on every page: header (logo `DhatuChakra धातुचक्र` + nav Assess · Results · Compare · Report), 3px flag-band, footer: `Built for Smart India Hackathon · Problem #48 · Ministry of Mines` + small chakra + `Data sources: IAI · worldsteel · CEA · EF 3.1 · IDEMAT` (each a link to the real site).

State passing between pages: selected scenario + slider values in `localStorage` (`dc_state` JSON). Every page reads it on load; presets write it.

---

## §1 index.html — Landing

**Layout:** hero (60% text left / 40% chakra watermark right), then preset cards row, then "how it works" strip, footer.

**Hero:**
- h1: `हर टन का हिसाब।`
- Sub (h2 weight 400, ink-soft): `Every tonne, accounted for. Life-cycle assessment and circularity scoring for Indian metals — in minutes, not months.`
- Two buttons: primary `Start an assessment` → assess.html · secondary `See a sample result` → results.html with preset 1 loaded
- Under buttons, one quiet line (13.5px, ink-soft): `Aluminium · Steel — cradle-to-gate · MCI · uncertainty included`

**Preset cards (4, one row, clicking any → results.html with that scenario):**
Card = metal name (h3), route line, headline GWP number (from DATA_SPEC expected outputs), and a one-word chip:
1. `Aluminium — Primary` / `Hall-Héroult smelter · Odisha grid` / `16.6 t CO₂e / t` / chip `linear` (navy-wash)
2. `Aluminium — Recycled` / `Scrap remelt route` / `0.92 t CO₂e / t` / chip `circular` (green-wash)
3. `Steel — BF-BOF` / `Blast furnace · integrated plant` / `2.19 t CO₂e / t` / chip `linear`
4. `Steel — EAF` / `Electric arc · scrap charge` / `0.70 t CO₂e / t` / chip `circular`

**"How it works" strip (3 steps, numbered, icons outline-style):**
1. `Describe your process` — `Five inputs, or one plain sentence. Missing values are estimated and clearly marked.`
2. `See the full picture` — `Emissions, energy, water and acidification per tonne — with ranges, stage by stage, source by source.`
3. `Close the loop` — `Drag the scrap slider. Watch the Chakra fill. Get a report you can act on.`

---

## §2 assess.html — New assessment

**Layout:** two columns — form card (left, 62%), "smart entry" card (right, 38%).

**Form card, title `Assessment inputs`:**
- Select `Metal` → Aluminium / Steel
- Segmented control `Route` → (Primary | Recycled) or (BF-BOF | EAF) depending on metal
- Select `Region / grid` → `India (0.71 kg CO₂/kWh)` / `World average (0.48)` / `Europe (0.28)` — show the factor right in the option, judges notice
- Slider `Recycled content` 0–100%, default per preset
- Slider `End-of-life recovery` 0–100%
- Slider `Renewable share in electricity` 0–100%, default 0
- Divider, then small heading `Process detail` + line `Filled from our factor library — edit anything.`:
  - `Electricity use` value field + unit `kWh/t` + badge `estimated · 78%`
  - `Thermal energy` + `MJ/t` + badge `estimated · 71%`
  - `Transport` + `t·km` + badge `estimated · 64%`
  (Values auto-fill from DATA_SPEC when metal/route changes; editing swaps the badge to `you` per DESIGN.md)
- Primary button full-width: `Compute assessment →` → results.html

**Smart entry card, title `Or just describe it`:**
- Textarea placeholder: `e.g. aluminium smelter in Odisha, about 40% scrap, mostly coal grid`
- Button secondary: `Read my description`
- On click: keyword matching fills the form (rules in DATA_SPEC §7). Below, show what was understood as chips: `aluminium ✓` `Odisha → India grid ✓` `scrap 40% ✓`, and for anything not found: chip in saffron-wash `electricity — estimated from library`
- Quiet caption: `In the full build this is an LLM parser; the prototype matches key phrases.` ← keep this line. Honesty on-screen disarms judge questions instantly.

---

## §3 results.html — Results

**Layout:** title row, KPI row (4 cards), then 2/3 + 1/3 grid: charts left, chakra+provenance right.

**Title row:** h2 `Aluminium — Primary · India grid` (from state) + right-aligned: secondary button `Open report` + primary `Compare routes →`

**KPI row (values live from calc.js; these are preset-1 numbers):**
1. `Global warming` — `16.6` `t CO₂e / t` — `p05-p95 14.5 – 19.0 t` — left border saffron
2. `Energy demand` — `199` `GJ / t` — `point estimate` — border navy
3. `Water use` — `66` `m³ / t` — `p05-p95 58 – 76 m³` — border navy
4. `Acidification` — `83` `kg SO₂e / t` — `p05-p95 73 – 95 kg` — border navy

**Charts (left column):**
- Card `Where it comes from` — horizontal stacked bar, GWP by stage: Mining · Refining · Smelting · Casting · Transport (shares in DATA_SPEC §4). Hover shows kg + %.
- Card `Material flow` — Sankey (plotly): Bauxite → Alumina → Aluminium → Product → End of life → (Recycled ↺ back to input | Landfill). Widths from recycled/recovery rates. Recycled link in green, landfill in slate.

**Right column:**
- Card: the **Chakra MCI gauge** (DESIGN §5). Below it one sentence: `MCI 0.16 — a largely linear flow. Raising recovery lifts the score fastest.` (sentence template in DATA_SPEC §5)
- Card `Data provenance`, table 3 cols (Factor · Source · Year): rows from DATA_SPEC §2 for the active route, e.g. `Grid intensity — CEA Baseline v19 — 2023`, `Smelting electricity — IAI — 2022`… Caption: `Every figure above traces to these published factors.`

---

## §4 compare.html — Linear vs Circular

**Layout:** control bar on top, two scenario columns, delta strip between/below, recommendations row.

**Control bar (the demo star — sliders here update BOTH columns live):**
`Recycled content` slider · `End-of-life recovery` slider · `Renewable electricity` slider

**Two columns:** left card `Today — Linear` (locked baseline: preset values, sliders at baseline), right card `With circularity — Yours` (responds to sliders). Each shows: GWP big number, energy, water small, mini chakra gauge (60px).

**Delta strip (center, the money shot):** big number `− 9.4 t CO₂e per tonne` in green when negative (formula: baseline − current), below: `− 57% emissions · MCI 0.16 → 0.59`. And one human line: `Every 10% more scrap saves about 1.6 tonnes of CO₂ per tonne of aluminium.` (auto-computed per DATA_SPEC §5)

**Recommendations row (3 cards, chosen by simple rules in DATA_SPEC §6):**
Each card: title, one rationale sentence that CITES the current numbers, priority chip (`high` saffron-wash / `medium` navy-wash). Example set at 60% scrap:
1. `Lift scrap share to 60%` — `Cuts GWP from 16.6 to 7.2 t CO₂e/t at current grid intensity.` — high
2. `Contract renewable power` — `Smelting electricity is 62% of your footprint; a 50% renewable PPA removes ~4.9 t.` — high
3. `Raise end-of-life recovery` — `Recovery above 70% lifts MCI past 0.6 — the strongest circularity lever after scrap.` — medium

---

## §5 report.html — Printable report

Looks like a document, not a webpage: max-width 800px, white, generous margins, no nav in print (`@media print` hides header/buttons). Sections:

1. Letterhead: chakra + `DhatuChakra — Life Cycle & Circularity Assessment` + date + `Draft for review`
2. `1. Goal & scope` — 3 fixed sentences: functional unit (`one tonne of {metal} at plant gate`), boundary (`cradle-to-gate`), method (`attributional LCA; factors from published inventories; MCI per Ellen MacArthur Foundation methodology v3`)
3. `2. Scenario` — small table of the user's inputs (marking which were estimated)
4. `3. Results` — the 4 KPIs with ranges + stage table
5. `4. Circularity` — MCI number + the chakra gauge + inputs (Fr, Cr)
6. `5. Recommendations` — the 3 current cards as numbered text
7. `6. Data sources & limitations` — provenance table + 2 fixed sentences: `Factors are drawn from public inventories (IAI, worldsteel, CEA, EF 3.1, IDEMAT) and may differ from site-specific measurements. GWP ranges use 1,000-run Monte Carlo sampling across grid, electricity and process-factor uncertainty; water and acidification ranges derive from the same sampled GWP values.`
8. Footer: `Generated by DhatuChakra prototype · Smart India Hackathon · Team {name}`

Button on screen (hidden in print): primary `Save as PDF` → `window.print()`.
