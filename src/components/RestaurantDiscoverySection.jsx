import { useState, useEffect } from 'react';
import RestaurantMap from './RestaurantMap';
import ImageWithFallback from './ImageWithFallback';
import { useCart } from '../context/CartContext';

export default function RestaurantDiscoverySection({
  restaurants = [],
  deliveryLocation,
  onOpenRestaurant,
  onOpenLocationPicker
}) {
  const { setDeliveryLocation, openLocationModal } = useCart();
  const handleOpenPicker = onOpenLocationPicker || openLocationModal;

  const [activeRestId, setActiveRestId] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'map'
  const [favorites, setFavorites] = useState({});
  const [filterCuisine, setFilterCuisine] = useState('all');

  // Reset active restaurant when delivery location changes
  useEffect(() => {
    setActiveRestId(null);
  }, [deliveryLocation?.lat, deliveryLocation?.lng, deliveryLocation?.latitude, deliveryLocation?.longitude]);

  const toggleFavorite = (e, restId) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [restId]: !prev[restId] }));
  };

  const areaName = deliveryLocation?.address ? deliveryLocation.address.split(',')[0].trim() : 'your area';

  // Filter restaurants if cuisine selected
  const displayedRestaurants = restaurants.filter((r) => {
    if (filterCuisine === 'all') return true;
    if (filterCuisine === 'rating') return (r.rating || 4.5) >= 4.5;
    if (filterCuisine === 'fast') return (r.prep_time_min || 25) <= 25;
    return r.cuisine?.toLowerCase().includes(filterCuisine.toLowerCase());
  });

  return (
    <section
      id="restaurants"
      style={{
        backgroundColor: 'var(--bg-main)',
        paddingTop: '3rem',
        paddingBottom: '4rem',
        borderTop: '1px solid #ECE7DF'
      }}
    >
      <div className="container-clean">
        {/* Section Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Local Food Marketplace
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2
                style={{
                  fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)',
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--brand-dark)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  fontWeight: 700
                }}
              >
                Top restaurants near <span style={{ color: 'var(--brand-primary)' }}>{areaName}</span>
              </h2>
              <p style={{ margin: '0.4rem 0 0', color: '#78716C', fontSize: '0.92rem' }}>
                Handpicked cloud kitchens and local favourites serving fresh meals to your doorstep
              </p>
            </div>

            {/* Quick Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Places' },
                { id: 'rating', label: '★ 4.5+ Rating' },
                { id: 'fast', label: '⚡ Fast Prep' },
                { id: 'north indian', label: 'North Indian' },
                { id: 'biryani', label: 'Biryani' },
                { id: 'pizza', label: 'Pizza' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterCuisine(f.id)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: filterCuisine === f.id ? '1px solid var(--brand-primary)' : '1px solid #E5E0D8',
                    backgroundColor: filterCuisine === f.id ? '#FFF7ED' : '#FFFFFF',
                    color: filterCuisine === f.id ? 'var(--brand-primary)' : '#57534E'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div
          className="mobile-view-toggle"
          style={{
            display: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            padding: '0.6rem 1rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #ECE7DF'
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-dark)' }}>
            {displayedRestaurants.length} Restaurants found
          </span>
          <button
            type="button"
            onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--brand-primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {mobileView === 'list' ? '🗺️ View Map' : '📋 View Cards'}
          </button>
        </div>

        {/* Split Grid Layout: Restaurant Cards / Empty State (Left) + Interactive Map (Right) */}
        <div
          className="discovery-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: '1.75rem',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Cards List OR Empty State */}
          <div
            className={`discovery-list-col ${mobileView === 'map' ? 'mobile-hidden' : ''}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '740px',
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}
          >
            {displayedRestaurants.length === 0 ? (
              <div
                style={{
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #ECE7DF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}
                >
                  📍
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.35rem',
                      color: 'var(--brand-dark)',
                      margin: '0 0 0.5rem',
                      fontWeight: 700
                    }}
                  >
                    No BIGBITES restaurants deliver to this location yet.
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#78716C', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
                    We are currently serving fresh meals across <strong style={{ color: 'var(--brand-dark)' }}>Connaught Place (New Delhi)</strong> and <strong style={{ color: 'var(--brand-dark)' }}>Vadodara (Gujarat)</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className="btn-primary"
                  style={{
                    padding: '0.65rem 1.4rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
                  }}
                >
                  <span>📍 Change Location</span>
                </button>

                <div style={{ width: '100%', borderTop: '1px solid #F3EFE9', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.76rem', color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, margin: '0 0 0.75rem' }}>
                    Available Hubs (Click to switch)
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    {[
                      {
                        label: 'Connaught Place, New Delhi',
                        lat: 28.6315,
                        lng: 77.2167,
                        city: 'DELHI',
                        address: 'Connaught Place, Inner Circle, New Delhi 110001'
                      },
                      {
                        label: 'Parul University, Vadodara',
                        lat: 22.2887,
                        lng: 73.3638,
                        city: 'VADODARA',
                        address: 'Parul University Campus, Waghodia Road, Vadodara, Gujarat 391760'
                      },
                      {
                        label: 'Alkapuri, Vadodara',
                        lat: 22.3105,
                        lng: 73.1802,
                        city: 'VADODARA',
                        address: 'RC Dutt Road, Alkapuri, Vadodara, Gujarat 390007'
                      }
                    ].map((hub) => (
                      <button
                        key={hub.label}
                        type="button"
                        onClick={() => {
                          setDeliveryLocation({
                            lat: hub.lat,
                            lng: hub.lng,
                            latitude: hub.lat,
                            longitude: hub.lng,
                            address: hub.address,
                            formatted_address: hub.address,
                            city: hub.city
                          });
                        }}
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '9999px',
                          backgroundColor: '#F7F5F0',
                          border: '1px solid #E5E0D8',
                          fontSize: '0.78rem',
                          color: '#57534E',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--brand-primary)';
                          e.currentTarget.style.backgroundColor = '#FFFBF7';
                          e.currentTarget.style.color = 'var(--brand-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E5E0D8';
                          e.currentTarget.style.backgroundColor = '#F7F5F0';
                          e.currentTarget.style.color = '#57534E';
                        }}
                      >
                        📍 {hub.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              displayedRestaurants.map((rest) => {
                const isSelected = rest.id === activeRestId;
                const isFav = !!favorites[rest.id];
                const isOpen = rest.status === 'ACTIVE';

                return (
                  <div
                    key={rest.id}
                    onClick={() => {
                      setActiveRestId(rest.id);
                      if (isOpen) onOpenRestaurant(rest);
                    }}
                    onMouseEnter={() => setActiveRestId(rest.id)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid #ECE7DF',
                      boxShadow: isSelected
                        ? '0 8px 24px rgba(234, 88, 12, 0.12)'
                        : '0 2px 10px rgba(0,0,0,0.03)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'row',
                      cursor: isOpen ? 'pointer' : 'default',
                      transition: 'all 0.25s ease',
                      opacity: isOpen ? 1 : 0.75
                    }}
                  >
                    {/* Card Thumbnail */}
                    <div style={{ position: 'relative', width: '210px', minWidth: '210px', height: '170px' }}>
                      <ImageWithFallback
                        src={rest.cover_url}
                        alt={rest.name}
                        fallbackType="restaurant"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Distance Pill */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          backgroundColor: 'rgba(28, 25, 23, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#FFFFFF',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}
                      >
                        📍 {rest.distance ? `${rest.distance.toFixed(1)} km` : 'Near you'}
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, rest.id)}
                        aria-label="Save as favorite"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </button>
                    </div>

                    {/* Card Details */}
                    <div
                      style={{
                        padding: '1.1rem 1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        flex: 1
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <h3
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '1.25rem',
                              fontWeight: 700,
                              color: 'var(--brand-dark)',
                              margin: 0,
                              lineHeight: 1.2
                            }}
                          >
                            {rest.name}
                          </h3>

                          {/* Rating Badge */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              backgroundColor: '#ECFDF5',
                              color: '#059669',
                              padding: '0.2rem 0.45rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                          >
                            ★ {rest.rating || 4.5}
                          </span>
                        </div>

                        {/* Cuisine */}
                        <p style={{ margin: '0.3rem 0 0.5rem', color: '#78716C', fontSize: '0.82rem', lineHeight: 1.4 }}>
                          {rest.cuisine}
                        </p>
                      </div>

                      {/* Bottom Info & Action */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid #F3EFE9',
                          paddingTop: '0.65rem',
                          marginTop: '0.4rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.76rem', color: '#57534E' }}>
                          <span>⏱️ {rest.prep_time_min || 20} mins</span>
                          <span>•</span>
                          <span style={{ color: isOpen ? '#059669' : '#DC2626', fontWeight: 600 }}>
                            {isOpen ? 'Open now' : 'Closed now'}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn-primary"
                          style={{
                            padding: '0.45rem 1rem',
                            fontSize: '0.82rem',
                            borderRadius: '8px',
                            fontWeight: 600
                          }}
                        >
                          View Menu
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Local Map (Always rendered) */}
          <div
            className={`discovery-map-col ${mobileView === 'list' ? 'mobile-hidden' : ''}`}
            style={{
              position: 'sticky',
              top: '90px',
              height: '740px'
            }}
          >
            <RestaurantMap
              restaurants={displayedRestaurants}
              customerLocation={deliveryLocation}
              activeRestaurantId={activeRestId}
              onSelectRestaurant={(r) => setActiveRestId(r.id)}
              onOpenRestaurantMenu={(r) => {
                if (r.status === 'ACTIVE') onOpenRestaurant(r);
              }}
              height="100%"
              minHeight="500px"
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .discovery-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-view-toggle {
            display: flex !important;
          }
          .discovery-list-col.mobile-hidden {
            display: none !important;
          }
          .discovery-map-col.mobile-hidden {
            display: none !important;
          }
          .discovery-map-col {
            position: relative !important;
            top: 0 !important;
            height: 480px !important;
          }
        }
        @media (max-width: 600px) {
          .discovery-list-col > div {
            flex-direction: column !important;
          }
          .discovery-list-col > div > div:first-child {
            width: 100% !important;
            min-width: 100% !important;
            height: 160px !important;
          }
        }
      `}</style>
    </section>
  );
}
