import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../lib/supabase';

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
  const [radius, setRadius] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [status, setStatus] = useState('DRAFT');

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
        setEmail(rest.email || ''); // Assuming email might be stored if we added it
        setCuisine(rest.cuisine || '');
        setAddress(rest.address || '');
        setRadius(rest.delivery_radius_km?.toString() || '12');
        setPrepTime(rest.prep_time_min?.toString() || '15');
        setStatus(rest.status || 'DRAFT');
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
        delivery_radius_km: parseInt(radius, 10),
        prep_time_min: parseInt(prepTime, 10),
        status
      });
      
      setRestaurant(updatedRest);
      setSuccess('Restaurant details updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update restaurant.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading restaurant data...</div>;
  }

  if (!restaurant) {
    return <div style={{ padding: '2rem' }}>No restaurant profile found. Please complete setup first.</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--red)', margin: '0 0 1.5rem' }}>
        RESTAURANT PROFILE
      </h1>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', border: '1px solid #c62828', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '1rem', border: '1px solid #2e7d32', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Status Section */}
        <section style={{ backgroundColor: 'var(--white)', padding: '2rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1rem', fontSize: '1.2rem' }}>VISIBILITY & STATUS</h2>
          <div>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
              <option value="DRAFT">DRAFT (Hidden from customers)</option>
              <option value="ACTIVE">🟢 ACTIVE (Accepting Orders)</option>
              <option value="PAUSED">🔴 PAUSED (Temporarily Closed)</option>
            </select>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#666' }}>Note: DRAFT status hides your restaurant entirely. PAUSED means it is visible but cannot accept orders.</p>
          </div>
        </section>

        {/* Info Section */}
        <section style={{ backgroundColor: 'var(--white)', padding: '2rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1.5rem', fontSize: '1.2rem' }}>GENERAL INFORMATION</h2>
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
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>CUISINE</label>
                <input type="text" required value={cuisine} onChange={e => setCuisine(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section style={{ backgroundColor: 'var(--white)', padding: '2rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1.5rem', fontSize: '1.2rem' }}>LOCATION & DELIVERY</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>FULL ADDRESS</label>
              <input type="text" required value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>DELIVERY RADIUS (KM)</label>
                <input type="number" required value={radius} onChange={e => setRadius(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>PREPARATION TIME (MIN)</label>
                <input type="number" required value={prepTime} onChange={e => setPrepTime(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: 'var(--border-thick)' }} />
              </div>
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={saving}
          className="btn-editorial" 
          style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)', padding: '1.2rem', fontSize: '1.1rem', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'SAVING CHANGES...' : 'SAVE CHANGES →'}
        </button>
      </form>
    </div>
  );
}
