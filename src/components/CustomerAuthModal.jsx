import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export default function CustomerAuthModal({ isOpen, onClose, initialMode = 'login', onSwitchToSeller }) {
  const { user, login, signUpCustomer, logout, resendConfirmationEmail } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!isOpen) return null;

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMsg('Please enter your email above to resend the verification link.');
      return;
    }
    setIsResending(true);
    try {
      await resendConfirmationEmail(email);
      setSuccessMsg(`Verification email resent to ${email}! Please check your inbox and spam folder.`);
      setIsEmailNotConfirmed(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend confirmation email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsEmailNotConfirmed(false);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please fill in all required fields.');
        }
        const res = await signUpCustomer({ email, password, fullName, phone });
        if (isSupabaseConfigured && (!res || !res.session)) {
          setSuccessMsg('Account registered! Please check your email inbox to confirm your account, then log in.');
          setMode('login');
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        setSuccessMsg(`Password reset link sent to ${email}. Check your inbox!`);
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed.';
      setErrorMsg(msg);
      if (err.isEmailNotConfirmed || msg.toLowerCase().includes('email not confirmed')) {
        setIsEmailNotConfirmed(true);
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
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--cream)',
          border: 'var(--border-thick)',
          boxShadow: '10px 10px 0px var(--black)',
          width: '100%',
          maxWidth: '460px',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--black)',
            color: 'var(--cream)',
            padding: '1.2rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 'var(--border-thick)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.4rem' }}>👤</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--yellow)', fontFamily: 'var(--font-display)' }}>
              {user
                ? 'MY ACCOUNT'
                : mode === 'login'
                ? 'CUSTOMER LOGIN'
                : mode === 'register'
                ? 'CREATE ACCOUNT'
                : 'RESET PASSWORD'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--cream)',
              fontSize: '1.5rem',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          {user ? (
            <div>
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  border: 'var(--border-thick)',
                  boxShadow: '3px 3px 0px var(--black)',
                  padding: '1.2rem',
                  marginBottom: '1.5rem'
                }}
              >
                <h4 style={{ margin: '0 0 0.4rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  {user.full_name || 'Customer Profile'}
                </h4>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.85rem' }}>📧 {user.email}</p>
                {user.phone && <p style={{ margin: 0, fontSize: '0.85rem' }}>📞 {user.phone}</p>}
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.8rem',
                    backgroundColor: 'var(--yellow)',
                    color: 'var(--black)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.6rem',
                    border: '1px solid #111'
                  }}
                >
                  ROLE: {user.role?.toUpperCase()}
                </span>
              </div>

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="btn-editorial"
                style={{ width: '100%', backgroundColor: 'var(--red)', color: 'var(--white)', padding: '0.8rem' }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              {errorMsg && (
                <div
                  style={{
                    backgroundColor: '#F8D7DA',
                    color: '#721C24',
                    border: '1px solid #111',
                    padding: '0.8rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: isEmailNotConfirmed ? '0.5rem' : 0 }}>
                    ⚠️ {errorMsg}
                  </div>
                  {isEmailNotConfirmed && (
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed #721C24' }}>
                      <button
                        type="button"
                        disabled={isResending}
                        onClick={handleResendConfirmation}
                        className="btn-editorial"
                        style={{
                          backgroundColor: 'var(--black)',
                          color: 'var(--cream)',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-block'
                        }}
                      >
                        {isResending ? 'RESENDING LINK...' : '✉️ RESEND VERIFICATION EMAIL'}
                      </button>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.35 }}>
                        <strong>Supabase Tip:</strong> In your Supabase Dashboard, go to <em>Authentication → Providers → Email</em> and turn off <strong>Confirm email</strong> for instant test logins without needing email clicks.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {successMsg && (
                <div
                  style={{
                    backgroundColor: '#D4EDDA',
                    color: '#155724',
                    border: '1px solid #111',
                    padding: '0.8rem',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  ✅ {successMsg}
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                    FULL NAME:
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rahul Sharma"
                    style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                  EMAIL ADDRESS:
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@bigbites.com"
                  style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                    MOBILE PHONE:
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                    PASSWORD:
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-editorial"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--black)',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  marginTop: '0.5rem'
                }}
              >
                {isSubmitting
                  ? 'PROCESSING...'
                  : mode === 'login'
                  ? 'LOGIN TO BIGBITES →'
                  : mode === 'register'
                  ? 'REGISTER CUSTOMER ACCOUNT →'
                  : 'SEND RESET LINK →'}
              </button>

              {/* Mode Switchers */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontSize: '0.8rem' }}>
                {mode === 'login' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 800, cursor: 'pointer' }}
                    >
                      New user? Register
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}
                    >
                      Forgot password?
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Back to Login
                  </button>
                )}
              </div>

              {/* Seller Partner link */}
              <div
                style={{
                  marginTop: '1.2rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #ccc',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.4rem' }}>
                  ARE YOU A RESTAURANT OWNER?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSwitchToSeller) onSwitchToSeller();
                  }}
                  style={{
                    backgroundColor: 'var(--black)',
                    color: 'var(--yellow)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.8rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  👨‍🍳 BECOME A RESTAURANT PARTNER →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
