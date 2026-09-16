import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    finalSubtotal,
    totalItemsCount
  } = useCart();

  const { format, isUsd } = useCurrency();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingThreshold = isUsd ? 180 : 250000;
  const currentSubtotalInCurrency = isUsd ? subtotal / 1500 : subtotal;
  const progressPercent = Math.min(100, Math.round((currentSubtotalInCurrency / freeShippingThreshold) * 100));

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewBag = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
      />

      {/* Drawer Panel */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        backgroundColor: '#121110',
        borderLeft: '1px solid #24221F',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.8)',
        zIndex: 101,
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #1C1B19',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} style={{ color: '#C9A876' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '0.04em' }}>
              Your Bag ({totalItemsCount})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{ color: '#A6A095', padding: '6px', cursor: 'pointer' }}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#181716',
          borderBottom: '1px solid #24221F',
          fontSize: '12px',
          color: '#A6A095'
        }}>
          {currentSubtotalInCurrency >= freeShippingThreshold ? (
            <div style={{ color: '#C9A876', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span>✦ {isUsd ? 'Unlocked Complimentary Worldwide DHL Express!' : 'Unlocked Complimentary White-Glove Lagos Delivery!'}</span>
            </div>
          ) : (
            <div>
              Add <strong style={{ color: '#F2EFEA' }}>{format(Math.max(0, (freeShippingThreshold * (isUsd ? 1500 : 1)) - subtotal))}</strong> more for complimentary delivery.
            </div>
          )}
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#2A2824',
            borderRadius: '2px',
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: '#C9A876',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Line Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: '#6E6960'
            }}>
              <ShoppingBag size={48} style={{ strokeWidth: 1, marginBottom: '16px', color: '#2A2824' }} />
              <p style={{ color: '#A6A095', fontSize: '15px', marginBottom: '8px' }}>Your shopping bag is empty.</p>
              <p style={{ fontSize: '12px', maxWidth: '240px', marginBottom: '24px' }}>
                Discover our signature raw virgin units and botanical hair care formulations.
              </p>
              <button
                onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
                className="btn-outline-gold"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  display: 'flex',
                  gap: '16px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid #1C1B19'
                }}
              >
                {/* Product Thumbnail */}
                <div style={{
                  width: '80px',
                  height: '100px',
                  backgroundColor: '#1E1D1B',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img
                    src={item.image || '/images/products/placeholder-hair.jpg'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80'; }}
                  />
                </div>

                {/* Info & Quantity Controls */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#F2EFEA', lineHeight: 1.3 }}>
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        style={{ color: '#6E6960', padding: '2px' }}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {item.selectedVariant && (
                      <div style={{ fontSize: '12px', color: '#A6A095', marginTop: '4px' }}>
                        {item.selectedVariant.name || `${item.selectedVariant.length || ''} ${item.selectedVariant.density || ''} ${item.selectedVariant.color || ''}`}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    {/* Stepper */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid #2A2824',
                      borderRadius: '2px',
                      backgroundColor: '#161514'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        style={{ padding: '4px 8px', color: '#A6A095' }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '12px', minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        style={{ padding: '4px 8px', color: '#A6A095' }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#C9A876', fontWeight: 600, fontSize: '14px' }}>
                        {format(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Trigger */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '20px 24px 28px',
            borderTop: '1px solid #1C1B19',
            backgroundColor: '#121110'
          }}>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#C9A876', marginBottom: '8px' }}>
                <span>Privilege Discount</span>
                <span>-{format(discountAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: '#A6A095' }}>Estimated Subtotal</span>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#F2EFEA' }}>
                {format(finalSubtotal)}
              </span>
            </div>

            <p style={{ fontSize: '11px', color: '#8A847A', marginBottom: '16px', textAlign: 'center' }}>
              {isUsd
                ? 'Primary: International Cards via Stripe (Visa, MC, Amex, Apple Pay).'
                : 'Primary: Nigerian Cards via Paystack (Mastercard, Visa, Verve) + Transfer & POD.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleCheckout}
                className="btn-gold"
                style={{ width: '100%' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleViewBag}
                className="btn-dark"
                style={{ width: '100%' }}
              >
                Review Full Bag & Enter Promo Code
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '14px', color: '#8A847A', fontSize: '11px' }}>
              <ShieldCheck size={14} style={{ color: '#C9A876' }} />
              <span>{isUsd ? 'Primary: International Cards via Stripe' : 'Primary: Nigerian Cards via Paystack'}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
