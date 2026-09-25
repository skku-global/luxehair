import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, ShoppingBag, Search, CheckCircle, Clock, Truck, ShieldAlert, Users, Crown, Mail, Phone, MapPin, Eye, X, Award } from 'lucide-react';
import { BRAND, formatPrice } from '../config/brand';
import { api } from '../services/api';
import AdminProductModal from '../components/AdminProductModal';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'customers'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTierFilter, setCustomerTierFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Non-blocking status banner; replaces the browser alert() dialogs
  const [toast, setToast] = useState(null); // { type: 'error' | 'success', message: string }

  const notify = (type, message) => setToast({ type, message });

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, custRes] = await Promise.all([
        api.getProducts({ limit: 100 }),
        api.getAllOrders(),
        api.getAdminCustomers().catch(() => ({ success: false, customers: [] }))
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (orderRes.success) setOrders(orderRes.orders || []);
      if (custRes.success) setCustomers(custRes.customers || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      notify('error', err.message || 'Could not load dashboard data.');
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
        notify('success', `"${name}" was removed from the catalog.`);
        fetchData();
      } catch (err) {
        notify('error', err.message || 'Could not delete that product.');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, { orderStatus: newStatus });
      notify('success', `Order status updated to "${newStatus}".`);
      fetchData();
    } catch (err) {
      notify('error', err.message || 'Could not update the order status.');
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPayStatus) => {
    try {
      await api.updateOrderStatus(orderId, { paymentStatus: newPayStatus });
      notify('success', `Payment status updated to "${newPayStatus}".`);
      fetchData();
    } catch (err) {
      notify('error', err.message || 'Could not update the payment status.');
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

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = !customerSearch ||
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch));
    const matchesTier = customerTierFilter === 'all' ||
      c.vipTier.toLowerCase().includes(customerTierFilter.toLowerCase());
    return matchesSearch && matchesTier;
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', minHeight: '95vh', padding: '40px 0 100px' }}>
      <div className="container">
        {/* Inline status banner - replaces blocking alert() dialogs */}
        {toast && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '24px',
              padding: '13px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              backgroundColor: toast.type === 'error' ? 'rgba(220, 105, 95, 0.08)' : 'rgba(201, 168, 118, 0.08)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(220, 105, 95, 0.35)' : 'var(--border-gold)'}`,
              color: toast.type === 'error' ? '#E8938B' : 'var(--gold-primary)'
            }}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              style={{ color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'none', border: 'none' }}
            >
              <X size={15} />
            </button>
          </div>
        )}

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

          {/* Card 5: Clientèle & VIPs */}
          <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', borderRadius: '4px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D4AF37', marginBottom: '8px' }}>
              <Crown size={18} />
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Clientèle & VIPs</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#F2EFEA' }}>
              {customers.length} Clients
            </div>
            <div style={{ fontSize: '11px', color: '#C9A876', marginTop: '4px' }}>
              {customers.filter(c => c.vipTier !== 'Bronze VIP').length} VIP Club Members
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          gap: '24px',
          borderBottom: '1px solid #1C1B19',
          marginBottom: '28px',
          overflowX: 'auto'
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
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Product Catalog ({products.length})
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
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            style={{
              fontSize: '14px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === 'customers' ? '#C9A876' : '#8A847A',
              fontWeight: activeTab === 'customers' ? 600 : 400,
              borderBottom: activeTab === 'customers' ? '2px solid #C9A876' : 'none',
              paddingBottom: '14px',
              marginBottom: '-1px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Users size={16} />
            <span>Clientèle & VIPs ({customers.length})</span>
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

        {/* TAB 3: CLIENTÈLE & CUSTOMERS TABLE */}
        {activeTab === 'customers' && (
          <div>
            {/* Search & Tier Filters */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ position: 'relative', width: '360px', maxWidth: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8A847A' }} />
                <input
                  type="text"
                  placeholder="Search clients by name, email, or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="input-luxury"
                  style={{ paddingLeft: '40px', fontSize: '13px', width: '100%' }}
                />
              </div>

              {/* VIP Tier Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'Diamond', 'Gold', 'Silver', 'Bronze'].map(tier => (
                  <button
                    key={tier}
                    onClick={() => setCustomerTierFilter(tier.toLowerCase())}
                    style={{
                      fontSize: '11px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: customerTierFilter === tier.toLowerCase() ? '1px solid #C9A876' : '1px solid #2B2926',
                      backgroundColor: customerTierFilter === tier.toLowerCase() ? 'rgba(201, 168, 118, 0.15)' : '#161514',
                      color: customerTierFilter === tier.toLowerCase() ? '#C9A876' : '#8A847A',
                      cursor: 'pointer',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {tier === 'all' ? 'All Clients' : `${tier} VIP`}
                  </button>
                ))}
              </div>
            </div>

            {/* Customers Table */}
            <div style={{
              backgroundColor: '#121110',
              border: '1px solid #24221F',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #24221F', backgroundColor: '#181715', color: '#8A847A', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <th style={{ padding: '16px' }}>Client</th>
                    <th style={{ padding: '16px' }}>Contact</th>
                    <th style={{ padding: '16px' }}>Loyalty Tier</th>
                    <th style={{ padding: '16px' }}>Orders</th>
                    <th style={{ padding: '16px' }}>Lifetime Spend</th>
                    <th style={{ padding: '16px' }}>Latest Order</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#8A847A' }}>
                        No clients found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(cust => (
                      <tr key={cust._id} style={{ borderBottom: '1px solid #1C1B19', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: cust.vipColor ? `${cust.vipColor}22` : '#24221F',
                              border: `1px solid ${cust.vipColor || '#383430'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: cust.vipColor || '#C9A876',
                              fontWeight: 600,
                              fontSize: '14px',
                              textTransform: 'uppercase'
                            }}>
                              {cust.name ? cust.name.charAt(0) : 'C'}
                            </div>
                            <div>
                              <div style={{ color: '#F2EFEA', fontWeight: 500 }}>{cust.name}</div>
                              <div style={{ fontSize: '11px', color: '#8A847A' }}>
                                {cust.isGuest ? 'Guest Client' : 'Registered Member'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <div style={{ color: '#F2EFEA', fontSize: '12px' }}>{cust.email}</div>
                          {cust.phone && (
                            <div style={{ color: '#8A847A', fontSize: '11px', marginTop: '2px' }}>
                              {cust.phone}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            backgroundColor: cust.vipTier?.includes('Diamond') ? 'rgba(229, 228, 226, 0.15)' :
                                           cust.vipTier?.includes('Gold') ? 'rgba(201, 168, 118, 0.15)' :
                                           cust.vipTier?.includes('Silver') ? 'rgba(168, 169, 173, 0.15)' :
                                           'rgba(205, 127, 50, 0.15)',
                            color: cust.vipColor || '#C9A876',
                            border: `1px solid ${cust.vipColor || '#383430'}66`
                          }}>
                            <Crown size={12} />
                            {cust.vipTier}
                          </span>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <div style={{ color: '#F2EFEA', fontWeight: 500 }}>{cust.ordersCount} Orders</div>
                          <div style={{ fontSize: '11px', color: '#7EB685' }}>{cust.paidOrdersCount} Paid</div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          {cust.totalSpentNgn > 0 && (
                            <div style={{ color: '#00C3EB', fontWeight: 600 }}>
                              {formatPrice(cust.totalSpentNgn, 'NGN')}
                            </div>
                          )}
                          {cust.totalSpentUsd > 0 && (
                            <div style={{ color: '#8F85FF', fontWeight: 600, fontSize: cust.totalSpentNgn > 0 ? '11px' : '13px' }}>
                              {formatPrice(cust.totalSpentUsd, 'USD')}
                            </div>
                          )}
                          {cust.totalSpentNgn === 0 && cust.totalSpentUsd === 0 && (
                            <div style={{ color: '#8A847A' }}>₦0</div>
                          )}
                        </td>

                        <td style={{ padding: '16px' }}>
                          {cust.latestOrder ? (
                            <div>
                              <div style={{ color: '#C9A876', fontSize: '12px', fontWeight: 500 }}>
                                #{cust.latestOrder.orderNumber}
                              </div>
                              <div style={{ fontSize: '11px', color: '#8A847A' }}>
                                {new Date(cust.latestOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#6E6960', fontSize: '12px' }}>No orders yet</span>
                          )}
                        </td>

                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="btn-dark"
                            style={{ fontSize: '11px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Eye size={12} />
                            <span>View Dossier</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Dossier Modal / Drawer */}
        {selectedCustomer && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{
              backgroundColor: '#141312',
              border: '1px solid #33302B',
              borderRadius: '6px',
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid #24221F', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: selectedCustomer.vipColor ? `${selectedCustomer.vipColor}22` : '#24221F',
                    border: `1px solid ${selectedCustomer.vipColor || '#383430'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: selectedCustomer.vipColor || '#C9A876',
                    fontWeight: 700,
                    fontSize: '18px'
                  }}>
                    {selectedCustomer.name ? selectedCustomer.name.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#F2EFEA', marginBottom: '4px' }}>
                      {selectedCustomer.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 600,
                        backgroundColor: selectedCustomer.vipColor ? `${selectedCustomer.vipColor}22` : '#24221F',
                        color: selectedCustomer.vipColor || '#C9A876',
                        border: `1px solid ${selectedCustomer.vipColor || '#383430'}`
                      }}>
                        <Crown size={10} /> {selectedCustomer.vipTier}
                      </span>
                      <span style={{ fontSize: '11px', color: '#8A847A' }}>
                        {selectedCustomer.isGuest ? 'Guest Client' : 'Registered Member'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  style={{ background: 'transparent', border: 'none', color: '#8A847A', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Client Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <div style={{ backgroundColor: '#1A1917', padding: '16px', borderRadius: '4px', border: '1px solid #2B2926' }}>
                  <div style={{ fontSize: '10px', color: '#8A847A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Total Spend (NGN)</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#00C3EB' }}>
                    {formatPrice(selectedCustomer.totalSpentNgn, 'NGN')}
                  </div>
                </div>
                <div style={{ backgroundColor: '#1A1917', padding: '16px', borderRadius: '4px', border: '1px solid #2B2926' }}>
                  <div style={{ fontSize: '10px', color: '#8A847A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Total Spend (USD)</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#8F85FF' }}>
                    {formatPrice(selectedCustomer.totalUsdRevenue || selectedCustomer.totalSpentUsd, 'USD')}
                  </div>
                </div>
                <div style={{ backgroundColor: '#1A1917', padding: '16px', borderRadius: '4px', border: '1px solid #2B2926' }}>
                  <div style={{ fontSize: '10px', color: '#8A847A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Orders Placed</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#F2EFEA' }}>
                    {selectedCustomer.ordersCount} <span style={{ fontSize: '12px', color: '#7EB685' }}>({selectedCustomer.paidOrdersCount} Paid)</span>
                  </div>
                </div>
                <div style={{ backgroundColor: '#1A1917', padding: '16px', borderRadius: '4px', border: '1px solid #2B2926' }}>
                  <div style={{ fontSize: '10px', color: '#8A847A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Contact</div>
                  <div style={{ fontSize: '12px', color: '#F2EFEA', wordBreak: 'break-all' }}>{selectedCustomer.email}</div>
                  <div style={{ fontSize: '11px', color: '#8A847A', marginTop: '2px' }}>{selectedCustomer.phone || 'No phone recorded'}</div>
                </div>
              </div>

              {/* Delivery Addresses */}
              {selectedCustomer.savedAddresses && selectedCustomer.savedAddresses.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C9A876', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> Recorded Delivery Addresses
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {selectedCustomer.savedAddresses.map((addr, idx) => (
                      <div key={idx} style={{ backgroundColor: '#1A1917', border: '1px solid #2B2926', padding: '12px', borderRadius: '4px', fontSize: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#F2EFEA', marginBottom: '2px' }}>{addr.fullName || selectedCustomer.name}</div>
                        <div style={{ color: '#A6A095' }}>{addr.street}</div>
                        <div style={{ color: '#8A847A' }}>{addr.city}, {addr.state}</div>
                        {addr.phone && <div style={{ color: '#8A847A', marginTop: '4px' }}>📞 {addr.phone}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order History */}
              <div>
                <h4 style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C9A876', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={14} /> Recent Orders & Fulfillment
                </h4>
                {(!selectedCustomer.recentOrders || selectedCustomer.recentOrders.length === 0) ? (
                  <div style={{ color: '#8A847A', fontSize: '13px', padding: '20px', textAlign: 'center', backgroundColor: '#1A1917', borderRadius: '4px' }}>
                    No orders recorded for this client.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedCustomer.recentOrders.map(ord => (
                      <div key={ord._id} style={{ backgroundColor: '#1A1917', border: '1px solid #2B2926', borderRadius: '4px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <span style={{ color: '#C9A876', fontWeight: 600, fontSize: '14px', marginRight: '10px' }}>
                              #{ord.orderNumber}
                            </span>
                            <span style={{ fontSize: '11px', color: '#8A847A' }}>
                              {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 8px',
                              borderRadius: '2px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              backgroundColor: ord.paymentStatus === 'paid' ? 'rgba(126, 182, 133, 0.15)' : 'rgba(217, 130, 43, 0.15)',
                              color: ord.paymentStatus === 'paid' ? '#7EB685' : '#D9822B'
                            }}>
                              {ord.paymentStatus}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 8px',
                              borderRadius: '2px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              backgroundColor: ord.orderStatus === 'delivered' ? 'rgba(126, 182, 133, 0.15)' : 'rgba(201, 168, 118, 0.15)',
                              color: ord.orderStatus === 'delivered' ? '#7EB685' : '#C9A876'
                            }}>
                              {ord.orderStatus}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
                          {ord.items && ord.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#141312', padding: '6px 10px', borderRadius: '4px', border: '1px solid #24221F', flexShrink: 0 }}>
                              {item.image && <img src={item.image} alt={item.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '2px' }} />}
                              <div style={{ fontSize: '11px', color: '#F2EFEA', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name} <span style={{ color: '#8A847A' }}>x{item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                          <span style={{ color: '#8A847A' }}>Payment: {ord.paymentMethod?.toUpperCase()}</span>
                          <span style={{ color: '#F2EFEA', fontWeight: 600 }}>
                            Total: {formatPrice(ord.pricingBreakdown?.total, ord.currency || 'NGN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '28px', textAlign: 'right' }}>
                <button onClick={() => setSelectedCustomer(null)} className="btn-dark" style={{ padding: '8px 20px', fontSize: '12px' }}>
                  Close Dossier
                </button>
              </div>
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
