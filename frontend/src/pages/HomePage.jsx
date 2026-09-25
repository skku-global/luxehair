import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, BadgeCheck, Truck } from 'lucide-react';
import { BRAND } from '../config/brand';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

/**
 * Display priority for the home showcases: wigs lead, then attachments, then care.
 * Derived from BRAND.categories so the keys always match the real category slugs.
 */
const CATEGORY_ORDER = BRAND.categories.reduce((acc, cat, index) => {
  acc[cat.slug] = index;
  return acc;
}, {});

const sortByCategoryPriority = (arr) =>
  (arr || [])
    .slice()
    .sort((a, b) => (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99));

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.getFeaturedProducts();
        if (res.success) {
          setFeaturedProducts(sortByCategoryPriority(res.featured));
          setBestsellers(sortByCategoryPriority(res.bestsellers));
        } else {
          setError(res.message || 'We could not load the collection right now.');
        }
      } catch (err) {
        console.error('Failed to load home products:', err);
        setError('We could not reach the boutique. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      {/* Editorial Luxury Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(to bottom, rgba(14, 13, 12, 0.45) 0%, rgba(14, 13, 12, 0.25) 35%, rgba(14, 13, 12, 0.65) 80%, #0E0D0C 100%), url("/images/banners/hero-banner.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        borderBottom: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        {/* Subtle Ambient Radial Glow */}
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '750px',
          height: '750px',
          background: 'radial-gradient(circle, rgba(201, 168, 118, 0.10) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '60px 24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(14, 13, 12, 0.75)',
            border: '1px solid rgba(201, 168, 118, 0.4)',
            padding: '6px 18px',
            borderRadius: '2px',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}>
            <Sparkles size={14} style={{ color: '#C9A876' }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#E3CEAB', fontWeight: 500 }}>
              The 2026 Haute Coiffure Collection
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Cinzel', Georgia, serif",
            fontSize: 'clamp(38px, 6.5vw, 76px)',
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '0.04em',
            maxWidth: '960px',
            margin: '0 auto 24px',
            textTransform: 'none',
            color: '#FFFFFF',
            textShadow: '0 2px 24px rgba(0, 0, 0, 0.85), 0 4px 45px rgba(0, 0, 0, 0.7)'
          }}>
            Single-Donor Raw Virgin Hair & Bespoke HD Masterpieces
          </h1>

          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: '#E0DDD7',
            maxWidth: '660px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
            fontWeight: 300,
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.85)'
          }}>
            Unprocessed, 100% cuticle-intact hair sourced directly from single donors. 
            Meticulously crafted for natural movement, longevity, and effortless glamour.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <Link to="/shop" className="btn-gold" style={{ padding: '16px 36px', fontSize: '13px' }}>
              <span>Explore The Boutique</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/shop?category=wigs" className="btn-outline-gold" style={{ padding: '15px 32px', fontSize: '13px' }}>
              View Ready-To-Wear Wigs
            </Link>
          </div>

          {/* Micro trust indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            marginTop: '56px',
            fontSize: '12px',
            color: '#8A847A',
            letterSpacing: '0.05em'
          }}>
            <span>✦ 14A Double-Drawn Raw Hair</span>
            <span>✦ Ultra-Thin Invisible HD Lace</span>
            <span>✦ Lagos Concierge Same-Day Dispatch</span>
          </div>
        </div>
      </section>

      {/* 1. Trust Badge Row */}
      <section className="trust-badge-row">
        <div className="container">
          <div className="trust-badge-grid">
            <div className="trust-badge-item">
              <div className="trust-badge-icon-box">
                <BadgeCheck size={22} style={{ color: 'var(--gold-primary)' }} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '3px' }}>
                  Original Products
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.4 }}>
                  100% Certified Raw Virgin Hair
                </p>
              </div>
            </div>

            <div className="trust-badge-item">
              <div className="trust-badge-icon-box">
                <ShieldCheck size={22} style={{ color: 'var(--gold-primary)' }} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '3px' }}>
                  Satisfaction Guarantee
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.4 }}>
                  Concierge Quality & Authenticity
                </p>
              </div>
            </div>

            <div className="trust-badge-item">
              <div className="trust-badge-icon-box">
                <Sparkles size={22} style={{ color: 'var(--gold-primary)' }} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '3px' }}>
                  New Arrivals Weekly
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.4 }}>
                  Bespoke Haute Drops & Restocks
                </p>
              </div>
            </div>

            <div className="trust-badge-item">
              <div className="trust-badge-icon-box">
                <Truck size={22} style={{ color: 'var(--gold-primary)' }} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '3px' }}>
                  Free Delivery
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.4 }}>
                  Complimentary Shipping on Luxury Orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Scrolling Ticker / Marquee */}
      <div className="luxury-ticker" aria-hidden="true">
        <div className="luxury-ticker-track">
          {[...Array(12)].map((_, i) => (
            <div key={`ticker-1-${i}`} className="luxury-ticker-item">
              <span>NEW COLLECTION</span>
              <span className="luxury-ticker-divider">✦</span>
            </div>
          ))}
          {[...Array(12)].map((_, i) => (
            <div key={`ticker-2-${i}`} className="luxury-ticker-item">
              <span>NEW COLLECTION</span>
              <span className="luxury-ticker-divider">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Category Banner Tiles */}
      <section className="category-banner-section">
        <div className="container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-tag" style={{ color: 'var(--gold-primary)', display: 'block', marginBottom: '12px' }}>
              Shop By Category
            </span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 300,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
              marginBottom: '10px'
            }}>
              The Complete Atelier
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', letterSpacing: '0.04em' }}>
              Raw virgin wigs · Seamless extensions · Botanical formulations
            </p>
          </div>

          <div className="category-banner-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {/* Tile 1: Wigs */}
            <Link to="/shop?category=wigs" className="category-banner-tile">
              <img
                src="/images/banners/banner-wigs.jpg"
                alt="Raw Virgin Wigs Collection"
                className="category-banner-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&auto=format&fit=crop&q=85';
                }}
              />
              <div className="category-banner-overlay" />
              <div className="category-banner-content">
                <span style={{ display: 'block', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,118,0.85)', marginBottom: '8px' }}>
                  HD Lace · Full Lace · 360°
                </span>
                <h3 className="category-banner-title">Raw Virgin<br />Wigs</h3>
                <span className="category-banner-link">
                  <span>Shop Wigs</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            {/* Tile 2: Attachments — Hush Hair inspired */}
            <Link to="/shop?category=attachments" className="category-banner-tile">
              <img
                src="/images/banners/banner-attachments.jpg"
                alt="Premium Hair Extensions & Attachments"
                className="category-banner-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1200&auto=format&fit=crop&q=85';
                }}
              />
              <div className="category-banner-overlay" />
              <div className="category-banner-content">
                <span style={{ display: 'block', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,118,0.85)', marginBottom: '8px' }}>
                  Clip-In · Weft · Tape-In · Nano · Keratin
                </span>
                <h3 className="category-banner-title">Extensions &amp;<br />Attachments</h3>
                <span className="category-banner-link">
                  <span>Shop Extensions</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            {/* Tile 3: Hair Care */}
            <Link to="/shop?category=hair-care" className="category-banner-tile">
              <img
                src="/images/banners/banner-haircare.jpg"
                alt="Botanical Hair Care Formulations"
                className="category-banner-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=85';
                }}
              />
              <div className="category-banner-overlay" />
              <div className="category-banner-content">
                <span style={{ display: 'block', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,118,0.85)', marginBottom: '8px' }}>
                  Oils · Serums · Elixirs
                </span>
                <h3 className="category-banner-title">Botanical<br />Hair Care</h3>
                <span className="category-banner-link">
                  <span>Shop Care</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Curated Collection (Featured Products) */}
      <section style={{ padding: '60px 0 90px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '40px',
            gap: '20px'
          }}>
            <div>
              <span className="section-tag">Atelier Highlights</span>
              <h2 className="section-title">The Signature Collection</h2>
            </div>
            <Link to="/shop" className="btn-outline-gold" style={{ padding: '10px 20px', fontSize: '12px' }}>
              View All Pieces
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gold-primary)' }}>
              ✦ Loading Couture Catalog...
            </div>
          ) : error ? (
            <div
              role="alert"
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                backgroundColor: 'var(--bg-surface-1)',
                border: '1px solid rgba(220, 105, 95, 0.35)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <p style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '15px' }}>
                The collection is temporarily unavailable.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{error}</p>
            </div>
          ) : (
            <div className="grid-products">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Editorial Luxury Feature: The Raw Hair Standard */}
      <section style={{
        padding: '90px 0',
        backgroundColor: 'var(--bg-surface-2)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '50px',
            alignItems: 'center'
          }}>
            <div>
              <span className="section-tag">Uncompromising Sourcing</span>
              <h2 className="section-title">Why Single-Donor Raw Hair Is An Incomparable Investment</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px', fontSize: '15px' }}>
                Ordinary commercial hair is acid-bathed, chemically stripped of its cuticle, and coated in synthetic silicone that washes away in three weeks. 
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px', fontSize: '15px' }}>
                At {BRAND.name}, every bundle comes from a single living donor. The outer cuticle scales face in identical alignment, creating natural luster, zero knotting, and allowing the hair to be bleached, flat-ironed, and worn for 3 to 5 years without deterioration.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ borderLeft: '2px solid var(--gold-primary)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>14A Grade</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Double-drawn thickness from root to tip.</div>
                </div>
                <div style={{ borderLeft: '2px solid var(--gold-primary)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Zero Acid Bath</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pure botanical steam treatment only.</div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                paddingTop: '120%',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid var(--border-medium)'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=900&auto=format&fit=crop&q=80"
                  alt="Raw Hair Texture Showcase"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '20px',
                backgroundColor: 'var(--bg-surface-1)',
                border: '1px solid var(--gold-primary)',
                padding: '16px 24px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.8)'
              }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--gold-primary)', textTransform: 'uppercase' }}>Certificate</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>100% Verified Donor Origin</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bestselling Units Section */}
      <section style={{ padding: '90px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-tag">Most Coveted</span>
            <h2 className="section-title">Client Bestsellers</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Consistently acclaimed by celebrities, stylists, and discerning private clients.
            </p>
          </div>

          {bestsellers.length > 0 ? (
            <div className="grid-products">
              {bestsellers.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            !loading && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Bestsellers are being restocked. Browse the full boutique in the meantime.
              </p>
            )
          )}
        </div>
      </section>
    </div>
  );
}
