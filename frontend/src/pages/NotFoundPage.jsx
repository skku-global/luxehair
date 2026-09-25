import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { BRAND } from '../config/brand';

/**
 * 404 page. Previously any unmatched route silently rendered the homepage,
 * which hid broken links from both customers and search engines.
 */
export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: '520px' }}>
        <span className="section-tag">Error 404</span>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(34px, 6vw, 56px)',
            fontWeight: 300,
            lineHeight: 1.15,
            marginBottom: '18px'
          }}
        >
          This Page Has Left The Atelier
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
            lineHeight: 1.7,
            marginBottom: '36px'
          }}
        >
          The page you are looking for has been moved, retired, or never existed.
          Our full collection of raw virgin wigs, attachments, and botanical care
          remains available in the boutique.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            justifyContent: 'center'
          }}
        >
          <Link to="/" className="btn-gold" style={{ padding: '14px 30px' }}>
            <ArrowLeft size={16} />
            <span>Return Home</span>
          </Link>
          <Link to="/shop" className="btn-outline-gold" style={{ padding: '13px 28px' }}>
            <Search size={15} />
            <span>Browse The Boutique</span>
          </Link>
        </div>

        <p
          style={{
            marginTop: '40px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            letterSpacing: '0.04em'
          }}
        >
          Need assistance? Our concierge is reachable at {BRAND.contact.email}
        </p>
      </div>
    </div>
  );
}
