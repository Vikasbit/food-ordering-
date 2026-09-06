import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../lib/supabase';
import LocationSelector from '../../components/LocationSelector';

export default function SellerRestaurantPage() {
  const { user } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(28.6315);
  const [lng, setLng] = useState(77.2167);
  const [radius, setRadius] = useState('10');
  const [prepTime, setPrepTime] = useState('15');
  const [status, setStatus] = useState('ACTIVE');
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadRestaurant();
    }
  }, [user]);

  const loadRestaurant = async () => {
    try {
      const rest = await marketplaceService.getSellerRestaurant(user.id);
      if (rest) {
        setRestaurant(rest);
        setName(rest.name || '');
        setDescription(rest.description || '');
        setPhone(rest.phone || '');
        setEmail(rest.email || '');
        setCuisine(rest.cuisine || '');
        setAddress(rest.address || '');
        setLat(rest.lat || 28.6315);
        setLng(rest.lng || 77.2167);
        setRadius(rest.delivery_radius_km?.toString() || '10');
        setPrepTime(rest.prep_time_min?.toString() || '15');
        setStatus(rest.status || 'ACTIVE');
      }
    } catch (err) {
      setError('Failed to load restaurant data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!restaurant) throw new Error('No restaurant found to update.');
      
      const updatedRest = await marketplaceService.updateSellerRestaurant(restaurant.id, {
        name,
        description,
        phone,
        email,
        cuisine,
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        delivery_radius_km: parseInt(radius, 10),
        prep_time_min: parseInt(prepTime, 10),
        status
      });
      
      setRestaurant(updatedRest);
      setSuccess('Restaurant details and coordinates saved to database successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update restaurant.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading restaurant data...</div>;
  }

  if (!restaurant) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>No restaurant profile found. Please complete setup first.</div>;
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: '840px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.4rem',
          color: 'var(--brand-dark)',
          margin: '0 0 0.5rem',
          fontWeight: 700
        }}
      >
        Restaurant Location & Profile
      </h1>
      <p style={{ color: '#78716C', fontSize: '0.92rem', marginBottom: '2rem' }}>
        Manage your kitchen address, delivery radius, GPS coordinates, and online status.
      </p>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '1rem', borderRadius: '12px', border: '1px solid #F87171', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div style={{ backgroundColor: '#F0FDF4', color: '#166534', padding: '1rem', borderRadius: '12px', border: '1px solid #86EFAC', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Status Section */}
        <section style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: '20px', border: '1px solid #ECE7DF', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 700 }}>
            Kitchen Status & Visibility
          </h2>
          <div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid #ECE7DF',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: '0.92rem',
                outline: 'none',
                backgroundColor: '#FAF5EE'
              }}
            >
              <option value="ACTIVE">🟢 ACTIVE (Accepting Customer Orders)</option>
              <option value="PAUSED">🔴 PAUSED (Temporarily Closed / Busy)</option>
              <option value="DRAFT">⚪ DRAFT (Hidden from Discovery)</option>
            </select>
          </div>
        </section>

        {/* General Information */}
        <section style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: '20px', border: '1px solid #ECE7DF', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 700 }}>
            General Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>RESTAURANT NAME</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.92rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>DESCRIPTION</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.92rem', resize: 'vertical' }}></textarea>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>PHONE</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.92rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>CUISINE</label>
                <input type="text" required value={cuisine} onChange={e => setCuisine(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.92rem' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Location & Delivery Setting with Map & Lat/Lng */}
        <section style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: '20px', border: '1px solid #ECE7DF', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              Restaurant Location & Coordinates
            </h2>
            <button
              type="button"
              onClick={() => setShowLocationModal(!showLocationModal)}
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showLocationModal ? 'Hide Map Selector' : '🗺️ Open Map Selector'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>FULL ADDRESS</label>
              <input type="text" required value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.92rem' }} />
            </div>

            {/* Latitude & Longitude Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>LATITUDE (GPS)</label>
                <input type="number" step="any" required value={lat} onChange={e => setLat(parseFloat(e.target.value))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.92rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>LONGITUDE (GPS)</label>
                <input type="number" step="any" required value={lng} onChange={e => setLng(parseFloat(e.target.value))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.92rem' }} />
              </div>
            </div>

            {/* Location Selector embedded */}
            {showLocationModal && (
              <div style={{ marginTop: '0.5rem', padding: '1.25rem', backgroundColor: '#FAF5EE', borderRadius: '16px', border: '1px solid #ECE7DF' }}>
                <LocationSelector
                  initialLocation={{ address, lat, lng }}
                  onLocationSelected={(loc) => {
                    setAddress(loc.formatted_address || loc.address);
                    setLat(loc.latitude || loc.lat);
                    setLng(loc.longitude || loc.lng);
                    setShowLocationModal(false);
                  }}
                  buttonLabel="Apply Selected Coordinates"
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>DELIVERY RADIUS (KM)</label>
                <input type="number" required value={radius} onChange={e => setRadius(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.92rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>PREPARATION TIME (MIN)</label>
                <input type="number" required value={prepTime} onChange={e => setPrepTime(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.92rem' }} />
              </div>
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={saving}
          className="btn-primary" 
          style={{ padding: '1rem', fontSize: '1.05rem', width: '100%' }}
        >
          {saving ? 'Saving Coordinates...' : 'Save Restaurant Details →'}
        </button>
      </form>
    </div>
  );
}
