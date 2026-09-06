import { useState } from 'react';

const CRAVINGS = [
  {
    id: 'combo',
    title: 'Combo Meals',
    img: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300&auto=format&fit=crop&q=80',
    link: '#menu'
  },
  {
    id: 'family',
    title: 'Family Packs',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&auto=format&fit=crop&q=80',
    link: '#menu'
  },
  {
    id: 'solo',
    title: 'Solo Bites',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
    link: '#menu'
  },
  {
    id: 'healthy',
    title: 'Healthy Picks',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80',
    link: '#menu'
  }
];

export default function OrderByCravingSection({ onSelectCraving }) {
  return (
    <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-main)' }}>
      <div className="container-clean">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.2vw, 2.5rem)',
              fontFamily: 'var(--font-serif)',
              color: 'var(--brand-dark)',
              marginBottom: '0.4rem',
              fontWeight: 600
            }}
          >
            Order by Craving
          </h2>
          <p style={{ color: '#78716C', fontSize: '0.98rem' }}>
            Choose how you crave it today
          </p>
        </div>

        {/* 4 Craving Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {CRAVINGS.map((craving) => (
            <a
              key={craving.id}
              href={craving.link}
              onClick={() => onSelectCraving && onSelectCraving(craving.title)}
              className="food-card"
              style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              {/* Circular Food Photo */}
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginBottom: '1.25rem',
                  border: '3px solid #FFF7ED',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}
              >
                <img
                  src={craving.img}
                  alt={craving.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>

              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--brand-dark)',
                  marginBottom: '0.4rem'
                }}
              >
                {craving.title}
              </h3>

              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--brand-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'gap 0.2s ease'
                }}
              >
                Order now →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
