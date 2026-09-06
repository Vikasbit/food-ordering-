import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { loadGoogleMapsScript, BIGBITES_MAP_STYLES } from '../services/googleMapsLoader';

/**
 * Lightweight 2D Google Map Component (Requirements 2, 10, 11, 12, 15, 16)
 * - Single initialization via React ref
 * - 2D Markers for Restaurant/Pickup, Customer/Delivery, and Driver (with heading rotation)
 * - Google Maps DirectionsService calculation when route starts
 * - Graceful fallback message if Google Maps is unavailable
 */
export default function GoogleMapsView({
  customerLocation,
  kitchenLocation,
  driverLocation,
  showRoute = true,
  interactive = true,
  height = '100%',
  minHeight = '420px',
  onMapClick
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const directionsRendererRef = useRef(null);
  const polylineRef = useRef(null);
  
  const [mapEngine, setMapEngine] = useState(null); // 'google' | 'leaflet'
  const [errorNotice, setErrorNotice] = useState('');

  // 1. Initialize Map Once (Requirement 15)
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
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            gestureHandling: interactive ? 'greedy' : 'none'
          });

          mapRef.current = mapInstance;

          // Directions renderer for Routes API calculation (Requirement 12)
          if (maps.DirectionsRenderer) {
            directionsRendererRef.current = new maps.DirectionsRenderer({
              map: mapInstance,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#C84523',
                strokeWeight: 5,
                strokeOpacity: 0.85
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
        setErrorNotice('Map service is temporarily unavailable.');

        const centerLat = customerLocation?.lat || customerLocation?.latitude || kitchenLocation?.lat || 28.6315;
        const centerLng = customerLocation?.lng || customerLocation?.longitude || kitchenLocation?.lng || 77.2167;

        if (!mapRef.current) {
          const leafletMap = L.map(containerRef.current, {
            center: [centerLat, centerLng],
            zoom: 14,
            zoomControl: interactive,
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

  // 2. Google Maps Markers & Route Updates
  useEffect(() => {
    if (mapEngine !== 'google' || !mapRef.current || !window.google?.maps) return;

    const maps = window.google.maps;
    const map = mapRef.current;
    const bounds = new maps.LatLngBounds();
    let hasPoint = false;

    // Helper: 2D Custom Marker Icon with heading rotation support (Requirement 11)
    const createPin = (color, emoji, heading = 0) => ({
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
    });

    // 1. Customer Marker
    const cLat = customerLocation?.lat || customerLocation?.latitude;
    const cLng = customerLocation?.lng || customerLocation?.longitude;

    if (cLat && cLng) {
      const pos = { lat: Number(cLat), lng: Number(cLng) };
      bounds.extend(pos);
      hasPoint = true;

      if (!markersRef.current.customer) {
        markersRef.current.customer = new maps.Marker({
          map,
          position: pos,
          title: customerLocation.address || 'Delivery Address',
          icon: createPin('#EAB308', '🏠', 0)
        });
      } else {
        markersRef.current.customer.setPosition(pos);
      }
    }

    // 2. Kitchen / Restaurant Marker
    const kLat = kitchenLocation?.lat || kitchenLocation?.latitude;
    const kLng = kitchenLocation?.lng || kitchenLocation?.longitude;

    if (kLat && kLng) {
      const pos = { lat: Number(kLat), lng: Number(kLng) };
      bounds.extend(pos);
      hasPoint = true;

      if (!markersRef.current.kitchen) {
        markersRef.current.kitchen = new maps.Marker({
          map,
          position: pos,
          title: kitchenLocation.name || 'Pickup Kitchen',
          icon: createPin('#1C1917', '🍳', 0)
        });
      } else {
        markersRef.current.kitchen.setPosition(pos);
      }
    }

    // 3. Driver Marker (Rotated by heading - Requirement 11)
    const dLat = driverLocation?.latitude || driverLocation?.lat;
    const dLng = driverLocation?.longitude || driverLocation?.lng;
    const dHeading = driverLocation?.heading || 0;

    if (dLat && dLng) {
      const pos = { lat: Number(dLat), lng: Number(dLng) };
      bounds.extend(pos);
      hasPoint = true;

      if (!markersRef.current.driver) {
        markersRef.current.driver = new maps.Marker({
          map,
          position: pos,
          title: driverLocation.driverName || 'Delivery Partner',
          icon: createPin('#C84523', '🛵', dHeading),
          zIndex: 999
        });
      } else {
        markersRef.current.driver.setPosition(pos);
        markersRef.current.driver.setIcon(createPin('#C84523', '🛵', dHeading));
      }
    }

    // 4. Google Maps Directions Route Calculation (Requirement 12)
    if (showRoute && cLat && cLng && kLat && kLng && directionsRendererRef.current && maps.DirectionsService) {
      const directionsService = new maps.DirectionsService();
      
      const origin = { lat: Number(kLat), lng: Number(kLng) };
      const destination = { lat: Number(cLat), lng: Number(cLng) };

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
            // Fallback direct geodesic polyline
            const path = [origin, destination];
            if (polylineRef.current) {
              polylineRef.current.setPath(path);
            } else {
              polylineRef.current = new maps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#C84523',
                strokeOpacity: 0.85,
                strokeWeight: 4,
                map
              });
            }
          }
        }
      );
    }

    if (hasPoint && interactive && !showRoute) {
      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }
  }, [mapEngine, customerLocation, kitchenLocation, driverLocation, showRoute, interactive]);

  // 3. Leaflet Fallback Markers and Route
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapRef.current) return;
    const map = mapRef.current;

    Object.values(markersRef.current).forEach((m) => {
      if (m && map.hasLayer(m)) map.removeLayer(m);
    });
    markersRef.current = {};
    if (polylineRef.current && map.hasLayer(polylineRef.current)) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const bounds = [];

    const cLat = customerLocation?.lat || customerLocation?.latitude;
    const cLng = customerLocation?.lng || customerLocation?.longitude;
    if (cLat && cLng) {
      const pos = [Number(cLat), Number(cLng)];
      bounds.push(pos);

      const custIcon = L.divIcon({
        className: 'custom-leaflet-customer',
        html: `<div style="background:#EAB308; color:#1C1917; font-weight:800; padding:4px 10px; border-radius:12px; font-size:11px; box-shadow:0 2px 8px rgba(0,0,0,0.15); white-space:nowrap; border:1px solid #1C1917; transform:translate(-50%, -100%);">🏠 ${customerLocation.label || 'DELIVERY'}</div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 24]
      });

      markersRef.current.customer = L.marker(pos, { icon: custIcon }).addTo(map);
    }

    const kLat = kitchenLocation?.lat || kitchenLocation?.latitude;
    const kLng = kitchenLocation?.lng || kitchenLocation?.longitude;
    if (kLat && kLng) {
      const pos = [Number(kLat), Number(kLng)];
      bounds.push(pos);

      const kitchIcon = L.divIcon({
        className: 'custom-leaflet-kitchen',
        html: `<div style="background:#1C1917; color:#FFF; font-weight:800; padding:4px 10px; border-radius:12px; font-size:11px; box-shadow:0 2px 8px rgba(0,0,0,0.15); white-space:nowrap; border:1px solid #C84523; transform:translate(-50%, -100%);">🍳 ${kitchenLocation.name || 'KITCHEN'}</div>`,
        iconSize: [90, 24],
        iconAnchor: [45, 24]
      });

      markersRef.current.kitchen = L.marker(pos, { icon: kitchIcon }).addTo(map);
    }

    const dLat = driverLocation?.latitude || driverLocation?.lat;
    const dLng = driverLocation?.longitude || driverLocation?.lng;
    const dHeading = driverLocation?.heading || 0;

    if (dLat && dLng) {
      const pos = [Number(dLat), Number(dLng)];
      bounds.push(pos);

      const drvIcon = L.divIcon({
        className: 'custom-leaflet-driver',
        html: `<div style="background:#C84523; color:#FFF; font-weight:800; padding:4px 10px; border-radius:12px; font-size:11px; box-shadow:0 2px 8px rgba(0,0,0,0.15); white-space:nowrap; border:1px solid #FFF; transform:translate(-50%, -100%) rotate(${dHeading}deg);">🛵 RIDER</div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 24]
      });

      markersRef.current.driver = L.marker(pos, { icon: drvIcon }).addTo(map);
    }

    if (showRoute && bounds.length >= 2) {
      polylineRef.current = L.polyline(bounds, { color: '#C84523', weight: 4, opacity: 0.85 }).addTo(map);
    }

    if (bounds.length > 0 && interactive) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [mapEngine, customerLocation, kitchenLocation, driverLocation, showRoute, interactive]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        minHeight,
        backgroundColor: '#FBF9F5',
        overflow: 'hidden'
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight }} />
    </div>
  );
}
