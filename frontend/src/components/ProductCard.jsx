import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Sparkles, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function ProductCard({ product }) {
  const [isActive, setIsActive] = useState(false); // covers both hover (desktop) and touch (mobile)
  const touchTimeout = useRef(null);
  const { addToCart } = useCart();
  const { format } = useCurrency();

  // Clear the lingering touch timer so it cannot fire after unmount
  useEffect(() => () => clearTimeout(touchTimeout.current), []);

  if (!product) return null;

  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const displayPrice = defaultVariant ? defaultVariant.price : product.price;
  const productHref = `/product/${product.slug || product._id}`;

  const isSoldOut = product.inStock === false || product.stockQuantity === 0;
  const isOnSale = product.compareAtPrice > displayPrice;

  // Model photo is shown first; the hair / mannequin / detail photo is
  // revealed on hover (pointer devices) or touch (mobile).
  const isWig = product.category === 'wigs';
  const allImages = product.images || [];

  const primaryImage = allImages[0] || '/images/products/placeholder-hair.jpg';
  const secondaryImage = allImages[1] || primaryImage;
  const hasSecondImage = allImages.length > 1;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    addToCart(product, defaultVariant, 1);
  };

  // Mobile touch: touching the image reveals the mannequin/hair view
  const handleTouchStart = () => {
    clearTimeout(touchTimeout.current);
    setIsActive(true);
  };

  const handleTouchEnd = () => {
    // Keep the hair view visible briefly after the finger lifts
    touchTimeout.current = setTimeout(() => setIsActive(false), 1200);
  };

  const availableColors = product.specifications?.availableColors || (
    product.specifications?.colorHex
      ? [{ name: product.specifications.colorName, hex: product.specifications.colorHex }]
      : []
  );

  const rating = Number(product.rating) || 0;
  const reviewsCount = Number(product.reviewsCount) || 0;

  return (
    <div
      className="product-card card-luxury"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      {/* ── Image frame ──────────────────────────────────────────
          A plain container, not an anchor: the clickable area is an
          absolutely positioned overlay link, which keeps the quick-add
          buttons as valid siblings rather than buttons nested in an <a>. */}
      <div
        className="product-card-frame"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Primary image: model photo (default view) */}
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="product-card-img"
          style={{
            transform: isActive ? 'scale(1.04)' : 'scale(1)',
            opacity: isActive && hasSecondImage ? 0 : 1
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/products/placeholder-hair.jpg';
          }}
        />

        {/* Secondary image: mannequin / hair detail, revealed on hover or touch */}
        {hasSecondImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} — hair and mannequin view`}
            loading="lazy"
            className="product-card-img"
            style={{
              transform: isActive ? 'scale(1.04)' : 'scale(1)',
              opacity: isActive ? 1 : 0
            }}
          />
        )}

        {/* Full-frame click target */}
        <Link
          to={productHref}
          className="product-card-hit"
          aria-label={`View ${product.name}`}
        />

        {/* View-mode hint while the alternate image is showing */}
        {hasSecondImage && isActive && (
          <div className="product-card-viewhint">
            <Sparkles size={10} style={{ color: 'var(--gold-primary)' }} />
            <span>{product.category === 'attachments' ? 'Attachment Seam & Clips' : isWig ? 'Hair & Mannequin' : 'Formula & Bottle'}</span>
          </div>
        )}

        {/* Badges */}
        <div className="product-card-badges">
          {product.isBestseller && <span className="badge-gold">Bestseller</span>}
          {isOnSale && (
            <span className="product-card-save">
              SAVE {Math.round(((product.compareAtPrice - displayPrice) / product.compareAtPrice) * 100)}%
            </span>
          )}
          {isSoldOut && <span className="product-card-soldout">Sold Out</span>}
        </div>

        {/* Quick add — slides up on hover, permanently visible on touch devices */}
        <div className={`product-card-quickadd ${isActive ? 'is-active' : ''}`}>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            className="btn-gold product-card-quickadd-btn"
          >
            <ShoppingBag size={13} />
            <span>{isSoldOut ? 'Sold Out' : 'Quick Add to Bag'}</span>
          </button>
        </div>
      </div>

      {/* ── Details ───────────────────────────────────────────── */}
      <div className="product-card-body">
        <div>
          {/* Category & colour swatches */}
          <div className="product-card-meta">
            <span className="product-card-category">
              {product.category === 'attachments'
                ? (product.specifications?.attachmentType ? `${product.specifications.attachmentType} Extension` : 'Hair Extension')
                : product.category === 'hair-care'
                ? 'Botanical Hair Care'
                : 'Raw Virgin Wig'}
            </span>

            {availableColors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {availableColors.slice(0, 5).map((col, idx) => (
                  <span
                    key={`${col.hex || col.name}-${idx}`}
                    title={col.name}
                    className="product-card-swatch"
                    style={{ backgroundColor: col.hex || '#18181B' }}
                  />
                ))}
              </div>
            )}
          </div>

          <Link to={productHref} className="product-card-title-link">
            <h3 className="product-card-title">{product.name}</h3>
          </Link>

          {rating > 0 && (
            <div className="product-card-rating">
              <span style={{ display: 'inline-flex', gap: '1px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={11}
                    style={{
                      color: 'var(--gold-primary)',
                      fill: star <= Math.round(rating) ? 'var(--gold-primary)' : 'transparent'
                    }}
                  />
                ))}
              </span>
              <span>
                {rating.toFixed(1)}
                {reviewsCount > 0 && ` (${reviewsCount})`}
              </span>
            </div>
          )}

          <div className="product-card-specs">
            {product.specifications?.colorName && <span>{product.specifications.colorName}</span>}
            {product.specifications?.texture && <span>• {product.specifications.texture}</span>}
          </div>
        </div>

        {/* Price & action */}
        <div className="product-card-footer">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span className="product-card-price">{format(displayPrice)}</span>
            {isOnSale && (
              <span className="product-card-compare">{format(product.compareAtPrice)}</span>
            )}
          </div>

          <Link to={productHref} className="product-card-details">
            <span>Details</span>
            <Eye size={12} />
          </Link>
        </div>
      </div>

      <style>{`
        .product-card {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: var(--bg-surface-1);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          transition: transform var(--transition-smooth), border-color var(--transition-smooth), box-shadow var(--transition-smooth);
        }
        .product-card:hover {
          border-color: var(--border-gold);
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.5);
          transform: translateY(-2px);
        }

        .product-card-frame {
          position: relative;
          width: 100%;
          padding-top: 128%;
          background-color: var(--bg-surface-2);
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }

        .product-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.4s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .product-card-hit {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: block;
        }

        .product-card-viewhint {
          position: absolute;
          bottom: 56px;
          left: 10px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: rgba(14, 13, 12, 0.85);
          border: 1px solid var(--border-gold);
          color: var(--text-primary);
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          backdrop-filter: blur(6px);
          pointer-events: none;
        }

        .product-card-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          pointer-events: none;
        }

        .product-card-save {
          background-color: #A83232;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          letter-spacing: 0.06em;
        }

        .product-card-soldout {
          background-color: rgba(14, 13, 12, 0.9);
          border: 1px solid var(--border-medium);
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .product-card-quickadd {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 3;
          padding: 10px 12px;
          background: linear-gradient(to top, rgba(14, 13, 12, 0.95), transparent);
          transform: translateY(100%);
          transition: transform var(--transition-smooth);
        }
        .product-card-quickadd.is-active {
          transform: translateY(0);
        }

        .product-card-quickadd-btn {
          width: 100%;
          padding: 9px 14px;
          font-size: 11px;
          letter-spacing: 0.12em;
        }
        .product-card-quickadd-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: var(--bg-surface-2);
          border-color: var(--border-medium);
          color: var(--text-muted);
          box-shadow: none;
          transform: none;
        }

        /* Touch devices cannot hover — keep the bag button permanently reachable */
        @media (hover: none) {
          .product-card-quickadd {
            transform: translateY(0);
          }
          .product-card-viewhint {
            bottom: 56px;
          }
        }

        .product-card-body {
          padding: 16px 14px 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
          background-color: var(--bg-surface-1);
        }

        .product-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
        }

        .product-card-category {
          font-size: 10px;
          color: var(--gold-primary);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 600;
        }

        .product-card-swatch {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: 1px solid var(--border-medium);
          display: inline-block;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .product-card-title-link:hover .product-card-title {
          color: var(--gold-primary);
        }

        .product-card-title {
          font-family: var(--font-serif);
          font-size: 17px;
          font-weight: 500;
          line-height: 1.3;
          color: var(--text-primary);
          margin-bottom: 6px;
          transition: color var(--transition-fast);
        }

        .product-card-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .product-card-specs {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .product-card-footer {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 10px;
        }

        .product-card-price {
          font-size: 15px;
          font-weight: 600;
          color: var(--gold-primary);
        }

        .product-card-compare {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .product-card-details {
          font-size: 11px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .product-card-details:hover {
          color: var(--gold-primary);
        }

        @media (max-width: 480px) {
          .product-card-body {
            padding: 12px 10px 14px;
          }
          .product-card-title {
            font-size: 14px;
          }
          .product-card-price {
            font-size: 13px;
          }
          .product-card-details span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
