import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { loadGoogleMapsScript, BIGBITES_MAP_STYLES } from '../services/googleMapsLoader';

export default function RestaurantMap({
  restaurants = [],
  customerLocation,
  activeRestaurantId,
  onSelectRestaurant,
  onOpenRestaurantMenu,
  height = '100%',
  minHeight = '500px'
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const customerMarkerRef = useRef(null);
  
  const [mapEngine, setMapEngine] = useState(null); // 'google' | 'leaflet'
  const [selectedRest, setSelectedRest] = useState(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;

    loadGoogleMapsScript()
      .then((maps) => {
        if (!isMounted || !containerRef.current) return;
        setMapEngine('google');

        const centerLat = customerLocation?.lat || 28.6315;
        const centerLng = customerLocation?.lng || 77.2167;

        if (!mapRef.current) {
          const mapInstance = new maps.Map(containerRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom: 13.5,
            minZoom: 11,
            maxZoom: 18,
            styles: BIGBITES_MAP_STYLES,
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true
          });

          mapRef.current = mapInstance;
        }
      })
      .catch((err) => {
        if (!isMounted || !containerRef.current) return;
        console.warn('Google Maps API key not available. Using Leaflet for RestaurantMap:', err.message);
        setMapEngine('leaflet');

        const centerLat = customerLocation?.lat || 28.6315;
        const centerLng = customerLocation?.lng || 77.2167;

        if (!mapRef.current) {
          const leafletMap = L.map(containerRef.current, {
            center: [centerLat, centerLng],
            zoom: 13.5,
            minZoom: 11,
            maxZoom: 18,
            zoomControl: true
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(leafletMap);

          mapRef.current = leafletMap;
        }
      });

    return () => {
      isMounted = false;
      if (mapRef.current && mapEngine === 'leaflet') {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Google Maps Markers & Local Area Fitting
  useEffect(() => {
    if (mapEngine !== 'google' || !mapRef.current || !window.google?.maps) return;

    const maps = window.google.maps;
    const map = mapRef.current;
    const bounds = new maps.LatLngBounds();

    // Reset selected restaurant on location or restaurants list change
    setSelectedRest(null);

    // Clear old restaurant markers completely
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const custLat = Number(customerLocation?.lat ?? customerLocation?.latitude);
    const custLng = Number(customerLocation?.lng ?? customerLocation?.longitude);
    const hasCust = !isNaN(custLat) && !isNaN(custLng);

    // Customer Location Pin ("Your delivery location")
    if (hasCust) {
      const custPos = { lat: custLat, lng: custLng };
      bounds.extend(custPos);

      const custPinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="46" height="54" viewBox="0 0 46 54">
          <defs>
            <filter id="custShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/>
            </filter>
          </defs>
          <path d="M23 2C11.95 2 3 10.95 3 22c0 15 20 30 20 30s20-15 20-30C43 10.95 34.05 2 23 2z" fill="#0F172A" stroke="#FFFFFF" stroke-width="2.5" filter="url(#custShadow)"/>
          <circle cx="23" cy="21" r="11" fill="#2563EB"/>
          <circle cx="23" cy="21" r="5" fill="#FFFFFF"/>
        </svg>
      `)}`;

      if (!customerMarkerRef.current) {
        customerMarkerRef.current = new maps.Marker({
          map,
          position: custPos,
          title: 'Your delivery location',
          icon: {
            url: custPinSvg,
            scaledSize: new maps.Size(42, 50),
            anchor: new maps.Point(21, 50)
          },
          zIndex: 1000
        });
      } else {
        customerMarkerRef.current.setMap(map);
        customerMarkerRef.current.setPosition(custPos);
      }
    }

    // Render ONLY current filtered restaurants
    restaurants.forEach((rest) => {
      const rLat = Number(rest.lat ?? rest.latitude);
      const rLng = Number(rest.lng ?? rest.longitude);
      if (isNaN(rLat) || isNaN(rLng)) return;

      const pos = { lat: rLat, lng: rLng };
      bounds.extend(pos);

      const isActive = rest.id === activeRestaurantId;

      const restPinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
            </filter>
          </defs>
          <path d="M21 0C9.4 0 0 9.4 0 21c0 15 21 29 21 29s21-14 21-29C42 9.4 32.6 0 21 0z" fill="${isActive ? '#C2410C' : '#EA580C'}" stroke="#FFFFFF" stroke-width="2.5" filter="url(#shadow)"/>
          <circle cx="21" cy="19" r="11" fill="#FFFFFF"/>
          <text x="21" y="24" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">🍴</text>
        </svg>
      `)}`;

      const marker = new maps.Marker({
        map,
        position: pos,
        title: rest.name,
        icon: {
          url: restPinSvg,
          scaledSize: new maps.Size(isActive ? 44 : 36, isActive ? 52 : 44),
          anchor: new maps.Point(isActive ? 22 : 18, isActive ? 52 : 44)
        },
        zIndex: isActive ? 999 : 10
      });

      marker.addListener('click', () => {
        setSelectedRest(rest);
        if (onSelectRestaurant) onSelectRestaurant(rest);
        map.panTo(pos);
      });

      markersRef.current.push(marker);
    });

    // Viewport adjustment: intelligent fitBounds or customer re-centering
    if (restaurants.length > 0 && hasCust) {
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      const listener = maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() < 12) map.setZoom(12.5);
        if (map.getZoom() > 16) map.setZoom(15.5);
        maps.event.removeListener(listener);
      });
    } else if (hasCust) {
      map.panTo({ lat: custLat, lng: custLng });
      map.setZoom(13.5);
    }
  }, [
    mapEngine, 
    restaurants, 
    customerLocation?.lat, 
    customerLocation?.lng, 
    customerLocation?.latitude, 
    customerLocation?.longitude, 
    activeRestaurantId, 
    onSelectRestaurant
  ]);

  // 3. Leaflet Markers & Local Area Fitting
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapRef.current) return;
    const map = mapRef.current;

    // Reset selected restaurant on location or restaurants list change
    setSelectedRest(null);

    // Clear old restaurant markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Clear old customer marker if exists
    if (customerMarkerRef.current) {
      map.removeLayer(customerMarkerRef.current);
      customerMarkerRef.current = null;
    }

    const bounds = [];
    const custLat = Number(customerLocation?.lat ?? customerLocation?.latitude);
    const custLng = Number(customerLocation?.lng ?? customerLocation?.longitude);
    const hasCust = !isNaN(custLat) && !isNaN(custLng);

    // Customer Location Pin ("Your delivery location")
    if (hasCust) {
      const custPos = [custLat, custLng];
      bounds.push(custPos);

      const custIcon = L.divIcon({
        className: 'custom-leaflet-cust-pin',
        html: `<div style="background:#0F172A; color:#FFFFFF; font-weight:700; padding:6px 12px; border:2px solid #3B82F6; border-radius:20px; font-size:11px; box-shadow:0 4px 12px rgba(0,0,0,0.3); white-space:nowrap; transform:translate(-50%, -100%);">📍 Your delivery location</div>`,
        iconSize: [140, 28],
        iconAnchor: [70, 28]
      });

      customerMarkerRef.current = L.marker(custPos, { icon: custIcon, zIndexOffset: 1000 }).addTo(map);
    }

    // Render ONLY current filtered restaurants
    restaurants.forEach((rest) => {
      const rLat = Number(rest.lat ?? rest.latitude);
      const rLng = Number(rest.lng ?? rest.longitude);
      if (isNaN(rLat) || isNaN(rLng)) return;

      const pos = [rLat, rLng];
      bounds.push(pos);

      const isActive = rest.id === activeRestaurantId;

      const icon = L.divIcon({
        className: 'custom-leaflet-rest-pin',
        html: `<div style="background:${isActive ? '#C2410C' : '#EA580C'}; color:#FFFFFF; font-weight:700; padding:5px 10px; border:2px solid #FFFFFF; border-radius:20px; font-size:11px; box-shadow:0 3px 8px rgba(0,0,0,0.25); white-space:nowrap; transform:translate(-50%, -100%); cursor:pointer;">🍴 ${rest.name.split('—')[0].trim()}</div>`,
        iconSize: [90, 26],
        iconAnchor: [45, 26]
      });

      const marker = L.marker(pos, { icon }).addTo(map);
      marker.on('click', () => {
        setSelectedRest(rest);
        if (onSelectRestaurant) onSelectRestaurant(rest);
        map.setView(pos, 14, { animate: true });
      });

      markersRef.current.push(marker);
    });

    if (restaurants.length > 0 && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15.5 });
      if (map.getZoom() < 12.5) map.setZoom(13);
    } else if (hasCust) {
      map.setView([custLat, custLng], 13.5, { animate: true });
    }
  }, [
    mapEngine, 
    restaurants, 
    customerLocation?.lat, 
    customerLocation?.lng, 
    customerLocation?.latitude, 
    customerLocation?.longitude, 
    activeRestaurantId, 
    onSelectRestaurant
  ]);

  // Sync selectedRest if activeRestaurantId changes externally
  useEffect(() => {
    if (activeRestaurantId) {
      const found = restaurants.find((r) => r.id === activeRestaurantId);
      if (found) setSelectedRest(found);
    }
  }, [activeRestaurantId, restaurants]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        minHeight,
        borderRadius: '16px',
        backgroundColor: '#F7F5F0',
        overflow: 'hidden',
        border: '1px solid #E5E0D8',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
      }}
    >
      {/* Floating Selected Restaurant Card Tooltip */}
      {selectedRest && (
        <div
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '1.25rem',
            right: '1.25rem',
            maxWidth: '360px',
            zIndex: 1000,
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(28,25,23,0.18)',
            border: '1px solid #E7E2D9',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                backgroundColor: '#FFF7ED',
                color: 'var(--brand-primary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid #FED7AA'
              }}
            >
              📍 {selectedRest.distance ? `${selectedRest.distance.toFixed(1)} km away` : 'Nearby'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedRest(null)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.1rem',
                cursor: 'pointer',
                color: '#78716C',
                padding: '0 4px'
              }}
              title="Close"
            >
              ✕
            </button>
          </div>

          <h4
            style={{
              margin: '0.2rem 0 0',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--brand-dark)'
            }}
          >
            {selectedRest.name}
          </h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#57534E', fontWeight: 500 }}>
            <span style={{ color: '#059669', fontWeight: 700 }}>
              ★ {selectedRest.rating || 4.5}
            </span>
            <span>⏱️ {selectedRest.prep_time_min || 20} mins prep</span>
          </div>

          <p style={{ margin: 0, fontSize: '0.8rem', color: '#78716C' }}>
            {selectedRest.cuisine}
          </p>

          <button
            type="button"
            onClick={() => onOpenRestaurantMenu && onOpenRestaurantMenu(selectedRest)}
            className="btn-primary"
            style={{
              marginTop: '0.4rem',
              padding: '0.65rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              width: '100%',
              borderRadius: '10px'
            }}
          >
            View Menu &amp; Order
          </button>
        </div>
      )}

      {/* Main Map Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight }} />
    </div>
  );
}
