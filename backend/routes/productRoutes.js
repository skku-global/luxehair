const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, requireAdmin, optionalAuth } = require('../middleware/auth');
const { reviewLimiter } = require('../middleware/rateLimit');

/** Fields an admin is permitted to change through the update endpoint. */
const PRODUCT_UPDATABLE_FIELDS = [
  'name', 'category', 'price', 'compareAtPrice', 'description', 'shortDescription',
  'specifications', 'images', 'variants', 'inStock', 'stockQuantity',
  'isFeatured', 'isBestseller', 'tags'
];

/** Resolve a product by Mongo ObjectId or URL slug. */
function findProductByIdentifier(identifier, projection) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId ? { _id: identifier } : { slug: identifier };
  return projection ? Product.findOne(query).select(projection) : Product.findOne(query);
}

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, search, sorting, and pagination
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      texture,
      length,
      type,
      color,
      productType,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const conditions = [];

    // Filter by category (wigs, attachments, hair-care)
    if (category && category !== 'all') {
      conditions.push({ category });
    }

    // Filter by hair texture (Wigs)
    if (texture && texture !== 'all') {
      conditions.push({ 'specifications.texture': texture });
    }

    // Filter by hair length (Wigs)
    if (length && length !== 'all') {
      conditions.push({ 'variants.length': { $regex: length, $options: 'i' } });
    }

    // Filter by type (Attachments: Clip-In, Weft, Tape-In, Nano-Tip, Keratin, Ponytail)
    const attachmentType = type || req.query.attachmentType;
    if (attachmentType && attachmentType !== 'all') {
      const cleanType = attachmentType.replace(/-/g, '[- ]?');
      conditions.push({
        $or: [
          { 'specifications.attachmentType': { $regex: cleanType, $options: 'i' } },
          { name: { $regex: cleanType, $options: 'i' } },
          { tags: { $in: [new RegExp(cleanType, 'i')] } }
        ]
      });
    }

    // Filter by color (Attachments)
    if (color && color !== 'all') {
      conditions.push({ 'variants.color': { $regex: color, $options: 'i' } });
    }

    // Filter by product type (Hair Care: Oil, Spray, Serum)
    const careType = productType || (category === 'hair-care' ? type : null);
    if (careType && careType !== 'all') {
      conditions.push({
        $or: [
          { name: { $regex: careType, $options: 'i' } },
          { tags: { $in: [new RegExp(careType, 'i')] } },
          { 'specifications.texture': { $regex: careType, $options: 'i' } },
          { description: { $regex: careType, $options: 'i' } }
        ]
      });
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      conditions.push({ price: priceFilter });
    }

    // Full-text search on name and description
    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    // Determine sorting logic
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'popular') sortOptions = { isBestseller: -1, rating: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/products/featured
 * @desc    Fetch curated featured & bestseller products for the home hero showcase
 * @access  Public
 */
router.get('/featured', async (req, res, next) => {
  try {
    const featured = await Product.find({ isFeatured: true }).limit(8);
    const bestsellers = await Product.find({ isBestseller: true }).limit(8);

    res.json({
      success: true,
      featured,
      bestsellers
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/products/:identifier
 * @desc    Get single product by Mongo ID or URL slug with related suggestions
 * @access  Public
 */
router.get('/:identifier', async (req, res, next) => {
  try {
    const product = await findProductByIdentifier(req.params.identifier);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Fetch related products in same category (excluding current)
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);

    res.json({
      success: true,
      product,
      related
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new luxury product (Admin Only)
 * @access  Private (Admin)
 */
router.post('/', protect, requireAdmin, async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      compareAtPrice,
      description,
      shortDescription,
      specifications,
      images,
      variants,
      inStock,
      stockQuantity,
      isFeatured,
      isBestseller,
      tags
    } = req.body;

    if (!name || !category || !price || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, and description are required.'
      });
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
      description,
      shortDescription: shortDescription || '',
      specifications: specifications || {},
      images: images && images.length > 0 ? images : ['/images/products/placeholder-hair.jpg'],
      variants: variants || [],
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 20,
      isFeatured: Boolean(isFeatured),
      isBestseller: Boolean(isBestseller),
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product (Admin Only)
 * @access  Private (Admin)
 */
router.put('/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    // Only whitelisted fields may be updated — never trust the request body wholesale
    // (an unrestricted $set lets a caller overwrite reviews, rating, slug or _id).
    const updates = {};
    for (const field of PRODUCT_UPDATABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updatable product fields were supplied.'
      });
    }

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.compareAtPrice !== undefined) updates.compareAtPrice = Number(updates.compareAtPrice);
    if (updates.stockQuantity !== undefined) updates.stockQuantity = Number(updates.stockQuantity);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product from the catalog (Admin Only)
 * @access  Private (Admin)
 */
router.delete('/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/products/:id/reviews
 * @desc    Get all reviews for a product
 * @access  Public
 */
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const product = await findProductByIdentifier(req.params.id, 'reviews rating reviewsCount name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({
      success: true,
      reviews: product.reviews || [],
      rating: product.rating,
      reviewsCount: product.reviewsCount
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Submit a customer review. Verified-purchase status is determined
 *          server-side from order history — never taken from the request body.
 * @access  Public (rate limited); purchase verification requires a logged-in user
 */
router.post('/:id/reviews', reviewLimiter, optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
    const rating = Number(req.body.rating);

    const errors = [];
    if (name.length < 2 || name.length > 80) {
      errors.push('Name must be between 2 and 80 characters.');
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      errors.push('Star rating must be a number between 1 and 5.');
    }
    if (comment.length < 10 || comment.length > 2000) {
      errors.push('Review must be between 10 and 2000 characters.');
    }
    if (title.length > 120) {
      errors.push('Review title must be 120 characters or fewer.');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email address is not valid.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    const product = await findProductByIdentifier(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (!product.reviews) product.reviews = [];

    // One review per customer per product
    const authorEmail = req.user?.email ? req.user.email.toLowerCase() : email;
    const alreadyReviewed = product.reviews.some((r) => {
      if (req.user && r.user && String(r.user) === String(req.user._id)) return true;
      return Boolean(authorEmail) && (r.email || '').toLowerCase() === authorEmail;
    });

    if (alreadyReviewed) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this piece. Please edit your existing review instead.'
      });
    }

    // Verified-purchase badge is earned, not claimed: it requires a paid order
    // placed by the authenticated account that contains this product.
    let verifiedPurchase = false;
    if (req.user) {
      const paidOrder = await Order.findOne({
        customer: req.user._id,
        'items.product': product._id,
        $or: [
          { paymentStatus: 'paid' },
          { orderStatus: 'delivered' } // covers pay-on-delivery orders
        ]
      }).select('_id');
      verifiedPurchase = Boolean(paidOrder);
    }

    const newReview = {
      user: req.user ? req.user._id : null,
      name,
      email: req.user?.email || email,
      rating: Math.round(rating),
      title,
      comment,
      verifiedPurchase,
      createdAt: new Date()
    };

    product.reviews.unshift(newReview);

    // Recalculate average rating & reviewsCount
    const totalScore = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Number((totalScore / product.reviews.length).toFixed(1));
    product.reviewsCount = product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your atelier review has been published.',
      review: newReview,
      rating: product.rating,
      reviewsCount: product.reviewsCount
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
