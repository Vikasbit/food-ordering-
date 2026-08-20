import { useState, useEffect, useRef } from 'react';
import { loadGoogleMapsScript } from '../services/googleMapsLoader';

export default function RestaurantDiscoverySection({ restaurants, deliveryLocation, onOpenRestaurant }) {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (deliveryLocation && mapRef.current && !mapInstance) {
      initMap();
    }
  }, [deliveryLocation, mapRef.current, mapInstance]);

  useEffect(() => {
    if (mapInstance && deliveryLocation) {
      updateMarkers();
    }
  }, [mapInstance, restaurants, deliveryLocation]);

  const initMap = async () => {
    try {
      const googleMaps = await loadGoogleMapsScript();
      const map = new googleMaps.Map(mapRef.current, {
        center: { lat: deliveryLocation.lat, lng: deliveryLocation.lng },
        zoom: 13,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
          { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
          { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
          { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
          { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
        ]
      });
      setMapInstance(map);
    } catch (err) {
      console.error('Failed to load map:', err);
    }
  };

  const updateMarkers = async () => {
    // Clear old markers
    markers.forEach(m => m.setMap(null));
    const newMarkers = [];
    
    const googleMaps = await loadGoogleMapsScript();

    // Add Customer Location Marker
    const customerMarker = new googleMaps.Marker({
      position: { lat: deliveryLocation.lat, lng: deliveryLocation.lng },
      map: mapInstance,
      icon: {
        path: googleMaps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#000000',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff',
      },
      title: 'Delivery Location'
    });
    newMarkers.push(customerMarker);

    // Add Restaurant Markers
    const bounds = new googleMaps.LatLngBounds();
    bounds.extend({ lat: deliveryLocation.lat, lng: deliveryLocation.lng });

    restaurants.forEach(rest => {
      if (rest.lat && rest.lng) {
        const marker = new googleMaps.Marker({
          position: { lat: rest.lat, lng: rest.lng },
          map: mapInstance,
          icon: {
            path: googleMaps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: rest.status === 'ACTIVE' ? '#ff3b30' : '#888888',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
          },
          title: rest.name
        });
        
        marker.addListener('click', () => {
          onOpenRestaurant(rest);
        });

        bounds.extend({ lat: rest.lat, lng: rest.lng });
        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
    if (restaurants.length > 0) {
      mapInstance.fitBounds(bounds);
      // Don't zoom in too close
      const listener = googleMaps.event.addListener(mapInstance, "idle", () => { 
        if (mapInstance.getZoom() > 14) mapInstance.setZoom(14); 
        googleMaps.event.removeListener(listener); 
      });
    }
  };

  if (!restaurants || restaurants.length === 0) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--white)', borderTop: 'var(--border-thick)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--red)', marginBottom: '1rem' }}>
          NO RESTAURANTS NEARBY
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          We couldn't find any active EATnaked kitchens within delivery range of your current location ({deliveryLocation?.address}). 
        </p>
      </div>
    );
  }

  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '800px', borderTop: 'var(--border-thick)', borderBottom: 'var(--border-thick)' }} className="discovery-section">
      
      {/* Left Column: Restaurant List */}
      <div style={{ backgroundColor: 'var(--cream)', padding: '2rem', overflowY: 'auto', maxHeight: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--black)' }}>
            RESTAURANTS <span style={{ color: 'var(--red)' }}>NEAR YOU</span>
          </h2>
          <p style={{ margin: 0, opacity: 0.8, fontWeight: 'bold' }}>Delivering to: {deliveryLocation.address}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {restaurants.map(rest => (
            <div 
              key={rest.id} 
              style={{ 
                backgroundColor: 'var(--white)', 
                border: 'var(--border-thick)', 
                boxShadow: '4px 4px 0px var(--black)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                opacity: rest.status === 'ACTIVE' ? 1 : 0.7
              }}
              onClick={() => onOpenRestaurant(rest)}
              className="hover:translate-y-[-4px]"
            >
              <div style={{ height: '200px', width: '100%', overflow: 'hidden', borderBottom: 'var(--border-thick)', position: 'relative' }}>
                <img 
                  src={rest.cover_url || '/assets/chef-kitchen.png'} 
                  alt={rest.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                {rest.status === 'PAUSED' && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ backgroundColor: 'var(--black)', color: 'var(--white)', padding: '0.5rem 1rem', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>PAUSED</span>
                  </div>
                )}
                {rest.status === 'ACTIVE' && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--yellow)', color: 'var(--black)', padding: '0.3rem 0.6rem', border: '1px solid #111', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {rest.prep_time_min ? `${rest.prep_time_min} MIN` : 'FAST'}
                  </div>
                )}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0 }}>{rest.name}</h3>
                  <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>⭐ {rest.rating || 'New'}</span>
                </div>
                <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '0.9rem' }}>{rest.cuisine}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{rest.distance} km away</span>
                  <button className="btn-editorial" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--red)', color: 'var(--white)' }}>
                    VIEW MENU →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Google Map */}
      <div style={{ borderLeft: 'var(--border-thick)', position: 'relative' }} className="map-container">
        <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .discovery-section {
            grid-template-columns: 1fr;
          }
          .map-container {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
