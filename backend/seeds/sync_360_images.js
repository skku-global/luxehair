const mongoose = require('mongoose');

const updates = [
  {
    slug: 'the-aurora-icy-platinum-deep-wave-frontal-wig',
    images: [
      '/images/products/wig-platinum-model.jpg',
      '/images/products/wig-platinum-bust.jpg',
      '/images/products/wig-platinum-quarter.jpg',
      '/images/products/wig-platinum-side.jpg',
      '/images/products/wig-platinum-back.jpg',
      '/images/products/wig-platinum-detail.jpg'
    ]
  },
  {
    slug: 'the-parisian-bone-straight-hd-frontal-unit',
    images: [
      '/images/products/wig-black-model.jpg',
      '/images/products/wig-black-bust.jpg',
      '/images/products/wig-black-quarter.jpg',
      '/images/products/wig-black-side.jpg',
      '/images/products/wig-black-back.jpg'
    ]
  },
  {
    slug: 'the-c-te-d-azur-royal-sapphire-blue-wave-wig',
    images: [
      '/images/products/wig-sapphire-model.jpg',
      '/images/products/wig-sapphire-bust.jpg',
      '/images/products/wig-sapphire-quarter.jpg',
      '/images/products/wig-sapphire-side.jpg',
      '/images/products/wig-sapphire-back.jpg'
    ]
  },
  {
    slug: 'the-riviera-magenta-rose-silk-straight-wig',
    images: [
      '/images/products/wig-magenta-model.jpg',
      '/images/products/wig-magenta-bust.jpg',
      '/images/products/wig-magenta-quarter.jpg',
      '/images/products/wig-magenta-side.jpg',
      '/images/products/wig-magenta-back.jpg'
    ]
  },
  {
    slug: 'the-monaco-golden-honey-blonde-beach-wave-wig',
    images: [
      '/images/products/wig-blonde-model.jpg',
      '/images/products/wig-blonde-bust.jpg',
      '/images/products/wig-blonde-quarter.jpg',
      '/images/products/wig-blonde-side.jpg',
      '/images/products/wig-blonde-detail.jpg'
    ]
  },
  {
    slug: 'the-maison-chocolat-rich-brown-silk-bob-wig',
    images: [
      '/images/products/wig-brown-model.jpg',
      '/images/products/wig-brown-bust.jpg',
      '/images/products/wig-brown-quarter.jpg',
      '/images/products/wig-brown-side.jpg',
      '/images/products/wig-brown-detail.jpg'
    ]
  },
  {
    slug: 'the-havana-flame-burnt-orange-body-wave-wig',
    images: [
      '/images/products/wig-orange-model.jpg',
      '/images/products/wig-orange-bust.jpg',
      '/images/products/wig-orange-quarter.jpg',
      '/images/products/wig-orange-side.jpg',
      '/images/products/wig-orange-detail.jpg'
    ]
  },
  {
    slug: 'the-versailles-auburn-copper-silk-straight-wig',
    images: [
      '/images/products/wig-auburn-model.jpg',
      '/images/products/wig-auburn-bust.jpg',
      '/images/products/wig-auburn-quarter.jpg',
      '/images/products/wig-auburn-side.jpg',
      '/images/products/wig-auburn-detail.jpg'
    ]
  },
  {
    slug: 'the-bellissima-burgundy-wine-curl-wig',
    images: [
      '/images/products/wig-burgundy-model.jpg',
      '/images/products/wig-burgundy-bust.jpg',
      '/images/products/wig-burgundy-quarter.jpg',
      '/images/products/wig-burgundy-side.jpg',
      '/images/products/wig-burgundy-detail.jpg'
    ]
  },
  {
    slug: 'the-sovereign-emerald-jewel-body-wave-wig',
    images: [
      '/images/products/wig-emerald-model.jpg',
      '/images/products/wig-emerald-bust.jpg',
      '/images/products/wig-emerald-quarter.jpg',
      '/images/products/wig-emerald-side.jpg',
      '/images/products/wig-emerald-detail.jpg'
    ]
  },
  {
    slug: 'the-saint-tropez-honey-lemon-blonde-bob',
    images: [
      '/images/products/wig-lemon-model.jpg',
      '/images/products/wig-lemon-bust.jpg',
      '/images/products/wig-lemon-quarter.jpg',
      '/images/products/wig-lemon-side.jpg',
      '/images/products/wig-lemon-detail.jpg'
    ]
  }
];

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e) {}

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxehair';
console.log('Connecting to MongoDB...');

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 }).then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  for (const item of updates) {
    const res = await Product.updateOne(
      { slug: item.slug },
      { $set: { images: item.images } }
    );
    console.log(`Updated ${item.slug}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  await mongoose.disconnect();
  console.log('All 360 images synced successfully!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
