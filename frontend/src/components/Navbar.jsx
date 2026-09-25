import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const [scrolled, setScrolled] = useState(false);

  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { currency, setCurrency, isUsd } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/shop', label: 'Collection' },
    { to: '/shop?category=wigs', label: 'Wigs' },
    { to: '/shop?category=attachments', label: 'Hair Extensions' },
    { to: '/shop?category=hair-care', label: 'Hair Care' },
  ];

  return (
    <>
      {/* ── Announcement Bar (hidden on mobile) ─────────────────── */}
      <div className="announcement-bar">
        <div className="announcement-text">
          {isUsd ? (
            <span>
              Worldwide DHL Express Dispatch&nbsp;•&nbsp;International Card Payment Powered by{' '}
              <strong style={{ color: '#6772E5' }}>STRIPE</strong>
            </span>
          ) : (
            <span>
              Complimentary Lagos Delivery Above ₦250,000&nbsp;•&nbsp;Code{' '}
              <strong style={{ color: 'var(--gold-primary)' }}>LUXE10</strong> for 10% Off
            </span>
          )}
        </div>
        <div className="announcement-controls">
          {/* Currency Toggle */}
          <div className="toggle-group">
            <button
              type="button"
              onClick={() => setCurrency('NGN')}
              className={`toggle-btn ${currency === 'NGN' ? 'toggle-btn-active' : ''}`}
            >
              ₦ NGN
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`toggle-btn ${currency === 'USD' ? 'toggle-btn-active' : ''}`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Editorial Navbar ────────────────────────────────── */}
      <header className={`luxe-navbar ${scrolled ? 'luxe-navbar-scrolled' : ''}`}>
        <div className="luxe-navbar-inner">

          {/* LEFT: Logo */}
          <Link to="/" className="luxe-brand" aria-label={BRAND.name + ' Home'}>
            <span className="luxe-brand-name">{BRAND.name}</span>
            <span className="luxe-brand-sub">Haute Coiffure</span>
          </Link>

          {/* CENTER: Desktop Nav Links */}
          <nav className="luxe-nav-links" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="luxe-nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="luxe-nav-actions">
            {/* Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="luxe-icon-btn"
              aria-label="Search"
              title="Search Catalog"
            >
              <Search size={18} />
            </button>

            {/* Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="luxe-admin-badge"
                title="Store Management"
              >
                <ShieldCheck size={14} />
                <span>Admin</span>
              </Link>
            )}

            {/* User Account */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`luxe-icon-btn ${isAuthenticated ? 'luxe-icon-btn-gold' : ''}`}
                aria-label="Account"
                title={isAuthenticated ? user?.name : 'Account'}
              >
                <User size={18} />
              </button>

              {userDropdownOpen && (
                <div className="luxe-dropdown animate-fade-in">
                  {isAuthenticated ? (
                    <>
                      <div className="luxe-dropdown-header">
                        <div className="luxe-dropdown-name">{user?.name}</div>
                        <div className="luxe-dropdown-email">{user?.email}</div>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="luxe-dropdown-item"
                      >
                        Orders &amp; Addresses
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="luxe-dropdown-item luxe-dropdown-item-gold"
                        >
                          Store Management
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => { logout(); setUserDropdownOpen(false); navigate('/'); }}
                        className="luxe-dropdown-item luxe-dropdown-item-danger"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="luxe-dropdown-header">
                        <div className="luxe-dropdown-email">Welcome to {BRAND.name}</div>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="luxe-dropdown-item luxe-dropdown-item-gold"
                      >
                        Sign In / Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Bag */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="luxe-cart-btn"
              aria-label={`Open shopping bag, ${totalItemsCount} items`}
            >
              <ShoppingBag size={18} />
              {totalItemsCount > 0 && (
                <span className="luxe-cart-count">{totalItemsCount}</span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="luxe-icon-btn luxe-mobile-trigger"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Expandable Search Bar ───────────────────────────── */}
        {searchOpen && (
          <div className="luxe-search-bar">
            <div className="container">
              <form onSubmit={handleSearchSubmit} className="luxe-search-form">
                <input
                  type="text"
                  placeholder="Search raw wigs, HD frontals, clip-ins, argan oils..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="input-luxury luxe-search-input"
                />
                <button type="submit" className="btn-gold" style={{ padding: '0 22px' }}>
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="btn-dark"
                  style={{ padding: '0 14px' }}
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Mobile Drawer ───────────────────────────────────── */}
        {mobileMenuOpen && (
          <nav className="luxe-mobile-menu" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="luxe-mobile-link"
              >
                {link.label}
              </Link>
            ))}
            <div className="luxe-mobile-divider" />
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="luxe-mobile-link"
            >
              {isAuthenticated ? 'My Orders & Account' : 'Sign In / Register'}
            </Link>
            {/* Mobile currency controls */}
            <div className="luxe-mobile-controls">
              <div className="toggle-group">
                <button type="button" onClick={() => setCurrency('NGN')} className={`toggle-btn ${currency === 'NGN' ? 'toggle-btn-active' : ''}`}>₦ NGN</button>
                <button type="button" onClick={() => setCurrency('USD')} className={`toggle-btn ${currency === 'USD' ? 'toggle-btn-active' : ''}`}>$ USD</button>
              </div>
            </div>
          </nav>
        )}
      </header>

      <style>{`
        /* ── Announcement Bar ──────────────────────────────────── */
        .announcement-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 7px 24px;
          background: var(--bg-surface-2);
          border-bottom: 1px solid var(--border-subtle);
          font-size: 11px;
          letter-spacing: 0.07em;
          color: var(--text-secondary);
          text-transform: uppercase;
          transition: background-color 0.3s ease;
        }
        .announcement-text {
          flex: 1;
          text-align: center;
        }
        .announcement-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .announcement-bar { display: none; }
        }

        /* ── Toggle Groups ─────────────────────────────────────── */
        .toggle-group {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--border-medium);
          border-radius: 3px;
          background: var(--bg-surface-1);
          overflow: hidden;
        }
        .toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          font-size: 10px;
          font-weight: 600;
          font-family: inherit;
          background: transparent;
          color: var(--text-muted);
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
          letter-spacing: 0.04em;
        }
        .toggle-btn-active {
          background: var(--gold-primary);
          color: #0E0D0C;
        }
        .toggle-btn:not(.toggle-btn-active):hover {
          color: var(--text-primary);
        }

        /* ── Editorial Navbar Shell ────────────────────────────── */
        .luxe-navbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: var(--bg-surface-glass);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .luxe-navbar-scrolled {
          box-shadow: 0 4px 32px rgba(0,0,0,0.18);
          border-bottom-color: var(--border-medium);
        }
        .luxe-navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 24px;
          gap: 24px;
        }

        /* ── Brand Logo (LEFT) ────────────────────────────────── */
        .luxe-brand {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex-shrink: 0;
          gap: 1px;
        }
        .luxe-brand-name {
          font-family: 'Cinzel', 'Cormorant Garamond', Georgia, serif;
          font-size: 19px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: var(--text-primary);
          line-height: 1;
          transition: color 0.2s ease;
        }
        .luxe-brand:hover .luxe-brand-name {
          color: var(--gold-primary);
        }
        .luxe-brand-sub {
          font-size: 8px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold-dark);
          font-family: var(--font-sans);
          font-weight: 500;
          line-height: 1;
        }

        /* ── Desktop Nav Links (CENTER) ───────────────────────── */
        .luxe-nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
          flex: 1;
          justify-content: center;
        }
        .luxe-nav-link {
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--text-secondary);
          text-decoration: none;
          position: relative;
          padding-bottom: 2px;
          transition: color 0.2s ease;
        }
        .luxe-nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--gold-primary);
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .luxe-nav-link:hover {
          color: var(--text-primary);
        }
        .luxe-nav-link:hover::after {
          width: 100%;
        }

        /* ── Actions (RIGHT) ──────────────────────────────────── */
        .luxe-nav-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .luxe-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 6px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .luxe-icon-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.04);
        }
        .luxe-icon-btn-gold {
          color: var(--gold-primary);
        }
        .luxe-icon-btn-gold:hover {
          color: var(--gold-light);
        }
        .luxe-admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: rgba(201, 168, 118, 0.1);
          border: 1px solid rgba(201, 168, 118, 0.28);
          border-radius: 4px;
          color: var(--gold-primary);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          transition: background 0.2s ease;
        }
        .luxe-admin-badge:hover {
          background: rgba(201, 168, 118, 0.18);
        }

        /* Cart Button */
        .luxe-cart-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(201, 168, 118, 0.1);
          border: 1px solid rgba(201, 168, 118, 0.25);
          color: var(--gold-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 4px;
        }
        .luxe-cart-btn:hover {
          background: rgba(201, 168, 118, 0.2);
          border-color: var(--gold-primary);
          transform: translateY(-1px);
        }
        .luxe-cart-count {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          background: var(--gold-primary);
          color: #0E0D0C;
          font-size: 10px;
          font-weight: 700;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0;
          line-height: 1;
        }

        /* Mobile Trigger - hidden on desktop */
        .luxe-mobile-trigger { display: none; }

        /* ── Dropdown ──────────────────────────────────────────── */
        .luxe-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 220px;
          background: var(--bg-surface-1);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          padding: 8px 0;
          z-index: 50;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .luxe-dropdown-header {
          padding: 10px 16px 10px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 4px;
        }
        .luxe-dropdown-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .luxe-dropdown-email {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .luxe-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          font-size: 13px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s ease, background 0.2s ease;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }
        .luxe-dropdown-item:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.04);
        }
        .luxe-dropdown-item-gold { color: var(--gold-primary) !important; }
        .luxe-dropdown-item-danger { 
          color: #E06C75 !important;
          border-top: 1px solid var(--border-subtle);
          margin-top: 4px;
        }

        /* ── Search Bar ────────────────────────────────────────── */
        .luxe-search-bar {
          background: var(--bg-surface-1);
          border-top: 1px solid var(--border-subtle);
          padding: 14px 0;
          animation: slideDown 0.2s ease;
        }
        .luxe-search-form {
          display: flex;
          gap: 10px;
        }
        .luxe-search-input {
          flex: 1;
        }

        /* ── Mobile Menu ───────────────────────────────────────── */
        .luxe-mobile-menu {
          background: var(--bg-surface-1);
          border-top: 1px solid var(--border-subtle);
          padding: 20px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: slideDown 0.2s ease;
        }
        .luxe-mobile-link {
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--text-secondary);
          padding: 10px 4px;
          border-bottom: 1px solid var(--border-subtle);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .luxe-mobile-link:last-of-type {
          border-bottom: none;
        }
        .luxe-mobile-link:hover {
          color: var(--gold-primary);
        }
        .luxe-mobile-divider {
          height: 1px;
          background: var(--border-medium);
          margin: 8px 0;
        }
        .luxe-mobile-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 12px;
        }

        /* ── Responsive ────────────────────────────────────────── */
        @media (max-width: 880px) {
          .luxe-nav-links { display: none; }
          .luxe-mobile-trigger { display: inline-flex !important; }
        }
        @media (max-width: 640px) {
          .luxe-navbar-inner { padding: 0 16px; }
          .luxe-brand-name { font-size: 16px; }
        }

        /* ── Animation ─────────────────────────────────────────── */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: slideDown 0.2s ease;
        }
      `}</style>
    </>
  );
}
