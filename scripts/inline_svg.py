import os

base_dir = r"c:\Users\rites\OneDrive\Desktop\SIH INTERNAL\prototype"
svg_path = os.path.join(base_dir, "assets", "india-map.svg")
js_out_path = os.path.join(base_dir, "js", "map-svg.js")
html_path = os.path.join(base_dir, "assess.html")

# 1. Read SVG and create map-svg.js
with open(svg_path, 'r', encoding='utf-8') as f:
    svg_content = f.read()

# Escape backticks and dollar signs if any exist in the SVG
svg_escaped = svg_content.replace('`', '\\`').replace('$', '\\$')

js_content = f"""// Auto-generated SVG string for local file:// usage
window.DC = window.DC || {{}};
window.DC.INDIA_SVG = `{svg_escaped}`;
"""
with open(js_out_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

# 2. Modify assess.html to use DC.INDIA_SVG instead of fetch
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Add the script tag if not there
if '<script src="js/map-svg.js"></script>' not in html_content:
    html_content = html_content.replace('<script src="js/ui.js"></script>', '<script src="js/ui.js"></script>\n<script src="js/map-svg.js"></script>')

# Replace the fetch logic with immediate execution
old_fetch = 'fetch("assets/india-map.svg").then(r => r.text()).then(svg => {'
new_fetch = 'setTimeout(() => {\n    const svg = DC.INDIA_SVG;'

html_content = html_content.replace(old_fetch, new_fetch)

# Need to replace the closing '});' of the fetch block with '}, 0);'
# We know the fetch block ends right before '})();'
# So we can replace '    render();\n  });\n\n})();' with '    render();\n  }, 0);\n\n})();'
html_content = html_content.replace('    render();\n  });\n\n})();', '    render();\n  }, 0);\n\n})();')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Inlined SVG to map-svg.js and updated assess.html")
