const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, requireAdmin } = require('../middleware/auth');

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

    // Filter by type (Attachments: Clip-In, Tape-In, Ponytail)
    const attachmentType = type || req.query.attachmentType;
    if (attachmentType && attachmentType !== 'all') {
      const cleanType = attachmentType.replace('-', '[- ]?');
      conditions.push({
        $or: [
          { name: { $regex: cleanType, $options: 'i' } },
          { tags: { $in: [new RegExp(cleanType, 'i')] } },
          { description: { $regex: cleanType, $options: 'i' } }
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
    const { identifier } = req.params;

    // Check whether identifier is ObjectId or slug string
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const product = isObjectId
      ? await Product.findById(identifier)
      : await Product.findOne({ slug: identifier });

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
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
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
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const product = isObjectId
      ? await Product.findById(id).select('reviews rating reviewsCount name')
      : await Product.findOne({ slug: id }).select('reviews rating reviewsCount name');

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
 * @desc    Submit a verified customer review
 * @access  Public
 */
router.post('/:id/reviews', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, rating, title, comment, verifiedPurchase } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Name, star rating (1-5), and review feedback are required.'
      });
    }

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const product = isObjectId
      ? await Product.findById(id)
      : await Product.findOne({ slug: id });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const numRating = Math.min(5, Math.max(1, Number(rating)));

    const newReview = {
      name,
      email: email || '',
      rating: numRating,
      title: title || '',
      comment,
      verifiedPurchase: verifiedPurchase !== undefined ? Boolean(verifiedPurchase) : true,
      createdAt: new Date()
    };

    if (!product.reviews) {
      product.reviews = [];
    }

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
