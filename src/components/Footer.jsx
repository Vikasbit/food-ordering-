export default function Footer({ onOpenSellerPortal }) {
  return (
    <footer
      style={{
        backgroundColor: 'var(--black)',
        color: 'var(--cream)',
        paddingTop: '5rem',
        paddingBottom: '3rem'
      }}
    >
      <div className="container-editorial">
        {/* Top Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3rem', paddingBottom: '4rem', borderBottom: '1px solid #333' }}>
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 5' }} className="footer-col">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--red)', marginBottom: '1rem' }}>
              EATnaked.
            </h3>
            <p style={{ fontSize: '1.05rem', color: '#ccc', maxWidth: '360px', fontWeight: 500, lineHeight: 1.5, marginBottom: '2rem' }}>
              Authentic Indian regional home recipes, crafted fresh with bold spices and uncompromised attitude.
            </p>
            <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 600 }}>
              © 2026 EATNAKED RESTAURANTS GROUP INC. ALL RIGHTS RESERVED.
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ gridColumn: 'span 3' }} className="footer-col">
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--yellow)', marginBottom: '1.5rem' }}>
              NAVIGATION
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem' }}>
              {['Home', 'Menu', 'Our Food', 'Locations', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} style={{ color: 'var(--cream)', textDecoration: 'none' }}>
                    • {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div style={{ gridColumn: 'span 4' }} className="footer-col">
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--yellow)', marginBottom: '1.5rem' }}>
              VIP KITCHEN CLUB
            </h4>
            <p style={{ fontSize: '0.95rem', color: '#ccc', marginBottom: '1.2rem' }}>
              Subscribe for secret pop-up menus, chef recipes, and exclusive drops.
            </p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                required
                style={{
                  flex: 1,
                  padding: '0.8rem 1rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  border: '2px solid var(--cream)',
                  backgroundColor: 'transparent',
                  color: 'var(--cream)'
                }}
              />
              <button
                type="submit"
                style={{
                  fontFamily: 'var(--font-display)',
                  backgroundColor: 'var(--red)',
                  color: 'var(--white)',
                  border: '2px solid var(--red)',
                  padding: '0.8rem 1.2rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                JOIN →
              </button>
            </form>
          </div>
        </div>

        {/* RESTAURANT PARTNER / SELLER FOOTER BANNER */}
        <div
          style={{
            marginTop: '3rem',
            padding: '2rem',
            backgroundColor: '#181818',
            border: '2px solid var(--yellow)',
            boxShadow: '6px 6px 0px var(--red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.2rem'
          }}
        >
          <div>
            <span style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)', fontFamily: 'var(--font-display)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'inline-block', marginBottom: '0.4rem' }}>
              👨‍🍳 RESTAURANT PARTNER MARKETPLACE
            </span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--cream)' }}>
              OWN A RESTAURANT OR CLOUD KITCHEN?
            </h3>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: '#bbb' }}>
              Register your restaurant on EATnaked to manage your menu, set prices, and receive live customer orders.
            </p>
          </div>
          <button
            onClick={onOpenSellerPortal}
            className="btn-editorial"
            style={{
              backgroundColor: 'var(--yellow)',
              color: 'var(--black)',
              padding: '0.9rem 1.8rem',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            BECOME A RESTAURANT PARTNER / MERCHANT LOGIN →
          </button>
        </div>

        {/* Bottom Giant Brand Banner */}
        <div style={{ paddingTop: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 16vw, 18rem)', color: '#1f1f1f', margin: 0, lineHeight: 0.8, letterSpacing: '-0.05em' }}>
            EATNAKED
          </h2>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-col {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </footer>
  );
}
