# DhatuChakra — Demo Video Script (3 speakers, ~2 min 50 sec)

**Format:** screen recording of the prototype + voiceover. No faces needed (webcam optional in a corner).
**Speakers:** PERSON A (domain & methodology) · PERSON B (AI/ML) · PERSON C (product, drives the mouse).
**Language:** English, simple sentences — reviewers may not be LCA people. One Hindi line at the end.
**Golden rule:** the cursor should already be moving toward the next thing while the current line is being spoken. Never dead screen.

---

## Before recording (checklist — do ALL of these)

- [ ] Open the prototype fresh: clear site data first (F12 → Application → Local Storage → right-click → Clear) so no saved scenarios/Hindi state leak in
- [ ] Browser at 100% zoom, full screen (F11), bookmarks bar hidden, no extra tabs visible
- [ ] Recorder: OBS (free) → 1920×1080, 30 fps, mic tested — record voiceover LIVE while driving, or record screen first and dub after (dubbing is easier, recommended)
- [ ] Do one full silent click-through rehearsal so every page is cached (no loading stutters)
- [ ] Keep this script printed / on a second screen
- [ ] Total target: **under 3:00**. If a take crosses it, cut words, not screens.

---

## THE SCRIPT

### SCENE 1 — The problem (0:00 – 0:25) — PERSON A
**Screen:** landing page `index.html`, slow scroll stops at the 4–6 preset cards.

> "Producing one tonne of aluminium in India emits around sixteen tonnes of CO₂. The same tonne, made from recycled scrap — less than one. But most Indian metal plants can't even measure this. A proper Life Cycle Assessment needs twenty-five plus parameters, paid databases costing four thousand euros a year, and weeks of consultants. So it simply doesn't happen."

*(beat)*

> "We built DhatuChakra to change that. Every tonne, accounted for — हर टन का हिसाब."

### SCENE 2 — Five inputs, or one sentence (0:25 – 1:00) — PERSON B
**Screen:** PERSON C clicks **Start an assessment** → assess page. Types in the smart-entry box:
`aluminium smelter in Odisha, about 40% scrap, mostly coal grid` → clicks **Read my description** → green chips appear, form fills.

> "You don't need to be an LCA expert. Describe your plant in one plain sentence — DhatuChakra reads it: metal, state, scrap share, grid. Watch the chips confirm what it understood."

**Screen:** PERSON C points cursor at the *Electricity use* field and its `estimated · 94%` badge, then drags the **recycled content** slider so the estimate AND confidence visibly change (94% → ~78%).

> "The fields we didn't ask for? Estimated by a real machine-learning model — a k-nearest-neighbours imputer trained on five hundred physics-generated scenarios. And it's honest: watch the confidence drop as we move into an unusual configuration. This is not a hard-coded number — the model genuinely knows when it's less sure."

**Screen:** PERSON C opens the **India state map**, clicks Odisha (0.88), hovers Himachal (0.18) briefly.

> "And because this is built for India — pick your state. A smelter in coal-heavy Odisha and the same smelter in hydro-rich Himachal are two completely different climate stories."

### SCENE 3 — The full picture (1:00 – 1:45) — PERSON A
**Screen:** PERSON C clicks **Compute assessment** → results page. Slow pointer over the 4 KPI cards.

> "One click. Global warming, energy, water, acidification — per tonne, cradle to gate. And every number comes with a range, not false precision: that range is a real one-thousand-run Monte Carlo simulation — here's its histogram."

**Screen:** cursor over the histogram, then the Sankey, then the chakra gauge.

> "The Sankey shows the material story — how much comes from ore, how much from scrap, and how much returns to the loop at end of life. And circularity itself is one score: the Material Circularity Indicator, computed by the Ellen MacArthur method — shown as a chakra. Twenty-four spokes; the greener, the more circular."

**Screen:** scroll to **Where you stand** benchmarks, then **Data provenance** table, then the **CBAM card** — PERSON C changes year 2026 → 2030.

> "Where do you stand against the India average and world best practice? And what does carbon cost in rupees? From 2026, the EU taxes embedded carbon in metal imports. For this plant, exporting ten thousand tonnes: about two crore in 2026 — thirty-five crore by 2030. Every factor behind these numbers is a cited public source — CEA, IAI, worldsteel — listed right here. No black box."

### SCENE 4 — The decision tool (1:45 – 2:25) — PERSON C (speaks while driving)
**Screen:** click **Compare routes** → compare page. Slowly drag **recycled content** 0% → 60%; the delta strip turns green and counts up.

> "This is where it becomes a decision tool, not a report. Watch the numbers as I raise scrap share to sixty percent... nine point four tonnes of CO₂ saved, per tonne of metal — a fifty-seven percent cut, live. Every ten percent more scrap saves about one point six tonnes."

**Screen:** point at the three recommendation cards.

> "And it tells you what to do next — recommendations that cite your own numbers, ranked by impact."

**Screen:** click **Open report** → scroll the report once → click **Save as PDF** (print dialog appears for 1 second, then Esc).

> "Everything exports as an ISO-14044-style report — methodology, sources, limitations included."

### SCENE 5 — Close (2:25 – 2:50) — all three, one line each
**Screen:** back to landing page, cursor rests near the chakra.

> **PERSON A:** "Every number you saw is validated against IAI and worldsteel published ranges — the validation table is in our documentation."
> **PERSON B:** "Everything runs client-side, fully offline — three metals, real ML, real Monte Carlo, Hindi interface. The full build design — Brightway engine, LLM parser — is already written."
> **PERSON C:** "DhatuChakra. हर टन का हिसाब — every tonne, accounted for. Problem statement forty-eight, Smart India Hackathon."

**Screen:** hold the landing page 2 seconds. Cut.

---

## Timing summary

| Scene | Time | Speaker | Screen |
|---|---|---|---|
| 1 Problem | 0:00–0:25 | Person A | Landing |
| 2 Input + AI | 0:25–1:00 | Person B | Assess: sentence → chips → badges → map |
| 3 Results | 1:00–1:45 | Person A | KPIs, histogram, Sankey, chakra, benchmarks, CBAM, provenance |
| 4 Decision | 1:45–2:25 | Person C | Compare sliders, recommendations, report |
| 5 Close | 2:25–2:50 | All | Landing |

## Production tips

- **Record screen and voice separately.** Screen first (follow the actions silently, slightly slower than feels natural), then each person records their lines on a phone in a quiet room, then stitch in CapCut/Clipchamp (both free). Much easier than live takes.
- Mouse movements: slow and deliberate. Move → pause half a second → click. Fast cursors look panicked on video.
- The two "wow" moments are **confidence dropping live (Scene 2)** and **the delta strip counting up (Scene 4)** — give each a full second of silence after the line lands.
- If 2:50 is too long for the portal, cut Scene 3's provenance sentence and Scene 4's report beat → ~2:15.
- Upload unlisted on YouTube → paste the link into the PPT's three `Demo video: <add link>` placeholders and the README.
