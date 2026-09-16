const mongoose = require('mongoose');

/**
 * Product Schema
 * Specialized for luxury hair catalog: Wigs, Attachments, and Hair Care.
 * Includes multi-variant options (lengths, textures, densities, shades),
 * rich specs (lace type, hair grade, origin), and pricing deltas.
 */
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., '24" / 200% Density / Natural Black'
  length: { type: String, default: '' },   // e.g., '24 inches'
  density: { type: String, default: '' },  // e.g., '200%'
  color: { type: String, default: '' },    // e.g., 'Natural Dark Brown #1B'
  texture: { type: String, default: '' },  // e.g., 'Bone Straight'
  price: { type: Number, required: true },  // specific price for this variant
  stock: { type: Number, default: 10 },
  sku: { type: String, default: '' }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['wigs', 'attachments', 'hair-care']
  },
  price: {
    type: Number,
    required: [true, 'Base price is required'],
    min: 0
  },
  compareAtPrice: {
    type: Number,
    default: 0
  },
  shortDescription: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  // Hair specific technical specifications
  specifications: {
    hairType: { type: String, default: '100% Unprocessed Raw Human Hair' },
    origin: { type: String, default: 'Single Donor Southeast Asian' },
    laceType: { type: String, default: 'Ultra-Thin HD Swiss Lace' },
    hairGrade: { type: String, default: '14A Double Drawn' },
    capSize: { type: String, default: 'Medium (22"-22.5") Adjustable' },
    longevity: { type: String, default: '3 - 5 Years with Proper Care' },
    texture: { type: String, default: 'Bone Straight' },
    volume: { type: String, default: '' }, // for serums/care products e.g., '100ml / 3.4 fl oz'
    keyIngredients: { type: String, default: '' } // for hair care products
  },
  images: [{
    type: String,
    required: true
  }],
  variants: [variantSchema],
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 25
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4.9,
    min: 1,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 18
  },
  tags: [String]
}, { timestamps: true });

// Auto-generate URL slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
