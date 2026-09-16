import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Clock, ShieldCheck, Copy, Check, ArrowRight, Building } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BRAND, formatPrice } from '../config/brand';
import { api } from '../services/api';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const stripeSessionId = searchParams.get('stripe_session_id') || searchParams.get('session_id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bank transfer submission state
  const [senderName, setSenderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [transferRef, setTransferRef] = useState('');
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  useEffect(() => {
    const fetchAndVerify = async () => {
      try {
        // Trigger celebratory gold confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#C9A876', '#E3CEAB', '#FFFFFF', '#8F7246']
          });
        } catch {
          // ignore if canvas blocked
        }

        // 1. If returning from Stripe Checkout (USD international orders)
        if (stripeSessionId) {
          try {
            await api.verifyStripePayment(stripeSessionId, orderNumber);
          } catch (sErr) {
            console.warn('Stripe verify check:', sErr.message);
          }
        }
        // 2. If reference is in URL (from Paystack redirect / simulation)
        else if (reference) {
          try {
            await api.verifyPaystackPayment(reference, orderNumber);
          } catch (vErr) {
            console.warn('Payment verify check:', vErr.message);
          }
        }

        // Fetch official order record
        const res = await api.getOrderByNumber(orderNumber);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError('Order record could not be retrieved.');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch order confirmation.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndVerify();
  }, [orderNumber, reference, stripeSessionId]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!senderName || !bankName) return;

    try {
      await api.submitBankTransferProof({
        orderNumber,
        senderName,
        bankName,
        transferReference: transferRef
      });
      setProofSubmitted(true);
    } catch (err) {
      console.error('Failed to submit transfer proof:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A876' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>✦</div>
          <div style={{ letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '12px' }}>
            Retrieving Atelier Order Dossier...
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', color: '#F2EFEA', marginBottom: '12px' }}>Order Not Found</h2>
        <p style={{ color: '#8A847A', marginBottom: '24px' }}>{error || 'No matching order could be found.'}</p>
        <Link to="/" className="btn-gold">Return to Boutique</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0E0D0C', color: '#F2EFEA', minHeight: '100vh', padding: '50px 0 100px' }}>
      <div className="container-narrow">
        {/* Success Card Header */}
        <div style={{
          backgroundColor: '#121110',
          border: '1px solid #24221F',
          borderRadius: '4px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '32px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(201, 168, 118, 0.12)',
            border: '1px solid #C9A876',
            color: '#C9A876',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle2 size={32} />
          </div>

          <span className="section-tag">Order Confirmed</span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '36px',
            fontWeight: 400,
            color: '#F2EFEA',
            marginBottom: '12px'
          }}>
            Thank You, {order.customerInfo.name}
          </h1>

          <p style={{ color: '#A6A095', fontSize: '15px', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Your luxury order has been registered in our Victoria Island atelier. A confirmation receipt has been dispatched to{' '}
            <strong style={{ color: '#F2EFEA' }}>{order.customerInfo.email}</strong>.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#181716',
            border: '1px solid #2A2824',
            padding: '10px 20px',
            borderRadius: '2px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '13px', color: '#8A847A' }}>Order Reference:</span>
            <strong style={{ fontSize: '16px', color: '#C9A876', letterSpacing: '0.08em' }}>
              {order.orderNumber}
            </strong>
            <button
              onClick={handleCopyOrderNumber}
              style={{ color: copiedOrder ? '#7EB685' : '#A6A095', padding: '2px', cursor: 'pointer' }}
              title="Copy Order Number"
            >
              {copiedOrder ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <span style={{
              marginLeft: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              borderRadius: '2px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              backgroundColor: order.currency === 'USD' ? 'rgba(99, 91, 255, 0.15)' : 'rgba(0, 195, 235, 0.15)',
              color: order.currency === 'USD' ? '#8F85FF' : '#00C3EB',
              border: `1px solid ${order.currency === 'USD' ? 'rgba(99, 91, 255, 0.3)' : 'rgba(0, 195, 235, 0.3)'}`
            }}>
              {order.currency === 'USD' ? '🌐 USD • STRIPE' : order.paymentMethod === 'paystack' ? '🇳🇬 NGN • PAYSTACK' : `🇳🇬 NGN • ${order.paymentMethod.toUpperCase()}`}
            </span>
          </div>
        </div>

        {/* Order Fulfillment Status Stepper */}
        <div style={{
          backgroundColor: '#121110',
          border: '1px solid #24221F',
          borderRadius: '4px',
          padding: '30px',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A876', marginBottom: '24px' }}>
            Dispatch Progression Status
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {[
              { label: 'Order Registered', done: true },
              {
                label: 'Payment Verified',
                done: order.paymentStatus === 'paid' || order.paymentMethod === 'payOnDelivery'
              },
              {
                label: 'Atelier Styling & QC',
                done: ['processing', 'shipped', 'delivered'].includes(order.orderStatus)
              },
              {
                label: 'Dispatched to Courier',
                done: ['shipped', 'delivered'].includes(order.orderStatus)
              }
            ].map((step, idx) => (
              <div key={idx} style={{ textAlign: 'center', flex: 1, zIndex: 2 }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: step.done ? '#C9A876' : '#1A1918',
                  color: step.done ? '#0E0D0C' : '#6E6960',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: step.done ? 'none' : '1px solid #333'
                }}>
                  {step.done ? <Check size={14} /> : idx + 1}
                </div>
                <div style={{ fontSize: '11px', color: step.done ? '#F2EFEA' : '#6E6960', fontWeight: step.done ? 600 : 400 }}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Transfer Instructions if customer chose Bank Transfer */}
        {order.paymentMethod === 'bankTransfer' && order.paymentStatus !== 'paid' && (
          <div style={{
            backgroundColor: '#161514',
            border: '1px solid #C9A876',
            borderRadius: '4px',
            padding: '30px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Building size={20} style={{ color: '#C9A876' }} />
              <h3 style={{ fontSize: '18px', color: '#F2EFEA', fontWeight: 500 }}>
                Direct Bank Transfer Instructions
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#C0BAB0', lineHeight: 1.6, marginBottom: '20px' }}>
              Please transfer the total sum of <strong style={{ color: '#C9A876' }}>{formatPrice(order.pricingBreakdown.total, order.currency || 'NGN')}</strong> to our verified corporate bank account. Use your Order Reference <strong style={{ color: '#F2EFEA' }}>{order.orderNumber}</strong> as the payment description/remark.
            </p>

            <div style={{
              backgroundColor: '#100F0E',
              border: '1px solid #24221F',
              padding: '20px',
              borderRadius: '2px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase' }}>Bank Name</span>
                <div style={{ fontSize: '15px', color: '#F2EFEA', fontWeight: 600 }}>{BRAND.bankDetails.bankName}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase' }}>Account Name</span>
                <div style={{ fontSize: '15px', color: '#F2EFEA', fontWeight: 600 }}>{BRAND.bankDetails.accountName}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase' }}>Account Number</span>
                <div style={{ fontSize: '17px', color: '#C9A876', fontWeight: 700 }}>{BRAND.bankDetails.accountNumber}</div>
              </div>
            </div>

            {/* Submit Transfer Confirmation Form */}
            {proofSubmitted ? (
              <div style={{ backgroundColor: 'rgba(126, 182, 133, 0.12)', border: '1px solid #7EB685', color: '#7EB685', padding: '14px', borderRadius: '2px', fontSize: '13px' }}>
                ✦ Transfer proof registered. Our luxury concierge will confirm and dispatch your order immediately.
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8A847A', marginBottom: '4px' }}>Sender Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Folashade Adeleke"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="input-luxury"
                    style={{ padding: '10px 12px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8A847A', marginBottom: '4px' }}>Sender Bank</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., GTBank / Access"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="input-luxury"
                    style={{ padding: '10px 12px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8A847A', marginBottom: '4px' }}>Transfer Ref / Session ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 0000139281..."
                    value={transferRef}
                    onChange={(e) => setTransferRef(e.target.value)}
                    className="input-luxury"
                    style={{ padding: '10px 12px', fontSize: '13px' }}
                  />
                </div>
                <button type="submit" className="btn-gold" style={{ padding: '10px 16px', fontSize: '12px' }}>
                  Confirm Payment
                </button>
              </form>
            )}
          </div>
        )}

        {/* Order Details & Summary Card */}
        <div style={{
          backgroundColor: '#121110',
          border: '1px solid #24221F',
          borderRadius: '4px',
          padding: '36px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '22px',
            color: '#F2EFEA',
            marginBottom: '20px',
            borderBottom: '1px solid #1C1B19',
            paddingBottom: '14px'
          }}>
            Order Dossier Summary
          </h3>

          {/* Line items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '75px', backgroundColor: '#181716', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>{item.name}</h4>
                  {item.selectedVariant?.name && (
                    <div style={{ fontSize: '12px', color: '#8A847A' }}>{item.selectedVariant.name}</div>
                  )}
                  <div style={{ fontSize: '12px', color: '#C9A876', marginTop: '2px' }}>
                    Qty: {item.quantity} × {formatPrice(item.price, order.currency || 'NGN')}
                  </div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#F2EFEA' }}>
                  {formatPrice(item.price * item.quantity, order.currency || 'NGN')}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div style={{ borderTop: '1px solid #1C1B19', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A847A' }}>
              <span>Subtotal</span>
              <span style={{ color: '#F2EFEA' }}>{formatPrice(order.pricingBreakdown.subtotal, order.currency || 'NGN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A847A' }}>
              <span>Delivery / Shipping</span>
              <span style={{ color: '#F2EFEA' }}>{order.pricingBreakdown.shippingFee === 0 ? 'COMPLIMENTARY' : formatPrice(order.pricingBreakdown.shippingFee, order.currency || 'NGN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A847A' }}>
              <span>Payment Processor</span>
              <span style={{ color: '#C9A876', fontWeight: 500 }}>
                {order.paymentMethod === 'stripe' || order.paymentProcessor === 'stripe'
                  ? 'Stripe International Card / Apple Pay (USD)'
                  : order.paymentMethod === 'paystack'
                  ? 'Paystack (Naira Card / Bank / USSD)'
                  : order.paymentMethod === 'bankTransfer'
                  ? 'Direct Bank Transfer (Zenith Bank NGN)'
                  : 'Pay on Delivery (Lagos Cash / POS)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A847A' }}>
              <span>Payment Status</span>
              <span style={{ color: order.paymentStatus === 'paid' ? '#7EB685' : '#E3CEAB', textTransform: 'uppercase', fontWeight: 600 }}>
                {order.paymentStatus}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1C1B19', paddingTop: '12px', fontSize: '18px', fontWeight: 600, color: '#F2EFEA' }}>
              <span>Total Paid / Payable</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#C9A876' }}>{formatPrice(order.pricingBreakdown.total, order.currency || 'NGN')}</span>
                {order.currency === 'USD' && order.pricingBreakdown?.baseTotalNgn > 0 && (
                  <div style={{ fontSize: '11px', color: '#8A847A', fontWeight: 400, marginTop: '2px' }}>
                    (Base: ₦{order.pricingBreakdown.baseTotalNgn.toLocaleString()} at rate 1 USD = ₦1,500)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Destination Information */}
        <div style={{
          backgroundColor: '#121110',
          border: '1px solid #24221F',
          borderRadius: '4px',
          padding: '24px 30px',
          marginBottom: '36px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          <div>
            <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Recipient Details
            </h4>
            <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>{order.customerInfo.name}</div>
            <div style={{ fontSize: '13px', color: '#8A847A' }}>{order.customerInfo.email}</div>
            <div style={{ fontSize: '13px', color: '#8A847A' }}>{order.customerInfo.phone}</div>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Delivery Destination
            </h4>
            <div style={{ fontSize: '13px', color: '#F2EFEA', lineHeight: 1.5 }}>
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/account" className="btn-dark" style={{ padding: '14px 28px' }}>
            View in My Orders
          </Link>
          <Link to="/shop" className="btn-gold" style={{ padding: '14px 28px' }}>
            <span>Return to The Boutique</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
