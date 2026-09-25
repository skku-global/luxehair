import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Building, Banknote, ArrowRight, CheckCircle2, Copy, Check, Globe } from 'lucide-react';
import { BRAND, formatPrice, convertPrice } from '../config/brand';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, finalSubtotal, discountAmount, couponCode, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { currency, setCurrency, isUsd, format, formatDirect } = useCurrency();

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: 'Lagos',
    state: 'Lagos State'
  });

  const [selectedShipping, setSelectedShipping] = useState(
    isUsd ? BRAND.shippingOptions.find(o => o.id === 'international-dhl') : BRAND.shippingOptions[0]
  );
  const [paymentMethod, setPaymentMethod] = useState(isUsd ? 'stripe' : 'paystack');
  const [orderNotes, setOrderNotes] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle currency toggle from within checkout
  const handleCurrencySelect = (newCurr) => {
    setCurrency(newCurr);
    if (newCurr === 'USD') {
      setPaymentMethod('stripe');
      const intlOpt = BRAND.shippingOptions.find(o => o.id === 'international-dhl');
      if (intlOpt) setSelectedShipping(intlOpt);
      if (shippingAddress.state === 'Lagos State') {
        setShippingAddress(prev => ({ ...prev, city: 'London', state: 'Greater London / International' }));
      }
    } else {
      setPaymentMethod('paystack');
      setSelectedShipping(BRAND.shippingOptions[0]);
      if (shippingAddress.city === 'London') {
        setShippingAddress(prev => ({ ...prev, city: 'Lagos', state: 'Lagos State' }));
      }
    }
  };

  // Prefill info if authenticated
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });

      const defaultAddr = user.savedAddresses?.find(a => a.isDefault) || user.savedAddresses?.[0];
      if (defaultAddr) {
        setShippingAddress({
          fullName: defaultAddr.fullName || user.name || '',
          phone: defaultAddr.phone || user.phone || '',
          street: defaultAddr.street || '',
          city: defaultAddr.city || 'Lagos',
          state: defaultAddr.state || 'Lagos State'
        });
      } else {
        setShippingAddress(prev => ({
          ...prev,
          fullName: user.name || '',
          phone: user.phone || ''
        }));
      }
    }
  }, [user]);

  // If cart is empty, redirect to shop
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Pricing calculations according to active currency
  const subtotalInActiveCurrency = isUsd ? convertPrice(finalSubtotal, 'USD') : finalSubtotal;
  const discountInActiveCurrency = isUsd ? convertPrice(discountAmount, 'USD') : discountAmount;

  // Free shipping check: in USD, orders >= $200 free; in NGN, orders >= ₦250k free for Lagos Express
  const isEligibleForFreeShipping = isUsd
    ? subtotalInActiveCurrency >= 200
    : finalSubtotal >= 250000 && selectedShipping?.id === 'standard-lagos';

  const baseShippingFee = isUsd
    ? (selectedShipping?.feeUsd || 35)
    : (selectedShipping?.fee || 3500);

  const calculatedShippingFee = isEligibleForFreeShipping ? 0 : baseShippingFee;
  const grandTotalInActiveCurrency = Math.round((subtotalInActiveCurrency + calculatedShippingFee) * 100) / 100;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BRAND.bankDetails.accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleSelectSavedAddress = (addr) => {
    setShippingAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setErrorMessage('Please provide your complete contact information.');
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state) {
      setErrorMessage('Please provide a complete delivery street, city, and state.');
      return;
    }

    // Check Pay on Delivery eligibility
    if (paymentMethod === 'payOnDelivery') {
      if (isUsd) {
        setErrorMessage('Pay on Delivery is only available when paying in Naira (₦) for local Lagos & Abuja deliveries.');
        return;
      }
      const isLagosOrAbuja = shippingAddress.state.toLowerCase().includes('lagos') ||
                             shippingAddress.state.toLowerCase().includes('abuja') ||
                             shippingAddress.city.toLowerCase().includes('lagos') ||
                             shippingAddress.city.toLowerCase().includes('abuja');
      if (!isLagosOrAbuja) {
        setErrorMessage('Pay on Delivery is only available for orders within Lagos State and Abuja FCT.');
        return;
      }
      if (grandTotalInActiveCurrency > 350000) {
        setErrorMessage('Pay on Delivery is restricted to orders up to ₦350,000. Please select Paystack Card or Direct Bank Transfer.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant
        })),
        customerInfo,
        shippingAddress,
        paymentMethod,
        currency: isUsd ? 'USD' : 'NGN',
        shippingFee: calculatedShippingFee,
        // The code only. The server looks up the percentage and owns the total.
        couponCode,
        notes: orderNotes
      };

      // 1. Create order on backend
      const res = await api.createOrder(orderPayload);
      if (!res.success || !res.order) {
        throw new Error(res.message || 'Could not register order.');
      }

      const order = res.order;

      // 2. Handle Payment Processor Routing
      if (paymentMethod === 'stripe') {
        // Stripe International USD Checkout
        const stripeRes = await api.createStripeSession(
          order.orderNumber,
          `${window.location.origin}/order-confirmation/${order.orderNumber}`
        );

        if (stripeRes.success && stripeRes.url) {
          clearCart();
          window.location.href = stripeRes.url;
          return;
        } else {
          throw new Error(stripeRes.message || 'Could not initialize Stripe checkout session.');
        }
      } else if (paymentMethod === 'paystack') {
        // Paystack NGN Card & Bank Authorization
        const payInit = await api.initializePaystack(
          order.orderNumber,
          `${window.location.origin}/order-confirmation/${order.orderNumber}`
        );

        if (payInit.success && payInit.data?.authorization_url) {
          clearCart();
          window.location.href = payInit.data.authorization_url;
          return;
        } else {
          throw new Error(payInit.message || 'Paystack initialization failed.');
        }
      } else {
        // Direct Bank Transfer or Pay on Delivery
        clearCart();
        navigate(`/order-confirmation/${order.orderNumber}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An error occurred while placing your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0E0D0C', color: '#F2EFEA', minHeight: '100vh', padding: '40px 0 90px' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <div style={{ marginBottom: '28px' }}>
          <span className="section-tag">Concierge Checkout</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '36px', fontWeight: 400 }}>
            Secure Dispatch & Settlement
          </h1>
        </div>

        {/* Currency & Region Selector Tabs (User requirement: Choose currency/region at checkout) */}
        <div style={{
          backgroundColor: '#121110',
          border: '1px solid #2A2824',
          borderRadius: '4px',
          padding: '20px 24px',
          marginBottom: '32px'
        }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A876', marginBottom: '12px', fontWeight: 600 }}>
            Select Billing Currency & Destination Region
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Naira Option */}
            <div
              onClick={() => handleCurrencySelect('NGN')}
              style={{
                padding: '16px 20px',
                borderRadius: '3px',
                backgroundColor: !isUsd ? 'rgba(201, 168, 118, 0.1)' : '#161514',
                border: !isUsd ? '2px solid #C9A876' : '1px solid #24221F',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#F2EFEA' }}>
                  🇳🇬 Pay in Naira (₦ NGN)
                </span>
                {!isUsd && <CheckCircle2 size={18} style={{ color: '#C9A876' }} />}
              </div>
              <p style={{ fontSize: '12px', color: '#A6A095', lineHeight: 1.4 }}>
                Primary: <strong>Nigerian-issued cards via Paystack</strong> (Mastercard, Visa, Verve) + Bank Wire & Pay on Delivery.
              </p>
            </div>

            {/* USD Option */}
            <div
              onClick={() => handleCurrencySelect('USD')}
              style={{
                padding: '16px 20px',
                borderRadius: '3px',
                backgroundColor: isUsd ? 'rgba(103, 114, 229, 0.12)' : '#161514',
                border: isUsd ? '2px solid #6772E5' : '1px solid #24221F',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#F2EFEA' }}>
                  🌐 Pay in US Dollars ($ USD)
                </span>
                {isUsd && <CheckCircle2 size={18} style={{ color: '#6772E5' }} />}
              </div>
              <p style={{ fontSize: '12px', color: '#A6A095', lineHeight: 1.4 }}>
                Primary: <strong>International cards via Stripe</strong> (Visa, Mastercard, Amex, Apple Pay) with Worldwide DHL.
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(224, 108, 117, 0.12)',
            border: '1px solid #E06C75',
            color: '#E06C75',
            padding: '16px',
            borderRadius: '2px',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            {errorMessage}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.6fr) minmax(300px, 1fr)',
          gap: '40px'
        }} className="checkout-layout">
          {/* Main Form (Left) */}
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Step 1: Customer Contact & Delivery Address */}
            <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', borderRadius: '4px', padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #1C1B19', paddingBottom: '14px' }}>
                <span style={{
                  backgroundColor: '#C9A876',
                  color: '#0E0D0C',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  1
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#F2EFEA' }}>
                  Delivery Recipient & Address
                </h3>
              </div>

              {/* Saved addresses selector if authenticated */}
              {isAuthenticated && user?.savedAddresses && user.savedAddresses.length > 0 && !isUsd && (
                <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#161514', border: '1px solid #24221F', borderRadius: '2px' }}>
                  <div style={{ fontSize: '12px', color: '#C9A876', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Quick-Fill Saved Delivery Address:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {user.savedAddresses.map((addr) => (
                      <button
                        type="button"
                        key={addr._id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className="btn-dark"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        {addr.fullName} ({addr.city})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => {
                      setCustomerInfo({ ...customerInfo, name: e.target.value });
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value });
                    }}
                    placeholder="e.g., Lady Folashade Adeleke"
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="f.adeleke@luxury.com"
                    className="input-luxury"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                  Phone Number (for Courier & Dispatch SMS) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => {
                    setCustomerInfo({ ...customerInfo, phone: e.target.value });
                    setShippingAddress({ ...shippingAddress, phone: e.target.value });
                  }}
                  placeholder={isUsd ? "+1 (555) 000-0000" : "+234 802 000 0000"}
                  className="input-luxury"
                />
              </div>

              {/* Address Details */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                  Street Address & Residence / Suite *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  placeholder={isUsd ? "740 Park Avenue, Apt 12B" : "Plot 18, Block B, Admiralty Way, Lekki Phase 1"}
                  className="input-luxury"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder={isUsd ? "New York / London / Atlanta" : "Lagos / Abuja / Port Harcourt"}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                    State / Region / Country *
                  </label>
                  {isUsd ? (
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="New York, USA / London, UK / Ontario, Canada"
                      className="input-luxury"
                    />
                  ) : (
                    <select
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="input-luxury"
                      style={{ backgroundColor: '#141312' }}
                    >
                      <option value="Lagos State">Lagos State</option>
                      <option value="Federal Capital Territory (Abuja)">Abuja FCT</option>
                      <option value="Rivers State">Rivers State (Port Harcourt)</option>
                      <option value="Oyo State">Oyo State (Ibadan)</option>
                      <option value="Delta State">Delta State</option>
                      <option value="Enugu State">Enugu State</option>
                      <option value="Edo State">Edo State</option>
                      <option value="Kano State">Kano State</option>
                      <option value="Other States">Other Nigerian State</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Options */}
            <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', borderRadius: '4px', padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #1C1B19', paddingBottom: '14px' }}>
                <span style={{
                  backgroundColor: '#C9A876',
                  color: '#0E0D0C',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  2
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#F2EFEA' }}>
                  Delivery Service Level
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {BRAND.shippingOptions
                  .filter(opt => isUsd ? opt.id === 'international-dhl' : opt.id !== 'international-dhl')
                  .map((opt) => {
                    const isSelected = selectedShipping?.id === opt.id;
                    const feeDisplay = isUsd
                      ? (isEligibleForFreeShipping ? 'COMPLIMENTARY' : formatDirect(opt.feeUsd || 35))
                      : (isEligibleForFreeShipping && opt.id === 'standard-lagos' ? 'COMPLIMENTARY' : formatPrice(opt.fee));

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedShipping(opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 20px',
                          backgroundColor: isSelected ? 'rgba(201, 168, 118, 0.08)' : '#161514',
                          border: isSelected ? '1px solid #C9A876' : '1px solid #24221F',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '5px solid #C9A876' : '1px solid #4A463F',
                            backgroundColor: '#0E0D0C'
                          }} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EFEA' }}>
                              {opt.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8A847A' }}>
                              Estimated Transit: {opt.deliveryTime}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: feeDisplay === 'COMPLIMENTARY' ? '#7EB685' : '#C9A876', fontWeight: 600, fontSize: '14px' }}>
                            {feeDisplay}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', borderRadius: '4px', padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #1C1B19', paddingBottom: '14px' }}>
                <span style={{
                  backgroundColor: '#C9A876',
                  color: '#0E0D0C',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  3
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#F2EFEA' }}>
                  Select Payment Method ({isUsd ? 'Stripe Gateway' : 'Paystack & Local'})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* STRIPE PAYMENT METHOD (Active for USD orders - Primary Card Method for International Cards) */}
                {isUsd && (
                  <div
                    onClick={() => setPaymentMethod('stripe')}
                    style={{
                      padding: '20px',
                      backgroundColor: paymentMethod === 'stripe' ? 'rgba(103, 114, 229, 0.12)' : '#161514',
                      border: paymentMethod === 'stripe' ? '2px solid #6772E5' : '1px solid #24221F',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: paymentMethod === 'stripe' ? '5px solid #6772E5' : '1px solid #4A463F',
                          backgroundColor: '#0E0D0C'
                        }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#F2EFEA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CreditCard size={18} style={{ color: '#6772E5' }} />
                              <span>Debit / Credit Card (International Cards)</span>
                            </span>
                            <span style={{
                              backgroundColor: 'rgba(103, 114, 229, 0.15)',
                              color: '#8F85FF',
                              border: '1px solid rgba(103, 114, 229, 0.3)',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              borderRadius: '2px',
                              letterSpacing: '0.05em'
                            }}>
                              PRIMARY METHOD
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#A6A095', marginTop: '6px', lineHeight: 1.4 }}>
                            Primary settlement for overseas cards issued outside Nigeria. Processed securely via <strong>Stripe USD</strong>.
                          </p>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {['Visa', 'Mastercard', 'American Express', 'Apple Pay'].map((badge) => (
                              <span key={badge} style={{
                                backgroundColor: '#1C1B19',
                                border: '1px solid #2E2B27',
                                padding: '2px 8px',
                                borderRadius: '2px',
                                fontSize: '11px',
                                color: '#E3CEAB',
                                fontWeight: 500
                              }}>
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span style={{ backgroundColor: '#6772E5', color: '#FFF', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '2px', letterSpacing: '0.08em' }}>
                        STRIPE USD
                      </span>
                    </div>
                  </div>
                )}

                {/* PAYSTACK METHOD (Active for NGN orders - Primary Card Method for Nigerian-Issued Cards) */}
                {!isUsd && (
                  <div
                    onClick={() => setPaymentMethod('paystack')}
                    style={{
                      padding: '20px',
                      backgroundColor: paymentMethod === 'paystack' ? 'rgba(201, 168, 118, 0.08)' : '#161514',
                      border: paymentMethod === 'paystack' ? '2px solid #C9A876' : '1px solid #24221F',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: paymentMethod === 'paystack' ? '5px solid #C9A876' : '1px solid #4A463F',
                          backgroundColor: '#0E0D0C'
                        }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#F2EFEA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CreditCard size={18} style={{ color: '#C9A876' }} />
                              <span>Debit / Credit Card (Nigerian-Issued Cards)</span>
                            </span>
                            <span style={{
                              backgroundColor: 'rgba(201, 168, 118, 0.15)',
                              color: '#C9A876',
                              border: '1px solid rgba(201, 168, 118, 0.3)',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              borderRadius: '2px',
                              letterSpacing: '0.05em'
                            }}>
                              PRIMARY METHOD
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#A6A095', marginTop: '6px', lineHeight: 1.4 }}>
                            Primary settlement for Nigerian cards. Instant authorization via <strong>Paystack NGN</strong> (plus USSD & Bank transfer).
                          </p>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {['Mastercard', 'Visa', 'Verve', 'Nigerian Bank Transfer'].map((badge) => (
                              <span key={badge} style={{
                                backgroundColor: '#1C1B19',
                                border: '1px solid #2E2B27',
                                padding: '2px 8px',
                                borderRadius: '2px',
                                fontSize: '11px',
                                color: '#E3CEAB',
                                fontWeight: 500
                              }}>
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="badge-gold" style={{ padding: '4px 10px' }}>
                        PAYSTACK NGN
                      </span>
                    </div>
                  </div>
                )}

                {/* DIRECT BANK TRANSFER (NGN orders only) */}
                {!isUsd && (
                  <div
                    onClick={() => setPaymentMethod('bankTransfer')}
                    style={{
                      padding: '18px 20px',
                      backgroundColor: paymentMethod === 'bankTransfer' ? 'rgba(201, 168, 118, 0.08)' : '#161514',
                      border: paymentMethod === 'bankTransfer' ? '1px solid #C9A876' : '1px solid #24221F',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: paymentMethod === 'bankTransfer' ? '5px solid #C9A876' : '1px solid #4A463F',
                        backgroundColor: '#0E0D0C'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EFEA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building size={16} style={{ color: '#C9A876' }} />
                          <span>Direct Bank Transfer (Corporate Account)</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#8A847A', marginTop: '4px' }}>
                          Transfer directly from your Nigerian banking app to Zenith Bank.
                        </p>
                      </div>
                    </div>

                    {paymentMethod === 'bankTransfer' && (
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: '#121110',
                        border: '1px solid #2A2824',
                        borderRadius: '2px',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ color: '#8A847A' }}>Bank:</span>
                          <strong style={{ color: '#F2EFEA' }}>{BRAND.bankDetails.bankName}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ color: '#8A847A' }}>Account Name:</span>
                          <strong style={{ color: '#F2EFEA' }}>{BRAND.bankDetails.accountName}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#8A847A' }}>Account Number:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', color: '#C9A876', fontWeight: 700, letterSpacing: '0.05em' }}>
                              {BRAND.bankDetails.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleCopyAccount(); }}
                              style={{ color: copiedBank ? '#7EB685' : '#C9A876', padding: '4px' }}
                              title="Copy Account Number"
                            >
                              {copiedBank ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PAY ON DELIVERY (NGN Lagos/Abuja only) */}
                {!isUsd && (
                  <div
                    onClick={() => setPaymentMethod('payOnDelivery')}
                    style={{
                      padding: '18px 20px',
                      backgroundColor: paymentMethod === 'payOnDelivery' ? 'rgba(201, 168, 118, 0.08)' : '#161514',
                      border: paymentMethod === 'payOnDelivery' ? '1px solid #C9A876' : '1px solid #24221F',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: paymentMethod === 'payOnDelivery' ? '5px solid #C9A876' : '1px solid #4A463F',
                        backgroundColor: '#0E0D0C'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EFEA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Banknote size={16} style={{ color: '#C9A876' }} />
                          <span>Pay on Delivery (Lagos & Abuja Metropolis Only)</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#8A847A', marginTop: '4px' }}>
                          Card POS terminal or cash accepted upon rider arrival (orders up to ₦350,000).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special Instructions / Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                Concierge Instructions or Cap Customization Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g., Please trim lace, leave with building concierge, or call 30 mins before arrival..."
                className="input-luxury"
              />
            </div>
          </form>

          {/* Sticky Order Review & Submit Card (Right) */}
          <div>
            <div style={{
              backgroundColor: '#121110',
              border: '1px solid #24221F',
              borderRadius: '4px',
              padding: '30px',
              position: 'sticky',
              top: '90px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1C1B19', paddingBottom: '14px' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '22px', fontWeight: 500, color: '#F2EFEA' }}>
                  Atelier Order Summary
                </h3>
                <span className="badge-dark">{currency}</span>
              </div>

              {/* Items List Mini */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', maxHeight: '240px', overflowY: 'auto' }}>
                {cartItems.map((item) => {
                  const itemPriceInCurrency = isUsd ? convertPrice(item.price, 'USD') : item.price;
                  return (
                    <div key={item.cartItemId} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '60px', backgroundColor: '#181716', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, fontSize: '13px' }}>
                        <div style={{ color: '#F2EFEA', fontWeight: 500, lineHeight: 1.2 }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#8A847A', marginTop: '2px' }}>
                          Qty: {item.quantity} {item.selectedVariant ? `• ${item.selectedVariant.name}` : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#C9A876' }}>
                        {formatDirect(itemPriceInCurrency * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', borderTop: '1px solid #1C1B19', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A6A095' }}>
                  <span>Subtotal</span>
                  <span style={{ color: '#F2EFEA' }}>{formatDirect(subtotalInActiveCurrency)}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C9A876' }}>
                    <span>Privilege Discount</span>
                    <span>-{formatDirect(discountInActiveCurrency)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A6A095' }}>
                  <span>Delivery ({selectedShipping?.name || 'Standard'})</span>
                  <span style={{ color: isEligibleForFreeShipping ? '#7EB685' : '#F2EFEA' }}>
                    {isEligibleForFreeShipping ? 'COMPLIMENTARY' : formatDirect(calculatedShippingFee)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #1C1B19',
                  paddingTop: '16px',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#F2EFEA'
                }}>
                  <span>Total Due</span>
                  <span style={{ color: '#C9A876' }}>{formatDirect(grandTotalInActiveCurrency)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="btn-gold"
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: paymentMethod === 'stripe' ? '#6772E5' : '#C9A876',
                  borderColor: paymentMethod === 'stripe' ? '#6772E5' : '#C9A876',
                  color: paymentMethod === 'stripe' ? '#FFFFFF' : '#0E0D0C'
                }}
              >
                {isSubmitting ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'stripe'
                        ? `Pay with International Card (Stripe) • ${formatDirect(grandTotalInActiveCurrency)}`
                        : paymentMethod === 'paystack'
                        ? `Pay with Nigerian Card (Paystack) • ${formatDirect(grandTotalInActiveCurrency)}`
                        : paymentMethod === 'bankTransfer'
                        ? `Confirm Bank Wire Order • ${formatDirect(grandTotalInActiveCurrency)}`
                        : `Place Pay On Delivery Order • ${formatDirect(grandTotalInActiveCurrency)}`}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{
                marginTop: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#8A847A',
                fontSize: '11px',
                textAlign: 'center',
                lineHeight: 1.4
              }}>
                <ShieldCheck size={14} style={{ color: '#C9A876' }} />
                <span>
                  {isUsd
                    ? 'Primary: International Cards via Stripe (Visa, MC, Amex, Apple Pay) • 256-Bit SSL'
                    : 'Primary: Nigerian Cards via Paystack (Mastercard, Visa, Verve) • Direct Wire • POD'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .checkout-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
