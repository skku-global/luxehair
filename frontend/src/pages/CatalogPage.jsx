import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, RotateCcw, X, LayoutGrid, LayoutList, Star, Sparkles } from 'lucide-react';
import { BRAND } from '../config/brand';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';

/**
 * Display priority when no explicit sort is chosen: wigs lead the boutique.
 * Derived from BRAND.categories so it can never drift out of sync with the
 * real category slugs (the previous hardcoded map listed categories that
 * do not exist, so every product fell through to the default weight).
 */
const CATEGORY_ORDER = BRAND.categories.reduce((acc, cat, index) => {
  acc[cat.slug] = index;
  return acc;
}, {});

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const { format } = useCurrency();

  // Active filter state synced from URL query params
  const activeCategory = searchParams.get('category') || 'all';
  const activeTexture = searchParams.get('texture') || 'all';
  const activeLength = searchParams.get('length') || 'all';
  const activeType = searchParams.get('type') || 'all';
  const activeColor = searchParams.get('color') || 'all';
  const activeProductType = searchParams.get('productType') || 'all';
  const activeSort = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('search') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam || '500000');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showExtensionGuide, setShowExtensionGuide] = useState(false);

  const hasActiveFilters =
    activeCategory !== 'all' ||
    activeTexture !== 'all' ||
    activeLength !== 'all' ||
    activeType !== 'all' ||
    activeColor !== 'all' ||
    activeProductType !== 'all' ||
    Boolean(searchQuery) ||
    Boolean(maxPriceParam);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (activeCategory && activeCategory !== 'all') params.category = activeCategory;
        if (activeTexture && activeTexture !== 'all') params.texture = activeTexture;
        if (activeLength && activeLength !== 'all') params.length = activeLength;
        if (activeType && activeType !== 'all') params.type = activeType;
        if (activeColor && activeColor !== 'all') params.color = activeColor;
        if (activeProductType && activeProductType !== 'all') params.productType = activeProductType;
        if (activeSort) params.sort = activeSort;
        if (searchQuery) params.search = searchQuery;
        if (maxPriceParam) params.maxPrice = maxPriceParam;

        const res = await api.getProducts(params);
        if (res.success) {
          const incoming = res.products || [];

          // Group wigs first only while browsing the default ordering.
          // Once the shopper picks a sort (price, rating, popularity) their
          // choice wins — re-grouping here used to silently override it.
          const shouldGroupByCategory = activeSort === 'newest' && activeCategory === 'all';

          setProducts(
            shouldGroupByCategory
              ? incoming.slice().sort(
                  (a, b) => (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99)
                )
              : incoming
          );
          setTotalCount(res.total || 0);
        } else {
          setError(res.message || 'We could not load the catalog. Please try again.');
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('We could not reach the boutique. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [
    activeCategory,
    activeTexture,
    activeLength,
    activeType,
    activeColor,
    activeProductType,
    activeSort,
    searchQuery,
    maxPriceParam
  ]);

  const updateParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (!val || val === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, val);
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (catId) => {
    const newParams = new URLSearchParams(searchParams);
    if (!catId || catId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', catId);
    }
    // Clean up category-specific filters when switching category
    newParams.delete('texture');
    newParams.delete('length');
    newParams.delete('type');
    newParams.delete('color');
    newParams.delete('productType');
    setSearchParams(newParams);
  };

  const handlePriceApply = () => {
    updateParam('maxPrice', localMaxPrice);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setLocalMaxPrice('500000');
  };

  const categoryTitles = {
    all: 'The Entire Atelier Collection',
    wigs: 'Raw Virgin Wigs & HD Frontals',
    attachments: 'Luxury Hair Extensions & Attachments',
    'hair-care': 'Botanical Hair Care Formulations'
  };

  return (
    <div className="catalog-page-root" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', minHeight: '100vh', padding: '40px 0 80px', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <div className="container">
        {/* Header Title Section */}
        <div className="catalog-header" style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="section-tag" style={{ color: 'var(--gold-primary)' }}>Haute Coiffure Catalog</span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 300,
            color: 'var(--text-primary)',
            marginBottom: '10px'
          }}>
            {categoryTitles[activeCategory] || 'Haute Coiffure'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
            Browse our hand-crafted selection of 100% single-donor raw hair, bespoke lace closures, and French botanical elixirs.
          </p>

          {searchQuery && (
            <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(201,168,118,0.1)', padding: '6px 14px', borderRadius: '2px', border: '1px solid var(--border-gold)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Searching for:</span>
              <strong style={{ fontSize: '13px', color: 'var(--gold-primary)' }}>"{searchQuery}"</strong>
              <button onClick={() => updateParam('search', '')} style={{ color: '#E06C75', marginLeft: '6px', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="catalog-category-pills" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '40px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '24px'
        }}>
          {[
            { id: 'all', label: 'All Creations' },
            { id: 'wigs', label: 'Raw Wigs' },
            { id: 'attachments', label: 'Hair Extensions' },
            { id: 'hair-care', label: 'Hair Care' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              style={{
                backgroundColor: activeCategory === cat.id ? 'var(--gold-primary)' : 'var(--bg-surface-1)',
                color: activeCategory === cat.id ? '#0E0D0C' : 'var(--text-secondary)',
                border: activeCategory === cat.id ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: activeCategory === cat.id ? 600 : 400,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: '2px',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* HAUTE EXTENSIONS ATELIER SHOWCASE BANNER & METHOD SELECTOR */}
        {activeCategory === 'attachments' && (
          <div style={{
            position: 'relative',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '36px',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            {/* Background image & gradient */}
            <div style={{
              position: 'relative',
              padding: 'clamp(28px, 4vw, 44px) clamp(20px, 4vw, 36px)',
              backgroundImage: 'linear-gradient(to right, rgba(14,13,12,0.95) 0%, rgba(14,13,12,0.85) 55%, rgba(14,13,12,0.65) 100%), url(/images/banners/banner-attachments.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                <span style={{
                  backgroundColor: 'rgba(201,168,118,0.15)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--gold-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '2px'
                }}>
                  Haute Extensions Atelier
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• 100% Single-Donor Virgin Hair</span>
              </div>

              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 300,
                color: '#F2EFEA',
                margin: 0,
                lineHeight: 1.15
              }}>
                Hair Extensions &amp; Attachments
              </h2>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                maxWidth: '680px',
                lineHeight: 1.65,
                margin: 0
              }}>
                Zero-damage volume, instant red-carpet length, and seamless salon blending. Whether you seek 5-minute clip-and-go convenience, undetectable medical-grade tape-ins, hand-tied secret wefts, Italian keratin fusion bonds, or a snatched runway wrap ponytail — each set is hand-crafted from 100% cuticle-aligned virgin human hair.
              </p>

              {/* 4 Value Pillars */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '4px'
              }}>
                {[
                  '✦ 100% Cuticle Intact Virgin Hair',
                  '✦ Zero-Damage Scalp Architecture',
                  '✦ Reusable Up To 2–3 Years',
                  '✦ Color-Match Salon Guarantee'
                ].map((item, idx) => (
                  <span key={idx} style={{
                    fontSize: '11px',
                    color: 'var(--gold-primary)',
                    backgroundColor: 'rgba(14,13,12,0.6)',
                    padding: '4px 10px',
                    borderRadius: '2px',
                    border: '1px solid rgba(201,168,118,0.2)'
                  }}>
                    {item}
                  </span>
                ))}
              </div>

              {/* Method Quick Filter Bar */}
              <div style={{
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(201,168,118,0.2)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>
                  Filter Method:
                </span>
                {[
                  { id: 'all', label: 'All Methods' },
                  { id: 'Clip-In', label: 'Clip-In Sets' },
                  { id: 'Tape-In', label: 'Tape-In Wefts' },
                  { id: 'Weft', label: 'Secret Wefts' },
                  { id: 'Keratin', label: 'Keratin K-Tips' },
                  { id: 'Nano-Tip', label: 'Nano-Tip Rings' },
                  { id: 'Ponytail', label: 'Wrap Ponytails' }
                ].map(m => {
                  const isSelected = (activeType === m.id) || (m.id === 'all' && activeType === 'all');
                  return (
                    <button
                      key={m.id}
                      onClick={() => updateParam('type', m.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: isSelected ? 600 : 400,
                        letterSpacing: '0.06em',
                        borderRadius: '2px',
                        border: isSelected ? '1px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.15)',
                        backgroundColor: isSelected ? 'var(--gold-primary)' : 'rgba(0,0,0,0.5)',
                        color: isSelected ? '#0E0D0C' : '#F2EFEA',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}

                {/* Toggle Guide Button */}
                <button
                  onClick={() => setShowExtensionGuide(!showExtensionGuide)}
                  style={{
                    marginLeft: 'auto',
                    padding: '6px 14px',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-primary)',
                    backgroundColor: 'rgba(201,168,118,0.1)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={12} />
                  <span>{showExtensionGuide ? 'Hide Method Guide' : 'Extension Method Guide'}</span>
                </button>
              </div>

              {/* Expandable Extension Method Comparison Guide */}
              {showExtensionGuide && (
                <div style={{
                  marginTop: '16px',
                  padding: '20px',
                  backgroundColor: 'rgba(14,13,12,0.92)',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px'
                }}>
                  {[
                    {
                      name: 'Genius Clip-In Sets',
                      time: '5–10 Minutes (DIY)',
                      longevity: '1–2 Years',
                      wear: 'Daily / Remove at Night',
                      bestFor: 'Ultimate flexibility, special occasions & instant red-carpet volume with zero salon visit.'
                    },
                    {
                      name: 'Express Tape-In Wefts',
                      time: '30–45 Mins (Salon)',
                      longevity: '6–8 Weeks / Reusable 3x',
                      wear: 'Semi-Permanent',
                      bestFor: 'Fine to medium hair seeking razor-flat, seamless, weightless root integration.'
                    },
                    {
                      name: 'Secret & Machine Wefts',
                      time: '1.5–2 Hours (Salon)',
                      longevity: '2–3 Years (Re-install 6-8wks)',
                      wear: 'Sew-In or Beaded Row',
                      bestFor: 'Maximum full-head density and fullness with zero return-hair bulk or bumps.'
                    },
                    {
                      name: 'Italian Keratin K-Tips',
                      time: '2–3 Hours (Salon)',
                      longevity: '3–6 Months Wear',
                      wear: 'Strand-by-Strand Fusion',
                      bestFor: '360° free natural movement, high ponytails & active luxury lifestyle.'
                    },
                    {
                      name: 'Nano-Tip Micro Rings',
                      time: '1.5–2 Hours (Salon)',
                      longevity: '3–4 Months / Reusable',
                      wear: '2mm Cold Micro Ring',
                      bestFor: 'Delicate hair; zero heat, zero adhesive, virtually invisible micro attachments.'
                    },
                    {
                      name: 'Wrap-Around Ponytail',
                      time: '2 Minutes (DIY)',
                      longevity: '2+ Years',
                      wear: 'Built-in Comb & Wrap',
                      bestFor: 'Instant dramatic snatched high or low ponytail without salon appointment.'
                    }
                  ].map((guide, idx) => (
                    <div key={idx} style={{
                      padding: '14px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(201,168,118,0.15)',
                      borderRadius: '3px'
                    }}>
                      <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                        {guide.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                        <strong style={{ color: '#F2EFEA' }}>Install:</strong> {guide.time}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                        <strong style={{ color: '#F2EFEA' }}>Wear:</strong> {guide.wear} ({guide.longevity})
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '6px' }}>
                        {guide.bestFor}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toolbar: Count, Mobile Toggle, Sort Dropdown */}
        <div className="catalog-toolbar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '13px', color: '#A6A095' }}>
              Displaying <strong style={{ color: '#F2EFEA' }}>{products.length}</strong> of {totalCount} exquisite pieces
            </div>

            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="btn-dark mobile-filter-btn"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '12px'
              }}
            >
              <SlidersHorizontal size={14} style={{ color: '#C9A876' }} />
              <span>Filter ({activeCategory})</span>
            </button>
          </div>

          {/* Right side: sort + view toggle + reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#8A847A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort:</span>
              <select
                value={activeSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                style={{
                  backgroundColor: '#141312',
                  border: '1px solid #24221F',
                  color: '#F2EFEA',
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Toggle */}
            <div style={{ display: 'flex', border: '1px solid #24221F', borderRadius: '2px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                style={{
                  padding: '7px 10px',
                  backgroundColor: viewMode === 'grid' ? 'var(--gold-primary)' : '#141312',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: viewMode === 'grid' ? '#0E0D0C' : '#8A847A',
                  transition: 'all 0.2s'
                }}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List View"
                style={{
                  padding: '7px 10px',
                  backgroundColor: viewMode === 'list' ? 'var(--gold-primary)' : '#141312',
                  border: 'none',
                  borderLeft: '1px solid #24221F',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: viewMode === 'list' ? '#0E0D0C' : '#8A847A',
                  transition: 'all 0.2s'
                }}
              >
                <LayoutList size={14} />
              </button>
            </div>

            {/* Clear Filters Button if any filter is active */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#C9A876',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid & Filters Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }} className="catalog-layout">
          {/* Category-Specific Filters Sidebar (Desktop) */}
          <FilterSidebar
            activeCategory={activeCategory}
            activeTexture={activeTexture}
            activeLength={activeLength}
            activeType={activeType}
            activeColor={activeColor}
            activeProductType={activeProductType}
            localMaxPrice={localMaxPrice}
            setLocalMaxPrice={setLocalMaxPrice}
            handlePriceApply={handlePriceApply}
            updateParam={updateParam}
            clearAllFilters={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Product Grid Area */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gold-primary)' }}>
                ✦ Curating Selected Pieces...
              </div>
            ) : error ? (
              <div
                role="alert"
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  backgroundColor: 'var(--bg-surface-1)',
                  border: '1px solid rgba(220, 105, 95, 0.35)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  The catalog is temporarily unavailable.
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  {error}
                </p>
                <button type="button" onClick={() => window.location.reload()} className="btn-gold">
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}>
                <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>No creations matched your criteria.</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Try resetting your price filter or browsing all categories.
                </p>
                <button onClick={clearAllFilters} className="btn-gold">
                  Show All Products
                </button>
              </div>
            ) : viewMode === 'list' ? (
              // ── PREMIUM LIST VIEW ──
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {products.map((prod) => (
                  <Link
                    key={prod._id}
                    to={`/product/${prod.slug || prod._id}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '180px 1fr auto',
                        gap: '0',
                        backgroundColor: 'var(--bg-surface-1)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        transition: 'border-color 0.25s, transform 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--gold-primary)';
                        e.currentTarget.style.transform = 'translateX(3px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* Image */}
                      <div style={{ position: 'relative', overflow: 'hidden', width: '180px', height: '180px', flexShrink: 0 }}>
                        <img
                          src={prod.images?.[0]}
                          alt={prod.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                          onError={e => { e.target.src = prod.images?.[1] || '/images/placeholder.jpg'; }}
                        />
                        {prod.isBestseller && (
                          <span style={{
                            position: 'absolute', top: '10px', left: '10px',
                            backgroundColor: 'var(--gold-primary)', color: '#0E0D0C',
                            fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
                            textTransform: 'uppercase', padding: '3px 8px', borderRadius: '1px'
                          }}>Bestseller</span>
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px', minWidth: 0 }}>
                        {/* Category tag */}
                        <span style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-primary)' }}>
                          {prod.category === 'hair-care' ? 'Hair Care' : prod.category === 'attachments' ? 'Extensions' : 'Raw Wigs'}
                        </span>

                        {/* Name */}
                        <h3 style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: '18px', fontWeight: 500,
                          color: 'var(--text-primary)', lineHeight: 1.3, margin: 0
                        }}>{prod.name}</h3>

                        {/* Short description */}
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '520px',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>{prod.shortDescription}</p>

                        {/* Specs badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {prod.specifications?.hairGrade && (
                            <span style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '1px', letterSpacing: '0.05em' }}>
                              {prod.specifications.hairGrade.split('(')[0].trim()}
                            </span>
                          )}
                          {prod.specifications?.origin && (
                            <span style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '1px' }}>
                              {prod.specifications.origin}
                            </span>
                          )}
                          {prod.specifications?.longevity && (
                            <span style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '1px' }}>
                              {prod.specifications.longevity.split('|')[0].trim()}
                            </span>
                          )}
                        </div>

                        {/* Shade swatches */}
                        {prod.specifications?.availableColors?.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#8A847A', letterSpacing: '0.05em' }}>Shades:</span>
                            {prod.specifications.availableColors.slice(0, 5).map(col => (
                              <span
                                key={col.name}
                                title={col.name}
                                style={{
                                  width: '14px', height: '14px', borderRadius: '50%',
                                  backgroundColor: col.hex,
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  display: 'inline-block', flexShrink: 0
                                }}
                              />
                            ))}
                            {prod.specifications.availableColors.length > 5 && (
                              <span style={{ fontSize: '10px', color: '#8A847A' }}>+{prod.specifications.availableColors.length - 5}</span>
                            )}
                          </div>
                        )}

                        {/* Stars */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11} style={{ color: s <= Math.round(prod.rating || 5) ? '#C9A876' : '#3A3730', fill: s <= Math.round(prod.rating || 5) ? '#C9A876' : 'none' }} />
                          ))}
                          <span style={{ fontSize: '11px', color: '#8A847A', marginLeft: '4px' }}>({prod.reviewsCount || 0})</span>
                        </div>
                      </div>

                      {/* Price + CTA */}
                      <div style={{
                        padding: '20px 24px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'flex-end', justifyContent: 'center',
                        gap: '12px', borderLeft: '1px solid var(--border-subtle)',
                        minWidth: '160px', flexShrink: 0
                      }}>
                        <div style={{ textAlign: 'right' }}>
                          {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                            <div style={{ fontSize: '11px', color: '#8A847A', textDecoration: 'line-through', marginBottom: '2px' }}>
                              {format(prod.compareAtPrice)}
                            </div>
                          )}
                          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--gold-primary)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                            {format(prod.price)}
                          </div>
                          {prod.variants?.length > 1 && (
                            <div style={{ fontSize: '10px', color: '#8A847A', marginTop: '2px' }}>{prod.variants.length} variants</div>
                          )}
                        </div>
                        <div style={{
                          padding: '9px 18px',
                          backgroundColor: 'var(--gold-primary)',
                          color: '#0E0D0C',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          borderRadius: '2px',
                          whiteSpace: 'nowrap'
                        }}>View Details</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // ── GRID VIEW ──
              <div className="grid-products">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            backgroundColor: '#121110',
            height: '100%',
            overflowY: 'auto',
            padding: '24px',
            borderLeft: '1px solid #24221F',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} style={{ color: '#C9A876' }} />
                <h3 style={{ fontSize: '14px', color: '#F2EFEA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Filter ({activeCategory})
                </h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                style={{ color: '#A6A095', padding: '6px', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <FilterSidebar
              activeCategory={activeCategory}
              activeTexture={activeTexture}
              activeLength={activeLength}
              activeType={activeType}
              activeColor={activeColor}
              activeProductType={activeProductType}
              localMaxPrice={localMaxPrice}
              setLocalMaxPrice={setLocalMaxPrice}
              handlePriceApply={() => {
                handlePriceApply();
                setMobileFilterOpen(false);
              }}
              updateParam={(key, val) => {
                updateParam(key, val);
                setMobileFilterOpen(false);
              }}
              clearAllFilters={() => {
                clearAllFilters();
                setMobileFilterOpen(false);
              }}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
          .catalog-sidebar {
            display: none !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
        }
        @media (max-width: 640px) {
          .catalog-page-root {
            padding: 20px 0 60px !important;
          }
          .catalog-header {
            margin-bottom: 20px !important;
          }
          .catalog-category-pills {
            gap: 8px !important;
            margin-bottom: 20px !important;
            padding-bottom: 16px !important;
          }
          .catalog-category-pills button {
            padding: 8px 14px !important;
            font-size: 11px !important;
          }
          .catalog-toolbar {
            margin-bottom: 16px !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
