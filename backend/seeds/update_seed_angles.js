const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seed.js');
let seed = fs.readFileSync(seedPath, 'utf8');

const replacements = [
  {
    target: `    images: [
      "/images/products/wig-platinum-model.jpg",
      "/images/products/wig-platinum-bust.jpg",
      "/images/products/wig-platinum-bust2.jpg",
      "/images/products/wig-deep-wave-1.jpg"
    ]`,
    replacement: `    images: [
      "/images/products/wig-platinum-model.jpg",
      "/images/products/wig-platinum-bust.jpg",
      "/images/products/wig-platinum-quarter.jpg",
      "/images/products/wig-platinum-side.jpg",
      "/images/products/wig-platinum-back.jpg",
      "/images/products/wig-platinum-detail.jpg"
    ]`
  },
  {
    target: `    images: [
      "/images/products/wig-magenta-model.jpg",
      "/images/products/wig-magenta-bust.jpg",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
      "/images/products/wig-bone-straight-2.jpg"
    ]`,
    replacement: `    images: [
      "/images/products/wig-magenta-model.jpg",
      "/images/products/wig-magenta-bust.jpg",
      "/images/products/wig-magenta-quarter.jpg",
      "/images/products/wig-magenta-side.jpg",
      "/images/products/wig-magenta-back.jpg"
    ]`
  },
  {
    target: `    images: [
      "/images/products/wig-sapphire-model.jpg",
      "/images/products/wig-sapphire-bust.jpg",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80",
      "/images/products/wig-deep-wave-2.jpg"
    ]`,
    replacement: `    images: [
      "/images/products/wig-sapphire-model.jpg",
      "/images/products/wig-sapphire-bust.jpg",
      "/images/products/wig-sapphire-quarter.jpg",
      "/images/products/wig-sapphire-side.jpg",
      "/images/products/wig-sapphire-back.jpg"
    ]`
  },
  {
    target: `    images: [
      "/images/products/wig-black-model.jpg",
      "/images/products/wig-black-bust.jpg",
      "/images/products/wig-bone-straight-1.jpg",
      "/images/products/wig-bone-straight-3.jpg"
    ]`,
    replacement: `    images: [
      "/images/products/wig-black-model.jpg",
      "/images/products/wig-black-bust.jpg",
      "/images/products/wig-black-quarter.jpg",
      "/images/products/wig-black-side.jpg",
      "/images/products/wig-black-back.jpg"
    ]`
  }
];

let count = 0;
for (const r of replacements) {
  if (seed.includes(r.target)) {
    seed = seed.replace(r.target, r.replacement);
    count++;
  }
}

fs.writeFileSync(seedPath, seed, 'utf8');
console.log(`Updated ${count} image sequences in seed.js`);
