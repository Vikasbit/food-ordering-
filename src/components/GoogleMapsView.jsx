import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { loadGoogleMapsScript, BIGBITES_MAP_STYLES } from '../services/googleMapsLoader';
import { isValidCoordinate, calculateDistance } from '../utils/geo';

/**
 * Compact Professional Map Pin Helpers (Teardrop Pins & Circular Rider Badge)
 */
const RESTAURANT_PIN_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <defs>
      <filter id="rest-sh" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>
    <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 26 18 26s18-13.4 18-26C36 8.06 27.94 0 18 0z" fill="#1C1917" filter="url(#rest-sh)"/>
    <circle cx="18" cy="17" r="11" fill="#FFFFFF"/>
    <text x="18" y="21.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" text-anchor="middle">🍴</text>
  </svg>
`;

const CUSTOMER_PIN_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <defs>
      <filter id="cust-sh" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>
    <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 26 18 26s18-13.4 18-26C36 8.06 27.94 0 18 0z" fill="#16A34A" filter="url(#cust-sh)"/>
    <circle cx="18" cy="17" r="11" fill="#FFFFFF"/>
    <text x="18" y="21.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" text-anchor="middle">🏠</text>
  </svg>
`;

const createDriverSvg = (heading = 0) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
    <defs>
      <filter id="drv-sh" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="3" flood-color="#000000" flood-opacity="0.32"/>
      </filter>
    </defs>
    <circle cx="21" cy="21" r="18" fill="#FFFFFF" stroke="#EA580C" stroke-width="2.5" filter="url(#drv-sh)"/>
    <circle cx="21" cy="21" r="14.5" fill="#FFF7ED"/>
    <g transform="rotate(${heading}, 21, 21)">
      <text x="21" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" text-anchor="middle">🛵</text>
    </g>
  </svg>
`;

/**
 * Determine clamped zoom bounds based on actual delivery distance (Requirement 2)
 */
function getClampedZoomRange(distanceKm) {
  if (distanceKm < 2) {
    return { min: 14, max: 16, default: 15 };
  } else if (distanceKm <= 5) {
    return { min: 13, max: 15, default: 14 };
  } else if (distanceKm <= 15) {
    return { min: 11, max: 13, default: 12 };
  }
  return { min: 9, max: 12, default: 11 };
}

/**
 * Professional Delivery Tracking Map Component
 * - Clamped local zoom (never zooms out to country/state scale)
 * - Decoupled DirectionsService / OSRM road routing
 * - Compact pins (no giant HTML cards)
 * - Independent driver marker updates without route recalculation
 * - Recenter button with intelligent bounds fitting
 */
export default function GoogleMapsView({
  customerLocation,
  kitchenLocation,
  driverLocation,
  showRoute = true,
  interactive = true,
  height = '100%',
  minHeight = '320px',
  showRecenterBtn = true,
  onRouteLoaded,
  onMapClick
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const directionsRendererRef = useRef(null);
  const polylineRef = useRef(null);
  
  const [mapEngine, setMapEngine] = useState(null); // 'google' | 'leaflet'
  const [errorNotice, setErrorNotice] = useState('');

  // Extract and validate coordinates
  const rawCLat = customerLocation?.lat ?? customerLocation?.latitude;
  const rawCLng = customerLocation?.lng ?? customerLocation?.longitude;
  const rawKLat = kitchenLocation?.lat ?? kitchenLocation?.latitude;
  const rawKLng = kitchenLocation?.lng ?? kitchenLocation?.longitude;
  const rawDLat = driverLocation?.latitude ?? driverLocation?.lat;
  const rawDLng = driverLocation?.longitude ?? driverLocation?.lng;

  const validCustomer = isValidCoordinate(rawCLat, rawCLng);
  const validKitchen = isValidCoordinate(rawKLat, rawKLng);
  const validDriver = isValidCoordinate(rawDLat, rawDLng);

  const cLat = validCustomer ? Number(rawCLat) : null;
  const cLng = validCustomer ? Number(rawCLng) : null;
  const kLat = validKitchen ? Number(rawKLat) : null;
  const kLng = validKitchen ? Number(rawKLng) : null;
  const dLat = validDriver ? Number(rawDLat) : null;
  const dLng = validDriver ? Number(rawDLng) : null;
  const dHeading = driverLocation?.heading || 0;

  // Calculate local delivery distance for zoom clamping
  const deliveryDistanceKm = (cLat && cLng && kLat && kLng)
    ? calculateDistance(kLat, kLng, cLat, cLng)
    : 2.5;

  // 1. Initialize Map Engine
  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;

    loadGoogleMapsScript()
      .then((maps) => {
        if (!isMounted || !containerRef.current) return;
        setMapEngine('google');
        setErrorNotice('');

        const centerLat = cLat || kLat || 28.6315;
        const centerLng = cLng || kLng || 77.2167;

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
                strokeOpacity: 0.9,
                strokeLineCap: 'round',
                strokeLineJoin: 'round'
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
        console.warn('Using modern local fallback map:', err.message);
        setMapEngine('leaflet');

        const centerLat = cLat || kLat || 28.6315;
        const centerLng = cLng || kLng || 77.2167;

        if (!mapRef.current) {
          const leafletMap = L.map(containerRef.current, {
            center: [centerLat, centerLng],
            zoom: 14,
            zoomControl: false,
            attributionControl: false,
            dragging: interactive,
            touchZoom: interactive,
            scrollWheelZoom: interactive
          });

          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
            maxZoom: 19
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
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
    };
  }, [interactive]);

  // 2. Google Maps: Static Markers (Customer & Kitchen)
  useEffect(() => {
    if (mapEngine !== 'google' || !mapRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapRef.current;

    // Customer Pin
    if (cLat && cLng) {
      const pos = { lat: cLat, lng: cLng };
      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(CUSTOMER_PIN_SVG)}`,
        scaledSize: new maps.Size(36, 44),
        anchor: new maps.Point(18, 44)
      };

      if (!markersRef.current.customer) {
        markersRef.current.customer = new maps.Marker({
          map,
          position: pos,
          title: customerLocation?.address || 'Customer Location',
          icon,
          zIndex: 15
        });
      } else {
        markersRef.current.customer.setPosition(pos);
        markersRef.current.customer.setIcon(icon);
      }
    } else if (markersRef.current.customer) {
      markersRef.current.customer.setMap(null);
      delete markersRef.current.customer;
    }

    // Kitchen Pin
    if (kLat && kLng) {
      const pos = { lat: kLat, lng: kLng };
      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(RESTAURANT_PIN_SVG)}`,
        scaledSize: new maps.Size(36, 44),
        anchor: new maps.Point(18, 44)
      };

      if (!markersRef.current.kitchen) {
        markersRef.current.kitchen = new maps.Marker({
          map,
          position: pos,
          title: kitchenLocation?.name || 'Restaurant',
          icon,
          zIndex: 15
        });
      } else {
        markersRef.current.kitchen.setPosition(pos);
        markersRef.current.kitchen.setIcon(icon);
      }
    } else if (markersRef.current.kitchen) {
      markersRef.current.kitchen.setMap(null);
      delete markersRef.current.kitchen;
    }
  }, [mapEngine, cLat, cLng, kLat, kLng, customerLocation?.address, kitchenLocation?.name]);

  // 3. Google Maps: Route Calculation (Decoupled from driver position)
  useEffect(() => {
    if (mapEngine !== 'google' || !mapRef.current || !window.google?.maps) return;
    if (!showRoute || !cLat || !cLng || !kLat || !kLng) return;

    const maps = window.google.maps;
    const map = mapRef.current;
    const origin = { lat: kLat, lng: kLng };
    const destination = { lat: cLat, lng: cLng };

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
            if (polylineRef.current) {
              polylineRef.current.setMap(null);
              polylineRef.current = null;
            }

            // Extract overview path points for driver movement
            if (onRouteLoaded && result.routes?.[0]?.overview_path) {
              const points = result.routes[0].overview_path.map((p) => ({
                lat: p.lat(),
                lng: p.lng()
              }));
              onRouteLoaded(points);
            }
          } else {
            console.warn('Google DirectionsService notice:', status);
            // Subtle fallback polyline (Requirement 4)
            const path = [origin, destination];
            if (polylineRef.current) {
              polylineRef.current.setPath(path);
            } else {
              polylineRef.current = new maps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#EA580C',
                strokeOpacity: 0.6,
                strokeWeight: 3,
                map
              });
            }
          }
        }
      );
    }
  }, [mapEngine, showRoute, cLat, cLng, kLat, kLng, onRouteLoaded]);

  // 4. Google Maps: Independent Driver Marker Update (Lightweight, NO route re-routing)
  useEffect(() => {
    if (mapEngine !== 'google' || !mapRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapRef.current;

    if (dLat && dLng) {
      const pos = { lat: dLat, lng: dLng };
      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createDriverSvg(dHeading))}`,
        scaledSize: new maps.Size(42, 42),
        anchor: new maps.Point(21, 21)
      };

      if (!markersRef.current.driver) {
        markersRef.current.driver = new maps.Marker({
          map,
          position: pos,
          title: driverLocation?.driverName || 'Delivery Partner',
          icon,
          zIndex: 999
        });
      } else {
        markersRef.current.driver.setPosition(pos);
        markersRef.current.driver.setIcon(icon);
      }
    } else if (markersRef.current.driver) {
      markersRef.current.driver.setMap(null);
      delete markersRef.current.driver;
    }
  }, [mapEngine, dLat, dLng, dHeading, driverLocation?.driverName]);

  // 5. Leaflet Fallback: Compact Pins & OSRM Real Road Route
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapRef.current) return;
    const map = mapRef.current;

    // Customer
    if (cLat && cLng) {
      const pos = [cLat, cLng];
      const custIcon = L.divIcon({
        className: 'bb-map-pin-cust',
        html: `<div style="width:36px;height:44px;transform:translate(-50%,-100%);cursor:pointer;">${CUSTOMER_PIN_SVG}</div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44]
      });

      if (!markersRef.current.customer) {
        markersRef.current.customer = L.marker(pos, { icon: custIcon, zIndexOffset: 20 }).addTo(map);
      } else {
        markersRef.current.customer.setLatLng(pos);
      }
    } else if (markersRef.current.customer) {
      map.removeLayer(markersRef.current.customer);
      delete markersRef.current.customer;
    }

    // Kitchen
    if (kLat && kLng) {
      const pos = [kLat, kLng];
      const restIcon = L.divIcon({
        className: 'bb-map-pin-rest',
        html: `<div style="width:36px;height:44px;transform:translate(-50%,-100%);cursor:pointer;">${RESTAURANT_PIN_SVG}</div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44]
      });

      if (!markersRef.current.kitchen) {
        markersRef.current.kitchen = L.marker(pos, { icon: restIcon, zIndexOffset: 20 }).addTo(map);
      } else {
        markersRef.current.kitchen.setLatLng(pos);
      }
    } else if (markersRef.current.kitchen) {
      map.removeLayer(markersRef.current.kitchen);
      delete markersRef.current.kitchen;
    }
  }, [mapEngine, cLat, cLng, kLat, kLng]);

  // Leaflet Driver Marker Update
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapRef.current) return;
    const map = mapRef.current;

    if (dLat && dLng) {
      const pos = [dLat, dLng];
      const drvIcon = L.divIcon({
        className: 'bb-map-pin-driver',
        html: `<div style="width:42px;height:42px;transform:translate(-50%,-50%);">${createDriverSvg(dHeading)}</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      if (!markersRef.current.driver) {
        markersRef.current.driver = L.marker(pos, { icon: drvIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        markersRef.current.driver.setLatLng(pos);
        markersRef.current.driver.setIcon(drvIcon);
      }
    } else if (markersRef.current.driver) {
      map.removeLayer(markersRef.current.driver);
      delete markersRef.current.driver;
    }
  }, [mapEngine, dLat, dLng, dHeading]);

  // Leaflet Route: Fetch real road route from OSRM
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapRef.current) return;
    if (!showRoute || !cLat || !cLng || !kLat || !kLng) return;
    const map = mapRef.current;

    let isSubscribed = true;
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${kLng},${kLat};${cLng},${cLat}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!isSubscribed) return;
        if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
          const roadCoords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
          if (polylineRef.current && map.hasLayer(polylineRef.current)) {
            map.removeLayer(polylineRef.current);
          }
          polylineRef.current = L.polyline(roadCoords, {
            color: '#EA580C',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          if (onRouteLoaded) {
            onRouteLoaded(roadCoords.map((c) => ({ lat: c[0], lng: c[1] })));
          }
        } else {
          // Fallback dashed line
          const path = [[kLat, kLng], [cLat, cLng]];
          if (polylineRef.current && map.hasLayer(polylineRef.current)) {
            map.removeLayer(polylineRef.current);
          }
          polylineRef.current = L.polyline(path, {
            color: '#EA580C',
            weight: 3,
            opacity: 0.6,
            dashArray: '6, 8'
          }).addTo(map);
        }
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.warn('OSRM routing notice:', err.message);
        const path = [[kLat, kLng], [cLat, cLng]];
        if (polylineRef.current && map.hasLayer(polylineRef.current)) {
          map.removeLayer(polylineRef.current);
        }
        polylineRef.current = L.polyline(path, {
          color: '#EA580C',
          weight: 3,
          opacity: 0.6,
          dashArray: '6, 8'
        }).addTo(map);
      });

    return () => {
      isSubscribed = false;
    };
  }, [mapEngine, showRoute, cLat, cLng, kLat, kLng, onRouteLoaded]);

  // 6. Recenter Map with Zoom Clamping (Requirement 2 & 10)
  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    const { min, max, default: defZoom } = getClampedZoomRange(deliveryDistanceKm);

    if (mapEngine === 'google' && window.google?.maps) {
      const maps = window.google.maps;
      const bounds = new maps.LatLngBounds();
      let count = 0;

      if (kLat && kLng) { bounds.extend({ lat: kLat, lng: kLng }); count++; }
      if (cLat && cLng) { bounds.extend({ lat: cLat, lng: cLng }); count++; }
      if (dLat && dLng) { bounds.extend({ lat: dLat, lng: dLng }); count++; }

      if (count > 0) {
        mapRef.current.fitBounds(bounds, { top: 60, bottom: 85, left: 50, right: 50 });

        // Clamp zoom level tightly
        const listener = mapRef.current.addListener('idle', () => {
          if (!mapRef.current) return;
          const currentZoom = mapRef.current.getZoom();
          if (currentZoom > max) {
            mapRef.current.setZoom(max);
          } else if (currentZoom < min) {
            mapRef.current.setZoom(min);
          }
          if (maps.event) maps.event.removeListener(listener);
        });
      }
    } else if (mapEngine === 'leaflet') {
      const bounds = [];
      if (kLat && kLng) bounds.push([kLat, kLng]);
      if (cLat && cLng) bounds.push([cLat, cLng]);
      if (dLat && dLng) bounds.push([dLat, dLng]);

      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [55, 55], maxZoom: max });
        const currentZoom = mapRef.current.getZoom();
        if (currentZoom < min) {
          mapRef.current.setZoom(min);
        }
      } else if (kLat && kLng) {
        mapRef.current.setView([kLat, kLng], defZoom);
      }
    }
  }, [mapEngine, kLat, kLng, cLat, cLng, dLat, dLng, deliveryDistanceKm]);

  // Initial fitBounds only on mount or when restaurant/customer coordinates change (Requirement 8)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRecenter();
    }, 450);
    return () => clearTimeout(timer);
  }, [mapEngine, kLat, kLng, cLat, cLng, handleRecenter]);

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

      {/* Floating Recenter Map Button (Requirement 10) */}
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
            width: '44px',
            height: '44px',
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
