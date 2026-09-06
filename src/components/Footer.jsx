import { useNavigate } from 'react-router-dom';

export default function Footer({ onOpenSellerPortal }) {
  const navigate = useNavigate();

  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        color: 'var(--brand-dark)',
        paddingTop: '4.5rem',
        paddingBottom: '2.5rem',
        borderTop: '1px solid #ECE7DF'
      }}
    >
      <div className="container-clean">
        {/* Top 4-Column Grid as specified in Section 24 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: '3rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid #EFEAE2'
          }}
          className="footer-grid"
        >
          {/* Column 1: BIGBITES Brand */}
          <div>
            <a
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'baseline',
                marginBottom: '1rem',
                lineHeight: 1
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: 'var(--brand-dark)',
                  letterSpacing: '-0.02em'
                }}
              >
                BIG<span style={{ color: 'var(--brand-primary)' }}>BITES</span>
              </span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', marginLeft: '3px', display: 'inline-block' }}></span>
            </a>

            <p
              style={{
                fontSize: '0.92rem',
                color: '#78716C',
                lineHeight: 1.6,
                maxWidth: '320px',
                marginBottom: '1.5rem'
              }}
            >
              Your local marketplace for discovering restaurants, ordering food and tracking deliveries.
            </p>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {[
                { name: 'Instagram', icon: '📸', href: '#instagram' },
                { name: 'Twitter', icon: '🐦', href: '#twitter' },
                { name: 'Facebook', icon: '📘', href: '#facebook' }
              ].map((platform) => (
                <a
                  key={platform.name}
                  href={platform.href}
                  aria-label={platform.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FAF5EE',
                    border: '1px solid #ECE7DF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-dark)',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--brand-primary)';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FAF5EE';
                    e.currentTarget.style.color = 'var(--brand-dark)';
                    e.currentTarget.style.borderColor = '#ECE7DF';
                  }}
                >
                  {platform.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                color: 'var(--brand-dark)',
                marginBottom: '1.25rem'
              }}
            >
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Home', href: '/' },
                { label: 'Restaurants', href: '#restaurants' },
                { label: 'Categories', href: '#categories' },
                { label: 'Offers', href: '#offers' },
                { label: 'Orders', href: '/orders' }
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: '0.88rem',
                      color: '#78716C',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.target.style.color = 'var(--brand-primary)')}
                    onMouseLeave={(e) => (e.target.style.color = '#78716C')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Restaurants */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                color: 'var(--brand-dark)',
                marginBottom: '1.25rem'
              }}
            >
              For Restaurants
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Partner With Us', action: onOpenSellerPortal || (() => navigate('/seller/register')) },
                { label: 'Restaurant Login', action: () => navigate('/seller/login') },
                { label: 'Restaurant Dashboard', action: onOpenSellerPortal || (() => navigate('/seller/dashboard')) }
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.action}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      color: '#78716C',
                      textAlign: 'left',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.target.style.color = 'var(--brand-primary)')}
                    onMouseLeave={(e) => (e.target.style.color = '#78716C')}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                color: 'var(--brand-dark)',
                marginBottom: '1.25rem'
              }}
            >
              Support
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Help Center', href: '#help' },
                { label: 'Contact', href: '#contact' },
                { label: 'Terms', href: '#terms' },
                { label: 'Privacy', href: '#privacy' }
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    style={{
                      fontSize: '0.88rem',
                      color: '#78716C',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.target.style.color = 'var(--brand-primary)')}
                    onMouseLeave={(e) => (e.target.style.color = '#78716C')}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Clean Copyright */}
        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: '#A8A29E'
          }}
        >
          <div>
            © {new Date().getFullYear()} BIGBITES. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Local Food Delivery Marketplace</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 550px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
