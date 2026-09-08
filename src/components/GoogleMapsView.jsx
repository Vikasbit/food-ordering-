import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { loadGoogleMapsScript, BIGBITES_MAP_STYLES } from '../services/googleMapsLoader';

/**
 * Lightweight 2D Google Map Component with Leaflet Fallback
 * - Decoupled DirectionsService calculation (calculates only on route coordinate changes)
 * - Lightweight Driver marker position & heading updates
 * - Floating Recenter button (⌾) to fit bounds to active route/driver
 * - Preserves complete fallback when Google Maps is unavailable
 */
export default function GoogleMapsView({
  customerLocation,
  kitchenLocation,
  driverLocation,
  showRoute = true,
  interactive = true,
  height = '100%',
  minHeight = '380px',
  showRecenterBtn = true,
  onMapClick
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const directionsRendererRef = useRef(null);
  const polylineRef = useRef(null);
  
  const [mapEngine, setMapEngine] = useState(null); // 'google' | 'leaflet'
  const [errorNotice, setErrorNotice] = useState('');

  // Helper: 2D Custom Marker Icon with heading rotation support
  const createGooglePin = useCallback((color, emoji, heading = 0) => {
    if (!window.google?.maps) return null;
    const maps = window.google.maps;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
          <g transform="rotate(${heading}, 20, 24)">
            <path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z" fill="${color}" stroke="#1C1917" stroke-width="2"/>
            <circle cx="20" cy="19" r="11" fill="#FFFFFF"/>
            <text x="20" y="24" font-family="sans-serif" font-size="12" text-anchor="middle">${emoji}</text>
          </g>
        </svg>
      `)}`,
      scaledSize: new maps.Size(40, 48),
      anchor: new maps.Point(20, 48)
    };
  }, []);

  // 1. Initialize Map Once
  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;

    loadGoogleMapsScript()
      .then((maps) => {
        if (!isMounted || !containerRef.current) return;
        setMapEngine('google');
        setErrorNotice('');

        const centerLat = customerLocation?.lat || customerLocation?.latitude || kitchenLocation?.lat || 28.6315;
        const centerLng = customerLocation?.lng || customerLocation?.longitude || kitchenLocation?.lng || 77.2167;

        if (!mapRef.current) {
          const mapInstance = new maps.Map(containerRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom: 14,
            styles: BIGBITES_MAP_STYLES,
            disableDefaultUI: true,
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            gestureHandling: interactive ? 'greedy' : 'none'
          });

          mapRef.current = mapInstance;

          if (maps.DirectionsRenderer) {
            directionsRendererRef.current = new maps.DirectionsRenderer({
              map: mapInstance,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#EA580C',
                strokeWeight: 5,
                strokeOpacity: 0.88
              }
            });
          }

          if (onMapClick) {
            mapInstance.addListener('click', (e) => {
              onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            });
          }
        }
      })
      .catch((err) => {
        if (!isMounted || !containerRef.current) return;
        console.warn('Google Maps notice:', err.message);
        setMapEngine('leaflet');
        setErrorNotice('Map service is temporarily in fallback mode.');

        const centerLat = customerLocation?.lat || customerLocation?.latitude || kitchenLocation?.lat || 28.6315;
        const centerLng = customerLocation?.lng || customerLocation?.longitude || kitchenLocation?.lng || 77.2167;

        if (!mapRef.current) {
          const leafletMap = L.map(containerRef.current, {
            center: [centerLat, centerLng],
            zoom: 14,
            zoomControl: false,
            dragging: interactive,
            touchZoom: interactive,
            scrollWheelZoom: interactive
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(leafletMap);

          if (onMapClick) {
            leafletMap.on('click', (e) => {
              onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
            });
          }

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
  }, [interactive]);

  // Coordinates memo
  const cLat = customerLocation?.lat || customerLocation?.latitude;
  const cLng = customerLocation?.lng || customerLocation?.longitude;
  const kLat = kitchenLocation?.lat || kitchenLocation?.latitude;
  const kLng = kitchenLocation?.lng || kitchenLocation?.longitude;
  const dLat = driverLocation?.latitude || driverLocation?.lat;
  const dLng = driverLocation?.longitude || driverLocation?.lng;
  const dHeading = driverLocation?.heading || 0;

  // 2. Google Maps: Static Markers (Customer & Kitchen)
  useEffect(() => {
    if (mapEngine !== 'google' || !mapRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapRef.current;

    // Customer
    if (cLat && cLng) {
      const pos = { lat: Number(cLat), lng: Number(cLng) };
      if (!markersRef.current.customer) {
        markersRef.current.customer = new maps.Marker({
          map,
          position: pos,
          title: customerLocation.address || 'Delivery Address',
          icon: createGooglePin('#16A34A', '🏠', 0),
          zIndex: 10
        });
      } else {
        markersRef.current.customer.setPosition(pos);
      }
    }

    // Kitchen
    if (kLat && kLng) {
      const pos = { lat: Number(kLat), lng: Number(kLng) };
      if (!markersRef.current.kitchen) {
        markersRef.current.kitchen = new maps.Marker({
          map,
          position: pos,
          title: kitchenLocation.name || 'Restaurant',
          icon: createGooglePin('#1C1917', '🍴', 0),
          zIndex: 10
        });
      } else {
        markersRef.current.kitchen.setPosition(pos);
      }
    }
  }, [mapEngine, cLat, cLng, kLat, kLng, customerLocation?.address, kitchenLocation?.name, createGooglePin]);

  // 3. Google Maps: Route Calculation (Decoupled from driver position for max performance)
  useEffect(() => {
    if (mapEngine !== 'google' || !mapRef.current || !window.google?.maps) return;
    if (!showRoute || !cLat || !cLng || !kLat || !kLng) return;

    const maps = window.google.maps;
    const map = mapRef.current;
    const origin = { lat: Number(kLat), lng: Number(kLng) };
    const destination = { lat: Number(cLat), lng: Number(cLng) };

    if (directionsRendererRef.current && maps.DirectionsService) {
      const directionsService = new maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          travelMode: maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current.setDirections(result);
          } else {
            // Fallback straight polyline
            const path = [origin, destination];
            if (polylineRef.current) {
              polylineRef.current.setPath(path);
            } else {
              polylineRef.current = new maps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#EA580C',
                strokeOpacity: 0.88,
                strokeWeight: 4,
                map
              });
            }
          }
        }
      );
    }
  }, [mapEngine, showRoute, cLat, cLng, kLat, kLng]);

  // 4. Google Maps: Driver Marker Update (Lightweight position update, NO route recalculation)
  useEffect(() => {
    if (mapEngine !== 'google' || !mapRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapRef.current;

    if (dLat && dLng) {
      const pos = { lat: Number(dLat), lng: Number(dLng) };
      if (!markersRef.current.driver) {
        markersRef.current.driver = new maps.Marker({
          map,
          position: pos,
          title: driverLocation.driverName || 'Delivery Partner',
          icon: createGooglePin('#EA580C', '🛵', dHeading),
          zIndex: 999
        });
      } else {
        markersRef.current.driver.setPosition(pos);
        markersRef.current.driver.setIcon(createGooglePin('#EA580C', '🛵', dHeading));
      }
    }
  }, [mapEngine, dLat, dLng, dHeading, driverLocation?.driverName, createGooglePin]);

  // 5. Leaflet Fallback Markers & Route
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapRef.current) return;
    const map = mapRef.current;

    // Remove existing markers
    Object.values(markersRef.current).forEach((m) => {
      if (m && map.hasLayer(m)) map.removeLayer(m);
    });
    markersRef.current = {};

    if (polylineRef.current && map.hasLayer(polylineRef.current)) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const bounds = [];

    if (cLat && cLng) {
      const pos = [Number(cLat), Number(cLng)];
      bounds.push(pos);
      const custIcon = L.divIcon({
        className: 'custom-leaflet-customer',
        html: `<div style="background:#16A34A; color:#FFF; font-weight:800; padding:4px 10px; border-radius:12px; font-size:11px; box-shadow:0 2px 8px rgba(0,0,0,0.2); border:1px solid #FFF; transform:translate(-50%, -100%);">🏠 HOME</div>`,
        iconSize: [70, 24],
        iconAnchor: [35, 24]
      });
      markersRef.current.customer = L.marker(pos, { icon: custIcon }).addTo(map);
    }

    if (kLat && kLng) {
      const pos = [Number(kLat), Number(kLng)];
      bounds.push(pos);
      const kitchIcon = L.divIcon({
        className: 'custom-leaflet-kitchen',
        html: `<div style="background:#1C1917; color:#FFF; font-weight:800; padding:4px 10px; border-radius:12px; font-size:11px; box-shadow:0 2px 8px rgba(0,0,0,0.2); border:1px solid #EA580C; transform:translate(-50%, -100%);">🍴 RESTAURANT</div>`,
        iconSize: [94, 24],
        iconAnchor: [47, 24]
      });
      markersRef.current.kitchen = L.marker(pos, { icon: kitchIcon }).addTo(map);
    }

    if (dLat && dLng) {
      const pos = [Number(dLat), Number(dLng)];
      bounds.push(pos);
      const drvIcon = L.divIcon({
        className: 'custom-leaflet-driver',
        html: `<div style="background:#EA580C; color:#FFF; font-weight:800; padding:4px 10px; border-radius:12px; font-size:11px; box-shadow:0 2px 8px rgba(0,0,0,0.2); border:1px solid #FFF; transform:translate(-50%, -100%) rotate(${dHeading}deg);">🛵 RIDER</div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 24]
      });
      markersRef.current.driver = L.marker(pos, { icon: drvIcon }).addTo(map);
    }

    if (showRoute && bounds.length >= 2) {
      polylineRef.current = L.polyline(bounds, { color: '#EA580C', weight: 4, opacity: 0.88 }).addTo(map);
    }

    if (bounds.length > 0 && interactive) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [mapEngine, cLat, cLng, kLat, kLng, dLat, dLng, dHeading, showRoute, interactive]);

  // Recenter Map Handler
  const handleRecenter = () => {
    if (!mapRef.current) return;

    if (mapEngine === 'google' && window.google?.maps) {
      const maps = window.google.maps;
      const bounds = new maps.LatLngBounds();
      let count = 0;

      if (kLat && kLng) { bounds.extend({ lat: Number(kLat), lng: Number(kLng) }); count++; }
      if (cLat && cLng) { bounds.extend({ lat: Number(cLat), lng: Number(cLng) }); count++; }
      if (dLat && dLng) { bounds.extend({ lat: Number(dLat), lng: Number(dLng) }); count++; }

      if (count > 0) {
        mapRef.current.fitBounds(bounds, { top: 70, bottom: 90, left: 50, right: 50 });
      }
    } else if (mapEngine === 'leaflet') {
      const bounds = [];
      if (kLat && kLng) bounds.push([Number(kLat), Number(kLng)]);
      if (cLat && cLng) bounds.push([Number(cLat), Number(cLng)]);
      if (dLat && dLng) bounds.push([Number(dLat), Number(dLng)]);

      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  // Initial fit on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRecenter();
    }, 600);
    return () => clearTimeout(timer);
  }, [mapEngine, kLat, kLng, cLat, cLng]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        minHeight,
        backgroundColor: '#F5F5F4',
        overflow: 'hidden'
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight }} />

      {errorNotice && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(28, 25, 23, 0.85)',
            color: '#FFF',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          {errorNotice}
        </div>
      )}

      {/* Floating Recenter Map Button (Requirement 4) */}
      {showRecenterBtn && (
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Recenter map to route"
          title="Recenter map"
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '16px',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 20,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1C1917"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="2.5" fill="#EA580C" stroke="#EA580C" />
            <line x1="12" y1="1" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="23" />
            <line x1="1" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="23" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
