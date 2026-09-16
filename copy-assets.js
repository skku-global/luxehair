const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'public', 'images', 'products');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const wigBase = path.join(dir, 'wig-bone-straight-1.jpg');
const curlyBase = path.join(dir, 'wig-deep-wave-1.jpg');
const careBase = path.join(dir, 'care-elixir-1.jpg');

const copies = [
  [wigBase, 'wig-bone-straight-2.jpg'],
  [wigBase, 'wig-bone-straight-3.jpg'],
  [wigBase, 'wig-bob-1.jpg'],
  [wigBase, 'wig-bob-2.jpg'],
  [curlyBase, 'wig-deep-wave-2.jpg'],
  [curlyBase, 'wig-body-wave-1.jpg'],
  [curlyBase, 'wig-body-wave-2.jpg'],
  [wigBase, 'attachment-clipin-1.jpg'],
  [wigBase, 'attachment-clipin-2.jpg'],
  [wigBase, 'attachment-tapein-1.jpg'],
  [wigBase, 'attachment-tapein-2.jpg'],
  [wigBase, 'attachment-ponytail-1.jpg'],
  [wigBase, 'attachment-ponytail-2.jpg'],
  [careBase, 'care-elixir-2.jpg'],
  [careBase, 'care-spray-1.jpg'],
  [careBase, 'care-spray-2.jpg'],
  [careBase, 'care-masque-1.jpg'],
  [careBase, 'care-masque-2.jpg'],
  [careBase, 'care-serum-1.jpg'],
  [wigBase, 'placeholder-hair.jpg']
];

for (const [src, destName] of copies) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dir, destName));
  }
}

console.log('✅ All product photography assets placed successfully in public folder.');
