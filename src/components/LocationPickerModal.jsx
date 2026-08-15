import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, X, Check, Map as MapIcon, Loader2 } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet default marker icons path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PRESET_CITIES = [
  { name: 'DELHI', address: 'Connaught Place, Inner Circle, New Delhi 110001', lat: 28.6139, lon: 77.2090 },
  { name: 'MUMBAI', address: 'Bandra Reclamation, Bandra West, Mumbai 400050', lat: 19.0760, lon: 72.8777 },
  { name: 'BENGALURU', address: '100 Feet Road, Indiranagar, Bengaluru 560038', lat: 12.9716, lon: 77.5946 },
  { name: 'LUCKNOW', address: 'Hazratganj Main Market, Lucknow 226001', lat: 26.8467, lon: 80.9462 },
  { name: 'PATNA', address: 'Dak Bungla Chauraha, Patna 800001', lat: 25.5941, lon: 85.1376 },
  { name: 'KOLKATA', address: '18 Park Street, Kolkata 700071', lat: 22.5726, lon: 88.3639 }
];

export default function LocationPickerModal({ isOpen, onClose, currentAddress, onSaveLocation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    address: currentAddress || 'Connaught Place, Inner Circle, New Delhi 110001',
    lat: 28.6139,
    lon: 77.2090,
    label: 'HOME'
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (mapContainerRef.current && !mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [selectedLocation.lat, selectedLocation.lon],
          zoom: 15,
          zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="background:#F20D0D; color:#FFF; font-weight:900; padding:6px 12px; border:2.5px solid #111; border-radius:4px; font-size:12px; white-space:nowrap; box-shadow:3px 3px 0px #111;">📍 DROP LOCATION</div>`,
          iconSize: [120, 36],
          iconAnchor: [60, 36]
        });

        const marker = L.marker([selectedLocation.lat, selectedLocation.lon], {
          draggable: true,
          icon: customIcon
        }).addTo(map);

        marker.on('dragend', async () => {
          const { lat, lng } = marker.getLatLng();
          reverseGeocode(lat, lng);
        });

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          reverseGeocode(lat, lng);
        });

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;
      } else if (mapInstanceRef.current && markerInstanceRef.current) {
        mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lon], 15);
        markerInstanceRef.current.setLatLng([selectedLocation.lat, selectedLocation.lon]);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, selectedLocation.lat, selectedLocation.lon]);

  // Clean up map when modal unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Reverse Geocode (Lat/Lon -> Address)
  const reverseGeocode = async (lat, lon) => {
    try {
      setSearching(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const address = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setSelectedLocation(prev => ({
        ...prev,
        lat,
        lon,
        address
      }));
    } catch {
      setSelectedLocation(prev => ({
        ...prev,
        lat,
        lon,
        address: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
      }));
    } finally {
      setSearching(false);
    }
  };

  // Search Address (Query -> Lat/Lon & Suggestions)
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  // Auto detect user browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        reverseGeocode(latitude, longitude);
        setDetecting(false);
      },
      (err) => {
        console.warn(err);
        alert('Could not detect your position. Please select address manually.');
        setDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (preset) => {
    setSelectedLocation({
      address: preset.address,
      lat: preset.lat,
      lon: preset.lon,
      label: 'CITY'
    });
    setSuggestions([]);
    setSearchQuery('');
  };

  const handleConfirmSave = () => {
    onSaveLocation(selectedLocation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[var(--cream)] border-4 border-black shadow-[8px_8px_0px_#111] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[var(--yellow)] border-b-4 border-black p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-black" />
              <h2 className="font-extrabold text-xl tracking-tight text-black uppercase">
                SELECT DELIVERY LOCATION
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white border-2 border-black font-extrabold text-lg shadow-[2px_2px_0px_#111] hover:bg-black hover:text-white transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Search Input & GPS Auto Detect */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search street, area, house no, landmark in India..."
                  className="w-full pl-10 pr-10 py-3 bg-white border-3 border-black font-semibold text-sm focus:outline-none shadow-[3px_3px_0px_#111]"
                />
                {searching && <Loader2 className="absolute right-3 w-5 h-5 animate-spin text-black" />}
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#111] max-h-48 overflow-y-auto divide-y-2 divide-black">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedLocation({
                          address: item.display_name,
                          lat: parseFloat(item.lat),
                          lon: parseFloat(item.lon),
                          label: 'SEARCHED'
                        });
                        setSuggestions([]);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 hover:bg-[var(--yellow)] transition-colors flex items-start gap-2 text-xs font-bold"
                    >
                      <MapPin className="w-4 h-4 text-[var(--red)] shrink-0 mt-0.5" />
                      <span>{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Geolocation Button */}
              <button
                onClick={handleDetectLocation}
                disabled={detecting}
                className="w-full py-2.5 px-4 bg-[var(--green)] text-white border-3 border-black font-extrabold text-sm uppercase shadow-[3px_3px_0px_#111] hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                {detecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    DETECTING GPS COORDINATES...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    📍 USE CURRENT LOCATION (GPS AUTO-DETECT)
                  </>
                )}
              </button>
            </div>

            {/* Quick City Presets */}
            <div>
              <div className="text-xs font-black uppercase text-gray-700 mb-2 flex items-center gap-1">
                <MapIcon className="w-3.5 h-3.5" /> POPULAR RESTAURANT CITIES
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {PRESET_CITIES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-1.5 px-2 text-xs font-extrabold border-2 border-black shadow-[2px_2px_0px_#111] transition-all ${
                      selectedLocation.address.includes(preset.name)
                        ? 'bg-[var(--red)] text-white'
                        : 'bg-white text-black hover:bg-[var(--yellow)]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Address Badge */}
            <div className="bg-white border-3 border-black p-3 shadow-[3px_3px_0px_#111]">
              <div className="text-xs font-black text-[var(--red)] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>DROP-OFF ADDRESS</span>
                <span className="bg-[var(--yellow)] text-black px-2 py-0.5 border border-black font-extrabold text-[10px]">
                  PIN DRAGGABLE 📍
                </span>
              </div>
              <div className="font-extrabold text-sm text-black leading-snug line-clamp-2">
                {selectedLocation.address}
              </div>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="relative border-3 border-black shadow-[4px_4px_0px_#111] h-60 w-full overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white border-t-4 border-black p-4 flex gap-3">
            <button
              onClick={onClose}
              className="w-1/3 py-3 bg-gray-200 text-black border-3 border-black font-extrabold text-sm uppercase shadow-[3px_3px_0px_#111] hover:bg-black hover:text-white transition-all"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirmSave}
              className="w-2/3 py-3 bg-[var(--yellow)] text-black border-3 border-black font-black text-sm uppercase shadow-[4px_4px_0px_#111] hover:bg-[var(--red)] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> CONFIRM & SAVE LOCATION
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
