import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleMap from './GoogleMap';
import { getGoogleMapsDirectionsUrl } from '../services/googleMapsLoader';

const LOCATIONS_DATA = [
  {
    id: 'delhi',
    city: 'DELHI',
    icon: '🏛️',
    name: 'Connaught Place Flagship Kitchen',
    restaurant: 'Connaught Place Flagship Kitchen',
    address: 'Block A, Inner Circle, Connaught Place, New Delhi 110001',
    phone: '+91 11 4151 8800',
    hours: '11:00 AM – 11:00 PM',
    rating: 4.9,
    reviews: 1420,
    lat: 28.6315,
    lng: 77.2167,
    specialty: 'Butter Chicken Puri Bombs & Old Delhi Chaat'
  },
  {
    id: 'mumbai',
    city: 'MUMBAI',
    icon: '🌊',
    name: 'Bandra Coastal & Curry House',
    restaurant: 'Bandra Coastal & Curry House',
    address: 'Bandra Reclamation, Bandra West, Mumbai 400050',
    phone: '+91 22 2640 1122',
    hours: '11:30 AM – 1:00 AM',
    rating: 4.8,
    reviews: 1120,
    lat: 19.0596,
    lng: 72.8295,
    specialty: 'Koliwada Prawn Bowls & Pav Bun Sliders'
  },
  {
    id: 'bengaluru',
    city: 'BENGALURU',
    icon: '🌿',
    name: 'Indiranagar Spice Craft Hub',
    restaurant: 'Indiranagar Spice Craft Hub',
    address: '100 Feet Road, Indiranagar, Bengaluru 560038',
    phone: '+91 80 4123 7788',
    hours: '12:00 PM – 11:00 PM',
    rating: 4.9,
    reviews: 1280,
    lat: 12.9784,
    lng: 77.6408,
    specialty: 'Ghee Roast Tacos & Filter Coffee Tiramisu'
  },
  {
    id: 'lucknow',
    city: 'LUCKNOW',
    icon: '🏰',
    name: 'Hazratganj Awadhi Dawat Hall',
    restaurant: 'Hazratganj Awadhi Dawat Hall',
    address: 'MG Marg, Hazratganj, Lucknow 226001',
    phone: '+91 522 220 9988',
    hours: '12:00 PM – 11:30 PM',
    rating: 4.9,
    reviews: 750,
    lat: 26.8467,
    lng: 80.9462,
    specialty: 'Galouti Kebab Sliders & Dum Biryani'
  },
  {
    id: 'kolkata',
    city: 'KOLKATA',
    icon: '🎨',
    name: 'Park Street Kati Roll & Curry Hub',
    restaurant: 'Park Street Kati Roll & Curry Hub',
    address: '18 Park Street, Kolkata 700071',
    phone: '+91 33 2229 4455',
    hours: '12:00 PM – 11:30 PM',
    rating: 4.8,
    reviews: 890,
    lat: 22.5535,
    lng: 88.3524,
    specialty: 'Double Egg Mutton Kati Roll & Kosha Bowls'
  },
  {
    id: 'paris',
    city: 'PARIS',
    icon: '🥐',
    name: 'BigBites Paris — Rue de la Paix',
    restaurant: 'BigBites Paris — Rue de la Paix',
    address: '14 Rue de la Paix, 75002 Paris, France',
    phone: '+33 1 42 68 55 00',
    hours: '11:30 AM – 10:30 PM',
    rating: 4.8,
    reviews: 620,
    lat: 48.8698,
    lng: 2.3312,
    specialty: 'Naanwich Croissant & Truffle Butter Chicken'
  },
  {
    id: 'london',
    city: 'LONDON',
    icon: '💂',
    name: 'BigBites Soho — Dean Street',
    restaurant: 'BigBites Soho — Dean Street',
    address: '42 Dean Street, Soho, London W1D 4PZ, UK',
    phone: '+44 20 7439 1234',
    hours: '12:00 PM – 11:00 PM',
    rating: 4.9,
    reviews: 840,
    lat: 51.5134,
    lng: -0.1325,
    specialty: 'Masala Fish & Chips & Chai Cocktails'
  }
];

export default function LocationsSection() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Lazy-load the map when scrolled near the section
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const filteredLocations = LOCATIONS_DATA.filter((loc) =>
    loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeLoc = LOCATIONS_DATA[selectedIdx] || LOCATIONS_DATA[0];
  const directionsUrl = getGoogleMapsDirectionsUrl(activeLoc.lat, activeLoc.lng, `${activeLoc.name}, ${activeLoc.address}`);

  return (
    <section
      ref={sectionRef}
      id="locations"
      style={{
        backgroundColor: 'var(--cream, #FDFBF7)',
        color: 'var(--black, #111111)',
        borderBottom: 'var(--border-thick, 3px solid #111)',
        padding: '4.5rem 2rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* SECTION HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            borderBottom: '3px solid var(--black, #111)',
            paddingBottom: '1.5rem'
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '0.85rem',
                color: 'var(--red, #F20D0D)',
                letterSpacing: '0.15em',
                fontWeight: 900,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.4rem'
              }}
            >
              // LIVE KITCHENS &amp; GLOBAL CLOUD HUBS
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                color: 'var(--black, #111)',
                lineHeight: 0.95,
                margin: 0,
                textTransform: 'uppercase'
              }}
            >
              FIND AN BIGBITES<br />NEAR YOU.
            </h2>
          </div>

          {/* Quick City Filter Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              alignItems: 'center'
            }}
          >
            {LOCATIONS_DATA.map((loc, idx) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                style={{
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  padding: '0.5rem 0.9rem',
                  border: '2.5px solid var(--black, #111)',
                  backgroundColor: selectedIdx === idx ? 'var(--red, #F20D0D)' : 'var(--white, #FFF)',
                  color: selectedIdx === idx ? 'var(--white, #FFF)' : 'var(--black, #111)',
                  boxShadow: selectedIdx === idx ? '3px 3px 0px var(--black, #111)' : '2px 2px 0px var(--black, #111)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>{loc.icon}</span>
                <span>{loc.city}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN 2-COLUMN EDITORIAL LAYOUT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '2.5rem',
            alignItems: 'stretch'
          }}
          className="locations-main-grid"
        >
          {/* LEFT COLUMN (5 COLS): LOCATION CARD & SEARCHABLE LIST */}
          <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="locations-sidebar-col">
            
            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search city, kitchen, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  paddingLeft: '2.5rem',
                  border: '2.5px solid var(--black, #111)',
                  fontFamily: 'var(--font-body, sans-serif)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--white, #FFF)',
                  boxShadow: '3px 3px 0px var(--black, #111)',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>
                🔍
              </span>
            </div>

            {/* Active Kitchen Details Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLoc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{
                  backgroundColor: 'var(--white, #FFF)',
                  border: '3px solid var(--black, #111)',
                  padding: '1.8rem',
                  boxShadow: '6px 6px 0px var(--black, #111)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display, sans-serif)',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      backgroundColor: 'var(--yellow, #FFC400)',
                      color: 'var(--black, #111)',
                      padding: '0.3rem 0.6rem',
                      border: '2px solid var(--black, #111)',
                      textTransform: 'uppercase'
                    }}
                  >
                    📍 {activeLoc.city} FLAGSHIP
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display, sans-serif)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--green, #2E7D32)',
                      color: '#FFF',
                      padding: '0.3rem 0.6rem',
                      border: '2px solid var(--black, #111)'
                    }}
                  >
                    ● OPEN · READY TO SERVE
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display, sans-serif)',
                    fontSize: '1.6rem',
                    color: 'var(--black, #111)',
                    lineHeight: 1.1,
                    margin: '0.4rem 0'
                  }}
                >
                  {activeLoc.name}
                </h3>
                
                <p style={{ fontSize: '0.9rem', color: '#444', fontWeight: 600, margin: '0.4rem 0 1rem', lineHeight: 1.4 }}>
                  {activeLoc.address}
                </p>

                <div style={{ backgroundColor: 'var(--cream, #FDFBF7)', border: '2px solid var(--black, #111)', padding: '0.8rem', marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--red, #F20D0D)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    CHEF SPECIALTY:
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--black, #111)' }}>
                    🔥 {activeLoc.specialty}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--black, #111)' }}>
                  <div>
                    <span style={{ color: '#777', display: 'block', fontSize: '0.7rem' }}>HOURS</span>
                    {activeLoc.hours}
                  </div>
                  <div>
                    <span style={{ color: '#777', display: 'block', fontSize: '0.7rem' }}>PHONE</span>
                    {activeLoc.phone}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-editorial"
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--yellow, #FFC400)',
                      color: 'var(--black, #111)',
                      fontSize: '0.85rem',
                      padding: '0.7rem 1rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                      boxShadow: '3px 3px 0px var(--black, #111)',
                      minWidth: '130px'
                    }}
                  >
                    🗺️ GET DIRECTIONS ↗
                  </a>
                  <a
                    href="#menu"
                    className="btn-editorial"
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--red, #F20D0D)',
                      color: 'var(--white, #FFF)',
                      fontSize: '0.85rem',
                      padding: '0.7rem 1rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                      boxShadow: '3px 3px 0px var(--black, #111)',
                      minWidth: '130px'
                    }}
                  >
                    ORDER NOW →
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Scrollable Compact Location List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '220px',
                overflowY: 'auto',
                paddingRight: '0.3rem'
              }}
            >
              {filteredLocations.map((loc) => {
                const originalIndex = LOCATIONS_DATA.findIndex((l) => l.id === loc.id);
                const isSelected = originalIndex === selectedIdx;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedIdx(originalIndex)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.7rem 1rem',
                      backgroundColor: isSelected ? 'var(--yellow, #FFC400)' : 'var(--white, #FFF)',
                      border: '2px solid var(--black, #111)',
                      boxShadow: isSelected ? '3px 3px 0px var(--black, #111)' : '2px 2px 0px var(--black, #111)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.1s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{loc.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: '0.85rem', fontWeight: 900 }}>
                          {loc.city} · {loc.name.split('—')[0].replace(' Flagship Kitchen', '')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                          {loc.address}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--red, #F20D0D)' }}>
                      {isSelected ? '● ACTIVE' : 'VIEW →'}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN (7 COLS): INTERACTIVE GOOGLE MAP */}
          <div style={{ gridColumn: 'span 7', minHeight: '520px', position: 'relative' }} className="locations-map-col">
            {isVisible ? (
              <GoogleMap
                locations={LOCATIONS_DATA}
                activeLocationIndex={selectedIdx}
                onSelectLocation={(idx) => setSelectedIdx(idx)}
                height="100%"
                minHeight="520px"
                showControls={true}
                interactive={true}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '520px',
                  backgroundColor: '#f5f2eb',
                  border: '3px solid var(--black, #111)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '8px 8px 0px var(--black, #111)'
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>🗺️</div>
                <div style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: '1.1rem', fontWeight: 900 }}>
                  LOADING INTERACTIVE MAP...
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .locations-main-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .locations-sidebar-col, .locations-map-col {
            grid-column: span 12 !important;
          }
          .locations-map-col {
            min-height: 420px !important;
          }
        }
        @media (max-width: 640px) {
          #locations {
            padding: 3rem 1rem !important;
          }
        }
      `}</style>
    </section>
  );
}
