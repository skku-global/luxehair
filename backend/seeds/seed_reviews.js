require('dotenv').config({ path: __dirname + '/../.env' });
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e) {}
const mongoose = require('mongoose');
const { formatMongoUri } = require('../config/db');

const sampleReviewsPool = [
  {
    name: 'Chioma Adeleke',
    rating: 5,
    title: 'Absolute Perfection — The HD Lace Melts Seamlessly',
    comment: 'The hair quality exceeded all my expectations. The lace literally dissolved against my scalp with zero bleaching required. Hair remains silky and bouncy even after 3 washes.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 3 * 86400000)
  },
  {
    name: 'Zainab Balogun',
    rating: 5,
    title: 'Luxury in a Box — Worth Every Kobo',
    comment: 'Packaged like high jewelry! The texture is full from root to tip with zero split ends. I received compliments everywhere in Victoria Island.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 7 * 86400000)
  },
  {
    name: 'Amara Nwosu',
    rating: 5,
    title: 'Silky, Tangle-Free and Lightweight',
    comment: 'I wore this unit to an evening gala in Abuja. Heat styling held the curl pattern all night. 10/10 craftsmanship.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 12 * 86400000)
  },
  {
    name: 'Sophie Laurent',
    rating: 5,
    title: 'International Standard Quality',
    comment: 'Ordered from London and arrived in 4 days via DHL Express. Unbelievable density and natural movement. My stylist was completely stunned.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 15 * 86400000)
  },
  {
    name: 'Folashade Alakija',
    rating: 4,
    title: 'Exquisite Hair Density & Shine',
    comment: 'Sublime shine without being greasy. Cap fits securely with the adjustable strap. Will definitely be purchasing my second unit next month.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 20 * 86400000)
  }
];

async function seedReviews() {
  const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxehair';
  const mongoUri = formatMongoUri ? formatMongoUri(rawUri) : rawUri;
  console.log(`[Reviews Seed] Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);
  const Product = mongoose.model('Product', new mongoose.Schema({
    name: String,
    rating: Number,
    reviewsCount: Number,
    reviews: Array
  }));

  const products = await Product.find({});
  console.log(`Found ${products.length} products to seed reviews for.`);

  for (const prod of products) {
    // Pick 2-4 reviews
    const count = 3;
    const prodReviews = sampleReviewsPool.slice(0, count);
    const avgRating = Number((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1));

    await Product.updateOne(
      { _id: prod._id },
      {
        $set: {
          reviews: prodReviews,
          rating: avgRating,
          reviewsCount: prodReviews.length
        }
      }
    );
  }

  console.log('✅ Successfully seeded reviews across all boutique products!');
  process.exit(0);
}

seedReviews().catch(err => {
  console.error(err);
  process.exit(1);
});
