const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, requireAdmin, JWT_SECRET } = require('../middleware/auth');

/**
 * Helper: Generate Signed JWT Token
 * Signs token containing user ID and role with a 30-day expiration.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer account
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and a secure password.'
      });
    }

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Create new customer
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'customer'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate customer or admin and return JWT
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    // Verify bcrypt password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Fetch authenticated user profile details
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile name, phone, or password
 * @access  Private
 */
router.put('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.password) user.password = req.body.password;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/addresses
 * @desc    Add a saved delivery address to customer profile
 * @access  Private
 */
router.post('/addresses', protect, async (req, res, next) => {
  try {
    const { fullName, phone, street, city, state, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    // If marked as default, unset previous defaults
    if (isDefault) {
      user.savedAddresses.forEach(addr => { addr.isDefault = false; });
    }

    user.savedAddresses.push({
      fullName,
      phone,
      street,
      city,
      state,
      isDefault: Boolean(isDefault)
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      addresses: user.savedAddresses
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/auth/addresses/:id
 * @desc    Delete a saved delivery address
 * @access  Private
 */
router.delete('/addresses/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedAddresses = user.savedAddresses.filter(
      addr => addr._id.toString() !== req.params.id
    );
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully.',
      addresses: user.savedAddresses
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/admin/customers
 * @desc    Fetch all registered & client accounts with order spending metrics, order history & VIP tier
 * @access  Private (Admin Only)
 */
router.get('/admin/customers', protect, requireAdmin, async (req, res, next) => {
  try {
    const { search = '', tier = 'all' } = req.query;

    // Fetch all registered customers
    const users = await User.find({ role: 'customer' }).select('-password').lean();

    // Fetch all orders to aggregate customer spend & order metrics
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    // Map customer email -> orders
    const ordersByEmail = {};
    for (const ord of orders) {
      const email = (ord.customerInfo?.email || '').toLowerCase().trim();
      if (!email) continue;
      if (!ordersByEmail[email]) ordersByEmail[email] = [];
      ordersByEmail[email].push(ord);
    }

    // Build rich customer profiles
    const customerList = [];
    const processedEmails = new Set();

    for (const u of users) {
      const email = u.email.toLowerCase().trim();
      processedEmails.add(email);
      const userOrders = ordersByEmail[email] || [];

      // Calculate spending metrics
      let totalSpentNgn = 0;
      let totalSpentUsd = 0;
      let paidOrdersCount = 0;

      for (const ord of userOrders) {
        const total = ord.pricingBreakdown?.total || 0;
        if (ord.currency === 'USD') {
          if (ord.paymentStatus === 'paid') totalSpentUsd += total;
        } else {
          if (ord.paymentStatus === 'paid') totalSpentNgn += total;
        }
        if (ord.paymentStatus === 'paid') paidOrdersCount++;
      }

      // Determine VIP tier based on spend
      let vipTier = 'Bronze VIP';
      let vipColor = '#CD7F32';
      if (totalSpentNgn >= 1500000 || totalSpentUsd >= 1500) {
        vipTier = 'Diamond VIP';
        vipColor = '#E5E4E2';
      } else if (totalSpentNgn >= 750000 || totalSpentUsd >= 750) {
        vipTier = 'Gold VIP';
        vipColor = '#C9A876';
      } else if (totalSpentNgn >= 300000 || totalSpentUsd >= 300) {
        vipTier = 'Silver VIP';
        vipColor = '#A8A9AD';
      }

      customerList.push({
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        savedAddresses: u.savedAddresses || [],
        ordersCount: userOrders.length,
        paidOrdersCount,
        totalSpentNgn,
        totalSpentUsd,
        vipTier,
        vipColor,
        latestOrder: userOrders[0] || null,
        recentOrders: userOrders.slice(0, 5)
      });
    }

    // Also include guest clients with placed orders
    for (const [email, userOrders] of Object.entries(ordersByEmail)) {
      if (processedEmails.has(email)) continue;
      const firstOrd = userOrders[0];
      const name = firstOrd.customerInfo?.name || 'Guest Client';
      const phone = firstOrd.customerInfo?.phone || '';

      let totalSpentNgn = 0;
      let totalSpentUsd = 0;
      let paidOrdersCount = 0;

      for (const ord of userOrders) {
        const total = ord.pricingBreakdown?.total || 0;
        if (ord.currency === 'USD') {
          if (ord.paymentStatus === 'paid') totalSpentUsd += total;
        } else {
          if (ord.paymentStatus === 'paid') totalSpentNgn += total;
        }
        if (ord.paymentStatus === 'paid') paidOrdersCount++;
      }

      let vipTier = 'Bronze VIP';
      let vipColor = '#CD7F32';
      if (totalSpentNgn >= 1500000 || totalSpentUsd >= 1500) {
        vipTier = 'Diamond VIP';
        vipColor = '#E5E4E2';
      } else if (totalSpentNgn >= 750000 || totalSpentUsd >= 750) {
        vipTier = 'Gold VIP';
        vipColor = '#C9A876';
      } else if (totalSpentNgn >= 300000 || totalSpentUsd >= 300) {
        vipTier = 'Silver VIP';
        vipColor = '#A8A9AD';
      }

      customerList.push({
        _id: `guest_${email}`,
        isGuest: true,
        name,
        email,
        phone,
        role: 'guest',
        createdAt: userOrders[userOrders.length - 1].createdAt,
        savedAddresses: firstOrd.shippingAddress ? [firstOrd.shippingAddress] : [],
        ordersCount: userOrders.length,
        paidOrdersCount,
        totalSpentNgn,
        totalSpentUsd,
        vipTier,
        vipColor,
        latestOrder: firstOrd,
        recentOrders: userOrders.slice(0, 5)
      });
    }

    // Filter by search
    let filtered = customerList;
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    }

    // Filter by tier
    if (tier && tier !== 'all') {
      filtered = filtered.filter(c => c.vipTier.toLowerCase().includes(tier.toLowerCase()));
    }

    // Sort: highest spending first
    filtered.sort((a, b) => (b.totalSpentNgn + b.totalSpentUsd * 1500) - (a.totalSpentNgn + a.totalSpentUsd * 1500));

    res.json({
      success: true,
      count: filtered.length,
      customers: filtered
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
