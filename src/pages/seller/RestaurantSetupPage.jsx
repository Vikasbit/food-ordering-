import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../lib/supabase';

export default function RestaurantSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Setup fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cuisine, setCuisine] = useState('');
  
  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [lat, setLat] = useState('28.6315');
  const [lng, setLng] = useState('77.2167');
  
  // Settings
  const [radius, setRadius] = useState('10');
  const [prepTime, setPrepTime] = useState('15');

  useEffect(() => {
    // Basic guard
    if (!user || user.role !== 'seller') {
      navigate('/seller/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real app we'd save to supabase here via marketplaceService.createRestaurant
      // The schema currently does not have a create method exposed in mock, we'll build it.
      
      const newRest = {
        seller_id: user.id,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        address: `${address}, ${city}, ${state} ${postalCode}`,
        city,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        cuisine,
        phone,
        status: 'DRAFT', // initial status
        delivery_radius_km: parseInt(radius, 10),
        prep_time_min: parseInt(prepTime, 10),
        opening_hours: JSON.stringify({
          monday: { open: '10:00', close: '22:00', closed: false },
          tuesday: { open: '10:00', close: '22:00', closed: false },
          wednesday: { open: '10:00', close: '22:00', closed: false },
          thursday: { open: '10:00', close: '22:00', closed: false },
          friday: { open: '10:00', close: '23:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '23:00', closed: false },
        })
      };

      await marketplaceService.createSellerRestaurant(newRest);
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--red)', margin: '0 0 0.5rem' }}>
        Set up your restaurant
      </h1>
      <p style={{ margin: '0 0 2rem', opacity: 0.8 }}>
        Welcome to BigBites Partner! Let's get your kitchen online. Your restaurant will remain in DRAFT status until you are ready to publish.
      </p>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', border: '1px solid #c62828', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Basic Info */}
        <section style={{ backgroundColor: 'var(--white)', padding: '2rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1.5rem', fontSize: '1.2rem' }}>1. BASIC INFORMATION</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>RESTAURANT NAME</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>DESCRIPTION</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)', resize: 'vertical' }}></textarea>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>PHONE</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>EMAIL</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>CUISINE TAGS (e.g., North Indian, Burgers)</label>
              <input type="text" required value={cuisine} onChange={e => setCuisine(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
            </div>
          </div>
        </section>

        {/* Location Info */}
        <section style={{ backgroundColor: 'var(--white)', padding: '2rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1.5rem', fontSize: '1.2rem' }}>2. LOCATION & RADIUS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>STREET ADDRESS</label>
              <input type="text" required value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>CITY</label>
                <input type="text" required value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>STATE</label>
                <input type="text" required value={state} onChange={e => setState(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>POSTAL CODE</label>
                <input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>LATITUDE (For delivery routing)</label>
                <input type="number" step="any" required value={lat} onChange={e => setLat(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>LONGITUDE (For delivery routing)</label>
                <input type="number" step="any" required value={lng} onChange={e => setLng(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>DELIVERY RADIUS (KM)</label>
                <input type="number" required value={radius} onChange={e => setRadius(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>AVG. PREPARATION TIME (MIN)</label>
                <input type="number" required value={prepTime} onChange={e => setPrepTime(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-editorial" 
          style={{ backgroundColor: 'var(--red)', color: 'var(--white)', padding: '1.2rem', fontSize: '1.2rem', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'SAVING...' : 'COMPLETE SETUP →'}
        </button>
      </form>
    </div>
  );
}
