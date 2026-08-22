const fs = require('fs');
const content = fs.readFileSync('prototype/assets/india-map.svg', 'utf8');
const regex = /<path[^>]+>/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null && count < 15) {
  console.log(match[0]);
  count++;
}
