import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const WIG_TEXTURES = [
  'Bone Straight',
  'Deep Wave',
  'Body Wave',
  'Blunt Cut Bob',
  'Natural Blowout'
];

const ATTACHMENT_TYPES = [
  'Clip-In',
  'Weft',
  'Tape-In',
  'Nano-Tip',
  'Keratin',
  'Ponytail'
];

const ATTACHMENT_COLORS = [
  'Jet Black (#1)',
  'Natural Black (#1B)',
  'Dark Brown (#2)',
  'Chocolate Brown (#4)',
  'Chocolate Caramel (#8/27)',
  'Honey Balayage (#27)',
  'Icy Platinum (#613)'
];

const HAIR_CARE_TYPES = [
  'Oil',
  'Spray',
  'Serum'
];

export default function AdminProductModal({ product, isOpen, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'wigs',
    price: '',
    compareAtPrice: '',
    shortDescription: '',
    description: '',
    specifications: {
      hairType: '100% Raw Virgin Hair',
      origin: 'Vietnam',
      laceType: '13x6 HD Swiss Lace',
      hairGrade: '14A Double Drawn',
      capSize: 'Medium (22.5")',
      longevity: '3 - 5 Years',
      texture: 'Bone Straight',
      attachmentType: 'Clip-In',
      colorTone: 'Natural Black (#1B)',
      productType: 'Oil',
      volume: '100ml / 3.4 fl oz',
      keyIngredients: 'Organic Moroccan Argan Oil, Cold-Pressed Batana Oil, Marula Oil',
      applicationMethod: '13x6 HD Lace Frontal'
    },
    images: [''],
    variants: [],
    inStock: true,
    stockQuantity: 20,
    isFeatured: false,
    isBestseller: false,
    tags: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'wigs',
        price: product.price || '',
        compareAtPrice: product.compareAtPrice || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        specifications: {
          hairType: product.specifications?.hairType || '100% Raw Virgin Hair',
          origin: product.specifications?.origin || '',
          laceType: product.specifications?.laceType || '13x6 HD Swiss Lace',
          hairGrade: product.specifications?.hairGrade || '14A Double Drawn',
          capSize: product.specifications?.capSize || 'Medium (22.5")',
          longevity: product.specifications?.longevity || '3 - 5 Years',
          texture: product.specifications?.texture || 'Bone Straight',
          attachmentType: product.specifications?.attachmentType || (product.name?.toLowerCase().includes('clip') ? 'Clip-In' : product.name?.toLowerCase().includes('tape') ? 'Tape-In' : product.name?.toLowerCase().includes('ponytail') ? 'Ponytail' : 'Clip-In'),
          colorTone: product.specifications?.colorTone || 'Natural Black (#1B)',
          productType: product.specifications?.productType || (product.name?.toLowerCase().includes('oil') ? 'Oil' : product.name?.toLowerCase().includes('spray') ? 'Spray' : product.name?.toLowerCase().includes('serum') ? 'Serum' : 'Oil'),
          volume: product.specifications?.volume || '100ml / 3.4 fl oz',
          keyIngredients: product.specifications?.keyIngredients || '',
          applicationMethod: product.specifications?.applicationMethod || ''
        },
        images: product.images && product.images.length > 0 ? product.images : [''],
        variants: product.variants || [],
        inStock: product.inStock !== undefined ? product.inStock : true,
        stockQuantity: product.stockQuantity || 20,
        isFeatured: Boolean(product.isFeatured),
        isBestseller: Boolean(product.isBestseller),
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : ''
      });
    } else {
      // Default state for new Wig product
      setFormData({
        name: '',
        category: 'wigs',
        price: '',
        compareAtPrice: '',
        shortDescription: '',
        description: '',
        specifications: {
          hairType: '100% Raw Virgin Hair',
          origin: 'Vietnam Highlands',
          laceType: '13x6 HD Swiss Lace',
          hairGrade: '14A Double Drawn',
          capSize: 'Medium (22.5")',
          longevity: '3 - 5 Years',
          texture: 'Bone Straight',
          attachmentType: 'Clip-In',
          colorTone: 'Natural Black (#1B)',
          productType: 'Oil',
          volume: '100ml / 3.4 fl oz',
          keyIngredients: '',
          applicationMethod: '13x6 HD Swiss Frontal'
        },
        images: ['/images/products/placeholder-hair.jpg'],
        variants: [
          { name: '24" / 200% / Natural Black #1B', length: '24"', density: '200%', color: 'Natural Black #1B', texture: 'Bone Straight', price: 320000, stock: 10 }
        ],
        inStock: true,
        stockQuantity: 20,
        isFeatured: false,
        isBestseller: false,
        tags: 'bone straight, hd lace, raw hair'
      });
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCategory) => {
    setFormData(prev => {
      let updatedSpecs = { ...prev.specifications };
      let updatedVariants = prev.variants;
      let defaultTag = '';

      if (newCategory === 'wigs') {
        updatedSpecs.texture = updatedSpecs.texture || 'Bone Straight';
        updatedSpecs.laceType = updatedSpecs.laceType || '13x6 HD Swiss Lace';
        updatedSpecs.capSize = updatedSpecs.capSize || 'Medium (22.5")';
        defaultTag = `${updatedSpecs.texture.toLowerCase()}, hd lace, virgin wig`;
        if (prev.variants.length === 0 || prev.category !== 'wigs') {
          updatedVariants = [
            { name: '24" / 200% / Natural Black #1B', length: '24"', density: '200%', color: 'Natural Black #1B', texture: updatedSpecs.texture, price: Number(prev.price) || 320000, stock: 10 }
          ];
        }
      } else if (newCategory === 'attachments') {
        updatedSpecs.attachmentType = updatedSpecs.attachmentType || 'Clip-In';
        updatedSpecs.colorTone = updatedSpecs.colorTone || 'Natural Black (#1B)';
        updatedSpecs.applicationMethod = updatedSpecs.applicationMethod || 'Invisible Silicone Weft';
        defaultTag = `${updatedSpecs.attachmentType.toLowerCase()}, seamless extensions, natural black`;
        if (prev.variants.length === 0 || prev.category !== 'attachments') {
          updatedVariants = [
            { name: `${updatedSpecs.attachmentType} 22" / ${updatedSpecs.colorTone}`, length: '22"', density: '160g', color: updatedSpecs.colorTone, texture: 'Natural Straight', price: Number(prev.price) || 115000, stock: 12 }
          ];
        }
      } else if (newCategory === 'hair-care') {
        updatedSpecs.productType = updatedSpecs.productType || 'Oil';
        updatedSpecs.volume = updatedSpecs.volume || '100ml / 3.4 fl oz';
        updatedSpecs.keyIngredients = updatedSpecs.keyIngredients || 'Moroccan Argan Oil, Cold-Pressed Batana Oil, Marula Oil';
        defaultTag = `${updatedSpecs.productType.toLowerCase()}, botanical care, sulfate-free`;
        if (prev.variants.length === 0 || prev.category !== 'hair-care') {
          updatedVariants = [
            { name: '100ml Standard Bottle', length: '', density: '100ml', color: '', texture: '', price: Number(prev.price) || 25000, stock: 25 }
          ];
        }
      }

      return {
        ...prev,
        category: newCategory,
        specifications: updatedSpecs,
        variants: updatedVariants,
        tags: prev.tags ? prev.tags : defaultTag
      };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'category') {
      handleCategoryChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSpecChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  const handleImageChange = (index, val) => {
    const newImgs = [...formData.images];
    newImgs[index] = val;
    setFormData(prev => ({ ...prev, images: newImgs }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleVariantChange = (index, field, val) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: val };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    setFormData(prev => {
      let newVariant;
      if (prev.category === 'wigs') {
        const lengths = ['20"', '22"', '24"', '26"', '28"', '30"', '32"'];
        const existingCount = prev.variants.length;
        const len = lengths[Math.min(existingCount + 2, lengths.length - 1)];
        newVariant = {
          name: `${len} / 250% Density / Natural Black #1B`,
          length: len,
          density: '250%',
          color: 'Natural Black #1B',
          texture: prev.specifications.texture || 'Bone Straight',
          price: Number(prev.price) ? Number(prev.price) + 35000 : 350000,
          stock: 8
        };
      } else if (prev.category === 'attachments') {
        const type = prev.specifications.attachmentType || 'Clip-In';
        const color = prev.specifications.colorTone || 'Natural Black (#1B)';
        newVariant = {
          name: `${type} 24" / ${color}`,
          length: '24"',
          density: '200g',
          color: color,
          texture: 'Natural Straight',
          price: Number(prev.price) ? Number(prev.price) + 20000 : 135000,
          stock: 10
        };
      } else {
        newVariant = {
          name: '200ml Salon Luxury Size',
          length: '',
          density: '200ml',
          color: '',
          texture: '',
          price: Number(prev.price) ? Math.round(Number(prev.price) * 1.7) : 42000,
          stock: 15
        };
      }

      return {
        ...prev,
        variants: [...prev.variants, newVariant]
      };
    });
  };

  const removeVariant = (index) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Build auto-synced tags
      let existingTags = formData.tags ? formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
      
      if (formData.category === 'wigs' && formData.specifications.texture) {
        const tex = formData.specifications.texture.toLowerCase();
        if (!existingTags.includes(tex)) existingTags.push(tex);
      } else if (formData.category === 'attachments') {
        if (formData.specifications.attachmentType) {
          const at = formData.specifications.attachmentType.toLowerCase();
          if (!existingTags.includes(at)) existingTags.push(at);
        }
        if (formData.specifications.colorTone) {
          const col = formData.specifications.colorTone.toLowerCase();
          if (!existingTags.some(t => col.includes(t))) existingTags.push(col.split(' ')[0]);
        }
      } else if (formData.category === 'hair-care' && formData.specifications.productType) {
        const pt = formData.specifications.productType.toLowerCase();
        if (!existingTags.includes(pt)) existingTags.push(pt);
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : 0,
        stockQuantity: Number(formData.stockQuantity),
        tags: Array.from(new Set(existingTags)),
        images: formData.images.filter(Boolean),
        variants: formData.variants.map(v => ({
          ...v,
          price: Number(v.price),
          stock: Number(v.stock)
        }))
      };

      if (product?._id) {
        await api.updateProduct(product._id, payload);
      } else {
        await api.createProduct(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#121110',
        border: '1px solid #2A2824',
        borderRadius: '4px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1C1B19',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', color: '#F2EFEA', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{product ? 'Edit Luxury Product' : 'Add New Product to Atelier'}</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '2px',
                backgroundColor: formData.category === 'wigs' ? 'rgba(201, 168, 118, 0.15)' : formData.category === 'attachments' ? 'rgba(99, 91, 255, 0.15)' : 'rgba(126, 182, 133, 0.15)',
                color: formData.category === 'wigs' ? '#C9A876' : formData.category === 'attachments' ? '#8F85FF' : '#7EB685',
                border: '1px solid rgba(255,255,255,0.1)',
                textTransform: 'uppercase'
              }}>
                {formData.category}
              </span>
            </h3>
            <p style={{ fontSize: '12px', color: '#8A847A' }}>
              Category-specific technical specifications, photography, and variant inventory.
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#A6A095', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(224, 108, 117, 0.1)', border: '1px solid #E06C75', color: '#E06C75', padding: '12px', fontSize: '13px', borderRadius: '2px' }}>
              {error}
            </div>
          )}

          {/* Row 1: Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={
                  formData.category === 'wigs'
                    ? 'e.g., The Venetian Water Wave Frontal Wig'
                    : formData.category === 'attachments'
                    ? 'e.g., Seamless Raw Clip-In Extensions Set (7 Pcs)'
                    : 'e.g., Botanical Argan & Marula Radiant Hair Oil'
                }
                className="input-luxury"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#C9A876', fontWeight: 600, marginBottom: '6px' }}>
                Atelier Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-luxury"
                style={{ backgroundColor: '#181716', borderColor: '#C9A876', color: '#F2EFEA', fontWeight: 500 }}
              >
                <option value="wigs">1. Wigs (Texture, Length & Lace)</option>
                <option value="attachments">2. Attachments (Type, Color & Weft)</option>
                <option value="hair-care">3. Hair Care (Product Type & Volume)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Price, Compare Price, Base Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                Base Retail Price (₦) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder={formData.category === 'wigs' ? '320000' : formData.category === 'attachments' ? '95000' : '24500'}
                className="input-luxury"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                Compare At Price (₦)
              </label>
              <input
                type="number"
                name="compareAtPrice"
                min="0"
                value={formData.compareAtPrice}
                onChange={handleChange}
                placeholder={formData.category === 'wigs' ? '380000' : formData.category === 'attachments' ? '115000' : '30000'}
                className="input-luxury"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                Total Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                className="input-luxury"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
              Short Editorial Summary
            </label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder={
                formData.category === 'wigs'
                  ? 'High-definition Swiss lace with razor blunt cut and mirror sheen.'
                  : formData.category === 'attachments'
                  ? 'Ultra-flat silicone band clip-ins for instant length and seamless blending.'
                  : 'Cold-pressed botanical elixir that seals hair cuticles and shields from heat.'
              }
              className="input-luxury"
            />
          </div>

          {/* Full Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
              Full Product Description *
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed craftsmanship narrative, donor origin, cuticle alignment, styling temperatures..."
              className="input-luxury"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* CATEGORY SPECIFIC SPECIFICATIONS ACCORDION */}
          <div style={{ backgroundColor: '#161514', border: '1px solid #24221F', padding: '18px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '13px', color: '#C9A876', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} />
                {formData.category === 'wigs' && 'Wigs Atelier Specifications (Hair Texture & Lace)'}
                {formData.category === 'attachments' && 'Attachments Atelier Specifications (Type & Shade)'}
                {formData.category === 'hair-care' && 'Hair Care Atelier Specifications (Product Type & Formula)'}
              </h4>
              <span style={{ fontSize: '11px', color: '#8A847A' }}>
                Filtered directly by category filter sidebar
              </span>
            </div>

            {/* 1. WIGS CATEGORY FIELDS */}
            {formData.category === 'wigs' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#C9A876', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Hair Texture (Category Filter) *
                  </label>
                  <select
                    value={formData.specifications.texture}
                    onChange={(e) => handleSpecChange('texture', e.target.value)}
                    className="input-luxury"
                    style={{ backgroundColor: '#181716' }}
                  >
                    {WIG_TEXTURES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Lace Construction
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.laceType}
                    onChange={(e) => handleSpecChange('laceType', e.target.value)}
                    className="input-luxury"
                    placeholder="13x6 HD Swiss Invisible Lace"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Donor Origin / Grade
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.origin}
                    onChange={(e) => handleSpecChange('origin', e.target.value)}
                    className="input-luxury"
                    placeholder="Raw Vietnamese Mountain Hair"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Cap Construction & Fit
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.capSize}
                    onChange={(e) => handleSpecChange('capSize', e.target.value)}
                    className="input-luxury"
                    placeholder="Medium (22.5') Breathable Silk Dome"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Hair Grade
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.hairGrade}
                    onChange={(e) => handleSpecChange('hairGrade', e.target.value)}
                    className="input-luxury"
                    placeholder="14A Double Drawn (Full Ends)"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Expected Longevity
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.longevity}
                    onChange={(e) => handleSpecChange('longevity', e.target.value)}
                    className="input-luxury"
                    placeholder="3 - 5 Years with Proper Care"
                  />
                </div>
              </div>
            )}

            {/* 2. ATTACHMENTS CATEGORY FIELDS */}
            {formData.category === 'attachments' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#C9A876', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Attachment Type (Category Filter) *
                  </label>
                  <select
                    value={formData.specifications.attachmentType}
                    onChange={(e) => handleSpecChange('attachmentType', e.target.value)}
                    className="input-luxury"
                    style={{ backgroundColor: '#181716' }}
                  >
                    {ATTACHMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#C9A876', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Color Tone / Shade (Category Filter) *
                  </label>
                  <select
                    value={formData.specifications.colorTone}
                    onChange={(e) => handleSpecChange('colorTone', e.target.value)}
                    className="input-luxury"
                    style={{ backgroundColor: '#181716' }}
                  >
                    {ATTACHMENT_COLORS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Application / Weft Construction
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.applicationMethod}
                    onChange={(e) => handleSpecChange('applicationMethod', e.target.value)}
                    className="input-luxury"
                    placeholder="Seamless Silicone Weft / PU Skin-Weft / Velcro Wrap"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Pieces & Weight
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.capSize}
                    onChange={(e) => handleSpecChange('capSize', e.target.value)}
                    className="input-luxury"
                    placeholder="7 Multi-Clip Pieces (160 Grams Total)"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Hair Material
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.hairType}
                    onChange={(e) => handleSpecChange('hairType', e.target.value)}
                    className="input-luxury"
                    placeholder="100% Raw Virgin Human Hair"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Lifespan / Reusability
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.longevity}
                    onChange={(e) => handleSpecChange('longevity', e.target.value)}
                    className="input-luxury"
                    placeholder="18 - 24 Months (Reusable)"
                  />
                </div>
              </div>
            )}

            {/* 3. HAIR CARE CATEGORY FIELDS (No Hair Texture, No Length, No Lace) */}
            {formData.category === 'hair-care' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#C9A876', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Product Type (Category Filter) *
                  </label>
                  <select
                    value={formData.specifications.productType}
                    onChange={(e) => handleSpecChange('productType', e.target.value)}
                    className="input-luxury"
                    style={{ backgroundColor: '#181716' }}
                  >
                    {HAIR_CARE_TYPES.map(t => (
                      <option key={t} value={t}>{t} (Botanical {t})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#C9A876', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Bottle Volume / Net Weight *
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.volume}
                    onChange={(e) => handleSpecChange('volume', e.target.value)}
                    className="input-luxury"
                    placeholder="100ml / 3.4 fl oz"
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Key Botanical Ingredients & Actives
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.keyIngredients}
                    onChange={(e) => handleSpecChange('keyIngredients', e.target.value)}
                    className="input-luxury"
                    placeholder="Organic Cold-Pressed Moroccan Argan Oil, Batana Oil, Marula Oil, Vitamin E"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Formulation Standard
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.origin}
                    onChange={(e) => handleSpecChange('origin', e.target.value)}
                    className="input-luxury"
                    placeholder="Formulated in Grasse, France • Sulfate & Paraben Free"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>
                    Shelf Life & Protection
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.longevity}
                    onChange={(e) => handleSpecChange('longevity', e.target.value)}
                    className="input-luxury"
                    placeholder="24 Months after opening • Thermal Defense 450°F"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Images */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: '#A6A095' }}>Photography Image URLs</label>
              <button type="button" onClick={addImageField} style={{ color: '#C9A876', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Add Image
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={imgUrl}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    placeholder="/images/products/wig-bone-straight-1.jpg or https://..."
                    className="input-luxury"
                  />
                  {formData.images.length > 1 && (
                    <button type="button" onClick={() => removeImageField(idx)} style={{ color: '#6E6960', padding: '0 8px' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Category-Adapted Variants */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: '#A6A095' }}>
                {formData.category === 'wigs' && 'Length, Density & Shade Inventory'}
                {formData.category === 'attachments' && 'Type, Length & Shade Inventory'}
                {formData.category === 'hair-care' && 'Bottle Size & Volume Inventory'}
              </label>
              <button type="button" onClick={addVariant} style={{ color: '#C9A876', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Add Variant Preset
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.variants.map((v, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 30px', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder={
                      formData.category === 'wigs'
                        ? "Name e.g. 24' / 200% / #1B"
                        : formData.category === 'attachments'
                        ? "Name e.g. Clip-In 24' / #1B"
                        : "Name e.g. 100ml Standard"
                    }
                    value={v.name}
                    onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                    className="input-luxury"
                  />
                  <input
                    type="text"
                    placeholder={formData.category === 'hair-care' ? 'Size e.g. 100ml' : "Length e.g. 24'"}
                    value={formData.category === 'hair-care' ? (v.density || v.length) : v.length}
                    onChange={(e) => handleVariantChange(idx, formData.category === 'hair-care' ? 'density' : 'length', e.target.value)}
                    className="input-luxury"
                  />
                  <input
                    type="number"
                    placeholder="Price (₦)"
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                    className="input-luxury"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                    className="input-luxury"
                  />
                  <button type="button" onClick={() => removeVariant(idx)} style={{ color: '#6E6960' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
              Search & Filter Keywords (Auto-synced with active category specifications)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. bone straight, hd lace, 24 inches"
              className="input-luxury"
            />
          </div>

          {/* Checkboxes: Featured / Bestseller / In Stock */}
          <div style={{ display: 'flex', gap: '24px', paddingTop: '8px', borderTop: '1px solid #1C1B19' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
              <span>Feature on Home Page</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" name="isBestseller" checked={formData.isBestseller} onChange={handleChange} />
              <span>Mark as Bestseller</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleChange} />
              <span>In Stock for Sale</span>
            </label>
          </div>

          {/* Footer CTAs */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn-dark" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" disabled={saving}>
              {saving ? 'Saving...' : product ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
