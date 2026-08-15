import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCATIONS_DATA = [
  {
    city: 'DELHI',
    icon: '🏛️',
    lang: 'HINDI',
    line1: 'आओ',
    line2: 'खाओ',
    fullGreeting: 'आओ खाओ',
    phonetic: 'Aao Khao',
    restaurant: 'Connaught Place Flagship Kitchen',
    address: 'Connaught Place, Inner Circle, New Delhi 110001',
    phone: '+91 11 4151 8800',
    hours: '11:00 AM – 11:00 PM'
  },
  {
    city: 'MUMBAI',
    icon: '🌊',
    lang: 'MARATHI',
    line1: 'या',
    line2: 'जेवायला',
    fullGreeting: 'या जेवायला',
    phonetic: 'Yaa Jevayla',
    restaurant: 'Bandra Coastal & Curry House',
    address: 'Bandra Reclamation, Bandra West, Mumbai 400050',
    phone: '+91 22 2640 1122',
    hours: '11:30 AM – 1:00 AM'
  },
  {
    city: 'LUCKNOW',
    icon: '🏰',
    lang: 'LUCKNOWI AWADHI',
    line1: 'तशरीफ़',
    line2: 'लाइये',
    fullGreeting: 'तशरीफ़ लाइये',
    phonetic: 'Tashreef Laaiye',
    restaurant: 'Hazratganj Awadhi Dawat Hall',
    address: 'Hazratganj Main Road, Lucknow 226001',
    phone: '+91 522 220 9988',
    hours: '12:00 PM – 11:30 PM'
  },
  {
    city: 'BIHAR',
    icon: '🌾',
    lang: 'BHOJPURI',
    line1: 'चलऽ खाए',
    line2: 'खातिर',
    fullGreeting: 'चलऽ खाए खातिर',
    phonetic: 'Chala Khae Khatir',
    restaurant: 'Patna Junction Litti Chokha Express',
    address: 'Dak Bungla Chauraha, Patna 800001',
    phone: '+91 612 250 4433',
    hours: '11:00 AM – 11:00 PM'
  },
  {
    city: 'NEPAL',
    icon: '🏔️',
    lang: 'NEPALI',
    line1: 'आउनुहोस्',
    line2: 'खाऔँ',
    fullGreeting: 'आउनुहोस् खाऔँ',
    phonetic: 'Aanuhos Khaon',
    restaurant: 'Kathmandu Himalayan Kitchen & Spice Bar',
    address: 'Thamel Chowk, Kathmandu 44600',
    phone: '+977 1 470 1122',
    hours: '11:30 AM – 10:30 PM'
  },
  {
    city: 'BENGALURU',
    icon: '🌿',
    lang: 'KANNADA',
    line1: 'ಬನ್ನಿ',
    line2: 'ಊಟ ಮಾಡಿ',
    fullGreeting: 'ಬನ್ನಿ ಊಟ ಮಾಡಿ',
    phonetic: 'Banni Oota Maadi',
    restaurant: 'Indiranagar Spice Craft Kitchen',
    address: '100 Feet Road, Indiranagar, Bengaluru 560038',
    phone: '+91 80 4123 7788',
    hours: '12:00 PM – 11:00 PM'
  },
  {
    city: 'KOLKATA',
    icon: '🎨',
    lang: 'BENGALI',
    line1: 'আসুন',
    line2: 'খাবেন',
    fullGreeting: 'আসুন খাবেন',
    phonetic: 'Asun Khaben',
    restaurant: 'Park Street Kati Roll & Curry Hub',
    address: '18 Park Street, Kolkata 700071',
    phone: '+91 33 2229 4455',
    hours: '12:00 PM – 11:30 PM'
  }
];

export default function LocationsSection() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeLoc = LOCATIONS_DATA[selectedIdx];

  return (
    <section
      id="locations"
      style={{
        backgroundColor: 'var(--red)',
        color: 'var(--white)',
        borderBottom: 'var(--border-thick)',
        padding: '3.5rem 2.5rem',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '80vh'
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1400px', margin: '0 auto' }}>
        {/* TOP ROW: HEADLINE ON LEFT + CITY TABS ROW INLINE / NEXT TO IT */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.85rem',
                color: 'var(--yellow)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              // OUR KITCHENS &amp; CLOUD HUBS
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
                color: 'var(--white)',
                lineHeight: 0.95,
                margin: 0,
                textTransform: 'uppercase'
              }}
            >
              FIND AN EATNAKED<br />NEAR YOU.
            </h2>
          </div>

          {/* CITY TABS BAR IN MIDDLE */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            {LOCATIONS_DATA.map((loc, idx) => (
              <button
                key={loc.city}
                onClick={() => setSelectedIdx(idx)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.9rem',
                  border: 'var(--border-thick)',
                  backgroundColor: selectedIdx === idx ? 'var(--yellow)' : 'var(--white)',
                  color: 'var(--black)',
                  boxShadow: selectedIdx === idx ? '4px 4px 0px var(--black)' : '2px 2px 0px var(--black)',
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

        {/* BOTTOM ROW: SPLIT PANEL WITH KITCHEN CARD ON LEFT & AAO KHAO POSTER ON RIGHT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '2.5rem',
            alignItems: 'center'
          }}
          className="locations-bottom-grid"
        >
          {/* LEFT COLUMN (6 COLS): FLAGSHIP KITCHEN DETAILS CARD */}
          <div style={{ gridColumn: 'span 6' }} className="locations-card-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLoc.city}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{
                  backgroundColor: 'var(--cream)',
                  color: 'var(--black)',
                  border: 'var(--border-thick)',
                  padding: '1.8rem 2rem',
                  boxShadow: '8px 8px 0px var(--black)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.8rem',
                      backgroundColor: 'var(--yellow)',
                      color: 'var(--black)',
                      padding: '0.35rem 0.8rem',
                      border: 'var(--border-thick)',
                      textTransform: 'uppercase'
                    }}
                  >
                    📍 {activeLoc.city} FLAGSHIP KITCHEN
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--green)',
                      color: 'var(--white)',
                      padding: '0.35rem 0.7rem',
                      border: 'var(--border-thick)'
                    }}
                  >
                    OPEN NOW
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    color: 'var(--black)',
                    lineHeight: 1.1,
                    margin: '0.5rem 0'
                  }}
                >
                  {activeLoc.restaurant}
                </h3>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#444', marginBottom: '1.2rem' }}>
                  {activeLoc.address}
                </p>

                <div style={{ borderTop: '2px solid var(--black)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--black)' }}>
                    <span><strong style={{ color: 'var(--red)' }}>📞 PHONE:</strong> {activeLoc.phone}</span>
                    <span>•</span>
                    <span><strong style={{ color: 'var(--red)' }}>⏱️ HOURS:</strong> {activeLoc.hours}</span>
                  </div>

                  <a
                    href="#menu"
                    className="btn-editorial"
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'var(--red)',
                      color: 'var(--white)',
                      fontSize: '0.9rem',
                      padding: '0.7rem 1.5rem',
                      boxShadow: '4px 4px 0px var(--black)'
                    }}
                    data-cursor="ORDER"
                  >
                    ORDER FROM THIS KITCHEN →
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            <div style={{ fontSize: '0.85rem', color: 'var(--yellow)', fontWeight: 700, marginTop: '1.2rem' }}>
              ⚡ EXPRESS DELIVERY IN UNDER 30 MINUTES ACROSS {activeLoc.city}
            </div>
          </div>

          {/* RIGHT COLUMN (6 COLS): GIANT DEVANAGARI / NATIVE SCRIPT POSTER */}
          <div
            style={{
              gridColumn: 'span 6',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
            className="locations-poster-col"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLoc.city + 'text'}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  width: '100%'
                }}
              >
                {/* Top Line in Solid White */}
                <h2
                  style={{
                    fontFamily: "'Space Grotesk', 'Archivo Black', system-ui, sans-serif",
                    fontSize: 'clamp(3.5rem, 9vw, 9.5rem)',
                    fontWeight: 900,
                    color: 'var(--white)',
                    lineHeight: 0.85,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    textShadow: '0 10px 30px rgba(0,0,0,0.25)',
                    wordBreak: 'break-word'
                  }}
                >
                  {activeLoc.line1}
                </h2>

                {/* Bottom Line in Warm Cream */}
                <h2
                  style={{
                    fontFamily: "'Space Grotesk', 'Archivo Black', system-ui, sans-serif",
                    fontSize: 'clamp(3.5rem, 9vw, 9.5rem)',
                    fontWeight: 900,
                    color: 'var(--cream)',
                    lineHeight: 0.85,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    textShadow: '0 10px 30px rgba(0,0,0,0.25)',
                    wordBreak: 'break-word'
                  }}
                >
                  {activeLoc.line2}
                </h2>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .locations-bottom-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .locations-card-col, .locations-poster-col {
            grid-column: span 12 !important;
          }
        }
        @media (max-width: 640px) {
          #locations {
            padding: 2.5rem 1rem !important;
          }
          .locations-card-col > div {
            padding: 1.2rem 1.2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
