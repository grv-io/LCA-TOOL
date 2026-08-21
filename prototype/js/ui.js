/* DhatuChakra — ui.js. Shared rendering: chakra marks/gauge, stage bar, sankey. */

(function () {
  const DC = window.DC;

  /* ---------- Chakra SVG ----------
     24 spokes, 1.5px stroke. filled = number of spokes drawn in green (gauge mode). */
  DC.chakraSVG = function (size, opts) {
    opts = opts || {};
    const filled = opts.filled || 0;
    const stroke = opts.stroke || "var(--navy)";
    const c = size / 2, rOuter = c - size * 0.055, rInner = size * 0.10;
    const rHub = size * 0.045;
    let spokes = "";
    for (let i = 0; i < 24; i++) {
      const a = (i * 15 - 90) * Math.PI / 180;
      const x1 = c + rInner * Math.cos(a), y1 = c + rInner * Math.sin(a);
      const x2 = c + (rOuter - size * 0.03) * Math.cos(a), y2 = c + (rOuter - size * 0.03) * Math.sin(a);
      const col = i < filled ? "var(--green)" : (opts.dim || stroke);
      const w = i < filled ? 2.2 : 1.5;
      spokes += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" role="img" aria-label="chakra">
      <circle cx="${c}" cy="${c}" r="${rOuter}" stroke="${stroke}" stroke-width="1.5"/>
      ${spokes}
      <circle cx="${c}" cy="${c}" r="${rHub}" fill="${stroke}"/>
    </svg>`;
  };

  /* Replace every .chakra-mark with an inline chakra */
  function paintMarks() {
    document.querySelectorAll(".chakra-mark").forEach(el => {
      const size = parseInt(el.dataset.size || "22", 10);
      el.innerHTML = DC.chakraSVG(size, { stroke: el.dataset.stroke || "var(--navy)", dim: el.dataset.dim });
    });
  }

  /* ---------- MCI gauge (results / compare / report) ---------- */
  DC.gauge = function (el, mci, size) {
    size = size || 180;
    const filled = Math.round(mci * 24);
    el.innerHTML = `
      <div style="position:relative;width:${size}px;height:${size}px;margin:0 auto;">
        ${DC.chakraSVG(size, { filled, dim: "var(--line)" })}
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <span style="font-family:var(--font-display);font-weight:800;font-size:${size * 0.19}px;">${mci.toFixed(2)}</span>
        </div>
      </div>`;
  };

  /* ---------- Stage bar: horizontal stacked ---------- */
  const STAGE_COLORS = ["#24466E", "#C9A227", "#E86A17", "#7B8B99", "#A89F8F"];
  DC.stageBar = function (el, stages, totalKg) {
    let seg = "", legend = "";
    stages.forEach((s, i) => {
      if (s.share <= 0.001) return;
      const pct = (s.share * 100).toFixed(1);
      seg += `<div title="${s.name}: ${DC.sig3(s.kg)} kg CO₂e (${pct}%)"
        style="width:${pct}%;background:${STAGE_COLORS[i]};"></div>`;
      legend += `<span><span class="sw" style="background:${STAGE_COLORS[i]}"></span>${s.name} ${Math.round(s.share * 100)}%</span>`;
    });
    el.innerHTML = `
      <div style="display:flex;height:44px;border-radius:6px;overflow:hidden;">${seg}</div>
      <div class="legend">${legend}</div>
      <p class="chart-note">Total ${DC.sig3(DC.tonnes(totalKg))} t CO₂e per tonne of metal. Hover a segment for detail.</p>`;
  };

  /* ---------- Sankey: fixed topology, hand-drawn SVG ribbons ---------- */
  DC.sankey = function (el, st) {
    const names = DC.ROUTES[st.metal].flowNames;
    const W = 640, H = 300, NW = 10, top = 26, span = H - 56;
    const x0 = 4, x1 = 300, x2 = 560;
    const gap = 18;

    const hVirgin = Math.max(2, (1 - st.r) * (span - gap));
    const hScrap = Math.max(2, st.r * (span - gap));
    const hMetal = span;
    const hRec = Math.max(2, st.cr * (span - gap));
    const hLost = Math.max(2, (1 - st.cr) * (span - gap));

    const yVirgin = top, yScrap = top + hVirgin + gap;
    const yMetal = top + gap / 2;
    const yRec = top, yLost = top + hRec + gap;

    function ribbon(xa, ya, ha, xb, yb, hb, color, op) {
      const m = (xa + xb) / 2;
      return `<path d="M ${xa} ${ya} C ${m} ${ya}, ${m} ${yb}, ${xb} ${yb}
        L ${xb} ${yb + hb} C ${m} ${yb + hb}, ${m} ${ya + ha}, ${xa} ${ya + ha} Z"
        fill="${color}" opacity="${op}"/>`;
    }
    function node(x, y, h, label, sub, anchor) {
      const tx = anchor === "end" ? x - 6 : x + NW + 6;
      return `<rect x="${x}" y="${y}" width="${NW}" height="${h}" rx="2" fill="#1C2B3A"/>
        <text x="${tx}" y="${y + Math.max(14, Math.min(h / 2 + 4, h - 4))}" text-anchor="${anchor || "start"}"
          font-family="Mukta,sans-serif" font-size="13" fill="#1C2B3A">${label}
          <tspan fill="#5A6B7B" font-size="12"> ${sub}</tspan></text>`;
    }
    const pc = x => Math.round(x * 100) + "%";

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="material flow">`;
    if (1 - st.r > 0.002) svg += ribbon(x0 + NW, yVirgin, hVirgin, x1, yMetal, hMetal * (1 - st.r), "#7B8B99", 0.40);
    if (st.r > 0.002) svg += ribbon(x0 + NW, yScrap, hScrap, x1, yMetal + hMetal * (1 - st.r), hMetal * st.r, "#17803D", 0.40);
    if (st.cr > 0.002) svg += ribbon(x1 + NW, yMetal, hMetal * st.cr, x2, yRec, hRec, "#17803D", 0.40);
    if (1 - st.cr > 0.002) svg += ribbon(x1 + NW, yMetal + hMetal * st.cr, hMetal * (1 - st.cr), x2, yLost, hLost, "#7B8B99", 0.40);

    /* dashed return loop: recycled back to scrap input */
    if (st.cr > 0.02) {
      svg += `<path d="M ${x2 + NW / 2} ${yRec + hRec + 6} C ${x2} ${H - 4}, ${x0 + 40} ${H - 4}, ${x0 + NW / 2 + 2} ${yScrap + hScrap + 8}"
        fill="none" stroke="#17803D" stroke-width="1.5" stroke-dasharray="5 5" opacity=".8" marker-end="url(#dcArrow)"/>
        <defs><marker id="dcArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
        <path d="M0,0 L6,3.5 L0,7 Z" fill="#17803D"/></marker></defs>`;
    }

    svg += node(x0, yVirgin, hVirgin, names.virgin, pc(1 - st.r));
    svg += node(x0, yScrap, hScrap, "Scrap", pc(st.r));
    svg += node(x1, yMetal, hMetal, names.metal + " → Product", "");
    svg += node(x2, yRec, hRec, "Recycled ↺", pc(st.cr), "end");
    svg += node(x2, yLost, hLost, "Landfill", pc(1 - st.cr), "end");
    svg += "</svg>";
    el.innerHTML = svg + `<p class="chart-note">${names.virgin} and scrap feed ${st.metal} production; end-of-life material either returns to the loop (green) or is lost (grey).</p>`;
  };

  /* ---------- misc ---------- */
  DC.$ = s => document.querySelector(s);
  DC.pct = x => Math.round(x * 100) + "%";
  DC.scenarioTitle = function (st) {
    const routes = DC.ROUTES[st.metal];
    const route = (st.routeKey === routes.circular.key) ? routes.circular.name : routes.linear.name;
    const metal = st.metal.charAt(0).toUpperCase() + st.metal.slice(1);
    const region = { IN: "India grid", WORLD: "World grid", EU: "Europe grid" }[st.region];
    return metal + " — " + route + " · " + region;
  };

  /* Chrome/Edge: paint the filled part of range tracks (Firefox does it natively) */
  function paintRange(el) {
    const min = +el.min || 0, max = +el.max || 100;
    const p = ((+el.value - min) / (max - min)) * 100;
    el.style.background = `linear-gradient(to right, var(--saffron) 0% ${p}%, var(--line) ${p}% 100%)`;
  }
  function wireRanges() {
    document.querySelectorAll('input[type="range"]').forEach(el => {
      paintRange(el);
      el.addEventListener("input", () => paintRange(el));
    });
  }
  DC.repaintRanges = function () { document.querySelectorAll('input[type="range"]').forEach(paintRange); };

  document.addEventListener("DOMContentLoaded", () => { paintMarks(); wireRanges(); });
})();
