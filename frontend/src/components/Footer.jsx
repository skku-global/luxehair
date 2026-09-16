import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { BRAND } from '../config/brand';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer style={{
      backgroundColor: '#070606',
      borderTop: '1px solid #1C1B19',
      marginTop: '80px',
      color: '#A6A095'
    }}>
      {/* Brand Trust Pillars (Jumia shopping confidence + Luxury salon standard) */}
      <div style={{ borderBottom: '1px solid #1C1B19', padding: '40px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '30px'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                color: '#C9A876',
                padding: '12px',
                backgroundColor: 'rgba(201, 168, 118, 0.08)',
                borderRadius: '2px',
                border: '1px solid rgba(201, 168, 118, 0.2)'
              }}>
                <Award size={22} />
              </div>
              <div>
                <h4 style={{ color: '#F2EFEA', fontSize: '14px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  100% Unprocessed Raw Hair
                </h4>
                <p style={{ fontSize: '13px', color: '#8A847A', lineHeight: 1.5 }}>
                  Single-donor bundles with cuticles strictly aligned in one direction. Zero synthetic blends.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                color: '#C9A876',
                padding: '12px',
                backgroundColor: 'rgba(201, 168, 118, 0.08)',
                borderRadius: '2px',
                border: '1px solid rgba(201, 168, 118, 0.2)'
              }}>
                <Truck size={22} />
              </div>
              <div>
                <h4 style={{ color: '#F2EFEA', fontSize: '14px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Discreet White-Glove Dispatch
                </h4>
                <p style={{ fontSize: '13px', color: '#8A847A', lineHeight: 1.5 }}>
                  Insured 24-48 hr courier in Lagos & Abuja. Nationwide DHL express to all 36 states.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                color: '#C9A876',
                padding: '12px',
                backgroundColor: 'rgba(201, 168, 118, 0.08)',
                borderRadius: '2px',
                border: '1px solid rgba(201, 168, 118, 0.2)'
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 style={{ color: '#F2EFEA', fontSize: '14px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Secure Paystack & POD
                </h4>
                <p style={{ fontSize: '13px', color: '#8A847A', lineHeight: 1.5 }}>
                  Encrypted card payments, verified corporate bank transfer, or Pay on Delivery in Lagos.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                color: '#C9A876',
                padding: '12px',
                backgroundColor: 'rgba(201, 168, 118, 0.08)',
                borderRadius: '2px',
                border: '1px solid rgba(201, 168, 118, 0.2)'
              }}>
                <RefreshCw size={22} />
              </div>
              <div>
                <h4 style={{ color: '#F2EFEA', fontSize: '14px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Lifetime Quality Assurance
                </h4>
                <p style={{ fontSize: '13px', color: '#8A847A', lineHeight: 1.5 }}>
                  Bespoke construction designed to last 3 to 5 years with our signature botanical care routine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div style={{ padding: '70px 0 50px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px'
          }}>
            {/* Column 1: Brand Ethos */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{
                fontFamily: "'Cinzel', Georgia, serif",
                fontSize: '20px',
                letterSpacing: '0.2em',
                color: '#F2EFEA',
                marginBottom: '16px'
              }}>
                {BRAND.name}
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#8A847A', marginBottom: '20px' }}>
                {BRAND.description}
              </p>
              <div style={{ fontSize: '12px', color: '#6E6960' }}>
                Atelier: {BRAND.contact.address}
              </div>
            </div>

            {/* Column 2: The Collections */}
            <div>
              <h5 style={{ color: '#F2EFEA', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '18px' }}>
                The Atelier
              </h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li><Link to="/shop?category=wigs" style={{ color: '#A6A095' }}>Raw & Virgin Wigs</Link></li>
                <li><Link to="/shop?category=attachments" style={{ color: '#A6A095' }}>Clip-In Extensions</Link></li>
                <li><Link to="/shop?category=attachments" style={{ color: '#A6A095' }}>Invisible Tape-Ins</Link></li>
                <li><Link to="/shop?category=attachments" style={{ color: '#A6A095' }}>Couture Ponytails</Link></li>
                <li><Link to="/shop?category=hair-care" style={{ color: '#A6A095' }}>Argan & Marula Elixirs</Link></li>
                <li><Link to="/shop?category=hair-care" style={{ color: '#A6A095' }}>Lace Melting Formulations</Link></li>
              </ul>
            </div>

            {/* Column 3: Client Concierge */}
            <div>
              <h5 style={{ color: '#F2EFEA', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '18px' }}>
                Client Concierge
              </h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li><Link to="/account" style={{ color: '#A6A095' }}>Track My Order</Link></li>
                <li><a href={`mailto:${BRAND.contact.email}`} style={{ color: '#A6A095' }}>Direct Consultation</a></li>
                <li><a href={`https://wa.me/2348005893424`} target="_blank" rel="noreferrer" style={{ color: '#C9A876' }}>WhatsApp Hair Specialist</a></li>
                <li><Link to="/shop" style={{ color: '#A6A095' }}>Wig Sizing & Cap Guide</Link></li>
                <li><Link to="/account" style={{ color: '#A6A095' }}>Private Account Portal</Link></li>
              </ul>
            </div>

            {/* Column 4: Private Salon Newsletter */}
            <div>
              <h5 style={{ color: '#F2EFEA', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '18px' }}>
                Private Member Access
              </h5>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#8A847A', marginBottom: '16px' }}>
                Receive discreet announcements regarding rare raw donor drops and private invitation previews.
              </p>
              {newsletterSuccess ? (
                <div style={{ color: '#C9A876', fontSize: '13px', padding: '10px', border: '1px solid rgba(201,168,118,0.3)', backgroundColor: 'rgba(201,168,118,0.05)' }}>
                  ✦ Welcome to the circle. Privilege code LUXE10 has been reserved for your email.
                </div>
              ) : (
                <form onSubmit={handleNewsletter} style={{ display: 'flex' }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: '#141312',
                      border: '1px solid #24221F',
                      borderRight: 'none',
                      padding: '12px 14px',
                      color: '#F2EFEA',
                      fontSize: '13px',
                      outline: 'none',
                      borderRadius: '2px 0 0 2px'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#C9A876',
                      color: '#0E0D0C',
                      padding: '0 16px',
                      borderRadius: '0 2px 2px 0',
                      cursor: 'pointer'
                    }}
                    title="Subscribe"
                  >
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Bar with Payment Logos & Copyright */}
          <div style={{
            borderTop: '1px solid #1C1B19',
            marginTop: '50px',
            paddingTop: '30px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            fontSize: '12px',
            color: '#6E6960'
          }}>
            <div>
              © {new Date().getFullYear()} {BRAND.name}. All Rights Reserved. Handcrafted in Lagos, Nigeria.
            </div>

            {/* Payment Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#A6A095', fontSize: '11px', letterSpacing: '0.05em' }}>
              <span>SECURED BY</span>
              <span style={{ color: '#00C3F7', fontWeight: 700, letterSpacing: '0.1em' }}>PAYSTACK</span>
              <span>•</span>
              <span>MASTERCARD</span>
              <span>•</span>
              <span>VISA</span>
              <span>•</span>
              <span>VERVE</span>
              <span>•</span>
              <span>ZENITH BANK</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
