const mongoose = require('mongoose');

/**
 * Order Schema
 * Tracks customer purchases, line items, selected hair variants, delivery details,
 * and comprehensive payment statuses across Paystack, Direct Bank Transfer, and Pay On Delivery.
 */
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedVariant: {
    name: { type: String, default: '' },
    length: { type: String, default: '' },
    density: { type: String, default: '' },
    color: { type: String, default: '' }
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'stripe', 'bankTransfer', 'payOnDelivery'],
    required: true
  },
  // Tracks whether transaction was processed via Paystack (NGN), Stripe (USD), or Manual
  paymentProcessor: {
    type: String,
    enum: ['paystack', 'stripe', 'manual', 'cash'],
    default: 'paystack'
  },
  // Currency in which customer checked out
  currency: {
    type: String,
    enum: ['NGN', 'USD'],
    default: 'NGN'
  },
  exchangeRateUsed: {
    type: Number,
    default: 1
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  pricingBreakdown: {
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    total: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    baseTotalNgn: { type: Number, default: 0 } // original NGN value if converted to USD
  },
  paystackReference: {
    type: String,
    default: null
  },
  paystackPaidAt: {
    type: Date,
    default: null
  },
  stripeSessionId: {
    type: String,
    default: null
  },
  stripePaymentIntentId: {
    type: String,
    default: null
  },
  stripePaidAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
