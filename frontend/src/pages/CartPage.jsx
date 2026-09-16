import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck, Tag, ArrowLeft } from 'lucide-react';
import { BRAND } from '../config/brand';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { format, currency } = useCurrency();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    discountPercent,
    finalSubtotal,
    couponCode,
    applyCoupon
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyCoupon(inputCode);
    setCouponFeedback(res);
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#0E0D0C', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <ShoppingBag size={56} style={{ strokeWidth: 1, color: '#2A2824', margin: '0 auto 20px' }} />
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '32px', color: '#F2EFEA', marginBottom: '12px' }}>
            Your Shopping Bag Is Empty
          </h1>
          <p style={{ color: '#8A847A', fontSize: '15px', maxWidth: '440px', margin: '0 auto 32px' }}>
            Indulge in our signature unprocessed raw donor units, seamless clip-ins, and botanical elixirs.
          </p>
          <Link to="/shop" className="btn-gold" style={{ padding: '16px 36px' }}>
            <span>Explore The Collection</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0E0D0C', color: '#F2EFEA', minHeight: '100vh', padding: '40px 0 90px' }}>
      <div className="container">
        {/* Page Title */}
        <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="section-tag">Shopping Bag</span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '36px', fontWeight: 400 }}>
              Review Your Selection ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h1>
          </div>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#C9A876' }}>
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* 2-Column Cart Layout: Table (Left) & Summary (Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.6fr) minmax(300px, 1fr)',
          gap: '40px'
        }} className="cart-layout">
          {/* Cart Table */}
          <div>
            <div style={{
              backgroundColor: '#121110',
              border: '1px solid #24221F',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {cartItems.map((item, index) => (
                <div
                  key={item.cartItemId}
                  style={{
                    padding: '24px',
                    display: 'flex',
                    gap: '20px',
                    borderBottom: index < cartItems.length - 1 ? '1px solid #1C1B19' : 'none',
                    alignItems: 'center'
                  }}
                  className="cart-item-row"
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '90px',
                    height: '110px',
                    backgroundColor: '#181716',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={item.image || '/images/products/placeholder-hair.jpg'}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${item.slug || item.productId}`}>
                      <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#F2EFEA', marginBottom: '4px' }}>
                        {item.name}
                      </h3>
                    </Link>

                    {item.selectedVariant && (
                      <div style={{ fontSize: '13px', color: '#A6A095', marginBottom: '8px' }}>
                        Spec: <span style={{ color: '#E3CEAB' }}>{item.selectedVariant.name}</span>
                      </div>
                    )}

                    <div style={{ fontSize: '14px', color: '#C9A876', fontWeight: 600 }}>
                      {format(item.price)} each
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid #2A2824',
                    backgroundColor: '#161514',
                    borderRadius: '2px'
                  }}>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      style={{ padding: '8px 12px', color: '#A6A095', cursor: 'pointer' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '28px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      style={{ padding: '8px 12px', color: '#A6A095', cursor: 'pointer' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#F2EFEA', marginBottom: '8px' }}>
                      {format(item.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      style={{ color: '#6E6960', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear bag button */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={clearCart}
                style={{ color: '#8A847A', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Clear Entire Bag
              </button>
            </div>
          </div>

          {/* Order Summary & Checkout Card */}
          <div>
            <div style={{
              backgroundColor: '#121110',
              border: '1px solid #24221F',
              borderRadius: '4px',
              padding: '30px'
            }}>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '22px',
                fontWeight: 500,
                color: '#F2EFEA',
                marginBottom: '20px',
                borderBottom: '1px solid #1C1B19',
                paddingBottom: '14px'
              }}>
                Order Summary
              </h3>

              {/* Promo Code Input */}
              <div style={{ marginBottom: '24px' }}>
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. LUXE10)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: '#161514',
                      border: '1px solid #24221F',
                      padding: '10px 14px',
                      color: '#F2EFEA',
                      fontSize: '13px',
                      borderRadius: '2px',
                      outline: 'none'
                    }}
                  />
                  <button type="submit" className="btn-dark" style={{ padding: '0 16px', fontSize: '12px' }}>
                    Apply
                  </button>
                </form>

                {couponFeedback && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: couponFeedback.success ? '#7EB685' : '#E06C75'
                  }}>
                    {couponFeedback.message}
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A6A095' }}>
                  <span>Bag Subtotal</span>
                  <span style={{ color: '#F2EFEA' }}>{format(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C9A876' }}>
                    <span>Privilege Code ({couponCode})</span>
                    <span>-{format(discountAmount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A6A095' }}>
                  <span>Estimated Delivery</span>
                  <span>Calculated at checkout</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #1C1B19',
                  paddingTop: '16px',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#F2EFEA'
                }}>
                  <span>Final Subtotal ({currency})</span>
                  <span style={{ color: '#C9A876' }}>{format(finalSubtotal)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => navigate('/checkout')}
                className="btn-gold"
                style={{ width: '100%', padding: '16px' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              {/* Security info */}
              <div style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#8A847A',
                fontSize: '12px',
                textAlign: 'center',
                flexWrap: 'wrap'
              }}>
                <ShieldCheck size={16} style={{ color: '#C9A876' }} />
                <span>Paystack (₦ NGN) • Stripe ($ USD) • Bank Wire • POD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
          .cart-item-row {
            flex-wrap: wrap !important;
          }
        }
      `}</style>
    </div>
  );
}
