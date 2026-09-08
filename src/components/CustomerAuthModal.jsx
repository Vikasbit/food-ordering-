import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export default function CustomerAuthModal({ isOpen, onClose, initialMode = 'login', onSwitchToSeller }) {
  const { user, login, signUpCustomer, logout, resendVerificationEmail } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Resend Verification Cooldown State
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer effect for email resend
  useState(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleResendEmail = async () => {
    const targetEmail = pendingVerifyEmail || email.trim();
    if (!targetEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await resendVerificationEmail(targetEmail);
      setSuccessMsg(`Verification email resent to ${targetEmail}. Please check your inbox.`);
      setResendCooldown(60);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many requests')) {
        setErrorMsg('Too many email requests. Please wait a while before requesting another verification email.');
        setResendCooldown(60);
      } else {
        setErrorMsg(msg || 'Failed to resend verification email.');
      }
    } finally {
      setIsResending(false);
    }
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
        const res = await signUpCustomer({
          email: cleanEmail,
          password: cleanPassword,
          fullName: fullName.trim()
        });

        // If email confirmation is required, session will be null
        if (!res?.session && isSupabaseConfigured) {
          setPendingVerifyEmail(cleanEmail);
          setMode('verify');
          setResendCooldown(60);
          setSuccessMsg('Account created! A verification link has been sent to your email.');
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        setSuccessMsg(`Password reset link sent to ${cleanEmail}. Check your inbox!`);
      }
    } catch (err) {
      const rawMsg = err.message || '';
      if (err.code === 'EMAIL_NOT_CONFIRMED' || rawMsg.toLowerCase().includes('email not confirmed') || rawMsg.toLowerCase().includes('verify your email')) {
        setPendingVerifyEmail(cleanEmail);
        setMode('verify');
        setErrorMsg('Please verify your email before logging in.');
      } else if (rawMsg.toLowerCase().includes('invalid login credentials') || rawMsg.toLowerCase().includes('invalid email or password')) {
        setErrorMsg('Invalid email or password.');
      } else if (rawMsg.toLowerCase().includes('already registered') || rawMsg.toLowerCase().includes('already exists')) {
        setErrorMsg('An account with this email already exists. Please log in.');
      } else if (rawMsg.toLowerCase().includes('rate limit') || rawMsg.toLowerCase().includes('too many requests')) {
        setErrorMsg('Too many email requests. Please wait a while before requesting another verification email.');
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
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F5F0E8',
            flexShrink: 0
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
                boxShadow: '0 2px 8px rgba(200,69,35,0.12)',
                flexShrink: 0
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
                  : mode === 'verify'
                  ? 'Verify Email'
                  : 'Reset Password'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#78716C' }}>
                {user
                  ? 'Manage your customer profile'
                  : mode === 'login'
                  ? 'Sign in to order and track deliveries'
                  : mode === 'register'
                  ? 'Sign up to get fresh meals fast'
                  : mode === 'verify'
                  ? 'Confirm your email address to activate your account'
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
              transition: 'all 0.2s ease',
              flexShrink: 0
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
        <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto' }}>
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
          ) : mode === 'verify' ? (
            /* Dedicated Professional Email Verification Screen */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF7ED',
                  border: '2px solid #FFEDD5',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto',
                  boxShadow: '0 4px 14px rgba(200,69,35,0.15)'
                }}
              >
                ✉️
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--brand-dark)' }}>
                  Verify your email
                </h3>
                <p style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', color: '#78716C' }}>
                  We've sent a verification link to:
                </p>
                <div
                  style={{
                    backgroundColor: '#FAF5EE',
                    border: '1px solid #ECE7DF',
                    borderRadius: '10px',
                    padding: '0.6rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: 'var(--brand-dark)',
                    display: 'inline-block',
                    wordBreak: 'break-all'
                  }}
                >
                  {pendingVerifyEmail || email || 'your email address'}
                </div>
                <p style={{ margin: '0.8rem 0 0', fontSize: '0.85rem', color: '#78716C', lineHeight: 1.5 }}>
                  Please verify your email to activate your <strong>BIGBITES</strong> account and start placing orders.
                </p>
              </div>

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
                    textAlign: 'left'
                  }}
                >
                  ⚠️ {errorMsg}
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
                    textAlign: 'left'
                  }}
                >
                  ✅ {successMsg}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('Enter your credentials to log in once confirmed.');
                  }}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 700
                  }}
                >
                  I've verified my email → Log in
                </button>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0 || isResending}
                  style={{
                    width: '100%',
                    backgroundColor: resendCooldown > 0 || isResending ? '#F5F5F4' : '#FFFFFF',
                    color: resendCooldown > 0 || isResending ? '#A8A29E' : 'var(--brand-dark)',
                    border: '1px solid #ECE7DF',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: resendCooldown > 0 || isResending ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isResending
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : 'Resend verification email'}
                </button>

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
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.25rem'
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              {/* Modern Segmented Tab Switcher */}
              {mode !== 'forgot' && mode !== 'verify' && (
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
