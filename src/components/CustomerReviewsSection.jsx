import { useState } from 'react';

const REVIEWS = [
  {
    id: 'rev-1',
    rating: 5,
    quote: 'The burgers arrived hot and fresh, exactly on time. My new go-to app!',
    name: 'Sarah M.',
    role: 'Verified Customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-2',
    rating: 5,
    quote: 'Best fried chicken in town, and the tracking feature is super handy.',
    name: 'James K.',
    role: 'Verified Customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-3',
    rating: 5,
    quote: 'Loved the weekend combo great value and generous portions.',
    name: 'Aisha R.',
    role: 'Verified Customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
  }
];

export default function CustomerReviewsSection() {
  return (
    <section style={{ padding: '3.5rem 0 4rem', backgroundColor: 'var(--bg-main)' }}>
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
            What Our Customers Say
          </h2>
        </div>

        {/* 3 Review Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="food-card"
              style={{
                padding: '1.75rem',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '170px'
              }}
            >
              <div>
                {/* 5 Stars */}
                <div style={{ color: '#F59E0B', fontSize: '1rem', marginBottom: '0.75rem' }}>
                  {'★'.repeat(rev.rating)}
                </div>

                {/* Quote */}
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: '#44403C',
                    lineHeight: 1.5,
                    fontStyle: 'normal',
                    margin: 0
                  }}
                >
                  "{rev.quote}"
                </p>
              </div>

              {/* Author */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #F5F0E8'
                }}
              >
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />

                <div>
                  <h4
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--brand-dark)',
                      margin: 0
                    }}
                  >
                    {rev.name}
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#78716C', margin: 0 }}>
                    {rev.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
