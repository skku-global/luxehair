const mongoose = require('mongoose');

const namesToRemove = [
  "The Noir Obsidian Jet Black Bone Straight Wig",
  "STANDARD | The Serena Midnight Body Wave Wig",
  "STANDARD | The Sahara Caramel Highlight Straight Wig",
  "QUALITY | The Amber Deep Brown Kinky Straight Wig",
  "FINE | The Maya Straight Brown Closure Wig",
  "STANDARD | The Ros\u00e9 Deep Wave Frontal Wig",
  "QUALITY | The Ivy Blonde Straight Closure Wig"
];

mongoose.connect('mongodb://localhost:27017/luxehair').then(async () => {
  console.log('Connected. Removing duplicates...\n');
  for (const name of namesToRemove) {
    const result = await mongoose.connection.collection('products').deleteOne({ name });
    console.log((result.deletedCount ? 'REMOVED' : 'NOT FOUND') + ': ' + name);
  }
  const count = await mongoose.connection.collection('products').countDocuments({ category: 'wigs' });
  console.log('\nWigs remaining:', count);
  await mongoose.disconnect();
  console.log('Done.');
}).catch(console.error);
