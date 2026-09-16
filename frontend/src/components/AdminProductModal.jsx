import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';

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
      volume: '',
      keyIngredients: ''
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
          origin: product.specifications?.origin || 'Vietnam',
          laceType: product.specifications?.laceType || '13x6 HD Swiss Lace',
          hairGrade: product.specifications?.hairGrade || '14A Double Drawn',
          capSize: product.specifications?.capSize || 'Medium (22.5")',
          longevity: product.specifications?.longevity || '3 - 5 Years',
          texture: product.specifications?.texture || 'Bone Straight',
          volume: product.specifications?.volume || '',
          keyIngredients: product.specifications?.keyIngredients || ''
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
      setFormData({
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
          volume: '',
          keyIngredients: ''
        },
        images: ['/images/products/placeholder-hair.jpg'],
        variants: [
          { name: '24" / 200% / Natural Black', length: '24"', density: '200%', color: 'Natural Black', texture: 'Bone Straight', price: 320000, stock: 10 }
        ],
        inStock: true,
        stockQuantity: 20,
        isFeatured: false,
        isBestseller: false,
        tags: 'raw hair, hd lace'
      });
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: '28" / 250% / Natural Black', length: '28"', density: '250%', color: 'Natural Black', texture: 'Bone Straight', price: Number(prev.price) || 350000, stock: 8 }
      ]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : 0,
        stockQuantity: Number(formData.stockQuantity),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
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
            <h3 style={{ fontSize: '18px', color: '#F2EFEA' }}>
              {product ? 'Edit Luxury Product' : 'Add New Product to Atelier'}
            </h3>
            <p style={{ fontSize: '12px', color: '#8A847A' }}>
              Manage technical specifications, photography, and variant inventory.
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
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
                placeholder="e.g., The Venetian Water Wave Frontal Wig"
                className="input-luxury"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-luxury"
                style={{ backgroundColor: '#141312' }}
              >
                <option value="wigs">Raw & Virgin Wigs</option>
                <option value="attachments">Hair Attachments</option>
                <option value="hair-care">Hair Care & Formulations</option>
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
                placeholder="320000"
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
                placeholder="380000"
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
              placeholder="High-definition Swiss lace with razor blunt cut and mirror sheen."
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
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed craftsmanship narrative, donor origin, cuticle alignment, styling temperatures..."
              className="input-luxury"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Hair Specifications Accordion */}
          <div style={{ backgroundColor: '#161514', border: '1px solid #24221F', padding: '16px', borderRadius: '2px' }}>
            <h4 style={{ fontSize: '13px', color: '#C9A876', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Atelier Technical Specifications
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>Hair Type / Origin</label>
                <input
                  type="text"
                  value={formData.specifications.origin}
                  onChange={(e) => handleSpecChange('origin', e.target.value)}
                  className="input-luxury"
                  placeholder="Raw Vietnamese Highlands"
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>Lace Construction</label>
                <input
                  type="text"
                  value={formData.specifications.laceType}
                  onChange={(e) => handleSpecChange('laceType', e.target.value)}
                  className="input-luxury"
                  placeholder="13x6 HD Swiss Invisible Lace"
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>Hair Texture</label>
                <input
                  type="text"
                  value={formData.specifications.texture}
                  onChange={(e) => handleSpecChange('texture', e.target.value)}
                  className="input-luxury"
                  placeholder="Bone Straight / Deep Wave / Kinky Curly"
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#8A847A', display: 'block', marginBottom: '4px' }}>Grade & Longevity</label>
                <input
                  type="text"
                  value={formData.specifications.hairGrade}
                  onChange={(e) => handleSpecChange('hairGrade', e.target.value)}
                  className="input-luxury"
                  placeholder="14A Double Drawn (3 - 5 Years)"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: '#A6A095' }}>Photography Image URLs (Square or Portrait)</label>
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

          {/* Variants */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: '#A6A095' }}>Length / Density / Shade Variants</label>
              <button type="button" onClick={addVariant} style={{ color: '#C9A876', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Add Variant
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.variants.map((v, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 30px', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Name e.g. 24' / 200% / #1B"
                    value={v.name}
                    onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                    className="input-luxury"
                  />
                  <input
                    type="text"
                    placeholder="Length e.g. 24'"
                    value={v.length}
                    onChange={(e) => handleVariantChange(idx, 'length', e.target.value)}
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
