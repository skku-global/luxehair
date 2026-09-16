import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Truck, Sparkles, ChevronRight, Check, RefreshCw } from 'lucide-react';
import { BRAND } from '../config/brand';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { format, isUsd } = useCurrency();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [addedNotification, setAddedNotification] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getProductByIdOrSlug(id);
        if (res.success && res.product) {
          setProduct(res.product);
          setRelated(res.related || []);
          setActiveImageIndex(0);
          if (res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          } else {
            setSelectedVariant(null);
          }
        } else {
          setError('Product not found in our boutique.');
        }
      } catch (err) {
        setError(err.message || 'Error loading product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A876' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>✦</div>
          <div style={{ letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '12px' }}>
            Unveiling Haute Creation...
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', color: '#F2EFEA', marginBottom: '12px' }}>Product Unavailable</h2>
        <p style={{ color: '#8A847A', marginBottom: '24px' }}>{error}</p>
        <Link to="/shop" className="btn-gold">Return to Collection</Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentImages = product.images && product.images.length > 0 ? product.images : ['/images/products/placeholder-hair.jpg'];

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    navigate('/checkout');
  };

  return (
    <div style={{ backgroundColor: '#0E0D0C', color: '#F2EFEA', minHeight: '100vh', padding: '30px 0 90px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#8A847A',
          marginBottom: '32px'
        }}>
          <Link to="/" style={{ color: '#8A847A' }}>Atelier</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?category=${product.category}`} style={{ color: '#8A847A', textTransform: 'capitalize' }}>
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: '#C9A876' }}>{product.name}</span>
        </div>

        {/* Main Product Display: Gallery (Left) & Configurator (Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 1fr)',
          gap: '50px',
          marginBottom: '80px'
        }} className="pdp-layout">
          {/* Gallery Component */}
          <div>
            {/* Primary Featured Image Viewport */}
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: '120%', // 4:5 editorial portrait
              backgroundColor: '#161514',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid #24221F',
              marginBottom: '16px'
            }}>
              <img
                src={currentImages[activeImageIndex] || currentImages[0]}
                alt={product.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'opacity 0.3s ease'
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80';
                }}
              />

              {product.isBestseller && (
                <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  <span className="badge-gold">Bestseller</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {currentImages.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '75px',
                      height: '90px',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2px solid #C9A876' : '1px solid #24221F',
                      padding: 0,
                      backgroundColor: '#161514',
                      flexShrink: 0,
                      opacity: activeImageIndex === idx ? 1 : 0.6,
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} angle ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Configurator & Purchase Controls */}
          <div>
            {/* Category tag & Star Rating */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#C9A876', textTransform: 'uppercase', fontWeight: 600 }}>
                {product.category} Collection
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#A6A095' }}>
                <div style={{ display: 'flex', color: '#C9A876' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#C9A876" stroke="#C9A876" />
                  ))}
                </div>
                <span>{product.rating} ({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(28px, 3vw, 38px)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: '#F2EFEA',
              marginBottom: '16px'
            }}>
              {product.name}
            </h1>

            {/* Price Display */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '14px',
              paddingBottom: '20px',
              borderBottom: '1px solid #1C1B19',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '28px', fontWeight: 600, color: '#C9A876' }}>
                {format(currentPrice)}
              </span>
              {product.compareAtPrice > currentPrice && (
                <span style={{ fontSize: '18px', color: '#6E6960', textDecoration: 'line-through' }}>
                  {format(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Editorial Summary */}
            <p style={{ fontSize: '14px', color: '#C0BAB0', lineHeight: 1.7, marginBottom: '28px' }}>
              {product.shortDescription || product.description}
            </p>

            {/* Variant Selector (e.g. Length & Density) */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A6A095' }}>
                    {product.category === 'hair-care'
                      ? 'Select Volume / Bottle Size:'
                      : product.category === 'attachments'
                      ? 'Select Type & Shade:'
                      : 'Select Length & Density:'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#C9A876', fontWeight: 600 }}>
                    {selectedVariant ? selectedVariant.name : 'Choose variant'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?._id === v._id || selectedVariant?.name === v.name;
                    return (
                      <button
                        key={v._id || v.name}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          backgroundColor: isSelected ? 'rgba(201, 168, 118, 0.12)' : '#141312',
                          border: isSelected ? '1px solid #C9A876' : '1px solid #24221F',
                          borderRadius: '2px',
                          color: isSelected ? '#F2EFEA' : '#A6A095',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: isSelected ? '4px solid #C9A876' : '1px solid #4A463F',
                            backgroundColor: '#0E0D0C'
                          }} />
                          <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 400 }}>
                            {v.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#C9A876' : '#C0BAB0' }}>
                          {format(v.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Stock Status */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#7EB685', marginBottom: '12px' }}>
                <Check size={14} />
                <span>In Stock at Victoria Island Atelier — Ready for immediate dispatch</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: '#A6A095', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Quantity:
                </span>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #2A2824',
                  backgroundColor: '#141312',
                  borderRadius: '2px'
                }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '8px 14px', color: '#A6A095', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 600 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '8px 14px', color: '#A6A095', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <button
                onClick={handleAddToCart}
                className="btn-gold"
                style={{ width: '100%', padding: '16px' }}
              >
                <ShoppingBag size={16} />
                <span>Add to Shopping Bag • {format(currentPrice * quantity)}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="btn-dark"
                style={{ width: '100%', padding: '15px' }}
              >
                Instant Card Checkout with {isUsd ? 'International Cards (Stripe)' : 'Nigerian Cards (Paystack)'}
              </button>
            </div>

            {/* Added Toast Alert */}
            {addedNotification && (
              <div style={{
                backgroundColor: 'rgba(201, 168, 118, 0.15)',
                border: '1px solid #C9A876',
                color: '#E3CEAB',
                padding: '12px 16px',
                borderRadius: '2px',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Sparkles size={16} style={{ color: '#C9A876' }} />
                <span>Item successfully placed in your luxury shopping bag.</span>
              </div>
            )}

            {/* Trust Points */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '18px',
              backgroundColor: '#141312',
              border: '1px solid #1C1B19',
              borderRadius: '2px',
              fontSize: '12px',
              color: '#8A847A'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: '#C9A876' }} />
                <span>100% Raw Virgin Donor Certificate</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} style={{ color: '#C9A876' }} />
                <span>Lagos 24-Hour Express Courier</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: '#C9A876' }} />
                <span>Micro-Bleached Knots Included</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} style={{ color: '#C9A876' }} />
                <span>Pay on Delivery Eligible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Technical Specifications & Care Section */}
        <div style={{
          backgroundColor: '#121110',
          border: '1px solid #24221F',
          borderRadius: '4px',
          padding: '36px',
          marginBottom: '80px'
        }}>
          {/* Tab buttons */}
          <div style={{
            display: 'flex',
            gap: '24px',
            borderBottom: '1px solid #1C1B19',
            paddingBottom: '16px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setActiveTab('specs')}
              style={{
                fontSize: '13px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: activeTab === 'specs' ? '#C9A876' : '#8A847A',
                fontWeight: activeTab === 'specs' ? 600 : 400,
                borderBottom: activeTab === 'specs' ? '2px solid #C9A876' : 'none',
                paddingBottom: '16px',
                marginBottom: '-17px',
                cursor: 'pointer'
              }}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('care')}
              style={{
                fontSize: '13px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: activeTab === 'care' ? '#C9A876' : '#8A847A',
                fontWeight: activeTab === 'care' ? 600 : 400,
                borderBottom: activeTab === 'care' ? '2px solid #C9A876' : 'none',
                paddingBottom: '16px',
                marginBottom: '-17px',
                cursor: 'pointer'
              }}
            >
              Atelier Care & Longevity
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              style={{
                fontSize: '13px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: activeTab === 'shipping' ? '#C9A876' : '#8A847A',
                fontWeight: activeTab === 'shipping' ? 600 : 400,
                borderBottom: activeTab === 'shipping' ? '2px solid #C9A876' : 'none',
                paddingBottom: '16px',
                marginBottom: '-17px',
                cursor: 'pointer'
              }}
            >
              White-Glove Delivery
            </button>
          </div>

          {/* Tab 1: Specs */}
          {activeTab === 'specs' && (
            <div>
              {product.category === 'wigs' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Hair Texture</div>
                    <div style={{ fontSize: '14px', color: '#C9A876', fontWeight: 600 }}>{product.specifications?.texture || 'Bone Straight'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Lace Construction</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>{product.specifications?.laceType || '13x6 HD Swiss Invisible Lace'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Donor Origin</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>{product.specifications?.origin || 'Raw Southeast Asian'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Hair Grade</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>{product.specifications?.hairGrade || '14A Double Drawn (Full Ends)'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Cap Fit</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>{product.specifications?.capSize || '22.5" Adjustable Grip'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Expected Lifespan</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>{product.specifications?.longevity || '3 - 5 Years'}</div>
                  </div>
                </div>
              )}

              {product.category === 'attachments' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Attachment Type</div>
                    <div style={{ fontSize: '14px', color: '#C9A876', fontWeight: 600 }}>
                      {product.specifications?.attachmentType || (product.name?.toLowerCase().includes('clip') ? 'Clip-In' : product.name?.toLowerCase().includes('tape') ? 'Tape-In' : 'Ponytail')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Color Tone / Shade</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                      {product.specifications?.colorTone || selectedVariant?.color || 'Natural Black (#1B)'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Application Method</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                      {product.specifications?.applicationMethod || product.specifications?.laceType || 'Seamless Silicone Ultra-Flat Weft'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Hair Material</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                      {product.specifications?.hairType || '100% Raw Virgin Human Hair'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Set Pieces & Weight</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                      {product.specifications?.capSize || product.specifications?.hairGrade || '160 Grams Total'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Reusable Lifespan</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                      {product.specifications?.longevity || '18 - 24 Months'}
                    </div>
                  </div>
                </div>
              )}

              {product.category === 'hair-care' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Product Type</div>
                    <div style={{ fontSize: '14px', color: '#C9A876', fontWeight: 600 }}>
                      {product.specifications?.productType || (product.name?.toLowerCase().includes('oil') ? 'Botanical Hair Oil' : product.name?.toLowerCase().includes('spray') ? 'Hydration & Defense Spray' : 'Repair & Scalp Serum')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Net Bottle Volume</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                      {product.specifications?.volume || selectedVariant?.density || '100ml / 3.4 fl. oz'}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Key Botanical Actives</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                      {product.specifications?.keyIngredients || 'Certified Organic Moroccan Argan Oil, Cold-Pressed Batana, Marula Oil, Camellia Seed Oil, Vitamin E'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Formulation Standard</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                      {product.specifications?.origin || 'Formulated in France • 100% Sulfate & Paraben Free'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', marginBottom: '4px' }}>Thermal & UV Shield</div>
                    <div style={{ fontSize: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                      {product.specifications?.longevity || 'Protects up to 450°F • Shelf life 24 Months'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Care Guide */}
          {activeTab === 'care' && (
            <div style={{ fontSize: '14px', color: '#C0BAB0', lineHeight: 1.8, maxWidth: '800px' }}>
              {product.category === 'hair-care' ? (
                <div>
                  <p style={{ marginBottom: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                    Atelier Botanical Ritual & Application Directions:
                  </p>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>Daily Radiance & Seal:</strong> Dispense 2-3 drops into clean palms, warm between hands, and glide evenly from mid-shaft to hair ends.</li>
                    <li><strong>Thermal Armor:</strong> Apply sparingly to damp or blow-dried hair before heat styling up to 450°F to prevent moisture evaporation and split ends.</li>
                    <li><strong>Overnight Restoration:</strong> Massage a generous dropperful directly into biological scalp or unit base before sleep; wash out thoroughly in the morning.</li>
                    <li><strong>Safe for Units & Extensions:</strong> Formulated with zero mineral oil, zero parabens, and lightweight dry-oil carrier agents that leave zero greasy residue on lace.</li>
                  </ul>
                </div>
              ) : product.category === 'attachments' ? (
                <div>
                  <p style={{ marginBottom: '14px', color: '#F2EFEA', fontWeight: 500 }}>
                    Extension Atelier Care & Longevity Ritual:
                  </p>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>Brushing:</strong> Always detangle prior to washing using an extension loop brush, starting gently at the ends and working upwards.</li>
                    <li><strong>Cleansing:</strong> Submerge pieces gently in lukewarm water with sulfate-free hydrating shampoo. Never rub or bunch wefts together.</li>
                    <li><strong>Tape-In Maintenance:</strong> Re-tape every 6 to 8 weeks using medical-grade adhesive tabs after removing old residue with alcohol solvent.</li>
                    <li><strong>Storage:</strong> Store dry pieces inside the {BRAND.name} breathable satin pouch to prevent environmental dust and friction.</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p style={{ marginBottom: '14px' }}>
                    Because this unit consists of 100% living cuticle hair with zero synthetic filler, it responds exquisitely to high-end salon products:
                  </p>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>Wash bi-weekly with sulfate-free hydrating shampoo and lukewarm water.</li>
                    <li>Apply our signature Moroccan Argan & Marula Elixir from mid-shaft to ends before blow-drying.</li>
                    <li>Safe for thermal flat-ironing and curling up to 450°F. Always use heat defense protection.</li>
                    <li>Store on a satin wig stand or inside the signature breathable {BRAND.name} dust pouch when not in rotation.</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Shipping */}
          {activeTab === 'shipping' && (
            <div style={{ fontSize: '14px', color: '#C0BAB0', lineHeight: 1.8, maxWidth: '800px' }}>
              <p style={{ marginBottom: '14px' }}>
                Every order is packaged inside our embossed matte black rigid gift box, accompanied by a luxury silk dust bag, satin edge wrap, and verification seal.
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Lagos Metropolis:</strong> 24-48 Hours Express Courier (₦3,500). Free on orders over ₦250,000.</li>
                <li><strong>Abuja & Port Harcourt:</strong> 48-72 Hours via DHL Express (₦7,500).</li>
                <li><strong>Pay on Delivery:</strong> Available for Lagos & Abuja orders. Card or cash accepted upon courier arrival.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Related Products Showcase */}
        {related.length > 0 && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <span className="section-tag">Curated Pairings</span>
              <h2 className="section-title">Complete The Aesthetic</h2>
            </div>
            <div className="grid-products">
              {related.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 880px) {
          .pdp-layout {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
