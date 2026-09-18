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
  // Category-specific technical specifications
  specifications: {
    hairType: { type: String, default: '' },
    origin: { type: String, default: '' },
    laceType: { type: String, default: '' },
    hairGrade: { type: String, default: '' },
    capSize: { type: String, default: '' },
    longevity: { type: String, default: '' },
    texture: { type: String, default: '' }, // For Wigs: Bone Straight, Deep Wave, Body Wave, Blunt Cut Bob, Natural Blowout
    attachmentType: { type: String, default: '' }, // For Attachments: Clip-In, Tape-In, Ponytail
    colorTone: { type: String, default: '' }, // For Attachments: Natural Black (#1B), Jet Black (#1), Honey Balayage (#27), Chocolate Brown (#4)
    productType: { type: String, default: '' }, // For Hair Care: Oil, Spray, Serum
    volume: { type: String, default: '' }, // e.g., '100ml / 3.4 fl oz'
    keyIngredients: { type: String, default: '' }, // for hair care formulations
    applicationMethod: { type: String, default: '' }, // for attachments e.g. Silicone Weft, PU Tape, Velcro Wrap
    colorName: { type: String, default: 'Natural Black #1B' },
    colorHex: { type: String, default: '#1A1817' },
    availableColors: [{
      name: { type: String, default: '' },
      hex: { type: String, default: '' }
    }]
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
