import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function SellerRegisterPage() {
  const { signUpSeller } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      const res = await signUpSeller({ fullName: name, email, phone, password });
      if (isSupabaseConfigured && (!res || !res.session)) {
        setError('');
        alert('Registration successful! Please check your email to confirm your account before logging in to your Restaurant Partner account.');
        navigate('/seller/login');
        return;
      }
      // Redirect to initial setup page after registration
      navigate('/seller/restaurant/setup');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--cream)' }}>
      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--red)' }}>
            Partner with BigBites
          </h1>
          <p style={{ margin: '0 0 2rem', opacity: 0.8 }}>Grow your restaurant with BigBites.</p>
          
          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', border: '1px solid #c62828', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>OWNER NAME</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }} 
              />
            </div>
            
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
              <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>PHONE NUMBER</label>
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>CONFIRM</label>
                <input 
                  type="password" 
                  required 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-editorial" 
              style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'BECOME A PARTNER →'}
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
            Already a partner? <button onClick={() => navigate('/seller/login')} style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Login here</button>
          </p>
          <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>← Back to main site</button>
          </p>
        </div>
      </div>
      <div style={{ flex: 1, backgroundColor: 'var(--red)', backgroundImage: 'url(/assets/meal-chicken.png)', backgroundSize: 'cover', backgroundPosition: 'center', borderLeft: 'var(--border-thick)', display: 'none' }} className="desktop-only"></div>
      
      <style>{`
        @media (min-width: 768px) {
          .desktop-only { display: block !important; }
        }
      `}</style>
    </div>
  );
}
