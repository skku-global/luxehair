import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function ProductCard({ product }) {
  const [isActive, setIsActive] = useState(false); // covers both hover (desktop) and touch (mobile)
  const touchTimeout = useRef(null);
  const { addToCart } = useCart();
  const { format } = useCurrency();

  if (!product) return null;

  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const displayPrice = defaultVariant ? defaultVariant.price : product.price;

  // Model photo is 1st (default view)
  // Hair / mannequin / detail photo is revealed when hovered or touched
  const isWig = product.category === 'wigs';
  const allImages = product.images || [];

  const primaryImage = allImages[0] || '/images/products/placeholder-hair.jpg';
  const secondaryImage = allImages[1] || primaryImage;
  const hasSecondImage = allImages.length > 1;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, defaultVariant, 1);
  };

  // Mobile touch: touching/holding the image reveals the mannequin/hair view
  const handleTouchStart = () => {
    clearTimeout(touchTimeout.current);
    setIsActive(true);
  };

  const handleTouchEnd = () => {
    // Keep hair view active for 1.2s after finger lifts so mobile user sees it clearly
    touchTimeout.current = setTimeout(() => setIsActive(false), 1200);
  };

  const availableColors = product.specifications?.availableColors || (
    product.specifications?.colorHex
      ? [{ name: product.specifications.colorName, hex: product.specifications.colorHex }]
      : []
  );

  return (
    <div
      className="card-luxury"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '3px',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {/* Product Image Frame */}
      <Link
        to={`/product/${product.slug || product._id}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '128%',
          backgroundColor: 'var(--bg-surface-2)',
          overflow: 'hidden',
          display: 'block',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {/* Primary Image: Model Photo (Default View) */}
        <img
          src={primaryImage}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.4s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isActive ? 'scale(1.04)' : 'scale(1)',
            opacity: isActive && hasSecondImage ? 0 : 1
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Secondary Image: Mannequin / Hair Detail (Revealed on Hover/Touch) */}
        {hasSecondImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} hair mannequin view`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.4s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isActive ? 'scale(1.04)' : 'scale(1)',
              opacity: isActive ? 1 : 0,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* View mode badge — shows when active (hover/touch) */}
        {hasSecondImage && isActive && (
          <div style={{
            position: 'absolute',
            bottom: '52px',
            left: '10px',
            zIndex: 2,
            backgroundColor: 'rgba(14, 13, 12, 0.85)',
            border: '1px solid var(--border-gold)',
            color: '#F2EFEA',
            fontSize: '9px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: '2px',
            backdropFilter: 'blur(6px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            pointerEvents: 'none'
          }}>
            <Sparkles size={10} style={{ color: 'var(--gold-primary)' }} />
            <span>{isWig ? 'Hair & Mannequin' : 'Detail View'}</span>
          </div>
        )}

        {/* Badges */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 2
        }}>
          {product.isBestseller && (
            <span className="badge-gold">Bestseller</span>
          )}
          {product.compareAtPrice > displayPrice && (
            <span style={{
              backgroundColor: '#A83232',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '2px',
              letterSpacing: '0.06em'
            }}>
              SAVE {Math.round(((product.compareAtPrice - displayPrice) / product.compareAtPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Quick Add — slides up on hover (desktop), always visible on mobile */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 12px',
          background: 'linear-gradient(to top, rgba(14, 13, 12, 0.95), transparent)',
          transform: isActive ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 3,
          // Always show on mobile with a slight overlay
        }}>
          <button
            onClick={handleQuickAdd}
            className="btn-gold"
            style={{
              width: '100%',
              padding: '9px 14px',
              fontSize: '11px',
              letterSpacing: '0.12em'
            }}
          >
            <ShoppingBag size={13} />
            <span>Quick Add to Bag</span>
          </button>
        </div>

        {/* Mobile-only permanent Quick Add bar at bottom (when not active) */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px 12px',
          background: 'linear-gradient(to top, rgba(14,13,12,0.88), transparent)',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          // Only show on touch devices when not active
          opacity: isActive ? 0 : 1,
          transition: 'opacity 0.25s ease',
          pointerEvents: isActive ? 'none' : 'auto'
        }}>
          <button
            onClick={handleQuickAdd}
            style={{
              background: 'rgba(201,168,118,0.15)',
              border: '1px solid var(--border-gold)',
              color: 'var(--gold-primary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
            title="Add to bag"
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </Link>

      {/* Product Details Section */}
      <div style={{
        padding: '16px 14px 18px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface-1)'
      }}>
        <div>
          {/* Category & Color Swatches Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px'
          }}>
            <span style={{
              fontSize: '10px',
              color: 'var(--gold-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 600
            }}>
              {product.category}
            </span>

            {availableColors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {availableColors.slice(0, 5).map((col, idx) => (
                  <span
                    key={idx}
                    title={col.name}
                    style={{
                      width: '11px',
                      height: '11px',
                      borderRadius: '50%',
                      backgroundColor: col.hex || '#18181B',
                      border: '1px solid var(--border-medium)',
                      display: 'inline-block',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug || product._id}`}>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '17px',
              fontWeight: 500,
              lineHeight: 1.3,
              color: 'var(--text-primary)',
              marginBottom: '6px',
              transition: 'color 0.2s'
            }}>
              {product.name}
            </h3>
          </Link>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {product.specifications?.colorName && (
              <span style={{ color: 'var(--text-muted)' }}>
                {product.specifications.colorName}
              </span>
            )}
            {product.specifications?.texture && (
              <span style={{ color: 'var(--text-muted)' }}>
                • {product.specifications.texture}
              </span>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gold-primary)' }}>
              {format(displayPrice)}
            </span>
            {product.compareAtPrice > displayPrice && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                {format(product.compareAtPrice)}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug || product._id}`}
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.04em'
            }}
          >
            <span>Details</span>
            <Eye size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
