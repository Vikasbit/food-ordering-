import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SellerLoginPage() {
  const { login, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address to resend the confirmation link.');
      return;
    }
    setIsResending(true);
    try {
      await resendConfirmationEmail(email);
      setSuccess(`Confirmation email resent to ${email}! Please check your inbox and spam folder.`);
      setIsEmailNotConfirmed(false);
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsEmailNotConfirmed(false);
    setLoading(true);
    
    try {
      const user = await login(email, password);
      if (user.role === 'customer') {
        throw new Error('This account is registered as a customer. Please use the customer login or register as a partner.');
      }
      navigate('/seller/dashboard');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      if (err.isEmailNotConfirmed || msg.toLowerCase().includes('email not confirmed')) {
        setIsEmailNotConfirmed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--cream)' }}>
      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--red)' }}>
            BigBites<span style={{ color: 'var(--black)' }}>.PARTNER</span>
          </h1>
          <p style={{ margin: '0 0 2rem', opacity: 0.8 }}>Log in to your seller dashboard.</p>
          
          {success && (
            <div style={{ backgroundColor: '#D4EDDA', color: '#155724', padding: '1rem', border: '1px solid #111', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
              ✅ {success}
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', border: '1px solid #c62828', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ fontWeight: 700, marginBottom: isEmailNotConfirmed ? '0.5rem' : 0 }}>
                ⚠️ {error}
              </div>
              {isEmailNotConfirmed && (
                <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed #c62828' }}>
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
                      cursor: 'pointer'
                    }}
                  >
                    {isResending ? 'RESENDING LINK...' : '✉️ RESEND VERIFICATION EMAIL'}
                  </button>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.35, color: '#333' }}>
                    <strong>Supabase Tip:</strong> In your Supabase Dashboard, go to <em>Authentication → Providers → Email</em> and toggle off <strong>Confirm email</strong>.
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }} 
              />
            </div>
            
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>PASSWORD</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-editorial" 
              style={{ backgroundColor: 'var(--black)', color: 'var(--cream)', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'LOGGING IN...' : 'LOGIN TO DASHBOARD →'}
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
            Don't have a partner account? <button onClick={() => navigate('/seller/register')} style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Register here</button>
          </p>
          <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>← Back to main site</button>
          </p>
        </div>
      </div>
      <div style={{ flex: 1, backgroundColor: 'var(--yellow)', backgroundImage: 'url(/assets/indian-chef-kitchen.png)', backgroundSize: 'cover', backgroundPosition: 'center', borderLeft: 'var(--border-thick)', display: 'none' }} className="desktop-only"></div>
      
      <style>{`
        @media (min-width: 768px) {
          .desktop-only { display: block !important; }
        }
      `}</style>
    </div>
  );
}
