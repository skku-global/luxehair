const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, JWT_SECRET } = require('../middleware/auth');

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

module.exports = router;
