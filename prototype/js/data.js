/* DhatuChakra — data.js
   The ONLY place numbers live. Everything here mirrors prototype/DATA_SPEC.md.
   If you change a value, change DATA_SPEC.md too. */

const DC = window.DC || (window.DC = {});

/* §1 Grid intensity, kg CO2e per kWh */
DC.GRID = {
  IN:    { factor: 0.71, label: "India (0.71 kg CO₂/kWh)" },
  WORLD: { factor: 0.48, label: "World average (0.48)" },
  EU:    { factor: 0.28, label: "Europe (0.28)" },
};
DC.RENEWABLE_FACTOR = 0.04; // lifecycle intensity of the renewable mix

/* U2 indicative Indian state grid intensity, kg CO2e per kWh */
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

/* §1 Route parameters, per tonne of metal */
DC.ROUTES = {
  aluminium: {
    linear:   { key: "primary",  name: "Primary",  elec_kWh: 14500, base_CO2_kg: 6300, base_energy_GJ: 50 },
    circular: { key: "recycled", name: "Recycled", elec_kWh: 800,   base_CO2_kg: 350,  base_energy_GJ: 8 },
    flowNames: { virgin: "Bauxite", inter: "Alumina", metal: "Aluminium" },
  },
  steel: {
    linear:   { key: "bf_bof", name: "BF-BOF", elec_kWh: 120, base_CO2_kg: 2100, base_energy_GJ: 21 },
    circular: { key: "eaf",    name: "EAF",    elec_kWh: 450, base_CO2_kg: 380,  base_energy_GJ: 2 },
    flowNames: { virgin: "Iron ore", inter: "Hot metal", metal: "Steel" },
  },
  /* U6 — indicative values from EF 3.1 / IDEMAT ranges: primary Cu ≈ 4.2 t CO2e/t on IN grid, recycled ≈ 1.1 t */
  copper: {
    linear:   { key: "primary",  name: "Primary",  elec_kWh: 3300, base_CO2_kg: 1900, base_energy_GJ: 28 },
    circular: { key: "recycled", name: "Recycled", elec_kWh: 900,  base_CO2_kg: 500,  base_energy_GJ: 6 },
    flowNames: { virgin: "Copper ore", inter: "Concentrate", metal: "Copper" },
  },
};

/* Other display constants */
DC.THERMAL_MJ = { aluminium: { linear: 42000, circular: 5500 }, steel: { linear: 17500, circular: 1400 },
                  copper: { linear: 9000, circular: 2500 } };
DC.TRANSPORT_TKM = 520;
DC.WATER_RATIO = 0.004;   // m3 per kg CO2e
DC.ACID_RATIO = 0.005;    // kg SO2e per kg CO2e
DC.PRIMARY_ENERGY = 0.0103; // GJ per kWh incl. generation losses
DC.EF = 0.9;              // MCI recycling process efficiency

/* §3 Stage split of GWP, per route */
DC.STAGES = ["Mining", "Refining", "Smelting", "Casting", "Transport"];
DC.STAGE_SHARE = {
  aluminium: { linear: [0.06, 0.24, 0.62, 0.04, 0.04], circular: [0.00, 0.10, 0.74, 0.10, 0.06] },
  steel:     { linear: [0.09, 0.14, 0.66, 0.06, 0.05], circular: [0.00, 0.08, 0.78, 0.09, 0.05] },
  copper:    { linear: [0.25, 0.30, 0.35, 0.05, 0.05], circular: [0.00, 0.12, 0.72, 0.10, 0.06] },
};

/* U8 — benchmark GWP (t CO2e per t metal), indicative from IAI / worldsteel / EF 3.1 summaries.
   "india" = typical Indian plant on today's grid; "best" = world best practice
   (e.g. hydro-powered Al smelters, high-scrap EAF). Blend linear/circular by r. */
DC.BENCHMARKS = {
  aluminium: { linear: { india: 17.8, best: 5.5 }, circular: { india: 1.0, best: 0.5 } },
  steel:     { linear: { india: 2.55, best: 1.8 }, circular: { india: 0.9,  best: 0.4 } },
  copper:    { linear: { india: 4.6,  best: 3.0 }, circular: { india: 1.3,  best: 0.8 } },
};

/* §2 Provenance rows */
DC.PROVENANCE = [
  { factor: "Grid intensity — India",           source: "CEA CO₂ Baseline Database v19", year: 2023, url: "https://cea.nic.in", show: s => s.region === "IN" && s.stateGrid == null },
  { factor: "State grid intensity — indicative", source: "CEA CO₂ Baseline v19 + state generation mix", year: 2023, url: "https://cea.nic.in", show: s => s.region === "IN" && s.stateGrid != null },
  { factor: "Grid intensity — world/EU",        source: "IEA emission factors",              year: 2023, url: "https://www.iea.org", show: s => s.region !== "IN" },
  { factor: "Smelting electricity, PFC & anode", source: "International Aluminium Institute LCI", year: 2022, url: "https://international-aluminium.org", show: s => s.metal === "aluminium" },
  { factor: "Alumina refining & mining",        source: "EF 3.1 / ELCD",                     year: 2022, url: "https://eplca.jrc.ec.europa.eu", show: s => s.metal === "aluminium" },
  { factor: "Remelting route",                  source: "IDEMAT 2024, TU Delft",             year: 2024, url: "https://www.idematapp.com", show: s => s.metal === "aluminium" },
  { factor: "BF-BOF & EAF inventories",         source: "worldsteel LCI methodology",        year: 2023, url: "https://worldsteel.org", show: s => s.metal === "steel" },
  { factor: "Copper primary & secondary routes", source: "EF 3.1 / IDEMAT 2024 (indicative)", year: 2024, url: "https://www.idematapp.com", show: s => s.metal === "copper" },
  { factor: "Transport factors",                source: "EF 3.1",                            year: 2022, url: "https://eplca.jrc.ec.europa.eu", show: () => true },
  { factor: "MCI methodology",                  source: "Ellen MacArthur Foundation, MCI v3", year: 2019, url: "https://www.ellenmacarthurfoundation.org", show: () => true },
];

/* §4 The four presets */
DC.PRESETS = [
  { id: 1, metal: "aluminium", routeKey: "primary",  region: "IN", r: 0.00, cr: 0.15, s: 0,
    title: "Aluminium — Primary",  sub: "Hall-Héroult smelter · Odisha grid", chip: "linear" },
  { id: 2, metal: "aluminium", routeKey: "recycled", region: "IN", r: 1.00, cr: 0.70, s: 0,
    title: "Aluminium — Recycled", sub: "Scrap remelt route", chip: "circular" },
  { id: 3, metal: "steel", routeKey: "bf_bof", region: "IN", r: 0.00, cr: 0.25, s: 0,
    title: "Steel — BF-BOF", sub: "Blast furnace · integrated plant", chip: "linear" },
  { id: 4, metal: "steel", routeKey: "eaf", region: "IN", r: 1.00, cr: 0.85, s: 0,
    title: "Steel — EAF", sub: "Electric arc · scrap charge", chip: "circular" },
  { id: 5, metal: "copper", routeKey: "primary", region: "IN", r: 0.00, cr: 0.30, s: 0,
    title: "Copper — Primary", sub: "Pyromet route · concentrate smelting", chip: "linear" },
  { id: 6, metal: "copper", routeKey: "recycled", region: "IN", r: 1.00, cr: 0.80, s: 0,
    title: "Copper — Recycled", sub: "Secondary refining · scrap anode", chip: "circular" },
];

/* State handling (localStorage) */
DC.defaultState = function () {
  const p = DC.PRESETS[0];
  return { metal: p.metal, routeKey: p.routeKey, region: p.region, r: p.r, cr: p.cr, s: p.s,
           stateName: p.stateName || null, stateGrid: p.stateGrid || null,
           elecOverride: null, baseline: { r: p.r, cr: p.cr, s: p.s } };
};
DC.loadState = function () {
  try {
    const raw = localStorage.getItem("dc_state");
    if (raw) return Object.assign(DC.defaultState(), JSON.parse(raw));
  } catch (e) { /* fall through */ }
  return DC.defaultState();
};
DC.saveState = function (st) { localStorage.setItem("dc_state", JSON.stringify(st)); };
DC.applyPreset = function (id) {
  const p = DC.PRESETS.find(x => x.id === id) || DC.PRESETS[0];
  const st = { metal: p.metal, routeKey: p.routeKey, region: p.region, r: p.r, cr: p.cr, s: p.s,
               stateName: p.stateName || null, stateGrid: p.stateGrid || null,
               elecOverride: null, baseline: { r: p.r, cr: p.cr, s: p.s } };
  DC.saveState(st);
  return st;
};

/* CBAM Constants — note: copper is OUTSIDE the current CBAM product scope
   (Regulation 2023/956 covers iron/steel, aluminium, cement, fertilisers,
   electricity, hydrogen). benchmark has no copper key on purpose; the UI
   shows an out-of-scope note instead of a cost. */
DC.CBAM = {
  phaseIn: { 2026: 0.025, 2027: 0.05, 2028: 0.10, 2029: 0.225, 2030: 0.485, 2034: 1.0 },
  etsPriceEUR: 75,          // adjustable slider 50–100 €/t CO2
  eurToInr: 90,             // adjustable
  benchmark: { aluminium: 6.0, steel: 1.8 },  // indicative EU benchmark t CO2e/t; label "indicative"
};

/* ---------- U9: scenario library (localStorage) ---------- */
DC.savedScenarios = function () {
  try { return JSON.parse(localStorage.getItem("dc_saved") || "[]"); }
  catch (e) { return []; }
};
DC.saveScenario = function (name, st) {
  const list = DC.savedScenarios();
  const out = DC.compute(st);
  list.unshift({
    id: "s" + (list.length ? Number(String(list[0].id).slice(1)) + 1 : 1),
    name: name,
    savedAt: new Date().toISOString().slice(0, 10),
    state: { metal: st.metal, routeKey: st.routeKey, region: st.region,
             stateName: st.stateName || null, stateGrid: st.stateGrid || null,
             r: st.r, cr: st.cr, s: st.s, elecOverride: st.elecOverride,
             baseline: st.baseline },
    gwp_t: Math.round(DC.tonnes(out.gwp) * 100) / 100,
    mci: Math.round(out.mci * 100) / 100,
  });
  localStorage.setItem("dc_saved", JSON.stringify(list.slice(0, 20)));
  return list[0];
};
DC.deleteScenario = function (id) {
  localStorage.setItem("dc_saved",
    JSON.stringify(DC.savedScenarios().filter(x => x.id !== id)));
};
DC.loadScenario = function (id) {
  const hit = DC.savedScenarios().find(x => x.id === id);
  if (!hit) return null;
  const st = Object.assign(DC.defaultState(), hit.state);
  DC.saveState(st);
  return st;
};

/* ---------- U7: UI strings, English -> Hindi ----------
   Applied by a reversible text-node walker in ui.js. Static labels only;
   dynamic sentences (recommendations, captions) stay English in v1. */
DC.I18N = {
  "Assess": "आकलन", "Results": "परिणाम", "Compare": "तुलना", "Report": "रिपोर्ट",
  "Global warming": "ग्लोबल वार्मिंग", "Energy demand": "ऊर्जा मांग",
  "Water use": "जल उपयोग", "Acidification": "अम्लीकरण",
  "Start an assessment": "आकलन शुरू करें", "See a sample result": "नमूना परिणाम देखें",
  "Compute assessment": "आकलन करें", "Read my description": "मेरा विवरण पढ़ें",
  "Open report": "रिपोर्ट खोलें", "Back to results": "परिणाम पर वापस",
  "Save as PDF": "PDF सहेजें", "Save scenario": "परिदृश्य सहेजें",
  "Saved scenarios": "सहेजे गए परिदृश्य", "Load": "खोलें", "Delete": "हटाएं",
  "Metal": "धातु", "Route": "मार्ग", "Region / grid": "क्षेत्र / ग्रिड",
  "Recycled content": "पुनर्चक्रित सामग्री", "End-of-life recovery": "जीवन-अंत रिकवरी",
  "Renewable share in electricity": "बिजली में नवीकरणीय हिस्सा",
  "Renewable electricity": "नवीकरणीय बिजली",
  "Electricity use": "बिजली खपत", "Thermal energy": "तापीय ऊर्जा", "Transport": "परिवहन",
  "Aluminium": "एल्युमिनियम", "Steel": "इस्पात", "Copper": "तांबा",
  "Mining": "खनन", "Refining": "शोधन", "Smelting": "प्रगलन", "Casting": "ढलाई",
  "Material flow": "सामग्री प्रवाह", "Circularity": "चक्रीयता",
  "Data provenance": "डेटा स्रोत", "Where it comes from": "उत्सर्जन कहाँ से",
  "Where you stand": "आप कहाँ खड़े हैं",
  "Assessment inputs": "आकलन इनपुट", "Process detail": "प्रक्रिया विवरण",
  "Or just describe it": "या बस बता दीजिए", "Scenario inputs": "परिदृश्य इनपुट",
  "Quick entry": "त्वरित प्रविष्टि", "linear": "रैखिक", "circular": "चक्रीय",
  "Today - Linear": "आज - रैखिक", "With circularity - Yours": "चक्रीयता के साथ - आपका",
  "Adjust circularity assumptions": "चक्रीयता के अनुमान बदलें",
  "Live scenario controls": "लाइव नियंत्रण", "Baseline": "आधार रेखा",
  "Circular pathway": "चक्रीय मार्ग",
};
