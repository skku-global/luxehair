const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'luxehair_jwt_super_secret_key_2026';

/**
 * Authentication Middleware: Verify Bearer Token
 * Extracts JWT from the Authorization header, validates signature,
 * and sets req.user to the authenticated user database document.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to access this resource.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session token has expired or is invalid. Please log in again.'
    });
  }
};

/**
 * Optional Authentication Middleware
 * If a token is supplied, it attaches the user; if not, request proceeds as guest.
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Ignore invalid token for optional auth, continue as guest
      req.user = null;
    }
  }
  next();
};

/**
 * Role-Based Access Control: Admin Guard
 * Restricts access to store owners / administrators only.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges are required for this action.'
    });
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  requireAdmin,
  JWT_SECRET
};
