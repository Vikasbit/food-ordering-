import { useState, useEffect } from 'react';

export default function Navbar({ onOpenCart, cartCount, onOpenOrders, deliveryLocation, onOpenLocationPicker, onOpenAuth, onOpenSellerPortal, currentUser }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: scrolled ? 'var(--cream)' : 'transparent',
          borderBottom: scrolled ? 'var(--border-thick)' : 'none',
          transition: 'all 0.3s ease',
          padding: scrolled ? '0.8rem 2rem' : '1.5rem 2rem'
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* LEFT: EATnaked Logo */}
          <a
            href="#hero"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              color: 'var(--red)',
              textDecoration: 'none',
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            data-cursor="HOME"
          >
            <span>EATnaked</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--black)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>.IN</span>
          </a>

          {/* CENTER: Navigation Links (Desktop) */}
          <nav
            className="desktop-nav"
            style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center'
            }}
          >
            {['Menu', 'Our Food', 'Our Story', 'Locations'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  color: 'var(--black)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--red)')}
                onMouseLeave={(e) => (e.target.style.color = 'var(--black)')}
                data-cursor="GO"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* RIGHT: Location + Seller Portal + Orders + Auth + Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
            <button
              onClick={onOpenLocationPicker}
              className="btn-editorial-outline"
              style={{
                padding: '0.45rem 0.8rem',
                fontSize: '0.75rem',
                backgroundColor: 'var(--white)',
                color: 'var(--black)',
                borderColor: 'var(--black)',
                boxShadow: '2px 2px 0px var(--black)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              <span>📍</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {deliveryLocation?.label ? `${deliveryLocation.label}: ` : ''}{deliveryLocation?.address?.split(',')[0] || 'Connaught Place'}
              </span>
            </button>

            <button
              onClick={onOpenSellerPortal}
              style={{
                padding: '0.45rem 0.75rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                backgroundColor: 'var(--black)',
                color: 'var(--yellow)',
                border: 'var(--border-thick)',
                boxShadow: '2px 2px 0px var(--red)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              👨‍🍳 SELLER
            </button>

            <button
              onClick={onOpenAuth}
              style={{
                padding: '0.45rem 0.75rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                backgroundColor: 'var(--white)',
                color: 'var(--black)',
                border: 'var(--border-thick)',
                boxShadow: '2px 2px 0px var(--black)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              👤 {currentUser ? (currentUser.full_name?.split(' ')[0] || 'ACCOUNT') : 'LOGIN'}
            </button>

            <button
              onClick={onOpenOrders}
              className="btn-editorial-outline"
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.75rem',
                backgroundColor: 'var(--yellow)',
                color: 'var(--black)',
                borderColor: 'var(--black)',
                boxShadow: '2px 2px 0px var(--black)',
                whiteSpace: 'nowrap'
              }}
            >
              📜 ORDERS
            </button>

            <button
              onClick={onOpenCart}
              className="btn-editorial"
              style={{
                padding: '0.6rem 1.4rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
              data-cursor="CART"
            >
              <span>ORDER NOW</span>
              <span
                style={{
                  backgroundColor: 'var(--black)',
                  color: 'var(--cream)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900
                }}
              >
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-toggle"
              style={{
                display: 'none',
                background: 'var(--black)',
                color: 'var(--cream)',
                border: 'none',
                padding: '0.6rem 1rem',
                fontFamily: 'var(--font-display)',
                cursor: 'pointer'
              }}
            >
              {mobileOpen ? 'CLOSE' : 'MENU'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--red)',
            color: 'var(--cream)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            padding: '2rem'
          }}
        >
          {['Menu', 'Our Food', 'Our Story', 'Locations'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3rem',
                color: 'var(--cream)',
                textDecoration: 'none',
                textTransform: 'uppercase'
              }}
            >
              {item}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              onOpenCart();
            }}
            className="btn-editorial"
            style={{
              backgroundColor: 'var(--black)',
              color: 'var(--cream)',
              marginTop: '1rem',
              fontSize: '1.2rem'
            }}
          >
            ORDER NOW ({cartCount}) →
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
