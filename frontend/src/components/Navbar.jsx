import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, ShieldCheck, LogOut } from 'lucide-react';
import { BRAND } from '../config/brand';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { currency, setCurrency, isUsd } = useCurrency();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Announcement & Currency Switcher Bar */}
      <div style={{
        backgroundColor: '#070606',
        borderBottom: '1px solid #1C1B19',
        fontSize: '11px',
        letterSpacing: '0.08em',
        color: '#A6A095',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ textTransform: 'uppercase', flex: 1, textAlign: 'center' }}>
          {isUsd ? (
            <span>
              Worldwide DHL Express Dispatch • International Card Payment Powered by <strong style={{ color: '#6772E5' }}>STRIPE</strong>
            </span>
          ) : (
            <span>
              Complimentary Lagos Delivery Above ₦250,000 • Privilege Code <strong style={{ color: '#C9A876' }}>LUXE10</strong> for 10% Off
            </span>
          )}
        </div>

        {/* Currency Switcher Toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #2A2824', borderRadius: '2px', backgroundColor: '#141312', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setCurrency('NGN')}
            style={{
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: currency === 'NGN' ? 700 : 400,
              backgroundColor: currency === 'NGN' ? '#C9A876' : 'transparent',
              color: currency === 'NGN' ? '#0E0D0C' : '#8A847A',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            🇳🇬 ₦ NGN
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            style={{
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: currency === 'USD' ? 700 : 400,
              backgroundColor: currency === 'USD' ? '#C9A876' : 'transparent',
              color: currency === 'USD' ? '#0E0D0C' : '#8A847A',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            🌐 $ USD
          </button>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(14, 13, 12, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1C1B19'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px'
        }}>
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', color: '#F2EFEA', padding: '6px' }}
            className="mobile-toggle-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Nav Links (Left) */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link to="/shop" style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C0BAB0' }}>
              The Collection
            </Link>
            <Link to="/shop?category=wigs" style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C0BAB0' }}>
              Virgin Wigs
            </Link>
            <Link to="/shop?category=attachments" style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C0BAB0' }}>
              Attachments
            </Link>
            <Link to="/shop?category=hair-care" style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C0BAB0' }}>
              Hair Care
            </Link>
          </nav>

          {/* Centered Brand Mark */}
          <Link to="/" style={{ textAlign: 'center', textDecoration: 'none' }}>
            <div style={{
              fontFamily: "'Cinzel', 'Cormorant Garamond', Georgia, serif",
              fontSize: '22px',
              letterSpacing: '0.22em',
              fontWeight: 600,
              color: '#F2EFEA',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#C9A876', fontSize: '16px' }}>✦</span>
              <span>{BRAND.name}</span>
              <span style={{ color: '#C9A876', fontSize: '16px' }}>✦</span>
            </div>
            <div style={{
              fontSize: '9px',
              letterSpacing: '0.3em',
              color: '#8F7246',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}>
              Haute Coiffure
            </div>
          </Link>

          {/* Header Actions (Right) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{ color: '#C0BAB0', padding: '6px', transition: 'color 0.2s' }}
              title="Search Catalog"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Admin Badge link if admin */}
            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'rgba(201, 168, 118, 0.15)',
                  border: '1px solid rgba(201, 168, 118, 0.3)',
                  color: '#C9A876',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '2px',
                  letterSpacing: '0.05em'
                }}
              >
                <ShieldCheck size={14} />
                <span>Admin</span>
              </Link>
            )}

            {/* User Account Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  color: isAuthenticated ? '#C9A876' : '#C0BAB0',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title={isAuthenticated ? user?.name : 'Account'}
              >
                <User size={20} />
              </button>

              {userDropdownOpen && (
                <div
                  className="card-luxury animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: '230px',
                    backgroundColor: '#141312',
                    border: '1px solid #2A2824',
                    padding: '12px 0',
                    zIndex: 50,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.7)'
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      <div style={{ padding: '8px 18px', borderBottom: '1px solid #24221F', marginBottom: '6px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F2EFEA' }}>{user?.name}</div>
                        <div style={{ fontSize: '11px', color: '#A6A095', marginTop: '2px' }}>{user?.email}</div>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'block', padding: '8px 18px', fontSize: '13px', color: '#C0BAB0' }}
                      >
                        Orders & Addresses
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ display: 'block', padding: '8px 18px', fontSize: '13px', color: '#C9A876' }}
                        >
                          Store Management
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 18px',
                          fontSize: '13px',
                          color: '#E06C75',
                          borderTop: '1px solid #24221F',
                          marginTop: '6px'
                        }}
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ padding: '8px 18px', fontSize: '12px', color: '#A6A095', borderBottom: '1px solid #24221F' }}>
                        Welcome to {BRAND.name}
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'block', padding: '10px 18px', fontSize: '13px', color: '#C9A876', fontWeight: 600 }}
                      >
                        Sign In / Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#F2EFEA',
                padding: '6px 12px',
                borderRadius: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid #24221F',
                transition: 'all 0.2s'
              }}
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag size={18} style={{ color: '#C9A876' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{totalItemsCount}</span>
            </button>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <div style={{
            backgroundColor: '#141312',
            borderTop: '1px solid #24221F',
            padding: '16px 0'
          }}>
            <div className="container">
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Search raw wigs, HD frontals, clip-ins, argan oils..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="input-luxury"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-gold" style={{ padding: '0 24px' }}>
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="btn-dark"
                  style={{ padding: '0 16px' }}
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#0E0D0C',
            borderBottom: '1px solid #24221F',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              The Full Collection
            </Link>
            <Link
              to="/shop?category=wigs"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A876' }}
            >
              Raw & Virgin Wigs
            </Link>
            <Link
              to="/shop?category=attachments"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A876' }}
            >
              Hair Attachments
            </Link>
            <Link
              to="/shop?category=hair-care"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A876' }}
            >
              Hair Care & Maintenance
            </Link>
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '1px solid #1C1B19', paddingTop: '16px' }}
            >
              {isAuthenticated ? 'My Orders & Account' : 'Sign In / Register'}
            </Link>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 880px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
