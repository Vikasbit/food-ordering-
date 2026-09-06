import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { loadGoogleMapsScript, BIGBITES_MAP_STYLES, getGoogleMapsDirectionsUrl } from '../services/googleMapsLoader';

export default function GoogleMap({
  locations = [],
  activeLocationIndex = 0,
  onSelectLocation,
  height = '100%',
  minHeight = '500px',
  showControls = true,
  interactive = true
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const trafficLayerRef = useRef(null);
  const infoWindowRef = useRef(null);
  
  const [mapEngine, setMapEngine] = useState(null); // 'google' | 'leaflet'
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activePopupInfo, setActivePopupInfo] = useState(null);

  const activeLoc = locations[activeLocationIndex] || locations[0] || {
    city: 'DELHI',
    name: 'BigBites Delhi Flagship',
    address: 'Connaught Place, Inner Circle, New Delhi 110001',
    phone: '+91 11 4151 8899',
    hours: '11:00 AM – 11:00 PM',
    lat: 28.6315,
    lng: 77.2167
  };

  // 1. Initialize Google Maps or fallback to Leaflet
  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;

    loadGoogleMapsScript()
      .then((maps) => {
        if (!isMounted || !containerRef.current) return;
        setMapEngine('google');

        const initialLat = activeLoc.lat || 28.6315;
        const initialLng = activeLoc.lng || 77.2167;

        if (!mapRef.current) {
          const mapInstance = new maps.Map(containerRef.current, {
            center: { lat: initialLat, lng: initialLng },
            zoom: 14,
            styles: BIGBITES_MAP_STYLES,
            mapTypeId: maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: false,
            gestureHandling: interactive ? 'greedy' : 'none'
          });

          trafficLayerRef.current = new maps.TrafficLayer();
          infoWindowRef.current = new maps.InfoWindow({ disableAutoPan: false });

          mapRef.current = mapInstance;
        }
      })
      .catch((err) => {
        if (!isMounted || !containerRef.current) return;
        console.warn('Google Maps API key not present or failed to load. Initializing Interactive Leaflet Map:', err.message);
        setMapEngine('leaflet');

        if (!mapRef.current) {
          const initialLat = activeLoc.lat || 28.6315;
          const initialLng = activeLoc.lng || 77.2167;

          const leafletMap = L.map(containerRef.current, {
            center: [initialLat, initialLng],
            zoom: 14,
            zoomControl: false,
            dragging: interactive,
            touchZoom: interactive,
            scrollWheelZoom: interactive
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(leafletMap);

          mapRef.current = leafletMap;
        }
      });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        if (mapEngine === 'leaflet') {
          mapRef.current.remove();
        }
        mapRef.current = null;
      }
    };
  }, [interactive]);

  // 2. Render Markers for Google Maps
  const updateGoogleMarkers = useCallback(() => {
    if (!mapRef.current || mapEngine !== 'google' || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new maps.LatLngBounds();

    locations.forEach((loc, idx) => {
      const pos = { lat: loc.lat, lng: loc.lng };
      bounds.extend(pos);

      const isActive = idx === activeLocationIndex;

      // Custom SVG Pin Icon
      const pinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="54" viewBox="0 0 48 54">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
            </filter>
          </defs>
          <g filter="url(#shadow)">
            <path d="M24 0C10.745 0 0 10.745 0 24c0 18 24 30 24 30s24-12 24-30C48 10.745 37.255 0 24 0z" fill="${isActive ? '#F20D0D' : '#111111'}" stroke="#FFFFFF" stroke-width="2.5"/>
            <circle cx="24" cy="22" r="12" fill="${isActive ? '#FFC400' : '#FDFBF7'}"/>
            <text x="24" y="27" font-family="'Archivo Black', sans-serif" font-size="12" font-weight="900" text-anchor="middle" fill="#111111">🌶️</text>
          </g>
        </svg>
      `)}`;

      const marker = new maps.Marker({
        position: pos,
        map,
        title: `${loc.city} - ${loc.name || loc.restaurant}`,
        icon: {
          url: pinSvg,
          scaledSize: new maps.Size(isActive ? 44 : 36, isActive ? 50 : 42),
          anchor: new maps.Point(isActive ? 22 : 18, isActive ? 50 : 42)
        },
        zIndex: isActive ? 999 : 10
      });

      marker.addListener('click', () => {
        if (onSelectLocation) onSelectLocation(idx);
        setActivePopupInfo(loc);
        map.panTo(pos);
      });

      markersRef.current.push(marker);
    });

    // Center active location
    if (activeLoc?.lat && activeLoc?.lng) {
      map.panTo({ lat: activeLoc.lat, lng: activeLoc.lng });
      map.setZoom(14);
    }
  }, [locations, activeLocationIndex, mapEngine, activeLoc, onSelectLocation]);

  // 3. Render Markers for Leaflet
  const updateLeafletMarkers = useCallback(() => {
    if (!mapRef.current || mapEngine !== 'leaflet') return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    locations.forEach((loc, idx) => {
      const pos = [loc.lat, loc.lng];
      const isActive = idx === activeLocationIndex;

      const icon = L.divIcon({
        className: 'custom-bigbites-leaflet-marker',
        html: `
          <div style="
            background: ${isActive ? '#F20D0D' : '#111111'};
            color: ${isActive ? '#FFFFFF' : '#FDFBF7'};
            border: 2.5px solid #FFFFFF;
            box-shadow: 3px 4px 10px rgba(0,0,0,0.4);
            border-radius: 6px;
            padding: 4px 8px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transform: translate(-50%, -100%);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span>🌶️</span>
            <span>${loc.city}</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 30]
      });

      const marker = L.marker(pos, { icon }).addTo(map);

      marker.on('click', () => {
        if (onSelectLocation) onSelectLocation(idx);
        setActivePopupInfo(loc);
        map.setView(pos, 14, { animate: true });
      });

      markersRef.current.push(marker);
    });

    if (activeLoc?.lat && activeLoc?.lng) {
      map.setView([activeLoc.lat, activeLoc.lng], 14, { animate: true });
    }
  }, [locations, activeLocationIndex, mapEngine, activeLoc, onSelectLocation]);

  useEffect(() => {
    if (mapEngine === 'google') {
      updateGoogleMarkers();
    } else if (mapEngine === 'leaflet') {
      updateLeafletMarkers();
    }
  }, [mapEngine, updateGoogleMarkers, updateLeafletMarkers]);

  // Handle map type toggle (Roadmap / Satellite)
  const handleToggleMapType = (type) => {
    setMapType(type);
    if (mapEngine === 'google' && mapRef.current && window.google?.maps) {
      const maps = window.google.maps;
      mapRef.current.setMapTypeId(type === 'satellite' ? maps.MapTypeId.HYBRID : maps.MapTypeId.ROADMAP);
    }
  };

  // Handle traffic layer toggle
  const handleToggleTraffic = () => {
    const next = !trafficEnabled;
    setTrafficEnabled(next);
    if (mapEngine === 'google' && mapRef.current && trafficLayerRef.current) {
      trafficLayerRef.current.setMap(next ? mapRef.current : null);
    }
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    if (mapEngine === 'google' && mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    } else if (mapEngine === 'leaflet' && mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapEngine === 'google' && mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    } else if (mapEngine === 'leaflet' && mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  // Fit all locations
  const handleFitAllLocations = () => {
    if (locations.length === 0 || !mapRef.current) return;

    if (mapEngine === 'google' && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((loc) => bounds.extend({ lat: loc.lat, lng: loc.lng }));
      mapRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    } else if (mapEngine === 'leaflet') {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapEngine === 'google' && mapRef.current) {
          mapRef.current.panTo({ lat: latitude, lng: longitude });
          mapRef.current.setZoom(15);
        } else if (mapEngine === 'leaflet' && mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15, { animate: true });
        }
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const directionsUrl = getGoogleMapsDirectionsUrl(activeLoc.lat, activeLoc.lng, `${activeLoc.name || activeLoc.restaurant}, ${activeLoc.address}`);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        minHeight,
        border: 'var(--border-thick, 3px solid #111111)',
        backgroundColor: '#f5f2eb',
        overflow: 'hidden',
        boxShadow: '8px 8px 0px var(--black, #111111)'
      }}
    >
      {/* Top Map Control Bar */}
      {showControls && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.6rem',
            pointerEvents: 'none'
          }}
        >
          {/* Left Controls: Map Style & Traffic Toggle */}
          <div style={{ display: 'flex', gap: '0.4rem', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', border: '2.5px solid var(--black, #111)', boxShadow: '3px 3px 0px var(--black, #111)', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => handleToggleMapType('roadmap')}
                style={{
                  padding: '0.45rem 0.75rem',
                  backgroundColor: mapType === 'roadmap' ? 'var(--yellow, #FFC400)' : 'var(--cream, #FDFBF7)',
                  color: 'var(--black, #111)',
                  border: 'none',
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                MAP
              </button>
              <button
                type="button"
                onClick={() => handleToggleMapType('satellite')}
                style={{
                  padding: '0.45rem 0.75rem',
                  backgroundColor: mapType === 'satellite' ? 'var(--yellow, #FFC400)' : 'var(--cream, #FDFBF7)',
                  color: 'var(--black, #111)',
                  border: 'none',
                  borderLeft: '2px solid var(--black, #111)',
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                SATELLITE
              </button>
            </div>

            <button
              type="button"
              onClick={handleToggleTraffic}
              style={{
                padding: '0.45rem 0.75rem',
                backgroundColor: trafficEnabled ? 'var(--red, #F20D0D)' : 'var(--cream, #FDFBF7)',
                color: trafficEnabled ? '#FFF' : 'var(--black, #111)',
                border: '2.5px solid var(--black, #111)',
                boxShadow: '3px 3px 0px var(--black, #111)',
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '0.75rem',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              🚦 TRAFFIC {trafficEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Right Controls: Fit All & Locate */}
          <div style={{ display: 'flex', gap: '0.4rem', pointerEvents: 'auto' }}>
            <button
              type="button"
              onClick={handleFitAllLocations}
              title="Show all kitchens"
              style={{
                padding: '0.45rem 0.75rem',
                backgroundColor: 'var(--cream, #FDFBF7)',
                color: 'var(--black, #111)',
                border: '2.5px solid var(--black, #111)',
                boxShadow: '3px 3px 0px var(--black, #111)',
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '0.75rem',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              🌏 VIEW ALL
            </button>
            <button
              type="button"
              onClick={handleLocateMe}
              title="Locate my position"
              style={{
                padding: '0.45rem 0.75rem',
                backgroundColor: isLocating ? 'var(--yellow, #FFC400)' : 'var(--cream, #FDFBF7)',
                color: 'var(--black, #111)',
                border: '2.5px solid var(--black, #111)',
                boxShadow: '3px 3px 0px var(--black, #111)',
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '0.75rem',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              {isLocating ? '📍 LOCATING...' : '🎯 NEAR ME'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Zoom Controls Bottom-Right */}
      {showControls && (
        <div
          style={{
            position: 'absolute',
            bottom: '1.2rem',
            right: '1.2rem',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}
        >
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--cream, #FDFBF7)',
              border: '2.5px solid var(--black, #111)',
              boxShadow: '3px 3px 0px var(--black, #111)',
              fontSize: '1.2rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--cream, #FDFBF7)',
              border: '2.5px solid var(--black, #111)',
              boxShadow: '3px 3px 0px var(--black, #111)',
              fontSize: '1.2rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            −
          </button>
        </div>
      )}

      {/* Floating Active Location Card Overlay Bottom-Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.2rem',
          left: '1.2rem',
          zIndex: 1000,
          backgroundColor: 'var(--cream, #FDFBF7)',
          border: '2.5px solid var(--black, #111)',
          boxShadow: '4px 4px 0px var(--black, #111)',
          padding: '0.8rem 1rem',
          maxWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ backgroundColor: 'var(--red, #F20D0D)', color: '#FFF', fontSize: '0.65rem', fontWeight: 900, padding: '0.2rem 0.5rem', fontFamily: 'var(--font-display, sans-serif)' }}>
            📍 {activeLoc.city} FLAGSHIP
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--green, #2E7D32)' }}>
            ● OPEN NOW
          </span>
        </div>
        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--black, #111)' }}>
          {activeLoc.name || activeLoc.restaurant}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.2 }}>
          {activeLoc.address}
        </div>
        <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem' }}>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              backgroundColor: 'var(--yellow, #FFC400)',
              color: 'var(--black, #111)',
              border: '2px solid var(--black, #111)',
              padding: '0.35rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: 900,
              fontFamily: 'var(--font-display, sans-serif)',
              textAlign: 'center',
              textDecoration: 'none',
              boxShadow: '2px 2px 0px var(--black, #111)'
            }}
          >
            🗺️ GET DIRECTIONS ↗
          </a>
        </div>
      </div>

      {/* Main Map Rendering Container */}
      <div
        ref={containerRef}
        aria-label="Interactive Map showing BigBites Kitchen Locations"
        style={{
          width: '100%',
          height: '100%',
          minHeight
        }}
      />
    </div>
  );
}
