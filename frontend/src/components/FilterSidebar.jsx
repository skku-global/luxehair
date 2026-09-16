import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

/**
 * FilterSidebar Component
 * Dynamically renders category-specific filters:
 * - Wigs: Hair Texture + Length + Price
 * - Attachments: Type (Clip-In, Tape-In, Ponytail) + Color + Price
 * - Hair Care: Product Type (Oil, Spray, Serum) + Price only
 */
export default function FilterSidebar({
  activeCategory,
  activeTexture,
  activeLength,
  activeType,
  activeColor,
  activeProductType,
  localMaxPrice,
  setLocalMaxPrice,
  handlePriceApply,
  updateParam,
  clearAllFilters,
  hasActiveFilters
}) {
  const { format, currency } = useCurrency();

  // Price slider max thresholds depending on currency
  const isUsd = currency === 'USD';
  const minPriceLimit = isUsd ? 15 : 20000;
  const maxPriceLimit = isUsd ? 400 : 500000;
  const priceStep = isUsd ? 10 : 10000;

  return (
    <aside
      style={{
        backgroundColor: '#121110',
        border: '1px solid #24221F',
        padding: '24px',
        borderRadius: '4px',
        height: 'fit-content'
      }}
      className="catalog-sidebar"
    >
      {/* Sidebar Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid #1C1B19'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={16} style={{ color: '#C9A876' }} />
          <h3 style={{ fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F2EFEA', fontWeight: 600 }}>
            Refine Selection
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#C9A876',
              fontSize: '11px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            title="Reset active category filters"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Context Badge */}
      <div style={{
        marginBottom: '24px',
        padding: '8px 12px',
        backgroundColor: '#181716',
        borderRadius: '2px',
        border: '1px solid #24221F',
        fontSize: '11px',
        color: '#A6A095',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Active Category:</span>
        <strong style={{ color: '#C9A876', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {activeCategory === 'wigs' ? 'Raw Wigs' : activeCategory === 'attachments' ? 'Attachments' : activeCategory === 'hair-care' ? 'Hair Care' : 'All Categories'}
        </strong>
      </div>

      {/* ========================================================================= */}
      {/* 1. WIGS CATEGORY: Hair Texture + Length + Price */}
      {/* ========================================================================= */}
      {(activeCategory === 'wigs' || activeCategory === 'all') && (
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
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
              <label
                key={tex.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: activeTexture === tex.id ? '#F2EFEA' : '#A6A095',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '2px',
                  backgroundColor: activeTexture === tex.id ? 'rgba(201, 168, 118, 0.08)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="radio"
                  name="texture"
                  checked={activeTexture === tex.id}
                  onChange={() => updateParam('texture', tex.id)}
                  style={{ accentColor: '#C9A876' }}
                />
                <span style={{ fontWeight: activeTexture === tex.id ? 600 : 400 }}>{tex.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Length Filter (for Wigs only) */}
      {activeCategory === 'wigs' && (
        <div style={{ marginBottom: '28px', borderTop: '1px solid #1C1B19', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
            Hair Length
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: '12', label: '12"' },
              { id: '14', label: '14"' },
              { id: '20', label: '20"' },
              { id: '22', label: '22"' },
              { id: '24', label: '24"' },
              { id: '26', label: '26"' },
              { id: '28', label: '28"' },
              { id: '30', label: '30"' },
              { id: '32', label: '32"' }
            ].map(len => (
              <button
                key={len.id}
                type="button"
                onClick={() => updateParam('length', len.id)}
                style={{
                  padding: '7px 0',
                  textAlign: 'center',
                  fontSize: '12px',
                  borderRadius: '2px',
                  border: activeLength === len.id ? '1px solid #C9A876' : '1px solid #24221F',
                  backgroundColor: activeLength === len.id ? '#C9A876' : '#141312',
                  color: activeLength === len.id ? '#0E0D0C' : '#A6A095',
                  fontWeight: activeLength === len.id ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {len.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ATTACHMENTS CATEGORY: Type (Clip-In, Tape-In, Ponytail) + Color + Price */}
      {/* ========================================================================= */}
      {activeCategory === 'attachments' && (
        <>
          {/* Attachment Type Filter */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
              Attachment Type
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              {[
                { id: 'all', label: 'All Types' },
                { id: 'Clip-In', label: 'Clip-In Sets' },
                { id: 'Tape-In', label: 'Invisible Tape-Ins' },
                { id: 'Ponytail', label: 'Wrap-Around Ponytails' }
              ].map(itemType => (
                <label
                  key={itemType.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: activeType === itemType.id ? '#F2EFEA' : '#A6A095',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '2px',
                    backgroundColor: activeType === itemType.id ? 'rgba(201, 168, 118, 0.08)' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="attachmentType"
                    checked={activeType === itemType.id}
                    onChange={() => updateParam('type', itemType.id)}
                    style={{ accentColor: '#C9A876' }}
                  />
                  <span style={{ fontWeight: activeType === itemType.id ? 600 : 400 }}>{itemType.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div style={{ marginBottom: '28px', borderTop: '1px solid #1C1B19', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
              Color Tone
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              {[
                { id: 'all', label: 'All Shades' },
                { id: 'Natural Black', label: 'Natural Black #1B' },
                { id: 'Jet Black', label: 'Jet Black #1' },
                { id: 'Balayage', label: 'Honey Blonde / Balayage #27' },
                { id: 'Brown', label: 'Chocolate Brown #4' }
              ].map(col => (
                <label
                  key={col.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: activeColor === col.id ? '#F2EFEA' : '#A6A095',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '2px',
                    backgroundColor: activeColor === col.id ? 'rgba(201, 168, 118, 0.08)' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="attachmentColor"
                    checked={activeColor === col.id}
                    onChange={() => updateParam('color', col.id)}
                    style={{ accentColor: '#C9A876' }}
                  />
                  <span style={{ fontWeight: activeColor === col.id ? 600 : 400 }}>{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. HAIR CARE CATEGORY: Product Type (Oil, Spray, Serum) + Price only */}
      {/* ========================================================================= */}
      {activeCategory === 'hair-care' && (
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
            Product Type
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            {[
              { id: 'all', label: 'All Formulations' },
              { id: 'Oil', label: 'Botanical Hair Oils' },
              { id: 'Spray', label: 'Lace Hold & Melting Sprays' },
              { id: 'Serum', label: 'Anti-Frizz Gloss Serums' }
            ].map(prod => (
              <label
                key={prod.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: activeProductType === prod.id ? '#F2EFEA' : '#A6A095',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '2px',
                  backgroundColor: activeProductType === prod.id ? 'rgba(201, 168, 118, 0.08)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="radio"
                  name="hairCareType"
                  checked={activeProductType === prod.id}
                  onChange={() => updateParam('productType', prod.id)}
                  style={{ accentColor: '#C9A876' }}
                />
                <span style={{ fontWeight: activeProductType === prod.id ? 600 : 400 }}>{prod.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PRICE RANGE FILTER (Available across all categories) */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '24px', borderTop: '1px solid #1C1B19', paddingTop: '20px' }}>
        <h4 style={{ fontSize: '12px', color: '#C9A876', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
          Maximum Price ({currency})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="range"
            min={minPriceLimit}
            max={maxPriceLimit}
            step={priceStep}
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            style={{ accentColor: '#C9A876', cursor: 'pointer', width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8A847A' }}>
            <span>{isUsd ? `$${minPriceLimit}` : `₦${minPriceLimit.toLocaleString()}`}</span>
            <strong style={{ color: '#C9A876' }}>
              {isUsd ? `$${Number(localMaxPrice).toLocaleString()}` : `₦${Number(localMaxPrice).toLocaleString()}`}
            </strong>
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

      {/* Atelier Authenticity Promise */}
      <div style={{ backgroundColor: '#161514', border: '1px solid #24221F', padding: '16px', borderRadius: '2px' }}>
        <div style={{ fontSize: '11px', color: '#C9A876', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
          Concierge Promise
        </div>
        <p style={{ fontSize: '12px', color: '#8A847A', lineHeight: 1.5 }}>
          Every unit is personally inspected in our Victoria Island salon before sealed dispatch.
        </p>
      </div>
    </aside>
  );
}
