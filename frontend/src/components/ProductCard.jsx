import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Eye, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { format } = useCurrency();

  if (!product) return null;

  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const displayPrice = defaultVariant ? defaultVariant.price : product.price;
  const primaryImage = product.images?.[0] || '/images/products/placeholder-hair.jpg';
  const secondaryImage = product.images?.[1] || primaryImage;

  const hasMannequinView = product.images && product.images.length > 1;
  const displayImage = isHovered && hasMannequinView ? secondaryImage : primaryImage;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, defaultVariant, 1);
  };

  const availableColors = product.specifications?.availableColors || (
    product.specifications?.colorHex ? [{ name: product.specifications.colorName, hex: product.specifications.colorHex }] : []
  );

  return (
    <div
      className="card-luxury"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '128%', // 4:5 editorial portrait ratio
          backgroundColor: 'var(--bg-surface-2)',
          overflow: 'hidden',
          display: 'block'
        }}
      >
        <img
          src={displayImage}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)'
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* View Mode Indicator Badge */}
        {hasMannequinView && (
          <div style={{
            position: 'absolute',
            bottom: isHovered ? '56px' : '10px',
            left: '10px',
            zIndex: 2,
            backgroundColor: 'rgba(14, 13, 12, 0.78)',
            border: '1px solid var(--border-gold)',
            color: '#F2EFEA',
            fontSize: '9px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: '2px',
            backdropFilter: 'blur(6px)',
            transition: 'bottom 0.3s ease, opacity 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={10} style={{ color: 'var(--gold-primary)' }} />
            <span>{isHovered ? 'Mannequin Atelier Display' : 'Model Wear'}</span>
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
            <span className="badge-gold">
              Bestseller
            </span>
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

        {/* Quick Add overlay button on hover */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 12px',
          background: 'linear-gradient(to top, rgba(14, 13, 12, 0.95), transparent)',
          transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 3
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

            {/* Color Swatch Dots */}
            {availableColors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {availableColors.map((col, idx) => (
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

          {/* Color & Hair Specs bullet */}
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
            <span style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--gold-primary)'
            }}>
              {format(displayPrice)}
            </span>
            {product.compareAtPrice > displayPrice && (
              <span style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                textDecoration: 'line-through'
              }}>
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

