import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute:
 * Enforces authentication and role-based access control.
 *
 * Props:
 *   allowedRoles: Array of string roles allowed (e.g. ['seller', 'admin'])
 *   children: ReactNode
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', color: '#78716C' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (allowedRoles?.includes('seller')) {
      return <Navigate to="/seller/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/" state={{ from: location, openAuth: true }} replace />;
  }

  // Role-based authorization check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || 'customer').toLowerCase();
    const hasRole = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

    if (!hasRole) {
      return (
        <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECE7DF', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-dark)', margin: '0 0 0.5rem' }}>
            Access Denied
          </h2>
          <p style={{ color: '#78716C', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            You do not have the required permissions ({allowedRoles.join(', ')}) to access this page. Your account role is <strong>{user.role}</strong>.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--brand-primary)',
              color: '#FFFFFF',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            Return to Homepage
          </a>
        </div>
      );
    }
  }

  return children;
}
