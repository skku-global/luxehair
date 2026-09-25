const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const brandConfig = require('../config/brand');
const { protect, optionalAuth, requireAdmin } = require('../middleware/auth');
const { checkoutLimiter, orderLookupLimiter } = require('../middleware/rateLimit');

const MAX_QUANTITY_PER_ITEM = 10;

/**
 * Helper: Generate unique Luxury Order Number
 * e.g., LXH-739281
 *
 * `orderNumber` is a unique index, so a collision used to surface as an E11000
 * and a failed checkout for a real customer. Six digits collide sooner than
 * intuition suggests (~50% chance somewhere in the set by ~1,100 orders), so
 * retry against the database before giving up.
 */
const generateOrderNumber = async () => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = `LXH-${Math.floor(100000 + Math.random() * 900000)}`;
    const clash = await Order.exists({ orderNumber: candidate });
    if (!clash) return candidate;
  }
  // Astronomically unlikely; fall back to a wider space rather than fail
  return `LXH-${Date.now().toString(36).toUpperCase()}`;
};

/**
 * Resolve the authentic price for a line item.
 *
 * The client sends the variant it picked, but the PRICE must come from our own
 * product document: trusting `item.selectedVariant.price` let a crafted request
 * buy any product for any amount.
 */
function resolveUnitPriceNgn(product, requestedVariant) {
  if (!requestedVariant) return { unitPriceNgn: product.price, variant: null };

  const variants = product.variants || [];
  if (variants.length === 0) return { unitPriceNgn: product.price, variant: null };

  // Match on the variant's own id first, then its name, then its attributes.
  // The attribute pass only runs when at least one attribute was supplied --
  // otherwise every condition is vacuously true and an unrecognised variant
  // would silently match (and be charged as) the first one in the list.
  const hasAttributes = Boolean(
    requestedVariant.length || requestedVariant.density || requestedVariant.color
  );

  const match =
    (requestedVariant._id && variants.find(v => v._id?.toString() === String(requestedVariant._id))) ||
    (requestedVariant.name && variants.find(v => v.name === requestedVariant.name)) ||
    (hasAttributes && variants.find(v =>
      (!requestedVariant.length || v.length === requestedVariant.length) &&
      (!requestedVariant.density || v.density === requestedVariant.density) &&
      (!requestedVariant.color || v.color === requestedVariant.color)
    ));

  if (!match) return { unitPriceNgn: product.price, variant: null };

  return {
    unitPriceNgn: match.price,
    variant: {
      name: match.name || '',
      length: match.length || '',
      density: match.density || '',
      color: match.color || ''
    }
  };
}

/**
 * Validate the shipping fee against the server-side table.
 * Returns the fee we are willing to charge, never the client's number.
 */
function resolveShippingFee(requestedFee, isUsd, subtotalInCurrency) {
  const threshold = isUsd
    ? brandConfig.freeShippingThreshold.USD
    : brandConfig.freeShippingThreshold.NGN;

  // Complimentary shipping is legitimate above the threshold
  if (subtotalInCurrency >= threshold) return 0;

  const allowed = (brandConfig.shippingOptions || []).map(o => (isUsd ? o.feeUsd : o.fee));
  const fee = Number(requestedFee);

  if (!Number.isFinite(fee) || fee < 0) return Math.min(...allowed);
  if (allowed.includes(fee)) return fee;

  // Unrecognised amount: fall back to the cheapest legitimate option rather
  // than honouring whatever the client asked for.
  return Math.min(...allowed);
}

/**
 * Look up a promo code in the server-side table and return the discount we are
 * willing to grant. The client sends a code only -- any percentage or amount in
 * the request is ignored, the same way variant prices and shipping fees are.
 */
function resolveDiscount(requestedCode, subtotalInCurrency) {
  const none = { discount: 0, couponCode: '', percentOff: 0 };

  if (!requestedCode || typeof requestedCode !== 'string') return none;

  const clean = requestedCode.trim().toUpperCase();
  if (!clean) return none;

  const coupon = (brandConfig.coupons || []).find(c => c.code === clean);
  if (!coupon) return none;

  const subtotal = Number(subtotalInCurrency);
  if (!Number.isFinite(subtotal) || subtotal <= 0) return none;

  // Round to whole naira, or to cents in USD, and never below zero
  const raw = subtotal * (coupon.percentOff / 100);
  const discount = Math.max(0, Math.min(subtotal, Math.round(raw * 100) / 100));

  return { discount, couponCode: coupon.code, percentOff: coupon.percentOff };
}

/**
 * @route   POST /api/orders
 * @desc    Create a new order (Supports logged-in user and guest checkout, NGN and USD currencies)
 * @access  Public / Optional Auth
 */
router.post('/', checkoutLimiter, optionalAuth, async (req, res, next) => {
  try {
    const {
      items,
      customerInfo,
      shippingAddress,
      paymentMethod,
      currency = 'NGN',
      shippingFee = 0,
      couponCode = '',
      notes = ''
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your shopping bag is empty. Please add items to order.'
      });
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, email address, and phone number are required.'
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address (street, city, state) is required.'
      });
    }

    const usdRate = brandConfig.currencies?.USD?.rate || 1500;
    const isUsd = currency.toUpperCase() === 'USD';

    /**
     * Pay-on-delivery eligibility was only checked in the checkout form, so a
     * crafted request could place an unlimited COD order anywhere in the
     * world. The same rules are applied here.
     */
    if (paymentMethod === 'payOnDelivery') {
      if (isUsd) {
        return res.status(400).json({
          success: false,
          message: 'Pay on Delivery is only available for orders settled in Naira.'
        });
      }

      const region = `${shippingAddress.state || ''} ${shippingAddress.city || ''}`.toLowerCase();
      const isServiceableRegion = region.includes('lagos') || region.includes('abuja');

      if (!isServiceableRegion) {
        return res.status(400).json({
          success: false,
          message: 'Pay on Delivery is only available within Lagos State and Abuja FCT.'
        });
      }
    }

    // Calculate verified server-side subtotal
    let subtotalNgn = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.productId || item.product || item._id;
      const product = await Product.findById(prodId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name}" is no longer available in our boutique.`
        });
      }

      // Price always comes from our own record, never from the request body
      const { unitPriceNgn, variant } = resolveUnitPriceNgn(product, item.selectedVariant);

      // Clamp quantity: a negative or absurd value would distort the total
      const requestedQty = Math.floor(Number(item.quantity));
      const itemQty = Number.isFinite(requestedQty)
        ? Math.min(Math.max(requestedQty, 1), MAX_QUANTITY_PER_ITEM)
        : 1;

      subtotalNgn += unitPriceNgn * itemQty;

      // Price stored on order item matches the checkout currency
      const finalItemPrice = isUsd
        ? Math.round((unitPriceNgn / usdRate) * 100) / 100
        : unitPriceNgn;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: item.image || (product.images && product.images[0]) || '',
        price: finalItemPrice,
        quantity: itemQty,
        selectedVariant: variant || {}
      });
    }

    const orderSubtotal = isUsd
      ? Math.round((subtotalNgn / usdRate) * 100) / 100
      : subtotalNgn;

    // Validated against the server-side table, not taken from the request
    const calculatedShipping = resolveShippingFee(shippingFee, isUsd, orderSubtotal);

    // Resolved from the code alone; the request cannot dictate the amount
    const { discount: calculatedDiscount, couponCode: appliedCoupon } =
      resolveDiscount(couponCode, orderSubtotal);

    const total = Math.round(
      (orderSubtotal - calculatedDiscount + calculatedShipping) * 100
    ) / 100;

    if (paymentMethod === 'payOnDelivery' && total > 350000) {
      return res.status(400).json({
        success: false,
        message: 'Pay on Delivery is restricted to orders up to \u20A6350,000. Please choose card or bank transfer.'
      });
    }

    const orderNumber = await generateOrderNumber();

    // Map payment processor
    let processor = 'paystack';
    if (paymentMethod === 'stripe') processor = 'stripe';
    else if (paymentMethod === 'bankTransfer') processor = 'manual';
    else if (paymentMethod === 'payOnDelivery') processor = 'cash';

    const initialPaymentStatus = 'pending';
    const initialOrderStatus = paymentMethod === 'payOnDelivery' ? 'confirmed' : 'pending';

    const order = await Order.create({
      orderNumber,
      customer: req.user ? req.user._id : null,
      customerInfo,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      paymentProcessor: processor,
      currency: isUsd ? 'USD' : 'NGN',
      exchangeRateUsed: isUsd ? usdRate : 1,
      paymentStatus: initialPaymentStatus,
      orderStatus: initialOrderStatus,
      pricingBreakdown: {
        subtotal: orderSubtotal,
        shippingFee: calculatedShipping,
        discount: calculatedDiscount,
        couponCode: appliedCoupon,
        total,
        currency: isUsd ? 'USD' : 'NGN',
        baseTotalNgn: isUsd ? Math.round(total * usdRate) : total
      },
      notes,
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date(),
          note: `Order registered in ${isUsd ? 'USD ($)' : 'NGN (₦)'} via ${processor.toUpperCase()}`
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/orders/my-orders
 * @desc    Fetch order history for the logged-in customer
 * @access  Private
 */
router.get('/my-orders', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [
        { customer: req.user._id },
        { 'customerInfo.email': req.user.email.toLowerCase() }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/orders/:orderNumber
 * @desc    Fetch single order by order reference number (for confirmation page & receipt)
 * @access  Public
 */
router.get('/:orderNumber', orderLookupLimiter, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/orders
 * @desc    Admin: View all store orders with status and payment filtering
 * @access  Private (Admin)
 */
router.get('/', protect, requireAdmin, async (req, res, next) => {
  try {
    const { status, paymentStatus, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'all') query.orderStatus = status;
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      orders
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Admin: Update order fulfillment status or payment status
 * @access  Private (Admin)
 */
router.put('/:id/status', protect, requireAdmin, async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.timeline.push({
        status: `Status changed to ${orderStatus}`,
        timestamp: new Date(),
        note: note || `Updated by admin concierge`
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully.',
      order
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

// Exported for testing: these two decide what a customer is actually charged.
module.exports.resolveUnitPriceNgn = resolveUnitPriceNgn;
module.exports.resolveShippingFee = resolveShippingFee;
module.exports.resolveDiscount = resolveDiscount;
