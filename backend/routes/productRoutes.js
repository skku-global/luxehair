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
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Filter by category (wigs, attachments, hair-care)
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by hair texture
    if (texture && texture !== 'all') {
      query['specifications.texture'] = texture;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Full-text search on name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

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

module.exports = router;
