import { useState, useEffect } from 'react';

export default function Navbar({
  onOpenCart,
  cartCount = 0,
  onOpenOrders,
  deliveryLocation,
  onOpenLocationPicker,
  onOpenAuth,
  onOpenSellerPortal,
  currentUser,
  onOpenSearch
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
          backgroundColor: scrolled ? 'rgba(251, 249, 245, 0.96)' : 'rgba(251, 249, 245, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid #ECE7DF' : '1px solid transparent',
          transition: 'all 0.3s ease',
          padding: scrolled ? '0.75rem 2rem' : '1.1rem 2rem'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          {/* Brand Logo - BIGBITES */}
          <a
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              lineHeight: 1
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.85rem',
                fontWeight: 800,
                color: 'var(--brand-dark)',
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'baseline'
              }}
            >
              BIG<span style={{ color: 'var(--brand-primary)' }}>BITES</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', marginLeft: '3px', display: 'inline-block' }}></span>
            </span>
          </a>

          {/* Center Links (Desktop) */}
          <nav
            className="navbar-desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.2rem'
            }}
          >
            {[
              { label: 'Home', href: '#' },
              { label: 'Restaurants', href: '#restaurants' },
              { label: 'Categories', href: '#categories' },
              { label: 'Offers', href: '#offers' }
            ].map((link, idx) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.92rem',
                  fontWeight: idx === 0 ? 700 : 500,
                  color: idx === 0 ? 'var(--brand-primary)' : 'var(--brand-dark)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--brand-primary)')}
                onMouseLeave={(e) => (e.target.style.color = idx === 0 ? 'var(--brand-primary)' : 'var(--brand-dark)')}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}
          >
            {/* Functional Location Selector */}
            <button
              type="button"
              onClick={onOpenLocationPicker}
              className="delivery-pill-btn"
              title={`Delivery: ${deliveryLocation?.address || 'Click to set location'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E0D8',
                fontSize: '0.82rem',
                color: 'var(--brand-dark)',
                cursor: 'pointer',
                maxWidth: '220px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.backgroundColor = '#FFFBF7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E0D8';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <span style={{ color: 'var(--brand-primary)', fontSize: '0.95rem' }}>📍</span>
              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {deliveryLocation?.address ? deliveryLocation.address.split(',')[0] : 'Connaught Place'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#78716C', marginLeft: '2px' }}>▼</span>
            </button>

            {/* Search Icon */}
            <button
              type="button"
              onClick={onOpenSearch || (() => {
                const searchEl = document.getElementById('search-input') || document.getElementById('menu');
                if (searchEl) searchEl.scrollIntoView({ behavior: 'smooth' });
              })}
              title="Search menu"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--brand-dark)',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brand-dark)')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenAuth}
                title={`Signed in as ${currentUser.full_name || currentUser.email || 'User'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '9999px',
                  padding: '0.3rem 0.75rem 0.3rem 0.35rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFEDD5';
                  e.currentTarget.style.borderColor = '#FED7AA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF7ED';
                  e.currentTarget.style.borderColor = '#FFEDD5';
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}
                >
                  {currentUser.full_name ? currentUser.full_name[0].toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-dark)' }}>
                  {currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Account'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                title="Sign In"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E0D8',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  color: 'var(--brand-dark)',
                  padding: '0.4rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.color = 'var(--brand-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E0D8';
                  e.currentTarget.style.color = 'var(--brand-dark)';
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Icon with Counter Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              title="View Cart"
              style={{
                position: 'relative',
                background: '#FFFFFF',
                border: '1px solid #E5E0D8',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                color: 'var(--brand-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.color = 'var(--brand-primary)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E0D8';
                e.currentTarget.style.color = 'var(--brand-dark)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(200,69,35,0.4)',
                    border: '1.5px solid #FFFFFF'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Order Now Pill Button */}
            <a
              href="#menu"
              className="btn-primary navbar-order-btn"
              style={{
                padding: '0.6rem 1.4rem',
                fontSize: '0.88rem'
              }}
            >
              Order Now
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="navbar-mobile-toggle"
              aria-label="Toggle Navigation Menu"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: 'var(--brand-dark)',
                padding: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: '64px',
            backgroundColor: 'rgba(251, 249, 245, 0.98)',
            backdropFilter: 'blur(16px)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
            gap: '1.5rem',
            borderTop: '1px solid #ECE7DF'
          }}
        >
          {[
            { label: 'Home', href: '#' },
            { label: 'Restaurants', href: '#restaurants' },
            { label: 'Categories', href: '#categories' },
            { label: 'Offers', href: '#offers' }
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                color: 'var(--brand-dark)',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              {item.label}
            </a>
          ))}

          <div style={{ height: '1px', backgroundColor: '#ECE7DF', margin: '0.5rem 0' }} />

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenLocationPicker();
            }}
            className="btn-outline"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            📍 {deliveryLocation?.address ? deliveryLocation.address.split(',')[0] : 'Set Delivery Location'}
          </button>

          {onOpenOrders && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenOrders();
              }}
              className="btn-outline"
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              📜 Order History & Tracking
            </button>
          )}

          {onOpenSellerPortal && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenSellerPortal();
              }}
              className="btn-outline"
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              🏪 Restaurant Partner Portal
            </button>
          )}

          <a
            href="#menu"
            onClick={() => setMobileOpen(false)}
            className="btn-primary"
            style={{ width: '100%', textAlign: 'center', marginTop: 'auto' }}
          >
            Order Now ({cartCount})
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .navbar-desktop-nav {
            display: none !important;
          }
          .navbar-mobile-toggle {
            display: block !important;
          }
          .delivery-pill-btn {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .navbar-order-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
