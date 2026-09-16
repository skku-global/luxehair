import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, RotateCcw, ChevronDown } from 'lucide-react';
import { BRAND, formatPrice } from '../config/brand';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Active filter state synced from URL query params
  const activeCategory = searchParams.get('category') || 'all';
  const activeTexture = searchParams.get('texture') || 'all';
  const activeSort = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('search') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam || '500000');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory && activeCategory !== 'all') params.category = activeCategory;
        if (activeTexture && activeTexture !== 'all') params.texture = activeTexture;
        if (activeSort) params.sort = activeSort;
        if (searchQuery) params.search = searchQuery;
        if (maxPriceParam) params.maxPrice = maxPriceParam;

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.products || []);
          setTotalCount(res.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [activeCategory, activeTexture, activeSort, searchQuery, maxPriceParam]);

  const updateParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (!val || val === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, val);
    }
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
    attachments: 'Couture Attachments & Extensions',
    'hair-care': 'Botanical Hair Care Formulations'
  };

  return (
    <div style={{ backgroundColor: '#0E0D0C', minHeight: '100vh', padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: '36px', textAlign: 'center' }}>
          <span className="section-tag">
            {activeCategory === 'all' ? 'Signature Catalog' : `Category / ${activeCategory}`}
          </span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 300,
            color: '#F2EFEA',
            marginBottom: '10px'
          }}>
            {categoryTitles[activeCategory] || 'Haute Coiffure'}
          </h1>
          <p style={{ color: '#A6A095', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
            Browse our hand-crafted selection of 100% single-donor raw hair, bespoke lace closures, and French botanical elixirs.
          </p>

          {searchQuery && (
            <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(201,168,118,0.1)', padding: '6px 14px', borderRadius: '2px', border: '1px solid rgba(201,168,118,0.2)' }}>
              <span style={{ fontSize: '12px', color: '#A6A095' }}>Searching for:</span>
              <strong style={{ fontSize: '13px', color: '#C9A876' }}>"{searchQuery}"</strong>
              <button onClick={() => updateParam('search', '')} style={{ color: '#E06C75', marginLeft: '6px', fontSize: '12px' }}>✕</button>
            </div>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '40px',
          borderBottom: '1px solid #1C1B19',
          paddingBottom: '24px'
        }}>
          {[
            { id: 'all', label: 'All Creations' },
            { id: 'wigs', label: 'Raw Wigs' },
            { id: 'attachments', label: 'Attachments' },
            { id: 'hair-care', label: 'Hair Care' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.id)}
              style={{
                backgroundColor: activeCategory === cat.id ? '#C9A876' : '#141312',
                color: activeCategory === cat.id ? '#0E0D0C' : '#C0BAB0',
                border: activeCategory === cat.id ? '1px solid #C9A876' : '1px solid #24221F',
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

        {/* Toolbar: Count, Mobile Toggle, Sort Dropdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ fontSize: '13px', color: '#A6A095' }}>
            Displaying <strong style={{ color: '#F2EFEA' }}>{products.length}</strong> of {totalCount} exquisite pieces
          </div>

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

            {/* Clear Filters Button if any filter is active */}
            {(activeCategory !== 'all' || activeTexture !== 'all' || searchQuery || maxPriceParam) && (
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
          {/* Desktop Filters Sidebar */}
          <aside style={{ backgroundColor: '#121110', border: '1px solid #24221F', padding: '24px', borderRadius: '4px', height: 'fit-content' }} className="catalog-sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #1C1B19' }}>
              <SlidersHorizontal size={16} style={{ color: '#C9A876' }} />
              <h3 style={{ fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F2EFEA' }}>Refine Selection</h3>
            </div>

            {/* Hair Texture Filter */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Hair Texture
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                {[
                  { id: 'all', label: 'All Textures' },
                  { id: 'Bone Straight', label: 'Bone Straight' },
                  { id: 'Deep Wave Curly', label: 'Deep Wave' },
                  { id: 'Body Wave', label: 'Body Wave' },
                  { id: 'Blunt Straight Bob', label: 'Blunt Cut Bob' },
                  { id: 'Natural Straight / Blowout', label: 'Natural Blowout' }
                ].map(tex => (
                  <label key={tex.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: activeTexture === tex.id ? '#F2EFEA' : '#A6A095', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="texture"
                      checked={activeTexture === tex.id}
                      onChange={() => updateParam('texture', tex.id)}
                      style={{ accentColor: '#C9A876' }}
                    />
                    <span>{tex.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Maximum Price
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="10000"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  style={{ accentColor: '#C9A876', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8A847A' }}>
                  <span>{formatPrice(20000)}</span>
                  <strong style={{ color: '#C9A876' }}>{formatPrice(localMaxPrice)}</strong>
                </div>
                <button
                  onClick={handlePriceApply}
                  className="btn-dark"
                  style={{ padding: '8px', fontSize: '11px', textTransform: 'uppercase', width: '100%', marginTop: '4px' }}
                >
                  Apply Price Filter
                </button>
              </div>
            </div>

            {/* Authenticity Guarantee Callout */}
            <div style={{ backgroundColor: '#161514', border: '1px solid #24221F', padding: '16px', borderRadius: '2px' }}>
              <div style={{ fontSize: '11px', color: '#C9A876', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Concierge Promise
              </div>
              <p style={{ fontSize: '12px', color: '#8A847A', lineHeight: 1.5 }}>
                Every unit is personally inspected in our Victoria Island salon before sealed dispatch.
              </p>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#C9A876' }}>
                ✦ Curating Selected Pieces...
              </div>
            ) : products.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: '#121110',
                border: '1px solid #24221F',
                borderRadius: '4px'
              }}>
                <p style={{ fontSize: '16px', color: '#F2EFEA', marginBottom: '8px' }}>No creations matched your criteria.</p>
                <p style={{ fontSize: '13px', color: '#8A847A', marginBottom: '24px' }}>
                  Try resetting your price filter or browsing all categories.
                </p>
                <button onClick={clearAllFilters} className="btn-gold">
                  Show All Products
                </button>
              </div>
            ) : (
              <div className="grid-products">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
          .catalog-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
