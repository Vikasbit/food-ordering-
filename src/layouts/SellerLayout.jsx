import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomCursor from '../components/CustomCursor';

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not authenticated or not a seller/admin, we might want to redirect, 
  // but we will handle exact guards at the route/page level to avoid layout flash
  // Or we can do a simple check here:
  if (user && user.role === 'customer') {
    // Quick fallback guard
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
        <h2>UNAUTHORIZED ACCESS</h2>
        <p>You must be a registered seller to access this portal.</p>
        <button onClick={() => navigate('/')} className="btn-editorial">Return to Main Site</button>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', path: '/seller/dashboard', icon: '📊' },
    { id: 'restaurant', label: 'RESTAURANT', path: '/seller/restaurant', icon: '🏪' },
    { id: 'menu', label: 'MENU', path: '/seller/menu', icon: '🍔' },
    { id: 'orders', label: 'ORDERS', path: '/seller/orders', icon: '🛒' },
    { id: 'preview', label: 'PREVIEW', path: '/seller/preview', icon: '👁️' },
    { id: 'settings', label: 'SETTINGS', path: '/seller/settings', icon: '⚙️' }
  ];

  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="seller-layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--cream)', color: 'var(--black)' }}>
      <CustomCursor />
      
      {/* Mobile Top Header */}
      <header className="seller-mobile-header" style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'var(--black)',
        color: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 100,
        borderBottom: '1px solid #333'
      }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--red)' }}>
          BigBites<span style={{ fontSize: '0.75rem', color: '#FFF' }}>.PARTNER</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Seller Navigation"
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px'
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="seller-mobile-drawer"
          style={{
            position: 'fixed',
            inset: 0,
            top: '60px',
            backgroundColor: 'rgba(28, 25, 23, 0.98)',
            backdropFilter: 'blur(12px)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            gap: '0.5rem',
            overflowY: 'auto'
          }}
        >
          <p style={{ color: '#A8A29E', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
            Owner: {user?.full_name || user?.email || 'Seller'}
          </p>

          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.9rem 1.25rem',
                  background: isActive ? 'var(--yellow)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? 'var(--black)' : '#FFFFFF',
                  borderRadius: '12px',
                  border: 'none',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  minHeight: '48px'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #333' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                border: '1px solid #FCA5A5',
                borderRadius: '12px',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              LOGOUT
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '280px',
          backgroundColor: 'var(--black)',
          color: 'var(--cream)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: 'var(--border-thick)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50
        }}
        className="seller-sidebar"
      >
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--red)', cursor: 'pointer' }} onClick={() => navigate('/')}>
            BigBites<span style={{ fontSize: '1rem', color: 'var(--white)' }}>.PARTNER</span>
          </h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
            Owner: {user?.full_name || user?.email || 'Loading...'}
          </p>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 0' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.id} style={{ margin: '0.2rem 0' }}>
                  <button
                    onClick={() => handleNav(item.path)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '1rem 1.5rem',
                      background: isActive ? 'var(--yellow)' : 'transparent',
                      color: isActive ? 'var(--black)' : 'var(--cream)',
                      border: 'none',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #333' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.8rem',
              backgroundColor: 'transparent',
              color: 'var(--red)',
              border: '1px solid var(--red)',
              fontFamily: 'var(--font-display)',
              cursor: 'pointer'
            }}
          >
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="seller-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </main>

      {/* Media Queries */}
      <style>{`
        @media (max-width: 768px) {
          .seller-sidebar {
            display: none !important;
          }
          .seller-mobile-header {
            display: flex !important;
          }
          .seller-main-content {
            padding-top: 60px !important;
            height: calc(100vh - 60px) !important;
          }
          .seller-main-content > div {
            padding: 1.25rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
