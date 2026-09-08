import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketplaceService } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import GoogleMapsView from '../components/GoogleMapsView';
import { getGoogleMapsDirectionsUrl } from '../services/googleMapsLoader';
import { formatINR } from '../utils/currency';

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleAddToCartFromRestaurant, deliveryLocation } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await marketplaceService.getRestaurantById(id);
        if (data) {
          setRestaurant(data);
        }
      } catch (err) {
        console.error('Failed to load restaurant', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--cream)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>LOADING KITCHEN...</h2>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--cream)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--red)' }}>
          RESTAURANT NOT FOUND
        </h2>
        <button
          onClick={() => navigate('/')}
          className="btn-editorial"
          style={{ marginTop: '1rem', backgroundColor: 'var(--black)', color: '#FFF' }}
        >
          ← BACK TO HOME
        </button>
      </div>
    );
  }

  const directionsUrl = getGoogleMapsDirectionsUrl(
    restaurant.lat || restaurant.latitude,
    restaurant.lng || restaurant.longitude,
    `${restaurant.name}, ${restaurant.address}`
  );

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* Restaurant Hero Banner */}
      <div
        style={{
          position: 'relative',
          height: '320px',
          backgroundColor: '#111',
          overflow: 'hidden',
          borderBottom: 'var(--border-thick)'
        }}
      >
        <img
          src={restaurant.cover_url || '/assets/butter-chicken-real.png'}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 'clamp(1.2rem, 3.5vw, 2.5rem)'
          }}
        >
          <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', color: '#FFF' }}>
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: 'var(--yellow)', color: '#111', fontSize: '0.75rem', fontWeight: 900, padding: '0.2rem 0.6rem', fontFamily: 'var(--font-display)' }}>
                ⭐ {restaurant.rating || 4.8} ({restaurant.reviews_count || 140}+ REVIEWS)
              </span>
              <span style={{ backgroundColor: 'var(--green)', color: '#FFF', fontSize: '0.75rem', fontWeight: 900, padding: '0.2rem 0.6rem', fontFamily: 'var(--font-display)' }}>
                ● OPEN NOW
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', margin: '0.2rem 0', color: '#FFF', lineHeight: 1.1 }}>
              {restaurant.name}
            </h1>

            <p style={{ margin: '0.4rem 0 1rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)', opacity: 0.9 }}>
              📍 {restaurant.address} · {restaurant.cuisine}
            </p>

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="btn-editorial"
                style={{
                  backgroundColor: 'var(--yellow)',
                  color: '#111',
                  padding: '0.55rem 1rem',
                  fontSize: '0.85rem',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                🗺️ VIEW LOCATION ON MAP
              </button>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-outline"
                style={{
                  backgroundColor: 'transparent',
                  color: '#FFF',
                  borderColor: '#FFF',
                  padding: '0.55rem 1rem',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                📍 GET DIRECTIONS ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Section */}
      <div style={{ maxWidth: '1200px', margin: 'clamp(1.5rem, 3vw, 3rem) auto', padding: '0 clamp(0.85rem, 3vw, 1.5rem)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', marginBottom: '1.5rem', borderBottom: '3px solid var(--black)', paddingBottom: '0.5rem' }}>
          OUR KITCHEN MENU
        </h2>

        {restaurant.categories && restaurant.categories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.8rem, 3.5vw, 3rem)' }}>
            {restaurant.categories.map((cat) => (
              <div key={cat.id}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: 'var(--red)', marginBottom: '1rem' }}>
                  {cat.name}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
                  {cat.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#FFF',
                        border: 'var(--border-thick)',
                        boxShadow: '4px 4px 0px var(--black)',
                        padding: '1.2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: item.is_veg ? 'var(--green)' : 'var(--red)' }}>
                            {item.is_veg ? '🟢 VEG' : '🔴 NON-VEG'}
                          </span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 900 }}>
                            {formatINR(item.price)}
                          </span>
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: '0.4rem 0' }}>
                          {item.name}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.3, marginBottom: '1rem' }}>
                          {item.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCartFromRestaurant(item, restaurant)}
                        className="btn-editorial"
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--red)',
                          color: '#FFF',
                          padding: '0.65rem',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          minHeight: '44px'
                        }}
                      >
                        + ADD TO BAG
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '1.1rem', color: '#666' }}>Fresh daily specialties are being prepared in the kitchen.</p>
        )}
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--cream)',
              border: 'var(--border-thick)',
              padding: 'clamp(1rem, 3vw, 2rem)',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '8px 8px 0px var(--black)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', margin: 0 }}>
                📍 {restaurant.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 900, minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close location modal"
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#444' }}>
              {restaurant.address} · Phone: {restaurant.phone}
            </p>

            <div style={{ height: 'min(300px, 40vh)', border: '2.5px solid var(--black)', marginBottom: '1.2rem', minHeight: '200px' }}>
              <GoogleMapsView
                kitchenLocation={{
                  lat: restaurant.lat || restaurant.latitude || 28.6315,
                  lng: restaurant.lng || restaurant.longitude || 77.2167,
                  name: restaurant.name
                }}
                customerLocation={deliveryLocation}
                showRoute={false}
                interactive={true}
                height="100%"
                minHeight="200px"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', flexWrap: 'wrap' }}>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial"
                style={{ backgroundColor: 'var(--yellow)', color: '#111', padding: '0.6rem 1.2rem', textDecoration: 'none', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                OPEN IN GOOGLE MAPS ↗
              </a>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="btn-editorial"
                style={{ backgroundColor: 'var(--black)', color: '#FFF', padding: '0.6rem 1.2rem', minHeight: '44px' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
