const fs = require('fs');

let svg = fs.readFileSync('prototype/assets/india-map.svg', 'utf8');

// 1. Strip XML declaration, DOCTYPE, and comments
svg = svg.replace(/<\?xml[^?]*\?>/g, '');
svg = svg.replace(/<!DOCTYPE[^>]*\[[\s\S]*?\]>/g, '');
svg = svg.replace(/<!--[\s\S]*?-->/g, '');

// 2. Remove <font> ... </font> blocks (embedded fonts)
svg = svg.replace(/<font[\s\S]*?<\/font>/gi, '');

// 3. Remove ALL <text> elements and their content
svg = svg.replace(/<text[\s\S]*?<\/text>/gi, '');

// 4. Remove <circle> elements (city dots)
svg = svg.replace(/<circle[^>]*\/>/gi, '');
svg = svg.replace(/<circle[^>]*>[\s\S]*?<\/circle>/gi, '');

// 5. Remove <rect> elements (legend boxes etc) - but keep if inside a path
svg = svg.replace(/<rect[^>]*\/>/gi, '');
svg = svg.replace(/<rect[^>]*>[\s\S]*?<\/rect>/gi, '');

// 6. Remove <line> elements
svg = svg.replace(/<line[^>]*\/>/gi, '');
svg = svg.replace(/<line[^>]*>[\s\S]*?<\/line>/gi, '');

// 7. Remove <polyline> elements  
svg = svg.replace(/<polyline[^>]*\/>/gi, '');
svg = svg.replace(/<polyline[^>]*>[\s\S]*?<\/polyline>/gi, '');

// 8. Remove <polygon> elements (if not state shapes - state shapes use <path>)
svg = svg.replace(/<polygon[^>]*\/>/gi, '');
svg = svg.replace(/<polygon[^>]*>[\s\S]*?<\/polygon>/gi, '');

// 9. Remove <metadata> blocks
svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');

// 10. Remove <defs> blocks (gradients, filters etc)
svg = svg.replace(/<defs[\s\S]*?<\/defs>/gi, '');

// 11. Remove <use> elements
svg = svg.replace(/<use[^>]*\/>/gi, '');
svg = svg.replace(/<use[^>]*>[\s\S]*?<\/use>/gi, '');

// 12. Clean up entity references that were in the DOCTYPE
svg = svg.replace(/&ns_svg;/g, 'http://www.w3.org/2000/svg');
svg = svg.replace(/&ns_xlink;/g, 'http://www.w3.org/1999/xlink');

// 13. Remove empty <g> tags
for (let i = 0; i < 5; i++) {
  svg = svg.replace(/<g[^>]*>\s*<\/g>/gi, '');
}

// 14. Collapse excessive whitespace
svg = svg.replace(/\n\s*\n/g, '\n');
svg = svg.replace(/\t/g, '');

// 15. Trim
svg = svg.trim();

// Count paths remaining
const pathCount = (svg.match(/<path/gi) || []).length;
console.log(`Cleaned SVG: ${svg.length} chars, ${pathCount} paths remaining`);

// Extract all IDs from paths
const ids = [];
const idRegex = /<path[^>]+id="([^"]+)"/gi;
let m;
while ((m = idRegex.exec(svg)) !== null) ids.push(m[1]);
console.log(`Path IDs found: ${ids.join(', ')}`);

// Write cleaned SVG
fs.writeFileSync('prototype/assets/india-map-clean.svg', svg);

// Write JS version
const svgEscaped = svg.replace(/`/g, '\\`').replace(/\$/g, '\\$');
const jsContent = `// Auto-generated clean India map SVG\nwindow.DC = window.DC || {};\nwindow.DC.INDIA_SVG = \`${svgEscaped}\`;\n`;
fs.writeFileSync('prototype/js/map-svg.js', jsContent);

console.log('Done! Wrote india-map-clean.svg and map-svg.js');
