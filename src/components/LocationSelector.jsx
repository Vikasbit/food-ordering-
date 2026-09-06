import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMapsScript } from '../services/googleMapsLoader';
import GoogleMapsView from './GoogleMapsView';

// Pre-configured coordinates for popular hubs to guarantee instant coordinate resolution
export const POPULAR_LOCATIONS = [
  {
    id: 'delhi-cp',
    name: 'Connaught Place, New Delhi',
    address: 'Connaught Place, Inner Circle, New Delhi, Delhi 110001',
    city: 'DELHI',
    lat: 28.6315,
    lng: 77.2167
  },
  {
    id: 'vadodara-parul',
    name: 'Parul University, Vadodara',
    address: 'Parul University Campus, Waghodia Road, Vadodara, Gujarat 391760',
    city: 'VADODARA',
    lat: 22.2887,
    lng: 73.3638
  },
  {
    id: 'vadodara-city',
    name: 'Alkapuri, Vadodara',
    address: 'RC Dutt Road, Alkapuri, Vadodara, Gujarat 390007',
    city: 'VADODARA',
    lat: 22.3105,
    lng: 73.1802
  },
  {
    id: 'mumbai-bandra',
    name: 'Bandra West, Mumbai',
    address: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'MUMBAI',
    lat: 19.0596,
    lng: 72.8295
  }
];

/**
 * Resolves latitude and longitude for any address query text
 */
export async function resolveCoordinates(query) {
  if (!query || typeof query !== 'string') return null;
  const q = query.trim().toLowerCase();

  // 1. Check known Indian hubs dictionary
  for (const loc of POPULAR_LOCATIONS) {
    const locName = loc.name.toLowerCase();
    const locAddr = loc.address.toLowerCase();
    if (q.includes(loc.city.toLowerCase()) || locName.includes(q) || locAddr.includes(q) || q.includes('parul') || q.includes('vadodara') || q.includes('baroda') || q.includes('delhi') || q.includes('connaught')) {
      if (q.includes('parul') || q.includes('waghodia')) {
        return POPULAR_LOCATIONS.find(l => l.id === 'vadodara-parul');
      }
      if (q.includes('vadodara') || q.includes('baroda') || q.includes('alkapuri')) {
        return POPULAR_LOCATIONS.find(l => l.id === 'vadodara-city');
      }
      if (q.includes('connaught') || q.includes('delhi') || q.includes('cp')) {
        return POPULAR_LOCATIONS.find(l => l.id === 'delhi-cp');
      }
      if (q.includes('bandra') || q.includes('mumbai')) {
        return POPULAR_LOCATIONS.find(l => l.id === 'mumbai-bandra');
      }
    }
  }

  // 2. Try Google Maps Geocoder if loaded
  try {
    const googleMaps = await loadGoogleMapsScript();
    if (googleMaps && googleMaps.Geocoder) {
      const geocoder = new googleMaps.Geocoder();
      const res = await new Promise((resolve) => {
        geocoder.geocode({ address: query }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results[0]);
          } else {
            resolve(null);
          }
        });
      });

      if (res && res.geometry && res.geometry.location) {
        return {
          lat: res.geometry.location.lat(),
          lng: res.geometry.location.lng(),
          address: res.formatted_address,
          city: res.address_components?.find(c => c.types.includes('locality'))?.long_name || 'DELHI'
        };
      }
    }
  } catch (err) {
    console.warn('Google Geocoder notice:', err.message);
  }

  // 3. Fallback: OpenStreetMap Nominatim API
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await resp.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name,
        city: data[0].address?.city || data[0].address?.state_district || 'DELHI'
      };
    }
  } catch (err) {
    console.warn('Nominatim fallback notice:', err.message);
  }

  return null;
}

export default function LocationSelector({
  initialLocation,
  onLocationSelected,
  onCancel,
  buttonLabel = 'Confirm Location',
  showSavedChips = true,
  savedAddresses = []
}) {
  const [address, setAddress] = useState(initialLocation?.address || initialLocation?.formatted_address || '');
  const [lat, setLat] = useState(Number(initialLocation?.lat ?? initialLocation?.latitude ?? 28.6315));
  const [lng, setLng] = useState(Number(initialLocation?.lng ?? initialLocation?.longitude ?? 77.2167));
  const [city, setCity] = useState(initialLocation?.city || 'DELHI');
  const [label, setLabel] = useState(initialLocation?.label || 'HOME');
  const [placeId, setPlaceId] = useState(initialLocation?.placeId || null);

  const [loadingMap, setLoadingMap] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [resolvingQuery, setResolvingQuery] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (initialLocation) {
      setAddress(initialLocation.address || initialLocation.formatted_address || '');
      setLat(Number(initialLocation.lat ?? initialLocation.latitude ?? 28.6315));
      setLng(Number(initialLocation.lng ?? initialLocation.longitude ?? 77.2167));
      setCity(initialLocation.city || 'DELHI');
      setLabel(initialLocation.label || 'HOME');
      setPlaceId(initialLocation.placeId || null);
    }
  }, [initialLocation]);

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    let isMounted = true;

    async function setupAutocomplete() {
      try {
        setLoadingMap(true);
        const googleMaps = await loadGoogleMapsScript();
        
        if (!isMounted || !inputRef.current) return;

        if (googleMaps.places && !autocompleteRef.current) {
          autocompleteRef.current = new googleMaps.places.Autocomplete(inputRef.current, {
            fields: ['formatted_address', 'geometry', 'address_components', 'place_id']
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            
            if (!place.geometry || !place.geometry.location) {
              setErrorMessage('Please select a valid address from suggestions or click a popular area below.');
              return;
            }

            setErrorMessage('');
            const selectedLat = place.geometry.location.lat();
            const selectedLng = place.geometry.location.lng();
            const selectedAddress = place.formatted_address || '';
            const selectedPlaceId = place.place_id || null;

            let extractedCity = '';
            place.address_components?.forEach((comp) => {
              if (comp.types.includes('locality')) extractedCity = comp.long_name;
              else if (comp.types.includes('administrative_area_level_2') && !extractedCity) {
                extractedCity = comp.long_name;
              }
            });

            setLat(selectedLat);
            setLng(selectedLng);
            setAddress(selectedAddress);
            setPlaceId(selectedPlaceId);
            setCity(extractedCity || 'DELHI');
          });
        }
      } catch (err) {
        console.warn('Autocomplete setup notice:', err.message);
      } finally {
        if (isMounted) setLoadingMap(false);
      }
    }

    setupAutocomplete();

    return () => {
      isMounted = false;
    };
  }, []);

  // Quick Preset Selection (Instantly updates address AND coordinates)
  const handleSelectPreset = (preset) => {
    setAddress(preset.address);
    setLat(preset.lat);
    setLng(preset.lng);
    setCity(preset.city);
    setPlaceId(preset.id);
    setErrorMessage('');
  };

  // "Use Current Location" via browser Geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);

          // Reverse geocode with Google Maps Geocoder if available
          try {
            const googleMaps = await loadGoogleMapsScript();
            if (googleMaps.Geocoder) {
              const geocoder = new googleMaps.Geocoder();
              const response = await geocoder.geocode({
                location: { lat: latitude, lng: longitude }
              });

              if (response.results && response.results.length > 0) {
                const place = response.results[0];
                setAddress(place.formatted_address);
                setPlaceId(place.place_id || null);

                let extractedCity = '';
                place.address_components?.forEach((comp) => {
                  if (comp.types.includes('locality')) extractedCity = comp.long_name;
                });
                setCity(extractedCity || 'DELHI');
                return;
              }
            }
          } catch (geocodeErr) {
            console.warn('Geocoder lookup notice:', geocodeErr.message);
          }

          setAddress(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } catch (err) {
          setErrorMessage('Failed to resolve address from coordinates.');
        } finally {
          setDetectingGps(false);
        }
      },
      (error) => {
        setDetectingGps(false);
        if (error.code === 1 || error.PERMISSION_DENIED) {
          setErrorMessage('Location permission was denied. Please select an area below.');
        } else {
          setErrorMessage('Location currently unavailable. Please select your area manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Map Click handler (repositions pin & updates lat/lng)
  const handleMapClick = async (coords) => {
    const clickLat = coords.lat;
    const clickLng = coords.lng;
    setLat(clickLat);
    setLng(clickLng);
    setErrorMessage('');

    try {
      const googleMaps = await loadGoogleMapsScript();
      if (googleMaps.Geocoder) {
        const geocoder = new googleMaps.Geocoder();
        const response = await geocoder.geocode({ location: { lat: clickLat, lng: clickLng } });
        if (response.results && response.results.length > 0) {
          setAddress(response.results[0].formatted_address);
          setPlaceId(response.results[0].place_id || null);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    setAddress(`Pinned location (${clickLat.toFixed(4)}, ${clickLng.toFixed(4)})`);
  };

  // Submit & Confirm Location
  const handleConfirm = async () => {
    if (!address) {
      setErrorMessage('Please enter or select a delivery location.');
      return;
    }

    setResolvingQuery(true);
    let finalLat = lat;
    let finalLng = lng;
    let finalAddress = address;
    let finalCity = city;

    // Check if the typed address needs coordinate resolution
    try {
      const resolved = await resolveCoordinates(address);
      if (resolved && resolved.lat && resolved.lng) {
        finalLat = resolved.lat;
        finalLng = resolved.lng;
        finalAddress = resolved.address || address;
        finalCity = resolved.city || city;
      }
    } catch (err) {
      console.warn('Coordinate resolution notice:', err);
    } finally {
      setResolvingQuery(false);
    }

    const payload = {
      lat: Number(finalLat),
      lng: Number(finalLng),
      latitude: Number(finalLat),
      longitude: Number(finalLng),
      address: finalAddress,
      formatted_address: finalAddress,
      city: finalCity,
      label,
      placeId
    };

    if (onLocationSelected) {
      onLocationSelected(payload);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'var(--font-sans)' }}>
      {/* Error Alert */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #F87171',
            color: '#991B1B',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Use Current Location Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={detectingGps}
        style={{
          width: '100%',
          padding: '0.85rem 1.25rem',
          backgroundColor: '#FFF7ED',
          border: '1.5px solid #FED7AA',
          borderRadius: '14px',
          color: 'var(--brand-primary)',
          fontSize: '0.92rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>🎯</span>
        <span>{detectingGps ? 'Detecting GPS Coordinates...' : 'Use current location'}</span>
      </button>

      {/* Search Input with Google Places Autocomplete */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--brand-dark)',
            marginBottom: '0.4rem'
          }}
        >
          Search for area, street or landmark:
        </label>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search area, landmark (e.g. Parul University, Connaught Place)..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleConfirm();
            }
          }}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1.5px solid #E5E0D8',
            backgroundColor: '#FFFFFF',
            fontSize: '0.92rem',
            color: 'var(--brand-dark)',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Quick Select Preset Chips (Guarantees immediate coordinate switch) */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#78716C', marginBottom: '0.45rem' }}>
          Popular Delivery Areas:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {POPULAR_LOCATIONS.map((loc) => {
            const isSelected = Math.abs(lat - loc.lat) < 0.05 && Math.abs(lng - loc.lng) < 0.05;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelectPreset(loc)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid #E5E0D8',
                  backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                  color: isSelected ? 'var(--brand-primary)' : '#57534E',
                  transition: 'all 0.2s ease'
                }}
              >
                📍 {loc.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Saved Addresses Chips (if provided from user account) */}
      {showSavedChips && savedAddresses && savedAddresses.length > 0 && (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#78716C', marginBottom: '0.4rem' }}>
            Saved Places:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {savedAddresses.map((saved) => (
              <button
                key={saved.id}
                type="button"
                onClick={() => {
                  setAddress(saved.full_address || saved.address);
                  setLat(Number(saved.latitude || saved.lat));
                  setLng(Number(saved.longitude || saved.lng));
                  setCity(saved.city || 'DELHI');
                  setLabel(saved.label || 'HOME');
                  setPlaceId(saved.google_place_id || null);
                  setErrorMessage('');
                }}
                style={{
                  padding: '0.4rem 0.8rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #ECE7DF',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--brand-dark)'
                }}
              >
                🔖 {saved.label}: {(saved.full_address || saved.address).split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Map & Pin Dropper */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-dark)' }}>
            🗺️ Click Map to Adjust Delivery Pin:
          </span>
          <span style={{ fontSize: '0.72rem', color: '#78716C', fontFamily: 'monospace' }}>
            {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
          </span>
        </div>
        <div style={{ height: '210px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ECE7DF' }}>
          <GoogleMapsView
            customerLocation={{ lat, lng, label: label || 'Delivery', address }}
            showRoute={false}
            interactive={true}
            height="100%"
            minHeight="210px"
            onMapClick={handleMapClick}
          />
        </div>
      </div>

      {/* Display Selected Address */}
      {address && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FAF5EE',
            borderRadius: '12px',
            border: '1px solid #EFEAE2',
            fontSize: '0.85rem'
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--brand-dark)', display: 'block', marginBottom: '2px' }}>
            Selected Address:
          </span>
          <span style={{ color: '#57534E' }}>{address}</span>
        </div>
      )}

      {/* Modal Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline"
            style={{ flex: 1, padding: '0.85rem', fontSize: '0.92rem' }}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={resolvingQuery}
          className="btn-primary"
          style={{ flex: 2, padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}
        >
          {resolvingQuery ? 'Resolving Location...' : buttonLabel}
        </button>
      </div>
    </div>
  );
}
