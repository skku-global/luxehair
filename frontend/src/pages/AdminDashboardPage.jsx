import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, ShoppingBag, Search, CheckCircle, Clock, Truck, ShieldAlert } from 'lucide-react';
import { BRAND, formatPrice } from '../config/brand';
import { api } from '../services/api';
import AdminProductModal from '../components/AdminProductModal';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.getProducts({ limit: 100 }),
        api.getAllOrders()
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (orderRes.success) setOrders(orderRes.orders || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently remove "${name}" from the boutique catalog?`)) {
      try {
        await api.deleteProduct(id);
        fetchData();
      } catch (err) {
        alert(err.message || 'Error deleting product');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, { orderStatus: newStatus });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPayStatus) => {
    try {
      await api.updateOrderStatus(orderId, { paymentStatus: newPayStatus });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  // Dual Currency KPI Calculations
  const totalNgnRevenue = orders
    .filter(o => o.paymentStatus === 'paid' && (o.currency === 'NGN' || !o.currency))
    .reduce((sum, o) => sum + (o.pricingBreakdown?.total || 0), 0);

  const totalUsdRevenue = orders
    .filter(o => o.paymentStatus === 'paid' && o.currency === 'USD')
    .reduce((sum, o) => sum + (o.pricingBreakdown?.total || 0), 0);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    orderStatusFilter === 'all' ? true : o.orderStatus === orderStatusFilter
  );

  return (
    <div style={{ backgroundColor: '#0E0D0C', color: '#F2EFEA', minHeight: '95vh', padding: '40px 0 100px' }}>
      <div className="container">
        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div>
            <span className="section-tag">Store Owner Concierge</span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '36px', fontWeight: 400 }}>
              {BRAND.name} Atelier Command Center
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setSelectedProduct(null); setModalOpen(true); }}
              className="btn-gold"
              style={{ padding: '12px 20px', fontSize: '13px' }}
            >
              <Plus size={16} />
              <span>Add New Luxury Unit</span>
            </button>
          </div>
        </div>

        {/* Analytics Overview Metrics (Dual Currency NGN / Paystack & USD / Stripe) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Card 1: NGN Settled Revenue */}
          <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', borderRadius: '4px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00C3EB' }}>
                <DollarSign size={18} />
                <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Naira Settled (Paystack)</span>
              </div>
              <span style={{ fontSize: '10px', backgroundColor: 'rgba(0, 195, 235, 0.15)', color: '#00C3EB', padding: '2px 6px', borderRadius: '2px' }}>🇳🇬 NGN</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#F2EFEA' }}>
              {formatPrice(totalNgnRevenue, 'NGN')}
            </div>
            <div style={{ fontSize: '11px', color: '#8A847A', marginTop: '4px' }}>Local cards, bank wire & POD</div>
          </div>

          {/* Card 2: USD Settled Revenue */}
          <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', borderRadius: '4px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8F85FF' }}>
                <DollarSign size={18} />
                <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>USD Settled (Stripe)</span>
              </div>
              <span style={{ fontSize: '10px', backgroundColor: 'rgba(99, 91, 255, 0.15)', color: '#8F85FF', padding: '2px 6px', borderRadius: '2px' }}>🌐 USD</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#F2EFEA' }}>
              {formatPrice(totalUsdRevenue, 'USD')}
            </div>
            <div style={{ fontSize: '11px', color: '#8A847A', marginTop: '4px' }}>International cards & Apple Pay</div>
          </div>

          {/* Card 3: Orders Count */}
          <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', borderRadius: '4px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#C9A876', marginBottom: '8px' }}>
              <ShoppingBag size={18} />
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>All-Time Orders</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#F2EFEA' }}>
              {orders.length} <span style={{ fontSize: '14px', color: '#A6A095', fontWeight: 400 }}>({pendingOrdersCount} pending)</span>
            </div>
            <div style={{ fontSize: '11px', color: '#8A847A', marginTop: '4px' }}>Across all regions</div>
          </div>

          {/* Card 4: Catalog Units */}
          <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', borderRadius: '4px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#C9A876', marginBottom: '8px' }}>
              <Package size={18} />
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Catalog Units</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#F2EFEA' }}>
              {products.length} Units Active
            </div>
            <div style={{ fontSize: '11px', color: '#8A847A', marginTop: '4px' }}>Virgin wigs, clip-ins & care</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          gap: '24px',
          borderBottom: '1px solid #1C1B19',
          marginBottom: '28px'
        }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              fontSize: '14px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === 'products' ? '#C9A876' : '#8A847A',
              fontWeight: activeTab === 'products' ? 600 : 400,
              borderBottom: activeTab === 'products' ? '2px solid #C9A876' : 'none',
              paddingBottom: '14px',
              marginBottom: '-1px',
              cursor: 'pointer'
            }}
          >
            Product Catalog Management ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              fontSize: '14px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === 'orders' ? '#C9A876' : '#8A847A',
              fontWeight: activeTab === 'orders' ? 600 : 400,
              borderBottom: activeTab === 'orders' ? '2px solid #C9A876' : 'none',
              paddingBottom: '14px',
              marginBottom: '-1px',
              cursor: 'pointer'
            }}
          >
            Customer Orders & Fulfillment ({orders.length})
          </button>
        </div>

        {/* TAB 1: PRODUCT INVENTORY TABLE */}
        {activeTab === 'products' && (
          <div>
            {/* Search Bar */}
            <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="input-luxury"
                style={{ padding: '10px 14px', fontSize: '13px' }}
              />
            </div>

            <div style={{
              backgroundColor: '#121110',
              border: '1px solid #24221F',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#181716', borderBottom: '1px solid #24221F', color: '#A6A095', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.08em' }}>
                    <th style={{ padding: '16px' }}>Item</th>
                    <th style={{ padding: '16px' }}>Category</th>
                    <th style={{ padding: '16px' }}>Base Price</th>
                    <th style={{ padding: '16px' }}>Stock</th>
                    <th style={{ padding: '16px' }}>Variants</th>
                    <th style={{ padding: '16px' }}>Flags</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #1C1B19' }}>
                      <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '42px', height: '52px', backgroundColor: '#161514', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={p.images?.[0] || '/images/products/placeholder-hair.jpg'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#F2EFEA' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#8A847A' }}>
                            {p.category === 'wigs'
                              ? `${p.specifications?.texture || 'Bone Straight'} • ${p.specifications?.laceType || 'HD Swiss Lace'}`
                              : p.category === 'attachments'
                              ? `${p.specifications?.attachmentType || 'Clip-In'} • ${p.specifications?.colorTone || p.variants?.[0]?.color || 'Natural Black #1B'}`
                              : `${p.specifications?.productType || 'Botanical Oil'} • ${p.specifications?.volume || '100ml'}`}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textTransform: 'capitalize', color: '#C0BAB0' }}>
                        {p.category}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#C9A876', fontWeight: 600 }}>
                        {formatPrice(p.price)}
                      </td>
                      <td style={{ padding: '14px 16px', color: p.inStock ? '#7EB685' : '#E06C75' }}>
                        {p.inStock ? `${p.stockQuantity} in stock` : 'Out of stock'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#A6A095' }}>
                        {p.variants?.length || 0} variants
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {p.isFeatured && <span className="badge-gold">Featured</span>}
                          {p.isBestseller && <span className="badge-dark">Bestseller</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => { setSelectedProduct(p); setModalOpen(true); }}
                            className="btn-dark"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            title="Edit Product"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            className="btn-dark"
                            style={{ padding: '6px 10px', fontSize: '11px', color: '#E06C75' }}
                            title="Delete Product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & FULFILLMENT */}
        {activeTab === 'orders' && (
          <div>
            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    textTransform: 'capitalize',
                    borderRadius: '2px',
                    backgroundColor: orderStatusFilter === st ? '#C9A876' : '#141312',
                    color: orderStatusFilter === st ? '#0E0D0C' : '#A6A095',
                    border: '1px solid #24221F',
                    cursor: 'pointer'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div style={{
              backgroundColor: '#121110',
              border: '1px solid #24221F',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#181716', borderBottom: '1px solid #24221F', color: '#A6A095', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.08em' }}>
                    <th style={{ padding: '16px' }}>Order Ref</th>
                    <th style={{ padding: '16px' }}>Client</th>
                    <th style={{ padding: '16px' }}>Items</th>
                    <th style={{ padding: '16px' }}>Payment</th>
                    <th style={{ padding: '16px' }}>Order Status</th>
                    <th style={{ padding: '16px' }}>Total</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Fulfillment Control</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr key={ord._id} style={{ borderBottom: '1px solid #1C1B19' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: '#C9A876' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span>{ord.orderNumber}</span>
                          {ord.currency === 'USD' || ord.paymentProcessor === 'stripe' ? (
                            <span style={{
                              backgroundColor: 'rgba(99, 91, 255, 0.15)',
                              color: '#8F85FF',
                              border: '1px solid rgba(99, 91, 255, 0.3)',
                              padding: '1px 6px',
                              fontSize: '10px',
                              borderRadius: '2px',
                              fontWeight: 600
                            }}>
                              USD • STRIPE
                            </span>
                          ) : ord.paymentMethod === 'paystack' ? (
                            <span style={{
                              backgroundColor: 'rgba(0, 195, 235, 0.15)',
                              color: '#00C3EB',
                              border: '1px solid rgba(0, 195, 235, 0.3)',
                              padding: '1px 6px',
                              fontSize: '10px',
                              borderRadius: '2px',
                              fontWeight: 600
                            }}>
                              NGN • PAYSTACK
                            </span>
                          ) : ord.paymentMethod === 'bankTransfer' ? (
                            <span style={{
                              backgroundColor: 'rgba(201, 168, 118, 0.15)',
                              color: '#C9A876',
                              border: '1px solid rgba(201, 168, 118, 0.3)',
                              padding: '1px 6px',
                              fontSize: '10px',
                              borderRadius: '2px',
                              fontWeight: 600
                            }}>
                              NGN • TRANSFER
                            </span>
                          ) : (
                            <span style={{
                              backgroundColor: 'rgba(166, 160, 149, 0.15)',
                              color: '#A6A095',
                              border: '1px solid rgba(166, 160, 149, 0.3)',
                              padding: '1px 6px',
                              fontSize: '10px',
                              borderRadius: '2px',
                              fontWeight: 600
                            }}>
                              NGN • POD
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6E6960', fontWeight: 400 }}>
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#F2EFEA', fontWeight: 500 }}>{ord.customerInfo?.name}</div>
                        <div style={{ fontSize: '11px', color: '#8A847A' }}>{ord.customerInfo?.phone}</div>
                        <div style={{ fontSize: '11px', color: '#6E6960' }}>{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</div>
                      </td>

                      <td style={{ padding: '16px', color: '#A6A095' }}>
                        {ord.items?.length || 0} items
                        <div style={{ fontSize: '11px', color: '#6E6960' }}>
                          {ord.items?.[0]?.name}
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <div style={{ textTransform: 'capitalize', color: '#F2EFEA', fontSize: '12px', fontWeight: 500 }}>
                          {ord.paymentMethod === 'stripe' || ord.paymentProcessor === 'stripe'
                            ? 'Stripe (USD Card)'
                            : ord.paymentMethod === 'paystack'
                            ? 'Paystack (NGN)'
                            : ord.paymentMethod === 'bankTransfer'
                            ? 'Bank Transfer'
                            : 'Pay on Delivery'}
                        </div>
                        <select
                          value={ord.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(ord._id, e.target.value)}
                          style={{
                            backgroundColor: '#161514',
                            border: '1px solid #2A2824',
                            color: ord.paymentStatus === 'paid' ? '#7EB685' : '#E3CEAB',
                            fontSize: '11px',
                            padding: '4px 6px',
                            marginTop: '4px',
                            borderRadius: '2px'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          style={{
                            backgroundColor: '#161514',
                            border: '1px solid #C9A876',
                            color: '#F2EFEA',
                            fontSize: '12px',
                            padding: '6px 10px',
                            borderRadius: '2px',
                            fontWeight: 500
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing (Atelier)</option>
                          <option value="shipped">Shipped (In Transit)</option>
                          <option value="delivered">Delivered (Fulfilled)</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td style={{ padding: '16px', color: '#C9A876', fontWeight: 600 }}>
                        <div>{formatPrice(ord.pricingBreakdown?.total, ord.currency || 'NGN')}</div>
                        {ord.currency === 'USD' && ord.pricingBreakdown?.baseTotalNgn > 0 && (
                          <div style={{ fontSize: '11px', color: '#6E6960', fontWeight: 400 }}>
                            (₦{ord.pricingBreakdown.baseTotalNgn.toLocaleString()})
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        {ord.orderStatus !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord._id, 'delivered')}
                            className="btn-dark"
                            style={{ fontSize: '11px', padding: '6px 12px', color: '#7EB685' }}
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        <AdminProductModal
          isOpen={modalOpen}
          product={selectedProduct}
          onClose={() => { setModalOpen(false); setSelectedProduct(null); }}
          onSaved={() => fetchData()}
        />
      </div>
    </div>
  );
}
