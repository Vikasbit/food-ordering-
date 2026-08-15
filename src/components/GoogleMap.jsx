import React, { useEffect, useRef, useState } from 'react';

export default function GoogleMap({
  locations = [],
  activeLocationIndex = 0,
  onSelectLocation
}) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapType, setMapType] = useState('roadmap');
  const [trafficEnabled, setTrafficEnabled] = useState(false);

  const activeLoc = locations[activeLocationIndex] || locations[0] || {
    city: 'DELHI',
    address: 'Connaught Place, Inner Circle, New Delhi 110001',
    lat: 28.6139,
    lng: 77.2090
  };

  useEffect(() => {
    if (!containerRef.current) return;

    if (window.L) {
      if (!mapInstanceRef.current) {
        const lat = activeLoc.lat || 28.6139;
        const lng = activeLoc.lng || activeLoc.lon || 77.2090;

        const map = window.L.map(containerRef.current, {
          center: [lat, lng],
          zoom: 14
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        locations.forEach((loc, idx) => {
          const lLat = loc.lat || 28.6139;
          const lLng = loc.lng || loc.lon || 77.2090;
          const icon = window.L.divIcon({
            className: 'resto-map-pin',
            html: `<div style="background:${idx === activeLocationIndex ? '#F20D0D' : '#111'}; color:#FFF; font-weight:900; padding:4px 8px; border:2px solid #111; border-radius:4px; font-size:10px; box-shadow:2px 2px 0px #111;">📍 ${loc.city || 'KITCHEN'}</div>`,
            iconSize: [80, 28],
            iconAnchor: [40, 28]
          });

          const m = window.L.marker([lLat, lLng], { icon }).addTo(map);
          m.on('click', () => {
            if (onSelectLocation) onSelectLocation(idx);
          });
        });

        mapInstanceRef.current = map;
      } else {
        const lat = activeLoc.lat || 28.6139;
        const lng = activeLoc.lng || activeLoc.lon || 77.2090;
        mapInstanceRef.current.setView([lat, lng], 14);
      }
    }
  }, [locations, activeLocationIndex, onSelectLocation]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '420px' }}>
      {/* Map Control Bar Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', border: '2px solid var(--black, #111)', boxShadow: '3px 3px 0px var(--black, #111)', pointerEvents: 'auto' }}>
          <button
            onClick={() => setMapType('roadmap')}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: mapType === 'roadmap' ? 'var(--yellow, #FFEB3B)' : 'var(--cream, #FDFBF7)',
              color: 'var(--black, #111)',
              border: 'none',
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            STREET MAP
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: mapType === 'hybrid' ? 'var(--yellow, #FFEB3B)' : 'var(--cream, #FDFBF7)',
              color: 'var(--black, #111)',
              borderLeft: '2px solid var(--black, #111)',
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            SATELLITE
          </button>
        </div>

        <button
          onClick={() => setTrafficEnabled(!trafficEnabled)}
          style={{
            padding: '0.55rem 0.85rem',
            backgroundColor: trafficEnabled ? 'var(--red, #D32F2F)' : 'var(--cream, #FDFBF7)',
            color: trafficEnabled ? 'var(--cream, #FDFBF7)' : 'var(--black, #111)',
            border: '2px solid var(--black, #111)',
            boxShadow: '3px 3px 0px var(--black, #111)',
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
        >
          TRAFFIC {trafficEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Main Map Container */}
      <div
        ref={containerRef}
        aria-label="Interactive Map showing EATnaked restaurant locations"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '420px',
          border: '3px solid var(--black, #111)',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}
