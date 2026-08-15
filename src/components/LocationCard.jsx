import React from 'react';

export default function LocationCard({ location, onClose }) {
  if (!location) return null;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;

  return (
    <div
      style={{
        backgroundColor: 'var(--cream, #FDFBF7)',
        color: 'var(--black, #111111)',
        border: '3px solid var(--black, #111111)',
        padding: '1.25rem 1.5rem',
        maxWidth: '340px',
        width: '100%',
        boxShadow: '6px 6px 0px var(--black, #111111)',
        position: 'relative',
        zIndex: 10,
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
        boxSizing: 'border-box'
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close location details"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'var(--black, #111111)',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '0.2rem 0.4rem'
          }}
        >
          ✕
        </button>
      )}

      <div
        style={{
          fontFamily: 'var(--font-display, sans-serif)',
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--red, #D32F2F)',
          fontWeight: 700,
          marginBottom: '0.25rem'
        }}
      >
        EATnaked Restaurant
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-display, sans-serif)',
          fontSize: '1.6rem',
          fontWeight: 900,
          color: 'var(--black, #111111)',
          margin: '0 0 0.4rem 0',
          lineHeight: 1.1,
          textTransform: 'uppercase'
        }}
      >
        {location.name}
      </h3>

      <p
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--black, #111111)',
          margin: '0 0 0.8rem 0',
          lineHeight: 1.3
        }}
      >
        📍 {location.address}
      </p>

      {location.phone && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--black, #111111)',
            margin: '0 0 0.4rem 0',
            fontWeight: 500
          }}
        >
          📞 {location.phone}
        </p>
      )}

      <div
        style={{
          backgroundColor: 'var(--yellow, #FFEB3B)',
          border: '2px solid var(--black, #111111)',
          padding: '0.4rem 0.75rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '1rem',
          display: 'inline-block'
        }}
      >
        Open today: {location.hours || '11:30 — 22:30'}
      </div>

      <div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            backgroundColor: 'var(--red, #D32F2F)',
            color: 'var(--cream, #FDFBF7)',
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: '0.9rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            padding: '0.75rem 1rem',
            textDecoration: 'none',
            border: '2px solid var(--black, #111111)',
            boxShadow: '3px 3px 0px var(--black, #111111)',
            transition: 'transform 0.1s ease, boxShadow 0.1s ease'
          }}
        >
          [ GET DIRECTIONS ]
        </a>
      </div>
    </div>
  );
}
