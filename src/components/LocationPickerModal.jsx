import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { loadGoogleMapsScript } from '../services/googleMapsLoader';

export default function LocationPickerModal({ isOpen, onClose }) {
  const { deliveryLocation, setDeliveryLocation } = useCart();
  
  const [address, setAddress] = useState(deliveryLocation?.address || '');
  const [lat, setLat] = useState(deliveryLocation?.lat || null);
  const [lng, setLng] = useState(deliveryLocation?.lng || null);
  const [city, setCity] = useState(deliveryLocation?.city || '');
  
  const [loadingMap, setLoadingMap] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Sync state if reopened
      if (deliveryLocation) {
        setAddress(deliveryLocation.address);
        setLat(deliveryLocation.lat);
        setLng(deliveryLocation.lng);
        setCity(deliveryLocation.city || '');
      } else {
        setAddress('');
        setLat(null);
        setLng(null);
        setCity('');
      }
      initAutocomplete();
    }
  }, [isOpen, deliveryLocation]);

  const initAutocomplete = async () => {
    try {
      setLoadingMap(true);
      const googleMaps = await loadGoogleMapsScript();
      
      if (inputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new googleMaps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry', 'address_components'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          
          if (!place.geometry || !place.geometry.location) {
            setError('Please select a valid location from the dropdown.');
            return;
          }

          setError('');
          const newLat = place.geometry.location.lat();
          const newLng = place.geometry.location.lng();
          const newAddr = place.formatted_address;
          
          let newCity = '';
          place.address_components?.forEach(c => {
            if (c.types.includes('locality')) newCity = c.long_name;
          });

          setLat(newLat);
          setLng(newLng);
          setAddress(newAddr);
          setCity(newCity);
        });
      }
    } catch (err) {
      if (err.message === 'GOOGLE_MAPS_KEY_MISSING') {
        setError('Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      } else {
        setError('Failed to load Google Maps. Please check your connection.');
      }
    } finally {
      setLoadingMap(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setLat(latitude);
          setLng(longitude);

          const googleMaps = await loadGoogleMapsScript();
          const geocoder = new googleMaps.Geocoder();
          
          const response = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
          
          if (response.results && response.results.length > 0) {
            const place = response.results[0];
            setAddress(place.formatted_address);
            let newCity = '';
            place.address_components?.forEach(c => {
              if (c.types.includes('locality')) newCity = c.long_name;
            });
            setCity(newCity);
          } else {
            setAddress(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch (err) {
          setError('Could not get formatted address, but coordinates were saved.');
          setAddress(`GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === 1) setError('Location access denied. Please search manually.');
        else setError('Failed to detect location. Please try again or search manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (!lat || !lng || !address) {
      setError('Please search and select a valid location first.');
      return;
    }
    
    setDeliveryLocation({
      address,
      lat,
      lng,
      city,
      label: 'HOME'
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: 'var(--cream)', border: 'var(--border-thick)', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '8px 8px 0px var(--black)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, color: 'var(--red)' }}>
            WHERE TO?
          </h2>
          {deliveryLocation && (
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 0.5rem' }}>×</button>
          )}
        </div>

        <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#333' }}>
          Set your delivery location to see restaurants near you.
        </p>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.8rem', border: '1px solid #c62828', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleUseCurrentLocation}
          disabled={detecting}
          style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--black)', color: 'var(--white)', border: 'var(--border-thick)', fontFamily: 'var(--font-display)', fontSize: '1rem', cursor: 'pointer', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          {detecting ? 'DETECTING...' : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              USE MY CURRENT LOCATION
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', margin: '1rem 0', fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#666' }}>
          OR SEARCH ADDRESS
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <input 
            ref={inputRef}
            type="text" 
            placeholder={loadingMap ? "Loading maps..." : "Enter your street address or area..."}
            defaultValue={address}
            disabled={loadingMap}
            style={{ width: '100%', padding: '1rem', border: 'var(--border-thick)', fontFamily: 'var(--font-body)', fontSize: '1rem' }}
          />
        </div>

        {address && lat && lng && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--white)', border: '1px solid #ddd', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.3rem' }}>SELECTED LOCATION:</div>
            <div style={{ fontWeight: 'bold' }}>{address}</div>
          </div>
        )}

        <button 
          onClick={handleConfirm}
          className="btn-editorial"
          style={{ width: '100%', padding: '1.2rem', backgroundColor: 'var(--yellow)', color: 'var(--black)', fontSize: '1.2rem' }}
        >
          CONFIRM LOCATION →
        </button>
      </div>
    </div>
  );
}
