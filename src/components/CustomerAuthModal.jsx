import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export default function CustomerAuthModal({ isOpen, onClose, initialMode = 'login', onSwitchToSeller }) {
  const { user, login, signUpCustomer, logout } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'login') {
      if (!cleanPassword) {
        setErrorMsg('Please enter your password.');
        return;
      }
    } else if (mode === 'register') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setErrorMsg('Please enter your full name (minimum 2 characters).');
        return;
      }
      if (!cleanPassword || cleanPassword.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setErrorMsg('Passwords do not match. Please verify.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(cleanEmail, cleanPassword);
        onClose();
      } else if (mode === 'register') {
        await signUpCustomer({
          email: cleanEmail,
          password: cleanPassword,
          fullName: fullName.trim()
        });
        onClose();
      } else if (mode === 'forgot') {
        setSuccessMsg(`Password reset link sent to ${cleanEmail}. Check your inbox!`);
      }
    } catch (err) {
      const rawMsg = err.message || '';
      if (rawMsg.toLowerCase().includes('invalid login credentials') || rawMsg.toLowerCase().includes('invalid email or password')) {
        setErrorMsg('Invalid email or password.');
      } else if (rawMsg.toLowerCase().includes('already registered') || rawMsg.toLowerCase().includes('already exists')) {
        setErrorMsg('An account with this email already exists. Please log in.');
      } else if (rawMsg.toLowerCase().includes('rate limit')) {
        setErrorMsg('Too many attempts. Please wait a moment before trying again.');
      } else if (rawMsg.toLowerCase().includes('fetch') || rawMsg.toLowerCase().includes('network')) {
        setErrorMsg('Unable to connect to the authentication service. Please try again.');
      } else {
        setErrorMsg(rawMsg || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #ECE7DF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '460px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 1.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F5F0E8'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 2px 8px rgba(200,69,35,0.12)'
              }}
            >
              👤
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--brand-dark)',
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '-0.02em'
                }}
              >
                {user
                  ? 'My Account'
                  : mode === 'login'
                  ? 'Welcome Back'
                  : mode === 'register'
                  ? 'Create Account'
                  : 'Reset Password'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#78716C' }}>
                {user
                  ? 'Manage your customer profile'
                  : mode === 'login'
                  ? 'Sign in to order and track deliveries'
                  : mode === 'register'
                  ? 'Sign up to get fresh meals fast'
                  : 'Enter your email for password reset'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#FAF5EE',
              border: '1px solid #ECE7DF',
              color: '#57534E',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E0D8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FAF5EE';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: '#FAF5EE',
                  border: '1px solid #ECE7DF',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(200,69,35,0.25)'
                  }}
                >
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-dark)' }}>
                      {user.full_name || 'Customer'}
                    </h4>
                    <span
                      style={{
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        border: '1px solid #BBF7D0'
                      }}
                    >
                      {user.role?.toUpperCase() || 'CUSTOMER'}
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#78716C', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </p>
                  {user.phone && (
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', color: '#A8A29E' }}>
                      📞 {user.phone}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  padding: '0.8rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEE2E2';
                  e.currentTarget.style.color = '#DC2626';
                }}
              >
                Sign Out of Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              {/* Modern Segmented Tab Switcher */}
              {mode !== 'forgot' && (
                <div
                  style={{
                    backgroundColor: '#F5F5F4',
                    padding: '4px',
                    borderRadius: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setConfirmPassword('');
                    }}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: mode === 'login' ? 700 : 500,
                      backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
                      color: mode === 'login' ? 'var(--brand-dark)' : '#78716C',
                      boxShadow: mode === 'login' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setConfirmPassword('');
                    }}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: mode === 'register' ? 700 : 500,
                      backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
                      color: mode === 'register' ? 'var(--brand-dark)' : '#78716C',
                      boxShadow: mode === 'register' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Register
                  </button>
                </div>
              )}

              {errorMsg && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    color: '#166534',
                    border: '1px solid #86EFAC',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>✅</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#57534E',
                      display: 'block',
                      marginBottom: '0.35rem',
                      letterSpacing: '0.02em'
                    }}
                  >
                    FULL NAME:
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rahul Sharma"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #E5E0D8',
                      backgroundColor: '#FAFAF9',
                      fontSize: '0.92rem',
                      color: 'var(--brand-dark)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#57534E',
                    display: 'block',
                    marginBottom: '0.35rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  EMAIL ADDRESS:
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@bigbites.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #E5E0D8',
                    backgroundColor: '#FAFAF9',
                    fontSize: '0.92rem',
                    color: 'var(--brand-dark)',
                    fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#57534E',
                        letterSpacing: '0.02em'
                      }}
                    >
                      PASSWORD:
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--brand-primary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #E5E0D8',
                      backgroundColor: '#FAFAF9',
                      fontSize: '0.92rem',
                      color: 'var(--brand-dark)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  />
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#57534E',
                      display: 'block',
                      marginBottom: '0.35rem',
                      letterSpacing: '0.02em'
                    }}
                  >
                    CONFIRM PASSWORD:
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #E5E0D8',
                      backgroundColor: '#FAFAF9',
                      fontSize: '0.92rem',
                      color: 'var(--brand-dark)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  backgroundColor: isSubmitting ? '#A8A29E' : 'var(--brand-primary)',
                  color: '#FFFFFF',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  marginTop: '0.4rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(200, 69, 35, 0.3)'
                }}
              >
                {isSubmitting
                  ? mode === 'login'
                    ? 'Logging in...'
                    : mode === 'register'
                    ? 'Creating account...'
                    : 'Sending link...'
                  : mode === 'login'
                  ? 'Sign In to BIGBITES →'
                  : mode === 'register'
                  ? 'Create Customer Account →'
                  : 'Send Reset Link →'}
              </button>

              {mode === 'forgot' && (
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}

              {/* Seller Partner link */}
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#FAF5EE',
                  border: '1px solid #EFEAE2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <span style={{ fontSize: '0.76rem', color: '#78716C', fontWeight: 600 }}>
                  Are you a restaurant owner?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSwitchToSeller) onSwitchToSeller();
                  }}
                  style={{
                    backgroundColor: 'var(--brand-dark)',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: '0.76rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Partner Portal →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
