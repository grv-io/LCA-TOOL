# PROTOTYPE PLAN — Internal Round

**Goal:** a clickable, beautiful, believable prototype + PPT. NOT a product. Judges see it for ~3 minutes — every decision below is optimized for those 3 minutes.

**Name (FINAL):** **DhatuChakra** (धातु = metal, चक्र = the wheel — circularity + the Ashoka Chakra). Used everywhere, including `PPT_CONTENT.md`.

---

## 1. What the prototype IS and IS NOT

| IS | IS NOT |
|---|---|
| 5 linked HTML pages, opens by double-click, hosted free on GitHub Pages | A backend, an API, a database |
| A mini calculator in ~100 lines of plain JS using REAL published factors (see DATA_SPEC.md) — sliders genuinely compute | Machine learning (the "AI estimate" fields are pre-filled from the same factor table — which is honestly what an imputer's p50 would return) |
| A demo that survives judge questions: every number traceable to a cited source | Auth, saving, multi-user, anything with a server |

**Line we say in the demo (memorize):** "This prototype runs the full calculation methodology client-side on our curated factor dataset. In the full build, the ML layer replaces the lookup defaults with learned estimates and confidence intervals — the architecture for that is already designed." (Then show `docs/archive/` if asked — instant credibility.)

## 2. The 5 screens

| # | File | Purpose | Detail in |
|---|---|---|---|
| 1 | `index.html` | Landing — what/why in 5 seconds + 4 preset scenario cards | SCREENS.md §1 |
| 2 | `assess.html` | New assessment — inputs, sliders, "AI-estimated" badges, plain-English box | SCREENS.md §2 |
| 3 | `results.html` | KPI cards + uncertainty, stage bar chart, Sankey, Chakra MCI gauge, provenance panel | SCREENS.md §3 |
| 4 | `compare.html` | Linear vs Circular side-by-side + live sliders + recommendations | SCREENS.md §4 |
| 5 | `report.html` | Clean printable report → browser Print → "Save as PDF" IS our PDF-export feature | SCREENS.md §5 |

## 3. File structure (when building starts)

```
prototype/
├── index.html  assess.html  results.html  compare.html  report.html
├── css/
│   └── theme.css            # everything from DESIGN.md lives here, CSS variables at top
├── js/
│   ├── data.js              # factor table + 4 presets, copied from DATA_SPEC.md — the ONLY place numbers live
│   ├── calc.js              # formulas from DATA_SPEC.md §3
│   └── ui.js                # DOM wiring, chart drawing, page state via URL params + localStorage
├── assets/
│   ├── chakra.svg           # 24-spoke chakra (stroke only) — logo + MCI gauge base
│   └── flag-band.svg        # 3px tricolor rule used under the header
└── lib/                     # downloaded once, committed: plotly.min.js (Sankey), chart.js (bars)
```
Rule: libraries are DOWNLOADED into `lib/`, not hot-linked from CDN — demo must work offline (hackathon wifi always dies).

## 4. Build approach (single builder — AI-assisted, team reviews)

The whole prototype is built in one go by the AI assistant from these four docs. The team's job is REVIEW, not coding.

Build order (dependencies first):
1. `css/theme.css` — the entire DESIGN.md system as CSS variables + components
2. `js/data.js` + `js/calc.js` — DATA_SPEC.md §1–§7, then verify: browser console `gwp` for preset 1 prints ≈ 16,595
3. `index.html` → `assess.html` → `results.html` → `compare.html` → `report.html` (each fully wired before starting the next)
4. Charts (stage bar, Sankey, chakra gauge) + polish pass with DESIGN.md §7 checklist on every page

Team review checklist (after the build, on each laptop):
- [ ] Open `index.html` by double-click, offline — click through all 5 pages
- [ ] Verify every number on screen against DATA_SPEC.md §4 expected-outputs table
- [ ] Drag every slider — values move smoothly, delta strip updates
- [ ] Type the demo sentence in the smart-entry box — chips appear correctly
- [ ] Ctrl+P on report.html — looks like a document
- [ ] Run DESIGN.md §7 anti-AI-slop checklist on every page

## 5. Timeline

| Step | What | Who |
|---|---|---|
| 1 | Prototype built end-to-end from these docs | AI assistant (one session) |
| 2 | Review on all 3 laptops with the checklist above; list fixes | Whole team, same day |
| 3 | Fix round + GitHub Pages live + screenshots into PPT | AI assistant + Gaurav's account for hosting |
| 4 | Demo rehearsed twice with a timer | Whoever speaks |

## 6. Demo script (2 min 30, rehearse with a timer)

1. **(15s)** Landing page open. "Steel and aluminium plants can't afford LCA — consultants, €4k databases, 25 parameters. DhatuChakra needs 5 inputs."
2. **(30s)** Click preset "Aluminium smelter — Odisha". Show assess page: 5 fields user-filled, rest carry saffron "estimated" badges. Type in the English box: *"aluminium smelter in odisha, 40% scrap"* → fields update.
3. **(45s)** Results: "16.6 tonnes CO₂ per tonne of metal, and here's the range, not just a point estimate." Point at Sankey. Spin the Chakra gauge: "circularity score as the Chakra — 24 spokes, filled by MCI."
4. **(40s)** Compare: drag recycled-content slider 0→60%. "Watch the number — every percent of scrap is 160 kg of CO₂. This is the decision tool." Show recommendation cards.
5. **(20s)** Report page → Ctrl+P → "and the plant walks away with an ISO-14044-style report." Close: "Full build adds the ML imputation layer and India's first open factor database — plan is ready."

## 7. What goes in the PPT from this

- Slide 2 (Idea): hero screenshot of results page
- Slide 3 (Technical): the flow diagram + small screenshot strip of 3 screens
- Slide 4/5: compare-page screenshot with slider mid-drag (shows "working")
- QR code / short link to the GitHub Pages URL on the last slide — judges love scanning it live

## 8. Definition of done
- [ ] All 5 pages open offline from `index.html` by double-click, every nav link works
- [ ] All numbers match DATA_SPEC.md expected-output table exactly
- [ ] Zero visual freestyling — DESIGN.md followed (run its checklist §7 on every page)
- [ ] Live on GitHub Pages; link + QR in PPT
- [ ] Demo rehearsed under 3 minutes, twice, by the person who will speak
