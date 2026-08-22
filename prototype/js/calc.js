/* DhatuChakra — calc.js. Formulas from DATA_SPEC.md §3–§6. Depends on data.js. */

(function () {
  const DC = window.DC;

  function gridEff(region, s, stateGrid) {
    const base = (stateGrid != null && isFinite(stateGrid)) ? Number(stateGrid) : DC.GRID[region].factor;
    return base * (1 - s) + DC.RENEWABLE_FACTOR * s;
  }

  /* Core assessment. st = {metal, region, stateGrid, r, cr, s, elecOverride} */
  DC.compute = function (st) {
    const routes = DC.ROUTES[st.metal];
    const g = gridEff(st.region, st.s, st.stateGrid);

    const gwpRoute = rt => rt.elec_kWh * g + rt.base_CO2_kg;                       // kg CO2e/t
    const enRoute  = rt => rt.elec_kWh * DC.PRIMARY_ENERGY + rt.base_energy_GJ;    // GJ/t

    const blend = (a, b) => (1 - st.r) * a + st.r * b;
    const knn = typeof DC.knnImpute === "function" ? DC.knnImpute(st) : null;
    const elecDefault = knn ? knn.elec : blend(routes.linear.elec_kWh, routes.circular.elec_kWh);
    const finalElec = (st.elecOverride != null && isFinite(st.elecOverride)) ? st.elecOverride : elecDefault;

    let elec_kWh = blend(routes.linear.elec_kWh, routes.circular.elec_kWh);
    let gwp = blend(gwpRoute(routes.linear), gwpRoute(routes.circular));
    let energy = blend(enRoute(routes.linear), enRoute(routes.circular));

    if (finalElec !== elec_kWh) {
      gwp += (finalElec - elec_kWh) * g;
      energy += (finalElec - elec_kWh) * DC.PRIMARY_ENERGY;
      elec_kWh = finalElec;
    }

    const water = DC.WATER_RATIO * gwp;   // m3/t
    const acid = DC.ACID_RATIO * gwp;     // kg SO2e/t
    const elecShare = (elec_kWh * g) / gwp;

    /* stage split blended by r */
    const sh = DC.STAGE_SHARE[st.metal];
    const stages = DC.STAGES.map((name, i) => ({
      name, kg: gwp * blend(sh.linear[i], sh.circular[i]),
      share: blend(sh.linear[i], sh.circular[i]),
    }));

    return { gwp, energy, water, acid, elec_kWh, elecShare, stages, grid: g,
             mci: DC.mci(st.r, st.cr) };
  };

  DC.monteCarlo = function (st, runs) {
    runs = Math.max(1, Math.floor(runs || 1000));
    const routes = DC.ROUTES[st.metal];
    const g = gridEff(st.region, st.s, st.stateGrid);
    const blend = (a, b) => (1 - st.r) * a + st.r * b;
    const knn = typeof DC.knnImpute === "function" ? DC.knnImpute(st) : null;
    const elecDefault = knn ? knn.elec : blend(routes.linear.elec_kWh, routes.circular.elec_kWh);
    const elec = (st.elecOverride != null && isFinite(st.elecOverride)) ? st.elecOverride : elecDefault;
    const baseCO2 = blend(routes.linear.base_CO2_kg, routes.circular.base_CO2_kg);
    const gsd = 1.1;

    function gauss() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    function noise() {
      return Math.exp(Math.log(gsd) * gauss());
    }

    const samples = [];
    for (let i = 0; i < runs; i++) {
      const gridSample = g * noise();
      const elecSample = elec * noise();
      const baseSample = baseCO2 * noise();
      samples.push(elecSample * gridSample + baseSample);
    }
    samples.sort((a, b) => a - b);

    function pick(q) {
      return samples[Math.min(samples.length - 1, Math.floor(samples.length * q))];
    }
    return { p05: pick(0.05), p50: pick(0.50), p95: pick(0.95), samples };
  };

  /* MCI — Ellen MacArthur, X = 1, Ef = 0.9 */
  DC.mci = function (r, cr) {
    const Ef = DC.EF;
    const V = 1 - r;
    const W0 = 1 - cr;
    const Wc = cr * (1 - Ef);
    const Wf = r * (1 - Ef) / Ef;
    const W = W0 + (Wf + Wc) / 2;
    const LFI = (V + W) / (2 + (Wf - Wc) / 2);
    return Math.max(0, 1 - 0.9 * LFI);
  };

  /* Formatting helpers */
  DC.sig3 = function (x) {
    if (!isFinite(x)) return "–";
    if (x === 0) return "0";
    const digits = Math.max(0, 3 - Math.floor(Math.log10(Math.abs(x))) - 1);
    return x.toFixed(Math.min(digits, 2)).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  };
  DC.tonnes = kg => kg / 1000;

  /* §5 sentence templates */
  DC.mciSentence = function (mci) {
    const m = mci.toFixed(2);
    if (mci < 0.3) return "MCI " + m + " — a largely linear flow. Raising recovery lifts the score fastest.";
    if (mci <= 0.6) return "MCI " + m + " — partly circular. Scrap share is now the biggest lever.";
    return "MCI " + m + " — a strongly circular flow. Hold recovery high to keep it.";
  };
  DC.scrapSentence = function (st) {
    const routes = DC.ROUTES[st.metal];
    const g = gridEff(st.region, st.s, st.stateGrid);
    const per10 = ((routes.linear.elec_kWh * g + routes.linear.base_CO2_kg)
                 - (routes.circular.elec_kWh * g + routes.circular.base_CO2_kg)) / 10 / 1000;
    return "Every 10% more scrap saves about " + per10.toFixed(1) +
           " tonnes of CO₂ per tonne of " + st.metal + ".";
  };

  /* §6 recommendation rules — returns up to 3 cards ordered by tonnes saved */
  DC.recommend = function (st) {
    const now = DC.compute(st);
    const recs = [];

    if (st.r < 0.6) {
      const at60 = DC.compute(Object.assign({}, st, { r: 0.6 }));
      recs.push({
        title: "Lift scrap share to 60%",
        text: "Cuts GWP from " + DC.sig3(DC.tonnes(now.gwp)) + " to " + DC.sig3(DC.tonnes(at60.gwp)) +
              " t CO₂e/t at current grid intensity.",
        prio: "high", save: (now.gwp - at60.gwp) / 1000,
      });
    }
    if (st.s < 0.5 && now.elecShare > 0.4) {
      const at50 = DC.compute(Object.assign({}, st, { s: 0.5 }));
      const save = (now.gwp - at50.gwp) / 1000;
      recs.push({
        title: "Contract renewable power",
        text: "Electricity is " + Math.round(now.elecShare * 100) + "% of your footprint; a 50% renewable PPA removes ~" +
              save.toFixed(1) + " t.",
        prio: save > 2 ? "high" : "medium", save,
      });
    }
    if (st.cr < 0.7) {
      recs.push({
        title: "Raise end-of-life recovery",
        text: "Recovery above 70% lifts MCI to " + DC.mci(st.r, 0.7).toFixed(2) +
              " — the strongest circularity lever after scrap.",
        prio: "medium", save: 0,
      });
    }
    if (recs.length === 0) {
      const t = now.stages[4];
      recs.push({
        title: "Optimise logistics",
        text: "Your route is near best practice; transport (" + Math.round(t.share * 100) +
              "%) is the remaining lever.",
        prio: "medium", save: 0,
      });
    }
    recs.sort((a, b) => b.save - a.save);
    return recs.slice(0, 3);
  };

  /* §7 plain-English matcher */
  DC.parseText = function (text, st) {
    const t = (text || "").toLowerCase();
    const chips = [];
    const out = Object.assign({}, st);
    let metalFound = false, routeFound = false;

    if (/alumini|aluminum/.test(t)) { out.metal = "aluminium"; metalFound = true; chips.push({ ok: 1, label: "aluminium ✓" }); }
    else if (/steel/.test(t)) { out.metal = "steel"; metalFound = true; chips.push({ ok: 1, label: "steel ✓" }); }

    const stateAliases = {
      odisha: "Odisha", orissa: "Odisha", jharkhand: "Jharkhand", chhattisgarh: "Chhattisgarh",
      gujarat: "Gujarat", rajasthan: "Rajasthan", maharashtra: "Maharashtra",
      karnataka: "Karnataka", "tamil nadu": "Tamil Nadu", tamil: "Tamil Nadu",
      himachal: "Himachal", "himachal pradesh": "Himachal"
    };
    const stateHit = Object.keys(stateAliases).find(k => t.includes(k));
    if (stateHit) {
      const name = stateAliases[stateHit];
      out.region = "IN";
      out.stateName = name;
      out.stateGrid = DC.STATE_GRID[name].factor;
      chips.push({ ok: 1, label: name + " state grid ✓" });
    } else if (/india|national/.test(t)) {
      out.region = "IN";
      out.stateName = null;
      out.stateGrid = null;
      chips.push({ ok: 1, label: "India grid ✓" });
    } else if (/europe/.test(t)) {
      out.region = "EU";
      out.stateName = null;
      out.stateGrid = null;
      chips.push({ ok: 1, label: "Europe grid ✓" });
    }

    if (/recycl|scrap charge|remelt/.test(t)) { out.routeKey = DC.ROUTES[out.metal].circular.key; routeFound = true; }
    else if (/blast|smelter|primary/.test(t)) { out.routeKey = DC.ROUTES[out.metal].linear.key; routeFound = true; }
    if (routeFound) chips.push({ ok: 1, label: out.routeKey.replace("_", "-") + " route ✓" });

    const scrap = t.match(/scrap[^0-9]{0,12}(\d{1,3})\s*%/) || t.match(/(\d{1,3})\s*%\s*scrap/);
    if (scrap) {
      out.r = Math.min(100, parseInt(scrap[1], 10)) / 100;
      chips.push({ ok: 1, label: "scrap " + scrap[1] + "% ✓" });
    }
    if (/solar|wind|renewab|hydro/.test(t)) { out.s = 0.5; chips.push({ ok: 1, label: "renewables → 50% ✓" }); }
    else if (/coal/.test(t)) { out.s = 0; chips.push({ ok: 1, label: "coal grid ✓" }); }

    if (!metalFound || !routeFound) chips.push({ ok: 0, label: (metalFound ? "route" : "metal") + " — estimated from library" });
    chips.push({ ok: 0, label: "electricity — estimated from library" });
    return { state: out, chips };
  };

  /* U4 — k-NN imputer: predicts elec + thermal from nearest physics-generated scenarios */
  DC.knnImpute = function (st) {
    if (!DC.ML_ROWS || !DC.ML_ROWS.length) return null;

    /* Feature vector: [metalIsAluminium, r, s, gridFactor] */
    var gf = (st.stateGrid != null && isFinite(st.stateGrid))
      ? Number(st.stateGrid) : DC.GRID[st.region].factor;
    var query = [st.metal === "aluminium" ? 1 : 0, st.r, st.s, gf];

    /* Normalize each feature to [0,1] using known domain ranges */
    var mins  = [0, 0, 0, 0.18];
    var maxes = [1, 1, 0.8, 0.92];
    function norm(v, i) { return (v - mins[i]) / ((maxes[i] - mins[i]) || 1); }

    /* Euclidean distance to every training row */
    var dists = DC.ML_ROWS.map(function (row) {
      var rv = [row.metal, row.r, row.s, row.gridFactor];
      var sum = 0;
      for (var i = 0; i < 4; i++) {
        var d = norm(query[i], i) - norm(rv[i], i);
        sum += d * d;
      }
      return { dist: Math.sqrt(sum), elec: row.elec, thermal: row.thermal };
    });

    /* Sort by distance, take k = 7 nearest */
    dists.sort(function (a, b) { return a.dist - b.dist; });
    var k = 7;
    var nn = dists.slice(0, k);

    /* Mean predictions */
    var sumE = 0, sumT = 0;
    for (var j = 0; j < k; j++) { sumE += nn[j].elec; sumT += nn[j].thermal; }
    var meanElec = sumE / k;
    var meanThermal = sumT / k;

    /* Confidence = 1 - (stddev / mean), clamped [0.50, 0.99] */
    var varE = 0, varT = 0;
    for (var j = 0; j < k; j++) {
      varE += (nn[j].elec - meanElec) * (nn[j].elec - meanElec);
      varT += (nn[j].thermal - meanThermal) * (nn[j].thermal - meanThermal);
    }
    var stdElec = Math.sqrt(varE / k);
    var stdThermal = Math.sqrt(varT / k);
    var confElec = Math.max(0.50, Math.min(0.99, 1 - stdElec / (meanElec || 1)));
    var confThermal = Math.max(0.50, Math.min(0.99, 1 - stdThermal / (meanThermal || 1)));

    return {
      elec: Math.round(meanElec),
      thermal: Math.round(meanThermal),
      confElec: confElec,
      confThermal: confThermal
    };
  };
})();
