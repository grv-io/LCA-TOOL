# SIH Idea PPT — Slide-by-Slide Content (copy-paste ready)

Template rules (from the official format): max 6 slides including title, points only (no paragraphs), diagrams > text, save as PDF for upload.
Har slide ke liye: COPY section ko as-is paste karo, [DIAGRAM] wala box PPT me bana lo (SmartArt / draw.io).

---

## SLIDE 1 — TITLE PAGE

Fill the template fields exactly:

- **Problem Statement ID:** 48 *(internal list — portal pe official SIH PS ID mile to wahi daalna, e.g. SIH25xxx)*
- **Problem Statement Title:** AI-Driven Life Cycle Assessment (LCA) Tool for Advancing Circularity and Sustainability in Metallurgy and Mining
- **Theme:** Miscellaneous *(portal pe "Smart Automation / Sustainability" option ho to wahi)*
- **PS Category:** Software
- **Team ID:** *(portal se)*
- **Team Name:** *(registered name)*

---

## SLIDE 2 — IDEA TITLE / PROPOSED SOLUTION

**Idea title (top of slide):**
> **DhatuChakra (धातुचक्र) — AI-powered Life Cycle Assessment & Circularity engine for metals**

**Proposed Solution (bullets):**
- Web platform that computes full cradle-to-gate/grave LCA for metals (aluminium, steel) — GWP, energy, water, acidification per tonne
- **Problem it solves:** LCA today needs 25+ process parameters + costly databases (ecoinvent ~€4k/yr) + experts — plants & policymakers skip it entirely
- **AI fills the data gap:** user enters only 5–8 known values → ML predicts the rest **with confidence scores**; every AI-estimated value is visibly flagged
- Plain-English input: "Aluminium smelter in Odisha, 40% scrap, coal-heavy grid" → LLM converts to a structured scenario
- Computes **circularity metrics**: Material Circularity Indicator (Ellen MacArthur formula), recycled content, EoL recovery, resource efficiency
- **Linear vs Circular compare:** side-by-side pathways + live what-if sliders (scrap %, renewable grid %) with instant ML surrogate predictions
- Outputs: Sankey material-flow diagram, uncertainty bands (Monte Carlo), grounded recommendations, ISO 14044-style PDF report

**Innovation & uniqueness (bullets):**
- AI-imputation with confidence + Monte Carlo uncertainty — not a black box; every number traceable to a cited source (provenance drawer)
- India-specific factors (CEA grid, IBM Yearbook) — global tools ignore Indian conditions
- Surrogate model → LCA results in milliseconds instead of expert-weeks
- Free & open data stack — no ecoinvent licence needed

---

## SLIDE 3 — TECHNICAL APPROACH

**Technologies (bullets, left side):**
- **Frontend:** Next.js + TypeScript, Tailwind, Recharts + Plotly (Sankey)
- **Backend:** Python FastAPI, Pydantic; PostgreSQL
- **LCA engine:** factor-based matrix calc (Brightway2.5-ready), EMF MCI methodology
- **AI/ML:** scikit-learn + LightGBM (parameter imputation w/ quantile confidence), surrogate regressor (R² > 0.95, <20 ms), NumPy Monte Carlo (1000 runs)
- **LLM:** Claude API — NL → scenario JSON parsing + recommendation generation
- **Reports:** Jinja2 → WeasyPrint PDF | **Deploy:** Docker, Render + Vercel
- **Data:** US LCI (NREL), EF 3.1, IDEMAT, IAI, worldsteel, IBM Mineral Yearbook, CEA grid DB — all free, all cited

**[DIAGRAM — right side / bottom, make as flow chart]:**
```
User (form / plain English)
        │
        ▼
LLM Parser ──► Partial Scenario (5–8 known values)
        │
        ▼
ML Imputer (fills 25+ params + confidence) 
        │
        ▼
LCA Engine (factor DB × quantities) ──► Monte Carlo (uncertainty)
        │                                      │
        ▼                                      ▼
Circularity (MCI) ◄────────────► Results: GWP | Energy | Water | Acid.
        │
        ▼
Dashboard: Sankey + Compare sliders (surrogate ML) + Recommendations + PDF report
```

---

## SLIDE 4 — FEASIBILITY AND VIABILITY

**Feasibility (bullets):**
- 100% free data sources already identified (US LCI, EF 3.1, IDEMAT, IAI, worldsteel, CEA, IBM Yearbook) — no paid licence blocker
- Validation-first: engine outputs checked against published benchmarks (Primary Al ≈ 16–20, Recycled Al ≈ 0.5–1.5, BF-BOF ≈ 2.2, EAF ≈ 0.6 t CO₂/t) — target <10% error
- Standard proven stack (FastAPI + Next.js + sklearn) — working prototype in 4 weeks, 3-member parallel workflow (engine / ML / product)
- ML needs no big dataset — trained on physics-based synthetic scenarios from our own engine

**Challenges → Strategies (2-column table on slide):**

| Challenge / Risk | Strategy |
|---|---|
| LCI data gaps for Indian plants | Curated 100+ factor table, every row cited (source+year+region); regional fallback chain IN → World avg |
| Wrong numbers = zero credibility | Validation test-suite vs IAI/worldsteel published values runs on every code change |
| AI seen as black box | Confidence score on every estimate + provenance drawer + Monte Carlo bands |
| User input too complex | LLM plain-English entry + AI fills missing fields — only 5–8 inputs needed |
| Scope creep in 36 hrs | v1 locked to Al + steel, 4 impact categories; copper/Brightway as stretch |

---

## SLIDE 5 — IMPACT AND BENEFITS

**Target audience impact (bullets):**
- **Metal producers / MSMEs:** LCA report in minutes vs weeks of consultants — decision support for scrap %, energy sourcing, process routes
- **Ministry of Mines / regulators:** standardized, comparable, auditable sustainability data across plants; supports National Critical Mineral Mission & circular-economy policy
- **Buyers/exporters:** CBAM (EU carbon border tax) readiness — Indian metal exports need exactly these numbers from 2026

**Benefits (grouped bullets):**
- **Environmental:** recycled Al = ~95% less CO₂ than primary — tool quantifies & pushes this shift; identifies hotspot stages for targeted reduction
- **Economic:** avoids €4k+/yr database licences + lakhs in consultant fees; circularity = lower raw-material import dependence
- **Social:** democratizes sustainability analysis for small plants, not just corporates; transparent public-facing methodology builds trust
- **Strategic:** India-first LCI factor database becomes a reusable national asset

*(Optional infographic: 3 icons — Plant → minutes-not-weeks | Govt → comparable data | Planet → −95% CO₂ recycled route)*

---

## SLIDE 6 — RESEARCH AND REFERENCES

- ISO 14040/14044 — LCA principles & framework: iso.org/standard/37456.html
- Ellen MacArthur Foundation — Material Circularity Indicator methodology (v3): ellenmacarthurfoundation.org/material-circularity-indicator
- International Aluminium Institute — LCI data & GHG pathways: international-aluminium.org
- worldsteel — Life Cycle Inventory methodology report: worldsteel.org
- US LCI Database (NREL): lcacommons.gov | EU EF 3.1 / ELCD: eplca.jrc.ec.europa.eu
- IDEMAT 2024, TU Delft — open LCI factors: idematapp.com
- CEA CO₂ Baseline Database v19 (India grid factor): cea.nic.in
- IBM Indian Minerals Yearbook, Ministry of Mines: ibm.gov.in
- EU CBAM regulation (metals carbon reporting): taxation-customs.ec.europa.eu
- NITI Aayog — circular economy strategy papers for metals: niti.gov.in

---

## Design tips (PPT banate waqt)
- Slide 3 ka flow-chart SmartArt/draw.io me banao — text wala ASCII mat paste karna
- Slide 4 ki table 2 columns me, max 5 rows
- Har slide max 6–7 bullets, ek bullet ek line
- Numbers bold karo (95%, <10% error, 5–8 inputs, R² > 0.95) — judges numbers scan karte hain
- Export: File → Save As → PDF (portal sirf PDF leta hai)
- Last "Important Instructions" slide template se delete kar dena
