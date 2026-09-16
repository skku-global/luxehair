import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { format } = useCurrency();

  if (!product) return null;

  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const displayPrice = defaultVariant ? defaultVariant.price : product.price;
  const primaryImage = product.images?.[0] || '/images/products/placeholder-hair.jpg';
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, defaultVariant, 1);
  };

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
        backgroundColor: '#121110',
        transition: 'transform 0.3s ease, border-color 0.3s ease'
      }}
    >
      {/* Product Image Frame */}
      <Link
        to={`/product/${product.slug || product._id}`}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '125%', // 4:5 editorial portrait ratio
          backgroundColor: '#161514',
          overflow: 'hidden',
          display: 'block'
        }}
      >
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)'
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80';
          }}
        />

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
          padding: '12px',
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
              padding: '10px 16px',
              fontSize: '11px',
              letterSpacing: '0.12em'
            }}
          >
            <ShoppingBag size={14} />
            <span>Quick Add to Bag</span>
          </button>
        </div>
      </Link>

      {/* Product Details Section */}
      <div style={{
        padding: '18px 16px 20px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Category & Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px'
          }}>
            <span style={{
              fontSize: '11px',
              color: '#C9A876',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600
            }}>
              {product.category}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#A6A095' }}>
              <Star size={12} fill="#C9A876" stroke="#C9A876" />
              <span>{product.rating || 4.9}</span>
              <span style={{ color: '#6E6960' }}>({product.reviewsCount || 12})</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug || product._id}`}>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '18px',
              fontWeight: 500,
              lineHeight: 1.3,
              color: '#F2EFEA',
              marginBottom: '6px',
              transition: 'color 0.2s'
            }}>
              {product.name}
            </h3>
          </Link>

          {/* Hair specs bullet */}
          {product.specifications?.laceType && (
            <p style={{ fontSize: '12px', color: '#8A847A', marginBottom: '10px' }}>
              {product.specifications.laceType} • {product.specifications.origin || 'Raw Hair'}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginTop: '12px',
          borderTop: '1px solid #1C1B19',
          paddingTop: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#C9A876'
            }}>
              {format(displayPrice)}
            </span>
            {product.compareAtPrice > displayPrice && (
              <span style={{
                fontSize: '13px',
                color: '#6E6960',
                textDecoration: 'line-through'
              }}>
                {format(product.compareAtPrice)}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug || product._id}`}
            style={{
              fontSize: '12px',
              color: '#A6A095',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
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
