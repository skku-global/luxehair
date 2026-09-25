import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Settings, LogOut, Plus, Trash2, Eye, ShieldCheck, Crown, Award, Sparkles, CheckCircle2, ChevronRight, Gift } from 'lucide-react';
import { BRAND, formatPrice } from '../config/brand';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AccountPage() {
  const { user, isAuthenticated, isAdmin, login, register, logout, saveAddress, deleteAddress, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Auth form state (if unauthenticated)
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Authenticated Portal state
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'vip' | 'addresses' | 'profile'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // New Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: 'Lagos',
    state: 'Lagos State',
    isDefault: false
  });

  // Profile update state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  // Fetch orders when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setProfileName(user?.name || '');
      setProfilePhone(user?.phone || '');
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const res = await api.getMyOrders();
          if (res.success) {
            setOrders(res.orders || []);
          }
        } catch (err) {
          console.error('Failed to load orders:', err);
        } finally {
          setOrdersLoading(false);
        }
      };

      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await register(regName, regEmail, regPassword, regPhone);
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Demo 1-click test logins
  const handleQuickLogin = async (email, password) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.street || !newAddr.city) return;
    try {
      await saveAddress(newAddr);
      setShowAddressForm(false);
      setNewAddr({ fullName: '', phone: '', street: '', city: 'Lagos', state: 'Lagos State', isDefault: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      await updateProfile({ name: profileName, phone: profilePhone });
      setProfileMessage('Profile details updated successfully.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      setProfileMessage('Failed to update profile.');
    }
  };

  // VIP Loyalty Calculations
  const totalSpentNgn = orders
    .filter(o => o.paymentStatus === 'paid' && (o.currency === 'NGN' || !o.currency))
    .reduce((sum, o) => sum + (o.pricingBreakdown?.total || 0), 0);

  const totalSpentUsd = orders
    .filter(o => o.paymentStatus === 'paid' && o.currency === 'USD')
    .reduce((sum, o) => sum + (o.pricingBreakdown?.total || 0), 0);

  let vipTier = 'Bronze VIP';
  let nextTier = 'Silver VIP';
  let nextTierThreshold = 300000;
  let vipColor = '#CD7F32';

  if (totalSpentNgn >= 1500000 || totalSpentUsd >= 1500) {
    vipTier = 'Diamond VIP';
    nextTier = 'Supreme Atelier Patron';
    nextTierThreshold = 3000000;
    vipColor = '#E5E4E2';
  } else if (totalSpentNgn >= 750000 || totalSpentUsd >= 750) {
    vipTier = 'Gold VIP';
    nextTier = 'Diamond VIP';
    nextTierThreshold = 1500000;
    vipColor = '#C9A876';
  } else if (totalSpentNgn >= 300000 || totalSpentUsd >= 300) {
    vipTier = 'Silver VIP';
    nextTier = 'Gold VIP';
    nextTierThreshold = 750000;
    vipColor = '#A8A9AD';
  }

  const tierProgress = Math.min(100, Math.round((totalSpentNgn / nextTierThreshold) * 100));

  // -------------------------------------------------------------
  // RENDER 1: UNAUTHENTICATED (Login / Signup)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#0E0D0C', color: '#F2EFEA', minHeight: '90vh', padding: '60px 0 100px' }}>
        <div className="container-narrow">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-tag">Private Concierge</span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '36px', fontWeight: 400 }}>
              Atelier Client Portal
            </h1>
            <p style={{ color: '#8A847A', fontSize: '14px', maxWidth: '440px', margin: '0 auto' }}>
              Sign in to review bespoke orders, track dispatch in real time, and manage saved delivery addresses.
            </p>
          </div>

          <div style={{
            backgroundColor: '#121110',
            border: '1px solid #24221F',
            borderRadius: '4px',
            maxWidth: '520px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
            {/* Tab switch */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #1C1B19' }}>
              <button
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
                style={{
                  padding: '16px',
                  fontSize: '13px',
                  fontWeight: authTab === 'login' ? 600 : 400,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: authTab === 'login' ? '#C9A876' : '#8A847A',
                  backgroundColor: authTab === 'login' ? '#161514' : '#100F0E',
                  borderBottom: authTab === 'login' ? '2px solid #C9A876' : 'none',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthTab('register'); setAuthError(''); }}
                style={{
                  padding: '16px',
                  fontSize: '13px',
                  fontWeight: authTab === 'register' ? 600 : 400,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: authTab === 'register' ? '#C9A876' : '#8A847A',
                  backgroundColor: authTab === 'register' ? '#161514' : '#100F0E',
                  borderBottom: authTab === 'register' ? '2px solid #C9A876' : 'none',
                  cursor: 'pointer'
                }}
              >
                Create Account
              </button>
            </div>

            <div style={{ padding: '36px 30px' }}>
              {authError && (
                <div style={{
                  backgroundColor: 'rgba(224, 108, 117, 0.12)',
                  border: '1px solid #E06C75',
                  color: '#E06C75',
                  padding: '12px',
                  borderRadius: '2px',
                  fontSize: '13px',
                  marginBottom: '20px'
                }}>
                  {authError}
                </div>
              )}

              {/* Login Form */}
              {authTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g., customer@luxehair.com"
                      className="input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>Password</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-luxury"
                    />
                  </div>

                  <button type="submit" disabled={authLoading} className="btn-gold" style={{ width: '100%', marginTop: '8px' }}>
                    {authLoading ? 'Signing In...' : 'Sign In to Portal'}
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Folashade Adeleke"
                      className="input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="folashade@gmail.com"
                      className="input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#A6A095', marginBottom: '6px' }}>Create Password *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="input-luxury"
                    />
                  </div>

                  <button type="submit" disabled={authLoading} className="btn-gold" style={{ width: '100%', marginTop: '8px' }}>
                    {authLoading ? 'Creating Account...' : 'Register for Concierge Access'}
                  </button>
                </form>
              )}

              {/* 1-Click Demo Testing Box */}
              <div style={{
                marginTop: '32px',
                padding: '20px',
                backgroundColor: '#161514',
                border: '1px solid #33302B',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#C9A876', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
                  <Sparkles size={14} /> Instant One-Click Demo Access
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('customer@luxehair.com', 'customer123')}
                    className="btn-dark"
                    style={{
                      fontSize: '11px',
                      padding: '12px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid #C9A876',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ color: '#F2EFEA', fontWeight: 600 }}>Demo Customer</span>
                    <span style={{ fontSize: '10px', color: '#8A847A' }}>customer@luxehair.com</span>
                    <span style={{ fontSize: '9px', color: '#C9A876' }}>Pass: customer123</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@luxehair.com', 'admin123456')}
                    className="btn-dark"
                    style={{
                      fontSize: '11px',
                      padding: '12px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid #383430',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ color: '#C9A876', fontWeight: 600 }}>Store Admin</span>
                    <span style={{ fontSize: '10px', color: '#8A847A' }}>admin@luxehair.com</span>
                    <span style={{ fontSize: '9px', color: '#A8A9AD' }}>Pass: admin123456</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: AUTHENTICATED PORTAL (Orders, Addresses, Profile)
  // -------------------------------------------------------------
  return (
    <div style={{ backgroundColor: '#0E0D0C', color: '#F2EFEA', minHeight: '90vh', padding: '50px 0 100px' }}>
      <div className="container">
        {/* Header Profile Bar */}
        <div style={{
          backgroundColor: '#121110',
          border: '1px solid #24221F',
          borderRadius: '4px',
          padding: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '32px', fontWeight: 400 }}>
                {user?.name}
              </h1>
              {isAdmin ? (
                <span className="badge-gold">Store Admin Concierge</span>
              ) : (
                <span className="badge-dark">VIP Patron</span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: '#8A847A', marginTop: '4px' }}>
              {user?.email} {user?.phone ? `• ${user.phone}` : ''}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {isAdmin && (
              <Link to="/admin" className="btn-outline-gold" style={{ fontSize: '12px', padding: '10px 18px' }}>
                <ShieldCheck size={14} />
                <span>Open Store Admin</span>
              </Link>
            )}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="btn-dark"
              style={{ fontSize: '12px', padding: '10px 18px', color: '#E06C75' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* LUXURY VIP LOYALTY CARD BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #1C1A17 0%, #121110 50%, #1A1815 100%)',
          border: `1px solid ${vipColor}66`,
          borderRadius: '8px',
          padding: '28px',
          marginBottom: '36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          {/* Subtle Background Watermark */}
          <div style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-20px',
            opacity: 0.05,
            fontSize: '130px',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: '#C9A876',
            pointerEvents: 'none'
          }}>
            LXH
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: vipColor, fontWeight: 700, marginBottom: '8px' }}>
                <Crown size={14} /> LUXEHAIR Atelier Privilege Club
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '28px', fontWeight: 500, color: '#F2EFEA', marginBottom: '6px' }}>
                {vipTier} Member Status
              </h2>
              <p style={{ color: '#A6A095', fontSize: '13px', maxWidth: '520px', lineHeight: 1.5 }}>
                {vipTier.includes('Diamond')
                  ? 'At the pinnacle of haute coiffure. Enjoy personalized concierge, bespoke custom wig fittings, and unlimited complimentary express courier worldwide.'
                  : vipTier.includes('Gold')
                  ? 'Gold patron privileges active. Enjoy complimentary Lagos express delivery, priority bespoke styling queue, and seasonal atelier gifts.'
                  : vipTier.includes('Silver')
                  ? 'Silver patron status unlocked. Enjoy 10% private privilege discounts (Code: LUXE10) and complimentary lace maintenance sets.'
                  : 'Welcome to the LUXEHAIR Clientèle Club. Earn points on every authentic unit purchase and advance toward Silver VIP privileges.'}
              </p>
            </div>

            {/* Spend Stats & Progress */}
            <div style={{ minWidth: '220px', backgroundColor: 'rgba(0,0,0,0.4)', padding: '16px 20px', borderRadius: '6px', border: '1px solid #2B2926' }}>
              <div style={{ fontSize: '11px', color: '#8A847A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Lifetime Atelier Spend
              </div>
              <div style={{ fontSize: '22px', fontWeight: 600, color: '#C9A876', marginBottom: '10px' }}>
                {formatPrice(totalSpentNgn || (totalSpentUsd * 1500), 'NGN')}
              </div>

              {/* Progress bar to next tier */}
              {vipTier !== 'Diamond VIP' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8A847A', marginBottom: '4px' }}>
                    <span>Next: {nextTier}</span>
                    <span>{tierProgress}%</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#24221F', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${tierProgress}%`, backgroundColor: vipColor, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portal Tabs Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }} className="account-layout">
          {/* Side Tabs Navigation */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                backgroundColor: activeTab === 'orders' ? '#181716' : 'transparent',
                border: activeTab === 'orders' ? '1px solid #2A2824' : '1px solid transparent',
                borderLeft: activeTab === 'orders' ? '3px solid #C9A876' : '3px solid transparent',
                color: activeTab === 'orders' ? '#F2EFEA' : '#8A847A',
                fontSize: '13px',
                fontWeight: activeTab === 'orders' ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Package size={16} style={{ color: activeTab === 'orders' ? '#C9A876' : '#8A847A' }} />
              <span>Order History ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('vip')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                backgroundColor: activeTab === 'vip' ? '#181716' : 'transparent',
                border: activeTab === 'vip' ? '1px solid #2A2824' : '1px solid transparent',
                borderLeft: activeTab === 'vip' ? '3px solid #C9A876' : '3px solid transparent',
                color: activeTab === 'vip' ? '#F2EFEA' : '#8A847A',
                fontSize: '13px',
                fontWeight: activeTab === 'vip' ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Crown size={16} style={{ color: activeTab === 'vip' ? '#C9A876' : '#8A847A' }} />
              <span>VIP Privilege Tiers</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                backgroundColor: activeTab === 'addresses' ? '#181716' : 'transparent',
                border: activeTab === 'addresses' ? '1px solid #2A2824' : '1px solid transparent',
                borderLeft: activeTab === 'addresses' ? '3px solid #C9A876' : '3px solid transparent',
                color: activeTab === 'addresses' ? '#F2EFEA' : '#8A847A',
                fontSize: '13px',
                fontWeight: activeTab === 'addresses' ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <MapPin size={16} style={{ color: activeTab === 'addresses' ? '#C9A876' : '#8A847A' }} />
              <span>Delivery Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                backgroundColor: activeTab === 'profile' ? '#181716' : 'transparent',
                border: activeTab === 'profile' ? '1px solid #2A2824' : '1px solid transparent',
                borderLeft: activeTab === 'profile' ? '3px solid #C9A876' : '3px solid transparent',
                color: activeTab === 'profile' ? '#F2EFEA' : '#8A847A',
                fontSize: '13px',
                fontWeight: activeTab === 'profile' ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Settings size={16} style={{ color: activeTab === 'profile' ? '#C9A876' : '#8A847A' }} />
              <span>Profile Settings</span>
            </button>
          </aside>

          {/* Main Tab Content Area */}
          <div>
            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <h3 style={{ fontSize: '18px', color: '#F2EFEA', marginBottom: '20px' }}>
                  Your Haute Coiffure Orders
                </h3>

                {ordersLoading ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#C9A876' }}>
                    ✦ Loading order records...
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', borderRadius: '4px', padding: '60px 24px', textAlign: 'center' }}>
                    <Package size={44} style={{ color: '#2A2824', margin: '0 auto 16px' }} />
                    <p style={{ color: '#A6A095', fontSize: '15px', marginBottom: '16px' }}>No orders placed under this account yet.</p>
                    <Link to="/shop" className="btn-gold">Explore The Collection</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map((ord) => (
                      <div
                        key={ord._id}
                        style={{
                          backgroundColor: '#121110',
                          border: '1px solid #24221F',
                          borderRadius: '4px',
                          padding: '24px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #1C1B19', paddingBottom: '16px', marginBottom: '16px' }}>
                          <div>
                            <span style={{ fontSize: '12px', color: '#8A847A' }}>Order Reference: </span>
                            <strong style={{ color: '#C9A876', fontSize: '14px' }}>{ord.orderNumber}</strong>
                            <span style={{ margin: '0 8px', color: '#333' }}>•</span>
                            <span style={{ fontSize: '12px', color: '#8A847A' }}>
                              {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              padding: '4px 8px',
                              borderRadius: '2px',
                              backgroundColor: ord.orderStatus === 'delivered' ? 'rgba(126, 182, 133, 0.15)' : ord.orderStatus === 'shipped' ? 'rgba(0, 195, 247, 0.15)' : 'rgba(201, 168, 118, 0.15)',
                              color: ord.orderStatus === 'delivered' ? '#7EB685' : ord.orderStatus === 'shipped' ? '#00C3F7' : '#C9A876'
                            }}>
                              {ord.orderStatus}
                            </span>
                            <Link to={`/order-confirmation/${ord.orderNumber}`} className="btn-dark" style={{ padding: '6px 12px', fontSize: '11px' }}>
                              <Eye size={12} />
                              <span>View Dossier</span>
                            </Link>
                          </div>
                        </div>

                        {/* Order Items preview */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {ord.items.map((it, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '48px', height: '60px', backgroundColor: '#181716', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                                <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', color: '#F2EFEA', fontWeight: 500 }}>{it.name}</div>
                                {it.selectedVariant?.name && (
                                  <div style={{ fontSize: '11px', color: '#8A847A' }}>{it.selectedVariant.name}</div>
                                )}
                              </div>
                              <div style={{ fontSize: '13px', color: '#C9A876' }}>
                                {it.quantity} × {formatPrice(it.price, ord.currency || 'NGN')}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1C1B19', marginTop: '16px', paddingTop: '14px', fontSize: '13px' }}>
                          <span style={{ color: '#8A847A' }}>
                            Payment: <strong style={{ color: '#F2EFEA', textTransform: 'capitalize' }}>{ord.paymentMethod}</strong> ({ord.paymentStatus})
                          </span>
                          <span style={{ fontSize: '16px', fontWeight: 600, color: '#F2EFEA' }}>
                            Total: <span style={{ color: '#C9A876' }}>{formatPrice(ord.pricingBreakdown.total, ord.currency || 'NGN')}</span>
                          </span>
                        </div>

                        {/* Fulfillment Journey Timeline */}
                        <div style={{
                          marginTop: '16px',
                          padding: '14px 16px',
                          backgroundColor: '#161514',
                          borderRadius: '4px',
                          border: '1px solid #24221F'
                        }}>
                          <div style={{ fontSize: '10px', color: '#8A847A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                            <span>Atelier Fulfillment Journey</span>
                            {ord.shippingAddress && (
                              <span style={{ color: '#C9A876' }}>
                                📍 Delivery to {ord.shippingAddress.city}, {ord.shippingAddress.state}
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {[
                              { label: 'Order Placed', desc: 'Verified' },
                              { label: 'Atelier Styling', desc: 'Quality Check' },
                              { label: 'Dispatched', desc: 'In Transit' },
                              { label: 'Delivered', desc: 'Fulfilled' }
                            ].map((step, sIdx) => {
                              const stepIndex = ord.orderStatus === 'delivered' ? 3 :
                                                ord.orderStatus === 'shipped' ? 2 :
                                                ord.orderStatus === 'processing' || ord.orderStatus === 'confirmed' ? 1 : 0;
                              const isCompleted = sIdx <= stepIndex;
                              const isCurrent = sIdx === stepIndex;
                              return (
                                <div key={step.label} style={{ textAlign: 'center' }}>
                                  <div style={{
                                    height: '4px',
                                    backgroundColor: isCompleted ? '#C9A876' : '#2A2824',
                                    marginBottom: '6px',
                                    borderRadius: '2px',
                                    transition: 'background-color 0.3s'
                                  }} />
                                  <div style={{
                                    fontSize: '11px',
                                    fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400,
                                    color: isCurrent ? '#C9A876' : isCompleted ? '#F2EFEA' : '#6E6960'
                                  }}>
                                    {step.label}
                                  </div>
                                  <div style={{ fontSize: '9px', color: '#8A847A' }}>{step.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: VIP PRIVILEGES */}
            {activeTab === 'vip' && (
              <div>
                <h3 style={{ fontSize: '18px', color: '#F2EFEA', marginBottom: '8px' }}>
                  Atelier VIP Loyalty & Privilege Tiers
                </h3>
                <p style={{ color: '#8A847A', fontSize: '13px', marginBottom: '28px' }}>
                  Every bespoke purchase brings you closer to elevated salon perks, private concierge priority, and complimentary worldwide dispatch.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                  {[
                    {
                      tier: 'Bronze VIP',
                      color: '#CD7F32',
                      spend: 'Welcome Patron',
                      desc: 'Initial tier for all registered patrons.',
                      perks: [
                        'Access to member-only drops',
                        'Real-time DHL shipment tracking',
                        'Complimentary satin storage bag'
                      ]
                    },
                    {
                      tier: 'Silver VIP',
                      color: '#A8A9AD',
                      spend: '₦300,000 / $300 Spend',
                      desc: 'Unlocked after placing luxury orders.',
                      perks: [
                        '10% Private Code: LUXE10 on all orders',
                        'Complimentary Lace Melting Band & Silk Comb',
                        'Priority customer concierge assistance'
                      ]
                    },
                    {
                      tier: 'Gold VIP',
                      color: '#C9A876',
                      spend: '₦750,000 / $750 Spend',
                      desc: 'Esteemed frequent client status.',
                      perks: [
                        'Free Lagos Express Courier on every order',
                        'Complimentary Atelier Wig Deep-Wash Ritual',
                        'Early 48-Hour access to limited hair drops',
                        'Seasonal high-fashion gifts'
                      ]
                    },
                    {
                      tier: 'Diamond VIP',
                      color: '#E5E4E2',
                      spend: '₦1,500,000 / $1,500 Spend',
                      desc: 'The zenith of LUXEHAIR luxury clientele.',
                      perks: [
                        'Dedicated 1-on-1 Celebrity Stylist Concierge',
                        'Free DHL Express Dispatch Worldwide',
                        'Private custom wig fitting & density tailoring',
                        'VIP gala invitations & bespoke monogramming'
                      ]
                    }
                  ].map((lvl) => {
                    const isCurrent = vipTier === lvl.tier;
                    return (
                      <div
                        key={lvl.tier}
                        style={{
                          backgroundColor: '#121110',
                          border: isCurrent ? `2px solid ${lvl.color}` : '1px solid #24221F',
                          borderRadius: '6px',
                          padding: '24px',
                          position: 'relative',
                          boxShadow: isCurrent ? `0 0 25px ${lvl.color}22` : 'none'
                        }}
                      >
                        {isCurrent && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            backgroundColor: `${lvl.color}22`,
                            color: lvl.color,
                            border: `1px solid ${lvl.color}`,
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em'
                          }}>
                            Your Current Tier
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Crown size={18} style={{ color: lvl.color }} />
                          <h4 style={{ fontSize: '16px', fontWeight: 600, color: lvl.color }}>{lvl.tier}</h4>
                        </div>
                        <div style={{ fontSize: '12px', color: '#F2EFEA', fontWeight: 500, marginBottom: '4px' }}>
                          {lvl.spend}
                        </div>
                        <p style={{ fontSize: '12px', color: '#8A847A', marginBottom: '16px', lineHeight: 1.4 }}>
                          {lvl.desc}
                        </p>

                        <div style={{ borderTop: '1px solid #1C1B19', paddingTop: '14px' }}>
                          <div style={{ fontSize: '10px', color: '#8A847A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                            Included Privileges:
                          </div>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: 0, listStyle: 'none' }}>
                            {lvl.perks.map((p, pIdx) => (
                              <li key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: isCurrent ? '#F2EFEA' : '#A6A095' }}>
                                <CheckCircle2 size={13} style={{ color: lvl.color, flexShrink: 0, marginTop: '2px' }} />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ADDRESSES */}
            {activeTab === 'addresses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', color: '#F2EFEA' }}>Saved Delivery Residences</h3>
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-gold" style={{ fontSize: '12px', padding: '10px 16px' }}>
                    <Plus size={14} />
                    <span>Add Address</span>
                  </button>
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} style={{ backgroundColor: '#141312', border: '1px solid #C9A876', padding: '24px', borderRadius: '4px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: '#C9A876', textTransform: 'uppercase', marginBottom: '16px' }}>Add Residence Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Recipient Name"
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="input-luxury"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Recipient Phone"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="input-luxury"
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Street Address, House No, Estate"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="input-luxury"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="input-luxury"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State (e.g. Lagos State)"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="input-luxury"
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="btn-dark">Cancel</button>
                      <button type="submit" className="btn-gold">Save Address</button>
                    </div>
                  </form>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {user?.savedAddresses && user.savedAddresses.length > 0 ? (
                    user.savedAddresses.map((addr) => (
                      <div key={addr._id} style={{ backgroundColor: '#121110', border: '1px solid #24221F', padding: '20px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong style={{ color: '#F2EFEA', fontSize: '14px' }}>{addr.fullName}</strong>
                          <button onClick={() => deleteAddress(addr._id)} style={{ color: '#6E6960', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div style={{ fontSize: '13px', color: '#8A847A', lineHeight: 1.5 }}>
                          {addr.phone}<br />
                          {addr.street}<br />
                          {addr.city}, {addr.state}
                        </div>
                        {addr.isDefault && (
                          <span className="badge-gold" style={{ marginTop: '12px', display: 'inline-block' }}>Default Address</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#8A847A', fontSize: '14px' }}>No saved addresses yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <div style={{ backgroundColor: '#121110', border: '1px solid #24221F', padding: '30px', borderRadius: '4px', maxWidth: '540px' }}>
                <h3 style={{ fontSize: '18px', color: '#F2EFEA', marginBottom: '20px' }}>Personal Information</h3>

                {profileMessage && (
                  <div style={{ backgroundColor: 'rgba(126, 182, 133, 0.12)', border: '1px solid #7EB685', color: '#7EB685', padding: '10px', fontSize: '13px', marginBottom: '16px' }}>
                    {profileMessage}
                  </div>
                )}

                <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A847A', marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="input-luxury"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A847A', marginBottom: '6px' }}>Email Address (Unchangeable)</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="input-luxury"
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A847A', marginBottom: '6px' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="input-luxury"
                    />
                  </div>

                  <button type="submit" className="btn-gold" style={{ marginTop: '8px' }}>
                    Update Profile
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .account-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
