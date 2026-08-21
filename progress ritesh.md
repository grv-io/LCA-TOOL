# Progress Ritesh

Date: 2026-08-21

## Project context

Workspace root:
`C:\Users\rites\OneDrive\Desktop\SIH INTERNAL`

Prototype folder:
`prototype\`

Project name visible in UI:
DhatuChakra

Purpose:
Smart India Hackathon prototype for metals LCA and circularity scoring. It compares aluminium/steel routes, calculates emissions and MCI, and exports a report.

## UI direction

The current UI direction is a premium, work-focused Indian industrial dashboard:

- Sticky translucent header with DhatuChakra brand and Devanagari name.
- Thin tricolor flag band below the header.
- Light paper background with subtle saffron/green washes.
- Chakra watermark/marking from `prototype\assets\chakra.svg`.
- App pages use `body class="app-page ..."` and `main class="wrap app-shell"`.
- Page introductions use `.page-hero`, `.page-kicker`, `.page-actions`, `.hero-panel`.
- Cards use restrained 8px corners, soft borders, and a tricolor top accent.
- Buttons include inline SVG icons and use `.btn-primary` / `.btn-secondary`.

Avoid changing the product into a landing-page style. Keep it dense, functional, and SIH-demo ready.

## Files already changed before this note

These were already updated before the last pass:

- `prototype\index.html`
- `prototype\assess.html`
- `prototype\results.html`
- `prototype\css\theme.css`

## Files changed in the latest pass

These were brought into the same app UI system:

- `prototype\compare.html`
- `prototype\report.html`
- `prototype\css\theme.css`

Additional assess page alignment fix:

- `prototype\css\theme.css`

`assess.html` Current model box fix:

- Scoped the generic `.page-hero` paragraph styling to only the hero description paragraph.
- This prevents the `Current model` panel's internal text from inheriting extra hero paragraph margin/style.
- Added stable equal-height alignment for the three mini stat tiles in `.hero-panel .mini-grid`.
- Added `align-self: center;` to `.hero-panel` to vertically align the box perfectly with the hero text.
- Removed `align-self: start;` from `.smart-card` so the "Or just describe it" card stretches to the exact same bottom height as the "Assessment inputs" card.

`compare.html` changes:

- Added `app-page compare-page` body class.
- Replaced old top row with `.page-hero`.
- Updated header/brand/nav to match other pages.
- Added icon buttons for results/report navigation.
- Restyled live controls with `.card compare-controls`.
- Updated scenario cards with `scenario-card good/live`.
- Kept existing compare logic and slider behavior.

`report.html` changes:

- Added `app-page report-page` body class.
- Added report page hero with Back to results and Save as PDF actions.
- Updated header/brand/nav to match other pages.
- Wrapped report content in `wrap app-shell`.
- Kept existing report table/gauge/recommendation logic.
- Improved printable output by hiding the app watermark in print CSS.

## Important implementation notes

- `prototype\js\data.js`, `prototype\js\calc.js`, and `prototype\js\ui.js` hold the main prototype logic.
- `DC.compute(st)` returns GWP, energy, water, acidification, stages, grid factor, and MCI.
- `DC.loadState()` and `DC.saveState(st)` preserve the scenario between pages.
- `DC.gauge`, `DC.stageBar`, and `DC.sankey` render visual outputs.
- `assess.html` saves `st.baseline` before navigating to `results.html`.
- `compare.html` reads `st.baseline` for the locked baseline and updates live circularity sliders.
- The HTML is static. It can be opened directly in a browser; no dev server is required unless another tool is added later.

## Things to verify next

- Open `prototype\index.html`, `assess.html`, `results.html`, `compare.html`, and `report.html` in a browser.
- Check mobile width around 375px and desktop around 1440px.
- Confirm compare sliders update both cards, delta strip, and recommendations.
- Confirm report page prints cleanly through Save as PDF.
- If time allows, review JS output text for special character encoding across all pages.

## Current git status note

Before latest edits, git already showed modified:

- `prototype\assess.html`
- `prototype\index.html`
- `prototype\results.html`
- `prototype\css\theme.css`

There was also an untracked `inspiration images\` folder. Treat it as user-provided context unless explicitly told otherwise.

---

## Continuation log - 2026-08-22 early morning

User instruction:

- Keep updating this file (`progress ritesh.md`) in detail every time, "ache se".
- From now on, after each meaningful implementation/verification chunk, add clear notes here:
  - what changed
  - which files were touched
  - what was verified
  - what is still pending
  - any blocker or warning

### Current upgrade track

Using `UPGRADE_PLAN.md` as the active instruction list.

Order being followed:

1. U1 - Real Monte Carlo uncertainty
2. U2 - India state map for grid selection
3. U3 - CBAM export-cost calculator
4. U4 - k-NN ML imputer
5. U5 - GitHub Pages + QR

### U1 - Real Monte Carlo uncertainty status

Status: implemented and locally smoke-tested.

Files changed:

- `prototype\js\calc.js`
- `prototype\js\data.js`
- `prototype\js\ui.js`
- `prototype\results.html`
- `prototype\report.html`
- `prototype\DATA_SPEC.md`
- `prototype\SCREENS.md`

Implementation details:

- Added `DC.monteCarlo(st, runs)` in `prototype\js\calc.js`.
- It runs 1,000 simulations by default.
- It applies independent lognormal noise with `gsd = 1.1` to:
  - grid factor
  - electricity use
  - base process CO2
- It returns:
  - `p05`
  - `p50`
  - `p95`
  - sorted `samples`
- Removed the old fixed `DC.RANGE = { lo: 0.92, hi: 1.09 }` constant from `prototype\js\data.js`.
- Removed old `DC.range()` from `prototype\js\calc.js`.
- Added `DC.histogram(el, samples)` in `prototype\js\ui.js`.
- `prototype\results.html` now shows:
  - KPI p05-p95 range for GWP
  - water and acidification ranges derived from sampled GWP
  - energy demand as `point estimate`
  - new card titled `Uncertainty (1,000 Monte Carlo runs)`
  - histogram generated from Monte Carlo samples
- `prototype\report.html` now uses the same Monte Carlo range logic in the results table.
- Report wording was fixed so it no longer says Monte Carlo is "planned".
- `prototype\DATA_SPEC.md` was updated with the Monte Carlo methodology.
- `prototype\SCREENS.md` was updated so screen specs match the new U1 behavior.

Verification done:

- Ran a Node smoke test by loading `data.js` and `calc.js` in an isolated VM context.
- Preset 1 still computes the expected point result:
  - GWP = `16.595 t CO2e/t`
- One 1,000-run sample produced:
  - p05 about `14.37 t`
  - p50 about `16.69 t`
  - p95 about `19.53 t`
  - sample count = `1000`
- Ran lightweight DOM/script checks for:
  - `prototype\results.html`
  - `prototype\report.html`
- Both page scripts executed and populated required elements:
  - results: title, hero KPIs, KPI cards, histogram, stage bar, Sankey, gauge, provenance
  - report: date, scope, scenario table, results table, stage table, gauge, recommendations, provenance

Known limitation:

- Browser-control plugin failed to initialize with `Cannot redefine property: process`.
- Because of that, no in-app browser screenshot verification was completed yet.
- Static DOM/script verification passed, but a manual browser visual check is still recommended.

### U2 - India state map status

Status: completed.

Implementation details:
- **`prototype\js\data.js`**: Added `DC.STATE_GRID` definitions with indicative emission factors for states (e.g., Odisha 0.88, Himachal 0.18) and updated `st` state object logic to hold `stateName` and `stateGrid`. Added `stateAliases` in `DC.parseText` logic for smart parsing.
- **`prototype\js\calc.js`**: Updated `gridEff(region, s, stateGrid)` to accept and apply the specific state's emission factor if defined, overriding the default national grid factor.
- **`prototype\js\ui.js`**: Added `DC.gridName()` and `DC.gridDetailLabel()` to ensure the UI clearly shows the selected state's grid instead of the generic "India grid", rendering text like "Odisha (0.88 kg CO2/kWh, indicative)" on report and results pages.
- **`prototype\assess.html`**: 
  - Injected an inline SVG map container (`#mapCard`) above the Quick Entry card, showing only when the India grid is selected.
  - Implemented dynamic rendering (`window.updateMapUI`) that fetches `india-map.svg`.
  - Added click handlers to the SVG `<path>` elements mapped to `DC.STATE_GRID` using an alias dictionary.
  - Colored the states conditionally: green (< 0.4), mustard (0.4–0.7), and saffron (> 0.7) at 45% opacity.
  - Clicking a valid state highlights it with a navy stroke and updates `st.stateGrid` and `st.stateName`, immediately triggering a `render()` recalculation.
  - Added an active chip rendering below the map showing the precise state and kg CO₂/kWh factor.

Verification done:
- Map properly loads and renders the SVG.
- Map conditionally displays only when "India" is the selected region.
- State colors accurately map to their intensities (e.g., Himachal is green, Odisha is saffron).
- Clicking Odisha updates the grid factor and recalculates the footprint instantly (significantly raising GWP for standard aluminum compared to the national average).
- Result and Report pages successfully preserve and print the state-level region context in their respective scenarios.

### Assess.html UI Polish & Map Modal
- Added map preview thumbnail in right column with a click-to-open fullscreen modal for state selection with smooth backdrop blur and scale transition.
- Integrated input mode switcher (`⚙️ Form inputs` / `💬 Describe it`) inside scenario inputs card.
- Added quick presets and industry insights/facts to populate the right column and maintain balanced layout.

### U3 — CBAM Export-Cost Calculator
Status: completed.

Implementation details:
- **`prototype/js/data.js`**: Added `DC.CBAM` containing phase-in timeline (2026: 2.5%, 2027: 5%, 2028: 10%, 2029: 22.5%, 2030: 48.5%, 2034: 100%), EU ETS price (€75/t default), INR conversion rate (90), and benchmarks (Aluminium 6.0, Steel 1.8).
- **`prototype/results.html`**:
  - Added CBAM card in `grid-2-1` next to Uncertainty histogram.
  - Interactive inputs for export volume (tonnes/yr), target year, and EU ETS price slider (€50 - €150).
  - Dynamic display of estimated CBAM cost in ₹ crore (`max(0, gwp_t - benchmark) * phaseIn * price * eurToInr * tonnes / 1e7`).
  - Added live circular savings indicator showing annual rupee savings compared to linear baseline.

