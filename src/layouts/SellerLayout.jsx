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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--cream)', color: 'var(--black)' }}>
      <CustomCursor />
      
      {/* Mobile Header (Visible only on small screens) */}
      <div 
        style={{
          display: 'none', // Handled via media queries in a real app, here we use inline styles + window size in a broader setup, but for simplicity we'll use a flex layout trick. 
          // Actually, let's use standard CSS classes if we had Tailwind, but we don't.
        }}
      >
      </div>

      {/* Sidebar */}
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
            EATnaked<span style={{ fontSize: '1rem', color: 'var(--white)' }}>.PARTNER</span>
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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </main>

      {/* Simple Media Query style injection for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .seller-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
