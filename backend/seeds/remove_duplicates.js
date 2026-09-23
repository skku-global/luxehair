require('dotenv').config({ path: __dirname + '/../.env' });
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e) {}
const mongoose = require('mongoose');
const { formatMongoUri } = require('../config/db');

const namesToRemove = [
  "PRO | The Atelier Titanium Silk Press Wig",
  "PRO | The Imperial Raven Curly Crown Wig",
  "PRO | The Couture Ombre Sunset Frontal Wig",
  "STANDARD | The Chérie Chestnut Body Wave Wig",
  "QUALITY | The Nova Natural Wave Glueless Wig",
  "QUALITY | The Tara Orange Ginger Bob Wig",
  "FINE | The Zara Natural Wave Lace Closure Wig",
  "FINE | The Nina Bob Closure Wig",
  "FINE | The Layla Curly Closure Wig"
];

const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxehair';
const mongoUri = formatMongoUri ? formatMongoUri(rawUri) : rawUri;
mongoose.connect(mongoUri).then(async () => {
  console.log('Connected. Removing duplicates...\n');
  for (const name of namesToRemove) {
    const result = await mongoose.connection.collection('products').deleteOne({ name });
    console.log((result.deletedCount ? 'REMOVED' : 'NOT FOUND') + ': ' + name);
  }
  const count = await mongoose.connection.collection('products').countDocuments({ category: 'wigs' });
  console.log('\nWigs remaining:', count);

  const remaining = await mongoose.connection.collection('products').find({}).toArray();
  console.log('\n--- ALL UNIQUE PRODUCTS (Total: ' + remaining.length + ') ---');
  remaining.forEach(p => console.log('  [' + p.category + '] ' + p.name));

  await mongoose.disconnect();
  console.log('\nDone.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
