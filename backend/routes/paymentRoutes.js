const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');

// Paystack Secret Key from environment or fallback placeholder
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_luxehair_secret_key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * ============================================================================
 * PAYSTACK PAYMENT INTEGRATION EXPLAINER FOR LEARNERS:
 * ============================================================================
 * 
 * 1. Minor Units (Kobo vs Naira):
 *    Paystack processes Nigerian Naira (NGN) in 'kobo' (1 Naira = 100 Kobo).
 *    Never send 50000 for ₦50,000 — you must send 5000000 (amount * 100).
 * 
 * 2. Why Server-Side Initialization Matters:
 *    Never initiate payment amounts on the frontend directly. A malicious user
 *    could inspect network traffic and change ₦250,000 to ₦100.
 *    Instead, send the orderId to this endpoint. The backend looks up the true
 *    order total in MongoDB and tells Paystack the un-tamperable amount.
 * 
 * 3. Two-Way Confirmation (Callback + Webhook):
 *    - Callback (Client redirect): Good for immediate UI feedback to the user.
 *    - Webhook (Server-to-Server): The definitive truth. If user closes the tab
 *      during redirect, the webhook still hits our server and marks the order paid.
 * ============================================================================
 */

/**
 * @route   POST /api/payment/paystack/initialize
 * @desc    Initiate Paystack transaction and generate authorization URL
 * @access  Public
 */
router.post('/paystack/initialize', async (req, res, next) => {
  try {
    const { orderNumber, callbackUrl } = req.body;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order reference number is required to initialize payment.'
      });
    }

    // Step 1: Retrieve the order from the database to guarantee authentic pricing
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order record not found.'
      });
    }

    // Prevent re-paying an already settled order
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid for and confirmed.'
      });
    }

    // Step 2: Convert order total to Kobo (integer minor units)
    const amountInKobo = Math.round(order.pricingBreakdown.total * 100);

    // Step 3: Check if real Paystack live/test key is set vs test simulation mode
    const isMockKey = PAYSTACK_SECRET_KEY.startsWith('sk_test_mock');

    if (isMockKey) {
      // In local development without real API credentials, provide a seamless mock response
      // so you can test the entire checkout flow end-to-end without needing real cards!
      const simulatedRef = `LXH-PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      order.paystackReference = simulatedRef;
      await order.save();

      return res.json({
        success: true,
        isSimulated: true,
        data: {
          authorization_url: `${FRONTEND_URL}/order-confirmation/${order.orderNumber}?simulated=true&reference=${simulatedRef}`,
          access_code: `mock_access_${simulatedRef}`,
          reference: simulatedRef
        }
      });
    }

    // Step 4: Call official Paystack Initialize Transaction API
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: order.customerInfo.email,
        amount: amountInKobo,
        reference: `LXH-${order.orderNumber}-${Date.now()}`,
        callback_url: callbackUrl || `${FRONTEND_URL}/order-confirmation/${order.orderNumber}`,
        metadata: {
          orderNumber: order.orderNumber,
          orderId: order._id.toString(),
          customerName: order.customerInfo.name,
          customerPhone: order.customerInfo.phone,
          custom_fields: [
            {
              display_name: 'Order Number',
              variable_name: 'order_number',
              value: order.orderNumber
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Step 5: Persist transaction reference on order
    order.paystackReference = paystackResponse.data.data.reference;
    await order.save();

    res.json({
      success: true,
      data: paystackResponse.data.data
    });
  } catch (err) {
    console.error('[Paystack Initialize Error]:', err.response ? err.response.data : err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Could not initialize Paystack transaction.'
    });
  }
});

/**
 * @route   GET /api/payment/paystack/verify/:reference
 * @desc    Verify transaction with Paystack and confirm payment status
 * @access  Public
 */
router.get('/paystack/verify/:reference', async (req, res, next) => {
  try {
    const { reference } = req.params;
    const { orderNumber } = req.query;

    const order = await Order.findOne({
      $or: [
        { paystackReference: reference },
        { orderNumber: orderNumber }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No matching order found for this payment reference.'
      });
    }

    // Check if development simulation mode was used
    const isMockKey = PAYSTACK_SECRET_KEY.startsWith('sk_test_mock');
    if (isMockKey || reference.startsWith('LXH-PAY-')) {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.paystackPaidAt = new Date();
      order.paystackReference = reference;
      order.timeline.push({
        status: 'Payment Verified (Simulated)',
        timestamp: new Date(),
        note: `Payment verified for reference ${reference}`
      });
      await order.save();

      return res.json({
        success: true,
        message: 'Payment successfully verified.',
        order
      });
    }

    // Call official Paystack Verify API endpoint
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const transaction = response.data.data;

    // Critical Security Check:
    // 1. Transaction must be reported as "success" by Paystack
    // 2. Amount paid in kobo MUST match expected order total in kobo
    const expectedAmountInKobo = Math.round(order.pricingBreakdown.total * 100);

    if (transaction.status === 'success' && transaction.amount === expectedAmountInKobo) {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.paystackPaidAt = new Date(transaction.paid_at || Date.now());
      order.timeline.push({
        status: 'Payment Confirmed',
        timestamp: new Date(),
        note: `Paid via ${transaction.channel.toUpperCase()} (Ref: ${reference})`
      });
      await order.save();

      return res.json({
        success: true,
        message: 'Payment successfully verified and order confirmed.',
        order
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Amount discrepancy or declined status.',
        order
      });
    }
  } catch (err) {
    console.error('[Paystack Verify Error]:', err.response ? err.response.data : err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Error occurred while verifying payment.'
    });
  }
});

/**
 * @route   POST /api/payment/paystack/webhook
 * @desc    Paystack Webhook Handler with HMAC SHA512 Signature Verification
 * @access  Public (Called securely by Paystack's servers)
 * 
 * WHY THIS IS ESSENTIAL:
 * Anyone can try to POST fake data to your server claiming payment succeeded.
 * Paystack solves this by hashing the entire raw JSON body with your Secret Key
 * using SHA512 HMAC and passing it in 'x-paystack-signature'.
 * Only Paystack and you know this secret key!
 */
router.post('/paystack/webhook', async (req, res) => {
  try {
    // 1. Validate signature header exists
    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      console.warn('[Webhook Warning] Missing x-paystack-signature header.');
      return res.status(401).send('Missing signature');
    }

    // 2. Compute HMAC SHA512 digest from the raw body buffer
    // Note: express.raw() or rawBody preservation in server.js provides req.rawBody
    const bodyToHash = req.rawBody ? req.rawBody : JSON.stringify(req.body);
    const expectedHash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(bodyToHash)
      .digest('hex');

    // Reject if signature does not match
    if (signature !== expectedHash && !PAYSTACK_SECRET_KEY.startsWith('sk_test_mock')) {
      console.warn('[Webhook Warning] Invalid Paystack signature detected. Request rejected.');
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    console.log(`[Paystack Webhook] Received event: ${event.event}`);

    // Handle successful charge event
    if (event.event === 'charge.success') {
      const data = event.data;
      const orderNumber = data.metadata?.orderNumber;
      const reference = data.reference;

      const order = await Order.findOne({
        $or: [
          { orderNumber: orderNumber },
          { paystackReference: reference }
        ]
      });

      if (order && order.paymentStatus !== 'paid') {
        const expectedKobo = Math.round(order.pricingBreakdown.total * 100);

        if (data.amount === expectedKobo) {
          order.paymentStatus = 'paid';
          order.orderStatus = 'confirmed';
          order.paystackPaidAt = new Date(data.paid_at || Date.now());
          order.timeline.push({
            status: 'Payment Confirmed via Webhook',
            timestamp: new Date(),
            note: `Payment confirmed via Paystack Webhook (Ref: ${reference})`
          });
          await order.save();
          console.log(`[Paystack Webhook] Order ${order.orderNumber} successfully marked as PAID.`);
        }
      }
    }

    // Always respond with 200 OK immediately so Paystack doesn't re-send the webhook
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Paystack Webhook Error]:', err);
    return res.status(500).json({ error: 'Internal webhook error' });
  }
});

/**
 * @route   POST /api/payment/bank-transfer/submit-proof
 * @desc    Submit bank transfer reference/payer name for manual verification
 * @access  Public
 */
router.post('/bank-transfer/submit-proof', async (req, res, next) => {
  try {
    const { orderNumber, senderName, bankName, transferReference } = req.body;

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    order.timeline.push({
      status: 'Bank Transfer Details Submitted',
      timestamp: new Date(),
      note: `Sender: ${senderName} | Bank: ${bankName} | Ref: ${transferReference || 'N/A'}`
    });
    order.notes = `Bank Transfer Confirmation Pending. Sender: ${senderName}, Bank: ${bankName}, Ref: ${transferReference}`;
    await order.save();

    res.json({
      success: true,
      message: 'Transfer details submitted. Our luxury concierge will confirm and dispatch.',
      order
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ============================================================================
 * STRIPE DUAL-PAYMENT INTEGRATION EXPLAINER FOR LEARNERS:
 * ============================================================================
 * 
 * 1. Why Stripe for International Buyers:
 *    While Paystack is the undisputed gold standard for Nigerian cards & bank accounts,
 *    international customers (in the US, UK, Canada, Europe) frequently experience
 *    fraud blocks or 3DS failures when attempting cross-border transactions on African gateways.
 *    Stripe provides native, frictionless checkout with Apple Pay, Google Pay, Amex, and Visa/Mastercard.
 * 
 * 2. Minor Currency Units (USD Cents):
 *    Like Paystack uses Kobo, Stripe calculates USD in 'cents' ($1.00 = 100 cents).
 *    A wig priced at $256.67 must be passed to Stripe as 25667 (Math.round(amount * 100)).
 * 
 * 3. Stripe Checkout Sessions:
 *    Rather than building and maintaining custom PCI-DSS compliant credit card forms,
 *    Stripe Checkout provides a hosted, localized, fraud-protected payment experience.
 * ============================================================================
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_luxehair_stripe_key';
const stripe = (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock'))
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * @route   POST /api/payment/stripe/create-checkout-session
 * @desc    Create a Stripe Checkout Session for international USD orders
 * @access  Public
 */
router.post('/stripe/create-checkout-session', async (req, res, next) => {
  try {
    const { orderNumber, callbackUrl } = req.body;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order reference number is required.'
      });
    }

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This order is already paid for.'
      });
    }

    // Ensure order total is converted to USD cents integer
    // e.g. $256.67 -> 25667 cents
    const totalInCents = Math.round(order.pricingBreakdown.total * 100);

    const isMockStripe = !stripe || STRIPE_SECRET_KEY.startsWith('sk_test_mock');

    if (isMockStripe) {
      // In local development / preview mode without live Stripe credentials,
      // provide a seamless simulated session redirect
      const simulatedSessionId = `cs_test_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      order.stripeSessionId = simulatedSessionId;
      order.paymentProcessor = 'stripe';
      order.currency = 'USD';
      await order.save();

      return res.json({
        success: true,
        isSimulated: true,
        sessionId: simulatedSessionId,
        url: `${FRONTEND_URL}/order-confirmation/${order.orderNumber}?stripe_session_id=${simulatedSessionId}&simulated=true`
      });
    }

    // Official Stripe Checkout Session creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: order.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.selectedVariant?.name || 'Haute Coiffure Virgin Unit',
            images: item.image?.startsWith('http') ? [item.image] : []
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      customer_email: order.customerInfo.email,
      client_reference_id: order.orderNumber,
      metadata: {
        orderNumber: order.orderNumber,
        orderId: order._id.toString()
      },
      success_url: `${callbackUrl || `${FRONTEND_URL}/order-confirmation/${order.orderNumber}`}?stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout?cancelled=true&orderNumber=${order.orderNumber}`
    });

    order.stripeSessionId = session.id;
    order.paymentProcessor = 'stripe';
    order.currency = 'USD';
    await order.save();

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (err) {
    console.error('[Stripe Session Error]:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Could not create Stripe checkout session.'
    });
  }
});

/**
 * @route   GET /api/payment/stripe/verify/:sessionId
 * @desc    Verify Stripe session completion and confirm order payment
 * @access  Public
 */
router.get('/stripe/verify/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { orderNumber } = req.query;

    const order = await Order.findOne({
      $or: [
        { stripeSessionId: sessionId },
        { orderNumber: orderNumber }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No matching order found for this Stripe session.'
      });
    }

    const isMockStripe = !stripe || sessionId.startsWith('cs_test_mock');

    if (isMockStripe) {
      // Confirm payment in development simulation
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.stripePaidAt = new Date();
      order.paymentProcessor = 'stripe';
      order.timeline.push({
        status: 'Payment Verified (Stripe USD Simulated)',
        timestamp: new Date(),
        note: `International payment confirmed in USD ($${order.pricingBreakdown.total})`
      });
      await order.save();

      return res.json({
        success: true,
        message: 'Stripe payment verified successfully.',
        order
      });
    }

    // Official Stripe Session verification
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.stripePaidAt = new Date();
      order.stripePaymentIntentId = session.payment_intent;
      order.paymentProcessor = 'stripe';
      order.timeline.push({
        status: 'Payment Verified (Stripe USD)',
        timestamp: new Date(),
        note: `Paid via Stripe Card ($${order.pricingBreakdown.total} USD)`
      });
      await order.save();

      return res.json({
        success: true,
        message: 'Stripe payment successfully confirmed.',
        order
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Stripe session payment status is "${session.payment_status}".`,
        order
      });
    }
  } catch (err) {
    console.error('[Stripe Verify Error]:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error occurred while verifying Stripe payment.'
    });
  }
});

/**
 * @route   POST /api/payment/stripe/webhook
 * @desc    Stripe Webhook Handler
 * @access  Public (Called securely by Stripe servers)
 */
router.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && stripe) {
      const rawBody = req.rawBody ? req.rawBody : JSON.stringify(req.body);
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error('[Stripe Webhook Signature Error]:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout session event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderNumber = session.client_reference_id || session.metadata?.orderNumber;

    const order = await Order.findOne({
      $or: [
        { stripeSessionId: session.id },
        { orderNumber: orderNumber }
      ]
    });

    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.stripePaidAt = new Date();
      order.stripePaymentIntentId = session.payment_intent;
      order.paymentProcessor = 'stripe';
      order.timeline.push({
        status: 'Payment Confirmed via Stripe Webhook',
        timestamp: new Date(),
        note: `Stripe charge completed for order ${order.orderNumber}`
      });
      await order.save();
      console.log(`[Stripe Webhook] Order ${order.orderNumber} successfully marked as PAID.`);
    }
  }

  res.json({ received: true });
});

module.exports = router;

