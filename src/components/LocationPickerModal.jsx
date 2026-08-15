import { useState, useEffect } from 'react';
import GoogleMapsView from './GoogleMapsView';
import { calculateHaversineDistance, estimateTravelTimeMin } from '../services/deliveryZoneService';
import { getSavedAddresses, saveAddress } from '../services/savedAddressesService';
import { KITCHENS_DATABASE } from '../data/kitchens';

export default function LocationPickerModal({
  isOpen,
  onClose,
  currentAddress,
  onSaveLocation,
  onSelectKitchen
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({
    address: currentAddress || 'Connaught Place, Inner Circle, New Delhi 110001',
    lat: 28.6315,
    lng: 77.2167,
    label: 'HOME',
    flatNo: '',
    landmark: '',
    instructions: ''
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [step, setStep] = useState('select_location'); // 'select_location' | 'select_kitchen'
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedKitchenId, setSelectedKitchenId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSavedAddresses(getSavedAddresses());
      setStep('select_location');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate nearby kitchens evaluation when in step 2 (select_kitchen)
  const evaluatedKitchens = KITCHENS_DATABASE.map((kitchen) => {
    const distKm = calculateHaversineDistance(selectedLocation.lat, selectedLocation.lng, kitchen.lat, kitchen.lng);
    const distFormatted = parseFloat(distKm.toFixed(1));
    const travelMin = estimateTravelTimeMin(distKm);
    const totalEtaMin = kitchen.basePrepTimeMin + travelMin + 3;
    const inRange = distKm <= kitchen.serviceRadiusKm;

    return {
      ...kitchen,
      distanceKm: distFormatted,
      travelTimeMin: travelMin,
      totalEtaMin,
      etaRangeText: `${totalEtaMin}–${totalEtaMin + 5} min`,
      inRange,
      statusLabel: inRange ? 'Open · Delivering now' : 'Outside delivery range'
    };
  }).sort((a, b) => {
    if (a.inRange && !b.inRange) return -1;
    if (!a.inRange && b.inRange) return 1;
    return a.distanceKm - b.distanceKm;
  });

  // Handle "Use my current location"
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLoc = {
          address: `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          lat: latitude,
          lng: longitude,
          label: 'GPS LOCATION',
          flatNo: '',
          landmark: '',
          instructions: ''
        };

        // Reverse Geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              newLoc.address = data.display_name;
            }
            setSelectedLocation(newLoc);
            setIsDetectingLocation(false);
          })
          .catch(() => {
            setSelectedLocation(newLoc);
            setIsDetectingLocation(false);
          });
      },
      (err) => {
        setIsDetectingLocation(false);
        alert(`Location permission denied (${err.message}). Please search manually.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Perform search via Google Maps Geocoder if available, or Nominatim API
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 2) {
      setIsSearching(true);

      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: query }, (results, status) => {
          if (status === 'OK' && Array.isArray(results) && results.length > 0) {
            setSearchSuggestions(
              results.slice(0, 5).map((item) => ({
                display_name: item.formatted_address,
                lat: item.geometry.location.lat(),
                lng: item.geometry.location.lng()
              }))
            );
            setIsSearching(false);
          } else {
            fallbackSearch(query);
          }
        });
      } else {
        fallbackSearch(query);
      }
    } else {
      setSearchSuggestions([]);
      setIsSearching(false);
    }
  };

  const fallbackSearch = (query) => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSearchSuggestions(
            data.slice(0, 5).map((item) => ({
              display_name: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }))
          );
        }
        setIsSearching(false);
      })
      .catch(() => {
        setIsSearching(false);
      });
  };

  const handleSelectSuggestion = (sug) => {
    setSelectedLocation({
      ...selectedLocation,
      address: sug.display_name,
      lat: sug.lat,
      lng: sug.lng
    });
    setSearchSuggestions([]);
    setSearchQuery('');
  };

  const handleSelectSavedAddress = (saved) => {
    setSelectedLocation({
      address: saved.address,
      lat: saved.lat,
      lng: saved.lng,
      label: saved.label,
      flatNo: saved.flatNo || '',
      landmark: saved.landmark || '',
      instructions: saved.instructions || ''
    });
  };

  const handleConfirmLocation = () => {
    setStep('select_kitchen');
  };

  const handleSelectKitchenCard = (kitchen) => {
    if (!kitchen.inRange) {
      alert(`This kitchen is outside your delivery area (${kitchen.distanceKm} km). Please select a kitchen marked in green.`);
      return;
    }

    const finalLoc = {
      ...selectedLocation,
      kitchen,
      distanceKm: kitchen.distanceKm,
      etaMin: kitchen.totalEtaMin
    };

    saveAddress(finalLoc);
    onSaveLocation(finalLoc);
    if (onSelectKitchen) onSelectKitchen(kitchen);
    onClose();

    // Smooth scroll to menu
    const menuEl = document.getElementById('dishes') || document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--cream)',
          border: 'var(--border-thick)',
          boxShadow: '12px 12px 0px var(--black)',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '4px'
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--black)',
            color: 'var(--cream)',
            padding: '1.2rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 'var(--border-thick)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📍</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--yellow)', fontFamily: 'var(--font-display)' }}>
                {step === 'select_location' ? 'WHERE SHOULD WE DELIVER?' : 'KITCHENS NEAR YOU'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
                {step === 'select_location'
                  ? 'Enter your delivery address or confirm your pin on the map'
                  : `Select the nearest EATnaked Kitchen Hub for ${selectedLocation.address.split(',')[0]}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--cream)',
              fontSize: '1.5rem',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* STEP 1: SELECT DELIVERY LOCATION */}
        {step === 'select_location' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem 1.5rem 0.5rem' }}>
              {/* Search Bar + Geolocation Button */}
              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="🔍 Search delivery location (e.g. Connaught Place, Saket, Cyber City...)"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)',
                      border: 'var(--border-thick)',
                      backgroundColor: 'var(--white)',
                      boxSizing: 'border-box'
                    }}
                  />

                  {isSearching && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 800, marginTop: '0.2rem' }}>
                      Searching locations...
                    </div>
                  )}

                  {/* Suggestions Dropdown */}
                  {searchSuggestions.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--white)',
                        border: 'var(--border-thick)',
                        borderTop: 'none',
                        zIndex: 50,
                        boxShadow: '4px 4px 0px var(--black)'
                      }}
                    >
                      {searchSuggestions.map((sug, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSuggestion(sug)}
                          style={{
                            padding: '0.8rem 1rem',
                            borderBottom: '1px solid #ddd',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cream)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--white)')}
                        >
                          <span>📍</span>
                          <span>{sug.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isDetectingLocation}
                  className="btn-editorial"
                  style={{
                    backgroundColor: 'var(--yellow)',
                    color: 'var(--black)',
                    padding: '0.8rem 1.2rem',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📍 {isDetectingLocation ? 'LOCATING...' : 'USE MY CURRENT LOCATION'}
                </button>
              </div>

              {/* Saved Addresses quick bar */}
              {savedAddresses.length > 0 && (
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                    SAVED:
                  </span>
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.75rem',
                        border: 'var(--border-thick)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--black)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '2px 2px 0px var(--black)'
                      }}
                    >
                      🏷️ {addr.label}: {addr.address.split(',')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Google Map with Draggable Pin */}
            <div style={{ flex: 1, minHeight: '300px', position: 'relative' }}>
              <GoogleMapsView
                customerLocation={{ lat: selectedLocation.lat, lng: selectedLocation.lng, label: selectedLocation.label }}
                showRoute={false}
                minHeight="300px"
                onMapClick={(coords) => {
                  setSelectedLocation((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
                }}
              />
            </div>

            {/* Footer Address Confirmation Bar */}
            <div
              style={{
                backgroundColor: 'var(--white)',
                borderTop: 'var(--border-thick)',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--red)', display: 'block', textTransform: 'uppercase' }}>
                  SELECTED DELIVERY ADDRESS:
                </span>
                <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--black)' }}>
                  {selectedLocation.address}
                </p>
              </div>

              <button
                onClick={handleConfirmLocation}
                className="btn-editorial"
                style={{
                  backgroundColor: 'var(--red)',
                  color: 'var(--white)',
                  padding: '0.8rem 2rem',
                  fontSize: '0.95rem'
                }}
              >
                CONFIRM LOCATION & FIND KITCHENS →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2, 3 & 4: NEARBY KITCHENS LIST & MAP VIEW */}
        {step === 'select_kitchen' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Top Back Bar */}
            <div
              style={{
                backgroundColor: 'var(--cream)',
                borderBottom: 'var(--border-thick)',
                padding: '0.8rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <button
                onClick={() => setStep('select_location')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  color: 'var(--red)',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                ← CHANGE DELIVERY LOCATION
              </button>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--black)' }}>
                📍 Delivering to: <strong>{selectedLocation.address.split(',')[0]}</strong>
              </span>
            </div>

            {/* Split Content: Kitchen Cards List + Map */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }} className="kitchen-selection-split">
              
              {/* Left Column: Kitchen Cards List */}
              <div
                style={{
                  width: '380px',
                  borderRight: 'var(--border-thick)',
                  backgroundColor: 'var(--cream)',
                  padding: '1.2rem',
                  overflowY: 'auto'
                }}
                className="kitchen-cards-panel"
              >
                <h4 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--black)' }}>
                  KITCHENS NEAR YOU ({evaluatedKitchens.length}):
                </h4>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {evaluatedKitchens.map((k) => {
                    const isSelected = selectedKitchenId === k.id;
                    return (
                      <div
                        key={k.id}
                        onClick={() => setSelectedKitchenId(k.id)}
                        style={{
                          backgroundColor: k.inRange ? 'var(--white)' : '#F8D7DA',
                          border: 'var(--border-thick)',
                          boxShadow: isSelected ? '5px 5px 0px var(--red)' : '3px 3px 0px var(--black)',
                          padding: '1rem',
                          cursor: k.inRange ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span
                            style={{
                              backgroundColor: k.inRange ? 'var(--green)' : 'var(--red)',
                              color: 'var(--white)',
                              fontFamily: 'var(--font-display)',
                              fontSize: '0.65rem',
                              padding: '0.2rem 0.5rem'
                            }}
                          >
                            {k.inRange ? '🟢 OPEN · DELIVERING NOW' : '🔴 OUTSIDE RANGE'}
                          </span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--black)' }}>
                            ⭐ {k.rating}
                          </span>
                        </div>

                        <h4 style={{ margin: '0.2rem 0', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--black)' }}>
                          {k.name}
                        </h4>

                        <p style={{ margin: '0 0 0.8rem', fontSize: '0.8rem', color: '#555' }}>
                          {k.distanceKm} km away · ~{k.etaRangeText} ETA
                        </p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectKitchenCard(k);
                          }}
                          disabled={!k.inRange}
                          className="btn-editorial"
                          style={{
                            width: '100%',
                            backgroundColor: k.inRange ? 'var(--red)' : '#888',
                            color: 'var(--white)',
                            padding: '0.6rem',
                            fontSize: '0.85rem',
                            textAlign: 'center'
                          }}
                        >
                          {k.inRange ? 'VIEW MENU →' : 'UNAVAILABLE AT LOCATION'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Google Maps View */}
              <div style={{ flex: 1, position: 'relative' }}>
                <GoogleMapsView
                  customerLocation={{ lat: selectedLocation.lat, lng: selectedLocation.lng, label: 'YOUR LOCATION' }}
                  showRoute={false}
                  minHeight="100%"
                />
              </div>

            </div>

          </div>
        )}

      </div>

      <style>{`
        @media (max-width: 768px) {
          .kitchen-selection-split {
            flex-direction: column-reverse !important;
          }
          .kitchen-cards-panel {
            width: 100% !important;
            height: 55% !important;
            border-right: none !important;
            border-top: var(--border-thick) !important;
          }
        }
      `}</style>
    </div>
  );
}
