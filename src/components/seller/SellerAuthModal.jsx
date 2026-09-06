import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SellerAuthModal({ isOpen, onClose, onOpenDashboard }) {
  const { signUpSeller, login } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(true);

  // Form Fields
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('DELHI');
  const [cuisine, setCuisine] = useState('North Indian · Tandoor · Thalis');
  const [openingHours, setOpeningHours] = useState('10:00 AM - 11:00 PM');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        if (!ownerName || !email || !password || !restaurantName || !address) {
          throw new Error('Please fill in all required restaurant details.');
        }
        await signUpSeller({
          ownerName,
          email,
          phone,
          password,
          restaurantName,
          address,
          city,
          cuisine,
          openingHours
        });
        onClose();
        if (onOpenDashboard) onOpenDashboard();
      } else {
        const usr = await login(email, password);
        if (usr.role !== 'seller' && usr.role !== 'admin') {
          throw new Error('This account is registered as a customer. Please log in with a Restaurant Partner account.');
        }
        onClose();
        if (onOpenDashboard) onOpenDashboard();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Restaurant partner authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 2600,
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
          boxShadow: '12px 12px 0px var(--black)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--black)',
            color: 'var(--yellow)',
            padding: '1.2rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 'var(--border-thick)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👨‍🍳</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>
                {isRegisterMode ? 'BECOME A RESTAURANT PARTNER' : 'RESTAURANT PARTNER LOGIN'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--cream)', opacity: 0.8 }}>
                BigBites Merchant Portal
              </p>
            </div>
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

        {/* Content Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            {errorMsg && (
              <div
                style={{
                  backgroundColor: '#F8D7DA',
                  color: '#721C24',
                  border: '1px solid #111',
                  padding: '0.8rem',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            {isRegisterMode ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                      OWNER NAME:
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Vikram Singh"
                      style={{ width: '100%', padding: '0.65rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                      PHONE NUMBER:
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 99887 76655"
                      style={{ width: '100%', padding: '0.65rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                    RESTAURANT NAME:
                  </label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. Royal Punjab Kitchen"
                    style={{ width: '100%', padding: '0.65rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                      EMAIL (MERCHANT LOGIN):
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seller@restaurant.com"
                      style={{ width: '100%', padding: '0.65rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
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
                      style={{ width: '100%', padding: '0.65rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                    RESTAURANT ADDRESS:
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Block B, Connaught Place, New Delhi 110001"
                    style={{ width: '100%', padding: '0.65rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                      CITY:
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                    >
                      <option value="DELHI">DELHI</option>
                      <option value="GURGAON">GURGAON</option>
                      <option value="NOIDA">NOIDA</option>
                      <option value="MUMBAI">MUMBAI</option>
                      <option value="LUCKNOW">LUCKNOW</option>
                      <option value="BENGALURU">BENGALURU</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                      OPENING HOURS:
                    </label>
                    <input
                      type="text"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      placeholder="10:00 AM - 11:00 PM"
                      style={{ width: '100%', padding: '0.65rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                    CUISINE TYPE:
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="North Indian · Tandoor · Biryani"
                    style={{ width: '100%', padding: '0.65rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>
                    MERCHANT EMAIL:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@bigbites.com"
                    style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)' }}
                  />
                </div>

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
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-editorial"
              style={{
                width: '100%',
                backgroundColor: 'var(--red)',
                color: 'var(--white)',
                padding: '0.9rem',
                fontSize: '0.95rem',
                marginTop: '0.5rem'
              }}
            >
              {isSubmitting
                ? 'CREATING MERCHANT ACCOUNT...'
                : isRegisterMode
                ? 'CREATE RESTAURANT PARTNER ACCOUNT →'
                : 'LOGIN TO RESTAURANT DASHBOARD →'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                style={{ background: 'none', border: 'none', color: 'var(--black)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isRegisterMode ? 'Already registered? Login to Dashboard' : 'New Restaurant Partner? Register here'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
