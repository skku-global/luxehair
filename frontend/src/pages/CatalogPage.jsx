import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, RotateCcw, ChevronDown, X } from 'lucide-react';
import { BRAND, formatPrice } from '../config/brand';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

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
    attachments: 'Couture Attachments & Extensions',
    'hair-care': 'Botanical Hair Care Formulations'
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', minHeight: '100vh', padding: '40px 0 80px', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <div className="container">
        {/* Header Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
        <div style={{
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
            { id: 'attachments', label: 'Attachments' },
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

        {/* Toolbar: Count, Mobile Toggle, Sort Dropdown */}
        <div style={{
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
      `}</style>
    </div>
  );
}
