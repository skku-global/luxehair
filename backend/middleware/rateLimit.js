/**
 * Dependency-free, in-memory rate limiting.
 *
 * NOTE: state lives in this process only. Behind multiple instances or a
 * horizontally scaled host, swap this for `express-rate-limit` with a shared
 * Redis store — otherwise each instance enforces its own separate quota.
 */

function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
    } else if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ success: false, message, retryAfter });
    } else {
      entry.count += 1;
    }

    // Opportunistic sweep so the map cannot grow without bound
    if (hits.size > 5000) {
      for (const [k, v] of hits) {
        if (now > v.resetAt) hits.delete(k);
      }
    }

    next();
  };
}

// Credential stuffing / brute force protection on the auth endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts from this address. Please try again in a few minutes.'
});

// Review spam
const reviewLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many reviews submitted from this address. Please try again later.'
});

// Order creation and payment endpoints: generous for real shoppers,
// tight enough to stop order-number enumeration and checkout abuse.
const checkoutLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: 'Too many checkout requests from this address. Please slow down and try again shortly.'
});

// Public order lookup: the main defence against walking the LXH-###### space
const orderLookupLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 40,
  message: 'Too many order lookups from this address. Please try again shortly.'
});

module.exports = {
  createRateLimiter,
  authLimiter,
  reviewLimiter,
  checkoutLimiter,
  orderLookupLimiter
};
