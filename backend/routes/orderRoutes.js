const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const brandConfig = require('../config/brand');
const { protect, optionalAuth, requireAdmin } = require('../middleware/auth');

/**
 * Helper: Generate unique Luxury Order Number
 * e.g., LXH-739281
 */
const generateOrderNumber = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `LXH-${randomDigits}`;
};

/**
 * @route   POST /api/orders
 * @desc    Create a new order (Supports logged-in user and guest checkout, NGN and USD currencies)
 * @access  Public / Optional Auth
 */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      items,
      customerInfo,
      shippingAddress,
      paymentMethod,
      currency = 'NGN',
      shippingFee = 0,
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

      // Check variant price if variant was chosen (base price is stored in NGN)
      let unitPriceNgn = product.price;
      if (item.selectedVariant && item.selectedVariant.price) {
        unitPriceNgn = item.selectedVariant.price;
      }

      const itemQty = Number(item.quantity) || 1;
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
        selectedVariant: item.selectedVariant || {}
      });
    }

    const calculatedShipping = Number(shippingFee) || 0;
    const orderSubtotal = isUsd
      ? Math.round((subtotalNgn / usdRate) * 100) / 100
      : subtotalNgn;
    const total = Math.round((orderSubtotal + calculatedShipping) * 100) / 100;
    const orderNumber = generateOrderNumber();

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
        discount: 0,
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
router.get('/:orderNumber', async (req, res, next) => {
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
