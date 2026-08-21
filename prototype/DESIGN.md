# DESIGN — DhatuChakra visual system

Light, warm, unmistakably Indian, and human-made. Every value here is final — builders copy, never improvise. If something isn't specified, choose the QUIETER option.

---

## 1. The idea behind the look

Not "startup SaaS", not "government portal PDF". The reference feeling: **a well-designed Indian science museum exhibit** — warm paper white, confident saffron, disciplined navy ink, green used only where something is genuinely good. The Ashoka Chakra is the brand: a 24-spoke wheel = circular economy. We earn the tricolor through small, precise touches — never by painting the screen orange-white-green.

## 2. Color palette (CSS variables — this exact block goes at the top of theme.css)

```css
:root {
  /* Paper & ink */
  --paper:      #FBF8F3;   /* page background — warm off-white, never pure #FFF */
  --card:       #FFFFFF;   /* cards sit slightly brighter than the page */
  --ink:        #1C2B3A;   /* primary text — deep blue-ink, NOT black */
  --ink-soft:   #5A6B7B;   /* secondary text */
  --line:       #E7E0D5;   /* borders, dividers — warm, visible, thin */

  /* Tricolor, tuned for UI */
  --saffron:      #E86A17; /* primary action, highlights, "estimated" badges */
  --saffron-deep: #B84E0A; /* hover, text-on-light needing contrast */
  --saffron-wash: #FCEFE3; /* soft fill behind saffron elements */
  --green:        #17803D; /* ONLY for good outcomes: savings, low emissions, high MCI */
  --green-wash:   #E9F4EC;
  --navy:         #24466E; /* chakra blue — links, chart axis, secondary buttons */
  --navy-wash:    #EBF1F7;

  /* Data (charts only) */
  --bad:        #C03D2E;   /* high-emission bars/deltas — brick red, not neon */
  --neutral-1:  #C9A227;   /* mustard — 3rd chart series */
  --neutral-2:  #7B8B99;   /* slate — 4th chart series */
}
```

**Usage discipline (this is what makes it look designed, not generated):**
- 90% of any screen = `--paper`, `--card`, `--ink`, `--line`. Saffron appears in perhaps 5 places per screen, green in 1–3, only where meaning demands it.
- Green is NEVER decorative. Green = "this is environmentally better". Saffron = "act here / AI touched this". Navy = structure and calm.
- Red only on numbers that got worse. Never red buttons.

## 3. Gradients — the "human" rules

AI-slop gradients are loud, purple, and diagonal across whole screens. Ours are almost invisible:

| Allowed | Spec |
|---|---|
| Hero wash (index page only) | `linear-gradient(180deg, #FDF3E7 0%, #FBF8F3 55%)` — a morning-light warmth fading into paper within the first screen height |
| Card hover lift | no gradient — just shadow deepen + 1px saffron border |
| Tricolor | ONLY as `flag-band.svg`: a 3px horizontal rule (saffron/white/green, equal thirds) under the site header and above the footer. Nowhere else. |
| KPI accent | a 4px solid left border on cards (saffron/navy/green by meaning) — solid, not gradient |

**Banned:** purple/violet anywhere, diagonal multi-color gradients, glassmorphism/blur cards, neon glows, dark-mode-style color pops on light background, full tricolor backgrounds.

## 4. Typography

Load via Google Fonts (download the .woff2 files into `assets/fonts/` for offline demo):

| Role | Font | Why |
|---|---|---|
| Display / headings | **Bricolage Grotesque** (weights 600, 800) | Characterful, warm, clearly not the default-AI Inter look |
| Body + UI | **Mukta** (400, 500, 700) | Designed for Devanagari + Latin together — quietly Indian, superb legibility |
| Numbers / data | Mukta 700 with `font-variant-numeric: tabular-nums` | KPIs and tables align perfectly |

Scale (px): h1 40, h2 28, h3 20, body 16, small 13.5. Line-height 1.55 body, 1.15 headings. Headings in `--ink`, never in saffron (saffron headings = slop).

**Devanagari accent:** the logo lockup is `DhatuChakra` with `धातुचक्र` in Mukta 500 at 60% size beside/below it, in `--ink-soft`. The tagline appears once, on the landing hero: **"हर टन का हिसाब।"** with English below: *Every tonne, accounted for.* Do not sprinkle Hindi randomly elsewhere — one confident use beats ten decorative ones.

## 5. The Chakra motif (our signature element)

`assets/chakra.svg`: a 24-spoke wheel, 1.5px stroke, drawn in `--navy` — geometric, minimal, respectful (never distorted, never gradient-filled, never spinning as decoration).

Three uses, only these:
1. **Logo:** 22px chakra beside the wordmark in the header.
2. **MCI gauge (results page):** the chakra at 180px; spokes fill clockwise in `--green` proportional to MCI (MCI 0.42 → 10 of 24 spokes green, rest `--line`). Number in the center: `0.42` in Bricolage 800, label "Material Circularity Indicator" below. This is the screenshot judges remember.
3. **Empty state / footer mark** at low opacity (6%) as a large background watermark on the landing hero, right side.

## 6. Components (spec once, reuse everywhere)

- **Header (every page):** paper background, chakra+wordmark left, nav links right (Assess · Results · Compare · Report) in Mukta 500 `--navy`; active link has a 2px saffron underline. Below the header: the 3px flag-band. Header does NOT stick (calmer).
- **Buttons:** primary = `--saffron` fill, white text, 8px radius, no shadow, darkens to `--saffron-deep` on hover. Secondary = white fill, 1px `--navy` border, navy text. Radius is 8px EVERYWHERE — cards 12px. (One radius family = designed; five radii = generated.)
- **Cards:** `--card`, 1px `--line` border, 12px radius, shadow `0 1px 3px rgba(28,43,58,.06)` — barely-there. 24px padding.
- **KPI card:** small caps label 13.5px `--ink-soft` → number 34px Bricolage 800 `--ink` with unit in Mukta 500 16px → uncertainty line 13.5px `--ink-soft` "range 15.2 – 18.1" → 4px left border in the metric's meaning color.
- **"AI estimated" badge:** pill, `--saffron-wash` fill, `--saffron-deep` text, 12px, text exactly: `estimated · 78%`. Sits right-aligned inside the input row. When the user edits that field, the pill silently becomes a plain `you` pill in `--navy-wash`. This tiny interaction IS our AI story — make it smooth.
- **Sliders:** native range input restyled — 4px `--line` track, filled portion `--saffron`, 18px white thumb with 2px saffron border. Current value shown live in a bold chip to the right.
- **Tables (provenance, factors):** no zebra stripes; 1px `--line` row rules, 12px cell padding, source column in `--navy` as links.
- **Charts:** paper background (no chart-area fill), gridlines `--line` at 50% opacity, labels Mukta 13.5 `--ink-soft`. Series order: navy, saffron, mustard, slate. Green/red reserved for better/worse meaning. No 3D, no drop shadows on bars, rounded bar tops 2px max.

## 7. The anti-AI-slop checklist (run on EVERY page before calling it done)

- [ ] No purple, no glassmorphism, no blur, no neon, no dark hero on light site
- [ ] No emoji anywhere in UI text (icons: outline SVG, 1.5px stroke, `--ink-soft` — use Lucide, downloaded)
- [ ] No Inter/Roboto/system-default look — headings visibly Bricolage
- [ ] Max ~5 saffron elements visible per screen; green only on genuinely-good things
- [ ] One radius family (8/12px), one shadow recipe, consistent 8px spacing grid (8/16/24/40/64)
- [ ] Layout has ONE asymmetric moment per page (e.g. hero text 60/40 with chakra watermark right; results grid 2/3 + 1/3) — perfectly symmetric everything reads as generated
- [ ] Microcopy is specific, not inspirational: "Compute assessment", not "Unlock sustainability ✨"; "range 15.2–18.1", not "high accuracy!"
- [ ] Every number on screen exists in DATA_SPEC.md
- [ ] Tricolor appears ONLY as the 3px band + the meaning-colors doing their jobs
- [ ] Print `report.html` — it must look like a document a ministry could file, not a webpage screenshot
