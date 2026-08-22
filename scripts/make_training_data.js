#!/usr/bin/env node
/**
 * make_training_data.js — U4 training data generator
 *
 * Generates ~500 physics-grounded training rows for the k-NN imputer.
 * Uses the exact same constants and formulas as data.js / calc.js.
 *
 * Usage:  node prototype/scripts/make_training_data.js
 * Output: prototype/js/ml_data.js
 */

const fs = require("fs");
const path = require("path");

/* ── Constants (mirrored from data.js — keep in sync) ── */

const GRID = {
  IN:    0.71,
  WORLD: 0.48,
  EU:    0.28,
};
const STATE_GRID_FACTORS = [0.88, 0.91, 0.92, 0.62, 0.55, 0.72, 0.45, 0.58, 0.18, 0.71];
const ALL_GRID_FACTORS = [GRID.IN, GRID.WORLD, GRID.EU, ...STATE_GRID_FACTORS];
const RENEWABLE_FACTOR = 0.04;

const ROUTES = {
  aluminium: {
    linear:   { elec_kWh: 14500, base_CO2_kg: 6300 },
    circular: { elec_kWh: 800,   base_CO2_kg: 350  },
  },
  steel: {
    linear:   { elec_kWh: 120, base_CO2_kg: 2100 },
    circular: { elec_kWh: 450, base_CO2_kg: 380  },
  },
};

const THERMAL_MJ = {
  aluminium: { linear: 42000, circular: 5500 },
  steel:     { linear: 17500, circular: 1400 },
};

/* ── Helpers ── */

function randRange(lo, hi) {
  return lo + Math.random() * (hi - lo);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Generate rows ── */

const ROWS = 500;
const rows = [];

for (let i = 0; i < ROWS; i++) {
  // Random scenario parameters
  const metal = Math.random() < 0.5 ? "aluminium" : "steel";
  const r = Math.random();            // recycled content 0–1
  const s = randRange(0, 0.8);        // renewable share 0–0.8
  const gridFactor = pickRandom(ALL_GRID_FACTORS);

  // Physics formulas (same as calc.js)
  const gridEff = gridFactor * (1 - s) + RENEWABLE_FACTOR * s;
  const routes = ROUTES[metal];
  const blend = (a, b) => (1 - r) * a + r * b;

  let elec = blend(routes.linear.elec_kWh, routes.circular.elec_kWh);
  let thermal = blend(THERMAL_MJ[metal].linear, THERMAL_MJ[metal].circular);

  // Add ±8% random noise to simulate real-world variation
  elec    = Math.round(elec    * randRange(0.92, 1.08));
  thermal = Math.round(thermal * randRange(0.92, 1.08));

  rows.push({
    metal: metal === "aluminium" ? 1 : 0,
    r: parseFloat(r.toFixed(4)),
    s: parseFloat(s.toFixed(4)),
    gridFactor: parseFloat(gridFactor.toFixed(4)),
    elec,
    thermal,
  });
}

/* ── Write output ── */

const outputPath = path.join(__dirname, "..", "prototype", "js", "ml_data.js");
const content =
  "/* U4 — ML training data for k-NN imputer (auto-generated, do not edit) */\n" +
  "(function(){ var DC = window.DC || (window.DC = {});\n" +
  "DC.ML_ROWS = " + JSON.stringify(rows) + ";\n" +
  "})();\n";

fs.writeFileSync(outputPath, content, "utf-8");
console.log("✓ Wrote " + rows.length + " rows to " + outputPath);
console.log("  File size: " + (Buffer.byteLength(content) / 1024).toFixed(1) + " KB");
