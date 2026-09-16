import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Gem, Compass, ChevronRight } from 'lucide-react';
import { BRAND, formatPrice } from '../config/brand';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.getFeaturedProducts();
        if (res.success) {
          setFeaturedProducts(res.featured || []);
          setBestsellers(res.bestsellers || []);
        }
      } catch (err) {
        console.error('Failed to load home products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div style={{ backgroundColor: '#0E0D0C', color: '#F2EFEA' }}>
      {/* Editorial Luxury Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(to bottom, rgba(14, 13, 12, 0.4), rgba(14, 13, 12, 0.95)), url("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&auto=format&fit=crop&q=85")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 25%',
        borderBottom: '1px solid #1C1B19',
        overflow: 'hidden'
      }}>
        {/* Subtle Ambient Radial Glow */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(201, 168, 118, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '60px 24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(20, 19, 18, 0.75)',
            border: '1px solid rgba(201, 168, 118, 0.3)',
            padding: '6px 16px',
            borderRadius: '2px',
            marginBottom: '24px',
            backdropFilter: 'blur(8px)'
          }}>
            <Sparkles size={14} style={{ color: '#C9A876' }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#E3CEAB' }}>
              The 2026 Haute Coiffure Collection
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Cinzel', Georgia, serif",
            fontSize: 'clamp(38px, 6.5vw, 76px)',
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '0.04em',
            maxWidth: '920px',
            margin: '0 auto 24px',
            textTransform: 'none',
            color: '#F9F7F5'
          }}>
            Single-Donor Raw Virgin Hair & Bespoke HD Masterpieces
          </h1>

          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: '#C0BAB0',
            maxWidth: '640px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
            fontWeight: 300
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

      {/* Category Tiles Section (Wigs / Attachments / Hair Products) */}
      <section style={{ padding: '90px 0 60px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-tag">Distinct Categories</span>
            <h2 className="section-title">The Three Pillars of Haute Hair</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Specialized exclusively in high-grade raw human hair and clinical hair care.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {/* Tile 1: Wigs */}
            <Link
              to="/shop?category=wigs"
              className="card-luxury"
              style={{
                position: 'relative',
                height: '460px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '36px',
                backgroundImage: 'linear-gradient(to top, #0E0D0C 15%, rgba(14,13,12,0.4) 60%, transparent), url("https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                textDecoration: 'none'
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#C9A876', textTransform: 'uppercase' }}>
                  Atelier Masterpieces
                </span>
                <h3 style={{ fontSize: '28px', color: '#F2EFEA', margin: '8px 0 10px' }}>
                  Raw & Virgin Wigs
                </h3>
                <p style={{ fontSize: '13px', color: '#A6A095', lineHeight: 1.6, marginBottom: '18px', maxWidth: '300px' }}>
                  13x6 HD Lace Frontals, Glueless Bob closures, and 250% density red carpet units.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#C9A876', fontSize: '13px', fontWeight: 600 }}>
                  <span>Shop Wigs</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>

            {/* Tile 2: Attachments */}
            <Link
              to="/shop?category=attachments"
              className="card-luxury"
              style={{
                position: 'relative',
                height: '460px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '36px',
                backgroundImage: 'linear-gradient(to top, #0E0D0C 15%, rgba(14,13,12,0.4) 60%, transparent), url("https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&auto=format&fit=crop&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                textDecoration: 'none'
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#C9A876', textTransform: 'uppercase' }}>
                  Volume & Length
                </span>
                <h3 style={{ fontSize: '28px', color: '#F2EFEA', margin: '8px 0 10px' }}>
                  Hair Attachments
                </h3>
                <p style={{ fontSize: '13px', color: '#A6A095', lineHeight: 1.6, marginBottom: '18px', maxWidth: '300px' }}>
                  Invisible PU tape-ins, seamless silicone clip-ins, and couture wrap-around ponytails.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#C9A876', fontSize: '13px', fontWeight: 600 }}>
                  <span>Shop Attachments</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>

            {/* Tile 3: Hair Care */}
            <Link
              to="/shop?category=hair-care"
              className="card-luxury"
              style={{
                position: 'relative',
                height: '460px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '36px',
                backgroundImage: 'linear-gradient(to top, #0E0D0C 15%, rgba(14,13,12,0.4) 60%, transparent), url("https://images.unsplash.com/photo-1608248597358-1e4277b21e90?w=800&auto=format&fit=crop&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                textDecoration: 'none'
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#C9A876', textTransform: 'uppercase' }}>
                  Botanical Formulations
                </span>
                <h3 style={{ fontSize: '28px', color: '#F2EFEA', margin: '8px 0 10px' }}>
                  Hair Care & Maintenance
                </h3>
                <p style={{ fontSize: '13px', color: '#A6A095', lineHeight: 1.6, marginBottom: '18px', maxWidth: '300px' }}>
                  Cold-pressed Moroccan Argan oils, HD lace melting mists, and keratin masques.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#C9A876', fontSize: '13px', fontWeight: 600 }}>
                  <span>Shop Care</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Curated Collection (Featured Products) */}
      <section style={{ padding: '60px 0 90px', borderTop: '1px solid #1C1B19' }}>
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
            <div style={{ textAlign: 'center', padding: '60px', color: '#C9A876' }}>
              ✦ Loading Couture Catalog...
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
        backgroundColor: '#121110',
        borderTop: '1px solid #1C1B19',
        borderBottom: '1px solid #1C1B19'
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
              <p style={{ color: '#A6A095', lineHeight: 1.8, marginBottom: '24px', fontSize: '15px' }}>
                Ordinary commercial hair is acid-bathed, chemically stripped of its cuticle, and coated in synthetic silicone that washes away in three weeks. 
              </p>
              <p style={{ color: '#A6A095', lineHeight: 1.8, marginBottom: '32px', fontSize: '15px' }}>
                At {BRAND.name}, every bundle comes from a single living donor. The outer cuticle scales face in identical alignment, creating natural luster, zero knotting, and allowing the hair to be bleached, flat-ironed, and worn for 3 to 5 years without deterioration.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ borderLeft: '2px solid #C9A876', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#F2EFEA', marginBottom: '4px' }}>14A Grade</div>
                  <div style={{ fontSize: '12px', color: '#8A847A' }}>Double-drawn thickness from root to tip.</div>
                </div>
                <div style={{ borderLeft: '2px solid #C9A876', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#F2EFEA', marginBottom: '4px' }}>Zero Acid Bath</div>
                  <div style={{ fontSize: '12px', color: '#8A847A' }}>Pure botanical steam treatment only.</div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                paddingTop: '120%',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #2A2824'
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
                backgroundColor: '#161514',
                border: '1px solid #C9A876',
                padding: '16px 24px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.8)'
              }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#C9A876', textTransform: 'uppercase' }}>Certificate</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#F2EFEA' }}>100% Verified Donor Origin</div>
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

          <div className="grid-products">
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
