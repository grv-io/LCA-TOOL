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
};

/* Other display constants */
DC.THERMAL_MJ = { aluminium: { linear: 42000, circular: 5500 }, steel: { linear: 17500, circular: 1400 } };
DC.TRANSPORT_TKM = 520;
DC.WATER_RATIO = 0.004;   // m3 per kg CO2e
DC.ACID_RATIO = 0.005;    // kg SO2e per kg CO2e
DC.PRIMARY_ENERGY = 0.0103; // GJ per kWh incl. generation losses
DC.EF = 0.9;              // MCI recycling process efficiency
DC.RANGE = { lo: 0.92, hi: 1.09 };

/* §3 Stage split of GWP, per route */
DC.STAGES = ["Mining", "Refining", "Smelting", "Casting", "Transport"];
DC.STAGE_SHARE = {
  aluminium: { linear: [0.06, 0.24, 0.62, 0.04, 0.04], circular: [0.00, 0.10, 0.74, 0.10, 0.06] },
  steel:     { linear: [0.09, 0.14, 0.66, 0.06, 0.05], circular: [0.00, 0.08, 0.78, 0.09, 0.05] },
};

/* §2 Provenance rows */
DC.PROVENANCE = [
  { factor: "Grid intensity — India",           source: "CEA CO₂ Baseline Database v19", year: 2023, url: "https://cea.nic.in", show: s => s.region === "IN" },
  { factor: "Grid intensity — world/EU",        source: "IEA emission factors",              year: 2023, url: "https://www.iea.org", show: s => s.region !== "IN" },
  { factor: "Smelting electricity, PFC & anode", source: "International Aluminium Institute LCI", year: 2022, url: "https://international-aluminium.org", show: s => s.metal === "aluminium" },
  { factor: "Alumina refining & mining",        source: "EF 3.1 / ELCD",                     year: 2022, url: "https://eplca.jrc.ec.europa.eu", show: s => s.metal === "aluminium" },
  { factor: "Remelting route",                  source: "IDEMAT 2024, TU Delft",             year: 2024, url: "https://www.idematapp.com", show: s => s.metal === "aluminium" },
  { factor: "BF-BOF & EAF inventories",         source: "worldsteel LCI methodology",        year: 2023, url: "https://worldsteel.org", show: s => s.metal === "steel" },
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
];

/* State handling (localStorage) */
DC.defaultState = function () {
  const p = DC.PRESETS[0];
  return { metal: p.metal, routeKey: p.routeKey, region: p.region, r: p.r, cr: p.cr, s: p.s,
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
               elecOverride: null, baseline: { r: p.r, cr: p.cr, s: p.s } };
  DC.saveState(st);
  return st;
};
