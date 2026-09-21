// Removes duplicate product blocks from seed.js
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seed.js');
let content = fs.readFileSync(seedPath, 'utf8');

const namesToRemove = [
  'The Noir Obsidian Jet Black Bone Straight Wig',
  'STANDARD | The Chérie Chestnut Body Wave Wig',  // keeping standard ones that differ
  'STANDARD | The Serena Midnight Body Wave Wig',
  'STANDARD | The Sahara Caramel Highlight Straight Wig',
  'QUALITY | The Amber Deep Brown Kinky Straight Wig',
  'FINE | The Maya Straight Brown Closure Wig',
  'STANDARD | The Rosé Deep Wave Frontal Wig',
  'QUALITY | The Ivy Blonde Straight Closure Wig',
];

// Actually only remove the true duplicates (not Chérie - it's valid)
const actualRemove = [
  'The Noir Obsidian Jet Black Bone Straight Wig',
  'STANDARD | The Serena Midnight Body Wave Wig',
  'STANDARD | The Sahara Caramel Highlight Straight Wig',
  'QUALITY | The Amber Deep Brown Kinky Straight Wig',
  'FINE | The Maya Straight Brown Closure Wig',
  'STANDARD | The Ros\u00e9 Deep Wave Frontal Wig',
  'QUALITY | The Ivy Blonde Straight Closure Wig',
];

let removed = 0;
for (const name of actualRemove) {
  // Find the opening of this product object and remove it up to the next product/comment
  const startPattern = `name: "${name}"`;
  const startIdx = content.indexOf(startPattern);
  if (startIdx === -1) {
    console.log('Not found in seed:', name);
    continue;
  }
  
  // Go back to find the opening '{'
  const openBrace = content.lastIndexOf('  {', startIdx);
  
  // Find the closing '  },' or '  }' followed by newline and next entry
  let endIdx = startIdx;
  let depth = 0;
  let inObject = false;
  for (let i = openBrace; i < content.length; i++) {
    if (content[i] === '{') { depth++; inObject = true; }
    if (content[i] === '}') { depth--; }
    if (inObject && depth === 0) {
      endIdx = i + 1;
      // Consume trailing comma and newline
      if (content[endIdx] === ',') endIdx++;
      if (content[endIdx] === '\n') endIdx++;
      break;
    }
  }
  
  content = content.slice(0, openBrace) + content.slice(endIdx);
  console.log('Removed from seed:', name);
  removed++;
}

fs.writeFileSync(seedPath, content, 'utf8');
console.log(`\nDone. Removed ${removed} product blocks from seed.js.`);
