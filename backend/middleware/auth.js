const jwt = require('jsonwebtoken');
const User = require('../models/User');

const crypto = require('crypto');

/**
 * JWT signing secret.
 * Must be supplied via the environment. There is deliberately no hardcoded
 * fallback: a committed secret lets anyone mint valid admin tokens.
 * In production a missing secret is fatal; in development we generate an
 * ephemeral one so the server still boots (sessions reset on restart).
 */
function resolveJwtSecret() {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv.trim().length >= 32) return fromEnv.trim();

  if (process.env.NODE_ENV === 'production') {
    console.error('[Auth] JWT_SECRET is missing or shorter than 32 characters. Refusing to start.');
    console.error('[Auth] Generate one with:  openssl rand -hex 48');
    process.exit(1);
  }

  if (fromEnv && fromEnv.trim()) {
    console.warn('[Auth] JWT_SECRET is shorter than 32 characters — using it anyway in development.');
    return fromEnv.trim();
  }

  console.warn('[Auth] JWT_SECRET not set — using a random development secret. Tokens will not survive a restart.');
  return crypto.randomBytes(48).toString('hex');
}

const JWT_SECRET = resolveJwtSecret();

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
