import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript } from '../services/googleMapsLoader';

export default function GoogleMapsView({
  customerLocation,
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
  const polylineRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);

  // Initialize Google Maps or fallback
  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript()
      .then((maps) => {
        if (!isMounted || !containerRef.current) return;
        setGoogleMapsReady(true);

        const centerLat = customerLocation?.lat || 28.6315;
        const centerLng = customerLocation?.lng || 77.2167;

        if (!mapRef.current) {
          const mapOptions = {
            center: { lat: centerLat, lng: centerLng },
            zoom: 14,
            mapId: 'EATNAKED_MAP_SYSTEM', // Required for AdvancedMarkerElement
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            gestureHandling: interactive ? 'greedy' : 'none'
          };

          const mapInstance = new maps.Map(containerRef.current, mapOptions);
          mapRef.current = mapInstance;

          if (onMapClick) {
            mapInstance.addListener('click', (e) => {
              onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            });
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Google Maps API Key not configured or network fallback activated. Using Leaflet Interactive Map:', err.message);
        setMapError('LEAFLET_FALLBACK');
      });

    return () => {
      isMounted = false;
    };
  }, [customerLocation?.lat, customerLocation?.lng, interactive, onMapClick]);

  // Handle Markers & Routes when Google Maps is ready
  useEffect(() => {
    if (!googleMapsReady || !mapRef.current || !window.google?.maps) return;

    const maps = window.google.maps;
    const map = mapRef.current;
    const bounds = new maps.LatLngBounds();
    let hasPoint = false;

    // Helper for HTML Marker Elements
    const createHtmlMarkerElement = (type, label) => {
      const el = document.createElement('div');
      el.className = `custom-map-marker marker-${type}`;

      let bg = '#F20D0D';
      let icon = '📍';
      let border = '#111';

      if (type === 'customer') {
        bg = '#FFC400';
        icon = '🏠';
        border = '#111';
      } else if (type === 'driver') {
        bg = '#F20D0D';
        icon = '🛵';
        border = '#FFC400';
      }

      el.innerHTML = `
        <div style="
          background: ${bg};
          color: #FFF;
          border: 2px solid ${border};
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border-radius: 20px;
          padding: 6px 12px;
          font-family: 'Archivo Black', sans-serif;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          transform: translate(-50%, -100%);
          cursor: pointer;
        ">
          <span style="font-size: 14px;">${icon}</span>
          <span style="font-weight: 800; color: ${type === 'customer' ? '#111' : '#FFF'}">${label}</span>
        </div>
      `;
      return el;
    };

    // 1. Customer Delivery Address Marker
    if (customerLocation?.lat && customerLocation?.lng) {
      const pos = { lat: customerLocation.lat, lng: customerLocation.lng };
      bounds.extend(pos);
      hasPoint = true;

      if (!markersRef.current.customer) {
        if (maps.marker?.AdvancedMarkerElement) {
          markersRef.current.customer = new maps.marker.AdvancedMarkerElement({
            map,
            position: pos,
            content: createHtmlMarkerElement('customer', customerLocation.label || 'DELIVERY HOME')
          });
        } else {
          markersRef.current.customer = new maps.Marker({
            map,
            position: pos,
            title: customerLocation.address || 'Delivery Address',
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#FFC400',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#111'
            }
          });
        }
      } else {
        if (markersRef.current.customer.setPosition) {
          markersRef.current.customer.setPosition(pos);
        } else {
          markersRef.current.customer.position = pos;
        }
      }
    }

    // 2. Driver Marker (Real-time animated)
    if (driverLocation?.latitude && driverLocation?.longitude) {
      const pos = { lat: driverLocation.latitude, lng: driverLocation.longitude };
      bounds.extend(pos);
      hasPoint = true;

      if (!markersRef.current.driver) {
        if (maps.marker?.AdvancedMarkerElement) {
          markersRef.current.driver = new maps.marker.AdvancedMarkerElement({
            map,
            position: pos,
            content: createHtmlMarkerElement('driver', `${driverLocation.driverName || 'Rider'} (ETA: ${driverLocation.etaMinutes || 12} min)`)
          });
        } else {
          markersRef.current.driver = new maps.Marker({
            map,
            position: pos,
            title: driverLocation.driverName || 'Delivery Rider',
            icon: {
              path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#F20D0D',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFF',
              rotation: driverLocation.heading || 0
            }
          });
        }
      } else {
        if (markersRef.current.driver.setPosition) {
          markersRef.current.driver.setPosition(pos);
          if (markersRef.current.driver.setIcon && driverLocation.heading) {
            const currentIcon = markersRef.current.driver.getIcon();
            if (currentIcon) {
              markersRef.current.driver.setIcon({ ...currentIcon, rotation: driverLocation.heading });
            }
          }
        } else {
          markersRef.current.driver.position = pos;
        }
      }
    }

    // 3. Draw Route Polyline (Rider to Customer)
    if (showRoute && driverLocation && customerLocation) {
      const routePoints = [
        { lat: driverLocation.latitude, lng: driverLocation.longitude },
        { lat: customerLocation.lat, lng: customerLocation.lng }
      ];

      if (polylineRef.current) {
        polylineRef.current.setPath(routePoints);
      } else {
        polylineRef.current = new maps.Polyline({
          path: routePoints,
          geodesic: true,
          strokeColor: '#F20D0D',
          strokeOpacity: 0.85,
          strokeWeight: 5,
          map
        });
      }
    }

    if (hasPoint && interactive) {
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    }
  }, [googleMapsReady, customerLocation, driverLocation, showRoute, interactive]);

  // Leaflet Fallback implementation when Google Maps API key is not active
  useEffect(() => {
    if (mapError !== 'LEAFLET_FALLBACK' || !containerRef.current) return;

    if (window.L) {
      const centerLat = customerLocation?.lat || 28.6315;
      const centerLng = customerLocation?.lng || 77.2167;

      if (!mapRef.current) {
        const leafletMap = window.L.map(containerRef.current, {
          center: [centerLat, centerLng],
          zoom: 14,
          zoomControl: true
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(leafletMap);

        mapRef.current = leafletMap;
      }

      const map = mapRef.current;

      // Add customer pin
      if (customerLocation?.lat && customerLocation?.lng) {
        const custIcon = window.L.divIcon({
          className: 'custom-leaflet-pin',
          html: `<div style="background:#FFC400; color:#111; font-weight:900; padding:5px 10px; border:2px solid #111; border-radius:15px; font-size:11px; box-shadow:2px 2px 0px #111;">🏠 ${customerLocation.label || 'DELIVERY HOME'}</div>`,
          iconSize: [120, 30],
          iconAnchor: [60, 30]
        });
        window.L.marker([customerLocation.lat, customerLocation.lng], { icon: custIcon }).addTo(map);
      }

      // Add driver pin
      if (driverLocation?.latitude && driverLocation?.longitude) {
        const drvIcon = window.L.divIcon({
          className: 'custom-leaflet-pin',
          html: `<div style="background:#F20D0D; color:#FFF; font-weight:900; padding:5px 10px; border:2px solid #FFC400; border-radius:15px; font-size:11px; box-shadow:2px 2px 0px #111;">🛵 ${driverLocation.driverName || 'Rahul Rider'} (~${driverLocation.etaMinutes || 12} min)</div>`,
          iconSize: [160, 30],
          iconAnchor: [80, 30]
        });
        window.L.marker([driverLocation.latitude, driverLocation.longitude], { icon: drvIcon }).addTo(map);
      }

      // Draw polyline
      if (showRoute && driverLocation && customerLocation) {
        const latlngs = [
          [driverLocation.latitude, driverLocation.longitude],
          [customerLocation.lat, customerLocation.lng]
        ];
        window.L.polyline(latlngs, { color: '#F20D0D', weight: 4, opacity: 0.8 }).addTo(map);
      }
    }
  }, [mapError, customerLocation, driverLocation, showRoute]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        minHeight,
        border: 'var(--border-thick)',
        backgroundColor: '#E5E3DF',
        overflow: 'hidden'
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight }} />
    </div>
  );
}
